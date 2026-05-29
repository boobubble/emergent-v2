import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { ComingSoon } from "./reels";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — Palrgo" },
      { name: "description", content: "Join groups around your interests on Palrgo." },
      { property: "og:title", content: "Groups — Palrgo" },
      { property: "og:description", content: "Join groups around your interests on Palrgo." },
    ],
  }),
  component: () => <ComingSoon icon={Users2} title="Groups" tagline="Hang out with people who share your interests." />,
});
