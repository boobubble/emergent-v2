import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle, Newspaper, Gamepad2, Trophy, Sparkles, Flame, Users, Activity,
  Menu, X, ArrowRight, Heart, MessageSquare, Coins, Zap, Gift, ChevronRight,
  Crown, Star, Twitter, Github, Instagram, Send,
} from "lucide-react";
import { LANDING_DEFAULTS, type LandingConfig } from "@/lib/landing-config";

type Author = {
  username: string;
  avatar_url: string | null;
  avatar_color: string | null;
  anonymous: boolean;
};

interface LandingPayload {
  config: LandingConfig;
  stats: { members: number; online: number; postsToday: number; activeRooms: number };
  posts: Array<{
    id: string; text: string; kind: string;
    reaction_count: number; comment_count: number; has_media: boolean; author: Author;
  }>;
  messages: Array<{ id: string; text: string; author: Author }>;
  poll: null | {
    id: string;
    question: string;
    options: Array<{ label: string; votes: number }>;
    author: Author;
  };
  confession: null | {
    id: string; text: string; alias: string; avatar_emoji: string;
    like_count: number; reply_count: number; category: string;
  };
  leaderboard: Array<{
    id: string; username: string; avatar_url: string | null;
    avatar_color: string | null; level: number; xp: number; streak: number;
  }>;
}

const HOST = "https://holo-chat-quest.lovable.app";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: LANDING_DEFAULTS.seoTitle },
      { name: "description", content: LANDING_DEFAULTS.seoDescription },
      { name: "keywords", content: LANDING_DEFAULTS.seoKeywords },
      { property: "og:title", content: LANDING_DEFAULTS.seoTitle },
      { property: "og:description", content: LANDING_DEFAULTS.seoDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${HOST}/welcome` },
      { property: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${HOST}/welcome` }],
    scripts: LANDING_DEFAULTS.enableStructuredData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: LANDING_DEFAULTS.copyrightOwner,
              url: `${HOST}/welcome`,
              description: LANDING_DEFAULTS.seoDescription,
            }),
          },
        ]
      : [],
  }),
  component: LandingPage,
});

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : String(n);

function Avatar({ author, size = 32 }: { author: Author | { username: string; avatar_url: string | null; avatar_color: string | null }; size?: number }) {
  const letter = (author.username || "?").trim().charAt(0).toUpperCase();
  if (author.avatar_url) {
    return (
      <img
        src={author.avatar_url}
        alt=""
        className="rounded-full object-cover ring-2 ring-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center rounded-full font-bold text-white ring-2 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: author.avatar_color || "linear-gradient(135deg,#8b5cf6,#3b82f6)",
      }}
    >
      {letter}
    </div>
  );
}

