import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { slugifyPageSlug } from "@/lib/page-slug";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

const listOpts = z.object({
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(50),
  activeOnly: z.boolean().optional(),
});

function paginate<T>(rows: T[], page: number, pageSize: number, total: number) {
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

const countrySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  iso_code: z.string().max(8).nullable().optional(),
  language: z.string().max(16).optional(),
  is_active: z.boolean().optional(),
  seo_enabled: z.boolean().optional(),
  hub_page_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
});

const stateSchema = z.object({
  id: z.string().uuid().optional(),
  country_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  language: z.string().max(16).optional(),
  is_active: z.boolean().optional(),
  seo_enabled: z.boolean().optional(),
  hub_page_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
});

const citySchema = z.object({
  id: z.string().uuid().optional(),
  country_id: z.string().uuid(),
  state_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  alt_names: z.array(z.string().max(80)).max(40).optional(),
  population: z.number().int().nullable().optional(),
  seo_priority: z.number().int().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
  seo_enabled: z.boolean().optional(),
  hub_page_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
});

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
  seo_enabled: z.boolean().optional(),
  hub_page_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
});

const keywordGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  primary_pattern: z.string().max(200).optional(),
  secondary_patterns: z.array(z.string().max(200)).max(40).optional(),
  title_pattern: z.string().max(300).nullable().optional(),
  meta_title_pattern: z.string().max(300).nullable().optional(),
  meta_description_pattern: z.string().max(500).nullable().optional(),
  h1_pattern: z.string().max(300).nullable().optional(),
  slug_pattern: z.string().max(200).nullable().optional(),
  is_active: z.boolean().optional(),
});

const templateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  title_template: z.string().max(300).nullable().optional(),
  slug_template: z.string().max(200).nullable().optional(),
  intro_template: z.string().max(50_000).nullable().optional(),
  content_template: z.string().max(200_000).nullable().optional(),
  faq_template: z.any().nullable().optional(),
  cta_template: z.any().nullable().optional(),
  meta_title_template: z.string().max(300).nullable().optional(),
  meta_description_template: z.string().max(500).nullable().optional(),
  h1_template: z.string().max(300).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// ---- Countries ----
export const listPageCountries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => listOpts.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_countries")
      .select("*", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageCountry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => countrySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      name: data.name,
      slug,
      iso_code: data.iso_code ?? null,
      language: data.language ?? "en",
      is_active: data.is_active ?? true,
      seo_enabled: data.seo_enabled ?? true,
      hub_page_id: data.hub_page_id ?? null,
      sort_order: data.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_countries").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_countries").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

/** Soft-deactivate — prefer over hard delete to protect FKs on pages. */
export const deactivatePageCountry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_countries")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- States ----
export const listPageStates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) =>
    listOpts.extend({ country_id: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_states")
      .select("*", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.country_id) q = q.eq("country_id", data.country_id);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => stateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      country_id: data.country_id,
      name: data.name,
      slug,
      language: data.language ?? "en",
      is_active: data.is_active ?? true,
      seo_enabled: data.seo_enabled ?? true,
      hub_page_id: data.hub_page_id ?? null,
      sort_order: data.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_states").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_states").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deactivatePageState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_states")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Cities ----
export const listPageCities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) =>
    listOpts
      .extend({
        country_id: z.string().uuid().optional(),
        state_id: z.string().uuid().optional(),
        /** When true, include cities with null state_id under the country. */
        includeCountryLevel: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_cities")
      .select("*", { count: "exact" })
      .order("seo_priority", { ascending: false })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.country_id) q = q.eq("country_id", data.country_id);
    if (data.state_id) q = q.eq("state_id", data.state_id);
    else if (data.includeCountryLevel && data.country_id) q = q.is("state_id", null);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageCity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => citySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      country_id: data.country_id,
      state_id: data.state_id ?? null,
      name: data.name,
      slug,
      alt_names: data.alt_names ?? [],
      population: data.population ?? null,
      seo_priority: data.seo_priority ?? 5,
      is_active: data.is_active ?? true,
      seo_enabled: data.seo_enabled ?? true,
      hub_page_id: data.hub_page_id ?? null,
      sort_order: data.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_cities").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_cities").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deactivatePageCity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_cities")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Categories ----
export const listPageCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => listOpts.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_categories")
      .select("*", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => categorySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      parent_id: data.parent_id ?? null,
      name: data.name,
      slug,
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      seo_enabled: data.seo_enabled ?? true,
      hub_page_id: data.hub_page_id ?? null,
      sort_order: data.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_categories").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_categories").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deactivatePageCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_categories")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Keyword groups ----
export const listPageKeywordGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => listOpts.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_keyword_groups")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageKeywordGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => keywordGroupSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      name: data.name,
      slug,
      primary_pattern: data.primary_pattern ?? "{city} chat room",
      secondary_patterns: data.secondary_patterns ?? [],
      title_pattern: data.title_pattern ?? null,
      meta_title_pattern: data.meta_title_pattern ?? null,
      meta_description_pattern: data.meta_description_pattern ?? null,
      h1_pattern: data.h1_pattern ?? null,
      slug_pattern: data.slug_pattern ?? null,
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_keyword_groups").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_keyword_groups").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deactivatePageKeywordGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_keyword_groups")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Templates ----
export const listPageTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => listOpts.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("page_templates")
      .select("*", { count: "exact" })
      .order("is_default", { ascending: false })
      .order("name", { ascending: true })
      .range(from, to);
    if (data.activeOnly) q = q.eq("is_active", true);
    if (data.search) q = q.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return paginate(rows ?? [], data.page, data.pageSize, count ?? 0);
  });

export const savePageTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => templateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const row = {
      name: data.name,
      slug,
      description: data.description ?? null,
      title_template: data.title_template ?? null,
      slug_template: data.slug_template ?? null,
      intro_template: data.intro_template ?? null,
      content_template: data.content_template ?? null,
      faq_template: data.faq_template ?? null,
      cta_template: data.cta_template ?? null,
      meta_title_template: data.meta_title_template ?? null,
      meta_description_template: data.meta_description_template ?? null,
      h1_template: data.h1_template ?? null,
      is_default: data.is_default ?? false,
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    if (data.is_default) {
      await supabaseAdmin.from("page_templates").update({ is_default: false }).neq("id", data.id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_templates").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_templates").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deactivatePageTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("page_templates")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
