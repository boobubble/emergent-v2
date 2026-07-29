import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, aJ as AdminPageHeader, ae as Card, ag as CardHeader, ah as CardTitle, ai as CardDescription, af as CardContent, B as Button, a0 as Input, ac as Label, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, aw as DialogFooter } from "./router-CYWPFaDK.mjs";
import { J as JSZip } from "../_libs/jszip.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as Progress } from "./progress-CwWlrCUG.mjs";
import { C as Checkbox } from "./checkbox-Dkz64jvR.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { b as backupDatabase, a as backupMediaManifest, r as restoreBackupDryRun, d as downloadMediaFile, c as ensureStorageBucket, u as uploadMediaFile, f as dumpDatabaseSql, g as exportBackupExtras, h as exportBackupMetadataV2 } from "./backup.functions-DkVYCbxN.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { restoreDatabaseSql, getStorageBucketNames } from "./backup-restore.functions-DVxsWChD.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { Z as Zap, a0 as LoaderCircle, bQ as FileBraces, b9 as Database, bR as BookOpen, ax as ExternalLink, bS as Package, I as Image, aI as Download, W as Lock, bH as Upload, au as ShieldCheck, aS as ShieldAlert, bz as CircleCheck, b5 as History, aC as Activity, _ as Clock, T as TriangleAlert, ba as HardDrive, bB as CircleX, by as Copy, d as Trash2 } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType, e as enumType, n as numberType } from "../_libs/zod.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/readable-stream.mjs";
import "node:string_decoder";
import "../_libs/process-nextick-args.mjs";
import "../_libs/isarray.mjs";
import "events";
import "../_libs/safe-buffer.mjs";
import "buffer";
import "../_libs/core-util-is.mjs";
import "../_libs/inherits.mjs";
import "../_libs/util-deprecate.mjs";
import "../_libs/lie.mjs";
import "../_libs/immediate.mjs";
import "../_libs/setimmediate.mjs";
import "../_libs/pako.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const recordSchema = objectType({
  filename: stringType().min(1).max(256),
  backup_type: enumType(["full", "quick", "media", "database"]).default("full"),
  size_bytes: numberType().int().nonnegative(),
  sha256: stringType().nullable().optional(),
  md5: stringType().nullable().optional(),
  verified: booleanType().default(false),
  encrypted: booleanType().default(false),
  app_version: stringType().nullable().optional(),
  total_tables: numberType().int().nullable().optional(),
  total_rows: numberType().int().nullable().optional(),
  media_files: numberType().int().nullable().optional(),
  notes: stringType().nullable().optional()
});
const recordBackupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => recordSchema.parse(d)).handler(createSsrRpc("c8dc05908bcfafe8309c06d116f0850bc89691661a0a3dbf6293c27266b995c8"));
const listBackupHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("84c1c984ec18ade458ddcf3fc515f06af8a31fda847820478b950d58071edde3"));
const deleteBackupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d6674633d78fc58660389116c1363ccf2c0db8459a5d2b2130f55f06a4552e6c"));
const markBackupVerified = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  verified: booleanType()
}).parse(d)).handler(createSsrRpc("bd4924d1cd3a76392b82aaabb72738c280150427f254c19b1d8a0dfb6c0b31a3"));
const markRestoreTested = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ecb7070c1281ba5545a77ec6769683758473aaf767b8abeae0658c2bea8d8718"));
const getBackupRetention = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("06688e981e347ab9968209b0aae4076a21dceb03f6c24ee56703a5ec7ba910cb"));
const setBackupRetention = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  value: enumType(["7d", "30d", "90d", "forever"])
}).parse(d)).handler(createSsrRpc("bdf7bd93a27cc988cfb6bb523baf2c9b02b0f384b7d33a4045d410dad142720d"));
const getBackupHealth = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("291a678cfd50827d0397c8fe1376c68e18533b588a3dea6974f352630e2ad99a"));
async function sha256Hex(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return bufToHex(new Uint8Array(digest));
}
function md5Hex(bytes) {
  return rstrToHex(rstrMd5(u8ToBinary(bytes)));
}
function bufToHex(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, "0");
  return s;
}
function rstrToHex(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    out += (c >>> 4).toString(16) + (c & 15).toString(16);
  }
  return out;
}
function u8ToBinary(u8) {
  let s = "";
  const chunk = 32768;
  for (let i = 0; i < u8.length; i += chunk) s += String.fromCharCode(...u8.subarray(i, i + chunk));
  return s;
}
function rstrMd5(s) {
  return binlToRstr(binlMd5(rstrToBinl(s), s.length * 8));
}
function rstrToBinl(input) {
  const output = new Array(input.length >> 2).fill(0);
  for (let i = 0; i < input.length * 8; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
  }
  return output;
}
function binlToRstr(input) {
  let output = "";
  for (let i = 0; i < input.length * 32; i += 8) {
    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
  }
  return output;
}
function binlMd5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = md5ff(a, b, c, d, x[i + 0] | 0, 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1] | 0, 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2] | 0, 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3] | 0, 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4] | 0, 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5] | 0, 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6] | 0, 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7] | 0, 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8] | 0, 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9] | 0, 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10] | 0, 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11] | 0, 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12] | 0, 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13] | 0, 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14] | 0, 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15] | 0, 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1] | 0, 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6] | 0, 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11] | 0, 14, 643717713);
    b = md5gg(b, c, d, a, x[i + 0] | 0, 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5] | 0, 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10] | 0, 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15] | 0, 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4] | 0, 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9] | 0, 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14] | 0, 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3] | 0, 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8] | 0, 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13] | 0, 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2] | 0, 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7] | 0, 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12] | 0, 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5] | 0, 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8] | 0, 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11] | 0, 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14] | 0, 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1] | 0, 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4] | 0, 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7] | 0, 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10] | 0, 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13] | 0, 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0] | 0, 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3] | 0, 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6] | 0, 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9] | 0, 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12] | 0, 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15] | 0, 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2] | 0, 23, -995338651);
    a = md5ii(a, b, c, d, x[i + 0] | 0, 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7] | 0, 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14] | 0, 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5] | 0, 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12] | 0, 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3] | 0, 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10] | 0, 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1] | 0, 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8] | 0, 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15] | 0, 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6] | 0, 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13] | 0, 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4] | 0, 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11] | 0, 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2] | 0, 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9] | 0, 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRol(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
const MAGIC = new Uint8Array([66, 66, 69, 78, 67, 49]);
const PBKDF_ITERS = 2e5;
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF_ITERS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptBlobAes256(input, password) {
  const bytes = new Uint8Array(await input.arrayBuffer());
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    bytes
  );
  const cipher = new Uint8Array(cipherBuf);
  const out = new Uint8Array(MAGIC.length + salt.length + iv.length + cipher.length);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC.length);
  out.set(iv, MAGIC.length + salt.length);
  out.set(cipher, MAGIC.length + salt.length + iv.length);
  return new Blob([out], { type: "application/octet-stream" });
}
function isEncryptedBackup(bytes) {
  if (bytes.length < MAGIC.length) return false;
  for (let i = 0; i < MAGIC.length; i++) if (bytes[i] !== MAGIC[i]) return false;
  return true;
}
async function decryptBackup(bytes, password) {
  if (!isEncryptedBackup(bytes)) throw new Error("Not an encrypted backup");
  const salt = bytes.slice(MAGIC.length, MAGIC.length + 16);
  const iv = bytes.slice(MAGIC.length + 16, MAGIC.length + 16 + 12);
  const cipher = bytes.slice(MAGIC.length + 16 + 12);
  const key = await deriveKey(password, salt);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher
    );
    return new Uint8Array(plain);
  } catch {
    throw new Error("Incorrect password or corrupted backup");
  }
}
const REQUIRED_FULL = [
  "manifest.json",
  "backup-info.json",
  "database.json",
  "media-manifest.json",
  "database/database.sql",
  "database/schema.sql",
  "database/data.sql",
  "database/stats.json"
];
async function verifyFullBackupZip(blob) {
  const checks = [];
  let ok = true;
  let zip;
  try {
    zip = await JSZip.loadAsync(blob);
    checks.push({ name: "ZIP integrity", ok: true });
  } catch (e) {
    return {
      ok: false,
      size: blob.size,
      checks: [{ name: "ZIP integrity", ok: false, detail: e?.message ?? "corrupt" }]
    };
  }
  for (const path of REQUIRED_FULL) {
    const f = zip.file(path);
    if (!f) {
      checks.push({ name: path, ok: false, detail: "missing" });
      ok = false;
      continue;
    }
    const bytes = await f.async("uint8array");
    if (bytes.byteLength === 0) {
      checks.push({ name: path, ok: false, detail: "empty" });
      ok = false;
    } else {
      checks.push({ name: path, ok: true, detail: `${bytes.byteLength} bytes` });
    }
  }
  let info = void 0;
  const infoEntry = zip.file("backup-info.json");
  if (infoEntry) {
    try {
      info = JSON.parse(await infoEntry.async("text"));
      const missing = ["app_version", "generated_at"].filter((k) => !info[k]);
      checks.push({
        name: "backup-info fields",
        ok: missing.length === 0,
        detail: missing.length ? `missing: ${missing.join(", ")}` : void 0
      });
      if (missing.length) ok = false;
    } catch (e) {
      checks.push({ name: "backup-info fields", ok: false, detail: e?.message });
      ok = false;
    }
  }
  let stats;
  const sEntry = zip.file("database/stats.json");
  if (sEntry) {
    try {
      const s = JSON.parse(await sEntry.async("text"));
      stats = { tables: Number(s.tables ?? 0), rows: Number(s.rows ?? 0) };
    } catch {
    }
  }
  const sqlEntry = zip.file("database/database.sql");
  if (sqlEntry) {
    const head = (await sqlEntry.async("text")).slice(0, 300);
    const hasHeader = head.includes("Platform Schema Dump");
    checks.push({
      name: "database.sql header",
      ok: hasHeader,
      detail: hasHeader ? void 0 : "missing generator header"
    });
    if (!hasHeader) ok = false;
  }
  return { ok, checks, size: blob.size, info, stats };
}
async function dryRunValidateZip(blob, currentBuckets) {
  const rep = await verifyFullBackupZip(blob);
  let bucketDiff;
  if (currentBuckets) {
    try {
      const zip = await JSZip.loadAsync(blob);
      const mm = zip.file("media-manifest.json");
      if (mm) {
        const m = JSON.parse(await mm.async("text"));
        const backupBuckets = (m.buckets ?? []).map((b) => b.name);
        bucketDiff = {
          missing: backupBuckets.filter((b) => !currentBuckets.includes(b)),
          extra: currentBuckets.filter((b) => !backupBuckets.includes(b))
        };
      }
    } catch {
    }
  }
  return { ...rep, bucketDiff };
}
function fmtBytes$2(n) {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}
function fmtAge(iso) {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function BackupHealthCard({
  health
}) {
  const latest = health?.latest;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
      " Backup Health"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          label: "Latest backup",
          value: latest ? latest.filename : "—",
          sub: latest ? fmtAge(latest.generated_at) : ""
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: latest?.verified ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-amber-500" }),
          label: "Verification",
          value: latest ? latest.verified ? "Verified" : "Not verified" : "—",
          sub: latest?.sha256 ? `sha256: ${latest.sha256.slice(0, 10)}…` : ""
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          label: "Last restore test",
          value: fmtAge(latest?.last_restore_test_at ?? null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HardDrive, { className: "h-3.5 w-3.5" }),
          label: "Media files",
          value: latest?.media_files != null ? String(latest.media_files) : "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-3.5 w-3.5" }),
          label: "Database size",
          value: fmtBytes$2(health?.db_size_bytes)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-3.5 w-3.5" }),
          label: "Tables",
          value: String(health?.table_count ?? 0)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-3.5 w-3.5" }),
          label: "Rows in last backup",
          value: latest?.total_rows != null ? String(latest.total_rows) : "—"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Stat,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5" }),
          label: "App version",
          value: APP_VERSION,
          sub: latest?.app_version ? `backup: ${latest.app_version}` : ""
        }
      )
    ] })
  ] });
}
function Stat({ icon, label, value, sub }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 truncate font-medium", children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground truncate", children: sub })
  ] });
}
function fmtBytes$1(n) {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}
function BackupHistoryTable({
  rows,
  onDelete
}) {
  if (!rows.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No backups recorded yet. Run Full Backup to add the first entry." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-[11px] uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Backup" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Size" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Verified" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2", children: "Checksum" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-right", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-2 font-mono text-[11px]", children: [
        r.filename,
        r.encrypted && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "ml-1 inline h-3 w-3 text-amber-500", "aria-label": "encrypted" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: new Date(r.generated_at).toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.backup_type }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: fmtBytes$1(r.size_bytes) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: r.verified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-emerald-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
        " yes"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
        " no"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 font-mono text-[10px] max-w-[160px] truncate", title: r.sha256 ?? "", children: r.sha256 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mr-1 inline h-3 w-3 text-emerald-500" }),
        r.sha256.slice(0, 12),
        "…"
      ] }) : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => onDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
    ] }, r.id)) })
  ] }) });
}
function BackupVerificationPanel({
  report,
  sha256,
  md5,
  filename
}) {
  if (!report) return null;
  const failed = report.checks.filter((c) => !c.ok);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-xs space-y-2 ${report.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
      report.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
        " Backup Verified"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" }),
        " Verification Failed"
      ] }),
      filename && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-mono text-[10px] text-muted-foreground", children: filename })
    ] }),
    failed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0.5 text-red-600 dark:text-red-300", children: failed.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      "• ",
      c.name,
      c.detail ? ` — ${c.detail}` : ""
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-1 sm:grid-cols-2", children: [
      sha256 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px] break-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "SHA-256:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: sha256 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "ml-auto opacity-60 hover:opacity-100",
            onClick: () => {
              navigator.clipboard.writeText(sha256);
              toast.success("SHA-256 copied");
            },
            "aria-label": "Copy SHA-256",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
          }
        )
      ] }),
      md5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px] break-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "MD5:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: md5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "ml-auto opacity-60 hover:opacity-100",
            onClick: () => {
              navigator.clipboard.writeText(md5);
              toast.success("MD5 copied");
            },
            "aria-label": "Copy MD5",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
          }
        )
      ] })
    ] }),
    report.stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
      report.stats.tables,
      " tables · ",
      report.stats.rows,
      " rows · ",
      (report.size / 1024 / 1024).toFixed(2),
      " MB"
    ] })
  ] });
}
function fmtBytes(n) {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}
function PreRestoreDialog({
  open,
  info,
  onCancel,
  onConfirm
}) {
  if (!info) return null;
  const rows = info.rows ?? 0;
  const media = info.mediaFiles ?? 0;
  const eta = Math.ceil(rows / 500) + Math.ceil(media / 20);
  const versionMismatch = info.backupAppVersion && info.backupAppVersion !== APP_VERSION;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-500" }),
        " Confirm Restore"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "The database schema and data in this backup will be applied to the live project. Existing rows with matching primary keys are kept (INSERT ... ON CONFLICT DO NOTHING). Storage buckets and files are re-uploaded with upsert." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Backup file", value: info.filename, mono: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Size", value: fmtBytes(info.size) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Backup version", value: info.backupAppVersion ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Current version", value: APP_VERSION }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Generated", value: info.backupGeneratedAt ? new Date(info.backupGeneratedAt).toLocaleString() : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tables", value: String(info.tables ?? 0) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rows", value: String(rows) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Media files", value: String(media) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estimated time", value: `~${eta}s` })
    ] }),
    versionMismatch && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-200", children: "Backup was generated on a different app version. Some columns may not line up — proceed with caution." }),
    info.bucketDiff && (info.bucketDiff.missing.length > 0 || info.bucketDiff.extra.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Bucket differences:" }),
      info.bucketDiff.missing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "· Missing on current project: ",
        info.bucketDiff.missing.join(", ")
      ] }),
      info.bucketDiff.extra.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "· Extra on current project: ",
        info.bucketDiff.extra.join(", ")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-700 dark:text-red-300", children: "This action runs privileged SQL through the admin restore endpoint. Only proceed if you trust the backup source." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onConfirm, children: "Confirm Restore" })
    ] })
  ] }) });
}
function Field({ label, value, mono }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: mono ? "font-mono text-xs truncate" : "truncate", children: value })
  ] });
}
function todayStamp() {
  const d = /* @__PURE__ */ new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}_${p(d.getMonth() + 1)}_${p(d.getDate())}`;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
async function runPool(items, limit, worker, onProgress) {
  const results = new Array(items.length);
  let cursor = 0;
  let done = 0;
  async function next() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
      done++;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(Array.from({
    length: Math.min(limit, items.length)
  }, next));
  return results;
}
function QuickBackupChecklist({
  items
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500" }),
    " ",
    it
  ] }, it)) });
}
function BackupPage() {
  const [busy, setBusy] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState(null);
  const [lastFile, setLastFile] = reactExports.useState(null);
  const fileInput = reactExports.useRef(null);
  const runDb = useServerFn(backupDatabase);
  const runMedia = useServerFn(backupMediaManifest);
  const runRestore = useServerFn(restoreBackupDryRun);
  const runDownload = useServerFn(downloadMediaFile);
  const runEnsureBucket = useServerFn(ensureStorageBucket);
  const runUpload = useServerFn(uploadMediaFile);
  const runDumpSql = useServerFn(dumpDatabaseSql);
  const runExtras = useServerFn(exportBackupExtras);
  const runMetaV2 = useServerFn(exportBackupMetadataV2);
  const runRecord = useServerFn(recordBackupHistory);
  const runList = useServerFn(listBackupHistory);
  const runDelete = useServerFn(deleteBackupHistory);
  useServerFn(markBackupVerified);
  useServerFn(markRestoreTested);
  const runGetRetention = useServerFn(getBackupRetention);
  const runSetRetention = useServerFn(setBackupRetention);
  const runGetHealth = useServerFn(getBackupHealth);
  const runRestoreSql = useServerFn(restoreDatabaseSql);
  const runGetBuckets = useServerFn(getStorageBucketNames);
  const [quickBusy, setQuickBusy] = reactExports.useState(false);
  const [encryptEnabled, setEncryptEnabled] = reactExports.useState(false);
  const [encryptPassword, setEncryptPassword] = reactExports.useState("");
  const [verifyReport, setVerifyReport] = reactExports.useState(null);
  const [lastChecksum, setLastChecksum] = reactExports.useState(null);
  const [validateReport, setValidateReport] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState([]);
  const [health, setHealth] = reactExports.useState(null);
  const [retention, setRetention] = reactExports.useState("30d");
  const [preRestore, setPreRestore] = reactExports.useState(null);
  const [pendingRestoreFile, setPendingRestoreFile] = reactExports.useState(null);
  const refreshHistoryAndHealth = reactExports.useCallback(async () => {
    try {
      const [h, hl, r] = await Promise.all([runList({}), runGetHealth({}), runGetRetention({})]);
      setHistory(h);
      setHealth(hl);
      setRetention(r);
    } catch (e) {
      console.warn("refresh backup meta failed:", e);
    }
  }, [runList, runGetHealth, runGetRetention]);
  reactExports.useEffect(() => {
    refreshHistoryAndHealth();
  }, [refreshHistoryAndHealth]);
  async function onQuickJson() {
    setQuickBusy(true);
    try {
      const snap = await runDb({});
      const blob = new Blob([JSON.stringify(snap, null, 2)], {
        type: "application/json"
      });
      download(blob, `quick-backup_${todayStamp()}.json`);
      toast.success("JSON backup downloaded");
    } catch (e) {
      toast.error(e?.message ?? "Quick backup failed");
    } finally {
      setQuickBusy(false);
    }
  }
  async function buildFullZip(parts, label, mediaFiles, databaseFiles, extraInfo, opts) {
    const zip = new JSZip();
    const stamp = todayStamp();
    const meta = {
      kind: label,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      app: "platform",
      app_version: APP_VERSION,
      parts: parts.map((p) => p.name),
      media_files: mediaFiles?.length ?? 0,
      database_files: databaseFiles?.map((f) => f.name) ?? [],
      restore_scripts: opts?.restoreFiles?.map((f) => f.name) ?? [],
      ...extraInfo
    };
    zip.file("manifest.json", JSON.stringify(meta, null, 2));
    zip.file("backup-info.json", JSON.stringify(meta, null, 2));
    parts.forEach((p) => zip.file(p.name, p.content));
    if (databaseFiles?.length) {
      const db = zip.folder("database");
      for (const f of databaseFiles) db.file(f.name, f.content);
    }
    if (opts?.restoreFiles?.length) {
      const r = zip.folder("restore");
      for (const f of opts.restoreFiles) r.file(f.name, f.content);
    }
    if (mediaFiles?.length) {
      const media = zip.folder("media");
      for (const f of mediaFiles) {
        media.file(`${f.bucket}/${f.path}`, f.bytes);
      }
    }
    if (opts?.includeChecksums) {
      const lines = [];
      const entries = [];
      zip.forEach((relPath, obj) => {
        if (!obj.dir) entries.push({
          path: relPath,
          obj
        });
      });
      entries.sort((a, b) => a.path.localeCompare(b.path));
      for (const e of entries) {
        const bytes = await e.obj.async("uint8array");
        const hex = await sha256Hex(bytes);
        lines.push(`${hex}  ${e.path}`);
      }
      zip.file("checksums.sha256", lines.join("\n") + "\n");
    }
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE"
    });
    const fname = `backup_${stamp}_${label}.zip`;
    if (!opts?.skipDownload) {
      download(blob, fname);
      setLastFile(fname);
    }
    return {
      blob,
      filename: fname,
      meta
    };
  }
  function restoreScripts() {
    const sh = `#!/usr/bin/env bash
