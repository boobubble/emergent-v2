export type Role = "owner" | "admin" | "mod" | "member";

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string;         // optional uploaded avatar (data URL)
  status: "online" | "away" | "offline";
  bio?: string;
  aboutMe?: string;
  isBot?: boolean;
  isGuest?: boolean;
  gender?: "male" | "female" | "other";
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
  // Profile additions
  countryCode?: string;       // ISO 3166-1 alpha-2 (e.g. "US")
  showCountryFlag?: boolean;  // owner's preference to display the flag publicly
  showGuestBadge?: boolean;   // owner's preference to display the "Guest" tag
  birthday?: string;          // ISO date string (yyyy-mm-dd)
  hideBirthYear?: boolean;
}

export interface Attachment {
  kind: "image" | "file";
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
  duration?: number; // seconds, for audio/voice notes
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
  type: "trivia" | "hangman" | "wordchain" | "ludo" | null;
  data: any;
}
