import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { findSlugConflicts } from "./slug-conflicts";
import {
  chunkArray,
  conflictLabelFromSources,
  DEFAULT_BULK_BATCH_SIZE,
  expandBulkPreviews,
  previewBulkRow,
  resolveBulkDuplicate,
  type BulkGenerateConfig,
  type BulkPreviewRow,
} from "./bulk-generate";
import { cmsPageStatusSchema, cmsPageTypeSchema } from "./schemas";
import { deriveContentStatus, computeSeoScore } from "./template-engine";
import type { DuplicateHandling } from "./types";
import { BULK_SAFE_SYNC_LIMIT } from "./dashboard.functions";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

const locationSchema = z.object({
  countryId: z.string().uuid(),
  countryName: z.string().min(1),
  countrySlug: z.string().min(1),
  stateId: z.string().uuid().nullable().optional(),
  stateName: z.string().nullable().optional(),
  stateSlug: z.string().nullable().optional(),
  cityId: z.string().uuid().nullable().optional(),
  cityName: z.string().nullable().optional(),
  citySlug: z.string().nullable().optional(),
});

const bulkConfigSchema = z.object({
  name: z.string().min(1).max(200).default("Bulk page generation"),
  page_type: cmsPageTypeSchema,
  brand: z.string().max(80).optional(),
  status: cmsPageStatusSchema.default("draft"),
  locations: z.array(locationSchema).min(1).max(500),
  category: z
    .object({ id: z.string().uuid(), name: z.string(), slug: z.string() })
    .nullable()
    .optional(),
  keywordGroup: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    primary_pattern: z.string(),
    title_pattern: z.string().nullable().optional(),
    meta_title_pattern: z.string().nullable().optional(),
    meta_description_pattern: z.string().nullable().optional(),
    h1_pattern: z.string().nullable().optional(),
    slug_pattern: z.string().nullable().optional(),
  }),
  template: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
      intro_template: z.string().nullable().optional(),
      content_template: z.string().nullable().optional(),
      meta_title_template: z.string().nullable().optional(),
      meta_description_template: z.string().nullable().optional(),
      h1_template: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  duplicateHandling: z
    .enum(["skip", "overwrite_metadata", "overwrite_template", "suffix"])
    .default("skip"),
  language: z.string().max(16).default("en"),
  noindex: z.boolean().default(false),
  batchSize: z.number().int().min(1).max(100).default(DEFAULT_BULK_BATCH_SIZE),
  /** Preview only — do not write. */
  dryRun: z.boolean().default(false),
  /** Required when overwrite touches existing published pages. */
  confirmOverwritePublished: z.boolean().default(false),
});

async function annotateDuplicates(
  config: BulkGenerateConfig,
  handling: DuplicateHandling,
): Promise<BulkPreviewRow[]> {
  const previews = expandBulkPreviews(config);
  const out: BulkPreviewRow[] = [];
  const usedSlugs = new Set<string>();

  for (const row of previews) {
    let slug = row.slug;
    let attempt = 0;
    let action: BulkPreviewRow["duplicateStatus"] = "ok";
    let existingId: string | undefined;
    let sourceLabels: string[] = [];

    while (attempt < 20) {
      const conflicts = await findSlugConflicts(supabaseAdmin, slug);
      const localTaken = usedSlugs.has(slug);
      if (!conflicts.length && !localTaken) {
        action = attempt === 0 ? "ok" : "suffix";
        sourceLabels = attempt === 0 ? [] : ["suffix"];
        break;
      }
      sourceLabels = localTaken
        ? ["custom_page"]
        : conflicts.map((c) => c.source);
      const resolved = resolveBulkDuplicate(
        handling,
        localTaken ? [{ source: "custom_page" }] : conflicts,
        row.slug,
        attempt + 1,
      );
      action = resolved.action;
      existingId = resolved.existingId;
      if (action === "skip" || action === "overwrite_metadata" || action === "overwrite_template") {
        slug = row.slug;
        break;
      }
      slug = resolved.slug;
      attempt++;
    }

    if (action !== "skip") usedSlugs.add(slug);
    out.push({
      ...row,
      slug,
      duplicateStatus: action,
      conflictLabel: conflictLabelFromSources(sourceLabels, action),
      existingId,
      conflictSlug: action !== "ok" ? row.slug : undefined,
    });
  }
  return out;
}

