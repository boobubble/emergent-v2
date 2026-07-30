// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcAlias = { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "src") + "/$1" };

/** Supabase vars mirrored from VITE_* when server names are absent. */
const SUPABASE_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

function applySupabaseEnvAliases(env: Record<string, string>) {
  if (!env.SUPABASE_URL && env.VITE_SUPABASE_URL) {
    env.SUPABASE_URL = env.VITE_SUPABASE_URL;
  }
  if (!env.SUPABASE_PUBLISHABLE_KEY && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    env.SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  }
  if (!env.SUPABASE_PROJECT_ID && env.VITE_SUPABASE_PROJECT_ID) {
    env.SUPABASE_PROJECT_ID = env.VITE_SUPABASE_PROJECT_ID;
  }
  for (const key of SUPABASE_ENV_KEYS) {
    const value = env[key]?.trim();
    if (value && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Load .env / .env.local before config is evaluated so server-side aliases
// (SUPABASE_* ← VITE_*) exist for dev, build, and Nitro bundling.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
applySupabaseEnvAliases(env);

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// This entry is fetch-shaped and works for both the Cloudflare-module preset (used inside
// the Lovable sandbox) and the Node standalone preset (default self-hosting target).
//
// Self-hosting target: Nitro `node-server` preset. Produces `.output/server/index.mjs`,
// which starts an HTTP server listening on `process.env.PORT || 3000`. Deploy with:
//   npm install && npm run build && node .output/server/index.mjs
//
// Inside the Lovable sandbox, the preset is forced back to `cloudflare-module` by the
// @lovable.dev preset — that only affects preview builds, not self-hosted production.
//
// The explicit `resolve.alias` below guarantees `@/*` resolves in every Vite environment
// (client, ssr, worker, router client/server) even if a downstream build target strips
// the tsconfig-paths plugin. This is a defensive fallback on top of the plugin.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    envDir: process.cwd(),
    ssr: {
      noExternal: ["tslib"],
    },
    resolve: {
      alias: [srcAlias],
    },
  },
});
