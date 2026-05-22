import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import type { User, Message, Room, GameState } from "./chat-types";
import { runCommand } from "./commands";

const STORAGE_KEY = "palrgo:state:v1";

const AVATAR_COLORS = [
  "oklch(0.7 0.15 25)", "oklch(0.7 0.15 75)", "oklch(0.7 0.15 145)",
  "oklch(0.7 0.15 195)", "oklch(0.7 0.15 255)", "oklch(0.7 0.15 305)",
  "oklch(0.75 0.13 50)", "oklch(0.7 0.18 340)",
];

function uid() { return Math.random().toString(36).slice(2, 10); }

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

function seed(): State {
  const me: User = {
    id: "me", name: "You", avatarColor: AVATAR_COLORS[4],
    status: "online", xp: 0, level: 1, bio: "New here",
  };
  const users: Record<string, User> = { me };
  SEED_BOTS.forEach(b => (users[b.id] = b));
  const rooms: Record<string, Room> = {};
  SEED_ROOMS.forEach(r => (rooms[r.id] = r));
  const messages: Record<string, Message[]> = {};
  rooms.lobby && (messages.lobby = [
    { id: uid(), channelId: "lobby", authorId: "bot-gamebot", text: "Welcome to Palrgo! Type !help to see commands.", ts: Date.now() - 60000 },
    { id: uid(), channelId: "lobby", authorId: "bot-nova", text: "hey everyone 👋", ts: Date.now() - 40000 },
    { id: uid(), channelId: "lobby", authorId: "bot-ryze", text: "anyone up for trivia?", ts: Date.now() - 20000 },
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

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seed();
}

interface Ctx {
  state: State;
  setActive: (channelId: string) => void;
  send: (text: string) => void;
  startDM: (userId: string) => void;
  joinRoom: (roomId: string) => void;
  createRoom: (name: string, topic: string) => void;
  updateMe: (patch: Partial<User>) => void;
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

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => load());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

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

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState(s => {
      const channelId = s.activeChannel;
      const userMsg: Message = {
        id: uid(), channelId, authorId: "me",
        text: trimmed, ts: Date.now(),
        kind: trimmed.startsWith("/me ") ? "me" : "text",
      };
      const existing = s.messages[channelId] || [];
      let next: State = {
        ...s,
        me: { ...s.me, xp: s.me.xp + 1, level: Math.floor((s.me.xp + 1) / 50) + 1 },
        users: { ...s.users, me: { ...s.users.me, xp: s.users.me.xp + 1 } },
        messages: { ...s.messages, [channelId]: [...existing, userMsg] },
      };
      if (trimmed.startsWith("!")) {
        const result = runCommand(trimmed, { state: next, channelId });
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

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(seed());
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, setActive, send, startDM, joinRoom, createRoom, updateMe, reset,
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
  }), [state, setActive, send, startDM, joinRoom, createRoom, updateMe, reset]);

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}