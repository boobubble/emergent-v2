import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical chat URL is /chatroom. /chatrooms redirects there to avoid
// duplicate routes for the same experience.
export const Route = createFileRoute("/chatrooms")({
  beforeLoad: () => {
    throw redirect({ to: "/chatroom", replace: true });
  },
});
