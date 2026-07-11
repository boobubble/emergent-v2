import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkLicense } from "@/lib/licensing/manager.functions";
import { APP_VERSION } from "@/lib/app-version";
import { AlertTriangle } from "lucide-react";

/**
 * Runtime license guard.
 *
 * - Runs one check on mount, then every 24 hours.
 * - Never blocks rendering while the app is inside its grace period.
 * - Shows a non-dismissible banner when the license is expired / revoked /
 *   bound to a different domain.
 * - Silently no-ops when no license cache is present yet (fresh install,
 *   installer route, etc.) so the guard never fights the installer.
 */
const REVALIDATE_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = 7 * 24 * 60 * 60 * 1000;

type GuardState =
  | { kind: "ok" }
  | { kind: "unknown" }
  | { kind: "warn"; message: string }
  | { kind: "fail"; message: string };

export function LicenseGuard() {
  const run = useServerFn(checkLicense);
  const [state, setState] = useState<GuardState>({ kind: "unknown" });
  const [lastOkAt, setLastOkAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const host = {
          domain: window.location.hostname,
          productVersion: APP_VERSION,
          installationId: window.location.origin,
        };
        const r = await run({ data: { host } });
        if (cancelled) return;
        if (!r.cache) {
          setState({ kind: "unknown" });
          return;
        }
        if (r.ok) {
          setState({ kind: "ok" });
          setLastOkAt(Date.now());
          return;
        }
        // Not OK — decide whether we're still inside grace.
        const withinGrace = lastOkAt != null && Date.now() - lastOkAt < GRACE_MS;
        setState(
          withinGrace
            ? { kind: "warn", message: r.message ?? `License ${r.status}` }
            : { kind: "fail", message: r.message ?? `License ${r.status}` },
        );
      } catch {
        // Network / server hiccup — never break the app for it.
        setState((prev) => (prev.kind === "unknown" ? { kind: "unknown" } : prev));
      }
    }
    void tick();
    const id = window.setInterval(tick, REVALIDATE_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [run, lastOkAt]);

  if (state.kind !== "warn" && state.kind !== "fail") return null;

  const isHard = state.kind === "fail";
  return (
    <div
      className={`fixed inset-x-0 top-0 z-[9999] flex items-center gap-2 px-4 py-2 text-sm shadow-md ${
        isHard
          ? "bg-destructive text-destructive-foreground"
          : "bg-amber-500/95 text-amber-950"
      }`}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        {isHard ? "License invalid — " : "License warning — "}
        {state.message}
        {isHard ? " Contact your administrator." : " Grace period active."}
      </span>
    </div>
  );
}
