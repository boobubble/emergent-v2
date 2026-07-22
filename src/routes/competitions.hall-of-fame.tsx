import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/competitions/hall-of-fame")({
  head: () => ({
    meta: [
      { title: "Hall of Fame — Champions" },
      { name: "robots", content: "noindex" },
      { rel: "canonical", href: "/hall-of-fame" } as any,
    ],
  }),
  component: () => <Navigate to="/hall-of-fame" search={{ tab: "competitions" }} replace />,
});
