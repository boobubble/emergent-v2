import { createFileRoute } from "@tanstack/react-router";
import { requireAdminApiAuth } from "@/lib/content-automation/auth";
import {
  IdeaNotFoundError,
  listTopicIdeas,
  updateIdeaKeywords,
  upsertTopicIdeas,
  type TopicIdeaInput,
} from "@/lib/content-automation/topic-ideas";

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

async function handlePatch({ request }: { request: Request }) {
  const denied = requireAdminApiAuth(request);
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      id?: number;
      keywords?: string;
      mode?: string;
    };
    const type = body.type === "blog" || body.type === "page" ? body.type : null;
    const id = Number(body.id);
    if (!type) return Response.json({ error: "type must be blog or page" }, { status: 400 });
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    const result = await updateIdeaKeywords({
      type,
      id,
      keywords: typeof body.keywords === "string" ? body.keywords : "",
      mode: body.mode === "append" ? "append" : "replace",
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof IdeaNotFoundError ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}

export const Route = createFileRoute("/api/admin/topic-ideas")({
  server: {
    handlers: {
      GET: handleGet,
      POST: handlePost,
      PATCH: handlePatch,
    },
  },
});
