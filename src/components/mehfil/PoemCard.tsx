import { Link } from "@tanstack/react-router";
const totalReactions = (p: { upvote_count: number; reaction_count?: number }) =>
  (p.upvote_count ?? 0) + (p.reaction_count ?? 0);
import { Heart, Eye, MessageCircle, Sparkles, Swords } from "lucide-react";
import { poemPreview, type MehfilPoemEnriched } from "@/lib/mehfil-types";
import { WriterRankBadge } from "./WriterRankBadge";

interface Props {
  poem: MehfilPoemEnriched;
  variant?: "default" | "compact" | "hero";
}

export function PoemCard({ poem, variant = "default" }: Props) {
  const author = poem.author;
  const displayName = author?.display_name || author?.username || "Anonymous";
  const themeStyle = poem.theme
    ? { background: poem.theme }
    : { background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.4) 100%)" };

  if (variant === "compact") {
    return (
      <Link
        to="/poetry/$slug"
        params={{ slug: poem.slug }}
        className="group block rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          {poem.category ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }}
            >
              {poem.category.name}
            </span>
          ) : <span />}
          {poem.is_editors_pick && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{poem.title}</h3>
        <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">{poemPreview(poem.body, 100)}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate">by {displayName}</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5"><Heart className="h-3 w-3" /> {poem.upvote_count}</span>
            <span className="inline-flex items-center gap-0.5"><Eye className="h-3 w-3" /> {poem.read_count}</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/poetry/$slug"
      params={{ slug: poem.slug }}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
    >
      <div className="relative p-5" style={themeStyle}>
        {poem.competition_id && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            <Swords className="h-3 w-3" /> Battle
          </span>
        )}
        {poem.category && (
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${poem.category.color ?? "#6366f1"}22`, color: poem.category.color ?? "#6366f1" }}
          >
            {poem.category.name}
          </span>
        )}
        <h2 className={`mt-3 font-serif font-bold leading-tight group-hover:text-primary ${variant === "hero" ? "text-2xl" : "text-lg"}`}>
          {poem.title}
        </h2>
        <p className={`mt-2 whitespace-pre-line text-sm text-foreground/80 ${variant === "hero" ? "line-clamp-6" : "line-clamp-4"}`}>
          {poemPreview(poem.body, variant === "hero" ? 400 : 220)}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 bg-card/80 px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{displayName}</div>
            <WriterRankBadge rank={poem.writer_rank} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {poem.upvote_count}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {poem.read_count}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {poem.comment_count}</span>
        </div>
      </div>
    </Link>
  );
}
