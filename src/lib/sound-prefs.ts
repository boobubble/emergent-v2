// Per-user sound preferences. Cached client-side; persisted in profiles.sound_prefs.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SoundKind =
  | "public_chat"
  | "private_chat"
  | "notifications"
  | "username_mention"
  | "calls";

export type SoundPrefs = Record<SoundKind, boolean>;

export const SOUND_PREFS_DEFAULTS: SoundPrefs = {
  public_chat: true,
  private_chat: true,
  notifications: true,
  username_mention: true,
  calls: true,
};

const LS_KEY = "palrgo:sound-prefs";
let cache: SoundPrefs = SOUND_PREFS_DEFAULTS;

function readLs(): SoundPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SOUND_PREFS_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SoundPrefs>;
    return { ...SOUND_PREFS_DEFAULTS, ...parsed };
  } catch { return SOUND_PREFS_DEFAULTS; }
}

if (typeof window !== "undefined") cache = readLs();

export function getSoundPrefs(): SoundPrefs { return cache; }
export function canPlaySound(kind: SoundKind): boolean { return cache[kind] !== false; }

export async function setSoundPref(kind: SoundKind, value: boolean) {
  cache = { ...cache, [kind]: value };
  try { localStorage.setItem(LS_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ sound_prefs: cache }).eq("id", user.id);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("palrgo:sound-prefs-change"));
}

export async function hydrateSoundPrefsFromServer() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("sound_prefs").eq("id", user.id).maybeSingle();
    const remote = (data?.sound_prefs ?? {}) as Partial<SoundPrefs>;
    cache = { ...SOUND_PREFS_DEFAULTS, ...remote };
    try { localStorage.setItem(LS_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("palrgo:sound-prefs-change"));
  } catch { /* ignore */ }
}

/** React hook — live-updates when prefs change in this tab. */
export function useSoundPrefs(): SoundPrefs {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((n) => n + 1);
    window.addEventListener("palrgo:sound-prefs-change", f);
    return () => window.removeEventListener("palrgo:sound-prefs-change", f);
  }, []);
  return cache;
}
