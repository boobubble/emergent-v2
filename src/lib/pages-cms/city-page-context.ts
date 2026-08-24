/**
 * Differentiated, taxonomy-backed content blocks for city SEO pages.
 * Uses only available taxonomy fields — no fabricated local stats/events.
 */

export type NearbyCityRef = {
  name: string;
  slug: string;
  stateSlug?: string | null;
  countrySlug: string;
};

export type CityPageContextInput = {
  cityName: string;
  citySlug: string;
  stateName?: string | null;
  stateSlug?: string | null;
  countryName: string;
  countrySlug: string;
  brand?: string;
  language?: string | null;
  /** All active cities (same batch / taxonomy) for nearby/related selection */
  catalog: NearbyCityRef[];
  /** Optional per-page override snippets (HTML or plain) */
  overrides?: {
    intro?: string | null;
    location?: string | null;
    nearby?: string | null;
    country_context?: string | null;
    how_it_works?: string | null;
  } | null;
};

const COUNTRY_CONTEXT: Record<string, string> = {
  pakistan:
    "{brand} hosts free online chat rooms for people across Pakistan. Use this {city} hub to start conversations, then explore other Pakistan city rooms when you want a wider circle.",
  india:
    "{brand} hosts free online chat rooms for people across India. Use this {city} hub to start conversations, then explore other India city rooms when you want a wider circle.",
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{([a-z_]+)\}/gi, (_, key: string) => vars[key.toLowerCase()] ?? "");
}

/** Same-state cities first, then other same-country cities; exclude self; stable sort. */
export function selectRelatedCities(
  input: CityPageContextInput,
  limit = 6,
): NearbyCityRef[] {
  const self = input.citySlug.toLowerCase();
  const country = input.countrySlug.toLowerCase();
  const state = (input.stateSlug ?? "").toLowerCase();

  const sameCountry = input.catalog.filter(
    (c) =>
      c.countrySlug.toLowerCase() === country &&
      c.slug.toLowerCase() !== self,
  );

  const sameState = sameCountry
    .filter((c) => state && (c.stateSlug ?? "").toLowerCase() === state)
    .sort((a, b) => a.name.localeCompare(b.name));

  const other = sameCountry
    .filter((c) => !state || (c.stateSlug ?? "").toLowerCase() !== state)
    .sort((a, b) => a.name.localeCompare(b.name));

  const seen = new Set<string>();
  const out: NearbyCityRef[] = [];
  for (const c of [...sameState, ...other]) {
    const key = c.slug.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

export function buildLanguageNote(language: string | null | undefined, countryName: string): string {
  const lang = (language ?? "").trim();
  if (lang && lang.toLowerCase() !== "en" && lang.toLowerCase() !== "english") {
    return `Page language setting: ${lang}. Visitors commonly chat in ${lang} and other languages used across ${countryName}.`;
  }
  return `Conversations here are commonly in English and other languages used across ${countryName}.`;
}

/**
 * Build string template vars used by city content/CTA/FAQ scaffolds.
 * Keys are safe for `{token}` substitution.
 */
export function buildCityPageContextVars(input: CityPageContextInput): Record<string, string> {
  const brand = input.brand ?? "Yaarzo";
  const related = selectRelatedCities(input, 6);
  const nearbyNames = related.map((c) => c.name);
  const nearbyList = nearbyNames.length
    ? nearbyNames.join(", ")
    : `other cities across ${input.countryName}`;
  const nearbyHtml = nearbyNames.length
    ? `<ul>${nearbyNames.map((n) => `<li>${n} chat room</li>`).join("")}</ul>`
    : `<p>More ${input.countryName} city chat rooms can be linked here on Yaarzo.</p>`;

  const vars: Record<string, string> = {
    brand,
    city: input.cityName,
    state: input.stateName ?? "",
    country: input.countryName,
    city_slug: input.citySlug,
    state_slug: input.stateSlug ?? "",
    country_slug: input.countrySlug,
    language: (input.language ?? "en").trim() || "en",
    language_note: buildLanguageNote(input.language, input.countryName),
    nearby_cities: nearbyList,
    nearby_cities_html: nearbyHtml,
    country_hub_label: `${input.countryName} chat room`,
    region_label: input.stateName
      ? `${input.cityName}, ${input.stateName}, ${input.countryName}`
      : `${input.cityName}, ${input.countryName}`,
  };

  const countryTpl =
    COUNTRY_CONTEXT[input.countrySlug.toLowerCase()] ??
    "{brand} hosts free online chat rooms for people across {country}. Use this {city} hub to start conversations with people connected to {city}.";
  vars.country_context = fill(countryTpl, vars);

  vars.location_context = input.stateName
    ? `${input.cityName} is in ${input.stateName}, ${input.countryName}.`
    : `${input.cityName} is in ${input.countryName}.`;

  // Optional page-level overrides (editors / future generation flags)
  const o = input.overrides;
  if (o?.location) vars.location_context = o.location;
  if (o?.nearby) vars.nearby_cities_html = o.nearby;
  if (o?.country_context) vars.country_context = o.country_context;

  return vars;
}

/** Section markers for similarity reporting */
export const CITY_CONTENT_BLOCKS = [
  "intro",
  "location",
  "nearby",
  "country_context",
  "how_it_works",
] as const;

export type CityContentBlock = (typeof CITY_CONTENT_BLOCKS)[number];

export function extractContentBlocks(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const block of CITY_CONTENT_BLOCKS) {
    const re = new RegExp(
      `<section[^>]*data-block=["']${block}["'][^>]*>([\\s\\S]*?)</section>`,
      "i",
    );
    const m = html.match(re);
    out[block] = m?.[1]?.trim() ?? "";
  }
  return out;
}
