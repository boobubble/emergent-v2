import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


/**
 * Creates a fresh disposable demo account pre-loaded with 1000 coins so
 * anyone can quickly try every feature of the app. Returns the generated
 * email + password so the client can sign in immediately.
 *
 * This is intentionally public (no auth middleware) — it's the equivalent
 * of "Try the demo" on a landing page. Each call provisions a brand-new
 * account; existing accounts are never touched.
 */
export const createDemoAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Random short suffix keeps usernames/emails unique.
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `demo+${rand}@palrgo.test`;
  const password = `Demo-${rand}-${Math.random().toString(36).slice(2, 8)}`;
  const username = `demo${rand}`;

  // 1) Create the auth user (email pre-confirmed so we can sign in right away).
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, gender: "other", is_demo: true },
  });
  if (createErr || !created.user) {
    throw new Error(createErr?.message || "Could not create demo account");
  }
  const userId = created.user.id;

  // 2) The handle_new_user trigger inserts a profile row asynchronously.
  //    Poll briefly, then top up coins to 1000 and add a friendly bio.
  let profileReady = false;
  for (let i = 0; i < 20; i++) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data) { profileReady = true; break; }
    await new Promise((r) => setTimeout(r, 150));
  }

  if (profileReady) {
    await supabaseAdmin
      .from("profiles")
      .update({
        coins: 1000,
        bio: "👋 Demo account — exploring all the features!",
      })
      .eq("id", userId);
  }

  return { email, password, username };
});

/**
 * Wipes the currently signed-in demo account (created via createDemoAccount).
 * Refuses if the user is not flagged as a demo in their auth metadata.
 * Uses the existing delete_user_cascade RPC to remove all related rows, then
 * deletes the auth user. Called automatically when a demo account logs out.
 */
export const deleteDemoAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userRes, error: gErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (gErr || !userRes?.user) throw new Error("User not found");
    const u = userRes.user;
    const meta = (u.user_metadata ?? {}) as { is_demo?: boolean };

    // Defense in depth: every condition below must be true or we refuse.
    // 1) Auth metadata must explicitly flag this as a demo account.
    // 2) Email must match the demo provisioning pattern (demo+xxx@palrgo.test).
    // 3) Account must NOT be an anonymous/guest user (handled by deleteGuestAccount).
    // 4) Account must NOT hold any role in user_roles (no admins/mods ever).
    const isDemoFlag = meta.is_demo === true;
    const emailOk = typeof u.email === "string" && /^demo\+[a-z0-9]+@palrgo\.test$/i.test(u.email);
    const notAnon = u.is_anonymous !== true;

    const { count: roleCount, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (roleErr) throw new Error(roleErr.message);
    const hasNoRoles = (roleCount ?? 0) === 0;

    if (!isDemoFlag || !emailOk || !notAnon || !hasNoRoles) {
      throw new Error("Refusing to delete: account does not match demo profile");
    }


    // Cascade-delete all rows owned by this user across the schema.
    const { error: rpcErr } = await supabaseAdmin.rpc("delete_user_cascade", { _user: userId });
    if (rpcErr) throw new Error(rpcErr.message);

    const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (dErr) throw new Error(dErr.message);
    return { ok: true };
  });
