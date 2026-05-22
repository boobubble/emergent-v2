import { useRef, useState } from "react";
import { Image as ImageIcon, Smile, Hash, Loader2, X, Globe, Users, Lock, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { extractHashtags } from "@/lib/feed-types";
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
  const fileRef = useRef<HTMLInputElement>(null);

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
        kind,
        text: text.trim(),
        media_urls,
        privacy,
        is_anonymous: anonymous,
        hashtags,
      });
      if (error) throw new Error(error.message);
      // bump XP
      await supabase.rpc("noop").catch(() => {});
      const { data: prof } = await supabase.from("profiles").select("xp").eq("id", authorId).maybeSingle();
      if (prof) await supabase.from("profiles").update({ xp: (prof.xp ?? 0) + 5 }).eq("id", authorId);
      setText(""); setFiles([]); setAnonymous(false);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      onPosted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  const PrivacyIcon = PRIVACY.find((p) => p.id === privacy)!.icon;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <textarea
        value={text}
        onChange={(e) => updateText(e.target.value)}
        rows={3}
        placeholder="What's happening? Use #hashtags and @mentions…"
        className="w-full resize-none rounded-2xl border border-transparent bg-transparent px-2 py-1 text-base placeholder:text-muted-foreground focus:outline-none"
      />
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
              <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
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
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
        <button onClick={() => updateText(text + " 😊")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Smile className="h-4 w-4" /> Feeling
        </button>
        <button onClick={() => updateText(text + " #")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <Hash className="h-4 w-4" /> Tag
        </button>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
          >
            {PRIVACY.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
          </select>
          <button onClick={() => setAnonymous(!anonymous)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${anonymous ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            <EyeOff className="h-3 w-3" /> Anon
          </button>
          <PrivacyIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
}
