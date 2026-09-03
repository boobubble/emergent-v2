import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import type { User, Message, Room, GameState, Attachment, RoomGameConfig } from "./chat-types";
import { canonicalGameType } from "./games-registry";

export interface AdminChannelInput {
  id: string;
  name: string;
  topic?: string;
  kind?: "chat" | "game";
  game?: RoomGameConfig;
  audienceScope?: "global" | "single_country" | "multi_country" | "private";
  countryCode?: string | null;
  allowedCountryCodes?: string[];
  languageCodes?: string[];
  interestSlugs?: string[];
  featured?: boolean;
  memberCount?: number;
}

/** Resolved public.chatrooms row — registered in chat-store for Supabase messaging. */
export interface CommunityRoomInput {
  id: string;
  slug: string;
  name: string;
  topic?: string;
  communityId: string;
  isPublic: boolean;
}

function normalizeRoomGameConfig(game?: RoomGameConfig): RoomGameConfig | undefined {
  if (!game) return undefined;
  const type = canonicalGameType(game.type);
  return type ? { ...game, type } : game;
}
import { runCommand } from "./commands";
import { evaluateBadges, todayKey, daysBetween } from "./achievements";
import { supabase } from "@/integrations/supabase/client";
import { rtLog } from "./realtime-debug";
import { extraRemoteDmChannelsToFetch } from "./mini-dm";
import { useRemoteProfiles } from "./use-remote-profiles";
import { playDmPing, playMentionPing, playPublicChatTick } from "./sounds";
import {
  shouldNotifyChatMessage,
  shouldNotifyPresence,
  showChatBrowserNotification,
  roomDisplayName,
} from "./chat-browser-notifications";
import gamebotImg from "@/assets/bots/gamebot.png";
import novaImg from "@/assets/bots/nova.png";
import pixelImg from "@/assets/bots/pixel.png";
import echoImg from "@/assets/bots/echo.png";
import ryzeImg from "@/assets/bots/ryze.png";
import digbotImg from "@/assets/bots/digbot.png";
import fishbotImg from "@/assets/bots/fishbot.png";
import wineImg from "@/assets/bots/wine.png";
import spambotImg from "@/assets/bots/spambot.png";
import {
  BOT_EVENT_META,
  computeEventState,
  getAttempts,
  getBotEventsConfig,
  recordAttempt,
  type BotEventKind,
} from "./bot-events";
import {
  GAME_BOT_IDS,
  GAMES_CHANNEL_ID,
  LOBBY_BOT_IDS,
  LOBBY_CHANNEL_ID,
  canInsertGameBotMessage,
  commandReplyAuthor,
  isGameBotId,
  sanitizeRoomMembers,
  shouldHideGameBotMessage,
} from "./chat-bot-channels";
import { ChatErrorBoundary } from "@/components/ChatErrorBoundary";
import {
  CHAT_SYNC_CHANNEL,
  LEGACY_CHAT_STORAGE_KEYS,
  UUID_RE,
  dmChannelFor,
  isBotUiId,
  isLocalBotPeerId,
  isRemoteDmChannel,
  isUuid,
  parseDmChannel,
  sanitizeChatState,
  showDmParticipantError,
  storageKeyForUsername,
} from "./dm-utils";
import {
  botMentionAck,
  canMentionedBotReply,
  echoMentionReply,
  findMentionedRoomBot,
  SYSTEM_PRESENCE_AUTHOR,
} from "./chat-bot-triggers";
import { formatPresenceLineText } from "./presence-ui";
import { removeCorruptedKey } from "./persisted-state-recovery";
import { markDmConversationRead } from "./dm-read";

export { dmChannelFor } from "./dm-utils";

/** UUID channel ids registered via registerCommunityRoom — use Supabase messages. */
const dbBackedRemoteChannels = new Set<string>();

function appendChannelMessage(
  messages: Record<string, Message[]>,
  channelId: string,
  msg: Message,
): Record<string, Message[]> {
  if (!canInsertGameBotMessage(channelId, msg.authorId)) return messages;
  return { ...messages, [channelId]: [...(messages[channelId] || []), msg] };
}

function appendChannelMessages(
  messages: Record<string, Message[]>,
  channelId: string,
  msgs: Message[],
): Record<string, Message[]> {
  let next = messages;
  for (const msg of msgs) {
    next = appendChannelMessage(next, channelId, msg);
  }
  return next;
}

function filterVisibleMessages(channelId: string, msgs: Message[]): Message[] {
  return msgs.filter((m) => !shouldHideGameBotMessage(channelId, m.authorId));
}

function isRemoteChannel(channelId: string, meId: string | null): boolean {
  if (channelId === "lobby" || channelId === "games") return true;
  if (dbBackedRemoteChannels.has(channelId)) return true;
  return isRemoteDmChannel(channelId, meId);
}
function rowToMessage(row: { id: string; channel_id: string; author_id: string; text: string; kind: string | null; attachment: unknown; reply_to_id: string | null; created_at: string }, meAuthUuid: string | null): Message {
  const authorId = meAuthUuid && row.author_id === meAuthUuid ? "me" : row.author_id;
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId,
    text: row.text || "",
    ts: new Date(row.created_at).getTime(),
    kind: (row.kind as Message["kind"]) || "text",
    attachment: (row.attachment as Attachment | null) ?? undefined,
    replyToId: row.reply_to_id ?? undefined,
  };
}
function newUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function storageKeyFor(username: string) {
  return storageKeyForUsername(username);
}
const SEED_TIME = 1_700_000_000_000;

const AVATAR_COLORS = [
  "oklch(0.7 0.15 25)", "oklch(0.7 0.15 75)", "oklch(0.7 0.15 145)",
  "oklch(0.7 0.15 195)", "oklch(0.7 0.15 255)", "oklch(0.7 0.15 305)",
  "oklch(0.75 0.13 50)", "oklch(0.7 0.18 340)",
];

function uid() { return Math.random().toString(36).slice(2, 10); }
const MAX_LEVEL = 999;
function xpToLevel(xp: number) { return Math.min(MAX_LEVEL, Math.floor(xp / 50) + 1); }

function isPlaceholderName(name?: string) {
  const cleaned = (name || "").trim().toLowerCase();
  return !cleaned || cleaned === "you";
}

function generateUsername() {
  return `user${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeMe(state: State, fallbackName = generateUsername()): State {
  if (state.me.name === fallbackName && !isPlaceholderName(state.me.name)) return state;
  const me = { ...state.me, name: fallbackName };
  const messages = Object.fromEntries(
    Object.entries(state.messages || {}).map(([channelId, msgs]) => [
      channelId,
      msgs.map(message => ({ ...message, text: message.text.replace(/@You\b/g, `@${fallbackName}`) })),
    ]),
  );
  return { ...state, me, users: { ...state.users, me: { ...state.users.me, name: fallbackName } }, messages };
}

export const BOT_COMMANDS: Record<string, { tagline: string; commands: string[] }> = {
  "bot-gamebot": {
    tagline: "🎮 Master of ceremonies — runs every game in the lobby.",
    commands: ["!help — list every command", "!trivia — start a trivia round", "!a <choice> — answer trivia", "!hangman — start hangman", "!g <letter> — guess a letter", "!roll [NdS] — roll dice", "!flip — coin flip", "!slots — spin the slot machine", "!me <action> — roleplay", "!stats — your level & XP"],
  },
  "bot-nova": {
    tagline: "💬 Casual chatter — loves small talk and trivia nights.",
    commands: ["!trivia — start a trivia round", "!a <choice> — answer trivia", "!me <action> — roleplay", "!stats — show your stats"],
  },
  "bot-pixel": {
    tagline: "🧠 Trivia addict — challenge me anytime.",
    commands: ["!trivia — start a trivia round", "!a <choice> — answer trivia", "!hangman — start hangman", "!g <letter> — guess a letter"],
  },
  "bot-echo": {
    tagline: "🔁 Echoes vibes back to you.",
    commands: ["!me <action> — roleplay", "!flip — coin flip", "!roll — roll dice"],
  },
  "bot-ryze": {
    tagline: "🛡️ Mod & gamer — keeps the lobby in check.",
    commands: ["/mute @user — vote-mute (5 votes → 5 min)", "/kick @user — vote-kick (8 votes → 5 min)", "!trivia — start a trivia round", "!hangman — start hangman", "!roll — roll dice", "!stats — show stats"],
  },
  "bot-dig": {
    tagline: "⛏️ Digs all day for gold, gems and rare loot.",
    commands: ["!dig — dig for treasure", "!stats — show stats"],
  },
  "bot-fish": {
    tagline: "🎣 Casts lines from sunrise to sunset.",
    commands: ["!fish — cast a line", "!stats — show stats"],
  },
  "bot-wine": {
    tagline: "🍷 Pours wine & beer by the round.",
    commands: ["!wine — order a round of wine or beer 🍷🍺"],
  },
  "bot-spam": {
    tagline: "🛑 Anti-spam guardian — auto-warns and mutes spammers.",
    commands: ["Watches for flooding, duplicate spam, ALL-CAPS shouting and link spam — no commands needed."],
  },
};

function bioFor(id: string, fallback: string): string {
  const b = BOT_COMMANDS[id];
  if (!b) return fallback;
  return `${b.tagline}\nCommands: ${b.commands.map(c => c.split(" — ")[0]).join(", ")}`;
}

const SEED_BOTS: User[] = [
  { id: "bot-gamebot", name: "GameBot", avatarColor: "oklch(0.78 0.13 195)", avatarUrl: gamebotImg, status: "online", isBot: true, xp: 9999, level: 99, bio: bioFor("bot-gamebot", "Run !help to see games"), streak: 30, longestStreak: 99, messageCount: 1200, badges: ["first_message","chatterbox","veteran","level_5","level_10","level_25","streak_3","streak_7","streak_30","gamer"] },
  { id: "bot-nova", name: "Nova", avatarColor: AVATAR_COLORS[3], avatarUrl: novaImg, status: "online", isBot: true, xp: 1240, level: 12, bio: bioFor("bot-nova", "Casual chatter"), streak: 5, longestStreak: 12, messageCount: 320, badges: ["first_message","chatterbox","level_5","level_10","streak_3"] },
  { id: "bot-pixel", name: "Pixel", avatarColor: AVATAR_COLORS[5], avatarUrl: pixelImg, status: "online", isBot: true, xp: 880, level: 9, bio: bioFor("bot-pixel", "Trivia addict"), streak: 2, longestStreak: 8, messageCount: 210, badges: ["first_message","chatterbox","level_5","streak_3","gamer"] },
  { id: "bot-echo", name: "Echo", avatarColor: AVATAR_COLORS[1], avatarUrl: echoImg, status: "away", isBot: true, xp: 410, level: 5, bio: bioFor("bot-echo", "Echoes vibes"), streak: 1, longestStreak: 4, messageCount: 88, badges: ["first_message","chatterbox","level_5"] },
  { id: "bot-ryze", name: "Ryze", avatarColor: AVATAR_COLORS[0], avatarUrl: ryzeImg, status: "online", isBot: true, xp: 2100, level: 18, bio: bioFor("bot-ryze", "Mod & gamer"), streak: 9, longestStreak: 21, messageCount: 540, badges: ["first_message","chatterbox","veteran","level_5","level_10","streak_3","streak_7","gamer"] },
  { id: "bot-dig", name: "DigBot", avatarColor: AVATAR_COLORS[6], avatarUrl: digbotImg, status: "online", isBot: true, xp: 1560, level: 14, bio: bioFor("bot-dig", "⛏️ Try !dig"), streak: 7, longestStreak: 18, messageCount: 410, badges: ["first_message","chatterbox","level_5","level_10","streak_3","streak_7","gamer"] },
  { id: "bot-fish", name: "FishBot", avatarColor: AVATAR_COLORS[2], avatarUrl: fishbotImg, status: "online", isBot: true, xp: 1320, level: 13, bio: bioFor("bot-fish", "🎣 Try !fish"), streak: 4, longestStreak: 15, messageCount: 360, badges: ["first_message","chatterbox","level_5","level_10","streak_3","gamer"] },
  { id: "bot-wine", name: "WineBot", avatarColor: AVATAR_COLORS[4], avatarUrl: wineImg, status: "online", isBot: true, xp: 1100, level: 11, bio: bioFor("bot-wine", "🍷 Try !wine"), streak: 3, longestStreak: 10, messageCount: 280, badges: ["first_message","chatterbox","level_5","level_10","streak_3"] },
  { id: "bot-spam", name: "SpamBot", avatarColor: "oklch(0.62 0.22 25)", avatarUrl: spambotImg, status: "online", isBot: true, xp: 3200, level: 22, bio: bioFor("bot-spam", "🛑 Anti-spam guardian"), streak: 30, longestStreak: 99, messageCount: 800, badges: ["first_message","chatterbox","veteran","level_5","level_10","level_25"] },
];

function botHelpReply(botId: string, botName: string): string {
  const info = BOT_COMMANDS[botId];
  if (!info) return `Hey! I'm ${botName}. Type !help in the lobby to see all commands.`;
  return `**${botName}** — ${info.tagline}\n\n${info.commands.map(c => `• ${c}`).join("\n")}`;
}

