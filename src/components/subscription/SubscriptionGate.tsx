import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { useMySubscription, useSubscriptionMode } from "@/lib/use-subscription";

const ALLOWED_PATHS = ["/pricing", "/auth", "/installer", "/banned", "/welcome", "/login", "/reset-password"];

/**
 * When admin sets subscription mode to "required", signed-in users without an
 * active subscription are redirected to /pricing. Mounted globally in __root.
 */
export function SubscriptionGate() {
  const { user } = useAuth();
  const { data: cfg } = useSubscriptionMode();
  const { data: mySub, isLoading } = useMySubscription();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user || isLoading) return;
    if (cfg?.mode !== "required") return;
    if (mySub?.isActive) return;
    if (ALLOWED_PATHS.some((p) => path.startsWith(p))) return;
    if (path.startsWith("/admin")) return;
    navigate({ to: "/pricing" } as never);
  }, [user, cfg?.mode, mySub?.isActive, isLoading, path, navigate]);

  return null;
}
