import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Coins, Lock, Sparkles, Users2, User as UserIcon, RotateCcw, X, Check } from "lucide-react";
import {
  clearPersonalTheme,
  purchaseWallpaper,
  savePersonalTheme,
  wallpaperBackground,
  type DmWallpaper,
  type PurchaseType,
  WALLPAPER_CATEGORIES,
} from "@/lib/dm-wallpapers";
import { useDmTheme } from "@/lib/use-dm-theme";
import { useChat } from "@/lib/chat-store";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
}

export function DMWallpaperSheet({ open, onOpenChange, channelId }: Props) {
  const { state } = useChat();
  const meCoins = state.me?.coins ?? 0;
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  useEffect(() => {
    sb.auth.getUser().then((res: { data: { user: { id: string } | null } }) => {
      setAuthUserId(res?.data?.user?.id ?? null);
    });
  }, []);

  const dm = useDmTheme(channelId, authUserId);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("All");
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(1);
  const [blur, setBlur] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(1);
  const [overlay, setOverlay] = useState<number>(0);
  const [confirm, setConfirm] = useState<{ type: PurchaseType; wallpaper: DmWallpaper } | null>(null);
  const [busy, setBusy] = useState(false);

  // Load owned set + hydrate sliders from active theme.
  useEffect(() => {
    if (!open || !authUserId) return;
    sb.from("user_dm_wallpapers")
      .select("wallpaper_key")
      .eq("user_id", authUserId)
      .then((r: { data: { wallpaper_key: string }[] | null }) => {
        setOwned(new Set((r.data ?? []).map((x) => x.wallpaper_key)));
      });
  }, [open, authUserId]);

  useEffect(() => {
    if (!open) return;
    setPickedKey(dm.wallpaper?.wallpaper_key ?? null);
    setOpacity(dm.opacity);
    setBlur(dm.blur);
    setBrightness(dm.brightness);
    setOverlay(dm.overlay);
  }, [open, dm.wallpaper?.wallpaper_key, dm.opacity, dm.blur, dm.brightness, dm.overlay]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    dm.catalog.forEach((w) => s.add(w.category));
    return ["All", ...WALLPAPER_CATEGORIES.filter((c) => s.has(c)), ...Array.from(s).filter((c) => !WALLPAPER_CATEGORIES.includes(c as (typeof WALLPAPER_CATEGORIES)[number]))];
  }, [dm.catalog]);

  const filtered = useMemo(() => {
    if (category === "All") return dm.catalog;
    return dm.catalog.filter((w) => w.category === category);
  }, [dm.catalog, category]);

  const picked: DmWallpaper | null = useMemo(
    () => (pickedKey ? dm.catalog.find((w) => w.wallpaper_key === pickedKey) ?? null : null),
    [pickedKey, dm.catalog],
  );

  const isOwned = (w: DmWallpaper) => owned.has(w.wallpaper_key) || w.price_coins === 0;

  const applyPersonal = async () => {
    if (!authUserId) return;
    if (!picked) {
      // Reset — clear personal theme row.
      await clearPersonalTheme(channelId, authUserId).catch((e: Error) => toast.error(e.message));
      dm.refresh();
      onOpenChange(false);
      return;
    }
    if (!isOwned(picked)) {
      setConfirm({ type: "self", wallpaper: picked });
      return;
    }
    setBusy(true);
    try {
      await savePersonalTheme(channelId, authUserId, {
        wallpaper_key: picked.wallpaper_key,
        opacity, blur, brightness, overlay,
      });
      toast.success("Wallpaper applied");
      dm.refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const applyShared = async () => {
    if (!picked) return;
    setConfirm({ type: "shared", wallpaper: picked });
  };

  const runPurchase = async () => {
    if (!confirm || !authUserId) return;
    const { wallpaper, type } = confirm;
    setBusy(true);
    try {
      await purchaseWallpaper(wallpaper.wallpaper_key, type, channelId);
      if (type === "self") {
        await savePersonalTheme(channelId, authUserId, {
          wallpaper_key: wallpaper.wallpaper_key,
          opacity, blur, brightness, overlay,
        });
      }
      toast.success(type === "shared" ? "Applied for both of you" : "Wallpaper unlocked & applied");
      setOwned((s) => new Set([...s, wallpaper.wallpaper_key]));
      setConfirm(null);
      dm.refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!authUserId) return;
    try {
      await clearPersonalTheme(channelId, authUserId);
      setPickedKey(null);
      setOpacity(1); setBlur(0); setBrightness(1); setOverlay(0);
      toast.success("Reset to default");
      dm.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto p-0">
          <div className="sticky top-0 z-10 border-b bg-background/95 px-5 py-4 backdrop-blur">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Chat Personalization
              </SheetTitle>
              <SheetDescription>
                Pick a wallpaper for this conversation. Only you see personal picks; shared themes apply for both of you.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-foreground">{meCoins}</span>
              <span>coins available</span>
            </div>
          </div>

          {/* Live preview */}
          <div className="px-5 pt-4">
            <PreviewCard picked={picked} opacity={opacity} blur={blur} brightness={brightness} overlay={overlay} />
          </div>

          {/* Categories */}
          <div className="px-5 pt-4">
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                {categories.map((c) => (
                  <TabsTrigger
                    key={c}
                    value={c}
                    className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={category} className="mt-3">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {filtered.map((w) => {
                    const active = pickedKey === w.wallpaper_key;
                    const own = isOwned(w);
                    return (
                      <button
                        key={w.wallpaper_key}
                        type="button"
                        onClick={() => setPickedKey(w.wallpaper_key)}
                        className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition ${active ? "border-primary shadow-lg" : "border-transparent hover:border-primary/50"}`}
                        style={{ background: wallpaperBackground(w) }}
                      >
                        <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 rounded-lg bg-black/55 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                          <span className="truncate font-semibold">{w.name}</span>
                          {own ? (
                            <span className="rounded bg-emerald-500/80 px-1 text-[9px] font-bold uppercase">Owned</span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-amber-300">
                              <Coins className="h-2.5 w-2.5" /> {w.price_coins}
                            </span>
                          )}
                        </div>
                        {w.is_premium && !own && (
                          <span className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-300 backdrop-blur">
                            <Lock className="mr-0.5 inline h-2.5 w-2.5" /> Premium
                          </span>
                        )}
                        {w.is_featured && (
                          <span className="absolute left-1 top-1 rounded bg-primary/90 px-1 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="col-span-full text-center text-xs text-muted-foreground">No wallpapers in this category.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sliders */}
          {picked && (
            <div className="space-y-3 px-5 pt-5">
              <SliderRow label="Opacity" value={opacity} min={0.2} max={1} step={0.05} onChange={setOpacity} display={`${Math.round(opacity * 100)}%`} />
              <SliderRow label="Blur" value={blur} min={0} max={30} step={1} onChange={setBlur} display={`${blur}px`} />
              <SliderRow label="Brightness" value={brightness} min={0.4} max={1.2} step={0.05} onChange={setBrightness} display={`${Math.round(brightness * 100)}%`} />
              <SliderRow label="Dark overlay" value={overlay} min={0} max={0.7} step={0.05} onChange={setOverlay} display={`${Math.round(overlay * 100)}%`} />
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-5 py-3 backdrop-blur">
            <Button variant="ghost" size="sm" onClick={reset} disabled={busy}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
            <div className="flex flex-1 justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
                <X className="mr-1 h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={applyPersonal} disabled={busy || !picked}>
                <UserIcon className="mr-1 h-3.5 w-3.5" /> Apply for me
              </Button>
              <Button size="sm" variant="default" onClick={applyShared} disabled={busy || !picked} className="bg-primary/90">
                <Users2 className="mr-1 h-3.5 w-3.5" /> Apply for both
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          {confirm && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  {confirm.type === "shared" ? <Users2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  {confirm.type === "shared" ? "Apply for both" : "Unlock wallpaper"}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span>{confirm.wallpaper.name}</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Coins className="h-4 w-4" /> {owned.has(confirm.wallpaper.wallpaper_key) ? 0 : confirm.wallpaper.price_coins}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Your balance</span>
                      <span>{meCoins}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Balance after</span>
                      <span className="font-semibold">
                        {Math.max(0, meCoins - (owned.has(confirm.wallpaper.wallpaper_key) ? 0 : confirm.wallpaper.price_coins))}
                      </span>
                    </div>
                    {confirm.type === "shared" && (
                      <p className="rounded bg-primary/10 p-2 text-xs text-primary">
                        Both participants will see this theme. Only your coins are used — the other person pays nothing.
                      </p>
                    )}
                    {!owned.has(confirm.wallpaper.wallpaper_key) && meCoins < confirm.wallpaper.price_coins && (
                      <p className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                        You don't have enough coins to unlock this wallpaper.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={busy || (!owned.has(confirm.wallpaper.wallpaper_key) && meCoins < confirm.wallpaper.price_coins)}
                  onClick={(e) => { e.preventDefault(); runPurchase(); }}
                >
                  <Check className="mr-1 h-4 w-4" /> Buy & Apply
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SliderRow({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="tabular-nums">{display}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function PreviewCard({ picked, opacity, blur, brightness, overlay }: {
  picked: DmWallpaper | null; opacity: number; blur: number; brightness: number; overlay: number;
}) {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
      {picked && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: wallpaperBackground(picked),
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity,
              filter: `${blur ? `blur(${blur}px) ` : ""}brightness(${brightness})`,
              transform: blur ? "scale(1.05)" : undefined,
            }}
          />
          {overlay > 0 && <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />}
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
        <div className="rounded-2xl rounded-bl-none bg-white/95 px-3 py-1.5 text-xs text-black shadow">Hey! ✨</div>
        <div className="rounded-2xl rounded-br-none bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow">Looks great 💫</div>
      </div>
    </div>
  );
}
