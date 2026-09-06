import { createFileRoute } from "@tanstack/react-router";
import { requireAdminApiAuth } from "@/lib/content-automation/auth";
import { db, getAutomationSettings, type AutomationSettings } from "@/lib/content-automation/db";
import { AUTOMATION_SETTINGS_PATCH_KEYS, asBool, asInt, normalizeAutomationSettings } from "@/lib/content-automation/seo-settings";

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

    for (const key of AUTOMATION_SETTINGS_PATCH_KEYS) {
      if (!(key in body)) continue;
      const value = body[key];
      if (typeof value === "boolean") {
        patch[key] = asBool(value, false);
      } else if (typeof value === "number" && Number.isFinite(value)) {
        patch[key] = asInt(value, 0);
      } else if (typeof value === "string" && key === "refresh_type") {
        patch[key] = value.slice(0, 40);
      }
    }

    const { data, error } = await db()
      .from("automation_settings")
      .update(patch)
      .eq("id", 1)
      .select("*")
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(normalizeAutomationSettings(data));
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
