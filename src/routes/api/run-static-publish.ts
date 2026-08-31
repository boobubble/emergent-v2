import { createFileRoute } from "@tanstack/react-router";
import { requireCronOrAdminAuth } from "@/lib/content-automation/auth";
import { runStaticPublish } from "@/lib/content-automation/static-publish";

async function handle({ request }: { request: Request }) {
  const denied = requireCronOrAdminAuth(request);
  if (denied) return denied;
  try {
    return await runStaticPublish(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[run-static-publish]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/run-static-publish")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
