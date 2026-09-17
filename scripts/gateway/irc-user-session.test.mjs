import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "node:events";
import {
  createIrcUserSession,
  sanitizeUserIdent,
  parseRegistrationErrorLine,
} from "./irc-user-session.cjs";

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

function sessionWithMockSocket(overrides = {}) {
  const mockSocket = createMockTlsSocket();
  const session = createIrcUserSession({
    host: "yaarzo-ergo",
    port: 6697,
    servername: "irc.yaarzo.com",
    nick: overrides.nick ?? "TestNick",
    userId: overrides.userId ?? "visitor_abc123",
    identityType: "guest",
    connectTls: () => mockSocket,
    regTimeoutMs: overrides.regTimeoutMs ?? 15_000,
    connectTimeoutMs: overrides.connectTimeoutMs ?? 20_000,
    logger: { log() {}, warn() {}, error() {} },
    onNamesComplete: overrides.onNamesComplete,
    onLine: overrides.onLine,
  });
  return { session, mockSocket };
}

function emitIrcLines(mockSocket, lines) {
  const payload = lines.map((line) => `${line}\r\n`).join("");
  mockSocket.emit("data", payload);
}

async function connectRegistered(session, mockSocket) {
  const pending = session.connect();
  mockSocket.emit("secureConnect");
  mockSocket.emit("data", ":irc.yaarzo.com 001 test7 :Welcome to Ergo\r\n");
  await pending;
}

describe("sanitizeUserIdent", () => {
  it("strips hyphens from UUID user ids", () => {
    const ident = sanitizeUserIdent("a0eebc99-9c0d-ef12-3456-7890abcdef12");
    assert.doesNotMatch(ident, /-/);
    assert.match(ident, /^yaarzo_[A-Za-z0-9]+$/);
  });

  it("removes CR/LF and non-alphanumeric characters", () => {
    assert.equal(sanitizeUserIdent("visitor_abc\r\n"), "yaarzo_visitorabc");
  });

  it("falls back when user id is empty after sanitization", () => {
    assert.equal(sanitizeUserIdent("---"), "yaarzo_user");
  });
});

describe("parseRegistrationErrorLine", () => {
  it("detects ERR_NICKNAMEINUSE (433)", () => {
    const err = parseRegistrationErrorLine(
      ":irc.yaarzo.com 433 * TestNick :Nickname is already in use",
    );
    assert.equal(err?.code, "433");
    assert.match(err?.message ?? "", /already in use/i);
  });

  it("detects fatal ERROR lines", () => {
    const err = parseRegistrationErrorLine("ERROR :Closing link: Access denied");
    assert.equal(err?.code, "ERROR");
    assert.match(err?.message ?? "", /Access denied/i);
  });

  it("ignores non-registration numerics", () => {
    assert.equal(parseRegistrationErrorLine(":irc.yaarzo.com 002 Test :Your host"), null);
  });
});

describe("createIrcUserSession connect()", () => {
  it("sends sanitized USER ident on TLS secureConnect", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      userId: "a0eebc99-9c0d-ef12-3456",
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com 001 TestNick :Welcome\r\n");
    await pending;

    const userLine = writes.find((line) => line.startsWith("USER "));
    assert.ok(userLine);
    assert.doesNotMatch(userLine, /-/);
    assert.match(userLine, /^USER yaarzo_[A-Za-z0-9]+ 0 \* :Yaarzo User/);
  });

  it("001 Welcome causes connect() to resolve and marks session registered", async () => {
    const { session, mockSocket } = sessionWithMockSocket();

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com 001 TestNick :Welcome to Ergo\r\n");
    await pending;

    assert.equal(session.registered, true);
  });

  it("rejects immediately on registration error numeric instead of waiting for timeout", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      regTimeoutMs: 60_000,
    });

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit(
      "data",
      ":irc.yaarzo.com 433 * TestNick :Nickname is already in use\r\n",
    );

    await assert.rejects(pending, /IRC registration failed \(433\)/);
    assert.equal(session.registered, false);
    assert.equal(mockSocket.destroyed, true);
  });

  it("rejects with registration timeout when 001 never arrives", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      regTimeoutMs: 40,
      connectTimeoutMs: 60_000,
    });

    const pending = session.connect();
    mockSocket.emit("secureConnect");

    await assert.rejects(pending, /IRC registration timeout/);
    assert.equal(session.registered, false);
    assert.equal(mockSocket.destroyed, true);
  });

  it("cleans up socket state after failed registration", async () => {
    const { session, mockSocket } = sessionWithMockSocket();

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", "ERROR :Registration refused\r\n");

    await assert.rejects(pending, /IRC registration failed \(ERROR\)/);
    assert.equal(session.registered, false);
    assert.equal(mockSocket.destroyed, true);
    assert.equal(session.joinedRooms.size, 0);
  });

  it("cleans up on quit after successful registration", async () => {
    const { session, mockSocket } = sessionWithMockSocket();

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com 001 TestNick :Welcome\r\n");
    await pending;

    assert.equal(session.registered, true);
    session.quit("test done");
    assert.equal(session.registered, false);
    assert.equal(mockSocket.destroyed, true);
  });
});

