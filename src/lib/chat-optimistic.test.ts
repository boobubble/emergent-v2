import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Message } from "./chat-types";
import {
  AUTH_SEND_INTERRUPTED_ERROR,
  AUTH_SEND_NETWORK_ERROR,
  AUTH_SEND_TIMEOUT_ERROR,
  applyAuthenticatedInsertOutcome,
  applyHydrateLookupResult,
  applyHydrateSendReconcile,
  collectPendingSendIds,
  persistSendStatus,
  settleAuthenticatedInsert,
  settleAuthenticatedSendPromise,
  settleAuthenticatedSendWithRecover,
} from "./chat-optimistic";

const testDir = dirname(fileURLToPath(import.meta.url));

function msg(
  id: string,
  channelId: string,
  extra: Partial<Message> = {},
): Message {
  return {
    id,
    channelId,
    authorId: "me",
    text: "hi",
    ts: 1,
    sendStatus: "sending",
    ...extra,
  };
}

function sending(channelId: string, id = "m1"): Record<string, Message[]> {
  return { [channelId]: [msg(id, channelId)] };
}

describe("authenticated INSERT settlement (DM + lobby)", () => {
  it("successful DM INSERT → sent", () => {
    const channelId = "dm:11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222";
    const outcome = settleAuthenticatedInsert(null, [
      { id: "m1", created_at: "2026-09-04T12:00:00.000Z" },
    ]);
    const next = applyAuthenticatedInsertOutcome(sending(channelId), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next[channelId][0].sendStatus).toBeUndefined();
    expect(next[channelId][0].sendError).toBeUndefined();
    expect(next[channelId][0].ts).toBe(new Date("2026-09-04T12:00:00.000Z").getTime());
  });

  it("successful lobby INSERT → sent", () => {
    const outcome = settleAuthenticatedInsert(null, [
      { id: "m1", created_at: "2026-09-04T12:00:00.000Z" },
    ]);
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
  });

  it("failed INSERT → failed", () => {
    const outcome = settleAuthenticatedInsert({ message: "new row violates row-level security" }, []);
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome).toEqual({ action: "fail", error: "new row violates row-level security" });
    expect(next.lobby[0].sendStatus).toBe("failed");
    expect(next.lobby[0].sendError).toBe("new row violates row-level security");
  });

  it("network/rejected promise → failed", async () => {
    const outcome = await settleAuthenticatedSendPromise(Promise.reject(new Error("Failed to fetch")));
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("fail");
    expect(next.lobby[0].sendStatus).toBe("failed");
    expect(next.lobby[0].sendError).toBe("Failed to fetch");
  });

  it("timeout → failed", async () => {
    vi.useFakeTimers();
    const hanging = new Promise<never>(() => {});
    const pending = settleAuthenticatedSendPromise(hanging, { timeoutMs: 1_000 });
    await vi.advanceTimersByTimeAsync(1_000);
    const outcome = await pending;
    vi.useRealTimers();
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome).toEqual({ action: "fail", error: AUTH_SEND_TIMEOUT_ERROR });
    expect(next.lobby[0].sendStatus).toBe("failed");
    expect(next.lobby[0].sendError).toBe(AUTH_SEND_TIMEOUT_ERROR);
  });

  it("successful INSERT with empty response body → sent", async () => {
    const emptyBodies: Array<{ data: null | []; error: null }> = [
      { data: [], error: null },
      { data: null, error: null },
    ];
    for (const body of emptyBodies) {
      const outcome = await settleAuthenticatedSendPromise(Promise.resolve(body));
      const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
      expect(outcome).toEqual({ action: "confirm", tsById: {} });
      expect(next.lobby[0].sendStatus).toBeUndefined();
    }
  });

  it("duplicate-key retry → sent", () => {
    for (const message of [
      'duplicate key value violates unique constraint "messages_pkey"',
      "unique constraint violated",
      "already exists",
    ]) {
      const outcome = settleAuthenticatedInsert({ message }, null);
      const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
      expect(outcome.action).toBe("confirm");
      expect(next.lobby[0].sendStatus).toBeUndefined();
    }
  });

  it("realtime missing/delayed → send still becomes sent from INSERT success", async () => {
    const outcome = await settleAuthenticatedSendPromise(
      Promise.resolve({
        data: [{ id: "m1", created_at: "2026-09-04T12:00:00.000Z" }],
        error: null,
      }),
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
  });
});

