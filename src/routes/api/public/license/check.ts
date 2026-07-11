import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/license/check")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("@/lib/licensing/server-api.server");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleCheck } = await import("@/lib/licensing/server-api.server");
        return handleCheck(request);
      },
    },
  },
});
