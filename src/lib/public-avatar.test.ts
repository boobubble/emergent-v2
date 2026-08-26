import { describe, expect, it } from "vitest";
import {
  publicAvatarThumbUrl,
  publicProfilePath,
  resolvePublicAvatarUrl,
} from "@/lib/public-avatar";

const HTTPS =
  "https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/avatars/u1/a.png";

describe("resolvePublicAvatarUrl", () => {
  it("allows approved https avatars", () => {
    expect(resolvePublicAvatarUrl({ avatarUrl: HTTPS, avatarModerationStatus: "approved" })).toBe(HTTPS);
  });

  it("rejects pending, review, rejected, and none", () => {
    for (const status of ["pending", "needs_review", "rejected", "none", null]) {
      expect(resolvePublicAvatarUrl({ avatarUrl: HTTPS, avatarModerationStatus: status })).toBeUndefined();
    }
  });

  it("rejects data URLs even when marked approved", () => {
    expect(
      resolvePublicAvatarUrl({
        avatarUrl: "data:image/jpeg;base64,abc",
        avatarModerationStatus: "approved",
      }),
    ).toBeUndefined();
  });

  it("rejects missing urls", () => {
    expect(resolvePublicAvatarUrl({ avatarUrl: null, avatarModerationStatus: "approved" })).toBeUndefined();
  });
});

describe("publicAvatarThumbUrl", () => {
  it("rewrites supabase public object URLs to the render endpoint", () => {
    const out = publicAvatarThumbUrl(HTTPS, 64);
    expect(out).toContain("/storage/v1/render/image/public/avatars/u1/a.png");
    expect(out).toContain("width=64");
    expect(out).toContain("height=64");
    expect(out).toContain("resize=cover");
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
