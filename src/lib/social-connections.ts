import type { ManualPlatformStatus } from "./social-manual-distribution";

export const API_PUBLISH_PLATFORMS = ["facebook", "pinterest", "bluesky"] as const;
export type ApiPublishPlatform = (typeof API_PUBLISH_PLATFORMS)[number];

export type SocialConnectionPublic = {
  platform: "facebook" | "pinterest" | "bluesky" | "youtube";
  status: "connected" | "disconnected" | "expired" | "error" | "pending";
  account_id: string | null;
  account_name: string | null;
  page_id: string | null;
  page_name: string | null;
  default_board_id: string | null;
  default_board_name: string | null;
  handle: string | null;
  scopes: string[];
  health: "healthy" | "degraded" | "error" | "unknown";
  last_error: string | null;
  last_checked_at: string | null;
  connected_at: string | null;
  configured: boolean;
  publishing: "api" | "manual";
};

export function sanitizeConnection(row: Record<string, unknown> | null | undefined): SocialConnectionPublic | null {
  if (!row) return null;
  const platform = String(row.platform ?? "");
  if (
    platform !== "facebook" &&
    platform !== "pinterest" &&
    platform !== "bluesky" &&
    platform !== "youtube"
  ) {
    return null;
  }
  return {
    platform,
    status: (row.status as SocialConnectionPublic["status"]) || "disconnected",
    account_id: (row.account_id as string | null) ?? null,
    account_name: (row.account_name as string | null) ?? null,
    page_id: (row.page_id as string | null) ?? null,
    page_name: (row.page_name as string | null) ?? null,
    default_board_id: (row.default_board_id as string | null) ?? null,
    default_board_name: (row.default_board_name as string | null) ?? null,
    handle: (row.handle as string | null) ?? null,
    scopes: Array.isArray(row.scopes) ? (row.scopes as string[]) : [],
    health: (row.health as SocialConnectionPublic["health"]) || "unknown",
    last_error: (row.last_error as string | null) ?? null,
    last_checked_at: (row.last_checked_at as string | null) ?? null,
    connected_at: (row.connected_at as string | null) ?? null,
    configured: row.status === "connected",
    publishing: platform === "youtube" ? "manual" : "api",
  };
}

/** Tokens must never appear in a sanitized payload. */
export function connectionHasNoSecrets(publicRow: SocialConnectionPublic): boolean {
  const blob = JSON.stringify(publicRow);
  return !/access_token|refresh_token|page_token|app_password|ciphertext/i.test(blob);
}

export function shouldConfirmDuplicate(
  status: ManualPlatformStatus | string | null | undefined,
  force: boolean,
): boolean {
  return status === "posted" && force !== true;
}

/** True when the platform can receive a one-click API publish. */
export function isReadyToPublish(c: SocialConnectionPublic | null | undefined): boolean {
  if (!c || c.platform === "youtube") return false;
  if (c.status !== "connected") return false;
  if (c.platform === "facebook") return Boolean(c.page_id);
  if (c.platform === "pinterest") return Boolean(c.default_board_id);
  return c.platform === "bluesky";
}

export function facebookMessage(caption: string, profileUrl: string): string {
  const body = (caption ?? "").trim();
  const url = (profileUrl ?? "").trim();
  if (url && body && !body.includes(url)) return `${body}\n${url}`;
  return body || url;
}

export function youtubeStudioUrl(): string {
  return "https://studio.youtube.com/";
}

export const EMPTY_YOUTUBE_CONNECTION: SocialConnectionPublic = {
  platform: "youtube",
  status: "disconnected",
  account_id: null,
  account_name: "YouTube Studio",
  page_id: null,
  page_name: null,
  default_board_id: null,
  default_board_name: null,
  handle: null,
  scopes: [],
  health: "unknown",
  last_error: null,
  last_checked_at: null,
  connected_at: null,
  configured: false,
  publishing: "manual",
};
