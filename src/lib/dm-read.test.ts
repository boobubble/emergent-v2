import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildDmChannel } from "@/lib/dm-utils";

const ME = "550e8400-e29b-41d4-a716-446655440000";
const PEER = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const CHANNEL = buildDmChannel(ME, PEER)!;

type EqCall = [string, unknown];

function createNotificationsChain() {
  const eqCalls: EqCall[] = [];
  const chain: {
    eq: (col: string, val: unknown) => typeof chain;
    select: (cols: string) => Promise<{ data: unknown[]; error: null }>;
  } = {
    eq(col: string, val: unknown) {
      eqCalls.push([col, val]);
      return chain;
    },
    select() {
      return Promise.resolve({ data: [], error: null });
    },
  };
  return { chain, eqCalls };
}

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

describe("markDmConversationRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "dm_reads") {
        return { upsert: upsertMock };
      }
      if (table === "notifications") {
        const { chain, eqCalls } = createNotificationsChain();
        return {
          update: vi.fn().mockReturnValue(chain),
          __eqCalls: eqCalls,
        };
      }
      throw new Error(`unexpected table ${table}`);
    });
  });

  it("returns null for invalid user/channel before any DB write", async () => {
    const { markDmConversationRead } = await import("./dm-read");
    expect(await markDmConversationRead("me", CHANNEL)).toBeNull();
    expect(await markDmConversationRead(ME, "dm:bot-gamebot")).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("never sends a dm channel id to notifications.user_id or notifications.target_id", async () => {
    const { markDmConversationRead } = await import("./dm-read");
    await markDmConversationRead(ME, CHANNEL, { skipNotificationDispatch: true });

    const notif = fromMock.mock.results.find((r) => r.value?.__eqCalls)?.value as
      | { __eqCalls: EqCall[] }
      | undefined;
    expect(notif?.__eqCalls).toBeDefined();
    const eqCalls = notif!.__eqCalls;

    expect(eqCalls.some(([col, val]) => col === "user_id" && val === CHANNEL)).toBe(false);
    expect(eqCalls.some(([col, val]) => col === "target_id" && val === CHANNEL)).toBe(false);
    expect(eqCalls.some(([col, val]) => col === "target_id")).toBe(false);
    expect(eqCalls).toContainEqual(["user_id", ME]);
    expect(eqCalls).toContainEqual(["target_type", "dm"]);
    expect(eqCalls).toContainEqual(["actor_id", PEER]);
  });
});
