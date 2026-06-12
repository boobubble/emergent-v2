import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DAILY_MISSIONS } from "./economy-config";

/**
 * BooBubble Assistant — the single official AI-powered system account.
 *
 * Server functions here:
 *   - provision the one bot auth user (admin only)
 *   - read/save admin settings
 *   - read/save per-user assistant prefs (mute, disable promo)
 *   - trigger the welcome DM on first login
 *   - serve real feed recommendations (no fake content)
 *
 * Lovable AI Gateway is used ONLY to personalize the welcome message tone.
 * Templates are used everywhere else. If the LLM call fails the welcome
 * falls back to a static template — never blocking signup.
 */

const SETTINGS_KEY = "boobubble_assistant";

export interface EventAnnouncement {
  id: string;          // unique id — change to re-send
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  active: boolean;
}

export interface BoobubbleSettings {
  enabled: boolean;
  welcome_enabled: boolean;
  feed_recs_enabled: boolean;
  ai_personalize_welcome: boolean;
  mission_daily_dm_enabled: boolean;
  mission_weekly_dm_enabled: boolean;
  mission_min_completion_pct: number;
  mission_weekly_day: number;
  // Reward Assistant
  reward_daily_dm_enabled: boolean;
  reward_min_coins_threshold: number; // only DM if user gained >= this many coins today
  // Friend Assistant
  friend_suggestions_enabled: boolean;
  // Event Assistant
  event_announcement: EventAnnouncement | null;
  // Security Assistant
  security_dm_enabled: boolean;
  // Share & Earn
  share_earn_enabled: boolean;
  share_reward_coins: number;
  share_daily_limit: number;
  // Identity
  bot_user_id: string | null;
  bot_username: string;
  bot_avatar_url: string | null;
  bot_bio: string;
}

const DEFAULT_SETTINGS: BoobubbleSettings = {
  enabled: true,
  welcome_enabled: true,
  feed_recs_enabled: true,
  ai_personalize_welcome: true,
  mission_daily_dm_enabled: true,
  mission_weekly_dm_enabled: true,
  mission_min_completion_pct: 60,
  mission_weekly_day: 1,
  reward_daily_dm_enabled: true,
  reward_min_coins_threshold: 25,
  friend_suggestions_enabled: true,
  event_announcement: null,
  security_dm_enabled: true,
  share_earn_enabled: true,
  share_reward_coins: 2,
  share_daily_limit: 10,
  bot_user_id: null,
  bot_username: "BooBubble",
  bot_avatar_url: null,
  bot_bio: "Official BooBubble Assistant — here to help you discover content, complete missions and earn rewards. 💬✨",
};

async function readSettings(): Promise<BoobubbleSettings> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  const v = (data?.value as Partial<BoobubbleSettings> | null) || {};
  return { ...DEFAULT_SETTINGS, ...v };
}

async function writeSettings(patch: Partial<BoobubbleSettings>): Promise<BoobubbleSettings> {
  const next = { ...(await readSettings()), ...patch };
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: next }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return next;
}

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

function dmChannel(a: string, b: string) {
  return "dm:" + [a, b].sort().join(":");
}

// ---- Public-readable settings (safe subset) ----
export const getBoobubblePublic = createServerFn({ method: "GET" }).handler(async () => {
  const s = await readSettings();
  return {
    enabled: s.enabled,
    welcome_enabled: s.welcome_enabled,
    feed_recs_enabled: s.feed_recs_enabled,
    bot_user_id: s.bot_user_id,
    bot_username: s.bot_username,
    bot_avatar_url: s.bot_avatar_url,
    bot_bio: s.bot_bio,
  };
});

// ---- Admin: read full settings ----
export const getBoobubbleSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return readSettings();
  });

