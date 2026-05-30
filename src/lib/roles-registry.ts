// Roles & Permissions Registry (foundation only — no enforcement logic)
// Future developers can wire these into RLS policies, server fn middleware,
// or UI guards without touching the existing user_roles app_role enum.

export type RoleKey =
  | "guest"
  | "member"
  | "verified_member"
  | "vip"
  | "moderator"
  | "room_moderator"
  | "admin"
  | "super_admin"
  | "owner";

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  description: string;
  /** Higher = more privileged. Used for comparisons in future guards. */
  rank: number;
  /** Maps to current public.app_role enum when applicable. */
  dbRole?: "moderator" | "admin" | "super_admin";
  builtin: boolean;
}

export const ROLES: RoleDefinition[] = [
  { key: "guest",           label: "Guest",            rank: 0,  description: "Unauthenticated visitor.",                    builtin: true },
  { key: "member",          label: "Member",           rank: 10, description: "Standard signed-in user.",                    builtin: true },
  { key: "verified_member", label: "Verified Member",  rank: 20, description: "Email/phone verified.",                       builtin: true },
  { key: "vip",             label: "VIP",              rank: 30, description: "Premium / supporter tier.",                   builtin: true },
  { key: "room_moderator",  label: "Room Moderator",   rank: 40, description: "Moderation scoped to a single room.",         builtin: true },
  { key: "moderator",       label: "Moderator",        rank: 50, description: "Global community moderator.",                 builtin: true, dbRole: "moderator" },
  { key: "admin",           label: "Admin",            rank: 80, description: "Manages settings and content.",               builtin: true, dbRole: "admin" },
  { key: "super_admin",     label: "Super Admin",      rank: 95, description: "Full configuration and system access.",       builtin: true, dbRole: "super_admin" },
  { key: "owner",           label: "Owner",            rank: 100, description: "Site owner. Cannot be demoted.",             builtin: true },
];

export type PermissionScope =
  | "feed" | "chat" | "dm" | "rooms" | "users" | "moderation"
  | "economy" | "rewards" | "system" | "billing" | "admin";

export interface PermissionDefinition {
  key: string;            // e.g. "feed.post.create"
  scope: PermissionScope;
  label: string;
  description: string;
  /** Default minimum role rank required (advisory only). */
  defaultMinRank: number;
}

export const PERMISSIONS: PermissionDefinition[] = [
  // Feed
  { key: "feed.post.create",   scope: "feed", label: "Create posts",       description: "Publish to the social feed.", defaultMinRank: 10 },
  { key: "feed.post.delete",   scope: "feed", label: "Delete any post",    description: "Remove posts authored by others.", defaultMinRank: 50 },
  { key: "feed.comment.create",scope: "feed", label: "Comment",            description: "Comment on posts.", defaultMinRank: 10 },

  // Chat / Rooms
  { key: "chat.message.send",  scope: "chat", label: "Send messages",      description: "Send chat messages.", defaultMinRank: 10 },
  { key: "chat.room.create",   scope: "rooms",label: "Create rooms",       description: "Create new chatrooms.", defaultMinRank: 20 },
  { key: "chat.room.manage",   scope: "rooms",label: "Manage room",        description: "Edit room settings.", defaultMinRank: 40 },
  { key: "dm.send",            scope: "dm",   label: "Send DMs",           description: "Send direct messages.", defaultMinRank: 10 },

  // Moderation
  { key: "mod.user.warn",      scope: "moderation", label: "Warn user",   description: "Issue user warnings.", defaultMinRank: 40 },
  { key: "mod.user.mute",      scope: "moderation", label: "Mute user",   description: "Mute users in chat.", defaultMinRank: 50 },
  { key: "mod.user.ban",       scope: "moderation", label: "Ban user",    description: "Ban users from the platform.", defaultMinRank: 80 },
  { key: "mod.reports.view",   scope: "moderation", label: "View reports",description: "Read the moderation queue.", defaultMinRank: 50 },
  { key: "mod.filters.manage", scope: "moderation", label: "Manage word filters", description: "Edit blocklist patterns.", defaultMinRank: 80 },

  // Economy / Rewards
  { key: "economy.config",     scope: "economy", label: "Configure economy", description: "Edit XP and coin rules.", defaultMinRank: 80 },
  { key: "rewards.grant",      scope: "rewards", label: "Grant rewards",     description: "Manually award coins/XP.", defaultMinRank: 80 },

  // Admin / System
  { key: "admin.access",       scope: "admin",  label: "Access admin panel", description: "Open the admin UI.", defaultMinRank: 80 },
  { key: "system.modules",     scope: "system", label: "Toggle modules",     description: "Enable/disable feature modules.", defaultMinRank: 95 },
  { key: "system.api_keys",    scope: "system", label: "Manage API keys",    description: "View/rotate API keys.", defaultMinRank: 95 },
  { key: "billing.manage",     scope: "billing",label: "Manage billing",     description: "Edit billing & subscriptions.", defaultMinRank: 95 },
];

/** Advisory default role→permission map. Real enforcement still goes through RLS + middleware. */
export function defaultPermissionsForRole(role: RoleKey): string[] {
  const r = ROLES.find((x) => x.key === role);
  if (!r) return [];
  return PERMISSIONS.filter((p) => r.rank >= p.defaultMinRank).map((p) => p.key);
}
