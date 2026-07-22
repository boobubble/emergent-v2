import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/poetry/hall-of-fame")({
  head: () => ({
    meta: [
      { title: "Hall of Fame — Poetry Champions" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Navigate to="/hall-of-fame" search={{ tab: "poetry" }} replace />,
});
