import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type SocialAutomationTab = "overview" | "auto" | "manual" | "settings";

const TABS: { id: SocialAutomationTab; label: string; to: "/admin/social-automation" | "/admin/social-manual-posts"; search?: { tab: SocialAutomationTab } }[] = [
  { id: "overview", label: "Overview", to: "/admin/social-automation", search: { tab: "overview" } },
  { id: "auto", label: "Auto Posts", to: "/admin/social-automation", search: { tab: "auto" } },
  { id: "manual", label: "Manual Posts", to: "/admin/social-manual-posts" },
  { id: "settings", label: "Settings", to: "/admin/social-automation", search: { tab: "settings" } },
];

export function SocialAutomationTabs({ active }: { active: SocialAutomationTab }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 text-muted-foreground">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          to={tab.to}
          search={(tab.search ?? {}) as never}
          className={cn(
            "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition",
            active === tab.id
              ? "bg-background text-foreground shadow"
              : "hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
