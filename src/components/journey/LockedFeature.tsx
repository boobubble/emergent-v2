import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useProgressionConfig, useUnlock } from "@/lib/progression-flags";
import { XP_PER_LEVEL, unlockReason, type UnlockKey } from "@/lib/journey";
import { resolveUnlock } from "@/lib/progression-config";

interface Props {
  unlockKey: UnlockKey;
  title: string;
  description?: string;
  /** Optional icon shown next to the title. */
  icon?: React.ReactNode;
  /** When unlocked, render children instead of the lock card. */
  children?: React.ReactNode;
  /** Compact variant — inline lock badge instead of full card. */
  compact?: boolean;
}

/**
 * Reusable "why-locked / how-to-unlock" component. Wrap any advanced
 * action; when the current user hasn't reached the required level, we
 * render a friendly explanation with progress + a link to the Journey
 * page. Existing feature code is untouched — call sites choose to opt in.
 */
export function LockedFeature({ unlockKey, title, description, icon, children, compact }: Props) {
  const { allowed, requiredLevel, userLevel } = useUnlock(unlockKey);
  const cfg = useProgressionConfig();
  const { state } = useChat();
  const xp = state.me?.xp ?? 0;

  if (allowed) return <>{children}</>;

  const requiredXp = (requiredLevel - 1) * XP_PER_LEVEL;
  const xpRemaining = Math.max(0, requiredXp - xp);
  const pct = requiredXp <= 0 ? 100 : Math.min(100, Math.round((xp / requiredXp) * 100));
  const reason = unlockReason({
    def: { key: unlockKey } as never,
    requiredLevel,
    enabled: resolveUnlock(unlockKey, cfg).enabled,
    unlocked: false,
    xpRemaining,
    progressPct: pct,
  });

  if (compact) {
    return (
      <Link
        to="/journey"
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        title={`${title} — ${reason}`}
      >
        <Lock className="h-3 w-3" /> Lv {requiredLevel}
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/40 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon ?? <Lock className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-muted-foreground">{description ?? reason}</div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Level {userLevel} → Level {requiredLevel}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              {xpRemaining > 0 ? <>Only <span className="font-semibold text-foreground">{xpRemaining} XP</span> remaining.</> : "Almost there!"}
            </div>
          </div>
          <Link
            to="/journey"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
          >
            <Sparkles className="h-3 w-3" /> View Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
