import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

function logSupabaseError(op: string, err: unknown, meta: Record<string, unknown>) {
  if (meta.table === "client_error_logs") return;
  const pg = err as { code?: string; message?: string; status?: number; details?: string };
  logger.error(`Supabase ${op} failed`, err instanceof Error ? err : new Error(pg.message ?? String(err)), {
    ...meta,
    postgresCode: pg.code,
    status: pg.status,
    details: pg.details,
  });
}

async function inspectResult<T>(promise: PromiseLike<T>, op: string, meta: Record<string, unknown>): Promise<T> {
  try {
    const result = await promise;
    const r = result as { error?: unknown };
    if (r && typeof r === "object" && "error" in r && r.error) {
      logSupabaseError(op, r.error, meta);
    }
    return result;
  } catch (err) {
    logSupabaseError(op, err, meta);
    throw err;
  }
}

function wrapBuilder(builder: unknown, meta: Record<string, unknown>): unknown {
  if (!builder || typeof builder !== "object") return builder;
  return new Proxy(builder as object, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (prop === "then" && typeof val === "function") {
        return (onfulfilled?: (v: unknown) => unknown, onrejected?: (e: unknown) => unknown) =>
          inspectResult(
            Promise.resolve().then(() => (val as (this: unknown) => unknown).call(target)),
            "query",
            meta,
          ).then(onfulfilled, onrejected);
      }
      if (typeof val === "function") {
        return (...args: unknown[]) => {
          const result = val.apply(target, args);
          if (result && typeof result === "object") return wrapBuilder(result, meta);
          return result;
        };
      }
      return val;
    },
  });
}

export function attachSupabaseMonitoring(client: SupabaseClient<Database>): SupabaseClient<Database> {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (prop === "from" && typeof val === "function") {
        return (table: string) => wrapBuilder(val.call(target, table), { table, source: "supabase" });
      }
      if (prop === "rpc" && typeof val === "function") {
        return (fn: string, params?: unknown, options?: unknown) =>
          inspectResult(val.call(target, fn, params, options) as PromiseLike<unknown>, "rpc", { rpc: fn });
      }
      if (prop === "storage" && val && typeof val === "object") {
        return new Proxy(val as object, {
          get(st, sp, sr) {
            const sv = Reflect.get(st, sp, sr);
            if (sp === "from" && typeof sv === "function") {
              return (bucket: string) => {
                const bucketApi = sv.call(st, bucket);
                return wrapBuilder(bucketApi, { bucket, source: "supabase-storage" });
              };
            }
            return sv;
          },
        });
      }
      if (prop === "auth" && val && typeof val === "object") {
        return new Proxy(val as object, {
          get(at, ap, ar) {
            const av = Reflect.get(at, ap, ar);
            if (typeof av === "function") {
              return (...args: unknown[]) =>
                inspectResult(av.apply(at, args) as PromiseLike<unknown>, "auth", { op: String(ap) });
            }
            return av;
          },
        });
      }
      return val;
    },
  }) as SupabaseClient<Database>;
}
