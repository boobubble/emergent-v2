import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ComingSoon } from "./reels";

export const Route = createFileRoute("/pages")({
  head: () => ({
    meta: [
      { title: "Pages — Palrgo" },
      { name: "description", content: "Discover and follow community pages on Palrgo." },
      { property: "og:title", content: "Pages — Palrgo" },
      { property: "og:description", content: "Discover and follow community pages on Palrgo." },
    ],
  }),
  component: () => <ComingSoon icon={FileText} title="Pages" tagline="Follow brands, creators, and communities." />,
});