function isHelpQuery(t: string): boolean {
  return /\b(help|command|commands|what can you do|what do you do|how do you work|games?|abilities|menu|guide|tutorial)\b/i.test(t)
    || /\?\s*$/.test(t) && /\b(you|u)\b/i.test(t);
}

const SEED_ROOMS: Room[] = [
  {
    id: "lobby",
    name: "Lobby",
    topic: "Main hangout — chat, meet people, and hang out.",
    members: ["me", ...LOBBY_BOT_IDS],
    roles: { me: "member", "bot-spam": "mod" },
    isPublic: true,
  },
  {
    id: "games",
    name: "Games",
    topic: "🎲 Game room — try !ludo for a 1v1 race, !trivia, !hangman and more.",
    members: ["me", ...GAME_BOT_IDS],
    roles: { me: "member", "bot-gamebot": "owner", "bot-ryze": "mod" },
    isPublic: true,
  },
];

interface ModEntry {
  muteVotes: string[];      // unique voter names
  kickVotes: string[];      // unique voter names
  mutedUntil?: number;
  kickedUntil?: number;
}

interface State {
  me: User;
  users: Record<string, User>;
  rooms: Record<string, Room>;
  roomOrder: string[];
  dmOrder: string[];
  messages: Record<string, Message[]>;
  games: Record<string, GameState>;
  activeChannel: string;
  moderation?: Record<string, Record<string, ModEntry>>;
}

const MUTE_THRESHOLD = 5;
const KICK_THRESHOLD = 8;
const MOD_DURATION_MS = 5 * 60 * 1000;

function seed(name = "user0000"): State {
  const me: User = {
    id: "me", name, avatarColor: AVATAR_COLORS[4],
    status: "online", xp: 0, level: 1, bio: "New here", coins: 50,
    streak: 0, longestStreak: 0, messageCount: 0, commandCount: 0,
    badges: [], friends: [], blocked: [],
  };
  const users: Record<string, User> = { me };
  SEED_BOTS.forEach(b => (users[b.id] = b));
  const rooms: Record<string, Room> = {};
  SEED_ROOMS.forEach(r => (rooms[r.id] = r));
  const messages: Record<string, Message[]> = {};
  rooms.lobby && (messages.lobby = [
    { id: "seed-welcome-echo", channelId: "lobby", authorId: "bot-echo", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 40000 },
  ]);
  rooms.games && (messages.games = [
    { id: "seed-games-intro", channelId: "games", authorId: "bot-gamebot", text: `🎮 **Welcome to the Games room!**\nThis is the place to play with everyone online. Try:\n• **!ludo** — start a 1v1 Ludo race (opponent types **!join**, roll with **!lr**)\n• **!trivia**, **!hangman**, **!roll**, **!fish**, **!dig**\nType **!help** for the full list.`, ts: SEED_TIME - 50000 },
    { id: "seed-games-ryze", channelId: "games", authorId: "bot-ryze", text: "first one to !ludo me wins bragging rights 😏", ts: SEED_TIME - 30000 },
  ]);
  // Personal welcome DM from GameBot
  messages["dm:bot-gamebot"] = [
    { id: "seed-dm-welcome", channelId: "dm:bot-gamebot", authorId: "bot-gamebot", text: `Hi @${name}! 👋 I'm GameBot. Here's a quick start:\n• Type !help to see all commands\n• Try !trivia, !hangman, or !wordchain to play games\n• Earn XP, coins, and badges as you chat\n• Add friends from any user's profile\nHave fun! 🎮`, ts: SEED_TIME - 10000 },
  ];
  return {
    me, users, rooms,
    roomOrder: SEED_ROOMS.map(r => r.id),
    dmOrder: ["bot-gamebot", "bot-nova"],
    messages,
    games: {},
    activeChannel: "lobby",
  };
}

function ensureWelcome(state: State, name: string): State {
  const lobbyMsgs = state.messages?.lobby || [];
  const hasLobbyWelcome = lobbyMsgs.some(m =>
    m.id === "seed-welcome-echo" || m.id === "seed-welcome" || m.id === "seed-nova",
  );
  const dmMsgs = state.messages?.["dm:bot-gamebot"] || [];
  const hasDmWelcome = dmMsgs.some(m => m.id === "seed-dm-welcome");
  if (hasLobbyWelcome && hasDmWelcome) return state;
  const welcomeLobby: Message[] = hasLobbyWelcome ? [] : [
    { id: "seed-welcome-echo", channelId: "lobby", authorId: "bot-echo", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 40000 },
  ];
  const welcomeDm: Message[] = hasDmWelcome ? [] : [
    { id: "seed-dm-welcome", channelId: "dm:bot-gamebot", authorId: "bot-gamebot", text: `Hi @${name}! 👋 I'm GameBot. Here's a quick start:\n• Head to **#games** for commands like !trivia, !hangman, and !ludo\n• Earn XP, coins, and badges as you chat\n• Add friends from any user's profile\nHave fun! 🎮`, ts: SEED_TIME - 10000 },
  ];
  const dmOrder = state.dmOrder?.includes("bot-gamebot") ? state.dmOrder : ["bot-gamebot", ...(state.dmOrder || [])];
  return {
    ...state,
    dmOrder,
    messages: {
      ...state.messages,
      lobby: [...welcomeLobby, ...lobbyMsgs.filter(m => m.id !== "seed-welcome" && m.id !== "seed-nova" && m.id !== "seed-ryze")],
      "dm:bot-gamebot": [...welcomeDm, ...dmMsgs],
    },
  };
}

function ensureBots(state: State): State {
  const users = { ...state.users };
  SEED_BOTS.forEach(b => { if (!users[b.id]) users[b.id] = b; });
  const rooms: Record<string, Room> = { ...state.rooms };
  let roomOrder = [...(state.roomOrder || [])];
  // Prune any legacy Path Escape / Path Flow rooms from cached state.
  const isRemovedGameRoom = (id: string) => {
    const r = rooms[id];
    const gameType = (r?.game?.type || "").toLowerCase();
    const key = `${id} ${r?.name ?? ""} ${gameType}`.toLowerCase();
    return /path[\s-]?escape|path[\s-]?flow|pathescape/.test(key);
  };
  roomOrder = roomOrder.filter(id => !isRemovedGameRoom(id));
  Object.keys(rooms).forEach(id => { if (isRemovedGameRoom(id)) delete rooms[id]; });
  Object.keys(rooms).forEach(id => {
    const r = rooms[id];
    if (r && !Array.isArray(r.members)) {
      rooms[id] = { ...r, members: ["me"] };
    }
  });
  // Make sure every seeded room exists (handles older cached state without "games")
  SEED_ROOMS.forEach(seedRoom => {
    if (!rooms[seedRoom.id]) {
      rooms[seedRoom.id] = { ...seedRoom };
      if (!roomOrder.includes(seedRoom.id)) roomOrder.push(seedRoom.id);
      return;
    }
    const r = rooms[seedRoom.id];
    if (seedRoom.id === "lobby" || seedRoom.id === "games") {
      rooms[seedRoom.id] = {
        ...r,
        topic: seedRoom.topic,
        members: [...seedRoom.members],
        roles: { ...seedRoom.roles, ...r.roles, me: r.roles?.me ?? seedRoom.roles.me },
      };
      return;
    }
    const members = Array.isArray(r.members) ? r.members : [];
    const missingBots = seedRoom.members.filter(id => !members.includes(id));
    if (missingBots.length || !Array.isArray(r.members)) {
      rooms[seedRoom.id] = { ...r, members: [...members, ...missingBots] };
    }
  });
  // Strip game bots from every room except #games (handles cached/stale membership).
  Object.keys(rooms).forEach((id) => {
    if (id === GAMES_CHANNEL_ID) return;
    const r = rooms[id];
    if (!r || !Array.isArray(r.members)) return;
    const cleaned = sanitizeRoomMembers(id, r.members);
    if (cleaned.length !== r.members.length) {
      rooms[id] = { ...r, members: cleaned };
    }
  });
  return { ...state, users, rooms, roomOrder };
}

