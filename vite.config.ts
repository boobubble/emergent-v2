// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
});
