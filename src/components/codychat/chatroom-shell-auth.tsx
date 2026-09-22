import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { AuthenticatedSurfaceProviders } from "@/components/app/app-shells";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useSocialGraphOptional } from "@/lib/use-social-graph";

export function ChatroomShellSignInPrompt({ label }: { label?: string }) {
  const { requireAuth, openSignUp } = useAuthGate();
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {label ?? "Sign in to use your Yaarzo account in this panel."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          onClick={() => requireAuth()}
        >
          Sign in
        </button>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          onClick={() => openSignUp()}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}

type ChatroomShellAuthenticatedSurfaceProps = {
  children: ReactNode;
  /** When true, guests see a sign-in prompt instead of panel content. */
  requireSignedInUser?: boolean;
};

/**
 * Ensures chatroom shell panels use the same Supabase-backed Yaarzo auth context
 * and data providers as /feed, /find-friends, /poetry, and /confessions.
 */
export function ChatroomShellAuthenticatedSurface({
  children,
  requireSignedInUser = false,
}: ChatroomShellAuthenticatedSurfaceProps) {
  const { user, ready } = useAuth();
  const parentSocial = useSocialGraphOptional();
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    void loadBrowserSupabase()
      .then(() => setSupabaseReady(true))
      .catch(() => setSupabaseReady(true));
  }, []);

  if (!ready || !supabaseReady) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary/80" aria-hidden />
      </div>
    );
  }

  if (requireSignedInUser && !user) {
    return <ChatroomShellSignInPrompt />;
  }

  if (!user || parentSocial) {
    return <>{children}</>;
  }

  return (
    <AuthenticatedSurfaceProviders key={user.id}>
      {children}
    </AuthenticatedSurfaceProviders>
  );
}
