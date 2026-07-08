import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export interface LivesState { lives: number; max: number; nextRegenAt: string | null }

export function useLives(userId: string | null) {
  const [state, setState] = useState<LivesState>({ lives: 5, max: 5, nextRegenAt: null });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await sb.rpc("pathescape_get_lives");
    if (!error && Array.isArray(data) && data[0]) {
      setState({ lives: data[0].lives, max: data[0].max_lives, nextRegenAt: data[0].next_regen_at });
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const consume = useCallback(async (): Promise<boolean> => {
    if (!userId) return true;
    setLoading(true);
    const { data, error } = await sb.rpc("pathescape_consume_life");
    setLoading(false);
    if (error) { toast.error("Out of lives — wait for regen or refill"); return false; }
    if (Array.isArray(data) && data[0]) setState({ lives: data[0].lives, max: data[0].max_lives, nextRegenAt: data[0].next_regen_at });
    return true;
  }, [userId]);

  const refill = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await sb.rpc("pathescape_refill_lives", { _cost: 50 });
    setLoading(false);
    if (error) { toast.error(error.message ?? "Refill failed"); return; }
    if (Array.isArray(data) && data[0]) setState({ lives: data[0].lives, max: data[0].max_lives, nextRegenAt: data[0].next_regen_at });
    toast.success("Lives refilled");
  }, [userId]);

  return { ...state, loading, refresh, consume, refill };
}
