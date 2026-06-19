import { memo } from "react";
import { Avatar } from "@/components/chat/Avatar";
import type { User } from "@/lib/chat-types";
import { useCosmetics } from "@/lib/cosmetics-store";
import { rankFor } from "@/lib/ranks";
import { cn } from "@/lib/utils";

/** Avatar with equipped cosmetic frame overlay. Lightweight: a single absolute div + ring. */
export const FrameAvatar = memo(function FrameAvatar({
  user,
  size = 36,
  square = true,
  showFrame = true,
}: {
  user: User;
  size?: number;
  square?: boolean;
  showFrame?: boolean;
}) {
  const cos = useCosmetics(user.id);
  const frame = showFrame ? cos.frame : undefined;
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <Avatar user={user} size={size} square={square} />
      {frame && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-[2px] rounded-2xl",
            square ? "rounded-2xl" : "rounded-full",
            frame.frameRing,
          )}
        />
      )}
    </div>
  );
});

/** Compact rank+level pill for use beside usernames. */
export function RankChip({ level, compact = false }: { level: number; compact?: boolean }) {
  // Hide the "Newcomer" rank label globally — only show named ranks after it.
  if (!level || level <= 1) return null;
  const r = rankFor(level);
  const showRankTitle = r.title !== "Newcomer";
  return (
    <span
      title={showRankTitle ? `${r.title} · Level ${level}` : `Level ${level}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tracking-wide",
        compact ? "px-1.5 py-[1px] text-[9px]" : "px-2 py-0.5 text-[10px]",
        r.chip,
      )}
    >
      <span className="opacity-80">Lv {level}</span>
      {showRankTitle && (
        <>
          <span className="opacity-50">·</span>
          <span className="uppercase">{r.title}</span>
        </>
      )}
    </span>
  );
}

/** Username with equipped cosmetic effect (gradient/glow). Falls back to plain text. */
export function CosmeticName({
  userId,
  name,
  className,
}: {
  userId: string;
  name: string;
  className?: string;
}) {
  const cos = useCosmetics(userId);
  const effect = cos.usernameEffect?.usernameClass;
  return (
    <span className={cn(effect, className)}>{name}</span>
  );
}
