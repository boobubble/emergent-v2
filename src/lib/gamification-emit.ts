import { emitGamificationEvent } from "./gamification-engine.functions";

/**
 * Fire-and-forget client-side wrapper around the Gamification event emitter.
 * Existing features import this and call it after successful actions:
 *
 *   gamify("feed.post.created");
 *   gamify("gift.sent", 1, { gift_id });
 *
 * The server RPC handles achievements, quests, milestones and season XP.
 */
export function gamify(event: string, amount = 1, metadata: Record<string, unknown> = {}) {
  try {
    void emitGamificationEvent({ data: { event, amount, metadata } }).catch(() => {});
  } catch { /* never break the calling feature */ }
}

/** Canonical event names — keep in sync with admin achievement/quest catalog. */
export const GAM_EVENTS = {
  feedPostCreated: "feed.post.created",
  feedCommentAdded: "feed.comment.added",
  feedReactionAdded: "feed.reaction.added",
  messageSent: "message.sent",
  giftSent: "gift.sent",
  giftReceived: "gift.received",
  competitionVoted: "competition.voted",
  competitionWon: "competition.won",
  gamePlayed: "game.played",
  gameFishWon: "game.fish.won",
  gameDigWon: "game.dig.won",
  gameWineWon: "game.wine.won",
  profileUpdated: "profile.updated",
  friendAdded: "friend.added",
  dmStarted: "dm.started",
  radioJoined: "radio.joined",
  dailyLogin: "daily.login",
  streakIncreased: "streak.increased",
  walletPurchase: "wallet.purchase",
  premiumPurchased: "premium.purchased",
  wallpaperPurchased: "wallpaper.purchased",
  frameUnlocked: "frame.unlocked",
} as const;
