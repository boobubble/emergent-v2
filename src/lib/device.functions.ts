import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FpSchema = z.object({
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/, "Invalid fingerprint"),
});

/**
 * Public — checks whether a device fingerprint is banned.
 * Called before signup so we can refuse to create the account at all.
 */
export const checkDeviceBan = createServerFn({ method: "POST" })
  .inputValidator((input) => FpSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Setting acts as a kill switch — when disabled the check always passes.
    const { data: setting } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "device_security")
      .maybeSingle();
    const enabled = (setting?.value as { enabled?: boolean } | null)?.enabled ?? false;
    if (!enabled) return { banned: false, reason: null as string | null };

    const { data: row } = await supabaseAdmin
      .from("banned_devices")
      .select("reason")
      .eq("fingerprint", data.fingerprint)
      .maybeSingle();
    return { banned: !!row, reason: row?.reason ?? null };
  });

/**
 * Authenticated — records the current user's device fingerprint.
 * Called after successful sign-in / sign-up.
 */
export const recordDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    FpSchema.extend({ user_agent: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_devices")
      .upsert(
        {
          user_id: context.userId,
          fingerprint: data.fingerprint,
          user_agent: data.user_agent ?? null,
          last_seen: new Date().toISOString(),
        },
        { onConflict: "user_id,fingerprint" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
