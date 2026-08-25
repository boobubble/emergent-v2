import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guard against a recurring regression: the welcome page hero preview
 * and "Connected" badge are dark-by-design surfaces. If anyone removes
 * the `.hero-dark-preview` class or the matching `.welcome-light`
 * overrides, those elements become invisible (white-on-white) in light
 * theme.
 *
 * See: docs/qa/theme-switching-checklist.md
 */
describe("welcome page theme guards", () => {
  const css = readFileSync(
    resolve(__dirname, "../components/home/welcome-theme-css.ts"),
    "utf8",
  );
  const source = readFileSync(
    resolve(__dirname, "../components/home/HomeSeoContent.tsx"),
    "utf8",
  );

  it("keeps the hero-dark-preview class on at least two surfaces", () => {
    const matches = source.match(/hero-dark-preview/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("retains the .welcome-light .hero-dark-preview text override", () => {
    expect(css).toMatch(
      /\.welcome-light \.hero-dark-preview \.text-white\b/,
    );
  });

  it("retains the .welcome-light .hero-dark-preview border override", () => {
    expect(css).toMatch(
      /\.welcome-light \.hero-dark-preview \.border-white\\\/10/,
    );
  });
});
