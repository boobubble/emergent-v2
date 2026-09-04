import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  isAdminRole,
  isContentEditorRole,
  summarizeRoles,
  writerFlagFromRows,
} from "@/lib/content-roles";

export async function loadUserRoles(userId: string): Promise<string[]> {
  const state = await loadUserRoleState(userId);
  return state.roles;
}

export async function loadUserRoleState(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role, can_edit_existing_content")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const roles = rows.map((r) => r.role as string);
  return summarizeRoles(roles, { writerCanEditExisting: writerFlagFromRows(rows) });
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

export async function assertExistingContentEditor(userId: string): Promise<string[]> {
  const state = await loadUserRoleState(userId);
  if (!state.canEditExistingContent) throw new Error("Forbidden: cannot edit existing content");
  return state.roles;
}
