/**
 * Server-only guard for installer / diagnostics endpoints.
 *
 * Rules:
 *  - Before the app is installed: allow (bootstrap phase; no admin exists yet).
 *  - After the app is installed: require the caller to be signed in AS a
 *    super_admin. Anyone else — including regular authenticated users — is
 *    rejected with 401.
 *
 * These endpoints previously had no auth, letting any internet user probe
 * env presence, database connectivity, and even trigger destructive schema
 * operations.
 */
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

async function isInstalled(): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "installer")
      .maybeSingle();
    const v = (data?.value ?? null) as { installed?: boolean } | null;
    return !!v?.installed;
  } catch {
    // If we can't reach the DB at all, treat as not installed so the
    // installer/diagnostics can still surface the error to the operator.
    return false;
  }
}

async function currentUserIsSuperAdmin(): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return false;

  const req = getRequest();
  const authHeader = req?.headers?.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return false;

  const supabase = createClient<Database>(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) return false;

  const { data: hasRole } = await supabase.rpc("has_role", {
    _user_id: userRes.user.id,
    _role: "super_admin",
  });
  return !!hasRole;
}

export async function assertInstallerAllowed(): Promise<void> {
  const installed = await isInstalled();
  if (!installed) return; // bootstrap phase
  const ok = await currentUserIsSuperAdmin();
  if (!ok) {
    throw new Response("Unauthorized: installer endpoints require super admin after installation", {
      status: 401,
    });
  }
}

/**
 * Additional guard for destructive operations (drops the migration
 * tracker, re-runs migrations). Requires the operator to have opted-in
 * via a server-side env flag.
 */
export function assertDestructiveInstallerAllowed(): void {
  if (process.env.INSTALLER_RESET_ALLOWED !== "true") {
    throw new Response(
      "Refusing to run destructive installer operation: set INSTALLER_RESET_ALLOWED=true on the server to enable.",
      { status: 403 },
    );
  }
}
