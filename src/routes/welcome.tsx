import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Menu, X, ArrowRight, Flame, Heart, MessageSquare, Coins,
  Users, Activity, MessageCircle, Newspaper, Gamepad2, Trophy,
  CheckCircle2, Circle, ChevronRight, Twitter, Instagram, Youtube, Send,
  Crown, Star, Rocket, Gift, Sun, Moon,
} from "lucide-react";
import {
  LANDING_DEFAULTS, type LandingConfig,
  type LandingChatroom, type LandingTopMember,
  type LandingDemoFeedPost, type LandingDemoPoll, type LandingDemoConfession,
  type LandingTrendingPost, type LandingDiscussion, type LandingFeaturedMember,
  type LandingConfessionItem, type LandingBlogPost, type LandingActivity,
} from "@/lib/landing-config";

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
  trendingPosts: LandingTrendingPost[];
  discussions: LandingDiscussion[];
  featuredMembers: LandingFeaturedMember[];
  recentConfessions: LandingConfessionItem[];
  blogPosts: LandingBlogPost[];
  activities: LandingActivity[];
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

function Card({ className = "", children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-[#10101f]/80 backdrop-blur-xl ${className}`} style={style}>
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("palrgo-welcome-theme") as "dark" | "light" | null;
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch { /* ignore */ }
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem("palrgo-welcome-theme", next); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/public/landing");
        if (!res.ok) return;
        const json = (await res.json()) as LandingPayload;
        if (!cancel) setData(json);
      } catch { /* silent */ }
    })();
    return () => { cancel = true; };
  }, []);

  // Keep meta tags in sync with admin-edited SEO config
  useEffect(() => {
    const cfg = data?.config;
    if (!cfg || typeof document === "undefined") return;
    if (cfg.seoTitle) document.title = cfg.seoTitle;
    const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
      if (!content) return;
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", cfg.seoDescription);
    setMeta('meta[name="keywords"]', "name", "keywords", cfg.seoKeywords);
    setMeta('meta[property="og:title"]', "property", "og:title", cfg.seoTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", cfg.seoDescription);
  }, [data?.config]);


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
  const trendingPosts     = data?.trendingPosts     ?? cfg.trendingPosts;
  const discussions       = data?.discussions       ?? cfg.discussions;
  const featuredMembers   = data?.featuredMembers   ?? cfg.featuredMembers;
  const recentConfessions = data?.recentConfessions ?? cfg.recentConfessions;
  const blogPosts         = data?.blogPosts         ?? cfg.blogPosts;
  const activities        = data?.activities        ?? cfg.activities;

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
    <div className={`welcome-root ${theme === "light" ? "welcome-light" : "welcome-dark"} relative min-h-screen overflow-x-hidden bg-[#070713] text-white antialiased`}>
      <style>{`
        .welcome-light { background: #f5f6fb !important; color: #0b0b1a !important; }
        .welcome-light .bg-\\[\\#070713\\],
        .welcome-light .bg-\\[\\#070713\\]\\/80,
        .welcome-light .bg-\\[\\#070713\\]\\/95,
        .welcome-light .bg-\\[\\#06060f\\] { background-color: rgba(245,246,251,0.95) !important; }
        .welcome-light .bg-\\[\\#10101f\\],
        .welcome-light .bg-\\[\\#10101f\\]\\/80 { background-color: rgba(255,255,255,0.92) !important; }
        .welcome-light .text-white { color: #0b0b1a !important; }
        .welcome-light .text-white\\/90 { color: rgba(11,11,26,0.9) !important; }
        .welcome-light .text-white\\/85 { color: rgba(11,11,26,0.86) !important; }
        .welcome-light .text-white\\/80 { color: rgba(11,11,26,0.82) !important; }
        .welcome-light .text-white\\/70 { color: rgba(11,11,26,0.74) !important; }
        .welcome-light .text-white\\/65 { color: rgba(11,11,26,0.7) !important; }
        .welcome-light .text-white\\/60 { color: rgba(11,11,26,0.66) !important; }
        .welcome-light .text-white\\/55 { color: rgba(11,11,26,0.62) !important; }
        .welcome-light .text-white\\/50 { color: rgba(11,11,26,0.6) !important; }
        .welcome-light .text-white\\/45 { color: rgba(11,11,26,0.58) !important; }
        .welcome-light .text-white\\/40 { color: rgba(11,11,26,0.55) !important; }
        .welcome-light .text-white\\/30 { color: rgba(11,11,26,0.5) !important; }
        .welcome-light .border-white\\/5 { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .border-white\\/10 { border-color: rgba(11,11,26,0.12) !important; }
        .welcome-light .border-white\\/15 { border-color: rgba(11,11,26,0.16) !important; }
        .welcome-light .border-white\\/\\[0\\.07\\] { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .bg-white\\/5,
        .welcome-light .bg-white\\/10,
        .welcome-light .bg-white\\/15,
        .welcome-light .bg-white\\/\\[0\\.03\\],
        .welcome-light .bg-white\\/\\[0\\.04\\],
        .welcome-light .bg-white\\/\\[0\\.06\\],
        .welcome-light .bg-white\\/\\[0\\.08\\] { background-color: rgba(11,11,26,0.05) !important; }
        .welcome-light .hover\\:bg-white\\/5:hover,
        .welcome-light .hover\\:bg-white\\/10:hover,
        .welcome-light .hover\\:bg-white\\/\\[0\\.08\\]:hover { background-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .hover\\:text-white:hover { color: #0b0b1a !important; }
        .welcome-light .text-purple-300 { color: #6d28d9 !important; }
        .welcome-light .text-purple-200 { color: #5b21b6 !important; }
        .welcome-light .hover\\:text-purple-200:hover { color: #4c1d95 !important; }
        .welcome-light .stat-value {
          background-image: none !important;
          -webkit-text-fill-color: #0b0b1a !important;
          color: #0b0b1a !important;
        }
        .welcome-light .stat-tile {
          background: linear-gradient(135deg, color-mix(in oklab, var(--stat-tint) 30%, #ffffff), color-mix(in oklab, var(--stat-tint) 14%, #ffffff)) !important;
          box-shadow: 0 8px 20px -10px color-mix(in oklab, var(--stat-tint) 65%, transparent), inset 0 1px 0 rgba(255,255,255,0.6) !important;
          --tw-ring-color: color-mix(in oklab, var(--stat-tint) 35%, transparent) !important;
        }
        .welcome-light .stat-icon { color: color-mix(in oklab, var(--stat-tint) 75%, #0b0b1a) !important; }
        .welcome-light .stat-cell::after { background-color: rgba(11,11,26,0.14) !important; }
        .welcome-light .stat-cell:hover { background-color: rgba(11,11,26,0.04) !important; }
        .welcome-light .hero-dark-preview .text-white { color: #ffffff !important; }
        .welcome-light .hero-dark-preview .text-white\/90 { color: rgba(255,255,255,0.9) !important; }
        .welcome-light .hero-dark-preview .text-white\/85 { color: rgba(255,255,255,0.86) !important; }
        .welcome-light .hero-dark-preview .text-white\/80 { color: rgba(255,255,255,0.82) !important; }
        .welcome-light .hero-dark-preview .text-white\/70 { color: rgba(255,255,255,0.72) !important; }
        .welcome-light .hero-dark-preview .text-white\/60 { color: rgba(255,255,255,0.62) !important; }
        .welcome-light .hero-dark-preview .text-white\/55 { color: rgba(255,255,255,0.56) !important; }
        .welcome-light .hero-dark-preview .text-white\/50 { color: rgba(255,255,255,0.52) !important; }
        .welcome-light .hero-dark-preview .text-white\/45 { color: rgba(255,255,255,0.46) !important; }
        .welcome-light .hero-dark-preview .text-white\/40 { color: rgba(255,255,255,0.42) !important; }
        .welcome-light .hero-dark-preview .text-white\/35 { color: rgba(255,255,255,0.38) !important; }
        .welcome-light .hero-dark-preview .border-white\/10 { border-color: rgba(255,255,255,0.1) !important; }
        .welcome-light .hero-dark-preview .border-white\/15 { border-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white\/15 { background-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white\/\[0\.04\] { background-color: rgba(255,255,255,0.04) !important; }
        @keyframes welcome-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: welcome-float 4s ease-in-out infinite; }
      `}</style>

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
            <BrandMark
              slot="logo"
              forceTheme="dark"
              alt={cfg.copyrightOwner}
              fallback={
                <>
                  <span className="grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white shadow-lg"
                        style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)" }}>
                    💬
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">{cfg.copyrightOwner}</span>
                </>
              }
            />
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
            <LanguageSwitcher variant="compact" />
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
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

          {/* Visual mockup composition */}
          <div className="relative hidden lg:block min-h-[560px]">
            {/* Glow halos */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
                   style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full opacity-50 blur-3xl"
                   style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
            </div>

            {/* Desktop chatroom window */}
            <div className="hero-dark-preview absolute right-0 top-4 w-[480px] rotate-[-2deg] rounded-2xl border border-white/15 bg-[#0e0e22]/90 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.55)] backdrop-blur-xl">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-black text-white"
                      style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>💬</span>
                <span className="text-[11px] font-bold text-white/85">ChitChat</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <X className="h-3 w-3 text-white/40" />
                </span>
              </div>
              {/* Chat content: room + messages + users */}
              <div className="grid grid-cols-[1fr_120px] gap-0">
                <div className="border-r border-white/10 p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg text-sm" style={{ background: "linear-gradient(135deg,#f59e0b,#dc2626)" }}>🇮🇳</span>
                    <div>
                      <div className="text-[11px] font-bold text-white">India Chat</div>
                      <div className="text-[9px] text-white/50">128 online</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { n: "Amit Sharma", t: "Hello everyone! 👋", ts: "10:30" },
                      { n: "Pooja Singh", t: "Good morning all ☀️", ts: "10:31" },
                      { n: "Rahul Verma", t: "Anyone up for a game?", ts: "10:32" },
                      { n: "Neha Patel",  t: "Hey! How's it going?", ts: "10:33" },
                      { n: "Vikram",      t: "Let's play Ludo! 🎲", ts: "10:34" },
                    ].map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <PillAvatar name={m.n} size={22} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-bold text-white/90">{m.n}</span>
                            <span className="text-[8px] text-white/35">{m.ts} AM</span>
                          </div>
                          <div className="text-[10px] leading-snug text-white/70">{m.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] text-white/40">
                    Type a message...
                    <span className="ml-auto">😊</span><span>📎</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-white/50">Online · 128</div>
                  <div className="space-y-1.5">
                    {["Amit Sharma","Pooja Singh","Rahul Verma","Neha Patel","Vikram","Aditya","Kavya"].map((n) => (
                      <div key={n} className="flex items-center gap-1.5">
                        <PillAvatar name={n} size={16} />
                        <span className="truncate text-[9px] text-white/70">{n.split(" ")[0]}</span>
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg bg-white/[0.04] p-2">
                    <div className="text-[8px] font-bold text-white/60">Room Info</div>
                    <div className="mt-1 text-[9px] font-bold text-white">India Chat</div>
                    <div className="text-[8px] text-white/45">Public Room</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile mockup overlap */}
            <div className="absolute left-[-10px] bottom-0 w-[200px] rotate-[-6deg] rounded-[28px] border border-white/15 bg-[#0a0a1a] p-1.5 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.6)]">
              <div className="relative overflow-hidden rounded-[22px] bg-[#10101f]">
                {/* notch */}
                <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-black" />
                <div className="px-2.5 pb-2 pt-5">
                  <div className="flex items-center justify-between text-[8px] text-white/60">
                    <span>9:41</span>
                    <span>📶 📡 🔋</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <PillAvatar name="Tara" size={20} />
                    <div className="text-[9px] font-bold text-white">Tara Sparks</div>
                  </div>
                  <div className="mt-1.5 rounded-lg bg-white/[0.05] p-1.5 text-[8px] text-white/70">Going strong! 🚀</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <PillAvatar name="Pooja" size={20} />
                    <div className="text-[9px] font-bold text-white">Pooja Singh</div>
                  </div>
                  <div className="mt-1.5 rounded-lg bg-white/[0.05] p-1.5 text-[8px] text-white/70">Good morning all ☀️</div>
                  {/* sticker grid */}
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {["🐼","🦊","🐻","🐰","🦁","🐯","🐨","🐶"].map((e, i) => (
                      <div key={i} className="grid aspect-square place-items-center rounded-md bg-white/[0.06] text-[14px]">{e}</div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-around border-t border-white/5 pt-1.5 text-[10px]">
                    <span>🏠</span><span>🔍</span><span>💬</span><span>🎮</span><span>👤</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating sunglasses emoji */}
            <div className="absolute -right-2 top-1 grid h-14 w-14 animate-bounce-slow place-items-center rounded-full text-3xl shadow-[0_10px_30px_-5px_rgba(168,85,247,0.7)]"
                 style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
              😎
            </div>
            {/* Floating chat bubble */}
            <div className="absolute right-8 top-[260px] grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-[0_10px_30px_-5px_rgba(59,130,246,0.7)]"
                 style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
              💬
            </div>
            {/* Floating online users chip */}
            <div className="hero-dark-preview absolute right-4 bottom-8 rounded-2xl border border-white/15 bg-[#0e0e22]/90 px-3 py-2 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[10px] font-bold text-white">Connected</span>
                <span className="text-[10px] text-white/55">128 Online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Stats strip ───────── */}
      {cfg.showStats && (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 p-2 sm:p-3 backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(139,92,246,0.45)]"
            style={{
              background:
                "linear-gradient(135deg,rgba(139,92,246,0.10),rgba(59,130,246,0.06) 50%,rgba(236,72,153,0.08))",
            }}
          >
            <div className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
                 style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
            <div className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
                 style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <StatCell icon={Users}         tint="#a78bfa" label="Members"          value={fmt(stats.members)} />
              <StatCell icon={Activity}      tint="#34d399" label="Online Now"       value={fmt(stats.online)} pulse />
              <StatCell icon={MessageCircle} tint="#60a5fa" label="Active Chatrooms" value={fmt(stats.activeRooms)} />
              {cfg.showMessageCount && (
                <StatCell icon={MessageSquare} tint="#22d3ee" label="Messages Sent" value={fmt(stats.messagesSent)} />
              )}
              <StatCell icon={Newspaper} tint="#f472b6" label="Feed Posts" value={fmt(stats.feedPosts)} />
              {cfg.showGameCount && (
                <StatCell icon={Gamepad2} tint="#fbbf24" label="Games Played" value={fmt(stats.gamesPlayed)} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Features ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cfg.featureCards.map((f, i) => {
            const palettes = [
              "linear-gradient(135deg,#8b5cf6,#6d28d9)", // purple
              "linear-gradient(135deg,#3b82f6,#1d4ed8)", // blue
              "linear-gradient(135deg,#f97316,#ea580c)", // orange
              "linear-gradient(135deg,#10b981,#059669)", // green
              "linear-gradient(135deg,#ef4444,#b91c1c)", // red
              "linear-gradient(135deg,#a855f7,#7c3aed)", // violet
            ];
            return (
              <Card key={`${f.title}-${i}`} className="overflow-hidden p-0 text-center transition-transform hover:-translate-y-0.5">
                {f.href ? (
                  <a href={f.href} className="block p-5" target={f.href.startsWith("http") ? "_blank" : undefined} rel={f.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg"
                         style={{ background: palettes[i % palettes.length], boxShadow: `0 10px 24px -10px ${["#8b5cf6","#3b82f6","#f97316","#10b981","#ef4444","#a855f7"][i % 6]}99` }}>
                      {f.emoji}
                    </div>
                    <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                    <p className="mt-1 text-[11px] leading-snug text-white/55">{f.description}</p>
                  </a>
                ) : (
                  <div className="p-5">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg"
                         style={{ background: palettes[i % palettes.length], boxShadow: `0 10px 24px -10px ${["#8b5cf6","#3b82f6","#f97316","#10b981","#ef4444","#a855f7"][i % 6]}99` }}>
                      {f.emoji}
                    </div>
                    <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                    <p className="mt-1 text-[11px] leading-snug text-white/55">{f.description}</p>
                  </div>
                )}
              </Card>
            );
          })}
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
                {chatrooms.slice(0, 5).map((r, i) => {
                  const thumbs = [
                    "linear-gradient(135deg,#f59e0b,#dc2626)",
                    "linear-gradient(135deg,#3b82f6,#1e3a8a)",
                    "linear-gradient(135deg,#10b981,#065f46)",
                    "linear-gradient(135deg,#f97316,#7c2d12)",
                    "linear-gradient(135deg,#ec4899,#831843)",
                  ];
                  return (
                    <div key={r.name} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                      <div className="relative grid h-11 w-14 place-items-center overflow-hidden rounded-lg text-xl ring-1 ring-white/10"
                           style={{ background: thumbs[i % thumbs.length] }}>
                        <span className="drop-shadow">{r.emoji}</span>
                        <span className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">#{r.name.replace(/^#/, "")}</div>
                        <div className="text-[11px] text-white/50">{fmt(r.online)} Online</div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    </div>
                  );
                })}
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

      {/* ───────── Trending Posts ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="🔥" title="Trending Posts" suffix="(Hot right now)" href="/feed" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trendingPosts.map((p, i) => (
              <article key={i} className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-purple-400/30">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: "radial-gradient(closest-side,#a855f7,transparent)" }} />
                <header className="relative flex items-center gap-2.5">
                  <PillAvatar name={p.user} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{p.user}</div>
                    <div className="text-[11px] text-white/50">{p.ago}</div>
                  </div>
                  <Flame className="h-4 w-4 text-orange-400" />
                </header>
                <p className="relative mt-2.5 line-clamp-3 text-[13px] leading-snug text-white/85">{p.text}</p>
                <footer className="relative mt-3 flex items-center justify-between text-[11px] text-white/60">
                  <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-200">{p.tag}</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {p.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </Card>
      </section>

      {/* ───────── Latest Public Discussions ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="💬" title="Latest Public Discussions" href="/" />
          <div className="mt-4 divide-y divide-white/[0.05]">
            {discussions.map((d, i) => (
              <Link key={i} to="/discussions" className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02] sm:gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-base ring-1 ring-white/10">
                  💬
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white/90">{d.topic}</p>
                    {d.hot && <span className="hidden shrink-0 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300 sm:inline-flex">HOT</span>}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-white/55">
                    in <span className="text-purple-300">{d.room}</span> · by {d.author} · last reply {d.last}
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-1 text-[11px] text-white/60 sm:flex">
                  <MessageCircle className="h-3.5 w-3.5" /> {d.replies}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* ───────── Featured Members ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="⭐" title="Featured Members" suffix="(Stars of the week)" href="/leaderboard" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredMembers.map((m) => (
              <div key={m.name} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${m.gradient} p-4 ring-1 ring-white/10`}>
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative">
                    <PillAvatar name={m.name} size={64} />
                    <Crown className="absolute -top-1 -right-1 h-5 w-5 text-amber-300 drop-shadow" />
                  </div>
                  <div className="mt-2.5 text-sm font-bold">{m.name}</div>
                  <div className="text-[11px] text-white/70">{m.role}</div>
                  <div className="mt-2 flex items-center gap-1 text-base">
                    {m.badges.split(/\s+/).filter(Boolean).map((b, i) => <span key={i}>{b}</span>)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                    <Star className="h-3 w-3" /> {m.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ───────── Recent Confessions ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="🤫" title="Recent Confessions" suffix="(Anonymous)" href="/confessions" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentConfessions.map((c, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-pink-500/[0.08] via-purple-500/[0.05] to-transparent p-4">
                <div className="absolute right-3 top-3 text-[10px] font-bold uppercase tracking-wider text-pink-300/70">Anon</div>
                <header className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-full text-xl ring-1 ring-white/15" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                    {c.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{c.alias}</div>
                    <div className="text-[11px] text-white/50">{c.ago}</div>
                  </div>
                </header>
                <p className="mt-3 text-[13px] leading-snug text-white/85">"{c.text}"</p>
                <footer className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11px] text-white/60">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {c.reacts} reactions</span>
                  <Link to="/confessions" className="font-bold text-pink-300 hover:text-pink-200">Read →</Link>
                </footer>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ───────── Latest Community Activity ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="⚡" title="Latest Community Activity" suffix="(Live feed)" href="/feed" />
          <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {[
              { who: "Amit",   action: "joined",        target: "India Chat",          ago: "just now",  emoji: "💬", tint: "from-blue-500/30 to-cyan-500/20",     accent: "text-cyan-200",    href: "/" },
              { who: "Pooja",  action: "earned",        target: "Gold Badge",          ago: "2m ago",    emoji: "🏆", tint: "from-amber-500/35 to-yellow-500/20",  accent: "text-amber-200",   href: "/achievements" },
              { who: "Rahul",  action: "posted",        target: "a new discussion",    ago: "5m ago",    emoji: "📝", tint: "from-purple-500/30 to-pink-500/20",   accent: "text-pink-200",    href: "/feed" },
              { who: "Sneha",  action: "started a DM with", target: "Aanya",           ago: "8m ago",    emoji: "💌", tint: "from-rose-500/30 to-fuchsia-500/20",  accent: "text-rose-200",    href: "/feed" },
              { who: "Kabir",  action: "won",           target: "a Ludo match",        ago: "12m ago",   emoji: "🎲", tint: "from-emerald-500/30 to-teal-500/20",  accent: "text-emerald-200", href: "/games" },
              { who: "Meera",  action: "hit a",         target: "7-day streak 🔥",     ago: "18m ago",   emoji: "🔥", tint: "from-orange-500/35 to-red-500/20",    accent: "text-orange-200",  href: "/achievements" },
              { who: "Yash",   action: "created room",  target: "Late Night Vibes",    ago: "25m ago",   emoji: "🌙", tint: "from-indigo-500/30 to-violet-500/20", accent: "text-indigo-200",  href: "/" },
              { who: "Riya",   action: "leveled up to", target: "Level 12",            ago: "32m ago",   emoji: "⭐", tint: "from-yellow-500/30 to-amber-500/20",  accent: "text-yellow-200",  href: "/leaderboard" },
            ].map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/[0.04] sm:px-4">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.tint} text-base ring-1 ring-white/10`}>
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1 text-sm leading-snug text-white/85">
                  <span className="font-bold text-white">{a.who}</span>{" "}
                  <span className="text-white/65">{a.action}</span>{" "}
                  <Link to={a.href} className={`font-semibold ${a.accent} hover:underline`}>{a.target}</Link>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-white/45">{a.ago}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ───────── Community Blog ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5 sm:p-6">
          <SectionTitle icon="📰" title="Community Blog" suffix="(Stories & guides)" href="/blog" />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {blogPosts.map((b, i) => (
              <article key={i} className="group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] transition-all hover:-translate-y-0.5 hover:border-white/15">
                <div className={`relative h-32 bg-gradient-to-br ${b.gradient}`}>
                  <div className="absolute inset-0 grid place-items-center text-5xl opacity-90">{b.emoji}</div>
                  <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {b.tag}
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur">
                    {b.read}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-black leading-snug text-white group-hover:text-purple-200">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-white/65">{b.excerpt}</p>
                  <footer className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-white/55">
                    <span>By <span className="text-white/80">{b.author}</span> · {b.date}</span>
                    <Link to="/pages" className="inline-flex items-center gap-1 font-bold text-purple-300 hover:text-purple-200">
                      Read <ArrowRight className="h-3 w-3" />
                    </Link>
                  </footer>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link to="/pages" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white/85 hover:bg-white/[0.07]">
              Visit Blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>


      {/* ───────── CTA double card ───────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="relative overflow-hidden p-6 sm:p-8"
                style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.35),rgba(236,72,153,0.25) 60%,rgba(59,130,246,0.2))" }}>
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#ec4899,transparent)" }} />
            <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto]">
              <div className="max-w-md">
                <h3 className="text-2xl font-black sm:text-3xl">{cfg.finalCtaTitle}</h3>
                <p className="mt-2 text-sm text-white/80">{cfg.finalCtaSubtitle}</p>
                <Link to="/login"
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#1a0b2e] shadow-lg hover:scale-[1.03] transition-transform">
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {cfg.finalCtaImageUrl && (
                <img
                  src={cfg.finalCtaImageUrl}
                  alt={cfg.finalCtaImageAlt || "Join the community"}
                  loading="lazy"
                  className="hidden h-40 w-40 rounded-2xl object-cover ring-1 ring-white/10 shadow-xl sm:block sm:h-44 sm:w-44"
                />
              )}
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

function StatCell({ icon: Icon, label, value, tint = "#a78bfa", pulse = false }: {
  icon: typeof Users; label: string; value: string; tint?: string; pulse?: boolean;
}) {
  return (
    <div
      className="stat-cell group relative flex min-w-0 items-center gap-2 p-2.5 transition-colors hover:bg-white/[0.04] sm:gap-3 sm:rounded-2xl sm:p-4 lg:p-5
                 [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:right-0 [&:not(:last-child)]:after:top-1/2
                 [&:not(:last-child)]:after:hidden [&:not(:last-child)]:after:h-8 [&:not(:last-child)]:after:w-px
                 [&:not(:last-child)]:after:-translate-y-1/2 [&:not(:last-child)]:after:bg-white/10 sm:[&:not(:last-child)]:after:h-10 lg:[&:not(:last-child)]:after:block
                 [&:not(:nth-child(2n))]:after:block sm:[&:not(:nth-child(2n))]:after:hidden
                 sm:[&:not(:nth-child(3n))]:after:block"
      style={{ ['--stat-tint' as string]: tint }}
    >
      <div
        className="stat-tile grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-white/10 backdrop-blur-md sm:h-11 sm:w-11 sm:rounded-xl"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 28%, transparent), color-mix(in oklab, ${tint} 10%, transparent))`,
          boxShadow: `0 8px 24px -10px ${tint}90, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <Icon className="stat-icon h-4 w-4 sm:h-5 sm:w-5" style={{ color: tint }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-lg font-black leading-none tracking-tight sm:text-2xl lg:text-[26px]">
          <span
            className="stat-value truncate bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg,#ffffff, color-mix(in oklab, ${tint} 60%, #ffffff))` }}
          >
            {value}
          </span>
          {pulse && (
            <span className="relative grid h-2 w-2 shrink-0 place-items-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wider text-white/60 sm:mt-1 sm:text-[11px]">
          {label}
        </div>
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
