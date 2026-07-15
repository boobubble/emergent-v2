import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enforceRateLimit, RateLimitError, getClientIp } from "./rate-limit.server";
import { validateUsername } from "./username-validation";
import { withRateLimit } from "./rate-limit-middleware";


export const checkUsernameAvailable = createServerFn({ method: "POST" })
  .middleware([withRateLimit("auth.write")]).inputValidator((input: { username: string; excludeUserId?: string }) => {
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
    // TEMP DIAGNOSTIC LOGGING — remove once root cause identified.
    console.log("[checkUsernameAvailable] start", {
      username: check.value,
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 4) ?? null,
      nodeEnv: process.env.NODE_ENV,
    });
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const started = Date.now();
      const { data: row, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", check.value)
        .maybeSingle();
      const elapsedMs = Date.now() - started;
      if (error) {
        console.error("[checkUsernameAvailable] Supabase error", {
          elapsedMs,
          code: (error as { code?: string }).code ?? null,
          message: error.message ?? null,
          details: (error as { details?: string }).details ?? null,
          hint: (error as { hint?: string }).hint ?? null,
          name: (error as { name?: string }).name ?? null,
        });
        return {
          available: false,
          reason: `Username lookup failed [${(error as { code?: string }).code ?? "unknown"}]: ${error.message}${
            (error as { hint?: string }).hint ? ` — hint: ${(error as { hint?: string }).hint}` : ""
          }`,
        };
      }
      console.log("[checkUsernameAvailable] ok", { elapsedMs, found: Boolean(row) });
      if (row && row.id !== data.excludeUserId) {
        return { available: false, reason: "That username is already taken." };
      }
      return { available: true as const };
    } catch (e) {
      const err = e as { name?: string; message?: string; code?: string; cause?: unknown; stack?: string };
      console.error("[checkUsernameAvailable] Unexpected error", {
        name: err?.name ?? null,
        message: err?.message ?? null,
        code: err?.code ?? null,
        cause: err?.cause ?? null,
        stack: err?.stack ?? null,
      });
      return {
        available: false,
        reason: `Server configuration error: ${err?.message ?? String(e)}`,
      };
    }

  });



/**
 * Sign in with a username OR email + password, server-side.
 *
 * Replaces the previous `resolveLoginEmail` flow, which returned the email
 * for any public username and allowed unauthenticated email harvesting.
 * The email is now resolved and consumed entirely on the server; only the
 * resulting session tokens are returned to the client.
 */
export const loginWithIdentifier = createServerFn({ method: "POST" })
  .middleware([withRateLimit("auth.write")]).inputValidator((input: { identifier: string; password: string }) => {
    if (!input || typeof input.identifier !== "string" || typeof input.password !== "string") {
      throw new Error("Invalid credentials");
    }
    const identifier = input.identifier.trim();
    const password = input.password;
    if (identifier.length < 2 || identifier.length > 255) throw new Error("Invalid credentials");
    if (password.length < 1 || password.length > 256) throw new Error("Invalid credentials");
    return { identifier, password };
  })
  .handler(async ({ data }) => {
    const ip = getClientIp();
    try {
      await enforceRateLimit({ action: "auth.login", ip });
    } catch (e) {
      if (e instanceof RateLimitError) {
        throw new Error(`Too many login attempts. Try again in ${e.retryAfter}s.`);
      }
      throw e;
    }
    let email = data.identifier;


    if (!email.includes("@")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("username", data.identifier)
        .maybeSingle();
      // Use a uniform error to avoid leaking whether the username exists.
      if (!profile?.id) throw new Error("Invalid login credentials");
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (!userRes?.user?.email) throw new Error("Invalid login credentials");
      email = userRes.user.email;
    }

    // Use an anon-key client server-side to perform the actual password sign-in.
    // The resolved email never leaves the server.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL!;
    const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: signIn, error } = await authClient.auth.signInWithPassword({ email, password: data.password });
    if (error || !signIn.session) throw new Error("Invalid login credentials");

    return {
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });

// Delete the current guest (anonymous) user: profile + auth user.
// Refuses if the caller is not an anonymous user.
export const deleteGuestAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("auth.write")])
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
