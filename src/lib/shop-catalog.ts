export type ShopCategory = "frame" | "username_effect" | "theme" | "emoji_pack" | "badge" | "background";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number; // coins
  preview: string; // emoji or short label
  // category-specific data
  frameRing?: string;          // tailwind ring/border classes
  usernameClass?: string;      // tailwind class for username text
  themeAccent?: string;        // oklch color
  emojis?: string[];
  badgeIcon?: string;          // emoji shown next to name
  backgroundClass?: string;    // tailwind gradient for profile header
}

export const SHOP_ITEMS: ShopItem[] = [
  // ============= Frames (12) =============
  { id: "frame_gold",      category: "frame", name: "Gold Frame",      description: "Shiny gold ring around your avatar.",          price: 500,  preview: "🟡", frameRing: "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background" },
  { id: "frame_silver",    category: "frame", name: "Silver Frame",    description: "Polished silver ring.",                        price: 250,  preview: "⚪", frameRing: "ring-2 ring-slate-300 ring-offset-2 ring-offset-background" },
  { id: "frame_bronze",    category: "frame", name: "Bronze Frame",    description: "Earthy bronze ring.",                          price: 150,  preview: "🟤", frameRing: "ring-2 ring-amber-700 ring-offset-2 ring-offset-background" },
  { id: "frame_neon",      category: "frame", name: "Neon Frame",      description: "Glowing cyan halo.",                           price: 350,  preview: "💠", frameRing: "ring-2 ring-cyan-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(34,211,238,0.6)]" },
  { id: "frame_rose",      category: "frame", name: "Rose Frame",      description: "Soft pink ring.",                              price: 200,  preview: "🌸", frameRing: "ring-2 ring-pink-400 ring-offset-2 ring-offset-background" },
  { id: "frame_violet",    category: "frame", name: "Violet Frame",    description: "Deep purple ring.",                            price: 300,  preview: "🟣", frameRing: "ring-2 ring-violet-500 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(139,92,246,0.5)]" },
  { id: "frame_emerald",   category: "frame", name: "Emerald Frame",   description: "Lush emerald glow.",                           price: 350,  preview: "🟢", frameRing: "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(52,211,153,0.5)]" },
  { id: "frame_crimson",   category: "frame", name: "Crimson Frame",   description: "Bold crimson red.",                            price: 400,  preview: "🔴", frameRing: "ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(239,68,68,0.5)]" },
  { id: "frame_ice",       category: "frame", name: "Ice Frame",       description: "Frosty white-blue halo.",                      price: 500,  preview: "❄️", frameRing: "ring-2 ring-sky-200 ring-offset-2 ring-offset-background shadow-[0_0_14px_rgba(186,230,253,0.8)]" },
  { id: "frame_fire",      category: "frame", name: "Fire Frame",      description: "Burning orange aura.",                         price: 700,  preview: "🔥", frameRing: "ring-2 ring-orange-500 ring-offset-2 ring-offset-background shadow-[0_0_16px_rgba(249,115,22,0.7)]" },
  { id: "frame_legend",    category: "frame", name: "Legend Frame",    description: "Animated rainbow ring.",                       price: 1500, preview: "🌈", frameRing: "ring-[3px] ring-fuchsia-500 ring-offset-2 ring-offset-background shadow-[0_0_18px_rgba(217,70,239,0.7)]" },
  { id: "frame_mythic",    category: "frame", name: "Mythic Frame",    description: "Ultimate prismatic halo.",                     price: 3000, preview: "👑", frameRing: "ring-[3px] ring-amber-300 ring-offset-2 ring-offset-background shadow-[0_0_24px_rgba(252,211,77,0.9)] animate-pulse" },
  { id: "frame_sakura",    category: "frame", name: "Sakura Frame",    description: "Cherry blossom petal ring.",                   price: 280,  preview: "🌸", frameRing: "ring-2 ring-pink-300 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(249,168,212,0.6)]" },
  { id: "frame_obsidian",  category: "frame", name: "Obsidian Frame",  description: "Sleek black volcanic ring.",                   price: 450,  preview: "⚫", frameRing: "ring-2 ring-zinc-900 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(24,24,27,0.8)]" },
  { id: "frame_pearl",     category: "frame", name: "Pearl Frame",     description: "Iridescent pearl shimmer.",                    price: 550,  preview: "🤍", frameRing: "ring-2 ring-stone-200 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(231,229,228,0.8)]" },
  { id: "frame_lava",      category: "frame", name: "Lava Frame",      description: "Molten lava glow.",                            price: 650,  preview: "🌋", frameRing: "ring-2 ring-red-600 ring-offset-2 ring-offset-background shadow-[0_0_14px_rgba(220,38,38,0.7)]" },
  { id: "frame_aurora",    category: "frame", name: "Aurora Frame",    description: "Shifting northern lights ring.",               price: 900,  preview: "🌌", frameRing: "ring-[3px] ring-teal-400 ring-offset-2 ring-offset-background shadow-[0_0_18px_rgba(45,212,191,0.7)]" },
  { id: "frame_galaxy",    category: "frame", name: "Galaxy Frame",    description: "Stardust violet halo.",                        price: 850,  preview: "🪐", frameRing: "ring-[3px] ring-indigo-500 ring-offset-2 ring-offset-background shadow-[0_0_16px_rgba(99,102,241,0.7)]" },
  { id: "frame_thunder",   category: "frame", name: "Thunder Frame",   description: "Electric yellow bolt ring.",                   price: 600,  preview: "⚡", frameRing: "ring-2 ring-yellow-300 ring-offset-2 ring-offset-background shadow-[0_0_14px_rgba(253,224,71,0.8)]" },
  { id: "frame_jade",      category: "frame", name: "Jade Frame",      description: "Ancient jade green ring.",                     price: 320,  preview: "🟩", frameRing: "ring-2 ring-green-600 ring-offset-2 ring-offset-background shadow-[0_0_10px_rgba(22,163,74,0.5)]" },
  { id: "frame_amethyst",  category: "frame", name: "Amethyst Frame",  description: "Royal amethyst purple.",                       price: 420,  preview: "💜", frameRing: "ring-2 ring-purple-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(192,132,252,0.6)]" },
  { id: "frame_sapphire",  category: "frame", name: "Sapphire Frame",  description: "Brilliant sapphire blue.",                     price: 480,  preview: "🔷", frameRing: "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(59,130,246,0.6)]" },
  { id: "frame_ruby",      category: "frame", name: "Ruby Frame",      description: "Precious ruby red.",                           price: 480,  preview: "♦️", frameRing: "ring-2 ring-rose-600 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(225,29,72,0.6)]" },
  { id: "frame_void",      category: "frame", name: "Void Frame",      description: "Dark matter ring with rim glow.",              price: 1200, preview: "🕳️", frameRing: "ring-[3px] ring-zinc-700 ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(168,85,247,0.6)]" },

  // ============= Username effects (10) =============
  { id: "name_gradient",   category: "username_effect", name: "Gradient Name",  description: "Purple→pink gradient text.",          price: 250,  preview: "🎨", usernameClass: "bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent" },
  { id: "name_gold",       category: "username_effect", name: "Gold Name",      description: "Pure gold username.",                  price: 400,  preview: "✨", usernameClass: "text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]" },
  { id: "name_neon",       category: "username_effect", name: "Neon Name",      description: "Cyan glow text.",                      price: 300,  preview: "⚡", usernameClass: "text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]" },
  { id: "name_fire",       category: "username_effect", name: "Fire Name",      description: "Red-orange flame gradient.",           price: 500,  preview: "🔥", usernameClass: "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent" },
  { id: "name_ocean",      category: "username_effect", name: "Ocean Name",     description: "Blue wave gradient.",                  price: 350,  preview: "🌊", usernameClass: "bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent" },
  { id: "name_emerald",    category: "username_effect", name: "Emerald Name",   description: "Glowing emerald text.",                price: 350,  preview: "💚", usernameClass: "text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.7)]" },
  { id: "name_galaxy",     category: "username_effect", name: "Galaxy Name",    description: "Purple-blue cosmic shimmer.",          price: 600,  preview: "🌌", usernameClass: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" },
  { id: "name_shadow",     category: "username_effect", name: "Shadow Name",    description: "Mysterious dark glow.",                price: 450,  preview: "🌑", usernameClass: "text-zinc-800 dark:text-zinc-100 drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]" },
  { id: "name_legend",     category: "username_effect", name: "Legend Name",    description: "Animated rainbow text.",               price: 1200, preview: "🌟", usernameClass: "bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent animate-pulse" },
  { id: "name_mythic",     category: "username_effect", name: "Mythic Name",    description: "Sparkling royal gold.",                price: 2500, preview: "👑", usernameClass: "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent animate-pulse drop-shadow-[0_0_6px_rgba(252,211,77,0.9)]" },

  // ============= Themes (8) =============
  { id: "theme_ocean",     category: "theme", name: "Ocean Theme",     description: "Deep blue accent across the app.",             price: 600,  preview: "🌊", themeAccent: "oklch(0.62 0.18 230)" },
  { id: "theme_sunset",    category: "theme", name: "Sunset Theme",    description: "Warm orange accent.",                          price: 600,  preview: "🌇", themeAccent: "oklch(0.7 0.18 50)" },
  { id: "theme_forest",    category: "theme", name: "Forest Theme",    description: "Emerald accent.",                              price: 600,  preview: "🌲", themeAccent: "oklch(0.62 0.15 155)" },
  { id: "theme_rose",      category: "theme", name: "Rose Theme",      description: "Romantic pink accent.",                        price: 600,  preview: "🌹", themeAccent: "oklch(0.68 0.18 0)" },
  { id: "theme_lavender",  category: "theme", name: "Lavender Theme",  description: "Soft purple accent.",                          price: 600,  preview: "💜", themeAccent: "oklch(0.65 0.16 295)" },
  { id: "theme_mint",      category: "theme", name: "Mint Theme",      description: "Fresh mint accent.",                           price: 700,  preview: "🍃", themeAccent: "oklch(0.78 0.12 165)" },
  { id: "theme_midnight",  category: "theme", name: "Midnight Theme",  description: "Deep indigo accent.",                          price: 800,  preview: "🌃", themeAccent: "oklch(0.45 0.18 270)" },
  { id: "theme_gold",      category: "theme", name: "Gold Theme",      description: "Luxurious gold accent.",                       price: 1000, preview: "🏆", themeAccent: "oklch(0.75 0.15 85)" },

  // ============= Emoji packs (8) =============
  { id: "pack_party",      category: "emoji_pack", name: "Party Pack",      description: "🎉🥳🎊🪅🎁 extra reaction emojis.",     price: 300,  preview: "🎉", emojis: ["🎉","🥳","🎊","🪅","🎁"] },
  { id: "pack_animals",    category: "emoji_pack", name: "Critters Pack",   description: "🐱🐶🐻🦊🐼 cute reactions.",            price: 300,  preview: "🐱", emojis: ["🐱","🐶","🐻","🦊","🐼"] },
  { id: "pack_space",      category: "emoji_pack", name: "Cosmic Pack",     description: "🚀🌌👽🪐🌠 out-of-this-world.",        price: 450,  preview: "🚀", emojis: ["🚀","🌌","👽","🪐","🌠"] },
  { id: "pack_food",       category: "emoji_pack", name: "Foodie Pack",     description: "🍕🍔🍣🍩🌮 yummy reactions.",            price: 350,  preview: "🍕", emojis: ["🍕","🍔","🍣","🍩","🌮"] },
  { id: "pack_sports",     category: "emoji_pack", name: "Sports Pack",     description: "⚽🏀🏈⚾🎾 athletic vibes.",             price: 300,  preview: "⚽", emojis: ["⚽","🏀","🏈","⚾","🎾"] },
  { id: "pack_nature",     category: "emoji_pack", name: "Nature Pack",     description: "🌸🌺🌻🌷🍀 floral & lucky.",            price: 400,  preview: "🌸", emojis: ["🌸","🌺","🌻","🌷","🍀"] },
  { id: "pack_magic",      category: "emoji_pack", name: "Magic Pack",      description: "🔮✨🧙🪄🌟 mystical reactions.",         price: 600,  preview: "🔮", emojis: ["🔮","✨","🧙","🪄","🌟"] },
  { id: "pack_legend",     category: "emoji_pack", name: "Legendary Pack",  description: "💎👑🏆⚜️🎖️ elite reactions.",          price: 1500, preview: "💎", emojis: ["💎","👑","🏆","⚜️","🎖️"] },

  // ============= Badges (8) — shown next to your name =============
  { id: "badge_verified",  category: "badge", name: "Verified Badge",  description: "Blue check next to your name.",                price: 800,  preview: "✅", badgeIcon: "✅" },
  { id: "badge_star",      category: "badge", name: "Star Badge",      description: "Gold star achievement.",                       price: 400,  preview: "⭐", badgeIcon: "⭐" },
  { id: "badge_heart",     category: "badge", name: "Heart Badge",     description: "Show some love.",                              price: 250,  preview: "❤️", badgeIcon: "❤️" },
  { id: "badge_rocket",    category: "badge", name: "Rocket Badge",    description: "For the early adopters.",                      price: 500,  preview: "🚀", badgeIcon: "🚀" },
  { id: "badge_crown",     category: "badge", name: "Crown Badge",     description: "Royal status.",                                price: 1000, preview: "👑", badgeIcon: "👑" },
  { id: "badge_diamond",   category: "badge", name: "Diamond Badge",   description: "Premium member.",                              price: 1500, preview: "💎", badgeIcon: "💎" },
  { id: "badge_fire",      category: "badge", name: "Fire Badge",      description: "On a hot streak.",                             price: 600,  preview: "🔥", badgeIcon: "🔥" },
  { id: "badge_trophy",    category: "badge", name: "Trophy Badge",    description: "Champion of the feed.",                        price: 2000, preview: "🏆", badgeIcon: "🏆" },

  // ============= Profile backgrounds (6) =============
  { id: "bg_aurora",       category: "background", name: "Aurora",        description: "Northern lights gradient header.",          price: 800,  preview: "🌌", backgroundClass: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" },
  { id: "bg_sunset",       category: "background", name: "Sunset Sky",    description: "Warm sunset gradient header.",              price: 700,  preview: "🌅", backgroundClass: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" },
  { id: "bg_ocean",        category: "background", name: "Ocean Wave",    description: "Cool ocean gradient header.",               price: 700,  preview: "🌊", backgroundClass: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600" },
  { id: "bg_forest",       category: "background", name: "Forest Mist",   description: "Lush green gradient header.",               price: 700,  preview: "🌲", backgroundClass: "bg-gradient-to-br from-emerald-400 via-teal-500 to-green-700" },
  { id: "bg_cherry",       category: "background", name: "Cherry Bloom",  description: "Soft sakura pink header.",                  price: 600,  preview: "🌸", backgroundClass: "bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500" },
  { id: "bg_galaxy",       category: "background", name: "Galaxy",        description: "Deep space gradient header.",               price: 1200, preview: "✨", backgroundClass: "bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" },
];

export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));
export const SHOP_BY_CATEGORY: Record<ShopCategory, ShopItem[]> = {
  frame: SHOP_ITEMS.filter(i => i.category === "frame"),
  username_effect: SHOP_ITEMS.filter(i => i.category === "username_effect"),
  theme: SHOP_ITEMS.filter(i => i.category === "theme"),
  emoji_pack: SHOP_ITEMS.filter(i => i.category === "emoji_pack"),
  badge: SHOP_ITEMS.filter(i => i.category === "badge"),
  background: SHOP_ITEMS.filter(i => i.category === "background"),
};

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  frame: "Profile Frames",
  username_effect: "Username Effects",
  theme: "Themes",
  emoji_pack: "Emoji Packs",
  badge: "Badges",
  background: "Backgrounds",
};
