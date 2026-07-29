const GAME_REWARD_CAPS = {
  "premium-2048": {
    gameId: "premium-2048",
    perCallCoins: 25,
    perCallXp: 50,
    perDayCoins: 300,
    perDayXp: 600,
    perDayAchievements: 10
  }
};
function getGameRewardCaps(gameId) {
  if (!gameId) return null;
  return GAME_REWARD_CAPS[gameId] ?? null;
}
function isRegisteredGame(gameId) {
  return !!getGameRewardCaps(gameId);
}
export {
  getGameRewardCaps as g,
  isRegisteredGame as i
};
