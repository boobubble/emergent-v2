/**
 * Avatar → Buffer media resolution rules (unit-style, no network).
 * Mirrors supabase/functions/buffer-social gate:
 * only avatar_moderation_status === "approved" may use profiles.avatar_url.
 */

export type AvatarModStatus = "none" | "pending" | "approved" | "needs_review" | "rejected";

export function resolveAvatarForBuffer(opts: {
  avatarUrl: string | null | undefined;
  avatarModerationStatus: AvatarModStatus | string | null | undefined;
  defaultMediaUrl: string | null | undefined;
}): { mediaUrl: string | null; mediaSource: "user_avatar" | "default_image" | "none" } {
  const status = String(opts.avatarModerationStatus ?? "none");
  const avatarAllowed = status === "approved";
  const avatar =
    avatarAllowed && opts.avatarUrl && /^https:\/\//i.test(opts.avatarUrl)
      ? opts.avatarUrl
      : null;
  if (avatar) return { mediaUrl: avatar, mediaSource: "user_avatar" };
  if (opts.defaultMediaUrl && /^https:\/\//i.test(opts.defaultMediaUrl)) {
    return { mediaUrl: opts.defaultMediaUrl, mediaSource: "default_image" };
  }
  return { mediaUrl: null, mediaSource: "none" };
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

/** Run with: npx tsx src/lib/avatar-moderation.buffer-gate.test.ts */
export function runAvatarBufferGateTests() {
  const DEFAULT = "https://cdn.example.com/yaarzo-default.jpg";
  const USER = "https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/avatars/u1/a.png";

  // A) approved → user avatar
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "approved",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "user_avatar",
    "A failed",
  );

  // B) no avatar → default
  assert(
    resolveAvatarForBuffer({
      avatarUrl: null,
      avatarModerationStatus: "none",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "default_image",
    "B failed",
  );

  // C) pending → never user avatar
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "pending",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "default_image",
    "C failed",
  );

  // D) rejected → default
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "rejected",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "default_image",
    "D failed",
  );

  // E) needs_review → default
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "needs_review",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "default_image",
    "E failed",
  );

  // F) admin removed (none + null url) → default
  assert(
    resolveAvatarForBuffer({
      avatarUrl: null,
      avatarModerationStatus: "none",
      defaultMediaUrl: DEFAULT,
    }).mediaUrl === DEFAULT,
    "F failed",
  );

  // H) fail-closed: non-approved never sends user image even if URL present
  for (const status of ["pending", "needs_review", "rejected", "none"] as const) {
    const r = resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: status,
      defaultMediaUrl: DEFAULT,
    });
    assert(r.mediaSource !== "user_avatar", `H failed for ${status}`);
  }

  console.log("avatar buffer gate tests: OK (A–F, H)");
}

runAvatarBufferGateTests();
