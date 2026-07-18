/**
 * BooBubble Games SDK
 * ---------------------------------------------------------------
 * Reusable, adapter-based SDK surface for external games embedded
 * into the BooBubble platform.
 *
 * This file only wires INTERFACES + placeholder implementations.
 * Backend logic is intentionally NOT implemented here yet — every
 * method returns a "not implemented" SDKResult so the SDK compiles
 * and can be consumed by games while real adapters are built in a
 * later phase.
 *
 * Nothing in this package touches existing auth / wallet / XP /
 * achievements / competitions code. Real adapters will be wired
 * in a subsequent task.
 */

import type { AchievementsAdapter, AchievementProgress } from "./achievements";
import type { AnalyticsAdapter, AnalyticsEvent } from "./analytics";
import type { AuthAdapter, AuthSession } from "./auth";
import type { CloudSaveAdapter, CloudSaveSlot } from "./cloudsave";
import type { CompetitionsAdapter, CompetitionSummary } from "./competitions";
import type { EventsAdapter, SDKEventListener, SDKEventName, SDKEventPayloadMap } from "./events";
import type { FeedAdapter, FeedPostInput, FeedPostResult } from "./feed";
import type { LeaderboardAdapter, LeaderboardEntry, LeaderboardQuery, SubmitScoreInput } from "./leaderboard";
import type { NotificationsAdapter, NotificationInput, FriendFanoutInput } from "./notifications";
import type { ProfileAdapter, GameProfile } from "./profile";
import type { WalletAdapter, WalletBalance } from "./wallet";
import type { XPAdapter, XPState } from "./xp";
import type { GameContext, GameId, Paginated, SDKError, SDKResult, UserId } from "./types";

export * from "./types";
export * from "./events";
export * from "./auth";
export * from "./profile";
export * from "./wallet";
export * from "./xp";
export * from "./leaderboard";
export * from "./achievements";
export * from "./cloudsave";
export * from "./analytics";
export * from "./feed";
export * from "./notifications";
export * from "./competitions";

export interface GamesSDKAdapters {
  auth?: AuthAdapter;
  profile?: ProfileAdapter;
  wallet?: WalletAdapter;
  xp?: XPAdapter;
  leaderboard?: LeaderboardAdapter;
  achievements?: AchievementsAdapter;
  cloudsave?: CloudSaveAdapter;
  analytics?: AnalyticsAdapter;
  feed?: FeedAdapter;
  notifications?: NotificationsAdapter;
  competitions?: CompetitionsAdapter;
  events?: EventsAdapter;
}

export interface GamesSDKConfig {
  context: GameContext;
  adapters?: GamesSDKAdapters;
}

function notImplemented<T = void>(method: string): SDKResult<T> {
  const error: SDKError = {
    code: "NOT_IMPLEMENTED",
    message: `[games-sdk] ${method} has no adapter wired yet.`,
  };
  return { ok: false, error };
}

/**
 * Instance of the SDK. Games instantiate this once at boot with a
 * GameContext (id, version, locale). Adapters can be injected now
 * or provided later via `setAdapters`.
 */
export class GamesSDK {
  private context: GameContext;
  private adapters: GamesSDKAdapters;

  constructor(config: GamesSDKConfig) {
    this.context = config.context;
    this.adapters = config.adapters ?? {};
  }

  // ---- lifecycle ---------------------------------------------------------
  getContext(): GameContext {
    return this.context;
  }

  setAdapters(adapters: GamesSDKAdapters): void {
    this.adapters = { ...this.adapters, ...adapters };
  }

  // ---- auth --------------------------------------------------------------
  async getSession(): Promise<SDKResult<AuthSession | null>> {
    return this.adapters.auth?.getSession() ?? notImplemented("getSession");
  }
  async isAuthenticated(): Promise<boolean> {
    return (await this.adapters.auth?.isAuthenticated()) ?? false;
  }

  // ---- profile -----------------------------------------------------------
  async getProfile(userId?: UserId): Promise<SDKResult<GameProfile | null>> {
    return this.adapters.profile?.getProfile(userId) ?? notImplemented("getProfile");
  }

  // ---- wallet ------------------------------------------------------------
  async getBalance(userId?: UserId): Promise<SDKResult<WalletBalance>> {
    return this.adapters.wallet?.getBalance(userId) ?? notImplemented<WalletBalance>("getBalance");
  }
  async addCoins(amount: number, reason?: string): Promise<SDKResult<WalletBalance>> {
    return this.adapters.wallet?.addCoins(amount, reason) ?? notImplemented<WalletBalance>("addCoins");
  }
  async spendCoins(amount: number, reason?: string): Promise<SDKResult<WalletBalance>> {
    return this.adapters.wallet?.spendCoins(amount, reason) ?? notImplemented<WalletBalance>("spendCoins");
  }