// ---- Admin: save settings ----
export const saveBoobubbleSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      enabled: z.boolean(),
      welcome_enabled: z.boolean(),
      feed_recs_enabled: z.boolean(),
      ai_personalize_welcome: z.boolean(),
      mission_daily_dm_enabled: z.boolean(),
      mission_weekly_dm_enabled: z.boolean(),
      mission_min_completion_pct: z.number().int().min(0).max(100),
      mission_weekly_day: z.number().int().min(0).max(6),
      bot_username: z.string().min(2).max(32),
      bot_avatar_url: z.string().url().nullable(),
      bot_bio: z.string().max(280),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const next = await writeSettings(data);
    // Sync the bot's profile if it exists
    if (next.bot_user_id) {
      await supabaseAdmin
        .from("profiles")
        .update({
          username: next.bot_username,
          avatar_url: next.bot_avatar_url,
          bio: next.bot_bio,
          is_official: true,
          is_bot: true,
        })
        .eq("id", next.bot_user_id);
    }
    return next;
  });

// ---- Admin: provision (create) the bot auth user once ----
export const provisionBoobubbleAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const current = await readSettings();
    if (current.bot_user_id) {
      // Idempotent — refresh profile flags
      await supabaseAdmin
        .from("profiles")
        .update({ is_official: true, is_bot: true, username: current.bot_username, bio: current.bot_bio })
        .eq("id", current.bot_user_id);
      return { ok: true, user_id: current.bot_user_id, existed: true };
    }

    // Use a real ICANN TLD — Supabase Auth rejects non-routable TLDs (.local, .system) with 500.
    const email = `boobubble-assistant+${Date.now()}@boobubble.app`;
    // Keep under bcrypt's 72-byte limit; two UUIDs plus a separator is 73 bytes and makes Auth return 500.
    const password =
      crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: current.bot_username, gender: "other" },
    });
    if (cErr || !created?.user) {
      console.error("[boobubble] createUser failed", { cErr, created });
      throw new Error(
        `Failed to create assistant user: ${cErr?.message ?? "no user returned"}`,
      );
    }
    const userId = created.user.id;

    // handle_new_user trigger already inserted profile. Mark it official+bot.
    await supabaseAdmin
      .from("profiles")
      .update({
        username: current.bot_username,
        bio: current.bot_bio,
        avatar_url: current.bot_avatar_url,
        is_official: true,
        is_bot: true,
      })
      .eq("id", userId);

    await writeSettings({ bot_user_id: userId });
    return { ok: true, user_id: userId, existed: false };
  });

// ---- User: read my prefs (auto-create row on first read) ----
export const getMyAssistantPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("assistant_user_prefs")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (data) return data;
    const { data: created } = await supabaseAdmin
      .from("assistant_user_prefs")
      .insert({ user_id: context.userId })
      .select("*")
      .single();
    return created!;
  });

// ---- User: update my prefs ----
export const saveMyAssistantPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      muted: z.boolean().optional(),
      disable_promo: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("assistant_user_prefs")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Welcome message text (Lovable AI optional, template fallback) ----
async function buildWelcomeMessage(username: string, personalize: boolean): Promise<string> {
  const template =
    `👋 Hey @${username}, welcome to the community!\n\n` +
    `I'm **BooBubble Assistant** — here to help you settle in. Try this to get started:\n\n` +
    `• Complete your profile\n` +
    `• Open the Feed and react to a post\n` +
    `• Join a Chatroom\n` +
    `• Find Friends\n` +
    `• Check today's Daily Missions for free coins & XP\n\n` +
    `Need anything? Just reply here — I'll keep an eye out. 💬`;

  if (!personalize) return template;

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return template;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "You are BooBubble Assistant, an upbeat, friendly community helper. " +
              "Write a SHORT welcome DM (under 90 words) for a new member. " +
              "Use a warm tone, 1 emoji max per line, no hashtags. " +
              "Mention these next steps as a bulleted list: Complete profile, Open Feed, Join Chatrooms, Find Friends, Daily Missions. " +
              "End by inviting them to reply here if they need help. Use markdown.",
          },
          { role: "user", content: `The new member's username is @${username}. Greet them by name.` },
        ],
      }),
    });
    if (!res.ok) return template;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const out = json.choices?.[0]?.message?.content?.trim();
    return out && out.length > 20 ? out : template;
  } catch {
    return template;
  }
}

