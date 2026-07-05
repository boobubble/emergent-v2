import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { formatFeedbotEvent, type FeedbotEvent } from "@/lib/feedbot-format";
import { requireFeedbotHookAuth } from "@/lib/feedbot-auth.server";

// FeedBot dispatcher — called every minute by pg_cron.
// Drains pending feedbot_events, fans them out to configured chatrooms with
// per-(chatroom, category) cooldown, and marks events dispatched.
export const Route = createFileRoute("/api/public/hooks/feedbot-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireFeedbotHookAuth(request);
        if (denied) return denied;
        try {
          const { data: settings } = await supabaseAdmin
            .from("feedbot_settings")
            .select("*")
            .eq("id", true)
            .maybeSingle();
          if (!settings?.enabled) return Response.json({ ok: true, skipped: "disabled" });
          if (!settings.bot_user_id) return Response.json({ ok: true, skipped: "not_provisioned" });
          const targets: string[] = (settings.target_chatrooms as string[]) ?? [];
          if (targets.length === 0) return Response.json({ ok: true, skipped: "no_targets" });

          const flags = (settings.event_flags ?? {}) as Record<string, boolean>;
          const cooldownSec = Number(settings.min_interval_seconds ?? 300);

          const { data: events } = await supabaseAdmin
            .from("feedbot_events")
            .select("*")
            .is("dispatched_at", null)
            .order("created_at", { ascending: true })
            .limit(50);

          if (!events || events.length === 0) return Response.json({ ok: true, drained: 0 });

          const cutoff = new Date(Date.now() - cooldownSec * 1000).toISOString();
          const { data: recent } = await supabaseAdmin
            .from("feedbot_dispatch_log")
            .select("chatroom_id, category, last_dispatched_at")
            .gte("last_dispatched_at", cutoff);
          const recentSet = new Set(
            (recent ?? []).map((r) => `${r.chatroom_id}::${r.category}`),
          );

          let posted = 0;
          const dispatchedIds: string[] = [];

          for (const raw of events) {
            const ev = raw as unknown as FeedbotEvent;
            if (flags[ev.category] === false) {
              dispatchedIds.push(ev.id);
              continue;
            }
            const { text, attachmentUrl } = formatFeedbotEvent(ev);
            const rows: Array<{
              channel_id: string;
              author_id: string;
              text: string;
              kind: string;
              attachment: Json;
            }> = [];
            for (const chatroomId of targets) {
              const key = `${chatroomId}::${ev.category}`;
              if (recentSet.has(key)) continue;
              rows.push({
                channel_id: chatroomId,
                author_id: settings.bot_user_id,
                text,
                kind: "text",
                attachment: attachmentUrl
                  ? {
                      kind: "image",
                      name: "preview",
                      mime: "image/png",
                      size: 0,
                      dataUrl: attachmentUrl,
                    }
                  : null,
              });
              recentSet.add(key);
            }
            if (rows.length > 0) {
              const { error: mErr } = await supabaseAdmin.from("messages").insert(rows);
              if (!mErr) {
                posted += rows.length;
                await supabaseAdmin
                  .from("feedbot_dispatch_log")
                  .upsert(
                    rows.map((r) => ({
                      chatroom_id: r.channel_id,
                      category: ev.category,
                      last_dispatched_at: new Date().toISOString(),
                    })),
                    { onConflict: "chatroom_id,category" },
                  );
              }
            }
            dispatchedIds.push(ev.id);
          }

          if (dispatchedIds.length > 0) {
            await supabaseAdmin
              .from("feedbot_events")
              .update({ dispatched_at: new Date().toISOString() })
              .in("id", dispatchedIds);
          }

          return Response.json({ ok: true, drained: dispatchedIds.length, posted });
        } catch (e) {
          console.error("[feedbot-dispatch]", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
