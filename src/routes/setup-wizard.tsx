import { createFileRoute, useNavigate, Navigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Shield, Loader2, PartyPopper, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { getOwnerStatus, createOwner } from "@/lib/owner-setup.functions";

export const Route = createFileRoute("/setup-wizard")({
  beforeLoad: async () => {
    const status = await getOwnerStatus({});
    if (!status.installed) {
      throw redirect({ to: "/installer" as any });
    }
    if (status.hasOwner) {
      throw redirect({ to: "/login" as any });
    }
  },
  component: SetupWizardPage,
});

function SetupWizardPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getOwnerStatus);
  const runCreateOwner = useServerFn(createOwner);

  const { data: status, isLoading } = useQuery({
    queryKey: ["owner-setup-status"],
    queryFn: () => fetchStatus({}),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Checking installation…
      </div>
    );
  }

  if (!status) {
    return <div className="grid min-h-screen place-items-center bg-background">Unable to verify status.</div>;
  }

  // Not installed yet → send them to the installer.
  if (!status.installed) return <Navigate to={"/installer" as any} replace />;

  // Owner already exists → wizard is permanently disabled; redirect to login.
  if (status.hasOwner) {
    return <Navigate to="/login" replace />;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      toast.error("Username must be 3–32 characters (letters, numbers, underscore).");
      return;
    }
    setBusy(true);
    try {
      await runCreateOwner({ data: { fullName, username, email, password } });
      // Auto sign-in the freshly created owner.
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        toast.error(`Account created, but auto sign-in failed: ${signInErr.message}`);
        navigate({ to: "/login" as any });
        return;
      }
      toast.success("Welcome to BooBubble! Your Super Admin account has been created successfully.");
      navigate({ to: "/admin" as any });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create Super Admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="mx-auto max-w-xl">
        {step === 1 ? (
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <CardTitle className="mt-2 text-2xl">Installation Completed Successfully</CardTitle>
              <CardDescription>
                Your community is ready.
                <br />
                Next, create your Super Administrator account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <PartyPopper className="h-10 w-10 text-primary" />
              <Button size="lg" onClick={() => setStep(2)}>
                <UserPlus className="mr-2 h-4 w-4" /> Create Super Admin
              </Button>
              <p className="text-xs text-muted-foreground">
                The first account created here becomes the permanent platform owner.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Super Administrator</CardTitle>
              <CardDescription>This account will have unrestricted access to every feature.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                  <p className="mt-1 text-[10px] text-muted-foreground">3–32 characters. Letters, numbers, underscore.</p>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  <PasswordStrength value={password} />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={busy}>Back</Button>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Admin Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
