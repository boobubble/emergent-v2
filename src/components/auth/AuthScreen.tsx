import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";
import { useUsernameCheck, type UsernameStatus } from "@/lib/use-username-check";

function UsernameHint({ status }: { status: UsernameStatus }) {
  if (status.state === "idle") return null;
  if (status.state === "checking") return <p className="mt-1 text-[10px] text-muted-foreground">Checking…</p>;
  if (status.state === "ok") return <p className="mt-1 text-[10px] font-semibold text-primary">✓ Available</p>;
  return <p className="mt-1 text-[10px] font-semibold text-destructive">{status.message}</p>;
}



export function AuthScreen() {
  const { login, signup, loginWithGoogle, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const usernameStatus = useUsernameCheck(mode === "signup" ? username : "");
  const guestStatus = useUsernameCheck(showGuest ? guestName : "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const letterCount = username.trim().replace(/[^a-zA-Z]/g, "").length;
        if (letterCount < 2 || letterCount > 10) {
          throw new Error("Username must contain between 2 and 10 letters.");
        }
        if (!gender) throw new Error("Please select your gender.");
        if (usernameStatus.state === "error") throw new Error(usernameStatus.message);
        if (usernameStatus.state !== "ok") throw new Error("Checking username, please wait…");
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


  async function onGoogle() {
    setErr(""); setBusy(true);
    try { await loginWithGoogle(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Google sign-in failed"); setBusy(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl" style={{ boxShadow: "var(--shadow-panel)" }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl text-2xl font-bold text-primary-foreground" style={{ background: "var(--primary)", boxShadow: "var(--shadow-glow)" }}>P</div>
          <div>
            <h1 className="text-xl font-bold">Palrgo</h1>
            <p className="text-xs text-muted-foreground">{mode === "login" ? "Welcome back" : "Create your account"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

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
