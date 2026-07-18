/**
 * BooBubble Games SDK adapters — wire the reusable SDK (packages/games-sdk)
 * into the existing platform pipelines. No public interface is changed.
 *
 * Every method is a thin translation between the SDK shape and the
 * matching platform server function. This module is the ONLY place that
 * knows about both worlds.
 */
import {
  createGamesSDK,
  GamesSDK,
  type GamesSDKAdapters,
  type GameContext,
  type SDKResult,
  type UserId,
  type XPAdapter,
  type XPState,
  type WalletAdapter,
  type WalletBalance,
  type AchievementsAdapter,
  type AchievementProgress,
  type LeaderboardAdapter,
  type LeaderboardEntry,
  type LeaderboardQuery,
  type SubmitScoreInput,
  type FeedAdapter,
  type FeedPostInput,
  type FeedPostResult,
  type AnalyticsAdapter,
  type AnalyticsEvent,
  type NotificationsAdapter,
  type NotificationInput,
  type ProfileAdapter,
  type GameProfile,
  type Paginated,
} from "../../packages/games-sdk";
import { supabase } from "@/integrations/supabase/client";
import {
  sdkAddXP,
  sdkAddCoins,
  sdkUnlockAchievement,
  sdkSubmitScore,
  sdkGetLeaderboard,
  sdkPublishFeed,
  sdkTrackEvent,
  sdkSendNotification,
  sdkGetProfile,
} from "./games-sdk.functions";

const ok = <T>(data: T): SDKResult<T> => ({ ok: true, data });
const fail = <T = never>(err: unknown, method: string): SDKResult<T> => ({
  ok: false,
  error: {
    code: "SDK_ADAPTER_ERROR",
    message: err instanceof Error ? err.message : `[games-sdk] ${method} failed`,
  },
});

/* -------------------------------------------------------------- XP */
function makeXPAdapter(ctx: GameContext): XPAdapter {
  return {
    async getXP(userId?: UserId): Promise<SDKResult<XPState>> {
      try {
        const p = await sdkGetProfile({ data: { userId } });
        if (!p) return fail("profile not found", "getXP");
        return ok({ userId: p.userId, xp: p.xp, level: p.level });
      } catch (e) { return fail(e, "getXP"); }
    },
    async addXP(amount, reason) {
      try {
        await sdkAddXP({ data: { amount, reason, gameId: ctx.gameId } });
        const p = await sdkGetProfile({ data: {} });
        return ok({ userId: p?.userId ?? "", xp: p?.xp ?? 0, level: p?.level ?? 0 });
      } catch (e) { return fail(e, "addXP"); }
    },
  };
}

/* ---------------------------------------------------------- Wallet */
function makeWalletAdapter(ctx: GameContext): WalletAdapter {
  return {
    async getBalance(userId?: UserId): Promise<SDKResult<WalletBalance>> {
      try {
        const p = await sdkGetProfile({ data: { userId } });
        if (!p) return fail("profile not found", "getBalance");
        return ok({ userId: p.userId, coins: p.coins });
      } catch (e) { return fail(e, "getBalance"); }
    },
    async addCoins(amount, reason) {
      try {
        const r = await sdkAddCoins({ data: { amount, reason, gameId: ctx.gameId } });
        return ok({ userId: r.userId, coins: r.coins, updatedAt: r.updatedAt });
      } catch (e) { return fail(e, "addCoins"); }
    },
    async spendCoins(amount, reason) {
      // Coin spending is handled by feature-specific server fns (shop, boosts…).
      // The SDK doesn't own debit rules, so we surface a clear NOT_SUPPORTED.
      void amount; void reason;
      return { ok: false, error: { code: "NOT_SUPPORTED", message: "spendCoins must go through the platform shop / purchase server functions." } };
    },
  };
}

/* --------------------------------------------------- Achievements */
function makeAchievementsAdapter(): AchievementsAdapter {
  return {
    async list() { return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "list() not exposed via SDK" } }; },
    async getProgress() { return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "getProgress() not exposed via SDK" } }; },
    async unlockAchievement(id): Promise<SDKResult<AchievementProgress>> {
      try {
        const r = await sdkUnlockAchievement({ data: { achievementId: id } });
        return ok({ achievementId: r.achievementId, unlocked: r.unlocked, unlockedAt: r.unlockedAt });
      } catch (e) { return fail(e, "unlockAchievement"); }
    },
    async incrementProgress(id, delta) {
      // Progress increments funnel through gam_emit as a domain event.
      try {
        await sdkAddXP({ data: { amount: Math.max(1, delta), reason: `achievement.${id}` } });
        return ok({ achievementId: id, unlocked: false, progress: delta });
      } catch (e) { return fail(e, "incrementProgress"); }
    },
  };
}

