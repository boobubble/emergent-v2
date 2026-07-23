import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Plus, ChevronUp, MessageCircle, Pin, Loader2, Search, ImagePlus, X, EyeOff, AlertTriangle,
  Flame, Clock, CheckCircle2, Lightbulb, Bug, Sparkles, MessagesSquare, TrendingUp,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getAllSettings } from "@/lib/admin.functions";
import {
  listFeedback, createFeedback, toggleVote, findSimilarFeedback,
} from "@/lib/feedback.functions";
import {
  FEEDBACK_DEFAULTS, FEEDBACK_CATEGORIES,
  CATEGORY_META, STATUS_META, PRIORITY_META,
  type FeedbackConfig, type FeedbackCategory, type FeedbackStatus, type FeedbackPriority,
} from "@/lib/feedback-config";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback/")({
  head: () => ({
    meta: [
      { title: "Community Forum — Discussions, Bugs & Ideas" },
      { name: "description", content: "Join the community forum — report bugs, request features, discuss ideas, and track fixes together." },
      { property: "og:title", content: "Community Forum" },
      { property: "og:description", content: "Discussions, bug reports, and feature requests from the community." },
    ],
  }),
  component: ForumHome,
});

function useConfig(): FeedbackConfig {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({ queryKey: ["app-settings"], queryFn: () => fetchSettings({}) });
  return useMemo(
    () => ({ ...FEEDBACK_DEFAULTS, ...((data?.feedback as Partial<FeedbackConfig>) ?? {}) }),
    [data],
  );
}

type Tab = "trending" | "latest" | "solved" | "features" | "bugs" | "ideas";
const TABS: Array<{ id: Tab; label: string; icon: typeof Flame; tone: string }> = [
  { id: "trending", label: "Trending",       icon: Flame,       tone: "text-orange-500" },
  { id: "latest",   label: "Latest",         icon: Clock,       tone: "text-sky-500" },
  { id: "solved",   label: "Solved",         icon: CheckCircle2,tone: "text-emerald-500" },
  { id: "features", label: "Most Requested", icon: Lightbulb,   tone: "text-amber-500" },
  { id: "bugs",     label: "Bug Reports",    icon: Bug,         tone: "text-rose-500" },
  { id: "ideas",    label: "Popular Ideas",  icon: Sparkles,    tone: "text-violet-500" },
];

function tabToQuery(tab: Tab) {
  switch (tab) {
    case "latest":   return { sort: "recent" as const,   category: "all", status: "all" };
    case "solved":   return { sort: "top" as const,      category: "all", status: "fixed" };
    case "features": return { sort: "top" as const,      category: "feature", status: "all" };
    case "bugs":     return { sort: "trending" as const, category: "bug", status: "all" };
    case "ideas":    return { sort: "top" as const,      category: "improvement", status: "all" };
    default:         return { sort: "trending" as const, category: "all", status: "all" };
  }
}

