import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("poetry detail SSR boundary", () => {
  it("poetry.$slug.tsx must not import the browser supabase proxy", () => {
    const src = read("src/routes/poetry.$slug.tsx");
    expect(src).toContain("getPublishedPoemBySlug");
    expect(src).toContain("if (!poem) throw notFound()");
    expect(src).toContain("loadSeoSiteContext");
    expect(src).toContain("typeof window === \"undefined\"");
    expect(src).toContain("getPoemBySlug({ data: { slug: params.slug } })");
    expect(src).toContain("PoemComments");
    expect(src).toContain("deletePublishedPoem");
    expect(src).not.toContain("Comments coming soon");
    expect(src).not.toContain('from "@/integrations/supabase/client"');
    expect(src).not.toContain("@/integrations/supabase/client\"");
    expect(src).not.toContain("useMyRoles");
  });

  it("PoemComments.tsx only calls loadBrowserSupabase from client lifecycle code", () => {
    const src = read("src/components/mehfil/PoemComments.tsx");
    expect(src).not.toContain('from "@/integrations/supabase/client"');
    expect(src).toContain("loadBrowserSupabase");
    expect(src).toContain("useEffect");
    expect(src).toContain("postPoemComment");
    expect(src).toContain("deletePoemComment");
    const withoutEffects = src.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\);/g, "");
    expect(withoutEffects).not.toMatch(/loadBrowserSupabase\s*\(/);
  });

  it("mehfil-realtime.ts only calls loadBrowserSupabase from client lifecycle code", () => {
    const src = read("src/lib/mehfil-realtime.ts");
    expect(src).not.toContain('from "@/integrations/supabase/client"');
    expect(src).toContain("loadBrowserSupabase");
    expect(src).toContain("useEffect");
    const withoutEffects = src.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\);/g, "");
    expect(withoutEffects).not.toMatch(/loadBrowserSupabase\s*\(/);
  });
});
