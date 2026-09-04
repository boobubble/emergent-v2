import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Message } from "./chat-types";
import {
  AUTH_SEND_INTERRUPTED_ERROR,
  AUTH_SEND_TIMEOUT_ERROR,
  applyAuthenticatedInsertOutcome,
  applyHydrateSendReconcile,
  collectPendingSendIds,
  confirmExistingRealtimeRow,
  confirmMessages,
  confirmPendingHits,
  persistSendStatus,
  settleAuthenticatedInsert,
  settleAuthenticatedSendPromise,
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
});

describe("ChatProviderInner send pipeline wiring", () => {
  const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");

  it("settles authenticated INSERT with timeout/catch and does not wait for realtime", () => {
    expect(src).toContain("settleAuthenticatedSendPromise");
    expect(src).toContain("applyHydrateSendReconcile");
    expect(src).toContain("confirmPendingHits");
    expect(src).toContain("confirmExistingRealtimeRow");
    expect(src).toContain(".catch((err: unknown)");
    expect(src).toContain('from("messages")');
    const sendAt = src.indexOf("const send = useCallback");
    const retryAt = src.indexOf("const retrySend = useCallback");
    const realtimeAt = src.indexOf('event: "INSERT", schema: "public", table: "messages"');
    const sendSettleAt = src.indexOf("settleAuthenticatedSendPromise", sendAt);
    const retrySettleAt = src.indexOf("settleAuthenticatedSendPromise", retryAt);
    expect(sendAt).toBeGreaterThan(-1);
    expect(sendSettleAt).toBeGreaterThan(sendAt);
    expect(sendSettleAt).toBeLessThan(retryAt);
    expect(retrySettleAt).toBeGreaterThan(retryAt);
    expect(realtimeAt).toBeGreaterThan(-1);
    expect(sendSettleAt).not.toBe(realtimeAt);
  });
});

/**
 * Pre-PR#22 history merge: skip rows whose id is already in state.
 * That leaves sendStatus:"sending" even after public.messages already has the row.
 */
function legacyHistoryMergeById<T extends { id: string }>(existing: T[], fetched: T[]): T[] {
  const existingIds = new Set(existing.map((m) => m.id));
  const incoming = fetched.filter((r) => !existingIds.has(r.id));
  if (!incoming.length) return existing;
  return [...existing, ...incoming];
}

