import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { flattenAdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Plus, Trash2, Hash } from "lucide-react";
import { useAdminSetting } from "@/lib/use-admin-setting";

export const Route = createFileRoute("/admin/chatrooms")({ component: ChatroomsHub });

interface AdminChannel { id: string; name: string; topic?: string }
interface Cfg { channels: AdminChannel[] }
const DEFAULTS: Cfg = { channels: [] };

function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "channel";
  return `adm-${base}-${Math.random().toString(36).slice(2, 6)}`;
}

function ChannelsManager() {
  const { values, patch, save, saving } = useAdminSetting<Cfg>("chat_channels_cfg", DEFAULTS);
  // We persist under `chat_channels` (array) too so ChatApp can consume it directly.
  const { patch: patchList, save: saveList, saving: savingList } = useAdminSetting<{ list: AdminChannel[] }>(
    "chat_channels",
    { list: [] },
  );
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");

  const channels = values.channels ?? [];

  async function persist(next: AdminChannel[]) {
    patch({ channels: next });
    patchList({ list: next });
    // Save both keys; ChatApp reads raw.chat_channels which the settings ctx normalizes.
    await Promise.all([save(), saveList()]);
  }

  function addChannel() {
    const n = name.trim();
    if (!n) return;
    if (channels.some(c => c.name.toLowerCase() === n.toLowerCase())) return;
    const next = [...channels, { id: slugify(n), name: n, topic: topic.trim() || undefined }];
    persist(next);
    setName("");
    setTopic("");
  }

  function removeChannel(id: string) {
    if (!confirm("Remove this channel for all users?")) return;
    persist(channels.filter(c => c.id !== id));
  }

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channels</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="ch-name">Channel name</Label>
            <Input
              id="ch-name"
              placeholder="e.g. Music"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addChannel(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ch-topic">Topic (optional)</Label>
            <Input
              id="ch-topic"
              placeholder="What's this channel about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addChannel(); }}
            />
          </div>
          <Button onClick={addChannel} disabled={!name.trim() || saving || savingList} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          {channels.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No custom channels yet. Seeded rooms (Lobby, Games) always exist.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {channels.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    {c.topic && <div className="truncate text-xs text-muted-foreground">{c.topic}</div>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChannel(c.id)}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Changes apply to all users. Removed channels disappear on their next chat load.
        </p>
      </div>
    </section>
  );
}

function ChatroomsHub() {
  const items = flattenAdminNav().filter((i) =>
    ["/admin/moderation", "/admin/bots", "/admin/filters"].includes(i.to),
  );

  return (
    <div>
      <AdminPageHeader
        title="Chatrooms"
        description="Manage channels and chatroom-only settings. Feed, games and economy live in their own sections."
      />

      <ChannelsManager />

      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chatroom settings</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.to} to={i.to} className="group">
                <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{i.label}</span>
                        {i.badge && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{i.badge}</Badge>}
                      </div>
                      {i.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{i.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
