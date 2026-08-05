import type { DiscoveryContentScope } from "@/lib/discovery/config";

export type DiscoveryPrimaryKind = "global" | "country" | "language_community";

export type DiscoveryPrimaryOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  kind: DiscoveryPrimaryKind;
  countryCode: string | null;
  contentScope: DiscoveryContentScope;
  preferredLanguages: string[];
  sortOrder: number;
  enabled: boolean;
};

export type DiscoveryNestedKind = "city" | "region" | "topic";

export type DiscoveryNestedOption = {
  slug: string;
  label: string;
  emoji: string | null;
  kind: DiscoveryNestedKind;
  parentId: string;
  countryCode: string | null;
  sortOrder: number;
  enabled: boolean;
};

export type DiscoveryExperienceConfig = {
  fullScreenDiscoveryEnabled: boolean;
  firstLoginDiscoveryRequired: boolean;
  primaryOptions: DiscoveryPrimaryOption[];
  nestedOptions: DiscoveryNestedOption[];
};

export const DEFAULT_PRIMARY_OPTIONS: DiscoveryPrimaryOption[] = [
  {
    id: "global",
    label: "Global",
    description: "Worldwide content and chatrooms from every region.",
    emoji: "🌍",
    kind: "global",
    countryCode: null,
    contentScope: "worldwide",
    preferredLanguages: [],
    sortOrder: 10,
    enabled: true,
  },
  {
    id: "IN",
    label: "India",
    description: "Country-scoped discovery for India.",
    emoji: "🇮🇳",
    kind: "country",
    countryCode: "IN",
    contentScope: "my_country",
    preferredLanguages: ["hi", "en"],
    sortOrder: 20,
    enabled: true,
  },
  {
    id: "PK",
    label: "Pakistan",
    description: "Country-scoped discovery for Pakistan.",
    emoji: "🇵🇰",
    kind: "country",
    countryCode: "PK",
    contentScope: "my_country",
    preferredLanguages: ["ur", "en"],
    sortOrder: 30,
    enabled: true,
  },
  {
    id: "PH",
    label: "Philippines",
    description: "Country-scoped discovery for the Philippines.",
    emoji: "🇵🇭",
    kind: "country",
    countryCode: "PH",
    contentScope: "my_country",
    preferredLanguages: ["en"],
    sortOrder: 40,
    enabled: true,
  },
  {
    id: "english_community",
    label: "English Community",
    description: "Language-first global discovery in English.",
    emoji: "🇬🇧",
    kind: "language_community",
    countryCode: null,
    contentScope: "worldwide",
    preferredLanguages: ["en"],
    sortOrder: 50,
    enabled: true,
  },
];

