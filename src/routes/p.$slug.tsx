import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy /p/:slug URLs now redirect to the root-level canonical URL.
export const Route = createFileRoute("/p/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$slug", params: { slug: params.slug }, replace: true });
  },
});
