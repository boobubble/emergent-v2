import { createFileRoute, redirect } from "@tanstack/react-router";

// Back-compat alias. The canonical chatroom route is /chatroom.
export const Route = createFileRoute("/chat")({
  beforeLoad: () => {
    throw redirect({ to: "/chatroom", replace: true });
  },
});
