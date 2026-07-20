import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/challenges")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/challenges", replace: true });
  },
});
