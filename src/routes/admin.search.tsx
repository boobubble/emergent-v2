import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { Users2, ScrollText, Swords, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/search")({
  component: SearchAdminPage,
});

interface SearchSources {
  users: boolean;
  mehfil: boolean;
  battles: boolean;
  categories: boolean;
}

const DEFAULTS: SearchSources = { users: true, mehfil: true, battles: true, categories: true };

const ITEMS: { key: keyof SearchSources; label: string; description: string; icon: any }[] = [
  { key: "users",      label: "Users",             description: "People / handles from the feed profiles.", icon: Users2 },
  { key: "mehfil",     label: "Mehfil (Poems)",    description: "Poems and Hall of Fame entries.",           icon: ScrollText },
  { key: "battles",    label: "Poetry Battles",    description: "Active, upcoming, and past poetry battles.", icon: Swords },
  { key: "categories", label: "Poetry Categories", description: "Categories in the Mehfil directory.",        icon: LayoutGrid },
];

function SearchAdminPage() {
  const { values, set, save, saving } = useAdminSetting<SearchSources>("search", DEFAULTS);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Search"
        description="Choose which content types the global feed search may include. Users always remain the primary result group."
      />

      <Card>
        <CardContent className="divide-y p-0">
          {ITEMS.map((m) => {
            const Icon = m.icon;
            const on = values[m.key];
            return (
              <div key={m.key} className="flex items-center gap-3 px-4 py-3">
                <div className={`grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.description}</div>
                </div>
                <AdminToggle checked={on} onCheckedChange={(v) => set(m.key, v)} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
