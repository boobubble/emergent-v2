import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible } from "@/components/admin/Collapsible";
import { Filter } from "lucide-react";

export const Route = createFileRoute("/admin/filters")({ component: FiltersPage });

function FiltersPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Filters" description="Word filters and content rules for chat and feed." />
      <Collapsible title="Word filter" description="Block specific words across the platform.">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Word list editor coming soon.
          </CardContent>
        </Card>
      </Collapsible>
      <Collapsible title="Link filter" description="Block external links and domains.">
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">Domain blocklist editor coming soon.</CardContent>
        </Card>
      </Collapsible>
    </div>
  );
}
