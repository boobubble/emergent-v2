import { Lock, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePerk, type PerkKey } from "@/lib/use-subscription";

interface PremiumLockProps {
  perk: PerkKey;
  feature?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a feature. If the current user lacks the required perk, renders an
 * upgrade card instead of the children. While loading, renders nothing to
 * avoid flashing locked UI for premium users.
 */
export function PremiumLock({ perk, feature = "This feature", children, className }: PremiumLockProps) {
  const { allowed, loading } = usePerk(perk);
  if (loading) return null;
  if (allowed) return <>{children}</>;
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 text-center ${className ?? ""}`}>
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/15">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-1 text-base font-bold">{feature} is a premium feature</h3>
      <p className="mb-4 text-sm text-muted-foreground">Upgrade your membership to unlock this and more.</p>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:opacity-90"
      >
        <Sparkles className="h-4 w-4" /> View plans
      </Link>
    </div>
  );
}

export function PremiumBadge({ label = "VIP" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
      <Sparkles className="h-3 w-3" /> {label}
    </span>
  );
}
