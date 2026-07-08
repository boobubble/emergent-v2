import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { flattenAdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, Trash2, Hash, Gamepad2 } from "lucide-react";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { listGames } from "@/lib/games-registry";
import type { RoomGameConfig } from "@/lib/chat-types";

export const Route = createFileRoute("/admin/chatrooms")({ component: ChatroomsHub });

interface AdminChannel {
  id: string;
  name: string;
  topic?: string;
  kind?: "chat" | "game";
  game?: RoomGameConfig;
}

function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "channel";
  return `adm-${base}-${Math.random().toString(36).slice(2, 6)}`;
}

const GAME_OPTIONS = listGames();
const DEFAULT_GAME_CFG: RoomGameConfig = {
  type: GAME_OPTIONS[0]?.key ?? "",
  difficulty: "normal",
  spectators: true,
  coinReward: 10,
  xpReward: 20,
};

function ChannelsManager() {
  const { values, patch, save, saving } = useAdminSetting<{ list: AdminChannel[] }>(
    "chat_channels",
    { list: [] },
  );
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<"chat" | "game">("chat");
  const [game, setGame] = useState<RoomGameConfig>(DEFAULT_GAME_CFG);

  const channels = values.list ?? [];

  function persist(next: AdminChannel[]) {
    patch({ list: next });
    setTimeout(() => save(), 0);
  }

  function addChannel() {
    const n = name.trim();
    if (!n) return;
    if (channels.some(c => c.name.toLowerCase() === n.toLowerCase())) return;
    const entry: AdminChannel = {
      id: slugify(n),
      name: n,
      topic: topic.trim() || undefined,
      kind,
      game: kind === "game" ? game : undefined,
    };
    persist([...channels, entry]);
    setName("");
    setTopic("");
    setKind("chat");
    setGame(DEFAULT_GAME_CFG);
  }

  function removeChannel(id: string) {
    if (!confirm("Remove this channel for all users?")) return;
    persist(channels.filter(c => c.id !== id));
  }

  const setG = <K extends keyof RoomGameConfig>(k: K, v: RoomGameConfig[K]) =>
    setGame(prev => ({ ...prev, [k]: v }));

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channels</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ch-name">Channel name</Label>
            <Input
              id="ch-name"
              placeholder="e.g. Music"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ch-topic">Topic (optional)</Label>
            <Input
              id="ch-topic"
              placeholder="What's this channel about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Room type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "chat" | "game")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat Room</SelectItem>
                <SelectItem value="game">Game Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {kind === "game" && (
            <div className="space-y-1.5">
              <Label>Game</Label>
              <Select value={game.type} onValueChange={(v) => setG("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GAME_OPTIONS.map(g => (
                    <SelectItem key={g.key} value={g.key}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {kind === "game" && (
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Gamepad2 className="h-3.5 w-3.5" /> Game Room settings
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={game.difficulty ?? "normal"} onValueChange={(v) => setG("difficulty", v as RoomGameConfig["difficulty"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Entry fee (coins)</Label>
                <Input type="number" min={0} value={game.entryFeeCoins ?? 0}
                  onChange={(e) => setG("entryFeeCoins", Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Coin reward</Label>
                <Input type="number" min={0} value={game.coinReward ?? 0}
                  onChange={(e) => setG("coinReward", Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>XP reward</Label>
                <Input type="number" min={0} value={game.xpReward ?? 0}
                  onChange={(e) => setG("xpReward", Number(e.target.value) || 0)} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <ToggleRow label="Daily Challenge" checked={!!game.dailyChallenge} onChange={(v) => setG("dailyChallenge", v)} />
              <ToggleRow label="Tournament" checked={!!game.tournament} onChange={(v) => setG("tournament", v)} />
              <ToggleRow label="Spectators" checked={!!game.spectators} onChange={(v) => setG("spectators", v)} />
              <ToggleRow label="Featured" checked={!!game.featured} onChange={(v) => setG("featured", v)} />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={addChannel} disabled={!name.trim() || saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add channel
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          {channels.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No custom channels yet. Seeded rooms (Lobby, Games) always exist.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {channels.map((c) => {
                const isGame = c.kind === "game";
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    {isGame ? (
                      <Gamepad2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate text-sm font-semibold">
                        {c.name}
                        {isGame && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase">
                            {c.game?.type ?? "game"}
                          </Badge>
                        )}
                        {c.game?.featured && (
                          <Badge className="h-5 bg-amber-400/20 px-1.5 text-[10px] text-amber-300">Featured</Badge>
                        )}
                      </div>
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
                );
              })}
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

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
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
