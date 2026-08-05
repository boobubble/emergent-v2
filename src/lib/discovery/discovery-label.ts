import type { UserDiscoveryPrefs } from "@/lib/discovery/types";
import {
  DEFAULT_NESTED_OPTIONS,
  DEFAULT_PRIMARY_OPTIONS,
  type DiscoveryNestedOption,
  type DiscoveryPrimaryOption,
} from "@/lib/discovery/discovery-options";
import { inferPrimaryIdFromPrefs } from "@/lib/discovery/discovery-draft";

export function buildPersonalizationLabel(
  prefs: UserDiscoveryPrefs | null,
  opts?: {
    primaryOptions?: DiscoveryPrimaryOption[];
    nestedOptions?: DiscoveryNestedOption[];
  },
): string | null {
  if (!prefs) return null;
  const primaryOptions = opts?.primaryOptions ?? DEFAULT_PRIMARY_OPTIONS;
  const nestedOptions = opts?.nestedOptions ?? DEFAULT_NESTED_OPTIONS;
  const primaryId = inferPrimaryIdFromPrefs(prefs, primaryOptions);
  const primary = primaryOptions.find((p) => p.id === primaryId);

  const parts: string[] = [];
  if (primary) {
    if (primary.kind === "language_community") parts.push("English Community");
    else if (primary.kind === "global") parts.push("Global");
    else parts.push(primary.label);
  } else if (prefs.discovery_country_code) {
    parts.push(prefs.discovery_country_code);
  }

  const nestedBySlug = new Map(nestedOptions.map((n) => [n.slug, n]));
  for (const slug of prefs.interests.slice(0, 4)) {
    const n = nestedBySlug.get(slug);
    parts.push(n?.label ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  }

  if (parts.length === 0) return null;
  return `Personalized for ${parts.join(" • ")}`;
}

export function buildDraftLabel(
  primaryId: string | null,
  interests: string[],
  primaryOptions: DiscoveryPrimaryOption[] = DEFAULT_PRIMARY_OPTIONS,
  nestedOptions: DiscoveryNestedOption[] = DEFAULT_NESTED_OPTIONS,
): string {
  const primary = primaryOptions.find((p) => p.id === primaryId);
  const parts: string[] = [];
  if (primary) parts.push(primary.label);
  const nestedBySlug = new Map(nestedOptions.map((n) => [n.slug, n]));
  for (const slug of interests.slice(0, 4)) {
    const n = nestedBySlug.get(slug);
    parts.push(n?.label ?? slug);
  }
  return parts.length ? parts.join(" • ") : "Choose your interests";
}
