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

        // ── Per-section live fetches (only when admin opted in) ──
        let trendingPosts = cfg.trendingPosts;
        if (cfg.trendingPostsUseLive) {
          const { data } = await supabaseAdmin
            .from("posts")
            .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, hashtags")
            .eq("privacy", "public").order("reaction_count", { ascending: false }).limit(6);
          if (data && data.length) {
            const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean) as string[]));
            const profMap = new Map<string, string>();
            if (ownerIds.length) {
              const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
              (profs ?? []).forEach((p) => profMap.set(p.id as string, (p.username as string) ?? "user"));
            }
            trendingPosts = data.map((r) => ({
              user: r.is_anonymous ? "Anonymous" : (profMap.get(r.owner_id as string) ?? "user"),
              ago: ago(r.created_at as string),
              text: ((r.text as string) ?? "").slice(0, 220),
              likes: (r.reaction_count as number) ?? 0,
              comments: (r.comment_count as number) ?? 0,
              tag: Array.isArray(r.hashtags) && r.hashtags[0] ? `#${r.hashtags[0]}` : "#trending",
            }));
          }
        }

        let discussions = cfg.discussions;
        if (cfg.discussionsUseLive) {
          const { data } = await supabaseAdmin
            .from("posts")
            .select("id, text, created_at, owner_id, is_anonymous, comment_count, updated_at")
            .eq("privacy", "public").order("comment_count", { ascending: false }).limit(5);
          if (data && data.length) {
            const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean) as string[]));
            const profMap = new Map<string, string>();
            if (ownerIds.length) {
              const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
              (profs ?? []).forEach((p) => profMap.set(p.id as string, (p.username as string) ?? "user"));
            }
            discussions = data.map((r, i) => ({
              topic: ((r.text as string) ?? "Discussion").slice(0, 110),
              room: "Community",
              author: r.is_anonymous ? "Anonymous" : (profMap.get(r.owner_id as string) ?? "user"),
              replies: (r.comment_count as number) ?? 0,
              last: ago((r.updated_at as string) ?? (r.created_at as string)),
              hot: i < 2,
            }));
          }
        }

        let featuredMembers = cfg.featuredMembers;
        if (cfg.featuredMembersUseLive) {
          const { data } = await supabaseAdmin
            .from("profiles").select("username, xp, level, streak")
            .order("xp", { ascending: false }).limit(4);
          if (data && data.length) {
            const grads = [
              "from-purple-500/30 to-pink-500/20",
              "from-blue-500/30 to-cyan-500/20",
              "from-amber-500/30 to-orange-500/20",
              "from-emerald-500/30 to-teal-500/20",
            ];
            featuredMembers = data.map((u, i) => ({
              name: (u.username as string) ?? "user",
              role: i === 0 ? "Top Creator" : i === 1 ? "Rising Star" : i === 2 ? "Streak Master" : "Active Member",
              xp: (u.xp as number) ?? 0,
              badges: "👑 🔥 🏆",
              gradient: grads[i % grads.length],
            }));
          }
        }

        let recentConfessions = cfg.recentConfessions;
        if (cfg.recentConfessionsUseLive) {
          const { data } = await supabaseAdmin
            .from("confessions").select("alias, avatar_emoji, text, created_at, like_count")
            .eq("status", "approved").order("created_at", { ascending: false }).limit(6);
          if (data && data.length) {
            recentConfessions = data.map((c) => ({
              alias: (c.alias as string) || "Anonymous",
              emoji: (c.avatar_emoji as string) || "🎭",
              ago: ago(c.created_at as string),
              text: ((c.text as string) ?? "").slice(0, 200),
              reacts: (c.like_count as number) ?? 0,
            }));
          }
        }

        let blogPosts = cfg.blogPosts;
        if (cfg.blogPostsUseLive) {
          const { data } = await supabaseAdmin
            .from("custom_pages")
            .select("slug, title, excerpt, category, published_at, og_image")
            .eq("status", "published").order("published_at", { ascending: false, nullsFirst: false }).limit(3);
          if (data && data.length) {
            const grads = ["from-purple-600/40 to-blue-600/30", "from-pink-600/40 to-amber-600/30", "from-emerald-600/40 to-teal-600/30"];
            const emojis = ["📰", "✨", "🚀"];
            blogPosts = data.map((p, i) => ({
              title: (p.title as string) ?? "Untitled",
              excerpt: ((p.excerpt as string) ?? "").slice(0, 180),
              tag: ((p.category as string) ?? "Post"),
              read: "5 min read",
              author: "Editorial",
              date: p.published_at ? new Date(p.published_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
              emoji: emojis[i % emojis.length],
              gradient: grads[i % grads.length],
              href: `/${(p.slug as string) ?? ""}`,
            }));
          }
        }

        let activities = cfg.activities;
        if (cfg.activitiesUseLive) {
          const [{ data: newProfiles }, { data: newPosts }, { data: newConf }] = await Promise.all([
            supabaseAdmin.from("profiles").select("username, created_at").order("created_at", { ascending: false }).limit(4),
            supabaseAdmin.from("posts").select("text, created_at, owner_id, is_anonymous").eq("privacy", "public").order("created_at", { ascending: false }).limit(3),
            supabaseAdmin.from("confessions").select("alias, created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(2),
          ]);
          const live: typeof cfg.activities = [];
          const ownerIds = Array.from(new Set((newPosts ?? []).map((p) => p.owner_id).filter(Boolean) as string[]));
          const profMap = new Map<string, string>();
          if (ownerIds.length) {
            const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
            (profs ?? []).forEach((p) => profMap.set(p.id as string, (p.username as string) ?? "user"));
          }
          (newProfiles ?? []).forEach((p) => live.push({
            who: (p.username as string) ?? "Someone", action: "joined", target: "the community", ago: ago(p.created_at as string),
            emoji: "👋", tint: "from-blue-500/30 to-cyan-500/20", accent: "text-cyan-200", href: "/",
          }));
          (newPosts ?? []).forEach((p) => live.push({
            who: p.is_anonymous ? "Anonymous" : (profMap.get(p.owner_id as string) ?? "user"),
            action: "posted", target: ((p.text as string) ?? "a new update").slice(0, 40),
            ago: ago(p.created_at as string), emoji: "📝",
            tint: "from-purple-500/30 to-pink-500/20", accent: "text-pink-200", href: "/feed",
          }));
          (newConf ?? []).forEach((c) => live.push({
            who: (c.alias as string) || "Anon", action: "shared", target: "a confession", ago: ago(c.created_at as string),
            emoji: "🤫", tint: "from-rose-500/30 to-fuchsia-500/20", accent: "text-rose-200", href: "/confessions",
          }));
          if (live.length) activities = live.slice(0, 8);
        }

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
            trendingPosts,
            discussions,
            featuredMembers,
            recentConfessions,
            blogPosts,
            activities,
          },
          { headers: { "Cache-Control": "public, max-age=30" } },
        );

      },
    },
  },
});
