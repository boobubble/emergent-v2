import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { LANDING_DEFAULTS, LANDING_SETTINGS_KEY, type LandingConfig } from "@/lib/landing-config";
import { fetchLiveLandingData } from "@/lib/landing-live.server";
import { publicLiveConfig } from "@/lib/landing-live";

const LIVE_CACHE = { "Cache-Control": "public, max-age=30" };

/**
 * Public landing-page payload.
 * Demo mode (`useDemoData`) is admin preview only and never hits community tables
 * beyond `app_settings`. Live mode returns real public data and empty collections
 * when none exist — it does not fall back to demo identities.
 */
export const Route = createFileRoute("/api/public/landing")({
  server: {
    handlers: {
      GET: async () => {
        const { data: settingRows } = await supabaseAdmin
          .from("app_settings")
          .select("key, value")
          .in("key", [LANDING_SETTINGS_KEY, "chat_channels"]);

        const cfgRow = (settingRows ?? []).find((row) => row.key === LANDING_SETTINGS_KEY);
        const channelSettings = (settingRows ?? []).find((row) => row.key === "chat_channels")?.value;

        const cfg: LandingConfig = {
          ...LANDING_DEFAULTS,
          ...((cfgRow?.value as Partial<LandingConfig>) ?? {}),
          demoStats: {
            ...LANDING_DEFAULTS.demoStats,
            ...(((cfgRow?.value as Partial<LandingConfig>)?.demoStats) ?? {}),
          },
        };

        if (cfg.useDemoData) {
          return Response.json(
            {
              config: cfg,
              source: "demo" as const,
              stats: { ...cfg.demoStats },
              chatrooms: cfg.demoChatrooms,
              topMembers: cfg.demoTopMembers,
              feedPost: cfg.demoFeedPost,
              poll: cfg.demoPoll,
              confession: cfg.demoConfession,
              trendingPosts: cfg.trendingPosts,
              discussions: cfg.discussions,
              featuredMembers: cfg.featuredMembers,
              recentConfessions: cfg.recentConfessions,
              blogPosts: cfg.blogPosts,
              activities: cfg.activities,
              newMembers: [],
            },
            { headers: LIVE_CACHE },
          );
        }

        const live = await fetchLiveLandingData(cfg, { channelSettings });
        return Response.json(
          {
            config: publicLiveConfig(cfg),
            source: "live" as const,
            ...live,
          },
          { headers: LIVE_CACHE },
        );
      },
    },
  },
});
