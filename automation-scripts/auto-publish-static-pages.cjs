/**
 * DEPRECATED for automatic use as of 2026-08-31 — superseded by
 * /api/run-static-publish (see /admin/content-automation).
 * Kept for reference / manual emergency use only.
 *
 * auto-publish-static-pages.cjs
 * -----------------------------------------------------
 * Handles two things:
 * 1. REGENERATE_SLUGS — pages already published that need to be
 *    fixed/refreshed (updates the existing row, same slug/URL).
 * 2. New pages — the next PAGES_PER_RUN pages from the master
 *    list that don't exist in custom_pages yet (inserts new rows).
 *
 * Includes:
 *   - Keyword clustering via page_keyword_groups — consistent
 *     title/meta/h1 patterns + secondary keywords per page type
 *     (city, interest, generic), signaling topical authority
 *   - Blog mention link is GUARANTEED (code-level fallback)
 *   - related_chat_rooms populated with clean, short anchor labels
 *   - Anchor text is short and natural, never a dumped page title
 *   - An <!-- IMAGE: ... --> placeholder comment after the intro
 *   - A "Start Chatting Now" CTA button block appended at the end
 *
 * USAGE:
 *   node auto-publish-static-pages.cjs
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

const PAGES_PER_RUN = 5;

// Slugs to regenerate (fix existing content) in this run.
// Clear this array back to [] once you've regenerated them.
const REGENERATE_SLUGS = [];

const masterList = JSON.parse(fs.readFileSync(path.join(__dirname, 'static-pages-master.json'), 'utf8'));
const chatroomUrls = JSON.parse(fs.readFileSync(path.join(__dirname, 'chatroom-urls.json'), 'utf8'));

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

function labelFromUrl(url) {
  const slug = url.replace(/\/$/, '').split('/').pop();
  const base = slug.replace(/-chat-room$/, '').replace(/-chat$/, '').replace(/-/g, ' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase()) + ' Chat Room';
}

function pickRelatedChatRooms(excludeSlug, count = 4) {
  const pool = [...chatroomUrls.interest, ...chatroomUrls.type]
    .filter((url) => !url.endsWith(`/${excludeSlug}`));
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((url) => ({ title: labelFromUrl(url), url }));
}

/** Matches the site's own buildPageCtaHtml() output exactly (src/lib/page-cta.ts). */
function buildCtaHtml() {
  return [
    `<div class="custom-page-cta">`,
    `<a href="/chatrooms" class="custom-page-cta-button">`,
    `<span>Start Chatting Now</span>`,
    `<span aria-hidden="true">→</span>`,
    `</a>`,
    `<p class="custom-page-cta-note">Free to explore • Join when you are ready</p>`,
    `</div>`,
    `<p></p>`,
  ].join('');
}

/** Ensures both required links exist — adds them in code if the AI forgot. */
function ensureRequiredLinks(html, chatroomUrl, blogPost) {
  let finalHtml = html;

  if (!finalHtml.includes('/signup')) {
    const signupPhrases = ['sign up on Yaarzo', 'join for free', 'create your free account', 'get started here'];
    const phrase = signupPhrases[Math.floor(Math.random() * signupPhrases.length)];
    finalHtml += `<p>Ready to get started? <a href="https://yaarzo.com/signup">${phrase}</a>.</p>`;
  }

  if (!finalHtml.includes(chatroomUrl)) {
    const fallbackPhrases = ['chat rooms like this one', 'a similar chat space', 'this related room'];
    const phrase = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    finalHtml += `<p>You might also like <a href="${chatroomUrl}">${phrase}</a>.</p>`;
  }

  if (blogPost && !finalHtml.includes(blogPost.url)) {
    const blogPhrases = ['this related read', 'a related article', 'more on this topic', 'further reading here'];
    const phrase = blogPhrases[Math.floor(Math.random() * blogPhrases.length)];
    finalHtml += `<p>Curious to dig deeper? Check out <a href="${blogPost.url}">${phrase}</a> for more.</p>`;
  }

  return finalHtml;
}

