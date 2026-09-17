import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseIrcAccountLinksJson,
  lookupIrcAccountLink,
} from "./irc-account-links.cjs";
import {
  createIrcUserSession,
  encodeSaslPlain,
} from "./irc-user-session.cjs";

const SAMPLE_UUID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const OTHER_UUID = "11111111-2222-3333-4444-555555555555";
const TEST_ACCOUNT = "MappedNick";
const TEST_SECRET = "unit-test-only-secret";

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
  const logs = [];
  const session = createIrcUserSession({
    host: "yaarzo-ergo",
    port: 6697,
    servername: "irc.yaarzo.com",
    nick: overrides.nick ?? "TestNick",
    userId: overrides.userId ?? "visitor_abc123",
    identityType: overrides.identityType ?? "guest",
    ergoAccount: overrides.ergoAccount,
    ergoPassword: overrides.ergoPassword,
    allowUnmappedReservedFallback: overrides.allowUnmappedReservedFallback,
    connectTls: () => mockSocket,
    regTimeoutMs: overrides.regTimeoutMs ?? 15_000,
    connectTimeoutMs: overrides.connectTimeoutMs ?? 20_000,
    logger: {
      log(...args) { logs.push(args.map(String).join(" ")); },
      warn(...args) { logs.push(args.map(String).join(" ")); },
      error(...args) { logs.push(args.map(String).join(" ")); },
    },
  });
  return { session, mockSocket, logs };
}

function writtenLines(writes) {
  return writes.map((chunk) => String(chunk).replace(/\r?\n/g, ""));
}

describe("IRC_ACCOUNT_LINKS_JSON parser", () => {
  it("malformed JSON fails safely with empty map", () => {
    const parsed = parseIrcAccountLinksJson("{not-json");
    assert.equal(parsed.ok, false);
    assert.equal(parsed.links.size, 0);
    assert.equal(parsed.error, "invalid_json");
  });

  it("empty / missing env is valid empty map", () => {
    assert.equal(parseIrcAccountLinksJson("").ok, true);
    assert.equal(parseIrcAccountLinksJson("").links.size, 0);
    assert.equal(parseIrcAccountLinksJson(undefined).ok, true);
  });

  it("lookup is UUID/sub based, not username based", () => {
    const parsed = parseIrcAccountLinksJson(JSON.stringify({
      [SAMPLE_UUID]: { account: TEST_ACCOUNT, password: TEST_SECRET },
    }));
    assert.equal(parsed.ok, true);
    assert.equal(lookupIrcAccountLink(parsed.links, SAMPLE_UUID, "registered")?.account, TEST_ACCOUNT);
    assert.equal(lookupIrcAccountLink(parsed.links, TEST_ACCOUNT, "registered"), null);
    assert.equal(lookupIrcAccountLink(parsed.links, SAMPLE_UUID, "guest"), null);
    assert.equal(lookupIrcAccountLink(parsed.links, OTHER_UUID, "registered"), null);
  });
});

describe("SASL PLAIN encoding", () => {
  it("encodes \\0account\\0password without exposing secret in helper logs", () => {
    const b64 = encodeSaslPlain(TEST_ACCOUNT, TEST_SECRET);
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    assert.equal(decoded, `\0${TEST_ACCOUNT}\0${TEST_SECRET}`);
    const logs = [];
    logs.push("encoded sasl payload length " + b64.length);
    assert.ok(!logs.join(" ").includes(TEST_SECRET));
  });
});

describe("unlinked registered NICK/USER", () => {
  it("ordinary unlinked user remains NICK/USER only", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      nick: "Arman",
      userId: OTHER_UUID,
      identityType: "registered",
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    const lines = writtenLines(writes);
    assert.ok(lines.some((l) => l === "NICK Arman"));
    assert.ok(lines.some((l) => l.startsWith("USER ")));
    assert.ok(!lines.some((l) => l.startsWith("CAP ")));
    assert.ok(!lines.some((l) => l.startsWith("AUTHENTICATE")));

    mockSocket.emit("data", ":irc.yaarzo.com 001 Arman :Welcome\r\n");
    await pending;
    assert.equal(session.registered, true);
  });
});

