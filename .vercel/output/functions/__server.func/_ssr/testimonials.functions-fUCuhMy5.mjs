import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, s as stringType } from "../_libs/zod.mjs";
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
async function getAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin;
}
const listTestimonialsForUser_createServerFn_handler = createServerRpc({
  id: "5a1cb07c0526b841478f038c97ad40388ca433cec30a61a2d01488b929ffd5ea",
  name: "listTestimonialsForUser",
  filename: "src/lib/testimonials.functions.ts"
}, (opts) => listTestimonialsForUser.__executeServer(opts));
const listTestimonialsForUser = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  targetUserId: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(50).default(10)
}).parse(d ?? {})).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(listTestimonialsForUser_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await getAdmin();
  const target = data.targetUserId ?? context.userId;
  const {
    data: rows,
    error
  } = await admin.from("testimonials").select("*").eq("target_user_id", target).eq("approved", true).order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (error) throw new Error(error.message);
  const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
  let authors = {};
  if (authorIds.length) {
    const {
      data: profs
    } = await admin.from("profiles").select("id, username, avatar_color").in("id", authorIds);
    for (const p of profs ?? []) {
      authors[p.id] = {
        username: p.username,
        avatarColor: p.avatar_color ?? null
      };
    }
  }
  return (rows ?? []).map((r) => ({
    ...r,
    author_username: authors[r.author_id]?.username ?? null,
    author_avatar_color: authors[r.author_id]?.avatarColor ?? null
  }));
});
const writeTestimonial_createServerFn_handler = createServerRpc({
  id: "4ba37046414343fe8bab0f28ba64459913d806eb3bcc3cb69be0c762da4d6669",
  name: "writeTestimonial",
  filename: "src/lib/testimonials.functions.ts"
}, (opts) => writeTestimonial.__executeServer(opts));
const writeTestimonial = createServerFn({
  method: "POST"
}).middleware([withRateLimit("profile.write")]).inputValidator((d) => objectType({
  targetUserId: stringType().uuid(),
  body: stringType().trim().min(1).max(500)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(writeTestimonial_createServerFn_handler, async ({
  data,
  context
}) => {
  if (data.targetUserId === context.userId) {
    throw new Error("You cannot write a testimonial about yourself.");
  }
  const admin = await getAdmin();
  const {
    data: row,
    error
  } = await admin.from("testimonials").upsert({
    author_id: context.userId,
    target_user_id: data.targetUserId,
    body: data.body,
    approved: true
  }, {
    onConflict: "author_id,target_user_id"
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const deleteTestimonial_createServerFn_handler = createServerRpc({
  id: "fe90f2cf958f24d37819c992306e3d620ff6997cadc8dd247eba4dd9f5f398a0",
  name: "deleteTestimonial",
  filename: "src/lib/testimonials.functions.ts"
}, (opts) => deleteTestimonial.__executeServer(opts));
const deleteTestimonial = createServerFn({
  method: "POST"
}).middleware([withRateLimit("profile.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("profile.write")]).handler(deleteTestimonial_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await getAdmin();
  const {
    data: row
  } = await admin.from("testimonials").select("author_id, target_user_id").eq("id", data.id).maybeSingle();
  if (!row) throw new Error("Testimonial not found.");
  if (row.author_id !== context.userId && row.target_user_id !== context.userId) {
    throw new Error("Not allowed.");
  }
  const {
    error
  } = await admin.from("testimonials").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deleteTestimonial_createServerFn_handler,
  listTestimonialsForUser_createServerFn_handler,
  writeTestimonial_createServerFn_handler
};