export const previewBulkPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => bulkConfigSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const config: BulkGenerateConfig = {
      page_type: data.page_type,
      brand: data.brand,
      status: data.status,
      locations: data.locations,
      category: data.category,
      keywordGroup: data.keywordGroup,
      template: data.template,
      duplicateHandling: data.duplicateHandling,
      language: data.language,
      noindex: data.noindex,
      batchSize: data.batchSize,
    };
    const rows = await annotateDuplicates(config, data.duplicateHandling);
    if (rows.length > BULK_SAFE_SYNC_LIMIT) {
      return {
        rows,
        summary: {
          total: rows.length,
          ok: rows.filter((r) => r.duplicateStatus === "ok" || r.duplicateStatus === "suffix").length,
          skip: rows.filter((r) => r.duplicateStatus === "skip").length,
          overwrite: rows.filter((r) =>
            r.duplicateStatus === "overwrite_metadata" || r.duplicateStatus === "overwrite_template"
          ).length,
        },
        blocked: true,
        safeLimit: BULK_SAFE_SYNC_LIMIT,
        blockReason:
          `This job exceeds the current safe synchronous batch limit (${BULK_SAFE_SYNC_LIMIT}). ` +
          "Generate in smaller batches or enable background job processing later.",
      };
    }
    return {
      rows,
      summary: {
        total: rows.length,
        ok: rows.filter((r) => r.duplicateStatus === "ok" || r.duplicateStatus === "suffix").length,
        skip: rows.filter((r) => r.duplicateStatus === "skip").length,
        overwrite: rows.filter((r) =>
          r.duplicateStatus === "overwrite_metadata" || r.duplicateStatus === "overwrite_template"
        ).length,
      },
      blocked: false,
      safeLimit: BULK_SAFE_SYNC_LIMIT,
      blockReason: null as string | null,
    };
  });

