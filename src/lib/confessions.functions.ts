import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CONFESSIONS_DEFAULTS,
  expiryToTimestamp,
  pickRandomAvatar,
  randomConfessorNumber,
  type ConfessionsConfig,
  type ConfessionDisplayMode,
} from "@/lib/confessions-config";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function getConfig(): Promise<ConfessionsConfig> {
  const { data } = await (await getSupabaseAdmin())
    .from("app_settings")
    .select("value")
    .eq("key", "confessions")
    .maybeSingle();
  return { ...CONFESSIONS_DEFAULTS, ...((data?.value as Partial<ConfessionsConfig>) ?? {}) };
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await (await getSupabaseAdmin())
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  return Boolean(data && data.length > 0);
}

// Sanitize an outbound confession row according to display mode.
function maskAuthor<T extends { author_id: string | null; display_mode: ConfessionDisplayMode; alias: string | null; avatar_emoji: string | null; id: string }>(
  row: T,
  viewerIsAuthor: boolean,
  viewerIsAdmin: boolean,
) {
  const reveal = viewerIsAuthor || viewerIsAdmin;
  if (reveal) return row;
  if (row.display_mode === "username") return row;
  // Hide author_id for anonymous modes
  return { ...row, author_id: null };
}

// ============== LIST ==============
export const listConfessions = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      category: z.string().optional(),
      sort: z.enum(["recent", "trending", "most_liked", "most_replied"]).default("recent"),
      limit: z.number().min(1).max(100).default(30),
    }).parse(d ?? {}),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const viewerId = context.userId;
    const admin = await isAdmin(viewerId);

    const sb = await getSupabaseAdmin();
    let q = sb
      .from("confessions")
      .select("*")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .limit(data.limit);

    if (!admin) q = q.eq("status", "approved");
    if (data.category && data.category !== "all") q = q.eq("category", data.category);

    if (data.sort === "trending") {
      q = q.order("is_pinned", { ascending: false }).order("like_count", { ascending: false }).order("created_at", { ascending: false });
    } else if (data.sort === "most_liked") {
      q = q.order("like_count", { ascending: false });
    } else if (data.sort === "most_replied") {
      q = q.order("reply_count", { ascending: false });
    } else {
      q = q.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // attach viewer's reactions
    const ids = (rows ?? []).map((r) => r.id);
    let myReactions: Record<string, string[]> = {};
    if (ids.length) {
      const { data: rx } = await (await getSupabaseAdmin())
        .from("confession_reactions")
        .select("confession_id, type")
        .eq("user_id", viewerId)
        .in("confession_id", ids);
      for (const r of rx ?? []) {
        (myReactions[r.confession_id] ||= []).push(r.type as string);
      }
    }

    return (rows ?? []).map((r) => ({
      ...maskAuthor(r as any, r.author_id === viewerId, admin),
      myReactions: myReactions[r.id] ?? [],
    }));
  });

// ============== CREATE ==============
export const createConfession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      kind: z.enum(["text", "poll", "image", "question", "advice"]).default("text"),
      category: z.string().min(1).max(64),
      text: z.string().max(4000).default(""),
      image_url: z.string().url().optional(),
      poll: z.object({
        question: z.string().min(1).max(280),
        options: z.array(z.string().min(1).max(120)).min(2).max(6),
      }).optional(),
      display_mode: z.enum(["fully_anonymous", "random_id", "random_avatar", "username"]),
      expiry: z.enum(["never", "24h", "7d", "30d"]).optional(),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const cfg = await getConfig();
    if (!cfg.enabled) throw new Error("Confessions module is disabled.");
    if (!cfg.kinds[data.kind]) throw new Error(`Kind "${data.kind}" is disabled.`);
    if (!cfg.anonymousModes[data.display_mode]) throw new Error("That identity mode is disabled.");

    // Level gating
    if (cfg.level.enabled) {
      const { data: prof } = await (await getSupabaseAdmin())
        .from("profiles")
        .select("level")
        .eq("id", context.userId)
        .maybeSingle();
      const lvl = prof?.level ?? 1;
      if (lvl < cfg.level.minLevelToPost) throw new Error(`Reach level ${cfg.level.minLevelToPost} to post a confession.`);
      if (data.kind === "image" && lvl < cfg.level.minLevelForImages) {
        throw new Error(`Reach level ${cfg.level.minLevelForImages} to post images.`);
      }
    }

    // Identity
    let alias: string | null = null;
    let avatar_emoji: string | null = null;
    if (data.display_mode === "fully_anonymous") {
      alias = "Anonymous";
    } else if (data.display_mode === "random_id") {
      alias = `Confessor #${randomConfessorNumber(context.userId + Date.now())}`;
    } else if (data.display_mode === "random_avatar") {
      const seed = context.userId + Date.now();
      avatar_emoji = pickRandomAvatar(seed);
      alias = `${avatar_emoji} ${pickAnimalName(avatar_emoji)} #${randomConfessorNumber(seed) % 99}`;
    } else {
      const { data: prof } = await (await getSupabaseAdmin())
        .from("profiles").select("username").eq("id", context.userId).maybeSingle();
      alias = prof?.username ?? "user";
    }

    const expiry = data.expiry ?? cfg.expiry.defaultMode;
    const status = cfg.moderation.approvalRequired ? "pending" : "approved";

    const { data: row, error } = await (await getSupabaseAdmin())
      .from("confessions")
      .insert({
        author_id: context.userId,
        display_mode: data.display_mode,
        alias,
        avatar_emoji,
        category: data.category,
        kind: data.kind,
        text: data.text,
        image_url: data.image_url ?? null,
        poll: data.poll ?? null,
        status,
        expires_at: expiryToTimestamp(expiry),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

function pickAnimalName(emoji: string): string {
  const map: Record<string, string> = {
    "🐼": "Panda", "🦊": "Fox", "🐯": "Tiger", "🦁": "Lion",
    "🐸": "Frog", "🐵": "Monkey", "🐨": "Koala", "🐰": "Rabbit",
    "🐻": "Bear", "🦝": "Raccoon", "🦄": "Unicorn", "🐲": "Dragon",
    "🐧": "Penguin", "🦉": "Owl", "🐙": "Octopus", "🦋": "Butterfly",
  };
  return map[emoji] ?? "Friend";
}

// ============== REACT ==============
export const toggleReaction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      confessionId: z.string().uuid(),
      type: z.enum(["like", "funny", "shock", "sad", "hot", "love"]),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: existing } = await (await getSupabaseAdmin())
      .from("confession_reactions")
      .select("id")
      .eq("confession_id", data.confessionId)
      .eq("user_id", context.userId)
      .eq("type", data.type)
      .maybeSingle();
    if (existing) {
      await (await getSupabaseAdmin()).from("confession_reactions").delete().eq("id", existing.id);
      return { active: false };
    }
    const { error } = await (await getSupabaseAdmin())
      .from("confession_reactions")
      .insert({ confession_id: data.confessionId, user_id: context.userId, type: data.type });
    if (error) throw new Error(error.message);
    return { active: true };
  });

