/**
 * Client helpers for gateway IRC moderation relay.
 */

export type IrcModerationAction = "kick" | "ban" | "unban" | "mute" | "unmute";

export type IrcModerationRequest = {
  action: IrcModerationAction;
  room: string;
  targetNick: string;
  reason?: string;
};

const IRC_NICK_RE = /^[A-Za-z0-9_\-\[\]\\^{}|`]+$/;

/** Map Yaarzo display username to a safe IRC nick for gateway validation. */
export function toIrcNick(name: string): string {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const nick = raw.replace(/[^A-Za-z0-9_\-\[\]\\^{}|`]/g, "_").slice(0, 30);
  return IRC_NICK_RE.test(nick) ? nick : "";
}

export function buildModerationFrame(req: IrcModerationRequest): {
  type: string;
  action: IrcModerationAction;
  room: string;
  targetNick: string;
  reason?: string;
} {
  return {
    type: `moderation.${req.action}`,
    action: req.action,
    room: req.room.trim(),
    targetNick: req.targetNick.trim(),
    ...(req.reason ? { reason: req.reason.trim() } : {}),
  };
}
