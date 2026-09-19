export type IrcChatConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "authenticated"
  | "closed"
  | "error";

export type IrcChatMember = {
  nick: string;
  userId: string;
  isGuest?: boolean;
};

export type IrcChatRoom = {
  id: string;
  name: string;
  topic?: string;
  memberCount?: number;
};

export type IrcChatMessage = {
  id: string;
  roomId: string;
  authorId: string;
  nick: string;
  text: string;
  ts: number;
  pending?: boolean;
  failed?: boolean;
  /** References another message in the same room (gateway metadata, not IRC text). */
  replyToMessageId?: string;
};

export type IrcChatPresenceEvent = {
  room: string;
  event: "join" | "part" | "quit" | "kick" | "nick";
  nick: string;
  reason?: string;
  newNick?: string;
};

export type IrcChatState = {
  status: IrcChatConnectionStatus;
  statusDetail?: string;
  ircNick: string | null;
  userId: string | null;
  rooms: Record<string, IrcChatRoom>;
  members: Record<string, IrcChatMember[]>;
  messages: Record<string, IrcChatMessage[]>;
  privateMessages: Record<string, IrcChatMessage[]>;
};

export function createInitialIrcChatState(): IrcChatState {
  return {
    status: "idle",
    ircNick: null,
    userId: null,
    rooms: {},
    members: {},
    messages: {},
    privateMessages: {},
  };
}
