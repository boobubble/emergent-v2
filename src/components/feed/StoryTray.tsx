import { useEffect, useRef, useState } from "react";
import { Plus, X, Loader2, ChevronLeft, ChevronRight, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { StoryTraySkeleton } from "./FeedSkeletons";

interface Story {
  id: string;
  user_id: string;
  username: string;
  images: string[];
  /** Per-slide captions, aligned by index with `images`. */
  captions?: string[];
  /** Legacy single caption — applied to slides without an explicit caption. */
  text?: string;
  created_at: number;
}

const KEY = "palrgo:stories:v1";
const TTL = 24 * 60 * 60 * 1000; // 24h

function normalize(raw: unknown): Story | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown> & { image?: string; images?: string[]; captions?: string[] };
  const images = Array.isArray(r.images)
    ? r.images.filter((v): v is string => typeof v === "string")
    : typeof r.image === "string"
      ? [r.image]
      : [];
  if (!images.length) return null;
  const captions = Array.isArray(r.captions)
    ? r.captions.map((v) => (typeof v === "string" ? v : ""))
    : undefined;
  return {
    id: String(r.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    user_id: String(r.user_id ?? ""),
    username: String(r.username ?? ""),
    images,
    captions,
    text: typeof r.text === "string" ? r.text : undefined,
    created_at: typeof r.created_at === "number" ? r.created_at : Date.now(),
  };
}

function loadStories(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = (JSON.parse(raw) as unknown[]).map(normalize).filter((s): s is Story => !!s);
    const now = Date.now();
    const fresh = all.filter((s) => now - s.created_at < TTL);
    if (fresh.length !== all.length) localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return [];
  }
}

