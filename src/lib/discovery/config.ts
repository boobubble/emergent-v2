export type DiscoveryMode = "global_first" | "country_first" | "hybrid" | "country_only";
export type DiscoveryContentScope = "for_you" | "my_country" | "worldwide";
export type UserContentPreference = "for_you" | "country_first" | "balanced" | "worldwide_first";
export type AudienceScope = "global" | "single_country" | "multi_country" | "private";

export type ModuleDiscoveryMix = {
  countryPct: number;
  interestsPct: number;
  globalPct: number;
};

export type StrictIsolationConfig = {
  enabled: boolean;
  allowGlobalRooms: boolean;
  allowCrossCountryInvites: boolean;
  allowJoinedForeignRooms: boolean;
  allowSearchAcrossCountries: boolean;
  lockDiscoveryCountry: boolean;
  allowUserChangeDiscoveryCountry: boolean;
};

export type DiscoveryLocalizationConfig = {
  onboardingEnabled: boolean;
  requireOnboardingAgain: boolean;
  discoveryMode: DiscoveryMode;
  defaultCountryCode: string;
  enabledCountries: string[];
  enabledLanguages: string[];
  minLocalContentThreshold: number;
  allowUserChangeDiscoveryCountry: boolean;
  modules: {
    chatrooms: boolean;
    feed: boolean;
    poetry: boolean;
    competitions: boolean;
    profiles: boolean;
    games: boolean;
    forum: boolean;
    leaderboards: boolean;
  };
  hybridMix: ModuleDiscoveryMix;
  moduleMix: {
    chatrooms: ModuleDiscoveryMix;
    feed: ModuleDiscoveryMix;
    poetry: ModuleDiscoveryMix;
    competitions: ModuleDiscoveryMix;
    profiles: ModuleDiscoveryMix;
  };
  strictIsolation: StrictIsolationConfig;
  defaultInterests: string[];
  defaultLanguages: string[];
};

export const DEFAULT_MODULE_MIX: ModuleDiscoveryMix = {
  countryPct: 50,
  interestsPct: 30,
  globalPct: 20,
};

export const DISCOVERY_LOCALIZATION_DEFAULTS: DiscoveryLocalizationConfig = {
  onboardingEnabled: true,
  requireOnboardingAgain: false,
  discoveryMode: "global_first",
  defaultCountryCode: "US",
  enabledCountries: ["US", "GB", "IN", "PK", "CA", "AU", "BD", "AE"],
  enabledLanguages: ["en", "hi", "ur", "pa", "bn", "ta", "mr"],
  minLocalContentThreshold: 10,
  allowUserChangeDiscoveryCountry: true,
  modules: {
    chatrooms: true,
    feed: true,
    poetry: true,
    competitions: true,
    profiles: true,
    games: true,
    forum: true,
    leaderboards: true,
  },
  hybridMix: { ...DEFAULT_MODULE_MIX },
  moduleMix: {
    chatrooms: { countryPct: 60, interestsPct: 25, globalPct: 15 },
    feed: { countryPct: 40, interestsPct: 40, globalPct: 20 },
    poetry: { countryPct: 30, interestsPct: 50, globalPct: 20 },
    competitions: { countryPct: 50, interestsPct: 30, globalPct: 20 },
    profiles: { countryPct: 45, interestsPct: 35, globalPct: 20 },
  },
  strictIsolation: {
    enabled: false,
    allowGlobalRooms: true,
    allowCrossCountryInvites: false,
    allowJoinedForeignRooms: true,
    allowSearchAcrossCountries: false,
    lockDiscoveryCountry: false,
    allowUserChangeDiscoveryCountry: true,
  },
  defaultInterests: ["general-chat", "friendship"],
  defaultLanguages: ["en"],
};

