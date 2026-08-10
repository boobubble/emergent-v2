import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isReservedSlug } from "@/lib/reserved-routes";
import { slugify, slugifyPageSlug, validatePageSlug, assertUniquePageSlug } from "@/lib/page-slug";
import { fetchPublishedPageBySlug, buildPublicCmsPageHtml } from "@/lib/fetch-published-page";
import { loadRelatedChatRoomsForPage } from "@/lib/pages-cms/related-chat-rooms";
import { withRateLimit } from "./rate-limit-middleware";
import { findSlugConflicts } from "@/lib/pages-cms/slug-conflicts";
import {
  applyCustomPagesListFilters,
  buildPaginatedResult,
  listSortAscending,
  parseListPagesQuery,
} from "@/lib/pages-cms/list-query";
import { pageSaveSchema, cmsPageStatusSchema, isPubliclyVisibleStatus } from "@/lib/pages-cms/schemas";
import { buildCustomPageWriteRow } from "@/lib/pages-cms/page-write";
import { resolveCmsSeoSource } from "@/lib/pages-cms/seo-source";
import { deriveContentStatus, computeSeoScore } from "@/lib/pages-cms/template-engine";
import { recalculateInternalLinkCount } from "@/lib/pages-cms/internal-links";
import { syncRelatedChatRoomsToInternalLinks } from "@/lib/pages-cms/related-chat-rooms-sync";
import { parseRelatedChatRoomsConfig } from "@/lib/pages-cms/related-chat-rooms-config";

export { slugify } from "@/lib/page-slug";
export { isPubliclyVisibleStatus };

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

const LIST_SELECT =
  "id,slug,title,excerpt,tags,status,featured,layout,sidebar_left,sidebar_right,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,noindex,nofollow,views,created_at,updated_at,published_at,page_type,country_id,state_id,city_id,category_id,keyword_group_id,template_id,h1,primary_keyword,secondary_keywords,language,content_status,seo_score,internal_link_count,scheduled_at";

// ===== Admin list (server-side pagination / filters / sort) =====
export const listPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => parseListPagesQuery(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();

    let countQ = sb.from("custom_pages").select("id", { count: "exact", head: true });
    countQ = applyCustomPagesListFilters(countQ as never, data) as typeof countQ;
    const { count, error: countErr } = await countQ;
    if (countErr) throw new Error(countErr.message);

    const total = count ?? 0;
    const pageSize = data.pageSize;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(data.page, totalPages);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = sb
      .from("custom_pages")
      .select(LIST_SELECT)
      .order(data.sortBy, { ascending: listSortAscending(data) })
      .range(from, to);
    q = applyCustomPagesListFilters(q as never, data) as typeof q;

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const hydrated = await hydratePageTaxonomyLabels(sb, rows ?? []);
    return buildPaginatedResult(hydrated, total, page, pageSize);
  });

type ListPageRow = {
  id: string;
  slug: string;
  title: string;
  [key: string]: string | number | boolean | null | string[] | undefined;
};

