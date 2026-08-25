import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("/welcome route after homepage merge", () => {
  const source = readFileSync(resolve(__dirname, "../routes/welcome.tsx"), "utf8");

  it("permanently redirects to the primary homepage", () => {
    expect(source).toMatch(/redirect\(/);
    expect(source).toMatch(/to:\s*"\/"/);
    expect(source).toMatch(/statusCode:\s*301/);
    expect(source).not.toMatch(/LandingPage/);
    expect(source).not.toMatch(/<h1/);
  });
});
