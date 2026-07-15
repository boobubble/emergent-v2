import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useCommunity } from "@/lib/community-context";

export const Route = createFileRoute("/community/$slug/")({
  component: CommunityAbout,
});

function CommunityAbout() {
  const { community } = useCommunity();
  return (
    <div className="space-y-4">
      {community.welcome_text && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Welcome</h2>
          <p className="whitespace-pre-wrap text-sm">{community.welcome_text}</p>
        </section>
      )}
      {community.description && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</h2>
          <p className="whitespace-pre-wrap text-sm">{community.description}</p>
        </section>
      )}
      {community.rules && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Shield className="h-3 w-3" />Community rules
          </h2>
          <p className="whitespace-pre-wrap text-sm">{community.rules}</p>
        </section>
      )}
      {community.social_links && Object.keys(community.social_links).length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Links</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(community.social_links).map(([k, v]) => (
              <a key={k} href={String(v)} target="_blank" rel="noopener noreferrer"
                 className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
                {k}
              </a>
            ))}
          </div>
        </section>
      )}
      {!community.welcome_text && !community.description && !community.rules && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          This community hasn't added an about section yet.
        </div>
      )}
    </div>
  );
}
