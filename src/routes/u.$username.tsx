import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  loadDynamicRouteSeo,
  headFromRouteSeo,
  buildProfileSeoVars,
  loadSeoSiteContext,
} from "@/lib/seo";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const username = params.username;
    const { origin, siteName } = await loadSeoSiteContext();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id,username,display_name,bio,avatar_url,is_private")
      .ilike("username", username)
      .maybeSingle();

    const slug = profile?.username ?? username;
    const url = `${origin}/u/${slug}`;

    if (!profile) {
      const seoData = await loadDynamicRouteSeo({
        templatePath: "/u/$username",
        instancePath: `/u/${username}`,
        vars: buildProfileSeoVars({
          profile: {},
          username,
          siteName,
          origin,
        }),
        fallback: {
          title: `@${username}`,
          description: "User profile",
          noindex: true,
          nofollow: true,
          robots: "noindex, nofollow",
          canonical: url,
        },
        entityOverride: { noindex: true, nofollow: true, robots: "noindex, nofollow" },
      });
      return { seoData };
    }

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
  head: ({ loaderData }) => headFromRouteSeo(loaderData?.seoData),
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
