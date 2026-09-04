/**
 * Avatar → Buffer media resolution rules (unit-style, no network).
 * Any https avatar may be used unless admin-rejected.
 */

export type { AvatarModStatus } from "./avatar-social-media";
export { resolveAvatarForBuffer } from "./avatar-social-media";

import { resolveAvatarForBuffer } from "./avatar-social-media";

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

  // C) pending → user avatar (no approval gate)
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "pending",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "user_avatar",
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

  // E) needs_review → user avatar
  assert(
    resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: "needs_review",
      defaultMediaUrl: DEFAULT,
    }).mediaSource === "user_avatar",
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

  // H) only rejected never sends user image even if URL present
  for (const status of ["pending", "needs_review", "none", "approved"] as const) {
    const r = resolveAvatarForBuffer({
      avatarUrl: USER,
      avatarModerationStatus: status,
      defaultMediaUrl: DEFAULT,
    });
    assert(r.mediaSource === "user_avatar", `H failed for ${status}`);
  }

  const rejected = resolveAvatarForBuffer({
    avatarUrl: USER,
    avatarModerationStatus: "rejected",
    defaultMediaUrl: DEFAULT,
  });
  assert(rejected.mediaSource !== "user_avatar", "H failed for rejected");

  console.log("avatar buffer gate tests: OK (A–F, H)");
}

runAvatarBufferGateTests();
