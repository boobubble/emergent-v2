/**
 * Phase 4C / 4C.1 priority-set helpers (pure): content differentiation + link anchors.
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

/** Drafts improved in Phase 4C.1 (excludes already-published Lahore). */
export const PHASE4C1_DRAFT_SLUGS = PHASE4C_ALL_PRIORITY.filter((s) => s !== "lahore-chat-room");

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
  /** Optional SEO field suggestions for drafts (never invent stats). */
  meta_title?: string;
  meta_description?: string;
};

type CityProfile = {
  opening: string;
  regionBlurb: string;
  languages: string;
  topics: string[];
  faqExtra: { q: string; a: string };
  cta: { label: string; text: string };
};

const CITY_PROFILES: Record<string, CityProfile> = {
  karachi: {
    opening:
      "Karachi chat on Yaarzo is for people who want a Sindh coastal-city angle — late-night rooms, Urdu/English mix, and a broader circle than a whole-country hub.",
    regionBlurb:
      "Karachi is listed under Sindh in Pakistan. Use this page when you care about Karachi-first conversation rather than browsing every Pakistan city room.",
    languages: "English and Urdu are common here; Sindhi and other regional languages also appear depending on the room.",
    topics: ["evening hangouts", "campus and workday check-ins", "music and cricket talk", "travel between cities"],
    faqExtra: {
      q: "Should I start on Karachi or the Pakistan hub?",
      a: "Start here for a Karachi focus. Open the Pakistan chat room hub when you want a country-wide directory of city pages.",
    },
    cta: { label: "Join Karachi chat", text: "Open free Karachi-connected rooms on Yaarzo" },
  },
  islamabad: {
    opening:
      "Islamabad chat rooms on Yaarzo suit a capital-territory focus — quieter browse than megacity hubs, with Rawalpindi as the natural twin-city sibling.",
    regionBlurb:
      "Islamabad is in the Islamabad Capital Territory taxonomy. Pair it with Rawalpindi when you want the twin-city angle without leaving Pakistan pages.",
    languages: "English and Urdu dominate most rooms; other Pakistan languages show up in mixed groups.",
    topics: ["study and remote-work chats", "weekend plans", "news and current affairs", "moving between cities"],
    faqExtra: {
      q: "How is Islamabad different from Rawalpindi chat?",
      a: "They are sibling city hubs. Islamabad is the capital-territory page; Rawalpindi is the adjacent Punjab city page — switch via nearby links.",
    },
    cta: { label: "Chat from Islamabad", text: "Start Islamabad conversations on Yaarzo" },
  },
  rawalpindi: {
    opening:
      "Rawalpindi chat on Yaarzo sits next to Islamabad — use this page when you want the Pindi side of the twin-city conversation, not the capital-territory page.",
    regionBlurb:
      "Rawalpindi is listed under Punjab in Pakistan. Nearby navigation keeps Islamabad one click away without mixing India city pages.",
    languages: "Urdu and English are typical; Punjabi threads appear in some rooms.",
    topics: ["local hangouts", "travel to Islamabad", "sports talk", "friends reconnecting after moving"],
    faqExtra: {
      q: "Do Rawalpindi rooms replace Islamabad rooms?",
      a: "No. They are separate city hubs linked as siblings. Pick the city focus you want, or return to the Pakistan country hub.",
    },
    cta: { label: "Rawalpindi rooms", text: "Meet people interested in Rawalpindi chat" },
  },
  faisalabad: {
    opening:
      "Faisalabad chat rooms on Yaarzo cover a central Punjab industrial-city focus — practical for people who want that local circle instead of Lahore or Multan.",
    regionBlurb:
      "Faisalabad is under Punjab in Pakistan. Sibling links cover other Punjab and capital-area cities already in the priority set.",
    languages: "Punjabi, Urdu, and English all show up depending on the room.",
    topics: ["workday check-ins", "campus chat", "Punjab travel", "hobbies and weekend plans"],
    faqExtra: {
      q: "Is Faisalabad the same as the Lahore chat page?",
      a: "No. Lahore and Faisalabad are separate city hubs under Punjab. Use nearby links to move between them.",
    },
    cta: { label: "Join Faisalabad chat", text: "Start free chat connected to Faisalabad, Pakistan" },
  },
  multan: {
    opening:
      "Multan chat on Yaarzo is the southern Punjab entry in this priority set — useful when Lahore or Faisalabad feel like the wrong local focus.",
    regionBlurb:
      "Multan is listed under Punjab in Pakistan. Country-level browse stays on the Pakistan chat room hub.",
    languages: "Saraiki, Urdu, Punjabi, and English may all appear; rooms stay mixed by interest.",
    topics: ["family and friends abroad", "food and culture talk", "study groups", "quiet evening chats"],
    faqExtra: {
      q: "What belongs on Multan vs the Pakistan hub?",
      a: "Multan narrows to this city. The Pakistan hub lists multiple city rooms and category bridges.",
    },
    cta: { label: "Chat from Multan", text: "Open Multan conversations on Yaarzo" },
  },
  delhi: {
    opening:
      "Delhi chat rooms on Yaarzo are for an NCR capital-city focus — Hindi/English mix, metro-city pace, and a clearer local angle than the India country hub.",
    regionBlurb:
      "Delhi is listed under the India taxonomy as the Delhi city hub. Sibling metros (Mumbai, Bengaluru, and others) stay one click away.",
    languages: "Hindi and English are most common; other Indian languages appear in mixed rooms.",
    topics: ["metro life", "study and career chat", "weekend plans", "culture and food talk"],
    faqExtra: {
      q: "Should newcomers use Delhi or India chat first?",
      a: "Use Delhi when you want this city. Use the India chat room hub when you want the country directory of city pages.",
    },
    cta: { label: "Join Delhi chat", text: "Start free chat connected to Delhi, India" },
  },
  mumbai: {
    opening:
      "Mumbai chat on Yaarzo leans into a Maharashtra coastal-metro angle — entertainment, workday energy, and English/Hindi rooms with a local Mumbai frame.",
    regionBlurb:
      "Mumbai sits under Maharashtra in India. Keep Pakistan pages out of this nearby list; siblings are other India metros only.",
    languages: "English, Hindi, and Marathi commonly appear depending on the room.",
    topics: ["film and music", "startup and office chat", "monsoon weekend plans", "moving to other metros"],
    faqExtra: {
      q: "How is Mumbai different from Delhi chat?",
      a: "They are separate India city hubs with different regional context. Switch via related city links or return to the India hub.",
    },
    cta: { label: "Chat from Mumbai", text: "Open Mumbai conversations on Yaarzo" },
  },
  bengaluru: {
    opening:
      "Bengaluru (Bangalore) chat rooms on Yaarzo fit a Karnataka tech-city focus — English-heavy rooms, campus and office talk, and South India sibling links.",
    regionBlurb:
      "Bengaluru is listed under Karnataka in India. Hyderabad (India), Chennai, and other metros are natural siblings — not Pakistan cities.",
    languages: "English is very common; Kannada, Hindi, and other languages appear in mixed rooms.",
    topics: ["tech and learning", "weekend cafes and outdoors", "moving from other cities", "hobby clubs"],
    faqExtra: {
      q: "Is Bengaluru the same as Bangalore on Yaarzo?",
      a: "This page uses the Bengaluru city name from taxonomy. It is the Bangalore metro hub for India chat rooms.",
    },
    cta: { label: "Bengaluru rooms", text: "Meet people interested in Bengaluru chat" },
  },
  "hyderabad-india": {
    opening:
      "This is the India Hyderabad chat room (country-qualified slug) — not the Pakistan Hyderabad page. Use it for Telangana/India metro chat only.",
    regionBlurb:
      "This is the India Hyderabad hub in Telangana — not Hyderabad in Pakistan. The country-qualified URL keeps the two cities distinct.",
    languages: "English, Hindi, Telugu, and other languages appear depending on the room.",
    topics: ["food and festivals", "campus and IT chat", "travel across South India", "weekend plans"],
    faqExtra: {
      q: "Why does the slug say hyderabad-india?",
      a: "Because Hyderabad exists in more than one country. This page is the India city hub only.",
    },
    cta: { label: "Join Hyderabad chat", text: "Start free India Hyderabad rooms on Yaarzo" },
  },
  chennai: {
    opening:
      "Chennai chat on Yaarzo anchors a Tamil Nadu metro focus — useful when Bengaluru or Hyderabad are the wrong South India city for your conversation.",
    regionBlurb:
      "Chennai is listed under Tamil Nadu in India. Nearby links stay inside the India priority set.",
    languages: "Tamil and English are common; Hindi and other languages appear in mixed rooms.",
    topics: ["music and cinema", "study groups", "coastal weekend plans", "friends across metros"],
    faqExtra: {
      q: "Can I jump from Chennai to category rooms?",
      a: "Yes. Use related category links for Girls Chat, Dating Chat, or Friendship Chat when topic matters more than city.",
    },
    cta: { label: "Chat from Chennai", text: "Open Chennai conversations on Yaarzo" },
  },
  kolkata: {
    opening:
      "Kolkata chat rooms on Yaarzo cover an eastern India metro angle — culture-forward hangouts and a different regional frame from Delhi or Mumbai.",
    regionBlurb:
      "Kolkata is listed under West Bengal in India. Sibling metros remain India-only in this priority graph.",
    languages: "Bengali, English, and Hindi commonly appear depending on the room.",
    topics: ["books and culture", "campus chat", "festivals and food", "keeping in touch after moving"],
    faqExtra: {
      q: "Is Kolkata part of the India hub directory?",
      a: "Yes. The India chat room hub lists Kolkata among priority city pages.",
    },
    cta: { label: "Kolkata rooms", text: "Meet people interested in Kolkata chat" },
  },
};

