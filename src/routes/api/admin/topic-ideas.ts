import { createFileRoute } from "@tanstack/react-router";
import { requireAdminApiAuth } from "@/lib/content-automation/auth";
import { listTopicIdeas, upsertTopicIdeas, type TopicIdeaInput } from "@/lib/content-automation/topic-ideas";

async function handleGet({ request }: { request: Request }) {
  const denied = requireAdminApiAuth(request);
  if (denied) return denied;
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const items = await listTopicIdeas({ type, status });
    return Response.json(items);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

async function handlePost({ request }: { request: Request }) {
  const denied = requireAdminApiAuth(request);
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      items?: TopicIdeaInput[];
    };
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.map((item) => {
      if (item && typeof item === "object" && !("type" in item) && body.type) {
        return { ...item, type: body.type };
      }
      return item;
    });
    const result = await upsertTopicIdeas(items);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/admin/topic-ideas")({
  server: {
    handlers: {
      GET: handleGet,
      POST: handlePost,
    },
  },
});
