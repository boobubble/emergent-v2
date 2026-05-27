export type ShopCategory = "frame" | "username_effect" | "theme" | "emoji_pack";

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
}

export const SHOP_ITEMS: ShopItem[] = [
  // Frames
  { id: "frame_gold",    category: "frame", name: "Gold Frame",    description: "Shiny gold ring around your avatar.",   price: 500,  preview: "🟡", frameRing: "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background" },
  { id: "frame_neon",    category: "frame", name: "Neon Frame",    description: "Glowing cyan halo.",                    price: 350,  preview: "💠", frameRing: "ring-2 ring-cyan-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(34,211,238,0.6)]" },
  { id: "frame_rose",    category: "frame", name: "Rose Frame",    description: "Soft pink ring.",                       price: 200,  preview: "🌸", frameRing: "ring-2 ring-pink-400 ring-offset-2 ring-offset-background" },
  { id: "frame_legend",  category: "frame", name: "Legend Frame",  description: "Animated rainbow ring.",                price: 1500, preview: "🌈", frameRing: "ring-[3px] ring-fuchsia-500 ring-offset-2 ring-offset-background shadow-[0_0_18px_rgba(217,70,239,0.7)]" },

  // Username effects
  { id: "name_gradient", category: "username_effect", name: "Gradient Name",  description: "Purple→pink gradient text.", price: 250, preview: "🎨", usernameClass: "bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent" },
  { id: "name_gold",     category: "username_effect", name: "Gold Name",      description: "Pure gold username.",        price: 400, preview: "✨", usernameClass: "text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]" },
  { id: "name_neon",     category: "username_effect", name: "Neon Name",      description: "Cyan glow text.",            price: 300, preview: "⚡", usernameClass: "text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]" },
  { id: "name_legend",   category: "username_effect", name: "Legend Name",    description: "Animated rainbow text.",     price: 1200, preview: "🌟", usernameClass: "bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent animate-pulse" },

  // Themes (accent only — applied as inline CSS var on the feed page)
  { id: "theme_ocean",   category: "theme", name: "Ocean Theme",   description: "Deep blue accent across the app.",      price: 600,  preview: "🌊", themeAccent: "oklch(0.62 0.18 230)" },
  { id: "theme_sunset",  category: "theme", name: "Sunset Theme",  description: "Warm orange accent.",                   price: 600,  preview: "🌇", themeAccent: "oklch(0.7 0.18 50)" },
  { id: "theme_forest",  category: "theme", name: "Forest Theme",  description: "Emerald accent.",                       price: 600,  preview: "🌲", themeAccent: "oklch(0.62 0.15 155)" },

  // Emoji packs
  { id: "pack_party",    category: "emoji_pack", name: "Party Pack", description: "🎉🥳🎊🪅🎁 extra reaction emojis.", price: 300, preview: "🎉", emojis: ["🎉","🥳","🎊","🪅","🎁"] },
  { id: "pack_animals",  category: "emoji_pack", name: "Critters Pack", description: "🐱🐶🐻🦊🐼 cute reactions.",    price: 300, preview: "🐱", emojis: ["🐱","🐶","🐻","🦊","🐼"] },
  { id: "pack_space",    category: "emoji_pack", name: "Cosmic Pack",  description: "🚀🌌👽🪐🌠 out-of-this-world.",  price: 450, preview: "🚀", emojis: ["🚀","🌌","👽","🪐","🌠"] },
];

export const SHOP_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));
export const SHOP_BY_CATEGORY: Record<ShopCategory, ShopItem[]> = {
  frame: SHOP_ITEMS.filter(i => i.category === "frame"),
  username_effect: SHOP_ITEMS.filter(i => i.category === "username_effect"),
  theme: SHOP_ITEMS.filter(i => i.category === "theme"),
  emoji_pack: SHOP_ITEMS.filter(i => i.category === "emoji_pack"),
};

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  frame: "Profile Frames",
  username_effect: "Username Effects",
  theme: "Themes",
  emoji_pack: "Emoji Packs",
};
