import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/leaderboard")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/leaderboard", replace: true });
  },
});
