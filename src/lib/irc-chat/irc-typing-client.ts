/** Client-side IRC typing throttle + label formatting (no DOM). */

export const IRC_TYPING_IDLE_MS = 3000;
export const IRC_TYPING_HEARTBEAT_MS = 1500;
export const IRC_TYPING_STALE_MS = 4000;

export type IrcTypingUser = {
  userId: string;
  nick: string;
};

export function formatTypingIndicatorLabel(
  typers: IrcTypingUser[],
  excludeUserId?: string | null,
): string | null {
  const viewer = excludeUserId?.trim();
  const visible = typers.filter((t) => t.userId !== viewer && t.nick.trim());
  if (!visible.length) return null;
  if (visible.length === 1) return `${visible[0].nick} is typing…`;
  if (visible.length === 2) {
    return `${visible[0].nick} and ${visible[1].nick} are typing…`;
  }
  return `${visible.length} people are typing…`;
}

export function parseTypingUsersPayload(raw: unknown): IrcTypingUser[] {
  if (!Array.isArray(raw)) return [];
  const out: IrcTypingUser[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const userId = String((row as { userId?: string }).userId || "").trim();
    const nick = String((row as { nick?: string }).nick || "").trim();
    if (!userId || !nick || seen.has(userId)) continue;
    seen.add(userId);
    out.push({ userId, nick });
  }
  return out;
}

export type IrcTypingEmitter = {
  sendTyping: () => void;
  stopTyping: () => void;
  dispose: () => void;
};

export function createIrcTypingEmitter(send: {
  start: () => void;
  stop: () => void;
}): IrcTypingEmitter {
  let lastSent = 0;
  let active = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function emitStop() {
    if (!active) return;
    active = false;
    lastSent = 0;
    send.stop();
  }

  function sendTyping() {
    const now = Date.now();
    if (!active || now - lastSent >= IRC_TYPING_HEARTBEAT_MS) {
      lastSent = now;
      active = true;
      send.start();
    }
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      emitStop();
    }, IRC_TYPING_IDLE_MS);
  }

  function stopTyping() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
    emitStop();
  }

  function dispose() {
    stopTyping();
  }

  return { sendTyping, stopTyping, dispose };
}