async function hydratePageTaxonomyLabels(
  sb: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  rows: ListPageRow[],
): Promise<ListPageRow[]> {
  if (!rows.length) return rows;
  const uniq = (key: string) =>
    [...new Set(rows.map((r) => r[key]).filter((v): v is string => typeof v === "string" && !!v))];

  const [countries, states, cities, categories, templates, keywordGroups] = await Promise.all([
    uniq("country_id").length
      ? sb.from("page_countries").select("id,name").in("id", uniq("country_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    uniq("state_id").length
      ? sb.from("page_states").select("id,name").in("id", uniq("state_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    uniq("city_id").length
      ? sb.from("page_cities").select("id,name").in("id", uniq("city_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    uniq("category_id").length
      ? sb.from("page_categories").select("id,name").in("id", uniq("category_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    uniq("template_id").length
      ? sb.from("page_templates").select("id,name").in("id", uniq("template_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    uniq("keyword_group_id").length
      ? sb.from("page_keyword_groups").select("id,name").in("id", uniq("keyword_group_id"))
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const map = (arr: { id: string; name: string }[] | null | undefined) =>
    new Map((arr ?? []).map((r) => [r.id, r.name]));

  const cMap = map(countries.data as { id: string; name: string }[] | null);
  const sMap = map(states.data as { id: string; name: string }[] | null);
  const cityMap = map(cities.data as { id: string; name: string }[] | null);
  const catMap = map(categories.data as { id: string; name: string }[] | null);
  const tMap = map(templates.data as { id: string; name: string }[] | null);
  const kgMap = map(keywordGroups.data as { id: string; name: string }[] | null);

  return rows.map((r) => ({
    ...r,
    country_name: r.country_id ? cMap.get(String(r.country_id)) ?? null : null,
    state_name: r.state_id ? sMap.get(String(r.state_id)) ?? null : null,
    city_name: r.city_id ? cityMap.get(String(r.city_id)) ?? null : null,
    category_name: r.category_id ? catMap.get(String(r.category_id)) ?? null : null,
    template_name: r.template_id ? tMap.get(String(r.template_id)) ?? null : null,
    keyword_group_name: r.keyword_group_id ? kgMap.get(String(r.keyword_group_id)) ?? null : null,
  }));
}
export const getPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await (await getSupabaseAdmin())
      .from("custom_pages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getPageSeoSource = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    const { data: page, error } = await sb.from("custom_pages").select(
      "id,slug,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,h1,template_id",
    ).eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!page) throw new Error("Page not found");

    const [{ data: seoSettings }, { data: global }, templateRes] = await Promise.all([
      sb.from("seo_settings").select("enabled,title,description,og_title,og_description,og_image,canonical_url")
        .eq("route_path", "/$slug").maybeSingle(),
      sb.from("seo_global").select("default_title,default_description,site_name").limit(1).maybeSingle(),
      page.template_id
        ? sb.from("page_templates").select("meta_title_template,meta_description_template,h1_template")
          .eq("id", page.template_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const resolved = resolveCmsSeoSource({
      page,
      seoSettings,
      template: templateRes.data,
      global,
    });

    return {
      pageId: page.id,
      slug: page.slug,
      ...resolved,
    };
  });

export const savePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => pageSaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugifyPageSlug(data.slug);
    const needsSlug = data.status === "published" || data.status === "scheduled";
    const reservedErr = validatePageSlug(slug, { required: needsSlug });
    if (reservedErr) throw new Error(reservedErr);
    if (needsSlug && !slug) {
      throw new Error("Slug is required before publishing or scheduling.");
    }

    const sb = await getSupabaseAdmin();
    let previousSlug: string | null = null;
    let previousPublishedAt: string | null = null;
    if (data.id) {
      const { data: prev } = await sb
        .from("custom_pages")
        .select("slug,published_at")
        .eq("id", data.id)
        .maybeSingle();
      previousSlug = prev?.slug ?? null;
      previousPublishedAt = prev?.published_at ?? null;
    }

    const conflicts = await findSlugConflicts(sb, slug, { excludeCustomPageId: data.id });
    if (conflicts.length) {
      throw new Error(conflicts.map((c) => c.message).join(" "));
    }

    const { data: existing } = await sb.from("custom_pages").select("id").eq("slug", slug).maybeSingle();
    assertUniquePageSlug(slug, existing, data.id);

    const { row, content_status, seo_score } = buildCustomPageWriteRow(data, {
      userId: context.userId,
      previousPublishedAt,
    });

    if (data.id) {
      const { error } = await sb.from("custom_pages").update(row as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      if (previousSlug && previousSlug !== slug) {
        await sb.from("page_redirects").upsert(
          { from_slug: previousSlug, to_slug: slug },
          { onConflict: "from_slug" },
        );
      }
      // Keep page_internal_links graph in sync with manual Related Chat Rooms picks.
      if (data.related_chat_rooms !== undefined) {
        await syncRelatedChatRoomsToInternalLinks(
          sb,
          data.id,
          parseRelatedChatRoomsConfig(data.related_chat_rooms),
          { sourceSlug: slug },
        );
      }
      await sb.from("page_history").insert({
        page_id: data.id,
        action: "update",
        snapshot: { slug, status: data.status, content_status, seo_score },
        changed_by: context.userId,
      } as never);
      return {
        ok: true,
        id: data.id,
        slug,
        previousSlug,
        slugChanged: previousSlug !== slug,
        content_status,
        seo_score,
      };
    }

    const { data: ins, error } = await sb
      .from("custom_pages")
      .insert({ ...row, internal_link_count: 0 } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (data.related_chat_rooms !== undefined) {
      await syncRelatedChatRoomsToInternalLinks(
        sb,
        ins.id,
        parseRelatedChatRoomsConfig(data.related_chat_rooms),
        { sourceSlug: slug },
      );
    }
    await sb.from("page_history").insert({
      page_id: ins.id,
      action: "create",
      snapshot: { slug, status: data.status, content_status, seo_score },
      changed_by: context.userId,
    } as never);
    return { ok: true, id: ins.id, slug, content_status, seo_score };
  });
export const deletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await (await getSupabaseAdmin()).from("custom_pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const syncPageInternalLinkCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ pageId: z.string().uuid(), refreshJsonCache: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const count = await recalculateInternalLinkCount(await getSupabaseAdmin(), data.pageId, {
      refreshJsonCache: data.refreshJsonCache ?? true,
    });
    return { ok: true, internal_link_count: count };
  });

export const listPageHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => z.object({ pageId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await (await getSupabaseAdmin())
      .from("page_history")
      .select("id,action,snapshot,changed_by,created_at")
      .eq("page_id", data.pageId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listPageInternalLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => z.object({ pageId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    const [{ data: outgoing }, { data: incoming }, { data: page }] = await Promise.all([
      sb.from("page_internal_links")
        .select("id,anchor_text,target_url,target_page_id,link_type,created_at")
        .eq("page_id", data.pageId)
        .order("created_at", { ascending: false })
        .limit(100),
      sb.from("page_internal_links")
        .select("id,anchor_text,target_url,page_id,link_type,created_at")
        .eq("target_page_id", data.pageId)
        .order("created_at", { ascending: false })
        .limit(100),
      sb.from("custom_pages").select("internal_link_count,internal_links_json").eq("id", data.pageId).maybeSingle(),
    ]);
    return {
      outgoing: outgoing ?? [],
      incoming: incoming ?? [],
      internal_link_count: page?.internal_link_count ?? 0,
      /** Cache only — not editable. */
      internal_links_json: page?.internal_links_json ?? null,
    };
  });

/** Published + indexable Custom Pages for Related Chat Rooms target picker. */
export const listRelatedChatRoomTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) =>
    z.object({
      excludePageId: z.string().uuid().optional(),
      q: z.string().max(80).optional(),
      limit: z.number().int().min(1).max(200).default(100),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    let q = sb
      .from("custom_pages")
      .select("id,slug,title,h1,page_type,country_id")
      .eq("status", "published")
      .eq("noindex", false)
      .order("title", { ascending: true })
      .limit(data.limit);
    if (data.excludePageId) q = q.neq("id", data.excludePageId);
    const term = data.q?.trim();
    if (term) {
      const safe = term.replace(/[%_,]/g, "");
      if (safe) q = q.or(`title.ilike.%${safe}%,slug.ilike.%${safe}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      h1: r.h1,
      page_type: r.page_type,
      country_id: r.country_id,
      href: `/${r.slug}`,
    }));
  });

// ===== Import / Export =====
export const exportPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ ids: z.array(z.string().uuid()).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    let q = sb.from("custom_pages").select("*").order("created_at");
    if (data.ids && data.ids.length) q = q.in("id", data.ids);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Enrich with human-readable taxonomy names for export
    const countryIds = [...new Set((rows ?? []).map((r) => r.country_id).filter(Boolean))] as string[];
    const stateIds = [...new Set((rows ?? []).map((r) => r.state_id).filter(Boolean))] as string[];
    const cityIds = [...new Set((rows ?? []).map((r) => r.city_id).filter(Boolean))] as string[];
    const categoryIds = [...new Set((rows ?? []).map((r) => r.category_id).filter(Boolean))] as string[];
    const templateIds = [...new Set((rows ?? []).map((r) => r.template_id).filter(Boolean))] as string[];

    const [countries, states, cities, categories, templates] = await Promise.all([
      countryIds.length
        ? sb.from("page_countries").select("id,name,slug").in("id", countryIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
      stateIds.length
        ? sb.from("page_states").select("id,name,slug").in("id", stateIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
      cityIds.length
        ? sb.from("page_cities").select("id,name,slug").in("id", cityIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
      categoryIds.length
        ? sb.from("page_categories").select("id,name,slug").in("id", categoryIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
      templateIds.length
        ? sb.from("page_templates").select("id,name,slug").in("id", templateIds)
        : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
    ]);

    const mapById = (list: { id: string; name: string; slug: string }[] | null | undefined) =>
      new Map((list ?? []).map((x) => [x.id, x]));

    const cMap = mapById(countries.data);
    const sMap = mapById(states.data);
    const cityMap = mapById(cities.data);
    const catMap = mapById(categories.data);
    const tMap = mapById(templates.data);

    return (rows ?? []).map((r) => ({
      ...r,
      country: r.country_id ? cMap.get(r.country_id)?.slug ?? null : null,
      state: r.state_id ? sMap.get(r.state_id)?.slug ?? null : null,
      city: r.city_id ? cityMap.get(r.city_id)?.slug ?? null : null,
      category: r.category_id ? catMap.get(r.category_id)?.slug ?? null : null,
      template: r.template_id ? tMap.get(r.template_id)?.slug ?? null : null,
    }));
  });

const importPageSchema = pageSaveSchema.omit({ id: true }).extend({
  country: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  template: z.string().max(120).optional(),
});

export const importPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({
      pages: z.array(importPageSchema).min(1).max(200),
      mode: z.enum(["skip", "overwrite"]).default("skip"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    let imported = 0, skipped = 0, overwritten = 0;

    for (const p of data.pages) {
      const slug = slugifyPageSlug(p.slug);
      if (isReservedSlug(slug) || !slug) { skipped++; continue; }

      const conflicts = await findSlugConflicts(sb, slug);
      const pageConflict = conflicts.find((c) => c.source === "custom_page");
      const reservedOrRedirect = conflicts.some((c) => c.source === "reserved" || c.source === "redirect");
      if (reservedOrRedirect && !pageConflict) { skipped++; continue; }

      // Resolve human-readable taxonomy slugs → ids when provided
      let country_id = p.country_id ?? null;
      let state_id = p.state_id ?? null;
      let city_id = p.city_id ?? null;
      let category_id = p.category_id ?? null;
      let template_id = p.template_id ?? null;

      if (p.country && !country_id) {
        const { data: c } = await sb.from("page_countries").select("id").eq("slug", p.country).maybeSingle();
        country_id = c?.id ?? null;
      }
      if (p.state && !state_id && country_id) {
        const { data: s } = await sb.from("page_states").select("id").eq("country_id", country_id).eq("slug", p.state).maybeSingle();
        state_id = s?.id ?? null;
      }
      if (p.city && !city_id && country_id) {
        const { data: city } = await sb.from("page_cities").select("id").eq("country_id", country_id).eq("slug", p.city).maybeSingle();
        city_id = city?.id ?? null;
      }
      if (p.category && !category_id) {
        const { data: cat } = await sb.from("page_categories").select("id").eq("slug", p.category).maybeSingle();
        category_id = cat?.id ?? null;
      }
      if (p.template && !template_id) {
        const { data: tpl } = await sb.from("page_templates").select("id").eq("slug", p.template).maybeSingle();
        template_id = tpl?.id ?? null;
      }

      const { row } = buildCustomPageWriteRow(
        {
          ...p,
          slug,
          country_id,
          state_id,
          city_id,
          category_id,
          template_id,
          page_type: p.page_type ?? "static",
        },
        { userId: context.userId },
      );

      if (pageConflict?.existingId) {
        if (data.mode === "skip") { skipped++; continue; }
        await sb.from("custom_pages").update(row as never).eq("id", pageConflict.existingId);
        overwritten++;
      } else {
        await sb.from("custom_pages").insert({ ...row, internal_link_count: 0 } as never);
        imported++;
      }
    }
    return { imported, skipped, overwritten };
  });

// ===== Public read (for /$slug route) =====
export const getPublishedPage = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sb = await getSupabaseAdmin();
    const page = await fetchPublishedPageBySlug(sb, data.slug);
    if (!page) return null;
    const [publicHtml, relatedChatRooms] = await Promise.all([
      buildPublicCmsPageHtml(sb, page),
      loadRelatedChatRoomsForPage(sb, page),
    ]);
    return { ...page, publicHtml, relatedChatRooms };
  });

export const listPublishedPages = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({
    featured: z.boolean().optional(),
    limit: z.number().min(1).max(50).default(20),
  }).parse(input ?? {}))
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("custom_pages")
      .select("slug,title,excerpt,tags,og_image,views,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.featured) q = q.eq("featured", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ===== Redirects =====
export const listRedirects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await (await getSupabaseAdmin()).from("page_redirects").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({
    from_slug: z.string().min(1).max(120),
    to_slug: z.string().min(1).max(120),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = slugify(data.from_slug);
    const to = slugify(data.to_slug);
    if (isReservedSlug(from) || isReservedSlug(to)) {
      throw new Error("Reserved slug cannot be used in redirects.");
    }

    if (from === to) throw new Error("from and to slugs must differ");
    const { error } = await (await getSupabaseAdmin()).from("page_redirects").upsert(
      { from_slug: from, to_slug: to },
      { onConflict: "from_slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await (await getSupabaseAdmin()).from("page_redirects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Re-export helpers used by tests / Phase 3
export { deriveContentStatus, computeSeoScore, cmsPageStatusSchema };
