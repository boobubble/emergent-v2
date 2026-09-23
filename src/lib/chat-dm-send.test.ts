import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDmChannel } from "./dm-utils";
import {
  appendPlannedRemoteUserMessage,
  applyAuthenticatedInsertOutcome,
  settleAuthenticatedInsert,
} from "./chat-optimistic";
import type { Message } from "./chat-types";

const testDir = dirname(fileURLToPath(import.meta.url));

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const CHANNEL = buildDmChannel(ME, PEER)!;
const FIXED_ID = "11111111-1111-4111-8111-111111111111";

const loadBrowserSupabase = vi.fn();
const insertMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/load-browser", () => ({
  loadBrowserSupabase,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

function sending(id: string): Record<string, Message[]> {
  return {
    [CHANNEL]: [
      {
        id,
        channelId: CHANNEL,
        authorId: "me",
        text: "hello",
        ts: 1,
        sendStatus: "sending",
      },
    ],
  };
}

describe("registered-user DM send settlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadBrowserSupabase.mockResolvedValue({});
    selectMock.mockResolvedValue({
      data: [{ id: FIXED_ID, created_at: "2026-09-04T12:00:00.000Z" }],
      error: null,
    });
    insertMock.mockReturnValue({ select: selectMock });
    fromMock.mockReturnValue({ insert: insertMock });
  });

  it(
    "commitAuthenticatedRemoteSend reaches messages INSERT and confirms optimistic row",
    async () => {
      const { commitAuthenticatedRemoteSend } = await import("./chat-store");

      const outcome = await commitAuthenticatedRemoteSend(
        [
          {
            id: FIXED_ID,
            channelId: CHANNEL,
            text: "hello",
            kind: "text",
            attachment: null,
            replyToId: null,
          },
        ],
        ME,
      );

      expect(loadBrowserSupabase).toHaveBeenCalledOnce();
      expect(fromMock).toHaveBeenCalledWith("messages");
      expect(insertMock).toHaveBeenCalledOnce();
      expect(outcome.action).toBe("confirm");

      const next = applyAuthenticatedInsertOutcome(sending(FIXED_ID), [FIXED_ID], outcome);
      expect(next[CHANNEL][0].sendStatus).toBeUndefined();
      expect(next[CHANNEL][0].sendError).toBeUndefined();
    },
    20_000,
  );

  it("send pipeline pre-plans UUID outside React updater and uses it for settlement", () => {
    const storeSrc = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    const optimisticSrc = readFileSync(resolve(testDir, "chat-optimistic.ts"), "utf8");
    expect(storeSrc).toContain("planRemoteUserOutgoing");
    expect(storeSrc).toContain("appendPlannedRemoteUserMessage");
    expect(storeSrc).toContain("plannedUserOutgoing");
    expect(storeSrc).toContain("remoteUserMsgCommitted");
    expect(storeSrc).toContain("await loadBrowserSupabase()");
    expect(storeSrc).not.toMatch(/outgoingRemotes = outgoing/);
    expect(optimisticSrc).toContain("appendPlannedRemoteUserMessage");
    expect(optimisticSrc).toMatch(/sendStatus:\s*"sending"/);
  });

  it("double reducer-style invocation keeps one UUID through confirm", () => {
    const planned = {
      id: FIXED_ID,
      channelId: CHANNEL,
      text: "hello",
      kind: "text",
      attachment: null,
      replyToId: null,
    };

    const initialMessages: Record<string, Message[]> = { [CHANNEL]: [] };

    const first = appendPlannedRemoteUserMessage(initialMessages, planned, {});
    const second = appendPlannedRemoteUserMessage(initialMessages, planned, {});
    const chained = appendPlannedRemoteUserMessage(first.messages, planned, {});

    expect(first.messages[CHANNEL]).toHaveLength(1);
    expect(second.messages[CHANNEL]).toHaveLength(1);
    expect(chained.messages[CHANNEL]).toHaveLength(1);
    expect(first.messages[CHANNEL][0].id).toBe(FIXED_ID);
    expect(second.messages[CHANNEL][0].id).toBe(FIXED_ID);
    expect(first.messages[CHANNEL][0].id).toBe(planned.id);
    expect(first.appended).toBe(true);
    expect(second.appended).toBe(true);
    expect(chained.appended).toBe(true);

    const insertOutcome = settleAuthenticatedInsert(null, [
      { id: FIXED_ID, created_at: "2026-09-04T12:00:00.000Z" },
    ]);
    expect(insertOutcome.action).toBe("confirm");

    const confirmed = applyAuthenticatedInsertOutcome(first.messages, [FIXED_ID], insertOutcome);
    expect(confirmed[CHANNEL][0].id).toBe(FIXED_ID);
    expect(confirmed[CHANNEL][0].sendStatus).toBeUndefined();
    expect(confirmed[CHANNEL].filter((m) => m.id === FIXED_ID)).toHaveLength(1);
  });
});
