import { createServerFn } from "@tanstack/react-start";

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
