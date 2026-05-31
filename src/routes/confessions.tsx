import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Heart, MessageCircle, Plus, Pin, Sparkles, Send, Flag, Loader2, Shield, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllSettings } from "@/lib/admin.functions";
import {
  listConfessions, createConfession, toggleReaction, listReplies, createReply, moderateConfession,
} from "@/lib/confessions.functions";
import {
  CONFESSIONS_DEFAULTS,
  REACTION_META,
  type ConfessionsConfig,
  type ConfessionDisplayMode,
  type ConfessionKind,
  type ConfessionReactionType,
} from "@/lib/confessions-config";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/confessions")({
  head: () => ({
    meta: [
      { title: "Confessions — Share anonymously" },
      { name: "description", content: "A safe space to share secrets, ask for advice, and connect anonymously." },
      { property: "og:title", content: "Confessions" },
      { property: "og:description", content: "Anonymous community confessions, polls, and questions." },
    ],
  }),
  component: ConfessionsPage,
});

function useConfig(): ConfessionsConfig {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({ queryKey: ["app-settings"], queryFn: () => fetchSettings({}) });
  return useMemo(() => ({ ...CONFESSIONS_DEFAULTS, ...((data?.confessions as Partial<ConfessionsConfig>) ?? {}) }), [data]);
}

