import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, MessageSquare, MessagesSquare, Users, Newspaper, Bell } from "lucide-react";

export const Route = createFileRoute("/admin/realtime")({ component: RealtimePage });

const CHANNELS = [
  { key: "chat",          label: "Chat Realtime",         icon: MessageSquare,  description: "Public + private room messages.",          status: "active" },
  { key: "dm",            label: "DM Realtime",           icon: MessagesSquare, description: "Direct messages between friends.",         status: "active" },
  { key: "presence",      label: "Presence System",       icon: Users,          description: "Online / typing indicators.",              status: "active" },
  { key: "feed",          label: "Feed Realtime",         icon: Newspaper,      description: "New posts, reactions and comments.",       status: "active" },
  { key: "notifications", label: "Notifications Realtime", icon: Bell,          description: "Live in-app notification delivery.",       status: "active" },
] as const;

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
    : status === "degraded" ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
    : "bg-red-500/15 text-red-600 dark:text-red-300";
  return <Badge variant="outline" className={`h-5 border-0 px-1.5 text-[10px] capitalize ${tone}`}>{status}</Badge>;
}

function RealtimePage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Realtime"
        description="Monitoring placeholders for live channels. Live metrics ship in a later step — current realtime implementation is unchanged."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.key}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="ml-auto"><StatusBadge status={c.status} /></div>
                </div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Metric label="Subs"   value="—" />
                  <Metric label="Msg/s"  value="—" />
                  <Metric label="Errors" value="—" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
          <Radio className="h-7 w-7 opacity-50" />
          <div className="text-sm">Debug stream placeholder — wire to Supabase Realtime metrics later.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-mono font-semibold">{value}</div>
    </div>
  );
}
