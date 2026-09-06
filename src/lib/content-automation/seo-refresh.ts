import Anthropic from "@anthropic-ai/sdk";
import { db, getAutomationSettings } from "@/lib/content-automation/db";
import { YAARZO_MASTER_SYSTEM_PROMPT } from "@/lib/content-automation/master-content-rules";
import { loadInventoryForCannibalization } from "@/lib/content-automation/cannibalization";
import { changePercent, countWordsFromHtml, hashContent, nextRefreshAt, upsertInventory } from "@/lib/content-automation/content-inventory";
import { claimRefreshJobRow, finishJob } from "@/lib/content-automation/job-lock";
import { attachPexelsImage, shouldReplaceExistingImage } from "@/lib/content-automation/pexels-images";
import { auditContentItem, formatRefreshReport } from "@/lib/content-automation/seo-audit";
import { snapshotContent } from "@/lib/content-automation/versioning";
import type { SeoContentType } from "@/lib/content-automation/seo-types";
import { applySanitizedLiveUpdate } from "@/lib/content-automation/publish-quality";
import { loadPublishedPipelineSlugs } from "@/lib/content-automation/seo-engine";
import {
  shouldEnforceBrokenLinkAbort,
  shouldOptimizeImageMarkup,
  shouldRunRefreshRewrite,
  shouldSnapshotVersions,
} from "@/lib/content-automation/seo-settings";

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

async function claimRefreshJob(kind: SeoContentType, sourceId: string, date: string) {
  return claimRefreshJobRow(kind, sourceId, date);
}