async function getExistingSlugs() {
  const { data } = await supabaseAdmin.from('custom_pages').select('slug');
  return new Set((data ?? []).map((p) => p.slug));
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

function pickInternalLink(excludeSlug) {
  const pool = [...chatroomUrls.interest, ...chatroomUrls.type].filter((url) => !url.endsWith(`/${excludeSlug}`));
  return pool[Math.floor(Math.random() * pool.length)];
}

async function pickRelevantBlogPost(baseName) {
  const { data: posts } = await supabaseAdmin.from('blog_posts').select('title, slug').eq('status', 'published');
  if (!posts || posts.length === 0) return null;
  const lower = baseName.toLowerCase();
  const matched = posts.find((p) => p.title.toLowerCase().includes(lower));
  const chosen = matched ?? posts[Math.floor(Math.random() * posts.length)];
  return { url: `https://yaarzo.com/blog/${chosen.slug}`, title: chosen.title };
}

async function generatePageContent(entry) {
  const contextLine = entry.section === 'country_language'
    ? `This page is for people from a specific country who want to chat in a specific language: "${entry.base_name}".`
    : entry.lookup_city
    ? `This page targets people in the city of "${entry.base_name}".`
    : entry.section === 'country'
    ? `This page targets people in the country "${entry.base_name}".`
    : entry.section === 'india_state' || entry.section === 'pakistan_province'
    ? `This page targets people in the region "${entry.base_name}".`
    : entry.section === 'language'
    ? `This page is for people who want to chat in "${entry.base_name}".`
    : `This page is themed around "${entry.base_name}".`;

  const internalLink = pickInternalLink(entry.slug);
  const blogPost = await pickRelevantBlogPost(entry.base_name);

  const blogLinkInstruction = blogPost
    ? `3. Exactly one mention of the blog article titled "${blogPost.title}" — this MUST be a real HTML hyperlink: <a href="${blogPost.url}">short natural anchor text about the topic</a>. Do NOT mention the article as plain text without the <a> tag. Keep the anchor text itself to 2-5 words.`
    : '';

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Write SEO landing page content for Yaarzo, a free online chatroom platform, for the page: "${entry.base_name} chat room".

${contextLine}

Requirements:
- 500-750 words total
- Do NOT include an <h1> tag (rendered separately)
- Do NOT include a "join now" or "start chatting" call-to-action button or link — that is added separately
- Use 2-4 <h2> subheadings
- Warm, inviting, conversational tone — written for a real visitor deciding whether to join
- If this is a city/country/region page, naturally reference local flavor (local slang, popular topics, culture) without stereotyping — keep it genuine and light
- Vary sentence rhythm — mix short and long sentences like a real writer would
- Output clean HTML only (h2, p, ul/li, strong, a, and the one HTML comment described below) — no <html>/<body>/<h1>
- Do NOT include any view counters, placeholder text, or meta-commentary in the visible content itself
- Right after the intro paragraph, insert exactly this on its own line: <!-- IMAGE: a real 5-10 word description of an image that would fit here --> (a human will manually replace this with a real image later — do not embed an actual <img> tag)

Include EXACTLY ${blogPost ? '3' : '2'} internal links, each a real <a href="..."> tag, naturally placed in different sections (not clustered together):
1. One link to ${internalLink} — anchor text must be SHORT (2-4 words) and read like a natural phrase mid-sentence — never the full page title. Good: "chat rooms in Lahore", "our gaming community". Bad: dumping the page's SEO title as the link text.
2. One link to https://yaarzo.com/signup — vary the anchor text each time, never just "Yaarzo" (e.g. "sign up on Yaarzo", "join for free", "create your account")
${blogLinkInstruction}

Both/all links above are REQUIRED — do not skip any of them. Do not add any other links. Do not reuse the same anchor text pattern across sentences.

After the content, on a new line, output exactly:
---META---
KEYWORDS: keyword one, keyword two, keyword three
FAQ1_Q: <a real question people would search>
FAQ1_A: <2-3 sentence answer>
FAQ2_Q: <another real question>
FAQ2_A: <2-3 sentence answer>
FAQ3_Q: <another real question>
FAQ3_A: <2-3 sentence answer>`,
    }],
  });

  const fullText = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const [contentHtml, metaBlock] = fullText.split('---META---');
  const get = (key) => metaBlock?.match(new RegExp(`${key}:\\s*(.+)`, 'i'))?.[1]?.trim() ?? '';

  const linkedHtml = ensureRequiredLinks(contentHtml.trim(), internalLink, blogPost);

  return {
    contentHtml: linkedHtml + buildCtaHtml(),
    aiKeywords: get('KEYWORDS'),
    faq: [
      { question: get('FAQ1_Q'), answer: get('FAQ1_A') },
      { question: get('FAQ2_Q'), answer: get('FAQ2_A') },
      { question: get('FAQ3_Q'), answer: get('FAQ3_A') },
    ].filter((f) => f.question && f.answer),
    linksUsed: [internalLink, 'https://yaarzo.com/signup', blogPost?.url].filter(Boolean),
  };
}

async function buildRowPayload(entry, generated, cityId, countryId) {
  const fallbackH1 = `${entry.base_name.replace(/\b\w/g, (c) => c.toUpperCase())} Chat Room`;
  const relatedRooms = pickRelatedChatRooms(entry.slug, 4);

  const groupSlug = keywordGroupSlugFor(entry.section);
  const group = await getKeywordGroup(groupSlug);

  const primaryKeyword = group ? fillPattern(group.primary_pattern, entry.base_name) : `${entry.base_name} chat room`;
  const title = group ? fillPattern(group.title_pattern, entry.base_name) : `${fallbackH1} | Yaarzo`;
  const metaTitle = group ? fillPattern(group.meta_title_pattern, entry.base_name) : fallbackH1;
  const metaDescription = group ? fillPattern(group.meta_description_pattern, entry.base_name) : `Join the ${entry.base_name} chat room on Yaarzo for free.`;
  const h1 = group ? fillPattern(group.h1_pattern, entry.base_name) : fallbackH1;
  const secondaryKeywords = group ? group.secondary_patterns.map((p) => fillPattern(p, entry.base_name)) : [];

  const aiKeywordList = generated.aiKeywords ? generated.aiKeywords.split(',').map((k) => k.trim()).filter(Boolean) : [];
  const combinedKeywords = [...new Set([primaryKeyword, ...secondaryKeywords, ...aiKeywordList])];

  return {
    title,
    h1,
    content: generated.contentHtml,
    excerpt: metaDescription,
    category: entry.section,
    primary_keyword: primaryKeyword,
    secondary_keywords: secondaryKeywords,
    keyword_group_id: group?.id ?? null,
    meta_title: metaTitle,
    meta_description: metaDescription,
    meta_keywords: combinedKeywords.join(', '),
    og_title: metaTitle,
    og_description: metaDescription,
    canonical_url: `https://yaarzo.com/${entry.slug}`,
    faq_content: generated.faq,
    internal_links_json: generated.linksUsed,
    internal_link_count: generated.linksUsed.length,
    schema_jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: metaTitle,
      description: metaDescription,
    },
    city_id: cityId,
    country_id: countryId,
    content_status: 'complete',
    status: 'published',
    published_at: new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
    language: 'en',
  };
}

