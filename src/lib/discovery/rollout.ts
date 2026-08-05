import type { DiscoveryContentScope, DiscoveryLocalizationConfig, DiscoveryRolloutMode } from "@/lib/discovery/config";
import type { DiscoveryNestedOption, DiscoveryPrimaryOption } from "@/lib/discovery/discovery-options";
import type { UserDiscoveryPrefs } from "@/lib/discovery/types";
import { parseStoredContentScope } from "@/lib/discovery/content-scope";

export type { DiscoveryRolloutMode } from "@/lib/discovery/config";

export const CONNECTED_DISCOVERY_MODULES = ["chatrooms", "feed"] as const;
export type ConnectedDiscoveryModule = (typeof CONNECTED_DISCOVERY_MODULES)[number];

export function isDiscoveryFeatureEnabled(config: DiscoveryLocalizationConfig): boolean {
  if (config.rolloutMode === "OFF") return false;
  return config.fullScreenDiscoveryEnabled;
}

export function isPersonalizationActive(config: DiscoveryLocalizationConfig): boolean {
  return isDiscoveryFeatureEnabled(config);
}

export function isModuleConnected(module: keyof DiscoveryLocalizationConfig["modules"]): boolean {
  return (CONNECTED_DISCOVERY_MODULES as readonly string[]).includes(module);
}

export function isModuleRolloutEnabled(
  config: DiscoveryLocalizationConfig,
  module: keyof DiscoveryLocalizationConfig["modules"],
): boolean {
  if (!isPersonalizationActive(config)) return false;
  return Boolean(config.modules[module]);
}

