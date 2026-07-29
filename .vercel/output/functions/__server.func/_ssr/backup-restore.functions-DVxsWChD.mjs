import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, e as enumType, s as stringType } from "../_libs/zod.mjs";
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
function splitSqlStatementsWithLines(sql) {
  const out = [];
  let buf = "";
  let bufStartLine = 1;
  let line = 1;
  let bufHasContent = false;
  let i = 0;
  let inSingle = false;
  let dollarTag = null;
  const pushChar = (ch) => {
    if (!bufHasContent && ch.trim() !== "") {
      bufStartLine = line;
      bufHasContent = true;
    }
    buf += ch;
    if (ch === "\n") line++;
  };
  while (i < sql.length) {
    const ch = sql[i];
    const next2 = sql.substr(i, 2);
    if (!inSingle && !dollarTag && next2 === "--") {
      const eol = sql.indexOf("\n", i);
      const stop = eol === -1 ? sql.length : eol;
      for (let k = i; k < stop; k++) pushChar(sql[k]);
      i = stop;
      continue;
    }
    if (!inSingle) {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        const tag = m[0];
        if (dollarTag === null) dollarTag = tag;
        else if (dollarTag === tag) dollarTag = null;
        for (let k = 0; k < tag.length; k++) pushChar(tag[k]);
        i += tag.length;
        continue;
      }
    }
    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      pushChar(ch);
      i++;
      continue;
    }
    if (!inSingle && !dollarTag && ch === ";") {
      const stmt = buf.trim();
      if (stmt) out.push({
        text: stmt,
        startLine: bufStartLine
      });
      buf = "";
      bufHasContent = false;
      i++;
      continue;
    }
    pushChar(ch);
    i++;
  }
  const tail = buf.trim();
  if (tail) out.push({
    text: tail,
    startLine: bufStartLine
  });
  return out;
}
const restoreDatabaseSql = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  sql: stringType().min(1).max(5e7),
  phase: enumType(["schema", "data", "full"]).default("full")
}).parse(d)).handler(createSsrRpc("b18caa2d5b824c8d828677e32ac57d2ed5a92937cfa661e6ae35b0c470847c41"));
const getStorageBucketNames = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("93633134f8394cd35a65e0685728d5cb9bd1d2ec15bbaaf2b11dd4844e8b5c08"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("9f3abf6627e7d9dd682a8e0b57b8b77cf6d314ab2262f83da9f7b86f11ce1aaf"));
export {
  getStorageBucketNames,
  restoreDatabaseSql,
  splitSqlStatementsWithLines
};
