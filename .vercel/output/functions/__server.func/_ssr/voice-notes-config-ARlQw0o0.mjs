const VOICE_NOTES_DEFAULTS = {
  enabled: true,
  max_lobby: 60,
  max_dm: 120,
  max_trio: 90
};
function maxDurationForChannel(channelId, cfg) {
  if (channelId.startsWith("dm:")) return cfg.max_dm;
  if (channelId.startsWith("trio:")) return cfg.max_trio;
  return cfg.max_lobby;
}
export {
  VOICE_NOTES_DEFAULTS as V,
  maxDurationForChannel as m
};
