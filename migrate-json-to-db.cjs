/**
 * migrate-json-to-db.cjs
 * -----------------------------------------------------
 * One-shot upsert of historical JSON idea lists into
 * blog_topic_ideas and static_page_ideas.
 *
 * USAGE:
 *   node migrate-json-to-db.cjs
 * -----------------------------------------------------
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function resolveJson(name) {
  const candidates = [
    path.join(__dirname, "automation-scripts", name),
    path.join(__dirname, name),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }
  return null;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsertBlogTopics(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(raw)) {
    console.error("❌ blog-topics.json is not an array");
    return { success: 0, error: 1 };
  }

  const rows = raw
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      category_slug: String(item.category_slug ?? "").trim(),
      meta_description: item.metaDescription ? String(item.metaDescription).trim() : null,
    }))
    .filter((row) => row.title && row.category_slug);

  let success = 0;
  let error = 0;
  for (const batch of chunk(rows, 200)) {
    const { data, error: err } = await supabaseAdmin
      .from("blog_topic_ideas")
      .upsert(batch, { onConflict: "title" })
      .select("title");
    if (err) {
      console.error("❌ blog_topic_ideas upsert failed:", err.message);
      error += batch.length;
    } else {
      success += data?.length ?? batch.length;
    }
  }
  return { success, error, total: rows.length };
}

async function upsertStaticPages(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(raw)) {
    console.error("❌ static-pages-master.json is not an array");
    return { success: 0, error: 1 };
  }

  const rows = raw
    .map((item) => ({
      slug: String(item.slug ?? "").trim(),
      section: String(item.section ?? "").trim(),
      base_name: String(item.base_name ?? "").trim(),
      lookup_city: item.lookup_city ?? null,
      lookup_country_hint: item.lookup_country_hint ?? null,
    }))
    .filter((row) => row.slug && row.section && row.base_name);

  let success = 0;
  let error = 0;
  for (const batch of chunk(rows, 200)) {
    const { data, error: err } = await supabaseAdmin
      .from("static_page_ideas")
      .upsert(batch, { onConflict: "slug" })
      .select("slug");
    if (err) {
      console.error("❌ static_page_ideas upsert failed:", err.message);
      error += batch.length;
    } else {
      success += data?.length ?? batch.length;
    }
  }
  return { success, error, total: rows.length };
}

(async () => {
  const blogFile = resolveJson("blog-topics.json");
  const pagesFile = resolveJson("static-pages-master.json");

  if (!blogFile) {
    console.error("❌ Could not find blog-topics.json (looked in ./automation-scripts and .)");
  }
  if (!pagesFile) {
    console.error("❌ Could not find static-pages-master.json (looked in ./automation-scripts and .)");
  }

  if (blogFile) {
    const blog = await upsertBlogTopics(blogFile);
    console.log(
      `blog_topic_ideas: ${blog.success} upserted, ${blog.error} errors (from ${blog.total} rows in ${path.relative(process.cwd(), blogFile)})`,
    );
  }

  if (pagesFile) {
    const pages = await upsertStaticPages(pagesFile);
    console.log(
      `static_page_ideas: ${pages.success} upserted, ${pages.error} errors (from ${pages.total} rows in ${path.relative(process.cwd(), pagesFile)})`,
    );
  }

  if (!blogFile && !pagesFile) process.exit(1);
})();
