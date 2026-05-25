import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/lib/chat-store";
import { EMOJI_EFFECTS, type EmojiEffect } from "@/lib/emoji-data";

type Burst = {
  id: number;
  emoji: string;
  left: number;   // 0-100 %
  delay: number;  // ms
  dur: number;    // ms
  rot: number;    // deg
  size: number;   // rem
  effect: EmojiEffect;
};

let nextId = 1;

/**
 * Telegram-style fullscreen emoji effect.
 * Watches the current channel's last message; when it's a single supported
 * emoji, plays a one-shot animation overlay scoped to its parent container.
 */
export function EmojiEffectLayer({ channelId }: { channelId: string }) {
  const { channelMessages } = useChat();
  const msgs = channelMessages(channelId);
  const last = msgs[msgs.length - 1];
  const lastIdRef = useRef<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!last) return;
    if (lastIdRef.current === null) { lastIdRef.current = last.id; return; }
    if (last.id === lastIdRef.current) return;
    lastIdRef.current = last.id;

    // Skip on small / low-power screens to save CPU + battery
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const text = (last.text || "").trim();
    if (!text) return;
    const eff = pickEffect(text);
    if (!eff) return;

    const particles = makeParticles(eff);
    setBursts(b => [...b, ...particles]);
    const maxLife = Math.max(...particles.map(p => p.delay + p.dur)) + 200;
    const t = setTimeout(() => {
      setBursts(b => b.filter(x => !particles.some(p => p.id === x.id)));
    }, maxLife);
    return () => clearTimeout(t);
  }, [last]);

  const tint = useMemo(() => bursts.find(b => b.effect.bg)?.effect.bg ?? "", [bursts]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-30 overflow-hidden ${tint} transition-colors duration-300`}
    >
      {bursts.map(b => (
        <span
          key={b.id}
          className={animClass(b.effect.kind)}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            top: b.effect.kind === "rain" ? "-10%" : "50%",
            fontSize: `${b.size}rem`,
            transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
            animationDelay: `${b.delay}ms`,
            animationDuration: `${b.dur}ms`,
            willChange: "transform, opacity",
          }}
        >
          {b.emoji}
        </span>
      ))}
      <style>{KEYFRAMES}</style>
    </div>
  );
}

function pickEffect(text: string): EmojiEffect | null {
  if (EMOJI_EFFECTS[text]) return EMOJI_EFFECTS[text];
  // Detect "🔥🔥🔥" style repeats of the same supported emoji
  for (const key of Object.keys(EMOJI_EFFECTS)) {
    if (text === key.repeat(2) || text === key.repeat(3)) return EMOJI_EFFECTS[key];
  }
  return null;
}

function makeParticles(eff: EmojiEffect): Burst[] {
  const count = eff.kind === "rain" ? 28 : eff.kind === "burst" ? 22 : 10;
  const out: Burst[] = [];
  for (let i = 0; i < count; i++) {
    const emoji = eff.burst[i % eff.burst.length];
    out.push({
      id: nextId++,
      emoji,
      left: Math.random() * 100,
      delay: Math.random() * (eff.kind === "rain" ? 900 : 250),
      dur: eff.kind === "rain"
        ? 1800 + Math.random() * 1200
        : eff.kind === "burst" ? 1200 + Math.random() * 600
        : 900,
      rot: (Math.random() - 0.5) * 60,
      size: 1.4 + Math.random() * 1.6,
      effect: eff,
    });
  }
  return out;
}

function animClass(kind: EmojiEffect["kind"]) {
  switch (kind) {
    case "rain":  return "emoji-fx-rain";
    case "burst": return "emoji-fx-burst";
    case "shake": return "emoji-fx-shake";
    case "pulse": return "emoji-fx-pulse";
  }
}

const KEYFRAMES = `
@keyframes emoji-fx-rain-kf {
  0%   { transform: translate(-50%, -50%) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translate(-50%, 700%) rotate(360deg); opacity: 0; }
}
.emoji-fx-rain { animation-name: emoji-fx-rain-kf; animation-timing-function: cubic-bezier(.3,.1,.5,1); animation-fill-mode: forwards; }

@keyframes emoji-fx-burst-kf {
  0%   { transform: translate(-50%, -50%) scale(.2) rotate(0deg); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,-200px))) scale(1.4) rotate(var(--r,360deg)); opacity: 0; }
}
.emoji-fx-burst {
  --dx: calc((var(--rand-x, 0) - .5) * 800px);
  --dy: calc((var(--rand-y, 0) - .8) * 700px);
  --r: calc((var(--rand-r, 0) - .5) * 720deg);
  animation-name: emoji-fx-burst-kf; animation-timing-function: cubic-bezier(.2,.7,.3,1); animation-fill-mode: forwards;
}

@keyframes emoji-fx-shake-kf {
  0%,100% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
  20%     { transform: translate(calc(-50% - 20px), -50%) rotate(-15deg); }
  40%     { transform: translate(calc(-50% + 20px), -50%) rotate(15deg); }
  60%     { transform: translate(calc(-50% - 14px), -50%) rotate(-10deg); }
  80%     { transform: translate(calc(-50% + 14px), -50%) rotate(10deg); }
  100%    { opacity: 0; }
}
.emoji-fx-shake { animation-name: emoji-fx-shake-kf; animation-fill-mode: forwards; }

@keyframes emoji-fx-pulse-kf {
  0%   { transform: translate(-50%, -50%) scale(.3); opacity: 0; }
  40%  { transform: translate(-50%, -50%) scale(2.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
}
.emoji-fx-pulse { animation-name: emoji-fx-pulse-kf; animation-fill-mode: forwards; }
`;
