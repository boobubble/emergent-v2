import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/compose")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/compose", replace: true });
  },
});
