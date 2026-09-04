import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyMutedSendGate,
  decideMutedSend,
  lobbyMuteWarning,
  readMutedUntil,
} from "./chat-mute-send";

const testDir = dirname(fileURLToPath(import.meta.url));
const NOW = 1_000_000;
const MUTED_UNTIL = NOW + 22_000;
const AUTH = "11111111-1111-4111-8111-111111111111";
const FRIEND = "22222222-2222-4222-8222-222222222222";
const STRANGER = "33333333-3333-4333-8333-333333333333";
const DM_FRIEND = `dm:${AUTH}:${FRIEND}`;
const DM_STRANGER = `dm:${AUTH}:${STRANGER}`;

describe("muted lobby send gate", () => {
  it("muted lobby send creates zero optimistic messages and zero INSERT attempts", () => {
    const result = applyMutedSendGate({
      messages: { lobby: [] },
      channelId: "lobby",
      text: "lol",
      now: NOW,
      moderation: { lobby: { me: { mutedUntil: MUTED_UNTIL } } },
      authUserId: AUTH,
    });
    expect(result.outgoingInserts).toEqual([]);
    expect(result.messages.lobby.some((m) => m.sendStatus === "sending")).toBe(false);
    expect(result.messages.lobby.some((m) => m.authorId === "me")).toBe(false);
    expect(result.messages.lobby).toHaveLength(1);
    expect(result.messages.lobby[0].kind).toBe("system");
  });

  it("no Sending state is created for a muted lobby send", () => {
    const decision = decideMutedSend({
      channelId: "lobby",
      now: NOW,
      moderation: { lobby: { me: { mutedUntil: MUTED_UNTIL } } },
      authUserId: AUTH,
    });
    expect(decision.blocked).toBe(true);
    if (!decision.blocked) throw new Error("expected block");
    expect(decision.warning).toBe(lobbyMuteWarning(22_000));
    expect(decision.warning).toContain("You're muted in Lobby (22s left).");
    expect(decision.warning).toContain("You can still DM friends from your friends list.");
  });

  it("mute warning is preserved (MessageInput copy)", () => {
    expect(lobbyMuteWarning(22_000)).toBe(
      "You're muted in Lobby (22s left). You can still DM friends from your friends list.",
    );
  });

  it("reads mute from auth UUID as well as me", () => {
    expect(
      readMutedUntil({ lobby: { [AUTH]: { mutedUntil: MUTED_UNTIL } } }, "lobby", ["me", AUTH]),
    ).toBe(MUTED_UNTIL);
    const result = applyMutedSendGate({
      messages: { lobby: [] },
      channelId: "lobby",
      text: "mute tha mai",
      now: NOW,
      moderation: { lobby: { [AUTH]: { mutedUntil: MUTED_UNTIL } } },
      authUserId: AUTH,
    });
    expect(result.outgoingInserts).toEqual([]);
    expect(result.messages.lobby[0].text).toContain("You're muted in Lobby");
  });

  it("DM send to a friend remains unaffected while Lobby mute is active", () => {
    const result = applyMutedSendGate({
      messages: { [DM_FRIEND]: [] },
      channelId: DM_FRIEND,
      text: "hey friend",
      now: NOW,
      moderation: { lobby: { me: { mutedUntil: MUTED_UNTIL } } },
      authUserId: AUTH,
      friends: [FRIEND],
      dmPeerId: FRIEND,
    });
    expect(result.outgoingInserts).toEqual([{ id: "opt-1", channelId: DM_FRIEND, text: "hey friend" }]);
    expect(result.messages[DM_FRIEND][0].sendStatus).toBe("sending");
    expect(result.messages[DM_FRIEND][0].text).toBe("hey friend");
  });

  it("unmuted lobby send still uses the optimistic sending row (PR #22 insert path)", () => {
    const result = applyMutedSendGate({
      messages: { lobby: [] },
      channelId: "lobby",
      text: "hello lobby",
      now: NOW,
      moderation: {},
      authUserId: AUTH,
    });
    expect(result.outgoingInserts).toHaveLength(1);
    expect(result.messages.lobby[0].sendStatus).toBe("sending");
    expect(result.messages.lobby[0].text).toBe("hello lobby");
  });

  it("non-friend DM stays blocked while lobby-muted (enforcement not weakened)", () => {
    const decision = decideMutedSend({
      channelId: DM_STRANGER,
      now: NOW,
      moderation: { lobby: { me: { mutedUntil: MUTED_UNTIL } } },
      authUserId: AUTH,
      friends: [FRIEND],
      dmPeerId: STRANGER,
    });
    expect(decision.blocked).toBe(true);
  });
});

describe("ChatProviderInner.send mute order", () => {
  const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
  const input = readFileSync(resolve(testDir, "../components/chat/MessageInput.tsx"), "utf8");

  it("decides mute before optimistic sending and before INSERT", () => {
    expect(src).toContain("decideMutedSend");
    const sendAt = src.indexOf("const send = useCallback");
    const muteAt = src.indexOf("decideMutedSend", sendAt);
    const sendingAt = src.indexOf('sendStatus: "sending"', sendAt);
    const outgoingAt = src.indexOf("outgoingRemotes.push", sendAt);
    const insertAt = src.indexOf("settleAuthenticatedSendPromise", sendAt);
    expect(muteAt).toBeGreaterThan(sendAt);
    expect(muteAt).toBeLessThan(sendingAt);
    expect(muteAt).toBeLessThan(outgoingAt);
    expect(outgoingAt).toBeLessThan(insertAt);
  });

  it("unmuted lobby send still uses the PR #22 send-status flow", () => {
    expect(src).toContain("settleAuthenticatedSendPromise");
    expect(src).toContain("confirmMessages");
    expect(src).toContain('sendStatus: "sending"');
  });

  it("MessageInput does not submit when the lobby mute banner is shown", () => {
    expect(input).toContain("readMutedUntil");
    expect(input).toContain("if (isChannelMuted) return");
    expect(input).toContain("You're muted in {mutedRoomName}");
    expect(input).toContain("You can still DM friends from your friends list.");
  });
});
