import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, List, Globe2, Map, MapPin, Tags, KeyRound, LayoutTemplate,
  Wand2, Link2, SearchCheck, Download, ArrowRightLeft, FileText, PanelBottom,
} from "lucide-react";

export const PAGES_NAV = [
  { to: "/admin/pages", label: "Dashboard", icon: LayoutDashboard, end: true as boolean },
  { to: "/admin/pages/all", label: "All Pages", icon: List, end: false as boolean },
  { to: "/admin/pages/countries", label: "Countries", icon: Globe2, end: false as boolean },
  { to: "/admin/pages/states", label: "States / Provinces", icon: Map, end: false as boolean },
  { to: "/admin/pages/cities", label: "Cities", icon: MapPin, end: false as boolean },
  { to: "/admin/pages/categories", label: "Categories", icon: Tags, end: false as boolean },
  { to: "/admin/pages/keyword-groups", label: "Keyword Groups", icon: KeyRound, end: false as boolean },
  { to: "/admin/pages/templates", label: "Templates", icon: LayoutTemplate, end: false as boolean },
  { to: "/admin/pages/bulk", label: "Bulk Generator", icon: Wand2, end: false as boolean },
  { to: "/admin/internal-linking", label: "Internal Linking", icon: Link2, end: false as boolean },
  { to: "/admin/pages/seo-audit", label: "SEO Audit", icon: SearchCheck, end: false as boolean },
  { to: "/admin/pages/import-export", label: "Import / Export", icon: Download, end: false as boolean },
  { to: "/admin/pages/redirects", label: "Redirects", icon: ArrowRightLeft, end: false as boolean },
  { to: "/admin/pages/footer-links", label: "Footer Links", icon: PanelBottom, end: false as boolean },
] as const;

export function PagesSubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="mb-4 flex flex-wrap gap-1.5 rounded-lg border border-border bg-muted/20 p-2">
      {PAGES_NAV.map((item) => {
        const active = item.end
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon ?? FileText;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function pageTypeLabel(pageType: string | null | undefined): string {
  if (!pageType) return "Static / Unclassified";
  const map: Record<string, string> = {
    static: "Static",
    country: "Country",
    state: "State",
    city: "City",
    category: "Category",
    country_category: "Country + Category",
    state_category: "State + Category",
    city_category: "City + Category",
    keyword: "Keyword",
    hub: "Hub",
    custom_seo: "Custom SEO",
  };
  return map[pageType] ?? pageType;
}

export function pageTypeBadgeClass(pageType: string | null | undefined): string {
  if (!pageType) return "border-dashed text-muted-foreground";
  return "border-border";
}
