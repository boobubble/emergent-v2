import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { registerGlobalErrorHandlers } from "@/lib/global-error-handlers";
import { setLoggerContext } from "@/lib/logger";

/** Mount once near app root: global listeners + logger context sync. */
export function GlobalErrorMonitoring() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    registerGlobalErrorHandlers();
  }, []);

  useEffect(() => {
    setLoggerContext({
      route: location.pathname,
      userId: user?.id ?? null,
    });
  }, [location.pathname, user?.id]);

  return null;
}
