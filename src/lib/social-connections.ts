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

export const DEFAULT_FACEBOOK_GRAPH_API_VERSION = "v26.0";
export const DEFAULT_BLUESKY_PDS = "https://bsky.social";
export const DEFAULT_OAUTH_RETURN_PATH = "/admin/social-automation?tab=connections";

/** Graph version is a public API path segment, not a secret. */
export function facebookGraphApiVersion(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.FACEBOOK_GRAPH_API_VERSION?.trim() || "";
  if (/^v\d+(\.\d+)?$/.test(raw)) return raw;
  return DEFAULT_FACEBOOK_GRAPH_API_VERSION;
}

export type OauthStateRecord = {
  state: string;
  platform: string;
  expires_at: string;
  admin_user_id: string;
  return_path?: string | null;
  code_verifier_ciphertext?: string | null;
};

/**
 * In-memory model of DELETE … WHERE state AND platform RETURNING *.
 * A matching row is removed exactly once; a second claim returns null.
 */
export function claimOauthStateRow(
  rows: OauthStateRecord[],
  state: string,
  platform: string,
): OauthStateRecord | null {
  const idx = rows.findIndex((r) => r.state === state && r.platform === platform);
  if (idx < 0) return null;
  const [claimed] = rows.splice(idx, 1);
  return claimed ?? null;
}

export function finalizeOauthStateClaim(
  row: OauthStateRecord | null,
  expectedPlatform: string,
  nowMs = Date.now(),
): { adminUserId: string; returnPath: string; verifierCiphertext: string } {
  if (!row) throw new Error("Invalid OAuth state");
  if (row.platform !== expectedPlatform) throw new Error("Invalid OAuth state");
  if (!row.admin_user_id) throw new Error("Invalid OAuth state");
  if (new Date(row.expires_at).getTime() < nowMs) throw new Error("OAuth state expired");
  return {
    adminUserId: row.admin_user_id,
    returnPath: row.return_path || DEFAULT_OAUTH_RETURN_PATH,
    verifierCiphertext: typeof row.code_verifier_ciphertext === "string" ? row.code_verifier_ciphertext : "",
  };
}

export function pinterestAuthorizeSearchParams(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): URLSearchParams {
  return new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: opts.scope || "boards:read,boards:write,pins:read,pins:write,user_accounts:read",
    state: opts.state,
  });
}

export function pinterestTokenExchangeParams(opts: { code: string; redirectUri: string }): URLSearchParams {
  return new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
}

export const PINTEREST_PRODUCTION_API_BASE = "https://api.pinterest.com";
export const PINTEREST_SANDBOX_API_BASE = "https://api-sandbox.pinterest.com";

export function pinterestApiMode(env: NodeJS.ProcessEnv = process.env): "sandbox" | "production" {
  return env.PINTEREST_API_MODE?.trim().toLowerCase() === "sandbox" ? "sandbox" : "production";
}

export function pinterestApiBase(env: NodeJS.ProcessEnv = process.env): string {
  return pinterestApiMode(env) === "sandbox" ? PINTEREST_SANDBOX_API_BASE : PINTEREST_PRODUCTION_API_BASE;
}

export function pinterestApiUrl(path: string, env: NodeJS.ProcessEnv = process.env): string {
  const base = pinterestApiBase(env).replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function shouldAutoCreatePinterestSandboxBoard(
  mode: "sandbox" | "production",
  boardCount: number,
): boolean {
  return mode === "sandbox" && boardCount === 0;
}

export function assertWelcomePostExternallyPublishable(post: { privacy?: string | null }): void {
  if (post.privacy !== "public") {
    throw new Error("Only public welcome posts can be published externally");
  }
}

function ipv4Octets(host: string): [number, number, number, number] | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  const parts = host.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return [parts[0], parts[1], parts[2], parts[3]];
}

function isUnsafeBlueskyHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host === "localhost.localdomain") return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home")) {
    return true;
  }
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  const v4mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4mapped) return isUnsafeBlueskyHost(v4mapped[1]);
  const oct = ipv4Octets(host);
  if (oct) {
    const [a, b] = oct;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

/** HTTPS public PDS only. Empty/missing input uses the official default. */
export function normalizeBlueskyPds(raw?: string | null): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return DEFAULT_BLUESKY_PDS;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Invalid Bluesky PDS URL");
  }
  if (url.protocol !== "https:") throw new Error("Bluesky PDS must use HTTPS");
  if (url.username || url.password) throw new Error("Bluesky PDS host is not allowed");
  if (isUnsafeBlueskyHost(url.hostname)) throw new Error("Bluesky PDS host is not allowed");
  return url.origin;
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
