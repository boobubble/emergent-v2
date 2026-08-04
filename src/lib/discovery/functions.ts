import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { detectCountryCode } from "@/lib/country-flag";
import { resolveDiscoveryCountry } from "@/lib/discovery/country";
import {
  DISCOVERY_SETTINGS_KEY,
  mergeDiscoveryLocalizationConfig,
  type DiscoveryContentScope,
  type UserContentPreference,
} from "@/lib/discovery/config";
import {
  platformChannelsFromSettings,
  toDiscoverableDbChatroom,
  toDiscoverablePlatformChannel,
} from "@/lib/discovery/channels";
import { buildChatroomDiscoverySections, rankDiscoverableChannels } from "@/lib/discovery/ranking";
import { encodeStoredContentScope, parseStoredContentScope } from "@/lib/discovery/content-scope";
import type { DiscoveryContext, UserDiscoveryPrefs } from "@/lib/discovery/types";
import { withRateLimit } from "@/lib/rate-limit-middleware";

const db = supabaseAdmin as any;

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}

async function loadDiscoveryConfig() {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", DISCOVERY_SETTINGS_KEY)
    .maybeSingle();
  return mergeDiscoveryLocalizationConfig(data?.value);
}

function mapPrefsRow(row: Record<string, unknown> | null): UserDiscoveryPrefs | null {
  if (!row) return null;
  return {
    user_id: String(row.user_id),
    discovery_country_code: (row.discovery_country_code as string | null) ?? null,
    preferred_languages: (row.preferred_languages as string[]) ?? [],
    interests: (row.interests as string[]) ?? [],
    selected_channel_ids: (row.selected_channel_ids as string[]) ?? [],
    content_scope: (row.content_scope as DiscoveryContentScope | UserContentPreference) ?? "for_you",
    detected_country_code: (row.detected_country_code as string | null) ?? null,
    discovery_onboarding_completed_at: (row.discovery_onboarding_completed_at as string | null) ?? null,
    personalize_prompt_dismissed_at: (row.personalize_prompt_dismissed_at as string | null) ?? null,
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

async function loadProfileDiscoveryHints(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("country_code, interests")
    .eq("id", userId)
    .maybeSingle();
  return {
    profileCountryCode: data?.country_code ?? null,
    profileInterests: (data?.interests as string[]) ?? [],
  };
}

async function loadDbChatrooms() {
  const extended =
    "id, slug, name, description, category, featured, member_count, community_id, audience_scope, country_code, allowed_country_codes, language_codes, interest_slugs, communities ( slug )";
  const basic = "id, slug, name, description, category, featured, member_count, community_id, communities ( slug )";
  let { data, error } = await db.from("chatrooms").select(extended).is("archived_at", null).limit(500);
  if (error) {
    const fallback = await db.from("chatrooms").select(basic).is("archived_at", null).limit(500);
    data = fallback.data;
    error = fallback.error;
  }
  if (error) return [];
  return data ?? [];
}

async function loadAllChannels() {
  const [{ data: settingsRow }, rooms] = await Promise.all([
    supabaseAdmin.from("app_settings").select("value").eq("key", "chat_channels").maybeSingle(),
    loadDbChatrooms(),
  ]);
  const platform = platformChannelsFromSettings(settingsRow?.value).map(toDiscoverablePlatformChannel);
  const community = rooms.map((r: Parameters<typeof toDiscoverableDbChatroom>[0]) => toDiscoverableDbChatroom(r));
  const byId = new Map<string, ReturnType<typeof toDiscoverablePlatformChannel>>();
  for (const ch of [...platform, ...community]) byId.set(ch.id, ch);
  return [...byId.values()];
}

async function buildContext(
  userId: string,
  opts: { scope?: DiscoveryContentScope; joinedChannelIds?: string[] },
): Promise<DiscoveryContext> {
  const config = await loadDiscoveryConfig();
  const { profileCountryCode, profileInterests } = await loadProfileDiscoveryHints(userId);
  const { data: prefsRow } = await db.from("user_discovery_prefs").select("*").eq("user_id", userId).maybeSingle();
  const prefs = mapPrefsRow(prefsRow);

  const discoveryCountry = resolveDiscoveryCountry({
    discoveryCountryCode: prefs?.discovery_country_code,
    profileCountryCode,
    signupCountryCode: null,
    detectedCountryCode: prefs?.detected_country_code ?? detectCountryCode(),
    adminDefaultCountry: config.defaultCountryCode,
  });

  const preferredLanguages = prefs?.preferred_languages?.length ? prefs.preferred_languages : config.defaultLanguages;
  const interests = prefs?.interests?.length ? prefs.interests : profileInterests.length ? profileInterests : config.defaultInterests;

  const parsedScope = parseStoredContentScope(typeof prefs?.content_scope === "string" ? prefs.content_scope : null);
  let contentScope: DiscoveryContentScope = opts.scope ?? parsedScope.view;
  if (config.discoveryMode === "country_only") contentScope = "my_country";

  const effectiveConfig = parsedScope.strictIsolation
    ? { ...config, discoveryMode: "country_only" as const }
    : config;

  return {
    userId,
    discoveryCountry,
    preferredLanguages,
    interests,
    contentScope,
    joinedChannelIds: opts.joinedChannelIds ?? prefs?.selected_channel_ids ?? [],
    followedChannelIds: [],
    config: effectiveConfig,
  };
}

export const getDiscoveryPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .handler(async ({ context }) => {
    const config = await loadDiscoveryConfig();
    const { profileCountryCode } = await loadProfileDiscoveryHints(context.userId);
    const { data: row } = await db.from("user_discovery_prefs").select("*").eq("user_id", context.userId).maybeSingle();
    const prefs = mapPrefsRow(row);
    const suggestedCountry = resolveDiscoveryCountry({
      discoveryCountryCode: prefs?.discovery_country_code,
      profileCountryCode,
      detectedCountryCode: detectCountryCode(),
      adminDefaultCountry: config.defaultCountryCode,
    });
    return { prefs, config, suggestedCountry };
  });

export const getInterestTags = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await db
    .from("interest_tags")
    .select("slug, label, emoji, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) {
    const config = await loadDiscoveryConfig();
    return config.defaultInterests.map((slug, i) => ({
      slug,
      label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: null,
      sort_order: i * 10,
    }));
  }
  return data ?? [];
});

