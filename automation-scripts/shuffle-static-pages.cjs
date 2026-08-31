/**
 * shuffle-static-pages.cjs
 * -----------------------------------------------------
 * Har published static page (custom_pages) ko check karta hai —
 * agar last refresh ko 15+ din ho gaye hain, Claude se content
 * ko naturally REWRITE karwata hai (fresh wording, same meaning),
 * lekin:
 *   - slug/URL kabhi change nahi hota
 *   - existing <a> links (anchor text + href) EXACTLY wahi rehte hain
 *   - image placeholder comment wahi rehta hai, chhua nahi jaata
 *
 * USAGE:
 *   node shuffle-static-pages.cjs
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const REFRESH_INTERVAL_DAYS = 15;

async function getPagesDueForRefresh() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REFRESH_INTERVAL_DAYS);

  const { data, error } = await supabaseAdmin
    .from('custom_pages')
    .select('id, slug, title, content')
    .eq('status', 'published')
    .lte('last_refreshed_at', cutoff.toISOString());

  if (error) {
    console.error('❌ Failed to fetch pages:', error.message);
    return [];
  }
  return data ?? [];
}

async function refreshContent(title, oldContentHtml) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You're a skilled human editor doing a content refresh — not a rewrite tool. Here is an existing landing page titled "${title}":

${oldContentHtml}

Make this read like it was written fresh today, by a real person, while covering the same ground. Genuinely vary:
- Sentence rhythm and length
- How each paragraph opens
- Examples and phrasing
- Section intros/transitions
- You may reword the h2/h3 headings themselves for freshness, but keep them in the same order and about the same topics

Keep unchanged:
- The core meaning and claims
- Similar overall length (+/- 10%)
- Warm, conversational tone

HARD CONSTRAINTS (never violate):
- Every existing <a href="...">anchor text</a> must appear EXACTLY as-is — same href, same anchor text, same position/context in the flow.
- Any HTML comment (like <!-- IMAGE: ... -->) must be preserved EXACTLY as-is, in the same position — never remove or alter it.
- Do not add new links, images, or an <h1>.
- Output clean HTML only (h2, h3, p, ul/li, strong, a, and any existing comments) — no commentary.`,
    }],
  });

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

async function refreshPage(page) {
  console.log(`\n🔄 Refreshing: ${page.slug}`);
  try {
    const newContent = await refreshContent(page.title, page.content);

    const { error } = await supabaseAdmin
      .from('custom_pages')
      .update({
        content: newContent,
        last_refreshed_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (error) {
      console.error(`❌ Update failed for "${page.slug}":`, error.message);
      return;
    }
    console.log(`✅ Refreshed (URL unchanged): yaarzo.com/${page.slug}`);
  } catch (err) {
    console.error(`❌ Error refreshing "${page.slug}":`, err.message);
  }
}

(async () => {
  const pages = await getPagesDueForRefresh();
  if (pages.length === 0) {
    console.log('✨ No static pages due for refresh yet.');
    return;
  }
  console.log(`Found ${pages.length} page(s) due for refresh.`);
  for (const page of pages) {
    await refreshPage(page);
  }
  console.log('\n🎉 Refresh cycle done.');
})();
