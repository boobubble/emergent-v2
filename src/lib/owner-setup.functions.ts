import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Super Admin Setup Wizard — server functions.
 *
 * These endpoints are intentionally UNAUTHENTICATED because they run once,
 * before any user exists. Every write is guarded by a strict server-side
 * check: no super_admin role must currently exist. Once an owner is
 * created, both endpoints refuse further writes.
 */

export const getOwnerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count: superCount, error: rolesErr }, { data: install }] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin"),
    supabaseAdmin.rpc("get_install_status"),
  ]);

  if (rolesErr) {
    return { hasOwner: false, installed: false, error: rolesErr.message };
  }

  const installed = !!(install as any)?.installed;
  return { hasOwner: (superCount ?? 0) > 0, installed };
});

const CreateOwnerInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

export const createOwner = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreateOwnerInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Guard: refuse if any super_admin already exists.
    const { count, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    if (rolesErr) throw new Error(`Role check failed: ${rolesErr.message}`);
    if ((count ?? 0) > 0) {
      throw new Error("Super Admin already exists. This wizard is disabled.");
    }

    // Uniqueness pre-checks (auth.admin.createUser will also enforce email).
    const { data: existingUsername } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (existingUsername) throw new Error("Username is already taken.");

    // Create the auth user with email pre-confirmed.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        username: data.username,
        full_name: data.fullName,
        display_name: data.fullName,
      },
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message || "Failed to create user.");
    }
    const userId = created.user.id;

    // Ensure profile row exists and carries the wizard values (trigger runs first).
    await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          username: data.username,
          display_name: data.fullName,
        } as any,
        { onConflict: "id" }
      );

    // Grant super_admin (the permanent platform owner).
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" as any });
    if (roleErr) {
      // Roll back the auth user so the wizard stays usable on failure.
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(`Failed to grant super_admin: ${roleErr.message}`);
    }

    return { ok: true, userId, email: data.email };
  });