export const DEFAULT_NESTED_OPTIONS: DiscoveryNestedOption[] = [
  { slug: "all-india", label: "All India", emoji: "🇮🇳", kind: "region", parentId: "IN", countryCode: "IN", sortOrder: 10, enabled: true },
  { slug: "mumbai", label: "Mumbai", emoji: "🏙️", kind: "city", parentId: "IN", countryCode: "IN", sortOrder: 20, enabled: true },
  { slug: "delhi", label: "Delhi", emoji: "🏛️", kind: "city", parentId: "IN", countryCode: "IN", sortOrder: 30, enabled: true },
  { slug: "bollywood", label: "Bollywood", emoji: "🎬", kind: "topic", parentId: "IN", countryCode: "IN", sortOrder: 40, enabled: true },
  { slug: "cricket", label: "Cricket", emoji: "🏏", kind: "topic", parentId: "IN", countryCode: "IN", sortOrder: 50, enabled: true },
  { slug: "poetry", label: "Poetry", emoji: "✍️", kind: "topic", parentId: "IN", countryCode: "IN", sortOrder: 60, enabled: true },
  { slug: "friendship", label: "Friendship", emoji: "🤝", kind: "topic", parentId: "IN", countryCode: "IN", sortOrder: 70, enabled: true },
  { slug: "all-pakistan", label: "All Pakistan", emoji: "🇵🇰", kind: "region", parentId: "PK", countryCode: "PK", sortOrder: 10, enabled: true },
  { slug: "lahore", label: "Lahore", emoji: "🏙️", kind: "city", parentId: "PK", countryCode: "PK", sortOrder: 20, enabled: true },
  { slug: "islamabad", label: "Islamabad", emoji: "🏛️", kind: "city", parentId: "PK", countryCode: "PK", sortOrder: 30, enabled: true },
  { slug: "karachi", label: "Karachi", emoji: "🌊", kind: "city", parentId: "PK", countryCode: "PK", sortOrder: 40, enabled: true },
  { slug: "urdu-poetry", label: "Urdu Poetry", emoji: "📜", kind: "topic", parentId: "PK", countryCode: "PK", sortOrder: 50, enabled: true },
  { slug: "cricket-pk", label: "Cricket", emoji: "🏏", kind: "topic", parentId: "PK", countryCode: "PK", sortOrder: 60, enabled: true },
  { slug: "friendship-pk", label: "Friendship", emoji: "🤝", kind: "topic", parentId: "PK", countryCode: "PK", sortOrder: 70, enabled: true },
  { slug: "all-philippines", label: "All Philippines", emoji: "🇵🇭", kind: "region", parentId: "PH", countryCode: "PH", sortOrder: 10, enabled: true },
  { slug: "manila", label: "Manila", emoji: "🏙️", kind: "city", parentId: "PH", countryCode: "PH", sortOrder: 20, enabled: true },
  { slug: "cebu", label: "Cebu", emoji: "🏝️", kind: "city", parentId: "PH", countryCode: "PH", sortOrder: 30, enabled: true },
  { slug: "music", label: "Music", emoji: "🎵", kind: "topic", parentId: "PH", countryCode: "PH", sortOrder: 40, enabled: true },
  { slug: "friendship-ph", label: "Friendship", emoji: "🤝", kind: "topic", parentId: "PH", countryCode: "PH", sortOrder: 50, enabled: true },
  { slug: "worldwide-chat", label: "Worldwide Chat", emoji: "💬", kind: "topic", parentId: "global", countryCode: null, sortOrder: 10, enabled: true },
  { slug: "english-chat", label: "English Chat", emoji: "🇬🇧", kind: "topic", parentId: "global", countryCode: null, sortOrder: 20, enabled: true },
  { slug: "music-global", label: "Music", emoji: "🎵", kind: "topic", parentId: "global", countryCode: null, sortOrder: 30, enabled: true },
  { slug: "gaming", label: "Gaming", emoji: "🎮", kind: "topic", parentId: "global", countryCode: null, sortOrder: 40, enabled: true },
  { slug: "poetry-global", label: "Poetry", emoji: "✍️", kind: "topic", parentId: "global", countryCode: null, sortOrder: 50, enabled: true },
  { slug: "make-friends", label: "Make Friends", emoji: "🤝", kind: "topic", parentId: "global", countryCode: null, sortOrder: 60, enabled: true },
  { slug: "english-chat-en", label: "English Chat", emoji: "🇬🇧", kind: "topic", parentId: "english_community", countryCode: null, sortOrder: 10, enabled: true },
  { slug: "make-friends-en", label: "Make Friends", emoji: "🤝", kind: "topic", parentId: "english_community", countryCode: null, sortOrder: 20, enabled: true },
];

export function mergeDiscoveryExperienceConfig(raw: Partial<DiscoveryExperienceConfig> | undefined): DiscoveryExperienceConfig {
  const primary = raw?.primaryOptions?.length
    ? raw.primaryOptions.map((p) => ({ ...p, countryCode: p.countryCode?.toUpperCase().slice(0, 2) ?? null }))
    : DEFAULT_PRIMARY_OPTIONS;
  const nested = raw?.nestedOptions?.length ? raw.nestedOptions : DEFAULT_NESTED_OPTIONS;
  return {
    fullScreenDiscoveryEnabled: raw?.fullScreenDiscoveryEnabled ?? true,
    firstLoginDiscoveryRequired: raw?.firstLoginDiscoveryRequired ?? true,
    primaryOptions: primary.filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    nestedOptions: nested.filter((n) => n.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function nestedForPrimary(primaryId: string, nested: DiscoveryNestedOption[]): DiscoveryNestedOption[] {
  return nested.filter((n) => n.parentId === primaryId && n.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
}

export type DiscoverySearchGroup = "Countries" | "Cities/Regions" | "Languages" | "Topics";

export type DiscoverySearchHit = {
  group: DiscoverySearchGroup;
  id: string;
  label: string;
  emoji: string | null;
  primaryId: string;
  slug?: string;
  languageCode?: string;
};

export function searchDiscoveryOptions(
  query: string,
  primary: DiscoveryPrimaryOption[],
  nested: DiscoveryNestedOption[],
  languages: { code: string; label: string }[],
): DiscoverySearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: DiscoverySearchHit[] = [];
  for (const p of primary) {
    if (p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
      hits.push({ group: "Countries", id: p.id, label: p.label, emoji: p.emoji, primaryId: p.id });
    }
  }
  for (const n of nested) {
    if (!n.label.toLowerCase().includes(q) && !n.slug.includes(q)) continue;
    const group: DiscoverySearchGroup = n.kind === "topic" ? "Topics" : "Cities/Regions";
    hits.push({ group, id: n.slug, label: n.label, emoji: n.emoji, primaryId: n.parentId, slug: n.slug });
  }
  for (const l of languages) {
    if (l.label.toLowerCase().includes(q) || l.code.includes(q)) {
      hits.push({ group: "Languages", id: l.code, label: l.label, emoji: null, primaryId: "english_community", languageCode: l.code });
    }
  }
  return hits.slice(0, 24);
}
