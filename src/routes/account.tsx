import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  component: () => <Navigate to="/feed" search={{ tab: "account" } as never} replace />,
});
