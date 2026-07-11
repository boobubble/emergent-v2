import { Link, Outlet, createFileRoute, useRouterState, Navigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { getMyRoles } from "@/lib/admin.functions";
import { getOwnerStatus } from "@/lib/owner-setup.functions";
import { ADMIN_NAV, flattenAdminNav, type AdminGroup, type AdminLeaf } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Menu, ArrowLeft, Sun, Moon, Monitor, ShieldCheck,
  Search as SearchIcon, Sparkles, ChevronDown, ChevronRight, Home,
} from "lucide-react";
import { useThemeMode, type ThemeMode } from "@/lib/use-theme-mode";

import { useAdminMode } from "@/lib/admin-mode";
import { APP_VERSION } from "@/lib/app-version";

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

  return <AdminShell isSuper={data.isSuperAdmin} />;
}

function AdminShell({ isSuper }: { isSuper: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-muted/40 dark:bg-[#0b0d12]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:border-r md:border-white/5 md:bg-[#10131a] md:text-slate-200">
        <SidebarContent isSuper={isSuper} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-r border-white/5 bg-[#10131a] p-0 text-slate-200">
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
  const { mode, setMode, isAdvanced } = useAdminMode();
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const visibleGroups = useMemo<AdminGroup[]>(() => {
    return ADMIN_NAV
      .filter((g) => (g.superOnly ? isSuper : true) && (g.advanced ? isSuper && isAdvanced : true))
      .map((g) => {
        if (!g.children) return g;
        const children = g.children.filter((c) =>
          (c.superOnly ? isSuper : true) && (c.advanced ? isSuper && isAdvanced : true),
        );
        return { ...g, children };
      })
      .filter((g) => g.to || (g.children && g.children.length));
  }, [isSuper, isAdvanced]);

  // Auto-expand group containing the active route.
  useEffect(() => {
    for (const g of visibleGroups) {
      if (!g.children) continue;
      if (g.children.some((c) => path === c.to || path.startsWith(c.to + "/"))) {
        setOpenGroups((prev) => (prev[g.label] ? prev : { ...prev, [g.label]: true }));
      }
    }
  }, [path, visibleGroups]);

  // Search: when querying, flatten + filter and render as a flat list.
  const flatMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return flattenAdminNav(visibleGroups).filter((i) => {
      const hay = [i.label, i.description ?? "", i.groupLabel, ...(i.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [visibleGroups, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/20 text-primary"><ShieldCheck className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">Admin Panel</div>
          <div className="truncate text-[11px] text-slate-400">{isSuper ? "Super Admin" : "Admin"}</div>
        </div>
      </div>

      <div className="space-y-2 border-b border-white/5 p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-8 border-white/10 bg-white/[0.04] pl-7 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:ring-primary/40"
          />
        </div>
        {isSuper && (
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("basic")}
              className={`flex-1 rounded px-2 py-1 transition ${mode === "basic" ? "bg-white/10 font-medium text-white" : "text-slate-400 hover:text-white"}`}
            >Basic</button>
            <button
              type="button"
              onClick={() => setMode("advanced")}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 transition ${mode === "advanced" ? "bg-white/10 font-medium text-white" : "text-slate-400 hover:text-white"}`}
            ><Sparkles className="h-3 w-3" />Advanced</button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        {flatMatches ? (
          <FlatResults items={flatMatches} path={path} onNavigate={onNavigate} query={query} />
        ) : (
          <nav className="space-y-0.5">
            {visibleGroups.map((g) => (
              <GroupNode
                key={g.label}
                group={g}
                path={path}
                open={!!openGroups[g.label]}
                onToggle={() => setOpenGroups((p) => ({ ...p, [g.label]: !p[g.label] }))}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        )}
      </ScrollArea>

      <div className="space-y-2 border-t border-white/5 p-3">
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" />Back to app
          </Button>
        </Link>
        <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-slate-400">
          <span className="uppercase tracking-wider">Version</span>
          <span className="font-mono font-semibold text-slate-200">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}

function GroupNode({ group, path, open, onToggle, onNavigate }: {
  group: AdminGroup; path: string; open: boolean; onToggle: () => void; onNavigate?: () => void;
}) {
  const Icon = group.icon;
  // Direct link (no children)
  if (group.to && !group.children?.length) {
    const active = group.to === "/admin" ? path === "/admin" : path === group.to || path.startsWith(group.to + "/");
    return (
      <Link
        to={group.to}
        onClick={onNavigate}
        className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
          active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{group.label}</span>
        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
      </Link>
    );
  }

  const Chev = open ? ChevronDown : ChevronRight;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{group.label}</span>
        <Chev className="ml-auto h-3.5 w-3.5 text-slate-500" />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5 pb-1 pl-9">
          {group.children!.map((c) => {
            const active = path === c.to || path.startsWith(c.to + "/");
            return (
              <Link
                key={c.to}
                to={c.to}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition ${
                  active ? "bg-primary/15 text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="truncate">{c.label}</span>
                {c.badge && <Badge variant="outline" className="ml-auto h-4 border-white/10 px-1.5 text-[9px] text-slate-300">{c.badge}</Badge>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FlatResults({ items, path, onNavigate, query }: {
  items: ReturnType<typeof flattenAdminNav>; path: string; onNavigate?: () => void; query: string;
}) {
  if (items.length === 0) {
    return <div className="px-3 py-6 text-center text-xs text-slate-500">No settings match “{query}”.</div>;
  }
  return (
    <div className="space-y-0.5">
      {items.map((i: ReturnType<typeof flattenAdminNav>[number]) => {
        const Icon = i.icon;
        const active = path === i.to || path.startsWith(i.to + "/");
        return (
          <Link
            key={i.to}
            to={i.to}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
            <span className="truncate">{i.label}</span>
            <span className="ml-auto truncate text-[10px] text-slate-500">{i.groupLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}

function TopNav({ onMenu }: { onMenu: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const flat = useMemo(() => flattenAdminNav(), []);
  const current = useMemo<AdminLeaf & { groupLabel?: string } | undefined>(() => {
    if (path === "/admin") return { to: "/admin", label: "Dashboard", groupLabel: "Dashboard" };
    return flat.find((i) => path === i.to || path.startsWith(i.to + "/"));
  }, [path, flat]);
  const { mode, setMode } = useThemeMode();
  const next: Record<ThemeMode, ThemeMode> = { light: "dark", dark: "system", system: "light" };
  const Icon = mode === "dark" ? Moon : mode === "system" ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></Button>
      <nav className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        <Home className="h-3.5 w-3.5" />
        <Link to="/admin" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="truncate font-medium uppercase tracking-wide text-primary">{current?.label ?? "Admin"}</span>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" title={`Theme: ${mode}`} onClick={() => setMode(next[mode])}>
          <Icon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
