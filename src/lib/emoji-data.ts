// Skype/Telegram-inspired emoji set + fullscreen effect map.

export type EmojiCategory = {
  id: string;
  label: string;
  icon: string;
  emojis: string[];
};

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "recent",
    label: "Recent",
    icon: "🕘",
    emojis: [], // populated at runtime
  },
  {
    id: "smileys",
    label: "Smileys & People",
    icon: "😀",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩",
      "😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡",
      "🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","😮‍💨","🤥","😌","😔","😪","🤤","😴",
      "😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","😵‍💫","🤯","🤠","🥳","🥸","😎",
      "🤓","🧐","😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨",
      "😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬",
      "😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","🎃","😺","😸","😹",
      "😻","😼","😽","🙀","😿","😾",
      "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟",
      "🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌",
      "🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦵","🦿","🦶","👂","🦻","👃",
      "🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","🫦","💋","💘","💝","💖","💗","💓",
      "💞","💕","💟","❣️","💔","❤️‍🔥","❤️‍🩹","❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍",
    ],
  },
  {
    id: "animals",
    label: "Animals & Nature",
    icon: "🐻",
    emojis: [],
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍔",
    emojis: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥",
      "🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠",
      "🫘","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖",
      "🦴","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝",
      "🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡",
      "🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜",
      "🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸",
      "🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢","🧂",
    ],
  },
  {
    id: "activity",
    label: "Activity & Sports",
    icon: "⚽",
    emojis: [],
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: "🚀",
    emojis: [],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: [],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "💯",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖",
      "💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈",
      "♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️",
      "📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹",
      "🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️",
      "🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️",
      "⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀",
      "💤","🏧","🚾","♿","🅿️","🛗","🈳","🈂️","🛂","🛃","🛄","🛅","🛜","🚹","🚺","🚼",
      "⚧","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕",
      "🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","#️⃣","*️⃣","⏏️",
      "▶️","⏸️","⏯️","⏹️","⏺️","⏭️","⏮️","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️",
      "⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄",
      "🔃","🎵","🎶","➕","➖","➗","✖️","🟰","💲","💱","™️","©️","®️","〰️","➰","➿",
      "🔚","🔙","🔛","🔝","🔜","✔️","☑️","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪",
      "🟤","🔺","🔻","🔸","🔹","🔶","🔷","🔳","🔲","▪️","▫️","◾","◽","◼️","◻️","🟥",
      "🟧","🟨","🟩","🟦","🟪","⬛","⬜","🟫","🔈","🔇","🔉","🔊","🔔","🔕","📣","📢",
    ],
  },
  {
    id: "flags",
    label: "Flags",
    icon: "🏳️",
    emojis: [],
  },
];

/**
 * Fullscreen "emoji effects" — match Telegram's behaviour where sending a
 * single emoji triggers a celebratory animation overlay.
 *
 * effect: which animation preset to play.
 * burst: characters that rain across the screen.
 */
export type EmojiEffectKind = "rain" | "burst" | "shake" | "pulse";

export type EmojiEffect = {
  kind: EmojiEffectKind;
  burst: string[];
  bg?: string; // tailwind classes for backdrop tint
};

