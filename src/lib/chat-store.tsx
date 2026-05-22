import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import type { User, Message, Room, GameState, Attachment } from "./chat-types";
import { runCommand } from "./commands";

const STORAGE_KEY_BASE = "palrgo:state:v2";
const SYNC_CHANNEL = "palrgo:sync:v2";
function storageKeyFor(username: string) { return `${STORAGE_KEY_BASE}:${username.toLowerCase()}`; }
const SEED_TIME = 1_700_000_000_000;

const AVATAR_COLORS = [
  "oklch(0.7 0.15 25)", "oklch(0.7 0.15 75)", "oklch(0.7 0.15 145)",
  "oklch(0.7 0.15 195)", "oklch(0.7 0.15 255)", "oklch(0.7 0.15 305)",
  "oklch(0.75 0.13 50)", "oklch(0.7 0.18 340)",
];

function uid() { return Math.random().toString(36).slice(2, 10); }

function isPlaceholderName(name?: string) {
  const cleaned = (name || "").trim().toLowerCase();
  return !cleaned || cleaned === "you";
}

function generateUsername() {
  return `user${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeMe(state: State, fallbackName = generateUsername()): State {
  if (!isPlaceholderName(state.me.name)) return state;
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
  { id: "bot-gamebot", name: "GameBot", avatarColor: "oklch(0.78 0.13 195)", status: "online", isBot: true, xp: 9999, level: 99, bio: "Run !help to see games" },
  { id: "bot-nova", name: "Nova", avatarColor: AVATAR_COLORS[3], status: "online", isBot: true, xp: 1240, level: 12, bio: "Casual chatter" },
  { id: "bot-pixel", name: "Pixel", avatarColor: AVATAR_COLORS[5], status: "online", isBot: true, xp: 880, level: 9, bio: "Trivia addict" },
  { id: "bot-echo", name: "Echo", avatarColor: AVATAR_COLORS[1], status: "away", isBot: true, xp: 410, level: 5 },
  { id: "bot-ryze", name: "Ryze", avatarColor: AVATAR_COLORS[0], status: "online", isBot: true, xp: 2100, level: 18, bio: "Mod & gamer" },
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
  {
    id: "games",
    name: "Game Arena",
    topic: "Pure games. !trivia !hangman !blackjack !slots !roll",
    members: ["me", "bot-gamebot", "bot-pixel", "bot-nova"],
    roles: { me: "member", "bot-gamebot": "owner", "bot-pixel": "admin" },
    isPublic: true,
  },
  {
    id: "lounge",
    name: "Late Night Lounge",
    topic: "Chill chat, no spam.",
    members: ["me", "bot-nova", "bot-echo", "bot-ryze"],
    roles: { me: "member", "bot-ryze": "owner" },
    isPublic: true,
  },
];

interface State {
  me: User;
  users: Record<string, User>;
  rooms: Record<string, Room>;
  roomOrder: string[];
  dmOrder: string[]; // user ids
  messages: Record<string, Message[]>; // channelId -> messages
  games: Record<string, GameState>;
  activeChannel: string;
}

function seed(name = "user0000"): State {
  const me: User = {
    id: "me", name, avatarColor: AVATAR_COLORS[4],
    status: "online", xp: 0, level: 1, bio: "New here",
  };
  const users: Record<string, User> = { me };
  SEED_BOTS.forEach(b => (users[b.id] = b));
  const rooms: Record<string, Room> = {};
  SEED_ROOMS.forEach(r => (rooms[r.id] = r));
  const messages: Record<string, Message[]> = {};
  rooms.lobby && (messages.lobby = [
    { id: "seed-welcome", channelId: "lobby", authorId: "bot-gamebot", text: "Welcome to Palrgo! Type !help to see commands.", ts: SEED_TIME - 60000 },
    { id: "seed-nova", channelId: "lobby", authorId: "bot-nova", text: "hey everyone 👋", ts: SEED_TIME - 40000 },
    { id: "seed-ryze", channelId: "lobby", authorId: "bot-ryze", text: "anyone up for trivia?", ts: SEED_TIME - 20000 },
  ]);
  return {
    me, users, rooms,
    roomOrder: SEED_ROOMS.map(r => r.id),
    dmOrder: ["bot-nova"],
    messages,
    games: {},
    activeChannel: "lobby",
  };
}

function load(username: string): State {
  try {
    const raw = localStorage.getItem(storageKeyFor(username));
    if (raw) return normalizeMe(JSON.parse(raw), username);
  } catch {}
  return seed(username);
}

interface Ctx {
  state: State;
  setActive: (channelId: string) => void;
  send: (text: string, attachment?: Attachment) => void;
  startDM: (userId: string) => void;
  joinRoom: (roomId: string) => void;
  createRoom: (name: string, topic: string) => void;
  updateMe: (patch: Partial<User>) => void;
  adjustPoints: (userId: string, delta: number) => void;
  reset: () => void;
  channelMessages: (id: string) => Message[];
  channelLabel: (id: string) => string;
  isDM: (id: string) => boolean;
  dmUser: (id: string) => User | undefined;
}

const ChatCtx = createContext<Ctx | null>(null);

const BOT_REPLIES = [
  "lol", "nice one", "wait what", "👀", "fr fr", "anyone seen the new update?",
  "brb coffee", "gg", "that was wild", "hmm interesting",
  "I'm in", "🔥🔥", "anyone playing today?", "same here",
];

export function ChatProvider({ username, children }: { username: string; children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed(username));
  const [storageReady, setStorageReady] = useState(false);
  const syncRef = useRef<BroadcastChannel | null>(null);
  const skipBroadcast = useRef(false);

  useEffect(() => {
    setState(load(username));
    setStorageReady(true);
  }, [username]);

  // Cross-tab realtime sync via BroadcastChannel + storage events
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

  // Ambient bot chatter in active public room
  useEffect(() => {
    const t = setInterval(() => {
      setState(s => {
        const room = s.rooms[s.activeChannel];
        if (!room) return s;
        const botMembers = room.members.filter(id => s.users[id]?.isBot && s.users[id]?.status === "online" && id !== "bot-gamebot");
        if (!botMembers.length) return s;
        if (Math.random() > 0.35) return s;
        const author = botMembers[Math.floor(Math.random() * botMembers.length)];
        const text = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
        const msg: Message = { id: uid(), channelId: room.id, authorId: author, text, ts: Date.now() };
        return { ...s, messages: { ...s.messages, [room.id]: [...(s.messages[room.id] || []), msg] } };
      });
    }, 12000);
    return () => clearInterval(t);
  }, []);


  const setActive = useCallback((channelId: string) => {
    setState(s => ({ ...s, activeChannel: channelId }));
  }, []);

  const pushMessages = (channelId: string, msgs: Message[]) =>
    setState(s => ({ ...s, messages: { ...s.messages, [channelId]: [...(s.messages[channelId] || []), ...msgs] } }));

  const send = useCallback((text: string, attachment?: Attachment) => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    setState(s => {
      const channelId = s.activeChannel;
      const userMsg: Message = {
        id: uid(), channelId, authorId: "me",
        text: trimmed, ts: Date.now(),
        kind: trimmed.startsWith("/me ") ? "me" : "text",
        attachment,
      };
      const existing = s.messages[channelId] || [];
      let next: State = {
        ...s,
        me: { ...s.me, xp: s.me.xp + 1, level: Math.floor((s.me.xp + 1) / 50) + 1 },
        users: { ...s.users, me: { ...s.users.me, xp: s.users.me.xp + 1 } },
        messages: { ...s.messages, [channelId]: [...existing, userMsg] },
      };
      if (trimmed.startsWith("!")) {
        const result = runCommand(trimmed, { state: next, channelId, actor: next.me.name });
        const sysMsgs: Message[] = result.replies.map((r: { text: string; from?: string }) => ({
          id: uid(), channelId, authorId: r.from || "bot-gamebot",
          text: r.text, ts: Date.now(), kind: "game",
        }));
        next = {
          ...next,
          messages: { ...next.messages, [channelId]: [...next.messages[channelId], ...sysMsgs] },
          games: result.gameUpdate ? { ...next.games, [channelId]: result.gameUpdate } : next.games,
        };
        if (result.buzz && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("palrgo:buzz", {
            detail: { actor: s.me.name, reason: result.buzz.reason },
          }));
        }
      } else {
        // Maybe one bot responds
        const room = next.rooms[channelId];
        if (room) {
          const candidates = room.members.filter(id => next.users[id]?.isBot && id !== "bot-gamebot");
          if (candidates.length && Math.random() > 0.4) {
            const author = candidates[Math.floor(Math.random() * candidates.length)];
            const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
            const m: Message = { id: uid(), channelId, authorId: author, text: reply, ts: Date.now() + 800 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
          }
        } else if (channelId.startsWith("dm:")) {
          const targetId = channelId.slice(3);
          const target = next.users[targetId];
          if (target?.isBot) {
            const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
            const m: Message = { id: uid(), channelId, authorId: targetId, text: reply, ts: Date.now() + 600 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
          }
        }
      }
      return next;
    });
  }, []);

  const startDM = useCallback((userId: string) => {
    const channelId = `dm:${userId}`;
    setState(s => ({
      ...s,
      dmOrder: s.dmOrder.includes(userId) ? s.dmOrder : [...s.dmOrder, userId],
      activeChannel: channelId,
    }));
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    setState(s => {
      const room = s.rooms[roomId];
      if (!room || room.members.includes("me")) return { ...s, activeChannel: roomId };
      return {
        ...s,
        rooms: { ...s.rooms, [roomId]: { ...room, members: [...room.members, "me"] } },
        activeChannel: roomId,
      };
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
      return {
        ...s,
        rooms: { ...s.rooms, [id]: room },
        roomOrder: [...s.roomOrder, id],
        activeChannel: id,
      };
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
      const updated: User = { ...u, xp: newXp, level: Math.floor(newXp / 50) + 1 };
      return {
        ...s,
        users: { ...s.users, [userId]: updated },
        me: userId === "me" ? { ...s.me, xp: newXp, level: updated.level } : s.me,
      };
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKeyFor(username));
    setState(seed(username));
  }, [username]);

  const value = useMemo<Ctx>(() => ({
    state, setActive, send, startDM, joinRoom, createRoom, updateMe, adjustPoints, reset,
    channelMessages: (id) => state.messages[id] || [],
    channelLabel: (id) => {
      if (id.startsWith("dm:")) {
        const u = state.users[id.slice(3)];
        return u ? u.name : "Direct Message";
      }
      return state.rooms[id]?.name || id;
    },
    isDM: (id) => id.startsWith("dm:"),
    dmUser: (id) => id.startsWith("dm:") ? state.users[id.slice(3)] : undefined,
  }), [state, setActive, send, startDM, joinRoom, createRoom, updateMe, adjustPoints, reset]);

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}