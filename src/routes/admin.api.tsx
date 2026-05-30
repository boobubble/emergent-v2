import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin/api")({ component: ApiPage });

function ApiPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="API & Webhooks" description="Outbound webhooks and API keys. Super admin only." />
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <KeyRound className="h-8 w-8 opacity-50" />
          <div className="text-sm">Webhook and API key management coming soon.</div>
        </CardContent>
      </Card>
    </div>
  );
}
