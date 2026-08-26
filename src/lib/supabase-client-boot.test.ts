import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("supabase client boot — do not crash the application boundary", () => {
  it("mirrors SUPABASE_URL into VITE_SUPABASE_URL for the client bundle", () => {
    const vite = read("vite.config.ts");
    expect(vite).toMatch(/env\.VITE_SUPABASE_URL\s*=\s*url/);
    expect(vite).toMatch(/import\.meta\.env\.VITE_SUPABASE_URL/);
    expect(vite).toMatch(/clientEnvDefine/);
    expect(vite).not.toMatch(/SUPABASE_SERVICE_ROLE/);
    expect(vite).toContain("yaarzo-client-stub-server-supabase");
  });

  it("client.ts never reads the service role key", () => {
    const src = read("src/integrations/supabase/client.ts");
    expect(src).not.toMatch(/process\.env\.SUPABASE_SERVICE/);
    expect(src).not.toMatch(/from ["']@supabase\/supabase-js["']/);
    expect(src).toContain('import("./client-eager")');
    const eager = read("src/integrations/supabase/client-eager.ts");
    expect(eager).toMatch(/VITE_SUPABASE_URL/);
    expect(eager).toMatch(/VITE_SUPABASE_PUBLISHABLE_KEY/);
    expect(eager).toContain("createRawBrowserClient");
    expect(eager).toContain('import("@supabase/supabase-js")');
    expect(eager).not.toMatch(/import \{ createClient \} from ["']@supabase\/supabase-js["']/);
    expect(eager).not.toMatch(/process\.env\.SUPABASE_SERVICE/);
  });

  it("AuthProvider loads Supabase on demand and skips guest home", () => {
    const src = read("src/lib/auth-store.tsx");
    expect(src).toContain("loadBrowserSupabase");
    expect(src).toContain("isGuestHomePath");
    expect(src).toMatch(/try \{[\s\S]*getSession[\s\S]*\} catch/);
    expect(src).toMatch(/onAuthStateChange failed to attach/);
    expect(src).not.toContain('from "@/integrations/supabase/client"');
  });

  it("AppSettingsProvider catches sync channel subscribe throws", () => {
    const src = read("src/lib/app-settings.tsx");
    expect(src).toMatch(/realtime subscribe failed/);
    expect(src).toMatch(/try \{[\s\S]*supabase[\s\S]*\.channel\(/);
  });
});
