import { useEffect, useState } from "react";
import { checkUsernameAvailable } from "@/lib/auth.functions";

export type UsernameStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "error"; message: string };

/**
 * Debounced live username availability check.
 * Returns "idle" for empty input, "checking" while a check is in flight,
 * "ok" if the name is free, and "error" with a user-facing message otherwise.
 */
export function useUsernameCheck(username: string, excludeUserId?: string): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>({ state: "idle" });

  useEffect(() => {
    const name = username.trim();
    if (!name) {
      setStatus({ state: "idle" });
      return;
    }
    setStatus({ state: "checking" });
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable({ data: { username: name, excludeUserId } });
        if (cancelled) return;
        if (res.available) setStatus({ state: "ok" });
        else setStatus({ state: "error", message: res.reason || "Not available" });
      } catch (e) {
        if (cancelled) return;
        setStatus({ state: "error", message: e instanceof Error ? e.message : "Check failed" });
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username, excludeUserId]);

  return status;
}
