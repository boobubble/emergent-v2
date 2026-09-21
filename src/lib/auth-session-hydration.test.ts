import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SESSION_HYDRATION_FALLBACK_MS,
  applySsoResult,
  createSessionHydrationController,
  shouldChatroomProceedAsGuest,
  shouldShowAuthHydrationRecovery,
  isConfirmedSignedOut,
} from "./auth-session-hydration";

describe("session hydration controller — timeout vs confirmed session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not mark ready when the fallback window elapses while getSession is pending", () => {
    const ctrl = createSessionHydrationController();
    vi.advanceTimersByTime(SESSION_HYDRATION_FALLBACK_MS);
    ctrl.onTimeoutWhilePending();
    const state = ctrl.getState();
    expect(state.ready).toBe(false);
    expect(state.hydrationSlow).toBe(true);
    expect(shouldChatroomProceedAsGuest(state, null)).toBe(false);
  });

  it("allows a late valid session to proceed after a slow hydration window", () => {
    const ctrl = createSessionHydrationController();
    ctrl.onTimeoutWhilePending();
    expect(shouldShowAuthHydrationRecovery(ctrl.getState())).toBe(true);

    ctrl.onGetSessionSuccess();
    const state = ctrl.getState();
    expect(state.ready).toBe(true);
    expect(state.hydrationSlow).toBe(false);
    expect(shouldChatroomProceedAsGuest(state, { isGuest: false })).toBe(false);
  });

  it("treats a confirmed null session as signed-out only after successful getSession", () => {
    const ctrl = createSessionHydrationController();
    ctrl.onGetSessionSuccess();
    expect(isConfirmedSignedOut(ctrl.getState(), null)).toBe(true);
    expect(shouldChatroomProceedAsGuest(ctrl.getState(), null)).toBe(true);
  });

  it("surfaces hydration failure without marking ready or redirecting as guest", () => {
    const ctrl = createSessionHydrationController();
    ctrl.onGetSessionError("network down");
    const state = ctrl.getState();
    expect(state.ready).toBe(false);
    expect(state.hydrationError).toBe("network down");
    expect(shouldShowAuthHydrationRecovery(state)).toBe(true);
    expect(shouldChatroomProceedAsGuest(state, null)).toBe(false);
  });

  it("resetForRetry clears stuck/error flags for another hydration attempt", () => {
    const ctrl = createSessionHydrationController();
    ctrl.onGetSessionError("timeout");
    ctrl.resetForRetry();
    expect(ctrl.getState()).toEqual({
      ready: false,
      hydrationSlow: false,
      hydrationError: null,
    });
  });
});

describe("deferred getSession simulation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not redirect as guest until getSession settles when session takes over 15 seconds", async () => {
    const ctrl = createSessionHydrationController();
    let resolveGetSession!: (session: { id: string } | null) => void;
    const getSession = new Promise<{ id: string } | null>((resolve) => {
      resolveGetSession = resolve;
    });

    void getSession.then((session) => {
      if (session) ctrl.onGetSessionSuccess();
      else ctrl.onGetSessionSuccess();
    });

    vi.advanceTimersByTime(SESSION_HYDRATION_FALLBACK_MS);
    ctrl.onTimeoutWhilePending();
    expect(shouldChatroomProceedAsGuest(ctrl.getState(), null)).toBe(false);

    resolveGetSession({ id: "user-1" });
    await getSession;
    ctrl.onGetSessionSuccess();
    expect(shouldChatroomProceedAsGuest(ctrl.getState(), { isGuest: false })).toBe(false);
  });
});

describe("CodyChat SSO stale response guard", () => {
  it("ignores SSO apply after cancel (logout, user change, unmount)", () => {
    let chatUrl: string | null = "keep";
    let cancelled = false;
    applySsoResult(cancelled, () => {
      chatUrl = "https://chat.example/sso";
    });
    expect(chatUrl).toBe("https://chat.example/sso");

    cancelled = true;
    const result = applySsoResult(cancelled, () => {
      chatUrl = "stale";
      return chatUrl;
    });
    expect(result).toBeUndefined();
    expect(chatUrl).toBe("https://chat.example/sso");
  });
});
