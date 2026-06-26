export interface VoiceNotesConfig {
  enabled: boolean;
  max_lobby: number; // seconds
  max_dm: number;
  max_trio: number;
}

export const VOICE_NOTES_DEFAULTS: VoiceNotesConfig = {
  enabled: true,
  max_lobby: 60,
  max_dm: 120,
  max_trio: 90,
};

export function maxDurationForChannel(channelId: string, cfg: VoiceNotesConfig): number {
  if (channelId.startsWith("dm:")) return cfg.max_dm;
  if (channelId.startsWith("trio:")) return cfg.max_trio;
  return cfg.max_lobby;
}
