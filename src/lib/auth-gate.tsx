import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-store";
import type { AuthPopup } from "@/components/auth/AuthDialogs";
import { GuestChatProvider, useGuestChat } from "@/lib/guest-chat-context";

const AuthDialogs = lazy(() =>
  import("@/components/auth/AuthDialogs").then((m) => ({ default: m.AuthDialogs })),
);

const GuestNicknameDialog = lazy(() =>
  import("@/components/chat/GuestNicknameDialog").then((m) => ({
    default: m.GuestNicknameDialog,
  })),
);

function GuestNicknameHost() {
  const { nicknameDialogOpen } = useGuestChat();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (nicknameDialogOpen) setMounted(true);
  }, [nicknameDialogOpen]);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <GuestNicknameDialog />
    </Suspense>
  );
}

/**
 * Generic authentication gate.
 *
 * Public pages remain fully accessible without any account (no guest, no
 * anonymous user, no auto-login). Individual write/interact actions call
 * `requireAuth(fn)` to either:
 *   - run `fn` immediately when the user is signed in, or
 *   - open the existing AuthScreen sign-in dialog and, after successful
 *     login, resume `fn` automatically on the same page (no reload, no
 *     navigation, scroll position preserved).
 *
 * Every future feature can simply do:
 *
 *     const { requireAuth } = useAuthGate();
 *     <Button onClick={() => requireAuth(() => doThing())}>Do thing</Button>
 *
 * without wiring its own modal, redirect, or session check.
 */

export interface AuthGateApi {
  /** True when a signed-in user is present. */
  isAuthenticated: boolean;
  /**
   * Run `action` if authenticated; otherwise open the sign-in dialog and
   * queue the action to run automatically after successful login.
   * Returns `true` when the action ran synchronously.
   *
   * `action` may be omitted to simply prompt the user to sign in.
   */
  requireAuth: (
    action?: () => void | Promise<void>,
    opts?: { mode?: "signin" | "signup" },
  ) => boolean;
  /** Open the sign-in dialog with no queued action. */
  openSignIn: () => void;
  /** Open the sign-up dialog with no queued action. */
  openSignUp: () => void;
}

const AuthGateContext = createContext<AuthGateApi | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const [popup, setPopup] = useState<AuthPopup>(null);
  const [dialogsReady, setDialogsReady] = useState(false);
  const pendingRef = useRef<null | (() => void | Promise<void>)>(null);
  const firedRef = useRef(false);

  const runPending = useCallback(() => {
    const fn = pendingRef.current;
    pendingRef.current = null;
    if (!fn || firedRef.current) return;
    firedRef.current = true;
    try {
      const result = fn();
      if (result && typeof (result as Promise<void>).then === "function") {
        (result as Promise<void>).finally(() => {
          firedRef.current = false;
        });
      } else {
        firedRef.current = false;
      }
    } catch {
      firedRef.current = false;
    }
  }, []);

  // When the user becomes authenticated with a pending action, close the
  // dialog and run the action.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (pendingRef.current) {
      setPopup(null);
      // Defer so any state updates from the auth transition settle first.
      const id = setTimeout(runPending, 0);
      return () => clearTimeout(id);
    }
  }, [isAuthenticated, runPending]);

  // Discard the pending action if the user closes the dialog without
  // completing sign-in.
  const handleSetPopup = useCallback((next: AuthPopup) => {
    setPopup((prev) => {
      if (prev && !next && !isAuthenticated) {
        pendingRef.current = null;
      }
      return next;
    });
  }, [isAuthenticated]);

  const requireAuth = useCallback<AuthGateApi["requireAuth"]>((action, opts) => {
    if (isAuthenticated) {
      if (action) {
        try {
          const result = action();
          if (result && typeof (result as Promise<void>).then === "function") {
            void (result as Promise<void>);
          }
        } catch {
          /* callers own their errors */
        }
      }
      return true;
    }
    pendingRef.current = action ?? null;
    setDialogsReady(true);
    setPopup(opts?.mode === "signup" ? "signup" : "signin");
    return false;
  }, [isAuthenticated]);

  const openSignIn = useCallback(() => {
    pendingRef.current = null;
    setDialogsReady(true);
    setPopup("signin");
  }, []);
  const openSignUp = useCallback(() => {
    pendingRef.current = null;
    setDialogsReady(true);
    setPopup("signup");
  }, []);

  const api = useMemo<AuthGateApi>(() => ({
    isAuthenticated,
    requireAuth,
    openSignIn,
    openSignUp,
  }), [isAuthenticated, requireAuth, openSignIn, openSignUp]);

  return (
    <AuthGateContext.Provider value={api}>
      <GuestChatProvider>
        {children}
        {dialogsReady ? (
          <Suspense fallback={null}>
            <AuthDialogs popup={popup} setPopup={handleSetPopup} />
          </Suspense>
        ) : null}
        <GuestNicknameHost />
      </GuestChatProvider>
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateApi {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    // Safe no-op fallback so components that mount outside the provider
    // (e.g. isolated tests) don't crash. Actions run as-is.
    return {
      isAuthenticated: false,
      requireAuth: (action) => { action?.(); return true; },
      openSignIn: () => {},
      openSignUp: () => {},
    };
  }
  return ctx;
}
