export type IrcActiveView =
  | { kind: "room"; roomId: string }
  | { kind: "dm"; peerNick: string };
