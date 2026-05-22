import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(email, password, username);
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
            <p className="text-xs text-muted-foreground">{mode === "login" ? "Welcome back" : "Create your account"}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} maxLength={20} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="cool_user" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={100} required className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="••••••" />
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          <button disabled={busy} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "login" ? "New here?" : "Already have one?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }} className="font-semibold text-primary hover:underline">
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground/60">Local demo only — data lives in your browser.</p>
      </div>
    </div>
  );
}
