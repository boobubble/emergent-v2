import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/hall-of-fame")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/hall-of-fame", replace: true });
  },
});
