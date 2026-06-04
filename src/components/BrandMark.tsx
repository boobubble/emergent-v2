import { useEffect, useState } from "react";
import { useAppSettings } from "@/lib/app-settings";

export type BrandSlot = "logo" | "favicon" | "feed" | "chat";

export interface RoomBranding {
  chat_light?: string;
  chat_dark?: string;
  favicon_light?: string;
  favicon_dark?: string;
  feed_light?: string;
  feed_dark?: string;
}

export type BrandFit = "contain" | "cover" | "fill";
export interface BrandSizeValue { w?: number; h?: number; fit?: BrandFit }
export interface BrandSizes {
  logo?: number | BrandSizeValue;
  favicon?: number | BrandSizeValue;
  feed?: number | BrandSizeValue;
  chat?: number | BrandSizeValue;
}

export interface BrandingMap {
  logo_light?: string;
  logo_dark?: string;
  favicon_light?: string;
  favicon_dark?: string;
  feed_light?: string;
  feed_dark?: string;
  chat_light?: string;
  chat_dark?: string;
  sizes?: BrandSizes;
  rooms?: Record<string, RoomBranding>;
}

function useResolvedTheme(): "light" | "dark" {
  const [t, setT] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setT(el.classList.contains("dark") ? "dark" : "light");
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return t;
}

export function useBrandingMap(): BrandingMap {
  try {
    const { raw } = useAppSettings();
    return (raw.branding as BrandingMap) || {};
  } catch {
    return {};
  }
}

export function useBrandAsset(slot: BrandSlot, roomId?: string, forceTheme?: "light" | "dark"): string | undefined {
  const b = useBrandingMap();
  const resolved = useResolvedTheme();
  const theme = forceTheme ?? resolved;
  if (roomId && b.rooms?.[roomId]) {
    const r = b.rooms[roomId];
    const rk = `${slot}_${theme}` as keyof RoomBranding;
    const rl = `${slot}_light` as keyof RoomBranding;
    const rd = `${slot}_dark` as keyof RoomBranding;
    const v = r[rk] || r[rl] || r[rd];
    if (v) return v;
  }
  const key = `${slot}_${theme}` as keyof BrandingMap;
  return (b[key] as string | undefined)
    || (b[`${slot}_${theme === "dark" ? "light" : "dark"}` as keyof BrandingMap] as string | undefined);
}


export function useBrandSize(slot: BrandSlot): BrandSizeValue | undefined {
  const b = useBrandingMap();
  const v = b.sizes?.[slot];
  if (v == null) return undefined;
  if (typeof v === "number") return { w: v, h: v };
  return v;
}

interface Props {
  slot: BrandSlot;
  roomId?: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  forceTheme?: "light" | "dark";
}

export function BrandMark({ slot, roomId, alt = "Logo", className, fallback, forceTheme }: Props) {
  const url = useBrandAsset(slot, roomId, forceTheme);

  const size = useBrandSize(slot);
  const fit: BrandFit = size?.fit ?? "contain";
  const style: React.CSSProperties | undefined = size
    ? { width: size.w, height: size.h, objectFit: fit, objectPosition: "center" }
    : undefined;
  if (!url) {
    if (!fallback) return null;
    if (!size) return <>{fallback}</>;
    return <span style={style} className="inline-grid place-items-center">{fallback}</span>;
  }
  return <img src={url} alt={alt} className={className} style={style} />;
}
