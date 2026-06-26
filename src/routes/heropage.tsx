import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight, MessageCircle, Newspaper, Radio, Gamepad2, Users,
  Flame, Sparkles, Trophy, Heart, Sun, Moon, LogIn, UserPlus, Eye, Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { AuthDialogs, type AuthPopup } from "@/components/auth/AuthScreen";
import { createDemoAccount } from "@/lib/demo-account.functions";
import {
  HERO_DEFAULTS, HERO_SETTINGS_KEY, mergeHeroConfig,
  type HeroConfig, type HeroSection, type HeroShowcaseItem,
  type FamousChatroom, type LiveUserCard, type DailyMissionCard,
} from "@/lib/hero-page-config";

export const Route = createFileRoute("/heropage")({
  head: () => ({
    meta: [
      { title: `${HERO_DEFAULTS.brandName} — ${HERO_DEFAULTS.headline}` },
      { name: "description", content: HERO_DEFAULTS.subheadline },
      { property: "og:title", content: HERO_DEFAULTS.headline },
      { property: "og:description", content: HERO_DEFAULTS.subheadline },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HeroHomepage,
});

interface LiveStats {
  members: number; online: number; rooms: number; djs: number; postsToday: number;
}

function useHeroConfig(): HeroConfig {
  const [cfg, setCfg] = useState<HeroConfig>(HERO_DEFAULTS);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("app_settings").select("value").eq("key", HERO_SETTINGS_KEY).maybeSingle();
      if (!cancelled) setCfg(mergeHeroConfig(data?.value as Partial<HeroConfig> | undefined));
    })();
    return () => { cancelled = true; };
  }, []);
  return cfg;
}

function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({ members: 0, online: 0, rooms: 0, djs: 0, postsToday: 0 });
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const onlineSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const [m, on, p] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_seen_at", onlineSince),
          supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", since),
        ]);
        if (cancelled) return;
        setStats({
          members: m.count ?? 0,
          online: on.count ?? 0,
          rooms: 12,
          djs: 3,
          postsToday: p.count ?? 0,
        });
      } catch {/* ignore */}
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);
  return stats;
}

function AnimatedCounter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = n; const to = value; const dur = 800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span>{n.toLocaleString()}</span>;
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}

function ShowcaseGrid({ items }: { items: HeroShowcaseItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <Glass key={i} className="p-4 transition-transform hover:-translate-y-1 hover:border-white/20">
          <div className="text-3xl">{it.emoji}</div>
          <div className="mt-2 text-sm font-semibold text-white">{it.title}</div>
          <div className="mt-1 text-xs text-white/60 leading-relaxed">{it.description}</div>
        </Glass>
      ))}
    </div>
  );
}