describe("authenticated send recover (lookup + one retry)", () => {
  const committed = { id: "m1", created_at: "2026-09-04T12:00:00.000Z" };

  it("normal successful INSERT → confirm, no lookup or retry", async () => {
    const lookupRows = vi.fn();
    const retryInsert = vi.fn();
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.resolve({ data: [committed], error: null }),
      ["m1"],
      { lookupRows, retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
    expect(lookupRows).not.toHaveBeenCalled();
    expect(retryInsert).not.toHaveBeenCalled();
  });

  it("timeout + message exists → confirm, no retry", async () => {
    vi.useFakeTimers();
    const lookupRows = vi.fn(async () => ({ ok: true as const, rows: [committed] }));
    const retryInsert = vi.fn();
    const pending = settleAuthenticatedSendWithRecover(
      new Promise<never>(() => {}),
      ["m1"],
      { lookupRows, retryInsert },
      { timeoutMs: 1_000 },
    );
    await vi.advanceTimersByTimeAsync(1_000);
    const outcome = await pending;
    vi.useRealTimers();
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome).toEqual({ action: "confirm", tsById: { m1: new Date(committed.created_at).getTime() } });
    expect(next.lobby[0].sendStatus).toBeUndefined();
    expect(lookupRows).toHaveBeenCalledOnce();
    expect(retryInsert).not.toHaveBeenCalled();
  });

  it("network failure + message exists → confirm", async () => {
    const lookupRows = vi.fn(async () => ({ ok: true as const, rows: [committed] }));
    const retryInsert = vi.fn();
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error("Failed to fetch")),
      ["m1"],
      { lookupRows, retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
    expect(retryInsert).not.toHaveBeenCalled();
  });

  it("timeout + message missing → exactly one retry", async () => {
    vi.useFakeTimers();
    const lookupRows = vi.fn(async () => ({ ok: true as const, rows: [] }));
    const retryInsert = vi.fn(() => Promise.resolve({ data: [committed], error: null }));
    const pending = settleAuthenticatedSendWithRecover(
      new Promise<never>(() => {}),
      ["m1"],
      { lookupRows, retryInsert },
      { timeoutMs: 1_000 },
    );
    await vi.advanceTimersByTimeAsync(1_000);
    const outcome = await pending;
    vi.useRealTimers();
    expect(outcome.action).toBe("confirm");
    expect(lookupRows).toHaveBeenCalledOnce();
    expect(retryInsert).toHaveBeenCalledOnce();
  });

  it("retry succeeds → confirm", async () => {
    const retryInsert = vi.fn(() => Promise.resolve({ data: [committed], error: null }));
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error("Failed to fetch")),
      ["m1"],
      { lookupRows: async () => ({ ok: true, rows: [] }), retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("dm:a:b"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next["dm:a:b"][0].sendStatus).toBeUndefined();
    expect(retryInsert).toHaveBeenCalledOnce();
  });

  it("retry duplicate-key → confirm", async () => {
    const retryInsert = vi.fn(() =>
      Promise.resolve({
        data: null,
        error: { message: 'duplicate key value violates unique constraint "messages_pkey"' },
      }),
    );
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error(AUTH_SEND_TIMEOUT_ERROR)),
      ["m1"],
      { lookupRows: async () => ({ ok: true, rows: [] }), retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
  });

  it("retry fails → fail", async () => {
    const retryInsert = vi.fn(() => Promise.reject(new Error("Failed to fetch")));
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error(AUTH_SEND_TIMEOUT_ERROR)),
      ["m1"],
      { lookupRows: async () => ({ ok: true, rows: [] }), retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome).toEqual({ action: "fail", error: "Failed to fetch" });
    expect(next.lobby[0].sendStatus).toBe("failed");
    expect(retryInsert).toHaveBeenCalledOnce();
  });

  it("thrown reconciliation SELECT → retry, do not fail with the lookup error", async () => {
    const retryInsert = vi.fn(() => Promise.resolve({ data: [committed], error: null }));
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error(AUTH_SEND_TIMEOUT_ERROR)),
      ["m1"],
      { lookupRows: async () => { throw new Error("select failed"); }, retryInsert },
    );
    expect(outcome.action).toBe("confirm");
    expect(retryInsert).toHaveBeenCalledOnce();
    expect(outcome.action === "fail" ? outcome.error : "").not.toBe("select failed");
  });

  it("reconciliation SELECT errors → do NOT fail merely because lookup errored", async () => {
    const retryInsert = vi.fn(() => Promise.resolve({ data: [committed], error: null }));
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error(AUTH_SEND_TIMEOUT_ERROR)),
      ["m1"],
      { lookupRows: async () => ({ ok: false, error: "JWT expired" }), retryInsert },
    );
    const next = applyAuthenticatedInsertOutcome(sending("lobby"), ["m1"], outcome);
    expect(outcome.action).toBe("confirm");
    expect(next.lobby[0].sendStatus).toBeUndefined();
    expect(outcome.action === "fail" ? outcome.error : "").not.toBe("JWT expired");
    expect(retryInsert).toHaveBeenCalledOnce();
  });

  it("RLS / non-retryable INSERT errors still fail without lookup or retry", async () => {
    const lookupRows = vi.fn();
    const retryInsert = vi.fn();
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.resolve({ data: [], error: { message: "new row violates row-level security" } }),
      ["m1"],
      { lookupRows, retryInsert },
    );
    expect(outcome).toEqual({ action: "fail", error: "new row violates row-level security" });
    expect(lookupRows).not.toHaveBeenCalled();
    expect(retryInsert).not.toHaveBeenCalled();
  });

  it("Failed to send catch-all is retryable and can confirm from lookup", async () => {
    const outcome = await settleAuthenticatedSendWithRecover(
      Promise.reject(new Error(AUTH_SEND_NETWORK_ERROR)),
      ["m1"],
      {
        lookupRows: async () => ({ ok: true, rows: [committed] }),
        retryInsert: vi.fn(),
      },
    );
    expect(outcome.action).toBe("confirm");
  });
});