function saveStories(list: Story[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function StoryTray() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftFiles, setDraftFiles] = useState<File[]>([]);
  const [draftCaptions, setDraftCaptions] = useState<string[]>([]);
  const [draftText, setDraftText] = useState("");
  const [activeDraft, setActiveDraft] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setStories(loadStories());
    setHydrated(true);
  }, []);

  function openComposer() {
    setDraftFiles([]);
    setDraftCaptions([]);
    setDraftText("");
    setActiveDraft(0);
    setComposerOpen(true);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setDraftFiles((prev) => {
      const next = [...prev, ...files].slice(0, 10);
      setDraftCaptions((prevCaps) => {
        const caps = [...prevCaps];
        while (caps.length < next.length) caps.push("");
        return caps.slice(0, next.length);
      });
      setActiveDraft(prev.length); // jump to the first newly added slide
      return next;
    });
  }

  function removeDraft(i: number) {
    setDraftFiles((prev) => prev.filter((_, j) => j !== i));
    setDraftCaptions((prev) => prev.filter((_, j) => j !== i));
    setActiveDraft((prev) => Math.max(0, Math.min(prev, draftFiles.length - 2)));
  }

  async function publishStory() {
    if (!user) return;
    if (!draftFiles.length && !draftText.trim()) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of draftFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/stories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      // Text-only stories get a transparent placeholder slide so the viewer
      // has something to render the caption over.
      const captions = draftFiles.map((_, i) => (draftCaptions[i] ?? "").trim());
      if (!urls.length) {
        urls.push("");
        captions.push(draftText.trim());
      }
      const story: Story = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: user.id,
        username: user.username,
        images: urls,
        captions: captions.some((c) => c.length > 0) ? captions : undefined,
        text: draftText.trim() || undefined,
        created_at: Date.now(),
      };
      const next = [story, ...stories.filter((s) => s.user_id !== user.id)];
      setStories(next);
      saveStories(next);
      setComposerOpen(false);
      setDraftFiles([]);
      setDraftCaptions([]);
      setDraftText("");
      setActiveDraft(0);
    } catch (err) {
      console.error("story upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  function buildViewerList(): Story[] {
    if (!user) return stories;
    const my = stories.find((s) => s.user_id === user.id);
    const others = stories.filter((s) => s.user_id !== user.id);
    return my ? [my, ...others] : others;
  }

  function openAt(story: Story) {
    const list = buildViewerList();
    const idx = list.findIndex((s) => s.id === story.id);
    setSlideIndex(0);
    setViewIndex(idx >= 0 ? idx : 0);
  }

  function close() { setViewIndex(null); setSlideIndex(0); }

  function next() {
    const list = buildViewerList();
    if (viewIndex == null) return;
    const cur = list[viewIndex];
    if (cur && slideIndex < cur.images.length - 1) {
      setSlideIndex((s) => s + 1);
      return;
    }
    setSlideIndex(0);
    setViewIndex((i) => (i == null ? null : Math.min(list.length - 1, i + 1)));
  }
  function prev() {
    if (viewIndex == null) return;
    if (slideIndex > 0) { setSlideIndex((s) => s - 1); return; }
    const list = buildViewerList();
    const newIdx = Math.max(0, viewIndex - 1);
    setViewIndex(newIdx);
    setSlideIndex(Math.max(0, list[newIdx].images.length - 1));
  }

  useEffect(() => {
    if (viewIndex == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewIndex, slideIndex]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (dy < -80 && Math.abs(dy) > Math.abs(dx)) {
      close();
    }
  }

  if (!user) return null;
  if (!hydrated) return <StoryTraySkeleton />;

  const myStory = stories.find((s) => s.user_id === user.id);
  const others = stories.filter((s) => s.user_id !== user.id);
  const viewerList = buildViewerList();
  const viewing = viewIndex != null ? viewerList[viewIndex] : null;
  const viewingSlide = viewing?.images[slideIndex] ?? "";

  return (
    <>
      <div id="story-tray" className="feed-card p-3 sm:p-4">
        <div className="flex gap-3 overflow-x-auto pb-1 feed-scrollbar-hide snap-x snap-mandatory touch-pan-x">
          <button
            data-story-add
            onClick={() => (myStory ? openAt(myStory) : openComposer())}
            className="relative shrink-0 snap-start w-[112px] h-[176px] rounded-[1.25rem] overflow-hidden bg-gradient-to-b from-primary/20 via-card to-card border border-border group transition hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_var(--primary-glow)]"
            aria-label={myStory ? "View your story" : "Add story"}
          >
            {myStory ? (
              myStory.images[0] ? (
                <img src={myStory.images[0]} alt="Your story" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/30 to-card p-3 text-center text-[12px] font-semibold text-foreground">
                  {myStory.text?.slice(0, 60) ?? "Your story"}
                </div>
              )
            ) : (
              <div className="grid h-full w-full place-items-center">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_22px_-6px_var(--primary-glow)] ring-4 ring-card">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5 text-[11px] font-semibold text-white text-center">
              {myStory ? "Your story" : "Add story"}
            </div>
            {myStory && myStory.images.length > 1 && (
              <div className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {myStory.images.length}
              </div>
            )}
          </button>

          {others.map((s) => (
            <div key={s.id} className="shrink-0 snap-start story-ring transition hover:-translate-y-1">
              <button
                onClick={() => openAt(s)}
                className="relative block w-[108px] h-[172px] rounded-[1.1rem] overflow-hidden bg-card"
                aria-label={`View ${s.username}'s story`}
              >
                {s.images[0] ? (
                  <img src={s.images[0]} alt={s.username} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 to-card p-3 text-center text-[12px] font-semibold text-foreground">
                    {s.text?.slice(0, 60)}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5 text-[11px] font-semibold text-white truncate text-center">
                  {s.username}
                </div>
                {s.images.length > 1 && (
                  <div className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {s.images.length}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
      </div>

      {/* Composer */}
      {composerOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 animate-fade-in"
          onClick={() => !uploading && setComposerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">New story</h3>
              <button
                onClick={() => setComposerOpen(false)}
                disabled={uploading}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/30 hover:text-foreground transition disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {draftFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {draftFiles.map((f, i) => (
                  <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setDraftFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-destructive transition"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || draftFiles.length >= 10}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-accent/10 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              {draftFiles.length ? `Add more (${draftFiles.length}/10)` : "Add photos"}
            </button>

            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value.slice(0, 280))}
              placeholder="Say something… (optional)"
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">{draftText.length}/280</div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setComposerOpen(false)}
                disabled={uploading}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/20 hover:text-foreground transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={publishStory}
                disabled={uploading || (!draftFiles.length && !draftText.trim())}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary-glow)] hover:scale-[1.03] active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? "Posting…" : "Share story"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/95 p-4 animate-fade-in"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {viewing.images.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className={`h-full ${i < slideIndex ? "w-full bg-white" : i === slideIndex ? "w-full bg-white" : "w-0"}`} />
              </div>
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-6 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {(viewIndex! > 0 || slideIndex > 0) && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {(viewIndex! < viewerList.length - 1 || slideIndex < viewing.images.length - 1) && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="relative max-h-[90vh] max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {viewingSlide ? (
              <img
                key={`${viewing.id}-${slideIndex}`}
                src={viewingSlide}
                alt={viewing.username}
                className="w-full max-h-[85vh] object-contain rounded-2xl animate-scale-in"
                draggable={false}
              />
            ) : (
              <div className="w-full aspect-[3/4] max-h-[85vh] grid place-items-center rounded-2xl bg-gradient-to-br from-primary/40 via-fuchsia-500/30 to-amber-400/30 animate-scale-in p-8">
                <p className="text-center text-2xl font-bold text-white drop-shadow-lg">{viewing.text}</p>
              </div>
            )}
            <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
              {viewing.username}
            </div>
            {viewing.text && viewingSlide && (
              <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/55 backdrop-blur px-4 py-2.5 text-center text-sm font-medium text-white">
                {viewing.text}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="sm:hidden absolute inset-y-0 left-0 w-1/3"
              aria-label="Previous"
            />
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="sm:hidden absolute inset-y-0 right-0 w-1/3"
              aria-label="Next"
            />
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-white/60 sm:hidden">
            Swipe to navigate · Swipe up to close
          </div>
        </div>
      )}
    </>
  );
}