function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur-xl hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function HeroHomepage() {
  const cfg = useHeroConfig();
  const stats = useLiveStats();
  const { user } = useAuth();
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("heropage-theme");
    return stored ? stored === "dark" : true;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("heropage-theme", dark ? "dark" : "light");
    }
  }, [dark]);
  const [popup, setPopup] = useState<AuthPopup>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleDemo = async () => {
    try {
      setDemoLoading(true);
      const result = await createDemoAccount({});
      if (result?.email && result?.password) {
        await supabase.auth.signInWithPassword({ email: result.email, password: result.password });
        window.location.href = "/";
      }
    } catch {/* ignore */} finally { setDemoLoading(false); }
  };

  const bg = dark
    ? "bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0b1a_45%,_#000_100%)] text-white"
    : "bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#f5f3ff_45%,_#fff_100%)] text-slate-900";

  const statCards = [
    { emoji: "👥", label: "Total Members", value: stats.members },
    { emoji: "🟢", label: "Online Now", value: stats.online },
    { emoji: "💬", label: "Active Chatrooms", value: stats.rooms },
    { emoji: "🎙️", label: "Live DJs", value: stats.djs },
    { emoji: "📝", label: "Posts Today", value: stats.postsToday },
  ];

  const renderSection = (s: HeroSection) => {
    if (!s.enabled) return null;
    switch (s.key) {
      case "hero":
        return (
          <section key="hero" className="relative z-10 mx-auto max-w-7xl px-5 pt-8 pb-16 sm:pt-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" /> Live community • Free to join
                </div>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{cfg.headline}</h1>
                <p className="mt-5 max-w-xl text-base opacity-80 sm:text-lg">{cfg.subheadline}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={() => setPopup("signup")}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105">
                    <UserPlus className="h-4 w-4" /> {cfg.ctaJoinLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button onClick={() => setPopup("signin")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-xl hover:bg-white/10">
                    <LogIn className="h-4 w-4" /> {cfg.ctaLoginLabel}
                  </button>
                  <button onClick={handleDemo} disabled={demoLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">
                    <Eye className="h-4 w-4" /> {demoLoading ? "Loading…" : cfg.ctaGuestLabel}
                  </button>
                </div>
              </div>
              <Glass className="overflow-hidden">
                <img src={cfg.heroImageUrl} alt="Friends chatting together" loading="lazy" className="h-full w-full object-cover" />
              </Glass>
            </div>
          </section>
        );
      case "stats":
        return (
          <section key="stats" className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
            <Glass className="p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold opacity-90">
                <Flame className="h-4 w-4 text-orange-400" /> Live community stats
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {statCards.map((sc) => (
                  <div key={sc.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                    <div className="text-2xl">{sc.emoji}</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight"><AnimatedCounter value={sc.value} /></div>
                    <div className="text-[11px] uppercase tracking-wide opacity-60">{sc.label}</div>
                  </div>
                ))}
              </div>
            </Glass>
          </section>
        );
      case "chatrooms":
        return (
          <Showcase key="chatrooms" icon={<MessageCircle className="h-5 w-5" />} tag="Chatrooms 💬"
            title="Realtime chat that actually feels alive" image={cfg.chatroomImageUrl} items={cfg.chatroomFeatures} />
        );
      case "feed":
        return (
          <Showcase key="feed" icon={<Newspaper className="h-5 w-5" />} tag="Social Feed 📰"
            title="A feed built for community, not algorithms" image={cfg.feedImageUrl} items={cfg.feedFeatures} reverse />
        );
      case "radio":
        return (
          <Showcase key="radio" icon={<Radio className="h-5 w-5" />} tag="Live Radio 🎙️"
            title="Tune into your favorite community DJs" image={cfg.radioImageUrl} items={cfg.radioFeatures} />
        );
      case "games":
        return (
          <section key="games" className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold opacity-80">
              <Gamepad2 className="h-4 w-4" /> Games 🎮
            </div>
            <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Play, earn & climb the leaderboards</h2>
            <ShowcaseGrid items={cfg.gameFeatures} />
          </section>
        );
      case "famous_chatrooms":
        return <FamousChatroomsSection key="famous_chatrooms" rooms={cfg.famousChatrooms} />;
      case "live_users":
        return <LiveUsersSection key="live_users" users={cfg.liveUsers} />;
      case "daily_missions":
        return <DailyMissionsSection key="daily_missions" missions={cfg.dailyMissions} />;
      case "social_proof":
        return (
          <section key="social_proof" className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Trophy className="h-4 w-4 text-amber-300" />, label: "Top Members", emoji: "👑" },
                { icon: <Radio className="h-4 w-4 text-pink-300" />, label: "Top DJs", emoji: "🎧" },
                { icon: <Flame className="h-4 w-4 text-orange-400" />, label: "Trending Posts", emoji: "🔥" },
                { icon: <Users className="h-4 w-4 text-cyan-300" />, label: "Popular Rooms", emoji: "💬" },
              ].map((sp) => (
                <Glass key={sp.label} className="p-5">
                  <div className="flex items-center gap-2 text-xs opacity-70">{sp.icon} {sp.label}</div>
                  <div className="mt-3 text-4xl">{sp.emoji}</div>
                  <div className="mt-2 text-sm opacity-70">Discover the community's most loved {sp.label.toLowerCase()}.</div>
                </Glass>
              ))}
            </div>
          </section>
        );
      case "final_cta":
        return (
          <section key="final_cta" className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
            <Glass className="p-8 text-center sm:p-12">
              <Heart className="mx-auto h-8 w-8 text-pink-400" />
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{cfg.finalCtaTitle}</h2>
              <p className="mt-3 opacity-80">{cfg.finalCtaSubtitle}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => setPopup("signup")}
                  className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">Sign Up</button>
                <button onClick={() => setPopup("signin")}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-xl hover:bg-white/10">Login</button>
                <button onClick={handleDemo} disabled={demoLoading}
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">
                  {demoLoading ? "Loading…" : "Explore"}
                </button>
              </div>
            </Glass>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div data-hero-theme={dark ? "dark" : "light"} className={`min-h-screen ${bg} relative overflow-x-hidden`}>

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg shadow-lg">✨</div>
          <span className="text-lg font-bold tracking-tight">{cfg.brandName}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} setDark={setDark} />
          <button onClick={() => setPopup("signin")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-xl hover:bg-white/10">
            Login
          </button>
        </div>
      </header>

      {cfg.sections.map(renderSection)}

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs opacity-60">
        <Link to="/welcome" className="underline-offset-4 hover:underline">View classic homepage</Link>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} {cfg.brandName}
      </footer>

      <AuthDialogs popup={popup} setPopup={setPopup} />
    </div>
  );
}

