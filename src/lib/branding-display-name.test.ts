import { describe, expect, it } from "vitest";
import { isLegacyPlaceholderBrand, resolvePublicDisplayName } from "./branding";
import { brandNameFromConfig } from "./landing-payload";
import { LANDING_DEFAULTS } from "./landing-config";

describe("resolvePublicDisplayName", () => {
  it("prefers branding logo text over copyrightOwner", () => {
    expect(
      resolvePublicDisplayName({
        logoText: "Yaarzo",
        siteName: "Yaarzo – Free Chat Rooms",
        copyrightOwner: "BooBubble",
      }),
    ).toBe("Yaarzo");
  });

  it("uses the short site name when logo text is missing", () => {
    expect(
      resolvePublicDisplayName({
        siteName: "Yaarzo – Free Chat Rooms, Social Community, Games & Competitions",
        copyrightOwner: "BooBubble",
      }),
    ).toBe("Yaarzo");
  });

  it("rejects BooBubble / ChitChat / Community placeholders", () => {
    expect(isLegacyPlaceholderBrand("BooBubble")).toBe(true);
    expect(isLegacyPlaceholderBrand("Boo Bubble")).toBe(true);
    expect(isLegacyPlaceholderBrand("ChitChat")).toBe(true);
    expect(
      resolvePublicDisplayName({
        logoText: "BooBubble",
        siteName: "Community",
        copyrightOwner: "ChitChat",
      }),
    ).toBe("Yaarzo");
  });
});

describe("brandNameFromConfig", () => {
  it("does not surface BooBubble from landing copyrightOwner", () => {
    expect(brandNameFromConfig({ ...LANDING_DEFAULTS, copyrightOwner: "BooBubble" })).toBe("Yaarzo");
  });
});