function ConfessionsPage() {
  const cfg = useConfig();
  const { user } = useAuth();
  const [sort, setSort] = useState<"recent" | "trending" | "most_liked" | "most_replied">("trending");
  const [category, setCategory] = useState<string>("all");
  const [composerOpen, setComposerOpen] = useState(false);

  const list = useServerFn(listConfessions);
  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ["confessions", sort, category],
    queryFn: () => list({ data: { sort, category, limit: 50 } }),
    enabled: cfg.enabled,
  });

  if (!cfg.enabled) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Confessions are disabled</h1>
          <p className="mt-2 text-sm text-muted-foreground">This module is currently turned off by the admin.</p>
          <a href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <a href="/" className="rounded-full p-2 hover:bg-accent" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </a>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Confessions</h1>
            <p className="text-xs text-muted-foreground">Share anything, anonymously.</p>
          </div>
          <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Confess</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New confession</DialogTitle></DialogHeader>
              <Composer cfg={cfg} onPosted={() => { setComposerOpen(false); refetch(); }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3">
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="✨ All" />
          {cfg.categories.map((c) => (
            <CategoryChip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)} label={`${c.emoji ?? ""} ${c.label}`} />
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-4">
        {/* Sort */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {cfg.leaderboards.trending && (
            <SortChip active={sort === "trending"} onClick={() => setSort("trending")} label="🔥 Trending" />
          )}
          <SortChip active={sort === "recent"} onClick={() => setSort("recent")} label="🆕 Recent" />
          {cfg.leaderboards.mostLiked && (
            <SortChip active={sort === "most_liked"} onClick={() => setSort("most_liked")} label="❤️ Most liked" />
          )}
          {cfg.leaderboards.mostReplied && (
            <SortChip active={sort === "most_replied"} onClick={() => setSort("most_replied")} label="💬 Most replied" />
          )}
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (items ?? []).length === 0 ? (
          <EmptyState onCompose={() => setComposerOpen(true)} />
        ) : (
          <div className="space-y-4">
            {(items ?? []).map((it: any) => (
              <ConfessionCard key={it.id} item={it} cfg={cfg} viewerIsAuthor={it.author_id === user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

function SortChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-foreground text-background" : "bg-accent text-foreground hover:bg-accent/80"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <Sparkles className="mx-auto h-10 w-10 text-primary" />
      <p className="mt-3 text-lg font-bold">No confessions yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Be the first to share something.</p>
      <Button className="mt-4 gap-1.5" onClick={onCompose}><Plus className="h-4 w-4" /> Post the first one</Button>
    </div>
  );
}

/* =================== Composer =================== */
function Composer({ cfg, onPosted }: { cfg: ConfessionsConfig; onPosted: () => void }) {
  const enabledKinds = (Object.keys(cfg.kinds) as ConfessionKind[]).filter((k) => cfg.kinds[k]);
  const enabledModes = (Object.keys(cfg.anonymousModes) as ConfessionDisplayMode[]).filter((m) => cfg.anonymousModes[m]);
  const [kind, setKind] = useState<ConfessionKind>(enabledKinds[0] ?? "text");
  const [mode, setMode] = useState<ConfessionDisplayMode>(enabledModes[0] ?? "fully_anonymous");
  const [category, setCategory] = useState(cfg.categories[0]?.key ?? "secrets");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState<string[]>(["", ""]);
  const [expiry, setExpiry] = useState<ConfessionsConfig["expiry"]["defaultMode"]>(cfg.expiry.defaultMode);

  const create = useServerFn(createConfession);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => create({
      data: {
        kind,
        category,
        text,
        image_url: kind === "image" ? imageUrl || undefined : undefined,
        poll: kind === "poll"
          ? { question: pollQ, options: pollOpts.filter(Boolean) }
          : undefined,
        display_mode: mode,
        expiry,
      },
    }),
    onSuccess: () => {
      toast.success(cfg.moderation.approvalRequired ? "Submitted for review" : "Posted!");
      qc.invalidateQueries({ queryKey: ["confessions"] });
      onPosted();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to post"),
  });

  const MODE_LABEL: Record<ConfessionDisplayMode, string> = {
    fully_anonymous: "Anonymous",
    random_id: "Confessor #",
    random_avatar: "Random animal",
    username: "My username",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as ConfessionKind)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {enabledKinds.map((k) => (
                <SelectItem key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cfg.categories.map((c) => (
                <SelectItem key={c.key} value={c.key}>{c.emoji} {c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Identity</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {enabledModes.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {kind === "poll" && (
        <div className="space-y-2 rounded-xl border border-border p-3">
          <Input placeholder="Poll question" value={pollQ} onChange={(e) => setPollQ(e.target.value)} />
          {pollOpts.map((opt, i) => (
            <Input key={i} placeholder={`Option ${i + 1}`} value={opt}
              onChange={(e) => setPollOpts((p) => p.map((v, idx) => idx === i ? e.target.value : v))} />
          ))}
          {pollOpts.length < 6 && (
            <button type="button" onClick={() => setPollOpts((p) => [...p, ""])} className="text-xs font-medium text-primary hover:underline">
              + Add option
            </button>
          )}
        </div>
      )}

      {kind === "image" && (
        <Input placeholder="Image URL (https://…)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      )}

      <Textarea
        placeholder={
          kind === "question" ? "What do you want to ask?"
            : kind === "advice" ? "What advice are you looking for?"
            : "Share what's on your mind…"
        }
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={4000}
      />

      {cfg.expiry.userSelectable && (
        <div>
          <Label className="text-xs">Expires</Label>
          <Select value={expiry} onValueChange={(v) => setExpiry(v as any)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={() => mut.mutate()} disabled={mut.isPending || (kind === "poll" ? !pollQ : !text.trim())} className="w-full gap-1.5">
        {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {cfg.moderation.approvalRequired ? "Submit for review" : "Post confession"}
      </Button>
    </div>
  );
}

/* =================== Card =================== */
function ConfessionCard({ item, cfg, viewerIsAuthor }: { item: any; cfg: ConfessionsConfig; viewerIsAuthor: boolean }) {
  const [showReplies, setShowReplies] = useState(false);
  const fetchSettings = useServerFn(getAllSettings);
  const { data: settings } = useQuery({ queryKey: ["app-settings"], queryFn: () => fetchSettings({}) });
  void settings;

  const react = useServerFn(toggleReaction);
  const moderate = useServerFn(moderateConfession);
  const qc = useQueryClient();
  const reactMut = useMutation({
    mutationFn: (type: ConfessionReactionType) => react({ data: { confessionId: item.id, type } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["confessions"] }),
  });
  const modMut = useMutation({
    mutationFn: (action: any) => moderate({ data: { id: item.id, action } }),
    onSuccess: () => { toast.success("Done"); qc.invalidateQueries({ queryKey: ["confessions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const cat = cfg.categories.find((c) => c.key === item.category);
  const enabledReactions = (Object.keys(cfg.reactions) as ConfessionReactionType[]).filter((r) => cfg.reactions[r]);

  return (
    <Card className={item.is_pinned ? "ring-2 ring-primary/40" : ""}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-xl">
            {item.avatar_emoji ?? (item.display_mode === "fully_anonymous" ? "🕶️" : "👤")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{item.alias ?? "Anonymous"}</p>
              {item.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
              {item.is_featured && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
              {item.status === "pending" && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">Pending</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {cat ? `${cat.emoji} ${cat.label}` : item.category} · {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {item.kind === "image" && item.image_url && (
          <img src={item.image_url} alt="Confession" className="max-h-96 w-full rounded-xl object-cover" loading="lazy" />
        )}

        {item.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{item.text}</p>}

        {item.kind === "poll" && item.poll && (
          <div className="space-y-1.5 rounded-xl bg-accent/40 p-3">
            <p className="text-sm font-bold">📊 {item.poll.question}</p>
            {(item.poll.options as string[]).map((opt, i) => (
              <div key={i} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">{opt}</div>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {enabledReactions.map((r) => {
            const meta = REACTION_META[r];
            const active = (item.myReactions as string[]).includes(r);
            return (
              <button
                key={r}
                onClick={() => reactMut.mutate(r)}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                  active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-accent"
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{r === "like" ? item.like_count || "" : meta.label}</span>
              </button>
            );
          })}
          {cfg.allowReplies && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="ml-auto flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent"
            >
              <MessageCircle className="h-3.5 w-3.5" /> {item.reply_count || ""} Reply
            </button>
          )}
          {cfg.allowReports && !viewerIsAuthor && (
            <button className="rounded-full border border-border bg-card p-1.5 hover:bg-accent" aria-label="Report">
              <Flag className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Admin actions */}
        <AdminActions item={item} onAction={(a) => modMut.mutate(a)} />

        {showReplies && cfg.allowReplies && <RepliesPanel confessionId={item.id} cfg={cfg} />}
      </CardContent>
    </Card>
  );
}

function AdminActions({ item, onAction }: { item: any; onAction: (action: string) => void }) {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({ queryKey: ["app-settings"], queryFn: () => fetchSettings({}) });
  void data;
  return (
    <details className="group rounded-lg border border-dashed border-border px-3 py-1.5">
      <summary className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Shield className="h-3 w-3" /> Mod
      </summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.status !== "approved" && <ModBtn onClick={() => onAction("approve")}>Approve</ModBtn>}
        {item.status !== "rejected" && <ModBtn onClick={() => onAction("reject")}>Reject</ModBtn>}
        <ModBtn onClick={() => onAction(item.is_pinned ? "unpin" : "pin")}>{item.is_pinned ? "Unpin" : "Pin"}</ModBtn>
        <ModBtn onClick={() => onAction(item.is_featured ? "unfeature" : "feature")}>{item.is_featured ? "Unfeature" : "Feature"}</ModBtn>
        <ModBtn onClick={() => onAction("remove")} danger>Remove</ModBtn>
      </div>
    </details>
  );
}

function ModBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        danger ? "bg-destructive/15 text-destructive hover:bg-destructive/25" : "bg-accent text-foreground hover:bg-accent/80"
      }`}
    >
      {children}
    </button>
  );
}

/* =================== Replies =================== */
function RepliesPanel({ confessionId, cfg }: { confessionId: string; cfg: ConfessionsConfig }) {
  const fetchReplies = useServerFn(listReplies);
  const post = useServerFn(createReply);
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["confession-replies", confessionId],
    queryFn: () => fetchReplies({ data: { confessionId } }),
  });
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(cfg.allowAnonymousReplies);
  const mut = useMutation({
    mutationFn: () => post({ data: { confessionId, text, anonymous: anon } }),
    onSuccess: () => { setText(""); refetch(); qc.invalidateQueries({ queryKey: ["confessions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-2 border-t border-border pt-3">
      {(data ?? []).map((r: any) => (
        <div key={r.id} className="flex items-start gap-2 rounded-lg bg-accent/30 p-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-background text-sm">
            {r.avatar_emoji ?? "👤"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold">{r.alias ?? "Anonymous"}</p>
            <p className="whitespace-pre-wrap text-sm">{r.text}</p>
          </div>
        </div>
      ))}
      <div className="flex items-end gap-2 pt-1">
        <Textarea rows={2} placeholder="Reply…" value={text} onChange={(e) => setText(e.target.value)} className="resize-none" />
        <div className="flex flex-col items-end gap-1">
          {cfg.allowAnonymousReplies && (
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Anon
            </label>
          )}
          <Button size="sm" disabled={mut.isPending || !text.trim()} onClick={() => mut.mutate()}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
