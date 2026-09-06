import { db } from "@/lib/content-automation/db";
import { dailyPublishJobKey, remainingDailySlots, refreshJobKey, utcDateKey } from "@/lib/content-automation/seo-settings";
import type { DailyPublishKind } from "@/lib/content-automation/seo-types";

export { dailyPublishJobKey, refreshJobKey };

export type JobStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export type SeoJobRow = {
  id: string;
  job_key: string;
  job_type: string;
  content_type: DailyPublishKind | null;
  source_id: string | null;
  slug: string | null;
  title: string | null;
  target_date: string | null;
  slot: number | null;
  status: JobStatus;
  dry_run: boolean;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  next_retry_at: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  started_at?: string | null;
};

export const STALE_RUNNING_MS = 20 * 60 * 1000;

export type ReclaimDecision =
  | { action: "deny"; reason: "completed" | "running" | "unavailable" }
  | { action: "reclaim"; expectedStatus: JobStatus; staleRunning?: boolean };

export function decideJobReclaim(
  row: Pick<SeoJobRow, "status" | "retry_count" | "max_retries"> & { started_at?: string | null },
  now = Date.now(),
): ReclaimDecision {
  if (row.status === "completed") return { action: "deny", reason: "completed" };
  if (row.status === "running") {
    const started = row.started_at ? Date.parse(row.started_at) : 0;
    if (started && now - started < STALE_RUNNING_MS) {
      return { action: "deny", reason: "running" };
    }
    return { action: "reclaim", expectedStatus: "running", staleRunning: true };
  }
  if (row.status === "failed" && Number(row.retry_count) >= Number(row.max_retries)) {
    return { action: "deny", reason: "completed" };
  }
  if (row.status === "failed" || row.status === "skipped" || row.status === "pending") {
    return { action: "reclaim", expectedStatus: row.status };
  }
  return { action: "deny", reason: "unavailable" };
}

/** In-memory CAS used by tests to prove only one concurrent claimant wins. */
export function compareAndSwapJobStatus(
  current: { status: JobStatus; started_at?: string | null },
  expected: { status: JobStatus; started_at?: string | null },
): boolean {
  if (current.status !== expected.status) return false;
  if (expected.started_at != null && current.started_at !== expected.started_at) return false;
  return true;
}

export type MemoryJob = {
  id: string;
  job_key: string;
  status: JobStatus;
  started_at: string | null;
  retry_count: number;
  max_retries: number;
};

export function claimJobInMemory(
  store: Map<string, MemoryJob>,
  jobKey: string,
  now: number,
): { ok: boolean; reason?: "completed" | "running" | "unavailable"; reused: boolean } {
  const existing = store.get(jobKey);
  if (!existing) {
    store.set(jobKey, {
      id: `mem-${store.size + 1}`,
      job_key: jobKey,
      status: "running",
      started_at: new Date(now).toISOString(),
      retry_count: 0,
      max_retries: 2,
    });
    return { ok: true, reused: false };
  }
  const snapshot = { ...existing };
  const decision = decideJobReclaim(snapshot, now);
  if (decision.action === "deny") return { ok: false, reason: decision.reason, reused: false };
  const live = store.get(jobKey);
  if (!live) return { ok: false, reason: "unavailable", reused: false };
  const expectedStarted = decision.staleRunning ? snapshot.started_at : null;
  if (!compareAndSwapJobStatus(live, {
    status: decision.expectedStatus,
    started_at: expectedStarted,
  })) {
    return { ok: false, reason: "running", reused: false };
  }
  live.status = "running";
  live.started_at = new Date(now).toISOString();
  return { ok: true, reused: true };
}

