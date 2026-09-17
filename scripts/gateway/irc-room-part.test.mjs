import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { createIrcUserSession } from "./irc-user-session.cjs";

const gatewaySource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../gateway-index-vps.js"),
  "utf8",
);

function createMockTlsSocket() {
  const socket = new EventEmitter();
  socket.destroyed = false;
  socket.destroy = () => {
    socket.destroyed = true;
    socket.emit("close");
  };
  socket.write = () => true;
  socket.setEncoding = () => {};
  return socket;
}

async function connectRegistered(session, mockSocket) {
  const pending = session.connect();
  mockSocket.emit("secureConnect");
  mockSocket.emit("data", ":irc.yaarzo.com 001 test7 :Welcome to Ergo\r\n");
  await pending;
}

describe("gateway room.part WS handler", () => {
  it("handles room.part with validation and room.parted ack", () => {
    assert.match(gatewaySource, /payload\.type === "room\.part"/);
    assert.match(gatewaySource, /validateRoomId\(payload\.room\)/);
    assert.match(gatewaySource, /userSession\.partRoom\(room\)/);
    assert.match(gatewaySource, /type: "room\.parted"/);
    const partBlock = gatewaySource.match(
      /if \(payload\.type === "room\.part"\) \{[\s\S]*?\n    \}/,
    )?.[0];
    assert.ok(partBlock, "room.part handler block should exist");
    assert.doesNotMatch(partBlock, /joinIrcRoom/);
  });
});

describe("per-user IRC session partRoom", () => {
  it("partRoom sends PART and removes room from joinedRooms", async () => {
    const mockSocket = createMockTlsSocket();
    const lines = [];
    mockSocket.write = (chunk) => {
      lines.push(String(chunk).replace(/\r?\n$/, ""));
      return true;
    };

    const session = createIrcUserSession({
      host: "yaarzo-ergo",
      port: 6697,
      servername: "irc.yaarzo.com",
      nick: "tester",
      userId: "uuid-1",
      identityType: "registered",
      connectTls: () => mockSocket,
      logger: { log() {}, warn() {}, error() {} },
    });

    await connectRegistered(session, mockSocket);
    session.joinRoom("yaarzo-global");
    session.joinRoom("games");
    assert.ok(session.joinedRooms.has("games"));
    session.partRoom("games");
    assert.ok(!session.joinedRooms.has("games"));
    assert.ok(session.joinedRooms.has("yaarzo-global"));
    assert.ok(lines.some((l) => /^PART #games/.test(l)));
  });
});
