import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/poetry/$slug", params: { slug: params.slug }, replace: true });
  },
});
