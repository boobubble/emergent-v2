import { a2 as Gift, cd as Bomb, ce as HeartHandshake, bg as TrendingUp, ca as Battery, cf as Store, cg as Shirt, ch as Frame, ci as Type, U as Users, cj as MicVocal, ck as BookImage, O as Trophy, cl as CalendarDays, aB as Crown, b2 as Rocket, cm as HandCoins, a as Sparkles } from "../_libs/lucide-react.mjs";
const FUTURE_MODULES = [
  { key: "coin_gifting", label: "Coin Gifting", description: "Send coins to other users with optional message.", icon: Gift, category: "economy", status: "planned", adminRoute: "/admin/upcoming/coin-gifting", plannedTables: ["coin_gifts"] },
  { key: "coin_bombs", label: "Coin Bombs", description: "Drop coin bombs in rooms — first to grab wins shares.", icon: Bomb, category: "engagement", status: "planned", adminRoute: "/admin/upcoming/coin-bombs", plannedTables: ["coin_bombs", "coin_bomb_claims"] },
  { key: "creator_tipping", label: "Creator Tipping", description: "Tip posts and creators in coins or fiat.", icon: HeartHandshake, category: "economy", status: "planned", adminRoute: "/admin/upcoming/creator-tipping", plannedTables: ["creator_tips"] },
  { key: "momentum", label: "Momentum System", description: "Rolling activity score that decays over time.", icon: TrendingUp, category: "engagement", status: "planned", adminRoute: "/admin/upcoming/momentum", plannedTables: ["user_momentum"] },
  { key: "energy", label: "Energy System", description: "Spendable energy that regenerates — gates actions.", icon: Battery, category: "engagement", status: "planned", adminRoute: "/admin/upcoming/energy", plannedTables: ["user_energy", "energy_transactions"] },
  { key: "marketplace", label: "Marketplace", description: "User-to-user listings for digital goods.", icon: Store, category: "commerce", status: "planned", adminRoute: "/admin/upcoming/marketplace", plannedTables: ["market_listings", "market_orders"] },
  { key: "cosmetics_shop", label: "Cosmetics Shop", description: "Buy cosmetic items with coins.", icon: Shirt, category: "commerce", status: "planned", adminRoute: "/admin/upcoming/cosmetics-shop", plannedTables: ["shop_products", "shop_purchases"] },
  { key: "avatar_frames", label: "Avatar Frames", description: "Decorative borders around profile avatars.", icon: Frame, category: "commerce", status: "planned", adminRoute: "/admin/upcoming/avatar-frames", plannedTables: ["avatar_frames"], dependsOn: ["cosmetics_shop"] },
  { key: "username_effects", label: "Username Effects", description: "Animated/colored username styling.", icon: Type, category: "commerce", status: "planned", adminRoute: "/admin/upcoming/username-effects", plannedTables: ["username_effects"], dependsOn: ["cosmetics_shop"] },
  { key: "clans", label: "Clans / Groups", description: "Persistent user-led groups with shared XP.", icon: Users, category: "social", status: "planned", adminRoute: "/admin/upcoming/clans", plannedTables: ["clans", "clan_members"] },
  { key: "voice_rooms", label: "Voice Rooms", description: "Realtime voice channels inside chatrooms.", icon: MicVocal, category: "social", status: "planned", adminRoute: "/admin/upcoming/voice-rooms", plannedTables: ["voice_rooms", "voice_participants"] },
  { key: "stories", label: "Stories", description: "Ephemeral 24h media posts.", icon: BookImage, category: "social", status: "planned", adminRoute: "/admin/upcoming/stories", plannedTables: ["stories", "story_views"] },
  { key: "tournaments", label: "Tournaments", description: "Bracket competitions for games.", icon: Trophy, category: "engagement", status: "planned", adminRoute: "/admin/upcoming/tournaments", plannedTables: ["tournaments", "tournament_entries", "tournament_matches"] },
  { key: "seasonal_events", label: "Seasonal Events", description: "Time-limited events with rewards & themes.", icon: CalendarDays, category: "engagement", status: "planned", adminRoute: "/admin/upcoming/seasonal-events", plannedTables: ["seasonal_events", "event_progress"] },
  { key: "premium", label: "Premium Memberships", description: "Paid subscriptions with perks.", icon: Crown, category: "premium", status: "planned", adminRoute: "/admin/upcoming/premium", plannedTables: ["premium_plans", "premium_subscriptions"] },
  { key: "room_boosts", label: "Room Boosts", description: "Boost a chatroom to increase visibility.", icon: Rocket, category: "commerce", status: "planned", adminRoute: "/admin/upcoming/room-boosts", plannedTables: ["room_boosts"] },
  { key: "creator_support", label: "Creator Support", description: "Recurring support / monthly tips for creators.", icon: HandCoins, category: "economy", status: "planned", adminRoute: "/admin/upcoming/creator-support", plannedTables: ["creator_support_subscriptions"], dependsOn: ["creator_tipping"] },
  { key: "ai_features", label: "AI Features", description: "AI assistants, generators and moderation helpers.", icon: Sparkles, category: "ai", status: "planned", adminRoute: "/admin/upcoming/ai-features", plannedTables: ["ai_jobs"] }
];
const FUTURE_FLAG_DEFAULTS = Object.fromEntries(
  FUTURE_MODULES.map((m) => [m.key, false])
);
function getFutureModule(key) {
  return FUTURE_MODULES.find((m) => m.key === key);
}
export {
  FUTURE_FLAG_DEFAULTS as F,
  FUTURE_MODULES as a,
  getFutureModule as g
};
