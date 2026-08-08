/**
 * Phase 4C priority-set helpers (pure): content differentiation + link anchors.
 * No fabricated stats / rankings / demographics.
 */

export const BRAND = "Yaarzo";

export const PHASE4C_PRIORITY = {
  pakistan_hub: "pakistan-chat-room",
  india_hub: "india-chat-room",
  pk_cities: [
    "lahore-chat-room",
    "karachi-chat-room",
    "islamabad-chat-room",
    "rawalpindi-chat-room",
    "faisalabad-chat-room",
    "multan-chat-room",
  ],
  in_cities: [
    "delhi-chat-room",
    "mumbai-chat-room",
    "bengaluru-chat-room",
    "hyderabad-india-chat-room",
    "chennai-chat-room",
    "kolkata-chat-room",
  ],
  categories: ["girls-chat-room", "dating-chat-room", "friendship-chat-room"],
} as const;

export const PHASE4C_ALL_PRIORITY = [
  PHASE4C_PRIORITY.pakistan_hub,
  PHASE4C_PRIORITY.india_hub,
  ...PHASE4C_PRIORITY.pk_cities,
  ...PHASE4C_PRIORITY.in_cities,
  ...PHASE4C_PRIORITY.categories,
] as const;

export function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function pickAnchor(variants: string[], salt: string): string {
  const i = Math.abs(hashCode(salt)) % variants.length;
  return variants[i]!;
}

export function cityAnchors(cityName: string): string[] {
  return [`${cityName} chat room`, `chat in ${cityName}`, `${cityName} rooms`];
}

export function countryAnchors(countryName: string): string[] {
  return [`${countryName} chat room`, `chat across ${countryName}`, `${countryName} chat hubs`];
}

export function categoryAnchors(label: string): string[] {
  return [label, `${label} rooms`, `browse ${label}`];
}

export function similarity(a: string, b: string): number {
  const na = (a || "").replace(/\s+/g, " ").trim().toLowerCase();
  const nb = (b || "").replace(/\s+/g, " ").trim().toLowerCase();
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = new Set(na.split(/[^a-z0-9]+/).filter(Boolean));
  const tb = new Set(nb.split(/[^a-z0-9]+/).filter(Boolean));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
}

export function normalizeCity(text: string, city: string | null | undefined): string {
  if (!city) return text || "";
  return (text || "").replace(new RegExp(city, "gi"), "{CITY}");
}

export type DiffPage = {
  page_type: string | null;
  slug: string;
  title?: string | null;
  h1?: string | null;
  city_name?: string | null;
  state_name?: string | null;
  country_name?: string | null;
  category_name?: string | null;
};

export type SiblingLink = { slug: string; name: string; anchor: string };
export type PriorityCityHint = { slug: string; title_hint: string };

export type BuiltContent = {
  intro: string;
  content: string;
  cta: { label: string; href: string; text: string };
  faq: Array<{ q: string; a: string }>;
  h1: string;
};

/** City-specific context notes — taxonomy/language only, no invented metrics. */
const CITY_NOTES: Record<string, string> = {
  lahore: "Lahore sits in Punjab and is often a first stop for Pakistan-focused chat discovery.",
  karachi: "Karachi is coastal Sindh’s largest hub — pair this page with the Pakistan country hub for broader browse.",
  islamabad: "Islamabad is the capital territory hub; Rawalpindi is a common nearby sibling for twin-city browsing.",
  rawalpindi: "Rawalpindi sits next to Islamabad — use sibling links when you want the twin-city angle.",
  faisalabad: "Faisalabad is a central Punjab industrial city page — keep the focus local, then widen via the country hub.",
  multan: "Multan anchors southern Punjab browsing in this priority set.",
  delhi: "Delhi is the NCR capital hub for India city chat on Yaarzo.",
  mumbai: "Mumbai is the Maharashtra coastal hub in this India priority set.",
  bengaluru: "Bengaluru (Bangalore) is the Karnataka tech-city hub in this set.",
  "hyderabad-india": "This page is the India Hyderabad room (country-qualified slug) — not the Pakistan Hyderabad page.",
  chennai: "Chennai anchors Tamil Nadu browsing in the India priority set.",
  kolkata: "Kolkata anchors eastern India browsing in this priority set.",
};

