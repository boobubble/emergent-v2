import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveLoginEmail, deleteGuestAccount } from "@/lib/auth.functions";
import { lovable } from "@/integrations/lovable/index";
import type { Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isGuest: boolean;
}

interface Ctx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, gender: "male" | "female" | "other") => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUsername: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

async function fetchUsername(userId: string, fallbackEmail?: string): Promise<string> {
  // Poll briefly since the trigger inserts the row asynchronously after signup.
  for (let i = 0; i < 8; i++) {
    const { data } = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle();
    if (data?.username) return data.username;
    await new Promise(r => setTimeout(r, 200));
  }
  return fallbackEmail?.split("@")[0] || "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate(session: Session | null) {
      if (!session?.user) {
        if (!cancelled) setUser(null);
        return;
      }
      const isGuest = Boolean((session.user as { is_anonymous?: boolean }).is_anonymous);
      const username = await fetchUsername(session.user.id, session.user.email ?? undefined);
      if (cancelled) return;
      setUser({ id: session.user.id, email: session.user.email ?? "", username, isGuest });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session);
    });
    supabase.auth.getSession().then(({ data }) => {
      void hydrate(data.session).finally(() => { if (!cancelled) setReady(true); });
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  // Flush guest accounts when the tab closes / page hides.
  useEffect(() => {
    if (!user?.isGuest) return;
    const onExit = () => {
      supabase.auth.getSession().then(({ data }) => {
        const token = data.session?.access_token;
        if (!token) return;
        const body = new Blob([JSON.stringify({ access_token: token })], { type: "application/json" });
        try {
          if (navigator.sendBeacon) navigator.sendBeacon("/api/public/guest-cleanup", body);
          else fetch("/api/public/guest-cleanup", { method: "POST", body, keepalive: true });
        } catch { /* noop */ }
      });
    };
    window.addEventListener("pagehide", onExit);
    return () => window.removeEventListener("pagehide", onExit);
  }, [user?.isGuest]);


  const login = useCallback(async (identifier: string, password: string) => {
    const id = identifier.trim();
    let email = id;
    if (!id.includes("@")) {
      const res = await resolveLoginEmail({ data: { identifier: id } });
      email = res.email;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string, gender: "male" | "female" | "other") => {
    email = email.trim();
    username = username.trim();
    const letterCount = username.replace(/[^a-zA-Z]/g, "").length;
    if (letterCount < 2 || letterCount > 10) throw new Error("Username must contain 2 to 10 letters.");
    if (password.length < 6) throw new Error("Password must be 6+ characters");
    if (!["male", "female", "other"].includes(gender)) throw new Error("Please select a gender");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username, gender },
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) throw new Error(result.error.message || "Google sign-in failed");
  }, []);

  const loginAsGuest = useCallback(async (username?: string) => {
    const cleaned = (username ?? "").trim();
    const letterCount = cleaned.replace(/[^a-zA-Z]/g, "").length;
    if (cleaned && (letterCount < 2 || letterCount > 10)) {
      throw new Error("Guest name must contain 2 to 10 letters.");
    }
    const meta = cleaned ? { username: cleaned, gender: "other" } : undefined;
    const { error } = await supabase.auth.signInAnonymously(meta ? { options: { data: meta } } : undefined);
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    const wasGuest = user?.isGuest === true;
    if (wasGuest) {
      try { await deleteGuestAccount(); } catch (e) { console.error("Guest cleanup failed", e); }
    }
    await supabase.auth.signOut();
    setUser(null);
  }, [user?.isGuest]);

  const refreshUsername = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (!u) return;
    const { data: prof } = await supabase.from("profiles").select("username").eq("id", u.id).maybeSingle();
    const next = prof?.username;
    if (!next) return;
    setUser(prev => prev ? { ...prev, username: next } : prev);
  }, []);

  const value = useMemo<Ctx>(() => ({ user, ready, login, signup, loginWithGoogle, loginAsGuest, logout, refreshUsername }), [user, ready, login, signup, loginWithGoogle, loginAsGuest, logout, refreshUsername]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