export async function countCompletedPublishJobs(kind: DailyPublishKind, date: string): Promise<number> {
  const { count, error } = await db()
    .from("seo_content_jobs")
    .select("id", { count: "exact", head: true })
    .eq("job_type", kind === "blog" ? "blog_publish" : "page_publish")
    .eq("target_date", date)
    .in("status", ["completed", "running"]);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function countPublishedToday(kind: DailyPublishKind, date: string): Promise<number> {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  const table = kind === "blog" ? "blog_posts" : "custom_pages";
  const { count, error } = await db()
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .gte("published_at", start)
    .lte("published_at", end);
  if (error) return 0;
  return count ?? 0;
}

export async function getDailyPublishUsage(date = utcDateKey()) {
  const [blogJobs, pageJobs, blogsPublished, pagesPublished] = await Promise.all([
    countCompletedPublishJobs("blog", date),
    countCompletedPublishJobs("page", date),
    countPublishedToday("blog", date),
    countPublishedToday("page", date),
  ]);
  return {
    date,
    blogsUsed: Math.max(blogJobs, blogsPublished),
    pagesUsed: Math.max(pageJobs, pagesPublished),
  };
}

export async function remainingPublishSlots(settings: {
  blog_posts_per_day: number;
  static_pages_per_day: number;
  daily_total_limit: number;
}, date = utcDateKey()) {
  const usage = await getDailyPublishUsage(date);
  const remaining = remainingDailySlots({
    blogLimit: settings.blog_posts_per_day,
    pageLimit: settings.static_pages_per_day,
    totalLimit: settings.daily_total_limit,
    blogsUsed: usage.blogsUsed,
    pagesUsed: usage.pagesUsed,
  });
  return { ...usage, ...remaining };
}

type ClaimResult =
  | { ok: true; job: SeoJobRow; reused: boolean }
  | { ok: false; reason: "completed" | "running" | "quota" | "unavailable"; job?: SeoJobRow };

async function casReclaimToRunning(
  row: SeoJobRow,
  expectedStatus: JobStatus,
  extra?: { title?: string; slug?: string },
): Promise<SeoJobRow | null> {
  const now = new Date().toISOString();
  let query = db()
    .from("seo_content_jobs")
    .update({
      status: "running",
      title: extra?.title ?? row.title,
      slug: extra?.slug ?? row.slug,
      started_at: now,
      updated_at: now,
      last_error: null,
      next_retry_at: null,
    })
    .eq("id", row.id)
    .eq("status", expectedStatus);
  if (expectedStatus === "running" && row.started_at) {
    query = query.eq("started_at", row.started_at);
  }
  const { data, error } = await query.select("*").maybeSingle();
  if (error || !data) return null;
  return data as SeoJobRow;
}

export async function claimJobByKey(input: {
  jobKey: string;
  insert: Record<string, unknown>;
  title?: string;
  slug?: string;
}): Promise<ClaimResult> {
  const insert = await db()
    .from("seo_content_jobs")
    .insert(input.insert)
    .select("*")
    .maybeSingle();

  if (!insert.error && insert.data) {
    return { ok: true, job: insert.data as SeoJobRow, reused: false };
  }

  if (insert.error && /does not exist|schema cache/i.test(insert.error.message)) {
    return { ok: false, reason: "unavailable" };
  }

  const existing = await db().from("seo_content_jobs").select("*").eq("job_key", input.jobKey).maybeSingle();
  const row = existing.data as SeoJobRow | null;
  if (!row) return { ok: false, reason: "unavailable" };
  const decision = decideJobReclaim(row);
  if (decision.action === "deny") return { ok: false, reason: decision.reason, job: row };
  const claimed = await casReclaimToRunning(row, decision.expectedStatus, {
    title: input.title,
    slug: input.slug,
  });
  if (!claimed) return { ok: false, reason: "running", job: row };
  return { ok: true, job: claimed, reused: true };
}

export async function claimDailyPublishSlot(input: {
  kind: DailyPublishKind;
  date?: string;
  slot: number;
  title?: string;
  slug?: string;
}): Promise<ClaimResult> {
  const date = input.date ?? utcDateKey();
  const jobKey = dailyPublishJobKey(input.kind, date, input.slot);
  const jobType = input.kind === "blog" ? "blog_publish" : "page_publish";
  const now = new Date().toISOString();
  return claimJobByKey({
    jobKey,
    title: input.title,
    slug: input.slug,
    insert: {
      job_key: jobKey,
      job_type: jobType,
      content_type: input.kind,
      title: input.title ?? null,
      slug: input.slug ?? null,
      target_date: date,
      slot: input.slot,
      status: "running",
      started_at: now,
      updated_at: now,
    },
  });
}

export async function claimRefreshJobRow(kind: DailyPublishKind, sourceId: string, date: string): Promise<ClaimResult> {
  const jobKey = refreshJobKey(kind, sourceId, date);
  const now = new Date().toISOString();
  return claimJobByKey({
    jobKey,
    insert: {
      job_key: jobKey,
      job_type: "refresh",
      content_type: kind,
      source_id: sourceId,
      target_date: date,
      status: "running",
      started_at: now,
      updated_at: now,
    },
  });
}

export async function finishJob(
  jobId: string,
  status: "completed" | "failed" | "skipped",
  extra?: { error?: string; result?: Record<string, unknown>; sourceId?: string; slug?: string; title?: string },
) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    finished_at: now,
    updated_at: now,
  };
  if (extra?.error) patch.last_error = extra.error.slice(0, 2000);
  if (extra?.result) patch.result = extra.result;
  if (extra?.sourceId) patch.source_id = extra.sourceId;
  if (extra?.slug) patch.slug = extra.slug;
  if (extra?.title) patch.title = extra.title;
  if (status === "failed") {
    const current = await db().from("seo_content_jobs").select("retry_count, max_retries").eq("id", jobId).maybeSingle();
    const retries = Number(current.data?.retry_count ?? 0) + 1;
    patch.retry_count = retries;
    const max = Number(current.data?.max_retries ?? 2);
    if (retries < max) {
      patch.next_retry_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }
  }
  await db().from("seo_content_jobs").update(patch).eq("id", jobId);
}

