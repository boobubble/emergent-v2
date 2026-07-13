import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { ComingSoon } from "./reels";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups" },
      { name: "description", content: "Join groups around your interests ." },
      { property: "og:title", content: "Groups" },
      { property: "og:description", content: "Join groups around your interests ." },
    ],
  }),
  component: () => <ComingSoon icon={Users2} title="Groups" tagline="Hang out with people who share your interests." />,
});