describe("createIrcUserSession JOIN / NAMES lifecycle", () => {
  const ROOM = "yaarzo-global";
  const CHANNEL = "#yaarzo-global";

  it("completes NAMES with normalized multi-user snapshot after JOIN", async () => {
    const namesSnapshots = [];
    const joinLines = [];
    const { session, mockSocket } = sessionWithMockSocket({
      nick: "test7",
      onNamesComplete: (room, nicks) => {
        namesSnapshots.push({ room, nicks: [...nicks] });
      },
      onLine: (line) => {
        if (line.includes(" JOIN ")) joinLines.push(line);
      },
    });

    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk).trim());
      return true;
    };

    await connectRegistered(session, mockSocket);
    assert.equal(session.registered, true);

    assert.equal(session.joinRoom(ROOM), true);
    assert.ok(
      writes.some((line) => line === `JOIN ${CHANNEL}`),
      `expected JOIN ${CHANNEL}, got: ${writes.join(" | ")}`,
    );

    emitIrcLines(mockSocket, [
      ":test7!yaarzo_visitorabc@irc.yaarzo.com JOIN :#yaarzo-global",
    ]);
    assert.equal(joinLines.length, 1);
    assert.match(joinLines[0], /JOIN :?#yaarzo-global/i);

    assert.equal(session.requestNames(ROOM), true);
    assert.ok(writes.some((line) => line === `NAMES ${CHANNEL}`));

    emitIrcLines(mockSocket, [
      ":irc.yaarzo.com 353 test7 = #yaarzo-global :@Arman +maliha test7",
      ":irc.yaarzo.com 366 test7 #yaarzo-global :End of /NAMES",
    ]);

    assert.equal(namesSnapshots.length, 1);
    assert.equal(namesSnapshots[0].room, ROOM);
    assert.deepEqual(
      [...namesSnapshots[0].nicks].sort(),
      ["Arman", "maliha", "test7"],
    );
    for (const nick of namesSnapshots[0].nicks) {
      assert.doesNotMatch(nick, /^[@+%&~]/);
    }
  });

  it("duplicate requestNames before 366 resets accumulator and yields self-only snapshot", async () => {
    const namesSnapshots = [];
    const { session, mockSocket } = sessionWithMockSocket({
      nick: "test7",
      onNamesComplete: (room, nicks) => {
        namesSnapshots.push({ room, nicks: [...nicks] });
      },
    });

    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk).trim());
      return true;
    };

    await connectRegistered(session, mockSocket);
    session.joinRoom(ROOM);

    assert.equal(session.requestNames(ROOM), true);
    emitIrcLines(mockSocket, [
      ":irc.yaarzo.com 353 test7 = #yaarzo-global :@Arman +maliha",
    ]);

    assert.equal(session.requestNames(ROOM), true);
    assert.equal(
      writes.filter((line) => line === `NAMES ${CHANNEL}`).length,
      2,
      "second requestNames sends another NAMES (documents destructive reset if duplicated)",
    );

    emitIrcLines(mockSocket, [
      ":irc.yaarzo.com 353 test7 = #yaarzo-global :test7",
      ":irc.yaarzo.com 366 test7 #yaarzo-global :End of /NAMES",
    ]);

    assert.equal(namesSnapshots.length, 1);
    assert.equal(namesSnapshots[0].room, ROOM);
    assert.deepEqual(namesSnapshots[0].nicks, ["test7"]);
  });
});

describe("gateway attachUserIrcSession NAMES policy", () => {
  const gatewaySource = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../gateway-index-vps.js"),
    "utf8",
  );

  it("joins primary on attach but does not requestRoomNames (client room.join owns NAMES)", () => {
    const attachFn = gatewaySource.match(
      /async function attachUserIrcSession\(ws\)[\s\S]*?\n\}/,
    );
    assert.ok(attachFn?.[0], "attachUserIrcSession should exist in gateway-index-vps.js");
    assert.match(attachFn[0], /result\.session\.joinRoom\(primary\)/);
    assert.doesNotMatch(attachFn[0], /requestRoomNames\s*\(/);
  });
});
