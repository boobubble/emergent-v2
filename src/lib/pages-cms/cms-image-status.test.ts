import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { attachImageStatus, summarizeContentImages } from "@/lib/content-image-seo";

describe("custom pages list image status", () => {
  it("derives status from content HTML without extra storage fetches", () => {
    const row = attachImageStatus(
      { id: "1", slug: "lahore-chat-room", title: "Lahore", content: "<p>Hi</p>", intro_content: "" },
      ["<p>Hi</p>", ""],
    );
    expect(row.image_status.kind).toBe("missing");
    expect(row).not.toHaveProperty("content");
  });

  it("counts intro + body images together", () => {
    const html = '<img src="https://yaarzo.com/a.webp" alt="Lahore chat cover">';
    const s = summarizeContentImages(html, "");
    expect(s.kind).toBe("ready");
  });

  it("wires Image Status into the existing All Pages list and page editor", () => {
    const allPages = readFileSync(resolve(process.cwd(), "src/routes/admin.pages.all.tsx"), "utf8");
    const editor = readFileSync(resolve(process.cwd(), "src/routes/pages-editor.$id.tsx"), "utf8");
    expect(allPages).toContain("ImageStatusBadge");
    expect(allPages).toContain("image_status");
    expect(editor).toContain("ImageSeoPanel");
    expect(editor).toContain("Image improvements can be completed later");
    expect(editor).not.toMatch(/imageStatus\.kind === "missing"[\s\S]{0,80}return/);
  });
});
