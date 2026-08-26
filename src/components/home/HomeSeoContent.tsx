import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Circle,
  Crown,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  Menu,
  MessageCircle,
  MessageSquare,
  Moon,
  Newspaper,
  Rocket,
  Star,
  Sun,
  Users,
  X,
} from "@/components/home/home-icons";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HOME_SEO_H1 } from "@/lib/seo/home-page";
import { LANDING_DEFAULTS, type LandingConfig } from "@/lib/landing-config";
import { WELCOME_THEME_CSS } from "@/components/home/welcome-theme-css";
import { usePublicDisplayName } from "@/lib/branding";
import {
  PillAvatar,
  SectionTitle,
  StatCell,
  WelcomeCard,
} from "@/components/home/welcome-primitives";
import {
  fmtCount,
  type LandingPayload,
  type LandingStats,
} from "@/lib/landing-payload";
import { publicProfilePath } from "@/lib/public-avatar";

const seoLink =
  "font-semibold text-purple-300 underline-offset-4 hover:underline";

const FEATURE_HREFS: Record<string, string> = {
  "Live Chatrooms": "/chatroom",
  "Social Feed": "/feed",
  "Games & Rewards": "/games",
  "Find Friends": "/find-friends",
  Leaderboards: "/leaderboard",
  "Daily Missions": "/achievements",
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Chatrooms", href: "/chatroom" },
  { label: "Feed", href: "/feed" },
  { label: "Communities", href: "/communities" },
  { label: "Competitions", href: "/competitions" },
  { label: "Poetry", href: "/poetry" },
] as const;

function EmptyHint({ children, href, cta }: { children: string; href: string; cta: string }) {
  return (
    <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
      <p className="text-sm text-white/65">{children}</p>
      <a
        href={href}
        className="mt-3 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-purple-200 hover:bg-white/[0.08]"
      >
        {cta}
      </a>
    </div>
  );
}

export type HomeSeoContentProps = {
  cfg?: LandingConfig;
  source?: LandingPayload["source"];
  stats?: LandingStats;
  chatrooms?: LandingPayload["chatrooms"];
  topMembers?: LandingPayload["topMembers"];
  feedPost?: LandingPayload["feedPost"];
  poll?: LandingPayload["poll"];
  confession?: LandingPayload["confession"];
  trendingPosts?: LandingPayload["trendingPosts"];
  discussions?: LandingPayload["discussions"];
  featuredMembers?: LandingPayload["featuredMembers"];
  recentConfessions?: LandingPayload["recentConfessions"];
  blogPosts?: LandingPayload["blogPosts"];
  activities?: LandingPayload["activities"];
  newMembers?: LandingPayload["newMembers"];
  theme?: "dark" | "light";
  menuOpen?: boolean;
  pollChoice?: number | null;
  onToggleMenu?: () => void;
  onToggleTheme?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onPollChoice?: (index: number) => void;
  poetryExtra?: React.ReactNode;
};

/**
 * Server-safe welcome-style homepage. Renders in the initial HTML without
 * client-only gates so crawlers receive a real H1, paragraphs, and hrefs.
 */
