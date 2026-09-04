import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { assertAdminUser, assertExistingContentEditor } from "@/lib/content-roles.server";

async function assertAdmin(userId: string) {
  await assertAdminUser(userId);
}

async function countPages(filter: Record<string, unknown> = {}) {
  let q = supabaseAdmin.from("custom_pages").select("id", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filter)) {
    if (v === null) q = q.is(k, null);
    else q = q.eq(k, v as never);
  }
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countOr(filters: string) {
  const { count, error } = await supabaseAdmin
    .from("custom_pages")
    .select("id", { count: "exact", head: true })
    .or(filters);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const getPagesDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const [
      total, published, draft, scheduled, archived,
      indexable, noindex,
      emptyContent, partialContent, completeContent,
      missingH1, missingMetaTitle, missingMetaDescription, missingPrimaryKeyword,
      missingInternalLinks, lowSeoScore,
      countries, states, cities, categories,
    ] = await Promise.all([
      countPages(),
      countPages({ status: "published" }),
      countPages({ status: "draft" }),
      countPages({ status: "scheduled" }),
      countPages({ status: "archived" }),
      countPages({ noindex: false }),
      countPages({ noindex: true }),
      countPages({ content_status: "empty" }),
      countPages({ content_status: "partial" }),
      countPages({ content_status: "complete" }),
      countOr("h1.is.null,h1.eq."),
      countOr("meta_title.is.null,meta_title.eq."),
      countOr("meta_description.is.null,meta_description.eq."),
      countOr("primary_keyword.is.null,primary_keyword.eq."),
      countPages({ internal_link_count: 0 }),
      // low SEO score: < 40
      (async () => {
        const { count, error } = await supabaseAdmin
          .from("custom_pages")
          .select("id", { count: "exact", head: true })
          .lt("seo_score", 40);
        if (error) throw new Error(error.message);
        return count ?? 0;
      })(),
      supabaseAdmin.from("page_countries").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("page_states").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("page_cities").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("page_categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const { data: countryRows } = await supabaseAdmin
      .from("page_countries")
      .select("id,name,slug")
      .eq("is_active", true)
      .order("sort_order");

    const countryCards = await Promise.all(
      (countryRows ?? []).map(async (c) => {
        const [
          totalPages, publishedPages, draftPages,
          citiesCovered, categoriesCovered,
          contentIssues, seoIssues,
        ] = await Promise.all([
          countPages({ country_id: c.id }),
          countPages({ country_id: c.id, status: "published" }),
          countPages({ country_id: c.id, status: "draft" }),
          (async () => {
            const { count, error } = await supabaseAdmin
              .from("custom_pages")
              .select("city_id", { count: "exact", head: true })
              .eq("country_id", c.id)
              .not("city_id", "is", null);
            if (error) throw new Error(error.message);
            return count ?? 0;
          })(),
          (async () => {
            const { count, error } = await supabaseAdmin
              .from("custom_pages")
              .select("category_id", { count: "exact", head: true })
              .eq("country_id", c.id)
              .not("category_id", "is", null);
            if (error) throw new Error(error.message);
            return count ?? 0;
          })(),
          (async () => {
            const { count, error } = await supabaseAdmin
              .from("custom_pages")
              .select("id", { count: "exact", head: true })
              .eq("country_id", c.id)
              .in("content_status", ["empty", "partial"]);
            if (error) throw new Error(error.message);
            return count ?? 0;
          })(),
          (async () => {
            const { count, error } = await supabaseAdmin
              .from("custom_pages")
              .select("id", { count: "exact", head: true })
              .eq("country_id", c.id)
              .or("h1.is.null,h1.eq.,meta_title.is.null,meta_title.eq.,primary_keyword.is.null,primary_keyword.eq.");
            if (error) throw new Error(error.message);
            return count ?? 0;
          })(),
        ]);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          totalPages,
          publishedPages,
          draftPages,
          citiesCovered,
          categoriesCovered,
          contentIssues,
          seoIssues,
        };
      }),
    );

    const { data: recentJobs } = await supabaseAdmin
      .from("page_bulk_jobs")
      .select("id,name,status,total_rows,created_count,updated_count,skipped_count,error_count,created_at,finished_at")
      .order("created_at", { ascending: false })
      .limit(8);

    return {
      totals: {
        total, published, draft, scheduled, archived,
        indexable, noindex,
        countries: countries.count ?? 0,
        states: states.count ?? 0,
        cities: cities.count ?? 0,
        categories: categories.count ?? 0,
      },
      content: { empty: emptyContent, partial: partialContent, complete: completeContent },
      seo: {
        missingH1, missingMetaTitle, missingMetaDescription, missingPrimaryKeyword,
        missingInternalLinks, lowSeoScore,
      },
      countryCards,
      recentJobs: recentJobs ?? [],
    };
  });

const savedFilterSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  filter_json: z.record(z.string(), z.any()).default({}),
  is_shared: z.boolean().default(true),
});

export const listSavedPageFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertExistingContentEditor(context.userId);
    const { data, error } = await supabaseAdmin
      .from("page_saved_filters")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveSavedPageFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => savedFilterSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const row = {
      name: data.name,
      filter_json: data.filter_json,
      is_shared: data.is_shared,
      created_by: context.userId,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("page_saved_filters").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("page_saved_filters").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deleteSavedPageFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("page_saved_filters").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Safe synchronous bulk generation limit for Phase 3 UI. */
export const BULK_SAFE_SYNC_LIMIT = 500;
