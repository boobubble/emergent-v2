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
  const primitives = readFileSync(
    resolve(__dirname, "../components/home/welcome-primitives.tsx"),
    "utf8",
  );
  const shell = readFileSync(
    resolve(__dirname, "../components/home/HomeGuestShell.tsx"),
    "utf8",
  );
  const critical = readFileSync(
    resolve(__dirname, "../components/home/home-critical-css.ts"),
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
    expect(css).toContain(".welcome-light .hero-dark-preview .border-white");
  });

  it("defines homepage theme tokens for dark and light", () => {
    for (const token of [
      "--home-bg",
      "--home-card",
      "--home-card-muted",
      "--home-text",
      "--home-text-muted",
      "--home-border",
      "--home-accent",
    ]) {
      expect(css).toContain(token);
    }
    expect(css).toContain(".welcome-light");
    expect(css).toContain("--home-card: #ffffff");
    expect(css).toContain("--home-text: #0b0b1a");
    expect(css).toContain("--home-card: rgba(16, 16, 31, 0.92)");
  });

  it("does not force dark card utility classes to white globally", () => {
    expect(css).not.toMatch(/\.welcome-light \.bg-\\\[\\#10101f\\\][^{]*\{[^}]*#ffffff/);
  });

  it("maps light-mode body text off white-on-white cards", () => {
    expect(css).toMatch(/\.welcome-light \.text-white \{ color: var\(--home-text\)/);
    expect(css).toMatch(/\.welcome-light h1 \{ color: var\(--home-text\)/);
    expect(css).toContain(".welcome-light .welcome-on-accent");
    expect(primitives).toContain("welcome-card");
    expect(primitives).toContain("var(--home-card)");
    expect(critical).toContain(".welcome-light h1");
  });

  it("persists the existing localStorage theme key", () => {
    expect(shell).toContain("palrgo-welcome-theme");
    expect(shell).toContain('localStorage.setItem("palrgo-welcome-theme"');
  });
});
