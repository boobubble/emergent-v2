/**
 * Avatar → external social media resolution.
 * Any https profile avatar may be used unless explicitly rejected by an admin.
 */

export type AvatarModStatus = "none" | "pending" | "approved" | "needs_review" | "rejected";

export function resolveAvatarForBuffer(opts: {
  avatarUrl: string | null | undefined;
  avatarModerationStatus: AvatarModStatus | string | null | undefined;
  defaultMediaUrl: string | null | undefined;
}): { mediaUrl: string | null; mediaSource: "user_avatar" | "default_image" | "none" } {
  const status = String(opts.avatarModerationStatus ?? "none");
  const avatarBlocked = status === "rejected";
  const avatar =
    !avatarBlocked && opts.avatarUrl && /^https:\/\//i.test(opts.avatarUrl)
      ? opts.avatarUrl
      : null;
  if (avatar) return { mediaUrl: avatar, mediaSource: "user_avatar" };
  if (opts.defaultMediaUrl && /^https:\/\//i.test(opts.defaultMediaUrl)) {
    return { mediaUrl: opts.defaultMediaUrl, mediaSource: "default_image" };
  }
  return { mediaUrl: null, mediaSource: "none" };
}