/* --------------------------------------------------- Leaderboard */
function makeLeaderboardAdapter(): LeaderboardAdapter {
  return {
    async submitScore(input: SubmitScoreInput) {
      try {
        const r = await sdkSubmitScore({ data: { gameId: input.gameId, score: input.score, metadata: input.metadata } });
        return ok({ best: r.best });
      } catch (e) { return fail(e, "submitScore"); }
    },
    async getLeaderboard(q: LeaderboardQuery): Promise<SDKResult<Paginated<LeaderboardEntry>>> {
      try {
        const r = await sdkGetLeaderboard({ data: { gameId: q.gameId, limit: q.limit } });
        return ok({ items: r.items as LeaderboardEntry[] });
      } catch (e) { return fail(e, "getLeaderboard"); }
    },
    async getMyRank() { return { ok: false, error: { code: "NOT_IMPLEMENTED", message: "getMyRank not exposed" } }; },
  };
}

/* ------------------------------------------------------------ Feed */
function makeFeedAdapter(ctx: GameContext): FeedAdapter {
  return {
    async publishFeed(input: FeedPostInput): Promise<SDKResult<FeedPostResult>> {
      try {
        const r = await sdkPublishFeed({ data: {
          text: input.text,
          imageUrl: input.imageUrl,
          linkUrl: input.linkUrl,
          gameId: ctx.gameId,
          metadata: input.metadata,
        }});
        return ok({ postId: r.postId });
      } catch (e) { return fail(e, "publishFeed"); }
    },
  };
}

/* ------------------------------------------------------- Analytics */
function makeAnalyticsAdapter(ctx: GameContext): AnalyticsAdapter {
  return {
    async trackEvent(event: AnalyticsEvent) {
      try {
        await sdkTrackEvent({ data: { name: event.name, gameId: ctx.gameId, properties: event.properties } });
        return { ok: true };
      } catch (e) { return fail(e, "trackEvent"); }
    },
    async trackScreen(screen, props) {
      try {
        await sdkTrackEvent({ data: { name: `screen.${screen}`, gameId: ctx.gameId, properties: props } });
        return { ok: true };
      } catch (e) { return fail(e, "trackScreen"); }
    },
    async flush() { return { ok: true }; },
  };
}

/* --------------------------------------------------- Notifications */
function makeNotificationsAdapter(ctx: GameContext): NotificationsAdapter {
  return {
    async sendNotification(input: NotificationInput) {
      try {
        const r = await sdkSendNotification({ data: {
          title: input.title,
          body: input.body,
          toUserId: input.toUserId,
          gameId: ctx.gameId,
          data: input.data,
        }});
        return ok({ id: r.id });
      } catch (e) { return fail(e, "sendNotification"); }
    },
  };
}

/* --------------------------------------------------------- Profile */
function makeProfileAdapter(): ProfileAdapter {
  return {
    async getProfile(userId?: UserId): Promise<SDKResult<GameProfile | null>> {
      try {
        const p = await sdkGetProfile({ data: { userId } });
        if (!p) return ok(null);
        return ok({ userId: p.userId, username: p.username, avatarUrl: p.avatarUrl, level: p.level, country: p.country });
      } catch (e) { return fail(e, "getProfile"); }
    },
    async getProfiles(ids) {
      try {
        const results = await Promise.all(ids.map((id) => sdkGetProfile({ data: { userId: id } })));
        const items = results.filter(Boolean).map((p) => ({
          userId: p!.userId, username: p!.username, avatarUrl: p!.avatarUrl, level: p!.level, country: p!.country,
        }));
        return ok(items);
      } catch (e) { return fail(e, "getProfiles"); }
    },
  };
}

/* ------------------------------------------------------------ Auth */
function makeAuthAdapter() {
  return {
    async getSession(): Promise<SDKResult<{ userId: string } | null>> {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return ok(null);
      return ok({ userId: data.user.id });
    },
    async isAuthenticated() {
      const { data } = await supabase.auth.getUser();
      return !!data.user;
    },
    async requireAuth(): Promise<SDKResult<{ userId: string }>> {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return { ok: false, error: { code: "UNAUTHENTICATED", message: "Sign in required" } };
      return ok({ userId: data.user.id });
    },
    onAuthChange(listener: (s: { userId: string } | null) => void) {
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        listener(session?.user ? { userId: session.user.id } : null);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}

/* =============================================================== */
/**
 * Build a fully-wired GamesSDK instance for the current signed-in user.
 * All adapters delegate to existing platform server functions — the
 * SDK's public interface is unchanged.
 */
export function createBooBubbleGamesSDK(context: GameContext): GamesSDK {
  const adapters: GamesSDKAdapters = {
    auth: makeAuthAdapter(),
    profile: makeProfileAdapter(),
    xp: makeXPAdapter(context),
    wallet: makeWalletAdapter(context),
    achievements: makeAchievementsAdapter(),
    leaderboard: makeLeaderboardAdapter(),
    feed: makeFeedAdapter(context),
    analytics: makeAnalyticsAdapter(context),
    notifications: makeNotificationsAdapter(context),
  };
  return createGamesSDK({ context, adapters });
}
