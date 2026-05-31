import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Palrgo" },
      { name: "description", content: "Sign in or create your Palrgo account." },
    ],
  }),
  component: AuthScreen,
});