// ---- Welcome trigger: idempotent, fires once per user ----
export const triggerWelcomeIfNeeded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const settings = await readSettings();
    if (!settings.enabled || !settings.welcome_enabled || !settings.bot_user_id) {
      return { sent: false, reason: "disabled" };
    }
    if (settings.bot_user_id === context.userId) return { sent: false, reason: "self" };

    // Check user prefs
    const { data: prefRow } = await supabaseAdmin
      .from("assistant_user_prefs")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (prefRow?.welcomed_at) return { sent: false, reason: "already" };
    if (prefRow?.muted) return { sent: false, reason: "muted" };

    // Get username
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", context.userId)
      .maybeSingle();
    const username = prof?.username ?? "friend";

    const text = await buildWelcomeMessage(username, settings.ai_personalize_welcome);
    const channelId = dmChannel(settings.bot_user_id, context.userId);

    const { error: msgErr } = await supabaseAdmin.from("messages").insert({
      channel_id: channelId,
      author_id: settings.bot_user_id,
      text,
      kind: "text",
    });
    if (msgErr) throw new Error(msgErr.message);

    // Also drop a notification so it surfaces in the bell
    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      actor_id: settings.bot_user_id,
      kind: "assistant_welcome",
      target_type: "dm",
      target_id: channelId,
      payload: { preview: "Welcome to the community!" },
    });

    // Mark welcomed
    await supabaseAdmin
      .from("assistant_user_prefs")
      .upsert(
        { user_id: context.userId, welcomed_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );

    return { sent: true };
  });

// ---- Feed recommendations (REAL content only) ----
export interface AssistantRecommendation {
  kind: "post" | "poll" | "confession";
  id: string;
  slug: string | null;
  title: string;
  author_username: string | null;
  author_avatar_url: string | null;
  thumbnail_url: string | null;
  score: number;
}

export const getAssistantFeedRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const settings = await readSettings();
    if (!settings.enabled || !settings.feed_recs_enabled) return { items: [] as AssistantRecommendation[] };

    // Honor user mute
    const { data: pref } = await supabaseAdmin
      .from("assistant_user_prefs")
      .select("muted")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (pref?.muted) return { items: [] as AssistantRecommendation[] };

    // Real trending posts (no anonymous, public privacy, non-bot author)
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select("id, slug, text, media_urls, owner_id, trending_score, reaction_count, comment_count, is_anonymous, privacy, kind")
      .eq("privacy", "public")
      .eq("is_anonymous", false)
      .neq("kind", "poll")
      .order("trending_score", { ascending: false })
      .limit(6);

    const ownerIds = Array.from(new Set((posts ?? []).map((p) => p.owner_id).filter(Boolean) as string[]));
    const profileMap = new Map<string, { username: string; avatar_url: string | null }>();
    if (ownerIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ownerIds);
      for (const p of profs ?? []) profileMap.set(p.id, { username: p.username, avatar_url: p.avatar_url });
    }

    const items: AssistantRecommendation[] = [];
    for (const p of posts ?? []) {
      const prof = p.owner_id ? profileMap.get(p.owner_id) : null;
      const media = Array.isArray(p.media_urls) ? (p.media_urls as string[]) : [];
      items.push({
        kind: "post",
        id: p.id,
        slug: p.slug ?? null,
        title: (p.text ?? "").slice(0, 120) || "(media post)",
        author_username: prof?.username ?? null,
        author_avatar_url: prof?.avatar_url ?? null,
        thumbnail_url: media[0] ?? null,
        score: Number(p.trending_score ?? 0),
      });
    }

    // Active polls (separately ranked)
    const { data: polls } = await supabaseAdmin
      .from("posts")
      .select("id, slug, text, owner_id, reaction_count, trending_score")
      .eq("kind", "poll")
      .eq("privacy", "public")
      .eq("is_anonymous", false)
      .order("trending_score", { ascending: false })
      .limit(3);
    for (const p of polls ?? []) {
      const prof = p.owner_id ? profileMap.get(p.owner_id) : null;
      items.push({
        kind: "poll",
        id: p.id,
        slug: p.slug ?? null,
        title: (p.text ?? "Poll").slice(0, 120),
        author_username: prof?.username ?? null,
        author_avatar_url: prof?.avatar_url ?? null,
        thumbnail_url: null,
        score: Number(p.trending_score ?? 0),
      });
    }

    // Confessions
    const { data: confs } = await supabaseAdmin
      .from("confessions")
      .select("id, text, like_count")
      .eq("status", "approved")
      .order("like_count", { ascending: false })
      .limit(3);
    for (const c of confs ?? []) {
      items.push({
        kind: "confession",
        id: c.id,
        slug: null,
        title: (c.text ?? "").slice(0, 120),
        author_username: null,
        author_avatar_url: null,
        thumbnail_url: null,
        score: Number(c.like_count ?? 0),
      });
    }

    items.sort((a, b) => b.score - a.score);
    return { items: items.slice(0, 8) };
  });

