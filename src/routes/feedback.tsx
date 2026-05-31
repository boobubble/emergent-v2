import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Plus, ChevronUp, MessageCircle, Pin, Loader2, Send, Search, ImagePlus, X, EyeOff, AlertTriangle,
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
  listFeedback, createFeedback, toggleVote, getFeedback, postComment, findSimilarFeedback,
} from "@/lib/feedback.functions";
import {
  FEEDBACK_DEFAULTS, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES,
  CATEGORY_META, STATUS_META, PRIORITY_META,
  type FeedbackConfig, type FeedbackCategory, type FeedbackStatus, type FeedbackPriority,
} from "@/lib/feedback-config";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback & Bug Reports" },
      { name: "description", content: "Report bugs, request features, and help shape the community." },
      { property: "og:title", content: "Feedback & Bug Reports" },
      { property: "og:description", content: "Vote on ideas, file bug reports, and track fixes." },
    ],
  }),
  component: FeedbackPage,
});

function useConfig(): FeedbackConfig {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({ queryKey: ["app-settings"], queryFn: () => fetchSettings({}) });
  return useMemo(
    () => ({ ...FEEDBACK_DEFAULTS, ...((data?.feedback as Partial<FeedbackConfig>) ?? {}) }),
    [data],
  );
}

function FeedbackPage() {
  const cfg = useConfig();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [sort, setSort] = useState<"trending" | "recent" | "top" | "oldest">("trending");
  const [category, setCategory] = useState<"all" | FeedbackCategory>("all");
  const [status, setStatus] = useState<"all" | FeedbackStatus>("all");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useServerFn(listFeedback);
  const { data: items, isLoading } = useQuery({
    queryKey: ["feedback", sort, category, status, search],
    queryFn: () => list({ data: { sort, category, status, search: search || undefined, limit: 100 } }),
    enabled: cfg.enabled,
  });

  const vote = useServerFn(toggleVote);
  const voteMut = useMutation({
    mutationFn: (reportId: string) => vote({ data: { reportId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // Realtime: refresh list/detail when reports, votes or comments change
  useEffect(() => {
    if (!cfg.enabled) return;
    const ch = supabase
      .channel("feedback-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_reports" },
        () => qc.invalidateQueries({ queryKey: ["feedback"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_votes" },
        () => qc.invalidateQueries({ queryKey: ["feedback"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_comments" },
        () => qc.invalidateQueries({ queryKey: ["feedback"] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [cfg.enabled, qc]);


  if (!cfg.enabled) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Feedback is disabled</h1>
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
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="rounded-md p-1.5 hover:bg-muted" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Feedback & Bug Reports</h1>
            <p className="text-xs text-muted-foreground">Vote on ideas, file bugs, track fixes.</p>
          </div>
          {user && (
            <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> New report
                </Button>
              </DialogTrigger>
              <Composer cfg={cfg} onClose={() => setComposerOpen(false)} />
            </Dialog>
          )}
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports…" className="pl-8 h-9"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_META[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {FEEDBACK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="top">Most votes</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-3 p-4">
        {isLoading && (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!isLoading && (items?.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No reports match your filters. Be the first to submit one.
          </div>
        )}
        {(items ?? []).map((r) => {
          const Cat = CATEGORY_META[r.category as FeedbackCategory] ?? CATEGORY_META.other;
          const St  = STATUS_META[r.status as FeedbackStatus] ?? STATUS_META.open;
          return (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="group flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-sm"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) { toast.error("Sign in to vote"); return; }
                  voteMut.mutate(r.id);
                }}
                className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl border transition ${
                  r.hasVoted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-sm font-semibold tabular-nums">{r.upvote_count}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {r.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                  <h3 className="truncate font-medium">{r.title}</h3>
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
              </div>
            </button>
          );
        })}
      </main>

      {openId && (
        <DetailDialog id={openId} open={!!openId} onClose={() => setOpenId(null)} cfg={cfg} />
      )}
    </div>
  );
}

// ============== COMPOSER ==============
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
    queryKey: ["feedback-similar", debouncedTitle],
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
      toast.success("Report submitted. Thank you!");
      qc.invalidateQueries({ queryKey: ["feedback"] });
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
        <DialogTitle>New report</DialogTitle>
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
                Similar reports already exist — consider upvoting instead:
              </div>
              <ul className="mt-1.5 space-y-1">
                {(similar ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="line-clamp-1">{s.title}</span>
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
            <span className="flex-1">Submit anonymously</span>
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
          Submit report
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============== DETAIL ==============
function DetailDialog({ id, open, onClose, cfg }: { id: string; open: boolean; onClose: () => void; cfg: FeedbackConfig }) {
  const qc = useQueryClient();
  const get = useServerFn(getFeedback);
  const comment = useServerFn(postComment);
  const vote = useServerFn(toggleVote);

  const { data, isLoading } = useQuery({
    queryKey: ["feedback", "detail", id],
    queryFn: () => get({ data: { id } }),
    enabled: open,
  });

  const [text, setText] = useState("");
  const postMut = useMutation({
    mutationFn: () => comment({ data: { reportId: id, text: text.trim() } }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["feedback", "detail", id] });
      qc.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const voteMut = useMutation({
    mutationFn: () => vote({ data: { reportId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback", "detail", id] });
      qc.invalidateQueries({ queryKey: ["feedback"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {isLoading || !data ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8">{data.report.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const Cat = CATEGORY_META[data.report.category as FeedbackCategory] ?? CATEGORY_META.other;
                  const St  = STATUS_META[data.report.status as FeedbackStatus] ?? STATUS_META.open;
                  return (
                    <>
                      <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium ${Cat.tone}`}>
                        <Cat.icon className="h-3 w-3" /> {Cat.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${St.tone}`}>
                        {St.label}
                      </span>
                    </>
                  );
                })()}
                <Button
                  size="sm" variant={data.hasVoted ? "default" : "outline"}
                  className="ml-auto gap-1.5"
                  onClick={() => voteMut.mutate()}
                  disabled={voteMut.isPending}
                >
                  <ChevronUp className="h-4 w-4" />
                  {data.report.upvote_count} {data.hasVoted ? "Voted" : "Upvote"}
                </Button>
              </div>

              {data.report.description && (
                <div className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-3 text-sm">
                  {data.report.description}
                </div>
              )}
              {(data.report.screenshots ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {data.report.screenshots.map((url: string) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border border-border">
                      <img src={url} alt="Screenshot" className="h-24 w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
              {data.report.admin_note && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold text-primary">Admin note</div>
                  {data.report.admin_note}
                </div>
              )}

              {cfg.allowComments && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold">Comments ({data.comments.length})</h4>
                  <div className="max-h-64 space-y-2 overflow-auto">
                    {data.comments.map((c) => (
                      <div key={c.id} className={`rounded-lg border p-2 text-sm ${c.is_admin_response ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                        {c.is_admin_response && (
                          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Admin</div>
                        )}
                        <p className="whitespace-pre-wrap">{c.text}</p>
                      </div>
                    ))}
                    {data.comments.length === 0 && (
                      <p className="text-xs text-muted-foreground">No comments yet.</p>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={text} onChange={(e) => setText(e.target.value)}
                      rows={2} maxLength={2000} placeholder="Add a comment…"
                      className="flex-1"
                    />
                    <Button
                      size="icon" onClick={() => postMut.mutate()}
                      disabled={postMut.isPending || text.trim().length === 0}
                    >
                      {postMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
