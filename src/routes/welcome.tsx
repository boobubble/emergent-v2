import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy marketing URL. The welcome UI now lives on the primary SEO homepage.
 * Permanent redirect so crawlers and old links consolidate on `/`.
 */
export const Route = createFileRoute("/welcome")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      replace: true,
      statusCode: 301,
    });
  },
});
