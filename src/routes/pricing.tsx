import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles, Crown, Star, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { usePlans, useMySubscription, useSubscriptionMode } from "@/lib/use-subscription";
import { requestSubscription } from "@/lib/subscription.functions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Membership Plans" },
      { name: "description", content: "Upgrade to unlock premium chatrooms, exclusive themes, no ads and creator perks." },
      { property: "og:title", content: "Pricing & Membership Plans" },
      { property: "og:description", content: "Choose a plan and join the premium community." },
    ],
  }),
  component: PricingPage,
});

const tierIcon: Record<string, React.ReactNode> = {
  free: <Star className="h-5 w-5" />,
  vip: <Sparkles className="h-5 w-5" />,
  creator: <Crown className="h-5 w-5" />,
};

function PricingPage() {
  const { data: plans, isLoading } = usePlans();
  const { data: mySub } = useMySubscription();
  const { data: cfg } = useSubscriptionMode();
  const { user } = useAuth();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [chosen, setChosen] = useState<any>(null);
  const [proof, setProof] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const requestFn = useServerFn(requestSubscription);

  const submit = useMutation({
    mutationFn: () => requestFn({ data: { planId: chosen.id, cycle, proofReference: proof || undefined } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["my-subscription"] });
      setChosen(null); setProof("");
      if (res.mode === "free") {
        toast.success("You're on the Free plan");
        navigate({ to: "/feed" });
      } else {
        toast.success("Payment submitted — awaiting admin approval");
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (cfg?.mode === "off") {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-2 text-3xl font-bold">Subscriptions are currently disabled</h1>
          <p className="text-muted-foreground">Check back later.</p>
          <Link to="/feed" className="mt-4 inline-block text-primary underline">Go to feed</Link>
        </div>
      </main>
    );
  }

  const currentPlanId = (mySub?.subscription as any)?.plan_id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {user && mySub?.isActive && (
            <span className="text-sm text-muted-foreground">
              Current plan: <strong className="text-foreground">{(mySub.subscription as any)?.plan?.name}</strong>
            </span>
          )}
        </div>

        <div className="mb-10 text-center">
          <h1 className="mb-3 bg-gradient-to-r from-primary via-pink-500 to-amber-400 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl">
            Choose your membership
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Unlock premium chatrooms, exclusive themes, no ads and creator perks. Cancel anytime.
          </p>

          <div className="mx-auto mt-6 inline-flex rounded-full border bg-card p-1">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${cycle === c ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c}{c === "yearly" && <span className="ml-1.5 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-600">Save</span>}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Loading plans…</p>}

        <div className="grid gap-6 md:grid-cols-3">
          {(plans ?? []).map((p: any) => {
            const isCurrent = currentPlanId === p.id;
            const price = cycle === "yearly" ? Number(p.yearly_price) : Number(p.monthly_price);
            const isFree = p.is_default || (Number(p.monthly_price) === 0 && Number(p.yearly_price) === 0);
            const highlight = p.tier === "vip";
            return (
              <div
                key={p.id}
                className={`relative overflow-hidden rounded-3xl border bg-card/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl ${highlight ? "border-primary/60 ring-2 ring-primary/30" : "border-border"}`}
              >
                {highlight && (
                  <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2 text-primary">
                  {tierIcon[p.tier] ?? <Star className="h-5 w-5" />}
                  <h2 className="text-xl font-bold text-foreground">{p.name}</h2>
                  {p.badge && (
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {p.badge}
                    </span>
                  )}
                </div>
                {p.description && <p className="mb-4 text-sm text-muted-foreground">{p.description}</p>}

                <div className="mb-5">
                  <span className="text-4xl font-extrabold">{p.currency_symbol}{price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ {cycle === "yearly" ? "year" : "month"}</span>
                </div>

                <ul className="mb-6 space-y-2">
                  {((p.features as string[]) ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="w-full rounded-full border bg-muted py-3 text-sm font-bold text-muted-foreground">
                    Current plan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) { navigate({ to: "/auth" } as never); return; }
                      if (isFree) {
                        setChosen(p);
                        submit.mutate();
                      } else {
                        setChosen(p);
                      }
                    }}
                    className={`w-full rounded-full py-3 text-sm font-bold transition ${highlight ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                  >
                    {isFree ? "Continue free" : `Upgrade to ${p.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!chosen && !( chosen?.is_default || (Number(chosen?.monthly_price) === 0 && Number(chosen?.yearly_price) === 0))} onOpenChange={(o) => !o && setChosen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate {chosen?.name}</DialogTitle>
            <DialogDescription>
              {cfg?.payment_instructions || "Send your payment to the configured account, then enter the transaction reference below for admin approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-xl border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{chosen?.name} ({cycle})</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">
                  {chosen?.currency_symbol}
                  {cycle === "yearly" ? chosen?.yearly_price : chosen?.monthly_price}
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="proof">Transaction reference / UTR / note</Label>
              <Input id="proof" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="e.g. UPI ref 123456789" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChosen(null)}>Cancel</Button>
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
              {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
