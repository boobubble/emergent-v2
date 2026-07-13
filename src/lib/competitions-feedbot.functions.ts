// Competitions Feed automation — reuses the existing FeedBot pipeline but
// operates on a dedicated CompetitionsBot persona so all competition events
// post under one recognisable identity.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { COMPETITION_CATEGORY_KEYS } from "@/lib/feedbot-format";

const BOT_USERNAME = "CompetitionsBot";
const BOT_BIO =
  "Live updates on competitions, winners, milestones, and leader changes across the platform.";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("is_admin", { _user_id: userId });
  if (!data) throw new Error("Forbidden");
}

export interface CompetitionsFeedSettings {
  enabled: boolean;
  competitions_bot_user_id: string | null;
  event_flags: Record<string, boolean>;
  target_chatrooms: string[];
}

export const getCompetitionsFeedSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("feedbot_settings")
      .select("enabled, competitions_bot_user_id, event_flags, target_chatrooms")
      .eq("id", true)
      .maybeSingle();
    const flags = (data?.event_flags ?? {}) as Record<string, boolean>;
    // Only expose competition-related flags
    const filtered: Record<string, boolean> = {};
    for (const k of COMPETITION_CATEGORY_KEYS) filtered[k] = flags[k] ?? false;
    return {
      enabled: !!data?.enabled,
      competitions_bot_user_id: (data?.competitions_bot_user_id as string | null) ?? null,
      event_flags: filtered,
      target_chatrooms: (data?.target_chatrooms as string[]) ?? [],
    } satisfies CompetitionsFeedSettings;
  });

const SaveInput = z.object({
  event_flags: z.record(z.string(), z.boolean()).optional(),
  target_chatrooms: z.array(z.string().uuid()).optional(),
});

export const saveCompetitionsFeedSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => SaveInput.parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Merge only competition flags into the master event_flags map so we don't
    // clobber unrelated toggles managed on the main FeedBot admin page.
    if (data.event_flags) {
      const { data: cur } = await supabaseAdmin
        .from("feedbot_settings")
        .select("event_flags")
        .eq("id", true)
        .maybeSingle();
      const merged = { ...((cur?.event_flags ?? {}) as Record<string, boolean>) };
      for (const k of COMPETITION_CATEGORY_KEYS) {
        if (k in data.event_flags) merged[k] = !!data.event_flags[k];
      }
      const { error } = await supabaseAdmin
        .from("feedbot_settings")
        .update({ event_flags: merged })
        .eq("id", true);
      if (error) throw new Error(error.message);
    }
    if (data.target_chatrooms) {
      const { error } = await supabaseAdmin
        .from("feedbot_settings")
        .update({ target_chatrooms: data.target_chatrooms })
        .eq("id", true);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const provisionCompetitionsBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings } = await supabaseAdmin
      .from("feedbot_settings")
      .select("competitions_bot_user_id")
      .eq("id", true)
      .maybeSingle();

    if (settings?.competitions_bot_user_id) {
      await supabaseAdmin
        .from("profiles")
        .update({
          is_bot: true,
          is_verified: true,
          username: BOT_USERNAME,
          bio: BOT_BIO,
        })
        .eq("id", settings.competitions_bot_user_id);
      return { ok: true, user_id: settings.competitions_bot_user_id, existed: true };
    }

    const email = `competitionsbot+${Date.now()}@boobubble.app`;
    const password =
      crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: BOT_USERNAME, gender: "other" },
    });
    if (cErr || !created?.user) {
      throw new Error(`Failed to provision CompetitionsBot: ${cErr?.message ?? "no user"}`);
    }
    const userId = created.user.id;
    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({ username: BOT_USERNAME, bio: BOT_BIO, is_bot: true, is_verified: true })
      .eq("id", userId);
    if (pErr) throw new Error(pErr.message);
    const { error: sErr } = await supabaseAdmin
      .from("feedbot_settings")
      .update({ competitions_bot_user_id: userId })
      .eq("id", true);
    if (sErr) throw new Error(sErr.message);
    return { ok: true, user_id: userId, existed: false };
  });

// Manual admin actions to broadcast Trending / Ending Soon events, which have
// no natural DB trigger source. Rate-limit via the built-in dedupe_key.
const AnnounceInput = z.object({
  competitionId: z.string().uuid(),
  kind: z.enum(["competition_trending", "competition_ending"]),
});

export const announceCompetitionEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => AnnounceInput.parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: comp } = await supabaseAdmin
      .from("competitions")
      .select("id, name, slug, banner_url, end_at")
      .eq("id", data.competitionId)
      .maybeSingle();
    if (!comp) throw new Error("Competition not found");
    const { data: settings } = await supabaseAdmin
      .from("feedbot_settings")
      .select("competitions_bot_user_id")
      .eq("id", true)
      .maybeSingle();

    const bucket = Math.floor(Date.now() / (1000 * 60 * 60)); // hourly dedupe
    const dedupe = `${data.kind}:${comp.id}:${bucket}`;
    const payload = { name: comp.name, slug: comp.slug, end_at: comp.end_at };
    const target = `/competitions/${comp.slug ?? comp.id}`;
    const { error } = await supabaseAdmin.rpc("feedbot_enqueue_persona", {
      _kind: data.kind,
      _category: data.kind,
      _actor: null,
      _payload: payload,
      _target_url: target,
      _image_url: comp.banner_url,
      _dedupe: dedupe,
      _persona: settings?.competitions_bot_user_id ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
