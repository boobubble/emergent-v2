import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/license/verify")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("@/lib/licensing/server-api.server");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleVerify } = await import("@/lib/licensing/server-api.server");
        return handleVerify(request);
      },
    },
  },
});
