import type { AdminChannelInput } from "@/lib/chat-store";
import type { AudienceScope } from "@/lib/discovery/config";
import type { DiscoverableChannel } from "@/lib/discovery/types";
import { normalizeAudienceScope } from "@/lib/discovery/isolation";

export type PlatformChannelMeta = AdminChannelInput & {
  audienceScope?: AudienceScope;
  countryCode?: string | null;
  allowedCountryCodes?: string[];
  languageCodes?: string[];
  interestSlugs?: string[];
  featured?: boolean;
  memberCount?: number;
};

export function platformChannelsFromSettings(raw: unknown): PlatformChannelMeta[] {
  const list = (raw as { list?: PlatformChannelMeta[] } | undefined)?.list;
  if (!Array.isArray(list)) return [];
  return list.filter((c) => c?.id && c?.name);
}

export function toDiscoverablePlatformChannel(c: PlatformChannelMeta): DiscoverableChannel {
  return {
    id: c.id,
    name: c.name,
    topic: c.topic,
    kind: c.kind,
    source: "platform",
    audienceScope: normalizeAudienceScope(c.audienceScope),
    countryCode: c.countryCode?.toUpperCase() ?? null,
    allowedCountryCodes: (c.allowedCountryCodes ?? []).map((x) => x.toUpperCase()),
    languageCodes: c.languageCodes ?? [],
    interestSlugs: c.interestSlugs ?? [],
    memberCount: c.memberCount ?? 0,
    featured: Boolean(c.featured),
  };
}

export function toDiscoverableDbChatroom(row: {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  featured?: boolean | null;
  member_count?: number | null;
  community_id?: string | null;
  audience_scope?: string | null;
  country_code?: string | null;
  allowed_country_codes?: string[] | null;
  language_codes?: string[] | null;
  interest_slugs?: string[] | null;
  communities?: { slug?: string | null } | null;
}): DiscoverableChannel {
  const interests = row.interest_slugs?.length
    ? row.interest_slugs
    : row.category
      ? [row.category.toLowerCase().replace(/\s+/g, "-")]
      : [];
  return {
    id: row.id,
    name: row.name,
    topic: row.description ?? undefined,
    kind: "chat",
    source: "community",
    audienceScope: normalizeAudienceScope(row.audience_scope),
    countryCode: row.country_code?.toUpperCase() ?? null,
    allowedCountryCodes: (row.allowed_country_codes ?? []).map((x) => x.toUpperCase()),
    languageCodes: row.language_codes ?? [],
    interestSlugs: interests,
    memberCount: row.member_count ?? 0,
    featured: Boolean(row.featured),
    communityId: row.community_id ?? undefined,
    communitySlug: row.communities?.slug ?? undefined,
    roomSlug: row.slug,
  };
}
