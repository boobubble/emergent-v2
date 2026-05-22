import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import type { User, Message, Room, GameState, Attachment } from "./chat-types";
import { runCommand } from "./commands";
import { evaluateBadges, todayKey, daysBetween } from "./achievements";
import { supabase } from "@/integrations/supabase/client";
import { useRemoteProfiles } from "./use-remote-profiles";
import { playDmPing, playMentionPing } from "./sounds";
import gamebotImg from "@/assets/bots/gamebot.png";
import novaImg from "@/assets/bots/nova.png";
import pixelImg from "@/assets/bots/pixel.png";
import echoImg from "@/assets/bots/echo.png";
import ryzeImg from "@/assets/bots/ryze.png";
import digbotImg from "@/assets/bots/digbot.png";
import fishbotImg from "@/assets/bots/fishbot.png";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string) { return UUID_RE.test(s); }

export function dmChannelFor(meId: string | null, peerId: string): string {
  if (!meId || !isUuid(peerId)) return `dm:${peerId}`;
  return "dm:" + [meId, peerId].sort().join(":");
}
function isRemoteChannel(channelId: string, meId: string | null): boolean {
  if (channelId === "lobby") return true;
  if (!meId) return false;
  return channelId.startsWith("dm:") && channelId.includes(meId);
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

const STORAGE_KEY_BASE = "palrgo:state:v3";
const SYNC_CHANNEL = "palrgo:sync:v3";
function storageKeyFor(username: string) { return `${STORAGE_KEY_BASE}:${username.toLowerCase()}`; }
const SEED_TIME = 1_700_000_000_000;

const AVATAR_COLORS = [
  "oklch(0.7 0.15 25)", "oklch(0.7 0.15 75)", "oklch(0.7 0.15 145)",
  "oklch(0.7 0.15 195)", "oklch(0.7 0.15 255)", "oklch(0.7 0.15 305)",
  "oklch(0.75 0.13 50)", "oklch(0.7 0.18 340)",
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function xpToLevel(xp: number) { return Math.floor(xp / 50) + 1; }

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

const SEED_BOTS: User[] = [
  { id: "bot-gamebot", name: "GameBot", avatarColor: "oklch(0.78 0.13 195)", avatarUrl: gamebotImg, status: "online", isBot: true, xp: 9999, level: 99, bio: "Run !help to see games", streak: 30, longestStreak: 99, messageCount: 1200, badges: ["first_message","chatterbox","veteran","level_5","level_10","level_25","streak_3","streak_7","streak_30","gamer"] },
  { id: "bot-nova", name: "Nova", avatarColor: AVATAR_COLORS[3], avatarUrl: novaImg, status: "online", isBot: true, xp: 1240, level: 12, bio: "Casual chatter", streak: 5, longestStreak: 12, messageCount: 320, badges: ["first_message","chatterbox","level_5","level_10","streak_3"] },
  { id: "bot-pixel", name: "Pixel", avatarColor: AVATAR_COLORS[5], avatarUrl: pixelImg, status: "online", isBot: true, xp: 880, level: 9, bio: "Trivia addict", streak: 2, longestStreak: 8, messageCount: 210, badges: ["first_message","chatterbox","level_5","streak_3","gamer"] },
  { id: "bot-echo", name: "Echo", avatarColor: AVATAR_COLORS[1], avatarUrl: echoImg, status: "away", isBot: true, xp: 410, level: 5, streak: 1, longestStreak: 4, messageCount: 88, badges: ["first_message","chatterbox","level_5"] },
  { id: "bot-ryze", name: "Ryze", avatarColor: AVATAR_COLORS[0], avatarUrl: ryzeImg, status: "online", isBot: true, xp: 2100, level: 18, bio: "Mod & gamer", streak: 9, longestStreak: 21, messageCount: 540, badges: ["first_message","chatterbox","veteran","level_5","level_10","streak_3","streak_7","gamer"] },
  { id: "bot-dig", name: "DigBot", avatarColor: AVATAR_COLORS[6], avatarUrl: digbotImg, status: "online", isBot: true, xp: 1560, level: 14, bio: "⛏️ Digging for treasure. Try !dig", streak: 7, longestStreak: 18, messageCount: 410, badges: ["first_message","chatterbox","level_5","level_10","streak_3","streak_7","gamer"] },
  { id: "bot-fish", name: "FishBot", avatarColor: AVATAR_COLORS[2], avatarUrl: fishbotImg, status: "online", isBot: true, xp: 1320, level: 13, bio: "🎣 Casting lines all day. Try !fish", streak: 4, longestStreak: 15, messageCount: 360, badges: ["first_message","chatterbox","level_5","level_10","streak_3","gamer"] },
];

const SEED_ROOMS: Room[] = [
  {
    id: "lobby",
    name: "Lobby",
    topic: "Main hangout. Type !help for games.",
    members: ["me", ...SEED_BOTS.map(b => b.id)],
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
    { id: "seed-welcome", channelId: "lobby", authorId: "bot-gamebot", text: `🎉 Welcome to Palrgo, @${name}! Glad to have you here. Type !help to see commands, customize your profile from the account page, and jump into a game anytime.`, ts: SEED_TIME - 60000 },
    { id: "seed-nova", channelId: "lobby", authorId: "bot-nova", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 40000 },
    { id: "seed-ryze", channelId: "lobby", authorId: "bot-ryze", text: "anyone up for trivia?", ts: SEED_TIME - 20000 },
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
  const hasWelcome = lobbyMsgs.some(m => m.id === "seed-welcome");
  const dmMsgs = state.messages?.["dm:bot-gamebot"] || [];
  const hasDmWelcome = dmMsgs.some(m => m.id === "seed-dm-welcome");
  if (hasWelcome && hasDmWelcome) return state;
  const welcomeLobby: Message[] = hasWelcome ? [] : [
    { id: "seed-welcome", channelId: "lobby", authorId: "bot-gamebot", text: `🎉 Welcome to Palrgo, @${name}! Glad to have you here. Type !help to see commands, customize your profile from the account page, and jump into a game anytime.`, ts: SEED_TIME - 60000 },
    { id: "seed-nova", channelId: "lobby", authorId: "bot-nova", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 40000 },
  ];
  const welcomeDm: Message[] = hasDmWelcome ? [] : [
    { id: "seed-dm-welcome", channelId: "dm:bot-gamebot", authorId: "bot-gamebot", text: `Hi @${name}! 👋 I'm GameBot. Here's a quick start:\n• Type !help to see all commands\n• Try !trivia, !hangman, or !wordchain to play games\n• Earn XP, coins, and badges as you chat\n• Add friends from any user's profile\nHave fun! 🎮`, ts: SEED_TIME - 10000 },
  ];
  const dmOrder = state.dmOrder?.includes("bot-gamebot") ? state.dmOrder : ["bot-gamebot", ...(state.dmOrder || [])];
  return {
    ...state,
    dmOrder,
    messages: {
      ...state.messages,
      lobby: [...welcomeLobby, ...lobbyMsgs],
      "dm:bot-gamebot": [...welcomeDm, ...dmMsgs],
    },
  };
}

function ensureBots(state: State): State {
  const users = { ...state.users };
  SEED_BOTS.forEach(b => { if (!users[b.id]) users[b.id] = b; });
  const rooms = { ...state.rooms };
  const lobby = rooms.lobby;
  if (lobby) {
    const missingBots = SEED_BOTS.map(b => b.id).filter(id => !lobby.members.includes(id));
    if (missingBots.length) {
      rooms.lobby = { ...lobby, members: [...lobby.members, ...missingBots] };
    }
  }
  return { ...state, users, rooms };
}

function load(username: string): State {
  try {
    const raw = localStorage.getItem(storageKeyFor(username));
    if (raw) return ensureBots(ensureWelcome(normalizeMe(JSON.parse(raw), username), username));
  } catch {}
  return seed(username);
}

// Re-evaluate badges for "me", returning new state with badge updates and any new badge ids
function applyBadges(s: State): { state: State; newBadges: string[] } {
  const me = s.users.me;
  const ctx = {
    roomsJoined: Object.values(s.rooms).filter(r => r.members.includes("me")).length,
    dmsStarted: s.dmOrder.length,
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
  const me = s.users.me;
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
  send: (text: string, opts?: { attachment?: Attachment; replyToId?: string }) => void;
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
  dmChannelFor: (peerId: string) => string;
  replyingTo: Message | null;
  setReplyingTo: (m: Message | null) => void;
  findMessage: (id: string) => Message | undefined;
}

const ChatCtx = createContext<Ctx | null>(null);

const BOT_REPLIES = {
  greeting: ["hey hey 👋", "yo!", "hi there 🙌", "sup", "heyy welcome", "o/", "howdy 🤠", "hello friend"],
  thanks: ["anytime 🤝", "np!", "you got it", "🫡", "happy to help", "no worries"],
  question: ["good question 🤔", "hmm depends", "not sure tbh", "I'd say yes", "maybe try !help", "interesting one", "🤷 let's find out"],
  laugh: ["lmaooo", "💀💀", "haha same", "ikr 😂", "stop ur killing me", "🤣"],
  agree: ["facts", "fr fr", "100%", "exactly this", "couldn't agree more", "💯"],
  disagree: ["idk about that", "hmm not so sure", "🤨", "respectfully disagree", "interesting take tho"],
  love: ["❤️", "🥰", "love that", "wholesome", "🫶"],
  game: ["I'm in! 🎮", "ggwp", "let's run it", "ready when you are 🎲", "queue me up", "type !trivia 👀", "!hangman anyone?"],
  bye: ["cya 👋", "later!", "gn", "take care", "✌️"],
  fallback: [
    "lol", "nice one", "wait what", "👀", "fr fr", "anyone seen the new update?",
    "brb coffee", "gg", "that was wild", "hmm interesting", "I'm in", "🔥🔥",
    "anyone playing today?", "same here", "no way 😳", "tell me more", "respect",
    "big mood", "bet 🤝", "based", "📈", "vibes", "lmk how it goes", "neat",
    "ooo spicy", "make it happen", "👏👏", "✨ love the energy", "story checks out",
  ],
};

function pickBotReply(text: string): string {
  const t = text.toLowerCase();
  let pool: string[] = BOT_REPLIES.fallback;
  if (/\b(hi|hey|hello|yo|sup|hola|howdy)\b/.test(t)) pool = BOT_REPLIES.greeting;
  else if (/\b(thanks|thank you|thx|ty|appreciate)\b/.test(t)) pool = BOT_REPLIES.thanks;
  else if (/\b(bye|cya|goodnight|gn|later|peace)\b/.test(t)) pool = BOT_REPLIES.bye;
  else if (/\b(lol|lmao|rofl|haha|hehe|😂|🤣)\b/.test(t)) pool = BOT_REPLIES.laugh;
  else if (/\b(love|❤️|🫶|🥰|awesome|amazing|beautiful)\b/.test(t)) pool = BOT_REPLIES.love;
  else if (/\b(agree|same|true|right|exactly|facts)\b/.test(t)) pool = BOT_REPLIES.agree;
  else if (/\b(disagree|nope|wrong|nah)\b/.test(t)) pool = BOT_REPLIES.disagree;
  else if (/\b(game|play|trivia|hangman|blackjack|roll|dice|fish|dig)\b/.test(t)) pool = BOT_REPLIES.game;
  else if (/\?\s*$/.test(text) || /\b(what|why|how|when|where|who)\b/.test(t)) pool = BOT_REPLIES.question;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ChatProvider({ username, authUserId = null, children }: { username: string; authUserId?: string | null; children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed(username));
  const [storageReady, setStorageReady] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const syncRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcast = useRef(false);
  const streakChecked = useRef<string | null>(null);
  const { profiles: remoteProfiles } = useRemoteProfiles();
  const seenRemoteMsgIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    setState(load(username));
    setStorageReady(true);
    streakChecked.current = null;
  }, [username]);

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
      const ch = new BroadcastChannel(`${SYNC_CHANNEL}:${username.toLowerCase()}`);
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
    try { localStorage.setItem(storageKeyFor(username), JSON.stringify(state)); } catch {}
    if (skipBroadcast.current) { skipBroadcast.current = false; return; }
    syncRef.current?.postMessage({ type: "state", state });
  }, [state, storageReady, username]);

  // Ambient bot chatter
  useEffect(() => {
    const t = setInterval(() => {
      setState(s => {
        const room = s.rooms[s.activeChannel];
        if (!room) return s;
        const botMembers = room.members.filter(id => s.users[id]?.isBot && s.users[id]?.status === "online" && id !== "bot-gamebot");
        if (!botMembers.length) return s;
        if (Math.random() > 0.35) return s;
        const author = botMembers[Math.floor(Math.random() * botMembers.length)];
        const text = pickBotReply("");
        const msg: Message = { id: uid(), channelId: room.id, authorId: author, text, ts: Date.now() };
        return { ...s, messages: { ...s.messages, [room.id]: [...(s.messages[room.id] || []), msg] } };
      });
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // Merge remote profiles into the users map (skips our own auth uuid; we render as "me")
  useEffect(() => {
    setState(s => {
      const users = { ...s.users };
      let changed = false;
      Object.entries(remoteProfiles).forEach(([id, u]) => {
        if (id === authUserId) return;
        const prev = users[id];
        if (!prev || prev.name !== u.name || prev.status !== u.status || prev.avatarColor !== u.avatarColor || prev.avatarUrl !== u.avatarUrl) {
          users[id] = { ...prev, ...u };
          changed = true;
        }
      });
      return changed ? { ...s, users } : s;
    });
  }, [remoteProfiles, authUserId]);

  // Fetch existing remote messages for lobby + the active remote channel
  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    const channelsToFetch = new Set<string>(["lobby"]);
    if (isRemoteChannel(state.activeChannel, authUserId) && state.activeChannel !== "lobby") {
      channelsToFetch.add(state.activeChannel);
    }
    (async () => {
      for (const ch of channelsToFetch) {
        const { data } = await supabase
          .from("messages")
          .select("id, channel_id, author_id, text, kind, attachment, reply_to_id, created_at")
          .eq("channel_id", ch)
          .order("created_at", { ascending: true })
          .limit(200);
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
  }, [authUserId, state.activeChannel]);

  // Realtime subscription to new messages (RLS scopes us to lobby + our DMs)
  useEffect(() => {
    if (!authUserId) return;
    const channel = supabase
      .channel("palrgo-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as Parameters<typeof rowToMessage>[0];
        if (seenRemoteMsgIds.current.has(row.id)) return;
        seenRemoteMsgIds.current.add(row.id);
        const msg = rowToMessage(row, authUserId);
        // Sync shared game state piggybacked on the message
        const gs = (msg.attachment as unknown as { __gameState?: GameState } | undefined)?.__gameState;
        if (gs) {
          // strip the sentinel so it doesn't render as a file attachment
          msg.attachment = undefined;
        }
        setState(s => {
          const existing = s.messages[msg.channelId] || [];
          if (existing.some(m => m.id === msg.id)) return s;
          let games = s.games;
          if (gs) {
            if (gs.type) games = { ...games, [msg.channelId]: gs };
            else games = Object.fromEntries(Object.entries(games).filter(([k]) => k !== msg.channelId));
          }
          return {
            ...s,
            games,
            messages: { ...s.messages, [msg.channelId]: [...existing, msg].sort((a, b) => a.ts - b.ts) },
          };
        });
        if (msg.authorId !== "me") {
          if (msg.channelId.startsWith("dm:")) {
            playDmPing();
          } else {
            // @mention beep for lobby/rooms
            const myName = (typeof window !== "undefined" ? username : "");
            if (myName && new RegExp(`@${myName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(msg.text)) {
              playMentionPing();
            }
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authUserId]);

  const setActive = useCallback((channelId: string) => {
    setState(s => ({ ...s, activeChannel: channelId }));
    setReplyingTo(null);
  }, []);

  const send = useCallback((text: string, opts?: { attachment?: Attachment; replyToId?: string }) => {
    const trimmed = text.trim();
    const attachment = opts?.attachment;
    const replyToId = opts?.replyToId;
    if (!trimmed && !attachment) return;
    type Outgoing = { id: string; channelId: string; text: string; kind: string; attachment: Attachment | null; replyToId: string | null };
    const outgoingRemotes: Outgoing[] = [];
    setState(s => {
      const channelId = s.activeChannel;
      const isCmd = trimmed.startsWith("!");
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
      if (isCmd) {
        const result = runCommand(trimmed, { state: next, channelId, actor: next.me.name });
        const sysMsgs: Message[] = result.replies.map((r: { text: string; from?: string }, idx: number) => {
          const id = remote ? newUuid() : uid();
          // Piggyback game state on the first reply so other users sync
          const gameAttach = (remote && idx === 0 && result.gameUpdate)
            ? ({ __gameState: result.gameUpdate } as unknown as Attachment)
            : undefined;
          if (remote) {
            seenRemoteMsgIds.current.add(id);
            outgoingRemotes.push({
              id, channelId, text: r.text, kind: "game",
              attachment: (gameAttach ?? null) as Attachment | null,
              replyToId: null,
            });
          }
          return {
            id, channelId, authorId: r.from || "bot-gamebot",
            text: r.text, ts: Date.now(), kind: "game",
          };
        });
        next = {
          ...next,
          messages: { ...next.messages, [channelId]: [...next.messages[channelId], ...sysMsgs] },
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
      } else {
        const room = next.rooms[channelId];
        if (room) {
          const candidates = room.members.filter(id => next.users[id]?.isBot && id !== "bot-gamebot");
          if (candidates.length && Math.random() > 0.4) {
            const author = candidates[Math.floor(Math.random() * candidates.length)];
            const reply = pickBotReply(trimmed);
            const m: Message = { id: uid(), channelId, authorId: author, text: reply, ts: Date.now() + 800 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
          }
        } else if (channelId.startsWith("dm:")) {
          const targetId = channelId.slice(3);
          const target = next.users[targetId];
          if (target?.isBot) {
            const reply = pickBotReply(trimmed);
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
      void supabase.from("messages").insert(
        outgoingRemotes.map(out => ({
          id: out.id,
          channel_id: out.channelId,
          author_id: authUserId,
          text: out.text,
          kind: out.kind,
          attachment: out.attachment as unknown as never,
          reply_to_id: out.replyToId,
        }))
      ).then(({ error }) => { if (error) console.error("send failed", error); });
    }
    setReplyingTo(null);
  }, [authUserId]);

  const startDM = useCallback((userId: string) => {
    const channelId = dmChannelFor(authUserId, userId);
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
  }, [authUserId]);

  const closeDM = useCallback((userId: string) => {
    const channelId = dmChannelFor(authUserId, userId);
    setState(s => ({
      ...s,
      dmOrder: s.dmOrder.filter(id => id !== userId),
      activeChannel: s.activeChannel === channelId ? s.roomOrder[0] || s.activeChannel : s.activeChannel,
    }));
  }, []);

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
        members: ["me", "bot-gamebot"],
        roles: { me: "owner", "bot-gamebot": "admin" },
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


  const value = useMemo<Ctx>(() => ({
    state, setActive, send, startDM, closeDM, joinRoom, createRoom, updateMe,
    adjustPoints, adjustCoins, addFriend, removeFriend, blockUser, unblockUser,
    isFriend: (id) => (state.me.friends ?? []).includes(id),
    isBlocked: (id) => (state.me.blocked ?? []).includes(id),
    reset,
    channelMessages: (id) => state.messages[id] || [],
    channelLabel: (id) => {
      if (id.startsWith("dm:")) {
        const rest = id.slice(3);
        const peer = rest.includes(":") ? rest.split(":").find(p => p !== authUserId) || rest : rest;
        const u = state.users[peer];
        return u ? u.name : "Direct Message";
      }
      return state.rooms[id]?.name || id;
    },
    isDM: (id) => id.startsWith("dm:"),
    dmUser: (id) => {
      if (!id.startsWith("dm:")) return undefined;
      const rest = id.slice(3);
      const peer = rest.includes(":") ? rest.split(":").find(p => p !== authUserId) || rest : rest;
      return state.users[peer];
    },
    dmChannelFor: (peerId: string) => dmChannelFor(authUserId, peerId),
    replyingTo, setReplyingTo,
    findMessage,
  }), [state, setActive, send, startDM, closeDM, joinRoom, createRoom, updateMe, adjustPoints, adjustCoins, addFriend, removeFriend, blockUser, unblockUser, reset, replyingTo, findMessage, authUserId]);

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}
