import type { User } from "@/lib/chat-types";

/** Picks a fun emoji effect based on the user's role/level/streak. */
export function nameEmoji(user: User): { emoji: string; title: string; anim: string } | null {
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

export function NameEmojiBadge({ user }: { user: User }) {
  const e = nameEmoji(user);
  if (!e) return null;
  return (
    <span
      title={e.title}
      aria-label={e.title}
      className={`inline-block text-sm leading-none ${e.anim}`}
    >
      {e.emoji}
    </span>
  );
}
