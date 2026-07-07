import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/wallet-analytics")({
  component: AdminWalletAnalyticsPage,
  head: () => ({
    meta: [
      { title: "Economy Analytics · Admin" },
      { name: "description", content: "Live health metrics for the coins economy: circulation, spend, leaderboards, and feature usage." },
    ],
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type Summary = Record<string, number>;
type Series = { day: string; earned: number; spent: number; purchased: number; refunded: number };
type LB = { top_holders: Array<{ user_id: string; username: string; coins: number }>; top_earners: Array<any>; top_spenders: Array<any> };
type Feature = { feature: string; label: string; enabled: boolean; coin_cost: number; total_tx: number; total_revenue: number; unique_users: number; avg_cost: number; last_used: string | null };
type Kind = { kind: string; total: number; tx_count: number; unique_users: number };

const N = (v: unknown) => (typeof v === "number" ? v.toLocaleString() : String(v ?? 0));

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Card>
  );
}

function AdminWalletAnalyticsPage() {
  const [summary, setSummary] = useState<Summary>({});
  const [series, setSeries] = useState<Series[]>([]);
  const [days, setDays] = useState(30);
  const [lb, setLb] = useState<LB>({ top_holders: [], top_earners: [], top_spenders: [] });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [sources, setSources] = useState<Kind[]>([]);
  const [sinks, setSinks] = useState<Kind[]>([]);
  const [suspicious, setSuspicious] = useState<any[]>([]);

  const load = async () => {
    const [s, t, l, f, cs, ds, su] = await Promise.all([
      sb.rpc("wallet_analytics_summary"),
      sb.rpc("wallet_analytics_timeseries", { _days: days }),
      sb.rpc("wallet_analytics_leaderboards", { _limit: 10 }),
      sb.rpc("wallet_analytics_feature_stats"),
      sb.rpc("wallet_analytics_top_kinds", { _direction: "credit", _limit: 10 }),
      sb.rpc("wallet_analytics_top_kinds", { _direction: "debit", _limit: 10 }),
      sb.from("wallet_suspicious_events").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (s.error) toast.error(s.error.message);
    setSummary(s.data ?? {});
    setSeries((t.data ?? []).map((r: any) => ({ ...r, day: String(r.day).slice(5) })));
    setLb(l.data ?? { top_holders: [], top_earners: [], top_spenders: [] });
    setFeatures(f.data ?? []);
    setSources(cs.data ?? []);
    setSinks(ds.data ?? []);
    setSuspicious(su.data ?? []);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [days]);

  const exportCsv = (rows: any[], name: string) => {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = (rows: any[], name: string) => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <AdminPageHeader
        title="Economy Analytics"
        description="Live monitoring of the coins economy — circulation, spend, feature health, and suspicious activity."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Coins in Circulation" value={N(summary.circulation)} />
        <Stat label="Earned Today" value={N(summary.earned_today)} />
        <Stat label="Spent Today" value={N(summary.spent_today)} />
        <Stat label="Purchased Today" value={N(summary.purchased_today)} />
        <Stat label="Rewarded Today" value={N(summary.rewarded_today)} />
        <Stat label="Refunded Today" value={N(summary.refunded_today)} />
        <Stat label="Avg Wallet Balance" value={N(summary.avg_balance)} />
        <Stat label="Largest Wallet" value={N(summary.max_balance)} />
        <Stat label="Smallest Wallet" value={N(summary.min_balance)} />
        <Stat label="Users" value={N(summary.total_users)} />
        <Stat label="Active Bonus Events" value={N(summary.active_bonus_events)} />
        <Stat label="Open Suspicious" value={N(summary.suspicious_open)} />
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="features">Feature Stats</TabsTrigger>
          <TabsTrigger value="sources">Sources & Sinks</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-3">
          <div className="flex gap-2">
            {[7, 30, 90, 365].map(d => (
              <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
                {d}d
              </Button>
            ))}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => exportCsv(series, `wallet-timeseries-${days}d`)}>CSV</Button>
              <Button size="sm" variant="outline" onClick={() => exportJson(series, `wallet-timeseries-${days}d`)}>JSON</Button>
            </div>
          </div>
          <Card className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earned" stroke="#22c55e" dot={false} />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" dot={false} />
                <Line type="monotone" dataKey="purchased" stroke="#3b82f6" dot={false} />
                <Line type="monotone" dataKey="refunded" stroke="#f59e0b" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="grid md:grid-cols-3 gap-3">
          {(["top_holders", "top_earners", "top_spenders"] as const).map(k => (
            <Card key={k} className="p-4">
              <div className="font-semibold mb-2 capitalize">{k.replace("_", " ")}</div>
              <ol className="space-y-1 text-sm">
                {(lb[k] ?? []).map((r: any, i: number) => (
                  <li key={r.user_id} className="flex justify-between">
                    <span>{i + 1}. {r.username ?? r.user_id.slice(0, 8)}</span>
                    <span className="tabular-nums">{N(r.coins ?? r.total)}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features" className="space-y-2">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCsv(features, "wallet-features")}>CSV</Button>
            <Button size="sm" variant="outline" onClick={() => exportJson(features, "wallet-features")}>JSON</Button>
          </div>
          <Card className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-2">Feature</th><th className="p-2">Status</th>
                  <th className="p-2">Cost</th><th className="p-2">Transactions</th>
                  <th className="p-2">Revenue</th><th className="p-2">Unique users</th>
                  <th className="p-2">Avg cost</th><th className="p-2">Last used</th>
                </tr>
              </thead>
              <tbody>
                {features.map(f => (
                  <tr key={f.feature} className="border-t">
                    <td className="p-2">{f.label} <span className="text-xs text-muted-foreground">({f.feature})</span></td>
                    <td className="p-2"><Badge variant={f.enabled ? "default" : "secondary"}>{f.enabled ? "on" : "off"}</Badge></td>
                    <td className="p-2">{N(f.coin_cost)}</td>
                    <td className="p-2">{N(f.total_tx)}</td>
                    <td className="p-2">{N(f.total_revenue)}</td>
                    <td className="p-2">{N(f.unique_users)}</td>
                    <td className="p-2">{N(f.avg_cost)}</td>
                    <td className="p-2 text-xs">{f.last_used ? new Date(f.last_used).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="grid md:grid-cols-2 gap-3">
          <Card className="p-4 h-80">
            <div className="font-semibold mb-2">Top Sources (Credits)</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={sources}>
                <XAxis dataKey="kind" /><YAxis /><Tooltip />
                <Bar dataKey="total" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 h-80">
            <div className="font-semibold mb-2">Top Sinks (Debits)</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={sinks}>
                <XAxis dataKey="kind" /><YAxis /><Tooltip />
                <Bar dataKey="total" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious">
          <Card className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-2">When</th><th className="p-2">User</th>
                  <th className="p-2">Category</th><th className="p-2">Severity</th>
                  <th className="p-2">Reviewed</th><th className="p-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {suspicious.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 text-xs">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="p-2 text-xs">{s.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="p-2">{s.category}</td>
                    <td className="p-2">{s.severity}</td>
                    <td className="p-2">{s.reviewed ? "yes" : "no"}</td>
                    <td className="p-2 text-xs"><code>{JSON.stringify(s.detail)}</code></td>
                  </tr>
                ))}
                {suspicious.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No suspicious events logged.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
