/**
 * Phase 4A taxonomy source-of-truth (India + Pakistan).
 * Used by validation tests and SQL seed generation.
 * Does NOT create custom_pages rows.
 */

export type SeoTier = 1 | 2 | 3;

export const SEO_PRIORITY_BY_TIER: Record<SeoTier, number> = {
  1: 90,
  2: 60,
  3: 30,
};

export type StateSeed = {
  country: "india" | "pakistan";
  name: string;
  slug: string;
  sort_order: number;
};

export type CitySeed = {
  country: "india" | "pakistan";
  state_slug: string;
  name: string;
  slug: string;
  tier: SeoTier;
  alt_names?: string[];
  population?: number | null;
};

export type CategorySeed = {
  name: string;
  slug: string;
  parent_slug: string | null;
  description: string;
  sort_order: number;
};

export type KeywordGroupSeed = {
  name: string;
  slug: string;
  primary_pattern: string;
  secondary_patterns: string[];
  title_pattern: string;
  meta_title_pattern: string;
  meta_description_pattern: string;
  h1_pattern: string;
  slug_pattern: string;
};

export type TemplateSeed = {
  name: string;
  slug: string;
  description: string;
  title_template: string;
  slug_template: string;
  h1_template: string;
  meta_title_template: string;
  meta_description_template: string;
  intro_template: string;
  content_template: string;
  cta_template: Record<string, string>;
  faq_template: Array<{ q: string; a: string }>;
  is_default?: boolean;
};

/** Flat URL strategy notes (generation rules — pages not created in 4A). */
export const URL_STRATEGY_EXAMPLES = [
  "/india-chat-room",
  "/pakistan-chat-room",
  "/lahore-chat-room",
  "/karachi-chat-room",
  "/delhi-chat-room",
  "/mumbai-chat-room",
  // Same city name in multiple countries → country-qualified slug (Phase 4B.1):
  "/hyderabad-india-chat-room",
  "/hyderabad-pakistan-chat-room",
  "/girls-chat-room",
  "/dating-chat-room",
  // later combinations (not generated in 4A):
  "/lahore-girls-chat-room",
  "/karachi-dating-chat-room",
] as const;

/**
 * City page slug policy (Phase 4B.1):
 * unique city name → `{city}-chat-room`
 * ambiguous across countries → `{city}-{country}-chat-room`
 */
export const CITY_SLUG_POLICY = {
  uniquePattern: "{city}-chat-room",
  ambiguousPattern: "{city}-{country}-chat-room",
  exampleUnique: ["lahore-chat-room", "mumbai-chat-room", "karachi-chat-room"],
  exampleAmbiguous: ["hyderabad-india-chat-room", "hyderabad-pakistan-chat-room"],
} as const;

/** Existing Lahore Chat Room mapping plan — do not apply in 4A. */
export const LAHORE_MAPPING_PLAN = {
  custom_page_id: "e26569bc-f359-47a6-9646-2da179ee183a",
  slug: "lahore-chat-room",
  proposed: {
    page_type: "city",
    country_slug: "pakistan",
    state_slug: "punjab",
    city_slug: "lahore",
    category_slug: "chat-rooms",
    primary_keyword: "lahore chat room",
  },
  note: "Map the EXISTING custom_pages row only after explicit approval. Do not insert a second Lahore Chat Room page.",
} as const;

export const PAKISTAN_STATES: StateSeed[] = [
  { country: "pakistan", name: "Punjab", slug: "punjab", sort_order: 1 },
  { country: "pakistan", name: "Sindh", slug: "sindh", sort_order: 2 },
  { country: "pakistan", name: "Khyber Pakhtunkhwa", slug: "khyber-pakhtunkhwa", sort_order: 3 },
  { country: "pakistan", name: "Balochistan", slug: "balochistan", sort_order: 4 },
  { country: "pakistan", name: "Islamabad Capital Territory", slug: "islamabad-capital-territory", sort_order: 5 },
  { country: "pakistan", name: "Azad Kashmir", slug: "azad-kashmir", sort_order: 6 },
  { country: "pakistan", name: "Gilgit-Baltistan", slug: "gilgit-baltistan", sort_order: 7 },
];

