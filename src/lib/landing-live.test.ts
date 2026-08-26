import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LANDING_DEFAULTS } from "@/lib/landing-config";
import {
  DEMO_IDENTITY_NAMES,
  featuredMemberRole,
  isEligiblePublicBlog,
  isEligiblePublicPost,
  isEligiblePublicProfile,
  mapLiveBlogPost,
  publicLiveConfig,
  resolveLandingView,
} from "@/lib/landing-live";

const src = resolve(process.cwd(), "src");

function read(rel: string) {
  return readFileSync(resolve(src, rel), "utf8");
}

describe("landing live defaults", () => {
  it("production defaults are REAL, not demo", () => {
    expect(LANDING_DEFAULTS.useDemoData).toBe(false);
    expect(LANDING_DEFAULTS.trendingPostsUseLive).toBe(true);
    expect(LANDING_DEFAULTS.discussionsUseLive).toBe(true);
    expect(LANDING_DEFAULTS.featuredMembersUseLive).toBe(true);
    expect(LANDING_DEFAULTS.recentConfessionsUseLive).toBe(true);
    expect(LANDING_DEFAULTS.blogPostsUseLive).toBe(true);
    expect(LANDING_DEFAULTS.activitiesUseLive).toBe(true);
  });
});

describe("public visibility filters", () => {
  it("keeps only public, visible, non-empty posts", () => {
    expect(isEligiblePublicPost({
      privacy: "public",
      hidden_at: null,
      moderation_status: "visible",
      text: "hello",
    })).toBe(true);
    expect(isEligiblePublicPost({
      privacy: "private",
      hidden_at: null,
      moderation_status: "visible",
      text: "hello",
    })).toBe(false);
    expect(isEligiblePublicPost({
      privacy: "friends",
      hidden_at: null,
      moderation_status: "visible",
      text: "hello",
    })).toBe(false);
    expect(isEligiblePublicPost({
      privacy: "public",
      hidden_at: "2026-01-01T00:00:00Z",
      moderation_status: "visible",
      text: "hello",
    })).toBe(false);
    expect(isEligiblePublicPost({
      privacy: "public",
      hidden_at: null,
      moderation_status: "removed",
      text: "hello",
    })).toBe(false);
    expect(isEligiblePublicPost({
      privacy: "public",
      hidden_at: null,
      moderation_status: "visible",
      text: "   ",
    })).toBe(false);
    expect(isEligiblePublicPost({
      privacy: "public",
      hidden_at: null,
      moderation_status: "visible",
      text: "",
      poll: { question: "A?", options: [{ label: "Yes" }, { label: "No" }] },
    })).toBe(true);
  });

  it("keeps only public non-bot profiles with a username", () => {
    expect(isEligiblePublicProfile({ username: "maya", is_private: false, is_bot: false })).toBe(true);
    expect(isEligiblePublicProfile({ username: "maya", is_private: true, is_bot: false })).toBe(false);
    expect(isEligiblePublicProfile({ username: "maya", is_private: false, is_bot: true })).toBe(false);
    expect(isEligiblePublicProfile({ username: "  ", is_private: false, is_bot: false })).toBe(false);
  });

  it("orders published blogs by published_at and excludes drafts/future", () => {
    const now = Date.parse("2026-08-25T12:00:00Z");
    expect(isEligiblePublicBlog({
      status: "published",
      is_published: true,
      published_at: "2026-08-20T00:00:00Z",
      slug: "hello",
      title: "Hello",
    }, now)).toBe(true);
    expect(isEligiblePublicBlog({
      status: "draft",
      is_published: true,
      published_at: "2026-08-20T00:00:00Z",
      slug: "hello",
      title: "Hello",
    }, now)).toBe(false);
    expect(isEligiblePublicBlog({
      status: "published",
      is_published: false,
      published_at: "2026-08-20T00:00:00Z",
      slug: "hello",
      title: "Hello",
    }, now)).toBe(false);
    expect(isEligiblePublicBlog({
      status: "published",
      published_at: "2026-09-01T00:00:00Z",
      slug: "hello",
      title: "Hello",
    }, now)).toBe(false);
    expect(isEligiblePublicBlog({
      status: "published",
      published_at: null,
      slug: "hello",
      title: "Hello",
    }, now)).toBe(false);
  });

  it("maps blog cards to /blog/:slug, not custom_pages", () => {
    const card = mapLiveBlogPost({
      title: "Live post",
      slug: "live-post",
      meta_description: "Excerpt",
      published_at: "2026-08-20T00:00:00Z",
      author: "maya",
      category: "Guides",
    }, 0);
    expect(card.href).toBe("/blog/live-post");
    expect(card.title).toBe("Live post");
    expect(card.author).toBe("maya");
  });

  it("uses XP level labels instead of invented titles", () => {
    expect(featuredMemberRole(12)).toBe("Level 12");
  });

  it("strips demo collections from the live public config", () => {
    const live = publicLiveConfig(LANDING_DEFAULTS);
    expect(live.demoChatrooms).toEqual([]);
    expect(live.trendingPosts).toEqual([]);
    expect(live.heroTitle).toBe(LANDING_DEFAULTS.heroTitle);
    expect(live.featureCards.length).toBeGreaterThan(0);
  });
});

