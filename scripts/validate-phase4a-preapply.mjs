#!/usr/bin/env node
/**
 * Phase 4A pre-apply validation / report (READ-ONLY).
 * Does not apply migrations.
 *
 * Usage: node scripts/validate-phase4a-preapply.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
function loadEnv() {
  const out = { ...process.env };
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

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase URL/key");
  process.exit(1);
}

const sb = createClient(url, key);
const issues = [];

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

const [countries, states, cities, cats, kgs, tpls] = await Promise.all([
  sb.from("page_countries").select("id,name,slug"),
  sb.from("page_states").select("id,name,slug,country_id"),
  sb.from("page_cities").select("id,name,slug,country_id,state_id"),
  sb.from("page_categories").select("id,name,slug,parent_id"),
  sb.from("page_keyword_groups").select("id,name,slug"),
  sb.from("page_templates").select("id,name,slug,is_default"),
]);

for (const [label, res] of Object.entries({ countries, states, cities, cats, kgs, tpls })) {
  if (res.error) issues.push(`${label}: ${res.error.message}`);
}

const countryById = Object.fromEntries((countries.data || []).map((c) => [c.id, c]));
const india = (countries.data || []).find((c) => c.slug === "india");
const pakistan = (countries.data || []).find((c) => c.slug === "pakistan");
const indiaPunjab = (states.data || []).find(
  (s) => s.country_id === india?.id && (s.slug === "punjab-in" || s.slug === "punjab" || norm(s.name) === "punjab"),
);

let cityRefs = [];
let pageRefs = [];
if (indiaPunjab) {
  const r1 = await sb.from("page_cities").select("id,name,slug").eq("state_id", indiaPunjab.id);
  cityRefs = r1.data || [];
  const r2 = await sb.from("custom_pages").select("id,slug,title").eq("state_id", indiaPunjab.id);
  pageRefs = r2.data || [];
}

// Semantic duplicate checks (current DB)
function findDupes(rows, keyFn) {
  const map = new Map();
  for (const r of rows || []) {
    const k = keyFn(r);
    if (!k) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return [...map.entries()].filter(([, v]) => v.length > 1);
}

const stateNameDupes = findDupes(states.data, (s) => `${s.country_id}:${norm(s.name)}`);
const cityNameDupes = findDupes(cities.data, (c) => `${c.country_id}:${norm(c.name)}`);
const catSlugDupes = findDupes(cats.data, (c) => c.slug);
const kgSlugDupes = findDupes(kgs.data, (k) => k.slug);
const tplSlugDupes = findDupes(tpls.data, (t) => t.slug);

if (stateNameDupes.length) issues.push(`Duplicate states by country+name: ${JSON.stringify(stateNameDupes.map(([k]) => k))}`);
if (cityNameDupes.length) issues.push(`Duplicate cities by country+name: ${JSON.stringify(cityNameDupes.map(([k]) => k))}`);
if (catSlugDupes.length) issues.push("Duplicate category slugs");
if (kgSlugDupes.length) issues.push("Duplicate keyword group slugs");
if (tplSlugDupes.length) issues.push("Duplicate template slugs");

const indiaPunjabVariants = (states.data || []).filter(
  (s) => s.country_id === india?.id && (s.slug === "punjab" || s.slug === "punjab-in"),
);
if (indiaPunjabVariants.length > 1) {
  issues.push("India already has both punjab and punjab-in — migration will refuse to apply");
}

const tplVariants = (tpls.data || []).filter((t) =>
  t.slug === "default-city-chat-room" || t.slug === "city-chat-room",
);
if (tplVariants.length > 1) {
  issues.push("Both default-city-chat-room and city-chat-room exist — migration will refuse to apply");
}

const reusedStates = (states.data || [])
  .filter((s) =>
    (s.country_id === pakistan?.id && ["punjab", "sindh", "khyber-pakhtunkhwa", "balochistan"].includes(s.slug)) ||
    (s.country_id === india?.id && ["punjab-in", "punjab", "maharashtra", "delhi"].includes(s.slug)),
  )
  .map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    country: countryById[s.country_id]?.slug,
    after_slug: s.country_id === india?.id && s.slug === "punjab-in" ? "punjab" : s.slug,
  }));

const reusedCities = (cities.data || []).map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  country: countryById[c.country_id]?.slug,
  state_id: c.state_id,
}));

const kg = (kgs.data || []).find((k) => k.slug === "city-chat-room");
const tpl = (tpls.data || []).find((t) => t.slug === "default-city-chat-room" || t.slug === "city-chat-room");

const report = {
  ok: issues.length === 0,
  issues,
  india_punjab: {
    current: indiaPunjab
      ? { id: indiaPunjab.id, name: indiaPunjab.name, slug: indiaPunjab.slug }
      : null,
    plan: {
      action: "UPDATE slug only (preserve ID)",
      from_slug: "punjab-in",
      to_slug: "punjab",
      preserve_id: indiaPunjab?.id ?? null,
    },
    references: {
      page_cities: cityRefs,
      custom_pages: pageRefs,
      note: cityRefs.length === 0 && pageRefs.length === 0
        ? "No FK references today — slug rename is still ID-preserving for future FKs."
        : "References found — ID will be preserved; only slug changes.",
    },
  },
  phase1_reuse: {
    countries: (countries.data || []).map((c) => ({ id: c.id, slug: c.slug })),
    states: reusedStates,
    cities: reusedCities,
    categories: (cats.data || []).map((c) => ({
      id: c.id,
      slug: c.slug,
      parent_id: c.parent_id,
      after_parent: c.slug === "chat-rooms" ? null : "chat-rooms",
    })),
    keyword_group_city_chat_room: kg
      ? { before: { id: kg.id, slug: kg.slug, name: kg.name }, after: { id: kg.id, slug: "city-chat-room", name: "City Chat Room" } }
      : null,
    template_city_chat_room: tpl
      ? {
          before: { id: tpl.id, slug: tpl.slug, name: tpl.name, is_default: tpl.is_default },
          after: { id: tpl.id, slug: "city-chat-room", name: "City Chat Room", is_default: true },
          note: tpl.slug === "default-city-chat-room"
            ? "Will rename slug default-city-chat-room → city-chat-room preserving ID, then UPSERT scaffold fields."
            : "Already on city-chat-room; UPSERT will update fields in place.",
        }
      : null,
  },
  expected_counts_after_apply: {
    india_states: 36,
    india_cities: 69,
    pakistan_states: 7,
    pakistan_cities: 32,
    categories: 14,
    keyword_groups: 5,
    templates: 4,
    note: "Counts from Phase 4A source seed; no custom_pages created.",
  },
  apply_status: "NOT APPLIED — waiting for explicit approval",
};

console.log(JSON.stringify(report, null, 2));
process.exit(issues.length ? 1 : 0);
