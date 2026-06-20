import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";
import { useUsernameCheck, type UsernameStatus } from "@/lib/use-username-check";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GUEST_ACCESS_DEFAULTS, type GuestAccessConfig } from "@/lib/guest-config";
import { SIGNUP_ACCESS_DEFAULTS, type SignupAccessConfig } from "@/lib/signup-config";
import { FeedbackShowcase } from "@/components/feedback/FeedbackShowcase";
import { LiveCommunityBackground } from "@/components/auth/LiveCommunityBackground";
import { createDemoAccount } from "@/lib/demo-account.functions";

function UsernameHint({ status }: { status: UsernameStatus }) {
  if (status.state === "idle") return null;
  if (status.state === "checking") return <p className="mt-1 text-[10px] text-muted-foreground">Checking…</p>;
  if (status.state === "ok") return <p className="mt-1 text-[10px] font-semibold text-primary">✓ Available</p>;
  return <p className="mt-1 text-[10px] font-semibold text-destructive">{status.message}</p>;
}

export type AuthPopup = null | "signin" | "signup" | "guest" | "forgot";
type Popup = AuthPopup;

/**
 * Embeddable auth dialogs. Use from any page (e.g. the Welcome landing) to
 * provide sign in / sign up / forgot password / guest entry without sending
 * users to a separate /login page.
 */
export function AuthDialogs({
  popup,
  setPopup,
  guestEnabled = true,
  signupEnabled = true,
}: {
  popup: AuthPopup;
  setPopup: (p: AuthPopup) => void;
  guestEnabled?: boolean;
  signupEnabled?: boolean;
}) {
  return (
    <>
      <SignInDialog
        open={popup === "signin"}
        onOpenChange={(v) => setPopup(v ? "signin" : null)}
        onForgot={() => setPopup("forgot")}
        onSwitchSignup={() => signupEnabled && setPopup("signup")}
      />
      {signupEnabled && (
        <SignUpDialog
          open={popup === "signup"}
          onOpenChange={(v) => setPopup(v ? "signup" : null)}
          onSwitchSignin={() => setPopup("signin")}
        />
      )}
      {guestEnabled && (
        <GuestDialog
          open={popup === "guest"}
          onOpenChange={(v) => setPopup(v ? "guest" : null)}
        />
      )}
      <ForgotDialog
        open={popup === "forgot"}
        onOpenChange={(v) => setPopup(v ? "forgot" : null)}
        onBack={() => setPopup("signin")}
      />
    </>
  );
}

