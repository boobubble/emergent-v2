import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
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
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, {
          ...init,
          headers: h
        });
      }
    }
  });
}
function slugify(name) {
  return (name || "collection").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 40) || "collection";
}
const followWriter_createServerFn_handler = createServerRpc({
  id: "40648a3abfa792287eaeb749da830c7f64cf89cc220c6669c088db80c7696d5e",
  name: "followWriter",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => followWriter.__executeServer(opts));
const followWriter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(followWriter_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (data.writerId === userId) throw new Error("You cannot follow yourself");
  const {
    error
  } = await supabase.from("poetry_writer_follows").insert({
    follower_id: userId,
    writer_id: data.writerId
  });
  if (error && !`${error.message}`.includes("duplicate")) throw error;
  return {
    ok: true,
    following: true
  };
});
const unfollowWriter_createServerFn_handler = createServerRpc({
  id: "1d89ac9e596e2fc7d46f74c289672ce4eaa4d7b305eecc14807aeaa45dfd4fe9",
  name: "unfollowWriter",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => unfollowWriter.__executeServer(opts));
const unfollowWriter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(unfollowWriter_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("poetry_writer_follows").delete().eq("follower_id", userId).eq("writer_id", data.writerId);
  if (error) throw error;
  return {
    ok: true,
    following: false
  };
});
const isFollowingWriter_createServerFn_handler = createServerRpc({
  id: "71aace1675bb3936411307ee44011ba9fdd60832d0b391a91d23ebabb79f2fc9",
  name: "isFollowingWriter",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => isFollowingWriter.__executeServer(opts));
const isFollowingWriter = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(isFollowingWriter_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row
  } = await supabase.from("poetry_writer_follows").select("id").eq("follower_id", userId).eq("writer_id", data.writerId).maybeSingle();
  return {
    following: !!row
  };
});
async function attachProfiles(userIds) {
  if (userIds.length === 0) return /* @__PURE__ */ new Map();
  const sb = publicClient();
  const {
    data
  } = await sb.from("profiles").select("id,username,display_name,avatar_url").in("id", userIds);
  const map = /* @__PURE__ */ new Map();
  for (const r of data ?? []) map.set(r.id, r);
  return map;
}
const listFollowers_createServerFn_handler = createServerRpc({
  id: "75067d7dec8a74ecd65158227c2c31234120036d4cc0aaff6d99a58ec9fa96e1",
  name: "listFollowers",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => listFollowers.__executeServer(opts));
const listFollowers = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(listFollowers_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: rows
  } = await sb.from("poetry_writer_follows").select("follower_id,created_at").eq("writer_id", data.userId).order("created_at", {
    ascending: false
  }).limit(Math.min(data.limit ?? 100, 500));
  const list = rows ?? [];
  const profiles = await attachProfiles(list.map((r) => r.follower_id));
  return list.map((r) => ({
    ...profiles.get(r.follower_id),
    followed_at: r.created_at
  })).filter((r) => r.id);
});
const listFollowing_createServerFn_handler = createServerRpc({
  id: "7d8e0af3509fc5012bd4d42054e074cefed6059cd37d7597e6218ff542db1637",
  name: "listFollowing",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => listFollowing.__executeServer(opts));
const listFollowing = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(listFollowing_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: rows
  } = await sb.from("poetry_writer_follows").select("writer_id,created_at").eq("follower_id", data.userId).order("created_at", {
    ascending: false
  }).limit(Math.min(data.limit ?? 100, 500));
  const list = rows ?? [];
  const profiles = await attachProfiles(list.map((r) => r.writer_id));
  return list.map((r) => ({
    ...profiles.get(r.writer_id),
    followed_at: r.created_at
  })).filter((r) => r.id);
});
const createCollection_createServerFn_handler = createServerRpc({
  id: "fa8bf24e3dee9e07bc3a7a6f8643d30ce3953c5e85c17831df0ee35c8dd620a2",
  name: "createCollection",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => createCollection.__executeServer(opts));
const createCollection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input.name?.trim()) throw new Error("Name is required");
  return input;
}).handler(createCollection_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const base = slugify(data.name);
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  const {
    data: row,
    error
  } = await supabase.from("poetry_collections").insert({
    user_id: userId,
    name: data.name.trim(),
    slug,
    description: data.description?.trim() ?? null,
    cover_url: data.coverUrl ?? null,
    is_public: data.isPublic ?? true
  }).select("*").single();
  if (error) throw error;
  return row;
});
const deleteCollection_createServerFn_handler = createServerRpc({
  id: "b5490f50d948d65c932096de75a53003b24aeac3396f34149e288ed05973c2e5",
  name: "deleteCollection",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => deleteCollection.__executeServer(opts));
const deleteCollection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(deleteCollection_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("poetry_collections").delete().eq("id", data.collectionId).eq("user_id", userId);
  if (error) throw error;
  return {
    ok: true
  };
});
const addToCollection_createServerFn_handler = createServerRpc({
  id: "521d5db889021145140f96086287f653a846d8cc3ed852f7a6f64c29d71ceec0",
  name: "addToCollection",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => addToCollection.__executeServer(opts));
const addToCollection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(addToCollection_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("poetry_collection_items").insert({
    collection_id: data.collectionId,
    poem_id: data.poemId
  });
  if (error && !`${error.message}`.includes("duplicate")) throw error;
  return {
    ok: true
  };
});
const removeFromCollection_createServerFn_handler = createServerRpc({
  id: "2f898c16f58158f99eecad007c9d7df19838e90932ee6a65e17b6194ad291cfb",
  name: "removeFromCollection",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => removeFromCollection.__executeServer(opts));
const removeFromCollection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(removeFromCollection_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("poetry_collection_items").delete().eq("collection_id", data.collectionId).eq("poem_id", data.poemId);
  if (error) throw error;
  return {
    ok: true
  };
});
const listMyCollections_createServerFn_handler = createServerRpc({
  id: "a322919cc4038a3751abad19208450753a2d39392effb65fdf18a73a67899d30",
  name: "listMyCollections",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => listMyCollections.__executeServer(opts));
const listMyCollections = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyCollections_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("poetry_collections").select("*").eq("user_id", userId).order("updated_at", {
    ascending: false
  }).limit(200);
  return data ?? [];
});
const listUserCollections_createServerFn_handler = createServerRpc({
  id: "ba25933fa0ac4b6e8477fdd236ac049c2bdf6bcc1d005ff51b05b06670fd7777",
  name: "listUserCollections",
  filename: "src/lib/poetry-social.functions.ts"
}, (opts) => listUserCollections.__executeServer(opts));
const listUserCollections = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(listUserCollections_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: rows
  } = await sb.from("poetry_collections").select("id,name,slug,description,cover_url,poem_count,is_public").eq("user_id", data.userId).eq("is_public", true).order("updated_at", {
    ascending: false
  }).limit(50);
  return rows ?? [];
});
export {
  addToCollection_createServerFn_handler,
  createCollection_createServerFn_handler,
  deleteCollection_createServerFn_handler,
  followWriter_createServerFn_handler,
  isFollowingWriter_createServerFn_handler,
  listFollowers_createServerFn_handler,
  listFollowing_createServerFn_handler,
  listMyCollections_createServerFn_handler,
  listUserCollections_createServerFn_handler,
  removeFromCollection_createServerFn_handler,
  unfollowWriter_createServerFn_handler
};
