import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { LANDING_DEFAULTS, LANDING_SETTINGS_KEY, type LandingConfig } from "@/lib/landing-config";

/**
 * Public landing-page payload: live community stats, sample public posts,
 * a sample public poll, a sample approved confession, and top leaderboard
 * users. All sourced from already-public surfaces; no PII beyond username
 * + avatar. Existing app data is read-only.
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
        };

        const day = new Date();
        day.setUTCHours(0, 0, 0, 0);
        const onlineSince = new Date(Date.now() - 1000 * 60 * 10).toISOString();
        const last24h = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

        const [
          posts,
          messages,
          pollPost,
          confession,
          topUsers,
          totalMembers,
          onlineMembers,
          postsToday,
          activeRooms,
        ] = await Promise.all([
          supabaseAdmin
            .from("posts")
            .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, media_urls, kind")
            .eq("privacy", "public")
            .order("created_at", { ascending: false })
            .limit(6),
          supabaseAdmin
            .from("messages")
            .select("id, text, created_at, author_id")
            .eq("channel_id", "lobby")
            .eq("kind", "text")
            .order("created_at", { ascending: false })
            .limit(8),
          supabaseAdmin
            .from("posts")
            .select("id, text, poll, owner_id, is_anonymous, reaction_count")
            .eq("privacy", "public")
            .not("poll", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("confessions")
            .select("id, text, alias, avatar_emoji, like_count, reply_count, category")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("profiles")
            .select("id, username, avatar_url, avatar_color, level, xp, streak")
            .order("xp", { ascending: false })
            .limit(5),
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
          supabaseAdmin
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gte("last_seen", onlineSince),
          supabaseAdmin
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("privacy", "public")
            .gte("created_at", day.toISOString()),
          supabaseAdmin
            .from("room_loyalty")
            .select("channel_id", { count: "exact", head: true })
            .gte("updated_at", last24h),
        ]);

        const ids = new Set<string>();
        (posts.data ?? []).forEach((p) => {
          if (p.owner_id && !p.is_anonymous) ids.add(p.owner_id as string);
        });
        (messages.data ?? []).forEach((m) => {
          if (m.author_id) ids.add(m.author_id as string);
        });
        if (pollPost?.data?.owner_id && !pollPost.data.is_anonymous) {
          ids.add(pollPost.data.owner_id as string);
        }

        const profMap = new Map<string, { username: string; avatar_url: string | null; avatar_color: string | null }>();
        if (ids.size) {
          const { data: profs } = await supabaseAdmin
            .from("profiles")
            .select("id, username, avatar_url, avatar_color")
            .in("id", Array.from(ids));
          (profs ?? []).forEach((p) =>
            profMap.set(p.id, {
              username: p.username ?? "user",
              avatar_url: p.avatar_url ?? null,
              avatar_color: p.avatar_color ?? null,
            }),
          );
        }

        const authorFor = (id: string | null | undefined, anonymous = false) => {
          if (anonymous || !id) {
            return { username: "Anonymous", avatar_url: null, avatar_color: null, anonymous: true };
          }
          const p = profMap.get(id);
          return {
            username: p?.username ?? "user",
            avatar_url: p?.avatar_url ?? null,
            avatar_color: p?.avatar_color ?? null,
            anonymous: false,
          };
        };

        const postItems = (posts.data ?? []).map((p) => ({
          id: p.id as string,
          text: ((p.text as string) ?? "").slice(0, 240),
          kind: p.kind as string,
          reaction_count: p.reaction_count as number,
          comment_count: p.comment_count as number,
          has_media: Array.isArray(p.media_urls) && (p.media_urls as string[]).length > 0,
          author: authorFor(p.owner_id as string | null, p.is_anonymous as boolean),
        }));

        const messageItems = (messages.data ?? []).reverse().map((m) => ({
          id: m.id as string,
          text: ((m.text as string) ?? "").slice(0, 160),
          author: authorFor(m.author_id as string | null),
        }));

        type PollShape = { question?: string; options?: Array<{ label?: string; votes?: number }> };
        const pollPayload = (() => {
          const raw = pollPost?.data;
          if (!raw?.poll) return null;
          const p = raw.poll as PollShape;
          if (!p.question || !Array.isArray(p.options) || p.options.length < 2) return null;
          const opts = p.options.slice(0, 4).map((o) => ({
            label: (o.label ?? "Option").slice(0, 60),
            votes: typeof o.votes === "number" ? o.votes : 0,
          }));
          return {
            id: raw.id as string,
            question: p.question.slice(0, 160),
            options: opts,
            author: authorFor(raw.owner_id as string | null, raw.is_anonymous as boolean),
          };
        })();

        const confessionPayload = confession?.data
          ? {
              id: confession.data.id as string,
              text: ((confession.data.text as string) ?? "").slice(0, 220),
              alias: (confession.data.alias as string) || "Anonymous",
              avatar_emoji: (confession.data.avatar_emoji as string) || "🎭",
              like_count: confession.data.like_count as number,
              reply_count: confession.data.reply_count as number,
              category: confession.data.category as string,
            }
          : null;

        const leaderboard = (topUsers.data ?? []).map((u) => ({
          id: u.id as string,
          username: (u.username as string) ?? "user",
          avatar_url: u.avatar_url as string | null,
          avatar_color: u.avatar_color as string | null,
          level: u.level as number,
          xp: u.xp as number,
          streak: u.streak as number,
        }));

        return Response.json(
          {
            config: cfg,
            stats: {
              members: totalMembers.count ?? 0,
              online: onlineMembers.count ?? 0,
              postsToday: postsToday.count ?? 0,
              activeRooms: activeRooms.count ?? 0,
            },
            posts: postItems,
            messages: messageItems,
            poll: pollPayload,
            confession: confessionPayload,
            leaderboard,
          },
          { headers: { "Cache-Control": "public, max-age=30" } },
        );
      },
    },
  },
});
