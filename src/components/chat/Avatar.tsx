import type { User } from "@/lib/chat-types";

export function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  const initials = user.name.slice(0, 2).toUpperCase();
  return (
    <div
      className="relative flex items-center justify-center rounded-full font-semibold text-background shrink-0"
      style={{
        width: size,
        height: size,
        background: user.avatarColor,
        fontSize: size * 0.4,
        boxShadow: "var(--shadow-glow)",
      }}
    >
      {initials}
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          background:
            user.status === "online" ? "var(--color-success)" :
            user.status === "away" ? "var(--color-warning)" : "var(--color-muted-foreground)",
        }}
      />
    </div>
  );
}