function GlassCard({ className = "", children, glow = false }: { className?: string; children: React.ReactNode; glow?: boolean }) {
  return (
    <div
      className={`relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl ${className}`}
      style={glow ? { boxShadow: "0 0 60px -20px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.06)" } : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  const [data, setData] = useState<LandingPayload | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pollChoice, setPollChoice] = useState<number | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/public/landing", { credentials: "omit" });
        if (!res.ok) return;
        const json = (await res.json()) as LandingPayload;
        if (!cancel) setData(json);
      } catch { /* silent */ }
    })();
    return () => { cancel = true; };
  }, []);

  const cfg: LandingConfig = data?.config ?? LANDING_DEFAULTS;
  const stats = data?.stats ?? { members: 0, online: 0, postsToday: 0, activeRooms: 0 };

  const navLinks = useMemo(
    () => [
      { label: "Home",        to: "/welcome"     },
      { label: "Feed",        to: "/feed"        },
      { label: "Chatrooms",   to: "/"            },
      { label: "Games",       to: "/games"       },
      { label: "Confessions", to: "/confessions" },
      { label: "Leaderboard", to: "/leaderboard" },
    ],
    [],
  );

  const messageRail = useMemo(() => {
    const items = data?.messages ?? [];
    return items.length ? [...items, ...items] : [];
  }, [data?.messages]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070713] text-white antialiased">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 select-none" aria-hidden>
        <div className="absolute -left-32 top-[-10%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
        <div className="absolute right-[-15%] top-[20%] h-[600px] w-[600px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
        <div className="absolute left-1/3 bottom-[-10%] h-[500px] w-[500px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#ec4899,transparent 70%)" }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 70%)",
          }}
        />
      </div>

      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070713]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/welcome" className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-lg font-black text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)" }}
            >
              P
            </span>
            <span className="text-base font-extrabold tracking-tight">{cfg.copyrightOwner}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to + l.label}
                to={l.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                activeProps={{ className: "rounded-full px-3.5 py-2 text-sm font-semibold text-white bg-white/10" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:text-white">
              Login
            </Link>
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.7)" }}
            >
              Create Account
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#070713]/95 px-4 pb-4 pt-2 lg:hidden">
            <nav className="grid gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to + l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold">Login</Link>
              <Link
                to="/login"
                className="rounded-full px-4 py-2.5 text-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:px-8 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <span className="grid h-2 w-2 place-items-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {cfg.heroEyebrow}
            </div>

            <h1 className="mt-5 text-[40px] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg,#fff 0%,#c4b5fd 55%,#93c5fd 100%)" }}>
                {cfg.heroTitle}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">{cfg.heroSubtitle}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {cfg.heroBadges.map((b) => (
                <span key={b} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={cfg.primaryCtaHref}
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 12px 32px -8px rgba(139,92,246,0.65)" }}
              >
                {cfg.primaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={cfg.secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/[0.08]"
              >
                {cfg.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-purple-300" /> Free forever</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-blue-300" /> Real-time</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-300" /> {fmt(stats.members)}+ members</span>
            </div>
          </div>

          {/* Mockup preview */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-[460px]">
              {/* Chatroom card */}
              <GlassCard glow className="p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg text-base" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>💬</div>
                  <div>
                    <div className="text-xs font-bold">#lobby</div>
                    <div className="text-[10px] text-white/50">{fmt(stats.online)} online · live</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {(data?.messages ?? []).slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-start gap-2 rounded-2xl bg-white/[0.04] px-3 py-2">
                      <Avatar author={m.author} size={26} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white/85">@{m.author.username}</div>
                        <div className="line-clamp-2 text-[12px] text-white/70">{m.text || "…"}</div>
                      </div>
                    </div>
                  ))}
                  {!data && [0, 1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
                  ))}
                </div>
              </GlassCard>

              {/* Feed card overlapping */}
              <div className="-mt-6 ml-auto w-[78%]">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-white/60">
                    <Newspaper className="h-3.5 w-3.5 text-blue-300" /> Latest feed post
                  </div>
                  {data?.posts?.[0] ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <Avatar author={data.posts[0].author} size={26} />
                        <div className="text-[11px] font-bold">@{data.posts[0].author.username}</div>
                      </div>
                      <p className="mt-2 line-clamp-3 text-[12px] text-white/75">{data.posts[0].text || (data.posts[0].has_media ? "📷 shared a photo" : "shared an update")}</p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/55">
                        <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {data.posts[0].reaction_count}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {data.posts[0].comment_count}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-3/5 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Mobile mockup chip */}
              <div className="-mt-4 w-[60%]">
                <GlassCard className="flex items-center gap-3 px-4 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl text-base" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>🎮</div>
                  <div>
                    <div className="text-[11px] font-bold">Daily mission complete</div>
                    <div className="text-[10px] text-white/55">+25 XP · +50 coins</div>
                  </div>
                  <Coins className="ml-auto h-4 w-4 text-amber-300" />
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Live stats strip ───────── */}
      {cfg.showStats && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <GlassCard className="grid grid-cols-2 gap-px overflow-hidden bg-white/[0.02] sm:grid-cols-3 lg:grid-cols-6">
            <StatCell icon={Users}        label="Total Members"   value={fmt(stats.members)} />
            <StatCell icon={Activity}     label="Online Now"      value={fmt(stats.online)}  pulse />
            {cfg.showMessageCount && (
              <StatCell icon={MessageCircle} label="Messages Sent" value={fmt(cfg.fallbackMessagesSent)} />
            )}
            <StatCell icon={Newspaper}    label="Posts Today"     value={fmt(stats.postsToday)} />
            {cfg.showGameCount && (
              <StatCell icon={Gamepad2}   label="Games Played"    value={fmt(cfg.fallbackGamesPlayed)} />
            )}
            {cfg.showGrowth && (
              <StatCell icon={Sparkles}   label="Growth"          value={cfg.growthLabel} />
            )}
          </GlassCard>
        </section>
      )}

      {/* ───────── Live chat marquee ───────── */}
      {messageRail.length > 0 && (
        <section className="border-y border-white/5 bg-white/[0.02] py-4">
          <div className="relative overflow-hidden">
            <div className="flex w-max gap-3 px-6" style={{ animation: "landing-marquee 60s linear infinite" }}>
              {messageRail.map((m, i) => (
                <div key={`${m.id}-${i}`} className="flex max-w-[300px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur">
                  <Avatar author={m.author} size={20} />
                  <span className="truncate text-[12px] text-white/75">
                    <span className="font-semibold text-white/85">@{m.author.username}</span>
                    <span className="mx-1.5 text-white/30">·</span>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Features ───────── */}
      <Section title="Everything your community needs" eyebrow="Features" subtitle="One platform for chats, posts, games, friendships and rewards.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cfg.featureCards.map((f) => (
            <GlassCard key={f.title} className="group p-5 transition-transform hover:-translate-y-0.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))" }}>
                {f.emoji}
              </div>
              <h3 className="mt-4 text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-white/65">{f.description}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ───────── Live community three-column ───────── */}
      <Section title="The community right now" eyebrow="Live preview" subtitle="A real-time snapshot of what's happening across the platform.">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Trending chatrooms (lobby + activity) */}
          <GlassCard className="p-5">
            <SectionHead icon={MessageCircle} title="Trending chatrooms" />
            <div className="mt-3 space-y-2">
              {[
                { name: "#lobby",     online: stats.online, tag: "General" },
                { name: "#games",     online: Math.max(2, Math.round(stats.online * 0.4)), tag: "Gaming" },
                { name: "#feed-chat", online: Math.max(1, Math.round(stats.online * 0.25)), tag: "Talk" },
                { name: "#newcomers", online: Math.max(1, Math.round(stats.online * 0.15)), tag: "Intro" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>💬</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{r.name}</div>
                    <div className="text-[11px] text-white/55">{r.tag}</div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {fmt(r.online)}
                    </div>
                    <div className="text-[10px] text-white/45">online</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Feed activity */}
          <GlassCard className="p-5">
            <SectionHead icon={Newspaper} title="Latest feed activity" />
            <div className="mt-3 space-y-3">
              {(data?.posts ?? []).slice(0, 3).map((p) => (
                <article key={p.id} className="rounded-2xl bg-white/[0.03] p-3">
                  <header className="flex items-center gap-2">
                    <Avatar author={p.author} size={26} />
                    <div className="text-[11px] font-bold">@{p.author.username}</div>
                  </header>
                  <p className="mt-1.5 line-clamp-3 text-[12px] leading-snug text-white/75">
                    {p.text || (p.has_media ? "📷 shared a photo" : "shared an update")}
                  </p>
                  <footer className="mt-2 flex items-center gap-3 text-[10px] text-white/55">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {p.reaction_count}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {p.comment_count}</span>
                  </footer>
                </article>
              ))}
              {!data?.posts?.length && [0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          </GlassCard>

          {/* Popular games */}
          <GlassCard className="p-5">
            <SectionHead icon={Gamepad2} title="Popular games" />
            <div className="mt-3 grid gap-2">
              {cfg.games.map((g) => (
                <div key={g.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>{g.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{g.name}</div>
                    <div className="text-[11px] text-white/55">{g.reward}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* ───────── Poll + Confession ───────── */}
      <Section title="Polls & Confessions" eyebrow="Community voice" subtitle="Take part in decisions and read what people share anonymously.">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Poll */}
          <GlassCard className="p-5">
            <SectionHead icon={Sparkles} title="Community poll" />
            {(() => {
              const poll = data?.poll;
              const question = poll?.question ?? cfg.samplePollQuestion;
              const options = poll?.options ?? [
                { label: cfg.samplePollYesLabel, votes: 312 },
                { label: cfg.samplePollNoLabel,  votes: 47  },
              ];
              const total = options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
              return (
                <div className="mt-3">
                  <p className="text-base font-bold">{question}</p>
                  <div className="mt-3 space-y-2">
                    {options.map((o, i) => {
                      const pct = Math.round((o.votes / total) * 100);
                      const active = pollChoice === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setPollChoice(i)}
                          className={`relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${active ? "border-purple-400/60 bg-white/[0.06]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"}`}
                        >
                          <span
                            className="absolute inset-y-0 left-0 -z-0 rounded-2xl"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))" }}
                          />
                          <span className="relative flex items-center gap-3">
                            <span className={`grid h-4 w-4 place-items-center rounded-full border-2 ${active ? "border-purple-300" : "border-white/40"}`}>
                              {active && <span className="h-2 w-2 rounded-full bg-purple-300" />}
                            </span>
                            <span className="flex-1 font-semibold">{o.label}</span>
                            <span className="text-xs text-white/60">{pct}%</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/55">
                    <span>{fmt(total)} votes</span>
                    <Link
                      to="/feed"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}
                    >
                      Vote now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </GlassCard>

          {/* Confession */}
          <GlassCard className="p-5">
            <SectionHead icon={Flame} title="Confessions" />
            {(() => {
              const c = data?.confession ?? {
                id: "sample",
                text: "I finally hit a 30-day streak just because of this community. You all kept me going. 💜",
                alias: "Anonymous",
                avatar_emoji: "🎭",
                like_count: 184,
                reply_count: 22,
                category: "feelings",
              };
              return (
                <div className="mt-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl text-xl" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                      {c.avatar_emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold">{c.alias}</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">{c.category}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-snug text-white/85">{c.text}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-white/60">
                        <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-pink-300" /> {c.like_count}</span>
                        <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {c.reply_count}</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/confessions" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-purple-200">
                    View all confessions <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })()}
          </GlassCard>
        </div>
      </Section>

      {/* ───────── Games & Rewards ───────── */}
      <Section title="Play games. Earn rewards." eyebrow="Games" subtitle="Every game pays out coins, XP and badges. Daily limits reset at midnight.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cfg.games.map((g) => (
            <GlassCard key={g.name} className="overflow-hidden p-5 text-center transition-transform hover:-translate-y-0.5">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-lg" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>
                {g.emoji}
              </div>
              <div className="mt-3 text-base font-bold">{g.name}</div>
              <div className="mt-1 text-[11px] text-white/60">{g.reward}</div>
              <div className="mt-3 flex justify-center gap-1.5 text-[10px]">
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300">+coins</span>
                <span className="rounded-full bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-300">+XP</span>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 font-semibold text-blue-300">badges</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ───────── Daily Missions ───────── */}
      <Section title="Daily missions" eyebrow="Show up, stack rewards" subtitle="Small daily goals that compound into real progression.">
        <div className="grid gap-3 sm:grid-cols-2">
          {cfg.missions.map((m) => (
            <GlassCard key={m.title} className="flex items-center gap-4 p-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(59,130,246,0.3))" }}>
                {m.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-bold">{m.title}</div>
                  <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">{m.reward}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${m.progress}%`, background: "linear-gradient(90deg,#8b5cf6,#3b82f6)" }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-white/50">{m.progress}% complete</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ───────── Leaderboard ───────── */}
      <Section title="Top of the community" eyebrow="Leaderboard" subtitle="The members shaping the community this season.">
        <GlassCard className="overflow-hidden">
          <div className="divide-y divide-white/5">
            {(data?.leaderboard ?? []).map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black"
                  style={{
                    background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : i === 1 ? "linear-gradient(135deg,#e5e7eb,#9ca3af)" : i === 2 ? "linear-gradient(135deg,#fbbf24,#b45309)" : "rgba(255,255,255,0.06)",
                    color: i < 3 ? "#0a0a0a" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                </div>
                <Avatar author={{ username: u.username, avatar_url: u.avatar_url, avatar_color: u.avatar_color }} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">@{u.username}</div>
                  <div className="text-[11px] text-white/55">Level {u.level} · {fmt(u.xp)} XP</div>
                </div>
                <div className="hidden items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-300 sm:inline-flex">
                  <Flame className="h-3 w-3" /> {u.streak}d
                </div>
                <Star className="h-4 w-4 text-white/30" />
              </div>
            ))}
            {!data?.leaderboard?.length && [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-8 w-8 animate-pulse rounded-xl bg-white/5" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
                  <div className="mt-1.5 h-2 w-1/4 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 px-5 py-3 text-right">
            <Link to="/leaderboard" className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-purple-200">
              View full leaderboard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </GlassCard>
      </Section>

      {/* ───────── Invite Friends ───────── */}
      <Section eyebrow="Invite friends" title={cfg.referralHeadline} subtitle={cfg.referralDescription}>
        <GlassCard glow className="grid gap-6 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
              <Gift className="h-3.5 w-3.5 text-pink-300" /> Referral rewards
            </div>
            <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">Both of you earn from day one</h3>
            <p className="mt-2 text-sm text-white/65">
              Share your invite link, and the moment your friend joins you each get a coin + XP bonus. Stack it on top of daily missions.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/find-friends"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}
              >
                Invite friends <Send className="h-4 w-4" />
              </Link>
              <Link to="/achievements" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold">
                See rewards
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RewardChip icon={Coins} label="Coins per friend" value={`+${cfg.referralCoinReward}`} accent="amber" />
            <RewardChip icon={Zap}   label="XP per friend"    value={`+${cfg.referralXpReward}`}   accent="purple" />
            <RewardChip icon={Flame} label="Streak boost"     value="x2"  accent="orange" />
            <RewardChip icon={Trophy} label="Bonus badge"     value="Yes" accent="blue" />
          </div>
        </GlassCard>
      </Section>

      {/* ───────── Final CTA ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <GlassCard glow className="relative overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.25), transparent 60%)" }} />
          <div className="relative">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg,#fff,#c4b5fd,#93c5fd)" }}>
                {cfg.finalCtaTitle}
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">{cfg.finalCtaSubtitle}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 12px 32px -8px rgba(139,92,246,0.7)" }}
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold">
                Start Chatting
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-white/10 bg-[#06060f]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-lg font-black text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>P</span>
                <span className="text-base font-extrabold">{cfg.copyrightOwner}</span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-white/60">{cfg.brandTagline}</p>
              <div className="mt-4 flex items-center gap-2">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                  <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white" aria-label="social">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {cfg.footerColumns.map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold uppercase tracking-wider text-white/50">{col.title}</div>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label + l.href}>
                      <Link to={l.href} className="text-sm text-white/70 hover:text-white">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} {cfg.copyrightOwner}. All rights reserved.</span>
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems operational</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes landing-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="landing-marquee"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 max-w-2xl">
        {eyebrow && <div className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">{eyebrow}</div>}
        <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-white/65 sm:text-base">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SectionHead({ icon: Icon, title }: { icon: typeof MessageCircle; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/65">
      <Icon className="h-3.5 w-3.5 text-purple-300" /> {title}
    </div>
  );
}

function StatCell({ icon: Icon, label, value, pulse = false }: { icon: typeof Users; label: string; value: string; pulse?: boolean }) {
  return (
    <div className="bg-[#0a0a18] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/55">
        <Icon className="h-3.5 w-3.5 text-purple-300" />
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
        {value}
        {pulse && <span className="relative grid h-2 w-2 place-items-center">
          <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </span>}
      </div>
    </div>
  );
}

function RewardChip({ icon: Icon, label, value, accent }: { icon: typeof Coins; label: string; value: string; accent: "amber" | "purple" | "orange" | "blue" }) {
  const colors: Record<typeof accent, string> = {
    amber:  "from-amber-500/25 to-amber-500/5 text-amber-200",
    purple: "from-purple-500/25 to-purple-500/5 text-purple-200",
    orange: "from-orange-500/25 to-orange-500/5 text-orange-200",
    blue:   "from-blue-500/25 to-blue-500/5 text-blue-200",
  };
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br p-4 ${colors[accent]}`}>
      <Icon className="h-5 w-5" />
      <div className="mt-3 text-xs font-semibold text-white/75">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-white">{value}</div>
    </div>
  );
}
