/** Slow getSession — show recovery UI; do not treat as signed-out. */
export const SESSION_HYDRATION_FALLBACK_MS = 15_000;

export type AuthHydrationUiState = {
  ready: boolean;
  hydrationSlow: boolean;
  hydrationError: string | null;
};

type GuestLikeUser = { isGuest?: boolean } | null | undefined;

/** True only when hydration finished and there is no signed-in user. */
export function isConfirmedSignedOut(state: AuthHydrationUiState, user: GuestLikeUser): boolean {
  if (!state.ready || state.hydrationSlow || state.hydrationError) return false;
  return !user || Boolean(user.isGuest);
}

/** Guest redirect / SSO must not run while restoration is pending or stuck. */
export function shouldChatroomProceedAsGuest(state: AuthHydrationUiState, user: GuestLikeUser): boolean {
  return isConfirmedSignedOut(state, user);
}

export function shouldShowAuthHydrationRecovery(state: AuthHydrationUiState): boolean {
  return Boolean(state.hydrationSlow || state.hydrationError);
}

export function shouldBlockAuthGateRedirect(state: AuthHydrationUiState): boolean {
  return !state.ready || shouldShowAuthHydrationRecovery(state);
}

export function createSessionHydrationController(initial?: Partial<AuthHydrationUiState>) {
  const state: AuthHydrationUiState = {
    ready: false,
    hydrationSlow: false,
    hydrationError: null,
    ...initial,
  };

  return {
    getState: (): AuthHydrationUiState => ({ ...state }),
    onTimeoutWhilePending() {
      if (state.ready) return;
      state.hydrationSlow = true;
    },
    onGetSessionSuccess() {
      state.ready = true;
      state.hydrationSlow = false;
      state.hydrationError = null;
    },
    onGetSessionError(message: string) {
      state.hydrationError = message || "Could not restore your session.";
    },
    resetForRetry() {
      state.ready = false;
      state.hydrationSlow = false;
      state.hydrationError = null;
    },
  };
}

/** Apply SSO URL only when the effect generation is still active. */
export function applySsoResult<T>(cancelled: boolean, apply: () => T): T | undefined {
  if (cancelled) return undefined;
  return apply();
}
