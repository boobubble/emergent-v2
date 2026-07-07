import { useEffect, useMemo, useState } from "react";
import { useAppSettings } from "@/lib/app-settings";
import {
  BOT_EVENT_META,
  computeEventState,
  normalizeConfig,
  setBotEventsConfig,
  type BotEventKind,
  type BotEventState,
  type BotEventsConfig,
} from "@/lib/bot-events";

const KINDS: BotEventKind[] = ["fish", "dig", "wine"];

export interface BotEventTransitionDetail {
  kind: BotEventKind;
  live: boolean;
  cycleId: string;
  duration_min: number;
  interval_min: number;
  golden: boolean;
}

/** Hook: returns live config + a ticking states map. Also syncs config
 *  into the module-level accessor and fires open/close transition events. */
export function useBotEvents() {
  const { raw } = useAppSettings();
  const config: BotEventsConfig = useMemo(() => normalizeConfig(raw.bot_events), [raw.bot_events]);

  useEffect(() => { setBotEventsConfig(config); }, [config]);

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const states = useMemo(() => {
    const out = {} as Record<BotEventKind, BotEventState>;
    for (const k of KINDS) out[k] = computeEventState(k, config[k], now);
    return out;
  }, [config, now]);

  // Detect open/close transitions and broadcast a global event so any
  // listener (chat store, panels) can react. We only fire once per cycle
  // across the whole tab by storing the last observed cycleId+live.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const store = (window as unknown as { __botEventLast?: Record<string, string> });
    if (!store.__botEventLast) store.__botEventLast = {};
    const last = store.__botEventLast;
    for (const k of KINDS) {
      const s = states[k];
      if (!config[k].enabled) continue;
      const key = `${s.cycleId}:${s.live ? "live" : "closed"}`;
      if (last[k] === key) continue;
      // Skip initial "closed" fire before we've ever seen this cycle live.
      const hadPrev = !!last[k];
      last[k] = key;
      if (!hadPrev && !s.live) continue;
      window.dispatchEvent(new CustomEvent<BotEventTransitionDetail>("palrgo:bot-event", {
        detail: {
          kind: k,
          live: s.live,
          cycleId: s.cycleId,
          duration_min: config[k].duration_min,
          interval_min: config[k].interval_min,
          golden: s.golden,
        },
      }));
    }
  }, [states, config]);

  return { config, states, meta: BOT_EVENT_META };
}
