import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mehfil/category/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/poetry/category/$slug", params: { slug: params.slug }, replace: true });
  },
});
