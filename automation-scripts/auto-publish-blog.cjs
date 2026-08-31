/**
 * auto-publish-blog.cjs
 * -----------------------------------------------------
 * Reads topics from blog-topics.json, skips any title already
 * in blog_posts (any status), and publishes the next
 * POSTS_PER_RUN topics — with SEO metadata (keywords, tags,
 * reading time), exactly 2 internal links (Yaarzo signup +
 * a relevant static chatroom page, GUARANTEED present even if
 * the AI forgets), an image placeholder comment, and a
 * "Related Reads" section linking to other posts in the same
 * category.
 *
 * USAGE:
 *   node auto-publish-blog.cjs
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const POSTS_PER_RUN = 2;
const TOPICS_FILE = path.join(__dirname, 'blog-topics.json');
const chatroomUrls = JSON.parse(fs.readFileSync(path.join(__dirname, 'chatroom-urls.json'), 'utf8'));

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

async function generateUniqueSlug(title) {
  const base = slugify(title);
  let candidate = base;
  let counter = 2;
  while (true) {
    const { data } = await supabaseAdmin.from('blog_posts').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

function pickChatroomUrl(title) {
  const lower = title.toLowerCase();
  for (const [keyword, url] of Object.entries(chatroomUrls.keywordMap)) {
    if (lower.includes(keyword)) return url;
  }
  const pool = [...chatroomUrls.interest, ...chatroomUrls.type];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Ensures both required links exist in the HTML — adds them in code if the AI forgot. */
function ensureRequiredLinks(html, chatroomUrl) {
  let finalHtml = html;

  if (!finalHtml.includes('/signup')) {
    const signupPhrases = ['sign up on Yaarzo', 'join for free', 'create your free account', 'get started here'];
    const phrase = signupPhrases[Math.floor(Math.random() * signupPhrases.length)];
    finalHtml += `<p>Ready to get started? <a href="https://yaarzo.com/signup">${phrase}</a>.</p>`;
  }

  if (!finalHtml.includes(chatroomUrl)) {
    const fallbackPhrases = ['give it a try here', 'check it out', 'take a look', "see what it's like"];
    const phrase = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    finalHtml += `<p>Want to jump straight in? <a href="${chatroomUrl}">${phrase}</a>.</p>`;
  }

  return finalHtml;
}

async function generateContent(title, chatroomUrl) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Write an SEO-optimized blog post for Yaarzo, a free online chatroom and social community platform, on the topic: "${title}".

Target audience: global, English-speaking.

Structure rules:
- Do NOT include an <h1>
- Use 3-5 <h2> section headings targeting natural long-tail search phrases
- Use <h3> sub-headings where it helps scannability
- 800-1000 words total
- Write for humans first: specific, concrete advice, no generic filler
- Vary sentence rhythm — mix short and long sentences like a real writer would
- Output clean HTML only (h2, h3, p, ul/li, strong, a, and the one HTML comment described below) — no <html>/<body>/<h1> tags
- Right after the intro paragraph, insert exactly this on its own line: <!-- IMAGE: a real 5-10 word description of an image that would fit here --> (a human will manually add the real image later — do not embed an actual <img> tag)

Include EXACTLY 2 internal links, naturally placed in different sections (not next to each other):
1. One link to https://yaarzo.com/signup — vary the anchor text each time, e.g. "sign up on Yaarzo", "join Yaarzo for free", "create a free account", "get started on Yaarzo". Never just the word "Yaarzo" as the link text.
2. One link to ${chatroomUrl} — write short (2-5 word), natural anchor text that fits the sentence, based on what that page is about (infer from the URL slug). Never dump a full page title as anchor text.

Both links are REQUIRED — do not skip either one. Do not add any other links. Do not reuse the same anchor text pattern across sentences.

