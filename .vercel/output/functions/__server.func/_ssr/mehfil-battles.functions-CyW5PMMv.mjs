import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
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
function pub() {
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
const listPoetryBattles_createServerFn_handler = createServerRpc({
  id: "504e142cdc51dc62a074486e594ede5de4ba6cae1788134a6b1555b9b766bf20",
  name: "listPoetryBattles",
  filename: "src/lib/mehfil-battles.functions.ts"
}, (opts) => listPoetryBattles.__executeServer(opts));
const listPoetryBattles = createServerFn({
  method: "GET"
}).inputValidator((input) => input ?? {
  scope: "active"
}).handler(listPoetryBattles_createServerFn_handler, async ({
  data
}) => {
  const sb = pub();
  let q = sb.from("competitions").select("*").eq("type", "poetry_battle").order("start_at", {
    ascending: false
  }).limit(30);
  if (data.scope === "active") q = q.eq("status", "live");
  else if (data.scope === "upcoming") q = q.eq("status", "upcoming");
  else if (data.scope === "ended") q = q.eq("status", "completed");
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  const battles = rows ?? [];
  const catIds = Array.from(new Set(battles.map((b) => b.mehfil_category_id).filter((x) => !!x)));
  if (catIds.length) {
    const {
      data: cats
    } = await sb.from("mehfil_categories").select("id, slug, name, color").in("id", catIds);
    const cmap = new Map((cats ?? []).map((c) => [c.id, c]));
    battles.forEach((b) => {
      b.category = b.mehfil_category_id ? cmap.get(b.mehfil_category_id) ?? null : null;
    });
  }
  return battles;
});
const getPoetryBattle_createServerFn_handler = createServerRpc({
  id: "2df76ac4651f7ee09e175ef1f8d2135014a5ba67b9fb26911dfc0354c2cf886b",
  name: "getPoetryBattle",
  filename: "src/lib/mehfil-battles.functions.ts"
}, (opts) => getPoetryBattle.__executeServer(opts));
const getPoetryBattle = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getPoetryBattle_createServerFn_handler, async ({
  data
}) => {
  const sb = pub();
  const {
    data: b,
    error
  } = await sb.from("competitions").select("*").eq("slug", data.slug).eq("type", "poetry_battle").maybeSingle();
  if (error) throw error;
  if (!b) return null;
  const battle = b;
  const {
    data: parts
  } = await sb.from("competition_participants").select("id, user_id, mehfil_poem_id, vote_count, rank, status").eq("competition_id", battle.id).eq("status", "approved").order("vote_count", {
    ascending: false
  }).limit(100);
  const poemIds = (parts ?? []).map((p) => p.mehfil_poem_id).filter((x) => !!x);
  let poems = [];
  if (poemIds.length) {
    const {
      data: poemRows
    } = await sb.from("mehfil_poems").select("*").in("id", poemIds);
    const authorIds = Array.from(new Set((poemRows ?? []).map((p) => p.author_id)));
    const [{
      data: profiles
    }, {
      data: cats
    }] = await Promise.all([sb.from("profiles").select("id, username, display_name, avatar_url, country_code").in("id", authorIds), sb.from("mehfil_categories").select("id, slug, name, color, icon")]);
    const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const cmap = new Map((cats ?? []).map((c) => [c.id, c]));
    poems = (poemRows ?? []).map((p) => ({
      ...p,
      category: p.category_id ? cmap.get(p.category_id) ?? null : null,
      author: pmap.get(p.author_id) ?? null,
      writer_rank: "poet",
      reaction_count: 0
    }));
  }
  return {
    battle,
    entries: parts ?? [],
    poems
  };
});
export {
  getPoetryBattle_createServerFn_handler,
  listPoetryBattles_createServerFn_handler
};
