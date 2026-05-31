/**
 * Centralized Guest Access framework — config + types only.
 * Stored under `app_settings.guest_access`. No DB schema change required.
 *
 * The existing auth system (email/password, Google, anonymous) is preserved
 * unchanged. This module adds an optional, fully admin-controllable Guest
 * Mode on top of it.
 */

export type GuestPermissionKey =
  | "view_chatrooms"
  | "view_feed"
  | "view_profiles"
  | "search_content"
  | "join_public_rooms"
  | "send_messages"
  | "send_dms"
  | "create_posts"
  | "upload_media"
  | "react"
  | "comment"
  | "earn_coins"
  | "earn_xp"
  | "receive_rewards"
  | "join_private_rooms"
  | "premium_features";

export interface GuestPermissions {
  view_chatrooms: boolean;
  view_feed: boolean;
  view_profiles: boolean;
  search_content: boolean;
  join_public_rooms: boolean;
  send_messages: boolean;
  send_dms: boolean;
  create_posts: boolean;
  upload_media: boolean;
  react: boolean;
  comment: boolean;
  earn_coins: boolean;
  earn_xp: boolean;
  receive_rewards: boolean;
  join_private_rooms: boolean;
  premium_features: boolean;
}

export interface GuestAccessConfig {
  /** Master switch — show "Continue as guest" + allow guest sessions at all. */
  enabled: boolean;
  /** When true, unauthenticated visitors are auto-signed-in as guest on landing. */
  autoLogin: boolean;
  /** Prefix used to generate guest usernames (e.g. "guest-xyz12"). */
  usernamePrefix: string;
  /** Session duration in minutes. 0 = until tab close (current behaviour). */
  sessionDurationMin: number;
  /** Show an upgrade-to-registered banner while signed in as guest. */
  showUpgradePrompt: boolean;
  /** Preserve guest preferences/activity when upgrading to a real account. */
  preserveOnUpgrade: boolean;
  permissions: GuestPermissions;
}

export const GUEST_PERMISSION_META: Record<
  GuestPermissionKey,
  { label: string; description: string; group: "browse" | "interact" | "rewards" | "premium" }
> = {
  view_chatrooms:     { label: "View Chatrooms",     description: "Browse public lobby and game chat.",   group: "browse" },
  view_feed:          { label: "View Feed",          description: "Read the public social feed.",         group: "browse" },
  view_profiles:      { label: "View Profiles",      description: "Open public user profiles.",           group: "browse" },
  search_content:     { label: "Search Content",     description: "Use search across public content.",    group: "browse" },
  join_public_rooms:  { label: "Join Public Rooms",  description: "Enter public chatrooms as a listener.",group: "browse" },
  send_messages:      { label: "Send Messages",      description: "Post in public chatrooms.",            group: "interact" },
  send_dms:           { label: "Send DMs",           description: "Start direct-message threads.",        group: "interact" },
  create_posts:       { label: "Create Posts",       description: "Publish to the social feed.",          group: "interact" },
  upload_media:       { label: "Upload Media",       description: "Attach images/video to messages/posts.", group: "interact" },
  react:              { label: "React",              description: "Add reactions/emojis to content.",     group: "interact" },
  comment:            { label: "Comment",            description: "Reply to posts in the feed.",          group: "interact" },
  earn_coins:         { label: "Earn Coins",         description: "Receive coin rewards from activity.",  group: "rewards" },
  earn_xp:            { label: "Earn XP",            description: "Receive XP and level up.",             group: "rewards" },
  receive_rewards:    { label: "Receive Rewards",    description: "Claim missions, streaks, daily chest.",group: "rewards" },
  join_private_rooms: { label: "Join Private Rooms", description: "Access invite-only rooms.",            group: "premium" },
  premium_features:   { label: "Premium Features",   description: "Use paid / VIP gated features.",       group: "premium" },
};

export const GUEST_ACCESS_DEFAULTS: GuestAccessConfig = {
  enabled: true,
  autoLogin: false,
  usernamePrefix: "guest",
  sessionDurationMin: 0,
  showUpgradePrompt: true,
  preserveOnUpgrade: true,
  permissions: {
    view_chatrooms: true,
    view_feed: true,
    view_profiles: true,
    search_content: true,
    join_public_rooms: true,
    send_messages: false,
    send_dms: false,
    create_posts: false,
    upload_media: false,
    react: false,
    comment: false,
    earn_coins: false,
    earn_xp: false,
    receive_rewards: false,
    join_private_rooms: false,
    premium_features: false,
  },
};

/** Pure check — safe to call from server code as well. */
export function guestCan(cfg: GuestAccessConfig, key: GuestPermissionKey): boolean {
  return Boolean(cfg.permissions[key]);
}
