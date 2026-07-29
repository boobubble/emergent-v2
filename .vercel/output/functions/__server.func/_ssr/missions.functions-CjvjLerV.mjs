import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
const getTodayMissions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).handler(createSsrRpc("9ff2da6f1cb7b62b1f668664cc4268df30838ea70729b37d14d822951dd79994"));
const claimMission = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("xp.write")]).inputValidator((i) => objectType({
  missionId: stringType().min(1).max(64)
}).parse(i)).handler(createSsrRpc("6af5861777f1d7932c1ff026703c73ad4d97dc25f60de45493ad271c8c1e4d29"));
export {
  claimMission as c,
  getTodayMissions as g
};
