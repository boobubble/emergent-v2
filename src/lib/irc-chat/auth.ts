/** Guest HMAC bundle returned by guest-chat.functions (gateway WS auth). */
export type IrcChatGuestAuth = {
  visitorId: string;
  displayName: string;
  nickname: string;
  expiresAt: string;
  token: string;
};

/** Resolves a fresh registered access JWT immediately before each WS auth frame. */
export type IrcChatResolveRegisteredToken = () => Promise<string | null>;

export type IrcChatAuth =
  | { kind: "registered"; resolveToken: IrcChatResolveRegisteredToken }
  | { kind: "guest"; guest: IrcChatGuestAuth };

export function resolveSelfUserId(auth: IrcChatAuth): string | null {
  if (auth.kind === "guest") return auth.guest.visitorId.trim() || null;
  return null;
}
