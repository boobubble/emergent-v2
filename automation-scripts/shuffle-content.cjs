/**
 * shuffle-content.cjs
 * -----------------------------------------------------
 * Har published post ko check karta hai — agar last refresh
 * ko 15+ din ho gaye hain, to Claude se content ko naturally
 * REWRITE karwata hai (fresh wording, same meaning), lekin:
 *   - slug/URL wahi rehta hai (kabhi change nahi hota)
 *   - existing <a> links (anchor text + href) wahi rehte hain
 *   - existing <img> tags wahi rehte hain
 *
 * USAGE:
 *   node shuffle-content.cjs
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

async function getPostsDueForRefresh() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REFRESH_INTERVAL_DAYS);

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, content')
    .eq('status', 'published')
    .lte('last_refreshed_at', cutoff.toISOString());

  if (error) {
    console.error('❌ Failed to fetch posts:', error.message);
    return [];
  }
  return data ?? [];
}

async function refreshContent(title, oldContentHtml) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2500,
    messages: [
      {
        role: 'user',
        content: `You're a skilled human blog editor doing a content refresh — not a rewrite tool. Here is an existing blog post titled "${title}":

${oldContentHtml}

Your job: make this read like it was written fresh today, by a real person, while covering the same ground. This should NOT feel like the same article with synonyms swapped in. Genuinely vary:
- Sentence rhythm and length (mix short punchy lines with longer ones, the way real writers do)
- How each point opens (don't start every paragraph the same way as the original)
- Examples and phrasing — use different concrete examples than the original where possible, not just reworded versions of the same ones
- Section intros/transitions — write natural connective tissue, not mechanical topic sentences

Keep unchanged:
- The core meaning, advice, and factual claims
- The same h2/h3 section topics, in the same order (but you can reword the headings themselves for freshness)
- Similar overall length (+/- 10%)
- The tone: warm, direct, conversational — like a knowledgeable friend, never salesy or stiff

HARD CONSTRAINTS (do not violate):
- Every existing <a href="...">anchor text</a> must appear EXACTLY as-is — same href, same anchor text, same surrounding sentence context so it still reads naturally in place. Do not relocate it to a different paragraph.
- Every <img> tag must remain EXACTLY as-is, in the same position.
- Do not add new links, images, or an <h1>.
- Output clean HTML only (h2, h3, p, ul/li, strong, plus the preserved a/img tags) — no commentary, no meta-notes about what you changed.

Read it once more before responding: would a real reader who saw both versions notice this was "the same article reworded"? If yes, vary it more.`,
      },
    ],
  });

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

async function refreshPost(post) {
  console.log(`\n🔄 Refreshing: ${post.title}`);
  try {
    const newContent = await refreshContent(post.title, post.content);

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        content: newContent,
        last_refreshed_at: new Date().toISOString(),
      })
      .eq('id', post.id);

    if (error) {
      console.error(`❌ Update failed for "${post.title}":`, error.message);
      return;
    }
    console.log(`✅ Refreshed (URL unchanged): yaarzo.com/blog/${post.slug}`);
  } catch (err) {
    console.error(`❌ Error refreshing "${post.title}":`, err.message);
  }
}

(async () => {
  const posts = await getPostsDueForRefresh();
  if (posts.length === 0) {
    console.log('✨ No posts due for refresh yet.');
    return;
  }
  console.log(`Found ${posts.length} post(s) due for refresh.`);
  for (const post of posts) {
    await refreshPost(post);
  }
  console.log('\n🎉 Refresh cycle done.');
})();