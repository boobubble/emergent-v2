import { useEffect, useRef, useState } from "react";
import { Plus, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { StoryTraySkeleton } from "./FeedSkeletons";

interface Story {
  id: string;
  user_id: string;
  username: string;
  image: string;
  created_at: number;
}

const KEY = "palrgo:stories:v1";
const TTL = 24 * 60 * 60 * 1000; // 24h

function loadStories(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Story[];
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
  const fileRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setStories(loadStories());
    setHydrated(true);
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/stories/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("feed-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
      const story: Story = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        user_id: user.id,
        username: user.username,
        image: data.publicUrl,
        created_at: Date.now(),
      };
      const next = [story, ...stories.filter((s) => s.user_id !== user.id)];
      setStories(next);
      saveStories(next);
    } catch (err) {
      console.error("story upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  // Build the ordered viewer list (my story first, then others) so the swipe
  // order matches what's visible in the tray.
  function buildViewerList(): Story[] {
    if (!user) return stories;
    const my = stories.find((s) => s.user_id === user.id);
    const others = stories.filter((s) => s.user_id !== user.id);
    return my ? [my, ...others] : others;
  }

  function openAt(story: Story) {
    const list = buildViewerList();
    const idx = list.findIndex((s) => s.id === story.id);
    setViewIndex(idx >= 0 ? idx : 0);
  }

  function close() { setViewIndex(null); }

  function next() {
    const list = buildViewerList();
    setViewIndex((i) => (i == null ? null : Math.min(list.length - 1, i + 1)));
  }
  function prev() {
    setViewIndex((i) => (i == null ? null : Math.max(0, i - 1)));
  }

  // Keyboard navigation when viewer is open
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
  }, [viewIndex]);

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
    // Horizontal swipe (ignore mostly-vertical gestures)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (dy < -80 && Math.abs(dy) > Math.abs(dx)) {
      // Swipe up to dismiss
      close();
    }
  }

  if (!user) return null;
  if (!hydrated) return <StoryTraySkeleton />;

  const myStory = stories.find((s) => s.user_id === user.id);
  const others = stories.filter((s) => s.user_id !== user.id);
  const viewerList = buildViewerList();
  const viewing = viewIndex != null ? viewerList[viewIndex] : null;

  return (
    <>
      <div id="story-tray" className="feed-card p-3 sm:p-4">
        <div className="flex gap-3 overflow-x-auto pb-1 feed-scrollbar-hide snap-x snap-mandatory touch-pan-x">
          {/* Add / my story */}
          <button
            data-story-add
            onClick={() => (myStory ? openAt(myStory) : fileRef.current?.click())}
            className="relative shrink-0 snap-start w-[112px] h-[176px] rounded-[1.25rem] overflow-hidden bg-gradient-to-b from-primary/20 via-card to-card border border-border group transition hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_var(--primary-glow)]"
            aria-label={myStory ? "View your story" : "Add story"}
          >
            {myStory ? (
              <img src={myStory.image} alt="Your story" className="h-full w-full object-cover" />
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
          </button>

          {others.map((s) => (
            <div key={s.id} className="shrink-0 snap-start story-ring transition hover:-translate-y-1">
              <button
                onClick={() => openAt(s)}
                className="relative block w-[108px] h-[172px] rounded-[1.1rem] overflow-hidden bg-card"
                aria-label={`View ${s.username}'s story`}
              >
                <img src={s.image} alt={s.username} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5 text-[11px] font-semibold text-white truncate text-center">
                  {s.username}
                </div>
              </button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/95 p-4 animate-fade-in"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1">
            {viewerList.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className={`h-full ${i < (viewIndex ?? 0) ? "w-full bg-white" : i === viewIndex ? "w-full bg-white" : "w-0"}`} />
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

          {/* Prev / next (desktop) */}
          {viewIndex! > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {viewIndex! < viewerList.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next story"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="relative max-h-[90vh] max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img
              key={viewing.id}
              src={viewing.image}
              alt={viewing.username}
              className="w-full max-h-[85vh] object-contain rounded-2xl animate-scale-in"
              draggable={false}
            />
            <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
              {viewing.username}
            </div>
            {/* Mobile tap zones for prev/next */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="sm:hidden absolute inset-y-0 left-0 w-1/3"
              aria-label="Previous story"
            />
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="sm:hidden absolute inset-y-0 right-0 w-1/3"
              aria-label="Next story"
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
