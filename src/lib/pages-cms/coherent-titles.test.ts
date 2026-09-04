import { describe, expect, it } from "vitest";
import { coherentGeneratedTitles, shortTitleCore } from "./coherent-titles";

describe("coherentGeneratedTitles", () => {
  it("keeps og:title aligned with meta_title and shortens the breadcrumb title", () => {
    const out = coherentGeneratedTitles({
      metaTitle: "Islamabad Chat Room | Free Online Chat on Yaarzo",
      h1: "Islamabad Chat Room — Margalla Ke Daaman Mein Basi City Ka Apna Online Dosti Adda",
      baseName: "islamabad",
    });
    expect(out.meta_title).toBe("Islamabad Chat Room | Free Online Chat on Yaarzo");
    expect(out.og_title).toBe(out.meta_title);
    expect(out.title).toBe("Islamabad Chat Room | Yaarzo");
    expect(out.h1).toContain("Margalla");
    expect(shortTitleCore(out.meta_title, "Islamabad Chat Room")).toBe("Islamabad Chat Room");
  });
});
