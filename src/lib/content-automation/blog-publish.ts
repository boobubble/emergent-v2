/**
 * Port of automation-scripts/auto-publish-blog.cjs.
 * Generation logic is unchanged; topics come from blog_topic_ideas
 * and the per-run count from automation_settings.blog_posts_per_day.
 *
 * Internal chatroom links are filtered to published custom_pages slugs
 * (never /chatrooms). AI tags pass sanitizePipelineTags / detectHashtagDump
 * before insert.
 */
import Anthropic from "@anthropic-ai/sdk";
import { chatroomUrls } from "@/lib/content-automation/chatroom-urls";
import { db, getAutomationSettings, pausedResponse } from "@/lib/content-automation/db";
import {
  filterPublishedHrefs,
  pickPublishedInternalHref,
  preparePublishablePage,
} from "@/lib/content-automation/publish-quality";

export type BlogTopic = {
  title: string;
  category_slug: string;
  metaDescription: string;
  keywords: string | null;
};

export type PublishResult = { title: string; success: boolean; error?: string };

function failureMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return String(err);
}

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  let candidate = base;
  let counter = 2;
  while (true) {
    const { data } = await db().from("blog_posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

function pickChatroomUrl(title: string, publishedSlugs: Set<string>) {
  const lower = title.toLowerCase();
  const mapped: string[] = [];
  for (const [keyword, url] of Object.entries(chatroomUrls.keywordMap)) {
    if (lower.includes(keyword)) mapped.push(url);
  }
  const preferred = filterPublishedHrefs(mapped, publishedSlugs);
  if (preferred.length > 0) return preferred[0];
  return pickPublishedInternalHref(
    [...chatroomUrls.interest, ...chatroomUrls.type],
    publishedSlugs,
  );
}

async function loadPublishedPageSlugs(): Promise<Set<string>> {
  const { data } = await db().from("custom_pages").select("slug").eq("status", "published");
  return new Set((data ?? []).map((p: { slug: string }) => String(p.slug).replace(/^\/+/, "").toLowerCase()));
}

/** Ensures both required links exist in the HTML — adds them in code if the AI forgot. */
function ensureRequiredLinks(html: string, chatroomUrl: string) {
  let finalHtml = html;

  if (!finalHtml.includes("/signup")) {
    const signupPhrases = ["sign up on Yaarzo", "join for free", "create your free account", "get started here"];
    const phrase = signupPhrases[Math.floor(Math.random() * signupPhrases.length)];
    finalHtml += `<p>Ready to get started? <a href="https://yaarzo.com/signup">${phrase}</a>.</p>`;
  }

  if (!finalHtml.includes(chatroomUrl)) {
    const fallbackPhrases = ["give it a try here", "check it out", "take a look", "see what it's like"];
    const phrase = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    finalHtml += `<p>Want to jump straight in? <a href="${chatroomUrl}">${phrase}</a>.</p>`;
  }

  return finalHtml;
}

async function generateContent(title: string, chatroomUrl: string) {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2500,
    messages: [{
      role: "user",
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

Both links are REQUIRED — do not skip either one. Do not add any other links. Do not reuse the same anchor text pattern across sentences. Never use /chatrooms (use /chatroom only if linking the chat hub). Do not invent unpublished slugs.

After the article, on a new line, output exactly:
---META---
KEYWORDS: keyword one, keyword two, keyword three, keyword four, keyword five
TAGS: 8-12 topical tags (places, languages, cultures, themes). At most 3 tags may contain the word "chat". Do not repeat the title with minor variations.
READING_TIME: <integer minutes>`,
    }],
  });

  const fullText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const [contentHtml, metaBlock] = fullText.split("---META---");

  const keywordsMatch = metaBlock?.match(/KEYWORDS:\s*(.+)/i);
  const tagsMatch = metaBlock?.match(/TAGS:\s*(.+)/i);
  const readingTimeMatch = metaBlock?.match(/READING_TIME:\s*(\d+)/i);

  const finalHtml = ensureRequiredLinks(contentHtml.trim(), chatroomUrl);

  return {
    contentHtml: finalHtml,
    keywords: keywordsMatch?.[1]?.trim() ?? "",
    tags: tagsMatch?.[1]?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    readingTime: readingTimeMatch ? parseInt(readingTimeMatch[1], 10) : 5,
  };
}

async function getCategoryId(slug: string) {
  const { data } = await db().from("categories").select("id").eq("slug", slug).single();
  return data?.id ?? null;
}

async function getAlreadyPublishedTitles() {
  const { data } = await db().from("blog_posts").select("title");
  return new Set((data ?? []).map((p: { title: string }) => p.title.trim()));
}

async function getRelatedBlogPosts(categoryId: string, excludeSlug: string, count = 3) {
  if (!categoryId) return [];
  const { data } = await db()
    .from("blog_posts")
    .select("title, slug")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .limit(count);
  return (data ?? []) as Array<{ title: string; slug: string }>;
}

function buildRelatedHtml(relatedPosts: Array<{ title: string; slug: string }>) {
  if (relatedPosts.length === 0) return "";
  const items = relatedPosts
    .map((p) => `<li><a href="https://yaarzo.com/blog/${p.slug}">${p.title}</a></li>`)
    .join("");
  return `<h2>Related Reads</h2><ul>${items}</ul>`;
}

async function publishTopic(topic: BlogTopic): Promise<PublishResult> {
  try {
    console.log(`\n📝 Generating: ${topic.title}...`);

    const publishedSlugs = await loadPublishedPageSlugs();
    const chatroomUrl = pickChatroomUrl(topic.title, publishedSlugs);
    let generated: Awaited<ReturnType<typeof generateContent>>;
    let slug: string;
    let categoryId: string | null;
    try {
      [generated, slug, categoryId] = await Promise.all([
        generateContent(topic.title, chatroomUrl),
        generateUniqueSlug(topic.title),
        getCategoryId(topic.category_slug),
      ]);
    } catch (err) {
      const error = failureMessage(err);
      console.error(`❌ Content generation failed for "${topic.title}":`, error);
      return { title: topic.title, success: false, error };
    }

    if (!categoryId) {
      const error = `Category "${topic.category_slug}" not found in categories table`;
      console.error(`❌ ${error} — skipping "${topic.title}"`);
      return { title: topic.title, success: false, error };
    }

    const relatedPosts = await getRelatedBlogPosts(categoryId, slug);
    const relatedHtml = buildRelatedHtml(relatedPosts);
    const prepared = preparePublishablePage({
      slug,
      title: topic.title,
      h1: topic.title,
      meta_title: topic.title,
      meta_description: topic.metaDescription,
      content: generated.contentHtml + relatedHtml,
      tags: generated.tags,
      publishedSlugs,
    });
    if (prepared.blocked) {
      const error = `Quality gate: ${prepared.blockReason}`;
      console.error(`❌ ${error} — skipping "${topic.title}"`);
      return { title: topic.title, success: false, error };
    }

    const { data: inserted, error: insertError } = await db()
      .from("blog_posts")
      .insert({
        title: topic.title,
        slug,
        meta_description: topic.metaDescription,
        content: prepared.content,
        keywords: topic.keywords?.trim() || generated.keywords,
        tags: prepared.tags,
        reading_time_minutes: generated.readingTime,
        category_id: categoryId,
        author_id: null,
        last_refreshed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error(`❌ Insert failed for "${topic.title}":`, insertError.message);
      return { title: topic.title, success: false, error: insertError.message };
    }

    const { error: updateError } = await db()
      .from("blog_posts")
      .update({ status: "published" })
      .eq("id", inserted.id);

    if (updateError) {
      console.error(`❌ Publish step failed for "${topic.title}":`, updateError.message);
      return { title: topic.title, success: false, error: updateError.message };
    }

    console.log(`✅ Published: yaarzo.com/blog/${slug}`);
    return { title: topic.title, success: true };
  } catch (err) {
    const error = failureMessage(err);
    console.error(`❌ "${topic.title}":`, error);
    return { title: topic.title, success: false, error };
  }
}

export async function runBlogPublish(): Promise<Response> {
  const settings = await getAutomationSettings();
  if (!settings.automation_enabled) return pausedResponse();

  const postsPerRun = Math.max(0, Number(settings.blog_posts_per_day) || 0);
  if (postsPerRun === 0) {
    return Response.json({ published: 0, results: [] as PublishResult[] });
  }

  const { data: ideaRows, error: ideasError } = await db()
    .from("blog_topic_ideas")
    .select("title, category_slug, meta_description, keywords")
    .order("created_at", { ascending: true });

  if (ideasError) {
    return Response.json({ error: ideasError.message }, { status: 500 });
  }

  const allTopics: BlogTopic[] = (ideaRows ?? []).map((row: {
    title: string;
    category_slug: string;
    meta_description: string | null;
    keywords: string | null;
  }) => ({
    title: row.title,
    category_slug: row.category_slug,
    metaDescription: row.meta_description ?? "",
    keywords: row.keywords?.trim() || null,
  }));

  const publishedTitles = await getAlreadyPublishedTitles();
  const pendingTopics = allTopics.filter((t) => !publishedTitles.has(t.title.trim()));

  if (pendingTopics.length === 0) {
    return Response.json({ published: 0, results: [] as PublishResult[], message: "All topics have already been published." });
  }

  const toPublish = pendingTopics.slice(0, postsPerRun);
  const results: PublishResult[] = [];

  for (const topic of toPublish) {
    results.push(await publishTopic(topic));
  }

  const published = results.filter((r) => r.success).length;
  return Response.json({ published, results });
}
