const PRESERVE_PREFIXES = ["sb-", "supabase.auth.", "lovable-cloud"];
const PRESERVE_EXACT = /* @__PURE__ */ new Set(["theme", "vite-ui-theme"]);
function shouldPreserve(key) {
  if (PRESERVE_EXACT.has(key)) return true;
  return PRESERVE_PREFIXES.some((p) => key.startsWith(p));
}
async function clearCaches(opts = {}) {
  const {
    localStorage: ls = true,
    sessionStorage: ss = true,
    queryCache = true,
    serviceWorkerCaches = true,
    reload = false,
    queryClient
  } = opts;
  const report = {
    localStorageKeysCleared: 0,
    sessionStorageKeysCleared: 0,
    queryCacheCleared: false,
    cachesDeleted: 0,
    errors: []
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
      report.errors.push(`localStorage: ${e.message}`);
    }
  }
  if (ss) {
    try {
      report.sessionStorageKeysCleared = window.sessionStorage.length;
      window.sessionStorage.clear();
    } catch (e) {
      report.errors.push(`sessionStorage: ${e.message}`);
    }
  }
  if (queryCache && queryClient) {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      report.queryCacheCleared = true;
    } catch (e) {
      report.errors.push(`queryCache: ${e.message}`);
    }
  }
  if (serviceWorkerCaches && "caches" in window) {
    try {
      const names = await window.caches.keys();
      await Promise.all(names.map((n) => window.caches.delete(n)));
      report.cachesDeleted = names.length;
    } catch (e) {
      report.errors.push(`caches: ${e.message}`);
    }
  }
  if (reload) {
    setTimeout(() => window.location.reload(), 250);
  }
  return report;
}
function formatClearReport(r) {
  const parts = [
    `localStorage: ${r.localStorageKeysCleared}`,
    `session: ${r.sessionStorageKeysCleared}`,
    `query cache: ${r.queryCacheCleared ? "cleared" : "skipped"}`,
    `sw caches: ${r.cachesDeleted}`
  ];
  if (r.errors.length) parts.push(`errors: ${r.errors.length}`);
  return parts.join(" · ");
}
async function isCurrentUserAdmin() {
  try {
    const { supabase } = await import("./client-H8IXbXWR.mjs").then((n) => n.c);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (data ?? []).map((r) => r.role);
    return roles.includes("super_admin") || roles.includes("admin");
  } catch {
    return false;
  }
}
export {
  clearCaches as c,
  formatClearReport as f,
  isCurrentUserAdmin as i
};
