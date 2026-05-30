import { useEffect, useRef, useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig } from "@/lib/media-providers-config";

interface GifItem { id: string; title: string; previewUrl: string; fullUrl: string; pageUrl: string; }

export function GiphyPicker({ onPick }: { onPick: (gif: GifItem) => void }) {
  const { raw } = useAppSettings();
  const cfg = mergeMediaConfig((raw as any).media).giphy;
  const [q, setQ] = useState("");
  const [items, setItems] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (!cfg.enabled || !cfg.apiKey) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => { void load(); }, q.trim() ? 350 : 0);
    return () => { if (debounce.current) window.clearTimeout(debounce.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cfg.apiKey, cfg.enabled, cfg.rating, cfg.pageSize]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const base = q.trim()
        ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q.trim())}`
        : `https://api.giphy.com/v1/gifs/trending?`;
      const url = `${base}&api_key=${encodeURIComponent(cfg.apiKey)}&limit=${cfg.pageSize}&rating=${cfg.rating}&bundle=messaging_non_clips`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Giphy ${res.status}`);
      const json = await res.json();
      const list: GifItem[] = (json.data ?? []).map((g: any) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url || g.images?.preview_gif?.url,
        fullUrl: g.images?.original?.url || g.images?.downsized?.url,
        pageUrl: g.url || `https://giphy.com/gifs/${g.id}`,
      })).filter((g: GifItem) => g.previewUrl && g.fullUrl);
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load GIFs");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (!cfg.enabled || !cfg.apiKey) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
        <AlertCircle className="mx-auto mb-1 h-5 w-5" />
        Giphy is not configured. Ask an admin to add a key in Media APIs.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search GIFs…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        <span className="text-[10px] text-muted-foreground">via GIPHY</span>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {loading && (
          <div className="grid place-items-center py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {error && !loading && (
          <div className="px-2 py-4 text-center text-xs text-destructive">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-1.5">
            {items.map((g) => (
              <button
                key={g.id}
                onClick={() => onPick(g)}
                className="overflow-hidden rounded-md border border-transparent bg-black/30 transition hover:border-primary/60"
                title={g.title}
              >
                <img src={g.previewUrl} alt={g.title} className="block h-20 w-full object-cover" loading="lazy" />
              </button>
            ))}
            {items.length === 0 && (
              <div className="col-span-3 py-6 text-center text-xs text-muted-foreground">No results</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
