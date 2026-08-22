/**
 * Manual social distribution helpers.
 * Canonical content is the existing Yaarzo welcome feed post — never generate
 * a second welcome caption or a second feed post.
 */

import { resolveAvatarForBuffer } from "@/lib/avatar-social-media";

export const MANUAL_PLATFORMS = ["facebook", "pinterest", "bluesky", "youtube"] as const;
export type ManualSocialPlatform = (typeof MANUAL_PLATFORMS)[number];

export const AUTO_PLATFORMS = ["instagram", "x", "tiktok"] as const;
export type AutoSocialPlatform = (typeof AUTO_PLATFORMS)[number];

export type ManualPlatformStatus = "not_posted" | "posted" | "skipped";

export type AutoLogStatus =
  | "pending"
  | "queued"
  | "published"
  | "failed"
  | "skipped"
  | "none";

export const BLUESKY_GRAPHEME_LIMIT = 300;

export const MANUAL_PLATFORM_LABEL: Record<ManualSocialPlatform, string> = {
  facebook: "Facebook",
  pinterest: "Pinterest",
  bluesky: "Bluesky",
  youtube: "YouTube",
};

export const AUTO_PLATFORM_LABEL: Record<AutoSocialPlatform, string> = {
  instagram: "Instagram",
  x: "X",
  tiktok: "TikTok",
};

export const MANUAL_PLATFORM_OPEN_URL: Record<ManualSocialPlatform, string> = {
  facebook: "https://www.facebook.com/",
  pinterest: "https://www.pinterest.com/pin-builder/",
  bluesky: "https://bsky.app/",
  youtube: "https://studio.youtube.com/",
};

export function isWelcomeFeedPost(post: {
  slug?: string | null;
  category?: string | null;
  text?: string | null;
}): boolean {
  if (post.category === "new_member" || post.category === "welcome") return true;
  if (post.slug && /^welcome-/i.test(post.slug)) return true;
  const text = post.text ?? "";
  if (/just signed up!/i.test(text)) return true;
  if (/just joined Yaarzo/i.test(text)) return true;
  return false;
}

export function normalizeAutoPlatform(platform: string): AutoSocialPlatform | null {
  const p = platform === "twitter" ? "x" : platform;
  if (p === "instagram" || p === "x" || p === "tiktok") return p;
  return null;
}

/** Buffer "queued" is never treated as publicly published. */
export function describeAutoStatus(status: AutoLogStatus | string | null | undefined): {
  kind: "published" | "queued" | "failed" | "pending" | "skipped" | "none";
  label: string;
  published: boolean;
} {
  const s = String(status ?? "none");
  if (s === "published") return { kind: "published", label: "Published", published: true };
  if (s === "queued") return { kind: "queued", label: "Queued in Buffer", published: false };
  if (s === "failed") return { kind: "failed", label: "Failed", published: false };
  if (s === "skipped") return { kind: "skipped", label: "Skipped", published: false };
  if (s === "pending") return { kind: "pending", label: "Pending", published: false };
  return { kind: "none", label: "Pending", published: false };
}

export function graphemeLength(text: string): number {
  return Array.from(text).length;
}

/**
 * Shorten for Bluesky without mutating the original Yaarzo welcome post.
 * Prefers keeping the member profile URL.
 */
export function shortenForBluesky(caption: string, profileUrl: string): string {
  const body = (caption ?? "").trim();
  const url = (profileUrl ?? "").trim();
  const combined = url && body && !body.includes(url) ? `${body}\n${url}` : body || url;
  if (graphemeLength(combined) <= BLUESKY_GRAPHEME_LIMIT) return combined;

  const suffix = url ? `\n${url}` : "";
  const suffixLen = graphemeLength(suffix);
  const budget = BLUESKY_GRAPHEME_LIMIT - suffixLen - 1;
  if (budget < 8) {
    return Array.from(combined).slice(0, BLUESKY_GRAPHEME_LIMIT).join("");
  }
  const source = url && body.includes(url) ? body.replace(url, "").trim() : body;
  const shortBody = Array.from(source).slice(0, budget).join("").trimEnd() + "…";
  return `${shortBody}${suffix}`;
}

export function pinterestTitle(displayName: string): string {
  const name = displayName.trim() || "a new member";
  return `Welcome ${name} to Yaarzo`;
}

export function buildProfileUrl(siteBaseUrl: string, username: string): string {
  const base = (siteBaseUrl || "https://yaarzo.com").replace(/\/$/, "");
  const handle = (username || "member").replace(/^@/, "");
  return `${base}/u/${encodeURIComponent(handle)}`;
}

export function resolveManualShareMedia(opts: {
  avatarUrl: string | null | undefined;
  avatarModerationStatus: string | null | undefined;
  allowSocialFeature: boolean | null | undefined;
  defaultMediaUrl: string | null | undefined;
}): { mediaUrl: string | null; mediaSource: "user_avatar" | "default_image" | "none" } {
  if (opts.allowSocialFeature !== true) {
    return resolveAvatarForBuffer({
      avatarUrl: null,
      avatarModerationStatus: "none",
      defaultMediaUrl: opts.defaultMediaUrl,
    });
  }
  return resolveAvatarForBuffer({
    avatarUrl: opts.avatarUrl,
    avatarModerationStatus: opts.avatarModerationStatus,
    defaultMediaUrl: opts.defaultMediaUrl,
  });
}

export type ManualInboxFilter = "all" | "needs_manual" | "partial" | "completed";

export function manualCompletionKind(
  statuses: Array<ManualPlatformStatus | undefined>,
): ManualInboxFilter {
  const list = statuses.map((s) => s ?? "not_posted");
  const remaining = list.filter((s) => s === "not_posted").length;
  const done = list.filter((s) => s === "posted" || s === "skipped").length;
  if (remaining === list.length) return "needs_manual";
  if (done === list.length) return "completed";
  return "partial";
}

export function pinterestComposeUrl(opts: {
  destinationUrl: string;
  mediaUrl: string | null;
  description: string;
}): string {
  const u = encodeURIComponent(opts.destinationUrl);
  const d = encodeURIComponent(opts.description);
  const m = encodeURIComponent(opts.mediaUrl || "");
  return `https://www.pinterest.com/pin/create/button/?url=${u}&media=${m}&description=${d}`;
}

export function blueskyComposeUrl(text: string): string {
  return `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
}
