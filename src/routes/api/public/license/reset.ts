import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/license/reset")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("@/lib/licensing/server-api.server");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleReset } = await import("@/lib/licensing/server-api.server");
        return handleReset(request);
      },
    },
  },
});
