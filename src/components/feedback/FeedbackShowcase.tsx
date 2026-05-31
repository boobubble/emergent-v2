import { useEffect, useState } from "react";
import { ChevronUp, MessageCircle, Quote } from "lucide-react";
import { CATEGORY_META, STATUS_META, type FeedbackStatus } from "@/lib/feedback-config";

type ShowcaseItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  author: { username: string; avatar_url: string | null; anonymous: boolean };
};

type ShowcaseResponse = { enabled: boolean; title: string; items: ShowcaseItem[] };

export function FeedbackShowcase({
  surface,
  className = "",
}: {
  surface: "home" | "signup";
  className?: string;
}) {
  const [data, setData] = useState<ShowcaseResponse | null>(null);

  useEffect(() => {
    let cancel = false;
    fetch(`/api/public/feedback-showcase?surface=${surface}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ShowcaseResponse | null) => { if (!cancel) setData(d); })
      .catch(() => { if (!cancel) setData(null); });
    return () => { cancel = true; };
  }, [surface]);

  if (!data || !data.enabled || data.items.length === 0) return null;

  return (
    <section className={`w-full ${className}`} aria-label="Community feedback">
      <header className="mb-3 flex items-center gap-2">
        <Quote className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold tracking-tight">{data.title}</h2>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.items.map((item) => {
          const Cat = CATEGORY_META[item.category as keyof typeof CATEGORY_META] ?? CATEGORY_META.other;
          const St = STATUS_META[item.status as FeedbackStatus] ?? STATUS_META.open;
          const initial = (item.author.username || "?").trim().charAt(0).toUpperCase();
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-card p-3 text-left shadow-sm"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-10 w-8 flex-col items-center justify-center rounded-md border border-border bg-background">
                  <ChevronUp className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-semibold tabular-nums">{item.upvote_count}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] ${Cat.tone}`}>
                      <Cat.icon className="h-3 w-3" /> {Cat.label}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${St.tone}`}>{St.label}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> {item.comment_count}
                    </span>
                  </div>
                </div>
              </div>
              <footer className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
                {item.author.avatar_url ? (
                  <img
                    src={item.author.avatar_url}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {initial}
                  </div>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {item.author.anonymous ? "Anonymous member" : `@${item.author.username}`}
                </span>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