function cityNoteKey(slug: string, cityName: string): string {
  if (slug.startsWith("hyderabad-india")) return "hyderabad-india";
  return (cityName || "").toLowerCase();
}

export function buildDifferentiatedContent(
  page: DiffPage,
  ctx: {
    siblings?: SiblingLink[];
    hubSlug?: string;
    hubLabel?: string;
    priorityCities?: PriorityCityHint[];
  },
): BuiltContent {
  const city = page.city_name || "";
  const state = page.state_name || "";
  const country = page.country_name || "";
  const category = page.category_name || "";
  const siblings = ctx.siblings || [];
  const hubSlug = ctx.hubSlug || "";
  const hubLabel = ctx.hubLabel || "";

  if (page.page_type === "country") {
    const cities = ctx.priorityCities || [];
    const cityList = cities.map((c) => `<li><a href="/${c.slug}">${c.title_hint}</a></li>`).join("");
    const intro =
      country === "Pakistan"
        ? `<p>${country} chat on ${BRAND} starts at this country hub — then step into Punjab, Sindh, and capital-area city rooms when you want a tighter local focus.</p>`
        : country === "India"
          ? `<p>${country} chat on ${BRAND} starts here as a country hub — move into metro city rooms when you want Delhi, Mumbai, Bengaluru, or other local angles.</p>`
          : `<p>${country} chat on ${BRAND} is organized as a country hub: start here, then move into city rooms when you want a more local conversation.</p>`;
    const content =
      `<section data-block="hub"><h2>How this ${country} hub works</h2>` +
      `<p>This page introduces free online chat rooms connected to ${country}. It does not invent audience sizes or rankings — it simply points you to city rooms that already exist in the Pages CMS.</p></section>` +
      `<section data-block="cities"><h2>Priority city chat rooms in ${country}</h2>` +
      `<p>Explore these city hubs next:</p><ul>${cityList}</ul></section>` +
      `<section data-block="topics"><h2>Topic rooms</h2>` +
      `<p>When you care more about the conversation type than the city, browse Girls Chat, Dating Chat, or Friendship Chat from the related links.</p></section>` +
      `<section data-block="safety"><h2>Community guidance</h2>` +
      `<p>Be respectful, avoid sharing private contact details too quickly, and leave rooms that feel unsafe. ${BRAND} is for friendly online conversation across ${country}.</p></section>`;
    const cta = {
      label: `Join ${country} chat`,
      href: "/",
      text: `Start free chat connected to ${country} on ${BRAND}`,
    };
    const faq = [
      {
        q: `What is the ${country} chat room hub?`,
        a: `It is the country-level entry point for ${country} conversations on ${BRAND}. City pages narrow the room when you want a local focus.`,
      },
      {
        q: `Which ${country} cities are linked from here?`,
        a: `This hub links a priority set of city chat rooms. More cities can be added later without changing this page’s purpose.`,
      },
      {
        q: `Is ${country} chat free on ${BRAND}?`,
        a: `Yes. You can join free online chat rooms connected to ${country} without inventing signup barriers in this scaffold.`,
      },
    ];
    return { intro, content, cta, faq, h1: page.h1 || `${country} chat room` };
  }

  if (page.page_type === "category") {
    const topicFocus =
      page.slug === "girls-chat-room"
        ? "Girls Chat is for people who want that topic-first room rather than a city-only browse."
        : page.slug === "dating-chat-room"
          ? "Dating Chat is for people exploring dating conversations — keep expectations clear and respectful."
          : page.slug === "friendship-chat-room"
            ? "Friendship Chat is for making friends online without forcing a dating frame."
            : `This category page explains the topic space.`;
    const intro = `<p>${category} on ${BRAND} groups conversations by interest — useful when city hubs feel too broad and you want a clearer topic.</p>`;
    const content =
      `<section data-block="topic"><h2>About ${category}</h2>` +
      `<p>${topicFocus} It does not claim how many people are online. Use it as a bridge between country/city hubs and topic-focused rooms.</p></section>` +
      `<section data-block="related"><h2>Related places to chat</h2>` +
      `<p>Pair this topic with country hubs for Pakistan or India, or open a city room when you want a local angle.</p></section>` +
      `<section data-block="safety"><h2>Stay comfortable</h2>` +
      `<p>Keep conversations respectful. Leave any room that feels wrong. Topic rooms work best when everyone shares the same expectations.</p></section>`;
    const cta = {
      label: `Browse ${category}`,
      href: "/",
      text: `Join ${category} on ${BRAND}`,
    };
    const faq = [
      {
        q: `What is ${category} on ${BRAND}?`,
        a: `${category} rooms help people meet around a shared interest instead of only a location.`,
      },
      {
        q: `Can I combine ${category} with a city?`,
        a: `Yes later. For Phase 4C we keep category hubs separate from city×category combinations.`,
      },
      {
        q: `Is ${category} free?`,
        a: `Yes. This scaffold describes free online chat rooms for ${category} on ${BRAND}.`,
      },
    ];
    return { intro, content, cta, faq, h1: page.h1 || category };
  }

  // city pages
  const siblingHtml = siblings
    .slice(0, 4)
    .map((s) => `<li><a href="/${s.slug}">${s.anchor}</a></li>`)
    .join("");
  const region = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
  const openings = [
    `<p>${city} conversations on ${BRAND} sit inside ${region}. Use this page when you want chat rooms with a ${city} focus rather than a whole-country browse.</p>`,
    `<p>Looking for a ${city} angle? This ${BRAND} hub covers ${region} and links out to the ${country} country page plus nearby city rooms.</p>`,
    `<p>This ${city} chat room page is for people who care about ${city} first. Broader ${country} chat stays on the country hub; siblings below cover nearby cities.</p>`,
  ];
  const intro = openings[Math.abs(hashCode(city + country)) % openings.length]!;
  const langNote =
    country === "Pakistan"
      ? `Conversations connected to ${city} are commonly in English, Urdu, and other languages used across Pakistan.`
      : country === "India"
        ? `Conversations connected to ${city} are commonly in English, Hindi, and other languages used across India.`
        : `Conversations connected to ${city} are commonly in English and other languages used across ${country}.`;
  const note = CITY_NOTES[cityNoteKey(page.slug, city)] || "";

  const content =
    `<section data-block="location"><h2>About this ${city} hub</h2>` +
    `<p>${city} is listed under ${state || "its region"} in ${country} in the Yaarzo Pages taxonomy. ${langNote}${note ? ` ${note}` : ""}</p></section>` +
    `<section data-block="nearby"><h2>Related city chat rooms</h2>` +
    `<p>People exploring ${city} often also browse:</p><ul>${siblingHtml || `<li>${country} city rooms</li>`}</ul>` +
    `<p>For a wider circle, open the <a href="/${hubSlug}">${hubLabel}</a>.</p></section>` +
    `<section data-block="topics"><h2>Topic rooms</h2>` +
    `<p>If location matters less than the conversation type, try Girls Chat, Dating Chat, or Friendship Chat from the related links.</p></section>` +
    `<section data-block="safety"><h2>Community guidance</h2>` +
    `<p>Be kind, skip spam, and leave rooms that feel unsafe. This page is a ${city}-focused entry point — not a claim about local population or traffic.</p></section>`;

  const ctaVariants = [
    { label: `Join ${city} chat`, href: "/", text: `Start free chat connected to ${city}, ${country}` },
    { label: `Chat from ${city}`, href: "/", text: `Open ${city} conversations on ${BRAND}` },
    { label: `${city} rooms`, href: "/", text: `Meet people interested in ${city} chat` },
  ];
  const cta = ctaVariants[Math.abs(hashCode(city)) % ctaVariants.length]!;

  const faq = [
    {
      q: `How do I join ${city} chat rooms on ${BRAND}?`,
      a: `Open ${BRAND}, choose a room related to ${city} in ${state || country}, and start messaging.`,
    },
    {
      q: `How is ${city} different from the ${country} hub?`,
      a: `The ${country} hub covers the whole country. This page focuses on ${city}${state ? ` (${state})` : ""}.`,
    },
    {
      q: `What should I try after ${city}?`,
      a: siblings.length
        ? `Try related rooms such as ${siblings
            .slice(0, 3)
            .map((s) => s.name)
            .join(", ")}, or return to ${hubLabel}.`
        : `Return to ${hubLabel} or browse topic rooms like Girls Chat and Friendship Chat.`,
    },
  ];

  return {
    intro,
    content,
    cta,
    faq,
    h1: page.h1 || `${city} chat room`,
  };
}

