import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType } from "../_libs/zod.mjs";
const getBroadcasterAccess = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).handler(createSsrRpc("238d26adde7e0634904d22000ae09a203059aefce330cb5576868ba35b742d47"));
const listWidgets = createServerFn({
  method: "GET"
}).handler(createSsrRpc("5dc3d1d8bc495346ed47f4b44e78d0cd190366922e7aaefcbc4172172eaec712"));
const createWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("d9794dd4eeda923f6716cb98ae2b68c8a94e4df0190a97a183ee63c92eb71dbe"));
const updateWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("51750de6690a74fa68c7f335ee3da0e50d9c24dfbab650bf78c3bc9640303076"));
const deleteWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("eef0a829cb0d8fcfa5b9d21f8a506836714b10743adc1e637795952c76e2d746"));
const goLive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("5371c292cc1cac140a928f2cfb635f35f1ecfdb2842adf406c4b794a802d2b01"));
const endLive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("8a03f851241163cd068c39def034f76f846db9de8de07468913d220e67fdc0a1"));
const setMic = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("5b6c8dbe8128b4b90cd11687140630be2c92765c9a48b45b10af841db0d833f8"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("45c6819b95a3e108e24c18c477b291f66f106c440e7d2939a387f6282b04ee6e"));
const scheduleSchema = objectType({
  widget_id: stringType().uuid(),
  title: stringType().min(1).max(120),
  description: stringType().max(500).optional().nullable(),
  starts_at: stringType(),
  ends_at: stringType()
});
const listSchedules = createServerFn({
  method: "GET"
}).inputValidator((d) => d ?? {}).handler(createSsrRpc("805f397af5a11a75bc1231dc187c57cdcc065ff51e4a54b71e2d9ce15e72cae8"));
const createSchedule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => scheduleSchema.parse(d)).handler(createSsrRpc("3176bfe3f52736108a773a525b6bac54251ce47fd6e58e068c43631b9ff74837"));
const cancelSchedule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("535d0fa6de306d50b658ce479b7ab08624dfe04d8325effe54770db6c5ff46d9"));
const listQueue = createServerFn({
  method: "GET"
}).inputValidator((d) => d).handler(createSsrRpc("9075a129d512e315185436d3141e3ea9db20a1de7fec11c6db4a01af843271ac"));
const addQueueItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("308aa36452393305458ae58c3176bcb255f7ced31e92fefa57fdf268d0340379"));
const removeQueueItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("d7af495f5a35b4ed53372d02267b6f08f2c177b5caeefddca0eb0d74cafef5f3"));
const clearQueue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("1e28a63b1262f5d86f88253495609604812295137987cd1fd4afdae6cf3378d7"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("d04d6ffa6de6962798775c2d3d03821969b1fb215d018108edb9db09b893db94"));
const getBroadcasterSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("ce4548f7990841c825d719824fc54decd25b0b255e1195c9ee0ba78865de8352"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("22bd62ee6d6711c0bcd47753a1a88905c1e9025b39c468cb88c280fbc33b8bd7"));
const announcementKindSchema = enumType(["upcoming_show", "ticker", "community"]);
const targetSchema = objectType({
  widget: booleanType().optional(),
  chatbar: booleanType().optional(),
  notifications: booleanType().optional(),
  feed: booleanType().optional()
});
const listAnnouncements = createServerFn({
  method: "GET"
}).inputValidator((d) => d ?? {}).handler(createSsrRpc("b00abe4c792d8e622eece08904eb5d5e9643b4aa7888ec6accb75d77f73c3223"));
const announcementInput = objectType({
  widget_id: stringType().uuid().nullable().optional(),
  kind: announcementKindSchema,
  title: stringType().min(1).max(140),
  body: stringType().max(2e3).optional().nullable(),
  link: stringType().url().max(500).optional().nullable(),
  starts_at: stringType().optional().nullable(),
  ends_at: stringType().optional().nullable(),
  pinned: booleanType().optional(),
  active: booleanType().optional(),
  target: targetSchema.optional()
});
const createAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => announcementInput.parse(d)).handler(createSsrRpc("7f292310935e2595456ed6407e363cc29ae982a41c240f7c35055c5608f406e9"));
const updateAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("3bf66ddb000aad7ddeb82fcc7caf6308f91756f186d1a5e2bcd84edcc9da8e0b"));
const deleteAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createSsrRpc("3803b6416a3e6b1d4709a0d1a5f6c25f6f8c367272a3483b975500affd102e8d"));
const getBroadcasterAnalytics = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c19e7a56000db35b15f020f4f1ef048a387378464f9a8e7fe123a8ccb6f1441c"));
export {
  listAnnouncements as a,
  getBroadcasterSettings as b,
  getBroadcasterAnalytics as c,
  createAnnouncement as d,
  deleteAnnouncement as e,
  goLive as f,
  getBroadcasterAccess as g,
  endLive as h,
  listQueue as i,
  addQueueItem as j,
  clearQueue as k,
  listWidgets as l,
  listSchedules as m,
  createSchedule as n,
  cancelSchedule as o,
  createWidget as p,
  updateWidget as q,
  removeQueueItem as r,
  setMic as s,
  deleteWidget as t,
  updateAnnouncement as u
};
