/**
 * SEO Phase 2 — apply CMS HTML/meta/tag cleanup to published custom_pages.
 * Requires SUPABASE_DB_URL or DATABASE_URL. Dry-run unless --apply is passed.
 *
 *   npx vite-node scripts/seo-phase2-apply.ts
 *   npx vite-node scripts/seo-phase2-apply.ts --apply
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import {
  detectResearchNotes,
  evaluatePageQuality,
  extractHeadingTexts,
  extractInternalHrefs,
  reducedPublicTags,
  resolveInternalHref,
  rewriteCmsHtml,
} from "../src/lib/pages-cms/content-quality";

const root = process.cwd();
const APPLY = process.argv.includes("--apply");

function loadEnv() {
  const out: Record<string, string | undefined> = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (out[m[1]] == null) out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

const META_FIXES: Record<string, { meta_title?: string; meta_description?: string }> = {
  "usa-chat-room": {
    meta_title: "USA Chat Room – Free Online Chat with People Across America",
    meta_description:
      "Join Yaarzo’s USA chat room to meet people across America. Chat free in English and start live conversations without a complicated signup.",
  },
  "teen-chat-room": {
    meta_title: "Teen Chat Room for Ages 13–16 | Yaarzo",
  },
  "contact-us": {
    meta_title: "Contact Us | Yaarzo",
  },
};

const env = loadEnv();
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL / DATABASE_URL");
  process.exit(1);
}

const sql = postgres(dbUrl, { max: 1, prepare: false });

try {
  const pages = await sql<
    Array<{
      id: string;
      slug: string;
      title: string;
      h1: string | null;
      meta_title: string | null;
      meta_description: string | null;
      canonical_url: string | null;
      content: string | null;
      intro_content: string | null;
      tags: string[] | null;
      noindex: boolean;
    }>
  >`
    select id, slug, title, h1, meta_title, meta_description, canonical_url, content, intro_content,
           tags, noindex
    from custom_pages
    where status = 'published'
    order by slug
  `;
  const publishedSlugs = pages.map((p) => p.slug);
  const summary: Array<Record<string, unknown>> = [];

  for (const page of pages) {
    const next = {
      content: rewriteCmsHtml(page.content || "", {
        h1: page.h1 || page.title,
        publishedSlugs,
        clusterSlug: page.slug,
      }),
      intro_content: page.intro_content
        ? rewriteCmsHtml(page.intro_content, { h1: page.h1 || page.title, publishedSlugs })
        : page.intro_content,
      tags: reducedPublicTags(page.tags),
      meta_title: (page.meta_title || "").trim() || null,
      meta_description: (page.meta_description || "").trim() || null,
      h1: (page.h1 || "").trim() || null,
    };
    const fixes = META_FIXES[page.slug];
    if (fixes?.meta_title && !next.meta_title) next.meta_title = fixes.meta_title;
    if (fixes?.meta_description && !next.meta_description) next.meta_description = fixes.meta_description;

    const changedFields = [
      next.content !== (page.content || "") ? "content" : null,
      (next.intro_content || "") !== (page.intro_content || "") ? "intro" : null,
      JSON.stringify(next.tags) !== JSON.stringify(page.tags || []) ? "tags" : null,
      next.meta_title !== ((page.meta_title || "").trim() || null) ? "meta_title" : null,
      next.meta_description !== ((page.meta_description || "").trim() || null) ? "meta_description" : null,
      next.h1 !== ((page.h1 || "").trim() || null) ? "h1" : null,
    ].filter(Boolean);

    const html = `${next.intro_content || ""}\n${next.content || ""}`;
    const published = new Set(publishedSlugs);
    const brokenAfter = extractInternalHrefs(html).filter(
      (href) => resolveInternalHref(href, published).action === "unwrap",
    );
    const quality = evaluatePageQuality({
      slug: page.slug,
      title: page.title,
      h1: next.h1,
      meta_title: next.meta_title,
      meta_description: next.meta_description,
      canonical_url: page.canonical_url,
      content: next.content,
      intro_content: next.intro_content,
      tags: next.tags,
      noindex: page.noindex,
      publishedSlugs,
    });
    summary.push({
      slug: page.slug,
      changed: changedFields.length > 0,
      fields: changedFields,
      brokenAfter,
      emptyHeadings: extractHeadingTexts(html).filter((h) => h.empty).length,
      research: detectResearchNotes(html),
      quality: quality.status,
      warnings: quality.warnings.map((w) => w.code),
    });

    if (APPLY && changedFields.length) {
      await sql`
        update custom_pages
        set content = ${next.content},
            intro_content = ${next.intro_content},
            tags = ${sql.array(next.tags)}::text[],
            meta_title = ${next.meta_title},
            meta_description = ${next.meta_description},
            h1 = ${next.h1},
            updated_at = now()
        where id = ${page.id}::uuid
      `;
    }
  }

  const modified = summary.filter((s) => s.changed);
  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        total: pages.length,
        modified: modified.length,
        slugs: modified.map((s) => s.slug),
        remainingBroken: summary
          .filter((s) => Array.isArray(s.brokenAfter) && (s.brokenAfter as string[]).length)
          .map((s) => ({ slug: s.slug, brokenAfter: s.brokenAfter })),
        remainingEmptyHeadings: summary.filter((s) => s.emptyHeadings).map((s) => s.slug),
        remainingResearch: summary
          .filter((s) => Array.isArray(s.research) && (s.research as string[]).length)
          .map((s) => ({ slug: s.slug, research: s.research })),
        quality: summary.map((s) => ({ slug: s.slug, quality: s.quality, warnings: s.warnings, fields: s.fields })),
      },
      null,
      2,
    ),
  );
} finally {
  await sql.end({ timeout: 5 });
}
