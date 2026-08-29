import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Pencil, Plus, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogProse } from "@/components/blog/BlogProse";
import { excerptFromHtml, formatBlogTimestamp } from "@/components/blog/blog-format";
import { ImageStatusBadge } from "@/components/content-images/ImageStatusBadge";
import { summarizeContentImages, type ImageStatusKind } from "@/lib/content-image-seo";
import { publicBlogTags } from "@/lib/blog.public";
import { parseKeywordPhrases } from "@/lib/blog-taxonomy";
import { cn } from "@/lib/utils";

export type ModeratePost = {
  id: string;
  title: string;
  slug?: string | null;
  content: string;
  meta_description: string | null;
  status: string | null;
  published_at?: string | null;
  tags?: string[] | null;
  keywords?: string | null;
  categories?: { name: string } | null;
};

type StatusFilter = "all" | "published" | "draft" | "pending" | "rejected";
type ImageFilter = "all" | ImageStatusKind;

const QUICK_FILTERS: { name: string; status: StatusFilter; image: ImageFilter }[] = [
  { name: "All Blogs", status: "all", image: "all" },
  { name: "Published", status: "published", image: "all" },
  { name: "Draft", status: "draft", image: "all" },
  { name: "Pending", status: "pending", image: "all" },
  { name: "Rejected", status: "rejected", image: "all" },
  { name: "Missing Images", status: "all", image: "missing" },
  { name: "Image Needs Attention", status: "all", image: "attention" },
  { name: "Image Ready", status: "all", image: "ready" },
];

function postStatus(post: ModeratePost): string {
  return post.status ?? "pending";
}

function postExcerpt(post: ModeratePost): string {
  const meta = post.meta_description?.trim();
  if (meta) return meta;
  return excerptFromHtml(post.content, 120);
}

function editorHref(id: string, imageSeo = false) {
  const base = `/blog/write?id=${encodeURIComponent(id)}`;
  return imageSeo ? `${base}&imageSeo=1` : base;
}

