import type { ErrorLogPayload } from "./types";

let queue: ErrorLogPayload[] = [];
let flushing = false;

function logPayloadsBeforePersist(batch: ErrorLogPayload[]) {
  for (const row of batch) {
    console.error("[client-error-log]", {
      severity: row.severity,
      message: row.message,
      route: row.route,
      url: row.url,
      stack: row.stack,
      component_stack: row.component_stack,
      metadata: row.metadata,
    });
  }
}

function isTableUnavailableError(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  if (e?.code === "PGRST205") return true;
  const msg = e?.message ?? "";
  return /could not find the table.*client_error_logs/i.test(msg);
}

async function flushQueue() {
  if (flushing || queue.length === 0 || typeof window === "undefined") return;
  flushing = true;
  const batch = queue.splice(0, 10);
  logPayloadsBeforePersist(batch);
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await (supabase as unknown as {
      from: (table: string) => {
        insert: (rows: unknown) => Promise<{ error: unknown }>;
      };
    })
      .from("client_error_logs")
      .insert(
        batch.map((row) => ({
          user_id: row.user_id,
          route: row.route,
          url: row.url,
          message: row.message,
          stack: row.stack,
          component_stack: row.component_stack,
          browser: row.browser,
          os: row.os,
          device: row.device,
          screen: row.screen,
          app_version: row.app_version,
          build_version: row.build_version,
          severity: row.severity,
          metadata: row.metadata ?? {},
        })),
      );
    if (error && !isTableUnavailableError(error)) {
      console.warn(
        "[client-error-log] persist failed:",
        (error as { code?: string; message?: string }).code ?? "unknown",
      );
    }
  } catch {
    /* never throw from logger */
  } finally {
    flushing = false;
    if (queue.length) void flushQueue();
  }
}

export function persistErrorLog(payload: ErrorLogPayload) {
  if (import.meta.env.DEV) return;
  queue.push(payload);
  void flushQueue();
}
