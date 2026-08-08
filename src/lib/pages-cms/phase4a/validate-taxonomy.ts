import {
  allCities,
  allStates,
  CATEGORIES,
  INDIA_CITIES,
  INDIA_STATES,
  KEYWORD_GROUPS,
  PAKISTAN_CITIES,
  PAKISTAN_STATES,
  SEO_PRIORITY_BY_TIER,
  TEMPLATES,
  type CitySeed,
  type StateSeed,
} from "./taxonomy-data";

export type TaxonomyValidationIssue = {
  level: "error" | "warn";
  code: string;
  message: string;
};

function slugOk(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function validatePhase4aTaxonomy(): {
  ok: boolean;
  issues: TaxonomyValidationIssue[];
  counts: {
    indiaStates: number;
    indiaCities: number;
    pakistanStates: number;
    pakistanCities: number;
    categories: number;
    keywordGroups: number;
    templates: number;
  };
} {
  const issues: TaxonomyValidationIssue[] = [];
  const states = allStates();
  const cities = allCities();

  // State uniqueness per country
  const stateKeys = new Set<string>();
  for (const s of states) {
    if (!slugOk(s.slug)) issues.push({ level: "error", code: "bad_state_slug", message: s.slug });
    const key = `${s.country}:${s.slug}`;
    if (stateKeys.has(key)) issues.push({ level: "error", code: "dup_state", message: key });
    stateKeys.add(key);
  }

  // City uniqueness per country (slug)
  const cityKeys = new Set<string>();
  const nameKeys = new Set<string>();
  for (const c of cities) {
    if (!slugOk(c.slug)) issues.push({ level: "error", code: "bad_city_slug", message: `${c.country}:${c.slug}` });
    const key = `${c.country}:${c.slug}`;
    if (cityKeys.has(key)) issues.push({ level: "error", code: "dup_city_slug", message: key });
    cityKeys.add(key);

    const stateKey = `${c.country}:${c.state_slug}`;
    if (!stateKeys.has(stateKey)) {
      issues.push({ level: "error", code: "missing_state", message: `${c.name} → ${stateKey}` });
    }

    // Same canonical name under same country+state is a duplicate
    const nk = `${c.country}:${c.state_slug}:${c.name.toLowerCase()}`;
    if (nameKeys.has(nk)) issues.push({ level: "error", code: "dup_city_name", message: nk });
    nameKeys.add(nk);

    // Alternate names must not collide with another city's canonical slug/name in same country
    for (const alt of c.alt_names ?? []) {
      const altSlug = alt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (altSlug && cityKeys.has(`${c.country}:${altSlug}`) && altSlug !== c.slug) {
        issues.push({
          level: "error",
          code: "alt_collides_slug",
          message: `${c.slug} alt "${alt}" collides with city slug ${altSlug}`,
        });
      }
    }

    if (![1, 2, 3].includes(c.tier)) {
      issues.push({ level: "error", code: "bad_tier", message: `${c.slug} tier=${c.tier}` });
    }
  }

  // Categories
  const catSlugs = new Set<string>();
  for (const cat of CATEGORIES) {
    if (!slugOk(cat.slug)) issues.push({ level: "error", code: "bad_cat_slug", message: cat.slug });
    if (catSlugs.has(cat.slug)) issues.push({ level: "error", code: "dup_cat", message: cat.slug });
    catSlugs.add(cat.slug);
  }
  for (const cat of CATEGORIES) {
    if (cat.parent_slug && !catSlugs.has(cat.parent_slug)) {
      issues.push({ level: "error", code: "missing_parent", message: `${cat.slug} → ${cat.parent_slug}` });
    }
  }
  if (!catSlugs.has("chat-rooms")) {
    issues.push({ level: "error", code: "missing_root", message: "Chat Rooms root required" });
  }

  // Keyword groups / templates unique
  const kg = new Set<string>();
  for (const g of KEYWORD_GROUPS) {
    if (kg.has(g.slug)) issues.push({ level: "error", code: "dup_kg", message: g.slug });
    kg.add(g.slug);
    if (!g.primary_pattern.includes("{")) {
      issues.push({ level: "warn", code: "kg_no_var", message: g.slug });
    }
  }
  const tpl = new Set<string>();
  for (const t of TEMPLATES) {
    if (tpl.has(t.slug)) issues.push({ level: "error", code: "dup_tpl", message: t.slug });
    tpl.add(t.slug);
  }

  // Known spelling variants must be alt_names, not separate cities
  assertAltNotSeparateCity(cities, issues, "india", "bengaluru", ["bangalore"]);
  assertAltNotSeparateCity(cities, issues, "india", "mumbai", ["bombay"]);
  assertAltNotSeparateCity(cities, issues, "india", "kolkata", ["calcutta"]);
  assertAltNotSeparateCity(cities, issues, "india", "chennai", ["madras"]);
  assertAltNotSeparateCity(cities, issues, "india", "gurugram", ["gurgaon"]);

  // Hyderabad exists in both countries — OK if different country keys
  const hydPk = cities.find((c) => c.country === "pakistan" && c.slug === "hyderabad");
  const hydIn = cities.find((c) => c.country === "india" && c.slug === "hyderabad");
  if (!hydPk || !hydIn) {
    issues.push({ level: "warn", code: "hyderabad_pair", message: "Expected Hyderabad in both IN and PK" });
  } else if (hydPk.state_slug === hydIn.state_slug && hydPk.country === hydIn.country) {
    issues.push({ level: "error", code: "hyderabad_dup", message: "Hyderabad collision" });
  }

  const errors = issues.filter((i) => i.level === "error");
  return {
    ok: errors.length === 0,
    issues,
    counts: {
      indiaStates: INDIA_STATES.length,
      indiaCities: INDIA_CITIES.length,
      pakistanStates: PAKISTAN_STATES.length,
      pakistanCities: PAKISTAN_CITIES.length,
      categories: CATEGORIES.length,
      keywordGroups: KEYWORD_GROUPS.length,
      templates: TEMPLATES.length,
    },
  };
}

function assertAltNotSeparateCity(
  cities: CitySeed[],
  issues: TaxonomyValidationIssue[],
  country: CitySeed["country"],
  canonicalSlug: string,
  forbiddenSlugs: string[],
) {
  const canonical = cities.find((c) => c.country === country && c.slug === canonicalSlug);
  if (!canonical) {
    issues.push({ level: "error", code: "missing_canonical", message: `${country}:${canonicalSlug}` });
    return;
  }
  for (const bad of forbiddenSlugs) {
    if (cities.some((c) => c.country === country && c.slug === bad)) {
      issues.push({
        level: "error",
        code: "spelling_variant_city",
        message: `${country}:${bad} should be alt_names on ${canonicalSlug}, not a separate city`,
      });
    }
    const alts = (canonical.alt_names ?? []).map((a) => a.toLowerCase());
    if (!alts.some((a) => a.replace(/[^a-z0-9]+/g, "-") === bad || a.toLowerCase() === bad)) {
      // soft check: Bangalore vs bangalore in alt list as "Bangalore"
      const has = (canonical.alt_names ?? []).some((a) => a.toLowerCase().includes(bad.replace(/-/g, " ")) || a.toLowerCase() === bad);
      if (!has) {
        issues.push({
          level: "warn",
          code: "missing_alt",
          message: `${canonicalSlug} should list alt for ${bad}`,
        });
      }
    }
  }
}

export function seoPriorityFor(city: CitySeed): number {
  return SEO_PRIORITY_BY_TIER[city.tier];
}

export function statesByCountry(country: StateSeed["country"]): StateSeed[] {
  return allStates().filter((s) => s.country === country);
}
