import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/license/activate")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("@/lib/licensing/server-api.server");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleActivate } = await import("@/lib/licensing/server-api.server");
        return handleActivate(request);
      },
    },
  },
});