async function loadLiveItem(kind: SeoContentType, sourceId: string) {
  const table = kind === "blog" ? "blog_posts" : "custom_pages";
  const { data, error } = await db().from(table).select("*").eq("id", sourceId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function refreshOneItem(kind: SeoContentType, sourceId: string, opts?: { dryRun?: boolean; reuseJobId?: string }) {
  const settings = await getAutomationSettings();
  if (!settings.content_refresh_enabled) {
    if (opts?.reuseJobId) await finishJob(opts.reuseJobId, "skipped", { error: "Refresh disabled" });
    return { status: "skipped", reason: "Refresh disabled" };
  }
  const date = new Date().toISOString().slice(0, 10);
  let jobId = opts?.reuseJobId;
  if (!jobId) {
    const claimed = await claimRefreshJob(kind, sourceId, date);
    if (!claimed.ok) return { status: claimed.reason, reason: `Job ${claimed.reason}` };
    jobId = claimed.job.id as string;
  }
  const dryRun = opts?.dryRun ?? settings.dry_run_optimization;
  try {
    const row = await loadLiveItem(kind, sourceId);
    if (!row) {
      await finishJob(jobId, "skipped", { error: "Content not found" });
      return { status: "skipped", reason: "Content not found" };
    }
    const slug = String(row.slug);
    const html = String(row.content || "");
    const inventory = await loadInventoryForCannibalization();
    const audit = auditContentItem({
      contentType: kind,
      slug,
      title: row.title,
      h1: row.h1 ?? row.title,
      metaTitle: row.meta_title ?? row.title,
      metaDescription: row.meta_description,
      canonical: row.canonical_url ?? (kind === "blog" ? `https://yaarzo.com/blog/${slug}` : `https://yaarzo.com/${slug}`),
      content: html,
      keywords: row.keywords ?? row.primary_keyword,
      primaryKeyword: row.primary_keyword ?? null,
      faq: row.faq_content,
      schema: row.schema_jsonld,
      ogImage: row.og_image,
      inventory,
    });

    const beforeHash = hashContent(html, [row.title, row.meta_description || ""]);
    if (!audit.meaningful && settings.only_update_when_meaningful) {
      const report = formatRefreshReport({
        status: "No substantial update required",
        before: audit.wordCount,
        after: audit.wordCount,
        reason: "Content remains comprehensive, relevant and well-optimized.",
      });
      await saveReport({
        jobId,
        kind,
        sourceId,
        slug,
        status: dryRun ? "dry_run" : "no_update",
        report,
        before: audit.wordCount,
        after: audit.wordCount,
      });
      await db()
        .from(kind === "blog" ? "blog_posts" : "custom_pages")
        .update({ last_refreshed_at: new Date().toISOString() })
        .eq("id", sourceId);
      await upsertInventory({
        content_type: kind,
        source_id: sourceId,
        slug,
        canonical_url: kind === "blog" ? `https://yaarzo.com/blog/${slug}` : `https://yaarzo.com/${slug}`,
        last_refreshed_at: new Date().toISOString(),
        next_refresh_at: nextRefreshAt(new Date(), settings.refresh_interval_days),
        content_hash: beforeHash,
      });
      await finishJob(jobId, "completed", { result: { status: "no_update" } });
      return { status: "no_update", report };
    }

    if (!shouldRunRefreshRewrite(settings)) {
      const report = formatRefreshReport({
        status: "No substantial update required",
        before: audit.wordCount,
        after: audit.wordCount,
        reason: "Auto SEO optimization is off; published HTML was left unchanged.",
      });
      await saveReport({ jobId, kind, sourceId, slug, status: "no_update", report, before: audit.wordCount, after: audit.wordCount });
      await db()
        .from(kind === "blog" ? "blog_posts" : "custom_pages")
        .update({ last_refreshed_at: new Date().toISOString() })
        .eq("id", sourceId);
      await finishJob(jobId, "completed", { result: { status: "no_update", skipped: "auto_seo_optimization_off" } });
      return { status: "no_update", report };
    }

    if (dryRun) {
      const report = formatRefreshReport({
        status: "Dry run",
        before: audit.wordCount,
        reason: `Proposed: add ${audit.add.join(", ") || "nothing"}; improve ${audit.improve.join(", ") || "nothing"}. Published content was not changed.`,
        image: audit.imageAction === "retain" ? "Existing image retained" : "Image missing — would search Pexels",
      });
      await saveReport({ jobId, kind, sourceId, slug, status: "dry_run", report, before: audit.wordCount, after: audit.wordCount });
      await finishJob(jobId, "completed", { result: { status: "dry_run" } });
      return { status: "dry_run", report, audit };
    }

    if (shouldSnapshotVersions(settings)) {
      await snapshotContent({
        content_type: kind,
        source_id: sourceId,
        title: row.title,
        slug,
        canonical_url: kind === "blog" ? `https://yaarzo.com/blog/${slug}` : row.canonical_url,
        content: html,
        seo_info: {
          h1: row.h1,
          meta_title: row.meta_title,
          meta_description: row.meta_description,
        },
        change_reason: "intelligent_refresh",
        change_summary: audit.issues.map((i) => i.message).join("; ") || "Scheduled refresh",
        job_id: jobId,
      }, settings.max_versions);
    }

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: kind === "blog" ? 4500 : 3000,
      system: YAARZO_MASTER_SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Revise this published Yaarzo ${kind} using KEEP → IMPROVE → ADD → REMOVE.
Do not change the slug or URL. Do not rewrite from scratch. Do not pad to hit a word count.
Keep the existing <h1> out of the HTML body.
Only make meaningful improvements: ${audit.add.join(", ") || "none to add"}; ${audit.improve.join(", ") || "none required"}.
Preserve useful internal links and existing featured image markup unless it is broken.
Target about ${kind === "blog" ? "1,200–1,500" : "700–900"} words if the current draft is thin, otherwise keep a similar length.

Current title: ${row.title}
Primary keyword: ${audit.primaryKeyword}
Search intent: ${audit.intent}
Current HTML:
${html}

Return HTML only.`,
      }],
    });
    let nextHtml = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!nextHtml) throw new Error("Empty refresh output");

    const pct = changePercent(html, nextHtml);
    const afterHash = hashContent(nextHtml, [row.title, row.meta_description || ""]);
    if (afterHash === beforeHash || (settings.only_update_when_meaningful && pct < settings.minimum_content_change_percent && audit.issues.every((i) => i.severity !== "warning"))) {
      const report = formatRefreshReport({
        status: "No substantial update required",
        before: audit.wordCount,
        after: countWordsFromHtml(nextHtml),
        reason: "Proposed refresh did not produce a meaningful improvement.",
      });
      await saveReport({ jobId, kind, sourceId, slug, status: "no_update", report, before: audit.wordCount, after: countWordsFromHtml(nextHtml) });
      await db()
        .from(kind === "blog" ? "blog_posts" : "custom_pages")
        .update({ last_refreshed_at: new Date().toISOString() })
        .eq("id", sourceId);
      await finishJob(jobId, "completed", { result: { status: "no_update" } });
      return { status: "no_update", report };
    }

    let imageAction = "Existing image retained";
    if (settings.pexels_images_enabled && shouldReplaceExistingImage(nextHtml, row.og_image)) {
      const image = await attachPexelsImage({
        html: nextHtml,
        topic: row.title,
        primaryKeyword: audit.primaryKeyword,
        contentType: kind,
        sourceId,
        preferLandscape: settings.prefer_landscape_images,
        preventDuplicates: settings.image_duplicate_prevention,
        optimizeMarkup: shouldOptimizeImageMarkup(settings),
      });
      nextHtml = image.html;
      imageAction = image.ok ? `New Pexels photo ${image.photoId}` : `Image ${image.imageStatus}: ${image.error || ""}`;
    }

    const publishedSlugs = await loadPublishedPipelineSlugs();
    const sanitized = applySanitizedLiveUpdate(html, nextHtml, {
      slug,
      title: row.title,
      publishedSlugs,
      tags: Array.isArray(row.tags) ? row.tags : undefined,
      enforceBrokenLinks: shouldEnforceBrokenLinkAbort(settings),
    });
    if (!sanitized.wrote) {
      const report = formatRefreshReport({
        status: "No substantial update required",
        before: audit.wordCount,
        after: audit.wordCount,
        reason: `Refresh HTML failed quality/link sanitization and was not written: ${sanitized.blockReason}`,
      });
      await saveReport({ jobId, kind, sourceId, slug, status: "failed", report, before: audit.wordCount, after: audit.wordCount });
      await finishJob(jobId, "failed", { error: sanitized.blockReason, result: { status: "validation_failed" } });
      return { status: "failed", reason: sanitized.blockReason, report };
    }
    nextHtml = sanitized.content;

    const patch: Record<string, unknown> = {
      content: nextHtml,
      last_refreshed_at: new Date().toISOString(),
    };
    if (kind === "page" && row.canonical_url) patch.canonical_url = row.canonical_url;
    patch.slug = slug;

    const { error } = await db().from(kind === "blog" ? "blog_posts" : "custom_pages").update(patch).eq("id", sourceId);
    if (error) throw new Error(error.message);

    const after = countWordsFromHtml(nextHtml);
    const report = formatRefreshReport({
      status: "Updated",
      before: audit.wordCount,
      after,
      added: audit.add.length,
      improved: audit.improve.length,
      metadataUpdated: false,
      image: imageAction,
      reason: audit.issues.map((i) => i.message).join("; ") || "Meaningful topical or link improvements were available.",
    });
    await saveReport({ jobId, kind, sourceId, slug, status: "updated", report, before: audit.wordCount, after });
    await upsertInventory({
      content_type: kind,
      source_id: sourceId,
      slug,
      canonical_url: kind === "blog" ? `https://yaarzo.com/blog/${slug}` : `https://yaarzo.com/${slug}`,
      word_count: after,
      last_refreshed_at: new Date().toISOString(),
      last_optimized_at: new Date().toISOString(),
      next_refresh_at: nextRefreshAt(new Date(), settings.refresh_interval_days),
      content_hash: hashContent(nextHtml, [row.title]),
    });
    await finishJob(jobId, "completed", { result: { status: "updated" }, slug });
    return { status: "updated", report };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishJob(jobId, "failed", { error: message });
    return { status: "failed", reason: message };
  }
}

