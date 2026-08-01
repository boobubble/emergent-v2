import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Radio, Gamepad2, Users,
  Flame, Heart, Target,
  Play, Star, Zap, Crown, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { AuthDialogs, type AuthPopup } from "@/components/auth/AuthScreen";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection as HeroSectionBlock } from "@/components/landing/sections/HeroSection";
import { ChatroomsSection } from "@/components/landing/sections/ChatroomsSection";
import { FeedSection } from "@/components/landing/sections/FeedSection";
import { StatsSection, type LiveStats } from "@/components/landing/sections/StatsSection";
import { GlassCard } from "@/components/landing/ui/GlassCard";
import { SectionShell } from "@/components/landing/ui/SectionShell";

import {
  HERO_DEFAULTS, HERO_SETTINGS_KEY, mergeHeroConfig,
  type HeroConfig, type HeroSection, type HeroShowcaseItem,
  type FamousChatroom, type LiveUserCard,
} from "@/lib/hero-page-config";
import { headFromRouteSeo, loadRouteSeoWithDefaults } from "@/lib/seo";

const HEROPAGE_SEO_FALLBACK = {
  title: `${HERO_DEFAULTS.brandName} — ${HERO_DEFAULTS.headline}`,
  description: HERO_DEFAULTS.subheadline,
  ogTitle: HERO_DEFAULTS.headline,
  ogDescription: HERO_DEFAULTS.subheadline,
};

export const Route = createFileRoute("/heropage")({
  loader: () => loadRouteSeoWithDefaults("/heropage", HEROPAGE_SEO_FALLBACK),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: HeroHomepage,
});

interface LiveStatsState extends LiveStats {
  loaded: boolean;
}

function useLiveStats(): LiveStatsState {
  const [stats, setStats] = useState<LiveStatsState>({
    members: 0, online: 0, rooms: 0, djs: 0, postsToday: 0, loaded: false,
  });
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
          rooms: 0,
          djs: 0,
          postsToday: p.count ?? 0,
          loaded: true,
        });
      } catch {
        if (!cancelled) setStats((prev) => ({ ...prev, loaded: true }));
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);
  return stats;
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

/** Reveal-on-scroll wrapper using IntersectionObserver. */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    // Fallback 1: if element is already within viewport at mount, reveal immediately.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      setShown(true);
      return;
    }
    // Fallback 2: if IntersectionObserver is unavailable, reveal immediately.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    io.observe(el);
    // Fallback 3: guarantee reveal after 1.2s in case the observer never fires.
    const timeout = window.setTimeout(() => setShown(true), 1200);
    return () => { io.disconnect(); window.clearTimeout(timeout); };
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] backdrop-blur-xl">
      {children}
    </div>
  );
}

