import { detectCountryCode } from "@/lib/country-flag";
import type { UserDiscoveryPrefs } from "@/lib/discovery/types";

export type CountryResolutionInput = {
  discoveryCountryCode?: string | null;
  profileCountryCode?: string | null;
  signupCountryCode?: string | null;
  detectedCountryCode?: string | null;
  adminDefaultCountry?: string;
};

/** Country priority for recommendations — not permanent identity. */
export function resolveDiscoveryCountry(input: CountryResolutionInput): string {
  const candidates = [
    input.discoveryCountryCode,
    input.profileCountryCode,
    input.signupCountryCode,
    input.detectedCountryCode,
    input.adminDefaultCountry,
    detectCountryCode(),
  ];
  for (const c of candidates) {
    const code = c?.trim().toUpperCase();
    if (code && /^[A-Z]{2}$/.test(code)) return code;
  }
  return "US";
}

export function hasConfiguredDiscovery(prefs: UserDiscoveryPrefs | null): boolean {
  if (!prefs) return false;
  return Boolean(prefs.discovery_country_code) || prefs.preferred_languages.length > 0 || prefs.interests.length > 0;
}

export function prefsNeedOnboarding(
  prefs: UserDiscoveryPrefs | null,
  opts: { requireAgain?: boolean },
): boolean {
  if (opts.requireAgain) return true;
  if (!prefs) return true;
  if (!prefs.discovery_onboarding_completed_at) return true;
  const hasCountry = Boolean(prefs.discovery_country_code);
  const hasLang = prefs.preferred_languages.length > 0;
  const hasInterests = prefs.interests.length > 0;
  return !(hasCountry || hasLang || hasInterests);
}

export function shouldShowPersonalizePrompt(
  prefs: UserDiscoveryPrefs | null,
  opts: { requireAgain?: boolean },
): boolean {
  if (opts.requireAgain) return false;
  if (prefs?.personalize_prompt_dismissed_at) return false;
  return !hasConfiguredDiscovery(prefs);
}
