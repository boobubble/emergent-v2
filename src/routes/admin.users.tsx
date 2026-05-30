import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Users" description="Search, manage and message your members." />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <Users2 className="h-8 w-8 opacity-50" />
          <div className="text-sm">User management UI is coming soon.</div>
          <div className="text-xs">Roles can be managed under Moderation → Roles in the meantime.</div>
        </CardContent>
      </Card>
    </div>
  );
}