async function regeneratePage(entry) {
  console.log(`\n🔄 Regenerating: ${entry.slug}...`);
  const { cityId, countryId: cityCountryId } = await findCityId(entry.lookup_city, entry.lookup_country_hint);
  const directCountryId = entry.section === 'country' ? await findCountryId(entry.base_name) : cityCountryId;
  const generated = await generatePageContent(entry);
  const payload = await buildRowPayload(entry, generated, cityId, directCountryId);

  const { error } = await supabaseAdmin.from('custom_pages').update(payload).eq('slug', entry.slug);
  if (error) {
    console.error(`❌ Failed to update "${entry.slug}":`, error.message);
    return;
  }
  console.log(`✅ Regenerated: yaarzo.com/${entry.slug}`);
}

async function publishNewPage(entry) {
  console.log(`\n📝 Generating: ${entry.slug}...`);
  const { cityId, countryId: cityCountryId } = await findCityId(entry.lookup_city, entry.lookup_country_hint);
  const directCountryId = entry.section === 'country' ? await findCountryId(entry.base_name) : cityCountryId;
  const generated = await generatePageContent(entry);
  const payload = await buildRowPayload(entry, generated, cityId, directCountryId);

  const { error } = await supabaseAdmin.from('custom_pages').insert({ slug: entry.slug, ...payload });
  if (error) {
    console.error(`❌ Failed to insert "${entry.slug}":`, error.message);
    return;
  }
  console.log(`✅ Published: yaarzo.com/${entry.slug}`);
}

(async () => {
  if (REGENERATE_SLUGS.length > 0) {
    console.log(`Regenerating ${REGENERATE_SLUGS.length} existing page(s)...`);
    for (const slug of REGENERATE_SLUGS) {
      const entry = masterList.find((e) => e.slug === slug);
      if (!entry) {
        console.error(`⚠️ "${slug}" not found in master list — skipping.`);
        continue;
      }
      await regeneratePage(entry);
    }
  }

  const existingSlugs = await getExistingSlugs();
  const pending = masterList.filter((e) => !existingSlugs.has(e.slug));

  if (pending.length === 0) {
    console.log('\n✨ All pages in the master list already exist.');
    return;
  }

  const toPublish = pending.slice(0, PAGES_PER_RUN);
  console.log(`\nPublishing ${toPublish.length} of ${pending.length} remaining new page(s)...`);
  for (const entry of toPublish) {
    await publishNewPage(entry);
  }

  console.log('\n🎉 Run complete.');
})();

