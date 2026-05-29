import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/social-feed")({ component: SocialFeedHub });

function SocialFeedHub() {
  const items = ADMIN_NAV.filter((i) => i.group === "Social Feed");
  return (
    <div>
      <AdminPageHeader
        title="Social Feed"
        description="Everything that powers the social side of the platform — feed layout, custom pages and the rewards economy."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <Link key={i.to} to={i.to} className="group">
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{i.label}</span>
                      {i.badge && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{i.badge}</Badge>}
                    </div>
                    {i.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{i.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