export type PlannedLink = {
  from: string;
  to: string;
  anchor: string;
};

/** Conservative internal link plan for the Phase 4C priority set. */
export function planPriorityInternalLinks(meta: {
  cityNameBySlug: Record<string, string>;
  categoryNameBySlug: Record<string, string>;
}): PlannedLink[] {
  const links: PlannedLink[] = [];
  const { cityNameBySlug, categoryNameBySlug } = meta;

  for (const [hubSlug, citySlugs, countryName] of [
    [PHASE4C_PRIORITY.pakistan_hub, PHASE4C_PRIORITY.pk_cities, "Pakistan"] as const,
    [PHASE4C_PRIORITY.india_hub, PHASE4C_PRIORITY.in_cities, "India"] as const,
  ]) {
    for (const cs of citySlugs) {
      const name = cityNameBySlug[cs] || "city";
      links.push({
        from: hubSlug,
        to: cs,
        anchor: pickAnchor(cityAnchors(name), hubSlug + cs),
      });
    }
    for (const cat of PHASE4C_PRIORITY.categories) {
      const label = categoryNameBySlug[cat] || cat;
      links.push({
        from: hubSlug,
        to: cat,
        anchor: pickAnchor(categoryAnchors(label), hubSlug + cat),
      });
    }

    for (const cs of citySlugs) {
      links.push({
        from: cs,
        to: hubSlug,
        anchor: pickAnchor(countryAnchors(countryName), cs + hubSlug),
      });
      const siblings = citySlugs.filter((s) => s !== cs).slice(0, 3);
      for (const sib of siblings) {
        const name = cityNameBySlug[sib] || "city";
        links.push({
          from: cs,
          to: sib,
          anchor: pickAnchor(cityAnchors(name), cs + sib + "sib"),
        });
      }
      const catOffset = Math.abs(hashCode(cs)) % PHASE4C_PRIORITY.categories.length;
      const cats = [
        PHASE4C_PRIORITY.categories[catOffset]!,
        PHASE4C_PRIORITY.categories[(catOffset + 1) % PHASE4C_PRIORITY.categories.length]!,
      ];
      for (const cat of cats) {
        const label = categoryNameBySlug[cat] || cat;
        links.push({
          from: cs,
          to: cat,
          anchor: pickAnchor(categoryAnchors(label), cs + cat),
        });
      }
    }
  }

  for (const cat of PHASE4C_PRIORITY.categories) {
    for (const hubSlug of [PHASE4C_PRIORITY.pakistan_hub, PHASE4C_PRIORITY.india_hub]) {
      const country = hubSlug.startsWith("pakistan") ? "Pakistan" : "India";
      links.push({
        from: cat,
        to: hubSlug,
        anchor: pickAnchor(countryAnchors(country), cat + hubSlug),
      });
    }
    const sampleCities = [
      PHASE4C_PRIORITY.pk_cities[Math.abs(hashCode(cat)) % PHASE4C_PRIORITY.pk_cities.length]!,
      PHASE4C_PRIORITY.in_cities[Math.abs(hashCode(cat + "in")) % PHASE4C_PRIORITY.in_cities.length]!,
    ];
    for (const cs of sampleCities) {
      const name = cityNameBySlug[cs] || "city";
      links.push({
        from: cat,
        to: cs,
        anchor: pickAnchor(cityAnchors(name), cat + cs),
      });
    }
  }

  return links;
}
