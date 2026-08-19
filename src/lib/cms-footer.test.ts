import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("CMS footer fields", () => {
  it("schema includes show_in_footer, footer_order, footer_group", () => {
    const schema = read("lib/pages-cms/schemas.ts");
    expect(schema).toContain("show_in_footer: z.boolean()");
    expect(schema).toContain("footer_order: z.number()");
    expect(schema).toContain("footer_group: z.string()");
  });

  it("page-write propagates footer fields", () => {
    const pw = read("lib/pages-cms/page-write.ts");
    expect(pw).toContain("row.show_in_footer = data.show_in_footer");
    expect(pw).toContain("row.footer_order = data.footer_order");
    expect(pw).toContain("row.footer_group = data.footer_group");
  });
});

describe("footer query returns grouped results", () => {
  it("getFooterLinks returns 3 group keys", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain("quick_links: [],");
    expect(fn).toContain("famous_chat_rooms: [],");
    expect(fn).toContain("popular_chat_rooms: [],");
  });

  it("only returns published + show_in_footer + valid footer_group", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain('.eq("status", "published")');
    expect(fn).toContain('.eq("show_in_footer", true)');
    expect(fn).toContain('.not("published_at", "is", null)');
    expect(fn).toContain(".in(\"footer_group\"");
  });

  it("orders by footer_order ASC then title ASC per group", () => {
    const fn = read("lib/pages.functions.ts");
    const section = fn.substring(fn.indexOf("getFooterLinks"));
    expect(section).toContain('.order("footer_order", { ascending: true })');
    expect(section).toContain('.order("title", { ascending: true })');
  });

  it("caps each group at 10 links", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain("grouped[g].length < 10");
  });

  it("featured does not control footer — independent fields", () => {
    const schema = read("lib/pages-cms/schemas.ts");
    expect(schema).toContain("featured: z.boolean()");
    expect(schema).toContain("show_in_footer: z.boolean()");
  });
});

describe("page editor footer controls", () => {
  it("has footer section selector with 3 groups", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain('title="Footer"');
    expect(editor).toContain("Show in footer");
    expect(editor).toContain("Footer section");
    expect(editor).toContain("Footer order");
    expect(editor).toContain('"quick_links">Quick Links');
    expect(editor).toContain('"famous_chat_rooms">Famous Chat Rooms');
    expect(editor).toContain('"popular_chat_rooms">Popular Chat Rooms');
  });

  it("keeps featured separate from footer", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain('title="Featured"');
    expect(editor).toContain("Show as featured");
  });

  it("save payload includes footer_group", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain("footer_group: row.footer_group");
  });
});

describe("admin footer links manager", () => {
  it("shows 3 grouped sections", () => {
    const route = read("routes/admin.pages.footer-links.tsx");
    expect(route).toContain("FOOTER_GROUPS");
    expect(route).toContain("FOOTER_GROUP_LABELS");
    expect(route).toContain("assignGroup");
    expect(route).toContain("removeFromFooter");
    expect(route).toContain("moveInGroup");
  });

  it("updateFooterPages accepts footer_group", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain("footer_group: z.enum");
    expect(fn).toContain("footer_group: u.footer_group");
  });
});

describe("public footer component", () => {
  it("renders grouped columns dynamically", () => {
    const comp = read("components/CmsFooterLinks.tsx");
    expect(comp).toContain("FOOTER_GROUP_LABELS");
    expect(comp).toContain("GROUP_ORDER");
    expect(comp).toContain('["quick_links", "famous_chat_rooms", "popular_chat_rooms"]');
  });

  it("uses actual slug for href", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain("href: `/${r.slug}`");
  });

  it("hides empty groups", () => {
    const comp = read("components/CmsFooterLinks.tsx");
    expect(comp).toContain("if (!items?.length) return null");
  });

  it("hides entire footer when no links", () => {
    const comp = read("components/CmsFooterLinks.tsx");
    expect(comp).toContain("if (!hasAny) return null");
  });

  it("is integrated in welcome page", () => {
    const welcome = read("routes/welcome.tsx");
    expect(welcome).toContain("CmsFooterLinks");
    expect(welcome).not.toContain("StaticFooterColumns");
  });

  it("is integrated in landing footer", () => {
    const landing = read("components/landing/LandingFooter.tsx");
    expect(landing).toContain("CmsFooterLinks");
    expect(landing).not.toContain("StaticFooterColumns");
  });
});

describe("static config removed", () => {
  it("footer-chatroom-links.ts no longer exists", () => {
    expect(() => read("components/footer/footer-chatroom-links.ts")).toThrow();
  });

  it("StaticFooterColumns.tsx no longer exists", () => {
    expect(() => read("components/footer/StaticFooterColumns.tsx")).toThrow();
  });
});

describe("no duplicate page across groups", () => {
  it("each page assigned to one footer_group at a time", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain("footer_group: z.enum");
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain('update("footer_group", v)');
  });
});