After the article, on a new line, output exactly:
---META---
KEYWORDS: keyword one, keyword two, keyword three, keyword four, keyword five
TAGS: tag-one, tag-two, tag-three
READING_TIME: <integer minutes>`,
    }],
  });

  const fullText = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const [contentHtml, metaBlock] = fullText.split('---META---');

  const keywordsMatch = metaBlock?.match(/KEYWORDS:\s*(.+)/i);
  const tagsMatch = metaBlock?.match(/TAGS:\s*(.+)/i);
  const readingTimeMatch = metaBlock?.match(/READING_TIME:\s*(\d+)/i);

  const finalHtml = ensureRequiredLinks(contentHtml.trim(), chatroomUrl);

  return {
    contentHtml: finalHtml,
    keywords: keywordsMatch?.[1]?.trim() ?? '',
    tags: tagsMatch?.[1]?.split(',').map((t) => t.trim()).filter(Boolean) ?? [],
    readingTime: readingTimeMatch ? parseInt(readingTimeMatch[1]) : 5,
  };
}

async function getCategoryId(slug) {
  const { data } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function getAlreadyPublishedTitles() {
  const { data } = await supabaseAdmin.from('blog_posts').select('title');
  return new Set((data ?? []).map((p) => p.title.trim()));
}

async function getRelatedBlogPosts(categoryId, excludeSlug, count = 3) {
  if (!categoryId) return [];
  const { data } = await supabaseAdmin
    .from('blog_posts')
    .select('title, slug')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('slug', excludeSlug)
    .limit(count);
  return data ?? [];
}

function buildRelatedHtml(relatedPosts) {
  if (relatedPosts.length === 0) return '';
  const items = relatedPosts
    .map((p) => `<li><a href="https://yaarzo.com/blog/${p.slug}">${p.title}</a></li>`)
    .join('');
  return `<h2>Related Reads</h2><ul>${items}</ul>`;
}

async function publishTopic(topic) {
  console.log(`\n📝 Generating: ${topic.title}...`);

  const chatroomUrl = pickChatroomUrl(topic.title);
  const [generated, slug, categoryId] = await Promise.all([
    generateContent(topic.title, chatroomUrl),
    generateUniqueSlug(topic.title),
    getCategoryId(topic.category_slug),
  ]);

  if (!categoryId) {
    console.error(`❌ Category "${topic.category_slug}" not found — skipping "${topic.title}"`);
    return false;
  }

  const relatedPosts = await getRelatedBlogPosts(categoryId, slug);
  const relatedHtml = buildRelatedHtml(relatedPosts);

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title: topic.title,
      slug,
      meta_description: topic.metaDescription,
      content: generated.contentHtml + relatedHtml,
      keywords: generated.keywords,
      tags: generated.tags,
      reading_time_minutes: generated.readingTime,
      category_id: categoryId,
      author_id: null,
      last_refreshed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error(`❌ Insert failed for "${topic.title}":`, insertError.message);
    return false;
  }

  const { error: updateError } = await supabaseAdmin
    .from('blog_posts')
    .update({ status: 'published' })
    .eq('id', inserted.id);

  if (updateError) {
    console.error(`❌ Publish step failed for "${topic.title}":`, updateError.message);
    return false;
  }

  console.log(`✅ Published: yaarzo.com/blog/${slug}`);
  return true;
}

(async () => {
  const allTopics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  const publishedTitles = await getAlreadyPublishedTitles();

  const pendingTopics = allTopics.filter((t) => !publishedTitles.has(t.title.trim()));

  if (pendingTopics.length === 0) {
    console.log('✨ All topics in blog-topics.json have already been published. Add more topics!');
    return;
  }

  const toPublish = pendingTopics.slice(0, POSTS_PER_RUN);
  console.log(`Publishing ${toPublish.length} of ${pendingTopics.length} remaining topic(s)...`);

  for (const topic of toPublish) {
    await publishTopic(topic);
  }

  console.log('\n🎉 Run complete.');
})();
