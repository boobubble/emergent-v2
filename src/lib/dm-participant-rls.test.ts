import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extraRemoteDmChannelsToFetch } from "./mini-dm";

const testDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(testDir, "../..");

const MIGRATION = "supabase/migrations/20260904180000_dm_participant_channel_rls.sql";
const INSERT_SELECT_POLICY =
  "supabase/migrations/20260618145447_159f32bb-1d3b-4416-a93f-381197471b92.sql";
const PREVIOUS_HELPER =
  "supabase/migrations/20260527083812_87f7c614-f9a4-4e7e-a17a-d6ac1f188bfd.sql";

const A = "41af93bf-d960-44db-820d-1a50d681f6d2";
const B = "4cb27a54-5de8-482d-8750-58f19f73a275";
const C = "550e8400-e29b-41d4-a716-446655440000";
const AB = `dm:${[A, B].sort().join(":")}`;
const BC = `dm:${[B, C].sort().join(":")}`;

/**
 * Mirrors live public.is_dm_channel_allowed after this migration:
 * regex + encoded participant, no friendship lookup.
 */
function isDmChannelAllowed(channel: string, user: string): boolean {
  if (!/^dm:[0-9a-f-]{36}:[0-9a-f-]{36}$/.test(channel)) return false;
  const a = channel.slice(3, 39);
  const b = channel.slice(40, 76);
  if (a === user) return b !== user;
  if (b === user) return a !== user;
  return false;
}

/** Mirrors messages INSERT WITH CHECK (policy SQL unchanged). */
function canInsertMessage(opts: {
  uid: string;
  authorId: string;
  banned: boolean;
  muted: boolean;
  channelId: string;
  trioMember?: boolean;
}): boolean {
  if (opts.uid !== opts.authorId) return false;
  if (opts.banned) return false;
  if (opts.muted) return false;
  if (opts.channelId === "lobby" || opts.channelId === "games") return true;
  if (opts.channelId.startsWith("dm:")) return isDmChannelAllowed(opts.channelId, opts.uid);
  if (opts.channelId.startsWith("trio:")) return opts.trioMember === true;
  return false;
}

/** Mirrors messages SELECT USING for authenticated users (policy SQL unchanged). */
function canSelectMessage(opts: {
  uid: string;
  banned: boolean;
  channelId: string;
  trioMember?: boolean;
}): boolean {
  if (opts.banned) return false;
  if (opts.channelId === "lobby" || opts.channelId === "games") return true;
  if (opts.channelId.startsWith("dm:")) return isDmChannelAllowed(opts.channelId, opts.uid);
  if (opts.channelId.startsWith("trio:")) return opts.trioMember === true;
  return false;
}

describe("DM participant RLS migration", () => {
  const sql = readFileSync(resolve(root, MIGRATION), "utf8");
  const policySql = readFileSync(resolve(root, INSERT_SELECT_POLICY), "utf8");
  const oldHelper = readFileSync(resolve(root, PREVIOUS_HELPER), "utf8");

  it("replaces only is_dm_channel_allowed and does not drop messages policies", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.is_dm_channel_allowed");
    const fnBody = sql.slice(sql.indexOf("AS $function$"), sql.indexOf("$function$;"));
    expect(fnBody).not.toMatch(/has_friendship/);
    expect(fnBody).toContain("RETURN true");
    expect(sql).not.toMatch(/DROP POLICY/i);
    expect(sql).not.toMatch(/CREATE POLICY/i);
    expect(sql).not.toContain("channel_id = 'lobby'");
    expect(sql).not.toContain("channel_id = 'games'");
    expect(sql).not.toContain("is_trio_channel_allowed");
  });

  it("keeps INSERT author_id, ban, mute, and channel-type branches on the existing policy", () => {
    expect(policySql).toContain("Send as self to lobby games friend DMs or trio");
    expect(policySql).toContain("Read lobby games friend DMs or trio");
    expect(policySql).toContain("auth.uid() = author_id");
    expect(policySql).toContain("is_user_banned");
    expect(policySql).toContain("is_user_muted");
    expect(policySql).toContain("channel_id = 'lobby'");
    expect(policySql).toContain("channel_id = 'games'");
    expect(policySql).toContain("is_trio_channel_allowed");
    expect(policySql).toContain("is_dm_channel_allowed");
  });

  it("documents that the previous helper required accepted friendship", () => {
    expect(oldHelper).toContain("RETURN public.has_friendship(_user, other)");
  });
});

