import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { o as objectType, r as recordType, s as stringType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
const backupDatabase = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("76e6fc7a58c80573e13c5bfeba017853d4a6a4d55dd081d5b865f6c101e80106"));
const backupMediaManifest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("ec4091dc2c2bc0f492380cf5fb79bc0983634c6a120aee38fada23fcb07ef97d"));
const restoreBackupDryRun = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  summary: recordType(stringType(), numberType())
}).parse(d)).handler(createSsrRpc("c62ca6743b3701289cbb5ba9a86f49f0135d647ba9a9d961a1f456cd9e56f241"));
const bucketPathSchema = objectType({
  bucket: stringType().min(1).max(63),
  path: stringType().min(1).max(1024)
});
const downloadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => bucketPathSchema.parse(d)).handler(createSsrRpc("3d1c2d5d2f2168644443aab81d77f0f19285c41b7f4a9aa1da4f8529f1cece90"));
const ensureStorageBucket = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => objectType({
  name: stringType().min(1).max(63),
  public: booleanType().default(false)
}).parse(d)).handler(createSsrRpc("59be48f262706f05a7b6c8ff850a5fa83c33217a7186668b879a170cf283c6c1"));
const uploadMediaFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((d) => bucketPathSchema.extend({
  contentBase64: stringType(),
  mime: stringType().optional()
}).parse(d)).handler(createSsrRpc("de6be986d7e30dd814311362a6cdd7c697b6ebcf57d003dd11d8bbb29300ad56"));
const ensureRequiredBuckets = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("bc75a214afa83adcc42923f7f934130909277897a11b75349013e5ef58a9fa46"));
const dumpDatabaseSql = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("93eadaa5e5b70991cf2956d89bd15639f213c72ac90835836b303b7b69a4708a"));
const exportBackupExtras = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("4f7c04fe629f39fddd21a2f3ece558c12aafd300b8fa7bf0f04190f872c2ca68"));
const exportBackupMetadataV2 = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("608c378fde795cb827c9d7b5aa94375e5db803d26df8fd5705881f17452a625f"));
export {
  backupMediaManifest as a,
  backupDatabase as b,
  ensureStorageBucket as c,
  downloadMediaFile as d,
  ensureRequiredBuckets as e,
  dumpDatabaseSql as f,
  exportBackupExtras as g,
  exportBackupMetadataV2 as h,
  restoreBackupDryRun as r,
  uploadMediaFile as u
};
