import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { assertAdminUser } from "@/lib/content-roles.server";
import { db, getAutomationSettings } from "@/lib/content-automation/db";
import { listCannibalizationWarnings } from "@/lib/content-automation/cannibalization";
import { listInventory, syncPublishedInventory } from "@/lib/content-automation/content-inventory";
import { listRecentJobs, remainingPublishSlots } from "@/lib/content-automation/job-lock";
import { executeSeoJobRetry } from "@/lib/content-automation/seo-job-retry";
import { listKeywordTargets, parseKeywordCsv, updateKeywordTarget, upsertKeywordTargets } from "@/lib/content-automation/keyword-targets";
import {
  previewIdeaResearch,
  previewResearchPaste,
  researchDashboard,
  saveIdeaResearch,
  saveResearchPaste,
  sendIdeaToGeneration,
} from "@/lib/content-automation/research-save";
import { attachPexelsImage, listPexelsImages } from "@/lib/content-automation/pexels-images";
import { listRefreshReports, migrateExistingBatch, refreshOneItem } from "@/lib/content-automation/seo-refresh";
import { getVersion, listRecentVersions, listVersions, restoreVersion } from "@/lib/content-automation/versioning";

async function assertAdmin(userId: string) {
  await assertAdminUser(userId);
}

export const getSeoEngineOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const settings = await getAutomationSettings();
    const quota = await remainingPublishSlots(settings);
    const today = quota.date;
    const start = `${today}T00:00:00.000Z`;
    const end = `${today}T23:59:59.999Z`;

    const count = async (table: string, filters: Record<string, unknown> = {}) => {
      let q = db().from(table).select("id", { count: "exact", head: true });
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      const { count: n } = await q;
      return n ?? 0;
    };

    const [
      blogsToday,
      pagesToday,
      dueRefresh,
      refreshedToday,
      failedJobs,
      imageFailures,
      pendingKeywords,
      cannibalOpen,
      inventoryTotal,
      migrationPending,
    ] = await Promise.all([
      db().from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published").gte("published_at", start).lte("published_at", end).then((r) => r.count ?? 0),
      db().from("custom_pages").select("id", { count: "exact", head: true }).eq("status", "published").gte("published_at", start).lte("published_at", end).then((r) => r.count ?? 0),
      db().from("seo_content_inventory").select("id", { count: "exact", head: true }).eq("status", "published").lte("next_refresh_at", new Date().toISOString()).then((r) => r.count ?? 0),
      db().from("seo_refresh_reports").select("id", { count: "exact", head: true }).gte("created_at", start).then((r) => r.count ?? 0),
      count("seo_content_jobs", { status: "failed" }),
      count("seo_pexels_images", { status: "failed" }),
      count("seo_keyword_targets", { status: "pending" }),
      count("seo_cannibalization_warnings", { status: "open" }),
      count("seo_content_inventory"),
      count("seo_content_inventory", { migration_status: "pending" }),
    ]);

    const research = await researchDashboard();
    return {
      settings,
      quota,
      blogsToday,
      pagesToday,
      totalToday: blogsToday + pagesToday,
      dueRefresh,
      refreshedToday,
      failedJobs,
      imageFailures,
      pendingKeywords,
      cannibalOpen,
      inventoryTotal,
      migrationPending,
      keywordClusters: research.keywordClusters,
      totalKeywords: research.totalKeywords,
      keywordsUsed: research.keywordsUsed,
      keywordsUnused: research.keywordsUnused,
      pendingContent: research.pendingContent,
    };
  });

