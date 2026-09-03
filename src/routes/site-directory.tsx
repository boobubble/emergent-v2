import { createFileRoute } from "@tanstack/react-router";
import { staticPublicHead } from "@/lib/seo";

export const Route = createFileRoute("/site-directory")({
  loader: async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("custom_pages")
      .select("slug, h1, title, category")
      .eq("status", "published")
      .order("category")
      .order("h1");
    const pages = (data ?? []).map((p) => ({
      slug: p.slug,
      title: p.h1 || p.title,
      category: p.category || "other",
    }));
    return { pages };
  },
  head: () =>
    staticPublicHead({
      title: "Site Directory | Yaarzo",
      description: "Browse all chat rooms and pages on Yaarzo, organized by category.",
      path: "/site-directory",
    }),
  component: SiteDirectoryPage,
});

function SiteDirectoryPage() {
  const { pages } = Route.useLoaderData();

  const grouped = pages.reduce((acc: Record<string, typeof pages>, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    type: "Chat Room Types",
    country: "Countries",
    india_city: "India — Cities",
    pakistan_city: "Pakistan — Cities",
    us_city: "USA — Cities",
    uk_city: "UK — Cities",
    canada_city: "Canada — Cities",
    australia_city: "Australia — Cities",
    interest: "Interests",
    language: "Languages",
    country_language: "Country + Language",
    india_state: "India — States",
    pakistan_province: "Pakistan — Provinces",
    pakistan_subcategory: "Pakistan — Categories",
    india_subcategory: "India — Categories",
    city_subcategory: "City — Categories",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Site Directory</h1>
        <p className="text-muted-foreground mb-8">Browse every chat room and page on Yaarzo.</p>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{categoryLabels[category] ?? category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((p) => (
                <a key={p.slug} href={`/${p.slug}`} className="text-sm text-primary hover:underline">
                  {p.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
