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
const getMehfilLeaderboard_createServerFn_handler = createServerRpc({
  id: "73ead1c7a9b3f68bde6e4299ad6d148e0612e2ee41feaca22aecae30607d3f44",
  name: "getMehfilLeaderboard",
  filename: "src/routes/poetry.leaderboard.tsx"
}, (opts) => getMehfilLeaderboard.__executeServer(opts));
const getMehfilLeaderboard = createServerFn({
  method: "GET"
}).handler(getMehfilLeaderboard_createServerFn_handler, async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const sb = createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
  const {
    data: stats
  } = await sb.from("mehfil_writer_stats").select("user_id, poems_published, total_upvotes, total_reads, battle_wins, writer_rank").order("total_upvotes", {
    ascending: false
  }).limit(100);
  const ids = (stats ?? []).map((s) => s.user_id);
  const {
    data: profiles
  } = ids.length ? await sb.from("profiles").select("id, username, display_name, avatar_url").in("id", ids) : {
    data: []
  };
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return (stats ?? []).map((s) => ({
    ...s,
    profile: pmap.get(s.user_id) ?? null
  }));
});
export {
  getMehfilLeaderboard_createServerFn_handler
};
