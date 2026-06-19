import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/u/$username")({
  component: UserProfileRedirect,
});

function UserProfileRedirect() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const isSelf =
    !!user?.username &&
    user.username.toLowerCase() === username.toLowerCase();
  if (isSelf) {
    return <Navigate to="/feed" search={{ tab: "account" } as never} replace />;
  }
  return <Navigate to="/feed" search={{ u: username } as never} replace />;
}
