import { describe, expect, it } from "vitest";
import {
  displayNameFromFilename,
  sanitizePackName,
  uniqueZipName,
  validateStickerFile,
  MAX_STICKER_BYTES,
} from "./sticker-catalog";

describe("sticker-catalog", () => {
  it("builds a display name from a gif filename", () => {
    expect(displayNameFromFilename("cute-cat-love.gif")).toBe("Cute Cat Love");
  });

  it("trims and limits pack names", () => {
    expect(sanitizePackName("  Cute Bubu Pack  ")).toBe("Cute Bubu Pack");
  });

  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(MAX_STICKER_BYTES + 1)], "funny.gif", { type: "image/gif" });
    expect(validateStickerFile(file)).toMatch(/exceeds/i);
  });

  it("rejects unsupported types", () => {
    const file = new File([new Uint8Array(10)], "file.exe", { type: "application/x-msdownload" });
    expect(validateStickerFile(file)).toMatch(/unsupported/i);
  });

  it("disambiguates zip entry names", () => {
    const used = new Set<string>();
    expect(uniqueZipName(used, "love.gif")).toBe("love.gif");
    expect(uniqueZipName(used, "love.gif")).toBe("love-2.gif");
  });
});
