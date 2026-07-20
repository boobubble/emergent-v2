import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Heart, Eye, MessageCircle, Swords, Flame, Hash, TrendingUp, Clock, Crown, BadgeCheck } from "lucide-react";
import {
  mehfilSearch,
  getMehfilQuickPanel,
  type MSPoemResult,
  type MSWriterResult,
  type MSCategoryResult,
} from "@/lib/mehfil-search.functions";
import { WriterRankBadge } from "./WriterRankBadge";
import type { WriterRank } from "@/lib/mehfil-types";
import { useAuth } from "@/lib/auth-store";

const FILTER_CHIPS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "love", label: "Love" },
  { key: "breakup", label: "Breakup" },
  { key: "life", label: "Life" },
  { key: "friendship", label: "Friendship" },
  { key: "motivation", label: "Motivation" },
  { key: "funny", label: "Funny" },
  { key: "urdu", label: "Urdu" },
  { key: "hindi", label: "Hindi" },
  { key: "english", label: "English" },
  { key: "battle", label: "Battle Poems" },
  { key: "trending", label: "Trending" },
];

const RECENT_KEY = "mehfil:recent-searches";

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function highlight(text: string, q: string): (string | JSX.Element)[] {
  if (!q) return [text];
  const clean = q.replace(/^[#@]/, "").trim();
  if (!clean) return [text];
  try {
    const re = new RegExp(`(${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? <mark key={i} className="rounded bg-primary/25 px-0.5 text-primary-foreground/90">{p}</mark> : p
    );
  } catch {
    return [text];
  }
}

function pickMatchingLines(body: string, q: string, max = 3): string[] {
  const clean = q.replace(/^[#@]/, "").trim().toLowerCase();
  const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!clean) return lines.slice(0, max);
  const matches = lines.filter((l) => l.toLowerCase().includes(clean));
  const rest = lines.filter((l) => !matches.includes(l));
  return [...matches, ...rest].slice(0, max);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  return `${mo}mo ago`;
}

export function MehfilSearchBar() {
  const auth = useAuth();
  const userId = auth?.user?.id ?? null;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [focused, setFocused] = useState(false);
  const debounced = useDebounced(q, 250);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {}
  }, [userId]);

  function pushRecent(term: string) {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    setRecents(next);
    try {
      localStorage.setItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY, JSON.stringify(next));
    } catch {}
  }

  function clearRecents() {
    setRecents([]);
    try { localStorage.removeItem(userId ? `${RECENT_KEY}:${userId}` : RECENT_KEY); } catch {}
  }

  const search = useServerFn(mehfilSearch);
  const quick = useServerFn(getMehfilQuickPanel);

  const results = useQuery({
    queryKey: ["mehfil-search", debounced, filter],
    queryFn: () => search({ data: { q: debounced, filter } }),
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const panel = useQuery({
    queryKey: ["mehfil-search-quick"],
    queryFn: () => quick(),
    staleTime: 5 * 60_000,
  });

  const hasQuery = debounced.trim().length >= 2;
  const showPanel = focused && !hasQuery;
  const data = results.data;
  const totalHits = data ? data.poems.length + data.writers.length + data.categories.length + data.hashtags.length : 0;

  return (
    <section className="relative -mt-2 mb-8">
      {/* Sticky wrapper for mobile */}
      <div className="sticky top-16 z-20">
        <div className="rounded-2xl border border-border/60 bg-card/95 p-3 shadow-lg backdrop-blur md:p-4">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim()) pushRecent(q.trim());
                if (e.key === "Escape") { setQ(""); (e.target as HTMLInputElement).blur(); }
              }}
              placeholder="🔍 Search poems, keywords, writers or hashtags..."
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              aria-label="Search Mehfil"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} className="rounded-full p-1 hover:bg-muted" aria-label="Clear">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          {/* Filter chips */}
          <div className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {FILTER_CHIPS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  filter === c.key
                    ? "border-primary bg-primary text-primary-foreground shadow"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Panel (focus, empty query) */}
      {showPanel && (
        <QuickPanel
          panel={panel.data}
          recents={recents}
          onPick={(term) => { setQ(term); pushRecent(term); inputRef.current?.focus(); }}
          onClearRecents={clearRecents}
        />
      )}

      {/* Results */}
      {hasQuery && (
        <div className="mt-4 space-y-6">
          {results.isFetching && !data && (
            <div className="py-10 text-center text-sm text-muted-foreground">Searching…</div>
          )}

          {data && totalHits === 0 && !results.isFetching && (
            <EmptyState onPickTrending={() => setFilter("trending")} />
          )}

          {data && data.writers.length > 0 && (
            <ResultsGroup title="👑 Writers">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {data.writers.map((w) => <WriterMiniCard key={w.id} writer={w} q={debounced} />)}
              </div>
            </ResultsGroup>
          )}

          {data && data.poems.length > 0 && (
            <ResultsGroup title="🌹 Poems">
              <div className="space-y-3">
                {data.poems.map((p) => <PoemSearchCard key={p.id} poem={p} q={debounced} />)}
              </div>
            </ResultsGroup>
          )}

          {data && data.categories.length > 0 && (
            <ResultsGroup title="📚 Categories">
              <div className="flex flex-wrap gap-2">
                {data.categories.map((c) => <CategoryChip key={c.id} cat={c} />)}
              </div>
            </ResultsGroup>
          )}

          {data && data.hashtags.length > 0 && (
            <ResultsGroup title="🏷 Hashtags">
              <div className="flex flex-wrap gap-2">
                {data.hashtags.map((h) => (
                  <button
                    key={h.tag}
                    type="button"
                    onClick={() => { setQ(`#${h.tag}`); pushRecent(`#${h.tag}`); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
                  >
                    <Hash className="h-3 w-3" /> {h.tag}
                    <span className="text-[10px] font-normal text-muted-foreground">· {h.poem_count}</span>
                  </button>
                ))}
              </div>
            </ResultsGroup>
          )}
        </div>
      )}
    </section>
  );
}

function ResultsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function QuickPanel({
  panel, recents, onPick, onClearRecents,
}: {
  panel: import("@/lib/mehfil-search.functions").MehfilQuickPanel | undefined;
  recents: string[];
  onPick: (term: string) => void;
  onClearRecents: () => void;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500" /> Trending Searches
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(panel?.trending_searches ?? []).map((t) => (
              <button key={t} type="button" onMouseDown={(e) => { e.preventDefault(); onPick(t); }}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary">
                {t}
              </button>
            ))}
          </div>

          <h4 className="mt-4 mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Popular Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(panel?.popular_keywords ?? []).map((t) => (
              <button key={t} type="button" onMouseDown={(e) => { e.preventDefault(); onPick(t); }}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                {t}
              </button>
            ))}
          </div>

          <h4 className="mt-4 mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Hash className="h-3.5 w-3.5" /> Trending Hashtags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(panel?.trending_hashtags ?? []).map((h) => (
              <button key={h.tag} type="button" onMouseDown={(e) => { e.preventDefault(); onPick(`#${h.tag}`); }}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary">
                <Hash className="h-3 w-3" /> {h.tag}
                <span className="text-[10px] text-muted-foreground">· {h.poem_count}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-amber-500" /> Popular Writers
          </h4>
          <div className="grid gap-1.5">
            {(panel?.popular_writers ?? []).map((w) => (
              <Link
                key={w.id}
                to="/u/$username"
                params={{ username: w.username ?? w.id }}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
              >
                {w.avatar_url
                  ? <img src={w.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  : <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{w.name.slice(0,1).toUpperCase()}</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-sm font-semibold">
                    {w.name} {w.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <WriterRankBadge rank={w.writer_rank as WriterRank} />
                </div>
                <div className="text-[11px] text-muted-foreground">{w.total_upvotes} ❤</div>
              </Link>
            ))}
          </div>

          {recents.length > 0 && (
            <>
              <div className="mt-4 flex items-center justify-between">
                <h4 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Recent Searches
                </h4>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); onClearRecents(); }}
                  className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recents.map((r) => (
                  <button key={r} type="button" onMouseDown={(e) => { e.preventDefault(); onPick(r); }}
                    className="rounded-full border border-dashed border-border px-3 py-1 text-xs hover:border-primary hover:text-primary">
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PoemSearchCard({ poem, q }: { poem: MSPoemResult; q: string }) {
  const lines = useMemo(() => pickMatchingLines(poem.body_excerpt, q, 3), [poem.body_excerpt, q]);
  const author = poem.author;
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/50 hover:shadow-md md:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {author?.avatar_url
            ? <img src={author.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            : <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{(author?.name ?? "?").slice(0,1).toUpperCase()}</div>}
          <div className="min-w-0">
            <div className="flex items-center gap-1 truncate text-sm font-semibold">
              {author ? highlight(author.name, q) : "Anonymous"}
              {author?.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
            </div>
            <div className="flex items-center gap-2">
              <WriterRankBadge rank={author?.writer_rank as WriterRank} />
              {poem.category && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }}>
                  {poem.category.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {poem.is_battle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              <Swords className="h-3 w-3" /> Battle
            </span>
          )}
          {poem.is_trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              <Flame className="h-3 w-3" /> Trending
            </span>
          )}
        </div>
      </header>

      <h3 className="mt-3 font-serif text-lg font-bold leading-tight group-hover:text-primary">
        {highlight(poem.title, q)}
      </h3>
      <div className="mt-2 space-y-0.5 font-serif text-sm leading-relaxed text-foreground/85">
        {lines.map((l, i) => <p key={i} className="line-clamp-1">{highlight(l, q)}</p>)}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {poem.upvotes}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {poem.reads}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {poem.comments}</span>
          {poem.published_at && <span>· {timeAgo(poem.published_at)}</span>}
        </div>
        <Link
          to="/mehfil/$slug"
          params={{ slug: poem.slug }}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Read Full
        </Link>
      </footer>
    </article>
  );
}

function WriterMiniCard({ writer, q }: { writer: MSWriterResult; q: string }) {
  return (
    <Link
      to="/u/$username"
      params={{ username: writer.username ?? writer.id }}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 hover:border-primary/50"
    >
      {writer.avatar_url
        ? <img src={writer.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
        : <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{writer.name.slice(0,1).toUpperCase()}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 truncate text-sm font-semibold">
          {highlight(writer.name, q)}
          {writer.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
        </div>
        <WriterRankBadge rank={writer.writer_rank as WriterRank} />
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {writer.poems_published} poems · {writer.total_upvotes} ❤
        </div>
      </div>
    </Link>
  );
}

function CategoryChip({ cat }: { cat: MSCategoryResult }) {
  return (
    <Link
      to="/mehfil/category/$slug"
      params={{ slug: cat.slug }}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary"
      style={{ borderLeftColor: cat.color ?? undefined, borderLeftWidth: 3 }}
    >
      <span style={{ color: cat.color ?? undefined }}>{cat.name}</span>
      <span className="text-[10px] font-normal text-muted-foreground">{cat.poem_count} poems</span>
    </Link>
  );
}

function EmptyState({ onPickTrending }: { onPickTrending: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-8 text-center">
      <div className="text-3xl">📜</div>
      <p className="mt-2 text-sm font-semibold">No poems found.</p>
      <p className="mt-1 text-xs text-muted-foreground">Try another keyword, or explore what's popular.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Link to="/mehfil" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
          Explore Categories
        </Link>
        <button type="button" onClick={onPickTrending} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Flame className="h-3.5 w-3.5" /> View Trending Poems
        </button>
      </div>
    </div>
  );
}