# Backup restore (Linux/macOS)
# Usage: DATABASE_URL=postgres://... ./restore.sh
set -euo pipefail
: "\${DATABASE_URL:?Set DATABASE_URL to the target Postgres connection string}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> Extensions";  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/extensions.sql" || true
echo "==> Schema";      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/schema.sql"
echo "==> Data";        psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/data.sql"
echo "==> Policies";    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/policies.sql" || true
echo "==> Storage cfg"; psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/storage.sql" || true
echo "==> Cron jobs";   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$HERE/database/cron.sql" || true
echo "Done. Media files under $HERE/media/ must be re-uploaded via the Backup Center Restore button or the Supabase Storage API."
`;
    const ps1 = `# Backup restore (Windows PowerShell)
# Usage: $env:DATABASE_URL="postgres://..."; .\\restore.ps1
$ErrorActionPreference = "Stop"
if (-not $env:DATABASE_URL) { throw "Set DATABASE_URL to the target Postgres connection string" }
$Here = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
foreach ($f in @("extensions.sql","schema.sql","data.sql","policies.sql","storage.sql","cron.sql")) {
  $p = Join-Path $Here "database\\$f"
  if (Test-Path $p) { Write-Host "==> $f"; psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f $p }
}
Write-Host "Done. Re-upload media/ via the Backup Center Restore button."
`;
    const verify = `#!/usr/bin/env bash
