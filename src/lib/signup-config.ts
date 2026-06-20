/**
 * Sign-up access config. Stored under `app_settings.signup_access`.
 * Lets admins stop new account creation and/or guest logins without code changes.
 */
export interface SignupAccessConfig {
  /** When false, the "Create account" entry is hidden and signup() throws. */
  signupEnabled: boolean;
  /** When false, guest / anonymous logins are blocked even if guest_access.enabled. */
  guestEnabled: boolean;
  /** Optional message shown to users when an option is disabled. */
  disabledMessage: string;
}

export const SIGNUP_ACCESS_DEFAULTS: SignupAccessConfig = {
  signupEnabled: true,
  guestEnabled: true,
  disabledMessage: "New sign-ups are temporarily disabled. Please check back later.",
};
