import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdSlotKey = "header" | "sidebar" | "in_feed" | "footer";

interface AdSlotConfig {
  enabled: boolean;
  slot_id: string;
  format: string;
  full_width_responsive: boolean;
}
interface AdsConfig {
  enabled: boolean;
  provider: "adsense" | "custom";
  publisher_id: string;
  auto_ads: boolean;
  slots: Record<AdSlotKey, AdSlotConfig>;
  custom_html_header?: string;
  custom_html_sidebar?: string;
  custom_html_in_feed?: string;
  custom_html_footer?: string;
}

let cached: AdsConfig | null = null;
const listeners = new Set<(c: AdsConfig | null) => void>();
let loaded = false;

async function loadOnce() {
  if (loaded) return;
  loaded = true;
  const { data } = await supabase.from("app_settings").select("key,value").eq("key", "ads").maybeSingle();
  cached = (data?.value as AdsConfig | null) ?? null;
  listeners.forEach((fn) => fn(cached));
  // realtime updates
  supabase
    .channel("app_settings_ads")
    .on("postgres_changes", { event: "*", schema: "public", table: "app_settings", filter: "key=eq.ads" }, (payload: any) => {
      cached = (payload.new?.value as AdsConfig | null) ?? null;
      listeners.forEach((fn) => fn(cached));
    })
    .subscribe();
}

function useAdsConfig(): AdsConfig | null {
  const [cfg, setCfg] = useState<AdsConfig | null>(cached);
  useEffect(() => {
    loadOnce();
    const fn = (c: AdsConfig | null) => setCfg(c);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return cfg;
}

function ensureAdsenseLoader(publisherId: string) {
  if (typeof document === "undefined") return;
  if (document.querySelector('script[data-adsense-loader="1"]')) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  s.dataset.adsenseLoader = "1";
  document.head.appendChild(s);
}

/**
 * Renders an ad placement. Honors the admin Ads & Scripts settings:
 *   - Hidden when ads are disabled, or this slot is disabled, or AdSense auto-ads is on.
 *   - For AdSense, renders `<ins class="adsbygoogle">` and pushes once mounted.
 *   - For custom HTML, dangerously sets the configured HTML for this slot.
 */
export function AdSlot({ slot, className }: { slot: AdSlotKey; className?: string }) {
  const cfg = useAdsConfig();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!cfg?.enabled || cfg.provider !== "adsense" || cfg.auto_ads) return;
    if (!cfg.publisher_id || !cfg.slots[slot]?.enabled || !cfg.slots[slot]?.slot_id) return;
    ensureAdsenseLoader(cfg.publisher_id);
    if (pushedRef.current || !insRef.current) return;
    try {
      // @ts-expect-error -- adsbygoogle is injected by the AdSense loader script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch { /* ignore */ }
  }, [cfg, slot]);

  if (!cfg?.enabled) return null;
  const slotCfg = cfg.slots[slot];

  if (cfg.provider === "custom") {
    const html = (cfg as any)[`custom_html_${slot}`] as string | undefined;
    if (!html) return null;
    return <div className={className} data-ad-slot={slot} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // AdSense
  if (cfg.auto_ads) return null; // auto ads place themselves
  if (!slotCfg?.enabled || !slotCfg.slot_id || !cfg.publisher_id) return null;
  return (
    <div className={className} data-ad-slot={slot}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={cfg.publisher_id}
        data-ad-slot={slotCfg.slot_id}
        data-ad-format={slotCfg.format || "auto"}
        data-full-width-responsive={slotCfg.full_width_responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * Mount once near the root. Injects AdSense Auto Ads loader when enabled.
 */
export function AdsAutoLoader() {
  const cfg = useAdsConfig();
  useEffect(() => {
    if (!cfg?.enabled || cfg.provider !== "adsense" || !cfg.publisher_id) return;
    if (!cfg.auto_ads) return;
    ensureAdsenseLoader(cfg.publisher_id);
  }, [cfg]);
  return null;
}
