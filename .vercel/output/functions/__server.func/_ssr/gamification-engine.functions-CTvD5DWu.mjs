import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
const emitGamificationEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((input) => {
  if (!input?.event || typeof input.event !== "string") throw new Error("event required");
  return {
    event: input.event,
    amount: Number.isFinite(input.amount) ? Math.max(1, Math.floor(input.amount)) : 1,
    metadata: input.metadata ?? {}
  };
}).handler(createSsrRpc("94a3e957e5e716a9b7be50dbc5d9ec1dd7a72340fe0e2f1d7fa92128b76936f7"));
const getMyGamification = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("d664a8874ca419990ea235654adaa476a19c7a88633bcf6f705e5c961c3e54fe"));
const claimSeasonTier = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(createSsrRpc("e9f3dcd15790dab36e2a321430bd5c045f80b2f5dc919be2fa4c0fa74df482c3"));
const getGamificationAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("c2af82fb7ae15ee4fd71262e76f7268d0e071a56c6171e3e990f537cd2e40fec"));
const listGamCatalog = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("92d4d468271dcb967cfb2648ecdcb878924422739ed5b8966d72fbc1f5d29fa8"));
const upsertGamRow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(createSsrRpc("22827294a36c69726027ed02b477a829c5d96db9ad38cf2d7bc8d971eb38e12f"));
const deleteGamRow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => i).handler(createSsrRpc("37d4eab47adbd85d2af21138ddee9f47a19393ef715319b068a15cc5d0d84721"));
export {
  getGamificationAnalytics as a,
  claimSeasonTier as c,
  deleteGamRow as d,
  emitGamificationEvent as e,
  getMyGamification as g,
  listGamCatalog as l,
  upsertGamRow as u
};
