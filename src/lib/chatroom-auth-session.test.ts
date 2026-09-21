import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("chatroom route — session restoration before SSO", () => {
  it("waits for auth ready and skips guest redirect during hydration recovery", () => {
    const src = read("src/routes/chatroom.tsx");
    expect(src).toContain("shouldShowAuthHydrationRecovery");
    expect(src).toContain("shouldChatroomProceedAsGuest");
    expect(src).toContain("AuthSessionHydrationRecovery");
    expect(src).toMatch(/if \(shouldShowAuthHydrationRecovery\(hydrationState\)\) return;/);
  });

  it("ignores stale SSO responses after logout, user change, or unmount", () => {
    const src = read("src/routes/chatroom.tsx");
    expect(src).toContain("let cancelled = false");
    expect(src).toContain("applySsoResult");
    expect(src).toMatch(/return \(\) => \{\s*cancelled = true;/);
  });
});

describe("root AuthGate — hydration recovery", () => {
  it("shows recoverable hydration UI before guest redirects", () => {
    const src = read("src/routes/__root.tsx");
    expect(src).toContain("shouldShowAuthHydrationRecovery");
    expect(src).toContain("isConfirmedSignedOut");
    expect(src).toContain("AuthSessionHydrationRecovery");
    const gateStart = src.indexOf("function AuthGate()");
    const gateBody = src.slice(gateStart, gateStart + 3500);
    expect(gateBody.indexOf("shouldShowAuthHydrationRecovery")).toBeLessThan(
      gateBody.indexOf("Navigate to={landingPath}"),
    );
  });
});

describe("auth attacher — browser Supabase boot", () => {
  it("awaits loadBrowserSupabase, handles getSession error, and calls next once", () => {
    const src = read("src/integrations/supabase/auth-attacher.ts");
    expect(src).toContain('from "./load-browser"');
    expect(src).toContain("resolveBrowserAuthHeaders");
    expect(src).toMatch(/next\(\{ headers: await resolveBrowserAuthHeaders\(\) \}\)/);
    expect(src).not.toMatch(/import \{ supabase \}/);
  });
});

describe("AuthProvider — hydration ready timing", () => {
  it("does not mark ready on the hydration fallback timer", () => {
    const src = read("src/lib/auth-store.tsx");
    expect(src).toContain("SESSION_HYDRATION_FALLBACK_MS");
    expect(src).toContain("setHydrationSlow(true)");
    expect(src).not.toMatch(/setTimeout\([\s\S]*markReady/);
    expect(src).not.toMatch(/setTimeout\(markReady,\s*3000\)/);
  });
});

describe("Supabase env variable names (not same-project verification)", () => {
  it("browser build path requires publishable key names; server resolver also accepts anon aliases", () => {
    const serverEnv = read("src/integrations/supabase/env.server.ts");
    const browserEager = read("src/integrations/supabase/client-eager.ts");
    expect(serverEnv).toContain("SUPABASE_ANON_KEY");
    expect(serverEnv).toContain("SUPABASE_PUBLISHABLE_KEY");

    expect(browserEager).toContain("VITE_SUPABASE_PUBLISHABLE_KEY");
    expect(browserEager).toContain("SUPABASE_PUBLISHABLE_KEY");
    expect(browserEager).not.toContain("SUPABASE_ANON_KEY");
    expect(browserEager).not.toMatch(/SERVICE_ROLE/);
  });
});
