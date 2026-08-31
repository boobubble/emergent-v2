/**
 * fix-old-cta-buttons.cjs
 * -----------------------------------------------------
 * Finds pages with the OLD style CTA button (plain <a> tag
 * with target="_blank", no wrapping div, using /chatroom or
 * /chatrooms href) and replaces it with the NEW consistent
 * CTA button style (matching buildPageCtaHtml in page-cta.ts).
 *
 * Skips legal/info pages (about-us, privacy-policy, etc.) —
 * those should never get a "Start Chatting Now" CTA.
 *
 * Only touches the CTA block — does not change the rest of
 * the page content.
 *
 * USAGE:
 *   node fix-old-cta-buttons.cjs           (dry run — shows what would change)
 *   node fix-old-cta-buttons.cjs --apply   (actually updates the database)
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const APPLY = process.argv.includes('--apply');

const EXCLUDE_SLUGS = ['about-us', 'privacy-policy', 'terms-conditions', 'contact-us'];

// Matches the OLD style: a plain <p><a ... class="custom-page-cta-button" href="/chatroom...">Start Chatting Now→</a></p>
// followed by <p>Free to explore...</p> — NOT wrapped in a <div class="custom-page-cta">
const OLD_CTA_PATTERN = /<p>\s*<a[^>]*class="custom-page-cta-button"[^>]*>Start Chatting Now→<\/a>\s*<\/p>\s*<p>Free to explore[^<]*<\/p>/gi;

function buildNewCtaHtml() {
  // Canonical chat route is /chatroom. /chatrooms is a redirect-only alias.
  return [
    `<div class="custom-page-cta">`,
    `<a href="/chatroom" class="custom-page-cta-button">`,
    `<span>Start Chatting Now</span>`,
    `<span aria-hidden="true">→</span>`,
    `</a>`,
    `<p class="custom-page-cta-note">Free to explore • Join when you are ready</p>`,
    `</div>`,
  ].join('');
}

async function run() {
  const { data: pages, error } = await supabaseAdmin
    .from('custom_pages')
    .select('id, slug, content')
    .eq('status', 'published')
    .not('slug', 'in', `(${EXCLUDE_SLUGS.map((s) => `"${s}"`).join(',')})`);

  if (error) {
    console.error('❌ Failed to fetch pages:', error.message);
    return;
  }

  const affected = pages.filter((p) => OLD_CTA_PATTERN.test(p.content));
  OLD_CTA_PATTERN.lastIndex = 0;

  if (affected.length === 0) {
    console.log('✨ No pages found with the old CTA button style.');
    return;
  }

  console.log(`Found ${affected.length} page(s) with the old CTA button style:\n`);
  affected.forEach((p) => console.log(`   - ${p.slug}`));

  if (!APPLY) {
    console.log('\n👉 This was a dry run. Re-run with --apply to actually update these pages:');
    console.log('   node fix-old-cta-buttons.cjs --apply\n');
    return;
  }

  console.log('\nApplying fixes...\n');

  for (const page of affected) {
    const newContent = page.content.replace(OLD_CTA_PATTERN, buildNewCtaHtml());

    const { error: updateError } = await supabaseAdmin
      .from('custom_pages')
      .update({ content: newContent })
      .eq('id', page.id);

    if (updateError) {
      console.error(`❌ Failed to update "${page.slug}":`, updateError.message);
      continue;
    }
    console.log(`✅ Fixed: ${page.slug}`);
  }

  console.log('\n🎉 Done.');
}

run();
