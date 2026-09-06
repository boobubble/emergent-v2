import { db, getAutomationSettings } from "@/lib/content-automation/db";
import {
  finishJob,
  getJobById,
  planJobRetry,
  remainingPublishSlots,
  resolveRetryExecutor,
  retryFailedJob,
  type SeoJobRow,
} from "@/lib/content-automation/job-lock";
import { utcDateKey } from "@/lib/content-automation/seo-settings";
import { retryBlogPublishFromJob } from "@/lib/content-automation/blog-publish";
import { retryPagePublishFromJob } from "@/lib/content-automation/static-publish";
import { refreshOneItem } from "@/lib/content-automation/seo-refresh";
import { attachPexelsImage } from "@/lib/content-automation/pexels-images";

async function sourceAlreadyPublished(job: SeoJobRow): Promise<boolean> {
  if (!job.source_id) return false;
  const table = job.content_type === "blog" || job.job_type === "blog_publish" ? "blog_posts" : "custom_pages";
  const { data } = await db().from(table).select("id, status").eq("id", job.source_id).maybeSingle();
  return Boolean(data && (data.status === "published" || data.id));
}

export async function executeSeoJobRetry(jobId: string) {
  const claimed = await retryFailedJob(jobId);
  if (!claimed.ok || !claimed.job) {
    return { ok: false as const, executed: false, reason: claimed.reason ?? "unavailable" };
  }
  const job = claimed.job;
  const settings = await getAutomationSettings();
  const quota = await remainingPublishSlots(settings);
  const remaining =
    job.job_type === "blog_publish" ? quota.blogs : job.job_type === "page_publish" ? quota.pages : 1;
  const already = await sourceAlreadyPublished(job);
  const plan = planJobRetry({
    job,
    today: utcDateKey(),
    sourceAlreadyPublished: already,
    remainingSlots: remaining,
  });

  if (plan.action === "deny") {
    await finishJob(job.id, "failed", { error: `Retry denied: ${plan.reason}` });
    return { ok: false as const, executed: false, reason: plan.reason, job };
  }
  if (plan.action === "complete_idempotent") {
    await finishJob(job.id, "completed", { result: { skipped: plan.reason }, sourceId: job.source_id ?? undefined });
    return { ok: true as const, executed: false, reason: plan.reason, job };
  }

  const executor = resolveRetryExecutor(job.job_type);
  if (executor === "blog_publish") {
    const result = await retryBlogPublishFromJob(job, settings);
    return { ok: result.success, executed: result.success, reason: result.error, result, job };
  }
  if (executor === "page_publish") {
    const result = await retryPagePublishFromJob(job, settings);
    return { ok: result.success, executed: result.success, reason: result.error, result, job };
  }
  if (executor === "refresh") {
    if (!job.content_type || !job.source_id) {
      await finishJob(job.id, "failed", { error: "Refresh retry missing source" });
      return { ok: false as const, executed: false, reason: "unavailable", job };
    }
    const result = await refreshOneItem(job.content_type, job.source_id, { reuseJobId: job.id });
    return { ok: result.status !== "failed", executed: result.status === "updated" || result.status === "no_update", reason: result.status, result, job };
  }
  if (executor === "image_retry") {
    if (!job.content_type || !job.source_id) {
      await finishJob(job.id, "failed", { error: "Image retry missing source" });
      return { ok: false as const, executed: false, reason: "unavailable", job };
    }
    const table = job.content_type === "blog" ? "blog_posts" : "custom_pages";
    const live = await db().from(table).select("id, content, title").eq("id", job.source_id).maybeSingle();
    if (!live.data) {
      await finishJob(job.id, "failed", { error: "Content not found" });
      return { ok: false as const, executed: false, reason: "unavailable", job };
    }
    const result = await attachPexelsImage({
      html: live.data.content || "",
      topic: job.title || live.data.title,
      contentType: job.content_type,
      sourceId: job.source_id,
    });
    if (result.ok) {
      const patch: Record<string, unknown> = { content: result.html };
      if (job.content_type === "page" && result.ogImage) patch.og_image = result.ogImage;
      await db().from(table).update(patch).eq("id", job.source_id);
    }
    await finishJob(job.id, result.ok ? "completed" : "failed", {
      error: result.error,
      result: { imageStatus: result.imageStatus, photoId: result.photoId },
    });
    return { ok: result.ok, executed: result.ok, reason: result.error, result, job };
  }

  await finishJob(job.id, "failed", { error: `Unsupported job type ${job.job_type}` });
  return { ok: false as const, executed: false, reason: "unsupported", job };
}

export async function loadJobForRetry(jobId: string): Promise<SeoJobRow | null> {
  return getJobById(jobId);
}
