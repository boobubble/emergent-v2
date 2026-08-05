import type { DiscoveryContentScope, DiscoveryLocalizationConfig } from "@/lib/discovery/config";
import type { AudienceScope } from "@/lib/discovery/config";
import type { UserDiscoveryPrefs } from "@/lib/discovery/types";
import { parseStoredContentScope } from "@/lib/discovery/content-scope";
import {
  DEFAULT_NESTED_OPTIONS,
  DEFAULT_PRIMARY_OPTIONS,
  mergeDiscoveryExperienceConfig,
  nestedForPrimary,
  type DiscoveryNestedOption,
  type DiscoveryPrimaryOption,
} from "@/lib/discovery/discovery-options";
import { nestedOptionsForRollout, primaryOptionsForRollout } from "@/lib/discovery/rollout";

export type DiscoveryDraft = {
  primaryId: string | null;
  countryCode: string | null;
  contentScope: DiscoveryContentScope;
  preferredLanguages: string[];
  interests: string[];
  strictIsolation: boolean;
};

export function inferPrimaryIdFromPrefs(
  prefs: UserDiscoveryPrefs | null,
  primaryOptions: DiscoveryPrimaryOption[] = DEFAULT_PRIMARY_OPTIONS,
): string | null {
  if (!prefs) return null;
  const langs = prefs.preferred_languages.map((l) => l.toLowerCase());
  const scope = parseStoredContentScope(typeof prefs.content_scope === "string" ? prefs.content_scope : null);
  const cc = prefs.discovery_country_code?.toUpperCase() ?? null;

  if (!cc && scope.view === "worldwide" && langs.includes("en") && langs.length <= 2) {
    const enOpt = primaryOptions.find((p) => p.id === "english_community");
    if (enOpt?.enabled) return "english_community";
  }
  if (cc) {
    const match = primaryOptions.find((p) => p.countryCode === cc);
    if (match) return match.id;
  }
  if (scope.view === "worldwide" && !cc) return "global";
  if (scope.view === "my_country" && cc) {
    return primaryOptions.find((p) => p.countryCode === cc)?.id ?? null;
  }
  return cc ? primaryOptions.find((p) => p.countryCode === cc)?.id ?? "global" : "global";
}

export function prefsToDraft(prefs: UserDiscoveryPrefs | null): DiscoveryDraft {
  const parsed = parseStoredContentScope(typeof prefs?.content_scope === "string" ? prefs.content_scope : null);
  const primaryId = inferPrimaryIdFromPrefs(prefs);
  const primary = DEFAULT_PRIMARY_OPTIONS.find((p) => p.id === primaryId);
  return {
    primaryId,
    countryCode: prefs?.discovery_country_code?.toUpperCase() ?? primary?.countryCode ?? null,
    contentScope: parsed.view === "for_you" ? (primary?.contentScope ?? "for_you") : parsed.view,
    preferredLanguages: prefs?.preferred_languages?.length ? [...prefs.preferred_languages] : [...(primary?.preferredLanguages ?? ["en"])],
    interests: prefs?.interests?.length ? [...prefs.interests] : [],
    strictIsolation: parsed.strictIsolation,
  };
}

export function applyPrimaryToDraft(
  draft: DiscoveryDraft,
  primary: DiscoveryPrimaryOption,
): DiscoveryDraft {
  const next: DiscoveryDraft = {
    ...draft,
    primaryId: primary.id,
    countryCode: primary.countryCode,
    contentScope: primary.contentScope,
    preferredLanguages: primary.preferredLanguages.length ? [...primary.preferredLanguages] : draft.preferredLanguages,
    interests: [],
  };
  if (primary.kind === "language_community") {
    next.countryCode = null;
    next.contentScope = "worldwide";
    next.preferredLanguages = Array.from(new Set([...next.preferredLanguages, "en"]));
  }
  if (primary.kind === "global") {
    next.countryCode = null;
    next.contentScope = "worldwide";
  }
  return next;
}

export function toggleDraftInterest(draft: DiscoveryDraft, slug: string, nested: DiscoveryNestedOption[]): DiscoveryDraft {
  const item = nested.find((n) => n.slug === slug);
  const interests = draft.interests.includes(slug)
    ? draft.interests.filter((s) => s !== slug)
    : [...draft.interests, slug];
  let countryCode = draft.countryCode;
  if (item?.countryCode && !countryCode) countryCode = item.countryCode;
  return { ...draft, interests, countryCode };
}

export function draftToSavePayload(draft: DiscoveryDraft) {
  const primary = DEFAULT_PRIMARY_OPTIONS.find((p) => p.id === draft.primaryId);
  let countryCode = draft.countryCode;
  let contentScope = draft.contentScope;
  let langs = draft.preferredLanguages;

  if (primary?.kind === "language_community") {
    countryCode = null;
    contentScope = "worldwide";
    langs = Array.from(new Set([...langs, "en"]));
  } else if (primary?.kind === "global") {
    countryCode = null;
    contentScope = "worldwide";
  } else if (primary?.kind === "country") {
    countryCode = primary.countryCode;
    contentScope = "my_country";
  }

  return {
    discovery_country_code: countryCode,
    preferred_languages: langs,
    interests: draft.interests,
    content_scope: contentScope,
    strict_country_isolation: draft.strictIsolation,
    complete_onboarding: true,
  };
}

export function nestedOptionsForDraft(draft: DiscoveryDraft, nested = DEFAULT_NESTED_OPTIONS): DiscoveryNestedOption[] {
  if (!draft.primaryId) return [];
  return nestedForPrimary(draft.primaryId, nested);
}

export function mergeExperienceFromConfig(config: DiscoveryLocalizationConfig) {
  return {
    ...mergeDiscoveryExperienceConfig({
      fullScreenDiscoveryEnabled: config.fullScreenDiscoveryEnabled,
      firstLoginDiscoveryRequired: config.firstLoginDiscoveryRequired,
      primaryOptions: primaryOptionsForRollout(config),
      nestedOptions: nestedOptionsForRollout(config),
    }),
    allowSkipOnboarding: config.allowSkipOnboarding,
    showComingSoonForDisabled: config.showComingSoonForDisabled,
    rolloutMode: config.rolloutMode,
  };
}
