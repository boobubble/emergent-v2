import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPoemsByCategory } from "@/lib/mehfil.functions";
import { MehfilShell } from "@/components/mehfil/MehfilShell";
import { PoemCard } from "@/components/mehfil/PoemCard";

export const Route = createFileRoute("/mehfil/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.slug)} Poetry · Mehfil` },
      { name: "description", content: `Read the best ${params.slug.replace(/-/g, " ")} poems from the Mehfil community.` },
      { property: "og:title", content: `${cap(params.slug)} Poetry · Mehfil` },
      { property: "og:description", content: `Read the best ${params.slug.replace(/-/g, " ")} poems from the Mehfil community.` },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <MehfilShell showBack><div className="py-20 text-center text-sm text-muted-foreground">Category not found.</div></MehfilShell>
  ),
  errorComponent: () => (
    <MehfilShell showBack><div className="py-20 text-center text-sm text-destructive">Failed to load poems.</div></MehfilShell>
  ),
});

function cap(s: string) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState<"new" | "trending" | "top">("new");
  const fetchList = useServerFn(listPoemsByCategory);

  const q = useQuery({
    queryKey: ["mehfil", "category", slug, sort],
    queryFn: () => fetchList({ data: { slug, sort } }),
  });

  if (q.data && !q.data.category) throw notFound();

  return (
    <MehfilShell showBack>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Mehfil Category</div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: q.data?.category?.color ?? undefined }}>
            {q.data?.category?.name ?? cap(slug)}
          </h1>
          {q.data?.category?.description && (
            <p className="mt-1 text-sm text-muted-foreground">{q.data.category.description}</p>
          )}
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          {(["new", "trending", "top"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize ${sort === s ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (q.data?.poems.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          No poems here yet. <Link to="/mehfil/compose" className="font-semibold text-primary underline">Be the first to write</Link>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {q.data?.poems.map((p) => <PoemCard key={p.id} poem={p} />)}
        </div>
      )}
    </MehfilShell>
  );
}
