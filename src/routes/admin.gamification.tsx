import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Trophy, Target, Sparkles, Calendar, BarChart3, Plus, Trash2 } from "lucide-react";
import { listGamCatalog, upsertGamRow, deleteGamRow, getGamificationAnalytics } from "@/lib/gamification-engine.functions";

export const Route = createFileRoute("/admin/gamification")({
  head: () => ({ meta: [{ title: "Admin · Gamification" }] }),
  component: AdminGamification,
});

type Table = "gam_achievements" | "gam_quests" | "gam_milestones" | "gam_seasons" | "gam_season_tiers";
type Row = Record<string, unknown> & { id?: string };

const TABS: { key: Table; label: string; icon: React.ReactNode; fields: string[] }[] = [
  { key: "gam_achievements", label: "Achievements", icon: <Trophy className="h-4 w-4" />,
    fields: ["key","name","description","event_type","target","reward_coins","reward_xp","reward_badge","category","active"] },
  { key: "gam_quests", label: "Quests", icon: <Target className="h-4 w-4" />,
    fields: ["key","name","cadence","event_type","target","reward_coins","reward_xp","active"] },
  { key: "gam_milestones", label: "Milestones", icon: <Sparkles className="h-4 w-4" />,
    fields: ["key","name","event_type","target","reward_coins","reward_xp","reward_badge","active"] },
  { key: "gam_seasons", label: "Seasons", icon: <Calendar className="h-4 w-4" />,
    fields: ["key","name","description","starts_at","ends_at","active"] },
  { key: "gam_season_tiers", label: "Season Tiers", icon: <Calendar className="h-4 w-4" />,
    fields: ["season_id","tier","xp_required","reward_coins","reward_xp","reward_badge","premium_only"] },
];

function AdminGamification() {
  const listFn = useServerFn(listGamCatalog);
  const upFn = useServerFn(upsertGamRow);
  const delFn = useServerFn(deleteGamRow);
  const anFn = useServerFn(getGamificationAnalytics);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Table>("gam_achievements");
  const [draft, setDraft] = useState<Row>({});
  const { data } = useQuery({ queryKey: ["gam-catalog"], queryFn: () => listFn({}) });
  const { data: analytics } = useQuery({ queryKey: ["gam-analytics"], queryFn: () => anFn({}) });
  const upsert = useMutation({
    mutationFn: (row: Row) => upFn({ data: { table: tab, row } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gam-catalog"] }); setDraft({}); },
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { table: tab, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gam-catalog"] }),
  });

  const active = TABS.find((t) => t.key === tab)!;
  const rows: Row[] = (data as Record<string, Row[]> | undefined)?.[
    tab === "gam_achievements" ? "achievements"
    : tab === "gam_quests" ? "quests"
    : tab === "gam_milestones" ? "milestones"
    : tab === "gam_seasons" ? "seasons" : "tiers"
  ] ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Trophy className="h-6 w-6 text-primary" /> Gamification</h1>
        <p className="text-sm text-muted-foreground">Manage achievements, quests, milestones, and the season pass. Rewards run through the existing Wallet, XP, Badges & Notifications systems.</p>
      </header>

      {analytics && (
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
          <div><div className="text-xs uppercase text-muted-foreground">Quest completion (7d)</div>
            <div className="text-2xl font-bold">{Math.round((analytics.questCompletionRate ?? 0) * 100)}%</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Events (7d)</div>
            <div className="text-2xl font-bold">{Object.values(analytics.events7d ?? {}).reduce((a: number, b) => a + (b as number), 0)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Top event</div>
            <div className="text-sm font-bold">{Object.entries(analytics.events7d ?? {}).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] ?? "—"}</div></div>
          <div className="sm:col-span-3">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase text-muted-foreground"><BarChart3 className="h-3 w-3" /> Events by type</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(analytics.events7d ?? {}).map(([k, v]) => (
                <span key={k} className="rounded-full border border-border bg-muted/40 px-2 py-1">{k}: <b>{v as number}</b></span>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setDraft({}); }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${tab === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold">New {active.label.slice(0, -1)}</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {active.fields.map((f) => (
            <label key={f} className="text-xs">
              <span className="text-muted-foreground">{f}</span>
              <input value={String((draft as Record<string, unknown>)[f] ?? "")}
                onChange={(e) => setDraft({ ...draft, [f]: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-sm" />
            </label>
          ))}
        </div>
        <button onClick={() => {
          const row: Row = {};
          for (const f of active.fields) {
            const v = (draft as Record<string, unknown>)[f];
            if (v === "" || v === undefined) continue;
            const numFields = ["target","reward_coins","reward_xp","tier","xp_required"];
            const boolFields = ["active","premium_only"];
            row[f] = numFields.includes(f) ? Number(v) : boolFields.includes(f) ? (v === "true" || v === true) : v;
          }
          upsert.mutate(row);
        }} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
          <Plus className="h-3 w-3" /> Save
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-left"><tr>
            {active.fields.map((f) => <th key={f} className="p-2 font-semibold">{f}</th>)}
            <th className="p-2" />
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-t border-border">
                {active.fields.map((f) => <td key={f} className="p-2">{String(r[f] ?? "")}</td>)}
                <td className="p-2 text-right">
                  <button onClick={() => del.mutate(String(r.id))} className="text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
