import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Coins } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { fetchPackages, fetchProviders, type CoinPackage, type CoinOrder, type ProviderRow } from "@/lib/wallet";

export const Route = createFileRoute("/admin/wallet")({
  component: AdminWalletPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

function AdminWalletPage() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [orders, setOrders] = useState<CoinOrder[]>([]);
  const [flags, setFlags] = useState<{ feature: string; enabled: boolean }[]>([]);
  const [daily, setDaily] = useState<{ day_number: number; coins: number }[]>([]);
  const [newPkg, setNewPkg] = useState({ name: "", coins: 100, bonus_coins: 0, price_inr: 49, price_usd_cents: 99, badge: "", sort_order: 0 });
  const [adjust, setAdjust] = useState({ user_id: "", amount: 100, direction: "credit" as "credit" | "debit", reason: "" });
  const [dailyDraft, setDailyDraft] = useState({ day: 1, coins: 10 });

  const load = async () => {
    const [p, pv, ords, fl, dr] = await Promise.all([
      fetchPackages(false),
      fetchProviders(),
      sb.from("coin_payment_orders").select("*").order("created_at", { ascending: false }).limit(100).then((r: any) => r.data ?? []),
      sb.from("coin_feature_flags").select("*").order("feature").then((r: any) => r.data ?? []),
      sb.from("daily_reward_config").select("*").order("day_number").then((r: any) => r.data ?? []),
    ]);
    setPackages(p); setProviders(pv); setOrders(ords); setFlags(fl); setDaily(dr);
  };
  useEffect(() => { void load(); }, []);

  const savePackage = async (pkg: Partial<CoinPackage> & { id?: string }) => {
    const { error } = pkg.id
      ? await sb.from("coin_packages").update(pkg).eq("id", pkg.id)
      : await sb.from("coin_packages").insert(pkg);
    if (error) return toast.error(error.message);
    toast.success("Saved"); await load();
  };

  const addPackage = async () => {
    if (!newPkg.name) return toast.error("Name required");
    await savePackage({ ...newPkg, is_active: true, currency: "INR", badge: newPkg.badge || null });
    setNewPkg({ name: "", coins: 100, bonus_coins: 0, price_inr: 49, price_usd_cents: 99, badge: "", sort_order: 0 });
  };

  const deletePackage = async (id: string) => {
    if (!window.confirm("Delete package?")) return;
    const { error } = await sb.from("coin_packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  const toggleProvider = async (key: string, enabled: boolean) => {
    const { error } = await sb.from("payment_providers").update({ enabled }).eq("key", key);
    if (error) return toast.error(error.message);
    await load();
  };

  const toggleFlag = async (feature: string, enabled: boolean) => {
    const { error } = await sb.from("coin_feature_flags").update({ enabled }).eq("feature", feature);
    if (error) return toast.error(error.message);
    await load();
  };

  const approve = async (id: string) => {
    const ref = window.prompt("Payment reference (optional):") || undefined;
    const { error } = await sb.rpc("admin_approve_coin_order", { _order_id: id, _payment_ref: ref });
    if (error) return toast.error(error.message);
    toast.success("Approved · coins credited"); await load();
  };
  const reject = async (id: string) => {
    const note = window.prompt("Reason:") || undefined;
    const { error } = await sb.rpc("admin_reject_coin_order", { _order_id: id, _note: note });
    if (error) return toast.error(error.message);
    await load();
  };

  const doAdjust = async () => {
    if (!adjust.user_id) return toast.error("User ID required");
    const { error } = await sb.rpc("admin_adjust_coins", {
      _user: adjust.user_id, _amount: adjust.amount, _direction: adjust.direction, _reason: adjust.reason || "admin",
    });
    if (error) return toast.error(error.message);
    toast.success("Adjusted");
  };

  const freeze = async (frozen: boolean) => {
    if (!adjust.user_id) return toast.error("User ID required");
    const { error } = await sb.rpc("admin_set_wallet_frozen", { _user: adjust.user_id, _frozen: frozen });
    if (error) return toast.error(error.message);
    toast.success(frozen ? "Wallet frozen" : "Wallet unfrozen");
  };

  const saveDaily = async () => {
    const { error } = await sb.from("daily_reward_config").upsert({ day_number: dailyDraft.day, coins: dailyDraft.coins });
    if (error) return toast.error(error.message);
    await load();
  };
  const deleteDaily = async (day: number) => {
    await sb.from("daily_reward_config").delete().eq("day_number", day);
    await load();
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <AdminPageHeader title="Wallet & Coins Store" description="Manage packages, providers, orders, daily rewards, feature flags and user wallets." icon={<Coins className="h-6 w-6" />} />

      <Tabs defaultValue="packages">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="orders">Manual Orders</TabsTrigger>
          <TabsTrigger value="daily">Daily Rewards</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="users">User Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-4 space-y-4">
          <Card className="p-4 grid gap-2 md:grid-cols-7">
            <Input placeholder="Name" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} />
            <Input type="number" placeholder="Coins" value={newPkg.coins} onChange={e => setNewPkg({ ...newPkg, coins: +e.target.value })} />
            <Input type="number" placeholder="Bonus" value={newPkg.bonus_coins} onChange={e => setNewPkg({ ...newPkg, bonus_coins: +e.target.value })} />
            <Input type="number" placeholder="₹" value={newPkg.price_inr} onChange={e => setNewPkg({ ...newPkg, price_inr: +e.target.value })} />
            <Input type="number" placeholder="USD cents" value={newPkg.price_usd_cents} onChange={e => setNewPkg({ ...newPkg, price_usd_cents: +e.target.value })} />
            <Input placeholder="Badge" value={newPkg.badge} onChange={e => setNewPkg({ ...newPkg, badge: e.target.value })} />
            <Button onClick={addPackage}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </Card>
          <div className="grid gap-3">
            {packages.map(p => (
              <Card key={p.id} className="p-3 grid gap-2 md:grid-cols-8 items-center">
                <Input defaultValue={p.name} onBlur={e => e.target.value !== p.name && savePackage({ id: p.id, name: e.target.value })} />
                <Input type="number" defaultValue={p.coins} onBlur={e => +e.target.value !== p.coins && savePackage({ id: p.id, coins: +e.target.value })} />
                <Input type="number" defaultValue={p.bonus_coins} onBlur={e => +e.target.value !== p.bonus_coins && savePackage({ id: p.id, bonus_coins: +e.target.value })} />
                <Input type="number" defaultValue={p.price_inr ?? 0} onBlur={e => +e.target.value !== p.price_inr && savePackage({ id: p.id, price_inr: +e.target.value })} />
                <Input type="number" defaultValue={p.price_usd_cents ?? 0} onBlur={e => +e.target.value !== p.price_usd_cents && savePackage({ id: p.id, price_usd_cents: +e.target.value })} />
                <Input defaultValue={p.badge ?? ""} onBlur={e => e.target.value !== (p.badge ?? "") && savePackage({ id: p.id, badge: e.target.value || null })} />
                <div className="flex items-center gap-2"><Switch checked={p.is_active} onCheckedChange={v => savePackage({ id: p.id, is_active: v })} /><span className="text-xs">Active</span></div>
                <Button variant="ghost" size="icon" onClick={() => deletePackage(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Enable/disable each payment method. Razorpay & Stripe checkout will activate once their secret keys are added.</p>
          {providers.map(p => (
            <Card key={p.key} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold capitalize">{p.key}</div>
                <div className="text-xs text-muted-foreground">
                  {p.key === "manual" && "User uploads a receipt; you approve manually."}
                  {p.key === "razorpay" && "UPI, cards, netbanking (India)."}
                  {p.key === "stripe" && "Global cards & wallets."}
                </div>
              </div>
              <Switch checked={p.enabled} onCheckedChange={v => toggleProvider(p.key, v)} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="divide-y">
            {orders.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No orders</div>}
            {orders.map(o => (
              <div key={o.id} className="p-3 grid gap-2 md:grid-cols-6 items-center text-sm">
                <div className="font-mono text-xs truncate">{o.user_id}</div>
                <div>{o.coins}{o.bonus_coins ? ` +${o.bonus_coins}` : ""} coins</div>
                <div>{o.currency === "INR" ? `₹${o.amount}` : `$${(o.amount / 100).toFixed(2)}`}</div>
                <div>{o.provider}</div>
                <div>
                  <Badge variant={o.status === "paid" ? "default" : o.status === "failed" ? "destructive" : "secondary"}>{o.status}</Badge>
                  {o.receipt_url && <a href={o.receipt_url} target="_blank" rel="noreferrer" className="ml-2 underline text-xs">receipt</a>}
                </div>
                <div className="flex gap-2 justify-end">
                  {o.status !== "paid" && <Button size="sm" onClick={() => approve(o.id)}>Approve</Button>}
                  {o.status !== "paid" && <Button size="sm" variant="ghost" onClick={() => reject(o.id)}>Reject</Button>}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-4 space-y-3">
          <Card className="p-3 grid gap-2 md:grid-cols-4 items-end">
            <div><Label>Streak day</Label><Input type="number" min={1} value={dailyDraft.day} onChange={e => setDailyDraft({ ...dailyDraft, day: +e.target.value })} /></div>
            <div><Label>Coins</Label><Input type="number" min={1} value={dailyDraft.coins} onChange={e => setDailyDraft({ ...dailyDraft, coins: +e.target.value })} /></div>
            <Button onClick={saveDaily}>Save</Button>
          </Card>
          <div className="grid gap-2">
            {daily.map(d => (
              <Card key={d.day_number} className="p-3 flex justify-between items-center">
                <div>Day {d.day_number}</div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{d.coins} coins</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteDaily(d.day_number)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flags" className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Toggle each coin-spending feature.</p>
          {flags.map(f => (
            <Card key={f.feature} className="p-3 flex items-center justify-between">
              <div className="capitalize">{f.feature.replace("_", " ")}</div>
              <Switch checked={f.enabled} onCheckedChange={v => toggleFlag(f.feature, v)} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-3">
          <Card className="p-4 space-y-3">
            <div><Label>User ID</Label><Input value={adjust.user_id} onChange={e => setAdjust({ ...adjust, user_id: e.target.value })} placeholder="uuid" /></div>
            <div className="grid gap-2 md:grid-cols-3">
              <div><Label>Amount</Label><Input type="number" value={adjust.amount} onChange={e => setAdjust({ ...adjust, amount: +e.target.value })} /></div>
              <div>
                <Label>Direction</Label>
                <Select value={adjust.direction} onValueChange={(v) => setAdjust({ ...adjust, direction: v as "credit" | "debit" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (add / gift)</SelectItem>
                    <SelectItem value="debit">Debit (remove / refund)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Reason</Label><Input value={adjust.reason} onChange={e => setAdjust({ ...adjust, reason: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={doAdjust}>Apply</Button>
              <Button variant="outline" onClick={() => freeze(true)}>Freeze wallet</Button>
              <Button variant="outline" onClick={() => freeze(false)}>Unfreeze</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
