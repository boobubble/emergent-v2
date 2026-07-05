import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

// Nightly AI-generated community summary. Runs once per day (21:00 IST via pg_cron).
// Aggregates 24h of activity counts and asks Lovable AI to produce a short
// highlight post, then posts it into each configured chatroom.
export const Route = createFileRoute("/api/public/hooks/feedbot-summary")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { data: settings } = await supabaseAdmin
            .from("feedbot_settings")
            .select("*")
            .eq("id", true)
            .maybeSingle();
          if (!settings?.enabled || !settings.daily_summary_enabled) {
            return Response.json({ ok: true, skipped: "disabled" });
          }
          if (!settings.bot_user_id) return Response.json({ ok: true, skipped: "not_provisioned" });
          const targets: string[] = (settings.target_chatrooms as string[]) ?? [];
          if (targets.length === 0) return Response.json({ ok: true, skipped: "no_targets" });

          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

          const [posts, members, votes, comps, live] = await Promise.all([
            supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("competition_votes").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("competitions").select("id", { count: "exact", head: true }).eq("status", "live"),
            supabaseAdmin
              .from("posts")
              .select("id, text, reaction_count")
              .gte("created_at", since)
              .order("reaction_count", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          const trendingText = (live.data as { text?: string } | null)?.text ?? "";

          const stats = {
            feed_posts: posts.count ?? 0,
            new_members: members.count ?? 0,
            competition_votes: votes.count ?? 0,
            live_competitions: comps.count ?? 0,
            trending: trendingText ? trendingText.slice(0, 120) : null,
          };

          let text =
            `📊 Today's Community Highlights\n\n` +
            `• ${stats.feed_posts} new feed posts\n` +
            `• ${stats.new_members} new members\n` +
            `• ${stats.competition_votes} competition votes\n` +
            `• ${stats.live_competitions} live competitions` +
            (stats.trending ? `\n• Top trending post: "${stats.trending}"` : "");

          const key = process.env.LOVABLE_API_KEY;
          if (key) {
            try {
              const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
                body: JSON.stringify({
                  model: "google/gemini-3-flash-preview",
                  messages: [
                    {
                      role: "system",
                      content:
                        "You are FeedBot, an upbeat community bot. Write a short (max 90 words) daily community highlight using the provided stats. Use bullet points and one emoji per line. Start with the exact heading '📊 Today's Community Highlights'. Do not invent numbers.",
                    },
                    { role: "user", content: JSON.stringify(stats) },
                  ],
                }),
              });
              if (r.ok) {
                const j: unknown = await r.json();
                const content = (j as { choices?: Array<{ message?: { content?: string } }> })
                  ?.choices?.[0]?.message?.content;
                if (typeof content === "string" && content.trim().length > 0) {
                  text = content.trim();
                }
              }
            } catch (e) {
              console.warn("[feedbot-summary] AI call failed, using template", e);
            }
          }

          const rows: Array<{ channel_id: string; author_id: string; text: string; kind: string; attachment: Json }> =
            targets.map((ch) => ({
              channel_id: ch,
              author_id: settings.bot_user_id!,
              text,
              kind: "text",
              attachment: null,
            }));
          const { error } = await supabaseAdmin.from("messages").insert(rows);
          if (error) throw new Error(error.message);

          return Response.json({ ok: true, posted: rows.length });
        } catch (e) {
          console.error("[feedbot-summary]", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
