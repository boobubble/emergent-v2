import { useEffect, useState } from "react";
import { useAppSettings } from "@/lib/app-settings";

export type BrandSlot = "logo" | "favicon" | "feed" | "chat";

interface BrandingMap {
  logo_light?: string;
  logo_dark?: string;
  favicon_light?: string;
  favicon_dark?: string;
  feed_light?: string;
  feed_dark?: string;
  chat_light?: string;
  chat_dark?: string;
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
  const { raw } = useAppSettings();
  return (raw.branding as BrandingMap) || {};
}

export function useBrandAsset(slot: BrandSlot): string | undefined {
  const b = useBrandingMap();
  const theme = useResolvedTheme();
  const key = `${slot}_${theme}` as keyof BrandingMap;
  return b[key] || b[`${slot}_light` as keyof BrandingMap] || b[`${slot}_dark` as keyof BrandingMap];
}

interface Props {
  slot: BrandSlot;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function BrandMark({ slot, alt = "Logo", className, fallback }: Props) {
  const url = useBrandAsset(slot);
  if (!url) return <>{fallback ?? null}</>;
  return <img src={url} alt={alt} className={className} />;
}
