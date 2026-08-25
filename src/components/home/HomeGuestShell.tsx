import { lazy, Suspense, useEffect, useState } from "react";
import type { AuthPopup } from "@/components/auth/AuthScreen";
import { CmsFooterLinks } from "@/components/CmsFooterLinks";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { WelcomeCard, SectionTitle } from "@/components/home/welcome-primitives";
import { LANDING_DEFAULTS, type LandingConfig } from "@/lib/landing-config";
import type { LandingPayload, LandingStats } from "@/lib/landing-payload";

const MehfilTrendingWidget = lazy(() =>
  import("@/components/feed/MehfilTrendingWidget").then((m) => ({
    default: m.MehfilTrendingWidget,
  })),
);

const AuthDialogs = lazy(() =>
  import("@/components/auth/AuthScreen").then((m) => ({
    default: m.AuthDialogs,
  })),
);

function PoetryWidgetIsland() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <WelcomeCard className="p-5 sm:p-6">
        <SectionTitle icon="📜" title="Trending on Poetry Hub" suffix="(Poetry & battles)" href="/poetry" />
        <div className="mt-4">
          <Suspense fallback={null}>
            <MehfilTrendingWidget />
          </Suspense>
        </div>
      </WelcomeCard>
    </section>
  );
}

/**
 * Client shell around the SSR homepage: theme, live landing data, auth dialogs.
 * First paint still uses LANDING_DEFAULTS so crawlers never wait on fetch.
 */
export function HomeGuestShell() {
  const [data, setData] = useState<LandingPayload | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pollChoice, setPollChoice] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [authPopup, setAuthPopup] = useState<AuthPopup>(null);
  const [authMounted, setAuthMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("palrgo-welcome-theme") as "dark" | "light" | null;
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/public/landing");
        if (!res.ok) return;
        const json = (await res.json()) as LandingPayload;
        if (!cancel) setData(json);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const openAuth = (popup: AuthPopup) => {
    setAuthMounted(true);
    setAuthPopup(popup);
  };

  const cfg: LandingConfig = data?.config ?? LANDING_DEFAULTS;
  const stats: LandingStats = data?.stats ?? {
    members: cfg.demoStats.members,
    online: cfg.demoStats.online,
    activeRooms: cfg.demoStats.activeRooms,
    messagesSent: cfg.demoStats.messagesSent,
    feedPosts: cfg.demoStats.feedPosts,
    gamesPlayed: cfg.demoStats.gamesPlayed,
  };

  return (
    <>
      <HomeSeoContent
        cfg={cfg}
        stats={stats}
        chatrooms={data?.chatrooms ?? cfg.demoChatrooms}
        topMembers={data?.topMembers ?? cfg.demoTopMembers}
        feedPost={data?.feedPost ?? cfg.demoFeedPost}
        poll={data?.poll ?? cfg.demoPoll}
        confession={data?.confession ?? cfg.demoConfession}
        trendingPosts={data?.trendingPosts ?? cfg.trendingPosts}
        discussions={data?.discussions ?? cfg.discussions}
        featuredMembers={data?.featuredMembers ?? cfg.featuredMembers}
        recentConfessions={data?.recentConfessions ?? cfg.recentConfessions}
        blogPosts={data?.blogPosts ?? cfg.blogPosts}
        theme={theme}
        menuOpen={menuOpen}
        pollChoice={pollChoice}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onToggleTheme={() => {
          setTheme((t) => {
            const next = t === "dark" ? "light" : "dark";
            try {
              localStorage.setItem("palrgo-welcome-theme", next);
            } catch {
              /* ignore */
            }
            return next;
          });
        }}
        onLogin={() => openAuth("signin")}
        onSignup={() => openAuth("signup")}
        onPollChoice={setPollChoice}
        footerExtra={<CmsFooterLinks />}
        poetryExtra={<PoetryWidgetIsland />}
      />
      {authMounted && (
        <Suspense fallback={null}>
          <AuthDialogs popup={authPopup} setPopup={setAuthPopup} />
        </Suspense>
      )}
    </>
  );
}
