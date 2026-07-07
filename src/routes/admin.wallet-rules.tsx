import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/wallet-rules")({
  component: AdminWalletRulesPage,
  head: () => ({
    meta: [
      { title: "Wallet Rules Engine · Admin" },
      { name: "description", content: "Configure pricing, limits, and bonus events for every coins-based feature." },
    ],
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type Rule = {
  id: string;
  feature: string;
  label: string;
  enabled: boolean;
  coin_cost: number;
  coin_reward: number;
  premium_only: boolean;
  vip_only: boolean;
  daily_limit: number | null;
  weekly_limit: number | null;
  monthly_limit: number | null;
  cooldown_seconds: number | null;
  min_xp_level: number | null;
  min_account_age_days: number | null;
  min_reputation: number | null;
  required_plan_slug: string | null;
  required_badge: string | null;
  max_per_event: number | null;
  max_per_conversation: number | null;
  max_per_day: number | null;
  refund_window_seconds: number | null;
};

type BonusEvent = {
  id: string;
  name: string;
  description: string | null;
  feature: string | null;
  price_multiplier: number;
  reward_multiplier: number;
  starts_at: string;
  ends_at: string | null;
  enabled: boolean;
};

const NUM_FIELDS: (keyof Rule)[] = [
  "coin_cost", "coin_reward",
  "daily_limit", "weekly_limit", "monthly_limit", "cooldown_seconds",
  "min_xp_level", "min_account_age_days", "min_reputation",
  "max_per_event", "max_per_conversation", "max_per_day", "refund_window_seconds",
];

function AdminWalletRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [newFeature, setNewFeature] = useState({ feature: "", label: "" });
  const [newEvent, setNewEvent] = useState<Partial<BonusEvent>>({
    name: "", price_multiplier: 1, reward_multiplier: 1, enabled: true,
  });

  const load = async () => {
    const [r, e] = await Promise.all([
      sb.from("wallet_rules").select("*").order("label"),
      sb.from("wallet_bonus_events").select("*").order("created_at", { ascending: false }),
    ]);
    setRules(r.data ?? []);
    setEvents(e.data ?? []);
  };
  useEffect(() => { void load(); }, []);

  const patchRule = (id: string, patch: Partial<Rule>) =>
    setRules(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));

  const saveRule = async (r: Rule) => {
    const { error } = await sb.from("wallet_rules").update(r).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${r.label}`);
  };

  const addFeature = async () => {
    if (!newFeature.feature || !newFeature.label) return toast.error("feature key and label required");
    const { error } = await sb.from("wallet_rules").insert({
      feature: newFeature.feature.trim(),
      label: newFeature.label.trim(),
    });
    if (error) return toast.error(error.message);
    setNewFeature({ feature: "", label: "" });
    void load();
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this feature rule?")) return;
    const { error } = await sb.from("wallet_rules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const addEvent = async () => {
    if (!newEvent.name) return toast.error("event name required");
    const { error } = await sb.from("wallet_bonus_events").insert({
      name: newEvent.name,
      description: newEvent.description ?? null,
      feature: newEvent.feature || null,
      price_multiplier: newEvent.price_multiplier ?? 1,
      reward_multiplier: newEvent.reward_multiplier ?? 1,
      starts_at: newEvent.starts_at ?? new Date().toISOString(),
      ends_at: newEvent.ends_at || null,
      enabled: newEvent.enabled ?? true,
    });
    if (error) return toast.error(error.message);
    setNewEvent({ name: "", price_multiplier: 1, reward_multiplier: 1, enabled: true });
    void load();
  };

  const toggleEvent = async (e: BonusEvent) => {
    const { error } = await sb.from("wallet_bonus_events").update({ enabled: !e.enabled }).eq("id", e.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this bonus event?")) return;
    const { error } = await sb.from("wallet_bonus_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <AdminPageHeader
        title="Wallet Rules Engine"
        description="Configure pricing, limits, and bonus events for every coins-based feature. Changes apply immediately."
      />

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Feature Rules</TabsTrigger>
          <TabsTrigger value="events">Bonus Events</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card className="p-4 flex flex-wrap gap-2 items-end">
            <div>
              <Label>Feature key</Label>
              <Input value={newFeature.feature}
                     onChange={e => setNewFeature(f => ({ ...f, feature: e.target.value }))}
                     placeholder="e.g. sticker_pack" />
            </div>
            <div>
              <Label>Label</Label>
              <Input value={newFeature.label}
                     onChange={e => setNewFeature(f => ({ ...f, label: e.target.value }))}
                     placeholder="Sticker Packs" />
            </div>
            <Button onClick={addFeature}><Plus className="w-4 h-4 mr-1" />Add feature</Button>
          </Card>

          {rules.map(r => (
            <Card key={r.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-lg font-semibold">{r.label}</div>
                  <div className="text-xs text-muted-foreground">key: <code>{r.feature}</code></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.enabled ? "default" : "secondary"}>
                    {r.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch checked={r.enabled} onCheckedChange={v => patchRule(r.id, { enabled: v })} />
                  <Button size="sm" onClick={() => saveRule(r)}><Save className="w-4 h-4 mr-1" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteRule(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {NUM_FIELDS.map(f => (
                  <div key={f}>
                    <Label className="text-xs">{f}</Label>
                    <Input
                      type="number"
                      value={(r[f] as number | null) ?? ""}
                      onChange={e =>
                        patchRule(r.id, { [f]: e.target.value === "" ? null : Number(e.target.value) } as Partial<Rule>)
                      }
                    />
                  </div>
                ))}
                <div>
                  <Label className="text-xs">required_plan_slug</Label>
                  <Input value={r.required_plan_slug ?? ""}
                         onChange={e => patchRule(r.id, { required_plan_slug: e.target.value || null })} />
                </div>
                <div>
                  <Label className="text-xs">required_badge</Label>
                  <Input value={r.required_badge ?? ""}
                         onChange={e => patchRule(r.id, { required_badge: e.target.value || null })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={r.premium_only} onCheckedChange={v => patchRule(r.id, { premium_only: v })} />
                  <Label className="text-xs">premium_only</Label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={r.vip_only} onCheckedChange={v => patchRule(r.id, { vip_only: v })} />
                  <Label className="text-xs">vip_only</Label>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="p-4 grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input value={newEvent.name ?? ""}
                     onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))}
                     placeholder="Double Coins Weekend" />
            </div>
            <div>
              <Label>Feature (blank = all)</Label>
              <Input value={newEvent.feature ?? ""}
                     onChange={e => setNewEvent(v => ({ ...v, feature: e.target.value }))}
                     placeholder="wallpaper" />
            </div>
            <div>
              <Label>Price ×</Label>
              <Input type="number" step="0.05"
                     value={newEvent.price_multiplier ?? 1}
                     onChange={e => setNewEvent(v => ({ ...v, price_multiplier: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Reward ×</Label>
              <Input type="number" step="0.05"
                     value={newEvent.reward_multiplier ?? 1}
                     onChange={e => setNewEvent(v => ({ ...v, reward_multiplier: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Ends</Label>
              <Input type="datetime-local"
                     value={newEvent.ends_at ?? ""}
                     onChange={e => setNewEvent(v => ({ ...v, ends_at: e.target.value }))} />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button onClick={addEvent}><Plus className="w-4 h-4 mr-1" />Add event</Button>
            </div>
          </Card>

          {events.map(e => (
            <Card key={e.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {e.feature ?? "all features"} · price ×{e.price_multiplier} · reward ×{e.reward_multiplier}
                  {e.ends_at ? ` · ends ${new Date(e.ends_at).toLocaleString()}` : " · no end"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={e.enabled ? "default" : "secondary"}>{e.enabled ? "Live" : "Paused"}</Badge>
                <Switch checked={e.enabled} onCheckedChange={() => toggleEvent(e)} />
                <Button size="sm" variant="ghost" onClick={() => deleteEvent(e.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
