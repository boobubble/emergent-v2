export type IrcActiveView =
  | { kind: "room"; roomId: string }
  | { kind: "dm"; peerNick: string };

/** Ephemeral composer reply target (public rooms only). */
export type IrcComposerReplyTarget = {
  roomId: string;
  messageId: string;
  authorNick: string;
  textPreview: string;
};