export async function listRecentJobs(limit = 40): Promise<SeoJobRow[]> {
  const { data, error } = await db()
    .from("seo_content_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as SeoJobRow[];
}

export function isPublishJobType(jobType: string): boolean {
  return jobType === "blog_publish" || jobType === "page_publish";
}

export function planJobRetry(input: {
  job: Pick<SeoJobRow, "status" | "job_type" | "target_date" | "source_id" | "retry_count" | "max_retries"> & {
    started_at?: string | null;
  };
  today: string;
  sourceAlreadyPublished: boolean;
  remainingSlots: number;
}): { action: "execute" | "complete_idempotent" | "deny"; reason: string } {
  const decision = decideJobReclaim(input.job);
  if (decision.action === "deny") return { action: "deny", reason: decision.reason };
  if (isPublishJobType(input.job.job_type) && input.sourceAlreadyPublished) {
    return { action: "complete_idempotent", reason: "already_published" };
  }
  if (isPublishJobType(input.job.job_type) && input.job.target_date && input.job.target_date !== input.today) {
    return { action: "deny", reason: "quota" };
  }
  if (isPublishJobType(input.job.job_type) && input.remainingSlots < 0) {
    return { action: "deny", reason: "quota" };
  }
  return { action: "execute", reason: "retry" };
}

export function resolveRetryExecutor(
  jobType: string,
): "blog_publish" | "page_publish" | "refresh" | "image_retry" | "unsupported" {
  if (jobType === "blog_publish" || jobType === "page_publish" || jobType === "refresh" || jobType === "image_retry") {
    return jobType;
  }
  return "unsupported";
}

export async function getJobById(jobId: string): Promise<SeoJobRow | null> {
  const { data, error } = await db().from("seo_content_jobs").select("*").eq("id", jobId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SeoJobRow | null) ?? null;
}

/**
 * Marks a failed/skipped/stale job retryable via CAS, then leaves it running so
 * the existing worker can execute it without a second publisher.
 */
export async function retryFailedJob(jobId: string): Promise<{
  ok: boolean;
  reason?: string;
  job?: SeoJobRow;
  plan?: ReturnType<typeof planJobRetry>;
}> {
  const row = await getJobById(jobId);
  if (!row) return { ok: false, reason: "unavailable" };
  const decision = decideJobReclaim(row);
  if (decision.action === "deny") return { ok: false, reason: decision.reason, job: row };

  const claimed = await casReclaimToRunning(row, decision.expectedStatus);
  if (!claimed) return { ok: false, reason: "running", job: row };
  return { ok: true, job: claimed, plan: { action: "execute", reason: "retry" } };
}
