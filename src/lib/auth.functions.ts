import { createServerFn } from "@tanstack/react-start";

export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { identifier: string }) => {
    if (!input || typeof input.identifier !== "string") throw new Error("Invalid identifier");
    const v = input.identifier.trim();
    if (v.length < 2 || v.length > 255) throw new Error("Invalid identifier");
    return { identifier: v };
  })
  .handler(async ({ data }) => {
    // If it already looks like an email, return as-is
    if (data.identifier.includes("@")) return { email: data.identifier };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find profile by username (case-insensitive)
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
