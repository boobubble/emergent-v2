import { describe, expect, it } from "vitest";
import {
  applyPublicAvatarVersion,
  avatarObjectLooksUnique,
  publicAvatarThumbUrl,
  publicAvatarVersionToken,
  publicProfilePath,
  resolvePublicAvatarUrl,
} from "@/lib/public-avatar";

const UNIQUE =
  "https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/avatars/u1/avatar-1787317005596.png";
const STABLE =
  "https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/avatars/u1/avatar.png";
const MODERATED_AT = "2026-08-21T14:12:09.589Z";

describe("resolvePublicAvatarUrl", () => {
  it("allows https avatars for live statuses", () => {
    for (const status of ["approved", "pending", "needs_review", null]) {
      expect(resolvePublicAvatarUrl({ avatarUrl: UNIQUE, avatarModerationStatus: status })).toBe(UNIQUE);
    }
  });

  it("rejects admin-rejected avatars and missing urls", () => {
    expect(resolvePublicAvatarUrl({ avatarUrl: UNIQUE, avatarModerationStatus: "rejected" })).toBeUndefined();
    expect(resolvePublicAvatarUrl({ avatarUrl: null, avatarModerationStatus: "approved" })).toBeUndefined();
    expect(resolvePublicAvatarUrl({ avatarUrl: UNIQUE, avatarModerationStatus: "none" })).toBe(UNIQUE);
  });

  it("rejects data URLs even when marked approved", () => {
    expect(
      resolvePublicAvatarUrl({
        avatarUrl: "data:image/jpeg;base64,abc",
        avatarModerationStatus: "approved",
        avatarModeratedAt: MODERATED_AT,
      }),
    ).toBeUndefined();
  });

  it("does not version unique avatar-{timestamp} object URLs", () => {
    const out = resolvePublicAvatarUrl({
      avatarUrl: UNIQUE,
      avatarModerationStatus: "approved",
      avatarModeratedAt: MODERATED_AT,
    });
    expect(out).toBe(UNIQUE);
    expect(out).not.toContain("v=");
  });

  it("versions reused object URLs from avatar_moderated_at only", () => {
    const out = resolvePublicAvatarUrl({
      avatarUrl: STABLE,
      avatarModerationStatus: "approved",
      avatarModeratedAt: MODERATED_AT,
    });
    const expected = publicAvatarVersionToken(MODERATED_AT);
    expect(out).toBe(`${STABLE}?v=${expected}`);
  });
});

describe("avatar version tokens", () => {
  it("treats Date.now-style object names as unique", () => {
    expect(avatarObjectLooksUnique(UNIQUE)).toBe(true);
    expect(avatarObjectLooksUnique(STABLE)).toBe(false);
  });

  it("does not invent a per-request timestamp", () => {
    const a = publicAvatarVersionToken(MODERATED_AT);
    const b = publicAvatarVersionToken(MODERATED_AT);
    expect(a).toBe(b);
    expect(a).toBe(String(Math.floor(Date.parse(MODERATED_AT) / 1000)));
    expect(applyPublicAvatarVersion(UNIQUE, a)).toBe(UNIQUE);
  });
});

describe("publicAvatarThumbUrl", () => {
  it("rewrites supabase public object URLs to the render endpoint", () => {
    const out = publicAvatarThumbUrl(UNIQUE, 64);
    expect(out).toContain("/storage/v1/render/image/public/avatars/u1/avatar-1787317005596.png");
    expect(out).toContain("width=64");
    expect(out).toContain("height=64");
    expect(out).toContain("resize=cover");
  });

  it("preserves a stable version param on transformed thumbs", () => {
    const out = publicAvatarThumbUrl(`${STABLE}?v=1755780729`, 64);
    expect(out).toContain("/storage/v1/render/image/public/avatars/u1/avatar.png");
    expect(out).toContain("v=1755780729");
    expect(out).toContain("width=64");
  });

  it("leaves non-storage URLs unchanged", () => {
    expect(publicAvatarThumbUrl("https://cdn.example.com/a.png", 64)).toBe("https://cdn.example.com/a.png");
  });
});

describe("publicProfilePath", () => {
  it("uses the existing /u/:username route", () => {
    expect(publicProfilePath("JD")).toBe("/u/JD");
  });
});
