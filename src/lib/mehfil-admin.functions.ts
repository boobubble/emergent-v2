/**
 * Mehfil admin server functions — categories CRUD, poem moderation, settings.
 * All operations require an admin role. Reuses existing `app_settings` store.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MEHFIL_SETTINGS_DEFAULTS, type MehfilSettings, type MehfilCategory, type MehfilPoem } from "./mehfil-types";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

// -------- Categories --------

export const adminListMehfilCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("mehfil_categories").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as MehfilCategory[];
  });

export const adminSaveMehfilCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<MehfilCategory> & { name: string; slug: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    };
    if (data.id) {
      const { error } = await context.supabase.from("mehfil_categories").update(row).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("mehfil_categories").insert(row);
      if (error) throw error;
    }
    return { ok: true };
  });

export const adminDeleteMehfilCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("mehfil_categories").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// -------- Poems moderation --------

export const adminListMehfilPoems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string; search?: string; limit?: number } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase.from("mehfil_poems").select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 100, 200));
    if (data.status) q = q.eq("status", data.status);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw error;
    return (rows ?? []) as MehfilPoem[];
  });

export const adminUpdatePoem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; patch: Partial<Pick<MehfilPoem, "status" | "is_featured" | "is_editors_pick">> }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("mehfil_poems").update(data.patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeletePoem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("mehfil_poems").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// -------- Settings --------

const KEY = "mehfil_settings";

export const getMehfilSettings = createServerFn({ method: "GET" }).handler(async () => {
  // public read via publishable client
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await sb.from("app_settings").select("value").eq("key", KEY).maybeSingle();
  const raw = (data as { value?: unknown } | null)?.value ?? {};
  return { ...MEHFIL_SETTINGS_DEFAULTS, ...(raw as object) } as MehfilSettings;
});

export const adminSaveMehfilSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<MehfilSettings>) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const merged = { ...MEHFIL_SETTINGS_DEFAULTS, ...data };
    const { error } = await context.supabase.from("app_settings").upsert({ key: KEY, value: merged });
    if (error) throw error;
    return merged;
  });
