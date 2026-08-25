import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeFooter, HOME_EXPLORE_LINKS } from "@/components/home/HomeFooter";
import { HOME_SEO_H1 } from "@/lib/seo/home-page";

const root = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("homepage guest branding and footer", () => {
  it("does not display landing copyrightOwner or static Welcome footer columns", () => {
    const page = read("components/home/HomeSeoContent.tsx");
    expect(page).toContain("usePublicDisplayName");
    expect(page).toContain("HomeFooter");
    expect(page).not.toContain("cfg.copyrightOwner");
    expect(page).not.toContain("footerColumns.map");
    expect(page).not.toMatch(/BooBubble|boobubble|Boo Bubble/);
  });

  it("keeps a single Explore product column plus CmsFooterLinks", () => {
    const footer = read("components/home/HomeFooter.tsx");
    expect(footer).toContain("CmsFooterLinks");
    expect(footer).toContain("Explore");
    expect(footer).not.toContain("footerColumns.map");
    const hrefs = HOME_EXPLORE_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("SSRs Yaarzo branding and no BooBubble", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const html = renderToString(
      React.createElement(
        QueryClientProvider,
        { client: qc },
        React.createElement(HomeFooter, { brandName: "Yaarzo", tagline: "A place to chat" }),
      ),
    );
    expect(html).toContain("Yaarzo");
    expect(html).not.toMatch(/BooBubble|boobubble|Boo Bubble/i);
    expect(html).toContain("Explore");
    expect(html).toContain('href="/chatroom"');
    expect(html).toContain('href="/feed"');
    expect(html).toContain('href="/communities"');
    expect(html).toContain('href="/competitions"');
    expect(html).toContain('href="/poetry"');
    expect(html.match(/href="\/chatroom"/g)?.length).toBe(1);
    expect(html.match(/href="\/feed"/g)?.length).toBe(1);
  });

  it("homepage route still owns the SEO H1 string", () => {
    const page = read("components/home/HomeSeoContent.tsx");
    expect(page).toContain("HOME_SEO_H1");
    expect(HOME_SEO_H1).toBe("Free Online Chatrooms, Make Friends & Join Communities");
  });
});