export function AuthScreen() {
  const [popup, setPopup] = useState<Popup>(null);
  const { loginAsGuest } = useAuth();
  const [guestCfg, setGuestCfg] = useState<GuestAccessConfig>(GUEST_ACCESS_DEFAULTS);
  const [signupCfg, setSignupCfg] = useState<SignupAccessConfig>(SIGNUP_ACCESS_DEFAULTS);
  const [cfgReady, setCfgReady] = useState(false);
  const autoTriedRef = useRef(false);

  // Load guest-access + signup-access config directly from app_settings —
  // AuthScreen runs outside AppSettingsProvider (which mounts after login).
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("key, value")
          .in("key", ["guest_access", "signup_access"]);
        if (cancel) return;
        const byKey = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, unknown> | null]));
        const guest = (byKey.get("guest_access") as Partial<GuestAccessConfig> | null) ?? {};
        const signup = (byKey.get("signup_access") as Partial<SignupAccessConfig> | null) ?? {};
        setGuestCfg({
          ...GUEST_ACCESS_DEFAULTS,
          ...guest,
          permissions: { ...GUEST_ACCESS_DEFAULTS.permissions, ...(guest.permissions ?? {}) },
        });
        setSignupCfg({ ...SIGNUP_ACCESS_DEFAULTS, ...signup });
      } catch { /* keep defaults */ }
      finally { if (!cancel) setCfgReady(true); }
    })();
    return () => { cancel = true; };
  }, []);

  const guestAvailable = guestCfg.enabled && signupCfg.guestEnabled;
  const signupAvailable = signupCfg.signupEnabled;

  // Auto Guest Login — opt-in via admin settings.
  useEffect(() => {
    if (!cfgReady || autoTriedRef.current) return;
    if (!guestAvailable || !guestCfg.autoLogin) return;
    // Honor an explicit opt-out (e.g. after a guest logs out and wants the choice screen).
    try { if (sessionStorage.getItem("guest-auto-skip") === "1") return; } catch { /* ignore */ }
    autoTriedRef.current = true;
    loginAsGuest().catch(() => { /* fall back to the manual screen */ });
  }, [cfgReady, guestAvailable, guestCfg.autoLogin, loginAsGuest]);

  return (
    <LiveCommunityBackground>
      <div className="w-full max-w-sm space-y-6">
        <div
          className="rounded-3xl border border-white/10 bg-card/80 p-8 text-center shadow-2xl supports-[backdrop-filter]:bg-card/60 supports-[backdrop-filter]:backdrop-blur-[var(--auth-card-blur,24px)]"
          style={{ boxShadow: "var(--shadow-panel)" }}
        >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-3xl font-bold text-primary-foreground" style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}>P</div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to Palrgo</h1>
        <p className="mt-1 text-xs text-muted-foreground">Chat, post, and play with friends.</p>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => setPopup("signin")}
            className="w-full rounded-full px-4 py-3 text-sm font-bold text-primary-foreground"
            style={{ background: "var(--gradient-accent, var(--primary))" }}
          >
            Sign in
          </button>
          {signupAvailable ? (
            <button
              onClick={() => setPopup("signup")}
              className="w-full rounded-full border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20"
            >
              Create account
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
              {signupCfg.disabledMessage}
            </div>
          )}
          {guestAvailable && (
            <button
              onClick={() => setPopup("guest")}
              className="w-full rounded-full border border-dashed border-border bg-background px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              👤 Continue as guest
            </button>
          )}
          </div>
        </div>
        <FeedbackShowcase surface="signup" />
      </div>

      <AuthDialogs popup={popup} setPopup={setPopup} guestEnabled={guestAvailable} signupEnabled={signupAvailable} />
    </LiveCommunityBackground>
  );
}

