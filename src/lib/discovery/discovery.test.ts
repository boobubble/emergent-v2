import { describe, it, expect } from "vitest";
import { mergeDiscoveryLocalizationConfig, normalizeModuleMix } from "@/lib/discovery/config";
import { DJ_DEFAULTS, resolveChatRadioView } from "@/lib/dj-config";
import { resolveDiscoveryCountry, prefsNeedOnboarding, hasConfiguredDiscovery, shouldShowPersonalizePrompt } from "@/lib/discovery/country";
import { encodeStoredContentScope, parseStoredContentScope, contentScopeLabel } from "@/lib/discovery/content-scope";
import { passesStrictCountryIsolation } from "@/lib/discovery/isolation";
import { rankDiscoverableChannels } from "@/lib/discovery/ranking";
import { rankDiscoverableContentList } from "@/lib/discovery/rank-content";
import {
  applyPrimaryToDraft,
  draftToSavePayload,
  prefsToDraft,
} from "@/lib/discovery/discovery-draft";
import { DEFAULT_NESTED_OPTIONS, DEFAULT_PRIMARY_OPTIONS, searchDiscoveryOptions } from "@/lib/discovery/discovery-options";
import { buildPersonalizationLabel } from "@/lib/discovery/discovery-label";
import {
  isModuleRolloutEnabled,
  isPersonalizationActive,
  nestedOptionsForRollout,
  primaryOptionsForRollout,
  resolveEffectiveDiscoveryPrefs,
  sanitizeDiscoverySave,
  shouldShowFullScreenDiscovery,
  shouldShowPersonalizationLabel,
} from "@/lib/discovery/rollout";
import type { DiscoveryLocalizationConfig } from "@/lib/discovery/config";
import type { DiscoverableChannel, DiscoveryContext, UserDiscoveryPrefs } from "@/lib/discovery/types";

const config = mergeDiscoveryLocalizationConfig(null);

function rolloutConfig(over: Partial<DiscoveryLocalizationConfig> = {}) {
  return mergeDiscoveryLocalizationConfig(over);
}

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

describe("full-screen discovery draft", () => {
  it("maps India selection to IN country code and interests", () => {
    const draft = applyPrimaryToDraft(prefsToDraft(null), {
      id: "IN",
      label: "India",
      description: "",
      emoji: "🇮🇳",
      kind: "country",
      countryCode: "IN",
      contentScope: "my_country",
      preferredLanguages: ["hi", "en"],
      sortOrder: 20,
      enabled: true,
    });
    const payload = draftToSavePayload({ ...draft, interests: ["mumbai", "bollywood"] });
    expect(payload.discovery_country_code).toBe("IN");
    expect(payload.interests).toEqual(["mumbai", "bollywood"]);
    expect(payload.content_scope).toBe("my_country");
  });

  it("maps English Community without fake country code", () => {
    const draft = applyPrimaryToDraft(prefsToDraft(null), {
      id: "english_community",
      label: "English Community",
      description: "",
      emoji: "🇬🇧",
      kind: "language_community",
      countryCode: null,
      contentScope: "worldwide",
      preferredLanguages: ["en"],
      sortOrder: 50,
      enabled: true,
    });
    const payload = draftToSavePayload(draft);
    expect(payload.discovery_country_code).toBeNull();
    expect(payload.content_scope).toBe("worldwide");
    expect(payload.preferred_languages).toContain("en");
  });

  it("maps Pakistan and Philippines", () => {
    for (const [id, code] of [["PK", "PK"], ["PH", "PH"]] as const) {
      const draft = applyPrimaryToDraft(prefsToDraft(null), {
        id,
        label: id,
        description: "",
        emoji: "",
        kind: "country",
        countryCode: code,
        contentScope: "my_country",
        preferredLanguages: [],
        sortOrder: 1,
        enabled: true,
      });
      expect(draftToSavePayload(draft).discovery_country_code).toBe(code);
    }
  });

  it("builds personalization label", () => {
    const label = buildPersonalizationLabel({
      user_id: "u",
      discovery_country_code: "IN",
      preferred_languages: ["en"],
      interests: ["mumbai", "bollywood"],
      selected_channel_ids: [],
      content_scope: "my_country",
      detected_country_code: null,
      discovery_onboarding_completed_at: "2026-01-01",
      personalize_prompt_dismissed_at: null,
      updated_at: "",
    });
    expect(label).toContain("India");
    expect(label).toContain("Mumbai");
  });
});

