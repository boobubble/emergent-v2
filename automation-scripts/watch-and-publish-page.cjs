/**
 * watch-and-publish-page.cjs
 * -----------------------------------------------------
 * BRIDGE SCRIPT ONLY — does NOT call Claude/Anthropic, does NOT
 * generate any content. Watches a plain text file
 * (next-page.txt) in automation-scripts. The moment you save
 * that file, it automatically publishes (or refreshes, if the
 * slug already exists) that landing page to custom_pages.
 *
 * NO JSON. Just plain labeled sections, copy-paste friendly.
 * Internal links are pulled automatically from the content —
 * you don't list them separately.
 *
 * SETUP (one time):
 *   1. Put this file in automation-scripts (same folder as
 *      auto-publish-static-pages.cjs).
 *   2. Start it once and leave it running:
 *        node automation-scripts\watch-and-publish-page.cjs
 *      (run from the project ROOT folder so .env.local loads)
 *
 * EVERY TIME YOU WANT TO PUBLISH A PAGE:
 *   1. Open (or create) automation-scripts\next-page.txt
 *   2. Paste using this exact format:
 *
 *      ###TITLE###
 *      Telugu Chat Room – Join Free & Chat with Telugu Speakers Online | Yaarzo
 *      ###H1###
 *      Telugu Chat Room – Join Free & Chat with Telugu Speakers Online
 *      ###SLUG###
 *      telugu-chat-room
 *      ###META_TITLE###
 *      Telugu Chat Room – Free Online, No Signup | Yaarzo
 *      ###META_DESCRIPTION###
 *      Join a free Telugu chat room on Yaarzo...
 *      ###PRIMARY_KEYWORD###
 *      telugu chat room
 *      ###SECONDARY_KEYWORDS###
 *      telugu chat room online, free telugu chat room
 *      ###CATEGORY###
 *      language
 *      ###LOOKUP_CITY###
 *      (leave blank if not a city page)
 *      ###LOOKUP_COUNTRY_HINT###
 *      (leave blank unless needed to disambiguate a city)
 *      ###LOOKUP_COUNTRY###
 *      (leave blank unless this is a country page)
 *      ###CONTENT###
 *      The rest of the file is the full markdown page content.
 *
 *   3. Save the file (Ctrl+S) — it publishes automatically within
 *      a second or two and prints the live URL in this window.
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
const WATCH_DIR = path.join(__dirname, 'automation-scripts');
const DROP_FILE = path.join(WATCH_DIR, 'next-page.txt');
const DONE_DIR = path.join(WATCH_DIR, 'published-log');

if (!fs.existsSync(DONE_DIR)) fs.mkdirSync(DONE_DIR, { recursive: true });

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function markdownToHtml(md) {
  let html = md;
  html = html.replace(/^#\s+.*$/gim, '');
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
      if (/^<!--\s*IMAGE:/i.test(trimmed)) return trimmed; // pass the image placeholder comment through untouched
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

function extractLinks(html) {
  const links = [];
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) links.push(m[1]);
  return [...new Set(links)];
}

/** Parses the ###LABEL### plain-text format. No JSON, nothing to escape. */
function parseDropFile(raw) {
  const sections = raw.split(/###([A-Z0-9_]+)###/);
  const map = {};
  for (let i = 1; i < sections.length; i += 2) {
    const label = sections[i].trim().toLowerCase();
    const value = (sections[i + 1] || '').trim();
    map[label] = value;
  }
  return map;
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

let processing = false;

async function handlePublish() {
  if (processing) return;
  processing = true;
  try {
    if (!fs.existsSync(DROP_FILE)) return;
    const raw = fs.readFileSync(DROP_FILE, 'utf8');
    if (!raw.trim()) return;

    const f = parseDropFile(raw);
    const required = ['title', 'h1', 'slug', 'meta_description', 'primary_keyword', 'category', 'content'];
    const missing = required.filter((k) => !f[k]);
    if (missing.length) {
      console.error(`❌ Missing section(s) in next-page.txt: ${missing.map((m) => '###' + m.toUpperCase() + '###').join(', ')}`);
      return;
    }

    const slug = slugify(f.slug);
    console.log(`\n📝 Detected save — publishing: ${slug}`);

    const { cityId, countryId: cityCountryId } = await findCityId(f.lookup_city, f.lookup_country_hint);
    const directCountryId = f.lookup_country ? await findCountryId(f.lookup_country) : cityCountryId;

    const contentHtml = markdownToHtml(f.content);
    const linksUsed = extractLinks(contentHtml);
    const secondaryKeywords = (f.secondary_keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    const metaKeywords = [f.primary_keyword, ...secondaryKeywords].join(', ');

    const payload = {
      title: f.title,
      h1: f.h1,
      content: contentHtml,
      excerpt: f.meta_description,
      category: f.category,
      primary_keyword: f.primary_keyword,
      secondary_keywords: secondaryKeywords,
      keyword_group_id: null,
      meta_title: f.meta_title || f.title,
      meta_description: f.meta_description,
      meta_keywords: metaKeywords,
      og_title: f.meta_title || f.title,
      og_description: f.meta_description,
      canonical_url: `https://yaarzo.com/${slug}`,
      faq_content: [],
      internal_links_json: linksUsed,
      internal_link_count: linksUsed.length,
      schema_jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: f.meta_title || f.title,
        description: f.meta_description,
      },
      city_id: cityId,
      country_id: directCountryId,
      content_status: 'complete',
      status: 'published',
      last_refreshed_at: new Date().toISOString(),
      language: 'en',
    };

    const { data: existing } = await supabaseAdmin.from('custom_pages').select('slug').eq('slug', slug).maybeSingle();

    let liveUrl;
    if (existing) {
      const { error } = await supabaseAdmin.from('custom_pages').update(payload).eq('slug', slug);
      if (error) throw new Error('Update failed: ' + error.message);
      liveUrl = `yaarzo.com/${slug}`;
      console.log(`✅ Refreshed (same URL): ${liveUrl}`);
    } else {
      const { error } = await supabaseAdmin.from('custom_pages').insert({
        slug,
        published_at: new Date().toISOString(),
        ...payload,
      });
      if (error) throw new Error('Insert failed: ' + error.message);
      liveUrl = `yaarzo.com/${slug}`;
      console.log(`✅ Published (new page): ${liveUrl}`);
    }

    console.log(`   Internal links found: ${linksUsed.length}`);

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(DROP_FILE, path.join(DONE_DIR, `${stamp}__${slug}.txt`));
    fs.writeFileSync(DROP_FILE, '');
    console.log('   (next-page.txt cleared — paste your next page whenever ready)');
  } catch (err) {
    console.error('❌', err.message);
  } finally {
    processing = false;
  }
}

console.log('👀 Watching automation-scripts/next-page.txt ...');
console.log('   Paste a landing page there (see the format in this file\'s comments) and save — it publishes automatically.');
console.log('   Leave this window running. Press Ctrl+C to stop.\n');

if (!fs.existsSync(DROP_FILE)) fs.writeFileSync(DROP_FILE, '');

let debounceTimer = null;
fs.watch(DROP_FILE, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handlePublish, 500);
});
