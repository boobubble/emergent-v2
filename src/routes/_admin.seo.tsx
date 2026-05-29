import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, ComingSoonPanel } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_admin/seo")({ component: () => (
  <div>
    <AdminPageHeader title="SEO" description="Per-page metadata, social cards, and indexing rules." />
    <ComingSoonPanel title="SEO editor" points={[
      "Per-page title & description",
      "Open Graph & Twitter cards",
      "robots.txt & sitemap controls",
    ]} />
  </div>
)});
