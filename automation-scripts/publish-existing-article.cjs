/**
 * publish-existing-article.cjs
 * -----------------------------------------------------
 * BRIDGE SCRIPT ONLY — does NOT call Claude/Anthropic, does NOT
 * generate any content. It takes an article you already wrote
 * (e.g. from a chat) and inserts it into the blog_posts table,
 * reusing the same Supabase connection pattern as your existing
 * auto-publish-blog.cjs.
 *
 * SETUP (one time):
 *   1. Put this file in the SAME folder as your existing
 *      auto-publish-blog.cjs script.
 *   2. In that same folder, create a file called
 *      article-to-publish.json (see the template further down
 *      in the chat message for what goes in it).
 *
 * USAGE:
 *   node publish-existing-article.cjs
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — check your existing script uses the same variable names.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const INPUT_FILE = path.join(__dirname, 'article-to-publish.json');

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
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

async function getCategoryId(slug) {
  const { data, error } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).single();
  if (error || !data) {
    throw new Error(`Category "${slug}" not found in the categories table. Check the spelling of category_slug in article-to-publish.json.`);
  }
  return data.id;
}

// Small Markdown -> HTML converter, matching the h2/h3/p/ul/li/strong/a style
// your blog_posts.content column already expects (no <h1> — the title field covers that).
function markdownToHtml(md) {
  let html = md;
  html = html.replace(/^#\s+.*$/gim, ''); // strip any H1 line entirely
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

function estimateReadingTime(rawText) {
  const words = rawText.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

(async () => {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ ${INPUT_FILE} not found. Create article-to-publish.json in this same folder first.`);
    process.exit(1);
  }

  const article = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  const required = ['title', 'meta_description', 'content', 'category_slug'];
  const missing = required.filter((f) => !article[f]);
  if (missing.length) {
    console.error(`❌ Missing required field(s) in article-to-publish.json: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📝 Preparing to publish: "${article.title}"`);

  try {
    const categoryId = await getCategoryId(article.category_slug);
    const slug = await generateUniqueSlug(article.title, article.slug);
    const contentHtml = markdownToHtml(article.content);
    const readingTime = article.reading_time_minutes || estimateReadingTime(article.content);
    const tags = Array.isArray(article.tags)
      ? article.tags
      : (article.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

    // If the exact slug given (or already implied by the title) already exists,
    // UPDATE that row in place instead of creating a near-duplicate post.
    const intendedSlug = article.slug ? slugify(article.slug) : slugify(article.title);
    const { data: existing } = await supabaseAdmin.from('blog_posts').select('id, slug').eq('slug', intendedSlug).maybeSingle();

    const payload = {
      title: article.title,
      meta_description: article.meta_description,
      content: contentHtml,
      keywords: article.keywords || '',
      tags,
      reading_time_minutes: readingTime,
      category_id: categoryId,
      last_refreshed_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updateError } = await supabaseAdmin.from('blog_posts').update(payload).eq('id', existing.id);
      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        process.exit(1);
      }
      console.log(`✅ Refreshed (same URL): yaarzo.com/blog/${intendedSlug}`);
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('blog_posts')
        .insert({ slug, author_id: null, ...payload })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        process.exit(1);
      }

      const { error: publishError } = await supabaseAdmin
        .from('blog_posts')
        .update({ status: 'published' })
        .eq('id', inserted.id);

      if (publishError) {
        console.error('❌ Publish step failed (row was inserted but stayed unpublished):', publishError.message);
        process.exit(1);
      }

      console.log(`✅ Published (new post): yaarzo.com/blog/${slug}`);
    }
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();
