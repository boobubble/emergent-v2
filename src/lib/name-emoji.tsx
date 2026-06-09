import type { User } from "@/lib/chat-types";
import { flagFromCode } from "@/lib/country-flag";

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

/** Small country flag emoji shown next to a user's name when the owner has it enabled. */
export function CountryFlag({ user, className = "" }: { user: User; className?: string }) {
  if (!user || user.isBot) return null;
  if (user.showCountryFlag === false) return null;
  const flag = flagFromCode(user.countryCode);
  if (!flag) return null;
  return (
    <span
      title={user.countryCode ?? ""}
      aria-label={`Country: ${user.countryCode ?? ""}`}
      className={`inline-block text-[0.95em] leading-none ${className}`}
    >
      {flag}
    </span>
  );
}

/** Tiny "Guest" or "User" pill shown next to a name, gated by the owner's toggle. */
export function UserKindBadge({ user, className = "" }: { user: User; className?: string }) {
  if (!user || user.isBot) return null;
  if (user.showGuestBadge === false) return null;
  if (user.isGuest) {
    return (
      <span
        title="Guest account"
        className={`inline-flex items-center rounded-sm bg-muted px-1 py-px text-[8px] font-bold uppercase tracking-wider text-muted-foreground ${className}`}
      >
        Guest
      </span>
    );
  }
  return (
    <span
      title="Registered user"
      className={`inline-flex items-center rounded-sm bg-primary/15 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-primary ${className}`}
    >
      User
    </span>
  );
}

/** Convenience: emoji badge + country flag + user kind in one go. */
export function NameAdornments({ user }: { user: User }) {
  return (
    <>
      <NameEmojiBadge user={user} />
      <CountryFlag user={user} />
      <UserKindBadge user={user} />
    </>
  );
}
