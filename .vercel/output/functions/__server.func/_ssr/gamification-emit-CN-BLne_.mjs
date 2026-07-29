import { e as emitGamificationEvent } from "./gamification-engine.functions-CTvD5DWu.mjs";
function gamify(event, amount = 1, metadata = {}) {
  try {
    void emitGamificationEvent({ data: { event, amount, metadata } }).catch(() => {
    });
  } catch {
  }
}
const GAM_EVENTS = {
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
  frameUnlocked: "frame.unlocked"
};
export {
  GAM_EVENTS as G,
  gamify as g
};
