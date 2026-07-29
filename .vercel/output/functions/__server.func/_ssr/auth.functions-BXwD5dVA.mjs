import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit, g as getClientIp, e as enforceRateLimit, R as RateLimitError } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
function validateUsername(raw) {
  if (typeof raw !== "string") return { ok: false, reason: "Username is required." };
  const v = raw.trim();
  if (v.length === 0) return { ok: false, reason: "Username cannot be empty." };
  if (v.length > 32) return { ok: false, reason: "Username must be 32 characters or fewer." };
  if (/^guest-/i.test(v)) return { ok: false, reason: "Reserved prefix." };
  if (!/^[a-zA-Z0-9_ ]+$/.test(v)) {
    return { ok: false, reason: "Only letters, numbers, spaces and _ allowed." };
  }
  const letters = v.replace(/[^a-zA-Z]/g, "").length;
  if (letters < 2 || letters > 10) {
    return { ok: false, reason: "Username must contain 2 to 10 letters." };
  }
  return { ok: true, value: v };
}
const checkUsernameAvailable_createServerFn_handler = createServerRpc({
  id: "cc9df207272b849fa07266ae389d8eeba88f9cb39ba8bd5ea6597564eefd524f",
  name: "checkUsernameAvailable",
  filename: "src/lib/auth.functions.ts"
}, (opts) => checkUsernameAvailable.__executeServer(opts));
const checkUsernameAvailable = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => {
  if (!input || typeof input.username !== "string") throw new Error("Invalid username");
  const v = input.username.trim();
  if (v.length < 1 || v.length > 32) throw new Error("Invalid username");
  const excludeUserId = typeof input.excludeUserId === "string" && /^[0-9a-f-]{36}$/i.test(input.excludeUserId) ? input.excludeUserId : void 0;
  return {
    username: v,
    excludeUserId
  };
}).handler(checkUsernameAvailable_createServerFn_handler, async ({
  data
}) => {
  const check = validateUsername(data.username);
  if (!check.ok) return {
    available: false,
    reason: check.reason
  };
  try {
    const {
      supabaseAdmin: supabaseAdmin2
    } = await import("./client.server-BXCYxJZY.mjs");
    const started = Date.now();
    const {
      data: row,
      error
    } = await supabaseAdmin2.from("profiles").select("id").ilike("username", check.value).maybeSingle();
    const elapsedMs = Date.now() - started;
    if (error) {
      console.error("[checkUsernameAvailable] Supabase error", {
        elapsedMs,
        code: error.code ?? null,
        message: error.message ?? null,
        details: error.details ?? null,
        hint: error.hint ?? null
      });
      return {
        available: false,
        reason: "Unable to check username right now. Please try again."
      };
    }
    if (row && row.id !== data.excludeUserId) {
      return {
        available: false,
        reason: "That username is already taken."
      };
    }
    return {
      available: true
    };
  } catch (e) {
    const err = e;
    console.error("[checkUsernameAvailable] Unexpected error", {
      name: err?.name ?? null,
      message: err?.message ?? null,
      code: err?.code ?? null
    });
    return {
      available: false,
      reason: "Unable to check username right now. Please try again."
    };
  }
});
const loginWithIdentifier_createServerFn_handler = createServerRpc({
  id: "5d3b602a34eb6d952cf9cf80461fd4c1c11f9692ecc9b491fe127e76626b2a33",
  name: "loginWithIdentifier",
  filename: "src/lib/auth.functions.ts"
}, (opts) => loginWithIdentifier.__executeServer(opts));
const loginWithIdentifier = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => {
  if (!input || typeof input.identifier !== "string" || typeof input.password !== "string") {
    throw new Error("Invalid credentials");
  }
  const identifier = input.identifier.trim();
  const password = input.password;
  if (identifier.length < 2 || identifier.length > 255) throw new Error("Invalid credentials");
  if (password.length < 1 || password.length > 256) throw new Error("Invalid credentials");
  return {
    identifier,
    password
  };
}).handler(loginWithIdentifier_createServerFn_handler, async ({
  data
}) => {
  const ip = getClientIp();
  try {
    await enforceRateLimit({
      action: "auth.login",
      ip
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      throw new Error(`Too many login attempts. Try again in ${e.retryAfter}s.`);
    }
    throw e;
  }
  let email = data.identifier;
  if (!email.includes("@")) {
    const {
      supabaseAdmin: supabaseAdmin2
    } = await import("./client.server-BXCYxJZY.mjs");
    const {
      data: profile
    } = await supabaseAdmin2.from("profiles").select("id").ilike("username", data.identifier).maybeSingle();
    if (!profile?.id) throw new Error("Invalid login credentials");
    const {
      data: userRes
    } = await supabaseAdmin2.auth.admin.getUserById(profile.id);
    if (!userRes?.user?.email) throw new Error("Invalid login credentials");
    email = userRes.user.email;
  }
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const {
    getSupabasePublicEnv
  } = await import("./env.server-Bcmcot3M.mjs");
  const {
    url,
    publishableKey: anonKey
  } = getSupabasePublicEnv();
  const authClient = createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
  const {
    data: signIn,
    error
  } = await authClient.auth.signInWithPassword({
    email,
    password: data.password
  });
  if (error || !signIn.session) throw new Error("Invalid login credentials");
  return {
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token
  };
});
const deleteGuestAccount_createServerFn_handler = createServerRpc({
  id: "1c56176887768d9891b3728da62aa71439be01e6c8ae1036a88a835c12be3175",
  name: "deleteGuestAccount",
  filename: "src/lib/auth.functions.ts"
}, (opts) => deleteGuestAccount.__executeServer(opts));
const deleteGuestAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).handler(deleteGuestAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    userId,
    claims
  } = context;
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: userRes,
    error: gErr
  } = await supabaseAdmin2.auth.admin.getUserById(userId);
  if (gErr || !userRes?.user) throw new Error("User not found");
  const isAnon = Boolean(userRes.user.is_anonymous) || Boolean(claims?.is_anonymous);
  if (!isAnon) throw new Error("Not a guest account");
  await supabaseAdmin2.from("messages").delete().eq("author_id", userId);
  await supabaseAdmin2.from("reactions").delete().eq("user_id", userId);
  await supabaseAdmin2.from("profiles").delete().eq("id", userId);
  const {
    error: dErr
  } = await supabaseAdmin2.auth.admin.deleteUser(userId);
  if (dErr) throw new Error(dErr.message);
  return {
    ok: true
  };
});
export {
  checkUsernameAvailable_createServerFn_handler,
  deleteGuestAccount_createServerFn_handler,
  loginWithIdentifier_createServerFn_handler
};
