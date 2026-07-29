import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { randomBytes, createHmac } from "crypto";
import { i as isRegisteredGame } from "./games-hub-caps-DZ7ZIznu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const TTL_SECONDS = 600;
const InputSchema = objectType({
  gameId: stringType().trim().min(1).max(64).regex(/^[a-z0-9][a-z0-9-]*$/i, "invalid gameId")
});
function b64url(input) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
const mintGameSession_createServerFn_handler = createServerRpc({
  id: "3743151ef5cd2723264f92bef2bf0527a6a051c8fe75a4444e74ccbec01e2bec",
  name: "mintGameSession",
  filename: "src/lib/game-launch.functions.ts"
}, (opts) => mintGameSession.__executeServer(opts));
const mintGameSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => InputSchema.parse(input)).handler(mintGameSession_createServerFn_handler, async ({
  data,
  context
}) => {
  const secret = process.env.GAME_LAUNCH_HMAC_SECRET;
  if (!secret) throw new Error("GAME_LAUNCH_HMAC_SECRET not configured");
  if (!isRegisteredGame(data.gameId)) {
    throw new Error("This game is not registered.");
  }
  const {
    supabase,
    userId
  } = context;
  const {
    data: profile
  } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", userId).maybeSingle();
  const now = Math.floor(Date.now() / 1e3);
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const payload = {
    sub: userId,
    username: profile?.username ?? null,
    displayName: profile?.display_name ?? profile?.username ?? null,
    avatar: profile?.avatar_url ?? null,
    iat: now,
    exp: now + TTL_SECONDS,
    gid: data.gameId,
    nonce: randomBytes(16).toString("hex")
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = createHmac("sha256", secret).update(signingInput).digest();
  const token = `${signingInput}.${b64url(sig)}`;
  return {
    token,
    expiresAt: payload.exp
  };
});
export {
  mintGameSession_createServerFn_handler
};
