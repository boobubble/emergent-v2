// Discovery Widgets — Feed Module Promotion System.
//
// Reusable schema for compact promotional cards injected into the Feed.
// Persisted under app_settings.discovery_widgets.

export type DiscoveryWidgetKey =
  | "hall_of_fame"
  | "poetry_hub"
  | "feedback"
  | "battle_hub"
  | "live_arena"
  | "competitions"
  | "leaderboard";

export interface DiscoveryWidgetItem {
  key: DiscoveryWidgetKey;
  enabled: boolean;
  title: string;
  description: string;
  ctaText: string;
  icon: string; // emoji
  to: string;
  /** Higher = more likely to be picked. 1..10 */
  priority: number;
  /** Min posts before this widget can appear again in one session. */
  frequency: number;
}

export interface DiscoveryWidgetsConfig {
  enabled: boolean;
  /** Show a discovery widget after every N posts. */
  insertEvery: number;
  items: DiscoveryWidgetItem[];
}

export const DISCOVERY_WIDGETS_DEFAULTS: DiscoveryWidgetsConfig = {
  enabled: true,
  insertEvery: 6,
  items: [
    {
      key: "hall_of_fame",
      enabled: true,
      title: "Hall of Fame",
      description: "See the greatest champions in platform history.",
      ctaText: "View Hall of Fame",
      icon: "🏆",
      to: "/hall-of-fame",
      priority: 6,
      frequency: 8,
    },
    {
      key: "poetry_hub",
      enabled: true,
      title: "Poetry Hub",
      description: "Discover trending poems and writers.",
      ctaText: "Explore Poetry Hub",
      icon: "✍️",
      to: "/poetry",
      priority: 7,
      frequency: 6,
    },
    {
      key: "feedback",
      enabled: true,
      title: "Suggestions & Feedback",
      description: "Help improve the platform.",
      ctaText: "Give Feedback",
      icon: "💡",
      to: "/feedback",
      priority: 4,
      frequency: 12,
    },
    {
      key: "battle_hub",
      enabled: true,
      title: "Battle Hub",
      description: "Join live competitions happening now.",
      ctaText: "Explore Battles",
      icon: "⚔️",
      to: "/battle-hub",
      priority: 7,
      frequency: 6,
    },
    {
      key: "live_arena",
      enabled: true,
      title: "Live Arena",
      description: "Watch live competition rankings.",
      ctaText: "Open Live Arena",
      icon: "🎉",
      to: "/competitions",
      priority: 5,
      frequency: 8,
    },
    {
      key: "competitions",
      enabled: true,
      title: "Competitions",
      description: "Find contests you can enter today.",
      ctaText: "Browse Competitions",
      icon: "🥇",
      to: "/competitions",
      priority: 6,
      frequency: 8,
    },
    {
      key: "leaderboard",
      enabled: true,
      title: "Leaderboard",
      description: "See the top creators this week.",
      ctaText: "View Leaderboard",
      icon: "👑",
      to: "/leaderboard",
      priority: 6,
      frequency: 8,
    },
  ],
};

export function mergeDiscoveryWidgetsConfig(raw: unknown): DiscoveryWidgetsConfig {
  const r = (raw ?? {}) as Partial<DiscoveryWidgetsConfig>;
  const byKey = new Map<string, DiscoveryWidgetItem>();
  for (const d of DISCOVERY_WIDGETS_DEFAULTS.items) byKey.set(d.key, { ...d });
  for (const it of r.items ?? []) {
    const cur = byKey.get(it.key as string);
    if (cur) byKey.set(it.key as string, { ...cur, ...it });
  }
  return {
    enabled: r.enabled ?? DISCOVERY_WIDGETS_DEFAULTS.enabled,
    insertEvery: Math.max(2, Number(r.insertEvery) || DISCOVERY_WIDGETS_DEFAULTS.insertEvery),
    items: Array.from(byKey.values()),
  };
}
