// Skype-style animated emoticon picker.
// Uses Google's Noto Animated Emoji GIFs (public CDN) as sticker-style GIFs.
import { useState } from "react";

export type Sticker = { name: string; cp: string; label: string };

const STICKERS: { group: string; items: Sticker[] }[] = [
  {
    group: "Classic",
    items: [
      { name: "smile", cp: "1f600", label: "Smile" },
      { name: "laugh", cp: "1f602", label: "Laugh" },
      { name: "rofl", cp: "1f923", label: "ROFL" },
      { name: "wink", cp: "1f609", label: "Wink" },
      { name: "tongue", cp: "1f61b", label: "Tongue" },
      { name: "cool", cp: "1f60e", label: "Cool" },
      { name: "blush", cp: "1f60a", label: "Blush" },
      { name: "love", cp: "1f60d", label: "Love" },
      { name: "kiss", cp: "1f618", label: "Kiss" },
      { name: "wonder", cp: "1f914", label: "Hmm" },
      { name: "shock", cp: "1f632", label: "Shocked" },
      { name: "cry", cp: "1f622", label: "Cry" },
      { name: "bawl", cp: "1f62d", label: "Bawl" },
      { name: "angry", cp: "1f621", label: "Angry" },
      { name: "swear", cp: "1f92c", label: "Swear" },
      { name: "sleepy", cp: "1f634", label: "Sleepy" },
      { name: "sick", cp: "1f922", label: "Sick" },
      { name: "scared", cp: "1f628", label: "Scared" },
      { name: "yum", cp: "1f60b", label: "Yum" },
      { name: "nerd", cp: "1f913", label: "Nerd" },
      { name: "party", cp: "1f973", label: "Party" },
      { name: "pleading", cp: "1f97a", label: "Pleading" },
      { name: "puke", cp: "1f92e", label: "Puke" },
      { name: "skull", cp: "1f480", label: "Skull" },
    ],
  },
  {
    group: "Hearts & Hands",
    items: [
      { name: "heart", cp: "2764_fe0f", label: "Heart" },
      { name: "heartfire", cp: "2764_fe0f_200d_1f525", label: "Heart fire" },
      { name: "brokenheart", cp: "1f494", label: "Broken" },
      { name: "kissheart", cp: "1f63d", label: "Kiss heart" },
      { name: "sparkleheart", cp: "1f496", label: "Sparkle heart" },
      { name: "thumbsup", cp: "1f44d", label: "Thumbs up" },
      { name: "thumbsdown", cp: "1f44e", label: "Thumbs down" },
      { name: "clap", cp: "1f44f", label: "Clap" },
      { name: "wave", cp: "1f44b", label: "Wave" },
      { name: "ok", cp: "1f44c", label: "OK" },
      { name: "pray", cp: "1f64f", label: "Pray" },
      { name: "muscle", cp: "1f4aa", label: "Muscle" },
      { name: "crossed", cp: "1f91e", label: "Crossed fingers" },
      { name: "rockon", cp: "1f918", label: "Rock on" },
      { name: "fist", cp: "270a", label: "Fist" },
      { name: "peace", cp: "270c_fe0f", label: "Peace" },
    ],
  },
  {
    group: "Fun & Party",
    items: [
      { name: "fire", cp: "1f525", label: "Fire" },
      { name: "tada", cp: "1f389", label: "Party" },
      { name: "confetti", cp: "1f38a", label: "Confetti" },
      { name: "100", cp: "1f4af", label: "100" },
      { name: "rocket", cp: "1f680", label: "Rocket" },
      { name: "star", cp: "2b50", label: "Star" },
      { name: "sparkles", cp: "2728", label: "Sparkles" },
      { name: "boom", cp: "1f4a5", label: "Boom" },
      { name: "zap", cp: "26a1", label: "Zap" },
      { name: "rainbow", cp: "1f308", label: "Rainbow" },
      { name: "gift", cp: "1f381", label: "Gift" },
      { name: "cake", cp: "1f382", label: "Cake" },
      { name: "pizza", cp: "1f355", label: "Pizza" },
      { name: "beer", cp: "1f37b", label: "Beer" },
      { name: "coffee", cp: "2615", label: "Coffee" },
      { name: "ball", cp: "26bd", label: "Football" },
    ],
  },
];

export function gifUrlForSticker(cp: string) {
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${cp}/512.gif`;
}

export function AnimatedEmojiPicker({ onPick }: { onPick: (s: Sticker) => void }) {
  const [group, setGroup] = useState(STICKERS[0].group);
  const active = STICKERS.find(g => g.group === group) ?? STICKERS[0];
  return (
    <div className="w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto">
        {STICKERS.map(g => (
          <button
            key={g.group}
            onClick={() => setGroup(g.group)}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${group === g.group ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
          >
            {g.group}
          </button>
        ))}
      </div>
      <div className="max-h-[200px] overflow-y-auto p-1.5">
        <div className="grid grid-cols-6 gap-1">
          {active.items.map(s => (
            <button
              key={s.name}
              onClick={() => onPick(s)}
              title={s.label}
              className="grid h-10 w-10 place-items-center rounded-lg transition-transform hover:scale-110 hover:bg-white/5 active:scale-95"
            >
              <img
                src={gifUrlForSticker(s.cp)}
                alt={s.label}
                loading="lazy"
                className="h-9 w-9 object-contain"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
        Tap to send animated sticker
      </div>
    </div>
  );
}
