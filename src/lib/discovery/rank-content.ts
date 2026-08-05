import type { AudienceScope, DiscoveryLocalizationConfig, ModuleDiscoveryMix } from "@/lib/discovery/config";
import type { UserDiscoveryPrefs } from "@/lib/discovery/types";
import { parseStoredContentScope } from "@/lib/discovery/content-scope";
import { passesDiscoveryModeFilter, passesStrictCountryIsolation } from "@/lib/discovery/isolation";
import type { DiscoverableChannel } from "@/lib/discovery/types";

export type DiscoverableContentInput = {
  id: string;
  audienceScope?: AudienceScope | string | null;
  contentCountry?: string | null;
  contentLanguages?: string[];
  contentTags?: string[];
  memberCount?: number;
  featured?: boolean;
  trendingScore?: number;
  authorId?: string | null;
  createdAt?: string;
};

export type RankDiscoverableContentInput = {
  userPrefs: UserDiscoveryPrefs | null;
  adminConfig: DiscoveryLocalizationConfig;
  discoveryCountry: string;
  contentScope: "for_you" | "my_country" | "worldwide";
  joinedIds?: string[];
  followedIds?: string[];
  friendIds?: string[];
  ownUserId?: string | null;
  moduleMix?: ModuleDiscoveryMix;
};

function overlapCount(a: string[], b: string[]): number {
  const set = new Set(a.map((x) => x.toLowerCase()));
  let n = 0;
  for (const x of b) if (set.has(x.toLowerCase())) n++;
  return n;
}

function normalizeAudience(raw: string | null | undefined): AudienceScope {
  const v = (raw ?? "global").toLowerCase();
  if (v === "single_country" || v === "multi_country" || v === "private") return v;
  return "global";
}

function countryScore(contentCountry: string | null | undefined, audienceScope: AudienceScope, userCountry: string): number {
  const cc = userCountry.toUpperCase();
  if (audienceScope === "global") return 0.35;
  if (contentCountry?.toUpperCase() === cc) return 1;
  return 0;
}

function languageScore(contentLanguages: string[], preferred: string[]): number {
  if (!preferred.length || !contentLanguages.length) return 0.15;
  const hits = overlapCount(preferred, contentLanguages);
  return hits / Math.max(preferred.length, contentLanguages.length);
}

function interestScore(contentTags: string[], interests: string[]): number {
  if (!interests.length || !contentTags.length) return 0.1;
  const hits = overlapCount(interests, contentTags);
  return hits / Math.max(interests.length, 1);
}

function modeWeight(mode: DiscoveryLocalizationConfig["discoveryMode"], mix: ModuleDiscoveryMix) {
  if (mode === "global_first") return { country: 0.25, interests: 0.35, global: 0.4 };
  if (mode === "country_first") return { country: 0.55, interests: 0.3, global: 0.15 };
  if (mode === "country_only") return { country: 0.85, interests: 0.15, global: 0 };
  return { country: mix.countryPct / 100, interests: mix.interestsPct / 100, global: mix.globalPct / 100 };
}

