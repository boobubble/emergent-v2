import { useEffect, useRef, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

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
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<Story | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setStories(loadStories()); }, []);

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

  if (!user) return null;

  const myStory = stories.find((s) => s.user_id === user.id);
  const others = stories.filter((s) => s.user_id !== user.id);

  return (
    <>
      <div className="mb-3 rounded-xl sm:rounded-2xl bg-card shadow-sm border border-border p-3">
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Add / my story */}
          <button
            onClick={() => (myStory ? setViewing(myStory) : fileRef.current?.click())}
            className="relative shrink-0 w-20 h-28 rounded-2xl border border-border overflow-hidden bg-muted group"
            aria-label={myStory ? "View your story" : "Add story"}
          >
            {myStory ? (
              <img src={myStory.image} alt="Your story" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-b from-primary/10 to-card">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-medium text-white text-center">
              {myStory ? "Your story" : "Add story"}
            </div>
          </button>

          {others.map((s) => (
            <button
              key={s.id}
              onClick={() => setViewing(s)}
              className="relative shrink-0 w-20 h-28 rounded-2xl overflow-hidden border-2 border-primary"
              aria-label={`View ${s.username}'s story`}
            >
              <img src={s.image} alt={s.username} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-medium text-white truncate text-center">
                {s.username}
              </div>
            </button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setViewing(null)}>
          <button
            onClick={(e) => { e.stopPropagation(); setViewing(null); }}
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[90vh] max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img src={viewing.image} alt={viewing.username} className="w-full max-h-[85vh] object-contain rounded-2xl" />
            <div className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
              {viewing.username}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