async function saveReport(input: {
  jobId: string;
  kind: SeoContentType;
  sourceId: string;
  slug: string;
  status: "updated" | "no_update" | "failed" | "dry_run";
  report: string;
  before?: number;
  after?: number;
}) {
  await db().from("seo_refresh_reports").insert({
    job_id: input.jobId,
    content_type: input.kind,
    source_id: input.sourceId,
    slug: input.slug,
    status: input.status,
    report_text: input.report,
    word_count_before: input.before ?? null,
    word_count_after: input.after ?? null,
  });
}

export async function runDueRefresh(kind: SeoContentType, limit = 1) {
  const settings = await getAutomationSettings();
  if (!settings.content_refresh_enabled) return { refreshed: 0, results: [] as unknown[] };
  const due = await db()
    .from("seo_content_inventory")
    .select("source_id, content_type")
    .eq("content_type", kind)
    .eq("status", "published")
    .lte("next_refresh_at", new Date().toISOString())
    .order("next_refresh_at", { ascending: true })
    .limit(limit);
  const rows = due.data ?? [];
  const results = [];
  for (const row of rows) {
    results.push(await refreshOneItem(kind, String(row.source_id)));
  }
  return { refreshed: results.filter((r) => r.status === "updated").length, results };
}

export async function listRefreshReports(limit = 30) {
  const { data, error } = await db()
    .from("seo_refresh_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function migrateExistingBatch(limit = 5, dryRun = false) {
  const settings = await getAutomationSettings();
  if (settings.migration_paused) return { processed: 0, results: [], paused: true };
  const pending = await db()
    .from("seo_content_inventory")
    .select("source_id, content_type")
    .eq("migration_status", "pending")
    .order("published_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  const results = [];
  for (const row of pending.data ?? []) {
    const kind = row.content_type as SeoContentType;
    const result = await refreshOneItem(kind, String(row.source_id), { dryRun });
    await db()
      .from("seo_content_inventory")
      .update({
        migration_status: result.status === "failed" ? "failed" : result.status === "no_update" || result.status === "dry_run" ? "audited" : "optimized",
        updated_at: new Date().toISOString(),
      })
      .eq("content_type", kind)
      .eq("source_id", String(row.source_id));
    results.push({ ...result, source_id: row.source_id, content_type: kind });
  }
  return { processed: results.length, results, paused: false };
}