// ============== REPLIES ==============
export const listReplies = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ confessionId: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await isAdmin(context.userId);
    const { data: rows, error } = await (await getSupabaseAdmin())
      .from("confession_replies")
      .select("*")
      .eq("confession_id", data.confessionId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const reveal = admin || r.author_id === context.userId || !r.is_anonymous;
      return reveal ? r : { ...r, author_id: null };
    });
  });

export const createReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      confessionId: z.string().uuid(),
      text: z.string().min(1).max(1500),
      anonymous: z.boolean().default(true),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const cfg = await getConfig();
    if (!cfg.enabled || !cfg.allowReplies) throw new Error("Replies are disabled.");
    if (data.anonymous && !cfg.allowAnonymousReplies) throw new Error("Anonymous replies are disabled.");

    let alias: string | null = null;
    let avatar_emoji: string | null = null;
    if (data.anonymous) {
      const seed = context.userId + ":" + data.confessionId;
      avatar_emoji = pickRandomAvatar(seed);
      alias = `${avatar_emoji} ${pickAnimalName(avatar_emoji)} #${randomConfessorNumber(seed) % 99}`;
    } else {
      const { data: prof } = await (await getSupabaseAdmin())
        .from("profiles").select("username").eq("id", context.userId).maybeSingle();
      alias = prof?.username ?? "user";
    }

    const { data: row, error } = await (await getSupabaseAdmin())
      .from("confession_replies")
      .insert({
        confession_id: data.confessionId,
        author_id: context.userId,
        alias, avatar_emoji,
        is_anonymous: data.anonymous,
        text: data.text,
      })
      .select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============== ADMIN MOD ==============
export const moderateConfession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      action: z.enum(["approve", "reject", "pin", "unpin", "feature", "unfeature", "remove"]),
    }).parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden");

    if (data.action === "remove") {
      const { error } = await (await getSupabaseAdmin()).from("confessions").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const patch: {
      status?: "pending" | "approved" | "rejected";
      is_pinned?: boolean;
      is_featured?: boolean;
    } = {};
    if (data.action === "approve") patch.status = "approved";
    if (data.action === "reject")  patch.status = "rejected";
    if (data.action === "pin")     patch.is_pinned = true;
    if (data.action === "unpin")   patch.is_pinned = false;
    if (data.action === "feature") patch.is_featured = true;
    if (data.action === "unfeature") patch.is_featured = false;

    const { error } = await (await getSupabaseAdmin()).from("confessions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============== ANALYTICS ==============
export const getConfessionStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Forbidden");

    const since24h = new Date(Date.now() - 86400000).toISOString();
    const [{ count: total }, { count: today }, { data: byCat }, { data: top }] = await Promise.all([
      (await getSupabaseAdmin()).from("confessions").select("*", { count: "exact", head: true }),
      (await getSupabaseAdmin()).from("confessions").select("*", { count: "exact", head: true }).gte("created_at", since24h),
      (await getSupabaseAdmin()).from("confessions").select("category"),
      (await getSupabaseAdmin()).from("confessions").select("id, text, like_count, reply_count, category, created_at")
        .order("like_count", { ascending: false }).limit(5),
    ]);

    const catCounts: Record<string, number> = {};
    for (const r of byCat ?? []) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;

    return {
      total: total ?? 0,
      today: today ?? 0,
      byCategory: Object.entries(catCounts).map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      topConfessions: top ?? [],
    };
  });