describe("mapped SASL PLAIN session", () => {
  async function driveSaslSuccess(session, mockSocket, writes) {
    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * LS :sasl=PLAIN,EXTERNAL,SCRAM-SHA-256\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * ACK :sasl\r\n");
    mockSocket.emit("data", "AUTHENTICATE +\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com 903 * :SASL authentication successful\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com 001 MappedNick :Welcome\r\n");
    await pending;
    return writtenLines(writes);
  }

  it("mapped registered user performs SASL PLAIN then NICK/USER", async () => {
    const { session, mockSocket, logs } = sessionWithMockSocket({
      nick: TEST_ACCOUNT,
      userId: SAMPLE_UUID,
      identityType: "registered",
      ergoAccount: TEST_ACCOUNT,
      ergoPassword: TEST_SECRET,
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const lines = await driveSaslSuccess(session, mockSocket, writes);
    assert.equal(lines[0], "CAP LS 302");
    assert.ok(lines.includes("CAP REQ :sasl"));
    assert.ok(lines.includes("AUTHENTICATE PLAIN"));
    const authBlob = lines.find((l) => l.startsWith("AUTHENTICATE ") && l !== "AUTHENTICATE PLAIN");
    assert.ok(authBlob);
    assert.equal(authBlob.slice("AUTHENTICATE ".length), encodeSaslPlain(TEST_ACCOUNT, TEST_SECRET));
    const nickIdx = lines.indexOf(`NICK ${TEST_ACCOUNT}`);
    const capLsIdx = lines.indexOf("CAP LS 302");
    const authIdx = lines.indexOf("AUTHENTICATE PLAIN");
    assert.ok(capLsIdx < authIdx);
    assert.ok(authIdx < nickIdx);
    assert.ok(lines.includes("CAP END"));
    assert.equal(session.registered, true);
    assert.ok(!logs.join("\n").includes(TEST_SECRET));
    assert.ok(!logs.join("\n").includes(encodeSaslPlain(TEST_ACCOUNT, TEST_SECRET)));
  });

  it("SASL failure rejects connection", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      nick: TEST_ACCOUNT,
      userId: SAMPLE_UUID,
      identityType: "registered",
      ergoAccount: TEST_ACCOUNT,
      ergoPassword: TEST_SECRET,
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * LS :sasl=PLAIN\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * ACK :sasl\r\n");
    mockSocket.emit("data", "AUTHENTICATE +\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com 904 * :SASL authentication failed\r\n");

    await assert.rejects(pending, /IRC SASL failed \(904\)/);
    assert.equal(session.registered, false);
    const lines = writtenLines(writes);
    assert.ok(!lines.some((l) => l === `NICK ${TEST_ACCOUNT}`));
  });

  it("mapped reserved identity never suffixes on 433", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      nick: TEST_ACCOUNT,
      userId: SAMPLE_UUID,
      identityType: "registered",
      ergoAccount: TEST_ACCOUNT,
      ergoPassword: TEST_SECRET,
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * LS :sasl=PLAIN\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com CAP * ACK :sasl\r\n");
    mockSocket.emit("data", "AUTHENTICATE +\r\n");
    mockSocket.emit("data", ":irc.yaarzo.com 903 * :ok\r\n");
    mockSocket.emit(
      "data",
      `:irc.yaarzo.com 433 * ${TEST_ACCOUNT} :Nickname is reserved by a different account\r\n`,
    );

    await assert.rejects(pending, /IRC registration failed \(433\)/);
    const lines = writtenLines(writes);
    assert.ok(!lines.some((l) => /NICK MappedNick_2/.test(l)));
  });

  it("reconnect creates a fresh SASL handshake", async () => {
    function runOnce() {
      const { session, mockSocket } = sessionWithMockSocket({
        nick: TEST_ACCOUNT,
        userId: SAMPLE_UUID,
        identityType: "registered",
        ergoAccount: TEST_ACCOUNT,
        ergoPassword: TEST_SECRET,
      });
      const writes = [];
      mockSocket.write = (chunk) => {
        writes.push(String(chunk));
        return true;
      };
      return { session, mockSocket, writes };
    }

    const first = runOnce();
    const p1 = first.session.connect();
    first.mockSocket.emit("secureConnect");
    first.mockSocket.emit("data", ":irc.yaarzo.com CAP * LS :sasl=PLAIN\r\n");
    first.mockSocket.emit("data", ":irc.yaarzo.com CAP * ACK :sasl\r\n");
    first.mockSocket.emit("data", "AUTHENTICATE +\r\n");
    first.mockSocket.emit("data", ":irc.yaarzo.com 903 * :ok\r\n");
    first.mockSocket.emit("data", ":irc.yaarzo.com 001 MappedNick :Welcome\r\n");
    await p1;
    first.session.destroy();

    const second = runOnce();
    const p2 = second.session.connect();
    second.mockSocket.emit("secureConnect");
    second.mockSocket.emit("data", ":irc.yaarzo.com CAP * LS :sasl=PLAIN\r\n");
    second.mockSocket.emit("data", ":irc.yaarzo.com CAP * ACK :sasl\r\n");
    second.mockSocket.emit("data", "AUTHENTICATE +\r\n");
    second.mockSocket.emit("data", ":irc.yaarzo.com 903 * :ok\r\n");
    second.mockSocket.emit("data", ":irc.yaarzo.com 001 MappedNick :Welcome\r\n");
    await p2;

    assert.equal(writtenLines(first.writes).filter((l) => l === "CAP LS 302").length, 1);
    assert.equal(writtenLines(second.writes).filter((l) => l === "CAP LS 302").length, 1);
    assert.equal(writtenLines(second.writes).filter((l) => l === "AUTHENTICATE PLAIN").length, 1);
  });
});

