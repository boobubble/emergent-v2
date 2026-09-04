/**
 * Helpers for Bluesky shortening, welcome-post detection, and auto-status labels.
 * Run with: npx tsx src/lib/social-manual-distribution.test.ts
 */
import {
  BLUESKY_GRAPHEME_LIMIT,
  describeAutoStatus,
  graphemeLength,
  isWelcomeFeedPost,
  manualCompletionKind,
  pinterestTitle,
  resolveManualShareMedia,
  shortenForBluesky,
} from "./social-manual-distribution";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const DEFAULT = "https://cdn.example.com/yaarzo-welcome.png";
const USER = "https://cdn.example.com/avatars/u1.png";

assert(isWelcomeFeedPost({ slug: "welcome-ranjha" }), "slug welcome-*");
assert(isWelcomeFeedPost({ category: "new_member" }), "category new_member");
assert(
  isWelcomeFeedPost({ text: "👋 ranjha just signed up! Start a chat with him in the chatroom." }),
  "legacy signed-up caption",
);
assert(!isWelcomeFeedPost({ slug: "photo-dump", text: "hello friends" }), "regular post");

const long = "🎉 Welcome! " + "x".repeat(400);
const shortened = shortenForBluesky(long, "https://yaarzo.com/u/ranjha");
assert(graphemeLength(shortened) <= BLUESKY_GRAPHEME_LIMIT, "bluesky limit");
assert(shortened.includes("https://yaarzo.com/u/ranjha"), "keeps profile url");
assert(shortened.includes("…"), "marks truncation");

const original = "🎉 Ranjha just joined Yaarzo!\nhttps://yaarzo.com/u/ranjha";
assert(shortenForBluesky(original, "https://yaarzo.com/u/ranjha") === original, "no-op when short");

assert(pinterestTitle("Ranjha") === "Welcome Ranjha to Yaarzo", "pinterest title");

const queued = describeAutoStatus("queued");
assert(queued.kind === "queued" && queued.published === false, "queued is not published");
assert(queued.label === "Queued in Buffer", "queued label");
assert(describeAutoStatus("published").published === true, "published");

assert(manualCompletionKind(["not_posted", "not_posted", "not_posted", "not_posted"]) === "needs_manual", "needs");
assert(manualCompletionKind(["posted", "skipped", "posted", "skipped"]) === "completed", "completed");
assert(manualCompletionKind(["posted", "not_posted", "not_posted", "skipped"]) === "partial", "partial");

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

for (const status of ["pending", "needs_review", "none", "approved"]) {
  const r = resolveManualShareMedia({
    avatarUrl: USER,
    avatarModerationStatus: status,
    allowSocialFeature: true,
    defaultMediaUrl: DEFAULT,
  });
  assert(r.mediaSource === "user_avatar", `live ${status} may use avatar`);
}

assert(
  resolveManualShareMedia({
    avatarUrl: USER,
    avatarModerationStatus: "rejected",
    allowSocialFeature: true,
    defaultMediaUrl: DEFAULT,
  }).mediaSource === "default_image",
  "rejected must use default",
);

console.log("social-manual-distribution tests: OK");
