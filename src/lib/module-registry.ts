// Centralized module registry. Lists currently shipped modules and future
// ones so the admin Modules page + handoff docs read from one source.
// Existing feature behaviour is NOT changed by this registry.

import { FUTURE_MODULES, type FutureModuleStatus } from "./future-modules";

export type CurrentModuleKey =
  | "chatrooms" | "feed" | "friends" | "profiles"
  | "notifications" | "rewards" | "games" | "seo_pages" | "economy";

export interface ModuleDescriptor {
  key: string;
  label: string;
  status: "stable" | FutureModuleStatus;
  category: string;
  description: string;
  /** Setting key on app_settings.modules. Absent for always-on core. */
  flag?: string;
}

export const CURRENT_MODULES: ModuleDescriptor[] = [
  { key: "chatrooms",     label: "Chatrooms",     status: "stable", category: "Community",  description: "Public and private real-time chat rooms.", flag: "modules.chatrooms" },
  { key: "feed",          label: "Social Feed",   status: "stable", category: "Community",  description: "Posts, comments, reactions.",              flag: "modules.feed" },
  { key: "friends",       label: "Friends",       status: "stable", category: "Community",  description: "Friend requests + DMs.",                    flag: "modules.friends" },
  { key: "profiles",      label: "Profiles",      status: "stable", category: "Community",  description: "Public user profiles.",                     flag: "modules.profiles" },
  { key: "notifications", label: "Notifications", status: "stable", category: "Community",  description: "Friend / mention / engagement alerts.",     flag: "modules.notifications" },
  { key: "rewards",       label: "Rewards",       status: "stable", category: "Economy",    description: "XP, coins, levels, streaks.",               flag: "modules.rewards" },
  { key: "games",         label: "Games",         status: "stable", category: "Engagement", description: "Mini-games and bot games.",                 flag: "modules.games" },
  { key: "seo_pages",     label: "SEO Pages",     status: "stable", category: "Marketing",  description: "Custom landing & CMS pages.",               flag: "modules.seo_pages" },
  { key: "economy",       label: "Economy",       status: "stable", category: "Economy",    description: "Centralized economy tuning.",               flag: "modules.economy" },
];

export const ALL_MODULES: ModuleDescriptor[] = [
  ...CURRENT_MODULES,
  ...FUTURE_MODULES.map((m): ModuleDescriptor => ({
    key: m.key,
    label: m.label,
    status: m.status,
    category: m.category,
    description: m.description,
    flag: `future_flags.${m.key}`,
  })),
];
