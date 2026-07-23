/**
 * Daily challenges — small rotating tasks scaled by user level.
 * Backend-synced (progress computed from posts/reactions/comments/friends
 * created today, claims persisted alongside daily missions).
 *
 * XP/coin rewards go through the same `bumpProfile` path used by missions,
 * so profiles.xp / profiles.level update immediately and stream to the
 * client via existing realtime subscriptions.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

export type ChallengeId = "post" | "react5" | "comment3" | "friend" | "login";

export interface ChallengeDef {
  id: ChallengeId;
  title: string;
  description: string;
  howTo: string[];
  emoji: string;
  goal: number;
  xp: number;
  coins: number;
}

const POOL: ChallengeDef[] = [
  {
    id: "post",
    title: "Create a post",
    description: "Share something with the community today.",
    howTo: [
      "Open the Feed",
      "Tap the composer at the top",
      "Publish any text, photo, or poll",
    ],
    emoji: "✍️",
    goal: 1,
    xp: 30,
    coins: 5,
  },
  {
    id: "react5",
    title: "React to 5 posts",
    description: "Show some love to posts you enjoy.",
    howTo: [
      "Scroll the Feed",
      "Tap ❤ on 5 different posts",
    ],
    emoji: "❤️",
    goal: 5,
    xp: 20,
    coins: 3,
  },
  {
    id: "comment3",
    title: "Comment on 3 posts",
    description: "Join conversations with meaningful replies.",
    howTo: [
      "Open any Feed post",
      "Leave a comment on 3 different posts",
    ],
    emoji: "💬",
    goal: 3,
    xp: 25,
    coins: 4,
  },
  {
    id: "friend",
    title: "Add a friend",
    description: "Grow your circle by connecting with someone new.",
    howTo: [
      "Open a member's profile",
      "Send a friend request",
      "Wait for them to accept (or accept one you received)",
    ],
    emoji: "🤝",
    goal: 1,
    xp: 35,
    coins: 5,
  },
  {
    id: "login",
    title: "Keep your login streak",
    description: "Just showing up counts! Visit every day to grow your streak.",
    howTo: ["Open the app today — this is already done."],
    emoji: "🔥",
    goal: 1,
    xp: 15,
    coins: 2,
  },
];

const BY_ID: Record<string, ChallengeDef> = Object.fromEntries(POOL.map((c) => [c.id, c]));

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function pickForToday(): ChallengeDef[] {
  const idx = dayIndex();
  const rotating = POOL.filter((c) => c.id !== "login");
  const out: ChallengeDef[] = [];
  for (let i = 0; i < 3; i++) out.push(rotating[(idx + i) % rotating.length]);
  out.push(BY_ID.login);
  return out;
}

function scaleChallenge(base: ChallengeDef, level: number): ChallengeDef {
  const tier = Math.max(1, Math.floor((Math.min(level, 999) - 1) / 5) + 1);
  const goal = base.id === "login" ? 1 : Math.ceil(base.goal * (1 + (tier - 1) * 0.5));
  const xp = Math.round(base.xp * (1 + (tier - 1) * 0.35));
  const coins = Math.round(base.coins * (1 + (tier - 1) * 0.35));
  return { ...base, goal, xp, coins };
}

const CLAIM_PREFIX = "ch_";

async function bumpProfile(userId: string, addXp: number, addCoins: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("xp, coins")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return { xp: 0, coins: 0, level: 1 };
  const newXp = Math.max(0, (data.xp ?? 0) + addXp);
  const newCoins = Math.max(0, (data.coins ?? 0) + addCoins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await supabaseAdmin
    .from("profiles")
    .update({ xp: newXp, coins: newCoins, level: newLevel })
    .eq("id", userId);
  return { xp: newXp, coins: newCoins, level: newLevel };
}

async function ensureDailyRow(userId: string, day: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("daily_missions")
    .select("id, progress, claimed")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();
  if (data) return data;
  const { data: created } = await supabaseAdmin
    .from("daily_missions")
    .insert({ user_id: userId, day, progress: {}, claimed: [] as string[] } as never)
    .select("id, progress, claimed")
    .maybeSingle();
  return created ?? { id: "", progress: {}, claimed: [] as string[] };
}

/** Return today's challenges + progress + claim state for the current user. */
export const getTodayChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const day = todayUtc();

    // User level (drives scaling)
    const { data: profile } = await supabase
      .from("profiles")
      .select("level, streak, longest_streak")
      .eq("id", userId)
      .maybeSingle();
    const level = profile?.level ?? 1;
    const streak = profile?.streak ?? 0;
    const longestStreak = profile?.longest_streak ?? 0;

    // Claimed state (persisted)
    const row = await ensureDailyRow(userId, day);
    const claimedSet = new Set((row.claimed ?? []).filter((s) => s.startsWith(CLAIM_PREFIX)).map((s) => s.slice(CLAIM_PREFIX.length)));

    // Today counters
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const iso = start.toISOString();

    const [posts, reacts, comments, friends] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId).gte("created_at", iso),
      supabase.from("reactions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", iso),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", userId).gte("created_at", iso),
      supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).gte("created_at", iso),
    ]);

    const counts: Record<ChallengeId, number> = {
      post: posts.count ?? 0,
      react5: reacts.count ?? 0,
      comment3: comments.count ?? 0,
      friend: friends.count ?? 0,
      login: 1,
    };

    const challenges = pickForToday().map((base) => {
      const scaled = scaleChallenge(base, level);
      const progress = Math.min(counts[scaled.id] ?? 0, scaled.goal);
      const completed = progress >= scaled.goal;
      return {
        ...scaled,
        progress,
        completed,
        claimed: claimedSet.has(scaled.id),
      };
    });

    return { day, level, streak, longestStreak, challenges };
  });