describe("reload send-status reconciliation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not persist in-flight sending as Couldn't send", () => {
    const persisted = persistSendStatus(sending("lobby"));
    expect(persisted.lobby[0].sendStatus).toBe("sending");
    expect(persisted.lobby[0].sendError).toBeUndefined();
  });

  it("reload reconciliation does not falsely show a committed message as failed", () => {
    const persisted = persistSendStatus(sending("lobby", "committed"));
    expect(collectPendingSendIds(persisted)).toEqual(["committed"]);
    const after = applyHydrateSendReconcile(persisted, ["committed"], [
      { id: "committed", created_at: "2026-09-04T12:00:00.000Z" },
    ]);
    expect(after.lobby[0].sendStatus).toBeUndefined();
    expect(after.lobby[0].sendError).toBeUndefined();
  });

  it("legacy Send interrupted + row in public.messages reconciles as sent", () => {
    const legacy = {
      lobby: [
        msg("committed", "lobby", {
          sendStatus: "failed",
          sendError: AUTH_SEND_INTERRUPTED_ERROR,
        }),
      ],
    };
    expect(collectPendingSendIds(legacy)).toEqual(["committed"]);
    const after = applyHydrateSendReconcile(legacy, ["committed"], [
      { id: "committed", created_at: "2026-09-04T12:00:00.000Z" },
    ]);
    expect(after.lobby[0].sendStatus).toBeUndefined();
  });

  it("unverifiable pending messages fail instead of staying sending", () => {
    const after = applyHydrateSendReconcile(sending("lobby"), ["m1"], []);
    expect(after.lobby[0].sendStatus).toBe("failed");
    expect(after.lobby[0].sendError).toBe(AUTH_SEND_INTERRUPTED_ERROR);
  });

  it("does not re-fail a message already confirmed by INSERT while hydrate is in flight", () => {
    const alreadySent = { lobby: [msg("m1", "lobby", { sendStatus: undefined, sendError: undefined })] };
    delete alreadySent.lobby[0].sendStatus;
    delete alreadySent.lobby[0].sendError;
    const after = applyHydrateSendReconcile(alreadySent, ["m1"], []);
    expect(after.lobby[0].sendStatus).toBeUndefined();
  });

  it("hydrate SELECT error → pending send is not incorrectly failed", () => {
    const after = applyHydrateLookupResult(sending("lobby"), ["m1"], {
      ok: false,
      error: "permission denied for table messages",
    });
    expect(after.lobby[0].sendStatus).toBe("sending");
    expect(after.lobby[0].sendError).toBeUndefined();
  });

  it("hydrate lookup success still confirms found and fails missing", () => {
    const confirmed = applyHydrateLookupResult(sending("lobby", "committed"), ["committed"], {
      ok: true,
      rows: [{ id: "committed", created_at: "2026-09-04T12:00:00.000Z" }],
    });
    expect(confirmed.lobby[0].sendStatus).toBeUndefined();
    const missing = applyHydrateLookupResult(sending("lobby"), ["m1"], { ok: true, rows: [] });
    expect(missing.lobby[0].sendStatus).toBe("failed");
    expect(missing.lobby[0].sendError).toBe(AUTH_SEND_INTERRUPTED_ERROR);
  });
});

describe("ChatProviderInner send pipeline wiring", () => {
  const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");

  it("settles authenticated INSERT with timeout/catch and does not wait for realtime", () => {
    expect(src).toContain("settleAuthenticatedSendWithRecover");
    expect(src).toContain("settleRemoteOutgoing");
    expect(src).toContain("applyHydrateLookupResult");
    expect(src).toContain(".catch((err: unknown)");
    expect(src).toContain('from("messages")');
    const sendAt = src.indexOf("const send = useCallback");
    const retryAt = src.indexOf("const retrySend = useCallback");
    const realtimeAt = src.indexOf('event: "INSERT", schema: "public", table: "messages"');
    const sendSettleAt = src.indexOf("settleRemoteOutgoing", sendAt);
    const retrySettleAt = src.indexOf("settleRemoteOutgoing", retryAt);
    expect(sendAt).toBeGreaterThan(-1);
    expect(sendSettleAt).toBeGreaterThan(sendAt);
    expect(sendSettleAt).toBeLessThan(retryAt);
    expect(retrySettleAt).toBeGreaterThan(retryAt);
    expect(realtimeAt).toBeGreaterThan(-1);
    expect(sendSettleAt).not.toBe(realtimeAt);
  });

  it("does not treat hydrate SELECT errors as missing rows", () => {
    expect(src).toContain("applyHydrateLookupResult");
    expect(src).not.toMatch(/if \(error\) \{[\s\S]{0,180}applyHydrateSendReconcile\([\s\S]{0,80}\[\]/);
  });

  it("schedules INSERT from outgoing collected after a flushed send reducer", () => {
    expect(src).toContain("flushSync");
    expect(src).toMatch(/outgoingRemotes = outgoing/);
  });
});
