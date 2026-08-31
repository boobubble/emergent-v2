import { createFileRoute } from "@tanstack/react-router";
import { requireCronOrAdminAuth } from "@/lib/content-automation/auth";
import { runBlogPublish } from "@/lib/content-automation/blog-publish";

async function handle({ request }: { request: Request }) {
  const denied = requireCronOrAdminAuth(request);
  if (denied) return denied;
  try {
    return await runBlogPublish();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[run-blog-publish]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/run-blog-publish")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
