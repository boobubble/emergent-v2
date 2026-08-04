import { describe, it, expect } from "vitest";
import { mergeDiscoveryLocalizationConfig, normalizeModuleMix } from "@/lib/discovery/config";
import { resolveDiscoveryCountry, prefsNeedOnboarding, hasConfiguredDiscovery, shouldShowPersonalizePrompt } from "@/lib/discovery/country";
import { encodeStoredContentScope, parseStoredContentScope, contentScopeLabel } from "@/lib/discovery/content-scope";
import { passesStrictCountryIsolation } from "@/lib/discovery/isolation";
import { rankDiscoverableChannels } from "@/lib/discovery/ranking";
import type { DiscoverableChannel, DiscoveryContext } from "@/lib/discovery/types";

const config = mergeDiscoveryLocalizationConfig(null);

const baseCtx: DiscoveryContext = {
  userId: "u1",
  discoveryCountry: "IN",
  preferredLanguages: ["hi", "en"],
  interests: ["gaming", "music"],
  contentScope: "for_you",
  joinedChannelIds: [],
  followedChannelIds: [],
  config,
};

const channels: DiscoverableChannel[] = [
  {
    id: "in-gaming",
    name: "India Gaming",
    source: "platform",
    audienceScope: "single_country",
    countryCode: "IN",
    allowedCountryCodes: [],
    languageCodes: ["hi"],
    interestSlugs: ["gaming"],
    memberCount: 120,
    featured: true,
  },
  {
    id: "pk-urdu",
    name: "Pakistan Urdu",
    source: "platform",
    audienceScope: "single_country",
    countryCode: "PK",
    allowedCountryCodes: [],
    languageCodes: ["ur"],
    interestSlugs: ["general-chat"],
    memberCount: 90,
    featured: false,
  },
  {
    id: "global-lobby",
    name: "Global Lobby",
    source: "platform",
    audienceScope: "global",
    countryCode: null,
    allowedCountryCodes: [],
    languageCodes: ["en"],
    interestSlugs: ["general-chat"],
    memberCount: 500,
    featured: false,
  },
];

describe("resolveDiscoveryCountry", () => {
  it("prefers user-confirmed discovery country", () => {
    expect(resolveDiscoveryCountry({ discoveryCountryCode: "PK", profileCountryCode: "IN", adminDefaultCountry: "US" })).toBe("PK");
  });
});

describe("strict country isolation", () => {
  it("hides foreign country-scoped rooms when enabled", () => {
    const isoConfig = mergeDiscoveryLocalizationConfig({
      strictIsolation: { enabled: true, allowGlobalRooms: true, allowJoinedForeignRooms: false, allowCrossCountryInvites: false, allowSearchAcrossCountries: false, lockDiscoveryCountry: false, allowUserChangeDiscoveryCountry: true },
    });
    expect(passesStrictCountryIsolation({
      channel: channels[1],
      userCountry: "IN",
      joinedChannelIds: new Set(),
      config: isoConfig,
    })).toBe(false);
  });
});

describe("rankDiscoverableChannels", () => {
  it("prioritizes Indian rooms for IN user in country_first mode", () => {
    const ranked = rankDiscoverableChannels(channels, {
      ...baseCtx,
      config: mergeDiscoveryLocalizationConfig({ discoveryMode: "country_first" }),
    }, { module: "chatrooms" });
    expect(ranked[0]?.item.id).toBe("in-gaming");
  });

  it("includes global fallback when local content is thin", () => {
    const ranked = rankDiscoverableChannels([channels[2]], baseCtx);
    expect(ranked.some((r) => r.item.id === "global-lobby")).toBe(true);
  });
});

describe("normalizeModuleMix", () => {
  it("normalizes percentages to 100", () => {
    expect(normalizeModuleMix({ countryPct: 50, interestsPct: 30, globalPct: 20 })).toEqual({ countryPct: 50, interestsPct: 30, globalPct: 20 });
  });
});

describe("prefsNeedOnboarding", () => {
  it("requires onboarding when never completed", () => {
    expect(prefsNeedOnboarding(null, {})).toBe(true);
    expect(prefsNeedOnboarding({ user_id: "u", discovery_country_code: null, preferred_languages: [], interests: [], selected_channel_ids: [], content_scope: "for_you", detected_country_code: null, discovery_onboarding_completed_at: null, personalize_prompt_dismissed_at: null, updated_at: "" }, {})).toBe(true);
  });
});

describe("content scope encoding", () => {
  it("round-trips strict isolation suffix", () => {
    const encoded = encodeStoredContentScope("my_country", true);
    expect(encoded).toBe("my_country|strict");
    expect(parseStoredContentScope(encoded)).toEqual({ view: "my_country", strictIsolation: true });
  });

  it("maps legacy worldwide_first to worldwide view", () => {
    expect(parseStoredContentScope("worldwide_first")).toEqual({ view: "worldwide", strictIsolation: false });
  });

  it("labels scopes for compact selector", () => {
    expect(contentScopeLabel("for_you")).toBe("For You");
    expect(contentScopeLabel("my_country")).toBe("My Country");
  });
});

describe("personalize prompt", () => {
  it("shows in settings when user has not configured discovery", () => {
    expect(shouldShowPersonalizePrompt(null, {})).toBe(true);
    expect(hasConfiguredDiscovery(null)).toBe(false);
  });

  it("hides after user configures country or interests", () => {
    const prefs = {
      user_id: "u",
      discovery_country_code: "IN",
      preferred_languages: [],
      interests: [],
      selected_channel_ids: [],
      content_scope: "for_you" as const,
      detected_country_code: null,
      discovery_onboarding_completed_at: null,
      personalize_prompt_dismissed_at: null,
      updated_at: "",
    };
    expect(hasConfiguredDiscovery(prefs)).toBe(true);
    expect(shouldShowPersonalizePrompt(prefs, {})).toBe(false);
  });

  it("uses admin defaults path when no prefs exist", () => {
    const config = mergeDiscoveryLocalizationConfig(null);
    expect(config.discoveryMode).toBe("global_first");
    expect(config.defaultLanguages).toEqual(["en"]);
  });
});
