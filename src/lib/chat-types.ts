export type Role = "owner" | "admin" | "mod" | "member";

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  status: "online" | "away" | "offline";
  bio?: string;
  isBot?: boolean;
  xp: number;
  level: number;
  // Engagement
  streak?: number;            // current daily streak
  longestStreak?: number;
  lastActiveDay?: string;     // YYYY-MM-DD (local)
  messageCount?: number;
  commandCount?: number;
  badges?: string[];          // badge ids
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