# Verify every file in the backup matches checksums.sha256
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"
if [ ! -f checksums.sha256 ]; then echo "checksums.sha256 missing"; exit 1; fi
sha256sum -c checksums.sha256
`;
    return [{
      name: "restore.sh",
      content: sh
    }, {
      name: "restore.ps1",
      content: ps1
    }, {
      name: "verify.sh",
      content: verify
    }];
  }
  async function fetchMediaFiles(manifest) {
    const flat = [];
    for (const b of manifest.buckets ?? []) {
      for (const f of b.files ?? []) flat.push({
        bucket: b.name,
        path: f.path
      });
    }
    setProgress({
      label: "Downloading media",
      done: 0,
      total: flat.length
    });
    const files = await runPool(flat, 4, async (item) => {
      const res = await runDownload({
        data: item
      });
      const bin = atob(res.contentBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return {
        bucket: item.bucket,
        path: item.path,
        bytes
      };
    }, (done, total) => setProgress({
      label: "Downloading media",
      done,
      total
    }));
    setProgress(null);
    return files;
  }
  async function onDatabase() {
    setBusy("db");
    try {
      const snap = await runDb({});
      await buildFullZip([{
        name: "database.json",
        content: JSON.stringify(snap, null, 2)
      }], "database");
      toast.success("Database backup downloaded");
    } catch (e) {
      toast.error(e?.message ?? "Database backup failed");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }
  async function onMedia() {
    setBusy("media");
    try {
      const manifest = await runMedia({});
      const files = await fetchMediaFiles(manifest);
      await buildFullZip([{
        name: "media-manifest.json",
        content: JSON.stringify(manifest, null, 2)
      }], "media", files);
      toast.success(`Media backup downloaded (${files.length} files)`);
    } catch (e) {
      toast.error(e?.message ?? "Media backup failed");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }
  async function onFull() {
    if (encryptEnabled && encryptPassword.length < 8) {
      toast.error("Encryption password must be at least 8 characters");
      return;
    }
    setBusy("full");
    setVerifyReport(null);
    setLastChecksum(null);
    const startedAtDate = /* @__PURE__ */ new Date();
    const startedAt = startedAtDate.getTime();
    try {
      setProgress({
        label: "Preparing backup (JSON + media manifest)",
        done: 0,
        total: 6
      });
      const [db, manifest] = await Promise.all([runDb({}), runMedia({})]);
      setProgress({
        label: "Exporting PostgreSQL database",
        done: 1,
        total: 6
      });
      let sqlDump;
      try {
        sqlDump = await runDumpSql({});
      } catch (e) {
        const raw = String(e?.message ?? e ?? "unknown SQL export error");
        console.error("SQL export failed — backup aborted.\nRoot cause:\n" + raw);
        toast.error("SQL export failed — backup aborted.\nRoot cause: " + raw, {
          duration: 2e4
        });
        setBusy(null);
        setProgress(null);
        return;
      }
      setProgress({
        label: "Downloading media",
        done: 2,
        total: 6
      });
      const files = await fetchMediaFiles(manifest);
      const extras = await runExtras({}).catch((e) => {
        console.warn("Extras export failed:", e?.message);
        toast.warning("Extras skipped: " + (e?.message ?? "error"));
        return null;
      });
      const metaV2 = await runMetaV2({}).catch((e) => {
        console.warn("Metadata v2 failed:", e?.message);
        return null;
      });
      const databaseFiles = [];
      const stripSqlStrings = (sql) => {
        let out = "";
        let i = 0;
        const n = sql.length;
        while (i < n) {
          const c = sql[i];
          if (c === "'") {
            out += " ";
            i++;
            while (i < n) {
              if (sql[i] === "'" && sql[i + 1] === "'") {
                i += 2;
                continue;
              }
              if (sql[i] === "'") {
                i++;
                break;
              }
              out += sql[i] === "\n" ? "\n" : " ";
              i++;
            }
            continue;
          }
          if (c === "$") {
            const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i));
            if (m) {
              const tag = m[0];
              out += " ".repeat(tag.length);
              i += tag.length;
              const end = sql.indexOf(tag, i);
              if (end === -1) {
                out += sql.slice(i).replace(/[^\n]/g, " ");
                i = n;
                break;
              }
              for (let k = i; k < end; k++) out += sql[k] === "\n" ? "\n" : " ";
              out += " ".repeat(tag.length);
              i = end + tag.length;
              continue;
            }
          }
          if (c === "-" && sql[i + 1] === "-") {
            while (i < n && sql[i] !== "\n") {
              out += " ";
              i++;
            }
            continue;
          }
          out += c;
          i++;
        }
        return out;
      };
      const sqlLooksBroken = (filename, sql) => {
        if (!sql) return null;
        const stripped = stripSqlStrings(sql);
        const idx = stripped.indexOf("\\n");
        if (idx === -1) return null;
        const before = sql.slice(0, idx);
        const line = before.split("\n").length;
        const lineStart = before.lastIndexOf("\n") + 1;
        const lineEnd = sql.indexOf("\n", idx);
        const snippet = sql.slice(lineStart, lineEnd === -1 ? sql.length : lineEnd);
        const col = idx - lineStart + 1;
        const caret = " ".repeat(Math.max(0, col - 1)) + "^^";
        console.error(`SQL export invalid
