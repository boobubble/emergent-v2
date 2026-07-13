import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ComingSoon } from "./reels";

export const Route = createFileRoute("/pages")({
  head: () => ({
    meta: [
      { title: "Pages" },
      { name: "description", content: "Discover and follow community pages ." },
      { property: "og:title", content: "Pages" },
      { property: "og:description", content: "Discover and follow community pages ." },
    ],
  }),
  component: () => <ComingSoon icon={FileText} title="Pages" tagline="Follow brands, creators, and communities." />,
});
