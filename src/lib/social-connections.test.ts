/**
 * Connection sanitization, OAuth claim, Graph version, PDS safety, publish gates.
 * Run with: npx tsx src/lib/social-connections.test.ts
 */
import {
  DEFAULT_BLUESKY_PDS,
  DEFAULT_FACEBOOK_GRAPH_API_VERSION,
  assertWelcomePostExternallyPublishable,
  claimOauthStateRow,
  connectionHasNoSecrets,
  facebookGraphApiVersion,
  finalizeOauthStateClaim,
  isReadyToPublish,
  normalizeBlueskyPds,
  pinterestAuthorizeSearchParams,
  pinterestTokenExchangeParams,
  sanitizeConnection,
  shouldConfirmDuplicate,
  type OauthStateRecord,
  type SocialConnectionPublic,
} from "./social-connections";
import { resolveManualShareMedia } from "./social-manual-distribution";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function throws(fn: () => unknown, match: string, msg: string) {
  try {
    fn();
  } catch (e) {
    const text = e instanceof Error ? e.message : String(e);
    if (!text.includes(match)) throw new Error(`${msg}: got "${text}"`);
    return;
  }
  throw new Error(`${msg}: expected throw`);
}

assert(shouldConfirmDuplicate("posted", false) === true, "posted without force confirms");
assert(shouldConfirmDuplicate("posted", true) === false, "force skips confirm");
assert(shouldConfirmDuplicate("not_posted", false) === false, "not_posted publishes");
assert(shouldConfirmDuplicate("skipped", false) === false, "skipped is not a duplicate");
assert(shouldConfirmDuplicate(null, false) === false, "missing row is not a duplicate");

const dirty = {
  platform: "facebook",
  status: "connected",
  account_name: "Yaarzo",
  page_id: "123",
  page_name: "Yaarzo",
  token_ciphertext: "v1.SUPERSECRET",
  access_token: "EAAB-should-never-leak",
  refresh_token: "secret-refresh",
  page_token: "page-secret",
  app_password: "xxxx-xxxx",
};
const pub = sanitizeConnection(dirty);
assert(!!pub, "sanitizes facebook row");
assert(!("token_ciphertext" in (pub as object)), "no ciphertext key");
assert(connectionHasNoSecrets(pub!), "public payload has no secret strings");
assert(!JSON.stringify(pub).includes("SUPERSECRET"), "ciphertext value stripped");
assert(!JSON.stringify(pub).includes("EAAB"), "access token stripped");

assert(isReadyToPublish(pub) === true, "facebook with page is ready");
assert(
  isReadyToPublish({ ...(pub as SocialConnectionPublic), page_id: null }) === false,
  "facebook without page is not ready",
);
assert(isReadyToPublish({ ...(pub as SocialConnectionPublic), platform: "youtube" }) === false, "youtube never API");
assert(
  isReadyToPublish({
    ...(pub as SocialConnectionPublic),
    platform: "pinterest",
    default_board_id: null,
  }) === false,
  "pinterest needs a board",
);
assert(
  isReadyToPublish({
    ...(pub as SocialConnectionPublic),
    platform: "bluesky",
    status: "connected",
  }) === true,
  "connected bluesky is ready",
);

const now = Date.now();
const live: OauthStateRecord = {
  state: "abc123",
  platform: "facebook",
  expires_at: new Date(now + 10 * 60 * 1000).toISOString(),
  admin_user_id: "admin-1",
  return_path: "/admin/social-automation?tab=connections",
  code_verifier_ciphertext: null,
};
const store = [live];
const first = claimOauthStateRow(store, "abc123", "facebook");
assert(first?.admin_user_id === "admin-1", "first claim returns the row");
const replay = claimOauthStateRow(store, "abc123", "facebook");
assert(replay === null, "replay claim returns null");
throws(() => finalizeOauthStateClaim(replay, "facebook", now), "Invalid OAuth state", "replay rejected");

const pinRow: OauthStateRecord = {
  state: "pin-state",
  platform: "pinterest",
  expires_at: new Date(now + 10 * 60 * 1000).toISOString(),
  admin_user_id: "admin-2",
};
const mixed = [pinRow];
assert(claimOauthStateRow(mixed, "pin-state", "facebook") === null, "mismatched platform cannot claim");
assert(mixed.length === 1, "mismatched claim leaves the row");
throws(
  () => finalizeOauthStateClaim(pinRow, "facebook", now),
  "Invalid OAuth state",
  "finalize rejects platform mismatch",
);

