import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { headFromRouteSeo } from "./load-route-seo";
import {
  NOT_FOUND_ROBOTS,
  NOT_FOUND_SEO_TITLE,
  notFoundSeo,
  notFoundSeoHead,
} from "./not-found";

describe("404 SEO template", () => {
  it("emits noindex without a lovable or homepage canonical", () => {
    const seo = notFoundSeo();
    expect(seo.title).toBe(NOT_FOUND_SEO_TITLE);
    expect(seo.robots).toBe(NOT_FOUND_ROBOTS);
    expect(seo.noindex).toBe(true);
    expect(seo.nofollow).toBe(false);
    expect(seo.canonical).toBe("");
    expect(JSON.stringify(seo).toLowerCase()).not.toContain("lovable.app");

    const head = notFoundSeoHead();
    expect(head.meta.some((m) => m.title === NOT_FOUND_SEO_TITLE)).toBe(true);
    expect(head.meta.some((m) => m.name === "robots" && m.content === NOT_FOUND_ROBOTS)).toBe(true);
    expect(head.links.some((l) => l.rel === "canonical")).toBe(false);
    expect(JSON.stringify(head).toLowerCase()).not.toContain("lovable.app");
    expect(JSON.stringify(head)).not.toContain("https://yaarzo.com/");
  });

  it("uses the 404 template when route SEO loader data is missing", () => {
    const head = headFromRouteSeo(undefined);
    expect(head.meta.some((m) => m.title === NOT_FOUND_SEO_TITLE)).toBe(true);
    expect(head.meta.some((m) => m.name === "robots" && String(m.content).includes("noindex"))).toBe(true);
    expect(JSON.stringify(head).toLowerCase()).not.toContain("lovable.app");
  });

  it("keeps unknown CMS slugs and missing profiles on throw notFound()", () => {
    const slugSrc = readFileSync(resolve(process.cwd(), "src/routes/$slug.tsx"), "utf8");
    const profileSrc = readFileSync(resolve(process.cwd(), "src/routes/u.$username.tsx"), "utf8");
    expect(slugSrc).toContain("if (!page) throw notFound()");
    expect(profileSrc).toContain("if (!profile) throw notFound()");
    expect(profileSrc).toContain("notFoundComponent: MissingProfileNotFound");
  });
});
