import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Validates the Authorization: Bearer <secret> header against the feedbot
 * hook secret stored in public.app_settings. Returns null on success, or a
 * Response to return immediately on failure.
 */
export async function requireFeedbotHookAuth(request: Request): Promise<Response | null> {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const provided = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
  if (!provided) return new Response("Unauthorized", { status: 401 });

  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "feedbot_hook_secret")
    .maybeSingle();

  const expected =
    typeof data?.value === "string" ? data.value : null;
  if (!expected || expected.length < 16) {
    return new Response("Hook secret not configured", { status: 503 });
  }
  // Constant-time-ish compare
  if (provided.length !== expected.length) return new Response("Unauthorized", { status: 401 });
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return new Response("Unauthorized", { status: 401 });
  return null;
}