function FeatureRow({ items }: { items: HeroShowcaseItem[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <Reveal key={i} delay={i * 60}>
          <div className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06]">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 text-xl">{it.emoji}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="mt-0.5 text-xs opacity-70">{it.description}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function RadioMockup() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 shadow-[0_30px_80px_-20px_rgba(244,114,182,0.45)] backdrop-blur-2xl">
      <div className="p-6 text-white">
        <div className="text-[10px] uppercase tracking-wide text-rose-300">● Live Now</div>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-3xl shadow-lg shadow-fuchsia-500/40">🎧</div>
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white/10 backdrop-blur"><Play className="h-3 w-3 fill-white text-white" /></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold">DJ Night Vibes</div>
            <div className="text-xs opacity-70">128 listeners · Spinning lofi & house</div>
          </div>
          <button className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur sm:block">Tune in</button>
        </div>
        {/* waveform */}
        <div className="mt-5 flex h-16 items-end gap-1">
          {Array.from({ length: 48 }).map((_, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-fuchsia-500 to-cyan-300"
              style={{
                height: `${20 + Math.abs(Math.sin(i * 0.6)) * 80}%`,
                animation: `hero-bar 1200ms ease-in-out ${i * 35}ms infinite alternate`,
              }}
            />
          ))}
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {[
            { name: "Chill Beats", time: "Today, 8:00 PM" },
            { name: "Retro Hits", time: "Tomorrow, 10 PM" },
            { name: "Love Songs", time: "Sunday, 9 PM" },
          ].map((s) => (
            <div key={s.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              <div className="font-semibold">{s.name}</div>
              <div className="mt-0.5 opacity-60">{s.time}</div>
              <button className="mt-2 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-semibold text-fuchsia-200">Set reminder</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function XPMockup() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b1a]/90 p-6 text-white shadow-[0_30px_80px_-20px_rgba(251,191,36,0.35)] backdrop-blur-2xl">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 p-4 sm:col-span-2">
          <div className="flex items-center justify-between text-xs"><span className="opacity-70">Level 24</span><span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">Community Star</span></div>
          <div className="mt-3 flex items-center gap-3">
            <Award className="h-9 w-9 text-amber-300" />
            <div className="flex-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400" style={{ width: "62%" }} />
              </div>
              <div className="mt-1 text-[10px] opacity-60">6,520 / 10,000 XP</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/15 to-amber-400/10 p-4">
          <div className="text-xs opacity-70">Daily Streak</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl">🔥</span>
            <div>
              <div className="text-2xl font-extrabold leading-none">12 Days</div>
              <div className="text-[10px] opacity-60">Keep it up!</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs font-semibold opacity-80">Top 3 This Week</div>
          <div className="mt-2 space-y-1.5 text-xs">
            {[["Alex","15.5K"],["Emma","13.2K"],["Luna","12.5K"]].map(([n,xp], i) => (
              <div key={n} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2 py-1.5">
                <span className="flex items-center gap-2"><span className="text-amber-300">#{i+1}</span>{n}</span>
                <span className="opacity-70">{xp} XP</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs font-semibold opacity-80">Recent Badges</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {["🏅","🏆","🎙️","👑"].map((b, i) => (
              <div key={i} className="grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 text-2xl">{b}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GamesMockup({ items }: { items: HeroShowcaseItem[] }) {
  const games = [
    { emoji: "🎣", name: "Fishing", players: "1.1k playing", grad: "from-sky-500/30 to-cyan-500/30" },
    { emoji: "🔤", name: "Hangman", players: "820 playing", grad: "from-amber-500/30 to-rose-500/30" },
    { emoji: "🧠", name: "Trivia", players: "950 playing", grad: "from-indigo-500/30 to-fuchsia-500/30" },
    { emoji: "⛏️", name: "Dig Gold", players: "670 playing", grad: "from-yellow-500/30 to-orange-500/30" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((g) => (
          <div key={g.name} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${g.grad} p-5 transition hover:-translate-y-1 hover:border-white/30`}>
            <div className="text-5xl">{g.emoji}</div>
            <div className="mt-3 text-sm font-semibold">{g.name}</div>
            <div className="mt-1 text-[11px] opacity-70">{g.players}</div>
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((it, i) => (
          <Reveal key={i} delay={i * 60}>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="text-xl">{it.emoji}</span> {it.title}</div>
              <div className="mt-1 text-xs opacity-70">{it.description}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ */

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
  const navigate = useNavigate();
  const goOrPopup = (_to: string) => (_e: React.MouseEvent) => {
    // Allow normal navigation. Popups for login/signup are shown only when
    // guests attempt an action (post, vote, message), not on nav click.
  };

  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (user) return <Navigate to="/" replace />;


  // Note: a bg-color fallback is required because Chromium fails to paint an
  // arbitrary radial-gradient across very tall elements (page height > ~8192px),
  // leaving the lower portion transparent and exposing the white <body>.
  const bg = dark
    ? "bg-black bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0b1a_45%,_#000_100%)] text-white"
    : "bg-white bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#f5f3ff_45%,_#fff_100%)] text-slate-900";

  const renderSection = (s: HeroSection) => {
    if (!s.enabled) return null;
    switch (s.key) {
      case "hero":
        return <HeroSectionBlock key="hero" cfg={cfg} setPopup={setPopup} />;

      case "stats":
        return (
          <StatsSection
            key="stats"
            loaded={stats.loaded}
            stats={{
              members: stats.members,
              online: stats.online,
              rooms: stats.rooms,
              djs: stats.djs,
              postsToday: stats.postsToday,
            }}
          />
        );

      case "chatrooms":
        return <ChatroomsSection key="chatrooms" cfg={cfg} setPopup={setPopup} />;

      case "feed":
        return <FeedSection key="feed" cfg={cfg} />;

      case "radio":
        return (
          <div key="radio" className="relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,114,182,0.18),_transparent_60%)]" />
            <SectionShell>
              <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
                <Reveal>
                  <SectionTag><Radio className="h-3.5 w-3.5 text-rose-300" /> Listen. Enjoy. Live.</SectionTag>
                  <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                    Live Radio<br /> 24/7 <span className="bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent">Entertainment</span>
                  </h2>
                  <p className="mt-5 max-w-xl opacity-75">Tune into your favorite DJs, request songs and be part of the broadcast.</p>
                  <FeatureRow items={cfg.radioFeatures.slice(0, 6)} />
                </Reveal>
                <Reveal delay={120}>
                  <RadioMockup />
                </Reveal>
              </div>
            </SectionShell>
          </div>
        );

      case "games":
        return (
          <div key="games" className="relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12),_transparent_60%)]" />
            <SectionShell>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
                <Reveal>
                  <SectionTag><Gamepad2 className="h-3.5 w-3.5 text-emerald-300" /> Play Together</SectionTag>
                  <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                    Fun Games<br />Win <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Rewards</span>
                  </h2>
                  <p className="mt-5 max-w-xl opacity-75">Play exciting games with friends, win coins, XP and special rewards.</p>
                </Reveal>
                <Reveal delay={120}>
                  <GamesMockup items={cfg.gameFeatures} />
                </Reveal>
              </div>
            </SectionShell>
          </div>
        );

      case "famous_chatrooms":
        return <FamousChatroomsSection key="famous_chatrooms" rooms={cfg.famousChatrooms} />;

      case "live_users":
        return <LiveUsersSection key="live_users" users={cfg.liveUsers} />;

      case "daily_missions":
        return (
          <div key="daily_missions" className="relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.12),_transparent_60%)]" />
            <SectionShell>
              <Reveal>
                <SectionTag><Target className="h-3.5 w-3.5 text-amber-300" /> Level Up & Shine</SectionTag>
                <h2 className="text-4xl font-black sm:text-5xl">XP, Badges & Rewards<br />For <span className="bg-gradient-to-r from-amber-300 to-rose-400 bg-clip-text text-transparent">Everyone</span></h2>
                <p className="mt-4 max-w-xl opacity-75">Earn XP, maintain streaks, unlock badges and climb the leaderboards.</p>
              </Reveal>
              <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <Reveal delay={80}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cfg.dailyMissions.slice(0, 6).map((m, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400/25 to-rose-500/25 text-xl">{m.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold">{m.title}</div>
                            <div className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{m.reward}</div>
                          </div>
                          <div className="mt-0.5 text-xs opacity-70">{m.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={140}>
                  <XPMockup />
                </Reveal>
              </div>
            </SectionShell>
          </div>
        );

      case "social_proof":
        return (
          <SectionShell key="social_proof">
            <Reveal>
              <SectionTag><Heart className="h-3.5 w-3.5 text-pink-400" /> Loved by Thousands</SectionTag>
              <h2 className="text-4xl font-black sm:text-5xl">A Community That<br />Feels Like <span className="bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">Home 💗</span></h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Crown className="h-4 w-4 text-amber-300" />, label: "Top Members", emoji: "👑", text: "Climbing the leaderboards every day." },
                { icon: <Radio className="h-4 w-4 text-pink-300" />, label: "Top DJs", emoji: "🎧", text: "Real DJs spinning live sets nightly." },
                { icon: <Flame className="h-4 w-4 text-orange-400" />, label: "Trending Posts", emoji: "🔥", text: "What the community can't stop talking about." },
                { icon: <Users className="h-4 w-4 text-cyan-300" />, label: "Popular Rooms", emoji: "💬", text: "Hop into the rooms with the loudest energy." },
              ].map((sp, i) => (
                <Reveal key={sp.label} delay={i * 80}>
                  <GlassCard className="h-full p-5 transition hover:-translate-y-1 hover:border-white/20">
                    <div className="flex items-center gap-2 text-xs opacity-70">{sp.icon} {sp.label}</div>
                    <div className="mt-3 text-4xl">{sp.emoji}</div>
                    <div className="mt-2 text-sm opacity-75">{sp.text}</div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { n: "Alex", role: "Community Star", q: "This community is more than an app, it's a family. I've made amazing friends here!" },
                { n: "Emma", role: "Top Radio Host", q: "The radio feature is incredible. I love hosting my own shows!" },
                { n: "Luna", role: "Super Active", q: "The best community platform ever! So much fun and positive vibes." },
              ].map((t, i) => (
                <Reveal key={t.n} delay={i * 100}>
                  <GlassCard className="h-full p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-bold">{t.n[0]}</div>
                      <div><div className="text-sm font-semibold">{t.n}</div><div className="text-[11px] opacity-60">{t.role}</div></div>
                      <div className="ml-auto flex text-amber-300">{Array.from({length:5}).map((_,k)=><Star key={k} className="h-3 w-3 fill-current" />)}</div>
                    </div>
                    <p className="mt-3 text-sm opacity-80">"{t.q}"</p>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </SectionShell>
        );

      case "final_cta":
        return (
          <SectionShell key="final_cta" className="!pb-28">
            <Reveal>
              <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-r from-fuchsia-600/30 via-violet-600/25 to-indigo-600/30 p-10 text-center backdrop-blur-2xl shadow-[0_30px_120px_-30px_rgba(217,70,239,0.6)] sm:p-16">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full bg-fuchsia-500/40 blur-3xl" />
                <Heart className="mx-auto h-10 w-10 text-pink-300" />
                <h2 className="mt-4 text-4xl font-black sm:text-5xl">{cfg.finalCtaTitle}</h2>
                <p className="mt-4 mx-auto max-w-xl opacity-85">{cfg.finalCtaSubtitle}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button onClick={() => setPopup("signup")}
                    className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-xl transition hover:scale-105">{cfg.ctaJoinLabel}</button>
                  <button onClick={() => setPopup("signin")}
                    className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl transition hover:scale-105">{cfg.ctaLoginLabel}</button>
                </div>
              </div>
            </Reveal>
          </SectionShell>
        );

      default:
        return null;
    }
  };

  return (
    <div data-hero-theme={dark ? "dark" : "light"} className={`min-h-screen relative overflow-x-clip ${dark ? "text-white" : "text-slate-900"}`}>
      {/* Fixed background layer — avoids Chromium paint gaps on very tall gradient elements */}
      <div aria-hidden className={`fixed inset-0 -z-10 ${bg}`} />
      {/* Animations + scroll behavior */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes hero-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes hero-msg-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes hero-bar { from { transform: scaleY(0.4) } to { transform: scaleY(1) } }
      `}</style>


      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <LandingHeader
        cfg={cfg}
        dark={dark}
        setDark={setDark}
        setPopup={setPopup}
        scrolled={scrolled}
        goOrPopup={goOrPopup}
      />

      {cfg.sections.map((s) => {
        const node = renderSection(s);
        if (!node) return null;
        // anchor wrapping for nav jump
        const anchor: Partial<Record<string, string>> = {
          chatrooms: "chatrooms", feed: "feed", radio: "radio", games: "games", daily_missions: "rewards",
        };
        const id = anchor[s.key];
        return id ? <div id={id} key={s.key}>{node}</div> : node;
      })}

      <LandingFooter brandName={cfg.brandName} />

      <AuthDialogs popup={popup} setPopup={setPopup} />
    </div>
  );
}

/* ============================================================
   Remaining sections kept compatible with the config schema
   ============================================================ */

function FamousChatroomsSection({ rooms }: { rooms: FamousChatroom[] }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20">
      <Reveal>
        <SectionTag><Flame className="h-3.5 w-3.5 text-orange-400" /> Famous Chatrooms</SectionTag>
        <h2 className="text-4xl font-black sm:text-5xl">Drop into the rooms<br />everyone's <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">talking about</span></h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r, i) => (
          <Reveal key={i} delay={i * 80}>
            <GlassCard className="flex items-start gap-3 p-5 transition hover:-translate-y-1 hover:border-white/25">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-3xl">{r.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-base font-bold">{r.name}</div>
                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {r.members.toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-xs opacity-70">{r.topic}</div>
                <div className="mt-3 flex -space-x-1.5">
                  {["from-fuchsia-500 to-pink-500","from-indigo-500 to-cyan-500","from-amber-400 to-rose-500","from-emerald-400 to-teal-500"].map((g, k) => (
                    <span key={k} className={`h-6 w-6 rounded-full bg-gradient-to-br ${g} ring-2 ring-black/40`} />
                  ))}
                </div>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function LiveUsersSection({ users }: { users: LiveUserCard[] }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20">
      <Reveal>
        <SectionTag>
          <span className="grid h-3.5 w-3.5 place-items-center"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /></span>
          Live Users
        </SectionTag>
        <h2 className="text-4xl font-black sm:text-5xl">Real people, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">online right now</span></h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        {users.map((u, i) => (
          <Reveal key={i} delay={i * 60}>
            <GlassCard className="p-5 text-center transition hover:-translate-y-1">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 text-4xl">
                {u.imageUrl
                  ? <img src={u.imageUrl} alt={u.name} className="h-full w-full rounded-full object-cover" />
                  : <span>{u.emoji}</span>}
                <span className="absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full border-2 border-black/80 bg-emerald-400" />
              </div>
              <div className="mt-3 text-sm font-semibold">{u.name}</div>
              <div className="mt-0.5 line-clamp-1 text-[11px] opacity-70">{u.status}</div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300"><Zap className="h-3 w-3" /> Active</div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

