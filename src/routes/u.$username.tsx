import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/u/$username")({
  component: () => {
    const { username } = Route.useParams();
    return <Navigate to="/feed" search={{ u: username } as never} replace />;
  },
});
