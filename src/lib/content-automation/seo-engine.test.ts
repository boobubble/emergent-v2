import { describe, expect, it } from "vitest";
import { detectCannibalization, keywordSimilarity, normalizeKeyword } from "./cannibalization";
import { changePercent, countWordsFromHtml, hashContent } from "./content-inventory";
import { dailyPublishJobKey } from "./seo-settings";
import { inferIntentFromText, parseKeywordCsv, splitKeywordBlob } from "./keyword-targets";
import {
  attachFeaturedImageHtml,
  buildPexelsQuery,
  describeImageAlt,
  pexelsAttributionHtml,
  rankPexelsPhotos,
  shouldReplaceExistingImage,
  type PexelsPhoto,
} from "./pexels-images";
import { auditContentItem, formatRefreshReport, isValidJsonLd } from "./seo-audit";
import {
  remainingDailySlots,
  SEO_ENGINE_DEFAULTS,
  utcDateKey,
  shouldDiscoverRelatedPages,
  shouldEnforceBrokenLinkAbort,
  shouldEnforceThinContent,
  shouldInjectSeoContext,
  shouldOptimizeImageMarkup,
  shouldRunRefreshRewrite,
  shouldSnapshotVersions,
} from "./seo-settings";
import { appendVisibleFaqs, formatGenerationContextBlock } from "./seo-engine";
import { BLOG_WORD_TARGET, PAGE_WORD_TARGET } from "./seo-types";
import {
  claimJobInMemory,
  compareAndSwapJobStatus,
  decideJobReclaim,
  planJobRetry,
  resolveRetryExecutor,
  STALE_RUNNING_MS,
  type MemoryJob,
} from "./job-lock";
import { applySanitizedLiveUpdate, prepareLiveMutationHtml } from "./publish-quality";
import { buildPexelsFigureHtml } from "./pexels-images";

describe("daily quotas", () => {
  it("defaults to 2 blogs, 3 pages, 5 total", () => {
    expect(SEO_ENGINE_DEFAULTS.blog_posts_per_day).toBe(2);
    expect(SEO_ENGINE_DEFAULTS.static_pages_per_day).toBe(3);
    expect(SEO_ENGINE_DEFAULTS.daily_total_limit).toBe(5);
  });

  it("enforces the shared daily total across both types", () => {
    expect(remainingDailySlots({
      blogLimit: 2, pageLimit: 3, totalLimit: 5, blogsUsed: 0, pagesUsed: 0,
    })).toEqual({ blogs: 2, pages: 3, totalRemaining: 5 });
    expect(remainingDailySlots({
      blogLimit: 2, pageLimit: 3, totalLimit: 5, blogsUsed: 2, pagesUsed: 0,
    })).toEqual({ blogs: 0, pages: 3, totalRemaining: 3 });
    expect(remainingDailySlots({
      blogLimit: 2, pageLimit: 3, totalLimit: 5, blogsUsed: 2, pagesUsed: 2,
    })).toEqual({ blogs: 0, pages: 1, totalRemaining: 1 });
    expect(remainingDailySlots({
      blogLimit: 5, pageLimit: 5, totalLimit: 5, blogsUsed: 5, pagesUsed: 0,
    })).toEqual({ blogs: 0, pages: 0, totalRemaining: 0 });
  });

  it("builds deterministic job keys", () => {
    expect(dailyPublishJobKey("blog", "2026-09-06", 1)).toBe("publish:blog:2026-09-06:1");
    expect(dailyPublishJobKey("page", "2026-09-06", 2)).toBe("publish:page:2026-09-06:2");
    expect(utcDateKey(new Date("2026-09-06T08:00:00Z"))).toBe("2026-09-06");
  });
});

describe("keyword CSV", () => {
  it("parses Ubersuggest-style headers and dedupes", () => {
    const csv = [
      "Keyword,Search Volume,SEO Difficulty,CPC,Competition,Intent",
      "indian chat room,5400,38,0.42,0.5,local",
      "indian chat room,5400,38,0.42,0.5,local",
      "how to make friends online,2100,22,0.11,0.2,informational",
    ].join("\n");
    const parsed = parseKeywordCsv(csv);
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].keyword).toBe("indian chat room");
    expect(parsed.rows[0].search_volume).toBe(5400);
    expect(parsed.rows[0].search_intent).toBe("local");
    expect(parsed.rows[1].keyword).toBe("how to make friends online");
  });

  it("splits keyword blobs into primary / secondary / long-tail", () => {
    const split = splitKeywordBlob("Indian chat room, chat India, free indian chat room online tonight");
    expect(split.primary).toBe("Indian chat room");
    expect(split.longTail.some((k) => /tonight/i.test(k))).toBe(true);
  });
});