describe("shouldShowFullScreenDiscovery", () => {
  const fullCfg = rolloutConfig({ rolloutMode: "FULL_ROLLOUT", firstLoginDiscoveryRequired: true });

  it("shows for new users when rollout requires selection", () => {
    expect(shouldShowFullScreenDiscovery(null, fullCfg)).toBe(true);
  });

  it("does not show for completed onboarding", () => {
    expect(
      shouldShowFullScreenDiscovery(
        {
          user_id: "u",
          discovery_country_code: "IN",
          preferred_languages: ["en"],
          interests: ["cricket"],
          selected_channel_ids: [],
          content_scope: "my_country",
          detected_country_code: null,
          discovery_onboarding_completed_at: "2026-01-01",
          personalize_prompt_dismissed_at: null,
          updated_at: "",
        },
        fullCfg,
      ),
    ).toBe(false);
  });

  it("does not show for existing configured users without completed flag", () => {
    expect(
      shouldShowFullScreenDiscovery(
        {
          user_id: "u",
          discovery_country_code: "IN",
          preferred_languages: [],
          interests: [],
          selected_channel_ids: [],
          content_scope: "for_you",
          detected_country_code: null,
          discovery_onboarding_completed_at: null,
          personalize_prompt_dismissed_at: null,
          updated_at: "",
        },
        fullCfg,
      ),
    ).toBe(false);
  });

  it("opens on explicit Change Discovery when feature enabled", () => {
    expect(shouldShowFullScreenDiscovery(null, fullCfg, { forceOpen: true })).toBe(true);
  });

  it("GLOBAL_ONLY never opens first-login sheet", () => {
    const globalCfg = rolloutConfig({ rolloutMode: "GLOBAL_ONLY" });
    expect(shouldShowFullScreenDiscovery(null, globalCfg)).toBe(false);
  });

  it("OFF disables personalization and sheet", () => {
    const offCfg = rolloutConfig({ rolloutMode: "OFF", fullScreenDiscoveryEnabled: false });
    expect(shouldShowFullScreenDiscovery(null, offCfg)).toBe(false);
    expect(isPersonalizationActive(offCfg)).toBe(false);
  });
});

describe("discovery rollout", () => {
  it("SELECTED_COUNTRIES exposes only enabled primaries", () => {
    const cfg = rolloutConfig({
      rolloutMode: "SELECTED_COUNTRIES",
      primaryOptions: DEFAULT_PRIMARY_OPTIONS.map((p) =>
        p.id === "PH" ? { ...p, enabled: false } : p,
      ),
    });
    const primaries = primaryOptionsForRollout(cfg).map((p) => p.id);
    expect(primaries).toContain("IN");
    expect(primaries).toContain("PK");
    expect(primaries).not.toContain("PH");
  });

  it("disabled Philippines not searchable in rollout-filtered nested options", () => {
    const cfg = rolloutConfig({
      rolloutMode: "SELECTED_COUNTRIES",
      primaryOptions: DEFAULT_PRIMARY_OPTIONS.map((p) =>
        p.id === "PH" ? { ...p, enabled: false } : p,
      ),
    });
    const nested = nestedOptionsForRollout(cfg);
    expect(nested.some((n) => n.slug === "manila")).toBe(false);
    expect(searchDiscoveryOptions("manila", primaryOptionsForRollout(cfg), nested, []).length).toBe(0);
  });

  it("sanitize rejects disabled country and falls back to global", () => {
    const cfg = rolloutConfig({
      rolloutMode: "SELECTED_COUNTRIES",
      primaryOptions: DEFAULT_PRIMARY_OPTIONS.map((p) =>
        p.id === "PH" ? { ...p, enabled: false } : p,
      ),
    });
    const result = sanitizeDiscoverySave(
      { discovery_country_code: "PH", content_scope: "my_country", interests: ["manila"] },
      cfg,
      null,
    );
    expect(result.discovery_country_code).toBeNull();
    expect(result.content_scope).toBe("worldwide");
    expect(result.fellBackToGlobal).toBe(true);
  });

  it("preserves stored prefs when country later disabled but ranks with global fallback", () => {
    const cfg = rolloutConfig({
      rolloutMode: "SELECTED_COUNTRIES",
      primaryOptions: DEFAULT_PRIMARY_OPTIONS.map((p) =>
        p.id === "PH" ? { ...p, enabled: false } : p,
      ),
    });
    const stored = {
      user_id: "u",
      discovery_country_code: "PH",
      preferred_languages: ["en"],
      interests: ["manila"],
      selected_channel_ids: [],
      content_scope: "my_country" as const,
      detected_country_code: null,
      discovery_onboarding_completed_at: "2026-01-01",
      personalize_prompt_dismissed_at: null,
      updated_at: "",
    };
    const effective = resolveEffectiveDiscoveryPrefs(stored, cfg);
    expect(stored.discovery_country_code).toBe("PH");
    expect(effective?.discovery_country_code).toBeNull();
    expect(effective?.content_scope).toBe("worldwide");
  });

  it("feed toggle OFF hides personalization label", () => {
    const cfg = rolloutConfig({ modules: { ...config.modules, feed: false } });
    expect(shouldShowPersonalizationLabel(cfg)).toBe(false);
  });

  it("chatrooms module toggle OFF disables chatroom rollout", () => {
    const cfg = rolloutConfig({ modules: { ...config.modules, chatrooms: false } });
    expect(isModuleRolloutEnabled(cfg, "chatrooms")).toBe(false);
  });

  it("India selection saves IN via sanitize", () => {
    const cfg = rolloutConfig({ rolloutMode: "SELECTED_COUNTRIES" });
    const result = sanitizeDiscoverySave(
      { discovery_country_code: "IN", content_scope: "my_country", interests: ["mumbai"] },
      cfg,
      null,
    );
    expect(result.discovery_country_code).toBe("IN");
    expect(result.interests).toContain("mumbai");
  });
});