/* ---------------- Sign in ---------------- */
function SignInDialog({ open, onOpenChange, onForgot, onSwitchSignup }: { open: boolean; onOpenChange: (v: boolean) => void; onForgot: () => void; onSwitchSignup: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { await login(email, password); }
    catch (e) { setErr(e instanceof Error ? e.message : "Sign in failed"); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>Welcome back to Palrgo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email or username</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="you@example.com or username" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase text-muted-foreground">Password</label>
              <button type="button" onClick={onForgot} className="text-[10px] font-semibold text-primary hover:underline">Forgot password?</button>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={100} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="••••••" />
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          <button disabled={busy} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : "Sign in"}
          </button>
        </form>
        <div className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <button onClick={onSwitchSignup} className="font-semibold text-primary hover:underline">Create an account</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Sign up ---------------- */
function SignUpDialog({ open, onOpenChange, onSwitchSignin }: { open: boolean; onOpenChange: (v: boolean) => void; onSwitchSignin: () => void }) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [birthday, setBirthday] = useState("");
  const [hideYear, setHideYear] = useState(false);
  const [country, setCountry] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const usernameStatus = useUsernameCheck(open ? username : "");

  // Lazy-load country helper to keep this dialog light.
  useEffect(() => {
    if (!open || country) return;
    void import("@/lib/country-flag").then((m) => setCountry(m.detectCountryCode()));
  }, [open, country]);

  function onPickAvatar(file: File | null) {
    setErr("");
    if (!file) { setAvatarDataUrl(""); return; }
    if (!file.type.startsWith("image/")) { setErr("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setErr("Image must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      const letterCount = username.trim().replace(/[^a-zA-Z]/g, "").length;
      if (letterCount < 2 || letterCount > 10) throw new Error("Username must contain between 2 and 10 letters.");
      if (!gender) throw new Error("Please select your gender.");
      if (usernameStatus.state === "error") throw new Error(usernameStatus.message);
      if (usernameStatus.state !== "ok") throw new Error("Checking username, please wait…");
      try {
        const k = email.trim().toLowerCase();
        if (avatarDataUrl) sessionStorage.setItem(`pending-avatar:${k}`, avatarDataUrl);
        sessionStorage.setItem(`pending-welcome:${k}`, "1");
      } catch { /* ignore */ }
      await signup(email, password, username.trim(), gender, {
        birthday: birthday || undefined,
        hide_birth_year: hideYear,
        country_code: country || undefined,
      });
      setInfo("Account created! You're being signed in…");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>Join Palrgo in a few seconds.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Profile picture (optional)</label>
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-input text-[10px] text-muted-foreground">
                {avatarDataUrl ? <img src={avatarDataUrl} alt="avatar preview" className="h-full w-full object-cover" /> : <span>No image</span>}
              </div>
              <label className="flex-1 cursor-pointer rounded-full border border-dashed border-border bg-background px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">
                {avatarDataUrl ? "Change image" : "Choose image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)} />
              </label>
              {avatarDataUrl && (
                <button type="button" onClick={() => setAvatarDataUrl("")} className="rounded-full border border-border px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">Remove</button>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} maxLength={100} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="e.g. cool user" />
            <UsernameHint status={usernameStatus} />
            <p className="mt-1 text-[10px] text-muted-foreground">Must contain 2 to 10 letters.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {(["male", "female", "other"] as const).map((g) => (
                <button type="button" key={g} onClick={() => setGender(g)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${gender === g ? "border-primary bg-primary/15 text-primary" : "border-border bg-input text-foreground hover:bg-accent"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Birthday</label>
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} max={new Date().toISOString().slice(0,10)} className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
              <label className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <input type="checkbox" checked={hideYear} onChange={(e) => setHideYear(e.target.checked)} className="h-3 w-3" />
                Hide year publicly
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} placeholder="US" className="w-full rounded-lg bg-input px-3 py-2 text-sm uppercase outline-none focus:ring-1 focus:ring-ring" />
              <p className="mt-1 text-[10px] text-muted-foreground">2-letter ISO code, optional.</p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={100} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="••••••" />
            <p className="mt-1 text-[10px] text-muted-foreground">At least 4 characters. Any password is fine.</p>
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          {info && <div className="rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary">{info}</div>}
          <button disabled={busy || usernameStatus.state !== "ok"} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : "Create account"}
          </button>
        </form>
        <div className="text-center text-xs text-muted-foreground">
          Already have one?{" "}
          <button onClick={onSwitchSignin} className="font-semibold text-primary hover:underline">Sign in</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Guest ---------------- */
function GuestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { loginAsGuest } = useAuth();
  const [guestName, setGuestName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const status = useUsernameCheck(open ? guestName : "");

  async function go() {
    setErr(""); setBusy(true);
    try { await loginAsGuest(guestName); }
    catch (e) { setErr(e instanceof Error ? e.message : "Guest login failed"); setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Continue as guest</DialogTitle>
          <DialogDescription>Your guest profile is temporary and removed when you leave.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Pick a guest name</label>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={20} placeholder="e.g. nova" className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
            <UsernameHint status={status} />
            <p className="mt-1 text-[10px] text-muted-foreground">2–10 letters.</p>
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          <button onClick={go} disabled={busy} className="w-full rounded-full bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {busy ? "..." : "Enter as guest"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Forgot ---------------- */
function ForgotDialog({ open, onOpenChange, onBack }: { open: boolean; onOpenChange: (v: boolean) => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      const target = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) throw new Error("Enter a valid email address. Username is not supported here.");
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      setInfo("Reset link sent! Check your inbox.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>Enter the email address linked to your account — usernames can't be used here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="you@example.com" />
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          {info && <div className="rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary">{info}</div>}
          <button disabled={busy} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : "Send reset link"}
          </button>
          <button type="button" onClick={onBack} className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground">
            ← Back to sign in
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
