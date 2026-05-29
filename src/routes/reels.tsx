import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Film, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Reels — Palrgo" },
      { name: "description", content: "Short videos from the Palrgo community." },
      { property: "og:title", content: "Reels — Palrgo" },
      { property: "og:description", content: "Short videos from the Palrgo community." },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  return <ComingSoon icon={Film} title="Reels" tagline="Short videos, fast scroll, big vibes." />;
}

export function ComingSoon({ icon: Icon, title, tagline }: { icon: typeof Film; title: string; tagline: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5">
          <Link to="/feed" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-[640px] place-items-center px-4 py-16 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">{title} is coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Launching soon
          </div>
        </div>
      </main>
    </div>
  );
}
