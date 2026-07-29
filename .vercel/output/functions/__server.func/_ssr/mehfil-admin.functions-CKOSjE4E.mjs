import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { M as MEHFIL_SETTINGS_DEFAULTS } from "./mehfil-types-okfUX99d.mjs";
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
async function assertAdmin(ctx) {
  const {
    data
  } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin"
  });
  if (!data) throw new Error("Forbidden");
}
const adminListMehfilCategories_createServerFn_handler = createServerRpc({
  id: "4203299a488f60fcbb2c326c9e3f6ec2ea73278d1dd943478fde676b9a7e49a0",
  name: "adminListMehfilCategories",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminListMehfilCategories.__executeServer(opts));
const adminListMehfilCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListMehfilCategories_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("mehfil_categories").select("*").order("sort_order", {
    ascending: true
  });
  if (error) throw error;
  return data ?? [];
});
const adminSaveMehfilCategory_createServerFn_handler = createServerRpc({
  id: "a2f929369bb0708245c185ee1805e9cd2fcbd15c4fc6fd1e7bc03489c2d763a2",
  name: "adminSaveMehfilCategory",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminSaveMehfilCategory.__executeServer(opts));
const adminSaveMehfilCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminSaveMehfilCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const row = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    icon: data.icon ?? null,
    color: data.color ?? null,
    sort_order: data.sort_order ?? 0,
    is_active: data.is_active ?? true
  };
  if (data.default_qualification_config !== void 0) {
    row.default_qualification_config = data.default_qualification_config ?? {};
  }
  if (data.id) {
    const {
      error
    } = await context.supabase.from("mehfil_categories").update(row).eq("id", data.id);
    if (error) throw error;
  } else {
    const {
      error
    } = await context.supabase.from("mehfil_categories").insert(row);
    if (error) throw error;
  }
  return {
    ok: true
  };
});
const adminDeleteMehfilCategory_createServerFn_handler = createServerRpc({
  id: "927c66e22ecbedb001a6422b977d58904933d3a455813d5f44e035315fdb9ae9",
  name: "adminDeleteMehfilCategory",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminDeleteMehfilCategory.__executeServer(opts));
const adminDeleteMehfilCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminDeleteMehfilCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("mehfil_categories").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const adminListMehfilPoems_createServerFn_handler = createServerRpc({
  id: "2c4e5a7276ff44da8901e7453cf2a76b2f5b71700f1ad3e844aedaf3f643439b",
  name: "adminListMehfilPoems",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminListMehfilPoems.__executeServer(opts));
const adminListMehfilPoems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input ?? {}).handler(adminListMehfilPoems_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  let q = context.supabase.from("mehfil_poems").select("*").order("created_at", {
    ascending: false
  }).limit(Math.min(data.limit ?? 100, 200));
  if (data.status) q = q.eq("status", data.status);
  if (data.search) q = q.ilike("title", `%${data.search}%`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return rows ?? [];
});
const adminUpdatePoem_createServerFn_handler = createServerRpc({
  id: "6abf9e5e63ee6d79b3acffeaa0fd827903c1e6308bb4e410ee0998f8c01576b2",
  name: "adminUpdatePoem",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminUpdatePoem.__executeServer(opts));
const adminUpdatePoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminUpdatePoem_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("mehfil_poems").update(data.patch).eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const adminDeletePoem_createServerFn_handler = createServerRpc({
  id: "91b9ff5f7a1698b4ddda6fa1bca1a0f13419913f7252b076d45f1f0acbabd839",
  name: "adminDeletePoem",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminDeletePoem.__executeServer(opts));
const adminDeletePoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminDeletePoem_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("mehfil_poems").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const KEY = "mehfil_settings";
const getMehfilSettings_createServerFn_handler = createServerRpc({
  id: "e7ed242c39ec13f8d3aa7910ec2539ecc7043f67718d34ee659cd614f21741b2",
  name: "getMehfilSettings",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => getMehfilSettings.__executeServer(opts));
const getMehfilSettings = createServerFn({
  method: "GET"
}).handler(getMehfilSettings_createServerFn_handler, async () => {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const sb = createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
  const {
    data
  } = await sb.from("app_settings").select("value").eq("key", KEY).maybeSingle();
  const raw = data?.value ?? {};
  return {
    ...MEHFIL_SETTINGS_DEFAULTS,
    ...raw
  };
});
const adminSaveMehfilSettings_createServerFn_handler = createServerRpc({
  id: "9a7e53946f9cdf4c20b47f0abd0c10c8e6ef2aefe9990cef418b5448f86a1eb6",
  name: "adminSaveMehfilSettings",
  filename: "src/lib/mehfil-admin.functions.ts"
}, (opts) => adminSaveMehfilSettings.__executeServer(opts));
const adminSaveMehfilSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(adminSaveMehfilSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const merged = {
    ...MEHFIL_SETTINGS_DEFAULTS,
    ...data
  };
  const {
    error
  } = await context.supabase.from("app_settings").upsert({
    key: KEY,
    value: merged
  });
  if (error) throw error;
  return merged;
});
export {
  adminDeleteMehfilCategory_createServerFn_handler,
  adminDeletePoem_createServerFn_handler,
  adminListMehfilCategories_createServerFn_handler,
  adminListMehfilPoems_createServerFn_handler,
  adminSaveMehfilCategory_createServerFn_handler,
  adminSaveMehfilSettings_createServerFn_handler,
  adminUpdatePoem_createServerFn_handler,
  getMehfilSettings_createServerFn_handler
};
