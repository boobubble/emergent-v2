import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { postgresChangesFilter } from "@supabase/realtime-js";
import { YAARZO_GLOBAL_ROOM_ID } from "@/lib/auth-entry";
import { GAMES_CHANNEL_ID } from "@/lib/chat-bot-channels";

/** Registered-user DM rows: dm:{uuid}:{uuid} — one bounded listener for all conversations. */
export const DM_MESSAGES_INSERT_FILTER = "channel_id=like.dm:%";

export type MessageInsertBinding = {
  id: string;
  filter: string;
};

export function channelIdEqFilter(channelId: string): string {
  return postgresChangesFilter().eq("channel_id", channelId).build();
}

export type BuildFilteredBindingsOpts = {
  authUserId: string | null;
  activeChannel: string;
  isRemoteChannel: (channelId: string, meId: string | null) => boolean;
  /** Active platform registry slugs; defaults to Global + Games when omitted. */
  platformChannelSlugs?: string[];
};

/**
 * Bounded INSERT bindings for authenticated chat:
 * - yaarzo-global (always)
 * - games (always)
 * - active public/community remote channel (when not global/games/dm)
 * - all registered DMs via prefix (background inbox + mini-DMs)
 *
 * Guests receive yaarzo-global only.
 */
export function buildFilteredMessageInsertBindings(
  opts: BuildFilteredBindingsOpts,
): MessageInsertBinding[] {
  const { authUserId, activeChannel, isRemoteChannel, platformChannelSlugs } = opts;
  const registrySlugs =
    platformChannelSlugs?.length
      ? platformChannelSlugs
      : [YAARZO_GLOBAL_ROOM_ID, GAMES_CHANNEL_ID];
  const registrySlugSet = new Set(registrySlugs);

  if (!authUserId) {
    return [{ id: "public-global", filter: channelIdEqFilter(YAARZO_GLOBAL_ROOM_ID) }];
  }

  const bindings: MessageInsertBinding[] = [];
  for (const slug of registrySlugs) {
    bindings.push({ id: `public-${slug}`, filter: channelIdEqFilter(slug) });
  }
  bindings.push({ id: "dm-prefix", filter: DM_MESSAGES_INSERT_FILTER });

  const active = activeChannel.trim();
  if (
    active &&
    !active.startsWith("dm:") &&
    !registrySlugSet.has(active) &&
    isRemoteChannel(active, authUserId)
  ) {
    bindings.push({
      id: `public-active:${active}`,
      filter: channelIdEqFilter(active),
    });
  }

  return bindings;
}

type PostgresRowPayload<T> = {
  new: T;
  old: Partial<T> | null;
  eventType: string;
};

/** Realtime statuses that mean the filtered messages channel is unusable. */
export const FILTERED_MESSAGES_FAILURE_STATUSES = new Set([
  "CHANNEL_ERROR",
  "TIMED_OUT",
  "CLOSED",
]);

export type FilteredMessagesFallbackState = {
  cancelled: boolean;
  fallbackActivated: boolean;
};

/** Whether filtered mode should tear down and switch to legacy unfiltered messages. */
export function shouldActivateFilteredMessagesFallback(
  status: string,
  state: FilteredMessagesFallbackState,
): boolean {
  if (state.cancelled || state.fallbackActivated) return false;
  if (status === "SUBSCRIBED") return false;
  return FILTERED_MESSAGES_FAILURE_STATUSES.has(status);
}

export function subscribeLegacyMessagesRealtime<TRow extends Record<string, unknown>>(
  supabase: SupabaseClient,
  opts: {
    channelName: string;
    onInsert: (payload: PostgresRowPayload<TRow>) => void;
    onDelete: (payload: PostgresRowPayload<TRow>) => void;
    onStatus?: (status: string) => void;
  },
): RealtimeChannel {
  return supabase
    .channel(opts.channelName)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, opts.onInsert)
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, opts.onDelete)
    .subscribe((status) => opts.onStatus?.(status));
}

export function subscribeFilteredMessagesRealtime<TRow extends Record<string, unknown>>(
  supabase: SupabaseClient,
  opts: {
    channelName: string;
    insertBindings: readonly MessageInsertBinding[];
    onInsert: (payload: PostgresRowPayload<TRow>) => void;
    onDelete: (payload: PostgresRowPayload<TRow>) => void;
    onStatus?: (status: string) => void;
  },
): RealtimeChannel {
  let channel = supabase.channel(opts.channelName);

  for (const binding of opts.insertBindings) {
    channel = channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: binding.filter,
      },
      opts.onInsert,
    );
  }

  // DELETE payloads carry PK only; keep unfiltered so moderation clears propagate.
  channel = channel.on(
    "postgres_changes",
    { event: "DELETE", schema: "public", table: "messages" },
    opts.onDelete,
  );

  channel.subscribe((status) => opts.onStatus?.(status));
  return channel;
}
