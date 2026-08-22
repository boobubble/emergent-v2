/**
 * Connection sanitization, duplicate-publish gate, and publish-ready checks.
 * Run with: npx tsx src/lib/social-connections.test.ts
 */
import {
  connectionHasNoSecrets,
  isReadyToPublish,
  sanitizeConnection,
  shouldConfirmDuplicate,
  type SocialConnectionPublic,
} from "./social-connections";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
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

assert(
  isReadyToPublish(pub) === true,
  "facebook with page is ready",
);
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

console.log("social-connections tests: OK");