describe("cannibalization", () => {
  const inventory = [
    {
      content_type: "page" as const,
      source_id: "1",
      slug: "india-chat-room",
      canonical_url: "https://yaarzo.com/india-chat-room",
      title: "India Chat Room",
      primary_keyword: "Indian chat room",
      search_intent: "local",
    },
  ];

  it("flags exact primary keyword conflicts and never recommends delete", () => {
    expect(normalizeKeyword("Indian Chat Room")).toBe("indian chat room");
    const hits = detectCannibalization({
      keyword: "Indian chat room",
      intent: "local",
      contentType: "page",
      inventory,
    });
    expect(hits[0]?.kind).toBe("exact_primary");
    expect(hits[0]?.recommended_action).not.toMatch(/delete/);
  });

  it("scores similar keywords below exact match", () => {
    expect(keywordSimilarity("indian chat room", "indian chat rooms online")).toBeGreaterThan(0.5);
    expect(keywordSimilarity("indian chat room", "poetry collection")).toBeLessThan(0.3);
  });
});

describe("content hash and word count", () => {
  it("treats equivalent HTML as unchanged", () => {
    const a = "<p>Hello   world</p>";
    const b = "<p>Hello world</p>";
    expect(hashContent(a)).toBe(hashContent(b));
    expect(changePercent("<p>same</p>", "<p>same</p>")).toBe(0);
  });

  it("counts visible words", () => {
    expect(countWordsFromHtml("<h2>Hello</h2><p>there friend</p>")).toBe(3);
  });

  it("keeps the requested word ranges", () => {
    expect(BLOG_WORD_TARGET).toEqual({ min: 1200, max: 1500 });
    expect(PAGE_WORD_TARGET).toEqual({ min: 700, max: 900 });
  });
});

describe("Pexels helpers", () => {
  const photo = (id: number, extra: Partial<PexelsPhoto> = {}): PexelsPhoto => ({
    id,
    url: `https://www.pexels.com/photo/${id}/`,
    photographer: "Ada",
    photographer_url: "https://www.pexels.com/@ada",
    alt: "people talking online",
    width: 1600,
    height: 900,
    src: { large2x: `https://images.pexels.com/photos/${id}/large.jpeg` },
    ...extra,
  });

  it("builds a visual query instead of dumping the SEO keyword", () => {
    const q = buildPexelsQuery({
      topic: "Indian Chat Room Online",
      primaryKeyword: "Indian chat room",
      contentType: "page",
      geo: "India",
    });
    expect(q.toLowerCase()).toContain("people");
    expect(q).not.toMatch(/Indian Chat Room Online$/);
  });

  it("ranks unused landscape photos above used or portrait ones", () => {
    const ranked = rankPexelsPhotos(
      [
        photo(1, { width: 400, height: 800, src: { large: "https://images.pexels.com/small.jpg" } }),
        photo(2),
        photo(3, { width: 1600, height: 900 }),
      ],
      "people talking online",
      new Set([2]),
    );
    expect(ranked[0].photo.id).toBe(3);
  });

  it("replaces the IMAGE comment and writes attribution + descriptive alt", () => {
    const html = attachFeaturedImageHtml("<p>Intro</p>\n<!-- IMAGE: friends chatting -->\n<h2>Next</h2>", "<figure>img</figure>");
    expect(html).toContain("<figure>img</figure>");
    expect(html).not.toMatch(/<!-- IMAGE:/);
    expect(pexelsAttributionHtml(photo(9))).toContain("Pexels");
    expect(describeImageAlt("Jaipur chat", "People chatting in a cafe")).toBe("People chatting in a cafe");
    expect(shouldReplaceExistingImage("<p>no image</p>", null)).toBe(true);
    expect(shouldReplaceExistingImage('<img src="https://images.pexels.com/x.jpg" alt="ok">', null)).toBe(false);
  });
});