function cityKey(slug: string, cityName: string): string {
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
    return buildCountryHub(page, country, ctx.priorityCities || []);
  }
  if (page.page_type === "category") {
    return buildCategoryPage(page, category);
  }
  return buildCityPage(page, { city, state, country, siblings, hubSlug, hubLabel });
}

function buildCountryHub(
  page: DiffPage,
  country: string,
  priorityCities: PriorityCityHint[],
): BuiltContent {
  const cityList = priorityCities.map((c) => `<li><a href="/${c.slug}">${c.title_hint}</a></li>`).join("");
  const isPk = country === "Pakistan";
  const isIn = country === "India";

  const intro = isPk
    ? `<p>Pakistan chat room is Yaarzo’s country hub for Pakistan: start with a country-wide overview, then move into city rooms across Punjab, Sindh, and the capital territory when you want a local focus.</p>`
    : isIn
      ? `<p>India chat room is Yaarzo’s country hub for India: begin here for the national directory, then open metro city rooms when you want Delhi, Mumbai, Bengaluru, or another local angle.</p>`
      : `<p>${country} chat on ${BRAND} is organized as a country hub: start here, then move into city rooms when you want a more local conversation.</p>`;

  const howItWorks = isPk
    ? `<p>City pages (Lahore, Karachi, Islamabad, and others) narrow the conversation. This hub does not invent audience sizes — it explains how Pakistan pages relate and points you to rooms that already exist.</p>`
    : isIn
      ? `<p>City pages (Delhi, Mumbai, Bengaluru, Hyderabad India, and others) narrow the conversation. This hub stays India-only for local siblings and links topic categories when interest matters more than city.</p>`
      : `<p>This page introduces free online chat rooms connected to ${country} and points to city rooms on Yaarzo.</p>`;

  const community = isPk
    ? `<p>Pakistan rooms commonly mix English and Urdu, with Punjabi and other languages depending on the city page. Be respectful, skip spam, and leave any room that feels unsafe.</p>`
    : isIn
      ? `<p>India rooms commonly mix English and Hindi, with regional languages on city pages (Tamil, Telugu, Bengali, Kannada, Marathi, and others). Keep conversations friendly and report harassment.</p>`
      : `<p>Be respectful and leave rooms that feel unsafe.</p>`;

  const content =
    `<section data-block="hub"><h2>How the ${country} hub works</h2>${howItWorks}` +
    `<p>Use city chat pages when location matters. Use Girls Chat, Dating Chat, or Friendship Chat when the topic matters more than the city.</p></section>` +
    `<section data-block="cities"><h2>Priority city chat rooms in ${country}</h2>` +
    `<p>Explore these city hubs next:</p><ul>${cityList}</ul></section>` +
    `<section data-block="topics"><h2>Chat categories from this hub</h2>` +
    `<p>Topic rooms stay shared across countries:</p>` +
    `<ul><li><a href="/girls-chat-room">Girls Chat Room</a></li>` +
    `<li><a href="/dating-chat-room">Dating Chat Room</a></li>` +
    `<li><a href="/friendship-chat-room">Friendship Chat Room</a></li></ul></section>` +
    `<section data-block="safety"><h2>Community guidance</h2>${community}</section>`;

  const faq = isPk
    ? [
        {
          q: "What is the Pakistan chat room hub?",
          a: "It is the country-level entry point for Pakistan conversations on Yaarzo. City pages (for example Karachi or Islamabad) narrow the focus.",
        },
        {
          q: "Which Pakistan cities are linked here?",
          a: "This hub links a priority set including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, and Multan. More cities can be added later.",
        },
        {
          q: "Do Pakistan city pages link to India cities as locals?",
          a: "No. Pakistan city nearby links stay inside Pakistan. India metros belong under the India hub.",
        },
        {
          q: "Is Pakistan chat free on Yaarzo?",
          a: "Yes. This hub describes free online chat rooms connected to Pakistan without inventing signup barriers in the page copy.",
        },
      ]
    : [
        {
          q: "What is the India chat room hub?",
          a: "It is the country-level entry point for India conversations on Yaarzo. City pages narrow the room when you want a metro focus.",
        },
        {
          q: "Which India cities are linked here?",
          a: "This hub links a priority set including Delhi, Mumbai, Bengaluru, Hyderabad (India), Chennai, and Kolkata.",
        },
        {
          q: "Why is Hyderabad labeled India in the slug?",
          a: "Hyderabad exists in more than one country. This page is the India city hub only.",
        },
        {
          q: "Is India chat free on Yaarzo?",
          a: "Yes. You can join free online chat rooms connected to India from this hub and its city pages.",
        },
      ];

  return {
    intro,
    content,
    cta: {
      label: `Join ${country} chat`,
      href: "/",
      text: `Start free chat connected to ${country} on ${BRAND}`,
    },
    faq,
    h1: page.h1 || `${country} chat room`,
    meta_title: `${country} chat room | Free Online Chat on ${BRAND}`.slice(0, 60),
    meta_description: `Join free ${country} chat rooms on ${BRAND}. Browse city hubs, meet people across ${country}, and chat online anytime.`,
  };
}

