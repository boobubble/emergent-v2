import { isUuid } from "./dm-utils";

/** Registered Yaarzo profile (Supabase UUID) — not guest/IRC/bot/local ids. */
export function isRegisteredProfileUserId(userId: string): boolean {
  return isUuid(userId);
}

/** Whether the user menu should offer the full registered profile popup. */
export function canViewRegisteredProfile(userId: string): boolean {
  if (!userId || userId === "me") return false;
  if (userId.startsWith("visitor_")) return false;
  if (userId.startsWith("irc:")) return false;
  if (userId.startsWith("guest:")) return false;
  return isRegisteredProfileUserId(userId);
}

/** IRC PM / guest DM routing peer id for startDM(). */
export function resolveDmTargetUserId(
  userId: string,
  authUserId: string | null | undefined,
  guestVisitorId: string | null | undefined,
): string {
  if (userId === "me") return authUserId || guestVisitorId || userId;
  return userId;
}