const expired: OauthStateRecord = {
  state: "old",
  platform: "pinterest",
  expires_at: new Date(now - 1000).toISOString(),
  admin_user_id: "admin-3",
};
throws(() => finalizeOauthStateClaim(expired, "pinterest", now), "expired", "expired state rejected");

assertWelcomePostExternallyPublishable({ privacy: "public" });
throws(
  () => assertWelcomePostExternallyPublishable({ privacy: "private" }),
  "public",
  "private post cannot publish",
);
throws(
  () => assertWelcomePostExternallyPublishable({ privacy: "followers" }),
  "public",
  "non-public welcome post cannot publish",
);
throws(() => assertWelcomePostExternallyPublishable({ privacy: null }), "public", "null privacy cannot publish");

assert(
  facebookGraphApiVersion({}) === DEFAULT_FACEBOOK_GRAPH_API_VERSION,
  "default Graph version is v26.0",
);
assert(facebookGraphApiVersion({ FACEBOOK_GRAPH_API_VERSION: "v24.0" }) === "v24.0", "env overrides Graph version");
assert(
  facebookGraphApiVersion({ FACEBOOK_GRAPH_API_VERSION: "v21.0/../evil" }) === DEFAULT_FACEBOOK_GRAPH_API_VERSION,
  "invalid Graph version falls back",
);

const pinAuth = pinterestAuthorizeSearchParams({
  clientId: "app",
  redirectUri: "https://yaarzo.com/api/public/social-oauth/pinterest/callback",
  state: "st",
});
assert(pinAuth.get("response_type") === "code", "pinterest response_type=code");
assert(!pinAuth.has("code_challenge"), "pinterest auth has no PKCE challenge");
assert(!pinAuth.has("code_challenge_method"), "pinterest auth has no PKCE method");
const pinTok = pinterestTokenExchangeParams({
  code: "auth-code",
  redirectUri: "https://yaarzo.com/api/public/social-oauth/pinterest/callback",
});
assert(pinTok.get("grant_type") === "authorization_code", "pinterest token grant");
assert(!pinTok.has("code_verifier"), "pinterest token exchange has no PKCE verifier");

assert(normalizeBlueskyPds(undefined) === DEFAULT_BLUESKY_PDS, "default PDS");
assert(normalizeBlueskyPds("") === DEFAULT_BLUESKY_PDS, "empty PDS");
assert(normalizeBlueskyPds("https://custom-pds.example") === "https://custom-pds.example", "custom https PDS");
throws(() => normalizeBlueskyPds("http://bsky.social"), "HTTPS", "http PDS rejected");
throws(() => normalizeBlueskyPds("https://localhost"), "not allowed", "localhost PDS rejected");
throws(() => normalizeBlueskyPds("https://127.0.0.1"), "not allowed", "loopback PDS rejected");
throws(() => normalizeBlueskyPds("https://192.168.1.10"), "not allowed", "private PDS rejected");
throws(() => normalizeBlueskyPds("https://10.0.0.8"), "not allowed", "class A private PDS rejected");
throws(() => normalizeBlueskyPds("https://169.254.1.1"), "not allowed", "link-local PDS rejected");
throws(() => normalizeBlueskyPds("https://172.16.4.4"), "not allowed", "class B private PDS rejected");
throws(() => normalizeBlueskyPds("https://[::1]"), "not allowed", "ipv6 loopback PDS rejected");

const DEFAULT = "https://cdn.example.com/yaarzo-welcome.png";
const USER = "https://cdn.example.com/avatars/u1.png";
assert(
  resolveManualShareMedia({
    avatarUrl: USER,
    avatarModerationStatus: "approved",
    allowSocialFeature: true,
    defaultMediaUrl: DEFAULT,
  }).mediaSource === "user_avatar",
  "approved + consent uses avatar",
);
assert(
  resolveManualShareMedia({
    avatarUrl: USER,
    avatarModerationStatus: "approved",
    allowSocialFeature: false,
    defaultMediaUrl: DEFAULT,
  }).mediaSource === "default_image",
  "no consent never uses avatar",
);
for (const status of ["pending", "needs_review", "rejected", "none"]) {
  const r = resolveManualShareMedia({
    avatarUrl: USER,
    avatarModerationStatus: status,
    allowSocialFeature: true,
    defaultMediaUrl: DEFAULT,
  });
  assert(r.mediaSource === "default_image", `unsafe ${status} must use default`);
}

console.log("social-connections tests: OK");
