import type { DiscoveryContentScope, UserContentPreference } from "@/lib/discovery/config";

export type ParsedContentScope = {
  view: DiscoveryContentScope;
  strictIsolation: boolean;
};

const VIEW_SCOPES = new Set<DiscoveryContentScope>(["for_you", "my_country", "worldwide"]);

function normalizeView(raw: string): DiscoveryContentScope {
  if (VIEW_SCOPES.has(raw as DiscoveryContentScope)) return raw as DiscoveryContentScope;
  if (raw === "country_first" || raw === "balanced") return "for_you";
  if (raw === "worldwide_first") return "worldwide";
  return "for_you";
}

/** Decode persisted content_scope (supports legacy values and `|strict` suffix). */
export function parseStoredContentScope(raw: string | null | undefined): ParsedContentScope {
  const value = (raw ?? "for_you").trim();
  const strictIsolation = value.endsWith("|strict");
  const base = strictIsolation ? value.slice(0, -"|strict".length) : value;
  return { view: normalizeView(base), strictIsolation };
}

export function encodeStoredContentScope(view: DiscoveryContentScope, strictIsolation: boolean): string {
  return strictIsolation ? `${view}|strict` : view;
}

export function contentScopeLabel(scope: DiscoveryContentScope): string {
  if (scope === "my_country") return "My Country";
  if (scope === "worldwide") return "Worldwide";
  return "For You";
}

export function legacyContentScope(raw: string | null | undefined): UserContentPreference | DiscoveryContentScope {
  return parseStoredContentScope(raw).view;
}
