import { createFileRoute, useNavigate, Navigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2, PartyPopper, UserPlus, ArrowRight, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { getOwnerStatus, saveCommunitySetup, createOwner } from "@/lib/owner-setup.functions";

export const Route = createFileRoute("/setup-wizard")({
  beforeLoad: async () => {
    const status = await getOwnerStatus({});
    if (!status.installed) throw redirect({ to: "/installer" as any });
    if (status.hasOwner || status.firstRunCompleted) throw redirect({ to: "/login" as any });
  },
  component: SetupWizardPage,
});

type Step = 1 | 2 | 3;

function SetupWizardPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getOwnerStatus);
  const runSaveCommunity = useServerFn(saveCommunitySetup);
  const runCreateOwner = useServerFn(createOwner);

  const { data: status, isLoading } = useQuery({
    queryKey: ["owner-setup-status"],
    queryFn: () => fetchStatus({}),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);

  // Community
  const [cName, setCName] = useState("");
  const [cTagline, setCTagline] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cLanguage, setCLanguage] = useState("en");
  const [cTimezone, setCTimezone] = useState(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : "UTC"
  );
  const [cCurrency, setCCurrency] = useState("USD");
  const [cLogo, setCLogo] = useState("");
  const [cFavicon, setCFavicon] = useState("");
  const [homepage, setHomepage] = useState<"welcome" | "hero">("welcome");

  // Admin
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Checking installation…
      </div>
    );
  }
  if (!status) return <div className="grid min-h-screen place-items-center bg-background">Unable to verify status.</div>;
  if (!status.installed) return <Navigate to={"/installer" as any} replace />;
  if (status.hasOwner || status.firstRunCompleted) return <Navigate to="/login" replace />;

  async function handleSaveCommunity(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim()) {
      toast.error("Community name is required.");
      return;
    }
    setBusy(true);
    try {
      await runSaveCommunity({
        data: {
          name: cName,
          tagline: cTagline,
          description: cDescription,
          language: cLanguage,
          timezone: cTimezone,
          currency: cCurrency,
          logoUrl: cLogo,
          faviconUrl: cFavicon,
          homepage,
        },
      });
      toast.success("Community settings saved.");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save community settings.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username))
      return toast.error("Username must be 3–32 characters (letters, numbers, underscore).");

    setBusy(true);
    try {
      await runCreateOwner({ data: { fullName, username, email, password } });
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        toast.error(`Owner account created, but auto sign-in failed: ${signInErr.message}`);
        navigate({ to: "/login" as any });
        return;
      }
      toast.success("Welcome to BooBubble! Your community has been configured successfully.");
      navigate({ to: "/admin" as any });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create Super Admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <StepIndicator step={step} />

        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <CardTitle className="mt-2 text-2xl">Installation Completed Successfully</CardTitle>
              <CardDescription>
                Your BooBubble Community has been installed successfully.
                <br />
                Let's finish the final setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <PartyPopper className="h-10 w-10 text-primary" />
              <Button size="lg" onClick={() => setStep(2)}>
                Continue Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" /> Community Setup
              </CardTitle>
              <CardDescription>Configure the basics for your community.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveCommunity} className="space-y-4">
                <div>
                  <Label htmlFor="cName">Community Name *</Label>
                  <Input id="cName" value={cName} onChange={(e) => setCName(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="cTagline">Tagline</Label>
                  <Input id="cTagline" value={cTagline} onChange={(e) => setCTagline(e.target.value)} maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="cDescription">Description</Label>
                  <Textarea id="cDescription" value={cDescription} onChange={(e) => setCDescription(e.target.value)} maxLength={2000} rows={3} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="cLanguage">Default Language</Label>
                    <Input id="cLanguage" value={cLanguage} onChange={(e) => setCLanguage(e.target.value)} placeholder="en" />
                  </div>
                  <div>
                    <Label htmlFor="cTimezone">Timezone</Label>
                    <Input id="cTimezone" value={cTimezone} onChange={(e) => setCTimezone(e.target.value)} placeholder="UTC" />
                  </div>
                  <div>
                    <Label htmlFor="cCurrency">Currency</Label>
                    <Input id="cCurrency" value={cCurrency} onChange={(e) => setCCurrency(e.target.value)} placeholder="USD" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cLogo">Community Logo URL (optional)</Label>
                    <Input id="cLogo" type="url" value={cLogo} onChange={(e) => setCLogo(e.target.value)} placeholder="https://…" />
                  </div>
                  <div>
                    <Label htmlFor="cFavicon">Favicon URL (optional)</Label>
                    <Input id="cFavicon" type="url" value={cFavicon} onChange={(e) => setCFavicon(e.target.value)} placeholder="https://…" />
                  </div>
                </div>
                <div>
                  <Label>Homepage</Label>
                  <RadioGroup
                    value={homepage}
                    onValueChange={(v) => setHomepage(v as "welcome" | "hero")}
                    className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="welcome" id="hp-welcome" className="mt-1" />
                      <div>
                        <div className="font-medium">Welcome Page</div>
                        <div className="text-xs text-muted-foreground">Show the welcome landing as the default homepage.</div>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="hero" id="hp-hero" className="mt-1" />
                      <div>
                        <div className="font-medium">Hero Homepage</div>
                        <div className="text-xs text-muted-foreground">Show the marketing hero as the default homepage.</div>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={busy}>Back</Button>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Create Super Administrator
              </CardTitle>
              <CardDescription>This account will be the permanent platform owner with full permissions.</CardDescription>
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
                  <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={busy}>Back</Button>
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Owner & Enter Dashboard
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

function StepIndicator({ step }: { step: Step }) {
  const items = [
    { n: 1, label: "Install Complete" },
    { n: 2, label: "Community" },
    { n: 3, label: "Super Admin" },
  ];
  return (
    <ol className="mb-6 flex items-center justify-center gap-2 text-xs">
      {items.map((it, i) => (
        <li key={it.n} className="flex items-center gap-2">
          <span
            className={`grid h-6 w-6 place-items-center rounded-full border ${
              step >= (it.n as Step)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 text-muted-foreground"
            }`}
          >
            {it.n}
          </span>
          <span className={step === (it.n as Step) ? "font-medium" : "text-muted-foreground"}>{it.label}</span>
          {i < items.length - 1 && <span className="mx-1 h-px w-6 bg-muted-foreground/30" />}
        </li>
      ))}
    </ol>
  );
}
