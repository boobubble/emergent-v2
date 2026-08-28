import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogProse } from "@/components/blog/BlogProse";
import { ImageStatusBadge } from "@/components/content-images/ImageStatusBadge";
import { summarizeContentImages } from "@/lib/content-image-seo";
import "@/components/blog/blog-ui.css";

export type ModeratePost = {
  id: string;
  title: string;
  content: string;
  meta_description: string | null;
  status: string | null;
  categories?: { name: string } | null;
};

export function BlogModerateView({
  posts,
  loading,
  onUpdateStatus,
}: {
  posts: ModeratePost[];
  loading: boolean;
  onUpdateStatus: (id: string, status: "published" | "rejected") => void;
}) {
  return (
    <div className="yz-blog space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Blog Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submissions and scan Image Status. Approving publishes with existing rules. Image work never blocks publish.
        </p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading posts…</p>}
      {!loading && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No posts right now.
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const imageStatus = summarizeContentImages(post.content);
          const pending = (post.status ?? "pending") === "pending";
          const editorHref = `/blog/write?id=${encodeURIComponent(post.id)}&imageSeo=1`;
          return (
            <article key={post.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
                    <Badge variant="secondary" className="capitalize">
                      {post.status ?? "pending"}
                    </Badge>
                    <a href={editorHref} className="inline-flex">
                      <ImageStatusBadge status={imageStatus} compact />
                    </a>
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
                    {post.categories?.name ?? "Uncategorized"}
                  </p>
                </div>
              </div>
              {post.meta_description && (
                <p className="mt-2 text-sm text-muted-foreground">{post.meta_description}</p>
              )}
              <div className="mt-4 max-h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-background px-4 py-3">
                <BlogProse html={post.content} className="text-sm [&]:text-sm" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild>
                  <a href={editorHref}>Edit</a>
                </Button>
                {pending && (
                  <>
                    <Button type="button" onClick={() => onUpdateStatus(post.id, "published")}>
                      Approve &amp; Publish
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onUpdateStatus(post.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
