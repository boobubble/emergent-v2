import { describe, it, expect } from "vitest";
import {
  slugifyPageSlug,
  extractSlugInput,
  validatePageSlug,
  pagePublicPath,
} from "./page-slug";

describe("page-slug", () => {
  it("converts Indian Chat Room to indian-chat-room", () => {
    expect(slugifyPageSlug("Indian Chat Room")).toBe("indian-chat-room");
  });

  it("normalizes multiple spaces and underscores", () => {
    expect(slugifyPageSlug("Indian   Chat_Room")).toBe("indian-chat-room");
  });

  it("preserves numbers", () => {
    expect(slugifyPageSlug("Best Chat Room 2026")).toBe("best-chat-room-2026");
  });

  it("extracts slug from path and full URL", () => {
    expect(slugifyPageSlug("/indian-chat-room/")).toBe("indian-chat-room");
    expect(slugifyPageSlug("https://domain.com/indian-chat-room")).toBe("indian-chat-room");
    expect(slugifyPageSlug("domain.com/indian-chat-room")).toBe("indian-chat-room");
  });

  it("strips special characters", () => {
    expect(slugifyPageSlug("Hello! @World #2026")).toBe("hello-world-2026");
  });

  it("rejects reserved slugs", () => {
    expect(validatePageSlug("admin")).toMatch(/reserved/i);
    expect(validatePageSlug("welcome")).toMatch(/reserved/i);
    expect(validatePageSlug("competitions")).toMatch(/reserved/i);
  });

  it("requires slug when publishing", () => {
    expect(validatePageSlug("", { required: true })).toMatch(/required/i);
  });

  it("keeps hyphens in public path", () => {
    expect(pagePublicPath("indian-chat-room")).toBe("/indian-chat-room");
  });

  it("does not delete spaces without hyphenation (regression)", () => {
    const badPattern = "Indian Chat Room"
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    expect(badPattern).toBe("indianchatroom");
    expect(slugifyPageSlug("Indian Chat Room")).not.toBe("indianchatroom");
  });

  it("extractSlugInput handles bare slug", () => {
    expect(extractSlugInput("indian-chat-room")).toBe("indian-chat-room");
  });
});
