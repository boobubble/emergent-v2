/**
 * backfill-keywords.cjs
 * -----------------------------------------------------
 * Updates keyword-related fields on ALREADY PUBLISHED
 * content — for static pages, assigns keyword_group_id +
 * secondary_keywords using the existing pattern system;
 * for blog posts missing keywords, generates fresh ones
 * via Claude based on the post title.
 *
 * Does NOT touch content, title, or H1 — only keyword/meta
 * fields, so it's safe to run on already-indexed pages.
 *
 * USAGE:
 *   node backfill-keywords.cjs
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

const CITY_SECTIONS = ['india_city', 'pakistan_city', 'us_city', 'uk_city', 'canada_city', 'australia_city', 'city_subcategory'];

function keywordGroupSlugFor(section) {
  if (CITY_SECTIONS.includes(section)) return 'city-cluster';
  if (section === 'interest') return 'interest-cluster';
  return 'generic-cluster';
}

function fillPattern(pattern, baseName) {
  if (!pattern) return '';
  const name = baseName.toLowerCase();
  const Name = baseName.replace(/\b\w/g, (c) => c.toUpperCase());
  return pattern.replace(/{Name}/g, Name).replace(/{name}/g, name);
}

async function getKeywordGroup(slug) {
  const { data } = await supabaseAdmin.from('page_keyword_groups').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
  return data ?? null;
}

function baseNameFromSlug(slug) {
  return slug.replace(/-chat-room$/, '').replace(/-chat$/, '').replace(/-/g, ' ');
}

async function backfillStaticPages() {
  console.log('\n=== Static Pages ===\n');

  const EXCLUDE_SLUGS = ['about-us', 'privacy-policy', 'terms-conditions', 'contact-us'];

  const { data: pages, error } = await supabaseAdmin
    .from('custom_pages')
    .select('id, slug, category, meta_keywords')
    .eq('status', 'published')
    .is('keyword_group_id', null)
    .not('slug', 'in', `(${EXCLUDE_SLUGS.map((s) => `"${s}"`).join(',')})`);

  if (error) {
    console.error('❌ Failed to fetch pages:', error.message);
    return;
  }

  if (!pages || pages.length === 0) {
    console.log('✨ No static pages missing keyword_group_id. All up to date.');
    return;
  }

  console.log(`Found ${pages.length} page(s) missing keyword clustering. Updating...\n`);

  for (const page of pages) {
    const baseName = baseNameFromSlug(page.slug);
    const groupSlug = keywordGroupSlugFor(page.category);
    const group = await getKeywordGroup(groupSlug);

    if (!group) {
      console.log(`⚠️ No group found for "${page.slug}" (category: ${page.category}) — skipping.`);
      continue;
    }

    const primaryKeyword = fillPattern(group.primary_pattern, baseName);
    const secondaryKeywords = group.secondary_patterns.map((p) => fillPattern(p, baseName));
    const existingKeywords = page.meta_keywords ? page.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean) : [];
    const combinedKeywords = [...new Set([primaryKeyword, ...secondaryKeywords, ...existingKeywords])];

    const { error: updateError } = await supabaseAdmin
      .from('custom_pages')
      .update({
        primary_keyword: primaryKeyword,
        secondary_keywords: secondaryKeywords,
        keyword_group_id: group.id,
        meta_keywords: combinedKeywords.join(', '),
      })
      .eq('id', page.id);

    if (updateError) {
      console.error(`❌ Failed to update "${page.slug}":`, updateError.message);
      continue;
    }
    console.log(`✅ Updated: ${page.slug} (group: ${groupSlug})`);
  }
}

async function generateBlogKeywords(title) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `For a blog post titled "${title}" on Yaarzo (a free online chatroom and social community platform), output ONLY a comma-separated list of 5-7 relevant SEO keywords. No commentary, no numbering, just the comma-separated list.`,
    }],
  });
  return message.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

async function backfillBlogPosts() {
  console.log('\n=== Blog Posts ===\n');

  const { data: posts, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, keywords')
    .eq('status', 'published')
    .or('keywords.is.null,keywords.eq.');

  if (error) {
    console.error('❌ Failed to fetch posts:', error.message);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('✨ No blog posts missing keywords. All up to date.');
    return;
  }

  console.log(`Found ${posts.length} post(s) missing keywords. Updating...\n`);

  for (const post of posts) {
    const keywords = await generateBlogKeywords(post.title);

    const { error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({ keywords })
      .eq('id', post.id);

    if (updateError) {
      console.error(`❌ Failed to update "${post.title}":`, updateError.message);
      continue;
    }
    console.log(`✅ Updated: ${post.title}`);
  }
}

(async () => {
  await backfillStaticPages();
  await backfillBlogPosts();
  console.log('\n🎉 Backfill complete.');
})();