${filename}
Line ${line}, column ${col}
${snippet}
${caret}`);
        return `${filename}:${line}:${col} — literal \\n outside string literal
> ${snippet.trim().slice(0, 160)}`;
      };
      if (sqlDump) {
        const bad = sqlLooksBroken("schema.sql", sqlDump.schema_sql) || sqlLooksBroken("data.sql", sqlDump.data_sql) || sqlLooksBroken("database.sql", sqlDump.full_sql);
        if (bad) {
          toast.error(`SQL export invalid — backup aborted:
${bad}`, {
            duration: 15e3
          });
          setBusy(null);
          setProgress(null);
          return;
        }
        databaseFiles.push({
          name: "database.sql",
          content: sqlDump.full_sql
        }, {
          name: "schema.sql",
          content: sqlDump.schema_sql
        }, {
          name: "data.sql",
          content: sqlDump.data_sql
        }, {
          name: "stats.json",
          content: JSON.stringify(sqlDump.stats, null, 2)
        });
      }
      if (extras) {
        for (const [name, content] of Object.entries(extras.files)) {
          databaseFiles.push({
            name,
            content
          });
        }
      }
      setProgress({
        label: "Building ZIP",
        done: 3,
        total: 6
      });
      const parts = [{
        name: "database.json",
        content: JSON.stringify(db, null, 2)
      }, {
        name: "media-manifest.json",
        content: JSON.stringify(manifest, null, 2)
      }];
      const mediaBytesTotal = files.reduce((s, f) => s + f.bytes.byteLength, 0);
      const dbSizeBytes = metaV2?.database_size_bytes ?? null;
      const storageSizeBytes = metaV2?.storage_total_size_bytes ?? mediaBytesTotal;
      const rowsForEstimate = sqlDump?.stats.rows ?? metaV2?.total_rows_estimate ?? 0;
      const dbRestoreSec = Math.max(2, Math.ceil(rowsForEstimate / 2e3));
      const mediaRestoreSec = Math.max(1, Math.ceil(mediaBytesTotal / (2 * 1024 * 1024)));
      const storageRestoreSec = Math.max(1, Math.ceil(files.length / 20));
      const totalRestoreSec = dbRestoreSec + mediaRestoreSec + storageRestoreSec;
      const fmtDur = (s) => s < 60 ? `${s} sec` : `${Math.floor(s / 60)}m ${s % 60}s`;
      const restoreEstimation = {
        database: {
          seconds: dbRestoreSec,
          pretty: fmtDur(dbRestoreSec)
        },
        media: {
          seconds: mediaRestoreSec,
          pretty: fmtDur(mediaRestoreSec)
        },
        storage: {
          seconds: storageRestoreSec,
          pretty: fmtDur(storageRestoreSec)
        },
        total: {
          seconds: totalRestoreSec,
          pretty: fmtDur(totalRestoreSec)
        }
      };
      const projectInfo = {
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        backup_version: 3,
        app: {
          name: "platform",
          version: APP_VERSION,
          environment: "production",
          migration_count: extras?.project_info?.migration_count ?? 0
        },
        database: {
          pg_version: extras?.project_info?.pg_version ?? null,
          total_tables: extras?.project_info?.total_tables ?? null,
          total_rows: sqlDump?.stats.rows ?? metaV2?.total_rows_estimate ?? null,
          total_functions: metaV2?.total_functions ?? null,
          total_rpcs: metaV2?.total_functions ?? null,
          total_views: metaV2?.total_views ?? null,
          total_materialized_views: metaV2?.total_materialized_views ?? null,
          total_triggers: metaV2?.total_triggers ?? null,
          total_indexes: metaV2?.total_indexes ?? null,
          total_foreign_keys: metaV2?.total_foreign_keys ?? null,
          total_sequences: metaV2?.total_sequences ?? null,
          total_policies: metaV2?.total_policies ?? extras?.counts?.policies ?? null,
          database_size_bytes: dbSizeBytes
        },
        storage: {
          total_buckets: extras?.project_info?.total_buckets ?? null,
          total_files: extras?.project_info?.total_files ?? files.length,
          total_size_bytes: storageSizeBytes,
          largest_bucket: metaV2?.largest_bucket ?? null
        },
        extras_counts: extras?.counts ?? null,
        migrations: extras?.project_info?.migrations ?? [],
        restore_estimation: restoreEstimation,
        // Filled in second pass:
        sizes: null,
        timing: null
      };
      parts.push({
        name: "project-info.json",
        content: JSON.stringify(projectInfo, null, 2)
      });
      const dbNames = new Set(databaseFiles.map((f) => f.name));
      const check = (present, reason) => ({
        ok: present,
        ...present ? {} : {
          reason: reason ?? "missing"
        }
      });
      const validation = {
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        backup_version: 3,
        components: {
          "database/database.sql": check(dbNames.has("database.sql"), sqlDump ? void 0 : "sql dump failed"),
          "database/schema.sql": check(dbNames.has("schema.sql"), sqlDump ? void 0 : "sql dump failed"),
          "database/data.sql": check(dbNames.has("data.sql"), sqlDump ? void 0 : "sql dump failed"),
          "database/stats.json": check(dbNames.has("stats.json"), sqlDump ? void 0 : "sql dump failed"),
          "database/storage.sql": check(dbNames.has("storage.sql"), extras ? void 0 : "extras export failed"),
          "database/policies.sql": check(dbNames.has("policies.sql"), extras ? void 0 : "extras export failed"),
          "database/extensions.sql": check(dbNames.has("extensions.sql"), extras ? void 0 : "extras export failed"),
          "database/cron.sql": check(dbNames.has("cron.sql"), extras ? void 0 : "extras export failed"),
          "database/auth.json": check(dbNames.has("auth.json"), extras ? void 0 : "extras export failed"),
          "database/realtime.json": check(dbNames.has("realtime.json"), extras ? void 0 : "extras export failed"),
          "database.json": check(true),
          "media-manifest.json": check(true),
          "media": check(files.length > 0, files.length === 0 ? "no media files" : void 0),
          "project-info.json": check(true),
          "backup-info.json": check(true),
          "checksums.sha256": check(true),
          "health.json": check(true),
          "signature.json": check(true),
          "README.txt": check(true),
          "restore/restore.sh": check(true),
          "restore/restore.ps1": check(true),
          "restore/verify.sh": check(true),
          "restore/restore.json": check(true),
          "sql/valid_syntax": check(true, "SQL passed literal-\\n guard")
        }
      };
      const failedComponents = Object.entries(validation.components).filter(([, v]) => !v.ok);
      validation.ok = failedComponents.length === 0;
      validation.failed_count = failedComponents.length;
      parts.push({
        name: "validation.json",
        content: JSON.stringify(validation, null, 2)
      });
      const readme = `Backup Package
