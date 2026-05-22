export type Role = "owner" | "admin" | "mod" | "member";

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string;         // optional uploaded avatar (data URL)
  status: "online" | "away" | "offline";
  bio?: string;
  isBot?: boolean;
  xp: number;
  level: number;
  coins?: number;             // virtual currency
  // Engagement
  streak?: number;
  longestStreak?: number;
  lastActiveDay?: string;
  messageCount?: number;
  commandCount?: number;
  badges?: string[];
  // Social
  friends?: string[];         // user ids
  blocked?: string[];         // user ids
  lastSeen?: number;          // epoch ms of last seen activity
}

export interface Attachment {
  kind: "image" | "file";
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  text: string;
  ts: number;
  kind?: "text" | "system" | "game" | "me";
  attachment?: Attachment;
  replyToId?: string;         // threading: id of message being replied to
}

export interface Room {
  id: string;
  name: string;
  topic: string;
  members: string[];
  roles: Record<string, Role>;
  isPublic: boolean;
}

export interface GameState {
  channelId: string;
  type: "trivia" | "hangman" | "wordchain" | null;
  data: any;
}
