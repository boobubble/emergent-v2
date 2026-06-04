import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { LANDING_DEFAULTS, LANDING_SETTINGS_KEY, type LandingConfig } from "@/lib/landing-config";

/**
 * Public landing-page payload. When `useDemoData` is enabled in the admin
 * homepage settings the response is fully composed from the config (no PII,
 * no DB reads beyond the settings row). When disabled it merges live public
 * data from chatrooms / feed / confessions / leaderboard, falling back to
 * the demo config whenever a real value is empty.
 */
export const Route = createFileRoute("/api/public/landing")({
  server: {
    handlers: {
      GET: async () => {
        const { data: cfgRow } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", LANDING_SETTINGS_KEY)
          .maybeSingle();

        const cfg: LandingConfig = {
          ...LANDING_DEFAULTS,
          ...((cfgRow?.value as Partial<LandingConfig>) ?? {}),
          demoStats: {
            ...LANDING_DEFAULTS.demoStats,
            ...(((cfgRow?.value as Partial<LandingConfig>)?.demoStats) ?? {}),
          },
        };

        // ── DEMO MODE ────────────────────────────────────────────────
        if (cfg.useDemoData) {
          return Response.json(
            {
              config: cfg,
              source: "demo" as const,
              stats: {
                members:      cfg.demoStats.members,
                online:       cfg.demoStats.online,
                activeRooms:  cfg.demoStats.activeRooms,
                messagesSent: cfg.demoStats.messagesSent,
                feedPosts:    cfg.demoStats.feedPosts,
                gamesPlayed:  cfg.demoStats.gamesPlayed,
              },
              chatrooms:  cfg.demoChatrooms,
              topMembers: cfg.demoTopMembers,
              feedPost:   cfg.demoFeedPost,
              poll:       cfg.demoPoll,
              confession: cfg.demoConfession,
              trendingPosts:     cfg.trendingPosts,
              discussions:       cfg.discussions,
              featuredMembers:   cfg.featuredMembers,
              recentConfessions: cfg.recentConfessions,
              blogPosts:         cfg.blogPosts,
              activities:        cfg.activities,
            },
            { headers: { "Cache-Control": "public, max-age=30" } },
          );
        }


        // ── LIVE MODE ────────────────────────────────────────────────
        const day = new Date(); day.setUTCHours(0, 0, 0, 0);
        const onlineSince = new Date(Date.now() - 1000 * 60 * 10).toISOString();
        const last24h = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

        const [
          totalMembers, onlineMembers, postsToday, activeRooms, totalPosts,
          topRooms, topUsers, latestPost, latestPoll, latestConfession,
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", onlineSince),
          supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public").gte("created_at", day.toISOString()),
          supabaseAdmin.from("room_loyalty").select("channel_id", { count: "exact", head: true }).gte("updated_at", last24h),
          supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public"),
          supabaseAdmin.from("room_loyalty").select("channel_id").gte("updated_at", last24h).limit(50),
          supabaseAdmin.from("profiles").select("id, username, xp").order("xp", { ascending: false }).limit(3),
          supabaseAdmin.from("posts").select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count")
            .eq("privacy", "public").order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabaseAdmin.from("posts").select("id, text, poll, created_at")
            .eq("privacy", "public").not("poll", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabaseAdmin.from("confessions").select("id, text, alias, avatar_emoji, created_at")
            .eq("status", "approved").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

        const ago = (iso: string | null) => {
          if (!iso) return "just now";
          const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
          if (m < 60)  return `${m} min ago`;
          if (m < 1440) return `${Math.round(m / 60)} hours ago`;
          return `${Math.round(m / 1440)} days ago`;
        };

        // Live chatrooms aggregated from room_loyalty channel activity.
        const roomCounts = new Map<string, number>();
        (topRooms.data ?? []).forEach((r) => {
          const k = r.channel_id as string;
          roomCounts.set(k, (roomCounts.get(k) ?? 0) + 1);
        });
        const liveChatrooms = Array.from(roomCounts.entries())
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, online]) => ({ emoji: "💬", name: `#${name}`, online, topic: "Active now" }));

        const liveTopMembers = (topUsers.data ?? []).map((u) => ({
          username: (u.username as string) ?? "user",
          xp: (u.xp as number) ?? 0,
        }));

        let feedPost = cfg.demoFeedPost;
        if (latestPost?.data) {
          const r = latestPost.data;
          let username = "Anonymous";
          if (!r.is_anonymous && r.owner_id) {
            const { data: p } = await supabaseAdmin.from("profiles").select("username").eq("id", r.owner_id).maybeSingle();
            username = (p?.username as string) ?? "user";
          }
          feedPost = {
            username,
            ago: ago(r.created_at as string),
            text: ((r.text as string) ?? "").slice(0, 220),
            likes: (r.reaction_count as number) ?? 0,
            comments: (r.comment_count as number) ?? 0,
            coins: 0,
          };
        }

        let poll = cfg.demoPoll;
        if (latestPoll?.data?.poll) {
          const p = latestPoll.data.poll as { question?: string; options?: Array<{ label?: string; votes?: number }> };
          if (p.question && Array.isArray(p.options) && p.options.length >= 2) {
            poll = {
              question: p.question.slice(0, 160),
              ago: ago(latestPoll.data.created_at as string),
              options: p.options.slice(0, 4).map((o) => ({
                label: (o.label ?? "Option").slice(0, 60),
                votes: typeof o.votes === "number" ? o.votes : 0,
              })),
              daysLeft: 0,
            };
          }
        }

        const confession = latestConfession?.data
          ? {
              alias: (latestConfession.data.alias as string) || "Anonymous",
              ago: ago(latestConfession.data.created_at as string),
              text: ((latestConfession.data.text as string) ?? "").slice(0, 220),
              emoji: (latestConfession.data.avatar_emoji as string) || "🎭",
            }
          : cfg.demoConfession;

        return Response.json(
          {
            config: cfg,
            source: "live" as const,
            stats: {
              members:      totalMembers.count  ?? cfg.demoStats.members,
              online:       onlineMembers.count ?? cfg.demoStats.online,
              activeRooms:  activeRooms.count   ?? cfg.demoStats.activeRooms,
              messagesSent: cfg.demoStats.messagesSent,
              feedPosts:    totalPosts.count    ?? cfg.demoStats.feedPosts,
              gamesPlayed:  cfg.demoStats.gamesPlayed,
            },
            chatrooms:  liveChatrooms.length  ? liveChatrooms  : cfg.demoChatrooms,
            topMembers: liveTopMembers.length ? liveTopMembers : cfg.demoTopMembers,
            feedPost,
            poll,
            confession,
          },
          { headers: { "Cache-Control": "public, max-age=30" } },
        );
      },
    },
  },
});
