import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/admin/social-feed")({ component: SocialFeedHub });

function SocialFeedHub() {
  return (
    <div>
      <AdminPageHeader
        title="Social Feed"
        description="Dedicated admin space for social feed settings."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Nothing here yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              This page is reserved for upcoming social feed admin tools. Settings will appear here as they are added.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
