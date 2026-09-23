import { GAME_BOT_IDS, LOBBY_BOT_IDS } from "@/lib/chat-bot-channels";

/** Known platform chat bot keys (client catalog — runtime unchanged in 3B-1). */
export const PLATFORM_BOT_KEYS = [...LOBBY_BOT_IDS, ...GAME_BOT_IDS] as const;

export type PlatformBotKey = (typeof PLATFORM_BOT_KEYS)[number];

const PLATFORM_BOT_KEY_SET = new Set<string>(PLATFORM_BOT_KEYS);

export function isPlatformBotKey(value: string): value is PlatformBotKey {
  return PLATFORM_BOT_KEY_SET.has(value);
}

/** Default assignments seeded for system channels. */
export const PLATFORM_CHANNEL_BOT_SEEDS: ReadonlyArray<{
  channelSlug: "yaarzo-global" | "games";
  botKey: PlatformBotKey;
  sortOrder: number;
}> = [
  { channelSlug: "yaarzo-global", botKey: "bot-spam", sortOrder: 0 },
  { channelSlug: "yaarzo-global", botKey: "bot-echo", sortOrder: 1 },
  { channelSlug: "games", botKey: "bot-gamebot", sortOrder: 0 },
  { channelSlug: "games", botKey: "bot-dig", sortOrder: 1 },
  { channelSlug: "games", botKey: "bot-fish", sortOrder: 2 },
  { channelSlug: "games", botKey: "bot-wine", sortOrder: 3 },
  { channelSlug: "games", botKey: "bot-pixel", sortOrder: 4 },
  { channelSlug: "games", botKey: "bot-nova", sortOrder: 5 },
  { channelSlug: "games", botKey: "bot-ryze", sortOrder: 6 },
];
