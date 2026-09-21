import {
  type AuthHydrationUiState,
  isConfirmedSignedOut,
} from "@/lib/auth-session-hydration";

type GuestLikeUser = { isGuest?: boolean } | null | undefined;

export type ChatroomGuestSearch = {
  guest?: string;
};

/** Explicit CodyChat native guest intent from `/chatroom?guest=1`. */
export function parseChatroomGuestIntent(search: ChatroomGuestSearch | Record<string, unknown>): boolean {
  const raw = "guest" in search ? search.guest : undefined;
  if (raw === "1" || raw === 1) return true;
  if (typeof raw === "string" && raw.toLowerCase() === "true") return true;
  return false;
}

export function shouldRequestChatroomHmacSso(
  state: AuthHydrationUiState,
  user: GuestLikeUser,
): boolean {
  if (!state.ready || state.hydrationSlow || state.hydrationError) return false;
  return Boolean(user && !user.isGuest);
}

/** Confirmed signed-out visit without guest intent — keep redirect-away behavior. */
export function shouldRedirectSignedOutFromChatroom(
  state: AuthHydrationUiState,
  user: GuestLikeUser,
  guestIntent: boolean,
): boolean {
  return isConfirmedSignedOut(state, user) && !guestIntent;
}

/** Confirmed signed-out with explicit guest intent — CodyChat native guest login iframe. */
export function shouldUseNativeCodyChatGuestEntry(
  state: AuthHydrationUiState,
  user: GuestLikeUser,
  guestIntent: boolean,
): boolean {
  return isConfirmedSignedOut(state, user) && guestIntent;
}

/** Pending/slow/error must never enter native guest mode. */
export function canEvaluateChatroomGuestEntry(state: AuthHydrationUiState): boolean {
  return state.ready && !state.hydrationSlow && !state.hydrationError;
}
