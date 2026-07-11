import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/license/deactivate")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("@/lib/licensing/server-api.server");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleDeactivate } = await import("@/lib/licensing/server-api.server");
        return handleDeactivate(request);
      },
    },
  },
});
