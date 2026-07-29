import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createMonitoredQueryClient } from "./lib/query-client";

export const getRouter = () => {
  const queryClient = createMonitoredQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
