import { db } from "@/lib/content-automation/db";
import type { SeoContentType } from "@/lib/content-automation/seo-types";

export type ContentSnapshot = {
  content_type: SeoContentType;
  source_id: string;
  title?: string | null;
  slug?: string | null;
  canonical_url?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown>;
  keyword_info?: Record<string, unknown>;
  seo_info?: Record<string, unknown>;
  change_reason?: string;
  change_summary?: string;
  job_id?: string | null;
};

export async function snapshotContent(input: ContentSnapshot, maxVersions = 10) {
  const { data: last } = await db()
    .from("seo_content_versions")
    .select("version_number")
    .eq("content_type", input.content_type)
    .eq("source_id", input.source_id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version_number = Number(last?.version_number ?? 0) + 1;
  const { data, error } = await db()
    .from("seo_content_versions")
    .insert({
      content_type: input.content_type,
      source_id: input.source_id,
      version_number,
      title: input.title ?? null,
      slug: input.slug ?? null,
      canonical_url: input.canonical_url ?? null,
      content: input.content ?? null,
      metadata: input.metadata ?? {},
      keyword_info: input.keyword_info ?? {},
      seo_info: input.seo_info ?? {},
      change_reason: input.change_reason ?? null,
      change_summary: input.change_summary ?? null,
      job_id: input.job_id ?? null,
    })
    .select("id, version_number")
    .maybeSingle();

  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return null;
    throw new Error(error.message);
  }

  await pruneVersions(input.content_type, input.source_id, maxVersions);
  return data as { id: string; version_number: number } | null;
}

export async function pruneVersions(contentType: SeoContentType, sourceId: string, maxVersions: number) {
  const keep = Math.max(1, maxVersions);
  const { data } = await db()
    .from("seo_content_versions")
    .select("id, version_number")
    .eq("content_type", contentType)
    .eq("source_id", sourceId)
    .order("version_number", { ascending: false });
  const extra = (data ?? []).slice(keep);
  if (extra.length === 0) return;
  await db()
    .from("seo_content_versions")
    .delete()
    .in(
      "id",
      extra.map((r: { id: string }) => r.id),
    );
}

export async function listVersions(contentType: SeoContentType, sourceId: string) {
  const { data, error } = await db()
    .from("seo_content_versions")
    .select("id, content_type, source_id, version_number, title, slug, canonical_url, change_reason, change_summary, created_at")
    .eq("content_type", contentType)
    .eq("source_id", sourceId)
    .order("version_number", { ascending: false });
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getVersion(id: string) {
  const { data, error } = await db().from("seo_content_versions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export function compareVersionText(a: string, b: string) {
  return {
    beforeChars: a.length,
    afterChars: b.length,
    unchanged: a === b,
  };
}

export async function restoreVersion(versionId: string, maxVersions = 10) {
  const version = await getVersion(versionId);
  if (!version) throw new Error("Version not found");
  const contentType = version.content_type as SeoContentType;
  const sourceId = String(version.source_id);
  const table = contentType === "blog" ? "blog_posts" : "custom_pages";
  const current = await db().from(table).select("*").eq("id", sourceId).maybeSingle();
  if (!current.data) throw new Error("Live content not found");

  const liveSlug = String(current.data.slug);
  const liveCanonical = contentType === "page"
    ? (current.data.canonical_url || `https://yaarzo.com/${liveSlug}`)
    : `https://yaarzo.com/blog/${liveSlug}`;

  await snapshotContent({
    content_type: contentType,
    source_id: sourceId,
    title: current.data.title,
    slug: liveSlug,
    canonical_url: liveCanonical,
    content: current.data.content,
    metadata: { restore_of: versionId },
    change_reason: "restore_backup",
    change_summary: `Snapshot before restoring version ${version.version_number}`,
  }, maxVersions);

  const patch: Record<string, unknown> = {
    title: version.title ?? current.data.title,
    content: version.content ?? current.data.content,
  };
  if (contentType === "page") {
    const seo = (version.seo_info ?? {}) as Record<string, unknown>;
    if (typeof seo.h1 === "string") patch.h1 = seo.h1;
    if (typeof seo.meta_title === "string") patch.meta_title = seo.meta_title;
    if (typeof seo.meta_description === "string") patch.meta_description = seo.meta_description;
    patch.canonical_url = current.data.canonical_url;
    patch.slug = liveSlug;
  } else {
    const seo = (version.seo_info ?? {}) as Record<string, unknown>;
    if (typeof seo.meta_description === "string") patch.meta_description = seo.meta_description;
    patch.slug = liveSlug;
  }

  const { error } = await db().from(table).update(patch).eq("id", sourceId);
  if (error) throw new Error(error.message);
  return { restored: true, slug: liveSlug, version: version.version_number };
}

export async function listRecentVersions(limit = 30) {
  const { data, error } = await db()
    .from("seo_content_versions")
    .select("id, content_type, source_id, version_number, title, slug, change_reason, change_summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}