export const listSeoEngineData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator(z.object({
    view: z.enum(["keywords", "jobs", "images", "versions", "refresh", "cannibalization", "inventory"]),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    switch (data.view) {
      case "keywords":
        return { keywords: await listKeywordTargets() };
      case "jobs":
        return { jobs: await listRecentJobs() };
      case "images":
        return { images: await listPexelsImages() };
      case "versions":
        return { versions: await listRecentVersions() };
      case "refresh":
        return { reports: await listRefreshReports() };
      case "cannibalization":
        return { warnings: await listCannibalizationWarnings() };
      case "inventory":
        return { inventory: await listInventory() };
      default:
        return {};
    }
  });

export const importKeywordCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({ csv: z.string().min(3).max(500_000) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const parsed = parseKeywordCsv(data.csv);
    const { upserted } = await upsertKeywordTargets(parsed.rows);
    return { upserted, parsed: parsed.rows.length, errors: parsed.errors };
  });

export const patchKeywordTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({
    id: z.string().uuid(),
    status: z.string().optional(),
    target_url: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return updateKeywordTarget(data.id, {
      status: data.status,
      target_url: data.target_url,
      notes: data.notes,
    });
  });

export const retrySeoJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({ jobId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return executeSeoJobRetry(data.jobId);
  });

export const retryPexelsImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({
    contentType: z.enum(["blog", "page"]),
    sourceId: z.string(),
    topic: z.string(),
    html: z.string().optional(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const table = data.contentType === "blog" ? "blog_posts" : "custom_pages";
    const live = await db().from(table).select("id, content, title").eq("id", data.sourceId).maybeSingle();
    if (!live.data) throw new Error("Content not found");
    const result = await attachPexelsImage({
      html: data.html || live.data.content || "",
      topic: data.topic || live.data.title,
      contentType: data.contentType,
      sourceId: data.sourceId,
    });
    if (result.ok) {
      const patch: Record<string, unknown> = { content: result.html };
      if (data.contentType === "page" && result.ogImage) patch.og_image = result.ogImage;
      await db().from(table).update(patch).eq("id", data.sourceId);
    }
    return result;
  });

export const restoreSeoVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({ versionId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const settings = await getAutomationSettings();
    return restoreVersion(data.versionId, settings.max_versions);
  });

export const getSeoVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator(z.object({
    versionId: z.string().uuid().optional(),
    contentType: z.enum(["blog", "page"]).optional(),
    sourceId: z.string().optional(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.versionId) return { version: await getVersion(data.versionId) };
    if (data.contentType && data.sourceId) return { versions: await listVersions(data.contentType, data.sourceId) };
    return { versions: await listRecentVersions() };
  });

export const runSeoRefreshNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({
    contentType: z.enum(["blog", "page"]),
    sourceId: z.string(),
    dryRun: z.boolean().optional(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return refreshOneItem(data.contentType, data.sourceId, { dryRun: data.dryRun });
  });

export const runSeoMigrationBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({
    limit: z.number().int().min(1).max(20).optional(),
    dryRun: z.boolean().optional(),
    syncFirst: z.boolean().optional(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.syncFirst !== false) await syncPublishedInventory((await getAutomationSettings()).refresh_interval_days);
    return migrateExistingBatch(data.limit ?? 5, data.dryRun ?? false);
  });

const researchPasteSchema = z.object({
  clusterText: z.string().max(500_000).optional(),
  ideasText: z.string().max(500_000).optional(),
  extraText: z.string().max(200_000).optional(),
});

const ideaResearchSchema = researchPasteSchema.extend({
  ideaType: z.enum(["blog", "page"]),
  ideaId: z.number().int().positive(),
});

export const previewKeywordResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(researchPasteSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return previewResearchPaste(data);
  });

export const saveKeywordResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(researchPasteSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const hasText = Boolean(data.clusterText?.trim() || data.ideasText?.trim() || data.extraText?.trim());
    if (!hasText) throw new Error("Paste keyword research before saving.");
    return saveResearchPaste(data);
  });

export const previewIdeaKeywordResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(ideaResearchSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return previewIdeaResearch(data);
  });

export const saveIdeaKeywordResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(ideaResearchSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const hasText = Boolean(data.clusterText?.trim() || data.ideasText?.trim() || data.extraText?.trim());
    if (!hasText) throw new Error("Paste keyword research before saving.");
    return saveIdeaResearch(data);
  });

export const sendIdeaToContentGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator(z.object({
    ideaType: z.enum(["blog", "page"]),
    ideaId: z.number().int().positive(),
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return sendIdeaToGeneration(data);
  });

export const getKeywordResearchMeta = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return researchDashboard();
  });

export const syncSeoInventoryNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const settings = await getAutomationSettings();
    return syncPublishedInventory(settings.refresh_interval_days);
  });
