import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { isReservedSlug } from "./reserved-routes-BWsWje6t.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType, a as arrayType, n as numberType } from "../_libs/zod.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}
function slugify(input) {
  return (input || "").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9\s-]/g, " ").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "page";
}
const LAYOUTS = ["full", "boxed"];
const SIDEBARS = ["none", "ads", "feed"];
const pageSchema = objectType({
  id: stringType().uuid().optional(),
  slug: stringType().min(1).max(120),
  title: stringType().min(1).max(200),
  content: stringType().max(2e5).default(""),
  excerpt: stringType().max(500).nullable().optional(),
  tags: arrayType(stringType().max(40)).max(20).default([]),
  status: enumType(["draft", "published"]).default("draft"),
  featured: booleanType().default(false),
  layout: enumType(LAYOUTS).default("boxed"),
  sidebar_left: enumType(SIDEBARS).default("none"),
  sidebar_right: enumType(SIDEBARS).default("none"),
  meta_title: stringType().max(200).nullable().optional(),
  meta_description: stringType().max(400).nullable().optional(),
  meta_keywords: stringType().max(500).nullable().optional(),
  og_title: stringType().max(200).nullable().optional(),
  og_description: stringType().max(400).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  canonical_url: stringType().max(500).nullable().optional(),
  noindex: booleanType().default(false),
  nofollow: booleanType().default(false),
  overwrite: booleanType().optional()
});
const listPages_createServerFn_handler = createServerRpc({
  id: "2d1c643fd61af126663b075381e1ded533614cc0d907f4f36a31c7aa8be765be",
  name: "listPages",
  filename: "src/lib/pages.functions.ts"
}, (opts) => listPages.__executeServer(opts));
const listPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  q: stringType().max(100).optional()
}).parse(input ?? {})).handler(listPages_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin2 = await getSupabaseAdmin();
  let q = supabaseAdmin2.from("custom_pages").select("*").order("updated_at", {
    ascending: false
  }).limit(200);
  if (data.q) q = q.ilike("title", `%${data.q}%`);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const getPage_createServerFn_handler = createServerRpc({
  id: "c753d0f79cfc16e9348a58af7ddcd552d76a8cda777332c5150ddd7b8aa1e698",
  name: "getPage",
  filename: "src/lib/pages.functions.ts"
}, (opts) => getPage.__executeServer(opts));
const getPage = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(getPage_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data: row,
    error
  } = await (await getSupabaseAdmin()).from("custom_pages").select("*").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  return row;
});
const savePage_createServerFn_handler = createServerRpc({
  id: "6c0101bfbd81d018fcc7af5fddc270cba151add7ee07ee26332d4301b2e45c78",
  name: "savePage",
  filename: "src/lib/pages.functions.ts"
}, (opts) => savePage.__executeServer(opts));
const savePage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => pageSchema.parse(input)).handler(savePage_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const slug = slugify(data.slug);
  if (isReservedSlug(slug)) {
    throw new Error(`Slug "${slug}" is reserved by the platform. Choose another.`);
  }
  const {
    data: existing
  } = await supabaseAdmin.from("custom_pages").select("id").eq("slug", slug).maybeSingle();
  if (existing && existing.id !== data.id) {
    if (!data.overwrite) {
      throw new Error(`Slug "${slug}" already in use. Rename it or enable overwrite.`);
    }
    await (await getSupabaseAdmin()).from("custom_pages").delete().eq("id", existing.id);
  }
  const row = {
    slug,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt ?? null,
    tags: data.tags ?? [],
    status: data.status,
    featured: data.featured,
    layout: data.layout,
    sidebar_left: data.sidebar_left,
    sidebar_right: data.sidebar_right,
    meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null,
    meta_keywords: data.meta_keywords ?? null,
    og_title: data.og_title ?? null,
    og_description: data.og_description ?? null,
    og_image: data.og_image ?? null,
    canonical_url: data.canonical_url ?? null,
    noindex: data.noindex,
    nofollow: data.nofollow,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    published_at: data.status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null,
    created_by: context.userId
  };
  if (data.id) {
    const {
      error: error2
    } = await (await getSupabaseAdmin()).from("custom_pages").update(row).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id,
      slug
    };
  }
  const {
    data: ins,
    error
  } = await (await getSupabaseAdmin()).from("custom_pages").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: ins.id,
    slug
  };
});
const deletePage_createServerFn_handler = createServerRpc({
  id: "37e9f52955488aecb3b31d15d5353ac51576cb55a5ea4b804be2f16203dea37a",
  name: "deletePage",
  filename: "src/lib/pages.functions.ts"
}, (opts) => deletePage.__executeServer(opts));
const deletePage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(deletePage_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("custom_pages").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const exportPages_createServerFn_handler = createServerRpc({
  id: "f3689f5104b0f12d05285dbfe30031f089ef0578a6c8212b40b65447c7ca92c6",
  name: "exportPages",
  filename: "src/lib/pages.functions.ts"
}, (opts) => exportPages.__executeServer(opts));
const exportPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  ids: arrayType(stringType().uuid()).optional()
}).parse(input ?? {})).handler(exportPages_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const supabaseAdmin2 = await getSupabaseAdmin();
  let q = supabaseAdmin2.from("custom_pages").select("*").order("created_at");
  if (data.ids && data.ids.length) q = q.in("id", data.ids);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const importPages_createServerFn_handler = createServerRpc({
  id: "edfe09d4ab84382f150adb3a94567c357c77596132dc9e901e2faf6f5ad667cc",
  name: "importPages",
  filename: "src/lib/pages.functions.ts"
}, (opts) => importPages.__executeServer(opts));
const importPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  pages: arrayType(pageSchema.omit({
    id: true,
    overwrite: true
  })).min(1).max(200),
  mode: enumType(["skip", "overwrite"]).default("skip")
}).parse(input)).handler(importPages_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  let imported = 0, skipped = 0, overwritten = 0;
  for (const p of data.pages) {
    const slug = slugify(p.slug);
    if (isReservedSlug(slug)) {
      skipped++;
      continue;
    }
    const {
      data: existing
    } = await supabaseAdmin.from("custom_pages").select("id").eq("slug", slug).maybeSingle();
    const row = {
      ...p,
      slug,
      tags: p.tags ?? [],
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      created_by: context.userId
    };
    if (existing) {
      if (data.mode === "skip") {
        skipped++;
        continue;
      }
      await (await getSupabaseAdmin()).from("custom_pages").update(row).eq("id", existing.id);
      overwritten++;
    } else {
      await (await getSupabaseAdmin()).from("custom_pages").insert(row);
      imported++;
    }
  }
  return {
    imported,
    skipped,
    overwritten
  };
});
const getPublishedPage_createServerFn_handler = createServerRpc({
  id: "b3a44c66360258d8f963e94ce6a405384e8a84aa7db85e44e222350aaf47c458",
  name: "getPublishedPage",
  filename: "src/lib/pages.functions.ts"
}, (opts) => getPublishedPage.__executeServer(opts));
const getPublishedPage = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  slug: stringType().min(1).max(120)
}).parse(input)).handler(getPublishedPage_createServerFn_handler, async ({
  data
}) => {
  const slug = slugify(data.slug);
  const {
    data: redir
  } = await supabaseAdmin.from("page_redirects").select("to_slug").eq("from_slug", slug).maybeSingle();
  const finalSlug = redir?.to_slug ?? slug;
  const {
    data: row
  } = await supabaseAdmin.from("custom_pages").select("slug,title,content,excerpt,tags,layout,sidebar_left,sidebar_right,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,noindex,nofollow,views,published_at").eq("slug", finalSlug).eq("status", "published").maybeSingle();
  if (!row) return null;
  void (await getSupabaseAdmin()).rpc("bump_page_view", {
    _slug: finalSlug
  });
  return {
    ...row,
    redirectedFrom: redir ? slug : null
  };
});
const listPublishedPages_createServerFn_handler = createServerRpc({
  id: "5053d71a7d698357e73affb5665cb7ccc6ab9d23fcf98ec579e4d2a7f8ab6205",
  name: "listPublishedPages",
  filename: "src/lib/pages.functions.ts"
}, (opts) => listPublishedPages.__executeServer(opts));
const listPublishedPages = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  featured: booleanType().optional(),
  limit: numberType().min(1).max(50).default(20)
}).parse(input ?? {})).handler(listPublishedPages_createServerFn_handler, async ({
  data
}) => {
  let q = supabaseAdmin.from("custom_pages").select("slug,title,excerpt,tags,og_image,views,published_at").eq("status", "published").order("published_at", {
    ascending: false
  }).limit(data.limit);
  if (data.featured) q = q.eq("featured", true);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const listRedirects_createServerFn_handler = createServerRpc({
  id: "3d97ece13ca94eeb7c26a592033cdab3e96472e2da455ef40bf4b5e4a867d9ea",
  name: "listRedirects",
  filename: "src/lib/pages.functions.ts"
}, (opts) => listRedirects.__executeServer(opts));
const listRedirects = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(listRedirects_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("page_redirects").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const saveRedirect_createServerFn_handler = createServerRpc({
  id: "05660e96dfa73e79df62127329b098e70d923ba601415cc7b1179c2fc053f705",
  name: "saveRedirect",
  filename: "src/lib/pages.functions.ts"
}, (opts) => saveRedirect.__executeServer(opts));
const saveRedirect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  from_slug: stringType().min(1).max(120),
  to_slug: stringType().min(1).max(120)
}).parse(input)).handler(saveRedirect_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const from = slugify(data.from_slug);
  const to = slugify(data.to_slug);
  if (isReservedSlug(from) || isReservedSlug(to)) {
    throw new Error("Reserved slug cannot be used in redirects.");
  }
  if (from === to) throw new Error("from and to slugs must differ");
  const {
    error
  } = await (await getSupabaseAdmin()).from("page_redirects").upsert({
    from_slug: from,
    to_slug: to
  }, {
    onConflict: "from_slug"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteRedirect_createServerFn_handler = createServerRpc({
  id: "8256478a7c1be93cc128b4ef7beecda8beddcebfb30fb3efb673ba3b544ceb57",
  name: "deleteRedirect",
  filename: "src/lib/pages.functions.ts"
}, (opts) => deleteRedirect.__executeServer(opts));
const deleteRedirect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(deleteRedirect_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("page_redirects").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  deletePage_createServerFn_handler,
  deleteRedirect_createServerFn_handler,
  exportPages_createServerFn_handler,
  getPage_createServerFn_handler,
  getPublishedPage_createServerFn_handler,
  importPages_createServerFn_handler,
  listPages_createServerFn_handler,
  listPublishedPages_createServerFn_handler,
  listRedirects_createServerFn_handler,
  savePage_createServerFn_handler,
  saveRedirect_createServerFn_handler
};
