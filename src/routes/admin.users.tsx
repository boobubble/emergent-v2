import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, ShieldCheck, Shield, Hammer, Ban, Trash2, ShieldOff, UserCircle2 } from "lucide-react";
import {
  getMyRoles, listUsersWithRoles, setUserRole,
  banUser, unbanUser, deleteUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type ManagedRole = "super_admin" | "admin" | "moderator";
type FilterKey = "all" | "members" | "guests" | "banned" | "staff";

const ROLE_META: Record<ManagedRole, { label: string; color: string; icon: typeof Shield }> = {
  super_admin: { label: "Super Admin", color: "text-rose-500", icon: ShieldCheck },
  admin: { label: "Admin", color: "text-orange-500", icon: Shield },
  moderator: { label: "Moderator", color: "text-amber-500", icon: Hammer },
};

const DURATION_OPTIONS: { value: string; label: string; minutes: number | null }[] = [
  { value: "60", label: "1 hour", minutes: 60 },
  { value: "360", label: "6 hours", minutes: 360 },
  { value: "1440", label: "1 day", minutes: 1440 },
  { value: "4320", label: "3 days", minutes: 4320 },
  { value: "10080", label: "7 days", minutes: 10080 },
  { value: "43200", label: "30 days", minutes: 43200 },
  { value: "perm", label: "Permanent", minutes: null },
];

function formatExpiry(iso: string | null) {
  if (!iso) return "permanent";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h left`;
  return `${Math.round(hrs / 24)}d left`;
}

function UsersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const qc = useQueryClient();
  const listFn = useServerFn(listUsersWithRoles);
  const setRoleFn = useServerFn(setUserRole);
  const myRolesFn = useServerFn(getMyRoles);
  const banFn = useServerFn(banUser);
  const unbanFn = useServerFn(unbanUser);
  const deleteFn = useServerFn(deleteUser);

  const myRoles = useQuery({ queryKey: ["my-roles"], queryFn: () => myRolesFn() });
  const isSuperAdmin = myRoles.data?.isSuperAdmin ?? false;

  const usersQ = useQuery({
    queryKey: ["admin-users", search, filter],
    queryFn: () => listFn({ data: { q: search || undefined, filter } }),
  });

  const [banTarget, setBanTarget] = useState<{ user_id: string; username: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("1440");
  const [confirm, setConfirm] = useState<{ kind: "unban" | "delete"; user_id: string; username: string } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const roleMut = useMutation({
    mutationFn: (vars: { user_id: string; role: ManagedRole; grant: boolean }) =>
      setRoleFn({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(`${vars.grant ? "Granted" : "Revoked"} ${ROLE_META[vars.role].label}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const banMut = useMutation({
    mutationFn: (vars: { user_id: string; reason: string; duration_minutes: number | null }) =>
      banFn({ data: vars }),
    onSuccess: () => { toast.success("User banned"); invalidate(); setBanTarget(null); setBanReason(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  const unbanMut = useMutation({
    mutationFn: (user_id: string) => unbanFn({ data: { user_id } }),
    onSuccess: () => { toast.success("Ban lifted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (user_id: string) => deleteFn({ data: { user_id } }),
    onSuccess: () => { toast.success("User deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = usersQ.data ?? [];
  const totals = useMemo(() => {
    const t = { super_admin: 0, admin: 0, moderator: 0 };
    for (const u of users) for (const r of u.roles) if (r in t) (t as any)[r]++;
    return t;
  }, [users]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Users"
        description="Search members, manage staff roles, and moderate accounts. Only Super Admins can change roles or delete accounts."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(ROLE_META) as ManagedRole[]).map((r) => {
          const Icon = ROLE_META[r].icon;
          return (
            <Card key={r}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className={`h-4 w-4 ${ROLE_META[r].color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{ROLE_META[r].label}s</div>
                  <div className="text-lg font-semibold">{totals[r]}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by username…"
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>
          </Tabs>

          {!isSuperAdmin && (
            <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
              You can view users but only Super Admins can grant/revoke roles or delete accounts.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-3 font-medium">User</th>
                  <th className="py-2 pr-3 font-medium">Level</th>
                  <th className="py-2 pr-3 font-medium">Roles</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Super</th>
                  <th className="py-2 pr-3 font-medium">Admin</th>
                  <th className="py-2 pr-3 font-medium">Mod</th>
                  <th className="py-2 pr-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQ.isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={8} className="py-2"><Skeleton className="h-8 w-full" /></td>
                    </tr>
                  ))}
                {!usersQ.isLoading && users.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b align-top hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={u.avatar_url ?? undefined} />
                          <AvatarFallback>{u.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-medium">{u.username ?? "—"}</span>
                            {u.is_guest && (
                              <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[9px]">
                                <UserCircle2 className="h-2.5 w-2.5" /> guest
                              </Badge>
                            )}
                          </div>
                          <div className="truncate font-mono text-[10px] text-muted-foreground">{u.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">L{u.level ?? 1} · {u.xp ?? 0} XP</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">user</Badge>
                        ) : (
                          u.roles.map((r) => (
                            <Badge key={r} variant="secondary" className="h-5 px-1.5 text-[10px]">{r}</Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      {u.banned ? (
                        <div className="space-y-0.5">
                          <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                            banned · {formatExpiry(u.ban_expires_at)}
                          </Badge>
                          {u.ban_reason && (
                            <div className="max-w-[220px] truncate text-[11px] text-muted-foreground" title={u.ban_reason}>
                              {u.ban_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">active</span>
                      )}
                    </td>
                    {(Object.keys(ROLE_META) as ManagedRole[]).map((role) => {
                      const has = u.roles.includes(role);
                      return (
                        <td key={role} className="py-2 pr-3">
                          <Switch
                            checked={has}
                            disabled={!isSuperAdmin || roleMut.isPending}
                            onCheckedChange={(v) => roleMut.mutate({ user_id: u.id, role, grant: v })}
                          />
                        </td>
                      );
                    })}
                    <td className="py-2 pr-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.banned ? (
                          <Button
                            size="sm" variant="outline"
                            disabled={unbanMut.isPending}
                            onClick={() => setConfirm({ kind: "unban", user_id: u.id, username: u.username ?? u.id })}
                          >
                            <ShieldOff className="mr-1 h-3.5 w-3.5" /> Unban
                          </Button>
                        ) : (
                          <Button
                            size="sm" variant="outline"
                            onClick={() => { setBanTarget({ user_id: u.id, username: u.username ?? u.id }); setBanReason(""); setBanDuration("1440"); }}
                          >
                            <Ban className="mr-1 h-3.5 w-3.5" /> Ban
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            size="sm" variant="destructive"
                            disabled={delMut.isPending}
                            onClick={() => setConfirm({ kind: "delete", user_id: u.id, username: u.username ?? u.id })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ban dialog with reason + duration */}
      <Dialog open={!!banTarget} onOpenChange={(o) => !o && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban @{banTarget?.username}</DialogTitle>
            <DialogDescription>
              The user will be signed out and blocked from posting, messaging, and signing in.
              They&apos;ll be auto-unbanned when the duration expires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ban-reason">Reason (required, shown to moderators)</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Repeated harassment in #lobby"
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ban-duration">Duration</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger id="ban-duration"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBanTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={banReason.trim().length < 3 || banMut.isPending}
              onClick={() => {
                if (!banTarget) return;
                const opt = DURATION_OPTIONS.find((o) => o.value === banDuration);
                banMut.mutate({
                  user_id: banTarget.user_id,
                  reason: banReason.trim(),
                  duration_minutes: opt?.minutes ?? null,
                });
              }}
            >
              {banMut.isPending ? "Banning…" : "Ban user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban / delete confirm */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "delete" && `Delete @${confirm.username}?`}
              {confirm?.kind === "unban" && `Lift ban on @${confirm?.username}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "delete" &&
                "This permanently removes the account and authentication record. This cannot be undone."}
              {confirm?.kind === "unban" && "The user will regain access immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirm?.kind === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => {
                if (!confirm) return;
                if (confirm.kind === "unban") unbanMut.mutate(confirm.user_id);
                if (confirm.kind === "delete") delMut.mutate(confirm.user_id);
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
