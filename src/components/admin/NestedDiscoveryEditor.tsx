import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DiscoveryNestedOption, DiscoveryPrimaryOption } from "@/lib/discovery/discovery-options";
import type { DiscoveryLocalizationConfig } from "@/lib/discovery/config";

type Props = {
  nestedOptions: DiscoveryNestedOption[];
  primaryOptions: DiscoveryPrimaryOption[];
  onChange: (next: DiscoveryNestedOption[]) => void;
};

const KINDS: DiscoveryNestedOption["kind"][] = ["city", "region", "topic"];

export function NestedDiscoveryEditor({ nestedOptions, primaryOptions, onChange }: Props) {
  const [editing, setEditing] = useState<DiscoveryNestedOption | null>(null);

  function updateAt(index: number, patch: Partial<DiscoveryNestedOption>) {
    const next = [...nestedOptions];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeAt(index: number) {
    const item = nestedOptions[index];
    if (!window.confirm(`Remove "${item.label}"? Users who selected it will keep saved prefs but ranking will fall back.`)) return;
    onChange(nestedOptions.filter((_, i) => i !== index));
  }

  function addNew() {
    const parent = primaryOptions.find((p) => p.enabled)?.id ?? "global";
    setEditing({
      slug: `new-option-${Date.now()}`,
      label: "New option",
      emoji: null,
      kind: "topic",
      parentId: parent,
      countryCode: primaryOptions.find((p) => p.id === parent)?.countryCode ?? null,
      sortOrder: (nestedOptions.length + 1) * 10,
      enabled: true,
    });
  }

  function saveEditing() {
    if (!editing) return;
    const exists = nestedOptions.findIndex((n) => n.slug === editing.slug);
    if (exists >= 0) {
      const next = [...nestedOptions];
      next[exists] = editing;
      onChange(next);
    } else {
      onChange([...nestedOptions, editing].sort((a, b) => a.sortOrder - b.sortOrder));
    }
    setEditing(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Manage cities, regions and topics without editing raw JSON.</p>
        <Button type="button" size="sm" variant="outline" onClick={addNew}>Add option</Button>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {nestedOptions.map((n, i) => (
          <div key={n.slug} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-xs">
            <span>{n.emoji ?? "•"}</span>
            <span className="font-medium">{n.label}</span>
            <span className="text-muted-foreground">({n.kind} · {n.parentId})</span>
            <label className="ml-auto inline-flex items-center gap-1">
              <input type="checkbox" checked={n.enabled} onChange={(e) => updateAt(i, { enabled: e.target.checked })} />
              Enabled
            </label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(n)}>Edit</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => removeAt(i)}>Delete</Button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
            </div>
            <div>
              <Label className="text-xs">Emoji</Label>
              <Input value={editing.emoji ?? ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value || null })} />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as DiscoveryNestedOption["kind"] })}>
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Parent region</Label>
              <select
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                value={editing.parentId}
                onChange={(e) => {
                  const p = primaryOptions.find((x) => x.id === e.target.value);
                  setEditing({ ...editing, parentId: e.target.value, countryCode: p?.countryCode ?? null });
                }}
              >
                {primaryOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Sort order</Label>
              <Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={saveEditing}>Save option</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModuleRolloutSection({
  modules,
  onChange,
}: {
  modules: DiscoveryLocalizationConfig["modules"];
  onChange: (modules: DiscoveryLocalizationConfig["modules"]) => void;
}) {
  const rows: { key: keyof DiscoveryLocalizationConfig["modules"]; label: string; connected: boolean }[] = [
    { key: "chatrooms", label: "Apply to Chatrooms", connected: true },
    { key: "feed", label: "Apply to Feed", connected: true },
    { key: "poetry", label: "Apply to Poetry", connected: false },
    { key: "competitions", label: "Apply to Competitions", connected: false },
    { key: "communities", label: "Apply to Communities", connected: false },
    { key: "profiles", label: "Apply to Profiles", connected: false },
    { key: "games", label: "Apply to Games", connected: false },
  ];
  return (
    <div className="space-y-2">
      {rows.map(({ key, label, connected }) => (
        <div key={key} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <div>
            <span className="text-sm">{label}</span>
            {!connected && <span className="ml-2 text-[10px] font-medium uppercase text-amber-600">Not connected yet</span>}
          </div>
          <input
            type="checkbox"
            checked={modules[key]}
            onChange={(e) => onChange({ ...modules, [key]: e.target.checked })}
          />
        </div>
      ))}
    </div>
  );
}
