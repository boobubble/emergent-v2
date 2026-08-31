import { createFileRoute } from "@tanstack/react-router";
import { requireAdminApiAuth } from "@/lib/content-automation/auth";
import { db, getAutomationSettings, type AutomationSettings } from "@/lib/content-automation/db";

async function handleGet({ request }: { request: Request }) {
  const denied = requireAdminApiAuth(request);
  if (denied) return denied;
  try {
    const settings = await getAutomationSettings();
    return Response.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

async function handlePatch({ request }: { request: Request }) {
  const denied = requireAdminApiAuth(request);
  if (denied) return denied;
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<AutomationSettings>;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.blog_posts_per_day === "number" && Number.isFinite(body.blog_posts_per_day)) {
      patch.blog_posts_per_day = Math.max(0, Math.floor(body.blog_posts_per_day));
    }
    if (typeof body.static_pages_per_day === "number" && Number.isFinite(body.static_pages_per_day)) {
      patch.static_pages_per_day = Math.max(0, Math.floor(body.static_pages_per_day));
    }
    if (typeof body.automation_enabled === "boolean") {
      patch.automation_enabled = body.automation_enabled;
    }

    const { data, error } = await db()
      .from("automation_settings")
      .update(patch)
      .eq("id", 1)
      .select("id, blog_posts_per_day, static_pages_per_day, automation_enabled, updated_at")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/admin/automation-settings")({
  server: {
    handlers: {
      GET: handleGet,
      PATCH: handlePatch,
    },
  },
});