function ForumHome() {
  const cfg = useConfig();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("trending");
  const [category, setCategory] = useState<"all" | FeedbackCategory>("all");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const list = useServerFn(listFeedback);
  const q = tabToQuery(tab);
  const effectiveCategory = category !== "all" ? category : q.category;

  const { data: items, isLoading } = useQuery({
    queryKey: ["forum", tab, effectiveCategory, search],
    queryFn: () => list({ data: {
      sort: q.sort,
      category: effectiveCategory,
      status: q.status,
      search: search || undefined,
      limit: 60,
    } }),
    enabled: cfg.enabled,
  });

  const vote = useServerFn(toggleVote);
  const voteMut = useMutation({
    mutationFn: (reportId: string) => vote({ data: { reportId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forum"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!cfg.enabled) return;
    const ch = supabase
      .channel("forum-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_reports" },
        () => qc.invalidateQueries({ queryKey: ["forum"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_votes" },
        () => qc.invalidateQueries({ queryKey: ["forum"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_comments" },
        () => qc.invalidateQueries({ queryKey: ["forum"] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [cfg.enabled, qc]);

  if (!cfg.enabled) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Forum is disabled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This module is currently turned off by the admin.
          </p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="rounded-md p-1.5 hover:bg-muted" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">Community Forum</h1>
            <p className="truncate text-xs text-muted-foreground">Discussions, bugs, features & ideas</p>
          </div>
          {user && (
            <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> New discussion
                </Button>
              </DialogTrigger>
              <Composer cfg={cfg} onClose={() => setComposerOpen(false)} />
            </Dialog>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <MessagesSquare className="h-3 w-3" /> Public forum
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Shape the platform together
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Report bugs, request features, and discuss ideas with the community. Vote on what matters most.
              </p>
            </div>
            {!user && (
              <Link
                to="/auth"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
              >
                Sign in to join
              </Link>
            )}
          </div>

          {/* Category quick-cards */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: "bug" as const,         icon: Bug,       label: "Bugs" },
              { id: "feature" as const,     icon: Lightbulb, label: "Features" },
              { id: "improvement" as const, icon: Sparkles,  label: "Ideas" },
              { id: "other" as const,       icon: MessagesSquare, label: "General" },
            ].map((c) => {
              const Meta = CATEGORY_META[c.id];
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(active ? "all" : c.id)}
                  className={`group flex items-center gap-2 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card/70 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl bg-muted ${Meta.tone}`}>
                    <c.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{c.label}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{Meta.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter row */}
      <div className="sticky top-[57px] z-10 border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search discussions…" className="h-9 pl-8"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "" : t.tone}`} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      <main className="mx-auto max-w-5xl space-y-3 p-4">
        {isLoading && (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!isLoading && (items?.length ?? 0) === 0 && (
          <EmptyState tab={tab} onNew={() => setComposerOpen(true)} canPost={!!user} />
        )}
        {(items ?? []).map((r) => {
          const Cat = CATEGORY_META[r.category as FeedbackCategory] ?? CATEGORY_META.other;
          const St  = STATUS_META[r.status as FeedbackStatus] ?? STATUS_META.open;
          const trending = (r.upvote_count ?? 0) >= 10 || (r.comment_count ?? 0) >= 5;
          return (
            <article
              key={r.id}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) { toast.error("Sign in to vote"); return; }
                  voteMut.mutate(r.id);
                }}
                className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border transition ${
                  r.hasVoted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
                aria-label="Upvote"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-semibold tabular-nums">{r.upvote_count}</span>
                <span className="text-[9px] uppercase text-muted-foreground">votes</span>
              </button>
              <Link
                to="/feedback/$id"
                params={{ id: r.id }}
                className="min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  {r.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                  {trending && <TrendingUp className="h-3.5 w-3.5 text-orange-500" />}
                  <h3 className="truncate font-semibold group-hover:text-primary">{r.title}</h3>
                </div>
                {r.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${Cat.tone}`}>
                    <Cat.icon className="h-3 w-3" /> {Cat.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${St.tone}`}>
                    {St.label}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MessageCircle className="h-3 w-3" /> {r.comment_count}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </main>
    </div>
  );
}

function EmptyState({ tab, onNew, canPost }: { tab: Tab; onNew: () => void; canPost: boolean }) {
  const meta = TABS.find((t) => t.id === tab)!;
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/30 p-10 text-center">
      <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted ${meta.tone}`}>
        <meta.icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">Nothing here yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Be the first to start a discussion in <span className="font-semibold">{meta.label}</span>.
      </p>
      {canPost ? (
        <Button size="sm" className="mt-4 gap-1.5" onClick={onNew}>
          <Plus className="h-4 w-4" /> New discussion
        </Button>
      ) : (
        <Link to="/auth" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Sign in to post
        </Link>
      )}
    </div>
  );
}

// ============== COMPOSER (unchanged behavior; used by forum home) ==============
function Composer({ cfg, onClose }: { cfg: FeedbackConfig; onClose: () => void }) {
  const qc = useQueryClient();
  const create = useServerFn(createFeedback);
  const findSimilar = useServerFn(findSimilarFeedback);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [priority, setPriority] = useState<FeedbackPriority>("normal");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [debouncedTitle, setDebouncedTitle] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTitle(title.trim()), 350);
    return () => clearTimeout(t);
  }, [title]);

  const { data: similar } = useQuery({
    queryKey: ["forum-similar", debouncedTitle],
    queryFn: () => findSimilar({ data: { title: debouncedTitle } }),
    enabled: cfg.duplicateDetection && debouncedTitle.length >= 4,
  });

  const mut = useMutation({
    mutationFn: () =>
      create({
        data: {
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          screenshots,
          is_anonymous: anonymous,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          device_info: typeof navigator !== "undefined"
            ? { ua: navigator.userAgent, lang: navigator.language }
            : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Discussion posted. Thank you!");
      qc.invalidateQueries({ queryKey: ["forum"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onUpload = async (file: File) => {
    if (!cfg.allowScreenshots) return;
    if (screenshots.length >= 6) { toast.error("Maximum 6 screenshots"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    try {
      const path = `feedback/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      setScreenshots((s) => [...s, data.publicUrl]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Start a new discussion</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as FeedbackPriority)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_META) as FeedbackPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Short, descriptive summary"
          />
          {cfg.duplicateDetection && (similar?.length ?? 0) > 0 && (
            <div className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Similar discussions already exist — consider upvoting instead:
              </div>
              <ul className="mt-1.5 space-y-1">
                {(similar ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                    <Link to="/feedback/$id" params={{ id: s.id }} className="line-clamp-1 hover:underline">
                      {s.title}
                    </Link>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      ▲ {s.upvote_count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={8000}
            rows={6}
            placeholder="Steps to reproduce, expected vs actual behavior, screenshots…"
          />
        </div>
        {cfg.allowScreenshots && (
          <div className="space-y-1.5">
            <Label className="text-xs">Screenshots ({screenshots.length}/6)</Label>
            <div className="flex flex-wrap gap-2">
              {screenshots.map((url, i) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                  <img src={url} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshots((s) => s.filter((_, j) => j !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-background"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.target.value = ""; }}
                />
              </label>
            </div>
          </div>
        )}
        {cfg.allowAnonymous && (
          <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-sm cursor-pointer">
            <Checkbox checked={anonymous} onCheckedChange={(v) => setAnonymous(!!v)} />
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Post anonymously</span>
            <span className="text-xs text-muted-foreground">Your name will be hidden</span>
          </label>
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => mut.mutate()}
          disabled={mut.isPending || title.trim().length < 4}
        >
          {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Post discussion
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
