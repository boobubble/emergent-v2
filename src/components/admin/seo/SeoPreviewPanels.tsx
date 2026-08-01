import { Link } from "@tanstack/react-router";
import type { ResolvedSeo } from "@/lib/seo/types";
import type { SeoInventoryCategoryId } from "@/lib/seo/inventory-categories";

export function SeoPreviewPanels({ seo }: { seo: ResolvedSeo }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <PreviewCard title="Google">
        <div className="text-[#1a0dab] text-base font-medium leading-snug truncate">{seo.title}</div>
        <div className="text-[#006621] text-xs truncate">{seo.canonical}</div>
        <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{seo.description}</div>
      </PreviewCard>
      <PreviewCard title="Facebook">
        <div className="rounded-md border bg-muted/30 overflow-hidden">
          {seo.ogImage ? (
            <img src={seo.ogImage} alt="" className="h-24 w-full object-cover" />
          ) : (
            <div className="grid h-24 place-items-center text-xs text-muted-foreground">No OG image</div>
          )}
          <div className="p-2 text-left">
            <div className="text-[10px] uppercase text-muted-foreground truncate">{new URL(seo.canonical || "https://example.com").hostname}</div>
            <div className="text-sm font-semibold line-clamp-1">{seo.ogTitle}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{seo.ogDescription}</div>
          </div>
        </div>
      </PreviewCard>
      <PreviewCard title="Twitter / X">
        <div className="rounded-xl border overflow-hidden">
          {seo.twitterImage ? (
            <img src={seo.twitterImage} alt="" className="h-24 w-full object-cover" />
          ) : (
            <div className="grid h-24 place-items-center text-xs text-muted-foreground bg-muted/30">No card image</div>
          )}
          <div className="p-2 text-left">
            <div className="text-sm font-semibold line-clamp-1">{seo.twitterTitle}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{seo.twitterDescription}</div>
          </div>
        </div>
      </PreviewCard>
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

/** Link to centralized SEO Manager; legacy per-page SEO forms stay in code but hidden. */
export function SeoManagerLink({ category }: { category?: SeoInventoryCategoryId }) {
  const to = category ? `/admin/seo?category=${category}` : "/admin/seo";
  return (
    <Link to={to} className="inline-flex items-center rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
      Manage SEO in SEO Manager
    </Link>
  );
}
