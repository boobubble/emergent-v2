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
import type { NotificationsAdapter, NotificationInput } from "./notifications";
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
}

/**
 * Convenience factory — mirrors the shape most external games expect
 * (`const sdk = createGamesSDK({...})`).
 */
export function createGamesSDK(config: GamesSDKConfig): GamesSDK {
  return new GamesSDK(config);
}

export type { GameId };
