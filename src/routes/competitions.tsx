import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";

export const Route = createFileRoute("/competitions")({
  component: () => (
    <RouteErrorBoundary section="Competitions">
      <Outlet />
    </RouteErrorBoundary>
  ),
});