// ============================================================
// Mission Assistant — daily & weekly progress DMs (idempotent)
// ============================================================


function todayUtc(): string { return new Date().toISOString().slice(0, 10); }
function daysAgoUtc(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

interface DailyMissionRow { day: string; progress: Record<string, number>; claimed: string[] }

async function fetchMissionRows(userId: string, sinceDay: string): Promise<DailyMissionRow[]> {
  const { data } = await supabaseAdmin
    .from("daily_missions")
    .select("day, progress, claimed")
    .eq("user_id", userId)
    .gte("day", sinceDay)
    .order("day", { ascending: false });
  return (data ?? []).map((r) => ({
    day: r.day as string,
    progress: (r.progress as Record<string, number>) ?? {},
    claimed: (r.claimed as string[]) ?? [],
  }));
}

function summarizeDay(row: DailyMissionRow | undefined) {
  const total = DAILY_MISSIONS.length;
  let completed = 0;
  let claimed = 0;
  let coinsAvailable = 0;
  let coinsClaimed = 0;
  for (const m of DAILY_MISSIONS) {
    const p = row?.progress[m.id] ?? 0;
    const done = p >= m.target;
    const wasClaimed = row?.claimed.includes(m.id) ?? false;
    if (done) completed++;
    if (wasClaimed) { claimed++; coinsClaimed += m.coins; }
    else if (done) coinsAvailable += m.coins;
  }
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, claimed, pct, coinsAvailable, coinsClaimed };
}

function buildDailyMissionDM(username: string, s: ReturnType<typeof summarizeDay>, minPct: number, settings: BoobubbleSettings): string {
  const unclaimed = s.completed - s.claimed;
  const bot = settings.bot_username || "BooBubble";
  if (s.completed === 0) {
    return `👋 Hey @${username}, today's **Daily Missions** are wide open!\n\n` +
      `0/${s.total} completed so far. Knock out a couple to grab easy coins & XP. Tap the Missions panel on your feed to get started. 🎯\n\n— ${bot}`;
  }
  if (unclaimed > 0) {
    return `🎁 @${username}, you have **${unclaimed} mission reward${unclaimed===1?"":"s"} ready to claim** (+${s.coinsAvailable} coins waiting).\n\n` +
      `Progress today: ${s.completed}/${s.total} (${s.pct}%). Open the Missions panel and tap *Claim*. ✨\n\n— ${bot}`;
  }
  if (s.pct >= minPct) {
    return `🔥 Nice work @${username}! You've completed **${s.completed}/${s.total}** missions today (${s.pct}%) and banked **${s.coinsClaimed} coins**.\n\n` +
      `${s.completed < s.total ? `Push for ${s.total - s.completed} more to clear the board!` : `Full clear — legend behavior. 🏆`}\n\n— ${bot}`;
  }
  return `⏰ Quick nudge @${username} — only **${s.completed}/${s.total}** missions done today (${s.pct}%).\n\n` +
    `There's still time to clear them and earn coins & XP. Tap the Missions panel and crush a few. 💪\n\n— ${bot}`;
}

