import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Flame, Gift, Sparkles, TrendingUp, TrendingDown, ShoppingBag, Snowflake } from "lucide-react";
import {
  claimDailyReward,
  createOrder,
  fetchLastClaim,
  fetchMyOrders,
  fetchPackages,
  fetchProviders,
  fetchTodayClaim,
  fetchTransactions,
  fetchWalletStats,
  submitManualReceipt,
  TRANSACTION_LABELS,
  type CoinOrder,
  type CoinPackage,
  type CoinTransaction,
  type ProviderRow,
  type WalletStats,
} from "@/lib/wallet";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet & Coins Store · BooBubble" },
      { name: "description", content: "Manage your BooBubble coins: buy, earn, spend, and track every transaction." },
    ],
  }),
  component: WalletPage,
});

type Range = "today" | "week" | "month" | "all";

function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [txs, setTxs] = useState<CoinTransaction[]>([]);
  const [orders, setOrders] = useState<CoinOrder[]>([]);
  const [range, setRange] = useState<Range>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [buying, setBuying] = useState<CoinPackage | null>(null);
  const [chosenProvider, setChosenProvider] = useState<"manual" | "razorpay" | "stripe">("manual");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [lastClaim, setLastClaim] = useState<{ streak: number; claim_date: string } | null>(null);
  const [todayClaim, setTodayClaim] = useState<{ coins: number } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const reload = async () => {
    if (!userId) return;
    const since = rangeToDate(range);
    const [s, p, pv, t, o, td, lc] = await Promise.all([
      fetchWalletStats(userId),
      fetchPackages(true),
      fetchProviders(),
      fetchTransactions(userId, since),
      fetchMyOrders(userId),
      fetchTodayClaim(userId),
      fetchLastClaim(userId),
    ]);
    setStats(s); setPackages(p); setProviders(pv); setTxs(t); setOrders(o);
    setTodayClaim(td); setLastClaim(lc);
  };

  useEffect(() => { void reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId, range]);

  const enabledProviders = useMemo(() => providers.filter(p => p.enabled), [providers]);

  useEffect(() => {
    if (enabledProviders[0] && !enabledProviders.find(p => p.key === chosenProvider)) {
      setChosenProvider(enabledProviders[0].key);
    }
  }, [enabledProviders, chosenProvider]);

  const filteredTxs = useMemo(() => {
    if (kindFilter === "all") return txs;
    return txs.filter(t => (t.wallet_kind ?? t.reason ?? "") === kindFilter);
  }, [txs, kindFilter]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const r = await claimDailyReward();
      toast.success(`+${r.coins} coins · ${r.streak}-day streak`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(false);
    }
  };

  const handleBuy = async () => {
    if (!buying) return;
    try {
      const order = await createOrder(buying.id, chosenProvider);
      if (chosenProvider === "manual") {
        toast.success("Order created — upload your payment receipt below.");
      } else if (chosenProvider === "razorpay") {
        toast.info("Razorpay checkout will open here once configured by admin.");
      } else {
        toast.info("Stripe checkout will open here once configured by admin.");
      }
      setBuying(null);
      await reload();
      if (chosenProvider === "manual") {
        // Prompt receipt attach
        const url = window.prompt("Paste the URL/screenshot of your payment receipt:");
        if (url) {
          await submitManualReceipt(order.id, url);
          toast.success("Receipt submitted for review.");
          await reload();
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create order");
    }
  };

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <Coins className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-semibold">Sign in to see your Wallet</h1>
        <Link to="/auth" className="mt-4 inline-block underline">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Coins className="h-7 w-7 text-yellow-500" /> Wallet & Coins Store
          </h1>
          <p className="text-sm text-muted-foreground">Buy, earn and spend BooBubble coins.</p>
        </div>
        {stats?.wallet_frozen && (
          <Badge variant="destructive" className="gap-1"><Snowflake className="h-3 w-3" /> Frozen</Badge>
        )}
      </header>

      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Coins className="h-5 w-5 text-yellow-500" />} label="Current balance" value={stats?.coins ?? 0} highlight />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} label="Lifetime earned" value={stats?.coins_lifetime_earned ?? 0} />
        <StatCard icon={<TrendingDown className="h-5 w-5 text-rose-500" />} label="Lifetime spent" value={stats?.coins_lifetime_spent ?? 0} />
        <StatCard icon={<Gift className="h-5 w-5 text-purple-500" />} label="Bonus coins" value={stats?.coins_bonus_total ?? 0}
          sub={`Purchased: ${stats?.coins_purchased_total ?? 0}`} />
      </div>

      {/* Daily claim */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="font-semibold">Daily Reward</div>
              <div className="text-sm text-muted-foreground">
                {todayClaim
                  ? `Already claimed today · Streak: ${lastClaim?.streak ?? 1} day${(lastClaim?.streak ?? 1) > 1 ? "s" : ""}`
                  : `Claim your coins today${lastClaim ? ` · Current streak ${lastClaim.streak} day${lastClaim.streak > 1 ? "s" : ""}` : ""}`}
              </div>
            </div>
          </div>
          <Button onClick={handleClaim} disabled={claiming || !!todayClaim}>
            {todayClaim ? "Claimed" : claiming ? "Claiming…" : "Claim"}
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store"><ShoppingBag className="h-4 w-4 mr-1" /> Store</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4">
          {enabledProviders.length === 0 && (
            <Card className="p-4 mb-4 border-amber-500/30 bg-amber-500/10 text-sm">
              No payment providers are enabled yet. Ask an admin to enable Manual, Razorpay or Stripe.
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map(pkg => (
              <Card key={pkg.id} className="p-4 flex flex-col justify-between border-2 hover:border-primary transition">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{pkg.name}</div>
                    {pkg.badge && <Badge>{pkg.badge}</Badge>}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-3xl font-bold">{pkg.coins.toLocaleString()}</span>
                  </div>
                  {pkg.bonus_coins > 0 && (
                    <div className="mt-1 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> +{pkg.bonus_coins} bonus
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xl font-semibold">
                    {pkg.currency === "INR" ? `₹${pkg.price_inr}` : `$${((pkg.price_usd_cents ?? 0) / 100).toFixed(2)}`}
                  </div>
                  <Button
                    disabled={enabledProviders.length === 0 || !!stats?.wallet_frozen}
                    onClick={() => setBuying(pkg)}
                  >
                    Buy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <Select value={range} onValueChange={(v) => setRange(v as Range)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(TRANSACTION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="divide-y">
            {filteredTxs.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No transactions</div>}
            {filteredTxs.map(tx => {
              const isCredit = (tx.amount ?? 0) >= 0;
              const kind = tx.wallet_kind ?? tx.reason ?? "coins";
              return (
                <div key={tx.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{TRANSACTION_LABELS[kind] ?? kind}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()} · {tx.provider} · {tx.status}
                    </div>
                  </div>
                  <div className={`font-semibold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                    {isCredit ? "+" : ""}{tx.amount}
                  </div>
                </div>
              );
            })}
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="divide-y">
            {orders.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No orders yet</div>}
            {orders.map(o => (
              <div key={o.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{o.coins} coins {o.bonus_coins > 0 && <span className="text-emerald-500">+ {o.bonus_coins} bonus</span>}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()} · {o.provider}
                    {o.receipt_url && <> · <a href={o.receipt_url} target="_blank" rel="noreferrer" className="underline">receipt</a></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={o.status === "paid" ? "default" : o.status === "failed" || o.status === "cancelled" ? "destructive" : "secondary"}>
                    {o.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {o.currency === "INR" ? `₹${o.amount}` : `$${(o.amount / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Buy dialog */}
      <Dialog open={!!buying} onOpenChange={(o) => !o && setBuying(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {buying?.coins.toLocaleString()} coins</DialogTitle>
          </DialogHeader>
          {buying && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Coins</span><span>{buying.coins}</span></div>
              {buying.bonus_coins > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Bonus</span><span>+{buying.bonus_coins}</span></div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Price</span>
                <span>{buying.currency === "INR" ? `₹${buying.price_inr}` : `$${((buying.price_usd_cents ?? 0) / 100).toFixed(2)}`}</span>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Payment method</div>
                <Select value={chosenProvider} onValueChange={(v) => setChosenProvider(v as typeof chosenProvider)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {enabledProviders.map(p => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.key === "manual" ? "Manual (upload receipt)" : p.key === "razorpay" ? "Razorpay" : "Stripe"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBuying(null)}>Cancel</Button>
            <Button onClick={handleBuy}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 ${highlight ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-2xl font-bold">{value.toLocaleString()}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

function rangeToDate(r: Range): Date | undefined {
  const now = new Date();
  if (r === "today") { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (r === "week") return new Date(now.getTime() - 7 * 86400_000);
  if (r === "month") return new Date(now.getTime() - 30 * 86400_000);
  return undefined;
}
