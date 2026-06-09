import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loginWithIdentifier, deleteGuestAccount } from "@/lib/auth.functions";
import { checkDeviceBan, recordDevice } from "@/lib/device.functions";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";

import type { Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isGuest: boolean;
}

interface SignupExtras {
  birthday?: string;        // yyyy-mm-dd
  hide_birth_year?: boolean;
  country_code?: string;    // ISO 3166-1 alpha-2
}

interface Ctx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, gender: "male" | "female" | "other", extras?: SignupExtras) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (username?: string, gender?: "male" | "female" | "other") => Promise<void>;
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

async function flushPendingAvatar(userId: string, email?: string) {
  if (!email) return;
  const key = `pending-avatar:${email.toLowerCase()}`;
  let dataUrl: string | null = null;
  try { dataUrl = sessionStorage.getItem(key); } catch { return; }
  if (!dataUrl) return;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "") || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("avatars").upload(path, blob, { contentType: blob.type, upsert: true });
    if (up.error) throw up.error;
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", userId);
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  } catch (e) {
    console.error("avatar upload failed", e);
  }
}

async function publishWelcomePost(userId: string, email?: string) {
  if (!email) return;
  const key = `pending-welcome:${email.toLowerCase()}`;
  let flag: string | null = null;
  try { flag = sessionStorage.getItem(key); } catch { return; }
  if (!flag) return;
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("username, gender, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (!prof) return;
    const pronoun = prof.gender === "male" ? "him" : prof.gender === "female" ? "her" : "them";
    const text = `👋 ${prof.username} just signed up! Start a chat with ${pronoun} in the chatroom.`;
    const media = prof.avatar_url ? [prof.avatar_url] : [];
    const { error } = await supabase.from("posts").insert({
      author_id: userId,
      owner_id: userId,
      kind: "text",
      text,
      slug: `welcome-${prof.username}`.toLowerCase(),
      media_urls: media,
      privacy: "public",
    });

    if (error) throw error;
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  } catch (e) {
    console.error("welcome post failed", e);
  }
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
      if (!isGuest) {
        const email = session.user.email ?? undefined;
        void flushPendingAvatar(session.user.id, email).then(() => publishWelcomePost(session.user.id, email));
      }
      // Hydrate sound preferences from this user's profile (best effort).
      void import("@/lib/sound-prefs").then((m) => m.hydrateSoundPrefsFromServer());
      // Record this device for ban-evasion tracking (best effort).
      void (async () => {
        try {
          const fp = await getDeviceFingerprint();
          if (fp) await recordDevice({ data: { fingerprint: fp, user_agent: navigator.userAgent.slice(0, 500) } });
        } catch (e) { console.warn("device record failed", e); }
      })();
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
    // Refuse login from a banned device.
    try {
      const fp = await getDeviceFingerprint();
      if (fp) {
        const check = await checkDeviceBan({ data: { fingerprint: fp } });
        if (check.banned) {
          throw new Error(check.reason
            ? `This device has been banned: ${check.reason}`
            : "This device has been banned from the platform.");
        }
      }
    } catch (e) { if (e instanceof Error && e.message.startsWith("This device")) throw e; }
    const res = await loginWithIdentifier({ data: { identifier: id, password } });
    const { error } = await supabase.auth.setSession({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string, gender: "male" | "female" | "other", extras?: SignupExtras) => {
    email = email.trim();
    username = username.trim();
    const letterCount = username.replace(/[^a-zA-Z]/g, "").length;
    if (letterCount < 2 || letterCount > 10) throw new Error("Username must contain 2 to 10 letters.");
    if (password.length < 4) throw new Error("Password must be at least 4 characters");
    if (!["male", "female", "other"].includes(gender)) throw new Error("Please select a gender");
    // Refuse signup from a banned device.
    try {
      const fp = await getDeviceFingerprint();
      if (fp) {
        const check = await checkDeviceBan({ data: { fingerprint: fp } });
        if (check.banned) {
          throw new Error(check.reason
            ? `This device has been banned: ${check.reason}`
            : "This device has been banned from the platform.");
        }
      }
    } catch (e) { if (e instanceof Error && e.message.startsWith("This device")) throw e; }
    const meta: Record<string, string | boolean> = { username, gender };
    if (extras?.birthday) meta.birthday = extras.birthday;
    if (extras?.hide_birth_year != null) meta.hide_birth_year = extras.hide_birth_year ? "true" : "false";
    if (extras?.country_code) meta.country_code = extras.country_code.toUpperCase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: meta,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message || "Google sign-in failed");
  }, []);

  const loginAsGuest = useCallback(async (username?: string, gender?: "male" | "female" | "other") => {
    const cleaned = (username ?? "").trim();
    const letterCount = cleaned.replace(/[^a-zA-Z]/g, "").length;
    if (cleaned && (letterCount < 2 || letterCount > 10)) {
      throw new Error("Guest name must contain 2 to 10 letters.");
    }
    const g: "male" | "female" | "other" = gender && ["male", "female", "other"].includes(gender) ? gender : "other";
    const meta: Record<string, string> = { gender: g };
    if (cleaned) meta.username = cleaned;
    const { error } = await supabase.auth.signInAnonymously({ options: { data: meta } });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    const wasGuest = user?.isGuest === true;
    // End any Ludo games this user is hosting so other players aren't stuck.
    try {
      const endFn = (window as unknown as { __lovableEndMyLudoGames?: () => Promise<void> }).__lovableEndMyLudoGames;
      if (typeof endFn === "function") await endFn();
    } catch (e) { console.error("end-ludo-on-logout failed", e); }
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
