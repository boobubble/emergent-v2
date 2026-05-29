import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { getMyRoles } from "@/lib/admin.functions";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Menu, ArrowLeft, Sun, Moon, Monitor, ShieldCheck } from "lucide-react";
import { useThemeMode, type ThemeMode } from "@/lib/use-theme-mode";
import { AppSettingsProvider } from "@/lib/app-settings";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, ready } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: () => fetchRoles({}),
    enabled: !!user && ready,
    staleTime: 30_000,
  });

  if (!ready || isLoading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Checking access…</div>;
  }
  if (isError || !data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">You don't have permission to view this page.</p>
          <Link to="/" className="mt-4 inline-flex"><Button variant="outline" size="sm">Back to app</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <AppSettingsProvider>
      <AdminShell isSuper={data.isSuperAdmin} />
    </AppSettingsProvider>
  );
}

function AdminShell({ isSuper }: { isSuper: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-background">
        <SidebarContent isSuper={isSuper} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent isSuper={isSuper} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading module…</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ isSuper, onNavigate }: { isSuper: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const grouped = useMemo(() => {
    const g: Record<string, typeof ADMIN_NAV> = {};
    for (const item of ADMIN_NAV) (g[item.group] ||= []).push(item);
    return g;
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Admin Panel</div>
          <div className="truncate text-[11px] text-muted-foreground">{isSuper ? "Super Admin" : "Admin"}</div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-4">
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</div>
            <nav className="space-y-0.5">
              {items.map((item) => {
                const active = item.to === "/admin" ? path === "/admin" : path.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      active ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[10px]">{item.badge}</Badge>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>
      <div className="border-t p-3">
        <Link to="/"><Button variant="outline" size="sm" className="w-full justify-start gap-2"><ArrowLeft className="h-4 w-4" />Back to app</Button></Link>
      </div>
    </div>
  );
}

function TopNav({ onMenu }: { onMenu: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = ADMIN_NAV.find((i) => (i.to === "/admin" ? path === "/admin" : path.startsWith(i.to)));
  const { mode, setMode } = useThemeMode();
  const next: Record<ThemeMode, ThemeMode> = { light: "dark", dark: "system", system: "light" };
  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></Button>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{current?.label ?? "Admin"}</div>
        <div className="truncate text-[11px] text-muted-foreground">Admin Console</div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" title={`Theme: ${mode}`} onClick={() => setMode(next[mode])}>
          <Icon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
