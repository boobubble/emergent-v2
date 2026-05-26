import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";
import { useUsernameCheck, type UsernameStatus } from "@/lib/use-username-check";
import { supabase } from "@/integrations/supabase/client";

function UsernameHint({ status }: { status: UsernameStatus }) {
  if (status.state === "idle") return null;
  if (status.state === "checking") return <p className="mt-1 text-[10px] text-muted-foreground">Checking…</p>;
  if (status.state === "ok") return <p className="mt-1 text-[10px] font-semibold text-primary">✓ Available</p>;
  return <p className="mt-1 text-[10px] font-semibold text-destructive">{status.message}</p>;
}



export function AuthScreen() {
  const { login, signup, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const usernameStatus = useUsernameCheck(mode === "signup" ? username : "");
  const guestStatus = useUsernameCheck(showGuest ? guestName : "");

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
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "forgot") {
        const target = email.trim();
        if (!target || !target.includes("@")) throw new Error("Enter the email address for your account.");
        const { error } = await supabase.auth.resetPasswordForEmail(target, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message);
        setInfo("Reset link sent! Check your inbox.");
      } else {
        const letterCount = username.trim().replace(/[^a-zA-Z]/g, "").length;
        if (letterCount < 2 || letterCount > 10) {
          throw new Error("Username must contain between 2 and 10 letters.");
        }
        if (!gender) throw new Error("Please select your gender.");
        if (usernameStatus.state === "error") throw new Error(usernameStatus.message);
        if (usernameStatus.state !== "ok") throw new Error("Checking username, please wait…");
        try {
          const k = email.trim().toLowerCase();
          if (avatarDataUrl) sessionStorage.setItem(`pending-avatar:${k}`, avatarDataUrl);
          sessionStorage.setItem(`pending-welcome:${k}`, "1");
        } catch { /* ignore quota */ }
        await signup(email, password, username.trim(), gender);
        setInfo("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }



  return (
    <div className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl" style={{ boxShadow: "var(--shadow-panel)" }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl text-2xl font-bold text-primary-foreground" style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}>P</div>
          <div>
            <h1 className="text-xl font-bold">Palrgo</h1>
            <p className="text-xs text-muted-foreground">{mode === "login" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Create your account"}</p>
          </div>
        </div>


        {!showGuest ? (
          <button
            type="button"
            onClick={() => { setErr(""); setShowGuest(true); }}
            disabled={busy}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            👤 Continue as guest
          </button>
        ) : (
          <div className="mb-4 rounded-2xl border border-dashed border-border bg-background/50 p-3">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pick a guest name</label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={20}
              placeholder="e.g. nova"
              className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <UsernameHint status={guestStatus} />
            <p className="mt-1 text-[10px] text-muted-foreground">2–10 letters. Profile is temporary and removed when you leave.</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => { setShowGuest(false); setGuestName(""); setErr(""); }}
                disabled={busy}
                className="flex-1 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setErr(""); setBusy(true);
                  try { await loginAsGuest(guestName); }
                  catch (e) { setErr(e instanceof Error ? e.message : "Guest login failed"); setBusy(false); }
                }}
                disabled={busy}
                className="flex-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "..." : "Enter as guest"}
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Profile picture (optional)</label>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-input text-[10px] text-muted-foreground">
                    {avatarDataUrl
                      ? <img src={avatarDataUrl} alt="avatar preview" className="h-full w-full object-cover" />
                      : <span>No image</span>}
                  </div>
                  <label className="flex-1 cursor-pointer rounded-full border border-dashed border-border bg-background px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">
                    {avatarDataUrl ? "Change image" : "Choose image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)} />
                  </label>
                  {avatarDataUrl && (
                    <button type="button" onClick={() => setAvatarDataUrl("")} className="rounded-full border border-border px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground">Remove</button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">PNG or JPG, up to 2MB.</p>
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
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGender(g)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${gender === g ? "border-primary bg-primary/15 text-primary" : "border-border bg-input text-foreground hover:bg-accent"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{mode === "login" ? "Email or username" : "Email"}</label>
            <input type={mode === "login" ? "text" : "email"} value={email} onChange={e => setEmail(e.target.value)} maxLength={255} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder={mode === "login" ? "you@example.com or username" : "you@example.com"} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={100} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="••••••" />
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          {info && <div className="rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary">{info}</div>}
          <button disabled={busy || (mode === "signup" && usernameStatus.state !== "ok")} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "login" ? "New here?" : "Already have one?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); setInfo(""); }} className="font-semibold text-primary hover:underline">
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
