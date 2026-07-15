import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Smile, Hash, Loader2, X, Globe, Users, Lock, EyeOff, Sparkles, BarChart3, VenetianMask, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/gamification.functions";
import { earnFeedPost } from "@/lib/economy.functions";
import { createConfession } from "@/lib/confessions.functions";
import { extractHashtags } from "@/lib/feed-types";
import { slugify } from "@/lib/post-slug";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { VideoThumb } from "@/components/feed/VideoThumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFocusComposerConfig } from "@/lib/focus-composer-config";
import { clearCaches, formatClearReport, isCurrentUserAdmin } from "@/lib/cache-manager";
import type { PostPrivacy } from "@/lib/feed-types";




const PRIVACY: { id: PostPrivacy; label: string; icon: typeof Globe }[] = [
  { id: "public", label: "Public", icon: Globe },
  { id: "friends", label: "Friends", icon: Users },
  { id: "private", label: "Only me", icon: Lock },
];

const DRAFT_KEY = "feed-composer-draft";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_VIDEO_EXTS = ["mp4", "webm"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

function validateAndFilter(incoming: File[]): { ok: File[]; rejected: string[] } {
  const ok: File[] = [];
  const rejected: string[] = [];
  for (const f of incoming) {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const isVideoLike = f.type.startsWith("video/") || ["mp4", "webm", "mov", "m4v", "ogg", "avi", "mkv"].includes(ext);
    if (isVideoLike) {
      const typeOk = ALLOWED_VIDEO_TYPES.includes(f.type) || ALLOWED_VIDEO_EXTS.includes(ext);
      if (!typeOk) { rejected.push(`${f.name} — only MP4 or WebM videos are allowed`); continue; }
      if (f.size > MAX_VIDEO_BYTES) { rejected.push(`${f.name} — video exceeds 100 MB`); continue; }
    }
    ok.push(f);
  }
  return { ok, rejected };
}

type ComposerMode = "post" | "poll" | "confession";

export function Composer({ authorId, onPosted, communityId }: { authorId: string; onPosted?: () => void; communityId?: string | null }) {
  const [text, setText] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) || "" : ""));
  const [files, setFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PostPrivacy>("public");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("post");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const earnPost = useServerFn(earnFeedPost);
  const submitConfession = useServerFn(createConfession);
  const { config: focusConfig } = useFocusComposerConfig();
  const hasDraft = text.trim().length > 0 || files.length > 0;

  // ESC closes the spotlight overlay.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFocused(false); };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while spotlight is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [focused]);

  function openFocus() {
    if (!focusConfig.enabled) return;
    setFocused(true);
    // Defer to let the overlay mount before focusing the textarea.
    setTimeout(() => textareaRef.current?.focus(), 30);
  }

  function updateText(v: string) {
    setText(v);
    try { localStorage.setItem(DRAFT_KEY, v); } catch {}
  }

  async function uploadFiles(): Promise<string[]> {
    if (!files.length) return [];
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${authorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  const queryClient = useQueryClient();

  async function submit() {
    // Mode-specific guards
    if (mode === "poll") {
      const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (!pollQuestion.trim()) { setError("Add a poll question."); return; }
      if (cleanOpts.length < 2) { setError("Add at least two poll options."); return; }
    } else if (mode === "confession") {
      if (!text.trim()) { setError("Write your confession first."); return; }
    } else {
      if (!text.trim() && !files.length) return;
    }

    const trimmed = text.trim();
    if (mode === "post" && /^\/clearcache\b/i.test(trimmed)) {
      const ok = await isCurrentUserAdmin();
      if (!ok) {
        toast.error("Admins only", { description: "/clearcache is restricted to admins." });
        return;
      }
      toast.loading("Clearing caches…", { id: "clearcache" });
      const report = await clearCaches({ queryClient });
      toast.success("Caches cleared", { id: "clearcache", description: formatClearReport(report) });
      setText("");
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      return;
    }
    setPosting(true); setError(null);

    try {
      if (mode === "confession") {
        await submitConfession({ data: {
          kind: "text",
          category: "secrets",
          text: text.trim(),
          display_mode: "fully_anonymous",
        } });
        toast.success("Confession shared anonymously");
        setText(""); setMode("post"); setFocused(false);
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        return;
      }

      const hashtags = extractHashtags(text);

      if (mode === "poll") {
        const cleanOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
        const { error } = await supabase.from("posts").insert({
          author_id: authorId,
          owner_id: authorId,
          kind: "poll",
          text: text.trim(),
          slug: slugify(pollQuestion.trim() || "poll"),
          media_urls: [],
          poll: { question: pollQuestion.trim(), options: cleanOpts, votes: {} },
          privacy,
          is_anonymous: anonymous,
          hashtags,
          ...(communityId ? { community_id: communityId } : {}),
        });
        if (error) throw new Error(error.message);
      } else {
        const media_urls = await uploadFiles();
        const hasMedia = files.length > 0;
        const kind = hasMedia ? "image" : "text";
        const { error } = await supabase.from("posts").insert({
          author_id: authorId,
          owner_id: authorId,
          kind,
          text: text.trim(),
          slug: slugify(text.trim() || kind),
          media_urls,
          privacy,
          is_anonymous: anonymous,
          hashtags,
          ...(communityId ? { community_id: communityId } : {}),
        });
        if (error) throw new Error(error.message);
      }

      try { await awardXp({ data: { action: "post" } }); } catch (e) { console.error("xp award failed", e); }
      earnPost().catch(() => {});
      setText(""); setFiles([]); setAnonymous(false); setFocused(false);
      setPollQuestion(""); setPollOptions(["", ""]); setMode("post");
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      onPosted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const PrivacyIconEl = PRIVACY.find((p) => p.id === privacy)!.icon;
  const spotlight = focused && focusConfig.enabled;
  const useAnim = focusConfig.animations;

  const card = (
    <div
      className={[
        "relative rounded-[1.25rem] border bg-card p-5 transition-[box-shadow,border-color,transform] duration-200",
        spotlight
          ? "border-primary/60 shadow-2xl ring-2 ring-primary/30 sm:scale-[1.01]"
          : "border-border shadow-[0_8px_24px_-16px_oklch(0_0_0/0.5)]",
        spotlight && useAnim ? "animate-scale-in" : "",
      ].join(" ")}
    >
      {spotlight && (
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Focus mode
          </span>
          <button
            onClick={() => setFocused(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close focus composer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold ring-2 ring-card">
          {authorId ? authorId.slice(0, 1).toUpperCase() : "?"}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => updateText(e.target.value)}
          onFocus={openFocus}
          onClick={openFocus}
          rows={spotlight ? 6 : 2}
          placeholder={
            mode === "confession"
              ? "Share something honest — posted anonymously to the confessions board…"
              : mode === "poll"
                ? "Optional context for your poll…"
                : "What's on your mind? Use #hashtags and @mentions…"
          }
          className="w-full resize-none rounded-2xl border border-transparent bg-transparent px-1 py-2 text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Mode chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <ModeChip active={mode === "post"} onClick={() => setMode("post")} label="Post" />
        <ModeChip active={mode === "poll"} onClick={() => setMode("poll")} icon={BarChart3} label="Poll" tone="primary" />
        <ModeChip active={mode === "confession"} onClick={() => setMode("confession")} icon={VenetianMask} label="Confess" tone="fuchsia" />
        {mode === "confession" && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-500">
            <EyeOff className="h-3 w-3" /> Posted anonymously to /confessions
          </span>
        )}
      </div>

      {mode === "poll" && (
        <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Ask a question…"
            maxLength={280}
            className="mb-2 w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="space-y-2">
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => setPollOptions((p) => p.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder={`Option ${i + 1}`}
                  maxLength={120}
                  className="flex-1 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => setPollOptions((p) => p.filter((_, j) => j !== i))}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {pollOptions.length < 6 && (
            <button
              onClick={() => setPollOptions((p) => [...p, ""])}
              className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" /> Add option
            </button>
          )}
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-black">
              {f.type.startsWith("video/") ? (
                <VideoThumb file={f} />
              ) : (
                <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              )}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white" aria-label="Remove file">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 transition">
          <ImageIcon className="h-4 w-4" /> <span className="hidden sm:inline">Photo</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/mp4,video/webm,.mp4,.webm"
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            const { ok, rejected } = validateAndFilter(picked);
            if (rejected.length) toast.error("Some files were skipped", { description: rejected.join("\n") });
            if (ok.length) setFiles([...files, ...ok]);
            if (fileRef.current) fileRef.current.value = "";
          }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition">
              <Smile className="h-4 w-4" /> <span className="hidden sm:inline">Emoji</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px] p-0">
            <EmojiPicker onPick={(e) => updateText(text + e)} />
          </PopoverContent>
        </Popover>

        <button onClick={() => updateText(text + " #")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-sky-400 hover:bg-sky-400/10 transition">
          <Hash className="h-4 w-4" /> <span className="hidden sm:inline">Tag</span>
        </button>
        {spotlight && (
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            {hasDraft ? "Draft auto-saved" : "Draft empty"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
            className="rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-medium"
            aria-label="Post audience"
          >
            {PRIVACY.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
          </select>
          <button onClick={() => setAnonymous(!anonymous)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${anonymous ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <EyeOff className="h-3 w-3" /> Anon
          </button>
          <PrivacyIconEl className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={submit}
            disabled={
              posting ||
              (mode === "post" && !text.trim() && !files.length) ||
              (mode === "confession" && !text.trim()) ||
              (mode === "poll" && (!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2))
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary-glow)] hover:scale-[1.03] active:scale-[0.97] transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === "confession" ? "Confess" : mode === "poll" ? "Publish poll" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );

  if (!spotlight) return card;

  return (
    <>
      {/* Inline placeholder keeps layout stable while the spotlight is open */}
      <div className="rounded-3xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
        Composer open in focus mode — press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[11px]">Esc</kbd> to close.
      </div>

      {/* Spotlight overlay */}
      <div
        className={[
          "fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto px-0 py-0 sm:items-center sm:px-4 sm:py-8",
          useAnim ? "animate-fade-in" : "",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Create a post"
      >
        <button
          aria-label="Dismiss focus composer"
          onClick={() => setFocused(false)}
          className={[
            "absolute inset-0 bg-background/70",
            focusConfig.blur ? "backdrop-blur-md" : "",
          ].join(" ")}
        />
        <div className="relative z-10 flex min-h-full w-full max-w-2xl flex-col justify-center sm:min-h-0">
          {card}
        </div>
      </div>
    </>
  );
}

function ModeChip({
  active,
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon?: typeof BarChart3;
  label: string;
  tone?: "primary" | "fuchsia";
}) {
  const accent =
    tone === "fuchsia"
      ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-500"
      : "border-primary bg-primary/15 text-primary";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? accent : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
