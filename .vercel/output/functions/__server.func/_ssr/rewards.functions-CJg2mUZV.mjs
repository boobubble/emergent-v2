import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
const claimDailyChest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("75be98476f5a15b9c85900ef344d767dbcdc7235d0ed0467740c42117014864c"));
const spinDailyWheel = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("ff8c0a61a79b57da390792cc6660261c99b5e4cd5a9f3c3886b728415befe6b0"));
const purchaseItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((input) => objectType({
  itemId: stringType().min(1).max(64)
}).parse(input)).handler(createSsrRpc("8ac424ccc9d808484383b3255b22d8048f590c3d04360feb619a098f21ca5797"));
const equipItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((input) => objectType({
  itemId: stringType().min(1).max(64),
  equipped: booleanType()
}).parse(input)).handler(createSsrRpc("848635f84ea945f35ddd5771617eb8a575fae22dda679ce074c0780bddfa010a"));
const getMyInventory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("cc3ece2778f4bb9208b42026bb7c23871455866df85978a3afd4260571d6ec8d"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("af6ac5a99c58f0d8f2abf76e141f0507315a5bf310a1a5dc8d5855b2df7891f3"));
export {
  claimDailyChest as c,
  equipItem as e,
  getMyInventory as g,
  purchaseItem as p,
  spinDailyWheel as s
};
