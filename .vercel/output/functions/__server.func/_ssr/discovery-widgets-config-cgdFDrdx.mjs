const DISCOVERY_WIDGETS_DEFAULTS = {
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
      frequency: 8
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
      frequency: 6
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
      frequency: 12
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
      frequency: 6
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
      frequency: 8
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
      frequency: 8
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
      frequency: 8
    }
  ]
};
function mergeDiscoveryWidgetsConfig(raw) {
  const r = raw ?? {};
  const byKey = /* @__PURE__ */ new Map();
  for (const d of DISCOVERY_WIDGETS_DEFAULTS.items) byKey.set(d.key, { ...d });
  for (const it of r.items ?? []) {
    const cur = byKey.get(it.key);
    if (cur) byKey.set(it.key, { ...cur, ...it });
  }
  return {
    enabled: r.enabled ?? DISCOVERY_WIDGETS_DEFAULTS.enabled,
    insertEvery: Math.max(2, Number(r.insertEvery) || DISCOVERY_WIDGETS_DEFAULTS.insertEvery),
    items: Array.from(byKey.values())
  };
}
export {
  mergeDiscoveryWidgetsConfig as m
};
