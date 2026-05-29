import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/chatrooms")({ component: ChatroomsHub });

function ChatroomsHub() {
  // Only chatroom-scoped settings. Feed / games / economy live in their own hubs.
  const items = ADMIN_NAV.filter((i) => i.group === "Chatrooms");

  return (
    <div>
      <AdminPageHeader
        title="Chatrooms"
        description="All chatroom-only settings — moderation, bots and simulated activity. Feed, games and economy live in their own sections."
      />
      <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chatroom settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((i) => {
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
        </section>
      ))}
    </div>
  );
}
