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

/** Public Supabase vars. Mirror VITE_* ↔ server names so the client bundle can inline them. */
const SUPABASE_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PROJECT_ID",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

function firstEnv(env: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = (env[key] || process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
}

function applySupabaseEnvAliases(env: Record<string, string>) {
  const url = firstEnv(env, "VITE_SUPABASE_URL", "SUPABASE_URL");
  const key = firstEnv(env, "VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY");
  const projectId = firstEnv(env, "VITE_SUPABASE_PROJECT_ID", "SUPABASE_PROJECT_ID");

  if (url) {
    env.SUPABASE_URL = url;
    env.VITE_SUPABASE_URL = url;
  }
  if (key) {
    env.SUPABASE_PUBLISHABLE_KEY = key;
    env.VITE_SUPABASE_PUBLISHABLE_KEY = key;
  }
  if (projectId) {
    env.SUPABASE_PROJECT_ID = projectId;
    env.VITE_SUPABASE_PROJECT_ID = projectId;
  }

  for (const name of SUPABASE_ENV_KEYS) {
    const value = env[name]?.trim();
    if (value && process.env[name] === undefined) {
      process.env[name] = value;
    }
  }
}

// Load .env / .env.local before config is evaluated so server-side aliases
// (SUPABASE_* ← VITE_*) exist for dev, build, and Nitro bundling.
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
applySupabaseEnvAliases(env);

const clientSupabaseUrl = firstEnv(env, "VITE_SUPABASE_URL", "SUPABASE_URL");
const clientSupabaseKey = firstEnv(env, "VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY");
const clientEnvDefine: Record<string, string> = {};
if (clientSupabaseUrl) {
  clientEnvDefine["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(clientSupabaseUrl);
}
if (clientSupabaseKey) {
  clientEnvDefine["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(clientSupabaseKey);
}

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
    minify: false,
    sourceMap: false,
    rollupConfig: {
      output: {
        inlineDynamicImports: false,
      },
    },
  } as Record<string, unknown>,
  vite: {
    envDir: process.cwd(),
    define: clientEnvDefine,
    build: {
      sourcemap: false,
      modulePreload: {
        resolveDependencies(_filename, deps) {
          return deps.filter(
            (dep) => !/MehfilTrendingWidget|AuthScreen|AuthDialogs|ChatApp|app-shells|GuestNicknameDialog/.test(dep),
          );
        },
      },
      rollupOptions: {
        maxParallelFileOps: 2,
        output: {
          // Merge tiny Lucide leaves into their importers so guest `/` does
          // not preload ~20 sub-1KB icon files. Keep below GuestNicknameDialog
          // (~2KB) so that chunk stays lazy.
          experimentalMinChunkSize: 700,
        },
      },
    },
    plugins: [
      {
        // isomorphic-dompurify's package "default"/"browser" export is window-only
        // and throws during SSR module evaluation. Force the Node/jsdom entry for
        // any SSR resolve so /$slug can render real HTML (not an empty <!--$!--> slot).
        name: "yaarzo-isomorphic-dompurify-node-ssr",
        enforce: "pre",
        resolveId(id, _importer, options) {
          if (id !== "isomorphic-dompurify") return null;
          if (!options?.ssr) return null;
          return path.resolve(
            __dirname,
            "node_modules/isomorphic-dompurify/dist/index.mjs",
          );
        },
      },
    ],
    ssr: {
      noExternal: ["tslib", "isomorphic-dompurify", "dompurify"],
      resolve: {
        conditions: ["node", "import", "module", "default"],
      },
    },
    resolve: {
      alias: [srcAlias],
    },
  },
});
