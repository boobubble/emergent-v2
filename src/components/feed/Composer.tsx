import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Smile, Hash, Loader2, X, Globe, Users, Lock, EyeOff, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/gamification.functions";
import { earnFeedPost } from "@/lib/economy.functions";
import { useServerFn } from "@tanstack/react-start";
import { extractHashtags } from "@/lib/feed-types";
import { slugify } from "@/lib/post-slug";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFocusComposerConfig } from "@/lib/focus-composer-config";
import type { PostPrivacy } from "@/lib/feed-types";



const PRIVACY: { id: PostPrivacy; label: string; icon: typeof Globe }[] = [
  { id: "public", label: "Public", icon: Globe },
  { id: "friends", label: "Friends", icon: Users },
  { id: "private", label: "Only me", icon: Lock },
];

const DRAFT_KEY = "feed-composer-draft";

export function Composer({ authorId, onPosted }: { authorId: string; onPosted?: () => void }) {
  const [text, setText] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) || "" : ""));
  const [files, setFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PostPrivacy>("public");
  const [anonymous, setAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const earnPost = useServerFn(earnFeedPost);
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

  async function submit() {
    if (!text.trim() && !files.length) return;
    setPosting(true); setError(null);
    try {
      const media_urls = await uploadFiles();
      const kind = files.length ? "image" : "text";
      const hashtags = extractHashtags(text);
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
      });

      if (error) throw new Error(error.message);
      // bump XP (server-side; gamification trigger blocks client writes)
      try { await awardXp({ data: { action: "post" } }); } catch (e) { console.error("xp award failed", e); }
      earnPost().catch(() => {});
      setText(""); setFiles([]); setAnonymous(false); setFocused(false);
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
        "relative rounded-3xl border bg-card p-4 transition-[box-shadow,border-color,transform] duration-200",
        spotlight
          ? "border-primary/60 shadow-2xl ring-2 ring-primary/30 sm:scale-[1.01]"
          : "border-border shadow-sm",
        spotlight && useAnim ? "animate-scale-in" : "",
      ].join(" ")}
    >
      {spotlight && (
        <div className="mb-2 flex items-center justify-between">
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
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => updateText(e.target.value)}
        onFocus={openFocus}
        onClick={openFocus}
        rows={spotlight ? 6 : 3}
        placeholder="What's on your mind? Use #hashtags and @mentions…"
        className="w-full resize-none rounded-2xl border border-transparent bg-transparent px-2 py-1 text-base placeholder:text-muted-foreground focus:outline-none"
      />
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
              <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white" aria-label="Remove file">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <ImageIcon className="h-4 w-4" /> Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <Smile className="h-4 w-4" /> Emoji
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px] p-0">
            <EmojiPicker onPick={(e) => updateText(text + e)} />
          </PopoverContent>
        </Popover>

        <button onClick={() => updateText(text + " #")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Hash className="h-4 w-4" /> Tag
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
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            aria-label="Post audience"
          >
            {PRIVACY.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
          </select>
          <button onClick={() => setAnonymous(!anonymous)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${anonymous ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            <EyeOff className="h-3 w-3" /> Anon
          </button>
          <PrivacyIconEl className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={submit}
            disabled={posting || (!text.trim() && !files.length)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {posting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Post
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
