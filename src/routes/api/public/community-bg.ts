import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { AUTH_BG_DEFAULTS, AUTH_BG_SETTINGS_KEY, type AuthBackgroundConfig } from "@/lib/auth-bg-config";

/**
 * Public, read-only feed for the auth-screen background. Only exposes content
 * that's already public to anyone authenticated (lobby messages, public posts,
 * aggregate counts). No PII beyond username/avatar, no private channels.
 */
export const Route = createFileRoute("/api/public/community-bg")({
  server: {
    handlers: {
      GET: async () => {
        const { data: cfgRow } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", AUTH_BG_SETTINGS_KEY)
          .maybeSingle();
        const cfg: AuthBackgroundConfig = {
          ...AUTH_BG_DEFAULTS,
          ...((cfgRow?.value as Partial<AuthBackgroundConfig>) ?? {}),
        };

        if (!cfg.enabled) {
          return Response.json({ enabled: false });
        }

        const day = new Date();
        day.setUTCHours(0, 0, 0, 0);
        const since = new Date(Date.now() - 1000 * 60 * 10).toISOString(); // last 10 min "online"

        const [posts, messages, totalMembers, onlineMembers, postsToday, activeRooms] = await Promise.all([
          cfg.showFeed
            ? supabaseAdmin
                .from("posts")
                .select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, media_urls")
                .eq("privacy", "public")
                .order("created_at", { ascending: false })
                .limit(12)
            : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
          cfg.showChat
            ? supabaseAdmin
                .from("messages")
                .select("id, text, created_at, author_id, channel_id, kind")
                .eq("channel_id", "lobby")
                .eq("kind", "text")
                .order("created_at", { ascending: false })
                .limit(15)
            : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
          cfg.showStats
            ? supabaseAdmin.from("profiles").select("id", { count: "exact", head: true })
            : Promise.resolve({ count: 0 }),
          cfg.showStats
            ? supabaseAdmin
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .gte("last_seen", since)
            : Promise.resolve({ count: 0 }),
          cfg.showStats
            ? supabaseAdmin
                .from("posts")
                .select("id", { count: "exact", head: true })
                .eq("privacy", "public")
                .gte("created_at", day.toISOString())
            : Promise.resolve({ count: 0 }),
          cfg.showStats
            ? supabaseAdmin
                .from("room_loyalty")
                .select("channel_id", { count: "exact", head: true })
                .gte("updated_at", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString())
            : Promise.resolve({ count: 0 }),
        ]);

        const authorIds = new Set<string>();
        (posts.data ?? []).forEach((p) => {
          const r = p as { owner_id?: string | null; is_anonymous?: boolean };
          if (r.owner_id && !r.is_anonymous) authorIds.add(r.owner_id);
        });
        (messages.data ?? []).forEach((m) => {
          const r = m as { author_id?: string | null };
          if (r.author_id) authorIds.add(r.author_id);
        });

        const profileMap = new Map<string, { username: string; avatar_url: string | null; avatar_color: string | null }>();
        if (authorIds.size) {
          const { data: profs } = await supabaseAdmin
            .from("profiles")
            .select("id, username, avatar_url, avatar_color")
            .in("id", Array.from(authorIds));
          (profs ?? []).forEach((p) =>
            profileMap.set(p.id, {
              username: p.username ?? "user",
              avatar_url: p.avatar_url ?? null,
              avatar_color: p.avatar_color ?? null,
            }),
          );
        }

        type Author = { username: string; avatar_url: string | null; avatar_color: string | null; anonymous: boolean };
        const authorFor = (id: string | null | undefined, anon = false): Author => {
          if (anon || !id) return { username: "Anonymous", avatar_url: null, avatar_color: null, anonymous: true };
          const p = profileMap.get(id);
          return {
            username: p?.username ?? "user",
            avatar_url: p?.avatar_url ?? null,
            avatar_color: p?.avatar_color ?? null,
            anonymous: false,
          };
        };

        const postItems = (posts.data ?? []).map((p) => {
          const r = p as {
            id: string; text: string; created_at: string; owner_id: string | null;
            is_anonymous: boolean; reaction_count: number; comment_count: number; media_urls: string[] | null;
          };
          return {
            id: r.id,
            text: (r.text ?? "").slice(0, 240),
            created_at: r.created_at,
            reaction_count: r.reaction_count,
            comment_count: r.comment_count,
            has_media: Array.isArray(r.media_urls) && r.media_urls.length > 0,
            author: authorFor(r.owner_id, r.is_anonymous),
          };
        });

        const messageItems = (messages.data ?? []).reverse().map((m) => {
          const r = m as { id: string; text: string; created_at: string; author_id: string | null };
          return {
            id: r.id,
            text: (r.text ?? "").slice(0, 200),
            created_at: r.created_at,
            author: authorFor(r.author_id),
          };
        });

        return Response.json(
          {
            enabled: true,
            config: {
              blur: cfg.blur,
              showStats: cfg.showStats,
              showFeed: cfg.showFeed,
              showChat: cfg.showChat,
              headline: cfg.headline,
            },
            stats: {
              online: onlineMembers.count ?? 0,
              members: totalMembers.count ?? 0,
              postsToday: postsToday.count ?? 0,
              activeRooms: activeRooms.count ?? 0,
            },
            posts: postItems,
            messages: messageItems,
          },
          { headers: { "Cache-Control": "public, max-age=15" } },
        );
      },
    },
  },
});
