import { createFileRoute, Navigate } from "@tanstack/react-router";
import { loadPrivateRouteSeo, headFromRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  loader: () => loadPrivateRouteSeo("/account", "Account", "Manage your account settings."),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: () => <Navigate to="/feed" search={{ tab: "account" } as never} replace />,
});
