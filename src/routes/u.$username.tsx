import { createFileRoute, Navigate, notFound } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { getPublicProfileByUsernameFn } from "@/lib/profile.functions";
import { getPublicProfileByUsername, normalizeProfileUsernameParam } from "@/lib/profile.public";
import {
  loadDynamicRouteSeo,
  headFromRouteSeo,
  buildProfileSeoVars,
  loadSeoSiteContext,
  notFoundSeoHead,
} from "@/lib/seo";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const username = normalizeProfileUsernameParam(params.username);
    if (!username) throw notFound();

    // SSR uses service-role lookup. Client navigations cannot import
    // client.server (stub throws `supabaseAdmin is server-only`), so they RPC
    // through getPublicProfileByUsernameFn instead.
    let origin = "";
    let siteName = "Yaarzo";
    try {
      const ctx = await loadSeoSiteContext();
      origin = ctx.origin;
      siteName = ctx.siteName;
    } catch {
      origin = typeof window !== "undefined" ? window.location.origin : "";
    }

    const profile = typeof window === "undefined"
      ? await getPublicProfileByUsername(username)
      : await getPublicProfileByUsernameFn({ data: { username } });

    const slug = profile?.username ?? username;
    const url = `${origin}/u/${slug}`;

    if (!profile) throw notFound();

    const name = profile.display_name || profile.username;
    const isPrivate = profile.is_private === true;
    const seoData = await loadDynamicRouteSeo({
      templatePath: "/u/$username",
      instancePath: `/u/${slug}`,
      vars: buildProfileSeoVars({
        profile: profile as unknown as Record<string, unknown>,
        username: slug,
        siteName,
        origin,
      }),
      fallback: {
        title: `${name} (@${slug})`,
        description: profile.bio || `${name} on ${siteName}`,
        ogTitle: `${name} (@${slug})`,
        ogDescription: profile.bio || `${name} on ${siteName}`,
        twitterTitle: `${name} (@${slug})`,
        twitterDescription: profile.bio || `${name} on ${siteName}`,
        ogImage: profile.avatar_url ?? undefined,
        twitterImage: profile.avatar_url ?? undefined,
        canonical: url,
        noindex: isPrivate,
        nofollow: isPrivate,
        robots: isPrivate ? "noindex, nofollow" : undefined,
      },
      entityOverride: isPrivate
        ? { noindex: true, nofollow: true, robots: "noindex, nofollow" }
        : undefined,
    });
    return { seoData };
  },
  head: ({ loaderData }) =>
    loaderData?.seoData ? headFromRouteSeo(loaderData.seoData) : notFoundSeoHead(),
  notFoundComponent: MissingProfileNotFound,
  component: UserProfileRedirect,
});

function MissingProfileNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This profile is not available.</p>
      </div>
    </div>
  );
}

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
