import type { ErrorLogPayload } from "./types";

let queue: ErrorLogPayload[] = [];
let flushing = false;

async function flushQueue() {
  if (flushing || queue.length === 0 || typeof window === "undefined") return;
  flushing = true;
  const batch = queue.splice(0, 10);
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await (supabase as unknown as { from: (t: string) => { insert: (r: unknown) => Promise<unknown> } })
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
