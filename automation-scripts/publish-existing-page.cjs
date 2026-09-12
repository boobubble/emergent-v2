/**
 * publish-existing-page.cjs
 * -----------------------------------------------------
 * BRIDGE SCRIPT ONLY — does NOT call Claude/Anthropic, does NOT
 * generate any content. Takes a landing page you already wrote
 * (e.g. from a chat) and inserts or updates it in the
 * custom_pages table, reusing the same Supabase connection
 * pattern and column shape as your existing
 * auto-publish-static-pages.cjs.
 *
 * Auto-detects insert vs update: if the slug already exists in
 * custom_pages, this UPDATES that row (same URL, refreshed
 * content) — exactly the ~15-day refresh workflow. If the slug
 * doesn't exist yet, it INSERTS a new page.
 *
 * SETUP (one time):
 *   1. Put this file in the SAME folder as your existing
 *      auto-publish-static-pages.cjs script.
 *   2. In that same folder, create page-to-publish.json
 *      (see the template in the chat message).
 *
 * USAGE:
 *   node publish-existing-page.cjs
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const INPUT_FILE = path.join(__dirname, 'page-to-publish.json');

// ---- Markdown -> HTML (same small converter as the blog bridge script) ----
function markdownToHtml(md) {
  let html = md;
  html = html.replace(/^#\s+.*$/gim, ''); // strip any H1 line — h1 column covers that
  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^-\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h2|h3|ul|li)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  // Make the "Join Chatroom" CTA visually stand out using only plain text formatting
  // (bold + emoji + arrow) -- no CSS class or inline style needed, so it always survives
  // whatever HTML sanitizer the site applies.
  html = html.replace(
    /<a href="([^"]+)">Join Chatroom<\/a>/i,
    '<a href="$1">\uD83D\uDCAC <strong>Join Chatroom</strong> \u2192</a>'
  );

  return html;
}

// Pulls every href="..." out of the finished HTML so internal_links_json /
// internal_link_count stay accurate without you having to list links twice.
function extractLinks(html) {
  const links = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) links.push(m[1]);
  return [...new Set(links)];
}

async function findCityId(lookupCity, countryHint) {
  if (!lookupCity) return { cityId: null, countryId: null };
  const { data } = await supabaseAdmin.from('page_cities').select('id, country_id, name').ilike('name', lookupCity);
  if (!data || data.length === 0) return { cityId: null, countryId: null };
  if (data.length === 1) return { cityId: data[0].id, countryId: data[0].country_id };
  if (countryHint) {
    const { data: country } = await supabaseAdmin.from('page_countries').select('id').ilike('name', countryHint).maybeSingle();
    if (country) {
      const match = data.find((c) => c.country_id === country.id);
      if (match) return { cityId: match.id, countryId: match.country_id };
    }
  }
  return { cityId: data[0].id, countryId: data[0].country_id };
}

async function findCountryId(name) {
  if (!name) return null;
  const { data } = await supabaseAdmin.from('page_countries').select('id').ilike('name', name).maybeSingle();
  return data?.id ?? null;
}

(async () => {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ ${INPUT_FILE} not found. Create page-to-publish.json in this same folder first.`);
    process.exit(1);
  }

  const page = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  const required = ['slug', 'title', 'h1', 'content', 'meta_description', 'primary_keyword', 'category'];
  const missing = required.filter((f) => !page[f]);
  if (missing.length) {
    console.error(`❌ Missing required field(s) in page-to-publish.json: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📝 Preparing: ${page.slug}`);

  try {
    const { cityId, countryId: cityCountryId } = await findCityId(page.lookup_city, page.lookup_country_hint);
    const directCountryId = page.lookup_country ? await findCountryId(page.lookup_country) : cityCountryId;

    const contentHtml = markdownToHtml(page.content);
    const linksUsed = extractLinks(contentHtml);
    const secondaryKeywords = Array.isArray(page.secondary_keywords)
      ? page.secondary_keywords
      : (page.secondary_keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    const metaKeywords = [page.primary_keyword, ...secondaryKeywords].join(', ');

    const payload = {
      title: page.title,
      h1: page.h1,
      content: contentHtml,
      excerpt: page.meta_description,
      category: page.category,
      primary_keyword: page.primary_keyword,
      secondary_keywords: secondaryKeywords,
      keyword_group_id: null,
      meta_title: page.meta_title || page.title,
      meta_description: page.meta_description,
      meta_keywords: metaKeywords,
      og_title: page.og_title || page.meta_title || page.title,
      og_description: page.og_description || page.meta_description,
      canonical_url: `https://yaarzo.com/${page.slug}`,
      faq_content: Array.isArray(page.faq) ? page.faq : [],
      internal_links_json: linksUsed,
      internal_link_count: linksUsed.length,
      schema_jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.meta_title || page.title,
        description: page.meta_description,
      },
      city_id: cityId,
      country_id: directCountryId,
      content_status: 'complete',
      status: 'published',
      last_refreshed_at: new Date().toISOString(),
      language: 'en',
    };

    const { data: existing } = await supabaseAdmin.from('custom_pages').select('slug').eq('slug', page.slug).maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin.from('custom_pages').update(payload).eq('slug', page.slug);
      if (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
      }
      console.log(`✅ Refreshed (same URL): yaarzo.com/${page.slug}`);
    } else {
      const { error } = await supabaseAdmin.from('custom_pages').insert({
        slug: page.slug,
        published_at: new Date().toISOString(),
        ...payload,
      });
      if (error) {
        console.error('❌ Insert failed:', error.message);
        process.exit(1);
      }
      console.log(`✅ Published (new page): yaarzo.com/${page.slug}`);
    }

    console.log(`   Internal links found: ${linksUsed.length}`);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();