  // ---- xp ----------------------------------------------------------------
  async getXP(userId?: UserId): Promise<SDKResult<XPState>> {
    return this.adapters.xp?.getXP(userId) ?? notImplemented<XPState>("getXP");
  }
  async addXP(amount: number, reason?: string): Promise<SDKResult<XPState>> {
    return this.adapters.xp?.addXP(amount, reason) ?? notImplemented<XPState>("addXP");
  }

  // ---- leaderboard -------------------------------------------------------
  async submitScore(input: SubmitScoreInput): Promise<SDKResult<{ rank?: number; best: number }>> {
    return this.adapters.leaderboard?.submitScore(input) ?? notImplemented("submitScore");
  }
  async getLeaderboard(query: LeaderboardQuery): Promise<SDKResult<Paginated<LeaderboardEntry>>> {
    return this.adapters.leaderboard?.getLeaderboard(query) ?? notImplemented("getLeaderboard");
  }

  // ---- achievements ------------------------------------------------------
  async unlockAchievement(achievementId: string): Promise<SDKResult<AchievementProgress>> {
    return this.adapters.achievements?.unlockAchievement(achievementId) ?? notImplemented("unlockAchievement");
  }
  async incrementAchievement(achievementId: string, delta: number): Promise<SDKResult<AchievementProgress>> {
    return this.adapters.achievements?.incrementProgress(achievementId, delta) ?? notImplemented("incrementAchievement");
  }

  // ---- cloudsave ---------------------------------------------------------
  async saveGame<T = unknown>(slot: string, data: T): Promise<SDKResult<CloudSaveSlot<T>>> {
    return this.adapters.cloudsave?.saveGame<T>(slot, data) ?? notImplemented("saveGame");
  }
  async loadGame<T = unknown>(slot: string): Promise<SDKResult<CloudSaveSlot<T> | null>> {
    return this.adapters.cloudsave?.loadGame<T>(slot) ?? notImplemented("loadGame");
  }
  async deleteSave(slot: string): Promise<SDKResult<void>> {
    return this.adapters.cloudsave?.deleteSave(slot) ?? notImplemented("deleteSave");
  }
  async listSaves(): Promise<SDKResult<CloudSaveSlot[]>> {
    return this.adapters.cloudsave?.listSaves() ?? notImplemented("listSaves");
  }

  // ---- analytics ---------------------------------------------------------
  async trackEvent(event: AnalyticsEvent): Promise<SDKResult<void>> {
    return this.adapters.analytics?.trackEvent(event) ?? notImplemented("trackEvent");
  }

  // ---- feed --------------------------------------------------------------
  async publishFeed(input: FeedPostInput): Promise<SDKResult<FeedPostResult>> {
    return this.adapters.feed?.publishFeed(input) ?? notImplemented("publishFeed");
  }

  // ---- notifications -----------------------------------------------------
  async sendNotification(input: NotificationInput): Promise<SDKResult<{ id: string }>> {
    return this.adapters.notifications?.sendNotification(input) ?? notImplemented("sendNotification");
  }
  async notifyFriends(input: FriendFanoutInput): Promise<SDKResult<{ delivered: number }>> {
    return this.adapters.notifications?.notifyFriends?.(input) ?? notImplemented("notifyFriends");
  }

  // ---- competitions ------------------------------------------------------
  async listCompetitions(): Promise<SDKResult<Paginated<CompetitionSummary>>> {
    return this.adapters.competitions?.listCompetitions() ?? notImplemented("listCompetitions");
  }
  async joinCompetition(competitionId: string): Promise<SDKResult<void>> {
    return this.adapters.competitions?.joinCompetition(competitionId) ?? notImplemented("joinCompetition");
  }
  async leaveCompetition(competitionId: string): Promise<SDKResult<void>> {
    return this.adapters.competitions?.leaveCompetition(competitionId) ?? notImplemented("leaveCompetition");
  }