function buildWeeklyMissionDM(username: string, rows: DailyMissionRow[], settings: BoobubbleSettings): string {
  let totalCompleted = 0;
  let totalClaimed = 0;
  let totalCoins = 0;
  let activeDays = 0;
  for (const r of rows) {
    const s = summarizeDay(r);
    if (s.completed > 0) activeDays++;
    totalCompleted += s.completed;
    totalClaimed += s.claimed;
    totalCoins += s.coinsClaimed;
  }
  const bot = settings.bot_username || "BooBubble";
  return `📊 **Your week in missions, @${username}**\n\n` +
    `• Active days: **${activeDays}/7**\n` +
    `• Missions completed: **${totalCompleted}**\n` +
    `• Rewards claimed: **${totalClaimed}**\n` +
    `• Coins earned from missions: **${totalCoins}** 🪙\n\n` +
    `${activeDays >= 5 ? "Consistency is paying off — keep the streak alive! 🔥" : "Aim for 5+ active days this week to level up faster. 💫"}\n\n— ${bot}`;
}

async function sendAssistantDM(botId: string, userId: string, text: string, kind: string, preview: string) {
  const channelId = dmChannel(botId, userId);
  const { error: msgErr } = await supabaseAdmin.from("messages").insert({
    channel_id: channelId,
    author_id: botId,
    text,
    kind: "text",
  });
  if (msgErr) throw new Error(msgErr.message);
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    actor_id: botId,
    kind,
    target_type: "dm",
    target_id: channelId,
    payload: { preview },
  });
}

/**
 * Mission digest trigger.
 * Sends at most one daily DM per UTC day and one weekly DM per UTC week,
 * provided the configured weekly day has arrived. Idempotent — safe to call
 * on every app mount.
 */
export const triggerMissionDigestIfNeeded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const settings = await readSettings();
    if (!settings.enabled || !settings.bot_user_id) return { daily: false, weekly: false, reason: "disabled" as const };
    if (settings.bot_user_id === context.userId) return { daily: false, weekly: false, reason: "self" as const };

    const { data: pref } = await supabaseAdmin
      .from("assistant_user_prefs")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (pref?.muted) return { daily: false, weekly: false, reason: "muted" as const };
    if (pref?.disable_promo) return { daily: false, weekly: false, reason: "promo_off" as const };

    const today = todayUtc();
    const dailySentOn = (pref as { mission_daily_sent_on?: string | null } | null)?.mission_daily_sent_on ?? null;
    const weeklySentOn = (pref as { mission_weekly_sent_on?: string | null } | null)?.mission_weekly_sent_on ?? null;

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("id", context.userId)
      .maybeSingle();
    const username = prof?.username ?? "friend";

    let sentDaily = false;
    let sentWeekly = false;
    const updates: Record<string, string> = {};

    // ----- Daily -----
    if (settings.mission_daily_dm_enabled && dailySentOn !== today) {
      const rows = await fetchMissionRows(context.userId, today);
      const s = summarizeDay(rows[0]);
      const text = buildDailyMissionDM(username, s, settings.mission_min_completion_pct, settings);
      const preview = s.completed > s.claimed
        ? `${s.completed - s.claimed} mission reward(s) ready to claim`
        : `${s.completed}/${s.total} missions today`;
      await sendAssistantDM(settings.bot_user_id, context.userId, text, "assistant_mission_daily", preview);
      updates.mission_daily_sent_on = today;
      sentDaily = true;
    }

    // ----- Weekly -----
    const dow = new Date().getUTCDay();
    if (
      settings.mission_weekly_dm_enabled &&
      dow === settings.mission_weekly_day &&
      weeklySentOn !== today
    ) {
      const rows = await fetchMissionRows(context.userId, daysAgoUtc(6));
      const text = buildWeeklyMissionDM(username, rows, settings);
      await sendAssistantDM(
        settings.bot_user_id,
        context.userId,
        text,
        "assistant_mission_weekly",
        `Your week in missions (${WEEKDAYS[dow]})`,
      );
      updates.mission_weekly_sent_on = today;
      sentWeekly = true;
    }

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from("assistant_user_prefs")
        .upsert({ user_id: context.userId, ...updates }, { onConflict: "user_id" });
    }

    return { daily: sentDaily, weekly: sentWeekly };
  });

