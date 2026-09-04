/**
 * Client-side mute gate for ChatProviderInner.send.
 * Must run before any optimistic row or public.messages INSERT.
 */

export type MuteEntry = { mutedUntil?: number };
export type MuteMap = Record<string, Record<string, MuteEntry>>;

export function readMutedUntil(
  moderation: MuteMap | undefined,
  channelId: string,
  selfIds: Array<string | null | undefined>,
): number | undefined {
  const chan = moderation?.[channelId];
  if (!chan) return undefined;
  let max = 0;
  for (const id of selfIds) {
    if (!id) continue;
    const until = chan[id]?.mutedUntil;
    if (typeof until === "number" && until > max) max = until;
  }
  return max || undefined;
}

export function formatMuteClock(msLeft: number): string {
  const secs = Math.max(0, Math.ceil(msLeft / 1000));
  return secs >= 60 ? `${Math.ceil(secs / 60)}m` : `${secs}s`;
}

export function lobbyMuteWarning(msLeft: number): string {
  return `You're muted in Lobby (${formatMuteClock(msLeft)} left). You can still DM friends from your friends list.`;
}

export type MutedSendDecision =
  | { blocked: false }
  | { blocked: true; warning: string; warningAuthorId: "bot-spam" | "bot-gamebot" };

export function decideMutedSend(input: {
  channelId: string;
  now: number;
  moderation?: MuteMap;
  authUserId?: string | null;
  friends?: string[];
  dmPeerId?: string | null;
}): MutedSendDecision {
  const selfIds = ["me", input.authUserId];
  const channelUntil = readMutedUntil(input.moderation, input.channelId, selfIds);
  if (channelUntil && channelUntil > input.now) {
    if (input.channelId === "lobby") {
      return {
        blocked: true,
        warning: lobbyMuteWarning(channelUntil - input.now),
        warningAuthorId: "bot-spam",
      };
    }
    const secs = Math.ceil((channelUntil - input.now) / 1000);
    return {
      blocked: true,
      warning: `🔇 You are muted for another ${Math.ceil(secs / 60)}m ${secs % 60}s.`,
      warningAuthorId: "bot-gamebot",
    };
  }

  const lobbyUntil = readMutedUntil(input.moderation, "lobby", selfIds);
  if (lobbyUntil && lobbyUntil > input.now && input.channelId !== "lobby") {
    if (input.channelId.startsWith("dm:")) {
      const peer = input.dmPeerId;
      const friends = input.friends ?? [];
      if (peer && !friends.includes(peer)) {
        const secs = Math.ceil((lobbyUntil - input.now) / 1000);
        return {
          blocked: true,
          warning: `🔇 You're muted (${Math.ceil(secs / 60)}m left). While muted you can only DM users on your friends list.`,
          warningAuthorId: "bot-spam",
        };
      }
      return { blocked: false };
    }
    return {
      blocked: true,
      warning: `🔇 You're muted in the lobby. Public chat is paused — DM a friend instead.`,
      warningAuthorId: "bot-spam",
    };
  }
  return { blocked: false };
}

/** Pure model of send()'s mute gate: no optimistic row and no INSERT payload when blocked. */
export function applyMutedSendGate(input: {
  messages: Record<string, { id: string; channelId: string; authorId: string; text: string; ts: number; kind?: string; sendStatus?: string }[]>;
  channelId: string;
  text: string;
  now: number;
  moderation?: MuteMap;
  authUserId?: string | null;
  friends?: string[];
  dmPeerId?: string | null;
}): {
  messages: Record<string, { id: string; channelId: string; authorId: string; text: string; ts: number; kind?: string; sendStatus?: string }[]>;
  outgoingInserts: Array<{ id: string; channelId: string; text: string }>;
} {
  const decision = decideMutedSend(input);
  if (decision.blocked) {
    const sys = {
      id: "mute-warning",
      channelId: input.channelId,
      authorId: decision.warningAuthorId,
      text: decision.warning,
      ts: input.now,
      kind: "system",
    };
    const existing = input.messages[input.channelId] || [];
    return {
      messages: { ...input.messages, [input.channelId]: [...existing, sys] },
      outgoingInserts: [],
    };
  }
  const optimistic = {
    id: "opt-1",
    channelId: input.channelId,
    authorId: "me",
    text: input.text,
    ts: input.now,
    kind: "text",
    sendStatus: "sending",
  };
  const existing = input.messages[input.channelId] || [];
  return {
    messages: { ...input.messages, [input.channelId]: [...existing, optimistic] },
    outgoingInserts: [{ id: "opt-1", channelId: input.channelId, text: input.text }],
  };
}
