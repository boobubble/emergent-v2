import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads ----------

export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await sb
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getSubscriptionMode = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await sb.from("app_settings").select("value").eq("key", "subscription").maybeSingle();
  const v = (data?.value as Record<string, unknown> | null) ?? {};
  return {
    mode: (v.mode as string) || "optional",
    default_currency: (v.default_currency as string) || "INR",
    default_currency_symbol: (v.default_currency_symbol as string) || "₹",
    payment_instructions: (v.payment_instructions as string) || "",
    providers: (v.providers as Record<string, boolean>) || { manual: true },
  };
});

// ---------- User-scoped ----------

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: rooms } = await supabase
      .from("chatrooms")
      .select("id")
      .eq("owner_id", userId)
      .is("archived_at", null);
    const isActive =
      !!sub && (sub.status === "active" || sub.status === "trialing") &&
      (!sub.expiry_date || new Date(sub.expiry_date) > new Date());
    return {
      subscription: sub,
      isActive,
      ownedRoomCount: rooms?.length ?? 0,
    };
  });

export const requestSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string; cycle: "monthly" | "yearly"; proofReference?: string }) =>
    z.object({
      planId: z.string().uuid(),
      cycle: z.enum(["monthly", "yearly"]),
      proofReference: z.string().trim().max(200).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: plan, error: pErr } = await supabase
      .from("subscription_plans")
      .select("id,monthly_price,yearly_price,currency_code,is_default,active")
      .eq("id", data.planId)
      .single();
    if (pErr || !plan) throw new Error("Plan not found");
    if (!plan.active) throw new Error("Plan not available");

    // Free plan: directly attach the user
    if (plan.is_default || (plan.monthly_price === 0 && plan.yearly_price === 0)) {
      await supabase.from("user_subscriptions").upsert({
        user_id: userId,
        plan_id: plan.id,
        status: "active",
        billing_cycle: data.cycle,
        start_date: new Date().toISOString(),
        expiry_date: null,
      }, { onConflict: "user_id" });
      return { ok: true, mode: "free" as const };
    }

    const amount = data.cycle === "yearly" ? plan.yearly_price : plan.monthly_price;
    const { data: pay, error: payErr } = await supabase
      .from("subscription_payments")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        billing_cycle: data.cycle,
        amount,
        currency_code: plan.currency_code,
        provider: "manual",
        proof_reference: data.proofReference ?? null,
        status: "pending",
      })
      .select("id")
      .single();
    if (payErr) throw new Error(payErr.message);

    // Mark user subscription as pending so UI reflects it
    await supabase.from("user_subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      status: "pending",
      billing_cycle: data.cycle,
      last_payment_id: pay.id,
    }, { onConflict: "user_id" });

    return { ok: true, mode: "manual" as const, paymentId: pay.id };
  });

export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), auto_renew: false })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin ----------

const planInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(60),
  description: z.string().max(500).optional().nullable(),
  badge: z.string().max(20).optional().nullable(),
  tier: z.string().max(30).default("free"),
  currency_code: z.string().length(3).default("INR"),
  currency_symbol: z.string().max(4).default("₹"),
  monthly_price: z.number().min(0),
  yearly_price: z.number().min(0),
  trial_days: z.number().int().min(0).max(365).default(0),
  features: z.array(z.string()).default([]),
  perks: z.record(z.unknown()).default({}),
  max_personal_chatrooms: z.number().int().min(0).max(1000).default(0),
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

export const adminUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => planInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { id, ...rest } = data;
    const payload = rest as unknown as Record<string, unknown>;
    if (id) {
      const { error } = await context.supabase.from("subscription_plans").update(payload as any).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: row, error } = await context.supabase.from("subscription_plans").insert(payload as any).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const adminDeletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("subscription_plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string } = {}) =>
    z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).default("pending") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("subscription_payments")
      .select("*, plan:subscription_plans(name,slug,badge), user:profiles!subscription_payments_user_id_fkey(id,username,avatar_url,avatar_color)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminApprovePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paymentId: string; note?: string }) =>
    z.object({ paymentId: z.string().uuid(), note: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: pay, error: pErr } = await context.supabase
      .from("subscription_payments")
      .select("id,user_id,plan_id,billing_cycle,status")
      .eq("id", data.paymentId)
      .single();
    if (pErr || !pay) throw new Error("Payment not found");
    if (pay.status !== "pending") throw new Error(`Payment already ${pay.status}`);

    const now = new Date();
    const expiry = new Date(now);
    if (pay.billing_cycle === "yearly") expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);

    const { error: upErr } = await context.supabase.from("subscription_payments").update({
      status: "approved",
      approved_by: context.userId,
      approved_at: now.toISOString(),
      admin_note: data.note ?? null,
    }).eq("id", data.paymentId);
    if (upErr) throw new Error(upErr.message);

    const { error: subErr } = await context.supabase.from("user_subscriptions").upsert({
      user_id: pay.user_id,
      plan_id: pay.plan_id,
      status: "active",
      billing_cycle: pay.billing_cycle,
      start_date: now.toISOString(),
      expiry_date: expiry.toISOString(),
      last_payment_id: pay.id,
    }, { onConflict: "user_id" });
    if (subErr) throw new Error(subErr.message);

    return { ok: true };
  });

export const adminRejectPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paymentId: string; note?: string }) =>
    z.object({ paymentId: z.string().uuid(), note: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("subscription_payments")
      .update({
        status: "rejected",
        approved_by: context.userId,
        approved_at: new Date().toISOString(),
        admin_note: data.note ?? null,
      })
      .eq("id", data.paymentId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);

    // Roll back pending subscription
    await context.supabase
      .from("user_subscriptions")
      .update({ status: "free" })
      .eq("last_payment_id", data.paymentId);

    return { ok: true };
  });

export const adminSetSubscriptionMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mode: "off" | "optional" | "required"; payment_instructions?: string; default_currency?: string; default_currency_symbol?: string }) =>
    z.object({
      mode: z.enum(["off", "optional", "required"]),
      payment_instructions: z.string().max(2000).optional(),
      default_currency: z.string().length(3).optional(),
      default_currency_symbol: z.string().max(4).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: existing } = await context.supabase
      .from("app_settings").select("value").eq("key", "subscription").maybeSingle();
    const current = (existing?.value as Record<string, unknown>) || {};
    const next = { ...current, ...data };
    await context.supabase.from("app_settings").upsert({ key: "subscription", value: next }, { onConflict: "key" });
    return { ok: true, value: next };
  });

export const adminSubscriptionStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ count: total }, { count: active }, { count: expired }, { count: pending }] = await Promise.all([
      context.supabase.from("user_subscriptions").select("*", { count: "exact", head: true }),
      context.supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      context.supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "expired"),
      context.supabase.from("subscription_payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    const since = new Date(); since.setDate(since.getDate() - 30);
    const { data: revRows } = await context.supabase
      .from("subscription_payments")
      .select("amount,currency_code")
      .eq("status", "approved")
      .gte("approved_at", since.toISOString());
    const revenue: Record<string, number> = {};
    for (const r of revRows ?? []) revenue[r.currency_code] = (revenue[r.currency_code] ?? 0) + Number(r.amount);
    return { total: total ?? 0, active: active ?? 0, expired: expired ?? 0, pendingPayments: pending ?? 0, revenue30d: revenue };
  });