  // ---- events ------------------------------------------------------------
  on<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): () => void {
    return this.adapters.events?.on(event, listener) ?? (() => {});
  }
  off<K extends SDKEventName>(event: K, listener: SDKEventListener<K>): void {
    this.adapters.events?.off(event, listener);
  }
  emit<K extends SDKEventName>(event: K, payload: SDKEventPayloadMap[K]): void {
    this.adapters.events?.emit(event, payload);
  }

  // ---- high-level lifecycle events --------------------------------------
  // Each helper funnels through the existing XP / Wallet / Achievements /
  // Analytics adapters — no new engines, no duplicated logic. Rewards are
  // optional and always routed via `addXP` / `addCoins`.
  private async _grant(reward?: { xp?: number; coins?: number }, reason?: string) {
    const result: { xpAwarded?: number; coinsAwarded?: number } = {};
    if (reward?.xp && reward.xp > 0) {
      const r = await this.addXP(reward.xp, reason);
      if (r.ok) result.xpAwarded = reward.xp;
    }
    if (reward?.coins && reward.coins > 0) {
      const r = await this.addCoins(reward.coins, reason);
      if (r.ok) result.coinsAwarded = reward.coins;
    }
    return result;
  }

  async gameStarted(input: { sessionId?: string; mode?: string; metadata?: Record<string, unknown> } = {}): Promise<SDKResult<void>> {
    const payload = { gameId: this.context.gameId, ...input };
    await this.trackEvent({ name: "game.started", properties: payload });
    this.emit("game.started", payload);
    return { ok: true, data: undefined };
  }

  async gameFinished(input: { sessionId?: string; score?: number; durationMs?: number; won?: boolean; metadata?: Record<string, unknown>; reward?: { xp?: number; coins?: number } } = {}): Promise<SDKResult<{ xpAwarded?: number; coinsAwarded?: number }>> {
    const granted = await this._grant(input.reward, `game.finished:${this.context.gameId}`);
    if (typeof input.score === "number") {
      await this.submitScore({ gameId: this.context.gameId, score: input.score, metadata: input.metadata });
    }
    const payload = { gameId: this.context.gameId, sessionId: input.sessionId, score: input.score, durationMs: input.durationMs, won: input.won, metadata: input.metadata, ...granted };
    await this.trackEvent({ name: "game.finished", properties: payload });
    this.emit("game.finished", payload);
    return { ok: true, data: granted };
  }

  async reportHighestTile(input: { tile: number; previousBest?: number; reward?: { xp?: number; coins?: number } }): Promise<SDKResult<{ xpAwarded?: number; coinsAwarded?: number }>> {
    const isNewRecord = input.previousBest === undefined ? true : input.tile > input.previousBest;
    const granted = isNewRecord ? await this._grant(input.reward, `highest_tile:${input.tile}`) : {};
    const payload = { gameId: this.context.gameId, tile: input.tile, previousBest: input.previousBest, isNewRecord, ...granted };
    await this.trackEvent({ name: "game.highest_tile", properties: payload });
    this.emit("game.highest_tile", payload);
    return { ok: true, data: granted };
  }

  async dailyChallengeComplete(input: { challengeId: string; date?: string; reward?: { xp?: number; coins?: number } }): Promise<SDKResult<{ xpAwarded?: number; coinsAwarded?: number }>> {
    const granted = await this._grant(input.reward, `daily_challenge:${input.challengeId}`);
    const payload = { gameId: this.context.gameId, challengeId: input.challengeId, date: input.date, ...granted };
    await this.trackEvent({ name: "daily_challenge.complete", properties: payload });
    this.emit("daily_challenge.complete", payload);
    return { ok: true, data: granted };
  }

  async missionComplete(input: { missionId: string; reward?: { xp?: number; coins?: number } }): Promise<SDKResult<{ xpAwarded?: number; coinsAwarded?: number }>> {
    const granted = await this._grant(input.reward, `mission:${input.missionId}`);
    const payload = { gameId: this.context.gameId, missionId: input.missionId, ...granted };
    await this.trackEvent({ name: "mission.complete", properties: payload });
    this.emit("mission.complete", payload);
    return { ok: true, data: granted };
  }

  // Achievement unlock helper: reuses unlockAchievement + emits + tracks.
  // Rewards (if any) are handled by the existing gam_award backend, not here,
  // to avoid duplicating award rules.
  async reportAchievementUnlock(achievementId: string): Promise<SDKResult<AchievementProgress>> {
    const r = await this.unlockAchievement(achievementId);
    if (r.ok) {
      await this.trackEvent({ name: "achievement.unlocked", properties: { gameId: this.context.gameId, achievementId } });
      this.emit("achievement.unlocked", { achievementId });
    }
    return r;
  }
}

/**
 * Convenience factory — mirrors the shape most external games expect
 * (`const sdk = createGamesSDK({...})`).
 */
export function createGamesSDK(config: GamesSDKConfig): GamesSDK {
  return new GamesSDK(config);
}

export type { GameId };
