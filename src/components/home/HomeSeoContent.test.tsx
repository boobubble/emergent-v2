import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { HOME_SEO_H1 } from "@/lib/seo/home-page";

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(" ").filter(Boolean).length;
}

describe("HomeSeoContent SSR", () => {
  const html = renderToString(React.createElement(HomeSeoContent));

  it("emits the crawlable H1 without client JavaScript", () => {
    const decoded = html.replace(/&amp;/g, "&");
    expect(decoded).toContain(HOME_SEO_H1);
    expect(html).toContain("Free Online Chatrooms, Make Friends");
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    expect(html).not.toContain("Loading…");
  });

  it("includes meaningful paragraph copy in the 350–500 word range", () => {
    const words = countWords(html);
    expect(words).toBeGreaterThanOrEqual(350);
    expect(words).toBeLessThanOrEqual(500);
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
      "/welcome",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });
});
