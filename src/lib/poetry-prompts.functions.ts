/**
 * Poetry Hub — daily writing prompts. Public reads for the active prompt;
 * admin CRUD gated by the `admin` role via RLS (SECURITY DEFINER not needed).
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export interface PoetryPrompt {
  id: string;
  title: string;
  body: string | null;
  category_id: string | null;
  scheduled_for: string | null;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
  created_at: string;
}

/** The prompt shown on the Poetry Hub hero right now. */
export const getTodayPrompt = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const todayIso = new Date().toISOString();
  const today = todayIso.slice(0, 10);

  // 1. active_from/active_until window
  const win = await (sb.from as any)("poetry_prompts")
    .select("*").eq("is_active", true)
    .lte("active_from", todayIso).gte("active_until", todayIso)
    .order("active_from", { ascending: false }).limit(1).maybeSingle();
  if (win.data) return win.data as PoetryPrompt;

  // 2. scheduled_for == today
  const day = await (sb.from as any)("poetry_prompts")
    .select("*").eq("is_active", true).eq("scheduled_for", today)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (day.data) return day.data as PoetryPrompt;

  // 3. latest unscheduled active
  const latest = await (sb.from as any)("poetry_prompts")
    .select("*").eq("is_active", true).is("scheduled_for", null).is("active_from", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (latest.data as PoetryPrompt | null) ?? null;
});

export const getPromptById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await (sb.from as any)("poetry_prompts")
      .select("*").eq("id", data.id).eq("is_active", true).maybeSingle();
    return (row as PoetryPrompt | null) ?? null;
  });

// -------- Admin CRUD (RLS enforces has_role(admin)) -------------------------

export const listPromptsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase.from as any)("poetry_prompts")
      .select("*").order("scheduled_for", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PoetryPrompt[];
  });

export const upsertPromptAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string; title: string; body?: string | null; categoryId?: string | null;
    scheduledFor?: string | null; activeFrom?: string | null; activeUntil?: string | null; isActive?: boolean;
  }) => {
    if (!input.title?.trim()) throw new Error("Title is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const row = {
      title: data.title.trim(),
      body: data.body ?? null,
      category_id: data.categoryId ?? null,
      scheduled_for: data.scheduledFor ?? null,
      active_from: data.activeFrom ?? null,
      active_until: data.activeUntil ?? null,
      is_active: data.isActive ?? true,
      created_by: context.userId,
    };
    if (data.id) {
      const { data: up, error } = await (context.supabase.from as any)("poetry_prompts")
        .update(row).eq("id", data.id).select("*").single();
      if (error) throw error;
      return up as PoetryPrompt;
    }
    const { data: ins, error } = await (context.supabase.from as any)("poetry_prompts")
      .insert(row).select("*").single();
    if (error) throw error;
    return ins as PoetryPrompt;
  });

export const deletePromptAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase.from as any)("poetry_prompts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const togglePromptAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; isActive: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase.from as any)("poetry_prompts")
      .update({ is_active: data.isActive }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
