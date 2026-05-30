import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface IgnoreState {
  ignoredIds: string[];
  ignoreAllBots: boolean;
}

interface IgnoreCtx extends IgnoreState {
  isIgnored: (id: string, isBot?: boolean) => boolean;
  toggleIgnoreUser: (id: string) => void;
  setIgnoreAllBots: (v: boolean) => void;
}

const KEY = "palrgo:ignore:v1";
const DEFAULTS: IgnoreState = { ignoredIds: [], ignoreAllBots: false };

const Ctx = createContext<IgnoreCtx | null>(null);

function load(): IgnoreState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<IgnoreState>;
    return {
      ignoredIds: Array.isArray(p.ignoredIds) ? p.ignoredIds.filter(x => typeof x === "string") : [],
      ignoreAllBots: !!p.ignoreAllBots,
    };
  } catch { return DEFAULTS; }
}

export function IgnoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IgnoreState>(DEFAULTS);

  useEffect(() => { setState(load()); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const toggleIgnoreUser = useCallback((id: string) => {
    setState(s => s.ignoredIds.includes(id)
      ? { ...s, ignoredIds: s.ignoredIds.filter(x => x !== id) }
      : { ...s, ignoredIds: [...s.ignoredIds, id] });
  }, []);

  const setIgnoreAllBots = useCallback((v: boolean) => {
    setState(s => ({ ...s, ignoreAllBots: v }));
  }, []);

  const value = useMemo<IgnoreCtx>(() => ({
    ...state,
    isIgnored: (id, isBot) => (!!isBot && state.ignoreAllBots) || state.ignoredIds.includes(id),
    toggleIgnoreUser,
    setIgnoreAllBots,
  }), [state, toggleIgnoreUser, setIgnoreAllBots]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIgnore(): IgnoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return {
    ignoredIds: [], ignoreAllBots: false,
    isIgnored: () => false,
    toggleIgnoreUser: () => {},
    setIgnoreAllBots: () => {},
  };
  return ctx;
}
