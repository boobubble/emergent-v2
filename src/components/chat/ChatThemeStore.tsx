import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Check, Lock, Clock, Palette, AlertCircle } from "lucide-react";
import {
  listChatThemes,
  listMyChatUnlocks,
  unlockChatTheme,
  activateChatTheme,
  type ChatThemeRow,
  type UserChatThemeRow,
  type ChatThemeKey,
} from "@/lib/chat-themes";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeTheme: ChatThemeKey;
  onThemeChange: () => void;
}

function friendlyError(raw: string, ctx: { price?: number; balance?: number } = {}) {
  const msg = (raw || "").toLowerCase();
  if (msg.includes("not enough coins")) {
    const need = ctx.price != null && ctx.balance != null ? Math.max(ctx.price - ctx.balance, 0) : null;
    return need != null
      ? `You need ${need.toLocaleString()} more coins to unlock this theme.`
      : "You don't have enough coins for this theme.";
  }
  if (msg.includes("not signed in")) return "Please sign in to unlock themes.";
  if (msg.includes("theme not available")) return "This theme is no longer available.";
  if (msg.includes("theme not unlocked")) return "You haven't unlocked this theme yet.";
  if (msg.includes("profile not found")) return "Your profile couldn't be loaded. Try refreshing.";
  if (msg.includes("forbidden")) return "You don't have permission to do that.";
  if (msg.includes("network") || msg.includes("fetch")) return "Network error — check your connection and try again.";
  return raw || "Something went wrong. Please try again.";
}

export function ChatThemeStore({ open, onOpenChange, activeTheme, onThemeChange }: Props) {
  const { user } = useAuth();
  const [themes, setThemes] = useState<ChatThemeRow[]>([]);
  const [unlocks, setUnlocks] = useState<UserChatThemeRow[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmTheme, setConfirmTheme] = useState<ChatThemeRow | null>(null);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [t, u, c] = await Promise.all([
        listChatThemes(),
        listMyChatUnlocks(user.id),
        (supabase as any).rpc("my_coin_balance"),
      ]);
      setThemes(t);
      setUnlocks(u);
      setCoins(typeof c.data === "number" ? c.data : 0);
    } catch (e: any) {
      toast.error(friendlyError(e?.message ?? "Failed to load themes"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const unlockMap = useMemo(() => {
    const m = new Map<string, UserChatThemeRow>();
    for (const u of unlocks) m.set(u.theme_key, u);
    return m;
  }, [unlocks]);

  const isUnlocked = (t: ChatThemeRow) => {
    if (t.is_default) return true;
    const u = unlockMap.get(t.theme_key);
    if (!u) return false;
    if (!u.expires_at) return true;
    return new Date(u.expires_at).getTime() > Date.now();
  };

  const doUnlock = async (t: ChatThemeRow) => {
    setBusy(t.theme_key);
    try {
      await unlockChatTheme(t.theme_key);
      const remaining = Math.max(coins - t.price_coins, 0);
      toast.success(`Unlocked ${t.name}`, {
        description: `${t.price_coins.toLocaleString()} coins spent · ${remaining.toLocaleString()} left · activating…`,
      });
      // Auto-activate the just-purchased theme; live event syncs every mounted shell.
      try {
        await activateChatTheme(t.theme_key);
        onThemeChange();
        setConfirmTheme(null);
        onOpenChange(false);
        return;
      } catch (actErr: any) {
        toast.error(friendlyError(actErr?.message ?? "Activate failed"));
      }
      await refresh();
    } catch (e: any) {
      toast.error(friendlyError(e?.message ?? "Unlock failed", { price: t.price_coins, balance: coins }));
    } finally {
      setBusy(null);
      setConfirmTheme(null);
    }
  };

  const handleUnlockClick = (t: ChatThemeRow) => {
    if (coins < t.price_coins) {
      toast.error(`You need ${(t.price_coins - coins).toLocaleString()} more coins`, {
        description: "Earn coins by chatting, completing missions, or topping up.",
      });
      return;
    }
    setConfirmTheme(t);
  };

  const handleActivate = async (t: ChatThemeRow) => {
    setBusy(t.theme_key);
    try {
      await activateChatTheme(t.theme_key);
      toast.success(`Activated ${t.name}`);
      onThemeChange();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(friendlyError(e?.message ?? "Activate failed"));
    } finally {
      setBusy(null);
    }
  };

  const modeLabel = (m: string) =>
    m === "days_7" ? "7-day access" : m === "days_30" ? "30-day access" : "Lifetime";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Chatroom Theme Store
            </DialogTitle>
            <DialogDescription>
              Unlock premium chatroom skins. Layout and features stay the same — only the look changes.
            </DialogDescription>
            <div className="mt-2 inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted px-3 py-1.5 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{coins.toLocaleString()}</span>
              <span className="text-muted-foreground">coins available</span>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading themes…</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((t) => {
                const unlocked = isUnlocked(t);
                const active = activeTheme === t.theme_key;
                const u = unlockMap.get(t.theme_key);
                const accent = t.accent_hex ?? "#7ed321";
                const shortage = !unlocked && !t.is_default ? Math.max(t.price_coins - coins, 0) : 0;
                return (
                  <div key={t.theme_key} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
                    <div className="mb-3 h-24 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)` }} />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{t.name}</h3>
                          {active && (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" /> Active
                            </Badge>
                          )}
                          {!unlocked && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" /> Locked
                            </Badge>
                          )}
                        </div>
                        {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {!t.is_default && (
                        <>
                          <span className="inline-flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5 text-yellow-500" />
                            {t.price_coins.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {modeLabel(t.unlock_mode)}
                          </span>
                        </>
                      )}
                      {u?.expires_at && (
                        <span className="text-amber-500">Expires {new Date(u.expires_at).toLocaleDateString()}</span>
                      )}
                      {shortage > 0 && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Need {shortage.toLocaleString()} more
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      {active ? (
                        <Button size="sm" variant="outline" disabled className="w-full">Currently active</Button>
                      ) : unlocked ? (
                        <Button size="sm" className="w-full" disabled={busy === t.theme_key} onClick={() => handleActivate(t)}>
                          {busy === t.theme_key ? "Activating…" : "Activate"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          variant={shortage > 0 ? "outline" : "default"}
                          disabled={busy === t.theme_key}
                          onClick={() => handleUnlockClick(t)}
                        >
                          {shortage > 0 ? "Not enough coins" : `Unlock for ${t.price_coins.toLocaleString()}`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmTheme} onOpenChange={(v) => !v && setConfirmTheme(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock {confirmTheme?.name}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>
                  This will spend{" "}
                  <span className="font-semibold text-foreground">
                    {confirmTheme?.price_coins.toLocaleString()} coins
                  </span>{" "}
                  for <span className="font-medium text-foreground">{confirmTheme ? modeLabel(confirmTheme.unlock_mode) : ""}</span>.
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Balance after</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Coins className="h-3.5 w-3.5 text-yellow-500" />
                    {confirmTheme ? Math.max(coins - confirmTheme.price_coins, 0).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === confirmTheme?.theme_key}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy === confirmTheme?.theme_key}
              onClick={(e) => {
                e.preventDefault();
                if (confirmTheme) doUnlock(confirmTheme);
              }}
            >
              {busy === confirmTheme?.theme_key ? "Unlocking…" : "Confirm & Unlock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