export function rankDiscoverableContent<T extends DiscoverableContentInput>(
  ctx: RankDiscoverableContentInput,
  content: T,
): { score: number; reasons: string[]; hidden: boolean } {
  const prefs = ctx.userPrefs;
  const interests = prefs?.interests?.length ? prefs.interests : ctx.adminConfig.defaultInterests;
  const langs = prefs?.preferred_languages?.length ? prefs.preferred_languages : ctx.adminConfig.defaultLanguages;
  const parsed = parseStoredContentScope(typeof prefs?.content_scope === "string" ? prefs.content_scope : null);
  const strict = parsed.strictIsolation || ctx.adminConfig.strictIsolation.enabled;
  const audienceScope = normalizeAudience(content.audienceScope);
  const contentCountry = content.contentCountry?.toUpperCase() ?? null;
  const userCountry = ctx.discoveryCountry.toUpperCase();

  const friendIds = new Set(ctx.friendIds ?? []);
  const followedIds = new Set(ctx.followedIds ?? []);
  const joinedIds = new Set(ctx.joinedIds ?? []);
  const isOwn = ctx.ownUserId && content.authorId === ctx.ownUserId;
  const isFriend = content.authorId ? friendIds.has(content.authorId) : false;
  const isFollowed = content.authorId ? followedIds.has(content.authorId) : false;

  if (strict && !isOwn && !isFriend && !isFollowed) {
    if (audienceScope === "single_country" && contentCountry && contentCountry !== userCountry) {
      return { score: -1, reasons: ["isolated"], hidden: true };
    }
  }

  const channelLike: DiscoverableChannel = {
    id: content.id,
    name: "",
    source: "platform",
    audienceScope,
    countryCode: contentCountry,
    allowedCountryCodes: [],
    languageCodes: content.contentLanguages ?? [],
    interestSlugs: content.contentTags ?? [],
    memberCount: content.memberCount ?? 0,
    featured: Boolean(content.featured),
  };

  if (
    !passesStrictCountryIsolation({
      channel: channelLike,
      userCountry,
      joinedChannelIds: joinedIds,
      followedChannelIds: followedIds,
      config: ctx.adminConfig,
    })
  ) {
    return { score: -1, reasons: ["isolated"], hidden: true };
  }

  if (!passesDiscoveryModeFilter(channelLike, userCountry, ctx.adminConfig.discoveryMode, ctx.contentScope)) {
    if (!isOwn && !isFriend && !isFollowed) return { score: -1, reasons: ["scope"], hidden: true };
  }

  const mix = ctx.moduleMix ?? ctx.adminConfig.moduleMix.feed;
  const weights = modeWeight(ctx.adminConfig.discoveryMode, mix);
  const cScore = countryScore(contentCountry, audienceScope, userCountry);
  const lScore = languageScore(content.contentLanguages ?? [], langs);
  const iScore = interestScore(content.contentTags ?? [], interests);
  const trending = Math.min(1, (content.trendingScore ?? content.memberCount ?? 0) / 500);
  const featured = content.featured ? 0.15 : 0;
  const social = isFriend ? 1.2 : isFollowed ? 0.9 : isOwn ? 1.5 : 0;
  const globalBoost = audienceScope === "global" ? weights.global : 0;
  const enBoost =
    langs.includes("en") && (content.contentLanguages ?? []).some((l) => l.toLowerCase() === "en") ? 0.2 : 0;

  const score =
    social +
    cScore * weights.country +
    (iScore * 0.7 + lScore * 0.3 + enBoost) * weights.interests +
    globalBoost +
    trending * 0.12 +
    featured;

  const reasons: string[] = [];
  if (isFriend) reasons.push("friend");
  if (isFollowed) reasons.push("followed");
  if (isOwn) reasons.push("own");
  if (cScore >= 0.85) reasons.push("country");
  if (iScore > 0) reasons.push("interests");
  if (lScore > 0.3) reasons.push("language");
  if (trending > 0.2) reasons.push("trending");

  return { score, reasons, hidden: false };
}

export function rankDiscoverableContentList<T extends DiscoverableContentInput>(
  items: T[],
  ctx: RankDiscoverableContentInput,
  opts?: { limit?: number; minLocalBeforeGlobal?: number },
): Array<{ item: T; score: number; reasons: string[] }> {
  const minLocal = opts?.minLocalBeforeGlobal ?? ctx.adminConfig.minLocalContentThreshold;
  const ranked = items
    .map((item) => {
      const r = rankDiscoverableContent(ctx, item);
      return { item, score: r.score, reasons: r.reasons, hidden: r.hidden };
    })
    .filter((r) => !r.hidden && r.score >= 0)
    .sort((a, b) => b.score - a.score);

  const localCount = ranked.filter((r) => r.reasons.includes("country")).length;
  if (localCount >= minLocal) return ranked.slice(0, opts?.limit ?? ranked.length);

  const need = minLocal - localCount;
  const globalFill = items
    .filter((item) => normalizeAudience(item.audienceScope) === "global")
    .map((item) => {
      const r = rankDiscoverableContent(ctx, item);
      return { item, score: r.score, reasons: r.reasons, hidden: r.hidden };
    })
    .filter((r) => !r.hidden)
    .sort((a, b) => b.score - a.score)
    .slice(0, need);

  const merged = [...ranked];
  for (const g of globalFill) {
    if (!merged.some((m) => m.item.id === g.item.id)) merged.push(g);
  }
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, opts?.limit ?? merged.length);
}

export type FeedRankablePost = DiscoverableContentInput & {
  author_id: string;
  hashtags: string[];
  trending_score?: number;
};

export function rankFeedPosts<T extends FeedRankablePost>(
  posts: T[],
  ctx: RankDiscoverableContentInput,
  authorCountries: Map<string, string | null | undefined>,
): T[] {
  const mapped = posts.map((p) => ({
    ...p,
    contentCountry: authorCountries.get(p.author_id) ?? null,
    contentTags: [...(p.contentTags ?? []), ...p.hashtags.map((h) => h.toLowerCase())],
    contentLanguages: p.contentLanguages ?? [],
    trendingScore: p.trending_score ?? p.trendingScore,
    authorId: p.author_id,
  }));
  return rankDiscoverableContentList(mapped, { ...ctx, moduleMix: ctx.adminConfig.moduleMix.feed }).map((r) => {
    const { contentCountry, contentTags, contentLanguages, trendingScore, authorId, ...rest } = r.item as T & DiscoverableContentInput;
    void contentCountry;
    void contentTags;
    void contentLanguages;
    void trendingScore;
    void authorId;
    return rest as T;
  });
}