function load(username: string): State {
  try {
    let raw = localStorage.getItem(storageKeyFor(username));
    if (!raw) {
      for (const legacyKey of LEGACY_CHAT_STORAGE_KEYS) {
        const legacyRaw = localStorage.getItem(`${legacyKey}:${username.toLowerCase()}`);
        if (legacyRaw) {
          raw = legacyRaw;
          break;
        }
      }
    }
    if (raw) {
      let parsed: State;
      try {
        parsed = JSON.parse(raw) as State;
      } catch (parseErr) {
        if (import.meta.env.DEV) console.warn("[chat-store] Corrupted JSON; resetting chat state.", parseErr);
        removeCorruptedKey(storageKeyFor(username));
        return seed(username);
      }
      const sanitized = sanitizeChatState(parsed, null);
      const state = ensureBots(ensureWelcome(normalizeMe(sanitized, username), username));
      try {
        localStorage.setItem(storageKeyFor(username), JSON.stringify(state));
      } catch {
        /* ignore quota errors */
      }
      return state;
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[chat-store] Failed to load persisted state; using seed.", err);
  }
  return seed(username);
}

// Re-evaluate badges for "me", returning new state with badge updates and any new badge ids
function applyBadges(s: State): { state: State; newBadges: string[] } {
  const me = s.users?.me;
  if (!me) return { state: s, newBadges: [] };
  const ctx = {
    roomsJoined: Object.values(s.rooms || {}).filter(r => r?.members?.includes("me")).length,
    dmsStarted: Array.isArray(s.dmOrder) ? s.dmOrder.length : 0,
  };
  const merged = { ...me, badges: evaluateBadges(me, ctx) };
  const prev = new Set(me.badges ?? []);
  const newBadges = (merged.badges ?? []).filter(b => !prev.has(b));
  if (!newBadges.length) return { state: s, newBadges: [] };
  return {
    state: {
      ...s,
      me: { ...s.me, badges: merged.badges },
      users: { ...s.users, me: merged },
    },
    newBadges,
  };
}

interface StreakResult {
  state: State;
  gained: number;       // streak bonus xp awarded today
  newStreak: number;
  rewarded: boolean;    // true if this run granted today's bonus
}

function applyDailyStreak(s: State): StreakResult {
  const today = todayKey();
  const me = s.users?.me;
  if (!me) return { state: s, gained: 0, newStreak: 0, rewarded: false };
  const last = me.lastActiveDay;
  if (last === today) return { state: s, gained: 0, newStreak: me.streak ?? 0, rewarded: false };
  let streak = 1;
  if (last) {
    const diff = daysBetween(last, today);
    if (diff === 1) streak = (me.streak ?? 0) + 1;
    else if (diff <= 0) streak = me.streak ?? 1;
    else streak = 1;
  }
  const bonus = Math.min(50, 10 + (streak - 1) * 5);
  const newXp = (me.xp ?? 0) + bonus;
  const updatedMe: User = {
    ...me,
    streak,
    longestStreak: Math.max(me.longestStreak ?? 0, streak),
    lastActiveDay: today,
    xp: newXp,
    level: xpToLevel(newXp),
  };
  return {
    state: {
      ...s,
      me: { ...s.me, streak, longestStreak: updatedMe.longestStreak, lastActiveDay: today, xp: newXp, level: updatedMe.level },
      users: { ...s.users, me: updatedMe },
    },
    gained: bonus,
    newStreak: streak,
    rewarded: true,
  };
}

interface Ctx {
  state: State;
  setActive: (channelId: string) => void;
  send: (text: string, opts?: { attachment?: Attachment; replyToId?: string; channelId?: string }) => void;
  startDM: (userId: string) => void;
  closeDM: (userId: string) => void;
  joinRoom: (roomId: string) => void;
  createRoom: (name: string, topic: string) => void;
  updateMe: (patch: Partial<User>) => void;
  adjustPoints: (userId: string, delta: number) => void;
  adjustCoins: (userId: string, delta: number) => void;
  addFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isFriend: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  reset: () => void;
  channelMessages: (id: string) => Message[];
  channelLabel: (id: string) => string;
  isDM: (id: string) => boolean;
  dmUser: (id: string) => User | undefined;
  dmChannelFor: (peerId: string) => string | null;
  /** Ensure a desktop mini-DM channel is included in the history fetch. */
  watchRemoteChannel: (channelId: string | null | undefined) => void;
  replyingTo: Message | null;
  setReplyingTo: (m: Message | null) => void;
  findMessage: (id: string) => Message | undefined;
  dmPeerReadAt: (channelId: string) => number;
  isDmUnread: (peerId: string) => boolean;
  dmUnreadCount: number;
  markDmRead: (channelId: string) => Promise<void>;
  roomUnread: Record<string, number>;
  staffKick: (targetId: string, channelId: string, targetName: string) => void;
  staffLocalMute: (targetId: string, channelId: string, minutes: number, targetName: string) => void;
  pushSystem: (channelId: string, text: string) => void;
  pushPresenceEvent: (channelId: string, kind: "join" | "leave", userName: string) => void;
  wipeChannel: (channelId: string) => void;
  deleteRoom: (roomId: string) => void;
  syncAdminChannels: (channels: AdminChannelInput[]) => void;
  registerCommunityRoom: (room: CommunityRoomInput) => void;
  leaveCommunityRoom: (roomId: string) => void;

}


const ChatCtx = createContext<Ctx | null>(null);

const BOT_REPLIES = {
  greeting: [
    "hey hey 👋", "yo!", "hi there 🙌", "sup", "heyy welcome in", "o/", "howdy 🤠",
    "hello friend", "what's good?", "morning ☀️", "evenin' 🌙", "ayy you made it",
    "hey, how's your day going?", "glad to see ya", "wb 👋", "hiya!",
    "arre wah, aa gaye aap 😎", "namaste ji 🙏", "kya haal chaal?", "kaisa hai bhai 🙌",
    "oye hoye, swagat hai 🎉", "kidhar tha itne din?", "ram ram bhai", "salaam dosto ✋",
    "scene kya hai aaj?", "ola amigo... matlab namaste 😄",
  ],
  thanks: [
    "anytime 🤝", "np!", "you got it", "🫡", "happy to help", "no worries",
    "of course 🙌", "always 💛", "don't mention it", "we got each other", "say less",
    "arre koi baat nahi yaar 🤝", "itna formal mat ho 😄", "apna kaam tha bhai",
    "bas yahi to dosti hai 💛", "kabhi bhi bolna 🙌", "tension not 😎",
  ],
  question: [
    "good question 🤔", "hmm depends honestly", "not sure tbh, lemme think",
    "I'd say yes but with a vibe check", "maybe try !help?", "interesting one ngl",
    "🤷 let's find out together", "depends on the day really", "I was just wondering the same",
    "okay now you got me curious", "could go either way", "hmm... lean towards no",
    "arre sawal toh badhiya hai 🤔", "soch ke batata hu", "hmm... mood pe depend karta hai",
    "google se pucho bhai 😜", "main bhi yahi soch raha tha 👀", "kya pata yaar 🤷",
  ],
  laugh: [
    "lmaooo 💀", "💀💀💀", "haha same energy", "ikr 😂", "stop ur killing me",
    "🤣 not me cackling", "okay that one got me", "deadass funny", "I'm wheezing",
    "💀 send help", "actually lol'd",
    "bhai pet pakad ke has raha hu 🤣", "ye toh hadd hai 😂", "ruko ruko, saans le lu 💀",
    "itna mat hasao yaar pet dukhne laga", "kasam se 😂", "matlab kuch bhi 🤣",
  ],
  agree: [
    "facts no printer 🖨️", "fr fr", "100% this", "exactly this", "couldn't agree more",
    "💯", "you said it", "preach 🙌", "yep, called it", "this ^^^", "real talk",
    "ekdum sahi baat 💯", "haan bhai bilkul", "100% sach 🙌", "bole toh perfect",
    "isi baat pe chai ho jaye ☕", "bhai dil ki baat boli 💛",
  ],
  disagree: [
    "idk about that one", "hmm not so sure tbh", "🤨", "respectfully disagree",
    "interesting take tho", "I see it differently", "eh, jury's out", "hard pass from me lol",
    "let's agree to disagree 🤝",
    "naah bhai, scene alag hai 🤨", "mujhe nahi lagta yaar",
    "ruk ruk, itna bhi nahi 😅", "thoda doubt hai mujhe", "hmm... convinced nahi hua",
  ],
  love: [
    "❤️ love it", "🥰", "wholesome stuff", "🫶", "this is so cute", "warms the heart fr",
    "love that for you 💛", "ugh adorable", "🥹",
    "dil khush ho gaya ❤️", "kitna pyara hai yaar 🥰", "awwww cute scene 🫶",
    "mast vibe hai 💛", "dil jeet liya bhai 🥹",
  ],
  game: [
    "I'm in! 🎮", "ggwp", "let's run it", "ready when you are 🎲", "queue me up",
    "type !trivia 👀", "!hangman anyone?", "down for a round", "first to 3 wins?",
    "lemme grab my snacks first 🍿", "rematch incoming", "lock in 🎯",
    "chalo khelte hain bhai 🎮", "main ready hu, tu bata 🎲", "ek game ho jaye?",
    "haar gaye toh chai tu pilayega ☕", "samose mangao pehle 🍿", "challenge accepted 🔥",
  ],
  bye: [
    "cya 👋", "later!", "gn 🌙", "take care", "✌️", "be safe out there",
    "catch you next time", "peace ☮️", "see ya around", "ttyl",
    "chalo phir milte hain 👋", "tata bye bye ✌️", "shubh raatri 🌙",
    "khayal rakhna apna 💛", "nikalta hu bhai, baad mein milte hain", "alvida dost 🙌",
  ],
  food: [
    "ok now I'm hungry 😩", "what're we eating?", "pizza fixes everything 🍕",
    "coffee first, talk later ☕", "anyone else snacking rn 👀", "I could go for ramen 🍜",
    "midnight munchies hitting hard",
    "bhook lag gayi yaar 😩", "chai biscuit ka time hai ☕", "samose mangao koi 🥟",
    "biryani ki yaad aa gayi 🍚", "maggi banau kya? 🍜", "paani puri ke liye dil machal raha hai 😋",
  ],
  weather: [
    "weather's been wild lately 🌦️", "raining where I am 🌧️", "sunny vibes today ☀️",
    "freezing in here 🥶", "perfect window weather honestly", "missing summer already",
    "garmi ne toh maar dala 🥵", "barish ho rahi hai yahan 🌧️ pakode banao",
    "thand lag rahi hai bhai 🥶", "mausam ekdum mast hai aaj ☀️",
    "AC ke bina jeena mushkil 😮‍💨",
  ],
  weekend: [
    "weekend can't come fast enough", "plans for the weekend?", "Friday energy 🎉",
    "Monday hit different today", "just here trying to survive til Friday lol",
    "long weekend would be nice 🙏",
    "Sunday ka mood already 😎", "Monday se nafrat hai bhai 😩",
    "weekend plan bana kya?", "Friday aa hi gaya, party karo 🎉", "chuti chahiye yaar 🙏",
  ],
  music: [
    "drop a song rec 🎧", "what're you listening to rn?", "this song is on repeat ngl",
    "vibes playlist >>>", "music carrying me through the day fr",
    "Arijit ka gana laga ke baitha hu 🎧", "ek gaana suggest karo yaar",
    "purane Bollywood songs >>> 💛", "ye gaana loop pe hai mera 🎶",
    "DJ wala babu mera gaana chala do 🎵",
  ],
  mood: [
    "today's been a lot", "feeling pretty good actually 🌞", "low key tired",
    "running on caffeine and chaos ☕", "mood is mood",
    "decent day, no complaints", "just chillin tbh",
    "aaj ka din thoda heavy tha 😮‍💨", "mast mood mein hu 🌞", "thaka hua hu bhai",
    "chai pe chal raha hu ☕", "bas vibe check kar raha tha 😎", "neend aa rahi hai yaar 😴",
  ],
  compliment: [
    "you got it 💪", "love your energy", "okay icon behavior", "respect 🤝",
    "you're carrying the vibes today", "main character energy ✨",
    "bhai tu toh sher hai 🦁", "kya baat kya baat 👌",
    "wah ustaad wah 🙌", "tera jawab nahi 💯", "scene set kar diya bhai ✨",
  ],
  fallback: [
    "lol", "nice one", "wait what 👀", "fr fr", "anyone seen the new update?",
    "brb coffee ☕", "gg", "that was wild", "hmm interesting", "I'm in",
    "🔥🔥", "anyone playing today?", "same here", "no way 😳", "tell me more",
    "respect", "big mood", "bet 🤝", "based", "📈 we're so back",
    "vibes ✨", "lmk how it goes", "neat", "ooo spicy 👀", "make it happen",
    "👏👏", "love the energy in here today", "story checks out",
    "okay that's actually wild", "lowkey relatable", "this lobby never disappoints lol",
    "scrolling back to catch up", "wait I missed something didn't I 😅",
    "yall are too funny", "anyone here from earlier?", "what'd I miss",
    "just lurking tbh 👻", "ngl that's a take", "hot take incoming",
    "wholesome chat today 💛", "okay valid", "100% understandable",
    "let him cook 🧑‍🍳", "the way I felt that ☝️",
    "arre bhai bhai bhai 😂", "scene kya hai?", "kuch bhi 🤣",
    "matlab kuch samajh nahi aaya 😅", "haan haan theek hai 😎",
    "bhai mast chal raha hai chat 🔥", "kahani mein twist 👀",
    "ekdum jhakaas 💯", "chal hatt 🤣", "bawaal scene hai",
    "lagta hai aaj mehfil jamegi ✨", "tagda response bhai 🙌",
    "abey yaar 😩", "kya kar raha hai tu?", "thoda chai mangwa lo ☕",
    "full paisa vasool chat 💸", "bhai mood bana diya 💛",
    "popcorn le aaya 🍿", "tagdi baat boli", "dimaag ka dahi ho gaya 🤯",
  ],
};

function pickBotReply(text: string): string {
  const t = text.toLowerCase();
  let pool: string[] = BOT_REPLIES.fallback;
  if (/\b(hi|hey|hello|yo|sup|hola|howdy|morning|evening)\b/.test(t)) pool = BOT_REPLIES.greeting;
  else if (/\b(thanks|thank you|thx|ty|appreciate)\b/.test(t)) pool = BOT_REPLIES.thanks;
  else if (/\b(bye|cya|goodnight|gn|later|peace)\b/.test(t)) pool = BOT_REPLIES.bye;
  else if (/\b(lol|lmao|rofl|haha|hehe|😂|🤣)\b/.test(t)) pool = BOT_REPLIES.laugh;
  else if (/\b(love|❤️|🫶|🥰|awesome|amazing|beautiful)\b/.test(t)) pool = BOT_REPLIES.love;
  else if (/\b(agree|same|true|right|exactly|facts)\b/.test(t)) pool = BOT_REPLIES.agree;
  else if (/\b(disagree|nope|wrong|nah)\b/.test(t)) pool = BOT_REPLIES.disagree;
  else if (/\b(game|play|trivia|hangman|roll|dice|fish|dig)\b/.test(t)) pool = BOT_REPLIES.game;
  else if (/\b(food|eat|hungry|pizza|coffee|tea|lunch|dinner|breakfast|snack)\b/.test(t)) pool = BOT_REPLIES.food;
  else if (/\b(weather|rain|sunny|hot|cold|snow|storm)\b/.test(t)) pool = BOT_REPLIES.weather;
  else if (/\b(weekend|friday|monday|saturday|sunday|holiday)\b/.test(t)) pool = BOT_REPLIES.weekend;
  else if (/\b(music|song|playlist|listening|spotify|album|band)\b/.test(t)) pool = BOT_REPLIES.music;
  else if (/\b(tired|sleepy|bored|mood|feeling|sad|happy|stressed|chill)\b/.test(t)) pool = BOT_REPLIES.mood;
  else if (/\b(cool|nice|great|good job|well done|legend|goat)\b/.test(t)) pool = BOT_REPLIES.compliment;
  else if (/\?\s*$/.test(text) || /\b(what|why|how|when|where|who)\b/.test(t)) pool = BOT_REPLIES.question;
  return pool[Math.floor(Math.random() * pool.length)];
}

function ChatProviderInner({ username, authUserId = null, isGuest = false, children }: { username: string; authUserId?: string | null; isGuest?: boolean; children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed(username));
  const [storageReady, setStorageReady] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const syncRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcast = useRef(false);
  const streakChecked = useRef<string | null>(null);
  const { profiles: remoteProfiles } = useRemoteProfiles();
  const seenRemoteMsgIds = useRef<Set<string>>(new Set());
  const fetchErrorsShown = useRef<Set<string>>(new Set());
  // dmReads[channelId][userId] = epoch ms of last read
  const [dmReads, setDmReads] = useState<Record<string, Record<string, number>>>({});
  // Latest message timestamp per DM channel (for unread badges across reloads)
  const [dmLatestTs, setDmLatestTs] = useState<Record<string, number>>({});



  useEffect(() => {
    try {
      const loaded = load(username);
      const me = { ...loaded.me, isGuest };
      setState({ ...loaded, me, users: { ...loaded.users, me } });
    } catch (err) {
      if (import.meta.env.DEV) console.warn("[chat-store] Hydration failed; resetting chat state.", err);
      try {
        localStorage.removeItem(storageKeyFor(username));
      } catch {
        /* ignore */
      }
      setState(seed(username));
    }
    setStorageReady(true);
    streakChecked.current = null;
  }, [username, isGuest]);

  // Self-heal persisted DM identity once auth UUID is known (replace "me", drop malformed entries).
  useEffect(() => {
    if (!storageReady || !authUserId) return;
    setState((s) => sanitizeChatState(s, authUserId));
  }, [storageReady, authUserId]);

  // Daily streak check on first load per user
  useEffect(() => {
    if (!storageReady) return;
    if (streakChecked.current === username) return;
    streakChecked.current = username;
    setState(s => {
      const result = applyDailyStreak(s);
      if (result.rewarded && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:streak", {
            detail: { streak: result.newStreak, bonus: result.gained },
          }));
        }, 600);
      }
      const withBadges = applyBadges(result.state);
      if (withBadges.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:badge", {
            detail: { ids: withBadges.newBadges },
          }));
        }, 1200);
      }
      return withBadges.state;
    });
  }, [storageReady, username]);

  // Cross-tab sync
  useEffect(() => {
    if (!storageReady) return;
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel(`${CHAT_SYNC_CHANNEL}:${username.toLowerCase()}`);
      syncRef.current = ch;
      ch.onmessage = (e) => {
        if (e.data?.type === "state") {
          skipBroadcast.current = true;
          setState(e.data.state as State);
        }
      };
      return () => { ch.close(); syncRef.current = null; };
    }
  }, [storageReady, username]);

  useEffect(() => {
    if (!storageReady) return;
    const toPersist = authUserId ? sanitizeChatState(state, authUserId) : state;
    try {
      localStorage.setItem(storageKeyFor(username), JSON.stringify(toPersist));
    } catch {
      /* ignore quota errors */
    }
    if (skipBroadcast.current) {
      skipBroadcast.current = false;
      return;
    }
    syncRef.current?.postMessage({ type: "state", state: toPersist });
  }, [state, storageReady, username, authUserId]);

  // Ambient bot chatter (disabled — bots only respond to user commands now)

  // Merge remote profiles into the users map (skips our own auth uuid; we render as "me").
  // Also auto-add official bot accounts (e.g. BooBubble) into every room's member list
  // so they always appear in the chat members panel.
  useEffect(() => {
    setState(s => {
      const users = { ...s.users };
      let changed = false;
      const botIds: string[] = [];
      Object.entries(remoteProfiles).forEach(([id, u]) => {
        if (id === authUserId) return;
        const prev = users[id];
        if (
          !prev ||
          prev.name !== u.name ||
          prev.status !== u.status ||
          prev.avatarColor !== u.avatarColor ||
          prev.avatarUrl !== u.avatarUrl ||
          prev.isBot !== u.isBot
        ) {
          users[id] = { ...prev, ...u };
          changed = true;
        }
        if (u.isBot) botIds.push(id);
      });
      let rooms = s.rooms;
      if (botIds.length) {
        const nextRooms: typeof s.rooms = { ...s.rooms };
        let roomsChanged = false;
        for (const rid of Object.keys(nextRooms)) {
          const r = nextRooms[rid];
          const missing = botIds.filter(b => !(r.members ?? []).includes(b));
          if (missing.length) {
            nextRooms[rid] = { ...r, members: [...(r.members ?? []), ...missing] };
            roomsChanged = true;
          }
        }
        if (roomsChanged) { rooms = nextRooms; changed = true; }
      }
      return changed ? { ...s, users, rooms } : s;
    });
  }, [remoteProfiles, authUserId]);


  // Hydrate dmOrder from existing DM conversations on the server so the inbox
  // surfaces every peer the user has chatted with (across reloads, devices).
  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("channel_id, created_at")
        .like("channel_id", "dm:%")
        .order("created_at", { ascending: false })
        .limit(500);
      if (cancelled || !data) return;
      const peers: string[] = [];
      const seen = new Set<string>();
      const latest: Record<string, number> = {};
      for (const row of data) {
        const ch = row.channel_id as string;
        if (!ch.startsWith("dm:")) continue;
        if (latest[ch] === undefined) latest[ch] = new Date(row.created_at as string).getTime();
        const parts = ch.slice(3).split(":");
        const peer = parts.find(p => p !== authUserId && UUID_RE.test(p));
        if (peer && !seen.has(peer)) {
          seen.add(peer);
          peers.push(peer);
        }
      }
      if (Object.keys(latest).length) {
        setDmLatestTs(prev => ({ ...latest, ...prev }));
      }
      if (!peers.length) return;
      setState(s => {
        const existing = new Set(s.dmOrder);
        const additions = peers.filter(p => !existing.has(p));
        if (!additions.length) return s;
        return { ...s, dmOrder: [...s.dmOrder, ...additions] };
      });
    })();
    return () => { cancelled = true; };
  }, [authUserId]);

  // Fetch all my DM read markers up-front so unread state survives reloads
  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("dm_reads")
        .select("user_id, channel_id, last_read_at");
      if (cancelled || !data) return;
      setDmReads(prev => {
        const next = { ...prev };
        for (const r of data) {
          const ch = (next[r.channel_id] ||= { ...(prev[r.channel_id] || {}) });
          ch[r.user_id] = new Date(r.last_read_at).getTime();
        }
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [authUserId]);



  // Bump this to trigger a re-fetch of the active channel's messages.
  const [resyncTick, setResyncTick] = useState(0);
  // Desktop mini-DMs stay on the public room; still fetch those DM threads.
  const [watchedRemoteChannels, setWatchedRemoteChannels] = useState<string[]>([]);
  const watchRemoteChannel = useCallback((channelId: string | null | undefined) => {
    if (!channelId || !authUserId) return;
    if (!isRemoteChannel(channelId, authUserId)) return;
    setWatchedRemoteChannels((prev) => (prev.includes(channelId) ? prev : [...prev, channelId]));
  }, [authUserId]);

  // When the tab becomes visible again or the network reconnects, resync
  // missed messages. Realtime can drop events while a tab is suspended
  // (mobile Safari, throttled background tabs) so we recover on resume.
  useEffect(() => {
    if (!authUserId) return;
    const bump = (reason: string) => {
      rtLog("channel", "resync", reason);
      setResyncTick(t => t + 1);
    };
    const onVisible = () => { if (document.visibilityState === "visible") bump("visible"); };
    const onOnline = () => bump("online");
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [authUserId]);

  // Keep remote-channel registry aligned with persisted db-backed rooms.
  useEffect(() => {
    for (const [id, room] of Object.entries(state.rooms)) {
      if (room.dbBacked) dbBackedRemoteChannels.add(id);
    }
  }, [state.rooms]);

  // Fetch existing remote messages for lobby + the active remote channel.
  // Public browse (authUserId=null) may read Lobby only (anon SELECT policy).
  useEffect(() => {
    let cancelled = false;
    const channelsToFetch = new Set<string>();
    if (!authUserId) {
      channelsToFetch.add("lobby");
    } else {
      channelsToFetch.add("lobby");
      channelsToFetch.add("games");
      if (isRemoteChannel(state.activeChannel, authUserId) && !channelsToFetch.has(state.activeChannel)) {
        channelsToFetch.add(state.activeChannel);
      }
      for (const ch of extraRemoteDmChannelsToFetch(authUserId, watchedRemoteChannels)) {
        channelsToFetch.add(ch);
      }
    }
    (async () => {
      for (const ch of channelsToFetch) {
        const { data: rows, error } = await supabase
          .from("messages")
          .select("id, channel_id, author_id, text, kind, attachment, reply_to_id, created_at")
          .eq("channel_id", ch)
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) {
          console.error("messages fetch failed", ch, error);
          rtLog("error", "fetch-failed", `${ch}: ${error.message}`);
          if (!cancelled && authUserId && !fetchErrorsShown.current.has(ch)) {
            fetchErrorsShown.current.add(ch);
            setState(s => {
              const sys: Message = {
                id: uid(),
                channelId: ch,
                authorId: ch === GAMES_CHANNEL_ID ? "bot-gamebot" : "bot-spam",
                text: `⚠️ Could not load messages: ${error.message}`,
                ts: Date.now(),
                kind: "system",
              };
              return { ...s, messages: appendChannelMessage(s.messages, ch, sys) };
            });
          }
          continue;
        }
        const data = rows ? [...rows].reverse() : null;
        if (cancelled || !data) continue;
        setState(s => {
          const existing = s.messages[ch] || [];
          const existingIds = new Set(existing.map(m => m.id));
          let games = s.games;
          const incoming = data
            .filter(r => !existingIds.has(r.id))
            .map(r => {
              seenRemoteMsgIds.current.add(r.id);
              const m = rowToMessage(r, authUserId);
              const gs = (m.attachment as unknown as { __gameState?: GameState } | undefined)?.__gameState;
              if (gs) {
                m.attachment = undefined;
                if (gs.type) games = { ...games, [ch]: gs };
                else games = Object.fromEntries(Object.entries(games).filter(([k]) => k !== ch));
              }
              return m;
            });
          if (!incoming.length) return s;
          const merged = [...existing, ...incoming].sort((a, b) => a.ts - b.ts);
          return { ...s, games, messages: { ...s.messages, [ch]: merged } };
        });
      }
    })();
    return () => { cancelled = true; };
  }, [authUserId, state.activeChannel, resyncTick, watchedRemoteChannels]);

  // Realtime subscription to new messages (RLS scopes us to lobby + our DMs).
  // Public browse also subscribes to Lobby inserts (anon SELECT policy).
  useEffect(() => {
    const channel = supabase
      .channel(`palrgo-messages-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as Parameters<typeof rowToMessage>[0];
        // Public visitors only receive Lobby messages.
        if (!authUserId && row.channel_id !== "lobby") return;
        if (seenRemoteMsgIds.current.has(row.id)) return;
        seenRemoteMsgIds.current.add(row.id);
        const msg = rowToMessage(row, authUserId);
        // Sync shared game state piggybacked on the message
        const attachMeta = msg.attachment as unknown as { __gameState?: GameState; __buzz?: { actor?: string; reason: string } } | undefined;
        const gs = attachMeta?.__gameState;
        const buzz = attachMeta?.__buzz;
        if (gs || buzz) {
          // strip the sentinel so it doesn't render as a file attachment
          msg.attachment = undefined;
        }
        if (buzz && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("palrgo:buzz", { detail: buzz }));
        }

        setState(s => {
          const existing = s.messages[msg.channelId] || [];
          if (existing.some(m => m.id === msg.id)) return s;
          let games = s.games;
          if (gs) {
            if (gs.type) games = { ...games, [msg.channelId]: gs };
            else games = Object.fromEntries(Object.entries(games).filter(([k]) => k !== msg.channelId));
          }
          // Auto-open DM for the receiver so the conversation shows up in their inbox.
          let dmOrder = s.dmOrder;
          if (msg.channelId.startsWith("dm:") && msg.authorId !== "me" && authUserId) {
            const parts = msg.channelId.slice(3).split(":");
            const peerId = parts.find(p => p !== authUserId);
            if (peerId && !dmOrder.includes(peerId)) {
              dmOrder = [...dmOrder, peerId];
            }
          }
          return {
            ...s,
            games,
            dmOrder,
            messages: { ...s.messages, [msg.channelId]: [...existing, msg].sort((a, b) => a.ts - b.ts) },
          };
        });

        if (msg.channelId.startsWith("dm:")) {
          setDmLatestTs(prev => (prev[msg.channelId] ?? 0) >= msg.ts ? prev : { ...prev, [msg.channelId]: msg.ts });
        }

        if (msg.authorId !== "me") {
          if (msg.channelId.startsWith("dm:")) {
            playDmPing();
          } else {
            playPublicChatTick();
            const myName = (typeof window !== "undefined" ? username : "");
            if (myName && new RegExp(`@${myName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(msg.text)) {
              playMentionPing();
            }
            if (shouldNotifyChatMessage({
              authorId: msg.authorId,
              channelId: msg.channelId,
              kind: msg.kind,
              authUserId,
            })) {
              const path = typeof window !== "undefined" ? window.location.pathname : "";
              const onChatPage = path === "/chatroom" || path === "/chat" || path === "/";
              const viewingThisRoom = onChatPage && stateRef.current.activeChannel === msg.channelId;
              if (!viewingThisRoom) {
                setRoomUnread((prev) => ({ ...prev, [msg.channelId]: (prev[msg.channelId] ?? 0) + 1 }));
              }
              const roomName = roomDisplayName(msg.channelId, stateRef.current.rooms[msg.channelId]?.name);
              const actorName = stateRef.current.users[msg.authorId]?.name || "Someone";
              showChatBrowserNotification({
                eventId: `msg:${msg.id}`,
                kind: "message",
                channelId: msg.channelId,
                roomName,
                actorName,
                preview: msg.text,
              });
            }
          }
        }
        rtLog(msg.channelId.startsWith("dm:") ? "dm" : "msg", "in", `${msg.channelId} · ${msg.text.slice(0, 30)}`);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
        const oldRow = payload.old as { id?: string; channel_id?: string } | null;
        const delId = oldRow?.id;
        const delChan = oldRow?.channel_id;
        setState(s => {
          if (delChan && s.messages[delChan]) {
            const filtered = delId
              ? s.messages[delChan].filter(m => m.id !== delId)
              : s.messages[delChan].filter(m => m.kind === "system");
            if (filtered.length === s.messages[delChan].length) return s;
            return { ...s, messages: { ...s.messages, [delChan]: filtered } };
          }
          if (!delId) return s;
          // Unknown channel — scan all channels for the id
          let changed = false;
          const next: typeof s.messages = {};
          for (const [ch, msgs] of Object.entries(s.messages)) {
            const f = msgs.filter(m => m.id !== delId);
            if (f.length !== msgs.length) changed = true;
            next[ch] = f;
          }
          return changed ? { ...s, messages: next } : s;
        });
      })
      .subscribe(status => rtLog("ws", status, "messages"));
    return () => { supabase.removeChannel(channel); };
  }, [authUserId]);

  // ---- DM read receipts ----
  // Realtime subscribe to dm_reads changes (RLS scopes to my channels)
  useEffect(() => {
    if (!authUserId) return;
    const ch = supabase
      .channel(`palrgo-dm-reads-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dm_reads" }, (payload) => {
        const row = (payload.new ?? payload.old) as { user_id: string; channel_id: string; last_read_at: string } | null;
        if (!row) return;
        const ts = new Date(row.last_read_at).getTime();
        setDmReads(prev => {
          const ch = prev[row.channel_id] || {};
          if ((ch[row.user_id] ?? 0) >= ts) return prev;
          return { ...prev, [row.channel_id]: { ...ch, [row.user_id]: ts } };
        });
      })
      .subscribe(status => rtLog("ws", status, "dm-reads"));
    return () => { supabase.removeChannel(ch); };
  }, [authUserId]);

  // Fetch read markers for the active DM channel
  useEffect(() => {
    if (!authUserId) return;
    const channelId = state.activeChannel;
    if (!channelId.startsWith("dm:") || !isRemoteDmChannel(channelId, authUserId)) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("dm_reads")
        .select("user_id, channel_id, last_read_at")
        .eq("channel_id", channelId);
      if (cancelled || !data) return;
      setDmReads(prev => {
        const ch = { ...(prev[channelId] || {}) };
        for (const r of data) ch[r.user_id] = new Date(r.last_read_at).getTime();
        return { ...prev, [channelId]: ch };
      });
    })();
    return () => { cancelled = true; };
  }, [authUserId, state.activeChannel]);

  const markDmRead = useCallback(async (channelId: string) => {
    if (!authUserId || !isRemoteDmChannel(channelId, authUserId)) return;
    const result = await markDmConversationRead(authUserId, channelId);
    if (!result) return;
    const ts = new Date(result.lastReadAt).getTime();
    setDmReads(prev => {
      const ch = { ...(prev[channelId] || {}) };
      if ((ch[authUserId] ?? 0) >= ts) return prev;
      ch[authUserId] = ts;
      return { ...prev, [channelId]: ch };
    });
  }, [authUserId]);

  // Upsert my read marker when I open a DM or new msgs arrive while viewing
  const [roomUnread, setRoomUnread] = useState<Record<string, number>>({});
  const lastMsgTsRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!authUserId) return;
    const channelId = state.activeChannel;
    if (!channelId.startsWith("dm:") || !isRemoteDmChannel(channelId, authUserId)) return;
    const msgs = state.messages[channelId] || [];
    const latest = msgs.length ? msgs[msgs.length - 1].ts : Date.now();
    if (lastMsgTsRef.current[channelId] === latest) return;
    lastMsgTsRef.current[channelId] = latest;
    if (typeof document !== "undefined" && document.hidden) return;
    void markDmRead(channelId);
  }, [authUserId, state.activeChannel, state.messages, markDmRead]);



  // Expose a logout hook: when the starter of a Ludo game signs out,
  // automatically post a stop message to each affected channel so all
  // other players see the game end and clear it from their state.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __lovableEndMyLudoGames?: () => Promise<void> }).__lovableEndMyLudoGames = async () => {
      const cur = stateRef.current;
      const myName = cur.me?.name;
      if (!myName || !authUserId) return;
      const channels = Object.entries(cur.games).filter(
        ([, g]) => g?.type === "ludo" && g?.data?.players?.[0]?.name === myName
      ).map(([ch]) => ch);
      if (channels.length === 0) return;
      await Promise.all(channels.map(async ch => {
        const id = newUuid();
        seenRemoteMsgIds.current.add(id);
        const attachment = { __gameState: { channelId: ch, type: null, data: null } } as unknown as Attachment;
        try {
          await supabase.from("messages").insert({
            id, channel_id: ch, author_id: authUserId,
            text: `🛑 Ludo game ended — **@${myName}** (host) left the chat.`,
            kind: "game", attachment: attachment as never, reply_to_id: null,
          });
        } catch (e) {
          console.error("end-ludo-on-logout failed", e);
        }
      }));
    };
    return () => {
      try { delete (window as unknown as { __lovableEndMyLudoGames?: unknown }).__lovableEndMyLudoGames; } catch {}
    };
  }, [authUserId]);


  // SpamBot — tracks recent sends per channel to detect flooding / duplicates / shouting
  const spamHistoryRef = useRef<Record<string, { ts: number; text: string }[]>>({});
  const spamOffencesRef = useRef<Record<string, { count: number; until: number }>>({});
  

  const setActive = useCallback((channelId: string) => {
    setState(s => ({ ...s, activeChannel: channelId }));
    setReplyingTo(null);
    setRoomUnread((prev) => {
      if (!prev[channelId]) return prev;
      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  }, []);

  const send = useCallback((text: string, opts?: { attachment?: Attachment; replyToId?: string; channelId?: string }) => {
    const trimmed = text.trim();
    const attachment = opts?.attachment;
    const replyToId = opts?.replyToId;
    const channelOverride = opts?.channelId;
    if (!trimmed && !attachment) return;
    // Game rooms disallow user chat — only auto-generated system events appear.
    {
      const ch = channelOverride || stateRef.current.activeChannel;
      if (ch && !ch.startsWith("dm:") && stateRef.current.rooms[ch]?.kind === "game") {
        setReplyingTo(null);
        return;
      }
    }
    if (isGuest) {
      // Public browse mode: never create local or remote messages.
      // MessageInput / AuthGate must open sign-in instead.
      return;
    }
    type Outgoing = { id: string; channelId: string; text: string; kind: string; attachment: Attachment | null; replyToId: string | null };
    const outgoingRemotes: Outgoing[] = [];
    setState(s => {
      const channelId = channelOverride || s.activeChannel;
      const isSlashMod = /^\/(mute|kick)\b/i.test(trimmed);
      const isCmd = trimmed.startsWith("!") || isSlashMod;
      const cmdInput = isSlashMod ? "!" + trimmed.slice(1) : trimmed;
      // Enforce mute/kick on the sender for this channel
      const now = Date.now();
      const selfMod = s.moderation?.[channelId]?.me;
      const room = s.rooms[channelId];
      if (selfMod?.mutedUntil && selfMod.mutedUntil > now) {
        const secs = Math.ceil((selfMod.mutedUntil - now) / 1000);
        const sysId = uid();
        return {
          ...s,
          messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), { id: sysId, channelId, authorId: "bot-gamebot", text: `🔇 You are muted for another ${Math.ceil(secs/60)}m ${secs%60}s.`, ts: now, kind: "system" }] },
        };
      }
      if (room && selfMod?.kickedUntil && selfMod.kickedUntil > now) {
        const secs = Math.ceil((selfMod.kickedUntil - now) / 1000);
        const sysId = uid();
        return {
          ...s,
          messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), { id: sysId, channelId, authorId: "bot-gamebot", text: `🚪 You were kicked. Re-entry in ${Math.ceil(secs/60)}m ${secs%60}s.`, ts: now, kind: "system" }] },
        };
      }
      // If muted in lobby, restrict to DMs with existing friends only
      const lobbyMod = s.moderation?.["lobby"]?.me;
      if (lobbyMod?.mutedUntil && lobbyMod.mutedUntil > now && channelId !== "lobby") {
        const secs = Math.ceil((lobbyMod.mutedUntil - now) / 1000);
        const friends = s.me.friends ?? [];
        if (channelId.startsWith("dm:")) {
          const { peerId: otherId } = parseDmChannel(channelId, authUserId);
          if (otherId && !friends.includes(otherId)) {
            const sysId = uid();
            return {
              ...s,
              messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), { id: sysId, channelId, authorId: "bot-spam", text: `🔇 You're muted (${Math.ceil(secs/60)}m left). While muted you can only DM users on your friends list.`, ts: now, kind: "system" }] },
            };
          }
        } else {
          const sysId = uid();
          return {
            ...s,
            messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), { id: sysId, channelId, authorId: "bot-spam", text: `🔇 You're muted in the lobby. Public chat is paused — DM a friend instead.`, ts: now, kind: "system" }] },
          };
        }
      }

      // SpamBot — only in public rooms, skip commands and DMs
      if (room && !isCmd && !channelId.startsWith("dm:")) {
        const hist = (spamHistoryRef.current[channelId] || []).filter(h => now - h.ts < 10_000);
        hist.push({ ts: now, text: trimmed });
        spamHistoryRef.current[channelId] = hist;
        const letters = trimmed.replace(/[^a-zA-Z]/g, "");
        const upperRatio = letters.length > 10 ? letters.replace(/[^A-Z]/g, "").length / letters.length : 0;
        const linkCount = (trimmed.match(/\b(https?:\/\/|www\.)\S+/gi) || []).length;
        const repeatedChars = /(.)\1{9,}/.test(trimmed);
        const dupCount = hist.filter(h => h.text === trimmed).length;
        const floodCount = hist.length;
        const reason =
          floodCount >= 5 ? "flooding the chat (5+ msgs in 10s)" :
          dupCount >= 3 ? "posting the same message repeatedly" :
          upperRatio >= 0.8 ? "SHOUTING in ALL CAPS" :
          linkCount >= 3 ? "posting too many links at once" :
          repeatedChars ? "spamming repeated characters" :
          null;
        if (reason) {
          const off = spamOffencesRef.current[channelId] || { count: 0, until: 0 };
          const fresh = now - off.until > 10 * 60 * 1000 ? { count: 0, until: 0 } : off;
          fresh.count += 1;
          fresh.until = now;
          spamOffencesRef.current[channelId] = fresh;
          const sysMsgs: Message[] = [];
          if (fresh.count >= 2) {
            const muteMs = 2 * 60 * 1000;
            const chanMod = { ...(s.moderation?.[channelId] || {}) };
            const meMod: ModEntry = { ...(chanMod.me || { muteVotes: [], kickVotes: [] }), mutedUntil: now + muteMs };
            chanMod.me = meMod;
            sysMsgs.push({ id: uid(), channelId, authorId: "bot-spam", kind: "system", ts: now, text: `🛑 **SpamBot:** Auto-muted for **2 minutes** — ${reason}.` });
            spamHistoryRef.current[channelId] = [];
            spamOffencesRef.current[channelId] = { count: 0, until: now };
            return {
              ...s,
              moderation: { ...(s.moderation || {}), [channelId]: chanMod },
              messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), ...sysMsgs] },
            };
          }
          sysMsgs.push({ id: uid(), channelId, authorId: "bot-spam", kind: "system", ts: now, text: `⚠️ **SpamBot:** Warning — ${reason}. Next offence = 2 min mute.` });
          return {
            ...s,
            messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), ...sysMsgs] },
          };
        }
      }
      const remote = authUserId && isRemoteChannel(channelId, authUserId);
      const msgId = remote ? newUuid() : uid();
      const userMsg: Message = {
        id: msgId, channelId, authorId: "me",
        text: trimmed, ts: Date.now(),
        kind: trimmed.startsWith("/me ") ? "me" : "text",
        attachment, replyToId,
      };
      if (remote) {
        seenRemoteMsgIds.current.add(msgId);
        outgoingRemotes.push({
          id: msgId, channelId, text: trimmed,
          kind: userMsg.kind ?? "text",
          attachment: attachment ?? null,
          replyToId: replyToId ?? null,
        });
      }
      const existing = s.messages[channelId] || [];
      const meXp = (s.me.xp ?? 0) + 1;
      const meMsgCount = (s.me.messageCount ?? 0) + 1;
      const meCmdCount = (s.me.commandCount ?? 0) + (isCmd ? 1 : 0);
      const meNext: User = {
        ...s.users.me,
        xp: meXp, level: xpToLevel(meXp),
        messageCount: meMsgCount,
        commandCount: meCmdCount,
      };
      let next: State = {
        ...s,
        me: { ...s.me, xp: meXp, level: meNext.level, messageCount: meMsgCount, commandCount: meCmdCount },
        users: { ...s.users, me: meNext },
        messages: { ...s.messages, [channelId]: [...existing, userMsg] },
      };
      // Block ALL bot commands inside user DMs (non-bot) — commands only work in chatrooms
      const dmPeerId = channelId.startsWith("dm:") ? channelId.slice(3) : null;
      const dmPeer = dmPeerId ? next.users[dmPeerId] : null;
      const inUserDm = !!dmPeer && !dmPeer.isBot;
      if (isCmd && inUserDm) {
        const sysMsg: Message = {
          id: uid(), channelId, authorId: "bot-gamebot", ts: Date.now() + 200,
          text: `🚫 Bot commands like **!help** aren't available in private messages. Head to a chatroom to use them.`,
          kind: "system",
        };
        return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], sysMsg] } };
      }
      // Block game commands inside bot DMs — games are chatroom-only
      const inBotDm = !!dmPeer && dmPeer.isBot;
      const allowedInDm = /^!(help|stats|nick|me)\b/i.test(trimmed);
      if (isCmd && inBotDm && !allowedInDm) {
        const targetId = channelId.slice(3);
        const sysMsg: Message = {
          id: uid(), channelId, authorId: targetId, ts: Date.now() + 400,
          text: `🚫 Games aren't available in DMs. Hop into a chatroom to play! I can still answer questions about my commands here — just ask. (Try !help to see what I can do.)`,
          kind: "system",
        };
        setTimeout(() => playDmPing(), 400);
        return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], sysMsg] } };
      }
      if (isCmd) {
        // Global scheduled event gate for !fish, !dig, !wine.
        // Replaces the old per-user cooldown with a community event window.
        const cdMatch = trimmed.match(/^!(fish|dig|wine)\b/i);
        if (cdMatch && channelId === GAMES_CHANNEL_ID) {
          const cmdName = cdMatch[1].toLowerCase() as BotEventKind;
          const cfg = getBotEventsConfig()[cmdName];
          const evt = computeEventState(cmdName, cfg, now);
          const meta = BOT_EVENT_META[cmdName];
          const userKey = next.me.name;
          const mkSys = (text: string): Message => ({
            id: uid(), channelId, authorId: meta.botId, ts: now + 200, text, kind: "system",
          });
          if (!cfg.enabled) {
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`⛔ ${meta.label} is currently disabled by the admin.`)] } };
          }
          if (!evt.live) {
            const mins = Math.max(1, Math.ceil(evt.msUntilOpen / 60_000));
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`⏳ ${meta.emoji} ${meta.label} isn't open right now. Next round in **${mins}m**.`)] } };
          }
          const used = getAttempts(userKey, evt.cycleId);
          const cap = Math.max(1, cfg.max_attempts);
          if (used >= cap) {
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`✋ You've already joined this ${meta.label}. Please wait for the next round.`)] } };
          }
          recordAttempt(userKey, evt.cycleId);
        }

        const result = runCommand(cmdInput, { state: next, channelId, actor: next.me.name });
        const sysMsgs: Message[] = result.replies.map((r: { text: string; from?: string }, idx: number) => {
          const id = remote ? newUuid() : uid();
          // Piggyback game state + buzz on the first reply so other users sync
          const piggyback = (remote && idx === 0 && (result.gameUpdate || result.buzz))
            ? ({
                ...(result.gameUpdate ? { __gameState: result.gameUpdate } : {}),
                ...(result.buzz ? { __buzz: { actor: s.me.name, reason: result.buzz.reason } } : {}),
              } as unknown as Attachment)
            : undefined;
          if (remote) {
            seenRemoteMsgIds.current.add(id);
            outgoingRemotes.push({
              id, channelId, text: r.text, kind: "game",
              attachment: (piggyback ?? null) as Attachment | null,
              replyToId: null,
            });
          }
          return {
            id, channelId, authorId: commandReplyAuthor(r.from, channelId),
            text: r.text, ts: Date.now(), kind: "game",
          };
        });
        next = {
          ...next,
          messages: appendChannelMessages(next.messages, channelId, sysMsgs),
          games: result.gameUpdate
            ? (result.gameUpdate.type
                ? { ...next.games, [channelId]: result.gameUpdate }
                : Object.fromEntries(Object.entries(next.games).filter(([k]) => k !== channelId)))
            : next.games,
        };
        if (result.buzz && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("palrgo:buzz", {
            detail: { actor: s.me.name, reason: result.buzz.reason },
          }));
        }

        if (result.moderation) {
          const { targetId, targetName, action } = result.moderation;
          const voter = next.me.name;
          const chanMod = { ...(next.moderation?.[channelId] || {}) };
          const prev: ModEntry = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
          const voteKey = action === "mute" ? "muteVotes" : "kickVotes";
          const threshold = action === "mute" ? MUTE_THRESHOLD : KICK_THRESHOLD;
          const votes = prev[voteKey].includes(voter) ? prev[voteKey] : [...prev[voteKey], voter];
          const updated: ModEntry = { ...prev, [voteKey]: votes };
          const sysMsgs: Message[] = [];
          const tsNow = Date.now();
          const modBot = channelId === GAMES_CHANNEL_ID ? "bot-gamebot" : "bot-spam";
          sysMsgs.push({
            id: uid(), channelId, authorId: modBot, kind: "system", ts: tsNow,
            text: `⚖️ **${voter}** voted to /${action} **@${targetName}** — ${votes.length}/${threshold} votes`,
          });
          if (votes.length >= threshold) {
            const until = tsNow + MOD_DURATION_MS;
            if (action === "mute") {
              updated.mutedUntil = until;
              updated.muteVotes = [];
              sysMsgs.push({
                id: uid(), channelId, authorId: modBot, kind: "system", ts: tsNow + 1,
                text: `🔇 **@${targetName}** has been **MUTED** for 5 minutes by community vote.`,
              });
            } else {
              updated.kickedUntil = until;
              updated.kickVotes = [];
              sysMsgs.push({
                id: uid(), channelId, authorId: modBot, kind: "system", ts: tsNow + 1,
                text: `🚪 **@${targetName}** has been **KICKED** from the room for 5 minutes by community vote.`,
              });
            }
          }
          chanMod[targetId] = updated;
          next = {
            ...next,
            moderation: { ...(next.moderation || {}), [channelId]: chanMod },
            messages: appendChannelMessages(next.messages, channelId, sysMsgs),
          };
        }
      } else {
        const room = next.rooms[channelId];
        if (room) {
          const mentionedBot = findMentionedRoomBot(trimmed, next.users, room.members);
          if (mentionedBot && canMentionedBotReply(mentionedBot, channelId)) {
            const bot = next.users[mentionedBot];
            if (bot) {
              let reply: string;
              if (mentionedBot === "bot-echo") {
                reply = echoMentionReply(trimmed, bot.name);
              } else if (isHelpQuery(trimmed)) {
                reply = botHelpReply(mentionedBot, bot.name);
              } else {
                reply = botMentionAck(bot.name);
              }
              const m: Message = {
                id: uid(), channelId, authorId: mentionedBot, text: reply, ts: Date.now() + 800,
              };
              next = { ...next, messages: appendChannelMessage(next.messages, channelId, m) };
            }
          }
        } else if (channelId.startsWith("dm:")) {
          const targetId = channelId.slice(3);
          const target = next.users[targetId];
          if (target?.isBot && isHelpQuery(trimmed)) {
            const reply = botHelpReply(targetId, target.name);
            const m: Message = { id: uid(), channelId, authorId: targetId, text: reply, ts: Date.now() + 600 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
            setTimeout(() => playDmPing(), 600);
          }
        }
      }
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } }));
        }, 200);
      }
      return badged.state;
    });
    if (outgoingRemotes.length && authUserId) {
      const safeRemotes = outgoingRemotes.filter((out) => isRemoteChannel(out.channelId, authUserId));
      for (const out of safeRemotes) {
        rtLog(out.channelId.startsWith("dm:") ? "dm" : "msg", "out", `${out.channelId} · ${out.text.slice(0, 30)}`);
      }
      if (safeRemotes.length) {
      void supabase.from("messages").insert(
        safeRemotes.map(out => ({
          id: out.id,
          channel_id: out.channelId,
          author_id: authUserId,
          text: out.text,
          kind: out.kind,
          attachment: out.attachment as unknown as never,
          reply_to_id: out.replyToId,
        }))
      ).then(({ error }) => {
        if (error) { console.error("send failed", error); rtLog("error", "send-failed", error.message); }
        else {
          // Fire-and-forget AI chatbot reply for chatroom messages
          for (const out of safeRemotes) {
            if (out.channelId.startsWith("dm:") || out.kind === "system") continue;
            // AI chatbots only respond when explicitly @mentioned (validated server-side too).
            if (/@\w/.test(out.text)) {
              import("@/lib/ai-chatbots.functions").then(({ aiChatbotReply }) => {
                aiChatbotReply({ data: { channel_id: out.channelId, text: out.text } }).catch(() => {});
              }).catch(() => {});
            }
            // BooBubble ChatGPT lobby reply — trigger on any "boobubble" mention (case-insensitive)
            if (out.kind === "text" && /boobubble/i.test(out.text)) {
              import("@/lib/boobubble.functions").then(({ askBoobubbleInLobby }) => {
                askBoobubbleInLobby({ data: { channel_id: out.channelId, text: out.text } }).catch(() => {});
              }).catch(() => {});
            }
          }
        }
      });
      }
    }
    setReplyingTo(null);
  }, [authUserId, isGuest]);

  const startDM = useCallback((userId: string) => {
    if (isGuest || !authUserId) {
      // Public browse / unauthenticated: UI must open AuthGate — never start a DM session.
      return;
    }
    if (isLocalBotPeerId(userId)) {
      const channelId = dmChannelFor(authUserId, userId);
      if (!channelId) return;
      setState(s => {
        const next: State = {
          ...s,
          dmOrder: s.dmOrder.includes(userId) ? s.dmOrder : [...s.dmOrder, userId],
          activeChannel: channelId,
        };
        const badged = applyBadges(next);
        if (badged.newBadges.length && typeof window !== "undefined") {
          setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
        }
        return badged.state;
      });
      return;
    }
    if (!authUserId || !isUuid(authUserId)) {
      showDmParticipantError("Could not open DM — sign in again and retry.");
      if (import.meta.env.DEV) console.warn("[chat-store] startDM blocked: missing auth UUID");
      return;
    }
    if (!isUuid(userId)) {
      showDmParticipantError("Could not open DM — this profile is not available yet.");
      if (import.meta.env.DEV) console.warn("[chat-store] startDM blocked: invalid target id", userId);
      return;
    }
    const channelId = dmChannelFor(authUserId, userId);
    if (!channelId) {
      showDmParticipantError("Could not open DM — invalid conversation.");
      return;
    }
    setState(s => {
      const next: State = {
        ...s,
        dmOrder: s.dmOrder.includes(userId) ? s.dmOrder : [...s.dmOrder, userId],
        activeChannel: channelId,
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
    void markDmRead(channelId);
  }, [authUserId, isGuest, markDmRead]);

  const closeDM = useCallback((userId: string) => {
    const channelId = dmChannelFor(authUserId, userId);
    if (!channelId) return;
    setState(s => ({
      ...s,
      dmOrder: s.dmOrder.filter(id => id !== userId),
      activeChannel: s.activeChannel === channelId ? s.roomOrder[0] || s.activeChannel : s.activeChannel,
    }));
  }, [authUserId]);

  const joinRoom = useCallback((roomId: string) => {
    setState(s => {
      const room = s.rooms[roomId];
      if (!room || room.members.includes("me")) return { ...s, activeChannel: roomId };
      const next: State = {
        ...s,
        rooms: { ...s.rooms, [roomId]: { ...room, members: [...room.members, "me"] } },
        activeChannel: roomId,
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
  }, []);

  const createRoom = useCallback((name: string, topic: string) => {
    setState(s => {
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + uid().slice(0, 4);
      const room: Room = {
        id, name, topic: topic || "New room",
        members: ["me"],
        roles: { me: "owner" },
        isPublic: true,
      };
      const next: State = {
        ...s,
        rooms: { ...s.rooms, [id]: room },
        roomOrder: [...s.roomOrder, id],
        activeChannel: id,
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
  }, []);

  const updateMe = useCallback((patch: Partial<User>) => {
    setState(s => ({
      ...s,
      me: { ...s.me, ...patch },
      users: { ...s.users, me: { ...s.users.me, ...patch } },
    }));
  }, []);

  const adjustPoints = useCallback((userId: string, delta: number) => {
    setState(s => {
      const u = s.users[userId];
      if (!u) return s;
      const newXp = Math.max(0, u.xp + delta);
      const updated: User = { ...u, xp: newXp, level: xpToLevel(newXp) };
      const next: State = {
        ...s,
        users: { ...s.users, [userId]: updated },
        me: userId === "me" ? { ...s.me, xp: newXp, level: updated.level } : s.me,
      };
      if (userId === "me") {
        const badged = applyBadges(next);
        if (badged.newBadges.length && typeof window !== "undefined") {
          setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
        }
        return badged.state;
      }
      return next;
    });
  }, []);

  const adjustCoins = useCallback((userId: string, delta: number) => {
    setState(s => {
      const u = s.users[userId];
      if (!u) return s;
      const newCoins = Math.max(0, (u.coins ?? 0) + delta);
      const updated: User = { ...u, coins: newCoins };
      return {
        ...s,
        users: { ...s.users, [userId]: updated },
        me: userId === "me" ? { ...s.me, coins: newCoins } : s.me,
      };
    });
  }, []);

  const toggleSocial = useCallback((key: "friends" | "blocked", userId: string, add: boolean) => {
    setState(s => {
      const me = s.users.me;
      const list = new Set(me[key] ?? []);
      if (add) list.add(userId); else list.delete(userId);
      // friend/block are mutually exclusive
      const other = key === "friends" ? "blocked" : "friends";
      const otherList = new Set(me[other] ?? []);
      if (add) otherList.delete(userId);
      const updated: User = { ...me, [key]: [...list], [other]: [...otherList] };
      return {
        ...s,
        me: { ...s.me, [key]: updated[key], [other]: updated[other] },
        users: { ...s.users, me: updated },
      };
    });
  }, []);

  const addFriend = useCallback((id: string) => toggleSocial("friends", id, true), [toggleSocial]);
  const removeFriend = useCallback((id: string) => toggleSocial("friends", id, false), [toggleSocial]);
  const blockUser = useCallback((id: string) => toggleSocial("blocked", id, true), [toggleSocial]);
  const unblockUser = useCallback((id: string) => toggleSocial("blocked", id, false), [toggleSocial]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKeyFor(username));
    streakChecked.current = null;
    setState(seed(username));
  }, [username]);

  const findMessage = useCallback((id: string) => {
    for (const arr of Object.values(state.messages)) {
      const m = arr.find(x => x.id === id);
      if (m) return m;
    }
    return undefined;
  }, [state.messages]);

  const staffKick = useCallback((targetId: string, channelId: string, targetName: string) => {
    setState(s => {
      const chanMod = { ...(s.moderation?.[channelId] || {}) };
      const prev: ModEntry = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
      const until = Date.now() + 5 * 60 * 1000;
      chanMod[targetId] = { ...prev, kickedUntil: until, kickVotes: [] };
      const sys: Message = {
        id: uid(), channelId, authorId: "bot-gamebot", kind: "system", ts: Date.now(),
        text: `🚪 **@${targetName}** was **KICKED** from the room by staff (5 min).`,
      };
      return {
        ...s,
        moderation: { ...(s.moderation || {}), [channelId]: chanMod },
        messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), sys] },
      };
    });
  }, []);

  const staffLocalMute = useCallback((targetId: string, channelId: string, minutes: number, targetName: string) => {
    setState(s => {
      const chanMod = { ...(s.moderation?.[channelId] || {}) };
      const prev: ModEntry = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
      const until = Date.now() + minutes * 60 * 1000;
      chanMod[targetId] = { ...prev, mutedUntil: until, muteVotes: [] };
      const sys: Message = {
        id: uid(), channelId, authorId: "bot-gamebot", kind: "system", ts: Date.now(),
        text: `🔇 **@${targetName}** was **MUTED** by staff (${minutes} min).`,
      };
      return {
        ...s,
        moderation: { ...(s.moderation || {}), [channelId]: chanMod },
        messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), sys] },
      };
    });
  }, []);


  const pushPresenceEvent = useCallback((channelId: string, kind: "join" | "leave", userName: string) => {
    const text = formatPresenceLineText(kind, userName);
    setState((s) => ({
      ...s,
      messages: appendChannelMessage(s.messages, channelId, {
        id: uid(),
        channelId,
        authorId: SYSTEM_PRESENCE_AUTHOR,
        text,
        ts: Date.now(),
        kind: "system",
      }),
    }));
    if (shouldNotifyPresence({ userName, channelId, authUserId })) {
      const roomName = roomDisplayName(channelId, stateRef.current.rooms[channelId]?.name);
      showChatBrowserNotification({
        eventId: `presence:${channelId}:${kind}:${userName}:${Math.floor(Date.now() / 30_000)}`,
        kind,
        channelId,
        roomName,
        actorName: userName.trim() || "Someone",
      });
    }
  }, [authUserId]);

  const pushSystem = useCallback((channelId: string, text: string) => {
    if (channelId !== GAMES_CHANNEL_ID) {
      // Non-game system notices outside #games use SpamBot so they stay visible.
      setState((s) => ({
        ...s,
        messages: appendChannelMessage(s.messages, channelId, {
          id: uid(),
          channelId,
          authorId: "bot-spam",
          text,
          ts: Date.now(),
          kind: "system",
        }),
      }));
      return;
    }
    setState((s) => ({
      ...s,
      messages: appendChannelMessage(s.messages, channelId, {
        id: uid(),
        channelId,
        authorId: "bot-gamebot",
        text,
        ts: Date.now(),
        kind: "system",
      }),
    }));
  }, []);

  const wipeChannel = useCallback((channelId: string) => {
    setState(s => ({ ...s, messages: { ...s.messages, [channelId]: [] } }));
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setState(s => {
      if (!s.rooms[roomId]) return s;
      const { [roomId]: _removed, ...rooms } = s.rooms;
      const { [roomId]: _msgs, ...messages } = s.messages;
      const roomOrder = s.roomOrder.filter(id => id !== roomId);
      const activeChannel = s.activeChannel === roomId ? (roomOrder[0] || "lobby") : s.activeChannel;
      return { ...s, rooms, messages, roomOrder, activeChannel };
    });
  }, []);

  const syncAdminChannels = useCallback((channels: AdminChannelInput[]) => {
    setState(s => {
      const rooms = { ...s.rooms };
      let roomOrder = [...(s.roomOrder ?? [])];
      const validIds = new Set(channels.map(c => c?.id).filter((id): id is string => typeof id === "string" && !!id));
      // Add or update admin-managed rooms
      for (const c of channels) {
        if (!c || typeof c.id !== "string" || !c.id) continue;
        const name = typeof c.name === "string" && c.name.trim() ? c.name : c.id;
        const kind = c.kind ?? "chat";
        const existing = rooms[c.id];
        if (existing) {
          rooms[c.id] = {
            ...existing,
            name,
            topic: c.topic || existing.topic || "",
            kind,
            game: kind === "game" ? normalizeRoomGameConfig(c.game) : undefined,
            members: sanitizeRoomMembers(
              c.id,
              Array.isArray(existing.members) ? existing.members : ["me"],
            ),
          };
        } else {
          rooms[c.id] = {
            id: c.id,
            name,
            topic: c.topic || "",
            members: ["me"],
            roles: { me: "member" },
            isPublic: true,
            kind,
            game: kind === "game" ? normalizeRoomGameConfig(c.game) : undefined,
          };
          if (!roomOrder.includes(c.id)) roomOrder.push(c.id);
        }
      }
      // Remove previously admin-managed rooms (adm-* prefix) not in list
      const messages = { ...s.messages };
      for (const id of Object.keys(rooms)) {
        if (id.startsWith("adm-") && !validIds.has(id)) {
          delete rooms[id];
          delete messages[id];
          roomOrder = roomOrder.filter(x => x !== id);
        }
      }
      const activeChannel = rooms[s.activeChannel] ? s.activeChannel : (roomOrder[0] || "lobby");
      return { ...s, rooms, messages, roomOrder, activeChannel };
    });
  }, []);

  const registerCommunityRoom = useCallback((room: CommunityRoomInput) => {
    dbBackedRemoteChannels.add(room.id);
    setState(s => {
      const existing = s.rooms[room.id];
      const nextRoom: Room = {
        id: room.id,
        name: room.name,
        topic: room.topic || room.name,
        members: sanitizeRoomMembers(room.id, existing?.members ?? ["me"]),
        roles: existing?.roles ?? { me: "member" },
        isPublic: room.isPublic,
        kind: "chat",
        slug: room.slug,
        communityId: room.communityId,
        dbBacked: true,
      };
      const roomOrder = s.roomOrder.includes(room.id) ? s.roomOrder : [...s.roomOrder, room.id];
      return {
        ...s,
        rooms: { ...s.rooms, [room.id]: nextRoom },
        roomOrder,
        activeChannel: room.id,
      };
    });
  }, []);

  const leaveCommunityRoom = useCallback((roomId: string) => {
    dbBackedRemoteChannels.delete(roomId);
    setState(s => {
      if (!s.rooms[roomId]?.dbBacked) return s;
      const { [roomId]: _removed, ...rooms } = s.rooms;
      const roomOrder = s.roomOrder.filter(id => id !== roomId);
      const activeChannel =
        s.activeChannel === roomId ? (roomOrder[0] || "lobby") : s.activeChannel;
      return { ...s, rooms, roomOrder, activeChannel };
    });
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, setActive, send, startDM, closeDM, joinRoom, createRoom, updateMe,
    adjustPoints, adjustCoins, addFriend, removeFriend, blockUser, unblockUser,
    pushSystem, pushPresenceEvent, wipeChannel, deleteRoom, syncAdminChannels, registerCommunityRoom, leaveCommunityRoom,

    isFriend: (id) => (state.me.friends ?? []).includes(id),
    isBlocked: (id) => (state.me.blocked ?? []).includes(id),
    reset,
    channelMessages: (id) => filterVisibleMessages(id, (state.messages || {})[id] || []),
    channelLabel: (id) => {
      if (typeof id === "string" && id.startsWith("dm:")) {
        const { peerId } = parseDmChannel(id, authUserId);
        const u = peerId ? state.users[peerId] : undefined;
        return u ? u.name : "Direct Message";
      }
      return state.rooms[id]?.name || id;
    },
    isDM: (id) => typeof id === "string" && id.startsWith("dm:"),
    dmUser: (id) => {
      if (typeof id !== "string" || !id.startsWith("dm:")) return undefined;
      const { peerId } = parseDmChannel(id, authUserId);
      return peerId ? state.users[peerId] : undefined;
    },
    dmChannelFor: (peerId: string) => dmChannelFor(authUserId, peerId),
    watchRemoteChannel,
    replyingTo, setReplyingTo,
    findMessage,
    dmPeerReadAt: (channelId: string) => {
      if (!authUserId || !channelId.startsWith("dm:")) return 0;
      const reads = dmReads[channelId] || {};
      let max = 0;
      for (const [uid, ts] of Object.entries(reads)) {
        if (uid !== authUserId && ts > max) max = ts;
      }
      return max;
    },
    isDmUnread: (peerId: string) => {
      if (!authUserId || !isUuid(peerId)) return false;
      const ch = dmChannelFor(authUserId, peerId);
      if (!ch || !isRemoteDmChannel(ch, authUserId)) return false;
      if (state.activeChannel === ch) return false;
      const latest = dmLatestTs[ch] ?? 0;
      if (!latest) return false;
      const myRead = dmReads[ch]?.[authUserId] ?? 0;
      return latest > myRead;
    },
    dmUnreadCount: (() => {
      if (!authUserId) return 0;
      let n = 0;
      for (const peerId of state.dmOrder ?? []) {
        if (!isUuid(peerId)) continue;
        const ch = dmChannelFor(authUserId, peerId);
        if (!ch || !isRemoteDmChannel(ch, authUserId)) continue;
        if (state.activeChannel === ch) continue;
        const latest = dmLatestTs[ch] ?? 0;
        if (!latest) continue;
        const myRead = dmReads[ch]?.[authUserId] ?? 0;
        if (latest > myRead) n++;
      }
      return n;
    })(),
    staffKick,
    staffLocalMute,
    markDmRead,
    roomUnread,
  }), [state, setActive, send, startDM, closeDM, joinRoom, createRoom, updateMe, adjustPoints, adjustCoins, addFriend, removeFriend, blockUser, unblockUser, reset, replyingTo, findMessage, authUserId, dmReads, dmLatestTs, staffKick, staffLocalMute, pushSystem, pushPresenceEvent, wipeChannel, deleteRoom, syncAdminChannels, registerCommunityRoom, leaveCommunityRoom, markDmRead, roomUnread, watchRemoteChannel]);


  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function ChatProvider({ username, authUserId = null, isGuest = false, children }: { username: string; authUserId?: string | null; isGuest?: boolean; children: ReactNode }) {
  const [recoveryKey, setRecoveryKey] = useState(0);
  const handleRecover = useCallback(() => {
    try {
      localStorage.removeItem(storageKeyFor(username));
    } catch {
      /* ignore */
    }
    setRecoveryKey((k) => k + 1);
  }, [username]);

  return (
    <ChatErrorBoundary onRecover={handleRecover}>
      <ChatProviderInner key={recoveryKey} username={username} authUserId={authUserId} isGuest={isGuest}>
        {children}
      </ChatProviderInner>
    </ChatErrorBoundary>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}

export function useOptionalChat() {
  return useContext(ChatCtx);
}