export function HomeSeoContent({
  cfg = LANDING_DEFAULTS,
  source,
  stats,
  chatrooms,
  topMembers,
  feedPost,
  poll,
  confession,
  trendingPosts,
  discussions,
  featuredMembers,
  recentConfessions,
  blogPosts,
  activities,
  newMembers,
  theme = "dark",
  menuOpen = false,
  pollChoice = null,
  onToggleMenu,
  onToggleTheme,
  onLogin,
  onSignup,
  onPollChoice,
  poetryExtra,
}: HomeSeoContentProps) {
  const brand = usePublicDisplayName();
  const isDemo = (source ?? (cfg.useDemoData ? "demo" : "live")) === "demo";
  const resolvedStats = stats ?? (isDemo
    ? { ...cfg.demoStats }
    : { members: 0, online: 0, activeRooms: 0, messagesSent: 0, feedPosts: 0, gamesPlayed: 0 });
  const rooms = chatrooms ?? (isDemo ? cfg.demoChatrooms : []);
  const members = topMembers ?? (isDemo ? cfg.demoTopMembers : []);
  const post = feedPost !== undefined ? feedPost : isDemo ? cfg.demoFeedPost : null;
  const pollData = poll !== undefined ? poll : isDemo ? cfg.demoPoll : null;
  const confessionData = confession !== undefined ? confession : isDemo ? cfg.demoConfession : null;
  const trending = trendingPosts ?? (isDemo ? cfg.trendingPosts : []);
  const discussionItems = discussions ?? (isDemo ? cfg.discussions : []);
  const featured = featuredMembers ?? (isDemo ? cfg.featuredMembers : []);
  const confessions = recentConfessions ?? (isDemo ? cfg.recentConfessions : []);
  const blogs = blogPosts ?? (isDemo ? cfg.blogPosts : []);
  const activityItems = activities ?? (isDemo ? cfg.activities : []);
  const signupItems = newMembers ?? [];
  const pollTotal = pollData?.options.reduce((s, o) => s + (o.votes || 0), 0) || 1;
  const heroPeople = (
    isDemo
      ? ["Amit", "Pooja", "Rahul", "Neha"].map((username) => ({ username }))
      : members.slice(0, 4)
  ) as Array<{ username: string; avatarUrl?: string }>;
  while (heroPeople.length < 4) heroPeople.push({ username: "Y" });

  return (
    <div
      className={`welcome-root ${theme === "light" ? "welcome-light" : "welcome-dark"} relative min-h-screen overflow-x-hidden bg-[#070713] text-white antialiased`}
    >
      <style>{WELCOME_THEME_CSS}</style>

      <div className="welcome-aurora pointer-events-none fixed inset-0 -z-10 select-none" aria-hidden>
        <div className="welcome-orb absolute -left-32 top-[-10%] h-[520px] w-[520px] opacity-50" style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
        <div className="welcome-orb absolute right-[-15%] top-[20%] h-[600px] w-[600px] opacity-40" style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
        <div className="welcome-orb absolute bottom-[-10%] left-1/3 h-[500px] w-[500px] opacity-30" style={{ background: "radial-gradient(closest-side,#ec4899,transparent 70%)" }} />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#070713]/95">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.6)" }}
            >
              💬
            </span>
            <span className="text-lg font-extrabold tracking-tight">{brand}</span>
          </a>

          <nav aria-label="Homepage" className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={onLogin}
              className="hidden rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.08] sm:inline-flex"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onSignup}
              className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.7)" }}
            >
              Join Free
            </button>
            <button
              type="button"
              onClick={onToggleMenu}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#070713]/95 px-4 pb-4 pt-2 lg:hidden">
            <nav aria-label="Mobile" className="grid gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:pt-14">
            <div>
              <p className="text-sm font-semibold tracking-wide text-purple-300">
                {cfg.heroEyebrow || "Yaarzo"}
              </p>
              <h1 className="mt-2 text-[32px] font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[52px]">
                {HOME_SEO_H1.replace("Join Communities", "").trim()}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(120deg,#a78bfa 0%,#c084fc 40%,#60a5fa 100%)" }}
                >
                  Join Communities
                </span>
              </h1>
              <p className="mt-4 text-base font-semibold text-white/80 sm:text-lg">
                {cfg.heroTitle} {cfg.heroTitleHighlight}
              </p>
              <p className="mt-3 max-w-xl text-sm text-white/65 sm:text-base">{cfg.heroSubtitle}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {cfg.heroBadges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onSignup}
                  className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", boxShadow: "0 12px 32px -8px rgba(139,92,246,0.65)" }}
                >
                  <Rocket className="h-4 w-4" /> {cfg.primaryCtaLabel || "Start Chatting"}
                </button>
                <button
                  type="button"
                  onClick={onSignup}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.08]"
                >
                  ✨ {cfg.secondaryCtaLabel || "Create Account"}
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {heroPeople.map((p, i) => (
                    <PillAvatar key={`${p.username}-${i}`} name={p.username} size={32} src={p.avatarUrl} lazy={i > 0} />
                  ))}
                </div>
                <span className="text-xs text-white/65 sm:text-sm">{cfg.heroSocialProof}</span>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        {cfg.showStats && (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" aria-label="Community stats">
            <div
              className="relative overflow-hidden rounded-3xl border border-white/10 p-2 shadow-[0_30px_80px_-30px_rgba(139,92,246,0.45)] sm:p-3"
              style={{
                background:
                  "linear-gradient(135deg,rgba(139,92,246,0.10),rgba(59,130,246,0.06) 50%,rgba(236,72,153,0.08))",
              }}
            >
              <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <StatCell icon={Users} tint="#a78bfa" label="Members" value={fmtCount(resolvedStats.members)} />
                <StatCell icon={Activity} tint="#34d399" label="Online Now" value={fmtCount(resolvedStats.online)} pulse />
                <StatCell icon={MessageCircle} tint="#60a5fa" label="Active Chatrooms" value={fmtCount(resolvedStats.activeRooms)} />
                {cfg.showMessageCount && isDemo && (
                  <StatCell icon={MessageSquare} tint="#22d3ee" label="Messages Sent" value={fmtCount(resolvedStats.messagesSent)} />
                )}
                <StatCell icon={Newspaper} tint="#f472b6" label="Feed Posts" value={fmtCount(resolvedStats.feedPosts)} />
                {cfg.showGameCount && isDemo && (
                  <StatCell icon={Gamepad2} tint="#fbbf24" label="Games Played" value={fmtCount(resolvedStats.gamesPlayed)} />
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-label="Features">
          <h2 className="sr-only">What you can do on Yaarzo</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {cfg.featureCards.map((f, i) => {
              const palettes = [
                "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                "linear-gradient(135deg,#f97316,#ea580c)",
                "linear-gradient(135deg,#10b981,#059669)",
                "linear-gradient(135deg,#ef4444,#b91c1c)",
                "linear-gradient(135deg,#a855f7,#7c3aed)",
              ];
              const href = f.href || FEATURE_HREFS[f.title];
              const body = (
                <>
                  <div
                    className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl shadow-lg"
                    style={{
                      background: palettes[i % palettes.length],
                      boxShadow: `0 10px 24px -10px ${["#8b5cf6", "#3b82f6", "#f97316", "#10b981", "#ef4444", "#a855f7"][i % 6]}99`,
                    }}
                  >
                    {f.emoji}
                  </div>
                  <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                  <p className="mt-1 text-[11px] leading-snug text-white/55">{f.description}</p>
                </>
              );
              return (
                <WelcomeCard key={`${f.title}-${i}`} className="overflow-hidden p-0 text-center transition-transform hover:-translate-y-0.5">
                  {href ? (
                    <a href={href} className="block p-5">{body}</a>
                  ) : (
                    <div className="p-5">{body}</div>
                  )}
                </WelcomeCard>
              );
            })}
          </div>
        </section>

        <SeoCopySections />

        <LiveCommunity
          rooms={rooms}
          members={members}
          post={post}
          pollData={pollData}
          pollTotal={pollTotal}
          pollChoice={pollChoice}
          onPollChoice={onPollChoice}
          confessionData={confessionData}
          cfg={cfg}
        />

        <TrendingPosts posts={trending} />
        {poetryExtra}
        <PoetrySeoSection />
        <Discussions items={discussionItems} />
        <FeaturedMembers members={featured} />
        <LatestSignups members={signupItems} />
        <RecentConfessions items={confessions} />
        <CommunityActivity items={activityItems} />
        <CommunityBlog posts={blogs} />

        <ExploreCta onSignup={onSignup} />

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <WelcomeCard
              className="relative overflow-hidden p-6 sm:p-8"
              style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.35),rgba(236,72,153,0.25) 60%,rgba(59,130,246,0.2))" }}
            >
              <div className="relative grid items-center gap-5 sm:grid-cols-[1fr_auto]">
                <div className="max-w-md">
                  <h2 className="text-2xl font-black sm:text-3xl">{cfg.finalCtaTitle}</h2>
                  <p className="mt-2 text-sm text-white/80">{cfg.finalCtaSubtitle}</p>
                  <button
                    type="button"
                    onClick={onSignup}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#1a0b2e] shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {cfg.finalCtaImageUrl && (
                  <img
                    src={cfg.finalCtaImageUrl}
                    alt={cfg.finalCtaImageAlt || "Join the Yaarzo community"}
                    loading="lazy"
                    className="hidden h-40 w-40 rounded-2xl object-cover shadow-xl ring-1 ring-white/10 sm:block sm:h-44 sm:w-44"
                  />
                )}
              </div>
            </WelcomeCard>

            <WelcomeCard
              className="relative overflow-hidden p-6"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.4),rgba(59,130,246,0.3))" }}
            >
              <div className="relative">
                <div className="flex items-center gap-2 text-base font-extrabold">
                  <Rocket className="h-5 w-5 text-pink-300" /> {cfg.referralHeadline}
                </div>
                <p className="mt-2 text-xs text-white/80">{cfg.referralDescription}</p>
                <a
                  href="/find-friends"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-purple-400"
                >
                  Invite Now
                </a>
              </div>
            </WelcomeCard>
          </div>
        </section>
      </main>

      <HomeFooter brandName={brand} tagline={cfg.brandTagline} />
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative hidden min-h-[560px] lg:block">
        <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full opacity-60" style={{ background: "radial-gradient(closest-side,#8b5cf6,transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full opacity-50" style={{ background: "radial-gradient(closest-side,#3b82f6,transparent 70%)" }} />
      </div>

      <div className="hero-dark-preview absolute right-0 top-4 w-[480px] rotate-[-2deg] rounded-2xl border border-white/15 bg-[#0e0e22]/90 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.55)]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-black text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}>💬</span>
          <span className="text-[11px] font-bold text-white/85">Yaarzo</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <X className="h-3 w-3 text-white/40" />
          </span>
        </div>
        <div className="grid grid-cols-[1fr_120px] gap-0">
          <div className="border-r border-white/10 p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg text-sm" style={{ background: "linear-gradient(135deg,#f59e0b,#dc2626)" }}>🇮🇳</span>
              <div>
                <div className="text-[11px] font-bold text-white">Live Chat</div>
                <div className="text-[9px] text-white/50">Online now</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { n: "Member", t: "Hello everyone! 👋", ts: "10:30" },
                { n: "Friend", t: "Good morning all ☀️", ts: "10:31" },
                { n: "Guest", t: "Anyone up for a game?", ts: "10:32" },
                { n: "You", t: "Hey! How's it going?", ts: "10:33" },
                { n: "Chat", t: "Let's play Ludo! 🎲", ts: "10:34" },
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
            <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-white/50">Online</div>
            <div className="space-y-1.5">
              {["Member", "Friend", "Guest", "You", "Chat", "Room", "Live"].map((n) => (
                <div key={n} className="flex items-center gap-1.5">
                  <PillAvatar name={n} size={16} />
                  <span className="truncate text-[9px] text-white/70">{n.split(" ")[0]}</span>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-[-10px] w-[200px] rotate-[-6deg] rounded-[28px] border border-white/15 bg-[#0a0a1a] p-1.5 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.6)]">
        <div className="relative overflow-hidden rounded-[22px] bg-[#10101f]">
          <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-black" />
          <div className="px-2.5 pb-2 pt-5">
            <div className="flex items-center justify-between text-[8px] text-white/60">
              <span>9:41</span>
              <span>📶 📡 🔋</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <PillAvatar name="You" size={20} />
              <div className="text-[9px] font-bold text-white">You</div>
            </div>
            <div className="mt-1.5 rounded-lg bg-white/[0.05] p-1.5 text-[8px] text-white/70">Going strong! 🚀</div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {["🐼", "🦊", "🐻", "🐰", "🦁", "🐯", "🐨", "🐶"].map((e, i) => (
                <div key={i} className="grid aspect-square place-items-center rounded-md bg-white/[0.06] text-[14px]">{e}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -right-2 top-1 grid h-14 w-14 animate-bounce-slow place-items-center rounded-full text-3xl shadow-[0_10px_30px_-5px_rgba(168,85,247,0.7)]"
        style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
      >
        😎
      </div>
      <div
        className="absolute right-8 top-[260px] grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-[0_10px_30px_-5px_rgba(59,130,246,0.7)]"
        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
      >
        💬
      </div>
      <div className="hero-dark-preview absolute bottom-8 right-4 rounded-2xl border border-white/15 bg-[#0e0e22]/90 px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-bold text-white">Connected</span>
          <span className="text-[10px] text-white/55">128 Online</span>
        </div>
      </div>
    </div>
  );
}

function SeoCopySections() {
  return (
    <section data-seo-copy className="mx-auto max-w-7xl space-y-4 px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Meet New People Through Online Chatrooms</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Yaarzo is a free place to meet people in live{" "}
          <a href="/chatroom" className={seoLink}>online chatrooms</a>{" "}
          and keep conversations going with friends around the world. Whether you want a
          quick hello after work or a longer talk about something you love, you can walk in,
          join a room, and start chatting without a complicated setup. Rooms are organized
          around how people actually connect: by city, by country, and by interest. Browse
          rooms tied to places such as{" "}
          <a href="/india-chat-room" className={seoLink}>India</a> and{" "}
          <a href="/pakistan-chat-room" className={seoLink}>Pakistan</a>, drop into a city
          room like <a href="/lahore-chat-room" className={seoLink}>Lahore</a>, or choose a
          topic when you would rather talk about a hobby than a location. Public social
          conversations stay easy to discover, so you can listen first and join when you feel
          ready. Rooms stay open for casual hangouts, late-night talks, and regular groups of
          friends who keep coming back.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { href: "/india-chat-room", label: "🇮🇳 India Chat Room" },
            { href: "/pakistan-chat-room", label: "🇵🇰 Pakistan Chat Room" },
            { href: "/lahore-chat-room", label: "🌆 Lahore Chat Room" },
            { href: "/chatroom", label: "💬 All Chatrooms" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08]"
            >
              {l.label}
            </a>
          ))}
        </div>
      </WelcomeCard>

      <WelcomeCard className="p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">More Than Just a Chat Room</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          The platform is also a social community. Members share posts on the{" "}
          <a href="/feed" className={seoLink}>social feed</a>, keep public profiles, join{" "}
          <a href="/communities" className={seoLink}>communities</a>, enter{" "}
          <a href="/competitions" className={seoLink}>competitions</a>, and publish{" "}
          <a href="/poetry" className={seoLink}>poetry and shayari</a>. A chat window is only
          the beginning. The feed lets you share posts, react, and follow what the community
          is talking about today. Your profile is the public face of those conversations, so
          people you meet in a room can remember you and continue the friendship later.
          Communities gather members around a shared purpose. Competitions add a playful
          challenge, from contests to creative showdowns. Poetry and shayari give writers a
          quieter corner to share verses and read others. Together these pieces make Yaarzo
          feel like a full social home rather than a single chat box. The idea is simple: one
          friendly space where conversations, creativity, and new friendships can grow together.
        </p>
      </WelcomeCard>

      <WelcomeCard className="p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Find Communities That Match Your Interests</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Interest-based discovery is part of everyday browsing. If you care about music,
          sport, study, humour, or late-night conversation, you can look for{" "}
          <a href="/communities" className={seoLink}>communities</a> and rooms that already
          gather around those topics. You do not need to know anyone in advance: public
          discussions make it natural to join, introduce yourself, and find people who enjoy
          the same things. Over time those interest groups become familiar circles — places
          you return to because the talk feels yours. Yaarzo is built for safe,
          community-focused interaction: start with a hello, stay for the friendships, and
          explore conversations that match how you like to connect.
        </p>
      </WelcomeCard>
    </section>
  );
}

function LiveCommunity({
  rooms,
  members,
  post,
  pollData,
  pollTotal,
  pollChoice,
  onPollChoice,
  confessionData,
  cfg,
}: {
  rooms: LandingPayload["chatrooms"];
  members: LandingPayload["topMembers"];
  post: LandingPayload["feedPost"];
  pollData: LandingPayload["poll"];
  pollTotal: number;
  pollChoice: number | null;
  onPollChoice?: (index: number) => void;
  confessionData: LandingPayload["confession"];
  cfg: LandingConfig;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-label="Live community">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <WelcomeCard className="p-5">
            <SectionTitle icon="🔥" title="Trending Chatrooms" href="/chatroom" />
            {rooms.length ? (
            <div className="mt-3 space-y-2.5">
              {rooms.slice(0, 5).map((r, i) => {
                const thumbs = [
                  "linear-gradient(135deg,#f59e0b,#dc2626)",
                  "linear-gradient(135deg,#3b82f6,#1e3a8a)",
                  "linear-gradient(135deg,#10b981,#065f46)",
                  "linear-gradient(135deg,#f97316,#7c2d12)",
                  "linear-gradient(135deg,#ec4899,#831843)",
                ];
                return (
                  <a key={r.name} href="/chatroom" className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                    <div
                      className="relative grid h-11 w-14 place-items-center overflow-hidden rounded-lg text-xl ring-1 ring-white/10"
                      style={{ background: thumbs[i % thumbs.length] }}
                    >
                      <span className="drop-shadow">{r.emoji}</span>
                      <span className="absolute inset-0 bg-black/20" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">#{r.name.replace(/^#/, "")}</div>
                      <div className="text-[11px] text-white/50">{fmtCount(r.online)} Online</div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  </a>
                );
              })}
            </div>
            ) : (
              <EmptyHint href="/chatroom" cta="Open chatrooms">
                Rooms are opening up — jump in and say hello.
              </EmptyHint>
            )}
          </WelcomeCard>

          <WelcomeCard className="p-5">
            <SectionTitle icon="🏆" title="Top Members" suffix="(This Week)" href="/leaderboard" />
            {members.length ? (
            <div className="mt-3 space-y-2">
              {members.slice(0, 3).map((u, i) => (
                <div key={u.username} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                  <span
                    className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-black"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
                          : i === 1
                            ? "linear-gradient(135deg,#e5e7eb,#9ca3af)"
                            : "linear-gradient(135deg,#fbbf24,#b45309)",
                      color: "#0a0a0a",
                    }}
                  >
                    {i + 1}
                  </span>
                  <a href={publicProfilePath(u.username)} className="shrink-0" aria-label={u.username}>
                    <PillAvatar name={u.username} size={32} src={u.avatarUrl} />
                  </a>
                  <div className="min-w-0 flex-1">
                    <a href={publicProfilePath(u.username)} className="truncate text-sm font-bold hover:underline">
                      {u.username}
                    </a>
                  </div>
                  <div className="text-xs font-bold text-purple-300">{fmtCount(u.xp)} XP</div>
                </div>
              ))}
            </div>
            ) : (
              <EmptyHint href="/" cta="Join Free">
                Be one of the first members to join.
              </EmptyHint>
            )}
            <a
              href="/leaderboard"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/85 hover:bg-white/[0.06]"
            >
              View Leaderboard
            </a>
          </WelcomeCard>
        </div>

        <div className="space-y-4">
          <WelcomeCard className="p-5">
            <SectionTitle icon="📝" title="Latest Feed" href="/feed" />
            {post ? (
            <article className="mt-3 rounded-xl bg-white/[0.03] p-3">
              <header className="flex items-center gap-2.5">
                <PillAvatar name={post.username} size={36} src={post.anonymous ? undefined : post.avatarUrl} />
                <div className="min-w-0 flex-1">
                  {post.anonymous ? (
                    <div className="truncate text-sm font-bold">{post.username}</div>
                  ) : (
                    <a href={publicProfilePath(post.username)} className="truncate text-sm font-bold hover:underline">
                      {post.username}
                    </a>
                  )}
                  <div className="text-[11px] text-white/50">{post.ago}</div>
                </div>
              </header>
              <p className="mt-2.5 text-[13px] leading-snug text-white/85">{post.text}</p>
              <footer className="mt-3 flex items-center gap-4 text-[11px] text-white/60">
                <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {post.likes}</span>
                <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.comments}</span>
              </footer>
            </article>
            ) : (
              <EmptyHint href="/feed" cta="Open the feed">
                No public posts yet — start the conversation.
              </EmptyHint>
            )}

            {pollData ? (
            <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[11px] text-white/55">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/20 text-base">📊</span>
                <div>
                  <div className="text-xs font-bold text-white">Community Poll</div>
                  <div className="text-[10px] text-white/45">{pollData.ago}</div>
                </div>
              </div>
              <p className="mt-2.5 text-[13px] font-semibold text-white/90">{pollData.question}</p>
              <div className="mt-2.5 space-y-1.5">
                {pollData.options.map((o, i) => {
                  const pct = Math.round((o.votes / pollTotal) * 100);
                  const active = pollChoice === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onPollChoice?.(i)}
                      className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-xs transition-colors ${active ? "border-purple-400/60" : "border-white/10 hover:bg-white/[0.04]"}`}
                    >
                      <span
                        className="absolute inset-y-0 left-0 -z-0 rounded-lg"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,rgba(139,92,246,0.35),rgba(59,130,246,0.25))" }}
                      />
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
                <span>{pollTotal} votes{pollData.daysLeft > 0 ? ` · ${pollData.daysLeft} days left` : ""}</span>
                <a href="/feed" className="rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/15">Vote Now</a>
              </div>
            </div>
            ) : (
              <EmptyHint href="/feed" cta="Share a poll">
                No public polls yet — ask the community something.
              </EmptyHint>
            )}

            {confessionData ? (
            <div className="mt-3 rounded-xl bg-white/[0.03] p-3">
              <header className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full text-lg" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                  {confessionData.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{confessionData.alias}</div>
                  <div className="text-[10px] text-white/50">{confessionData.ago}</div>
                </div>
              </header>
              <p className="mt-2 text-[13px] leading-snug text-white/85">{confessionData.text}</p>
            </div>
            ) : (
              <EmptyHint href="/confessions" cta="Read confessions">
                New stories will appear here.
              </EmptyHint>
            )}
          </WelcomeCard>
        </div>

        <div className="space-y-4">
          <WelcomeCard className="p-5">
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
                  <a
                    href="/games"
                    className="shrink-0 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-[11px] font-bold text-purple-200 hover:bg-purple-500/25"
                  >
                    Play Now
                  </a>
                </div>
              ))}
            </div>
          </WelcomeCard>

          <WelcomeCard className="p-5">
            <SectionTitle icon="🎯" title="Today's Missions" href="/achievements" />
            <div className="mt-3 space-y-2.5">
              {cfg.missions.slice(0, 3).map((m) => (
                <div key={m.title} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5">
                  {m.complete
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    : <Circle className="h-5 w-5 shrink-0 text-white/30" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white/90">{m.title}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: "linear-gradient(90deg,#8b5cf6,#3b82f6)" }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300">{m.progressLabel ?? `${m.progress}%`}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 p-3">
              <Gift className="h-6 w-6 shrink-0 text-amber-300" />
              <div className="flex-1 text-[11px] text-white/70">Rewards</div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-200">⚡ +100 XP</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">🪙 +50 Coins</span>
            </div>
          </WelcomeCard>
        </div>
      </div>
    </section>
  );
}

function TrendingPosts({ posts }: { posts: LandingPayload["trendingPosts"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="🔥" title="Trending Posts" suffix="(Hot right now)" href="/feed" />
        {posts.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <article key={i} className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <header className="flex items-center gap-2.5">
                <PillAvatar name={p.user} size={36} src={p.anonymous ? undefined : p.avatarUrl} />
                <div className="min-w-0 flex-1">
                  {p.anonymous ? (
                    <div className="truncate text-sm font-bold">{p.user}</div>
                  ) : (
                    <a href={publicProfilePath(p.user)} className="truncate text-sm font-bold hover:underline">
                      {p.user}
                    </a>
                  )}
                  <div className="text-[11px] text-white/50">{p.ago}</div>
                </div>
                <Flame className="h-4 w-4 text-orange-400" />
              </header>
              <p className="mt-2.5 line-clamp-3 text-[13px] leading-snug text-white/85">{p.text}</p>
              <footer className="mt-3 flex items-center justify-between text-[11px] text-white/60">
                <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-200">{p.tag}</span>
                <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {p.likes}</span>
              </footer>
            </article>
          ))}
        </div>
        ) : (
          <EmptyHint href="/feed" cta="Share a post">
            No public posts yet — start the conversation.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function PoetrySeoSection() {
  return (
    <section data-seo-copy className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="📜" title="Poetry and Shayari" href="/poetry" />
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Writers share verses, shayari, and quiet reflections in the{" "}
          <a href="/poetry" className={seoLink}>poetry hub</a>. Read trending pieces, follow
          a favourite writer, or publish a few lines of your own. It is a calmer room next
          to the live chatrooms — still part of the same community, still a place to meet
          people who care about the same words.
        </p>
      </WelcomeCard>
    </section>
  );
}

function Discussions({ items }: { items: LandingPayload["discussions"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="💬" title="Latest Public Discussions" href="/chatroom" />
        {items.length ? (
        <div className="mt-4 divide-y divide-white/[0.05]">
          {items.map((d, i) => (
            <a key={i} href="/feed" className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02] sm:gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-base ring-1 ring-white/10">💬</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white/90">{d.topic}</p>
                <div className="mt-0.5 truncate text-[11px] text-white/55">
                  in <span className="text-purple-300">{d.room}</span> · by {d.author} · last reply {d.last}
                </div>
              </div>
            </a>
          ))}
        </div>
        ) : (
          <EmptyHint href="/feed" cta="Start a discussion">
            No public posts yet — start the conversation.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function FeaturedMembers({ members }: { members: LandingPayload["featuredMembers"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="⭐" title="Featured Members" suffix="(Stars of the week)" href="/leaderboard" />
        {members.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => (
            <div key={m.name} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${m.gradient} p-4 ring-1 ring-white/10`}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <a href={publicProfilePath(m.name)} aria-label={m.name}>
                    <PillAvatar name={m.name} size={64} src={m.avatarUrl} />
                  </a>
                  <Crown className="absolute -right-1 -top-1 h-5 w-5 text-amber-300 drop-shadow" />
                </div>
                <a href={publicProfilePath(m.name)} className="mt-2.5 text-sm font-bold hover:underline">{m.name}</a>
                <div className="text-[11px] text-white/70">{m.role}</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                  <Star className="h-3 w-3" /> {m.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <EmptyHint href="/" cta="Join Free">
            Be one of the first members to join.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function RecentConfessions({ items }: { items: LandingPayload["recentConfessions"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="🤫" title="Recent Confessions" suffix="(Anonymous)" href="/confessions" />
        {items.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br from-pink-500/[0.08] via-purple-500/[0.05] to-transparent p-4">
              <header className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-full text-xl ring-1 ring-white/15" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{c.alias}</div>
                  <div className="text-[11px] text-white/50">{c.ago}</div>
                </div>
              </header>
              <p className="mt-3 text-[13px] leading-snug text-white/85">&ldquo;{c.text}&rdquo;</p>
              <footer className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11px] text-white/60">
                <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-400" /> {c.reacts} reactions</span>
                <a href="/confessions" className="font-bold text-pink-300 hover:text-pink-200">Read →</a>
              </footer>
            </div>
          ))}
        </div>
        ) : (
          <EmptyHint href="/confessions" cta="Share a confession">
            New stories will appear here.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function LatestSignups({ members }: { members: LandingPayload["newMembers"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="👋" title="Latest Signups" suffix="(New members)" href="/find-friends" />
        {members.length ? (
          <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
            {members.map((m) => (
              <li key={m.username} className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4">
                <a href={publicProfilePath(m.username)} className="shrink-0" aria-label={m.username}>
                  <PillAvatar name={m.username} size={36} src={m.avatarUrl} />
                </a>
                <div className="min-w-0 flex-1">
                  <a href={publicProfilePath(m.username)} className="truncate text-sm font-bold hover:underline">
                    {m.username}
                  </a>
                  <div className="truncate text-[11px] text-white/55">Joined {m.ago}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[11px] font-bold text-purple-300">Lv {m.level}</div>
                  <div className="text-[10px] text-white/45">{fmtCount(m.xp)} XP</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint href="/" cta="Join Free">
            New members will appear here.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function CommunityActivity({ items }: { items: LandingPayload["activities"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="⚡" title="Latest Community Activity" suffix="(Live feed)" href="/feed" />
        {items.length ? (
        <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.02]">
          {items.map((a, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-3 sm:px-4">
              {a.action === "shared" || a.who === "Anonymous" ? (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 text-base ring-1 ring-white/10">
                  {a.emoji}
                </div>
              ) : (
                <a href={publicProfilePath(a.who)} className="shrink-0" aria-label={a.who}>
                  <PillAvatar name={a.who} size={36} src={a.avatarUrl} />
                </a>
              )}
              <div className="min-w-0 flex-1 text-sm leading-snug text-white/85">
                {a.action === "shared" || a.who === "Anonymous" ? (
                  <span className="font-bold text-white">{a.who}</span>
                ) : (
                  <a href={publicProfilePath(a.who)} className="font-bold text-white hover:underline">{a.who}</a>
                )}{" "}
                <span className="text-white/65">{a.action}</span>{" "}
                <a href={a.href || "/feed"} className="font-semibold text-purple-200 hover:underline">{a.target}</a>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-white/45">{a.ago}</span>
            </li>
          ))}
        </ul>
        ) : (
          <EmptyHint href="/" cta="Join Free">
            Be one of the first members to join.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function CommunityBlog({ posts }: { posts: LandingPayload["blogPosts"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="📰" title="Community Blog" suffix="(Stories & guides)" href="/blog" />
        {posts.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {posts.map((b, i) => (
            <article key={b.href || i} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div className={`relative h-32 bg-gradient-to-br ${b.gradient}`}>
                <div className="absolute inset-0 grid place-items-center text-5xl opacity-90">{b.emoji}</div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-black leading-snug text-white">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-white/65">{b.excerpt}</p>
                <a href={b.href || "/blog"} className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-purple-200">
                  Read <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
        ) : (
          <EmptyHint href="/blog" cta="Visit the blog">
            New stories will appear here.
          </EmptyHint>
        )}
      </WelcomeCard>
    </section>
  );
}

function ExploreCta({ onSignup }: { onSignup?: () => void }) {
  return (
    <section data-seo-copy className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Start Exploring Yaarzo</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Open a <a href="/chatroom" className={seoLink}>chatroom</a>, scroll the{" "}
          <a href="/feed" className={seoLink}>feed</a>, or browse{" "}
          <a href="/communities" className={seoLink}>communities</a> and see who is around.
          Yaarzo is free to join, and you can start with a single conversation. When you are
          ready, create a profile, share a post, enter a competition, or publish a few lines
          of poetry. New friends are often one hello away.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSignup}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)" }}
          >
            Join Yaarzo free
          </button>
          <a
            href="/chatroom"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-white hover:bg-white/[0.08]"
          >
            Browse chatrooms
          </a>
        </div>
      </WelcomeCard>
    </section>
  );
}