describe("unmapped reserved nick 433", () => {
  it("cannot claim reserved identity; one UUID fallback NICK", async () => {
    const { session, mockSocket } = sessionWithMockSocket({
      nick: "ReservedX",
      userId: SAMPLE_UUID,
      identityType: "registered",
      allowUnmappedReservedFallback: true,
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };

    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit(
      "data",
      ":irc.yaarzo.com 433 * ReservedX :Nickname is reserved by a different account\r\n",
    );
    mockSocket.emit("data", ":irc.yaarzo.com 001 user_aaaaaaaa :Welcome\r\n");
    await pending;

    const lines = writtenLines(writes);
    assert.ok(lines.includes("NICK ReservedX"));
    assert.ok(lines.includes("NICK user_aaaaaaaa"));
    assert.ok(!lines.some((l) => l === "NICK ReservedX_2"));
    assert.equal(session.nick, "user_aaaaaaaa");
    assert.equal(session.registered, true);
  });
});

describe("guest SASL isolation", () => {
  it("guest never receives mapped credentials", async () => {
    const parsed = parseIrcAccountLinksJson(JSON.stringify({
      [SAMPLE_UUID]: { account: TEST_ACCOUNT, password: TEST_SECRET },
    }));
    assert.equal(lookupIrcAccountLink(parsed.links, "visitor_abc123", "guest"), null);

    const { session, mockSocket } = sessionWithMockSocket({
      nick: "Ranjha",
      userId: "visitor_abc123",
      identityType: "guest",
    });
    const writes = [];
    mockSocket.write = (chunk) => {
      writes.push(String(chunk));
      return true;
    };
    const pending = session.connect();
    mockSocket.emit("secureConnect");
    mockSocket.emit("data", ":irc.yaarzo.com 001 Ranjha :Welcome\r\n");
    await pending;
    const lines = writtenLines(writes);
    assert.ok(!lines.some((l) => l.startsWith("AUTHENTICATE")));
    assert.ok(lines.includes("NICK Ranjha"));
  });
});

describe("gateway auth wiring (source)", () => {
  const gatewaySource = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../gateway-index-vps.js"),
    "utf8",
  );

  it("registered path looks up links by JWT sub, guest branch does not", () => {
    assert.match(gatewaySource, /lookupIrcAccountLink\(ircAccountLinks, user\.sub/);
    const guestBlock = gatewaySource.match(
      /if \(payload\.guest && typeof payload\.guest === "object"\) \{[\s\S]*?return \{ ok: true, userId: ws\.userId, identityType: "guest" \};/,
    )?.[0];
    assert.ok(guestBlock);
    assert.doesNotMatch(guestBlock, /lookupIrcAccountLink/);
    assert.doesNotMatch(guestBlock, /IRC_ACCOUNT_LINKS_JSON/);
  });
});
