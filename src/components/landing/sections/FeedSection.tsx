import { Heart, MessageCircle, Newspaper, Share2, Sparkles } from "lucide-react";
import type { HeroConfig, HeroShowcaseItem } from "@/lib/hero-page-config";
import { SectionShell } from "../ui/SectionShell";

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] backdrop-blur-xl [data-hero-theme=light]:border-violet-300/40 [data-hero-theme=light]:bg-violet-500/10">
      {children}
    </div>
  );
}

function FeatureRow({ items }: { items: HeroShowcaseItem[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div
          key={`${it.title}-${i}`}
          className="group flex min-h-[44px] items-start gap-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.03] p-3 transition hover:border-indigo-400/30 [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/60"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 text-xl">
            {it.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="mt-0.5 text-xs opacity-70">{it.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedPreviewCard() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#0b0b1a]/95 shadow-[0_24px_64px_-16px_rgba(99,102,241,0.35)] backdrop-blur-xl [data-hero-theme=light]:border-indigo-200/60 [data-hero-theme=light]:bg-white/90 sm:rounded-3xl">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 [data-hero-theme=light]:border-violet-200/40 sm:px-4 sm:py-3">
        <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] text-white/55 [data-hero-theme=light]:text-slate-500 sm:text-xs">
          <Sparkles className="h-3 w-3 shrink-0 text-cyan-400 sm:h-3.5 sm:w-3.5" />
          Demo preview · Feed
        </span>
        <span className="shrink-0 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-medium text-indigo-200 [data-hero-theme=light]:text-indigo-700 sm:text-[10px]">
          Sample content
        </span>
      </div>

      <div className="p-3 text-white [data-hero-theme=light]:text-slate-900 sm:p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 [data-hero-theme=light]:border-violet-200/50 [data-hero-theme=light]:bg-violet-50/50 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">
              S
            </div>
            <div className="min-w-0 text-xs">
              <div className="font-semibold">Sample member</div>
              <div className="opacity-60">Demo timeline · Just now</div>
            </div>
          </div>
          <p className="mt-3 text-[clamp(0.875rem,2.5vw,0.9375rem)] leading-relaxed opacity-90">
            Sharing a moment with the community — photos, thoughts, and good vibes.
          </p>
          <div className="mt-3 aspect-[16/9] w-full min-w-0 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 opacity-80" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/80"
              aria-label="React"
            >
              <Heart className="h-4 w-4 text-rose-400" />
              React
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/80"
              aria-label="Comment"
            >
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              Comment
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/80"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4 text-violet-400" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedSection({ cfg }: { cfg: HeroConfig }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.12),_transparent_60%)]" />
      <SectionShell className="!px-4 sm:!px-5">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="min-w-0 lg:order-2">
            <SectionTag>
              <Newspaper className="h-3.5 w-3.5 text-cyan-400" />
              Share Your Moments
            </SectionTag>
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-black leading-tight [data-hero-theme=light]:text-slate-900">
              Engaging social feed for your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">community</span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.9375rem,2.5vw,1.0625rem)] opacity-75 [data-hero-theme=light]:text-slate-700">
              Share updates, photos, and thoughts. Connect through reactions, comments, and trending topics.
            </p>
            <FeatureRow items={cfg.feedFeatures.slice(0, 8)} />
          </div>

          <div className="relative min-w-0 lg:order-1">
            <div className="pointer-events-none absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-indigo-500/20 to-cyan-500/15 blur-2xl sm:-inset-8 sm:rounded-[40px]" />
            <div className="relative min-w-0" style={{ animation: "hero-float 10s ease-in-out infinite" }}>
              <FeedPreviewCard />
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