function buildCategoryPage(page: DiffPage, category: string): BuiltContent {
  const slug = page.slug;
  if (slug === "girls-chat-room") {
    const intro =
      `<p>Girls Chat Room on ${BRAND} is for topic-first conversation — not a city directory. Use it when you want girls chat rooms rather than browsing by Lahore, Delhi, or another location.</p>`;
    const content =
      `<section data-block="intent"><h2>What Girls Chat is for</h2>` +
      `<p>People open Girls Chat when the conversation type matters more than geography. Keep expectations clear, be respectful, and avoid pressure. This page does not invent who is online.</p></section>` +
      `<section data-block="examples"><h2>Conversation examples</h2>` +
      `<ul><li>Friendly hangouts and shared hobbies</li><li>Study or workday check-ins</li><li>Moving between city rooms when you also want a local angle</li></ul></section>` +
      `<section data-block="related"><h2>Related hubs</h2>` +
      `<p>Pair this topic with <a href="/pakistan-chat-room">Pakistan chat room</a> or <a href="/india-chat-room">India chat room</a>, or open a city room when location matters.</p></section>` +
      `<section data-block="safety"><h2>Stay comfortable</h2>` +
      `<p>Leave any room that feels wrong. Do not share private contact details too quickly. Report harassment.</p></section>`;
    return {
      intro,
      content,
      cta: { label: "Browse Girls Chat", href: "/", text: `Join Girls Chat rooms on ${BRAND}` },
      faq: [
        {
          q: "Is Girls Chat the same as a city chat room?",
          a: "No. City pages focus on place. Girls Chat focuses on topic. You can use both when you want a local and topical angle.",
        },
        {
          q: "Who is Girls Chat for?",
          a: "People looking for girls chat rooms and respectful topic-first conversation on Yaarzo.",
        },
        {
          q: "Can I switch to Dating or Friendship chat?",
          a: "Yes. Dating Chat and Friendship Chat are separate category hubs with different intent.",
        },
      ],
      h1: page.h1 || "Girls Chat Room",
      meta_title: "Girls Chat Room | Free Online Chat on Yaarzo",
      meta_description:
        "Join free Girls Chat rooms on Yaarzo. Topic-first conversation with clear boundaries — pair with city hubs when you want a local angle.",
    };
  }

  if (slug === "dating-chat-room") {
    const intro =
      `<p>Dating Chat Room on ${BRAND} is for people exploring dating conversations online — with clear consent, respectful tone, and no fabricated “match” claims.</p>`;
    const content =
      `<section data-block="intent"><h2>Dating chat intent</h2>` +
      `<p>Use Dating Chat when you want that topic explicitly. It is not a city template and not a promise of matches. Be honest about intentions and kind when you are not interested.</p></section>` +
      `<section data-block="examples"><h2>Healthy conversation starters</h2>` +
      `<ul><li>Shared interests and hobbies</li><li>Culture and weekend plans</li><li>Moving from friendship chat when both people agree</li></ul></section>` +
      `<section data-block="related"><h2>Related hubs</h2>` +
      `<p>If location matters, open a city room after browsing <a href="/pakistan-chat-room">Pakistan</a> or <a href="/india-chat-room">India</a> hubs. Friendship Chat stays available when dating is not the goal.</p></section>` +
      `<section data-block="safety"><h2>Safety first</h2>` +
      `<p>Never send money to strangers. Meet offline only if you choose to, in public, and tell someone you trust. Leave rooms that feel pushy.</p></section>`;
    return {
      intro,
      content,
      cta: { label: "Browse Dating Chat", href: "/", text: `Join Dating Chat on ${BRAND}` },
      faq: [
        {
          q: "Is Dating Chat a dating app with profiles?",
          a: "This page describes chat rooms for dating conversations on Yaarzo. It does not invent match counts or profile rankings.",
        },
        {
          q: "How is Dating Chat different from Friendship Chat?",
          a: "Dating Chat is for people open to dating talk. Friendship Chat is for making friends without that frame.",
        },
        {
          q: "Can I use Dating Chat with a city page?",
          a: "Yes later as combinations grow. For now, category and city hubs stay separate and linked.",
        },
      ],
      h1: page.h1 || "Dating Chat Room",
      meta_title: "Dating Chat Room | Free Online Chat on Yaarzo",
      meta_description:
        "Explore free Dating Chat rooms on Yaarzo. Clear intentions, respectful chat, and safety guidance — without fabricated match claims.",
    };
  }

  // friendship default
  const intro =
    `<p>Friendship Chat Room on ${BRAND} is for making friends online without forcing a dating frame — topic-first, location-optional.</p>`;
  const content =
    `<section data-block="intent"><h2>Friendship-first rooms</h2>` +
    `<p>Use Friendship Chat when you want low-pressure conversation, shared hobbies, or long-distance friends. It is not a city clone and not a popularity contest.</p></section>` +
    `<section data-block="examples"><h2>Good fits for this category</h2>` +
    `<ul><li>Language exchange and culture talk</li><li>Study buddies and hobby groups</li><li>Staying in touch after moving cities</li></ul></section>` +
    `<section data-block="related"><h2>Related hubs</h2>` +
    `<p>Browse <a href="/pakistan-chat-room">Pakistan chat room</a> or <a href="/india-chat-room">India chat room</a> for city directories, or open Girls Chat / Dating Chat when those intents fit better.</p></section>` +
    `<section data-block="safety"><h2>Community guidance</h2>` +
    `<p>Be patient with new people. Skip spam. Leave rooms that feel unsafe. Friendship works best when everyone shares the same expectations.</p></section>`;

  return {
    intro,
    content,
    cta: { label: "Browse Friendship Chat", href: "/", text: `Join Friendship Chat on ${BRAND}` },
    faq: [
      {
        q: "Is Friendship Chat only for one country?",
        a: "No. It is a category hub. Country and city pages handle location; this page handles friendship intent.",
      },
      {
        q: "What if someone turns the chat into dating talk?",
        a: "You can leave, clarify boundaries, or switch to Dating Chat if that is what both people want.",
      },
      {
        q: "Is Friendship Chat free?",
        a: "Yes. This scaffold describes free online friendship chat rooms on Yaarzo.",
      },
    ],
    h1: page.h1 || category || "Friendship Chat Room",
    meta_title: "Friendship Chat Room | Free Online Chat on Yaarzo",
    meta_description:
      "Join free Friendship Chat rooms on Yaarzo. Make friends online with clear expectations — pair with city hubs when you want a local angle.",
  };
}

