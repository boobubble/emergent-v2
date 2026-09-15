/** Direct invite actions keyed by DM channel — avoids fragile window events. */

export type WatchTogetherInviteActionArgs = {
  sessionId: string;
  channelId: string;
};

export type WatchTogetherInviteHandlers = {
  acceptInvite: (args: WatchTogetherInviteActionArgs) => Promise<void>;
  rejectInvite: (args: WatchTogetherInviteActionArgs) => Promise<void>;
};

const handlersByChannel = new Map<string, WatchTogetherInviteHandlers>();

export function registerWatchTogetherInviteHandlers(
  channelId: string,
  handlers: WatchTogetherInviteHandlers,
): () => void {
  handlersByChannel.set(channelId, handlers);
  return () => {
    const current = handlersByChannel.get(channelId);
    if (current === handlers) handlersByChannel.delete(channelId);
  };
}

export function getWatchTogetherInviteHandlers(
  channelId: string,
): WatchTogetherInviteHandlers | null {
  return handlersByChannel.get(channelId) ?? null;
}

async function waitForInviteHandlers(
  channelId: string,
  timeoutMs = 5000,
): Promise<WatchTogetherInviteHandlers> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const handlers = handlersByChannel.get(channelId);
    if (handlers) return handlers;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  throw new Error("Open this DM and try again.");
}

export async function acceptWatchTogetherInvite(
  args: WatchTogetherInviteActionArgs,
): Promise<void> {
  const handlers = await waitForInviteHandlers(args.channelId);
  await handlers.acceptInvite(args);
}

export async function rejectWatchTogetherInvite(
  args: WatchTogetherInviteActionArgs,
): Promise<void> {
  const handlers = await waitForInviteHandlers(args.channelId);
  await handlers.rejectInvite(args);
}

export type WatchInviteResolution = "pending" | "accepted" | "declined" | "expired";

const inviteResolution = new Map<string, WatchInviteResolution>();

export function setWatchInviteResolution(sessionId: string, status: WatchInviteResolution): void {
  inviteResolution.set(sessionId, status);
}

export function getWatchInviteResolution(sessionId: string): WatchInviteResolution {
  return inviteResolution.get(sessionId) ?? "pending";
}

export function clearWatchInviteResolution(sessionId: string): void {
  inviteResolution.delete(sessionId);
}
