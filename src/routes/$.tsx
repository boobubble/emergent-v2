import { createFileRoute, notFound } from "@tanstack/react-router";
import { notFoundSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/$")({
  loader: () => {
    throw notFound();
  },
  head: () => notFoundSeoHead(),
  component: () => null,
});
