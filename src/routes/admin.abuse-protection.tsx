// Admin: Abuse Protection dashboard
// - Recent abuse events
// - Active temporary bans (with unban action)
// - Top offenders (last 24h)
// - Editable rate-limit configuration (app_settings.rate_limits)
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { DEFAULT_LIMITS } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/admin/abuse-protection")({ component: AbuseProtectionPage });

interface AbuseEvent {
  id: number;
  action: string;
  key: string;
  user_id: string | null;
  ip: string | null;
  severity: string;
  reason: string;
  meta: Record<string, unknown>;
  created_at: string;
}
interface Ban {
  id: number;
  key: string;
  user_id: string | null;
  action: string | null;
  reason: string;
  offense_count: number;
  banned_until: string;
  created_at: string;
}

function AbuseProtectionPage() {
  const qc = useQueryClient();

  const events = useQuery({
    queryKey: ["abuse-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abuse_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as AbuseEvent[]) ?? [];
    },
    refetchInterval: 30_000,
  });

  const bans = useQuery({
    queryKey: ["abuse-bans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_bans")
        .select("*")
        .gt("banned_until", new Date().toISOString())
        .order("banned_until", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as Ban[]) ?? [];
    },
    refetchInterval: 30_000,
  });

  const unban = useMutation({
    mutationFn: async (params: { key: string; action: string | null }) => {
      const { error } = await supabase.rpc("admin_clear_rate_limit_ban", {
        _key: params.key,
        _action: params.action ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Restriction cleared");
      qc.invalidateQueries({ queryKey: ["abuse-bans"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const topOffenders = useMemo(() => {
    const map = new Map<string, { key: string; hits: number; lastReason: string }>();
    for (const e of events.data ?? []) {
      const cur = map.get(e.key) ?? { key: e.key, hits: 0, lastReason: e.reason };
      cur.hits += 1;
      cur.lastReason = e.reason;
      map.set(e.key, cur);
    }
    return [...map.values()].sort((a, b) => b.hits - a.hits).slice(0, 10);
  }, [events.data]);

  const hitsToday = events.data?.length ?? 0;
  const activeBans = bans.data?.length ?? 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Abuse Protection"
        description="Rate limits, spam detection and progressive restrictions."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Rate-limit hits (recent)" value={hitsToday} />
        <StatCard label="Active restrictions" value={activeBans} />
        <StatCard label="Top offender" value={topOffenders[0]?.key ?? "—"} />
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Active temporary restrictions
          </h3>
          {bans.data?.length === 0 && <p className="text-sm text-muted-foreground">None right now.</p>}
          <div className="space-y-2">
            {(bans.data ?? []).map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs truncate">{b.key}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.action ?? "any"} · offenses: {b.offense_count} · until {new Date(b.banned_until).toLocaleString()}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => unban.mutate({ key: b.key, action: b.action })}>
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Top offenders (recent)</h3>
          {topOffenders.length === 0 && <p className="text-sm text-muted-foreground">No offenders logged yet.</p>}
          <div className="space-y-1">
            {topOffenders.map((o) => (
              <div key={o.key} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs">{o.key}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{o.hits} hits</Badge>
                  <span className="text-xs text-muted-foreground">{o.lastReason}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Recent events</h3>
          <div className="max-h-96 space-y-1 overflow-y-auto text-xs">
            {(events.data ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 border-b py-1">
                <span className="truncate">
                  <Badge variant="outline" className="mr-2">{e.action}</Badge>
                  <span className="font-mono">{e.key}</span>
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {e.reason} · {new Date(e.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {events.data?.length === 0 && <p className="text-sm text-muted-foreground">No events recorded.</p>}
          </div>
        </CardContent>
      </Card>

      <LimitsEditor />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

type LimitsMap = Record<string, { limit: number; window: number }>;

function LimitsEditor() {
  const defaults: LimitsMap = DEFAULT_LIMITS;
  const { values, patch, save, saving } = useAdminSetting<LimitsMap>("rate_limits", defaults);
  const [local, setLocal] = useState<LimitsMap>(defaults);

  useEffect(() => { setLocal({ ...defaults, ...values }); }, [values]);

  const update = (action: string, field: "limit" | "window", v: number) => {
    setLocal((s) => ({ ...s, [action]: { ...s[action], [field]: v } }));
  };

  const commit = () => {
    patch(local);
    save();
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Configurable limits</h3>
          <Button size="sm" onClick={commit} disabled={saving}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Requests per window (seconds), per user (authenticated) or per IP (visitors). Admins bypass automatically.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(local).sort(([a], [b]) => a.localeCompare(b)).map(([action, def]) => (
            <div key={action} className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 rounded-md border p-2 text-xs">
              <span className="font-mono truncate">{action}</span>
              <div>
                <Label className="text-[10px]">Limit</Label>
                <Input type="number" min={1} value={def.limit}
                  onChange={(e) => update(action, "limit", Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div>
                <Label className="text-[10px]">Window (s)</Label>
                <Input type="number" min={1} value={def.window}
                  onChange={(e) => update(action, "window", Math.max(1, Number(e.target.value) || 1))} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
