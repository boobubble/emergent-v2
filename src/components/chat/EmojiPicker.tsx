import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { EMOJI_CATEGORIES, getRecentEmojis, pushRecentEmoji } from "@/lib/emoji-data";

export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  const [cat, setCat] = useState<string>("smileys");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => { setRecent(getRecentEmojis()); }, []);

  const categories = useMemo(() => {
    return EMOJI_CATEGORIES.map(c => c.id === "recent" ? { ...c, emojis: recent } : c);
  }, [recent]);

  const active = categories.find(c => c.id === cat) ?? categories[1];

  const visible = useMemo(() => {
    if (!q.trim()) return active.emojis;
    const all = categories.flatMap(c => c.emojis);
    return Array.from(new Set(all));
  }, [q, active, categories]);

  function pick(e: string) {
    pushRecentEmoji(e);
    setRecent(getRecentEmojis());
    onPick(e);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5 overflow-x-auto">
        {categories.map(c => {
          if (c.id === "recent" && recent.length === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); setQ(""); }}
              className={`shrink-0 grid h-8 w-8 place-items-center rounded-lg text-lg transition-colors ${cat === c.id && !q ? "bg-primary/15" : "hover:bg-white/5"}`}
              title={c.label}
              aria-label={c.label}
            >
              {c.icon}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search emoji"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <div className="max-h-[260px] overflow-y-auto p-1.5">
        {q && <div className="px-1 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">All</div>}
        {!q && <div className="px-1 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{active.label}</div>}
        <div className="grid grid-cols-8 gap-0.5">
          {visible.map((e, i) => (
            <button
              key={`${e}-${i}`}
              onClick={() => pick(e)}
              className="grid h-8 w-8 place-items-center rounded-lg text-xl transition-transform hover:scale-110 hover:bg-white/5 active:scale-95"
              title={e}
            >
              {e}
            </button>
          ))}
          {visible.length === 0 && (
            <div className="col-span-8 py-6 text-center text-xs text-muted-foreground">No emoji</div>
          )}
        </div>
      </div>
    </div>
  );
}