export function primaryOptionsForRollout(config: DiscoveryLocalizationConfig): DiscoveryPrimaryOption[] {
  const all = config.primaryOptions ?? [];
  if (config.rolloutMode === "OFF") return [];
  if (config.rolloutMode === "GLOBAL_ONLY") {
    return all.filter((p) => p.enabled && p.id === "global");
  }
  if (config.rolloutMode === "SELECTED_COUNTRIES" || config.rolloutMode === "FULL_ROLLOUT") {
    return all.filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return [];
}

export function nestedOptionsForRollout(config: DiscoveryLocalizationConfig): DiscoveryNestedOption[] {
  const enabledPrimary = new Set(primaryOptionsForRollout(config).map((p) => p.id));
  return (config.nestedOptions ?? [])
    .filter((n) => n.enabled && enabledPrimary.has(n.parentId))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function countSelectablePrimaryOptions(config: DiscoveryLocalizationConfig): number {
  return primaryOptionsForRollout(config).filter((p) => p.id !== "global" || config.rolloutMode !== "GLOBAL_ONLY").length;
}

export function shouldShowFullScreenDiscovery(
  prefs: UserDiscoveryPrefs | null,
  config: DiscoveryLocalizationConfig,
  opts?: { forceOpen?: boolean; requireAgain?: boolean },
): boolean {
  if (opts?.forceOpen) {
    return isDiscoveryFeatureEnabled(config) && config.rolloutMode !== "OFF";
  }
  if (!isDiscoveryFeatureEnabled(config)) return false;
  if (config.rolloutMode === "OFF" || config.rolloutMode === "GLOBAL_ONLY") return false;
  if (opts?.requireAgain || config.requireOnboardingAgain) return true;
  if (prefs?.discovery_onboarding_completed_at) return false;
  if (hasConfiguredDiscovery(prefs)) return false;
  if (!config.firstLoginDiscoveryRequired) return false;
  const selectable = primaryOptionsForRollout(config);
  if (selectable.length < 2) return false;
  return true;
}

export function hasConfiguredDiscovery(prefs: UserDiscoveryPrefs | null): boolean {
  if (!prefs) return false;
  return Boolean(prefs.discovery_country_code) || prefs.preferred_languages.length > 0 || prefs.interests.length > 0;
}

export function inferPrimaryIdFromSave(
  countryCode: string | null | undefined,
  contentScope: DiscoveryContentScope | undefined,
  langs: string[],
  config: DiscoveryLocalizationConfig,
): string | null {
  const enabled = primaryOptionsForRollout(config);
  if (!countryCode && contentScope === "worldwide") {
    if (langs.map((l) => l.toLowerCase()).includes("en") && enabled.some((p) => p.id === "english_community")) {
      return "english_community";
    }
    const global = enabled.find((p) => p.id === "global");
    return global?.id ?? null;
  }
  if (countryCode) {
    const match = enabled.find((p) => p.countryCode?.toUpperCase() === countryCode.toUpperCase());
    if (match) return match.id;
  }
  return enabled.find((p) => p.id === "global")?.id ?? null;
}

export function isPrimaryEnabled(config: DiscoveryLocalizationConfig, primaryId: string | null): boolean {
  if (!primaryId) return false;
  return primaryOptionsForRollout(config).some((p) => p.id === primaryId);
}

export function isCountryEnabled(config: DiscoveryLocalizationConfig, countryCode: string | null | undefined): boolean {
  if (!countryCode) return true;
  const cc = countryCode.toUpperCase();
  return primaryOptionsForRollout(config).some((p) => p.countryCode?.toUpperCase() === cc);
}

/** Effective prefs for ranking — stored prefs preserved; disabled options fall back safely. */
export function resolveEffectiveDiscoveryPrefs(
  prefs: UserDiscoveryPrefs | null,
  config: DiscoveryLocalizationConfig,
): UserDiscoveryPrefs | null {
  if (!prefs || !isPersonalizationActive(config)) return prefs;

  const parsed = parseStoredContentScope(typeof prefs.content_scope === "string" ? prefs.content_scope : null);
  let country = prefs.discovery_country_code;
  let scope = parsed.view;
  let interests = [...prefs.interests];
  let langs = [...prefs.preferred_languages];

  if (config.rolloutMode === "GLOBAL_ONLY") {
    return {
      ...prefs,
      discovery_country_code: null,
      content_scope: "worldwide",
      interests,
      preferred_languages: langs,
    };
  }

  if (country && !isCountryEnabled(config, country)) {
    country = null;
    scope = "worldwide";
  }

  const enabledNested = new Set(nestedOptionsForRollout(config).map((n) => n.slug));
  const enabledInterests = interests.filter((s) => enabledNested.has(s));
  const disabledKept = interests.filter((s) => !enabledNested.has(s));

  return {
    ...prefs,
    discovery_country_code: country,
    content_scope: scope,
    interests: [...enabledInterests, ...disabledKept],
    preferred_languages: langs,
  };
}

export type DiscoverySaveInput = {
  discovery_country_code?: string | null;
  preferred_languages?: string[];
  interests?: string[];
  content_scope?: DiscoveryContentScope | string;
  strict_country_isolation?: boolean;
  complete_onboarding?: boolean;
};

export type SanitizedDiscoverySave = {
  discovery_country_code: string | null;
  preferred_languages: string[];
  interests: string[];
  content_scope: DiscoveryContentScope;
  strict_country_isolation: boolean;
  rejectedPrimary?: string;
  fellBackToGlobal?: boolean;
};

export function sanitizeDiscoverySave(
  input: DiscoverySaveInput,
  config: DiscoveryLocalizationConfig,
  existing: UserDiscoveryPrefs | null,
): SanitizedDiscoverySave {
  const parsed = parseStoredContentScope(typeof existing?.content_scope === "string" ? existing.content_scope : null);
  let country =
    input.discovery_country_code !== undefined ? input.discovery_country_code : (existing?.discovery_country_code ?? null);
  let langs = input.preferred_languages ?? existing?.preferred_languages ?? config.defaultLanguages;
  let interests = input.interests ?? existing?.interests ?? [];
  let scope = (input.content_scope as DiscoveryContentScope | undefined) ?? parsed.view;
  let strict = input.strict_country_isolation ?? parsed.strictIsolation;
  let fellBackToGlobal = false;
  let rejectedPrimary: string | undefined;

  if (!isDiscoveryFeatureEnabled(config) || config.rolloutMode === "GLOBAL_ONLY") {
    return {
      discovery_country_code: null,
      preferred_languages: langs,
      interests,
      content_scope: "worldwide",
      strict_country_isolation: false,
      fellBackToGlobal: true,
    };
  }

  const primaryId = inferPrimaryIdFromSave(country, scope, langs, config);
  if (country && !isCountryEnabled(config, country)) {
    rejectedPrimary = country;
    country = null;
    scope = "worldwide";
    fellBackToGlobal = true;
  } else if (primaryId && !isPrimaryEnabled(config, primaryId)) {
    rejectedPrimary = primaryId;
    country = null;
    scope = "worldwide";
    fellBackToGlobal = true;
  }

  const enabledNestedSlugs = new Set(nestedOptionsForRollout(config).map((n) => n.slug));
  const sanitizedNew = interests.filter((s) => enabledNestedSlugs.has(s));
  const preservedDisabled = (existing?.interests ?? []).filter((s) => !enabledNestedSlugs.has(s));
  interests = Array.from(new Set([...sanitizedNew, ...preservedDisabled]));

  if (primaryId === "english_community") {
    country = null;
    scope = "worldwide";
    langs = Array.from(new Set([...langs, "en"]));
  } else if (primaryId === "global") {
    country = null;
    scope = "worldwide";
  } else if (country) {
    scope = "my_country";
  }

  return {
    discovery_country_code: country,
    preferred_languages: langs,
    interests,
    content_scope: scope,
    strict_country_isolation: strict,
    rejectedPrimary,
    fellBackToGlobal,
  };
}

export function shouldShowPersonalizationLabel(config: DiscoveryLocalizationConfig): boolean {
  return isPersonalizationActive(config) && isModuleRolloutEnabled(config, "feed");
}