describe("discovery search", () => {
  it("finds cities and topics locally", () => {
    const hits = searchDiscoveryOptions("mumbai", DEFAULT_PRIMARY_OPTIONS, DEFAULT_NESTED_OPTIONS, [{ code: "en", label: "English" }]);
    expect(hits.some((h) => h.label === "Mumbai")).toBe(true);
  });

  it("groups poetry and lahore hits", () => {
    expect(searchDiscoveryOptions("poetry", DEFAULT_PRIMARY_OPTIONS, DEFAULT_NESTED_OPTIONS, []).some((h) => h.group === "Topics")).toBe(true);
    expect(searchDiscoveryOptions("lahore", DEFAULT_PRIMARY_OPTIONS, DEFAULT_NESTED_OPTIONS, []).some((h) => h.group === "Cities/Regions")).toBe(true);
  });
});

describe("rankDiscoverableContentList", () => {
  it("strict isolation hides unrelated country content", () => {
    const isoConfig = mergeDiscoveryLocalizationConfig({
      strictIsolation: { enabled: true, allowGlobalRooms: true, allowJoinedForeignRooms: false, allowCrossCountryInvites: false, allowSearchAcrossCountries: false, lockDiscoveryCountry: false, allowUserChangeDiscoveryCountry: true },
    });
    const ranked = rankDiscoverableContentList(
      channels.map((c) => ({
        id: c.id,
        audienceScope: c.audienceScope,
        contentCountry: c.countryCode,
        contentLanguages: c.languageCodes,
        contentTags: c.interestSlugs,
        memberCount: c.memberCount,
        featured: c.featured,
      })),
      {
        userPrefs: {
          user_id: "u",
          discovery_country_code: "IN",
          preferred_languages: ["hi"],
          interests: ["gaming"],
          selected_channel_ids: [],
          content_scope: encodeStoredContentScope("my_country", true) as UserDiscoveryPrefs["content_scope"],
          detected_country_code: null,
          discovery_onboarding_completed_at: "2026",
          personalize_prompt_dismissed_at: null,
          updated_at: "",
        },
        adminConfig: isoConfig,
        discoveryCountry: "IN",
        contentScope: "my_country",
      },
    );
    expect(ranked.some((r) => r.item.id === "pk-urdu")).toBe(false);
    expect(ranked.some((r) => r.item.id === "in-gaming")).toBe(true);
  });
});

describe("resolveChatRadioView", () => {
  it("shows dj_player when enabled", () => {
    const view = resolveChatRadioView({ ...DJ_DEFAULTS, enabled: true, djName: "DJ Sam" }, null, null);
    expect(view.visible).toBe(true);
    expect(view.source).toBe("dj_player");
  });

  it("falls back to enabled radio widget stream URL", () => {
    const view = resolveChatRadioView(
      DJ_DEFAULTS,
      { id: "w1", name: "YoChat FM", enabled: true, stream_url: "https://radio.example.org/listen/station/radio.mp3" },
      { widget_id: "w1", is_live: true, current_track_title: "Night Mix", current_track_artist: null, current_show_title: null },
    );
    expect(view.visible).toBe(true);
    expect(view.source).toBe("radio_widget");
    expect(view.state.playing).toBe(true);
  });

  it("hides when disabled with no stream", () => {
    expect(resolveChatRadioView(DJ_DEFAULTS, { id: "w1", name: "X", enabled: false, stream_url: "https://x/a.mp3" }, null).visible).toBe(false);
  });
});
