import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { HOME_SEO_H1 } from "@/lib/seo/home-page";

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(" ").filter(Boolean).length;
}

function seoCopyHtml(html: string): string {
  return (html.match(/<section[^>]*data-seo-copy[\s\S]*?<\/section>/g) ?? []).join(" ");
}

describe("HomeSeoContent SSR", () => {
  const html = renderToString(React.createElement(HomeSeoContent));

  it("emits the crawlable H1 without client JavaScript", () => {
    const decoded = html.replace(/&amp;/g, "&");
    expect(decoded).toContain(HOME_SEO_H1.replace("Join Communities", "").trim());
    expect(decoded).toContain("Join Communities");
    expect(html).toContain("Free Online Chatrooms, Make Friends");
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    expect(html).not.toContain("Loading…");
    expect(html.match(/<h1[\s\S]*?<\/h1>/)?.[0]).not.toMatch(/Join The Ultimate/);
  });

  it("includes meaningful paragraph copy in the 350–600 word range", () => {
    const words = countWords(seoCopyHtml(html));
    expect(words).toBeGreaterThanOrEqual(350);
    expect(words).toBeLessThanOrEqual(600);
    expect(html).toContain("<p");
  });

  it("uses real hrefs to existing routes", () => {
    for (const href of [
      "/chatroom",
      "/feed",
      "/communities",
      "/competitions",
      "/poetry",
      "/india-chat-room",
      "/pakistan-chat-room",
      "/lahore-chat-room",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('href="/welcome"');
  });

  it("renders the welcome visual shell in initial HTML", () => {
    expect(html).toContain("welcome-root");
    expect(html).toContain("hero-dark-preview");
    expect(html).toContain("Join Free");
    expect(html).toContain("Login");
  });
});
