import { createFileRoute } from "@tanstack/react-router";
import { requireCronOrAdminAuth } from "@/lib/content-automation/auth";
import { cleanupExpiredChatImages, cleanupOrphanChatImages } from "@/lib/chat-image.functions";

async function handle({ request }: { request: Request }) {
  const denied = requireCronOrAdminAuth(request);
  if (denied) return denied;
  try {
    const expired = await cleanupExpiredChatImages();
    const orphans = await cleanupOrphanChatImages();
    return Response.json({ ok: true, expired, orphans });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[run-chat-image-cleanup]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/run-chat-image-cleanup")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
