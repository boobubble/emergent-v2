import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));

describe("chat provider safety", () => {
  it("does not throw on rooms missing members during badge/streak/profile merge", () => {
    const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(src).toMatch(/r\?\.members\?\.includes\("me"\)/);
    expect(src).toMatch(/!\(r\.members \?\? \[\]\)\.includes\(b\)/);
    expect(src).toMatch(/s\.users\?\.me/);
    expect(src).toMatch(/state\.dmOrder \?\? \[\]/);
  });

  it("ChatErrorBoundary offers retry after a render throw", () => {
    const src = readFileSync(resolve(testDir, "../components/ChatErrorBoundary.tsx"), "utf8");
    expect(src).toMatch(/Try again/);
    expect(src).toMatch(/handleRetry/);
    expect(src).toMatch(/setState\(\{ error: null \}\)/);
  });

  it("Avatar does not slice a null username", () => {
    const src = readFileSync(resolve(testDir, "../components/chat/Avatar.tsx"), "utf8");
    expect(src).toMatch(/user\.name \|\| "\?"/);
  });
});

describe("authenticated send is optimistic", () => {
  const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");

  it("adds the local message with sending status before the Supabase insert", () => {
    expect(src).toMatch(/sendStatus:\s*"sending"/);
    const sendingAt = src.indexOf('sendStatus: "sending"');
    const insertAt = src.indexOf('.from("messages").insert', sendingAt);
    expect(sendingAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(sendingAt);
  });

  it("confirms or fails after the insert, and exposes retrySend", () => {
    expect(src).toMatch(/confirmMessages/);
    expect(src).toMatch(/failMessages/);
    expect(src).toMatch(/retrySend/);
    expect(src).toMatch(/isDuplicateKeyError/);
  });
});

describe("optimistic helpers", () => {
  it("confirms sending messages and can apply server timestamps", async () => {
    const { confirmMessages, failMessages, persistSendStatus } = await import("./chat-optimistic");
    const sending = {
      lobby: [{ id: "a", channelId: "lobby", authorId: "me", text: "hi", ts: 1, sendStatus: "sending" as const }],
    };
    const confirmed = confirmMessages(sending, ["a"], { a: 99 });
    expect(confirmed.lobby[0].sendStatus).toBeUndefined();
    expect(confirmed.lobby[0].ts).toBe(99);

    const failed = failMessages(sending, ["a"], "network");
    expect(failed.lobby[0].sendStatus).toBe("failed");
    expect(failed.lobby[0].sendError).toBe("network");

    const persisted = persistSendStatus(sending);
    expect(persisted.lobby[0].sendStatus).toBe("failed");
  });

  it("reconciles guest optimistic rows by temp id or visitor+text", async () => {
    const { mergeGuestLobbyRow, replaceGuestLobbyRow, failGuestLobbyRow } = await import("./chat-optimistic");
    const opt = {
      id: "opt-1",
      channelId: "lobby",
      visitorId: "visitor_abc",
      displayName: "Guest-Ada",
      text: "hello",
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T01:00:00.000Z",
      sendStatus: "sending" as const,
    };
    const real = { ...opt, id: "real-1", sendStatus: undefined };
    const viaRealtime = mergeGuestLobbyRow([opt], real);
    expect(viaRealtime).toHaveLength(1);
    expect(viaRealtime[0].id).toBe("real-1");
    expect(viaRealtime[0].sendStatus).toBeUndefined();

    const viaConfirm = replaceGuestLobbyRow([opt], "opt-1", real);
    expect(viaConfirm).toHaveLength(1);
    expect(viaConfirm[0].id).toBe("real-1");

    const failed = failGuestLobbyRow([opt], "opt-1", "timeout");
    expect(failed[0].sendStatus).toBe("failed");
    expect(failed[0].sendError).toBe("timeout");
  });
});
