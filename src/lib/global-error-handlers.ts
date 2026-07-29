import { logger } from "@/lib/logger";

let registered = false;

function isAbortError(reason: unknown): boolean {
  if (!reason) return false;
  if (reason instanceof DOMException && reason.name === "AbortError") return true;
  if (reason instanceof Error && reason.name === "AbortError") return true;
  const msg = typeof reason === "string" ? reason : (reason as Error)?.message ?? "";
  return /abort|cancelled|canceled|signal is aborted/i.test(msg);
}

export function registerGlobalErrorHandlers() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  window.addEventListener("error", (event) => {
    logger.capture({
      severity: "error",
      message: event.message || "Uncaught error",
      stack: event.error?.stack ?? null,
      metadata: {
        source: "window.onerror",
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (isAbortError(reason)) return;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.capture({
      severity: "error",
      message: err.message || "Unhandled promise rejection",
      stack: err.stack ?? null,
      metadata: { source: "unhandledrejection" },
    });
  });
}
