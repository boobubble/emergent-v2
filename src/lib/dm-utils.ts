/**
 * Direct-message identity helpers.
 * Supabase UUID columns must only receive real auth/profile UUIDs — never UI ids
 * like "me", "bot-gamebot", or malformed channel strings.
 */

export const CHAT_STORAGE_VERSION = 4;
export const CHAT_STORAGE_KEY_BASE = `palrgo:state:v${CHAT_STORAGE_VERSION}`;
export const CHAT_SYNC_CHANNEL = `palrgo:sync:v${CHAT_STORAGE_VERSION}`;
export const LEGACY_CHAT_STORAGE_KEYS = ["palrgo:state:v3", "palrgo:state:v2"] as const;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isLocalBotPeerId(id: string): boolean {
  return id.startsWith("bot-");
}

export function isBotUiId(id: string): boolean {
  return id === "me" || isLocalBotPeerId(id);
}

/** Local-only bot DM channels (never synced to Supabase). */
export function isLocalBotDmChannel(channelId: string): boolean {
  if (!channelId.startsWith("dm:")) return false;
  const rest = channelId.slice(3);
  if (rest.includes(":")) return false;
  return rest.startsWith("bot-") || isBotUiId(rest);
}

/** Valid remote user DM: dm:{uuid}:{uuid} */
export function isValidUserDmChannel(channelId: string): boolean {
  if (!channelId.startsWith("dm:")) return false;
  const parts = channelId.slice(3).split(":");
  if (parts.length !== 2) return false;
  return isUuid(parts[0]) && isUuid(parts[1]);
}

/** Remote DM channel that includes the signed-in auth user. */
export function isRemoteDmChannel(channelId: string, authUserId: string | null | undefined): boolean {
  if (!authUserId || !isUuid(authUserId) || !isValidUserDmChannel(channelId)) return false;
  const parts = channelId.slice(3).split(":");
  return parts[0] === authUserId || parts[1] === authUserId;
}

export function buildDmChannel(currentUserId: string, targetUserId: string): string | null {
  if (!isUuid(currentUserId) || !isUuid(targetUserId)) return null;
  if (currentUserId === targetUserId) return null;
  const participantIds = [currentUserId, targetUserId].sort();
  return `dm:${participantIds[0]}:${participantIds[1]}`;
}

export function localBotDmChannel(botId: string): string {
  return `dm:${botId}`;
}

/**
 * Build a DM channel id for UI/store use.
 * - Bot peers → local-only channel (no Supabase).
 * - Real users → two-participant UUID channel, or null when invalid.
 */
export function dmChannelFor(meId: string | null, peerId: string): string | null {
  if (peerId === "me") return null;
  if (isLocalBotPeerId(peerId)) return localBotDmChannel(peerId);
  if (!meId || !isUuid(meId) || !isUuid(peerId)) return null;
  return buildDmChannel(meId, peerId);
}

export function parseDmChannel(
  channelId: string,
  authUserId?: string | null,
): { peerId: string | null; valid: boolean } {
  if (isLocalBotDmChannel(channelId)) {
    return { peerId: channelId.slice(3), valid: true };
  }
  if (!isValidUserDmChannel(channelId)) {
    return { peerId: null, valid: false };
  }
  const parts = channelId.slice(3).split(":");
  if (authUserId && isUuid(authUserId)) {
    const peer = parts[0] === authUserId ? parts[1] : parts[1] === authUserId ? parts[0] : null;
    return { peerId: peer, valid: !!peer };
  }
  return { peerId: parts[0], valid: true };
}

export function fixLegacyDmChannel(channelId: string, authUserId: string | null): string | null {
  if (!channelId.startsWith("dm:") || !authUserId || !isUuid(authUserId)) return null;
  const parts = channelId.slice(3).split(":");
  if (parts.length === 2) {
    if (parts[0] === "me" && isUuid(parts[1])) return buildDmChannel(authUserId, parts[1]);
    if (parts[1] === "me" && isUuid(parts[0])) return buildDmChannel(authUserId, parts[0]);
  }
  if (parts.length === 1 && isUuid(parts[0]) && parts[0] !== authUserId) {
    return buildDmChannel(authUserId, parts[0]);
  }
  return null;
}

export function sanitizeDmOrder(dmOrder: string[] | undefined, authUserId: string | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of dmOrder ?? []) {
    if (id === "me") continue;
    if (isUuid(id)) {
      if (authUserId && id === authUserId) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      continue;
    }
    if (isBotUiId(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function sanitizeActiveChannel(
  activeChannel: string,
  authUserId: string | null,
  roomOrder: string[],
  rooms: Record<string, unknown>,
): string {
  if (activeChannel === "lobby" || activeChannel === "games") return activeChannel;
  if (rooms[activeChannel]) return activeChannel;
  if (isLocalBotDmChannel(activeChannel)) return activeChannel;
  if (isRemoteDmChannel(activeChannel, authUserId)) return activeChannel;
  const fixed = fixLegacyDmChannel(activeChannel, authUserId);
  if (fixed && isRemoteDmChannel(fixed, authUserId)) return fixed;
  return roomOrder[0] || "lobby";
}

export interface SanitizeChatSlice {
  activeChannel: string;
  dmOrder: string[];
  roomOrder: string[];
  rooms: Record<string, unknown>;
}

export function sanitizeChatState<T extends SanitizeChatSlice>(state: T, authUserId: string | null): T {
  const dmOrder = sanitizeDmOrder(state.dmOrder, authUserId);
  const activeChannel = sanitizeActiveChannel(
    state.activeChannel,
    authUserId,
    state.roomOrder,
    state.rooms,
  );
  if (dmOrder === state.dmOrder && activeChannel === state.activeChannel) return state;
  return { ...state, dmOrder, activeChannel };
}

export function storageKeyForUsername(username: string): string {
  return `${CHAT_STORAGE_KEY_BASE}:${username.toLowerCase()}`;
}

export function showDmParticipantError(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("palrgo:toast", { detail: { message } }));
  if (import.meta.env.DEV) console.warn("[dm]", message);
}

/** Resolve a profile UUID safe for Supabase — never "me" or bot slugs. */
export function resolveDmTargetId(
  id: string | null | undefined,
  profiles?: Record<string, { id: string }>,
): string | null {
  if (!id || id === "me" || isBotUiId(id)) return null;
  if (isUuid(id)) return id;
  const fromProfiles = profiles?.[id]?.id;
  return isUuid(fromProfiles) ? fromProfiles : null;
}
