import { describe, it, expect } from "vitest";
import { exportAs, parseImport, type PageRecord } from "@/lib/pages-io";

describe("pages-io CMS field round-trip", () => {
  it("JSON export/import preserves new optional CMS fields and statuses", () => {
    const pages: PageRecord[] = [{
      slug: "karachi-chat-room",
      title: "Karachi Chat Room",
      content: "<p>Hello</p>",
      status: "scheduled",
      page_type: "city",
      country: "pakistan",
      state: "sindh",
      city: "karachi",
      category: "chat-rooms",
      template: "default-city-chat-room",
      primary_keyword: "Karachi chat room",
      secondary_keywords: ["karachi chat"],
      language: "en",
      h1: "Karachi Chat Room",
      noindex: false,
    }];
    const out = exportAs("json", pages);
    const back = parseImport("json", out.body);
    expect(back[0].status).toBe("scheduled");
    expect(back[0].page_type).toBe("city");
    expect(back[0].country).toBe("pakistan");
    expect(back[0].primary_keyword).toBe("Karachi chat room");
    expect(back[0].h1).toBe("Karachi Chat Room");
  });

  it("keeps legacy draft|published JSON imports working", () => {
    const raw = JSON.stringify([{ slug: "about", title: "About", content: "Hi", status: "published" }]);
    const pages = parseImport("json", raw);
    expect(pages[0].status).toBe("published");
    expect(pages[0].page_type).toBeNull();
  });
});
