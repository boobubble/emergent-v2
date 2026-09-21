import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("chatroom route — session restoration before SSO", () => {
  it("waits for auth ready before redirect or CodyChat SSO", () => {
    const src = read("src/routes/chatroom.tsx");
    expect(src).toContain("ready");
    expect(src).toMatch(/if \(!ready\) return;/);
    expect(src).toMatch(/if \(!ready\) \{/);
    expect(src).toMatch(/}, \[ready, user, navigate, getSsoUrl\]/);
  });

  it("ignores stale SSO responses after logout, user change, or unmount", () => {
    const src = read("src/routes/chatroom.tsx");
    expect(src).toContain("let cancelled = false");
    expect(src).toMatch(/if \(cancelled\) return;/);
    expect(src).toMatch(/return \(\) => \{\s*cancelled = true;/);
  });

  it("does not redirect while auth is still hydrating", () => {
    const src = read("src/routes/chatroom.tsx");
    const effectStart = src.indexOf("useEffect(() => {");
    const ssoEffect = src.slice(effectStart, src.indexOf("}, [ready, user, navigate, getSsoUrl]"));
    expect(ssoEffect.indexOf("if (!ready) return")).toBeLessThan(
      ssoEffect.indexOf("navigate({ to: \"/\" })"),
    );
  });
});

describe("auth attacher — browser Supabase boot", () => {
  it("awaits loadBrowserSupabase before getSession and never uses the sync proxy", () => {
    const src = read("src/integrations/supabase/auth-attacher.ts");
    expect(src).toContain('from "./load-browser"');
    expect(src).toMatch(/const supabase = await loadBrowserSupabase\(\)/);
    expect(src).toMatch(/await supabase\.auth\.getSession\(\)/);
    expect(src).not.toMatch(/import \{ supabase \}/);
    expect(src).not.toContain("Supabase client used before loadBrowserSupabase()");
  });
});

describe("AuthProvider — hydration ready timing", () => {
  it("does not use a 3s ready timer on the session hydration path", () => {
    const src = read("src/lib/auth-store.tsx");
    expect(src).toContain("SESSION_HYDRATION_FALLBACK_MS");
    expect(src).toContain("15_000");
    expect(src).not.toMatch(/setTimeout\(markReady,\s*3000\)/);
  });
});

describe("Supabase project env alignment (names only)", () => {
  it("documents browser and server public credential variable names", () => {
    const serverEnv = read("src/integrations/supabase/env.server.ts");
    const browserEager = read("src/integrations/supabase/client-eager.ts");
    expect(serverEnv).toContain("SUPABASE_URL");
    expect(serverEnv).toContain("VITE_SUPABASE_URL");
    expect(serverEnv).toContain("SUPABASE_PUBLISHABLE_KEY");
    expect(serverEnv).toContain("SUPABASE_ANON_KEY");
    expect(serverEnv).not.toMatch(/console\.(log|info).*SUPABASE_SERVICE/);

    expect(browserEager).toContain("VITE_SUPABASE_URL");
    expect(browserEager).toContain("VITE_SUPABASE_PUBLISHABLE_KEY");
    expect(browserEager).toContain("process.env.SUPABASE_URL");
    expect(browserEager).not.toMatch(/SERVICE_ROLE/);
  });
});
