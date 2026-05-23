import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateUsername } from "./username-validation";

export const checkUsernameAvailable = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; excludeUserId?: string }) => {
    if (!input || typeof input.username !== "string") throw new Error("Invalid username");
    const v = input.username.trim();
    if (v.length < 1 || v.length > 32) throw new Error("Invalid username");
    const excludeUserId = typeof input.excludeUserId === "string" && /^[0-9a-f-]{36}$/i.test(input.excludeUserId)
      ? input.excludeUserId
      : undefined;
    return { username: v, excludeUserId };
  })
  .handler(async ({ data }) => {
    const check = validateUsername(data.username);
    if (!check.ok) return { available: false, reason: check.reason };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", check.value)
      .maybeSingle();
    if (error) return { available: false, reason: "Lookup failed. Try again." };
    if (row && row.id !== data.excludeUserId) {
      return { available: false, reason: "That username is already taken." };
    }
    return { available: true as const };
  });



export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { identifier: string }) => {
    if (!input || typeof input.identifier !== "string") throw new Error("Invalid identifier");
    const v = input.identifier.trim();
    if (v.length < 2 || v.length > 255) throw new Error("Invalid identifier");
    return { identifier: v };
  })
  .handler(async ({ data }) => {
    if (data.identifier.includes("@")) return { email: data.identifier };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.identifier)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile?.id) throw new Error("No account found for that username");

    const { data: userRes, error: uErr } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    if (uErr || !userRes?.user?.email) throw new Error("Unable to resolve account email");
    return { email: userRes.user.email };
  });

// Delete the current guest (anonymous) user: profile + auth user.
// Refuses if the caller is not an anonymous user.
export const deleteGuestAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context as { userId: string; claims: Record<string, unknown> };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify the user is actually anonymous before deleting
    const { data: userRes, error: gErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (gErr || !userRes?.user) throw new Error("User not found");
    const isAnon = Boolean(userRes.user.is_anonymous) || Boolean((claims as { is_anonymous?: boolean })?.is_anonymous);
    if (!isAnon) throw new Error("Not a guest account");

    // Best-effort cleanup. Profile + messages cascade is manual.
    await supabaseAdmin.from("messages").delete().eq("author_id", userId);
    await supabaseAdmin.from("reactions").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (dErr) throw new Error(dErr.message);
    return { ok: true };
  });