=========================
Created:        ${startedAtDate.toISOString()}
Backup version: 3
App version:    ${APP_VERSION}
Encrypted:      ${encryptEnabled ? "yes (AES-256)" : "no"}

CONTENTS
--------
  manifest.json / backup-info.json  High-level summary
  project-info.json                 Full DB + storage + app metadata
  validation.json                   Per-file export report
  health.json                       Health score & pass/fail per component
  signature.json                    Unique backup identity (UUID + hashes)
  checksums.sha256                  SHA-256 for every file in this ZIP
  database.json                     JSON snapshot of app tables (portable)
  database/database.sql             Full SQL dump (schema + data)
  database/schema.sql               Schema only
  database/data.sql                 Data only (INSERTs)
  database/stats.json               Row counts + size stats
  database/storage.sql              Storage bucket definitions
  database/policies.sql             RLS policies
  database/extensions.sql           Postgres extensions
  database/cron.sql                 pg_cron scheduled jobs
  database/auth.json                Auth providers metadata (no secrets)
  database/realtime.json            Realtime publications
  media-manifest.json               Storage file listing
  media/<bucket>/<path>             Actual binary media files
  restore/restore.sh                Linux/macOS restore driver
  restore/restore.ps1               Windows PowerShell restore driver
  restore/verify.sh                 Integrity check driver

RESTORE
-------
1. Unzip this archive.
2. If encrypted (*.enc), decrypt it via the Backup Center UI first.
3. Verify integrity:
     cd restore && bash verify.sh
   (or: sha256sum -c checksums.sha256)
4. Point the restore script at a fresh Postgres database:
     export DATABASE_URL="postgres://user:pass@host:5432/db"
     bash restore/restore.sh
   The script applies files in this order:
     extensions.sql -> schema.sql -> data.sql
     -> policies.sql -> storage.sql -> cron.sql
5. Re-upload media/ using the Backup Center "Restore" button
   (uses the Supabase Storage API and preserves paths).

VALIDATION
----------
- validation.json lists every expected file and whether it is present.
- health.json gives an overall pass/fail score and per-component checks.
- Any missing / empty file marks the backup as FAILED at creation time.

TROUBLESHOOTING
---------------
- "psql: command not found"          -> install PostgreSQL client tools.
- schema.sql errors on extensions    -> run extensions.sql first as superuser.
- "role does not exist"              -> ensure target project has the same
                                        roles (anon, authenticated, service_role).
- data.sql conflicts                 -> restore into an empty database, or
                                        the ON CONFLICT DO NOTHING clauses
                                        will skip pre-existing rows.
- Media upload fails                 -> re-run the Backup Center Restore.