describe("stuck Sending: optimistic row is rendered but never confirmed", () => {
  const clientId = "11111111-1111-4111-8111-111111111111";
  const createdAt = "2026-09-04T15:00:00.000Z";

  function lobbyWithStuckSend(text = "stuck bubble"): Record<string, Message[]> {
    const peer = msg("peer-sayena", "lobby", { authorId: "sayena-id", text: "Hiii" });
    delete peer.sendStatus;
    const prevMine = msg("prev-me", "lobby", { authorId: "me", text: "hyy welocme" });
    delete prevMine.sendStatus;
    return {
      lobby: [
        peer,
        prevMine,
        msg(clientId, "lobby", { authorId: "me", text, sendStatus: "sending" }),
      ],
    };
  }

  it("send() assigns a client UUID + channelId + sendStatus sending (same id is inserted)", () => {
    const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(src).toMatch(/const msgId = remote \? newUuid\(\) : uid\(\)/);
    expect(src).toMatch(/id: msgId, channelId, authorId: "me"/);
    expect(src).toMatch(/\.\.\.\(remote \? \{ sendStatus: "sending" as const \} : \{\}\)/);
    expect(src).toMatch(/id: out\.id,\s*\n\s*channel_id: out\.channelId/m);
  });

  it("optimistic message -> successful INSERT -> still rendered -> sendStatus confirmed", async () => {
    const before = lobbyWithStuckSend("hello from me");
    expect(before.lobby[2].sendStatus).toBe("sending");
    expect(before.lobby[2].id).toBe(clientId);

    const outcome = await settleAuthenticatedSendPromise(
      Promise.resolve({
        data: [{ id: clientId, created_at: createdAt }],
        error: null,
      }),
    );
    const after = applyAuthenticatedInsertOutcome(before, [clientId], outcome);

    expect(after.lobby).toHaveLength(3);
    expect(after.lobby[0].text).toBe("Hiii");
    expect(after.lobby[1].text).toBe("hyy welocme");
    expect(after.lobby[2].id).toBe(clientId);
    expect(after.lobby[2].text).toBe("hello from me");
    expect(after.lobby[2].sendStatus).toBeUndefined();
    expect(after.lobby[2].sendError).toBeUndefined();
    expect(outcome.action).toBe("confirm");
  });

  it("confirmMessages patches by optimistic/client id, not a different database id", () => {
    const before = sending("lobby", clientId);
    const confirmed = confirmMessages(before, [clientId], { [clientId]: 99 });
    expect(confirmed.lobby[0].id).toBe(clientId);
    expect(confirmed.lobby[0].sendStatus).toBeUndefined();
    expect(confirmed.lobby[0].ts).toBe(99);

    const missed = confirmMessages(before, ["some-other-db-id"], { "some-other-db-id": 99 });
    expect(missed.lobby[0].sendStatus).toBe("sending");
  });

  it("INSERT uses the optimistic id; success does not append a second row", async () => {
    const before = lobbyWithStuckSend();
    const after = applyAuthenticatedInsertOutcome(
      before,
      [clientId],
      await settleAuthenticatedSendPromise(
        Promise.resolve({ data: [{ id: clientId, created_at: createdAt }], error: null }),
      ),
    );
    expect(after.lobby.filter((m) => m.id === clientId)).toHaveLength(1);
    expect(after.lobby).toHaveLength(before.lobby.length);
  });

  it("legacy history merge of the same UUID leaves sendStatus sending (the stuck-Sending hole)", () => {
    const before = lobbyWithStuckSend();
    const fetched = [
      { id: "peer-sayena", text: "Hiii" },
      { id: "prev-me", text: "hyy welocme" },
      { id: clientId, text: "stuck bubble" },
    ];
    const merged = legacyHistoryMergeById(before.lobby, fetched);
    expect(merged).toHaveLength(3);
    expect(merged[2].id).toBe(clientId);
    expect(merged[2].sendStatus).toBe("sending");
  });

  it("DB row arriving through hydrate confirms the existing optimistic row (no second copy)", () => {
    const before = lobbyWithStuckSend();
    const after = confirmPendingHits(before, [{ id: clientId, created_at: createdAt }]);
    expect(after.lobby).toHaveLength(3);
    expect(after.lobby[2].id).toBe(clientId);
    expect(after.lobby[2].sendStatus).toBeUndefined();
    expect(after.lobby.filter((m) => m.text === "stuck bubble")).toHaveLength(1);
  });

  it("history hydrate of other channels does not fail an in-flight lobby send", () => {
    const before = lobbyWithStuckSend();
    const after = confirmPendingHits(before, [{ id: "unrelated-dm-row", created_at: createdAt }]);
    expect(after.lobby[2].sendStatus).toBe("sending");
  });

  it("delayed realtime echo of the same client UUID confirms sending", () => {
    const before = lobbyWithStuckSend();
    const after = confirmExistingRealtimeRow(before, clientId, Date.parse(createdAt));
    expect(after.lobby[2].sendStatus).toBeUndefined();
    expect(after.lobby).toHaveLength(3);
  });

  it("no realtime event is required after INSERT success", async () => {
    const before = lobbyWithStuckSend();
    const after = applyAuthenticatedInsertOutcome(
      before,
      [clientId],
      await settleAuthenticatedSendPromise(
        Promise.resolve({ data: [{ id: clientId, created_at: createdAt }], error: null }),
      ),
    );
    expect(after.lobby[2].sendStatus).toBeUndefined();
  });

  it("successful INSERT with empty select body still confirms the optimistic id", async () => {
    const before = lobbyWithStuckSend();
    const after = applyAuthenticatedInsertOutcome(
      before,
      [clientId],
      await settleAuthenticatedSendPromise(Promise.resolve({ data: [], error: null })),
    );
    expect(after.lobby[2].id).toBe(clientId);
    expect(after.lobby[2].sendStatus).toBeUndefined();
  });

  it("duplicate-key retry confirms the already-committed optimistic id", () => {
    const before = lobbyWithStuckSend();
    const after = applyAuthenticatedInsertOutcome(
      before,
      [clientId],
      settleAuthenticatedInsert(
        { message: 'duplicate key value violates unique constraint "messages_pkey"' },
        null,
      ),
    );
    expect(after.lobby[2].sendStatus).toBeUndefined();
  });

  it("later history merge after confirm does not restore sendStatus sending", () => {
    const confirmed = confirmMessages(lobbyWithStuckSend(), [clientId], {
      [clientId]: Date.parse(createdAt),
    });
    expect(confirmed.lobby[2].sendStatus).toBeUndefined();
    const merged = legacyHistoryMergeById(confirmed.lobby, [
      { ...confirmed.lobby[2], sendStatus: undefined },
    ]);
    expect(merged[2].sendStatus).toBeUndefined();
    const hits = confirmPendingHits({ lobby: merged }, [{ id: clientId, created_at: createdAt }]);
    expect(hits.lobby[2].sendStatus).toBeUndefined();
  });
});
