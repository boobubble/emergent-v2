import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IRC_CHAT_PRODUCT_ROOM } from "./constants";
import { IrcChatCore } from "./store";
import { IrcChatTransport } from "./transport";
import { buildJoinFrame, buildPartFrame, parseGatewayEvent, parseGatewayFrame } from "./protocol";
import {
  authOkFrame,
  guestAuth,
  latestSocket,
  namesFrame,
  parseRoomSwitchFrame,
  pmSentFrame,
  resetMockWs,
  roomJoinedFrame,
  roomPartedFrame,
  teardownMockWs,
} from "./test-utils";

const GAMES_ROOM = "games";

function createSwitchCore() {
  const transport = new IrcChatTransport();
  transport.setKnownRoomIds([IRC_CHAT_PRODUCT_ROOM, GAMES_ROOM]);
  const core = new IrcChatCore({
    wsUrl: "wss://ws.yaarzo.com",
    auth: { kind: "guest", guest: guestAuth },
    transport,
  });
  return { core, transport };
}

function authenticate(core: IrcChatCore): void {
  core.connect();
  latestSocket().open();
  latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
  latestSocket().emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));
}

function sentSwitchFrames() {
  return latestSocket().sent.map(parseRoomSwitchFrame);
}

describe("irc-chat room.part protocol", () => {
  it("builds room.part frame with trimmed room id", () => {
    expect(buildPartFrame(" games ")).toEqual({ type: "room.part", room: "games" });
  });

  it("parses room.parted acknowledgement", () => {
    const frame = parseGatewayFrame(roomPartedFrame(GAMES_ROOM));
    expect(parseGatewayEvent(frame!)).toEqual({
      kind: "room_parted",
      room: GAMES_ROOM,
    });
  });
});

describe("IrcChatCore public room switch", () => {
  beforeEach(resetMockWs);
  afterEach(teardownMockWs);

  it("does not JOIN/PART when selecting the already joined room", () => {
    const { core } = createSwitchCore();
    authenticate(core);
    const before = latestSocket().sent.length;

    expect(core.joinRoom(IRC_CHAT_PRODUCT_ROOM)).toBe(true);
    expect(latestSocket().sent.length).toBe(before);
  });

  it("JOIN B then PART A after room.joined B (global -> games)", () => {
    const { core } = createSwitchCore();
    authenticate(core);
    latestSocket().emitMessage(
      namesFrame(IRC_CHAT_PRODUCT_ROOM, [
        { nick: "Ranjha", userId: "visitor_test123", isGuest: true },
        { nick: "Peer", userId: "irc:Peer" },
      ]),
    );

    expect(core.joinRoom(GAMES_ROOM)).toBe(true);

    const afterJoin = sentSwitchFrames();
    expect(afterJoin.filter((f) => f.type === "room.join" && f.room === GAMES_ROOM)).toHaveLength(1);
    expect(afterJoin.some((f) => f.type === "room.part")).toBe(false);

    latestSocket().emitMessage(roomJoinedFrame(GAMES_ROOM));

    const afterAck = sentSwitchFrames();
    const partGlobal = afterAck.filter(
      (f) => f.type === "room.part" && f.room === IRC_CHAT_PRODUCT_ROOM,
    );
    expect(partGlobal).toHaveLength(1);
    expect(core.getState().members[IRC_CHAT_PRODUCT_ROOM]).toBeUndefined();
  });

  it("does not PART A when B join is never confirmed", () => {
    const { core } = createSwitchCore();
    authenticate(core);

    expect(core.joinRoom(GAMES_ROOM)).toBe(true);
    expect(sentSwitchFrames().some((f) => f.type === "room.part")).toBe(false);
  });

  it("games -> global switches with JOIN global then PART games", () => {
    const { core } = createSwitchCore();
    authenticate(core);
    core.joinRoom(GAMES_ROOM);
    latestSocket().emitMessage(roomJoinedFrame(GAMES_ROOM));

    core.joinRoom(IRC_CHAT_PRODUCT_ROOM);
    const joins = sentSwitchFrames().filter(
      (f) => f.type === "room.join" && f.room === IRC_CHAT_PRODUCT_ROOM,
    );
    expect(joins.length).toBeGreaterThanOrEqual(1);

    latestSocket().emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));

    expect(
      sentSwitchFrames().some(
        (f) => f.type === "room.part" && f.room === GAMES_ROOM,
      ),
    ).toBe(true);
    expect(core.getState().members[GAMES_ROOM]).toBeUndefined();
  });

  it("rapid switch back before games join ack parts orphan games join", () => {
    const { core } = createSwitchCore();
    authenticate(core);

    core.joinRoom(GAMES_ROOM);
    core.joinRoom(IRC_CHAT_PRODUCT_ROOM);

    latestSocket().emitMessage(roomJoinedFrame(GAMES_ROOM));

    expect(
      sentSwitchFrames().some(
        (f) => f.type === "room.part" && f.room === GAMES_ROOM,
      ),
    ).toBe(true);
    expect(
      sentSwitchFrames().filter(
        (f) => f.type === "room.part" && f.room === IRC_CHAT_PRODUCT_ROOM,
      ),
    ).toHaveLength(0);
  });

  it("reconnect clears stale members and re-joins primary room", () => {
    const { core } = createSwitchCore();
    authenticate(core);
    core.joinRoom(GAMES_ROOM);
    latestSocket().emitMessage(roomJoinedFrame(GAMES_ROOM));
    latestSocket().emitMessage(
      namesFrame(GAMES_ROOM, [{ nick: "Ranjha", userId: "visitor_test123" }]),
    );
    expect(core.getState().members[GAMES_ROOM]).toHaveLength(1);

    latestSocket().close();
    latestSocket().open();
    latestSocket().emitMessage(authOkFrame("visitor_test123", "Ranjha"));
    latestSocket().emitMessage(roomJoinedFrame(IRC_CHAT_PRODUCT_ROOM));

    expect(core.getState().members[GAMES_ROOM]).toBeUndefined();
    expect(
      sentSwitchFrames().some(
        (f) => f.type === "room.join" && f.room === IRC_CHAT_PRODUCT_ROOM,
      ),
    ).toBe(true);
  });

  it("DM send is unaffected by public room switch", () => {
    const { core } = createSwitchCore();
    authenticate(core);
    core.joinRoom(GAMES_ROOM);
    latestSocket().emitMessage(roomJoinedFrame(GAMES_ROOM));

    const pmId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    core.sendPrivateMessage("Alice", "hey");
    latestSocket().emitMessage(
      pmSentFrame({
        messageId: pmId,
        recipientNick: "Alice",
        text: "hey",
      }),
    );

    expect(
      sentSwitchFrames().some((f) => f.type === "pm.send"),
    ).toBe(true);
    expect(core.getState().privateMessages["ircpm:Alice"]?.[0]?.text).toBe("hey");
  });
});

describe("buildJoinFrame", () => {
  it("matches room.join wire format", () => {
    expect(buildJoinFrame(IRC_CHAT_PRODUCT_ROOM)).toEqual({
      type: "room.join",
      room: IRC_CHAT_PRODUCT_ROOM,
    });
  });
});
