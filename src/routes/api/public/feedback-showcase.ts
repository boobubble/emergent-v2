import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { FEEDBACK_DEFAULTS, type FeedbackConfig } from "@/lib/feedback-config";

export const Route = createFileRoute("/api/public/feedback-showcase")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const surface = url.searchParams.get("surface") === "signup" ? "signup" : "home";

        const { data: cfgRow } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", "feedback")
          .maybeSingle();
        const cfg: FeedbackConfig = {
          ...FEEDBACK_DEFAULTS,
          ...((cfgRow?.value as Partial<FeedbackConfig>) ?? {}),
        };

        const enabled = surface === "signup" ? cfg.showcaseOnSignup : cfg.showcaseOnHome;
        if (!cfg.enabled || !enabled) {
          return Response.json({ enabled: false, title: cfg.showcaseTitle, items: [] });
        }

        const limit = Math.max(1, Math.min(24, cfg.showcaseLimit || 6));
        const { data: rows } = await supabaseAdmin
          .from("feedback_reports")
          .select("id, title, description, category, status, upvote_count, comment_count, is_anonymous, author_id, created_at")
          .eq("is_showcased", true)
          .order("is_pinned", { ascending: false })
          .order("upvote_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limit);

        const authorIds = Array.from(
          new Set((rows ?? []).filter((r) => !r.is_anonymous && r.author_id).map((r) => r.author_id as string)),
        );
        let profileMap = new Map<string, { username: string | null; avatar_url: string | null }>();
        if (authorIds.length) {
          const { data: profs } = await supabaseAdmin
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", authorIds);
          profileMap = new Map((profs ?? []).map((p) => [p.id, { username: p.username, avatar_url: p.avatar_url }]));
        }

        const items = (rows ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          status: r.status,
          upvote_count: r.upvote_count,
          comment_count: r.comment_count,
          created_at: r.created_at,
          author: r.is_anonymous || !r.author_id
            ? { username: "Anonymous", avatar_url: null, anonymous: true }
            : {
                username: profileMap.get(r.author_id)?.username ?? "User",
                avatar_url: profileMap.get(r.author_id)?.avatar_url ?? null,
                anonymous: false,
              },
        }));

        return Response.json(
          { enabled: true, title: cfg.showcaseTitle, items },
          { headers: { "Cache-Control": "public, max-age=30" } },
        );
      },
    },
  },
});