describe("demo vs live view resolution", () => {
  it("does not fall back to demo identities in live mode", () => {
    const view = resolveLandingView(LANDING_DEFAULTS, null);
    expect(view.source).toBe("live");
    expect(view.chatrooms).toEqual([]);
    expect(view.topMembers).toEqual([]);
    expect(view.feedPost).toBeNull();
    expect(view.poll).toBeNull();
    expect(view.confession).toBeNull();
    expect(view.blogPosts).toEqual([]);
    expect(view.activities).toEqual([]);
    expect(view.stats.members).toBe(0);
    for (const name of DEMO_IDENTITY_NAMES) {
      expect(JSON.stringify(view)).not.toContain(name);
    }
  });

  it("uses curated demo arrays only when source is demo", () => {
    const demoCfg = { ...LANDING_DEFAULTS, useDemoData: true };
    const view = resolveLandingView(demoCfg, null);
    expect(view.source).toBe("demo");
    expect(view.feedPost?.username).toBe("Amit Sharma");
    expect(view.blogPosts.length).toBeGreaterThan(0);
  });

  it("keeps empty live payload empty even if demo arrays exist on config", () => {
    const view = resolveLandingView(LANDING_DEFAULTS, {
      config: LANDING_DEFAULTS,
      source: "live",
      stats: { members: 2, online: 1, activeRooms: 1, messagesSent: 0, feedPosts: 3, gamesPlayed: 0 },
      chatrooms: [],
      topMembers: [],
      feedPost: null,
      poll: null,
      confession: null,
      trendingPosts: [],
      discussions: [],
      featuredMembers: [],
      recentConfessions: [],
      blogPosts: [],
      activities: [],
      newMembers: [],
    });
    expect(view.source).toBe("live");
    expect(view.feedPost).toBeNull();
    expect(view.blogPosts).toEqual([]);
    expect(view.stats.members).toBe(2);
  });
});

describe("landing API sources", () => {
  it("live blog query uses blog_posts, not custom_pages", () => {
    const server = read("lib/landing-live.server.ts");
    const route = read("routes/api/public/landing.ts");
    expect(server).toContain('.from("blog_posts")');
    expect(server).not.toContain("custom_pages");
    expect(server).not.toContain("categories(name)");
    expect(server).not.toContain("fetchPublishedBlogs");
    expect((server.match(/\.from\("confessions"\)/g) ?? []).length).toBe(1);
    expect((server.match(/\.from\("posts"\)/g) ?? []).length).toBeLessThanOrEqual(5);
    expect(server).toContain('timed("user_bans"');
    expect(route).not.toContain("custom_pages");
    expect(route).toContain("fetchLiveLandingData");
    expect(route).toContain("publicLiveConfig");
    expect(route).toContain("chat_channels");
    expect(route).toContain('source: "live"');
    expect(route).toContain("if (cfg.useDemoData)");
    expect(route).toContain("max-age=30");
  });

  it("live mode does not fall back to demo collections", () => {
    const route = read("routes/api/public/landing.ts");
    const server = read("lib/landing-live.server.ts");
    expect(route).toContain("if (cfg.useDemoData)");
    expect(route).not.toContain("?? cfg.demo");
    expect(server).not.toContain("LANDING_DEFAULTS");
    expect(server).not.toContain("demoFeedPost");
    expect(server).not.toContain("custom_pages");
  });

  it("guest shell uses resolveLandingView instead of demo fallbacks", () => {
    const shell = read("components/home/HomeGuestShell.tsx");
    expect(shell).toContain("resolveLandingView");
    expect(shell).not.toContain("cfg.demoChatrooms");
    expect(shell).not.toContain("cfg.demoFeedPost");
  });

  it("public avatars use the approved https resolver", () => {
    const server = read("lib/landing-live.server.ts");
    const gate = read("lib/auth-gate.tsx");
    const settings = read("lib/app-settings.tsx");
    expect(server).toContain("resolvePublicAvatarUrl");
    expect(server).toContain("avatar_moderation_status");
    expect(server).not.toContain("avatar_quarantine_url");
    expect(server).toContain("newProfileQ()");
    expect(server).toContain("avatarUrl: latest.is_anonymous ? undefined");
    expect(server).toContain("avatarUrl: p.is_anonymous ? undefined");
    expect(gate).toMatch(/lazy\(\(\) =>/);
    expect(gate).toContain("AuthDialogs");
    expect(settings).toContain("GUEST_HOME_SETTING_KEYS");
    expect(settings).toContain('.in("key"');
  });
});
