/** Parent-side sessionStorage keys for CodyChat native guest embed login. */

export const CODY_GUEST_DETAILS_KEY = "yaarzo:codychat:guest-details";
export const CODY_GUEST_LOGIN_DISPATCHED_KEY = "yaarzo:codychat:guest-login-dispatched";
export const CODY_GUEST_LOGIN_COMPLETE_KEY = "yaarzo:codychat:guest-login-complete";

export type CodyGuestGender = "male" | "female" | "other";

export interface CodyGuestDetails {
  name: string;
  gender: CodyGuestGender;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readCodyGuestDetails(): CodyGuestDetails | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(CODY_GUEST_DETAILS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string; gender?: CodyGuestGender };
    const name = String(parsed?.name ?? "").trim();
    const gender = parsed?.gender;
    if (name.length < 2 || !gender) return null;
    if (gender !== "male" && gender !== "female" && gender !== "other") return null;
    return { name, gender };
  } catch {
    return null;
  }
}

export function writeCodyGuestDetails(details: CodyGuestDetails): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(CODY_GUEST_DETAILS_KEY, JSON.stringify(details));
  } catch {
    /* ignore */
  }
}

/** New Continue as Guest: fresh details and cleared stale dispatch/complete flags. */
export function beginCodyGuestLoginAttempt(details: CodyGuestDetails): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_DISPATCHED_KEY);
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_COMPLETE_KEY);
    window.sessionStorage.setItem(CODY_GUEST_DETAILS_KEY, JSON.stringify(details));
  } catch {
    /* ignore */
  }
}

export function isCodyGuestLoginDispatched(): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.sessionStorage.getItem(CODY_GUEST_LOGIN_DISPATCHED_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCodyGuestLoginComplete(): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.sessionStorage.getItem(CODY_GUEST_LOGIN_COMPLETE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Mark that the parent has posted YAARZO_CODY_GUEST_LOGIN (login not confirmed yet). */
export function markCodyGuestLoginDispatched(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(CODY_GUEST_LOGIN_DISPATCHED_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Clear in-flight dispatch without completing login (e.g. iframe login failed). */
export function clearCodyGuestLoginDispatched(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_DISPATCHED_KEY);
  } catch {
    /* ignore */
  }
}

/** Called when the Cody iframe confirms guest login + chat readiness. */
export function completeCodyGuestLogin(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(CODY_GUEST_DETAILS_KEY);
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_DISPATCHED_KEY);
    window.sessionStorage.setItem(CODY_GUEST_LOGIN_COMPLETE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearCodyGuestLoginSession(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(CODY_GUEST_DETAILS_KEY);
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_DISPATCHED_KEY);
    window.sessionStorage.removeItem(CODY_GUEST_LOGIN_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

/** True when parent should post guest login to the Cody iframe. */
export function shouldDispatchCodyGuestLogin(): boolean {
  if (isCodyGuestLoginComplete()) return false;
  return readCodyGuestDetails() !== null;
}
