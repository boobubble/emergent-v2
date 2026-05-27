import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SHOP_BY_ID, type ShopItem } from "./shop-catalog";

export interface UserCosmetics {
  frame?: ShopItem;
  usernameEffect?: ShopItem;
  themeAccent?: string;
}

type Listener = () => void;

const cache = new Map<string, UserCosmetics>();
const inflight = new Map<string, Promise<void>>();
const pending = new Set<string>();
const listeners = new Set<Listener>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const l of listeners) l();
}

async function flush() {
  flushTimer = null;
  const ids = Array.from(pending);
  pending.clear();
  if (ids.length === 0) return;
  // Mark each as loading by setting empty object so we don't refetch.
  for (const id of ids) if (!cache.has(id)) cache.set(id, {});
  const { data } = await supabase
    .from("user_inventory")
    .select("user_id, item_id, category, equipped")
    .in("user_id", ids)
    .eq("equipped", true);
  if (data) {
    for (const row of data as Array<{ user_id: string; item_id: string; category: string }>) {
      const item = SHOP_BY_ID[row.item_id];
      if (!item) continue;
      const entry = cache.get(row.user_id) ?? {};
      if (item.category === "frame") entry.frame = item;
      else if (item.category === "username_effect") entry.usernameEffect = item;
      else if (item.category === "theme") entry.themeAccent = item.themeAccent;
      cache.set(row.user_id, entry);
    }
  }
  emit();
}

function schedule(id: string) {
  if (cache.has(id)) return;
  pending.add(id);
  if (flushTimer == null) flushTimer = setTimeout(flush, 40);
}

export function ensureCosmetics(userIds: Iterable<string>): void {
  for (const id of userIds) if (id) schedule(id);
}

export function getCosmetics(userId: string): UserCosmetics | undefined {
  return cache.get(userId);
}

export function setLocalEquip(userId: string, item: ShopItem, equipped: boolean) {
  const entry = { ...(cache.get(userId) ?? {}) };
  const key = item.category === "frame" ? "frame" : item.category === "username_effect" ? "usernameEffect" : null;
  if (!key) return;
  if (equipped) (entry as any)[key] = item;
  else if ((entry as any)[key]?.id === item.id) delete (entry as any)[key];
  cache.set(userId, entry);
  emit();
}

export function useCosmetics(userId?: string | null): UserCosmetics {
  const [, force] = useState(0);
  useEffect(() => {
    if (!userId) return;
    schedule(userId);
    const l: Listener = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [userId]);
  return (userId && cache.get(userId)) || {};
}

/** Prefetch many ids; safe to call on every render with the same set. */
export function usePrefetchCosmetics(userIds: string[]) {
  useEffect(() => {
    ensureCosmetics(userIds);
    // re-run when the joined key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds.join(",")]);
}