describe("SEO audit / FAQ schema", () => {
  it("validates JSON-LD and formats no-update reports", () => {
    expect(isValidJsonLd({ "@context": "https://schema.org", "@type": "WebPage" })).toBe(true);
    expect(isValidJsonLd({ hello: true })).toBe(false);
    expect(formatRefreshReport({
      status: "No substantial update required",
      reason: "Content remains comprehensive, relevant and well-optimized.",
    })).toContain("No substantial update required");
  });

  it("keeps a good image and flags exact keyword overlap", () => {
    const audit = auditContentItem({
      contentType: "page",
      slug: "delhi-chat-room",
      title: "Delhi Chat Room | Yaarzo",
      h1: "Delhi Chat Room",
      metaDescription: "Meet people from Delhi in a free chat room.",
      content: `<p>${"word ".repeat(800)}</p><h2>One</h2><h2>Two</h2><img src="https://images.pexels.com/x.jpg" alt="People chatting">`,
      primaryKeyword: "Indian chat room",
      inventory: [{
        content_type: "page",
        source_id: "1",
        slug: "india-chat-room",
        canonical_url: "https://yaarzo.com/india-chat-room",
        title: "India Chat Room",
        primary_keyword: "Indian chat room",
        search_intent: "local",
      }],
    });
    expect(audit.imageAction).toBe("retain");
    expect(audit.issues.some((i) => i.code === "cannibalization")).toBe(true);
  });

  it("appends visible FAQs when missing", () => {
    const html = appendVisibleFaqs("<p>Intro</p>", [{ question: "Is Yaarzo free to try?", answer: "Yes, you can explore public rooms without paying." }]);
    expect(html).toContain("Q1: Is Yaarzo free to try?");
    expect(html).toContain("Frequently asked questions");
  });
});

describe("generation context + intent", () => {
  it("keeps intent labels and lists existing URLs for the model", () => {
    expect(inferIntentFromText("how to make friends online")).toBe("informational");
    const block = formatGenerationContextBlock({
      primaryKeyword: "indian chat room",
      secondaryKeywords: ["india chat"],
      longTailKeywords: ["free indian chat room"],
      searchIntent: "local",
      relatedTitles: ["India Chat Room (https://yaarzo.com/india-chat-room)"],
      cannibalization: [],
      wordRange: "700–900",
    });
    expect(block).toContain("https://yaarzo.com/india-chat-room");
    expect(block).toContain("700–900");
  });
});

describe("job reclaim CAS", () => {
  it("lets only one concurrent reclaim of a failed slot succeed", () => {
    const store = new Map<string, MemoryJob>();
    store.set("publish:blog:2026-09-06:1", {
      id: "1",
      job_key: "publish:blog:2026-09-06:1",
      status: "failed",
      started_at: "2026-09-06T01:00:00.000Z",
      retry_count: 0,
      max_retries: 2,
    });
    const snapshot = { ...store.get("publish:blog:2026-09-06:1")! };
    const first = decideJobReclaim(snapshot);
    const second = decideJobReclaim(snapshot);
    expect(first.action).toBe("reclaim");
    expect(second.action).toBe("reclaim");
    if (first.action !== "reclaim" || second.action !== "reclaim") throw new Error("expected reclaim");

    const apply = (expected: typeof first) => {
      const live = store.get("publish:blog:2026-09-06:1")!;
      if (!compareAndSwapJobStatus(live, { status: expected.expectedStatus })) return false;
      live.status = "running";
      return true;
    };
    expect(apply(first)).toBe(true);
    expect(apply(second)).toBe(false);
  });

  it("reclaims a stale running job and rejects a fresh running job", () => {
    const staleAt = new Date(Date.now() - STALE_RUNNING_MS - 1000).toISOString();
    expect(decideJobReclaim({
      status: "running",
      started_at: staleAt,
      retry_count: 0,
      max_retries: 2,
    }).action).toBe("reclaim");
    expect(decideJobReclaim({
      status: "running",
      started_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 2,
    })).toEqual({ action: "deny", reason: "running" });
  });

  it("only one concurrent first claim on the same job_key succeeds", () => {
    const store = new Map<string, MemoryJob>();
    const key = "publish:page:2026-09-06:2";
    const now = Date.now();
    expect(claimJobInMemory(store, key, now).ok).toBe(true);
    expect(claimJobInMemory(store, key, now).ok).toBe(false);
  });
});