export const getChatroomDiscovery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((input) =>
    z
      .object({
        scope: z.enum(["for_you", "my_country", "worldwide"]).optional(),
        joinedChannelIds: z.array(z.string()).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const ctx = await buildContext(context.userId, {
      scope: data.scope,
      joinedChannelIds: data.joinedChannelIds,
    });
    const channels = await loadAllChannels();
    const sections = buildChatroomDiscoverySections(channels, ctx);
    const recommended = rankDiscoverableChannels(channels, ctx, { module: "chatrooms", limit: 12 }).map((r) => r.item);
    return { sections, recommended, discoveryCountry: ctx.discoveryCountry };
  });

const savePrefsSchema = z.object({
  discovery_country_code: z.string().nullable().optional(),
  preferred_languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  selected_channel_ids: z.array(z.string()).optional(),
  content_scope: z.enum(["for_you", "my_country", "worldwide", "country_first", "balanced", "worldwide_first"]).optional(),
  strict_country_isolation: z.boolean().optional(),
  detected_country_code: z.string().nullable().optional(),
  complete_onboarding: z.boolean().optional(),
  skip_with_defaults: z.boolean().optional(),
  reset_onboarding: z.boolean().optional(),
  reset_preferences: z.boolean().optional(),
  dismiss_personalize_prompt: z.boolean().optional(),
});

export const saveDiscoveryPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("api")])
  .inputValidator((input) => savePrefsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const config = await loadDiscoveryConfig();
    const { data: existing } = await db.from("user_discovery_prefs").select("*").eq("user_id", context.userId).maybeSingle();
    const cur = mapPrefsRow(existing);

    if (data.reset_onboarding) {
      const { error } = await db.from("user_discovery_prefs").upsert({
        user_id: context.userId,
        discovery_onboarding_completed_at: null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (data.reset_preferences) {
      const preserve = {
        discovery_onboarding_completed_at: cur?.discovery_onboarding_completed_at ?? null,
        personalize_prompt_dismissed_at: cur?.personalize_prompt_dismissed_at ?? null,
      };
      const { error } = await db.from("user_discovery_prefs").upsert({
        user_id: context.userId,
        discovery_country_code: null,
        preferred_languages: config.defaultLanguages,
        interests: config.defaultInterests,
        selected_channel_ids: [],
        content_scope: "for_you",
        ...preserve,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const skip = Boolean(data.skip_with_defaults);
    const langs = skip ? config.defaultLanguages : (data.preferred_languages ?? cur?.preferred_languages ?? config.defaultLanguages);
    const interests = skip ? config.defaultInterests : (data.interests ?? cur?.interests ?? config.defaultInterests);
    const country = skip
      ? null
      : data.discovery_country_code !== undefined
        ? data.discovery_country_code
        : (cur?.discovery_country_code ?? null);

    const payload: Record<string, unknown> = {
      user_id: context.userId,
      discovery_country_code: country,
      preferred_languages: langs,
      interests,
      selected_channel_ids: data.selected_channel_ids ?? cur?.selected_channel_ids ?? [],
      updated_at: new Date().toISOString(),
    };

    if (data.content_scope !== undefined || data.strict_country_isolation !== undefined) {
      const parsed = parseStoredContentScope(typeof cur?.content_scope === "string" ? cur.content_scope : null);
      const view = (data.content_scope as DiscoveryContentScope | undefined) ?? parsed.view;
      const strict = data.strict_country_isolation ?? parsed.strictIsolation;
      payload.content_scope = encodeStoredContentScope(view, strict);
    }
    if (data.detected_country_code !== undefined) payload.detected_country_code = data.detected_country_code;
    if (data.complete_onboarding) payload.discovery_onboarding_completed_at = new Date().toISOString();
    if (data.dismiss_personalize_prompt) payload.personalize_prompt_dismissed_at = new Date().toISOString();

    const { error } = await db.from("user_discovery_prefs").upsert(payload);
    if (error) throw new Error(error.message);

    const profilePatch: { country_code?: string; interests?: string[] } = {};
    if (country) profilePatch.country_code = country;
    if (interests.length) profilePatch.interests = interests;
    if (Object.keys(profilePatch).length) {
      await supabaseAdmin.from("profiles").update(profilePatch).eq("id", context.userId);
    }

    return { ok: true };
  });

export const resetAllDiscoveryOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { error } = await db
      .from("user_discovery_prefs")
      .update({
        discovery_onboarding_completed_at: null,
        personalize_prompt_dismissed_at: null,
        updated_at: new Date().toISOString(),
      })
      .not("user_id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
