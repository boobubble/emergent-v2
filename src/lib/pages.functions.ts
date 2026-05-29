import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isReservedSlug } from "@/lib/reserved-routes";


async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "page";
}

const LAYOUTS = ["full", "boxed"] as const;
const SIDEBARS = ["none", "ads", "feed"] as const;

const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  content: z.string().max(200_000).default(""),
  excerpt: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  layout: z.enum(LAYOUTS).default("boxed"),
  sidebar_left: z.enum(SIDEBARS).default("none"),
  sidebar_right: z.enum(SIDEBARS).default("none"),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  meta_keywords: z.string().max(500).nullable().optional(),
  og_title: z.string().max(200).nullable().optional(),
  og_description: z.string().max(400).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
  canonical_url: z.string().max(500).nullable().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  overwrite: z.boolean().optional(),
});

// ===== Admin =====
export const listPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ q: z.string().max(100).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin.from("custom_pages").select("*").order("updated_at", { ascending: false }).limit(200);
    if (data.q) q = q.ilike("title", `%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("custom_pages").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const savePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => pageSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const slug = slugify(data.slug);
    if (isReservedSlug(slug)) {
      throw new Error(`Slug "${slug}" is reserved by the platform. Choose another.`);
    }

    const { data: existing } = await supabaseAdmin
      .from("custom_pages").select("id").eq("slug", slug).maybeSingle();
    if (existing && existing.id !== data.id) {
      if (!data.overwrite) {
        throw new Error(`Slug "${slug}" already in use. Rename it or enable overwrite.`);
      }
      // overwrite path -> delete the existing page so we can update this one's slug
      await supabaseAdmin.from("custom_pages").delete().eq("id", existing.id);
    }

    const row = {
      slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt ?? null,
      tags: data.tags ?? [],
      status: data.status,
      featured: data.featured,
      layout: data.layout,
      sidebar_left: data.sidebar_left,
      sidebar_right: data.sidebar_right,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      meta_keywords: data.meta_keywords ?? null,
      og_title: data.og_title ?? null,
      og_description: data.og_description ?? null,
      og_image: data.og_image ?? null,
      canonical_url: data.canonical_url ?? null,
      noindex: data.noindex,
      nofollow: data.nofollow,
      updated_at: new Date().toISOString(),
      published_at: data.status === "published" ? new Date().toISOString() : null,
      created_by: context.userId,
    };

    if (data.id) {
      const { error } = await supabaseAdmin.from("custom_pages").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id, slug };
    }
    const { data: ins, error } = await supabaseAdmin.from("custom_pages").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id, slug };
  });

export const deletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("custom_pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Import / Export =====
export const exportPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ ids: z.array(z.string().uuid()).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin.from("custom_pages").select("*").order("created_at");
    if (data.ids && data.ids.length) q = q.in("id", data.ids);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const importPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      pages: z.array(pageSchema.omit({ id: true, overwrite: true })).min(1).max(200),
      mode: z.enum(["skip", "overwrite"]).default("skip"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let imported = 0, skipped = 0, overwritten = 0;
    for (const p of data.pages) {
      const slug = slugify(p.slug);
      if (isReservedSlug(slug)) { skipped++; continue; }

      const { data: existing } = await supabaseAdmin
        .from("custom_pages").select("id").eq("slug", slug).maybeSingle();
      const row = {
        ...p,
        slug,
        tags: p.tags ?? [],
        updated_at: new Date().toISOString(),
        created_by: context.userId,
      };
      if (existing) {
        if (data.mode === "skip") { skipped++; continue; }
        await supabaseAdmin.from("custom_pages").update(row).eq("id", existing.id);
        overwritten++;
      } else {
        await supabaseAdmin.from("custom_pages").insert(row);
        imported++;
      }
    }
    return { imported, skipped, overwritten };
  });

// ===== Public read (for /$slug route) =====
export const getPublishedPage = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const slug = slugify(data.slug);
    // Redirect lookup first
    const { data: redir } = await supabaseAdmin
      .from("page_redirects").select("to_slug").eq("from_slug", slug).maybeSingle();
    const finalSlug = redir?.to_slug ?? slug;
    const { data: row } = await supabaseAdmin
      .from("custom_pages")
      .select("slug,title,content,excerpt,tags,layout,sidebar_left,sidebar_right,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,canonical_url,noindex,nofollow,views,published_at")
      .eq("slug", finalSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!row) return null;
    // Fire-and-forget view bump
    void supabaseAdmin.rpc("bump_page_view", { _slug: finalSlug });
    return { ...row, redirectedFrom: redir ? slug : null };
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
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin.from("page_redirects").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
    const { error } = await supabaseAdmin.from("page_redirects").upsert(
      { from_slug: from, to_slug: to },
      { onConflict: "from_slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("page_redirects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
