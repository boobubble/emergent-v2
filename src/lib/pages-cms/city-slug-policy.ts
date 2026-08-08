import { slugifyPageSlug } from "@/lib/page-slug";

/**
 * Deterministic city page URL rule (Phase 4B.1):
 * - Unique city name across target countries → `{city}-chat-room`
 * - Same canonical city name in 2+ target countries → `{city}-{country}-chat-room`
 *
 * Never assign the bare `{city}-chat-room` to only one of the colliding countries.
 */

export type CityCountryRef = {
  /** Display / canonical name (e.g. "Hyderabad") */
  name: string;
  /** Taxonomy city slug (e.g. "hyderabad") */
  slug: string;
  /** Country slug (e.g. "india" | "pakistan") */
  countrySlug: string;
};

export type AmbiguousCityIndex = {
  /** Lowercased city names that appear in 2+ countries */
  names: Set<string>;
  /** Lowercased city slugs that appear in 2+ countries */
  slugs: Set<string>;
};

export function buildAmbiguousCityIndex(cities: CityCountryRef[]): AmbiguousCityIndex {
  const nameCountries = new Map<string, Set<string>>();
  const slugCountries = new Map<string, Set<string>>();

  for (const c of cities) {
    const nameKey = c.name.trim().toLowerCase();
    const slugKey = c.slug.trim().toLowerCase();
    const country = c.countrySlug.trim().toLowerCase();
    if (!nameKey || !slugKey || !country) continue;

    if (!nameCountries.has(nameKey)) nameCountries.set(nameKey, new Set());
    nameCountries.get(nameKey)!.add(country);

    if (!slugCountries.has(slugKey)) slugCountries.set(slugKey, new Set());
    slugCountries.get(slugKey)!.add(country);
  }

  const names = new Set<string>();
  for (const [name, countries] of nameCountries) {
    if (countries.size > 1) names.add(name);
  }
  const slugs = new Set<string>();
  for (const [slug, countries] of slugCountries) {
    if (countries.size > 1) slugs.add(slug);
  }
  return { names, slugs };
}

export function isAmbiguousCity(
  city: { name?: string | null; slug?: string | null },
  index: AmbiguousCityIndex,
): boolean {
  const nameKey = (city.name ?? "").trim().toLowerCase();
  const slugKey = (city.slug ?? "").trim().toLowerCase();
  if (nameKey && index.names.has(nameKey)) return true;
  if (slugKey && index.slugs.has(slugKey)) return true;
  return false;
}

/**
 * Apply country disambiguation to a rendered city-scoped slug.
 * `{city}-chat-room` → `{city}-{country}-chat-room`
 * `{city}-girls-chat-room` → `{city}-{country}-girls-chat-room`
 */
export function disambiguateCitySlugWithCountry(
  baseSlug: string,
  citySlug: string,
  countrySlug: string,
): string {
  const city = slugifyPageSlug(citySlug);
  const country = slugifyPageSlug(countrySlug);
  const base = slugifyPageSlug(baseSlug);
  if (!city || !country) return base;

  if (base.startsWith(`${city}-${country}-`)) return base;

  if (base.startsWith(`${city}-`)) {
    const rest = base.slice(city.length + 1);
    return slugifyPageSlug(`${city}-${country}-${rest}`);
  }
  return slugifyPageSlug(`${city}-${country}-chat-room`);
}

export function resolveCityPageSlug(opts: {
  cityName: string;
  citySlug: string;
  countrySlug: string;
  /** Slug after rendering the keyword-group pattern (unique-name form) */
  renderedSlug: string;
  ambiguity: AmbiguousCityIndex;
}): { slug: string; disambiguated: boolean } {
  const ambiguous = isAmbiguousCity(
    { name: opts.cityName, slug: opts.citySlug },
    opts.ambiguity,
  );
  if (!ambiguous) {
    return { slug: slugifyPageSlug(opts.renderedSlug), disambiguated: false };
  }
  return {
    slug: disambiguateCitySlugWithCountry(
      opts.renderedSlug,
      opts.citySlug,
      opts.countrySlug,
    ),
    disambiguated: true,
  };
}
