import type { User } from "@/lib/chat-types";

function borderColor(user: User): string {
  if (user.isGuest) return "oklch(0.6 0 0)"; // gray
  if (user.gender === "male") return "oklch(0.65 0.18 250)"; // blue
  if (user.gender === "female") return "oklch(0.72 0.18 350)"; // pink
  return "oklch(0.6 0 0)"; // gray (bot/other/unknown)
}

export function Avatar({ user, size = 36, square = true }: { user: User; size?: number; square?: boolean }) {
  const initials = user.name.slice(0, 2).toUpperCase();
  const hasImg = !!user.avatarUrl;
  const ring = borderColor(user);
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden font-bold text-background ${
        square ? "rounded-2xl" : "rounded-full"
      }`}
      style={{
        width: size,
        height: size,
        background: user.avatarColor,
        fontSize: size * 0.38,
        boxShadow: `0 0 0 2px ${ring}, 0 4px 12px oklch(0 0 0 / 0.4)`,
      }}
    >
      {hasImg ? (
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card"
        style={{
          width: Math.max(10, size * 0.28),
          height: Math.max(10, size * 0.28),
          background:
            user.status === "online"
              ? "var(--color-success)"
              : user.status === "away"
              ? "var(--color-warning)"
              : "oklch(0.4 0 0)",
          boxShadow: user.status === "online" ? "var(--shadow-glow-sm)" : "none",
        }}
      />
    </div>
  );
}