export const EMOJI_EFFECTS: Record<string, EmojiEffect> = {
  "❤️": { kind: "rain",  burst: ["❤️","💕","💖","💗"], bg: "bg-pink-500/5" },
  "💖": { kind: "rain",  burst: ["💖","💞","💕","✨"], bg: "bg-pink-500/5" },
  "💗": { kind: "rain",  burst: ["💗","💖","💕","💘"], bg: "bg-pink-500/5" },
  "💕": { kind: "rain",  burst: ["💕","❤️","💖","💗"], bg: "bg-pink-500/5" },
  "😍": { kind: "burst", burst: ["😍","💘","❤️","✨"], bg: "bg-pink-500/5" },
  "🥰": { kind: "rain",  burst: ["🥰","💕","💖","💞"], bg: "bg-pink-500/5" },
  "😘": { kind: "rain",  burst: ["😘","💋","💕","❤️"], bg: "bg-pink-500/5" },
  "💋": { kind: "rain",  burst: ["💋","💄","❤️"], bg: "bg-pink-500/5" },

  "🎉": { kind: "burst", burst: ["🎉","🎊","✨","🎈","🥳"], bg: "bg-yellow-400/5" },
  "🎊": { kind: "burst", burst: ["🎊","🎉","✨","🎈"], bg: "bg-yellow-400/5" },
  "🥳": { kind: "burst", burst: ["🥳","🎉","🎊","🎈"], bg: "bg-yellow-400/5" },
  "🎂": { kind: "rain",  burst: ["🎂","🧁","🍰","🎉"], bg: "bg-pink-300/5" },
  "🎈": { kind: "rain",  burst: ["🎈","🎉","🎊","✨"] },

  "🔥": { kind: "burst", burst: ["🔥","💥","✨"], bg: "bg-orange-500/5" },
  "💥": { kind: "burst", burst: ["💥","🔥","✨"], bg: "bg-orange-500/5" },
  "⚡": { kind: "shake", burst: ["⚡","✨"], bg: "bg-yellow-300/5" },
  "✨": { kind: "rain",  burst: ["✨","⭐","🌟","💫"] },
  "⭐": { kind: "rain",  burst: ["⭐","✨","🌟"] },
  "🌟": { kind: "rain",  burst: ["🌟","✨","⭐","💫"] },
  "💫": { kind: "rain",  burst: ["💫","✨","⭐"] },

  "👍": { kind: "burst", burst: ["👍","✨","💯"] },
  "👏": { kind: "burst", burst: ["👏","✨","🎉"] },
  "🙌": { kind: "burst", burst: ["🙌","✨","🎉"] },
  "💪": { kind: "shake", burst: ["💪","🔥","✨"] },
  "🤩": { kind: "burst", burst: ["🤩","✨","🌟","⭐"] },
  "🥹": { kind: "rain",  burst: ["🥹","💕","✨"] },
  "😂": { kind: "burst", burst: ["😂","🤣","😆"] },
  "🤣": { kind: "burst", burst: ["🤣","😂","😆"] },
  "😭": { kind: "rain",  burst: ["😭","💧","💦"], bg: "bg-blue-400/5" },
  "💧": { kind: "rain",  burst: ["💧","💦","🌧️"], bg: "bg-blue-400/5" },
  "💯": { kind: "burst", burst: ["💯","🔥","✨"], bg: "bg-red-500/5" },

  "🌹": { kind: "rain",  burst: ["🌹","🌺","💐","🌷"], bg: "bg-rose-500/5" },
  "🌸": { kind: "rain",  burst: ["🌸","🌷","🌺","✨"], bg: "bg-pink-300/5" },
  "❄️": { kind: "rain",  burst: ["❄️","🌨️","☃️"], bg: "bg-sky-300/5" },
  "☃️": { kind: "rain",  burst: ["☃️","❄️","🌨️"], bg: "bg-sky-300/5" },
  "🎄": { kind: "rain",  burst: ["🎄","🎁","✨","❄️"] },
  "🎃": { kind: "burst", burst: ["🎃","👻","🦇"], bg: "bg-orange-500/5" },
  "👻": { kind: "rain",  burst: ["👻","🎃","🦇"] },

  "💀": { kind: "shake", burst: ["💀","☠️"] },
  "🤡": { kind: "burst", burst: ["🤡","🎈","🎪"] },
  "💩": { kind: "burst", burst: ["💩"] },
  "🚀": { kind: "burst", burst: ["🚀","✨","💫","⭐"] },
  "👀": { kind: "pulse", burst: ["👀"] },
  "🌈": { kind: "rain",  burst: ["🌈","✨","☀️"] },
  "☀️": { kind: "pulse", burst: ["☀️","✨","🌞"], bg: "bg-yellow-300/5" },
};

const ZWJ = "\u200d";
const VS16 = "\ufe0f";

/** True if text is exactly one supported emoji (possibly with ZWJ/VS16). */
export function pureEmojiKey(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  // Strip variation selectors for matching but keep canonical key
  if (EMOJI_EFFECTS[t]) return t;
  const noVs = t.replace(new RegExp(VS16, "g"), "");
  for (const key of Object.keys(EMOJI_EFFECTS)) {
    if (key.replace(new RegExp(VS16, "g"), "") === noVs) return key;
  }
  // Reject if obviously not just an emoji (contains letters/digits/spaces)
  if (/[\p{L}\p{N}\s]/u.test(t)) return null;
  // Heuristic: short grapheme-only string — no effect, but still "emoji-only"
  return null;
}

const RECENT_KEY = "emoji-recent-v1";
const MAX_RECENT = 24;

export function getRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
export function pushRecentEmoji(e: string) {
  if (typeof window === "undefined") return;
  const cur = getRecentEmojis().filter(x => x !== e);
  cur.unshift(e);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, MAX_RECENT))); } catch {}
}