describe("is_dm_channel_allowed participant matrix", () => {
  it("allows accepted-friend, pending-friend, and non-friend participants", () => {
    expect(isDmChannelAllowed(AB, A)).toBe(true);
    expect(isDmChannelAllowed(AB, B)).toBe(true);
  });

  it("rejects a third user on someone else's DM", () => {
    expect(isDmChannelAllowed(BC, A)).toBe(false);
    expect(isDmChannelAllowed(AB, C)).toBe(false);
  });

  it("rejects malformed, self, lobby, games, and trio channel ids", () => {
    expect(isDmChannelAllowed("lobby", A)).toBe(false);
    expect(isDmChannelAllowed("games", A)).toBe(false);
    expect(isDmChannelAllowed(`trio:${A}`, A)).toBe(false);
    expect(isDmChannelAllowed(`dm:${A}`, A)).toBe(false);
    expect(isDmChannelAllowed(`dm:${A}:${A}`, A)).toBe(false);
    expect(isDmChannelAllowed(`dm:me:${B}`, A)).toBe(false);
  });
});

describe("messages INSERT WITH CHECK (unchanged policy + new helper)", () => {
  const base = { uid: A, authorId: A, banned: false, muted: false };

  it("lets participants insert regardless of friendship", () => {
    expect(canInsertMessage({ ...base, channelId: AB })).toBe(true);
    expect(canInsertMessage({ ...base, uid: B, authorId: B, channelId: AB })).toBe(true);
  });

  it("rejects insert into another pair's DM", () => {
    expect(canInsertMessage({ ...base, channelId: BC })).toBe(false);
  });

  it("rejects author_id spoofing even on own DM", () => {
    expect(canInsertMessage({ ...base, authorId: B, channelId: AB })).toBe(false);
  });

  it("preserves banned and muted restrictions", () => {
    expect(canInsertMessage({ ...base, banned: true, channelId: AB })).toBe(false);
    expect(canInsertMessage({ ...base, muted: true, channelId: AB })).toBe(false);
    expect(canInsertMessage({ ...base, banned: true, channelId: "lobby" })).toBe(false);
    expect(canInsertMessage({ ...base, muted: true, channelId: "lobby" })).toBe(false);
  });

  it("leaves lobby, games, and trio branches unchanged", () => {
    expect(canInsertMessage({ ...base, channelId: "lobby" })).toBe(true);
    expect(canInsertMessage({ ...base, channelId: "games" })).toBe(true);
    expect(canInsertMessage({ ...base, channelId: `trio:${A}`, trioMember: true })).toBe(true);
    expect(canInsertMessage({ ...base, channelId: `trio:${A}`, trioMember: false })).toBe(false);
  });
});

describe("messages SELECT USING (unchanged policy + new helper)", () => {
  it("lets only the two participants read a DM", () => {
    expect(canSelectMessage({ uid: A, banned: false, channelId: AB })).toBe(true);
    expect(canSelectMessage({ uid: B, banned: false, channelId: AB })).toBe(true);
    expect(canSelectMessage({ uid: C, banned: false, channelId: AB })).toBe(false);
    expect(canSelectMessage({ uid: A, banned: false, channelId: BC })).toBe(false);
  });

  it("still allows lobby/games reads and still blocks banned users", () => {
    expect(canSelectMessage({ uid: A, banned: false, channelId: "lobby" })).toBe(true);
    expect(canSelectMessage({ uid: A, banned: false, channelId: "games" })).toBe(true);
    expect(canSelectMessage({ uid: A, banned: true, channelId: "lobby" })).toBe(false);
    expect(canSelectMessage({ uid: A, banned: true, channelId: AB })).toBe(false);
  });
});

describe("lobby messages do not become DM messages", () => {
  const store = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
  const list = readFileSync(resolve(testDir, "../components/chat/MessageList.tsx"), "utf8");
  const mini = readFileSync(resolve(testDir, "mini-dm.ts"), "utf8");

  it("history fetch is per channel_id equality, not a lobby dump into the DM bucket", () => {
    expect(store).toContain('.eq("channel_id", ch)');
    expect(store).toContain("messages: { ...s.messages, [ch]: merged }");
  });

  it("realtime INSERT buckets by the row channel_id, not the active DM", () => {
    expect(store).toContain('[msg.channelId]: [...existing, msg]');
    expect(store).toContain("const msg = rowToMessage(row, authUserId)");
    expect(store).toContain("channelId: row.channel_id");
  });

  it("MessageList reads only that channel and does not merge guest lobby into DMs", () => {
    expect(list).toContain("channelMessages(channelId)");
    expect(list).toContain("useGuestLobbyFeed(channelId === GUEST_LOBBY_CHANNEL_ID)");
    expect(list).toContain("if (channelId !== GUEST_LOBBY_CHANNEL_ID) return baseMsgs");
  });

  it("watched mini-DMs never include lobby", () => {
    expect(mini).toContain("isRemoteDmChannel(ch, authUserId)");
    expect(extraRemoteDmChannelsToFetch(A, ["lobby", AB, "games"])).toEqual([AB]);
  });
});
