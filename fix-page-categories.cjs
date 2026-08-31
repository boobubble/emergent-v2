/**
 * fix-page-categories.cjs
 * -----------------------------------------------------
 * Backfills the `category` field on legacy pages that have
 * it null (mostly created before the automation existed).
 * Uses an explicit slug-to-category map for accuracy since
 * this is a small, known set of pages.
 *
 * Also tags legal/info pages with category "legal" so they
 * show in their own small directory section instead of
 * "Other".
 *
 * USAGE:
 *   node fix-page-categories.cjs           (dry run)
 *   node fix-page-categories.cjs --apply   (actually updates)
 * -----------------------------------------------------
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const APPLY = process.argv.includes('--apply');

const SLUG_CATEGORY_MAP = {
  // Legal / info pages
  'about-us': 'legal',
  'privacy-policy': 'legal',
  'terms-conditions': 'legal',
  'contact-us': 'legal',

  // Countries
  'india-chat-room': 'country',
  'pakistan-chat-room': 'country',
  'usa-chat-room': 'country',
  'uk-chat-room': 'country',

  // India cities
  'bengaluru-chat-room': 'india_city',
  'chennai-chat-room': 'india_city',
  'delhi-chat-room': 'india_city',
  'hyderabad-india-chat-room': 'india_city',
  'kolkata-chat-room': 'india_city',
  'mumbai-chat-room': 'india_city',

  // Pakistan cities
  'faisalabad-chat-room': 'pakistan_city',
  'islamabad-chat-room': 'pakistan_city',
  'karachi-chat-room': 'pakistan_city',
  'lahore-chat-room': 'pakistan_city',
  'multan-chat-room': 'pakistan_city',
  'rawalpindi-chat-room': 'pakistan_city',

  // Chat room types
  'dating-chat-room': 'type',
  'free-chat-room': 'type',
  'friendship-chat-room': 'type',
  'girls-chat-room': 'type',
  'random-chat-room': 'type',
  'teen-chat-room': 'type',
  'chat-rooms-without-registration-2026': 'type',
  'chatib-alternative-chat-room': 'type',

  // Language
  'english-chat-room-free-online-chat': 'language',

  // City sub-category
  'karachi-girls-chat-room': 'city_subcategory',
};

async function run() {
  const slugs = Object.keys(SLUG_CATEGORY_MAP);

  console.log(`Checking ${slugs.length} known page(s)...\n`);

  const { data: pages, error } = await supabaseAdmin
    .from('custom_pages')
    .select('id, slug, category')
    .in('slug', slugs);

  if (error) {
    console.error('❌ Failed to fetch pages:', error.message);
    return;
  }

  const toUpdate = pages.filter((p) => p.category !== SLUG_CATEGORY_MAP[p.slug]);

  if (toUpdate.length === 0) {
    console.log('✨ All known pages already have the correct category.');
    return;
  }

  console.log(`Found ${toUpdate.length} page(s) needing a category update:\n`);
  toUpdate.forEach((p) => console.log(`   - ${p.slug}  →  ${SLUG_CATEGORY_MAP[p.slug]}`));

  if (!APPLY) {
    console.log('\n👉 This was a dry run. Re-run with --apply to actually update:');
    console.log('   node fix-page-categories.cjs --apply\n');
    return;
  }

  console.log('\nApplying updates...\n');

  for (const page of toUpdate) {
    const { error: updateError } = await supabaseAdmin
      .from('custom_pages')
      .update({ category: SLUG_CATEGORY_MAP[page.slug] })
      .eq('id', page.id);

    if (updateError) {
      console.error(`❌ Failed to update "${page.slug}":`, updateError.message);
      continue;
    }
    console.log(`✅ Updated: ${page.slug}`);
  }

  console.log('\n🎉 Done.');
}

run();
