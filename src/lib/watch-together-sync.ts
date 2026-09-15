/** Host-authoritative Watch Together playback sync helpers. */

export const WATCH_SYNC_DRIFT_SOFT_SECONDS = 0.5;
export const WATCH_SYNC_DRIFT_HARD_SECONDS = 1.5;
export const WATCH_SYNC_VIEWER_DRIFT_INTERVAL_MS = 3000;
export const WATCH_SYNC_HOST_BROADCAST_MS = 2000;
export const WATCH_SYNC_PERSIST_MS = 3000;

export type WatchSyncAction = "sync" | "heartbeat" | "play" | "pause" | "seek" | "ended";

const WT_DEBUG =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

export function wtDebugLog(
  tag: "host action" | "broadcast" | "receive" | "correction" | "yt state",
  data: Record<string, unknown>,
): void {
  if (!WT_DEBUG) return;
  console.log(`[WT ${tag}]`, data);
}

export type WatchSyncPayload = {
  sessionId: string;
  action: WatchSyncAction;
  positionSeconds: number;
  playing: boolean;
  sentAt: number;
};

export type WatchParticipantJoinedPayload = {
  sessionId: string;
  userId: string;
  joinedAt: number;
};

export type WatchParticipantDeclinedPayload = {
  sessionId: string;
  userId: string;
  declinedAt: number;
};

export const WATCH_RT_EVENT_PLAYBACK = "playback";
export const WATCH_RT_EVENT_PARTICIPANT_JOINED = "watch-participant-joined";
export const WATCH_RT_EVENT_PARTICIPANT_DECLINED = "watch-participant-declined";

export type WatchPlaybackSnapshot = {
  positionMs: number;
  playing: boolean;
  updatedAt: string;
};

export type DriftCorrection = "none" | "soft" | "hard";

export function computeExpectedPositionSeconds(
  positionMs: number,
  playing: boolean,
  anchorIso: string,
  nowMs = Date.now(),
): number {
  const base = Math.max(0, positionMs) / 1000;
  if (!playing) return base;
  const anchorMs = new Date(anchorIso).getTime();
  if (!Number.isFinite(anchorMs)) return base;
  const elapsed = Math.max(0, (nowMs - anchorMs) / 1000);
  return base + elapsed;
}

export function expectedFromPlayback(
  playback: WatchPlaybackSnapshot,
  nowMs = Date.now(),
): number {
  return computeExpectedPositionSeconds(
    playback.positionMs,
    playback.playing,
    playback.updatedAt,
    nowMs,
  );
}

export function expectedFromBroadcast(
  positionSeconds: number,
  playing: boolean,
  sentAt: number,
  nowMs = Date.now(),
): number {
  const base = Math.max(0, positionSeconds);
  if (!playing) return base;
  const elapsed = Math.max(0, (nowMs - sentAt) / 1000);
  return base + elapsed;
}

export function classifyDrift(driftSeconds: number): DriftCorrection {
  const drift = Math.abs(driftSeconds);
  if (drift <= WATCH_SYNC_DRIFT_SOFT_SECONDS) return "none";
  if (drift <= WATCH_SYNC_DRIFT_HARD_SECONDS) return "soft";
  return "hard";
}

/** Positive drift means the local player is behind the authoritative position. */
export function computeDriftSeconds(
  expectedPositionSeconds: number,
  currentPositionSeconds: number,
): number {
  return expectedPositionSeconds - currentPositionSeconds;
}

export function shouldApplyPlayState(localPlaying: boolean, remotePlaying: boolean): boolean {
  return localPlaying !== remotePlaying;
}