export function BlogModerateView({
  posts,
  loading,
  onUpdateStatus,
}: {
  posts: ModeratePost[];
  loading: boolean;
  onUpdateStatus: (id: string, status: "published" | "rejected") => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter, imageFilter, pageSize]);

  const rows = useMemo(
    () =>
      posts.map((post) => ({
        post,
        status: postStatus(post),
        category: post.categories?.name ?? "Uncategorized",
        slug: post.slug?.trim() || "",
        tags: publicBlogTags(post.tags),
        keywords: parseKeywordPhrases(post.keywords),
        imageStatus: summarizeContentImages(post.content),
        excerpt: postExcerpt(post),
        updated: formatBlogTimestamp(post.published_at),
      })),
    [posts],
  );

  const categories = useMemo(() => {
    const names = [...new Set(rows.map((row) => row.category))];
    names.sort((a, b) => a.localeCompare(b));
    return names;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = debouncedSearch.toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (categoryFilter !== "all" && row.category !== categoryFilter) return false;
      if (imageFilter !== "all" && row.imageStatus.kind !== imageFilter) return false;
      if (!needle) return true;
      const haystack = [
        row.post.title,
        row.slug,
        row.category,
        row.tags.join(" "),
        row.keywords.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, debouncedSearch, statusFilter, categoryFilter, imageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.post.id));
  const preview = previewId ? rows.find((row) => row.post.id === previewId) : undefined;

  function resetFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setImageFilter("all");
    setPage(1);
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(pageRows.map((r) => r.post.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function previewHref(row: (typeof rows)[number]) {
    if (row.status === "published" && row.slug) return `/blog/${row.slug}`;
    return null;
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Blogs"
        description="Manage, review, edit and publish blog posts."
      />

      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search title, slug, category, tags, keywords…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-xs"
              aria-label="Search blogs"
            />
            <a href="/blog/write">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                New Blog
              </Button>
            </a>
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_FILTERS.map((v) => {
              const active = statusFilter === v.status && imageFilter === v.image;
              return (
                <Button
                  key={v.name}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => {
                    setStatusFilter(v.status);
                    setImageFilter(v.image);
                  }}
                >
                  {v.name}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              aria-label="Status filter"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              aria-label="Category filter"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Image filter"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={imageFilter}
              onChange={(e) => setImageFilter(e.target.value as ImageFilter)}
            >
              <option value="all">All images</option>
              <option value="ready">Ready</option>
              <option value="attention">Needs Attention</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Card className="hidden md:block">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="w-8 p-2">
                      <Checkbox checked={allSelected} onCheckedChange={() => toggleAll()} />
                    </th>
                    <th className="p-2">Blog</th>
                    <th className="p-2">Slug</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Tags</th>
                    <th className="p-2">Author</th>
                    <th className="p-2">Updated</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <BlogTableRow
                      key={row.post.id}
                      row={row}
                      selected={selected.has(row.post.id)}
                      onToggle={() => toggleOne(row.post.id)}
                      onPreview={() => {
                        const href = previewHref(row);
                        if (href) window.open(href, "_blank", "noopener,noreferrer");
                        else setPreviewId(row.post.id);
                      }}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                  {!pageRows.length && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted-foreground">
                        No blogs match filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="space-y-2 md:hidden">
            {!pageRows.length && (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No blogs match filters.
                </CardContent>
              </Card>
            )}
            {pageRows.map((row) => (
              <BlogMobileCard
                key={row.post.id}
                row={row}
                selected={selected.has(row.post.id)}
                onToggle={() => toggleOne(row.post.id)}
                onPreview={() => {
                  const href = previewHref(row);
                  if (href) window.open(href, "_blank", "noopener,noreferrer");
                  else setPreviewId(row.post.id);
                }}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages} · {filtered.length} total
          {selected.size > 0 && ` · ${selected.size} selected`}
        </span>
        <select
          className="rounded border bg-background px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value) as 25 | 50 | 100)}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{preview?.post.title ?? "Preview"}</DialogTitle>
            <DialogDescription>
              Admin-only preview. Unpublished posts are not opened on the public blog URL.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1">
              <BlogProse html={preview.post.content} className="text-sm [&]:text-sm" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type RowModel = {
  post: ModeratePost;
  status: string;
  category: string;
  slug: string;
  tags: string[];
  keywords: string[];
  imageStatus: ReturnType<typeof summarizeContentImages>;
  excerpt: string;
  updated: string;
};

function BlogTableRow({
  row,
  selected,
  onToggle,
  onPreview,
  onUpdateStatus,
}: {
  row: RowModel;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onUpdateStatus: (id: string, status: "published" | "rejected") => void;
}) {
  const pending = row.status === "pending";
  const extraTags = Math.max(0, row.tags.length - 2);
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="p-2">
        <Checkbox checked={selected} onCheckedChange={() => onToggle()} />
      </td>
      <td className="max-w-[220px] p-2">
        <a href={editorHref(row.post.id)} className="block truncate font-medium hover:underline">
          {row.post.title || "(untitled)"}
        </a>
        {row.excerpt && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.excerpt}</p>
        )}
      </td>
      <td className="p-2 font-mono text-xs">{row.slug || "—"}</td>
      <td className="p-2">
        <a href={editorHref(row.post.id, true)} className="inline-flex" title="Open Image SEO">
          <ImageStatusBadge status={row.imageStatus} compact />
        </a>
      </td>
      <td className="p-2">
        <Badge variant="outline" className="text-[10px] capitalize">
          {row.status}
        </Badge>
      </td>
      <td className="p-2 text-xs">{row.category}</td>
      <td className="max-w-[140px] p-2">
        <div className="flex flex-wrap gap-1">
          {row.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="max-w-[88px] truncate text-[10px]">
              {tag}
            </Badge>
          ))}
          {extraTags > 0 && <span className="text-[10px] text-muted-foreground">+{extraTags}</span>}
          {!row.tags.length && <span className="text-xs text-muted-foreground">—</span>}
        </div>
      </td>
      <td className="p-2 text-xs text-muted-foreground">—</td>
      <td className="p-2 text-xs text-muted-foreground">{row.updated}</td>
      <td className="p-2">
        <RowActions
          id={row.post.id}
          pending={pending}
          onPreview={onPreview}
          onUpdateStatus={onUpdateStatus}
        />
      </td>
    </tr>
  );
}

function BlogMobileCard({
  row,
  selected,
  onToggle,
  onPreview,
  onUpdateStatus,
}: {
  row: RowModel;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onUpdateStatus: (id: string, status: "published" | "rejected") => void;
}) {
  const pending = row.status === "pending";
  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <Checkbox checked={selected} onCheckedChange={() => onToggle()} className="mt-1" />
          <div className="min-w-0 flex-1">
            <a href={editorHref(row.post.id)} className="font-medium hover:underline">
              {row.post.title || "(untitled)"}
            </a>
            {row.excerpt && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{row.excerpt}</p>
            )}
            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{row.slug || "—"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] capitalize">
                {row.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{row.category}</span>
              <a href={editorHref(row.post.id, true)} className="inline-flex">
                <ImageStatusBadge status={row.imageStatus} compact />
              </a>
            </div>
          </div>
        </div>
        <RowActions
          id={row.post.id}
          pending={pending}
          onPreview={onPreview}
          onUpdateStatus={onUpdateStatus}
        />
      </CardContent>
    </Card>
  );
}

function RowActions({
  id,
  pending,
  onPreview,
  onUpdateStatus,
}: {
  id: string;
  pending: boolean;
  onPreview: () => void;
  onUpdateStatus: (id: string, status: "published" | "rejected") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <a href={editorHref(id)}>
        <Button size="icon" variant="ghost" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </a>
      <Button size="icon" variant="ghost" title="Preview" onClick={onPreview}>
        <Eye className="h-4 w-4" />
      </Button>
      {pending && (
        <>
          <Button
            size="icon"
            variant="ghost"
            title="Approve & Publish"
            onClick={() => onUpdateStatus(id, "published")}
          >
            <Check className={cn("h-4 w-4")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Reject"
            onClick={() => onUpdateStatus(id, "rejected")}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