/** India states + union territories. Slugs unique within India (country_id, slug). */
export const INDIA_STATES: StateSeed[] = [
  { country: "india", name: "Andhra Pradesh", slug: "andhra-pradesh", sort_order: 1 },
  { country: "india", name: "Arunachal Pradesh", slug: "arunachal-pradesh", sort_order: 2 },
  { country: "india", name: "Assam", slug: "assam", sort_order: 3 },
  { country: "india", name: "Bihar", slug: "bihar", sort_order: 4 },
  { country: "india", name: "Chhattisgarh", slug: "chhattisgarh", sort_order: 5 },
  { country: "india", name: "Goa", slug: "goa", sort_order: 6 },
  { country: "india", name: "Gujarat", slug: "gujarat", sort_order: 7 },
  { country: "india", name: "Haryana", slug: "haryana", sort_order: 8 },
  { country: "india", name: "Himachal Pradesh", slug: "himachal-pradesh", sort_order: 9 },
  { country: "india", name: "Jharkhand", slug: "jharkhand", sort_order: 10 },
  { country: "india", name: "Karnataka", slug: "karnataka", sort_order: 11 },
  { country: "india", name: "Kerala", slug: "kerala", sort_order: 12 },
  { country: "india", name: "Madhya Pradesh", slug: "madhya-pradesh", sort_order: 13 },
  { country: "india", name: "Maharashtra", slug: "maharashtra", sort_order: 14 },
  { country: "india", name: "Manipur", slug: "manipur", sort_order: 15 },
  { country: "india", name: "Meghalaya", slug: "meghalaya", sort_order: 16 },
  { country: "india", name: "Mizoram", slug: "mizoram", sort_order: 17 },
  { country: "india", name: "Nagaland", slug: "nagaland", sort_order: 18 },
  { country: "india", name: "Odisha", slug: "odisha", sort_order: 19 },
  { country: "india", name: "Punjab", slug: "punjab", sort_order: 20 },
  { country: "india", name: "Rajasthan", slug: "rajasthan", sort_order: 21 },
  { country: "india", name: "Sikkim", slug: "sikkim", sort_order: 22 },
  { country: "india", name: "Tamil Nadu", slug: "tamil-nadu", sort_order: 23 },
  { country: "india", name: "Telangana", slug: "telangana", sort_order: 24 },
  { country: "india", name: "Tripura", slug: "tripura", sort_order: 25 },
  { country: "india", name: "Uttar Pradesh", slug: "uttar-pradesh", sort_order: 26 },
  { country: "india", name: "Uttarakhand", slug: "uttarakhand", sort_order: 27 },
  { country: "india", name: "West Bengal", slug: "west-bengal", sort_order: 28 },
  // Union territories
  { country: "india", name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands", sort_order: 29 },
  { country: "india", name: "Chandigarh", slug: "chandigarh", sort_order: 30 },
  { country: "india", name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-nagar-haveli-daman-diu", sort_order: 31 },
  { country: "india", name: "Delhi", slug: "delhi", sort_order: 32 },
  { country: "india", name: "Jammu and Kashmir", slug: "jammu-and-kashmir", sort_order: 33 },
  { country: "india", name: "Ladakh", slug: "ladakh", sort_order: 34 },
  { country: "india", name: "Lakshadweep", slug: "lakshadweep", sort_order: 35 },
  { country: "india", name: "Puducherry", slug: "puducherry", sort_order: 36 },
];

export const PAKISTAN_CITIES: CitySeed[] = [
  // Tier 1
  { country: "pakistan", state_slug: "punjab", name: "Lahore", slug: "lahore", tier: 1, alt_names: ["Lahaur"] },
  { country: "pakistan", state_slug: "sindh", name: "Karachi", slug: "karachi", tier: 1 },
  { country: "pakistan", state_slug: "islamabad-capital-territory", name: "Islamabad", slug: "islamabad", tier: 1 },
  // Tier 2
  { country: "pakistan", state_slug: "punjab", name: "Rawalpindi", slug: "rawalpindi", tier: 2, alt_names: ["Pindi"] },
  { country: "pakistan", state_slug: "punjab", name: "Faisalabad", slug: "faisalabad", tier: 2, alt_names: ["Lyallpur"] },
  { country: "pakistan", state_slug: "punjab", name: "Multan", slug: "multan", tier: 2 },
  { country: "pakistan", state_slug: "punjab", name: "Gujranwala", slug: "gujranwala", tier: 2 },
  { country: "pakistan", state_slug: "khyber-pakhtunkhwa", name: "Peshawar", slug: "peshawar", tier: 2 },
  { country: "pakistan", state_slug: "balochistan", name: "Quetta", slug: "quetta", tier: 2 },
  { country: "pakistan", state_slug: "punjab", name: "Sialkot", slug: "sialkot", tier: 2 },
  { country: "pakistan", state_slug: "sindh", name: "Hyderabad", slug: "hyderabad", tier: 2 },
  // Tier 3
  { country: "pakistan", state_slug: "punjab", name: "Bahawalpur", slug: "bahawalpur", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Sargodha", slug: "sargodha", tier: 3 },
  { country: "pakistan", state_slug: "sindh", name: "Sukkur", slug: "sukkur", tier: 3 },
  { country: "pakistan", state_slug: "khyber-pakhtunkhwa", name: "Abbottabad", slug: "abbottabad", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Sheikhupura", slug: "sheikhupura", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Jhang", slug: "jhang", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Gujrat", slug: "gujrat", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Sahiwal", slug: "sahiwal", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Okara", slug: "okara", tier: 3 },
  { country: "pakistan", state_slug: "sindh", name: "Larkana", slug: "larkana", tier: 3 },
  { country: "pakistan", state_slug: "sindh", name: "Nawabshah", slug: "nawabshah", tier: 3, alt_names: ["Shaheed Benazirabad"] },
  { country: "pakistan", state_slug: "khyber-pakhtunkhwa", name: "Mardan", slug: "mardan", tier: 3 },
  { country: "pakistan", state_slug: "khyber-pakhtunkhwa", name: "Swat", slug: "swat", tier: 3, alt_names: ["Mingora"] },
  { country: "pakistan", state_slug: "balochistan", name: "Gwadar", slug: "gwadar", tier: 3 },
  { country: "pakistan", state_slug: "balochistan", name: "Turbat", slug: "turbat", tier: 3 },
  { country: "pakistan", state_slug: "azad-kashmir", name: "Muzaffarabad", slug: "muzaffarabad", tier: 3 },
  { country: "pakistan", state_slug: "azad-kashmir", name: "Mirpur", slug: "mirpur", tier: 3 },
  { country: "pakistan", state_slug: "gilgit-baltistan", name: "Gilgit", slug: "gilgit", tier: 3 },
  { country: "pakistan", state_slug: "gilgit-baltistan", name: "Skardu", slug: "skardu", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Rahim Yar Khan", slug: "rahim-yar-khan", tier: 3 },
  { country: "pakistan", state_slug: "punjab", name: "Dera Ghazi Khan", slug: "dera-ghazi-khan", tier: 3, alt_names: ["DG Khan"] },
];

export const INDIA_CITIES: CitySeed[] = [
  // Tier 1 metros
  { country: "india", state_slug: "delhi", name: "Delhi", slug: "delhi", tier: 1, alt_names: ["New Delhi", "NCR"] },
  { country: "india", state_slug: "maharashtra", name: "Mumbai", slug: "mumbai", tier: 1, alt_names: ["Bombay"] },
  { country: "india", state_slug: "karnataka", name: "Bengaluru", slug: "bengaluru", tier: 1, alt_names: ["Bangalore"] },
  { country: "india", state_slug: "telangana", name: "Hyderabad", slug: "hyderabad", tier: 1 },
  { country: "india", state_slug: "tamil-nadu", name: "Chennai", slug: "chennai", tier: 1, alt_names: ["Madras"] },
  { country: "india", state_slug: "west-bengal", name: "Kolkata", slug: "kolkata", tier: 1, alt_names: ["Calcutta"] },
  { country: "india", state_slug: "maharashtra", name: "Pune", slug: "pune", tier: 1 },
  { country: "india", state_slug: "gujarat", name: "Ahmedabad", slug: "ahmedabad", tier: 1 },
  // Tier 2
  { country: "india", state_slug: "gujarat", name: "Surat", slug: "surat", tier: 2 },
  { country: "india", state_slug: "rajasthan", name: "Jaipur", slug: "jaipur", tier: 2 },
  { country: "india", state_slug: "uttar-pradesh", name: "Lucknow", slug: "lucknow", tier: 2 },
  { country: "india", state_slug: "uttar-pradesh", name: "Kanpur", slug: "kanpur", tier: 2 },
  { country: "india", state_slug: "maharashtra", name: "Nagpur", slug: "nagpur", tier: 2 },
  { country: "india", state_slug: "madhya-pradesh", name: "Indore", slug: "indore", tier: 2 },
  { country: "india", state_slug: "madhya-pradesh", name: "Bhopal", slug: "bhopal", tier: 2 },
  { country: "india", state_slug: "bihar", name: "Patna", slug: "patna", tier: 2 },
  { country: "india", state_slug: "chandigarh", name: "Chandigarh", slug: "chandigarh", tier: 2 },
  { country: "india", state_slug: "punjab", name: "Ludhiana", slug: "ludhiana", tier: 2 },
  { country: "india", state_slug: "punjab", name: "Amritsar", slug: "amritsar", tier: 2 },
  { country: "india", state_slug: "uttar-pradesh", name: "Agra", slug: "agra", tier: 2 },
  { country: "india", state_slug: "uttar-pradesh", name: "Varanasi", slug: "varanasi", tier: 2, alt_names: ["Banaras", "Kashi"] },
  { country: "india", state_slug: "kerala", name: "Kochi", slug: "kochi", tier: 2, alt_names: ["Cochin"] },
  { country: "india", state_slug: "kerala", name: "Thiruvananthapuram", slug: "thiruvananthapuram", tier: 2, alt_names: ["Trivandrum"] },
  { country: "india", state_slug: "odisha", name: "Bhubaneswar", slug: "bhubaneswar", tier: 2 },
  { country: "india", state_slug: "assam", name: "Guwahati", slug: "guwahati", tier: 2 },
  { country: "india", state_slug: "rajasthan", name: "Jodhpur", slug: "jodhpur", tier: 2 },
  { country: "india", state_slug: "rajasthan", name: "Udaipur", slug: "udaipur", tier: 2 },
  { country: "india", state_slug: "gujarat", name: "Vadodara", slug: "vadodara", tier: 2, alt_names: ["Baroda"] },
  { country: "india", state_slug: "gujarat", name: "Rajkot", slug: "rajkot", tier: 2 },
  { country: "india", state_slug: "maharashtra", name: "Nashik", slug: "nashik", tier: 2 },
  { country: "india", state_slug: "maharashtra", name: "Aurangabad", slug: "aurangabad", tier: 2, alt_names: ["Chhatrapati Sambhajinagar"] },
  { country: "india", state_slug: "tamil-nadu", name: "Coimbatore", slug: "coimbatore", tier: 2 },
  { country: "india", state_slug: "tamil-nadu", name: "Madurai", slug: "madurai", tier: 2 },
  { country: "india", state_slug: "andhra-pradesh", name: "Visakhapatnam", slug: "visakhapatnam", tier: 2, alt_names: ["Vizag"] },
  { country: "india", state_slug: "andhra-pradesh", name: "Vijayawada", slug: "vijayawada", tier: 2 },
  { country: "india", state_slug: "jharkhand", name: "Ranchi", slug: "ranchi", tier: 2 },
  { country: "india", state_slug: "chhattisgarh", name: "Raipur", slug: "raipur", tier: 2 },
  { country: "india", state_slug: "uttarakhand", name: "Dehradun", slug: "dehradun", tier: 2 },
  { country: "india", state_slug: "jammu-and-kashmir", name: "Srinagar", slug: "srinagar", tier: 2 },
  { country: "india", state_slug: "jammu-and-kashmir", name: "Jammu", slug: "jammu", tier: 2 },
  // Tier 3
  { country: "india", state_slug: "uttar-pradesh", name: "Ghaziabad", slug: "ghaziabad", tier: 3 },
  { country: "india", state_slug: "uttar-pradesh", name: "Noida", slug: "noida", tier: 3 },
  { country: "india", state_slug: "haryana", name: "Gurugram", slug: "gurugram", tier: 3, alt_names: ["Gurgaon"] },
  { country: "india", state_slug: "haryana", name: "Faridabad", slug: "faridabad", tier: 3 },
  { country: "india", state_slug: "west-bengal", name: "Howrah", slug: "howrah", tier: 3 },
  { country: "india", state_slug: "bihar", name: "Gaya", slug: "gaya", tier: 3 },
  { country: "india", state_slug: "bihar", name: "Muzaffarpur", slug: "muzaffarpur", tier: 3 },
  { country: "india", state_slug: "punjab", name: "Jalandhar", slug: "jalandhar", tier: 3 },
  { country: "india", state_slug: "punjab", name: "Patiala", slug: "patiala", tier: 3 },
  { country: "india", state_slug: "rajasthan", name: "Kota", slug: "kota", tier: 3 },
  { country: "india", state_slug: "rajasthan", name: "Ajmer", slug: "ajmer", tier: 3 },
  { country: "india", state_slug: "madhya-pradesh", name: "Gwalior", slug: "gwalior", tier: 3 },
  { country: "india", state_slug: "madhya-pradesh", name: "Jabalpur", slug: "jabalpur", tier: 3 },
  { country: "india", state_slug: "karnataka", name: "Mysuru", slug: "mysuru", tier: 3, alt_names: ["Mysore"] },
  { country: "india", state_slug: "karnataka", name: "Mangaluru", slug: "mangaluru", tier: 3, alt_names: ["Mangalore"] },
  { country: "india", state_slug: "kerala", name: "Kozhikode", slug: "kozhikode", tier: 3, alt_names: ["Calicut"] },
  { country: "india", state_slug: "goa", name: "Panaji", slug: "panaji", tier: 3, alt_names: ["Panjim"] },
  { country: "india", state_slug: "himachal-pradesh", name: "Shimla", slug: "shimla", tier: 3 },
  { country: "india", state_slug: "uttarakhand", name: "Haridwar", slug: "haridwar", tier: 3 },
  { country: "india", state_slug: "odisha", name: "Cuttack", slug: "cuttack", tier: 3 },
  { country: "india", state_slug: "assam", name: "Silchar", slug: "silchar", tier: 3 },
  { country: "india", state_slug: "meghalaya", name: "Shillong", slug: "shillong", tier: 3 },
  { country: "india", state_slug: "manipur", name: "Imphal", slug: "imphal", tier: 3 },
  { country: "india", state_slug: "nagaland", name: "Kohima", slug: "kohima", tier: 3 },
  { country: "india", state_slug: "tripura", name: "Agartala", slug: "agartala", tier: 3 },
  { country: "india", state_slug: "sikkim", name: "Gangtok", slug: "gangtok", tier: 3 },
  { country: "india", state_slug: "puducherry", name: "Puducherry", slug: "puducherry", tier: 3, alt_names: ["Pondicherry"] },
  { country: "india", state_slug: "ladakh", name: "Leh", slug: "leh", tier: 3 },
  { country: "india", state_slug: "andaman-and-nicobar-islands", name: "Port Blair", slug: "port-blair", tier: 3 },
];

export const CATEGORIES: CategorySeed[] = [
  { name: "Chat Rooms", slug: "chat-rooms", parent_slug: null, description: "Root chat room category for SEO pages", sort_order: 1 },
  { name: "Girls Chat", slug: "girls-chat", parent_slug: "chat-rooms", description: "Girls chat room pages", sort_order: 2 },
  { name: "Boys Chat", slug: "boys-chat", parent_slug: "chat-rooms", description: "Boys chat room pages", sort_order: 3 },
  { name: "Friendship Chat", slug: "friendship-chat", parent_slug: "chat-rooms", description: "Friendship and make-friends chat pages", sort_order: 4 },
  { name: "Dating Chat", slug: "dating-chat", parent_slug: "chat-rooms", description: "Dating chat room pages", sort_order: 5 },
  { name: "Random Chat", slug: "random-chat", parent_slug: "chat-rooms", description: "Random chat pages", sort_order: 6 },
  { name: "Free Chat", slug: "free-chat", parent_slug: "chat-rooms", description: "Free chat room pages", sort_order: 7 },
  { name: "Online Chat", slug: "online-chat", parent_slug: "chat-rooms", description: "Online chat pages", sort_order: 8 },
  { name: "Anonymous Chat", slug: "anonymous-chat", parent_slug: "chat-rooms", description: "Anonymous chat pages", sort_order: 9 },
  { name: "No Signup Chat", slug: "no-signup-chat", parent_slug: "chat-rooms", description: "No signup chat pages", sort_order: 10 },
  { name: "Stranger Chat", slug: "stranger-chat", parent_slug: "chat-rooms", description: "Stranger chat pages", sort_order: 11 },
  { name: "Live Chat", slug: "live-chat", parent_slug: "chat-rooms", description: "Live chat pages", sort_order: 12 },
  { name: "Desi Chat", slug: "desi-chat", parent_slug: "chat-rooms", description: "Desi chat pages", sort_order: 13 },
  { name: "Local Chat", slug: "local-chat", parent_slug: "chat-rooms", description: "Local chat pages", sort_order: 14 },
];

export const KEYWORD_GROUPS: KeywordGroupSeed[] = [
  {
    name: "City Chat Room",
    slug: "city-chat-room",
    primary_pattern: "{city} chat room",
    secondary_patterns: [
      "{city} chat rooms",
      "online chat in {city}",
      "{city} online chat",
      "free chat room in {city}",
    ],
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | Free Online Chat on {brand}",
    meta_description_pattern: "Join free {city} chat rooms on {brand}. Meet people, make friends, and chat online with locals in {city}, {country}.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{city}-chat-room",
  },
  {
    name: "Country Chat Room",
    slug: "country-chat-room",
    primary_pattern: "{country} chat room",
    secondary_patterns: [
      "{country} chat rooms",
      "online chat in {country}",
      "free {country} chat",
    ],
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | Free Online Chat on {brand}",
    meta_description_pattern: "Join free {country} chat rooms on {brand}. Meet people across {country} and chat online anytime.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{country}-chat-room",
  },
  {
    name: "City Girls Chat",
    slug: "city-girls-chat",
    primary_pattern: "{city} girls chat",
    secondary_patterns: [
      "girls chat room in {city}",
      "chat with girls in {city}",
    ],
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | {brand}",
    meta_description_pattern: "Join {city} girls chat rooms on {brand}. Chat online and meet people in {city}.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{city}-girls-chat-room",
  },
  {
    name: "City Friendship Chat",
    slug: "city-friendship-chat",
    primary_pattern: "{city} friendship chat",
    secondary_patterns: [
      "make friends in {city}",
      "{city} friends chat room",
    ],
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | {brand}",
    meta_description_pattern: "Make friends in {city} with free friendship chat rooms on {brand}.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{city}-friendship-chat-room",
  },
  {
    name: "City Dating Chat",
    slug: "city-dating-chat",
    primary_pattern: "{city} dating chat",
    secondary_patterns: [
      "dating chat room in {city}",
    ],
    title_pattern: "{primary_keyword} | {brand}",
    meta_title_pattern: "{primary_keyword} | {brand}",
    meta_description_pattern: "Join dating chat rooms in {city} on {brand}. Chat online safely and meet new people.",
    h1_pattern: "{primary_keyword}",
    slug_pattern: "{city}-dating-chat-room",
  },
];

export const TEMPLATES: TemplateSeed[] = [
  {
    name: "Country Chat Room",
    slug: "country-chat-room",
    description: "Scaffold for country-level chat room SEO pages. Flat URL e.g. /pakistan-chat-room",
    title_template: "{primary_keyword} | {brand}",
    slug_template: "{country}-chat-room",
    h1_template: "{primary_keyword}",
    meta_title_template: "{primary_keyword} | Free Online Chat on {brand}",
    meta_description_template: "Join free {country} chat rooms on {brand}. Meet people across {country} and chat online anytime in {year}.",
    intro_template: "<p>Welcome to {primary_keyword} on {brand} — a place to meet people across {country}.</p>",
    content_template:
      "<section data-block=\"intro\"><p>Chat online with people from {country} on {brand}. This country hub is the starting point for city rooms and topic rooms.</p></section>" +
      "<section data-block=\"location\"><p>Browse conversations connected to {country}. City pages help you narrow the room when you want a more local circle.</p></section>" +
      "<section data-block=\"how_it_works\"><p>Pick a room, say hello, and keep chatting. Editors can override this scaffold per country without changing the shared template.</p></section>",
    cta_template: {
      label: "Start chatting in {country}",
      href: "/",
      text: "Join free {country} chat rooms on {brand}",
    },
    faq_template: [
      {
        q: "Is {country} chat free on {brand}?",
        a: "Yes. You can join {country} chat rooms on {brand} and start talking online without a complicated signup flow.",
      },
      {
        q: "Can I chat with people from different cities in {country}?",
        a: "Yes. This {country} hub connects you across the country, and city pages help you find more local rooms when you want them.",
      },
      {
        q: "How is this different from a city chat room?",
        a: "Country pages cover {country} broadly. City pages focus on one place (for example a specific city chat room under {country}).",
      },
    ],
  },
  {
    name: "City Chat Room",
    slug: "city-chat-room",
    description:
      "City chat room SEO scaffold. Unique cities use /{city}-chat-room; same name across countries uses /{city}-{country}-chat-room.",
    title_template: "{primary_keyword} | {brand}",
    slug_template: "{city}-chat-room",
    h1_template: "{primary_keyword}",
    meta_title_template: "{primary_keyword} | Free Online Chat on {brand}",
    meta_description_template:
      "Join free {city} chat rooms on {brand}. Meet people connected to {city} in {state}, {country} and chat online in {year}.",
    intro_template:
      "<p>Welcome to {primary_keyword} on {brand}. Meet people connected to {city} ({region_label}) and start chatting online.</p>",
    content_template:
      "<section data-block=\"location\"><h2>About this {city} hub</h2><p>{location_context}</p><p>{language_note}</p></section>" +
      "<section data-block=\"nearby\"><h2>Related city chat rooms</h2><p>People exploring {city} often also browse nearby or related rooms in {country}:</p>{nearby_cities_html}</section>" +
      "<section data-block=\"country_context\"><h2>{country_hub_label}</h2><p>{country_context}</p></section>" +
      "<section data-block=\"how_it_works\"><h2>How {brand} chat works here</h2><p>Open a room tied to {region_label}, introduce yourself, and talk with people interested in {city}. Editors can override intro, FAQ, CTA, and body sections per city without changing this shared template.</p></section>",
    cta_template: {
      label: "Join {city} chat",
      href: "/",
      text: "Start free chat connected to {city}, {country}",
    },
    faq_template: [
      {
        q: "How do I join {city} chat rooms on {brand}?",
        a: "Open {brand}, choose a room related to {city} in {state}, {country}, and start messaging.",
      },
      {
        q: "Is {primary_keyword} free?",
        a: "Yes. {brand} offers free online chat rooms for people connected to {city}.",
      },
      {
        q: "What other rooms pair well with {city}?",
        a: "Try related rooms such as {nearby_cities}, or open the {country_hub_label} hub for a wider {country} audience.",
      },
    ],
    is_default: true,
  },
  {
    name: "Category Chat Room",
    slug: "category-chat-room",
    description: "Scaffold for category hubs e.g. /girls-chat-room, /dating-chat-room",
    title_template: "{primary_keyword} | {brand}",
    slug_template: "{category}-room",
    h1_template: "{primary_keyword}",
    meta_title_template: "{primary_keyword} | {brand}",
    meta_description_template: "Explore {category} on {brand}. Chat online, meet people, and join free rooms in {year}.",
    intro_template: "<p>Discover {category} on {brand} — free online chat rooms for people who want to connect.</p>",
    content_template: "<p>This category hub introduces {category} across {brand}. City and country pages can link here later without auto-generating every combination yet.</p>",
    cta_template: { label: "Browse chat rooms", href: "/", text: "Join {category} on {brand}" },
    faq_template: [
      { q: "What is {category} on {brand}?", a: "{category} rooms help people meet and chat online around a shared interest." },
    ],
  },
  {
    name: "City + Category Chat",
    slug: "city-category-chat",
    description: "Scaffold for later combinations e.g. /lahore-girls-chat-room (not generated in Phase 4A)",
    title_template: "{city} {category} | {brand}",
    slug_template: "{city}-{category}-room",
    h1_template: "{city} {category}",
    meta_title_template: "{city} {category} | {brand}",
    meta_description_template: "Join {city} {category} on {brand}. Chat online with people in {city}, {country}.",
    intro_template: "<p>Welcome to {city} {category} on {brand}.</p>",
    content_template: "<p>Use this scaffold for city + category pages. Generate combinations only after a controlled Phase 4B test batch.</p>",
    cta_template: { label: "Start chatting", href: "/", text: "Join {city} {category}" },
    faq_template: [
      { q: "Can I find {category} in {city}?", a: "Yes. {brand} supports local {category} conversations for {city}." },
    ],
  },
];

export function allStates(): StateSeed[] {
  return [...PAKISTAN_STATES, ...INDIA_STATES];
}

export function allCities(): CitySeed[] {
  return [...PAKISTAN_CITIES, ...INDIA_CITIES];
}
