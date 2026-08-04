export { mergeDiscoveryLocalizationConfig, DISCOVERY_LOCALIZATION_DEFAULTS, DISCOVERY_SETTINGS_KEY } from "@/lib/discovery/config";
export type { DiscoveryContentScope, DiscoveryLocalizationConfig, UserContentPreference } from "@/lib/discovery/config";
export { resolveDiscoveryCountry, prefsNeedOnboarding, hasConfiguredDiscovery, shouldShowPersonalizePrompt } from "@/lib/discovery/country";
export { parseStoredContentScope, encodeStoredContentScope, contentScopeLabel } from "@/lib/discovery/content-scope";
export { rankDiscoverableChannels, buildChatroomDiscoverySections } from "@/lib/discovery/ranking";
export { passesStrictCountryIsolation } from "@/lib/discovery/isolation";
export type { DiscoveryContext, DiscoverableChannel, UserDiscoveryPrefs } from "@/lib/discovery/types";
