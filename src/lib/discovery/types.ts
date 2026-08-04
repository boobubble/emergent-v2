import type {
  AudienceScope,
  DiscoveryContentScope,
  DiscoveryLocalizationConfig,
  UserContentPreference,
} from "@/lib/discovery/config";

export type UserDiscoveryPrefs = {
  user_id: string;
  discovery_country_code: string | null;
  preferred_languages: string[];
  interests: string[];
  selected_channel_ids: string[];
  content_scope: DiscoveryContentScope | UserContentPreference;
  detected_country_code: string | null;
  discovery_onboarding_completed_at: string | null;
  personalize_prompt_dismissed_at: string | null;
  updated_at: string;
};

export type DiscoverableChannel = {
  id: string;
  name: string;
  topic?: string;
  kind?: "chat" | "game";
  source: "platform" | "community";
  audienceScope: AudienceScope;
  countryCode: string | null;
  allowedCountryCodes: string[];
  languageCodes: string[];
  interestSlugs: string[];
  memberCount: number;
  featured: boolean;
  communityId?: string;
  communitySlug?: string;
  roomSlug?: string;
};

export type DiscoverySectionKey =
  | "joined"
  | "popular_country"
  | "by_interests"
  | "friends_active"
  | "trending"
  | "global_public";

export type DiscoverySection = {
  key: DiscoverySectionKey;
  title: string;
  channels: DiscoverableChannel[];
};

export type DiscoveryContext = {
  userId: string | null;
  discoveryCountry: string;
  preferredLanguages: string[];
  interests: string[];
  contentScope: DiscoveryContentScope;
  joinedChannelIds: string[];
  followedChannelIds: string[];
  config: DiscoveryLocalizationConfig;
};

export type RankedItem<T extends { id: string }> = {
  item: T;
  score: number;
  reasons: string[];
};
