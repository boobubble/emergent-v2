import type { AudienceScope, DiscoveryLocalizationConfig } from "@/lib/discovery/config";
import type { DiscoverableChannel } from "@/lib/discovery/types";

export type IsolationFilterInput = {
  channel: DiscoverableChannel;
  userCountry: string;
  joinedChannelIds: Set<string>;
  invitedChannelIds?: Set<string>;
  followedChannelIds?: Set<string>;
  config: DiscoveryLocalizationConfig;
};

function countryMatchesChannel(userCountry: string, channel: DiscoverableChannel): boolean {
  const cc = userCountry.toUpperCase();
  if (channel.audienceScope === "global") return true;
  if (channel.audienceScope === "private") return false;
  if (channel.countryCode?.toUpperCase() === cc) return true;
  return channel.allowedCountryCodes.some((c) => c.toUpperCase() === cc);
}

export function passesStrictCountryIsolation(input: IsolationFilterInput): boolean {
  const { channel, userCountry, joinedChannelIds, config } = input;
  const iso = config.strictIsolation;
  if (!iso.enabled) return true;

  const joined = joinedChannelIds.has(channel.id);
  const invited = input.invitedChannelIds?.has(channel.id) ?? false;
  const followed = input.followedChannelIds?.has(channel.id) ?? false;

  if (joined && iso.allowJoinedForeignRooms) return true;
  if (invited && iso.allowCrossCountryInvites) return true;
  if (followed) return true;

  if (channel.audienceScope === "global") return iso.allowGlobalRooms;
  return countryMatchesChannel(userCountry, channel);
}

export function passesDiscoveryModeFilter(
  channel: DiscoverableChannel,
  userCountry: string,
  mode: DiscoveryLocalizationConfig["discoveryMode"],
  scope: "for_you" | "my_country" | "worldwide",
): boolean {
  if (scope === "worldwide") {
    return channel.audienceScope === "global" || channel.audienceScope === "multi_country";
  }
  if (scope === "my_country") {
    return countryMatchesChannel(userCountry, channel) || channel.audienceScope === "global";
  }
  if (mode === "country_only") {
    return countryMatchesChannel(userCountry, channel);
  }
  return true;
}

export function normalizeAudienceScope(raw: string | null | undefined): AudienceScope {
  const v = (raw ?? "global").toLowerCase();
  if (v === "single_country" || v === "multi_country" || v === "private") return v;
  return "global";
}
