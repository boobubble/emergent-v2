import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Bot } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, ToggleRow, NumberField } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  listAIChatbots,
  createAIChatbot,
  updateAIChatbot,
  deleteAIChatbot,
  getAIChatSettings,
  saveAIChatSettings,
} from "@/lib/ai-chatbots.functions";

export const Route = createFileRoute("/admin/ai-chatbots")({
  component: AIChatbotsPage,
});

function AIChatbotsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAIChatbots);
  const createFn = useServerFn(createAIChatbot);
  const updateFn = useServerFn(updateAIChatbot);
  const deleteFn = useServerFn(deleteAIChatbot);
  const getSettings = useServerFn(getAIChatSettings);
  const saveSettings = useServerFn(saveAIChatSettings);

  const { data: list } = useQuery({ queryKey: ["ai-chatbots"], queryFn: () => listFn({}) });
  const { data: settings } = useQuery({ queryKey: ["ai-chatbots-settings"], queryFn: () => getSettings({}) });

  const [cfg, setCfg] = useState({ enabled: false, openrouter_api_key: "", model: "openrouter/auto" });
  // hydrate cfg once settings load
  if (settings && cfg.openrouter_api_key === "" && !cfg.enabled && cfg.model === "openrouter/auto") {
    if (settings.enabled !== cfg.enabled || settings.openrouter_api_key !== cfg.openrouter_api_key || settings.model !== cfg.model) {
      // only set if different (no infinite render)
      queueMicrotask(() => setCfg(settings));
    }
  }

  const saveCfg = useMutation({
    mutationFn: () => saveSettings({ data: cfg }),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["ai-chatbots-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  // Create form
  const [form, setForm] = useState({ username: "", description: "", persona: "", rooms: "lobby", reply_chance: 0.6, cooldown_sec: 20 });
  const createMut = useMutation({
    mutationFn: () => createFn({ data: {
      username: form.username.trim(),
      description: form.description,
      persona: form.persona,
      allowed_rooms: form.rooms.split(",").map((r) => r.trim()).filter(Boolean),
      reply_chance: form.reply_chance,
      cooldown_sec: form.cooldown_sec,
    } }),
    onSuccess: () => {
      toast.success("Bot created");
      setForm({ username: "", description: "", persona: "", rooms: "lobby", reply_chance: 0.6, cooldown_sec: 20 });
      qc.invalidateQueries({ queryKey: ["ai-chatbots"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["ai-chatbots"] }); },
  });

  const updMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateFn({ data: { id, patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-chatbots"] }),
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="AI Chat Bots"
        description="Assign existing users as AI-powered bots that reply in chatrooms using OpenRouter."
      />

      <SettingsCard title="Provider settings" description="OpenRouter provides access to many AI models. Get a key at openrouter.ai/keys.">
        <ToggleRow
          label="Enable AI Chat Bots"
          desc="Master switch. When off, no AI replies are generated."
          value={cfg.enabled}
          onChange={(v) => setCfg({ ...cfg, enabled: v })}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">OpenRouter API key</Label>
          <Input
            type="password"
            placeholder="sk-or-..."
            value={cfg.openrouter_api_key}
            onChange={(e) => setCfg({ ...cfg, openrouter_api_key: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Model ID</Label>
          <Input
            placeholder="openrouter/auto"
            value={cfg.model}
            onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">e.g. <code>openai/gpt-4o-mini</code>, <code>google/gemini-2.0-flash-001</code>, <code>anthropic/claude-3.5-haiku</code></p>
        </div>
        <div>
          <Button onClick={() => saveCfg.mutate()} disabled={saveCfg.isPending}>
            {saveCfg.isPending ? "Saving…" : "Update"}
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Add a chat bot" description="Enter the username of an existing user to convert them into an AI bot.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Username</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="aria" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Rooms (comma-separated channel IDs)</Label>
            <Input value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} placeholder="lobby, games" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Helpful community greeter" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Persona / system prompt</Label>
          <Textarea rows={3} value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })} placeholder="You are a friendly community member. Keep replies short, casual, and human." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Reply chance (0–1)" value={form.reply_chance} onChange={(v) => setForm({ ...form, reply_chance: Math.max(0, Math.min(1, Number(v))) })} />
          <NumberField label="Cooldown (sec)" value={form.cooldown_sec} onChange={(v) => setForm({ ...form, cooldown_sec: Math.max(0, Math.floor(Number(v))) })} />
        </div>
        <div>
          <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.username.trim()}>
            <Plus className="size-4 mr-1" /> {createMut.isPending ? "Creating…" : "Create"}
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Existing bots" description={`${list?.bots?.length ?? 0} configured`}>
        {list?.bots?.length ? (
          <div className="space-y-3">
            {list.bots.map((b: any) => (
              <div key={b.id} className="rounded-lg border border-border p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bot className="size-4 text-primary" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        @{b.profile?.username ?? b.user_id.slice(0, 8)}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{b.description || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={b.enabled}
                        onCheckedChange={(v) => updMut.mutate({ id: b.id, patch: { enabled: v } })}
                      />
                      <span className="text-xs text-muted-foreground">{b.enabled ? "On" : "Off"}</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remove this bot?")) delMut.mutate(b.id); }}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Rooms</Label>
                    <Input
                      defaultValue={(b.allowed_rooms ?? []).join(", ")}
                      onBlur={(e) => {
                        const rooms = e.target.value.split(",").map((r) => r.trim()).filter(Boolean);
                        updMut.mutate({ id: b.id, patch: { allowed_rooms: rooms } });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Reply chance</Label>
                    <Input
                      type="number" step="0.1" min={0} max={1}
                      defaultValue={b.reply_chance}
                      onBlur={(e) => updMut.mutate({ id: b.id, patch: { reply_chance: Math.max(0, Math.min(1, Number(e.target.value))) } })}
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Cooldown (sec)</Label>
                    <Input
                      type="number" min={0}
                      defaultValue={b.cooldown_sec}
                      onBlur={(e) => updMut.mutate({ id: b.id, patch: { cooldown_sec: Math.max(0, Math.floor(Number(e.target.value))) } })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No bots configured yet.</p>
        )}
      </SettingsCard>
    </div>
  );
}