/** Claim a completed challenge. Idempotent per day. */
export const claimChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("xp.write")])
  .inputValidator((i) =>
    z.object({ challengeId: z.enum(["post", "react5", "comment3", "friend", "login"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const day = todayUtc();

    const { data: profile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", userId)
      .maybeSingle();
    const level = profile?.level ?? 1;

    const base = BY_ID[data.challengeId];
    if (!base) throw new Error("Unknown challenge");
    const scaled = scaleChallenge(base, level);

    // Verify completion server-side
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const iso = start.toISOString();

    let progress = 0;
    if (scaled.id === "login") {
      progress = 1;
    } else if (scaled.id === "post") {
      const { count } = await supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId).gte("created_at", iso);
      progress = count ?? 0;
    } else if (scaled.id === "react5") {
      const { count } = await supabase.from("reactions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", iso);
      progress = count ?? 0;
    } else if (scaled.id === "comment3") {
      const { count } = await supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", userId).gte("created_at", iso);
      progress = count ?? 0;
    } else if (scaled.id === "friend") {
      const { count } = await supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).gte("created_at", iso);
      progress = count ?? 0;
    }
    if (progress < scaled.goal) throw new Error("Challenge not yet complete");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = await ensureDailyRow(userId, day);
    const claimKey = `${CLAIM_PREFIX}${scaled.id}`;
    const existing: string[] = row.claimed ?? [];
    if (existing.includes(claimKey)) throw new Error("Already claimed");

    const updatedProfile = await bumpProfile(userId, scaled.xp, scaled.coins);
    await supabaseAdmin.from("coin_transactions").insert({
      user_id: userId,
      kind: "coins",
      amount: scaled.coins,
      reason: "challenge_claim",
      ref_type: "challenge",
      ref_id: scaled.id,
    } as never);
    await supabaseAdmin
      .from("daily_missions")
      .update({ claimed: [...existing, claimKey], updated_at: new Date().toISOString() })
      .eq("id", row.id);

    return { ok: true, xp: scaled.xp, coins: scaled.coins, profile: updatedProfile };
  });
