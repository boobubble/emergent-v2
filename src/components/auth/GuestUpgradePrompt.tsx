import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useGuestAccess } from "@/lib/guest-flags";

/**
 * Lightweight, dismissible banner shown to guest users encouraging them to
 * register. Place it once near the top of authenticated layouts (e.g. inside
 * the feed or chat shell). Respects the admin "Show upgrade prompt" toggle.
 */
export function GuestUpgradePrompt({ onUpgrade }: { onUpgrade?: () => void }) {
  const { user, logout } = useAuth();
  const { isGuest, enabled, showUpgradePrompt, cfg } = useGuestAccess();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || !enabled || !showUpgradePrompt || dismissed) return null;

  async function handleUpgrade() {
    if (onUpgrade) return onUpgrade();
    // Default: sign out the guest so the AuthScreen with Create-account flow shows.
    // The preserveOnUpgrade flag is exposed via cfg for downstream wiring.
    try {
      if (cfg.preserveOnUpgrade && user) {
        sessionStorage.setItem("guest-upgrade-from", user.username);
      }
    } catch { /* ignore */ }
    await logout();
  }

  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm">
      <Sparkles className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">You're browsing as a guest</p>
        <p className="truncate text-xs text-muted-foreground">
          Create a free account to chat, post, earn coins and unlock everything.
        </p>
      </div>
      <button
        onClick={handleUpgrade}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
      >
        Upgrade
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
