/**
 * generate-keyword-cluster.cjs
 * -----------------------------------------------------
 * Internal replacement for tools like ryrob.com/keyword-cluster/.
 * Takes a seed keyword, generates a full keyword cluster
 * (primary + related terms), and suggests which ones would
 * make good NEW blog topics or static chat-room pages —
 * specifically for Yaarzo, not generic.
 *
 * Output is saved to a review file — nothing gets published
 * automatically. You look at the suggestions, then manually
 * add the good ones to blog-topics.json / static-pages-master.json.
 *
 * USAGE:
 *   node generate-keyword-cluster.cjs "seed keyword here"
 *
 * EXAMPLE:
 *   node generate-keyword-cluster.cjs "video chat rooms"
 *   node generate-keyword-cluster.cjs "teen chat"
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const seedKeyword = process.argv.slice(2).join(' ').trim();

if (!seedKeyword) {
  console.error('❌ Please provide a seed keyword.\n   Example: node generate-keyword-cluster.cjs "video chat rooms"');
  process.exit(1);
}

async function generateCluster(seed) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are doing keyword research for Yaarzo, a free online chatroom and social community platform (competitors: Discord, MeetMe, Wireclub). The site already has extensive coverage of: city-based chatrooms (India/Pakistan/US/UK/Canada/Australia), country chatrooms, language chatrooms, interest chatrooms (gaming, music, cricket, poetry, etc.), and type chatrooms (girls, boys, dating, anonymous, friendship, etc.), plus a blog on making friends online and chatroom culture.

Seed keyword: "${seed}"

Generate a keyword cluster around this seed, tailored to Yaarzo's niche. Return ONLY valid JSON (no markdown, no commentary) in this exact shape:

{
  "seed": "${seed}",
  "related_keywords": ["keyword 1", "keyword 2", ... 10-15 real related search terms],
  "suggested_blog_topics": [
    {"title": "Full blog post title", "reason": "why this is a good topic in one short phrase"}
  ],
  "suggested_static_pages": [
    {"slug": "example-chat-room", "base_name": "example", "reason": "why this page is worth creating"}
  ]
}

Rules:
- suggested_blog_topics: 3-5 items, only if genuinely different from generic "how to make friends online" angles already likely covered — be specific and non-generic
- suggested_static_pages: 3-8 items, only "X-chat-room" style pages that make sense for a chatroom platform and aren't obviously already covered by city/country/interest/type patterns already mentioned above
- Do not suggest anything that duplicates the categories already listed as covered
- Keep it realistic — don't invent implausible search terms just to pad the list`,
    }],
  });

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();

  // Strip potential markdown code fences if the model adds them anyway
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('⚠️ Could not parse JSON, raw output below:\n');
    console.log(text);
    process.exit(1);
  }
}

function printReadable(cluster) {
  console.log(`\n📌 Seed: ${cluster.seed}\n`);

  console.log('🔑 Related keywords:');
  cluster.related_keywords.forEach((k) => console.log(`   - ${k}`));

  console.log('\n📝 Suggested blog topics:');
  cluster.suggested_blog_topics.forEach((t) => console.log(`   - ${t.title}\n     (${t.reason})`));

  console.log('\n📄 Suggested static pages:');
  cluster.suggested_static_pages.forEach((p) => console.log(`   - /${p.slug}  (${p.reason})`));

  console.log('');
}

(async () => {
  console.log(`\n🔍 Generating keyword cluster for: "${seedKeyword}"...`);

  const cluster = await generateCluster(seedKeyword);
  printReadable(cluster);

  const outDir = path.join(__dirname, 'keyword-suggestions');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const filename = `${seedKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.json`;
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(cluster, null, 2));

  console.log(`💾 Saved full result to: keyword-suggestions/${filename}`);
  console.log('👉 Review the suggestions above, then manually add the good ones to blog-topics.json or static-pages-master.json.\n');
})();
