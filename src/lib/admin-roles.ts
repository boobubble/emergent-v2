// Role architecture (foundation only — full logic is implemented per-feature later).

export type AppRole =
  | "super_admin"
  | "admin"
  | "moderator"
  | "room_moderator"
  | "vip"
  | "verified_creator"
  | "user";

export interface RoleDef {
  id: AppRole;
  label: string;
  description: string;
  color: string; // tailwind text color
  permissions: Permission[];
}

export type Permission =
  | "admin.access"
  | "admin.settings.write"
  | "admin.modules.toggle"
  | "admin.roles.assign"
  | "admin.seo.write"
  | "moderation.global"
  | "moderation.room"
  | "content.create"
  | "content.boost";

export const ROLE_REGISTRY: RoleDef[] = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Full access to every module and setting. Cannot be revoked from UI.",
    color: "text-rose-500",
    permissions: [
      "admin.access","admin.settings.write","admin.modules.toggle",
      "admin.roles.assign","admin.seo.write","moderation.global",
      "moderation.room","content.create","content.boost",
    ],
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage settings, modules, SEO, and moderation.",
    color: "text-orange-500",
    permissions: [
      "admin.access","admin.settings.write","admin.modules.toggle",
      "admin.seo.write","moderation.global","moderation.room","content.create",
    ],
  },
  {
    id: "moderator",
    label: "Moderator",
    description: "Global moderation across rooms and feed.",
    color: "text-amber-500",
    permissions: ["moderation.global","moderation.room","content.create"],
  },
  {
    id: "room_moderator",
    label: "Room Moderator",
    description: "Moderate specific rooms only.",
    color: "text-yellow-500",
    permissions: ["moderation.room","content.create"],
  },
  {
    id: "vip",
    label: "VIP",
    description: "Premium perks, badges, and boosted reach.",
    color: "text-violet-500",
    permissions: ["content.create","content.boost"],
  },
  {
    id: "verified_creator",
    label: "Verified Creator",
    description: "Verified badge and creator tools access.",
    color: "text-sky-500",
    permissions: ["content.create","content.boost"],
  },
  {
    id: "user",
    label: "User",
    description: "Standard authenticated member.",
    color: "text-muted-foreground",
    permissions: ["content.create"],
  },
];

export function hasPermission(roles: AppRole[], perm: Permission) {
  return ROLE_REGISTRY.some((r) => roles.includes(r.id) && r.permissions.includes(perm));
}