function Showcase({
  icon, tag, title, image, items, reverse = false,
}: {
  icon: React.ReactNode; tag: string; title: string; image: string;
  items: HeroShowcaseItem[]; reverse?: boolean;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
      <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <Glass className="overflow-hidden">
          <img src={image} alt={tag} loading="lazy" className="h-full w-full object-cover" />
        </Glass>
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-xl">
            {icon} {tag}
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <div className="mt-5">
            <ShowcaseGrid items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FamousChatroomsSection({ rooms }: { rooms: FamousChatroom[] }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold opacity-80">
        <Flame className="h-4 w-4 text-orange-400" /> Famous chatrooms 🔥
      </div>
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Drop into the rooms everyone's talking about</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r, i) => (
          <Glass key={i} className="flex items-start gap-3 p-4 transition-transform hover:-translate-y-1">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-2xl">
              {r.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {r.members.toLocaleString()}
                </div>
              </div>
              <div className="mt-1 truncate text-xs opacity-70">{r.topic}</div>
            </div>
          </Glass>
        ))}
      </div>
    </section>
  );
}

function LiveUsersSection({ users }: { users: LiveUserCard[] }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold opacity-80">
        <span className="grid h-4 w-4 place-items-center"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /></span>
        Live users 🟢
      </div>
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Real people, online right now</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {users.map((u, i) => (
          <Glass key={i} className="p-4 text-center transition-transform hover:-translate-y-1">
            <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 text-3xl">
              {u.imageUrl
                ? <img src={u.imageUrl} alt={u.name} className="h-full w-full rounded-full object-cover" />
                : <span>{u.emoji}</span>}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black/80 bg-emerald-400" />
            </div>
            <div className="mt-3 text-sm font-semibold">{u.name}</div>
            <div className="mt-0.5 line-clamp-1 text-[11px] opacity-70">{u.status}</div>
          </Glass>
        ))}
      </div>
    </section>
  );
}

function DailyMissionsSection({ missions }: { missions: DailyMissionCard[] }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold opacity-80">
        <Target className="h-4 w-4 text-rose-300" /> Daily missions 🎯
      </div>
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Today's missions — earn XP & coins</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {missions.map((m, i) => (
          <Glass key={i} className="p-4 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-2xl">{m.emoji}</div>
              <div className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{m.reward}</div>
            </div>
            <div className="mt-2 text-sm font-semibold">{m.title}</div>
            <div className="mt-1 text-xs opacity-70 leading-relaxed">{m.description}</div>
          </Glass>
        ))}
      </div>
    </section>
  );
}
