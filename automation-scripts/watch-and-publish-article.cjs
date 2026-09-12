/**
 * watch-and-publish-article.cjs
 * -----------------------------------------------------
 * BRIDGE SCRIPT ONLY — does NOT call Claude/Anthropic, does NOT
 * generate any content. Watches a plain text file
 * (next-article.txt) in this folder. The moment you save that
 * file, it automatically publishes (or refreshes, if the slug
 * already exists) that article to the blog_posts table.
 *
 * NO JSON. Just plain labeled sections, copy-paste friendly.
 *
 * SETUP (one time):
 *   1. Put this file in the SAME folder as your existing
 *      auto-publish-blog.cjs script (automation-scripts).
 *   2. Start it once and leave it running:
 *        node automation-scripts\watch-and-publish-article.cjs
 *      (run it from the project ROOT folder, same as your
 *      other scripts, so .env.local loads correctly)
 *
 * EVERY TIME YOU WANT TO PUBLISH:
 *   1. Open (or create) automation-scripts\next-article.txt
 *   2. Paste your article using this exact format:
 *
 *      ###TITLE###
 *      Are Telugu Chat Rooms Safe? A Complete Safety and Privacy Guide
 *      ###SLUG###
 *      telugu-chat-room-safety-guide
 *      ###META###
 *      A one or two sentence meta description here.
 *      ###KEYWORDS###
 *      keyword one, keyword two, keyword three
 *      ###TAGS###
 *      tag one, tag two, tag three
 *      ###CATEGORY###
 *      chatrooms
 *      ###CONTENT###
 *      The rest of the file, from here to the end, is the full
 *      markdown article. Paste everything after this line —
 *      headings, paragraphs, links, everything.
 *
 *   3. Save the file (Ctrl+S). That's it — watch this terminal
 *      window, it will publish automatically within a second or
 *      two and print the live URL.
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
const DROP_FILE = path.join(WATCH_DIR, 'next-article.txt');
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

function estimateReadingTime(rawText) {
  const words = rawText.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Parses the ###LABEL### plain-text format. No JSON, nothing to escape. */
function parseDropFile(raw) {
  const sections = raw.split(/###([A-Z]+)###/);
  // sections[0] is anything before the first marker (ignored); then pairs of [LABEL, content, LABEL, content...]
  const map = {};
  for (let i = 1; i < sections.length; i += 2) {
    const label = sections[i].trim().toLowerCase();
    const value = (sections[i + 1] || '').trim();
    map[label] = value;
  }
  return map;
}

async function getCategoryId(slug) {
  const { data, error } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).single();
  if (error || !data) throw new Error(`Category "${slug}" not found in categories table.`);
  return data.id;
}

async function generateUniqueSlug(title, providedSlug) {
  const base = providedSlug ? slugify(providedSlug) : slugify(title);
  let candidate = base;
  let counter = 2;
  while (true) {
    const { data } = await supabaseAdmin.from('blog_posts').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

let processing = false;

async function handlePublish() {
  if (processing) return; // ignore rapid double-saves
  processing = true;
  try {
    if (!fs.existsSync(DROP_FILE)) return;
    const raw = fs.readFileSync(DROP_FILE, 'utf8');
    if (!raw.trim()) return; // empty file, nothing to do (e.g. right after we clear it)

    const fields = parseDropFile(raw);
    const required = ['title', 'meta', 'category', 'content'];
    const missing = required.filter((f) => !fields[f]);
    if (missing.length) {
      console.error(`❌ Missing section(s) in next-article.txt: ${missing.map((m) => '###' + m.toUpperCase() + '###').join(', ')}`);
      return;
    }

    console.log(`\n📝 Detected save — publishing: "${fields.title}"`);

    const categoryId = await getCategoryId(fields.category);
    const contentHtml = markdownToHtml(fields.content);
    const readingTime = estimateReadingTime(fields.content);
    const tags = (fields.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
    const intendedSlug = fields.slug ? slugify(fields.slug) : slugify(fields.title);

    const { data: existing } = await supabaseAdmin.from('blog_posts').select('id, slug').eq('slug', intendedSlug).maybeSingle();

    const payload = {
      title: fields.title,
      meta_description: fields.meta,
      content: contentHtml,
      keywords: fields.keywords || '',
      tags,
      reading_time_minutes: readingTime,
      category_id: categoryId,
      last_refreshed_at: new Date().toISOString(),
    };

    let liveUrl;
    if (existing) {
      const { error } = await supabaseAdmin.from('blog_posts').update(payload).eq('id', existing.id);
      if (error) throw new Error('Update failed: ' + error.message);
      liveUrl = `yaarzo.com/blog/${intendedSlug}`;
      console.log(`✅ Refreshed (same URL): ${liveUrl}`);
    } else {
      const finalSlug = await generateUniqueSlug(fields.title, fields.slug);
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('blog_posts')
        .insert({ slug: finalSlug, author_id: null, ...payload })
        .select()
        .single();
      if (insertError) throw new Error('Insert failed: ' + insertError.message);

      const { error: publishError } = await supabaseAdmin.from('blog_posts').update({ status: 'published' }).eq('id', inserted.id);
      if (publishError) throw new Error('Publish step failed: ' + publishError.message);

      liveUrl = `yaarzo.com/blog/${finalSlug}`;
      console.log(`✅ Published (new post): ${liveUrl}`);
    }

    // Archive what was just published, then clear the drop file so a future
    // save (not a leftover file-system event) is what triggers the next run.
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(DROP_FILE, path.join(DONE_DIR, `${stamp}__${intendedSlug}.txt`));
    fs.writeFileSync(DROP_FILE, '');
    console.log('   (next-article.txt cleared — paste your next article whenever ready)');
  } catch (err) {
    console.error('❌', err.message);
  } finally {
    processing = false;
  }
}

console.log('👀 Watching automation-scripts/next-article.txt ...');
console.log('   Paste an article there (see the format in this file\'s comments) and save — it publishes automatically.');
console.log('   Leave this window running. Press Ctrl+C to stop.\n');

if (!fs.existsSync(DROP_FILE)) fs.writeFileSync(DROP_FILE, '');

let debounceTimer = null;
fs.watch(DROP_FILE, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handlePublish, 500); // debounce editor's multiple save events
});
