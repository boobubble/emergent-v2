#!/usr/bin/env node
/**
 * Generate Phase 4A taxonomy SQL from the TypeScript source-of-truth.
 * Run: node scripts/generate-phase4a-taxonomy-sql.mjs
 * Outputs:
 *   supabase/migrations/20260808121000_pages_cms_phase4a_taxonomy.sql
 *   scripts/pages-cms-phase4a-taxonomy.sql (mirror)
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Compile/load TS data via vitest/vite is heavy — duplicate-generate from a JSON dump.
// Prefer running through node with tsx if available; else embed via dynamic import of built file.
async function loadData() {
  // Use vitest's vite-node style: spawn a tiny TS loader via npx tsx if present
  const probe = spawnSync("npx", ["--yes", "tsx", "-e", `
    import {
      INDIA_STATES, PAKISTAN_STATES, INDIA_CITIES, PAKISTAN_CITIES,
      CATEGORIES, KEYWORD_GROUPS, TEMPLATES, SEO_PRIORITY_BY_TIER
    } from "./src/lib/pages-cms/phase4a/taxonomy-data.ts";
    console.log(JSON.stringify({
      INDIA_STATES, PAKISTAN_STATES, INDIA_CITIES, PAKISTAN_CITIES,
      CATEGORIES, KEYWORD_GROUPS, TEMPLATES, SEO_PRIORITY_BY_TIER
    }));
  `], { cwd: root, encoding: "utf8", maxBuffer: 20_000_000 });
  if (probe.status !== 0) {
    console.error(probe.stderr || probe.stdout);
    throw new Error("Failed to load taxonomy-data via tsx");
  }
  const line = probe.stdout.trim().split(/\n/).filter((l) => l.startsWith("{")).pop();
  return JSON.parse(line);
}

function sqlStr(v) {
  if (v == null) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function sqlTextArray(arr) {
  if (!arr?.length) return "'{}'::text[]";
  return `ARRAY[${arr.map(sqlStr).join(", ")}]::text[]`;
}

function sqlJson(v) {
  return sqlStr(JSON.stringify(v)) + "::jsonb";
}

function stateValues(rows) {
  return rows.map((s) => `  (${sqlStr(s.name)}, ${sqlStr(s.slug)}, ${s.sort_order})`).join(",\n");
}

function cityInsert(countrySlug, cities, priorityMap) {
  // group by state_slug
  const byState = new Map();
  for (const c of cities) {
    if (!byState.has(c.state_slug)) byState.set(c.state_slug, []);
    byState.get(c.state_slug).push(c);
  }
  const chunks = [];
  let sortBase = 0;
  for (const [stateSlug, list] of byState) {
    const values = list.map((c, i) => {
      const pri = priorityMap[c.tier];
      return `  (${sqlStr(c.name)}, ${sqlStr(c.slug)}, ${sqlTextArray(c.alt_names ?? [])}, ${pri}, ${sortBase + i + 1})`;
    }).join(",\n");
    sortBase += list.length;
    chunks.push(`
INSERT INTO public.page_cities (country_id, state_id, name, slug, alt_names, seo_priority, sort_order, is_active, seo_enabled)
SELECT c.id, s.id, v.name, v.slug, v.alt_names, v.seo_priority, v.sort_order, true, true
FROM public.page_countries c
JOIN public.page_states s ON s.country_id = c.id AND s.slug = ${sqlStr(stateSlug)}
CROSS JOIN (VALUES
${values}
) AS v(name, slug, alt_names, seo_priority, sort_order)
WHERE c.slug = ${sqlStr(countrySlug)}
ON CONFLICT (country_id, slug) DO UPDATE SET
  state_id = EXCLUDED.state_id,
  name = EXCLUDED.name,
  alt_names = EXCLUDED.alt_names,
  seo_priority = EXCLUDED.seo_priority,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();
`);
  }
  return chunks.join("\n");
}

function buildSql(data) {
  const { INDIA_STATES, PAKISTAN_STATES, INDIA_CITIES, PAKISTAN_CITIES, CATEGORIES, KEYWORD_GROUPS, TEMPLATES, SEO_PRIORITY_BY_TIER } = data;

  return `-- =============================================================================
-- Phase 4A — Pages CMS taxonomy foundation (India + Pakistan)
-- =============================================================================
-- Idempotent / re-runnable where practical.
-- Does NOT insert or update custom_pages.
-- Does NOT generate SEO pages.
-- Lahore Chat Room custom_pages row remains untouched.
--
-- Phase 1 reuse contract:
--   * Preserve existing taxonomy row IDs (UPSERT / slug rename only).
--   * India Punjab: rename slug punjab-in → punjab (same ID).
--   * Categories girls-chat / dating-chat: reparent under chat-rooms (same IDs).
--   * Keyword group city-chat-room: update in place (same ID).
--   * Template default-city-chat-room: rename slug → city-chat-room (same ID),
--     then UPSERT content so there is exactly one City Chat Room template.
-- =============================================================================

-- Additive schema for keyword secondary patterns + template title/slug scaffolds
ALTER TABLE public.page_keyword_groups
  ADD COLUMN IF NOT EXISTS secondary_patterns TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.page_templates
  ADD COLUMN IF NOT EXISTS title_template TEXT,
  ADD COLUMN IF NOT EXISTS slug_template TEXT;

-- ---------------------------------------------------------------------------
-- PREFLIGHT: fail on ambiguous Phase 1 taxonomy before any writes
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  india_id UUID;
  v_count INTEGER;
  v_detail TEXT;
BEGIN
  SELECT id INTO india_id FROM public.page_countries WHERE slug = 'india';

  -- India must not already have BOTH punjab-in and punjab (would be two Punjabs)
  IF india_id IS NOT NULL THEN
    SELECT count(*) INTO v_count
    FROM public.page_states
    WHERE country_id = india_id AND slug IN ('punjab', 'punjab-in');
    IF v_count > 1 THEN
      RAISE EXCEPTION
        'Phase 4A preflight failed: India has % Punjab slug variants (punjab / punjab-in). Resolve manually before apply.',
        v_count;
    END IF;

    -- Semantic duplicate states by normalized name within India
    SELECT string_agg(name || ' (' || cnt || ')', ', ') INTO v_detail
    FROM (
      SELECT lower(name) AS n, max(name) AS name, count(*) AS cnt
      FROM public.page_states
      WHERE country_id = india_id
      GROUP BY lower(name)
      HAVING count(*) > 1
    ) d;
    IF v_detail IS NOT NULL THEN
      RAISE EXCEPTION 'Phase 4A preflight failed: India duplicate state names: %', v_detail;
    END IF;
  END IF;

  -- Template collision: both default-city-chat-room and city-chat-room already exist
  SELECT count(*) INTO v_count
  FROM public.page_templates
  WHERE slug IN ('default-city-chat-room', 'city-chat-room');
  IF v_count > 1 THEN
    RAISE EXCEPTION
      'Phase 4A preflight failed: both default-city-chat-room and city-chat-room templates exist. Resolve before apply.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- India Punjab: preserve existing ID, rename slug punjab-in → punjab
-- ---------------------------------------------------------------------------
-- Production Phase 1 row example:
--   id = acd5044a-8bb6-48b2-87b2-493853a6d311, slug = punjab-in
-- After this UPDATE the same ID becomes slug = punjab.
-- No DELETE/recreate. FK refs (page_cities.state_id / custom_pages.state_id) stay valid.
UPDATE public.page_states s
SET
  slug = 'punjab',
  name = 'Punjab',
  is_active = true,
  seo_enabled = true,
  updated_at = now()
FROM public.page_countries c
WHERE s.country_id = c.id
  AND c.slug = 'india'
  AND s.slug = 'punjab-in';

-- ---------------------------------------------------------------------------
-- City Chat Room template: preserve existing ID, rename default → city-chat-room
-- ---------------------------------------------------------------------------
-- Production Phase 1 row example:
--   id = e2d0ed75-5a4c-4c86-948b-beab44dddde5, slug = default-city-chat-room
-- After rename, UPSERT on city-chat-room updates the SAME row (one canonical template).
UPDATE public.page_templates
SET
  slug = 'city-chat-room',
  name = 'City Chat Room',
  updated_at = now()
WHERE slug = 'default-city-chat-room'
  AND NOT EXISTS (SELECT 1 FROM public.page_templates WHERE slug = 'city-chat-room');

-- Countries (already seeded; keep idempotent)
INSERT INTO public.page_countries (name, slug, iso_code, language, sort_order, is_active, seo_enabled)
VALUES
  ('India', 'india', 'IN', 'en', 1, true, true),
  ('Pakistan', 'pakistan', 'PK', 'en', 2, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  iso_code = EXCLUDED.iso_code,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- Pakistan states / territories
INSERT INTO public.page_states (country_id, name, slug, sort_order, is_active, seo_enabled, language)
SELECT c.id, v.name, v.slug, v.sort_order, true, true, 'en'
FROM public.page_countries c
CROSS JOIN (VALUES
${stateValues(PAKISTAN_STATES)}
) AS v(name, slug, sort_order)
WHERE c.slug = 'pakistan'
ON CONFLICT (country_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- India states / UTs
-- After Punjab rename above, INSERT ... ON CONFLICT (country_id, slug) updates the
-- existing India Punjab row (same ID) instead of creating a second Punjab.
INSERT INTO public.page_states (country_id, name, slug, sort_order, is_active, seo_enabled, language)
SELECT c.id, v.name, v.slug, v.sort_order, true, true, 'en'
FROM public.page_countries c
CROSS JOIN (VALUES
${stateValues(INDIA_STATES)}
) AS v(name, slug, sort_order)
WHERE c.slug = 'india'
ON CONFLICT (country_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

-- Cities (Pakistan) — ON CONFLICT (country_id, slug) reuses Phase 1 cities
${cityInsert("pakistan", PAKISTAN_CITIES, SEO_PRIORITY_BY_TIER)}

-- Cities (India)
${cityInsert("india", INDIA_CITIES, SEO_PRIORITY_BY_TIER)}

-- Categories (root + children). Reuse Phase 1 Chat Rooms / Girls Chat / Dating Chat IDs.
INSERT INTO public.page_categories (name, slug, description, sort_order, is_active, seo_enabled)
VALUES ('Chat Rooms', 'chat-rooms', 'Root chat room category for SEO pages', 1, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  parent_id = NULL,
  is_active = true,
  seo_enabled = true,
  updated_at = now();

${CATEGORIES.filter((c) => c.parent_slug === "chat-rooms").map((cat) => `
INSERT INTO public.page_categories (name, slug, description, parent_id, sort_order, is_active, seo_enabled)
SELECT ${sqlStr(cat.name)}, ${sqlStr(cat.slug)}, ${sqlStr(cat.description)}, p.id, ${cat.sort_order}, true, true
FROM public.page_categories p
WHERE p.slug = 'chat-rooms'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  seo_enabled = true,
  updated_at = now();
`).join("\n")}

-- Keyword groups — city-chat-room UPSERT reuses Phase 1 ID
${KEYWORD_GROUPS.map((g) => `
INSERT INTO public.page_keyword_groups (
  name, slug, primary_pattern, secondary_patterns,
  title_pattern, meta_title_pattern, meta_description_pattern, h1_pattern, slug_pattern, is_active
) VALUES (
  ${sqlStr(g.name)},
  ${sqlStr(g.slug)},
  ${sqlStr(g.primary_pattern)},
  ${sqlTextArray(g.secondary_patterns)},
  ${sqlStr(g.title_pattern)},
  ${sqlStr(g.meta_title_pattern)},
  ${sqlStr(g.meta_description_pattern)},
  ${sqlStr(g.h1_pattern)},
  ${sqlStr(g.slug_pattern)},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_pattern = EXCLUDED.primary_pattern,
  secondary_patterns = EXCLUDED.secondary_patterns,
  title_pattern = EXCLUDED.title_pattern,
  meta_title_pattern = EXCLUDED.meta_title_pattern,
  meta_description_pattern = EXCLUDED.meta_description_pattern,
  h1_pattern = EXCLUDED.h1_pattern,
  slug_pattern = EXCLUDED.slug_pattern,
  is_active = true,
  updated_at = now();
`).join("\n")}

-- Templates (scaffolds only — no page generation)
-- city-chat-room row was renamed from default-city-chat-room above (same ID).
${TEMPLATES.map((t) => `
INSERT INTO public.page_templates (
  name, slug, description,
  title_template, slug_template, h1_template,
  meta_title_template, meta_description_template,
  intro_template, content_template, cta_template, faq_template,
  is_default, is_active
) VALUES (
  ${sqlStr(t.name)},
  ${sqlStr(t.slug)},
  ${sqlStr(t.description)},
  ${sqlStr(t.title_template)},
  ${sqlStr(t.slug_template)},
  ${sqlStr(t.h1_template)},
  ${sqlStr(t.meta_title_template)},
  ${sqlStr(t.meta_description_template)},
  ${sqlStr(t.intro_template)},
  ${sqlStr(t.content_template)},
  ${sqlJson(t.cta_template)},
  ${sqlJson(t.faq_template)},
  ${t.is_default ? "true" : "false"},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_template = EXCLUDED.title_template,
  slug_template = EXCLUDED.slug_template,
  h1_template = EXCLUDED.h1_template,
  meta_title_template = EXCLUDED.meta_title_template,
  meta_description_template = EXCLUDED.meta_description_template,
  intro_template = EXCLUDED.intro_template,
  content_template = EXCLUDED.content_template,
  cta_template = EXCLUDED.cta_template,
  faq_template = EXCLUDED.faq_template,
  is_default = EXCLUDED.is_default,
  is_active = true,
  updated_at = now();
`).join("\n")}

-- Ensure only one default template (city-chat-room)
UPDATE public.page_templates SET is_default = false WHERE slug <> 'city-chat-room';
UPDATE public.page_templates SET is_default = true WHERE slug = 'city-chat-room';

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: refuse ambiguous taxonomy after seed
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_detail TEXT;
  v_count INTEGER;
BEGIN
  -- No leftover India punjab-in
  SELECT count(*) INTO v_count
  FROM public.page_states s
  JOIN public.page_countries c ON c.id = s.country_id
  WHERE c.slug = 'india' AND s.slug = 'punjab-in';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: India still has slug punjab-in';
  END IF;

  -- Exactly one India Punjab
  SELECT count(*) INTO v_count
  FROM public.page_states s
  JOIN public.page_countries c ON c.id = s.country_id
  WHERE c.slug = 'india' AND lower(s.name) = 'punjab';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: India Punjab count = % (expected 1)', v_count;
  END IF;

  -- No default-city-chat-room left; exactly one city-chat-room template
  SELECT count(*) INTO v_count FROM public.page_templates WHERE slug = 'default-city-chat-room';
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: default-city-chat-room still exists';
  END IF;
  SELECT count(*) INTO v_count FROM public.page_templates WHERE slug = 'city-chat-room';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: city-chat-room template count = %', v_count;
  END IF;

  -- Semantic duplicate states (country + normalized name)
  SELECT string_agg(c.slug || ':' || d.name || '(' || d.cnt || ')', ', ') INTO v_detail
  FROM (
    SELECT country_id, lower(name) AS n, max(name) AS name, count(*) AS cnt
    FROM public.page_states
    GROUP BY country_id, lower(name)
    HAVING count(*) > 1
  ) d
  JOIN public.page_countries c ON c.id = d.country_id;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate states: %', v_detail;
  END IF;

  -- Semantic duplicate cities (country + normalized name) — Hyderabad IN vs PK is OK
  SELECT string_agg(c.slug || ':' || d.name || '(' || d.cnt || ')', ', ') INTO v_detail
  FROM (
    SELECT country_id, lower(name) AS n, max(name) AS name, count(*) AS cnt
    FROM public.page_cities
    GROUP BY country_id, lower(name)
    HAVING count(*) > 1
  ) d
  JOIN public.page_countries c ON c.id = d.country_id;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate cities: %', v_detail;
  END IF;

  -- Duplicate category / keyword / template slugs (unique constraints should prevent; assert anyway)
  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_categories GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate categories: %', v_detail;
  END IF;

  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_keyword_groups GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate keyword groups: %', v_detail;
  END IF;

  SELECT string_agg(slug || '(' || cnt || ')', ', ') INTO v_detail
  FROM (SELECT slug, count(*) AS cnt FROM public.page_templates GROUP BY slug HAVING count(*) > 1) x;
  IF v_detail IS NOT NULL THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: duplicate templates: %', v_detail;
  END IF;

  -- Girls/Dating must be children of Chat Rooms
  IF EXISTS (
    SELECT 1 FROM public.page_categories child
    JOIN public.page_categories root ON root.slug = 'chat-rooms'
    WHERE child.slug IN ('girls-chat', 'dating-chat')
      AND child.parent_id IS DISTINCT FROM root.id
  ) THEN
    RAISE EXCEPTION 'Phase 4A postflight failed: girls-chat/dating-chat not reparented under chat-rooms';
  END IF;
END $$;
`;
}

const data = await loadData();
const sql = buildSql(data);
const out1 = join(root, "supabase/migrations/20260808121000_pages_cms_phase4a_taxonomy.sql");
const out2 = join(root, "scripts/pages-cms-phase4a-taxonomy.sql");
writeFileSync(out1, sql);
writeFileSync(out2, sql);
console.log("Wrote", out1);
console.log("Wrote", out2);
console.log("Counts", {
  indiaStates: data.INDIA_STATES.length,
  indiaCities: data.INDIA_CITIES.length,
  pakistanStates: data.PAKISTAN_STATES.length,
  pakistanCities: data.PAKISTAN_CITIES.length,
  categories: data.CATEGORIES.length,
  keywordGroups: data.KEYWORD_GROUPS.length,
  templates: data.TEMPLATES.length,
});
