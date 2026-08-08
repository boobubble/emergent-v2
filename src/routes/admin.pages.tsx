import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PagesSubnav } from "@/components/admin/pages/PagesSubnav";
import { SeoManagerLink } from "@/components/admin/seo/SeoPreviewPanels";

export const Route = createFileRoute("/admin/pages")({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="space-y-1">
      <AdminPageHeader
        title="Pages"
        description="Manage normal pages and programmatic SEO pages. custom_pages remains the single source of truth."
        actions={<SeoManagerLink category="blog-static" />}
      />
      <PagesSubnav />
      <Outlet />
    </div>
  );
}
