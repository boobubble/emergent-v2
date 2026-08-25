import { lazy, Suspense, useEffect, useState } from "react";
import type { AuthPopup } from "@/components/auth/AuthScreen";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { WelcomeCard, SectionTitle } from "@/components/home/welcome-primitives";
import { LANDING_DEFAULTS, type LandingConfig } from "@/lib/landing-config";
import { resolveLandingView } from "@/lib/landing-live";
import type { LandingPayload } from "@/lib/landing-payload";

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
 * First paint uses LANDING_DEFAULTS SEO chrome with empty live collections so
 * crawlers never wait on fetch and never see demo identities in production.
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
  const view = resolveLandingView(cfg, data);

  return (
    <>
      <HomeSeoContent
        cfg={cfg}
        source={view.source}
        stats={view.stats}
        chatrooms={view.chatrooms}
        topMembers={view.topMembers}
        feedPost={view.feedPost}
        poll={view.poll}
        confession={view.confession}
        trendingPosts={view.trendingPosts}
        discussions={view.discussions}
        featuredMembers={view.featuredMembers}
        recentConfessions={view.recentConfessions}
        blogPosts={view.blogPosts}
        activities={view.activities}
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
