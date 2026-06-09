// Lightweight client-side cache manager.
// Used by the admin Cache page and the /clearcache chat/feed command.
import type { QueryClient } from "@tanstack/react-query";

export interface ClearOptions {
  localStorage?: boolean;
  sessionStorage?: boolean;
  queryCache?: boolean;
  serviceWorkerCaches?: boolean;
  reload?: boolean;
  queryClient?: QueryClient;
}

export interface ClearReport {
  localStorageKeysCleared: number;
  sessionStorageKeysCleared: number;
  queryCacheCleared: boolean;
  cachesDeleted: number;
  errors: string[];
}

// Keys we MUST preserve so the user stays signed in & app shell still boots.
const PRESERVE_PREFIXES = ["sb-", "supabase.auth.", "lovable-cloud"];
const PRESERVE_EXACT = new Set<string>(["theme", "vite-ui-theme"]);

function shouldPreserve(key: string): boolean {
  if (PRESERVE_EXACT.has(key)) return true;
  return PRESERVE_PREFIXES.some(p => key.startsWith(p));
}

export async function clearCaches(opts: ClearOptions = {}): Promise<ClearReport> {
  const {
    localStorage: ls = true,
    sessionStorage: ss = true,
    queryCache = true,
    serviceWorkerCaches = true,
    reload = false,
    queryClient,
  } = opts;

  const report: ClearReport = {
    localStorageKeysCleared: 0,
    sessionStorageKeysCleared: 0,
    queryCacheCleared: false,
    cachesDeleted: 0,
    errors: [],
  };

  if (typeof window === "undefined") return report;

  if (ls) {
    try {
      const keys = Object.keys(window.localStorage);
      for (const k of keys) {
        if (!shouldPreserve(k)) {
          window.localStorage.removeItem(k);
          report.localStorageKeysCleared++;
        }
      }
    } catch (e) {
      report.errors.push(`localStorage: ${(e as Error).message}`);
    }
  }

  if (ss) {
    try {
      report.sessionStorageKeysCleared = window.sessionStorage.length;
      window.sessionStorage.clear();
    } catch (e) {
      report.errors.push(`sessionStorage: ${(e as Error).message}`);
    }
  }

  if (queryCache && queryClient) {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      report.queryCacheCleared = true;
    } catch (e) {
      report.errors.push(`queryCache: ${(e as Error).message}`);
    }
  }

  if (serviceWorkerCaches && "caches" in window) {
    try {
      const names = await window.caches.keys();
      await Promise.all(names.map(n => window.caches.delete(n)));
      report.cachesDeleted = names.length;
    } catch (e) {
      report.errors.push(`caches: ${(e as Error).message}`);
    }
  }

  if (reload) {
    setTimeout(() => window.location.reload(), 250);
  }

  return report;
}

export function formatClearReport(r: ClearReport): string {
  const parts = [
    `localStorage: ${r.localStorageKeysCleared}`,
    `session: ${r.sessionStorageKeysCleared}`,
    `query cache: ${r.queryCacheCleared ? "cleared" : "skipped"}`,
    `sw caches: ${r.cachesDeleted}`,
  ];
  if (r.errors.length) parts.push(`errors: ${r.errors.length}`);
  return parts.join(" · ");
}

// Check admin role for the currently signed-in user.
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roles = (data ?? []).map(r => r.role as string);
    return roles.includes("super_admin") || roles.includes("admin");
  } catch {
    return false;
  }
}
