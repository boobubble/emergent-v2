import type { ModuleDiscoveryMix } from "@/lib/discovery/config";
import type { DiscoverableChannel, DiscoveryContext, RankedItem } from "@/lib/discovery/types";
import { passesDiscoveryModeFilter, passesStrictCountryIsolation } from "@/lib/discovery/isolation";

function overlapCount(a: string[], b: string[]): number {
  const set = new Set(a.map((x) => x.toLowerCase()));
  let n = 0;
  for (const x of b) if (set.has(x.toLowerCase())) n++;
  return n;
}

function countryScore(channel: DiscoverableChannel, country: string): number {
  const cc = country.toUpperCase();
  if (channel.audienceScope === "global") return 0.35;
  if (channel.countryCode?.toUpperCase() === cc) return 1;
  if (channel.allowedCountryCodes.some((c) => c.toUpperCase() === cc)) return 0.85;
  return 0;
}

function languageScore(channel: DiscoverableChannel, langs: string[]): number {
  if (!langs.length || !channel.languageCodes.length) return 0.2;
  const hits = overlapCount(langs, channel.languageCodes);
  return hits / Math.max(langs.length, channel.languageCodes.length);
}

function interestScore(channel: DiscoverableChannel, interests: string[]): number {
  if (!interests.length || !channel.interestSlugs.length) return 0.15;
  const hits = overlapCount(interests, channel.interestSlugs);
  return hits / Math.max(interests.length, 1);
}

function modeWeight(mode: DiscoveryContext["config"]["discoveryMode"], mix: ModuleDiscoveryMix) {
  if (mode === "global_first") return { country: 0.25, interests: 0.35, global: 0.4 };
  if (mode === "country_first") return { country: 0.55, interests: 0.3, global: 0.15 };
  if (mode === "country_only") return { country: 0.85, interests: 0.15, global: 0 };
  return {
    country: mix.countryPct / 100,
    interests: mix.interestsPct / 100,
    global: mix.globalPct / 100,
  };
}

export function scoreDiscoverableChannel(
  channel: DiscoverableChannel,
  ctx: DiscoveryContext,
  mix: ModuleDiscoveryMix,
): RankedItem<DiscoverableChannel> {
  const weights = modeWeight(ctx.config.discoveryMode, mix);
  const cScore = countryScore(channel, ctx.discoveryCountry);
  const lScore = languageScore(channel, ctx.preferredLanguages);
  const iScore = interestScore(channel, ctx.interests);
  const trending = Math.min(1, channel.memberCount / 500);
  const featured = channel.featured ? 0.15 : 0;
  const joined = ctx.joinedChannelIds.includes(channel.id) ? 0.25 : 0;
  const globalBoost = channel.audienceScope === "global" ? weights.global : 0;
  const score =
    cScore * weights.country +
    (iScore * 0.7 + lScore * 0.3) * weights.interests +
    globalBoost +
    trending * 0.12 +
    featured +
    joined;
  const reasons: string[] = [];
  if (cScore >= 0.85) reasons.push("country");
  if (iScore > 0) reasons.push("interests");
  if (lScore > 0.3) reasons.push("language");
  if (trending > 0.2) reasons.push("trending");
  if (channel.featured) reasons.push("featured");
  if (joined) reasons.push("joined");
  return { item: channel, score, reasons };
}

export function rankDiscoverableChannels(
  channels: DiscoverableChannel[],
  ctx: DiscoveryContext,
  opts?: { module?: keyof DiscoveryContext["config"]["moduleMix"]; limit?: number },
): RankedItem<DiscoverableChannel>[] {
  const mix = opts?.module ? ctx.config.moduleMix[opts.module] : ctx.config.hybridMix;
  const joinedSet = new Set(ctx.joinedChannelIds);
  const filtered = channels.filter((ch) => {
    if (!passesStrictCountryIsolation({ channel: ch, userCountry: ctx.discoveryCountry, joinedChannelIds: joinedSet, config: ctx.config })) return false;
    return passesDiscoveryModeFilter(ch, ctx.discoveryCountry, ctx.config.discoveryMode, ctx.contentScope);
  });
  const ranked = filtered.map((ch) => scoreDiscoverableChannel(ch, ctx, mix)).sort((a, b) => b.score - a.score);
  const limit = opts?.limit ?? ranked.length;
  const localCount = ranked.filter((r) => r.reasons.includes("country")).length;
  if (localCount >= ctx.config.minLocalContentThreshold) return ranked.slice(0, limit);
  const need = ctx.config.minLocalContentThreshold - localCount;
  const globalFill = channels
    .filter((ch) => ch.audienceScope === "global" && !filtered.some((f) => f.id === ch.id))
    .map((ch) => scoreDiscoverableChannel(ch, ctx, mix))
    .sort((a, b) => b.score - a.score)
    .slice(0, need);
  const merged = [...ranked];
  for (const g of globalFill) if (!merged.some((m) => m.item.id === g.item.id)) merged.push(g);
  merged.sort((a, b) => b.score - a.score);
  return merged.slice(0, limit);
}

export function buildChatroomDiscoverySections(channels: DiscoverableChannel[], ctx: DiscoveryContext) {
  const ranked = rankDiscoverableChannels(channels, ctx, { module: "chatrooms", limit: 80 });
  const all = ranked.map((r) => r.item);
  const joined = all.filter((c) => ctx.joinedChannelIds.includes(c.id));
  const country = all.filter((c) => countryScore(c, ctx.discoveryCountry) >= 0.85 && !joined.some((j) => j.id === c.id));
  const interests = all.filter((c) => interestScore(c, ctx.interests) > 0 && !joined.some((j) => j.id === c.id));
  const trending = [...all].sort((a, b) => b.memberCount - a.memberCount).slice(0, 8);
  const global = all.filter((c) => c.audienceScope === "global" && !joined.some((j) => j.id === c.id));
  return [
    { key: "joined", title: "Joined Channels", channels: joined },
    { key: "popular_country", title: `Popular in ${ctx.discoveryCountry}`, channels: country.slice(0, 8) },
    { key: "by_interests", title: "Based on Your Interests", channels: interests.slice(0, 8) },
    { key: "friends_active", title: "Friends Are Active Here", channels: [] as DiscoverableChannel[] },
    { key: "trending", title: "Trending Channels", channels: trending },
    { key: "global_public", title: "Global Public Chatrooms", channels: global.slice(0, 8) },
  ].filter((s) => s.key === "joined" || s.channels.length > 0);
}
