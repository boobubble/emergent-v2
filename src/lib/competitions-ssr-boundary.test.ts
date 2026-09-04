import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function readRoute(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("competitions SSR boundary", () => {
  it("competitions.$slug uses server fetch on SSR and avoids browser supabase in loader", () => {
    const source = readRoute("routes/competitions.$slug.tsx");
    expect(source).toContain("getPublishedCompetitionBySlug");
    expect(source).toContain('typeof window === "undefined"');
    expect(source).not.toMatch(
      /loader:[\s\S]*from\s+["']@\/integrations\/supabase\/client["']/
    );
  });

  it("competitions.$slug.recap uses server fetch on SSR", () => {
    const source = readRoute("routes/competitions.$slug.recap.tsx");
    expect(source).toContain("getPublishedCompetitionBySlug");
    expect(source).toContain('typeof window === "undefined"');
  });

  it("competitions.public uses supabaseAdmin only", () => {
    const source = readFileSync(join(__dirname, "competitions.public.ts"), "utf8");
    expect(source).toContain("supabaseAdmin");
    expect(source).toContain("@/integrations/supabase/client.server");
    expect(source).not.toMatch(/from\s+["']@\/integrations\/supabase\/client["']/);
  });
});
