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
  });

  it("client.ts never reads the service role key", () => {
    const src = read("src/integrations/supabase/client.ts");
    expect(src).toMatch(/VITE_SUPABASE_URL/);
    expect(src).toMatch(/VITE_SUPABASE_PUBLISHABLE_KEY/);
    expect(src).not.toMatch(/process\.env\.SUPABASE_SERVICE/);
  });

  it("AuthProvider catches sync getSession proxy throws", () => {
    const src = read("src/lib/auth-store.tsx");
    expect(src).toMatch(/try \{[\s\S]*supabase\.auth\.getSession\(\)[\s\S]*\} catch/);
    expect(src).toMatch(/onAuthStateChange failed to attach/);
  });

  it("AppSettingsProvider catches sync channel subscribe throws", () => {
    const src = read("src/lib/app-settings.tsx");
    expect(src).toMatch(/realtime subscribe failed/);
    expect(src).toMatch(/try \{[\s\S]*supabase[\s\S]*\.channel\(/);
  });
});
