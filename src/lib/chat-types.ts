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
}

export interface Message {
  id: string;
  channelId: string; // room id OR dm:userId
  authorId: string;
  text: string;
  ts: number;
  kind?: "text" | "system" | "game" | "me";
}

export interface Room {
  id: string;
  name: string;
  topic: string;
  members: string[]; // user ids
  roles: Record<string, Role>; // userId -> role
  isPublic: boolean;
}

export interface GameState {
  // active game per channel
  channelId: string;
  type: "trivia" | "hangman" | "wordchain" | null;
  data: any;
}