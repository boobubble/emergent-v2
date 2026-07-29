import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as Avatar } from "./Avatar-CAZashHQ.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { S as SHOP_BY_ID } from "./shop-catalog-QoXq-K4P.mjs";
import { m as cn } from "./router-CYWPFaDK.mjs";
import { flagFromCode } from "./country-flag-Bsg6nfgK.mjs";
import { N as Search } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
const RANKS = [
  { title: "Newcomer", minLevel: 1, color: "text-slate-500", chip: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
  { title: "Regular", minLevel: 5, color: "text-sky-500", chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { title: "Veteran", minLevel: 10, color: "text-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { title: "Elite", minLevel: 20, color: "text-amber-500", chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { title: "Legend", minLevel: 35, color: "text-fuchsia-500", chip: "bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-fuchsia-700 dark:text-fuchsia-200" }
];
function rankFor(level) {
  let r = RANKS[0];
  for (const x of RANKS) if (level >= x.minLevel) r = x;
  return r;
}
function levelProgress(xp) {
  const level = Math.floor(xp / 50) + 1;
  const intoLevel = xp - (level - 1) * 50;
  const toNext = 50;
  return { level, intoLevel, toNext, pct: Math.round(intoLevel / toNext * 100) };
}
const earnChatMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120),
  isReply: booleanType().optional()
}).parse(i)).handler(createSsrRpc("a639e45b91383ff82bab3881df24afaa98bc9560ff474732891930ab4107ee1b"));
const earnFeedReaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("abe1c0279ef5da0d6f6138d08181e1422ea8727e3292f80a1c803e22a441811a"));
const earnFeedComment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("9f18232bbb08b775b60b953dfc2447877f4f8d9d3f173936d3847606b4ce9fbd"));
const earnFeedShare = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("d893da156a04cbdd607e7ad3e4eaa543fd0c0accceed7c33c4b2b206399cda9e"));
const earnFeedPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("10c9d440792118c2a76226f18a20bd067aec0eecdb6a7f8a6d9aee4555d82332"));
const highlightMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  messageId: stringType().uuid(),
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(createSsrRpc("b48b26c01f41999b9aa90fdc2f40daa68da72f6a3387726cac6a96d04dce00a6"));
const boostPost = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  postId: stringType().uuid()
}).parse(i)).handler(createSsrRpc("710e1e17447cff94ba27cfaade62b404fef584bf40546cc989032b0e4376eba7"));
const getMyRoomLoyalty = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(createSsrRpc("88abf8b0cbf398ce2f72bca43ef88be7b00ae226cbf629c91438b77abebc73c6"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((i) => objectType({
  channelId: stringType().min(1).max(120)
}).parse(i)).handler(createSsrRpc("5395365cd47eae723ca6c7a5c890ba53011c3b0c44191c682428a56efb4954f0"));
const cache = /* @__PURE__ */ new Map();
const pending = /* @__PURE__ */ new Set();
const listeners = /* @__PURE__ */ new Set();
let flushTimer = null;
function emit() {
  for (const l of listeners) l();
}
async function flush() {
  flushTimer = null;
  const ids = Array.from(pending);
  pending.clear();
  if (ids.length === 0) return;
  for (const id of ids) if (!cache.has(id)) cache.set(id, {});
  const { data } = await supabase.from("user_inventory").select("user_id, item_id, category, equipped").in("user_id", ids).eq("equipped", true);
  if (data) {
    for (const row of data) {
      const item = SHOP_BY_ID[row.item_id];
      if (!item) continue;
      const entry = cache.get(row.user_id) ?? {};
      if (item.category === "frame") entry.frame = item;
      else if (item.category === "username_effect") entry.usernameEffect = item;
      else if (item.category === "theme") entry.themeAccent = item.themeAccent;
      cache.set(row.user_id, entry);
    }
  }
  emit();
}
function schedule(id) {
  if (cache.has(id)) return;
  pending.add(id);
  if (flushTimer == null) flushTimer = setTimeout(flush, 40);
}
function setLocalEquip(userId, item, equipped) {
  const entry = { ...cache.get(userId) ?? {} };
  const key = item.category === "frame" ? "frame" : item.category === "username_effect" ? "usernameEffect" : null;
  if (!key) return;
  if (equipped) entry[key] = item;
  else if (entry[key]?.id === item.id) delete entry[key];
  cache.set(userId, entry);
  emit();
}
function useCosmetics(userId) {
  const [, force] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!userId) return;
    schedule(userId);
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [userId]);
  return userId && cache.get(userId) || {};
}
const FrameAvatar = reactExports.memo(function FrameAvatar2({
  user,
  size = 36,
  square = true,
  showFrame = true
}) {
  const cos = useCosmetics(user.id);
  const frame = showFrame ? cos.frame : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-flex shrink-0", style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { user, size, square }),
    frame && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        "aria-hidden": true,
        className: cn(
          "pointer-events-none absolute -inset-[2px] rounded-2xl",
          square ? "rounded-2xl" : "rounded-full",
          frame.frameRing
        )
      }
    )
  ] });
});
function RankChip({ level, compact = false }) {
  if (!level || level <= 1) return null;
  const r = rankFor(level);
  const showRankTitle = r.minLevel > 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      title: showRankTitle ? `${r.title} · Level ${level}` : `Level ${level}`,
      className: cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tracking-wide",
        compact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]",
        r.chip
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-80", children: [
          "Lv ",
          level
        ] }),
        showRankTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: r.title })
        ] })
      ]
    }
  );
}
function CosmeticName({
  userId,
  name,
  className
}) {
  const cos = useCosmetics(userId);
  const effect = cos.usernameEffect?.usernameClass;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(effect, className), children: name });
}
function nameEmoji(user) {
  if (!user) return null;
  if (user.isBot) return { emoji: "🤖", title: "Bot", anim: "animate-pulse" };
  const lv = user.level ?? 1;
  const streak = user.streak ?? 0;
  if (lv >= 100) return { emoji: "🌌", title: `Mythic · Lv ${lv}`, anim: "animate-bounce" };
  if (lv >= 75) return { emoji: "🏆", title: `Champion · Lv ${lv}`, anim: "animate-bounce" };
  if (lv >= 50) return { emoji: "💎", title: `Elite · Lv ${lv}`, anim: "animate-pulse" };
  if (lv >= 30) return { emoji: "👑", title: `Legend · Lv ${lv}`, anim: "animate-bounce" };
  if (lv >= 20) return { emoji: "🚀", title: `Veteran · Lv ${lv}`, anim: "animate-pulse" };
  if (lv >= 15) return { emoji: "⭐", title: `Pro · Lv ${lv}`, anim: "animate-pulse" };
  if (lv >= 10) return { emoji: "⚡", title: `Rising · Lv ${lv}`, anim: "animate-pulse" };
  if (streak >= 30) return { emoji: "🌋", title: `${streak}-day streak`, anim: "animate-bounce" };
  if (streak >= 14) return { emoji: "☄️", title: `${streak}-day streak`, anim: "animate-pulse" };
  if (streak >= 7) return { emoji: "🔥", title: `${streak}-day streak`, anim: "animate-pulse" };
  if (lv >= 5) return { emoji: "✨", title: `Lv ${lv}`, anim: "animate-pulse" };
  if (lv >= 3) return { emoji: "🍀", title: `Lv ${lv}`, anim: "" };
  if (user.isGuest) return { emoji: "👋", title: "Guest", anim: "" };
  return { emoji: "🌱", title: "New here", anim: "" };
}
function NameEmojiBadge({ user }) {
  const e = nameEmoji(user);
  if (!e) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      title: e.title,
      "aria-label": e.title,
      className: `inline-block text-sm leading-none ${e.anim}`,
      children: e.emoji
    }
  );
}
function CountryFlag({ user, className = "" }) {
  if (!user || user.isBot) return null;
  if (user.showCountryFlag === false) return null;
  const flag = flagFromCode(user.countryCode);
  if (!flag) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      title: user.countryCode ?? "",
      "aria-label": `Country: ${user.countryCode ?? ""}`,
      className: `inline-block text-[0.95em] leading-none ${className}`,
      children: flag
    }
  );
}
function UserKindBadge({ user, className = "" }) {
  if (!user || user.isBot) return null;
  if (user.showGuestBadge === false) return null;
  if (user.isGuest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        title: "Guest account",
        className: `inline-flex items-center rounded-sm bg-muted px-1 py-px text-[8px] font-bold uppercase tracking-wider text-muted-foreground ${className}`,
        children: "Guest"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      title: "Registered user",
      className: `inline-flex items-center rounded-sm bg-primary/15 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-primary ${className}`,
      children: "User"
    }
  );
}
function NameAdornments({ user }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NameEmojiBadge, { user }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CountryFlag, { user }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserKindBadge, { user })
  ] });
}
const EMOJI_CATEGORIES = [
  {
    id: "recent",
    label: "Recent",
    icon: "🕘",
    emojis: []
    // populated at runtime
  },
  {
    id: "smileys",
    label: "Smileys & People",
    icon: "😀",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "🥲",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🫡",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "😮‍💨",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "😵‍💫",
      "🤯",
      "🤠",
      "🥳",
      "🥸",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "🫤",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "🥹",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
      "☠️",
      "💩",
      "🤡",
      "👹",
      "👺",
      "👻",
      "👽",
      "👾",
      "🤖",
      "🎃",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "🫱",
      "🫲",
      "🫳",
      "🫴",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🫰",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "🫶",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
      "🦾",
      "🦵",
      "🦿",
      "🦶",
      "👂",
      "🦻",
      "👃",
      "🧠",
      "🫀",
      "🫁",
      "🦷",
      "🦴",
      "👀",
      "👁️",
      "👅",
      "👄",
      "🫦",
      "💋",
      "💘",
      "💝",
      "💖",
      "💗",
      "💓",
      "💞",
      "💕",
      "💟",
      "❣️",
      "💔",
      "❤️‍🔥",
      "❤️‍🩹",
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🤎",
      "🖤",
      "🤍"
    ]
  },
  {
    id: "animals",
    label: "Animals & Nature",
    icon: "🐻",
    emojis: []
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍔",
    emojis: [
      "🍏",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🫑",
      "🌽",
      "🥕",
      "🫒",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🫘",
      "🥐",
      "🥯",
      "🍞",
      "🥖",
      "🥨",
      "🧀",
      "🥚",
      "🍳",
      "🧈",
      "🥞",
      "🧇",
      "🥓",
      "🥩",
      "🍗",
      "🍖",
      "🦴",
      "🌭",
      "🍔",
      "🍟",
      "🍕",
      "🥪",
      "🥙",
      "🧆",
      "🌮",
      "🌯",
      "🫔",
      "🥗",
      "🥘",
      "🫕",
      "🥫",
      "🍝",
      "🍜",
      "🍲",
      "🍛",
      "🍣",
      "🍱",
      "🥟",
      "🦪",
      "🍤",
      "🍙",
      "🍚",
      "🍘",
      "🍥",
      "🥠",
      "🥮",
      "🍢",
      "🍡",
      "🍧",
      "🍨",
      "🍦",
      "🥧",
      "🧁",
      "🍰",
      "🎂",
      "🍮",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍩",
      "🍪",
      "🌰",
      "🥜",
      "🍯",
      "🥛",
      "🍼",
      "🫖",
      "☕",
      "🍵",
      "🧃",
      "🥤",
      "🧋",
      "🍶",
      "🍺",
      "🍻",
      "🥂",
      "🍷",
      "🥃",
      "🍸",
      "🍹",
      "🧉",
      "🍾",
      "🧊",
      "🥄",
      "🍴",
      "🍽️",
      "🥣",
      "🥡",
      "🥢",
      "🧂"
    ]
  },
  {
    id: "activity",
    label: "Activity & Sports",
    icon: "⚽",
    emojis: []
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: "🚀",
    emojis: []
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: []
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "💯",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
      "⛎",
      "♈",
      "♉",
      "♊",
      "♋",
      "♌",
      "♍",
      "♎",
      "♏",
      "♐",
      "♑",
      "♒",
      "♓",
      "🆔",
      "⚛️",
      "🉑",
      "☢️",
      "☣️",
      "📴",
      "📳",
      "🈶",
      "🈚",
      "🈸",
      "🈺",
      "🈷️",
      "✴️",
      "🆚",
      "💮",
      "🉐",
      "㊙️",
      "㊗️",
      "🈴",
      "🈵",
      "🈹",
      "🈲",
      "🅰️",
      "🅱️",
      "🆎",
      "🆑",
      "🅾️",
      "🆘",
      "❌",
      "⭕",
      "🛑",
      "⛔",
      "📛",
      "🚫",
      "💯",
      "💢",
      "♨️",
      "🚷",
      "🚯",
      "🚳",
      "🚱",
      "🔞",
      "📵",
      "🚭",
      "❗",
      "❕",
      "❓",
      "❔",
      "‼️",
      "⁉️",
      "🔅",
      "🔆",
      "〽️",
      "⚠️",
      "🚸",
      "🔱",
      "⚜️",
      "🔰",
      "♻️",
      "✅",
      "🈯",
      "💹",
      "❇️",
      "✳️",
      "❎",
      "🌐",
      "💠",
      "Ⓜ️",
      "🌀",
      "💤",
      "🏧",
      "🚾",
      "♿",
      "🅿️",
      "🛗",
      "🈳",
      "🈂️",
      "🛂",
      "🛃",
      "🛄",
      "🛅",
      "🛜",
      "🚹",
      "🚺",
      "🚼",
      "⚧",
      "🚻",
      "🚮",
      "🎦",
      "📶",
      "🈁",
      "🔣",
      "ℹ️",
      "🔤",
      "🔡",
      "🔠",
      "🆖",
      "🆗",
      "🆙",
      "🆒",
      "🆕",
      "🆓",
      "0️⃣",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
      "🔢",
      "#️⃣",
      "*️⃣",
      "⏏️",
      "▶️",
      "⏸️",
      "⏯️",
      "⏹️",
      "⏺️",
      "⏭️",
      "⏮️",
      "⏩",
      "⏪",
      "⏫",
      "⏬",
      "◀️",
      "🔼",
      "🔽",
      "➡️",
      "⬅️",
      "⬆️",
      "⬇️",
      "↗️",
      "↘️",
      "↙️",
      "↖️",
      "↕️",
      "↔️",
      "↪️",
      "↩️",
      "⤴️",
      "⤵️",
      "🔀",
      "🔁",
      "🔂",
      "🔄",
      "🔃",
      "🎵",
      "🎶",
      "➕",
      "➖",
      "➗",
      "✖️",
      "🟰",
      "💲",
      "💱",
      "™️",
      "©️",
      "®️",
      "〰️",
      "➰",
      "➿",
      "🔚",
      "🔙",
      "🔛",
      "🔝",
      "🔜",
      "✔️",
      "☑️",
      "🔘",
      "🔴",
      "🟠",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫",
      "⚪",
      "🟤",
      "🔺",
      "🔻",
      "🔸",
      "🔹",
      "🔶",
      "🔷",
      "🔳",
      "🔲",
      "▪️",
      "▫️",
      "◾",
      "◽",
      "◼️",
      "◻️",
      "🟥",
      "🟧",
      "🟨",
      "🟩",
      "🟦",
      "🟪",
      "⬛",
      "⬜",
      "🟫",
      "🔈",
      "🔇",
      "🔉",
      "🔊",
      "🔔",
      "🔕",
      "📣",
      "📢"
    ]
  },
  {
    id: "flags",
    label: "Flags",
    icon: "🏳️",
    emojis: []
  }
];
const EMOJI_EFFECTS = {
  "❤️": { kind: "rain", burst: ["❤️", "💕", "💖", "💗"], bg: "bg-pink-500/5" },
  "💖": { kind: "rain", burst: ["💖", "💞", "💕", "✨"], bg: "bg-pink-500/5" },
  "💗": { kind: "rain", burst: ["💗", "💖", "💕", "💘"], bg: "bg-pink-500/5" },
  "💕": { kind: "rain", burst: ["💕", "❤️", "💖", "💗"], bg: "bg-pink-500/5" },
  "😍": { kind: "burst", burst: ["😍", "💘", "❤️", "✨"], bg: "bg-pink-500/5" },
  "🥰": { kind: "rain", burst: ["🥰", "💕", "💖", "💞"], bg: "bg-pink-500/5" },
  "😘": { kind: "rain", burst: ["😘", "💋", "💕", "❤️"], bg: "bg-pink-500/5" },
  "💋": { kind: "rain", burst: ["💋", "💄", "❤️"], bg: "bg-pink-500/5" },
  "🎉": { kind: "burst", burst: ["🎉", "🎊", "✨", "🎈", "🥳"], bg: "bg-yellow-400/5" },
  "🎊": { kind: "burst", burst: ["🎊", "🎉", "✨", "🎈"], bg: "bg-yellow-400/5" },
  "🥳": { kind: "burst", burst: ["🥳", "🎉", "🎊", "🎈"], bg: "bg-yellow-400/5" },
  "🎂": { kind: "rain", burst: ["🎂", "🧁", "🍰", "🎉"], bg: "bg-pink-300/5" },
  "🎈": { kind: "rain", burst: ["🎈", "🎉", "🎊", "✨"] },
  "🔥": { kind: "burst", burst: ["🔥", "💥", "✨"], bg: "bg-orange-500/5" },
  "💥": { kind: "burst", burst: ["💥", "🔥", "✨"], bg: "bg-orange-500/5" },
  "⚡": { kind: "shake", burst: ["⚡", "✨"], bg: "bg-yellow-300/5" },
  "✨": { kind: "rain", burst: ["✨", "⭐", "🌟", "💫"] },
  "⭐": { kind: "rain", burst: ["⭐", "✨", "🌟"] },
  "🌟": { kind: "rain", burst: ["🌟", "✨", "⭐", "💫"] },
  "💫": { kind: "rain", burst: ["💫", "✨", "⭐"] },
  "👍": { kind: "burst", burst: ["👍", "✨", "💯"] },
  "👏": { kind: "burst", burst: ["👏", "✨", "🎉"] },
  "🙌": { kind: "burst", burst: ["🙌", "✨", "🎉"] },
  "💪": { kind: "shake", burst: ["💪", "🔥", "✨"] },
  "🤩": { kind: "burst", burst: ["🤩", "✨", "🌟", "⭐"] },
  "🥹": { kind: "rain", burst: ["🥹", "💕", "✨"] },
  "😂": { kind: "burst", burst: ["😂", "🤣", "😆"] },
  "🤣": { kind: "burst", burst: ["🤣", "😂", "😆"] },
  "😭": { kind: "rain", burst: ["😭", "💧", "💦"], bg: "bg-blue-400/5" },
  "💧": { kind: "rain", burst: ["💧", "💦", "🌧️"], bg: "bg-blue-400/5" },
  "💯": { kind: "burst", burst: ["💯", "🔥", "✨"], bg: "bg-red-500/5" },
  "🌹": { kind: "rain", burst: ["🌹", "🌺", "💐", "🌷"], bg: "bg-rose-500/5" },
  "🌸": { kind: "rain", burst: ["🌸", "🌷", "🌺", "✨"], bg: "bg-pink-300/5" },
  "❄️": { kind: "rain", burst: ["❄️", "🌨️", "☃️"], bg: "bg-sky-300/5" },
  "☃️": { kind: "rain", burst: ["☃️", "❄️", "🌨️"], bg: "bg-sky-300/5" },
  "🎄": { kind: "rain", burst: ["🎄", "🎁", "✨", "❄️"] },
  "🎃": { kind: "burst", burst: ["🎃", "👻", "🦇"], bg: "bg-orange-500/5" },
  "👻": { kind: "rain", burst: ["👻", "🎃", "🦇"] },
  "💀": { kind: "shake", burst: ["💀", "☠️"] },
  "🤡": { kind: "burst", burst: ["🤡", "🎈", "🎪"] },
  "💩": { kind: "burst", burst: ["💩"] },
  "🚀": { kind: "burst", burst: ["🚀", "✨", "💫", "⭐"] },
  "👀": { kind: "pulse", burst: ["👀"] },
  "🌈": { kind: "rain", burst: ["🌈", "✨", "☀️"] },
  "☀️": { kind: "pulse", burst: ["☀️", "✨", "🌞"], bg: "bg-yellow-300/5" }
};
const RECENT_KEY = "emoji-recent-v1";
const MAX_RECENT = 24;
function getRecentEmojis() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}
function pushRecentEmoji(e) {
  if (typeof window === "undefined") return;
  const cur = getRecentEmojis().filter((x) => x !== e);
  cur.unshift(e);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, MAX_RECENT)));
  } catch {
  }
}
function EmojiPicker({ onPick }) {
  const [cat, setCat] = reactExports.useState("smileys");
  const [q, setQ] = reactExports.useState("");
  const [recent, setRecent] = reactExports.useState([]);
  reactExports.useEffect(() => {
    setRecent(getRecentEmojis());
  }, []);
  const categories = reactExports.useMemo(() => {
    return EMOJI_CATEGORIES.map((c) => c.id === "recent" ? { ...c, emojis: recent } : c);
  }, [recent]);
  const active = categories.find((c) => c.id === cat) ?? categories[1];
  const visible = reactExports.useMemo(() => {
    if (!q.trim()) return active.emojis;
    const all = categories.flatMap((c) => c.emojis);
    return Array.from(new Set(all));
  }, [q, active, categories]);
  function pick(e) {
    pushRecentEmoji(e);
    setRecent(getRecentEmojis());
    onPick(e);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5 border-b border-border px-1.5 py-1 overflow-x-auto", children: categories.map((c) => {
      if (c.id === "recent" && recent.length === 0) return null;
      if (c.id !== "recent" && c.emojis.length === 0) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setCat(c.id);
            setQ("");
          },
          className: `shrink-0 grid h-6 w-6 place-items-center rounded-md text-sm transition-colors ${cat === c.id && !q ? "bg-primary/15" : "hover:bg-white/5"}`,
          title: c.label,
          "aria-label": c.label,
          children: c.icon
        },
        c.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3 w-3 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder: "Search",
          className: "flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/70"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[180px] overflow-y-auto p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-9 gap-0.5", children: [
      visible.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => pick(e),
          className: "grid h-6 w-6 place-items-center rounded-md text-base transition-transform hover:scale-110 hover:bg-white/5 active:scale-95",
          title: e,
          children: e
        },
        `${e}-${i}`
      )),
      visible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-9 py-4 text-center text-[11px] text-muted-foreground", children: "No emoji" })
    ] }) })
  ] });
}
export {
  CosmeticName as C,
  EmojiPicker as E,
  FrameAvatar as F,
  NameEmojiBadge as N,
  RankChip as R,
  NameAdornments as a,
  EMOJI_EFFECTS as b,
  earnFeedReaction as c,
  earnFeedComment as d,
  earnChatMessage as e,
  earnFeedShare as f,
  getMyRoomLoyalty as g,
  highlightMessage as h,
  boostPost as i,
  earnFeedPost as j,
  levelProgress as l,
  rankFor as r,
  setLocalEquip as s
};
