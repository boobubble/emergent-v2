import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Menu, X, ArrowRight, Flame, Heart, MessageSquare, Coins,
  Users, Activity, MessageCircle, Newspaper, Gamepad2, Trophy,
  CheckCircle2, Circle, ChevronRight, Twitter, Instagram, Youtube, Send,
  Crown, Star, Rocket, Gift,
} from "lucide-react";
import { LANDING_DEFAULTS, type LandingConfig, type LandingChatroom, type LandingTopMember, type LandingDemoFeedPost, type LandingDemoPoll, type LandingDemoConfession } from "@/lib/landing-config";

interface LandingStats {
  members: number; online: number; activeRooms: number;
  messagesSent: number; feedPosts: number; gamesPlayed: number;
}
interface LandingPayload {
  config: LandingConfig;
  source: "live" | "demo";
  stats: LandingStats;
  chatrooms: LandingChatroom[];
  topMembers: LandingTopMember[];
  feedPost: LandingDemoFeedPost;
  poll: LandingDemoPoll;
  confession: LandingDemoConfession;
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
      ? [{
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: LANDING_DEFAULTS.copyrightOwner,
            url: `${HOST}/welcome`,
            description: LANDING_DEFAULTS.seoDescription,
          }),
        }]
      : [],
  }),
  component: LandingPage,
});

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`
  : n.toLocaleString();

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-[#10101f]/80 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function PillAvatar({ name, size = 32, color }: { name: string; size?: number; color?: string }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full font-bold text-white ring-2 ring-white/10 shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: color || `linear-gradient(135deg, hsl(${Math.abs(name.charCodeAt(0) * 13) % 360} 70% 55%), hsl(${Math.abs(name.charCodeAt(0) * 29) % 360} 70% 45%))`,
      }}
    >
      {letter}
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
  const stats: LandingStats = data?.stats ?? {
    members: cfg.demoStats.members, online: cfg.demoStats.online, activeRooms: cfg.demoStats.activeRooms,
    messagesSent: cfg.demoStats.messagesSent, feedPosts: cfg.demoStats.feedPosts, gamesPlayed: cfg.demoStats.gamesPlayed,
  };
  const chatrooms  = data?.chatrooms  ?? cfg.demoChatrooms;
  const topMembers = data?.topMembers ?? cfg.demoTopMembers;
  const feedPost   = data?.feedPost   ?? cfg.demoFeedPost;
  const poll       = data?.poll       ?? cfg.demoPoll;
  const confession = data?.confession ?? cfg.demoConfession;

  const navLinks = useMemo(() => [
    { label: "Home",        to: "/welcome"     },
    { label: "Feed",        to: "/feed"        },
    { label: "Chatrooms",   to: "/"            },
    { label: "Games",       to: "/games"       },
    { label: "Confessions", to: "/confessions" },
    { label: "Leaderboard", to: "/leaderboard" },
  ], []);

  const pollTotal = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070713] text-white antialiased">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 select-none" aria-hidden>
        <div className="absolute -left-32 top-[-10%] h-[520px] w-[520px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
        <div className="absolute right-[-15%] top-[20%] h-[600px] w-[600px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
        <div className="absolute left-1/3 bottom-[-10%] h-[500px] w-[500px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#ec4899,transparent 70%)" }} />
      </div>

      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#070713]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/welcome" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)" }}>
              💬
            </span>
            <span className="text-lg font-extrabold tracking-tight">{cfg.copyrightOwner}</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link key={l.to + l.label} to={l.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                activeProps={{ className: "rounded-full px-3.5 py-2 text-sm font-semibold text-white bg-white/10" }}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden grid h-9 w-9 sm:grid place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <Link to="/login" className="hidden rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.08] sm:inline-flex">
              Login
            </Link>
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.7)" }}>
              Sign Up
            </Link>
            <button onClick={() => setMenuOpen((v) => !v)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden" aria-label="Toggle menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#070713]/95 px-4 pb-4 pt-2 lg:hidden">
            <nav className="grid gap-1">
              {navLinks.map((l) => (
                <Link key={l.to + l.label} to={l.to} onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:pt-16">
          <div>
            <h1 className="text-[40px] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
              {cfg.heroTitle}
              <br />
              <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(120deg,#a78bfa 0%,#c084fc 40%,#60a5fa 100%)" }}>
                {cfg.heroTitleHighlight}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/65 sm:text-lg">{cfg.heroSubtitle}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {cfg.heroBadges.map((b) => (
                <span key={b} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={cfg.primaryCtaHref}
                    className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 12px 32px -8px rgba(139,92,246,0.65)" }}>
                <Rocket className="h-4 w-4" /> {cfg.primaryCtaLabel}
              </Link>
              <Link to={cfg.secondaryCtaHref}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/[0.08]">
                ✨ {cfg.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["Amit", "Pooja", "Rahul", "Neha"].map((n) => (
                  <PillAvatar key={n} name={n} size={32} />
                ))}
              </div>
              <span className="text-xs text-white/65 sm:text-sm">{cfg.heroSocialProof}</span>
            </div>
          </div>

          {/* Visual mockup */}
          <div className="relative hidden lg:block">
            <Card className="p-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg text-base" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>🇮🇳</span>
                <div>
                  <div className="text-xs font-bold">India Chat</div>
                  <div className="text-[10px] text-white/50">128 online · live</div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  { n: "Amit Sharma", t: "Hello everyone! 👋", ts: "10:30 AM" },
                  { n: "Pooja Singh", t: "Good morning all ☀️", ts: "10:31 AM" },
                  { n: "Rahul Verma", t: "Anyone up for a game?", ts: "10:32 AM" },
                  { n: "Neha Patel",  t: "Hey! How's it going?", ts: "10:33 AM" },
                  { n: "Vikram",      t: "Let's play Ludo! 🎲", ts: "10:34 AM" },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <PillAvatar name={m.n} size={28} />
                    <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.04] px-3 py-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-bold">{m.n}</span>
                        <span className="text-[9px] text-white/40">{m.ts}</span>
                      </div>
                      <div className="text-[12px] text-white/80">{m.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── Stats strip ───────── */}
      {cfg.showStats && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <Card className="grid grid-cols-2 gap-px overflow-hidden bg-white/[0.04] sm:grid-cols-3 lg:grid-cols-6">
            <StatCell icon={Users}        color="text-purple-300" label="Members"          value={fmt(stats.members)} />
            <StatCell icon={Activity}     color="text-emerald-300" label="Online Now"      value={fmt(stats.online)} pulse />
            <StatCell icon={MessageCircle} color="text-blue-300"  label="Active Chatrooms" value={fmt(stats.activeRooms)} />
            {cfg.showMessageCount && (
              <StatCell icon={MessageSquare} color="text-cyan-300" label="Messages Sent" value={fmt(stats.messagesSent)} />
            )}
            <StatCell icon={Newspaper} color="text-pink-300" label="Feed Posts" value={fmt(stats.feedPosts)} />
            {cfg.showGameCount && (
              <StatCell icon={Gamepad2} color="text-amber-300" label="Games Played" value={fmt(stats.gamesPlayed)} />
            )}
          </Card>
        </section>
      )}

      {/* ───────── Features ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cfg.featureCards.map((f) => (
            <Card key={f.title} className="p-5 text-center transition-transform hover:-translate-y-0.5">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                   style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))" }}>
                {f.emoji}
              </div>
              <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-[11px] leading-snug text-white/55">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────── 3-column live community ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">

          {/* ── Column 1: Trending Chatrooms + Top Members ── */}
          <div className="space-y-4">
            <Card className="p-5">
              <SectionTitle icon="🔥" title="Trending Chatrooms" href="/" />
              <div className="mt-3 space-y-2.5">
                {chatrooms.slice(0, 5).map((r) => (
                  <div key={r.name} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                    <div className="grid h-11 w-11 place-items-center rounded-lg text-xl" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>
                      {r.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">#{r.name.replace(/^#/, "")}</div>
                      <div className="text-[11px] text-white/50">{fmt(r.online)} Online</div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle icon="🏆" title="Top Members" suffix="(This Week)" />
              <div className="mt-3 space-y-2">
                {topMembers.slice(0, 3).map((u, i) => (
                  <div key={u.username} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                    <span className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-black"
                          style={{
                            background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
                                      : i === 1 ? "linear-gradient(135deg,#e5e7eb,#9ca3af)"
                                      :           "linear-gradient(135deg,#fbbf24,#b45309)",
                            color: "#0a0a0a",
                          }}>
                      {i + 1}
                    </span>
                    <PillAvatar name={u.username} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{u.username}</div>
                    </div>
                    <div className="text-xs font-bold text-purple-300">{fmt(u.xp)} XP</div>
                  </div>
                ))}
              </div>
              <Link to="/leaderboard"
                    className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/85 hover:bg-white/[0.06]">
                View Leaderboard
              </Link>
            </Card>
          </div>

          {/* ── Column 2: Feed + Poll + Confession ── */}
          <div className="space-y-4">
            <Card className="p-5">
              <SectionTitle icon="📝" title="Latest Feed" href="/feed" />

              {/* Feed post */}
              <article className="mt-3 rounded-xl bg-white/[0.03] p-3">
                <header className="flex items-center gap-2.5">
                  <PillAvatar name={feedPost.username} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{feedPost.username}</div>
                    <div className="text-[11px] text-white/50">{feedPost.ago}</div>
                  </div>
                  {feedPost.badge && (
                    <span className="rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 px-2.5 py-1 text-[10px] font-bold text-white">
                      {feedPost.badge}
                    </span>
                  )}
                </header>
                <p className="mt-2.5 text-[13px] leading-snug text-white/85">{feedPost.text}</p>
                <footer className="mt-3 flex items-center gap-4 text-[11px] text-white/60">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {feedPost.likes}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {feedPost.comments}</span>
                  <span className="inline-flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-amber-400" /> {feedPost.coins}</span>
                </footer>
              </article>

              {/* Poll */}
              <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-[11px] text-white/55">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/20 text-base">📊</span>
                  <div>
                    <div className="text-xs font-bold text-white">Community Poll</div>
                    <div className="text-[10px] text-white/45">{poll.ago}</div>
                  </div>
                </div>
                <p className="mt-2.5 text-[13px] font-semibold text-white/90">{poll.question}</p>
                <div className="mt-2.5 space-y-1.5">
                  {poll.options.map((o, i) => {
                    const pct = Math.round((o.votes / pollTotal) * 100);
                    const active = pollChoice === i;
                    return (
                      <button key={i} onClick={() => setPollChoice(i)}
                              className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-xs transition-colors ${active ? "border-purple-400/60" : "border-white/10 hover:bg-white/[0.04]"}`}>
                        <span className="absolute inset-y-0 left-0 -z-0 rounded-lg"
                              style={{ width: `${pct}%`, background: "linear-gradient(90deg,rgba(139,92,246,0.35),rgba(59,130,246,0.25))" }} />
                        <span className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-semibold">
                            {active ? <CheckCircle2 className="h-3.5 w-3.5 text-purple-300" /> : <Circle className="h-3.5 w-3.5 text-white/40" />}
                            {o.label}
                          </span>
                          <span className="font-bold text-white/85">{pct}%</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/50">
                  <span>{pollTotal} votes · {poll.daysLeft} days left</span>
                  <Link to="/feed" className="rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/15">Vote Now</Link>
                </div>
              </div>

              {/* Confession */}
              <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
                <header className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-lg" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                    {confession.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{confession.alias}</div>
                    <div className="text-[10px] text-white/50">{confession.ago}</div>
                  </div>
                </header>
                <p className="mt-2 text-[13px] leading-snug text-white/85">{confession.text}</p>
              </div>
            </Card>
          </div>

          {/* ── Column 3: Popular Games + Missions ── */}
          <div className="space-y-4">
            <Card className="p-5">
              <SectionTitle icon="🎮" title="Popular Games" href="/games" />
              <div className="mt-3 space-y-2">
                {cfg.games.map((g) => (
                  <div key={g.name} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-lg text-xl" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                      {g.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{g.name}</div>
                      <div className="text-[11px] text-white/55">{g.plays ?? g.reward}</div>
                    </div>
                    <Link to="/games"
                          className="shrink-0 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-[11px] font-bold text-purple-200 hover:bg-purple-500/25">
                      Play Now
                    </Link>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle icon="🎯" title="Today's Missions" href="/achievements" />
              <div className="mt-3 space-y-2.5">
                {cfg.missions.slice(0, 3).map((m) => (
                  <div key={m.title} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                    {m.complete
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      : <Circle className="h-5 w-5 text-white/30 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white/90">{m.title}</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full"
                             style={{ width: `${m.progress}%`, background: "linear-gradient(90deg,#8b5cf6,#3b82f6)" }} />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300">{m.progressLabel ?? `${m.progress}%`}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 p-3">
                <Gift className="h-6 w-6 text-amber-300 shrink-0" />
                <div className="flex-1 text-[11px] text-white/70">Rewards</div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-200">⚡ +100 XP</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">🪙 +50 Coins</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────── CTA double card ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="relative overflow-hidden p-6 sm:p-8"
                style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.35),rgba(236,72,153,0.25) 60%,rgba(59,130,246,0.2))" }}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#ec4899,transparent)" }} />
            <div className="relative max-w-md">
              <h3 className="text-2xl font-black sm:text-3xl">{cfg.finalCtaTitle}</h3>
              <p className="mt-2 text-sm text-white/80">{cfg.finalCtaSubtitle}</p>
              <Link to="/login"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#1a0b2e] shadow-lg hover:scale-[1.03] transition-transform">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6"
                style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.4),rgba(59,130,246,0.3))" }}>
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-40 blur-2xl" style={{ background: "radial-gradient(closest-side,#60a5fa,transparent)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 text-base font-extrabold">
                <Rocket className="h-5 w-5 text-pink-300" /> {cfg.referralHeadline}
              </div>
              <p className="mt-2 text-xs text-white/80">{cfg.referralDescription}</p>
              <Link to="/find-friends"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-purple-400">
                Invite Now
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-white/5 bg-[#06060f]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-base" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>💬</span>
                <span className="text-base font-extrabold">{cfg.copyrightOwner}</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-white/55">{cfg.brandTagline}</p>
            </div>
            {cfg.footerColumns.map((col) => (
              <div key={col.title}>
                <div className="text-sm font-bold text-white">{col.title}</div>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label + l.href}>
                      <Link to={l.href} className="text-sm text-white/55 hover:text-white">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <div className="text-sm font-bold text-white">Follow Us</div>
              <div className="mt-3 flex items-center gap-2">
                {[
                  { Icon: MessageCircle, label: "Discord", color: "bg-indigo-500/20 text-indigo-300" },
                  { Icon: Instagram,     label: "Instagram", color: "bg-pink-500/20 text-pink-300" },
                  { Icon: Twitter,       label: "Twitter",  color: "bg-sky-500/20 text-sky-300" },
                  { Icon: Youtube,       label: "YouTube",  color: "bg-red-500/20 text-red-300" },
                ].map(({ Icon, label, color }) => (
                  <a key={label} href="#" aria-label={label}
                     className={`grid h-9 w-9 place-items-center rounded-full ${color} hover:scale-105 transition-transform`}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} {cfg.copyrightOwner}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCell({ icon: Icon, label, value, color = "text-purple-300", pulse = false }: {
  icon: typeof Users; label: string; value: string; color?: string; pulse?: boolean;
}) {
  return (
    <div className="bg-[#10101f] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/55">{label}</div>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-[26px]">
        {value}
        {pulse && (
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, suffix, href }: { icon: string; title: string; suffix?: string; href?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <span className="text-sm font-bold text-white">{title}</span>
        {suffix && <span className="ml-1.5 text-[11px] text-white/50">{suffix}</span>}
      </div>
      {href && (
        <Link to={href} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-purple-300 hover:text-purple-200">
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// Silence unused imports kept for future cards
void Crown; void Star; void Flame; void Trophy; void Send;
