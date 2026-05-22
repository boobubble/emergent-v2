import type { User } from "@/lib/chat-types";

export function Avatar({ user, size = 36, square = true }: { user: User; size?: number; square?: boolean }) {
  const initials = user.name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center font-bold text-background ${
        square ? "rounded-2xl" : "rounded-full"
      }`}
      style={{
        width: size,
        height: size,
        background: user.avatarColor,
        fontSize: size * 0.38,
        boxShadow: "0 4px 12px oklch(0 0 0 / 0.4)",
      }}
    >
      {initials}
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
