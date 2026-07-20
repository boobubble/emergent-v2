import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy /mehfil → /poetry (permanent redirect).
export const Route = createFileRoute("/mehfil/")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry", replace: true });
  },
});
