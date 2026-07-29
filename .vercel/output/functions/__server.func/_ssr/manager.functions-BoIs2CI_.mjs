import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn, g as getRequestIP } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, n as numberType, e as enumType } from "../_libs/zod.mjs";
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
const HostSchema = objectType({
  domain: stringType().trim().min(1).max(253),
  serverIp: stringType().trim().max(64).optional(),
  installationId: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  runtime: stringType().trim().max(64).optional()
});
const IdentitySchema = objectType({
  key: stringType().trim().min(4).max(200),
  purchaseCode: stringType().trim().max(200).optional(),
  customerEmail: stringType().trim().email().max(255).optional()
});
const SourceIdSchema = stringType().trim().min(1).max(32);
function enrichHost(host) {
  const ip = host.serverIp ?? getRequestIP({
    xForwardedFor: true
  }) ?? void 0;
  return {
    domain: host.domain,
    serverIp: ip,
    installationId: host.installationId,
    runtime: host.runtime ?? "workerd",
    productVersion: host.productVersion ?? APP_VERSION
  };
}
async function assertAdmin(context) {
  const {
    data
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin"
  });
  const {
    data: data2
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin"
  });
  if (!data && !data2) throw new Error("Forbidden");
}
const listLicenseSources_createServerFn_handler = createServerRpc({
  id: "6f10113a3f2a17d245d52170d8dd80becf34a9ec5e8ace91f7440af34de787b7",
  name: "listLicenseSources",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => listLicenseSources.__executeServer(opts));
const listLicenseSources = createServerFn({
  method: "GET"
}).handler(listLicenseSources_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("license_sources").select("id,label,provider,enabled,sort_order").eq("enabled", true).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return {
    sources: data ?? []
  };
});
const VerifyInput = objectType({
  sourceId: SourceIdSchema,
  identity: IdentitySchema,
  host: HostSchema
});
const verifyLicense_createServerFn_handler = createServerRpc({
  id: "89ab9016c6a9ad77aa33dcc46f31a19c9e98ad04617b9fa813f8065c4e4f5960",
  name: "verifyLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => verifyLicense.__executeServer(opts));
const verifyLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => VerifyInput.parse(v)).handler(verifyLicense_createServerFn_handler, async ({
  data
}) => {
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  const result = await LicenseManager.verify(data.sourceId, data.identity, enrichHost(data.host));
  return result;
});
const activateLicense_createServerFn_handler = createServerRpc({
  id: "c08cff9bc636034a6982cddd28bd65448032e2c599c421ef83e3fd5226576ecc",
  name: "activateLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => activateLicense.__executeServer(opts));
const activateLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => VerifyInput.parse(v)).handler(activateLicense_createServerFn_handler, async ({
  data
}) => {
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  const outcome = await LicenseManager.activate(data.sourceId, data.identity, enrichHost(data.host));
  return {
    ok: outcome.ok,
    message: outcome.message,
    license: outcome.license ?? null,
    result: outcome.result
  };
});
const CheckInput = objectType({
  host: HostSchema
});
const checkLicense_createServerFn_handler = createServerRpc({
  id: "20a05b482935b0079c981eed1648f4eac430402479a242003d4610800cc8a0f0",
  name: "checkLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => checkLicense.__executeServer(opts));
const checkLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => CheckInput.parse(v)).handler(checkLicense_createServerFn_handler, async ({
  data
}) => {
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.check(enrichHost(data.host));
});
const readLicenseCache_createServerFn_handler = createServerRpc({
  id: "29f2febecadda89584f4ae0806ffae60779268003031ca30ac288533a497e1ee",
  name: "readLicenseCache",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => readLicenseCache.__executeServer(opts));
const readLicenseCache = createServerFn({
  method: "GET"
}).handler(readLicenseCache_createServerFn_handler, async () => {
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  const cache = await LicenseManager.readCache();
  if (!cache) return {
    cached: false
  };
  const {
    signature: _sig,
    ...rest
  } = cache;
  return {
    cached: true,
    cache: rest
  };
});
const AdminListInput = objectType({
  search: stringType().trim().max(120).optional(),
  status: stringType().trim().max(32).optional(),
  sourceId: stringType().trim().max(32).optional(),
  plan: enumType(["trial", "monthly", "yearly", "lifetime"]).optional(),
  limit: numberType().int().min(1).max(200).default(50),
  offset: numberType().int().min(0).default(0)
});
const adminListLicenses_createServerFn_handler = createServerRpc({
  id: "fbff7a3056b9aedd5379c245b06b1f2f208837a89c7f223b1c99037307c7df60",
  name: "adminListLicenses",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminListLicenses.__executeServer(opts));
const adminListLicenses = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => AdminListInput.parse(v)).handler(adminListLicenses_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  let q = supabaseAdmin.from("licenses").select("*", {
    count: "exact"
  }).order("created_at", {
    ascending: false
  }).range(data.offset, data.offset + data.limit - 1);
  if (data.status) q = q.eq("status", data.status);
  if (data.sourceId) q = q.eq("source_id", data.sourceId);
  if (data.plan) q = q.eq("license_plan", data.plan);
  if (data.search) {
    q = q.or([`license_key.ilike.%${data.search}%`, `purchase_code.ilike.%${data.search}%`, `customer_email.ilike.%${data.search}%`, `current_domain.ilike.%${data.search}%`].join(","));
  }
  const {
    data: rows,
    count,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return {
    rows: rows ?? [],
    count: count ?? 0
  };
});
const adminGetLicense_createServerFn_handler = createServerRpc({
  id: "801f8414b82bd1dc153e77d132ebd3bb77eba32371faaff34dd49552575719d8",
  name: "adminGetLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminGetLicense.__executeServer(opts));
const adminGetLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid()
}).parse(v)).handler(adminGetLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const [{
    data: license
  }, {
    data: activations
  }, {
    data: logs
  }] = await Promise.all([supabaseAdmin.from("licenses").select("*").eq("id", data.id).maybeSingle(), supabaseAdmin.from("license_activations").select("*").eq("license_id", data.id).order("activated_at", {
    ascending: false
  }), supabaseAdmin.from("license_logs").select("*").eq("license_id", data.id).order("created_at", {
    ascending: false
  }).limit(200)]);
  return {
    license,
    activations: activations ?? [],
    logs: logs ?? []
  };
});
const adminLicenseStats_createServerFn_handler = createServerRpc({
  id: "3cc6e2d5fc8adb8051f390229ff3f728ffe6a77e6c7aca797ee9dd4a7c84e3a0",
  name: "adminLicenseStats",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminLicenseStats.__executeServer(opts));
const adminLicenseStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminLicenseStats_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("license_statistics").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? {};
});
const PlanSchema = enumType(["trial", "monthly", "yearly", "lifetime"]);
function planDefaultExpiry(plan) {
  const now = /* @__PURE__ */ new Date();
  switch (plan) {
    case "trial":
      now.setDate(now.getDate() + 14);
      return now.toISOString();
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      return now.toISOString();
    case "yearly":
      now.setFullYear(now.getFullYear() + 1);
      return now.toISOString();
    case "lifetime":
      return null;
  }
}
const GenerateSelfInput = objectType({
  customerEmail: stringType().trim().email(),
  customerName: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: stringType().datetime().nullable().optional(),
  maxActivations: numberType().int().min(1).max(1e3).default(1)
});
function randomSelfKey() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({
    length: 4
  }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
  return `BOOB-${seg()}-${seg()}-${seg()}-${seg()}`;
}
const adminGenerateSelfLicense_createServerFn_handler = createServerRpc({
  id: "179bd230da879d6587c60996b1d871152629802a9a7932d6f3f4e4da382a1eb4",
  name: "adminGenerateSelfLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminGenerateSelfLicense.__executeServer(opts));
const adminGenerateSelfLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => GenerateSelfInput.parse(v)).handler(adminGenerateSelfLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const key = randomSelfKey();
  const expiry = data.plan === "lifetime" ? null : data.expiryDate ?? planDefaultExpiry(data.plan);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("licenses").insert({
    license_key: key,
    source_id: "self",
    customer_email: data.customerEmail,
    customer_name: data.customerName ?? null,
    product: "boobubble",
    product_version: data.productVersion ?? APP_VERSION,
    max_activations: data.maxActivations,
    license_plan: data.plan,
    expiry_date: expiry,
    status: "pending"
  }).select("*").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("license_logs").insert({
    license_id: row.id,
    action: "generate",
    outcome: "ok",
    actor_user_id: context.userId,
    context: {
      source: "self",
      plan: data.plan
    }
  });
  return {
    license: row
  };
});
const ImportInput = objectType({
  sourceId: SourceIdSchema,
  licenseKey: stringType().trim().min(4).max(200),
  purchaseCode: stringType().trim().max(200).optional(),
  customerEmail: stringType().trim().email().optional(),
  customerName: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: stringType().datetime().nullable().optional(),
  maxActivations: numberType().int().min(1).max(1e3).default(1),
  status: stringType().trim().max(32).default("active")
});
const adminImportLicense_createServerFn_handler = createServerRpc({
  id: "bafd8e3de8004b940403bbd91f75868192df7e865b06fb4579d7fc231fee743c",
  name: "adminImportLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminImportLicense.__executeServer(opts));
const adminImportLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => ImportInput.parse(v)).handler(adminImportLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("licenses").upsert({
    license_key: data.licenseKey,
    purchase_code: data.purchaseCode ?? null,
    source_id: data.sourceId,
    customer_email: data.customerEmail ?? null,
    customer_name: data.customerName ?? null,
    product: "boobubble",
    product_version: data.productVersion ?? APP_VERSION,
    max_activations: data.maxActivations,
    license_plan: data.plan,
    expiry_date: data.plan === "lifetime" ? null : data.expiryDate ?? planDefaultExpiry(data.plan),
    status: data.status
  }, {
    onConflict: "license_key"
  }).select("*").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("license_logs").insert({
    license_id: row.id,
    action: "import",
    outcome: "ok",
    actor_user_id: context.userId
  });
  return {
    license: row
  };
});
const IdInput = objectType({
  id: stringType().uuid()
});
const adminSuspendLicense_createServerFn_handler = createServerRpc({
  id: "b50db06716d948b1841528ebb0d3fe9bbf5de40d873e32a4b0c4bc5b0d601f88",
  name: "adminSuspendLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminSuspendLicense.__executeServer(opts));
const adminSuspendLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(adminSuspendLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.setStatus(data.id, "suspended", {
    actorUserId: context.userId
  });
});
const adminRevokeLicense_createServerFn_handler = createServerRpc({
  id: "7c4638e97c2a777a92c2b411287936b2b236c243c1f93bdaf77bf71c4efc658e",
  name: "adminRevokeLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminRevokeLicense.__executeServer(opts));
const adminRevokeLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(adminRevokeLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.setStatus(data.id, "revoked", {
    actorUserId: context.userId
  });
});
const adminActivateLicense_createServerFn_handler = createServerRpc({
  id: "ab172b00f1dc49082ff726caa6c0b44fe22a12a7ef92a7b8a9be9bba8075a51b",
  name: "adminActivateLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminActivateLicense.__executeServer(opts));
const adminActivateLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(adminActivateLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.setStatus(data.id, "active", {
    actorUserId: context.userId
  });
});
const adminResetActivation_createServerFn_handler = createServerRpc({
  id: "6197bc1a8ecdab3cca89835b520815810403b5a52b6d931a9d42ed43e7ffb669",
  name: "adminResetActivation",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminResetActivation.__executeServer(opts));
const adminResetActivation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(adminResetActivation_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.resetActivation(data.id, {
    actorUserId: context.userId
  });
});
const adminExtendExpiry_createServerFn_handler = createServerRpc({
  id: "06ade90c2b38d0e75f84b7eb7f6730fbe078a266c1f53b87f644c12240dd7025",
  name: "adminExtendExpiry",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminExtendExpiry.__executeServer(opts));
const adminExtendExpiry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid(),
  expiryDate: stringType().datetime().nullable(),
  plan: PlanSchema.optional()
}).parse(v)).handler(adminExtendExpiry_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  if (data.plan) {
    const newExpiry = data.plan === "lifetime" ? null : data.expiryDate;
    await supabaseAdmin.from("licenses").update({
      license_plan: data.plan,
      expiry_date: newExpiry,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.id);
  }
  return LicenseManager.extendExpiry(data.id, data.plan === "lifetime" ? null : data.expiryDate, {
    actorUserId: context.userId
  });
});
const adminChangeDomain_createServerFn_handler = createServerRpc({
  id: "c89fdb10b9d1e0fceada7191107516b7eb6da58da6b6688bbf2ee72bfac5ad9f",
  name: "adminChangeDomain",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminChangeDomain.__executeServer(opts));
const adminChangeDomain = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid(),
  domain: stringType().trim().min(1).max(253)
}).parse(v)).handler(adminChangeDomain_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    LicenseManager
  } = await import("./manager.server-Cqc5t26e.mjs");
  return LicenseManager.changeDomain(data.id, data.domain, {
    actorUserId: context.userId
  });
});
const adminDeleteLicense_createServerFn_handler = createServerRpc({
  id: "338368b876ba293dd5aa1ee823bcd9c02288ecce13a786083ef2bc2408ee980b",
  name: "adminDeleteLicense",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminDeleteLicense.__executeServer(opts));
const adminDeleteLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(adminDeleteLicense_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    error
  } = await supabaseAdmin.from("licenses").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("license_logs").insert({
    license_id: null,
    action: "delete",
    outcome: "ok",
    actor_user_id: context.userId,
    context: {
      deleted_id: data.id
    }
  });
  return {
    ok: true
  };
});
const adminExportLicensesCsv_createServerFn_handler = createServerRpc({
  id: "fff36db4427bf10a5a18341e81ab3e3ce05b3da6a0860ffa88d1f3b467305146",
  name: "adminExportLicensesCsv",
  filename: "src/lib/licensing/manager.functions.ts"
}, (opts) => adminExportLicensesCsv.__executeServer(opts));
const adminExportLicensesCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminExportLicensesCsv_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("licenses").select("license_key,purchase_code,source_id,customer_email,customer_name,product,product_version,license_plan,activation_date,expiry_date,max_activations,current_activations,current_domain,status,created_at").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const header = "license_key,purchase_code,source,customer_email,customer_name,product,product_version,plan,activation_date,expiry_date,max_activations,current_activations,current_domain,status,created_at";
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => {
    const plan = r.license_plan ?? "monthly";
    const isLifetime = plan === "lifetime";
    return [r.license_key, r.purchase_code, r.source_id, r.customer_email, r.customer_name, r.product, r.product_version, plan, r.activation_date, isLifetime ? "Lifetime" : r.expiry_date, r.max_activations, r.current_activations, r.current_domain, r.status, r.created_at].map(escape).join(",");
  }).join("\n");
  return {
    csv: `${header}
${body}`,
    filename: `licenses-${Date.now()}.csv`
  };
});
export {
  activateLicense_createServerFn_handler,
  adminActivateLicense_createServerFn_handler,
  adminChangeDomain_createServerFn_handler,
  adminDeleteLicense_createServerFn_handler,
  adminExportLicensesCsv_createServerFn_handler,
  adminExtendExpiry_createServerFn_handler,
  adminGenerateSelfLicense_createServerFn_handler,
  adminGetLicense_createServerFn_handler,
  adminImportLicense_createServerFn_handler,
  adminLicenseStats_createServerFn_handler,
  adminListLicenses_createServerFn_handler,
  adminResetActivation_createServerFn_handler,
  adminRevokeLicense_createServerFn_handler,
  adminSuspendLicense_createServerFn_handler,
  checkLicense_createServerFn_handler,
  listLicenseSources_createServerFn_handler,
  readLicenseCache_createServerFn_handler,
  verifyLicense_createServerFn_handler
};
