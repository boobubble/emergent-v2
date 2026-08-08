#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { customPageSitemapEntries, formatSitemapLastmod } from "../src/lib/seo/sitemap.ts";

function loadEnv() {
  const out = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (m && (out[m[1]] == null || out[m[1]] === "")) {
        out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
      }
    }
  }
  return out;
}

const env = loadEnv();
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const LAHORE_ID = "e26569bc-f359-47a6-9646-2da179ee183a";
const EXPECTED_HASH = "32f1f9bca05482a14be8ef7b52b2698b2f05256eadb9d2a0572ac550197be2e7";
const ALL_DRAFTS = [
  "pakistan-chat-room", "india-chat-room",
  "karachi-chat-room", "islamabad-chat-room", "rawalpindi-chat-room", "faisalabad-chat-room",
  "multan-chat-room", "gujranwala-chat-room", "peshawar-chat-room", "quetta-chat-room",
  "sialkot-chat-room", "hyderabad-pakistan-chat-room",
  "delhi-chat-room", "mumbai-chat-room", "bengaluru-chat-room", "hyderabad-india-chat-room",
  "chennai-chat-room", "kolkata-chat-room", "pune-chat-room", "ahmedabad-chat-room",
  "surat-chat-room", "jaipur-chat-room",
  "girls-chat-room", "dating-chat-room", "friendship-chat-room", "free-chat-room", "random-chat-room",
];

const { data: lahore } = await sb
  .from("custom_pages")
  .select("id,slug,status,updated_at,page_type,country_id,state_id,city_id,category_id,template_id,keyword_group_id,content,noindex")
  .eq("id", LAHORE_ID)
  .maybeSingle();
const hash = createHash("sha256").update(lahore?.content || "").digest("hex");

const anonPublished = {};
for (const slug of ["karachi-chat-room", "mumbai-chat-room", "hyderabad-india-chat-room", "pakistan-chat-room", "girls-chat-room"]) {
  const { data } = await sb.from("custom_pages").select("id,slug,status").eq("slug", slug).eq("status", "published").maybeSingle();
  anonPublished[slug] = data;
}

const entries = customPageSitemapEntries(
  [
    { slug: "lahore-chat-room", updated_at: new Date("2026-08-04T08:29:37.012Z"), noindex: false },
    { slug: "karachi-chat-room", updated_at: new Date("2026-08-08T06:27:24.235Z"), noindex: true },
  ],
  new Set(),
  { canonical_domain: "https://yaarzo.com" },
);

const http = {};
for (const slug of ["karachi-chat-room", "mumbai-chat-room", "hyderabad-india-chat-room", "lahore-chat-room"]) {
  const res = await fetch(`https://yaarzo.com/${slug}`, { redirect: "manual" });
  http[slug] = res.status;
}
const xml = await (await fetch("https://yaarzo.com/sitemap.xml")).text();
const draftHits = ALL_DRAFTS.filter((s) => xml.includes("/" + s + "</loc>"));

const report = {
  lahore: {
    id: lahore?.id,
    slug: lahore?.slug,
    status: lahore?.status,
    noindex: lahore?.noindex,
    updated_at: lahore?.updated_at,
    page_type: lahore?.page_type,
    country_id: lahore?.country_id,
    state_id: lahore?.state_id,
    city_id: lahore?.city_id,
    category_id: lahore?.category_id,
    template_id: lahore?.template_id,
    keyword_group_id: lahore?.keyword_group_id,
    content_len: (lahore?.content || "").length,
    hash,
    hash_ok: hash === EXPECTED_HASH,
  },
  anon_published_for_drafts: anonPublished,
  sitemap_helper_date_entries: entries,
  format_string: formatSitemapLastmod("2026-08-08T06:27:22.166Z"),
  format_date: formatSitemapLastmod(new Date("2026-08-08T06:27:22.166Z")),
  http,
  public_sitemap_draft_hits: draftHits,
  public_sitemap_has_lahore: xml.includes("/lahore-chat-room"),
};

writeFileSync("/tmp/phase4b2-public-verify.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
