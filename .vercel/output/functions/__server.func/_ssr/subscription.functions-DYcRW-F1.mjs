import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType, n as numberType, r as recordType, u as unknownType, a as arrayType } from "../_libs/zod.mjs";
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
const listPlans_createServerFn_handler = createServerRpc({
  id: "8d9e04e848d8fab4e0075d8a662247217a6bffda2cb4cb4b87313f1ae1e4df8c",
  name: "listPlans",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => listPlans.__executeServer(opts));
const listPlans = createServerFn({
  method: "GET"
}).handler(listPlans_createServerFn_handler, async () => {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const {
    data,
    error
  } = await sb.from("subscription_plans").select("*").eq("active", true).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const getSubscriptionMode_createServerFn_handler = createServerRpc({
  id: "c690cda28e2c6fbe81128e275c71c570f1d8a5d3b9deca57af0fe77c9c9a3de4",
  name: "getSubscriptionMode",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => getSubscriptionMode.__executeServer(opts));
const getSubscriptionMode = createServerFn({
  method: "GET"
}).handler(getSubscriptionMode_createServerFn_handler, async () => {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const {
    data
  } = await sb.from("app_settings").select("value").eq("key", "subscription").maybeSingle();
  const v = data?.value ?? {};
  return {
    mode: v.mode || "optional",
    default_currency: v.default_currency || "INR",
    default_currency_symbol: v.default_currency_symbol || "₹",
    payment_instructions: v.payment_instructions || "",
    providers: v.providers || {
      manual: true
    }
  };
});
const getMySubscription_createServerFn_handler = createServerRpc({
  id: "9426669075fecaa116539005d65966feb0dd23a91150d7afcc43e32fbbca7cc6",
  name: "getMySubscription",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => getMySubscription.__executeServer(opts));
const getMySubscription = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(getMySubscription_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: sub
  } = await supabase.from("user_subscriptions").select("*, plan:subscription_plans(*)").eq("user_id", userId).maybeSingle();
  const {
    data: rooms
  } = await supabase.from("chatrooms").select("id").eq("owner_id", userId).is("archived_at", null);
  const isActive = !!sub && (sub.status === "active" || sub.status === "trialing") && (!sub.expiry_date || new Date(sub.expiry_date) > /* @__PURE__ */ new Date());
  return {
    subscription: sub,
    isActive,
    ownedRoomCount: rooms?.length ?? 0
  };
});
const requestSubscription_createServerFn_handler = createServerRpc({
  id: "dea1e7bf394b0e9400c44ad97ae3d16e6cf1c36154ae012f5214936f0fa974b0",
  name: "requestSubscription",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => requestSubscription.__executeServer(opts));
const requestSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  planId: stringType().uuid(),
  cycle: enumType(["monthly", "yearly"]),
  proofReference: stringType().trim().max(200).optional()
}).parse(d)).handler(requestSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: plan,
    error: pErr
  } = await supabase.from("subscription_plans").select("id,monthly_price,yearly_price,currency_code,is_default,active").eq("id", data.planId).single();
  if (pErr || !plan) throw new Error("Plan not found");
  if (!plan.active) throw new Error("Plan not available");
  if (plan.is_default || plan.monthly_price === 0 && plan.yearly_price === 0) {
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      status: "active",
      billing_cycle: data.cycle,
      start_date: (/* @__PURE__ */ new Date()).toISOString(),
      expiry_date: null
    }, {
      onConflict: "user_id"
    });
    return {
      ok: true,
      mode: "free"
    };
  }
  const amount = data.cycle === "yearly" ? plan.yearly_price : plan.monthly_price;
  const {
    data: pay,
    error: payErr
  } = await supabase.from("subscription_payments").insert({
    user_id: userId,
    plan_id: plan.id,
    billing_cycle: data.cycle,
    amount,
    currency_code: plan.currency_code,
    provider: "manual",
    proof_reference: data.proofReference ?? null,
    status: "pending"
  }).select("id").single();
  if (payErr) throw new Error(payErr.message);
  await supabase.from("user_subscriptions").upsert({
    user_id: userId,
    plan_id: plan.id,
    status: "pending",
    billing_cycle: data.cycle,
    last_payment_id: pay.id
  }, {
    onConflict: "user_id"
  });
  return {
    ok: true,
    mode: "manual",
    paymentId: pay.id
  };
});
const cancelMySubscription_createServerFn_handler = createServerRpc({
  id: "08fea8aded1dfa5bb9a8d8bfa200f8af31609388a5b089ce8f6e23ccff90a7b9",
  name: "cancelMySubscription",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => cancelMySubscription.__executeServer(opts));
const cancelMySubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(cancelMySubscription_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("user_subscriptions").update({
    status: "cancelled",
    cancelled_at: (/* @__PURE__ */ new Date()).toISOString(),
    auto_renew: false
  }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const planInput = objectType({
  id: stringType().uuid().optional(),
  slug: stringType().min(2).max(40).regex(/^[a-z0-9_-]+$/),
  name: stringType().min(1).max(60),
  description: stringType().max(500).optional().nullable(),
  badge: stringType().max(20).optional().nullable(),
  tier: stringType().max(30).default("free"),
  currency_code: stringType().length(3).default("INR"),
  currency_symbol: stringType().max(4).default("₹"),
  monthly_price: numberType().min(0),
  yearly_price: numberType().min(0),
  trial_days: numberType().int().min(0).max(365).default(0),
  features: arrayType(stringType()).default([]),
  perks: recordType(unknownType()).default({}),
  max_personal_chatrooms: numberType().int().min(0).max(1e3).default(0),
  sort_order: numberType().int().default(0),
  active: booleanType().default(true),
  is_default: booleanType().default(false)
});
async function assertAdmin(supabase, userId) {
  const {
    data: isAdmin
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  const {
    data: isSuper
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  });
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}
const adminUpsertPlan_createServerFn_handler = createServerRpc({
  id: "95fcf9064e671a5496066f87d841cf8c4a935837d7d0a99f9833d806d269ad8b",
  name: "adminUpsertPlan",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminUpsertPlan.__executeServer(opts));
const adminUpsertPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => planInput.parse(d)).handler(adminUpsertPlan_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    id,
    ...rest
  } = data;
  const payload = rest;
  if (id) {
    const {
      error: error2
    } = await context.supabase.from("subscription_plans").update(payload).eq("id", id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id
    };
  }
  const {
    data: row,
    error
  } = await context.supabase.from("subscription_plans").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const adminDeletePlan_createServerFn_handler = createServerRpc({
  id: "d421e0c69082bec8c49e9d432715728ac0e6de8a3918513ca03496a82bbcebf6",
  name: "adminDeletePlan",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminDeletePlan.__executeServer(opts));
const adminDeletePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(adminDeletePlan_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("subscription_plans").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListPayments_createServerFn_handler = createServerRpc({
  id: "302ebdfb46516d0704d6335b88380892b318816585b355ad37d60404ca776bb9",
  name: "adminListPayments",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminListPayments.__executeServer(opts));
const adminListPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d = {}) => objectType({
  status: enumType(["pending", "approved", "rejected", "all"]).default("pending")
}).parse(d)).handler(adminListPayments_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  let q = context.supabase.from("subscription_payments").select("*, plan:subscription_plans(name,slug,badge), user:profiles!subscription_payments_user_id_fkey(id,username,avatar_url,avatar_color)").order("created_at", {
    ascending: false
  }).limit(200);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const adminApprovePayment_createServerFn_handler = createServerRpc({
  id: "0dd5493d7ebe1b7214b35ee40b546933b7f0bd15ce2a71dcf3fe1789d4a0901c",
  name: "adminApprovePayment",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminApprovePayment.__executeServer(opts));
const adminApprovePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  paymentId: stringType().uuid(),
  note: stringType().max(500).optional()
}).parse(d)).handler(adminApprovePayment_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data: pay,
    error: pErr
  } = await context.supabase.from("subscription_payments").select("id,user_id,plan_id,billing_cycle,status").eq("id", data.paymentId).single();
  if (pErr || !pay) throw new Error("Payment not found");
  if (pay.status !== "pending") throw new Error(`Payment already ${pay.status}`);
  const now = /* @__PURE__ */ new Date();
  const expiry = new Date(now);
  if (pay.billing_cycle === "yearly") expiry.setFullYear(expiry.getFullYear() + 1);
  else expiry.setMonth(expiry.getMonth() + 1);
  const {
    error: upErr
  } = await context.supabase.from("subscription_payments").update({
    status: "approved",
    approved_by: context.userId,
    approved_at: now.toISOString(),
    admin_note: data.note ?? null
  }).eq("id", data.paymentId);
  if (upErr) throw new Error(upErr.message);
  const {
    error: subErr
  } = await context.supabase.from("user_subscriptions").upsert({
    user_id: pay.user_id,
    plan_id: pay.plan_id,
    status: "active",
    billing_cycle: pay.billing_cycle,
    start_date: now.toISOString(),
    expiry_date: expiry.toISOString(),
    last_payment_id: pay.id
  }, {
    onConflict: "user_id"
  });
  if (subErr) throw new Error(subErr.message);
  return {
    ok: true
  };
});
const adminRejectPayment_createServerFn_handler = createServerRpc({
  id: "0102340eb61a8d1ae963d01d49c56af8d197df4b2e9cacae375d9d388bde78ea",
  name: "adminRejectPayment",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminRejectPayment.__executeServer(opts));
const adminRejectPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  paymentId: stringType().uuid(),
  note: stringType().max(500).optional()
}).parse(d)).handler(adminRejectPayment_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("subscription_payments").update({
    status: "rejected",
    approved_by: context.userId,
    approved_at: (/* @__PURE__ */ new Date()).toISOString(),
    admin_note: data.note ?? null
  }).eq("id", data.paymentId).eq("status", "pending");
  if (error) throw new Error(error.message);
  await context.supabase.from("user_subscriptions").update({
    status: "free"
  }).eq("last_payment_id", data.paymentId);
  return {
    ok: true
  };
});
const adminSetSubscriptionMode_createServerFn_handler = createServerRpc({
  id: "47d33cd1c3ffd85c80364fb86d59822bdcedb85e129d8371cf01b510711307e0",
  name: "adminSetSubscriptionMode",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminSetSubscriptionMode.__executeServer(opts));
const adminSetSubscriptionMode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  mode: enumType(["off", "optional", "required"]),
  payment_instructions: stringType().max(2e3).optional(),
  default_currency: stringType().length(3).optional(),
  default_currency_symbol: stringType().max(4).optional()
}).parse(d)).handler(adminSetSubscriptionMode_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data: existing
  } = await context.supabase.from("app_settings").select("value").eq("key", "subscription").maybeSingle();
  const current = existing?.value || {};
  const next = {
    ...current,
    ...data
  };
  await context.supabase.from("app_settings").upsert({
    key: "subscription",
    value: next
  }, {
    onConflict: "key"
  });
  return {
    ok: true,
    value: next
  };
});
const adminSubscriptionStats_createServerFn_handler = createServerRpc({
  id: "34354b98b1e2f914cc9eb30dded79488b6ba96472ec69384dc1b6f29a9b5f516",
  name: "adminSubscriptionStats",
  filename: "src/lib/subscription.functions.ts"
}, (opts) => adminSubscriptionStats.__executeServer(opts));
const adminSubscriptionStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(adminSubscriptionStats_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const [{
    count: total
  }, {
    count: active
  }, {
    count: expired
  }, {
    count: pending
  }] = await Promise.all([context.supabase.from("user_subscriptions").select("*", {
    count: "exact",
    head: true
  }), context.supabase.from("user_subscriptions").select("*", {
    count: "exact",
    head: true
  }).eq("status", "active"), context.supabase.from("user_subscriptions").select("*", {
    count: "exact",
    head: true
  }).eq("status", "expired"), context.supabase.from("subscription_payments").select("*", {
    count: "exact",
    head: true
  }).eq("status", "pending")]);
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - 30);
  const {
    data: revRows
  } = await context.supabase.from("subscription_payments").select("amount,currency_code").eq("status", "approved").gte("approved_at", since.toISOString());
  const revenue = {};
  for (const r of revRows ?? []) revenue[r.currency_code] = (revenue[r.currency_code] ?? 0) + Number(r.amount);
  return {
    total: total ?? 0,
    active: active ?? 0,
    expired: expired ?? 0,
    pendingPayments: pending ?? 0,
    revenue30d: revenue
  };
});
export {
  adminApprovePayment_createServerFn_handler,
  adminDeletePlan_createServerFn_handler,
  adminListPayments_createServerFn_handler,
  adminRejectPayment_createServerFn_handler,
  adminSetSubscriptionMode_createServerFn_handler,
  adminSubscriptionStats_createServerFn_handler,
  adminUpsertPlan_createServerFn_handler,
  cancelMySubscription_createServerFn_handler,
  getMySubscription_createServerFn_handler,
  getSubscriptionMode_createServerFn_handler,
  listPlans_createServerFn_handler,
  requestSubscription_createServerFn_handler
};