export function normalizeModuleMix(mix: Partial<ModuleDiscoveryMix> | undefined): ModuleDiscoveryMix {
  const countryPct = Math.max(0, Number(mix?.countryPct) || 0);
  const interestsPct = Math.max(0, Number(mix?.interestsPct) || 0);
  const globalPct = Math.max(0, Number(mix?.globalPct) || 0);
  const total = countryPct + interestsPct + globalPct;
  if (total <= 0) return { ...DEFAULT_MODULE_MIX };
  if (total === 100) return { countryPct, interestsPct, globalPct };
  const scale = 100 / total;
  const c = Math.round(countryPct * scale);
  const i = Math.round(interestsPct * scale);
  return { countryPct: c, interestsPct: i, globalPct: Math.max(0, 100 - c - i) };
}

export function mergeDiscoveryLocalizationConfig(raw: unknown): DiscoveryLocalizationConfig {
  const r = (raw ?? {}) as Partial<DiscoveryLocalizationConfig>;
  return {
    onboardingEnabled: r.onboardingEnabled ?? DISCOVERY_LOCALIZATION_DEFAULTS.onboardingEnabled,
    requireOnboardingAgain: r.requireOnboardingAgain ?? DISCOVERY_LOCALIZATION_DEFAULTS.requireOnboardingAgain,
    discoveryMode: r.discoveryMode ?? DISCOVERY_LOCALIZATION_DEFAULTS.discoveryMode,
    defaultCountryCode: (r.defaultCountryCode ?? DISCOVERY_LOCALIZATION_DEFAULTS.defaultCountryCode).toUpperCase().slice(0, 2),
    enabledCountries: r.enabledCountries?.length
      ? r.enabledCountries.map((c) => c.toUpperCase().slice(0, 2))
      : DISCOVERY_LOCALIZATION_DEFAULTS.enabledCountries,
    enabledLanguages: r.enabledLanguages?.length ? r.enabledLanguages : DISCOVERY_LOCALIZATION_DEFAULTS.enabledLanguages,
    minLocalContentThreshold: Math.max(1, Number(r.minLocalContentThreshold) || DISCOVERY_LOCALIZATION_DEFAULTS.minLocalContentThreshold),
    allowUserChangeDiscoveryCountry: r.allowUserChangeDiscoveryCountry ?? DISCOVERY_LOCALIZATION_DEFAULTS.allowUserChangeDiscoveryCountry,
    modules: { ...DISCOVERY_LOCALIZATION_DEFAULTS.modules, ...(r.modules ?? {}) },
    hybridMix: normalizeModuleMix(r.hybridMix ?? DISCOVERY_LOCALIZATION_DEFAULTS.hybridMix),
    moduleMix: {
      chatrooms: normalizeModuleMix(r.moduleMix?.chatrooms ?? DISCOVERY_LOCALIZATION_DEFAULTS.moduleMix.chatrooms),
      feed: normalizeModuleMix(r.moduleMix?.feed ?? DISCOVERY_LOCALIZATION_DEFAULTS.moduleMix.feed),
      poetry: normalizeModuleMix(r.moduleMix?.poetry ?? DISCOVERY_LOCALIZATION_DEFAULTS.moduleMix.poetry),
      competitions: normalizeModuleMix(r.moduleMix?.competitions ?? DISCOVERY_LOCALIZATION_DEFAULTS.moduleMix.competitions),
      profiles: normalizeModuleMix(r.moduleMix?.profiles ?? DISCOVERY_LOCALIZATION_DEFAULTS.moduleMix.profiles),
    },
    strictIsolation: { ...DISCOVERY_LOCALIZATION_DEFAULTS.strictIsolation, ...(r.strictIsolation ?? {}) },
    defaultInterests: r.defaultInterests?.length ? r.defaultInterests : DISCOVERY_LOCALIZATION_DEFAULTS.defaultInterests,
    defaultLanguages: r.defaultLanguages?.length ? r.defaultLanguages : DISCOVERY_LOCALIZATION_DEFAULTS.defaultLanguages,
  };
}

export const DISCOVERY_SETTINGS_KEY = "discovery_localization" as const;

export const DISCOVERY_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "pa", label: "Punjabi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "mr", label: "Marathi" },
] as const;