This package is self-describing and requires no manual editing.
`;
      parts.push({
        name: "README.txt",
        content: readme
      });
      const backupUuid = globalThis.crypto?.randomUUID?.() ?? `bkp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const signatureInit = {
        backup_uuid: backupUuid,
        created_at: startedAtDate.toISOString(),
        app: "platform",
        app_version: APP_VERSION,
        backup_version: 3,
        generator_version: "backup-center/3.0",
        sha256: null,
        md5: null
      };
      parts.push({
        name: "signature.json",
        content: JSON.stringify(signatureInit, null, 2)
      });
      const healthInit = {
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        health_score: 100,
        overall_status: "Production Ready",
        checks: {}
      };
      parts.push({
        name: "health.json",
        content: JSON.stringify(healthInit, null, 2)
      });
      const built = await buildFullZip(parts, "full", files, databaseFiles.length ? databaseFiles : void 0, {
        database_sql_included: !!sqlDump,
        extras_included: !!extras,
        total_tables: sqlDump?.stats.tables ?? extras?.project_info.total_tables ?? null,
        total_rows_exported: sqlDump?.stats.rows ?? null,
        total_buckets: extras?.project_info.total_buckets ?? null,
        total_users: extras?.project_info.total_users ?? null,
        total_files: extras?.project_info.total_files ?? null,
        extras_counts: extras?.counts ?? null,
        encrypted: encryptEnabled,
        backup_uuid: backupUuid,
        export_started_at: startedAtDate.toISOString()
      }, {
        skipDownload: true,
        restoreFiles: restoreScripts(),
        includeChecksums: true
      });
      setProgress({
        label: "Finalizing (sizes + health + signature)",
        done: 4,
        total: 6
      });
      const compressedSize = built.blob.size;
      const uncompressedSize = parts.reduce((s, p) => s + new Blob([p.content]).size, 0) + databaseFiles.reduce((s, f) => s + new Blob([f.content]).size, 0) + mediaBytesTotal;
      const compressionRatio = uncompressedSize ? +(compressedSize / uncompressedSize).toFixed(4) : null;
      const finishedAtDate = /* @__PURE__ */ new Date();
      const durationMs = finishedAtDate.getTime() - startedAt;
      const timing = {
        export_started_at: startedAtDate.toISOString(),
        export_finished_at: finishedAtDate.toISOString(),
        export_duration_ms: durationMs,
        export_duration_seconds: +(durationMs / 1e3).toFixed(2)
      };
      const sizes = {
        database_size_bytes: dbSizeBytes,
        media_size_bytes: mediaBytesTotal,
        storage_size_bytes: storageSizeBytes,
        uncompressed_backup_bytes: uncompressedSize,
        compressed_backup_bytes: compressedSize,
        compression_ratio: compressionRatio
      };
      const outerZip = await JSZip.loadAsync(built.blob);
      const patchedProjectInfo = {
        ...projectInfo,
        sizes,
        timing
      };
      outerZip.file("project-info.json", JSON.stringify(patchedProjectInfo, null, 2));
      const statsEntry = outerZip.file("database/stats.json");
      if (statsEntry) {
        const existing = JSON.parse(await statsEntry.async("string"));
        outerZip.file("database/stats.json", JSON.stringify({
          ...existing,
          sizes,
          timing
        }, null, 2));
      }
      for (const infoName of ["manifest.json", "backup-info.json"]) {
        const e = outerZip.file(infoName);
        if (e) {
          const existing = JSON.parse(await e.async("string"));
          outerZip.file(infoName, JSON.stringify({
            ...existing,
            ...timing,
            sizes
          }, null, 2));
        }
      }
      const has = (p) => !!outerZip.file(p);
      const mediaFolder = outerZip.folder("media");
      const hasMedia = !!(mediaFolder && Object.keys(mediaFolder.files ?? {}).length > 0) || files.length > 0;
      const ORDERED_RESTORE_STEPS = [{
        file: "database/extensions.sql",
        required: true,
        depends_on: [],
        validation: true,
        type: "sql"
      }, {
        file: "database/storage.sql",
        required: true,
        depends_on: ["database/extensions.sql"],
        validation: true,
        type: "sql"
      }, {
        file: "database/schema.sql",
        required: true,
        depends_on: ["database/extensions.sql"],
        validation: true,
        type: "sql"
      }, {
        file: "database/policies.sql",
        required: true,
        depends_on: ["database/schema.sql"],
        validation: true,
        type: "sql"
      }, {
        file: "database/realtime.json",
        required: false,
        depends_on: ["database/schema.sql"],
        validation: true,
        type: "json-config"
      }, {
        file: "database/auth.json",
        required: false,
        depends_on: [],
        validation: true,
        type: "json-config"
      }, {
        file: "database/cron.sql",
        required: false,
        depends_on: ["database/schema.sql"],
        validation: true,
        type: "sql"
      }, {
        file: "database/data.sql",
        required: true,
        depends_on: ["database/schema.sql"],
        validation: true,
        type: "sql"
      }, {
        file: "media/",
        required: false,
        depends_on: ["database/storage.sql"],
        validation: true,
        type: "media-folder"
      }, {
        file: "verify",
        required: true,
        depends_on: [],
        validation: true,
        type: "post-check"
      }];
      const knownFiles = new Set(ORDERED_RESTORE_STEPS.map((s) => s.file));
      const discovered = [];
      outerZip.forEach((relPath, obj) => {
        if (obj.dir) return;
        if (knownFiles.has(relPath)) return;
        if (relPath.startsWith("media/")) return;
        const type = relPath.endsWith(".sql") ? "sql" : relPath.endsWith(".json") ? "json-meta" : relPath.endsWith(".sha256") ? "checksum" : relPath.startsWith("restore/") ? "restore-script" : "misc";
        discovered.push({
          file: relPath,
          required: false,
          depends_on: [],
          validation: type === "json-meta",
          type
        });
      });
      discovered.sort((a, b) => a.file.localeCompare(b.file));
      const allSteps = [...ORDERED_RESTORE_STEPS, ...discovered];
      const restoreComponents = allSteps.map((s, i) => ({
        file: s.file,
        type: s.type,
        order: i + 1,
        required: s.required,
        depends_on: s.depends_on,
        validation: s.validation,
        checksum_available: s.file === "verify" || s.file === "media/" ? false : has("checksums.sha256"),
        present: s.file === "verify" ? true : s.file === "media/" ? hasMedia : has(s.file)
      }));
      const restoreMissing = restoreComponents.filter((c) => c.required && !c.present && c.file !== "verify" && c.file !== "media/").map((c) => c.file);
      const restoreManifest = {
        backup_version: "2.0",
        manifest_version: 1,
        app: "platform",
        app_version: APP_VERSION,
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        backup_uuid: backupUuid,
        compatibility: {
          min_backup_version: "1.0",
          max_backup_version: "2.x",
          postgres_version: extras?.project_info?.pg_version ?? null,
          supabase_version: "cloud",
          application_version: APP_VERSION
        },
        restore_modes: {
          full: ORDERED_RESTORE_STEPS.map((s) => s.file),
          database_only: ["database/extensions.sql", "database/schema.sql", "database/data.sql", "verify"],
          media_only: ["database/storage.sql", "media/", "verify"],
          schema_only: ["database/extensions.sql", "database/schema.sql", "verify"],
          data_only: ["database/data.sql", "verify"],
          security_only: ["database/policies.sql", "verify"],
          configuration_only: ["database/realtime.json", "database/auth.json", "database/cron.sql", "verify"]
        },
        restore_order: ORDERED_RESTORE_STEPS.map((s) => s.file),
        dependencies: {
          "schema.sql": ["extensions.sql"],
          "policies.sql": ["schema.sql"],
          "data.sql": ["schema.sql"],
          "media": ["storage.sql"],
          "cron.sql": ["schema.sql"],
          "realtime.json": ["schema.sql"]
        },
        components: restoreComponents,
        post_restore_tasks: [{
          id: "refresh_schema_cache",
          description: "Refresh PostgREST schema cache",
          sql: "NOTIFY pgrst, 'reload schema';"
        }, {
          id: "reload_postgrest",
          description: "Reload PostgREST configuration",
          sql: "NOTIFY pgrst, 'reload config';"
        }, {
          id: "verify_buckets",
          description: "Verify all storage buckets exist and match storage.sql"
        }, {
          id: "verify_policies",
          description: "Verify RLS policies match policies.sql"
        }, {
          id: "verify_extensions",
          description: "Verify extensions from extensions.sql are installed"
        }, {
          id: "verify_realtime",
          description: "Verify publications/tables in realtime.json"
        }, {
          id: "verify_auth",
          description: "Verify auth providers listed in auth.json are configured"
        }],
        validation: {
          missing_required_files: restoreMissing,
          ok: restoreMissing.length === 0
        }
      };
      outerZip.file("restore/restore.json", JSON.stringify(restoreManifest, null, 2));
      for (const infoName of ["manifest.json", "backup-info.json"]) {
        const e = outerZip.file(infoName);
        if (!e) continue;
        const existing = JSON.parse(await e.async("string"));
        const scripts = Array.isArray(existing.restore_scripts) ? [...existing.restore_scripts] : [];
        if (!scripts.includes("restore.json")) scripts.push("restore.json");
        outerZip.file(infoName, JSON.stringify({
          ...existing,
          restore_scripts: scripts,
          restore_manifest: "restore/restore.json",
          restore_manifest_ok: restoreMissing.length === 0
        }, null, 2));
      }
      const vEntry = outerZip.file("validation.json");
      if (vEntry) {
        const v = JSON.parse(await vEntry.async("string"));
        v.components = v.components ?? {};
        v.components["restore/restore.json"] = {
          ok: true
        };
        const failed = Object.entries(v.components).filter(([, c]) => !c.ok);
        v.ok = failed.length === 0 && restoreMissing.length === 0;
        v.failed_count = failed.length;
        v.restore_missing_required = restoreMissing;
        outerZip.file("validation.json", JSON.stringify(v, null, 2));
      }
      const checks = {
        Database: has("database/database.sql"),
        Schema: has("database/schema.sql"),
        Data: has("database/data.sql"),
        Storage: has("database/storage.sql"),
        Policies: has("database/policies.sql"),
        Extensions: has("database/extensions.sql"),
        Realtime: has("database/realtime.json"),
        Auth: has("database/auth.json"),
        Media: hasMedia,
        Checksums: has("checksums.sha256"),
        "Restore Scripts": has("restore/restore.sh") && has("restore/restore.ps1") && has("restore/verify.sh"),
        "Restore Manifest": has("restore/restore.json"),
        Validation: has("validation.json")
      };
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.values(checks).length;
      const healthScore = Math.round(passed / total * 100);
      const overallStatus = healthScore === 100 ? "Production Ready" : healthScore >= 80 ? "Degraded" : "Failed";
      const health2 = {
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        health_score: healthScore,
        checks_passed: passed,
        checks_total: total,
        checks,
        overall_status: overallStatus
      };
      outerZip.file("health.json", JSON.stringify(health2, null, 2));
      const emptyExports = [];
      for (const dbFileName of ["database.sql", "schema.sql", "data.sql"]) {
        const e = outerZip.file(`database/${dbFileName}`);
        if (e) {
          const s = await e.async("string");
          if (!s.trim()) emptyExports.push(`database/${dbFileName}`);
        }
      }
      const badJson = [];
      for (const jf of ["manifest.json", "backup-info.json", "project-info.json", "validation.json", "health.json", "signature.json", "media-manifest.json", "database.json", "database/stats.json", "database/realtime.json", "database/auth.json", "restore/restore.json"]) {
        const e = outerZip.file(jf);
        if (!e) continue;
        try {
          JSON.parse(await e.async("string"));
        } catch {
          badJson.push(jf);
        }
      }
      const productionReady = overallStatus === "Production Ready" && emptyExports.length === 0 && badJson.length === 0 && restoreMissing.length === 0;
      outerZip.remove("checksums.sha256");
      const entries = [];
      outerZip.forEach((relPath, obj) => {
        if (!obj.dir && relPath !== "checksums.sha256" && relPath !== "signature.json") {
          entries.push({
            path: relPath,
            obj
          });
        }
      });
      entries.sort((a, b) => a.path.localeCompare(b.path));
      const chkLines = [];
      for (const e of entries) {
        const bytes = await e.obj.async("uint8array");
        const hex = await sha256Hex(bytes);
        chkLines.push(`${hex}  ${e.path}`);
      }
      const checksumsFileContent = chkLines.join("\n") + "\n";
      outerZip.file("checksums.sha256", checksumsFileContent);
      const chkBytes = new TextEncoder().encode(checksumsFileContent);
      const contentSha = await sha256Hex(chkBytes);
      const contentMd = md5Hex(chkBytes);
      const signature = {
        ...signatureInit,
        finalized_at: (/* @__PURE__ */ new Date()).toISOString(),
        sha256: contentSha,
        md5: contentMd,
        production_ready: productionReady,
        empty_exports: emptyExports,
        invalid_json: badJson
      };
      outerZip.file("signature.json", JSON.stringify(signature, null, 2));
      const finalizedBlob = await outerZip.generateAsync({
        type: "blob",
        compression: "DEFLATE"
      });
      setProgress({
        label: "Verifying backup",
        done: 5,
        total: 6
      });
      const report = await verifyFullBackupZip(finalizedBlob);
      setVerifyReport(report);
      if (!report.ok || !productionReady) {
        toast.error(!productionReady ? `Backup FAILED — missing/empty: ${[...emptyExports, ...badJson].join(", ") || "component check"}` : "Verification failed — see report below");
        return;
      }
      const zipBytes = new Uint8Array(await finalizedBlob.arrayBuffer());
      const sha = await sha256Hex(zipBytes);
      const md = md5Hex(zipBytes);
      setLastChecksum({
        sha256: sha,
        md5: md,
        filename: built.filename
      });
      const checksumsBlob = new Blob([JSON.stringify({
        filename: built.filename,
        size: finalizedBlob.size,
        sha256: sha,
        md5: md,
        backup_uuid: backupUuid,
        ...timing,
        sizes
      }, null, 2)], {
        type: "application/json"
      });
      let finalBlob = finalizedBlob;
      let finalName = built.filename;
      let finalSha = sha;
      let finalMd = md;
      if (encryptEnabled) {
        finalBlob = await encryptBlobAes256(finalizedBlob, encryptPassword);
        finalName = `${built.filename}.enc`;
        const encBytes = new Uint8Array(await finalBlob.arrayBuffer());
        finalSha = await sha256Hex(encBytes);
        finalMd = md5Hex(encBytes);
        setLastChecksum({
          sha256: finalSha,
          md5: finalMd,
          filename: finalName
        });
      }
      download(finalBlob, finalName);
      download(checksumsBlob, `${finalName}.checksums.json`);
      setLastFile(finalName);
      setEncryptPassword("");
      try {
        await runRecord({
          data: {
            filename: finalName,
            backup_type: "full",
            size_bytes: finalBlob.size,
            sha256: finalSha,
            md5: finalMd,
            verified: true,
            encrypted: encryptEnabled,
            app_version: APP_VERSION,
            total_tables: sqlDump?.stats.tables ?? null,
            total_rows: sqlDump?.stats.rows ?? null,
            media_files: files.length
          }
        });
        await refreshHistoryAndHealth();
      } catch (e) {
        console.warn("history record failed:", e?.message);
      }
      setProgress({
        label: "Done",
        done: 6,
        total: 6
      });
      toast.success(`Full backup verified & downloaded (${files.length} media files${sqlDump ? `, ${sqlDump.stats.rows} rows in ${sqlDump.stats.tables} tables` : ""}, ${fmtDur(Math.round(durationMs / 1e3))})`);
    } catch (e) {
      toast.error(e?.message ?? "Full backup failed");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }
  async function onValidate(file) {
    setBusy("validate");
    setValidateReport(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let blob = file;
      if (isEncryptedBackup(bytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password:");
        if (!pw) {
          setBusy(null);
          return;
        }
        const plain = await decryptBackup(bytes, pw);
        blob = new Blob([plain]);
      }
      let currentBuckets;
      try {
        currentBuckets = await runGetBuckets({});
      } catch {
      }
      const report = await dryRunValidateZip(blob, currentBuckets);
      setValidateReport(report);
      if (report.ok) toast.success("Backup validated — no issues found");
      else toast.error("Validation failed — see report");
    } catch (e) {
      toast.error(e?.message ?? "Validation failed");
    } finally {
      setBusy(null);
    }
  }
  async function stageRestore(file) {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let workingFile = file;
      if (isEncryptedBackup(bytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password to restore:");
        if (!pw) return;
        const plain = await decryptBackup(bytes, pw);
        workingFile = new File([plain], file.name.replace(/\.enc$/i, ""));
      }
      const zip = await JSZip.loadAsync(workingFile);
      let info = {};
      const infoEntry = zip.file("backup-info.json");
      if (infoEntry) info = JSON.parse(await infoEntry.async("text"));
      let stats = {};
      const statsEntry = zip.file("database/stats.json");
      if (statsEntry) stats = JSON.parse(await statsEntry.async("text"));
      const mm = zip.file("media-manifest.json");
      let mediaFiles = 0;
      if (mm) {
        const parsed = JSON.parse(await mm.async("text"));
        for (const b of parsed.buckets ?? []) mediaFiles += (b.files ?? []).length;
      }
      setPendingRestoreFile(workingFile);
      setPreRestore({
        filename: file.name,
        size: file.size,
        backupAppVersion: info.app_version,
        backupGeneratedAt: info.generated_at,
        tables: stats.tables ?? info.total_tables,
        rows: stats.rows ?? info.total_rows_exported,
        mediaFiles
      });
    } catch (e) {
      toast.error(e?.message ?? "Could not read backup");
    }
  }
  async function onRestoreFile(file) {
    setBusy("restore");
    try {
      let workingFile = file;
      const rawBytes = new Uint8Array(await file.arrayBuffer());
      if (isEncryptedBackup(rawBytes)) {
        const pw = window.prompt("Backup is encrypted. Enter password to restore:");
        if (!pw) {
          setBusy(null);
          return;
        }
        const plain = await decryptBackup(rawBytes, pw);
        workingFile = new File([plain], file.name.replace(/\.enc$/i, ""));
      }
      const zip = await JSZip.loadAsync(workingFile);
      const schemaEntry = zip.file("database/schema.sql");
      const dataEntry = zip.file("database/data.sql");
      let schemaResult = null;
      let dataResult = null;
      if (schemaEntry) {
        setProgress({
          label: "Restoring schema",
          done: 0,
          total: 1
        });
        const sql = await schemaEntry.async("text");
        schemaResult = await runRestoreSql({
          data: {
            sql,
            phase: "schema"
          }
        });
        setProgress({
          label: "Restoring schema",
          done: 1,
          total: 1
        });
      }
      if (dataEntry) {
        setProgress({
          label: "Restoring data",
          done: 0,
          total: 1
        });
        const sql = await dataEntry.async("text");
        dataResult = await runRestoreSql({
          data: {
            sql,
            phase: "data"
          }
        });
        setProgress({
          label: "Restoring data",
          done: 1,
          total: 1
        });
      }
      let dbSummary = {
        tables: 0,
        rows: 0
      };
      const dbEntry = zip.file("database.json");
      if (dbEntry) {
        const text = await dbEntry.async("text");
        const json = JSON.parse(text);
        const summary = {};
        for (const t of json.tables ?? []) summary[t.table] = t.rows?.length ?? 0;
        const res = await runRestore({
          data: {
            summary
          }
        });
        dbSummary = {
          tables: res.tables.length,
          rows: res.tables.reduce((n, t) => n + t.rows, 0)
        };
      }
      const manifestEntry = zip.file("media-manifest.json");
      let mediaRestored = 0;
      if (manifestEntry) {
        const manifest = JSON.parse(await manifestEntry.async("text"));
        const buckets = manifest.buckets ?? [];
        setProgress({
          label: "Recreating buckets",
          done: 0,
          total: buckets.length
        });
        for (let i = 0; i < buckets.length; i++) {
          const b = buckets[i];
          try {
            await runEnsureBucket({
              data: {
                name: b.name,
                public: !!b.public
              }
            });
          } catch (e) {
            console.warn(`Bucket ${b.name} ensure failed:`, e?.message);
          }
          setProgress({
            label: "Recreating buckets",
            done: i + 1,
            total: buckets.length
          });
        }
        const uploads = [];
        const mediaFolder = zip.folder("media");
        if (mediaFolder) {
          const mimeMap = /* @__PURE__ */ new Map();
          for (const b of buckets) {
            for (const f of b.files ?? []) {
              mimeMap.set(`${b.name}/${f.path}`, f.mime || "application/octet-stream");
            }
          }
          const entries = [];
          mediaFolder.forEach((_relPath, entry) => {
            if (!entry.dir) entries.push(entry);
          });
          for (const entry of entries) {
            const rel = entry.name.replace(/^media\//, "");
            const slash = rel.indexOf("/");
            if (slash < 0) continue;
            const bucket = rel.slice(0, slash);
            const path = rel.slice(slash + 1);
            const bytes = new Uint8Array(await entry.async("arraybuffer"));
            uploads.push({
              bucket,
              path,
              mime: mimeMap.get(`${bucket}/${path}`),
              bytes
            });
          }
        }
        setProgress({
          label: "Uploading media",
          done: 0,
          total: uploads.length
        });
        await runPool(uploads, 4, async (u) => {
          let bin = "";
          const chunk = 32768;
          for (let i = 0; i < u.bytes.length; i += chunk) {
            bin += String.fromCharCode(...u.bytes.subarray(i, i + chunk));
          }
          const contentBase64 = btoa(bin);
          try {
            await runUpload({
              data: {
                bucket: u.bucket,
                path: u.path,
                mime: u.mime,
                contentBase64
              }
            });
            mediaRestored++;
          } catch (e) {
            console.warn(`Upload ${u.bucket}/${u.path} failed:`, e?.message);
          }
        }, (done, total) => setProgress({
          label: "Uploading media",
          done,
          total
        }));
      }
      const sqlBits = [];
      if (schemaResult) sqlBits.push(`schema ${schemaResult.ok}/${schemaResult.total}`);
      if (dataResult) sqlBits.push(`data ${dataResult.ok}/${dataResult.total}`);
      toast.success(`Restore complete — ${sqlBits.join(", ")}${sqlBits.length ? " · " : ""}${dbSummary.rows} rows in ${dbSummary.tables} tables verified, ${mediaRestored} media files uploaded`);
      await refreshHistoryAndHealth();
    } catch (e) {
      toast.error(e?.message ?? "Restore failed");
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }
  const validateInput = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "System Backup", description: "Snapshot the database and media into a portable ZIP, or restore an archive on any Supabase project. Super admin only." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackupHealthCard, { health }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-emerald-500/30 bg-emerald-500/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-emerald-500" }),
            " Quick Backup",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600", children: "Recommended" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "One-click JSON export of your core application data. Fast, portable, and safe to run any time." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickBackupChecklist, { items: ["App Data", "Settings", "Competitions", "Feed", "Profiles", "Themes & Roles"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onQuickJson, disabled: quickBusy || !!busy, className: "w-full sm:w-auto", children: [
            quickBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { className: "mr-2 h-4 w-4" }),
            "Download JSON Backup"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Saves as ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
              "quick-backup_",
              todayStamp(),
              ".json"
            ] }),
            ". Row limits per table apply — use Full Backup below for media and larger tables."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-4 w-4" }),
            " Full Database Backup"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Recommended before major upgrades — includes schema, functions, triggers, RLS policies and every row." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickBackupChecklist, { items: ["Schema", "Tables", "Functions", "Triggers", "RLS Policies", "Everything"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://supabase.com/docs/guides/platform/backups", target: "_blank", rel: "noopener noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "mr-2 h-4 w-4" }),
            "Open Supabase Export Guide",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5 opacity-60" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Full Postgres dumps run outside the app — the guide walks through Point-in-Time Recovery and downloadable database backups from your hosting provider." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
          " Create backup"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Downloads as ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
            "backup_",
            todayStamp(),
            "_*.zip"
          ] }),
          " — includes raw media file bytes under ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: "/media/<bucket>/<path>" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onDatabase, disabled: !!busy, className: "justify-start", children: [
            busy === "db" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "mr-2 h-4 w-4" }),
            "Backup Database"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onMedia, disabled: !!busy, variant: "outline", className: "justify-start", children: [
            busy === "media" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "mr-2 h-4 w-4" }),
            "Backup Media (files)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onFull, disabled: !!busy, variant: "secondary", className: "justify-start", children: [
            busy === "full" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
            "Full Backup"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-xs sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: encryptEnabled, onCheckedChange: (v) => setEncryptEnabled(!!v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
              " Encrypt backup (AES-256)"
            ] })
          ] }),
          encryptEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", placeholder: "Password (min 8 chars)", value: encryptPassword, onChange: (e) => setEncryptPassword(e.target.value), className: "max-w-xs", autoComplete: "new-password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground sm:ml-auto", children: "Applies only to Full Backup. Password is never stored." })
        ] }),
        progress && busy === "full" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-xs space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: progress.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
              progress.done,
              " / ",
              progress.total
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.total ? progress.done / progress.total * 100 : 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BackupVerificationPanel, { report: verifyReport, sha256: lastChecksum?.sha256, md5: lastChecksum?.md5, filename: lastChecksum?.filename ?? lastFile })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
          " Restore backup"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Upload a backup ZIP — schema, data, buckets, and media are restored to this project. Works across projects, localhost, and new domains." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInput, type: "file", accept: ".zip,application/zip,.enc", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) stageRestore(f);
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: validateInput, type: "file", accept: ".zip,application/zip,.enc", className: "hidden", onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) onValidate(f);
          e.target.value = "";
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => fileInput.current?.click(), disabled: !!busy, children: [
            busy === "restore" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-4 w-4" }),
            "Restore Backup"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => validateInput.current?.click(), disabled: !!busy, variant: "outline", children: [
            busy === "validate" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
            "Validate Backup (dry run)"
          ] })
        ] }),
        progress && busy !== "full" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-3 text-xs space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: progress.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
              progress.done,
              " / ",
              progress.total
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress.total ? progress.done / progress.total * 100 : 0 })
        ] }),
        validateReport && /* @__PURE__ */ jsxRuntimeExports.jsx(BackupVerificationPanel, { report: validateReport }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mr-1 inline h-3.5 w-3.5" }),
          "Restore applies schema and data through the admin restore endpoint. Existing rows with matching primary keys are kept (INSERT ... ON CONFLICT DO NOTHING)."
        ] }),
        lastFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-emerald-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
          " Last download: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: lastFile })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
            " Backup History"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Recent backups with checksums and verification status. Expired rows are pruned automatically." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Retention:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: retention, onValueChange: async (v) => {
            setRetention(v);
            try {
              await runSetRetention({
                data: {
                  value: v
                }
              });
              toast.success(`Retention set to ${v}`);
            } catch (e) {
              toast.error(e?.message ?? "Failed to update retention");
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "7d", children: "7 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "30d", children: "30 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "90d", children: "90 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "forever", children: "Forever" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackupHistoryTable, { rows: history, onDelete: async (id) => {
        try {
          await runDelete({
            data: {
              id
            }
          });
          toast.success("Backup entry deleted");
          await refreshHistoryAndHealth();
        } catch (e) {
          toast.error(e?.message ?? "Delete failed");
        }
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreRestoreDialog, { open: !!preRestore, info: preRestore, onCancel: () => {
      setPreRestore(null);
      setPendingRestoreFile(null);
    }, onConfirm: async () => {
      const f = pendingRestoreFile;
      setPreRestore(null);
      setPendingRestoreFile(null);
      if (f) await onRestoreFile(f);
    } })
  ] });
}
export {
  BackupPage as component
};
