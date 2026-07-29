import { QueryCache, QueryClient, MutationCache } from "@tanstack/react-query";
import { logger } from "@/lib/logger";

function logQueryError(error: unknown, queryKey: unknown, meta?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error("Query failed", err, {
    source: "react-query",
    queryKey,
    ...meta,
  });
}

export function createMonitoredQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        logQueryError(error, query.queryKey, {
          endpoint: query.meta?.endpoint,
          statusCode: (error as { status?: number })?.status,
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        logQueryError(error, mutation.options.mutationKey ?? ["mutation"], {
          source: "react-query-mutation",
        });
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          const status = (error as { status?: number })?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return true;
        },
      },
    },
  });
}
