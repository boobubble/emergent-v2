import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isAdminRole, isContentEditorRole } from "@/lib/content-roles";

export async function loadUserRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role as string);
}

export async function assertAdminUser(userId: string): Promise<string[]> {
  const roles = await loadUserRoles(userId);
  if (!isAdminRole(roles)) throw new Error("Forbidden: admin only");
  return roles;
}

export async function assertContentEditor(userId: string): Promise<string[]> {
  const roles = await loadUserRoles(userId);
  if (!isContentEditorRole(roles)) throw new Error("Forbidden: content editor only");
  return roles;
}
