import { ArrowRight, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import type { AuthPopup } from "@/components/auth/AuthScreen";
import type { HeroConfig, HeroShowcaseItem } from "@/lib/hero-page-config";
import { SectionShell } from "../ui/SectionShell";

const DEMO_ROOMS = [
  { emoji: "💬", name: "Chill Lounge", topic: "Relaxed conversations", tag: "Active" as const },
  { emoji: "🎵", name: "Music Vibes", topic: "Share tracks & playlists", tag: "Popular" as const },
  { emoji: "🎮", name: "Gaming Zone", topic: "Team up and play together", tag: "Trending" as const },
  { emoji: "🌙", name: "Late Night", topic: "Cozy after-hours chat", tag: "Featured" as const },
  { emoji: "✨", name: "Creative Hub", topic: "Art, ideas & inspiration", tag: "Popular" as const },
  { emoji: "🔥", name: "Main Stage", topic: "Community highlights", tag: "Active" as const },
];

const TAG_STYLE: Record<(typeof DEMO_ROOMS)[number]["tag"], string> = {
  Active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  Popular: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Trending: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  Featured: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
};

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
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/25 to-indigo-500/25 text-xl">
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

function RoomCard({ room }: { room: (typeof DEMO_ROOMS)[number] }) {
  return (
    <div className="flex min-h-[44px] min-w-0 flex-col rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4 transition hover:border-indigo-400/30 [data-hero-theme=light]:border-violet-200/60 [data-hero-theme=light]:bg-white/70">
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/25 to-indigo-500/25 text-2xl">
          {room.emoji}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TAG_STYLE[room.tag]}`}>
          {room.tag}
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <div className="truncate text-sm font-bold">{room.name}</div>
        <div className="mt-0.5 line-clamp-2 text-xs opacity-70">{room.topic}</div>
      </div>
    </div>
  );
}

export function ChatroomsSection({
  cfg,
  setPopup,
}: {
  cfg: HeroConfig;
  setPopup: (p: AuthPopup) => void;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15),_transparent_60%)]" />
      <SectionShell className="!px-4 sm:!px-5">
        <SectionTag>
          <MessageCircle className="h-3.5 w-3.5 text-violet-400" />
          Chat Without Limits
        </SectionTag>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:items-start">
          <div className="min-w-0">
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-black leading-tight [data-hero-theme=light]:text-slate-900">
              Real-time chatrooms built for{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">everyone</span>
            </h2>
            <p className="mt-4 max-w-xl text-[clamp(0.9375rem,2.5vw,1.0625rem)] opacity-75 [data-hero-theme=light]:text-slate-700">
              Join public chatrooms, create private rooms, and hang out with friends. Messaging, voice, radio, and games in one place.
            </p>
            <FeatureRow items={cfg.chatroomFeatures.slice(0, 8)} />
            <button
              type="button"
              onClick={() => setPopup("signup")}
              className="group mt-8 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] transition-transform hover:scale-[1.02] sm:w-auto"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              {cfg.ctaJoinLabel}
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider opacity-60">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Demo preview
              </span>
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                Sample rooms
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_ROOMS.map((room) => (
                <RoomCard key={room.name} room={room} />
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
