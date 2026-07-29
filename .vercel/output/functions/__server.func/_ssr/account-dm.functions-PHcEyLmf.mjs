import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const deleteMyAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).handler(createSsrRpc("20ce7016302de886fab72937295f2b261c82e5786ab6858aa65211a9e0c37947"));
const deleteMyDmConversation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("chat.message")]).inputValidator((input) => {
  if (!input || typeof input.peerId !== "string" || !UUID_RE.test(input.peerId)) {
    throw new Error("Invalid peer id");
  }
  return {
    peerId: input.peerId
  };
}).handler(createSsrRpc("2e996b1c8a635b2e8b950f6e186323fb86f196cb2e52d9129afffb636f1645d3"));
export {
  deleteMyAccount as a,
  deleteMyDmConversation as d
};
