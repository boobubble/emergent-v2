import { createFileRoute, Navigate } from "@tanstack/react-router";

// Settings moved to the Broadcaster Studio. Keep this route as a redirect
// so old links / bookmarks land in the right place.
export const Route = createFileRoute("/admin/dj")({
  component: () => <Navigate to="/broadcaster" replace />,
});