function buildCityPage(
  page: DiffPage,
  ctx: {
    city: string;
    state: string;
    country: string;
    siblings: SiblingLink[];
    hubSlug: string;
    hubLabel: string;
  },
): BuiltContent {
  const { city, state, country, siblings, hubSlug, hubLabel } = ctx;
  const profile = CITY_PROFILES[cityKey(page.slug, city)];
  const siblingHtml = siblings
    .slice(0, 4)
    .map((s) => `<li><a href="/${s.slug}">${s.anchor}</a></li>`)
    .join("");
  const region = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

  const intro = profile
    ? `<p>${profile.opening}</p>`
    : `<p>${city} conversations on ${BRAND} sit inside ${region}. Use this page when you want a ${city} focus rather than a whole-country browse.</p>`;

  const topicList = (profile?.topics || ["friendly hangouts", "shared hobbies", "travel talk"])
    .map((t) => `<li>${t}</li>`)
    .join("");

  const content =
    `<section data-block="location"><h2>About this ${city} hub</h2>` +
    `<p>${profile?.regionBlurb || `${city} is in ${state || "its region"}, ${country}.`}</p>` +
    `<p>${profile?.languages || `Conversations connected to ${city} are commonly in English and other languages used across ${country}.`}</p></section>` +
    `<section data-block="topics"><h2>Conversation ideas for ${city}</h2>` +
    `<p>Examples of chat directions people use on this hub (not rankings or traffic claims):</p><ul>${topicList}</ul></section>` +
    `<section data-block="nearby"><h2>Related city chat rooms</h2>` +
    `<p>People exploring ${city} often also browse:</p><ul>${siblingHtml || `<li>${country} city rooms</li>`}</ul>` +
    `<p>For a wider circle, open the <a href="/${hubSlug}">${hubLabel}</a>.</p></section>` +
    `<section data-block="categories"><h2>Topic rooms</h2>` +
    `<p>If location matters less than the conversation type, try <a href="/girls-chat-room">Girls Chat</a>, <a href="/dating-chat-room">Dating Chat</a>, or <a href="/friendship-chat-room">Friendship Chat</a>.</p></section>` +
    `<section data-block="safety"><h2>Community guidance</h2>` +
    `<p>Be kind, skip spam, and leave rooms that feel unsafe. This page is a ${city}-focused entry point — not a claim about local population or traffic.</p></section>`;

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
  if (profile?.faqExtra) faq.push(profile.faqExtra);

  const cta = profile
    ? { label: profile.cta.label, href: "/", text: profile.cta.text }
    : {
        label: `Join ${city} chat`,
        href: "/",
        text: `Start free chat connected to ${city}, ${country}`,
      };

  return {
    intro,
    content,
    cta,
    faq,
    h1: page.h1 || `${city} chat room`,
    meta_title: `${city} chat room | Free Online Chat on ${BRAND}`.slice(0, 60),
    meta_description: `Join free ${city} chat rooms on ${BRAND}. Meet people interested in ${city}, ${country}, and chat online anytime.`,
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

/** Audit planned/actual links for cross-country sibling mistakes and duplicates. */
export function auditInternalLinks(
  links: Array<{ from: string; to: string; anchor: string }>,
): {
  ok: boolean;
  duplicate_pairs: string[];
  cross_country_sibling_issues: string[];
  broken_missing_endpoint: string[];
  anchor_variety_notes: string[];
} {
  const pk = new Set<string>([PHASE4C_PRIORITY.pakistan_hub, ...PHASE4C_PRIORITY.pk_cities]);
  const inn = new Set<string>([PHASE4C_PRIORITY.india_hub, ...PHASE4C_PRIORITY.in_cities]);
  const all = new Set<string>(PHASE4C_ALL_PRIORITY);
  const seen = new Set<string>();
  const duplicate_pairs: string[] = [];
  const cross_country_sibling_issues: string[] = [];
  const broken_missing_endpoint: string[] = [];

  for (const l of links) {
    const key = `${l.from}→${l.to}`;
    if (seen.has(key)) duplicate_pairs.push(key);
    seen.add(key);
    if (!all.has(l.from as (typeof PHASE4C_ALL_PRIORITY)[number]) || !all.has(l.to as (typeof PHASE4C_ALL_PRIORITY)[number])) {
      broken_missing_endpoint.push(key);
    }
    // City→city must stay same-country
    const fromCity = [...PHASE4C_PRIORITY.pk_cities, ...PHASE4C_PRIORITY.in_cities].includes(
      l.from as never,
    );
    const toCity = [...PHASE4C_PRIORITY.pk_cities, ...PHASE4C_PRIORITY.in_cities].includes(l.to as never);
    if (fromCity && toCity) {
      if (pk.has(l.from) && inn.has(l.to)) cross_country_sibling_issues.push(key);
      if (inn.has(l.from) && pk.has(l.to)) cross_country_sibling_issues.push(key);
    }
  }

  const anchorsByFrom = new Map<string, string[]>();
  for (const l of links) {
    const arr = anchorsByFrom.get(l.from) || [];
    arr.push(l.anchor);
    anchorsByFrom.set(l.from, arr);
  }
  const anchor_variety_notes: string[] = [];
  for (const [from, anchors] of anchorsByFrom) {
    const unique = new Set(anchors);
    if (unique.size === 1 && anchors.length > 3) {
      anchor_variety_notes.push(`${from}: all ${anchors.length} anchors identical`);
    }
  }

  return {
    ok:
      duplicate_pairs.length === 0 &&
      cross_country_sibling_issues.length === 0 &&
      broken_missing_endpoint.length === 0,
    duplicate_pairs,
    cross_country_sibling_issues,
    broken_missing_endpoint,
    anchor_variety_notes,
  };
}
