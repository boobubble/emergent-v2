import type { User } from "@/lib/chat-types";

/** Picks a fun emoji effect based on the user's role/level/streak. */
export function nameEmoji(user: User): { emoji: string; title: string; anim: string } | null {
  if (!user) return null;
  if (user.isBot) return { emoji: "🤖", title: "Bot", anim: "animate-pulse" };
  if ((user.level ?? 1) >= 30) return { emoji: "👑", title: `Legend · Lv ${user.level}`, anim: "animate-bounce" };
  if ((user.level ?? 1) >= 15) return { emoji: "⭐", title: `Pro · Lv ${user.level}`, anim: "animate-pulse" };
  if ((user.streak ?? 0) >= 7) return { emoji: "🔥", title: `${user.streak}-day streak`, anim: "animate-pulse" };
  if ((user.level ?? 1) >= 5) return { emoji: "✨", title: `Lv ${user.level}`, anim: "animate-pulse" };
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