describe("refresh and two-way HTML sanitization", () => {
  const published = new Set(["india-chat-room", "international-chat-room", "friendship-chat-room"]);
  const live = [
    "<p>Meet people in the",
    '<a href="https://yaarzo.com/india-chat-room">India chat room</a>',
    "and also on",
    '<a href="https://example.com/guide">this external guide</a>.</p>',
  ].join(" ");

  it("removes invented Yaarzo URLs and keeps valid internal plus external links", () => {
    const next = [
      live,
      '<p>Also try <a href="https://yaarzo.com/not-a-real-room">this invented room</a>.</p>',
    ].join("");
    const prepared = prepareLiveMutationHtml({
      html: next,
      slug: "india-chat-room",
      title: "India Chat Room",
      publishedSlugs: published,
    });
    expect(prepared.ok).toBe(true);
    expect(prepared.html).toContain("https://yaarzo.com/india-chat-room");
    expect(prepared.html).toContain("https://example.com/guide");
    expect(prepared.html).not.toContain("not-a-real-room");
  });

  it("does not modify live content when validation fails", () => {
    const result = applySanitizedLiveUpdate(live, "", {
      slug: "india-chat-room",
      title: "India Chat Room",
      publishedSlugs: published,
    });
    expect(result.wrote).toBe(false);
    expect(result.content).toBe(live);
    expect(result.blockReason).toBe("empty_html");

    const dumped = applySanitizedLiveUpdate(live, `${live}<p>[INSERT PLACEHOLDER]</p>`, {
      slug: "india-chat-room",
      title: "India Chat Room",
      publishedSlugs: published,
    });
    expect(dumped.wrote).toBe(false);
    expect(dumped.content).toBe(live);
  });

  it("sanitizes a two-way back-link the same way", () => {
    const addition = '<p>Read <a href="https://yaarzo.com/totally-fake-slug">this related chat room</a>.</p>';
    const result = applySanitizedLiveUpdate(live, `${live}\n${addition}`, {
      slug: "india-chat-room",
      title: "India Chat Room",
      publishedSlugs: published,
    });
    expect(result.wrote).toBe(true);
    expect(result.content).toContain("https://yaarzo.com/india-chat-room");
    expect(result.content).not.toContain("totally-fake-slug");
  });
});

describe("retry execution plan", () => {
  it("requeues a same-day failed unpublished job for the existing worker", () => {
    const plan = planJobRetry({
      job: {
        status: "failed",
        job_type: "blog_publish",
        target_date: "2026-09-06",
        source_id: null,
        retry_count: 0,
        max_retries: 2,
      },
      today: "2026-09-06",
      sourceAlreadyPublished: false,
      remainingSlots: 2,
    });
    expect(plan).toEqual({ action: "execute", reason: "retry" });
    expect(resolveRetryExecutor("blog_publish")).toBe("blog_publish");
    expect(resolveRetryExecutor("refresh")).toBe("refresh");
  });

  it("does not republish when the source already exists and cannot bypass quota on another day", () => {
    expect(planJobRetry({
      job: {
        status: "failed",
        job_type: "page_publish",
        target_date: "2026-09-06",
        source_id: "abc",
        retry_count: 0,
        max_retries: 2,
      },
      today: "2026-09-06",
      sourceAlreadyPublished: true,
      remainingSlots: 3,
    })).toEqual({ action: "complete_idempotent", reason: "already_published" });

    expect(planJobRetry({
      job: {
        status: "failed",
        job_type: "blog_publish",
        target_date: "2026-09-05",
        source_id: null,
        retry_count: 0,
        max_retries: 2,
      },
      today: "2026-09-06",
      sourceAlreadyPublished: false,
      remainingSlots: 2,
    })).toEqual({ action: "deny", reason: "quota" });
  });
});

describe("runtime settings gates", () => {
  it("respects each persisted toggle", () => {
    expect(shouldInjectSeoContext({ auto_seo_optimization: true })).toBe(true);
    expect(shouldInjectSeoContext({ auto_seo_optimization: false })).toBe(false);
    expect(shouldEnforceThinContent({ auto_seo_optimization: false })).toBe(false);
    expect(shouldRunRefreshRewrite({ auto_seo_optimization: false, content_refresh_enabled: true })).toBe(false);
    expect(shouldRunRefreshRewrite({ auto_seo_optimization: true, content_refresh_enabled: true })).toBe(true);
    expect(shouldSnapshotVersions({ keep_previous_versions: false })).toBe(false);
    expect(shouldSnapshotVersions({ keep_previous_versions: true })).toBe(true);
    expect(shouldDiscoverRelatedPages({ new_page_discovery: false })).toBe(false);
    expect(shouldEnforceBrokenLinkAbort({ broken_link_check: false })).toBe(false);
    expect(shouldOptimizeImageMarkup({ image_optimization: false })).toBe(false);
    expect(buildPexelsFigureHtml({
      src: "https://images.pexels.com/x.jpg",
      alt: "People talking",
      width: 1600,
      height: 900,
      attribution: "Pexels",
      optimizeMarkup: false,
    })).not.toContain("loading=\"lazy\"");
    expect(buildPexelsFigureHtml({
      src: "https://images.pexels.com/x.jpg",
      alt: "People talking",
      width: 1600,
      height: 900,
      attribution: "Pexels",
    })).toContain("loading=\"lazy\"");
  });
});
