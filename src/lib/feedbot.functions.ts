import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

const FEEDBOT_BOT_USERNAME = "FeedBot";
const FEEDBOT_BOT_BIO =
  "Keeping the community informed with live updates, competitions, achievements, and social activity.";

export interface FeedbotSettings {
  enabled: boolean;
  bot_user_id: string | null;
  event_flags: Record<string, boolean>;
  target_chatrooms: string[];
  min_interval_seconds: number;
  digest_mode: boolean;
  daily_summary_enabled: boolean;
  daily_summary_time: string;
}

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Forbidden");
}

export const getFeedbotSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("feedbot_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();
    return (data ?? null) as FeedbotSettings | null;
  });

const SaveInput = z.object({
  enabled: z.boolean().optional(),
  event_flags: z.record(z.string(), z.boolean()).optional(),
  target_chatrooms: z.array(z.string().uuid()).optional(),
  min_interval_seconds: z.number().int().min(30).max(3600).optional(),
  digest_mode: z.boolean().optional(),
  daily_summary_enabled: z.boolean().optional(),
  daily_summary_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const saveFeedbotSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((raw: unknown) => SaveInput.parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("feedbot_settings")
      .update(data)
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const provisionFeedbot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings } = await supabaseAdmin
      .from("feedbot_settings")
      .select("bot_user_id")
      .eq("id", true)
      .maybeSingle();

    if (settings?.bot_user_id) {
      await supabaseAdmin
        .from("profiles")
        .update({
          is_bot: true,
          is_verified: true,
          username: FEEDBOT_BOT_USERNAME,
          bio: FEEDBOT_BOT_BIO,
        })
        .eq("id", settings.bot_user_id);
      return { ok: true, user_id: settings.bot_user_id, existed: true };
    }

    const email = `feedbot+${Date.now()}@boobubble.app`;
    const password =
      crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: FEEDBOT_BOT_USERNAME, gender: "other" },
    });
    if (cErr || !created?.user) {
      console.error("[FeedBot] createUser failed", cErr);
      throw new Error(`Failed to provision FeedBot: ${cErr?.message ?? "no user returned"}`);
    }
    const userId = created.user.id;
    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({
        username: FEEDBOT_BOT_USERNAME,
        bio: FEEDBOT_BOT_BIO,
        is_bot: true,
        is_verified: true,
      })
      .eq("id", userId);
    if (pErr) {
      console.error("[FeedBot] profile update failed", pErr);
      throw new Error(`FeedBot profile update failed: ${pErr.message}`);
    }
    const { error: sErr } = await supabaseAdmin
      .from("feedbot_settings")
      .update({ bot_user_id: userId })
      .eq("id", true);
    if (sErr) {
      console.error("[FeedBot] settings update failed", sErr);
      throw new Error(`FeedBot settings update failed: ${sErr.message}`);
    }
    return { ok: true, user_id: userId, existed: false };
  });

export const sendTestAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s } = await supabaseAdmin
      .from("feedbot_settings")
      .select("bot_user_id, target_chatrooms")
      .eq("id", true)
      .maybeSingle();
    if (!s?.bot_user_id) throw new Error("Provision FeedBot first");
    const targets: string[] = (s.target_chatrooms as string[]) ?? [];
    if (targets.length === 0) throw new Error("Pick at least one target chatroom");
    const rows = targets.map((ch) => ({
      channel_id: ch,
      author_id: s.bot_user_id!,
      text: "📢 FeedBot test — announcements are wired up correctly.\n🔗 /feed",
      kind: "text",
    }));
    const { error } = await supabaseAdmin.from("messages").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, sent: rows.length };
  });

export const listChatroomsForFeedbot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("chatrooms")
      .select("id, name")
      .order("name", { ascending: true });
    return (data ?? []) as Array<{ id: string; name: string }>;
  });
