import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Star, Sparkles, Plus, Save, Eye, EyeOff } from "lucide-react";
import {
  adminListMehfilCategories,
  adminSaveMehfilCategory,
  adminDeleteMehfilCategory,
  adminListMehfilPoems,
  adminUpdatePoem,
  adminDeletePoem,
  getMehfilSettings,
  adminSaveMehfilSettings,
} from "@/lib/mehfil-admin.functions";
import type { MehfilCategory, MehfilPoem, MehfilSettings } from "@/lib/mehfil-types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/mehfil")({
  head: () => ({ meta: [{ title: "Mehfil Admin" }, { name: "robots", content: "noindex" }] }),
  component: MehfilAdmin,
});

const TABS = ["Poetry", "Categories", "Settings"] as const;
type Tab = typeof TABS[number];

function MehfilAdmin() {
  const [tab, setTab] = useState<Tab>("Poetry");
  return (
    <div className="mx-auto max-w-6xl p-4">
      <AdminPageHeader
        title="Mehfil"
        description="Poetry community — moderate poems, manage categories, configure Mehfil settings."
      />
      <div className="mt-4 mb-6 flex gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{t}</button>
        ))}
      </div>
      {tab === "Poetry" && <PoemsTab />}
      {tab === "Categories" && <CategoriesTab />}
      {tab === "Settings" && <SettingsTab />}
    </div>
  );
}

function PoemsTab() {
  const fetchPoems = useServerFn(adminListMehfilPoems);
  const update = useServerFn(adminUpdatePoem);
  const del = useServerFn(adminDeletePoem);
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: ["admin", "mehfil", "poems", status, search],
    queryFn: () => fetchPoems({ data: { status: status || undefined, search: search || undefined } }),
  });
  const inval = () => qc.invalidateQueries({ queryKey: ["admin", "mehfil", "poems"] });
  const m = useMutation({ mutationFn: (v: { id: string; patch: any }) => update({ data: v }), onSuccess: () => { toast.success("Updated"); inval(); } });
  const d = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); inval(); } });

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {(q.data ?? []).map((p: MehfilPoem) => (
          <div key={p.id} className="flex items-center gap-3 p-3 border-b border-border/40 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.title}</div>
              <div className="text-[11px] text-muted-foreground">{p.status} · {p.upvote_count} upvotes · {p.read_count} reads · {p.slug}</div>
            </div>
            <button onClick={() => m.mutate({ id: p.id, patch: { is_editors_pick: !p.is_editors_pick } })} className={`p-2 rounded-md hover:bg-muted ${p.is_editors_pick ? "text-amber-500" : ""}`} title="Toggle Editor's Pick">
              <Star className="h-4 w-4" />
            </button>
            <button onClick={() => m.mutate({ id: p.id, patch: { status: p.status === "published" ? "archived" : "published" } })} className="p-2 rounded-md hover:bg-muted" title="Toggle publish">
              {p.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => { if (confirm("Delete this poem?")) d.mutate(p.id); }} className="p-2 rounded-md text-destructive hover:bg-destructive/10" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {q.data && q.data.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No poems match.</div>}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const list = useServerFn(adminListMehfilCategories);
  const save = useServerFn(adminSaveMehfilCategory);
  const del = useServerFn(adminDeleteMehfilCategory);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "mehfil", "cats"], queryFn: () => list() });
  const inval = () => qc.invalidateQueries({ queryKey: ["admin", "mehfil", "cats"] });
  const s = useMutation({ mutationFn: (v: any) => save({ data: v }), onSuccess: () => { toast.success("Saved"); inval(); } });
  const d = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); inval(); } });
  const [draft, setDraft] = useState<Partial<MehfilCategory>>({ name: "", slug: "", color: "#8b5cf6", is_active: true, sort_order: 0 });

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {(q.data ?? []).map((c: MehfilCategory) => (
          <div key={c.id} className="flex items-center gap-3 p-3 border-b border-border/40 last:border-0">
            <span className="h-4 w-4 rounded-full" style={{ background: c.color ?? "#8b5cf6" }} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">/{c.slug} · {c.is_active ? "active" : "hidden"}</div>
            </div>
            <button onClick={() => setDraft(c)} className="text-xs font-semibold text-primary">Edit</button>
            <button onClick={() => { if (confirm("Delete category?")) d.mutate(c.id); }} className="p-2 rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <aside className="rounded-xl border border-border/60 bg-card p-4 space-y-3 h-fit">
        <h3 className="font-semibold text-sm flex items-center gap-1"><Plus className="h-4 w-4" /> {draft.id ? "Edit" : "New"} category</h3>
        <input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input value={draft.slug ?? ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="slug" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input type="color" value={draft.color ?? "#8b5cf6"} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-9 w-14 rounded border border-border" />
          <input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} placeholder="Order" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_active ?? true} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <button
          onClick={() => { if (!draft.name || !draft.slug) return toast.error("Name + slug required"); s.mutate(draft); setDraft({ name: "", slug: "", color: "#8b5cf6", is_active: true, sort_order: 0 }); }}
          disabled={s.isPending}
          className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        ><Save className="h-4 w-4" /> Save</button>
        {draft.id && <button onClick={() => setDraft({ name: "", slug: "", color: "#8b5cf6", is_active: true, sort_order: 0 })} className="w-full text-xs text-muted-foreground">Cancel edit</button>}
      </aside>
    </div>
  );
}

function SettingsTab() {
  const load = useServerFn(getMehfilSettings);
  const save = useServerFn(adminSaveMehfilSettings);
  const q = useQuery({ queryKey: ["admin", "mehfil", "settings"], queryFn: () => load() });
  const [form, setForm] = useState<MehfilSettings | null>(null);
  const current = form ?? q.data ?? null;
  const m = useMutation({ mutationFn: (v: MehfilSettings) => save({ data: v }), onSuccess: (d) => { toast.success("Saved"); setForm(d); } });

  if (!current) return <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>;

  const T = ({ k, label }: { k: keyof MehfilSettings; label: string }) => (
    <label className="flex items-center justify-between gap-3 p-3 border-b border-border/40">
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={!!current[k]} onChange={(e) => setForm({ ...current, [k]: e.target.checked })} />
    </label>
  );

  return (
    <div className="max-w-xl rounded-xl border border-border/60 bg-card overflow-hidden">
      <T k="enabled" label="Enable Mehfil" />
      <T k="battles_enabled" label="Enable Poetry Battles" />
      <T k="upvotes_enabled" label="Enable Upvotes" />
      <T k="comments_enabled" label="Enable Comments" />
      <T k="reactions_enabled" label="Enable Reactions" />
      <T k="shares_enabled" label="Enable Shares" />
      <T k="ai_assist_enabled" label="Enable AI Assist in Composer" />
      <T k="auto_publish_winners" label="Auto-publish Battle Winners to Feed" />
      <label className="flex items-center justify-between gap-3 p-3 border-b border-border/40">
        <span className="text-sm">Trending widget frequency (every N posts)</span>
        <input type="number" min={2} max={30} value={current.trending_widget_frequency} onChange={(e) => setForm({ ...current, trending_widget_frequency: Number(e.target.value) })} className="w-20 rounded border border-border bg-background px-2 py-1 text-sm" />
      </label>
      <div className="p-3">
        <button onClick={() => m.mutate(current)} disabled={m.isPending} className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" /> Save Settings</button>
      </div>
    </div>
  );
}