export const runBulkPageGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => bulkConfigSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.status === "published") {
      // Safety: bulk always defaults to draft unless explicitly draft/scheduled/archived
    }
    const status = data.status === "published" ? "draft" : data.status;

    const config: BulkGenerateConfig = {
      page_type: data.page_type,
      brand: data.brand,
      status,
      locations: data.locations,
      category: data.category,
      keywordGroup: data.keywordGroup,
      template: data.template,
      duplicateHandling: data.duplicateHandling,
      language: data.language,
      noindex: data.noindex,
      batchSize: data.batchSize,
    };

    const annotated = await annotateDuplicates(config, data.duplicateHandling);

    if (annotated.length > BULK_SAFE_SYNC_LIMIT) {
      throw new Error(
        `This job exceeds the current safe synchronous batch limit (${BULK_SAFE_SYNC_LIMIT}). ` +
          "Generate in smaller batches or enable background job processing later.",
      );
    }

    const overwriteIds = annotated
      .filter((r) =>
        (r.duplicateStatus === "overwrite_metadata" || r.duplicateStatus === "overwrite_template") &&
        r.existingId,
      )
      .map((r) => r.existingId!) ;
    if (overwriteIds.length && !data.dryRun) {
      const { data: publishedRows } = await supabaseAdmin
        .from("custom_pages")
        .select("id,status")
        .in("id", overwriteIds)
        .eq("status", "published");
      if ((publishedRows?.length ?? 0) > 0 && !data.confirmOverwritePublished) {
        throw new Error(
          "You are about to modify existing published pages. Existing URLs/content may be affected. " +
            "Set confirmOverwritePublished after explicit confirmation.",
        );
      }
    }

    if (data.dryRun) {
      return {
        ok: true,
        dryRun: true,
        jobId: null,
        preview: annotated,
        created: 0,
        updated: 0,
        skipped: annotated.filter((r) => r.duplicateStatus === "skip").length,
        failed: 0,
        errors: [] as { slug: string; error: string }[],
        safeLimit: BULK_SAFE_SYNC_LIMIT,
      };
    }

    const { data: job, error: jobErr } = await supabaseAdmin
      .from("page_bulk_jobs")
      .insert({
        name: data.name,
        status: "running",
        page_type: data.page_type,
        config: data as never,
        total_rows: annotated.length,
        created_by: context.userId,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (jobErr) throw new Error(jobErr.message);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: { slug: string; error: string }[] = [];

    const batches = chunkArray(annotated, data.batchSize);
    for (const batch of batches) {
      for (const row of batch) {
        if (row.duplicateStatus === "skip") {
          skipped++;
          continue;
        }
        try {
          const content_status = deriveContentStatus(row.content);
          const seo_score = computeSeoScore({
            meta_title: row.meta_title,
            meta_description: row.meta_description,
            h1: row.h1,
            primary_keyword: row.primary_keyword,
            content: row.content,
            noindex: data.noindex,
          });
          const payload = {
            slug: row.slug,
            title: row.title,
            content: row.content,
            status,
            page_type: row.page_type,
            country_id: row.country_id,
            state_id: row.state_id,
            city_id: row.city_id,
            category_id: row.category_id,
            keyword_group_id: row.keyword_group_id,
            template_id: row.template_id,
            h1: row.h1,
            primary_keyword: row.primary_keyword,
            secondary_keywords: [] as string[],
            language: data.language,
            intro_content: row.intro_content,
            meta_title: row.meta_title,
            meta_description: row.meta_description,
            noindex: data.noindex,
            content_status,
            seo_score,
            internal_link_count: 0,
            created_by: context.userId,
            updated_at: new Date().toISOString(),
            published_at: null as string | null,
          };

          if (
            (row.duplicateStatus === "overwrite_metadata" || row.duplicateStatus === "overwrite_template") &&
            row.existingId
          ) {
            const overwrite =
              row.duplicateStatus === "overwrite_template"
                ? payload
                : {
                    title: payload.title,
                    h1: payload.h1,
                    primary_keyword: payload.primary_keyword,
                    meta_title: payload.meta_title,
                    meta_description: payload.meta_description,
                    country_id: payload.country_id,
                    state_id: payload.state_id,
                    city_id: payload.city_id,
                    category_id: payload.category_id,
                    keyword_group_id: payload.keyword_group_id,
                    template_id: payload.template_id,
                    page_type: payload.page_type,
                    seo_score: payload.seo_score,
                    updated_at: payload.updated_at,
                  };
            const { error } = await supabaseAdmin
              .from("custom_pages")
              .update(overwrite as never)
              .eq("id", row.existingId);
            if (error) throw new Error(error.message);
            updated++;
          } else {
            // Re-check conflicts for suffix variants
            const conflicts = await findSlugConflicts(supabaseAdmin, row.slug);
            if (conflicts.length) {
              skipped++;
              continue;
            }
            const { error } = await supabaseAdmin.from("custom_pages").insert(payload as never);
            if (error) throw new Error(error.message);
            created++;
          }
        } catch (e) {
          failed++;
          errors.push({ slug: row.slug, error: e instanceof Error ? e.message : String(e) });
        }
      }
    }

    await supabaseAdmin
      .from("page_bulk_jobs")
      .update({
        status: failed && !created && !updated ? "failed" : "completed",
        created_count: created,
        updated_count: updated,
        skipped_count: skipped,
        error_count: failed,
        errors: errors.length ? errors : null,
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", job.id);

    return {
      ok: true,
      dryRun: false,
      jobId: job.id,
      preview: annotated,
      created,
      updated,
      skipped,
      failed,
      errors,
    };
  });

export const listBulkJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) =>
    z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, error, count } = await supabaseAdmin
      .from("page_bulk_jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return {
      rows: rows ?? [],
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / data.pageSize)),
    };
  });

/** Exported for unit tests — builds one preview without DB. */
export { previewBulkRow, expandBulkPreviews, resolveBulkDuplicate, chunkArray };
