import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase auto-parses the recovery hash on load and emits PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // If already in a recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setInfo("");
    if (password.length < 4) { setErr("Password must be at least 4 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setInfo("Password updated! Redirecting…");
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/" }), 1200);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <h1 className="mb-1 text-xl font-bold">Set a new password</h1>
        <p className="mb-5 text-xs text-muted-foreground">
          {ready ? "Choose a new password for your account." : "Open this page from the reset email link to continue."}
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={100} required disabled={!ready || busy} className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" placeholder="••••••" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} maxLength={100} required disabled={!ready || busy} className="w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" placeholder="••••••" />
          </div>
          {err && <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{err}</div>}
          {info && <div className="rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary">{info}</div>}
          <button disabled={!ready || busy} type="submit" className="w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50" style={{ background: "var(--gradient-accent, var(--primary))" }}>
            {busy ? "..." : "Update password"}
          </button>
          <button type="button" onClick={() => navigate({ to: "/" })} className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground">
            Back to sign in
          </button>
        </form>
      </div>
    </div>
  );
}
