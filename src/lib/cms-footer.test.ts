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

describe("footer query filters", () => {
  it("getFooterLinks only returns published + show_in_footer pages", () => {
    const fn = read("lib/pages.functions.ts");
    expect(fn).toContain('.eq("status", "published")');
    expect(fn).toContain('.eq("show_in_footer", true)');
    expect(fn).toContain('.not("published_at", "is", null)');
    expect(fn).toContain('.order("footer_order", { ascending: true })');
    expect(fn).toContain(".limit(10)");
  });

  it("featured does not control footer — show_in_footer is independent", () => {
    const schema = read("lib/pages-cms/schemas.ts");
    const featuredLine = schema.indexOf("featured: z.boolean()");
    const footerLine = schema.indexOf("show_in_footer: z.boolean()");
    expect(featuredLine).toBeGreaterThan(-1);
    expect(footerLine).toBeGreaterThan(-1);
    expect(footerLine).not.toBe(featuredLine);
  });
});

describe("page editor footer controls", () => {
  it("editor has footer sidebar card separate from featured", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain('title="Footer"');
    expect(editor).toContain("Show in footer");
    expect(editor).toContain("Footer order");
    expect(editor).toContain('title="Featured"');
    expect(editor).toContain("Show as featured");
  });

  it("editor PageRow includes footer fields", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain("show_in_footer: boolean");
    expect(editor).toContain("footer_order: number");
    expect(editor).toContain("footer_group: string | null");
  });

  it("editor save payload includes footer fields", () => {
    const editor = read("routes/pages-editor.$id.tsx");
    expect(editor).toContain("show_in_footer: row.show_in_footer");
    expect(editor).toContain("footer_order: row.footer_order");
    expect(editor).toContain("footer_group: row.footer_group");
  });
});

describe("admin footer links manager", () => {
  it("admin route exists for footer-links", () => {
    const route = read("routes/admin.pages.footer-links.tsx");
    expect(route).toContain('createFileRoute("/admin/pages/footer-links")');
    expect(route).toContain("listFooterPages");
    expect(route).toContain("updateFooterPages");
    expect(route).toContain("Footer Links");
  });

  it("subnav includes Footer Links", () => {
    const subnav = read("components/admin/pages/PagesSubnav.tsx");
    expect(subnav).toContain('"/admin/pages/footer-links"');
    expect(subnav).toContain('"Footer Links"');
  });
});

describe("shared CMS footer component", () => {
  it("renders links to /{slug}", () => {
    const comp = read("components/CmsFooterLinks.tsx");
    expect(comp).toContain("getFooterLinks");
    expect(comp).toContain("Quick Links");
    expect(comp).toContain("to={link.href}");
  });

  it("hides when no links returned", () => {
    const comp = read("components/CmsFooterLinks.tsx");
    expect(comp).toContain("if (!items.length) return null");
  });

  it("is integrated in welcome page footer", () => {
    const welcome = read("routes/welcome.tsx");
    expect(welcome).toContain("CmsFooterLinks");
  });

  it("is integrated in landing footer", () => {
    const landing = read("components/landing/LandingFooter.tsx");
    expect(landing).toContain("CmsFooterLinks");
  });
});

describe("footer_order is respected", () => {
  it("query orders by footer_order ASC then title ASC", () => {
    const fn = read("lib/pages.functions.ts");
    const footerSection = fn.substring(fn.indexOf("getFooterLinks"));
    expect(footerSection).toContain('.order("footer_order", { ascending: true })');
    expect(footerSection).toContain('.order("title", { ascending: true })');
  });
});
