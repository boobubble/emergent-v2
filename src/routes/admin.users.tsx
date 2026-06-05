import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, ShieldCheck, Shield, Hammer, Ban, Trash2, ShieldOff } from "lucide-react";
import {
  getMyRoles, listUsersWithRoles, setUserRole,
  banUser, unbanUser, deleteUser,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type ManagedRole = "super_admin" | "admin" | "moderator";

const ROLE_META: Record<ManagedRole, { label: string; color: string; icon: typeof Shield }> = {
  super_admin: { label: "Super Admin", color: "text-rose-500", icon: ShieldCheck },
  admin: { label: "Admin", color: "text-orange-500", icon: Shield },
  moderator: { label: "Moderator", color: "text-amber-500", icon: Hammer },
};

function UsersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const listFn = useServerFn(listUsersWithRoles);
  const setRoleFn = useServerFn(setUserRole);
  const myRolesFn = useServerFn(getMyRoles);

  const myRoles = useQuery({ queryKey: ["my-roles"], queryFn: () => myRolesFn() });
  const isSuperAdmin = myRoles.data?.isSuperAdmin ?? false;

  const usersQ = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => listFn({ data: { q: search || undefined } }),
  });

  const banFn = useServerFn(banUser);
  const unbanFn = useServerFn(unbanUser);
  const deleteFn = useServerFn(deleteUser);
  const [confirm, setConfirm] = useState<{ kind: "ban" | "unban" | "delete"; user_id: string; username: string } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const mutation = useMutation({
    mutationFn: (vars: { user_id: string; role: ManagedRole; grant: boolean }) =>
      setRoleFn({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(`${vars.grant ? "Granted" : "Revoked"} ${ROLE_META[vars.role].label}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const banMut = useMutation({
    mutationFn: (user_id: string) => banFn({ data: { user_id } }),
    onSuccess: () => { toast.success("User banned"); invalidate(); },
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
        description="Search members and manage staff roles. Only Super Admins can change roles."
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
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
            }}
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

          {!isSuperAdmin && (
            <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
              You can view users but only Super Admins can grant or revoke roles.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-3 font-medium">User</th>
                  <th className="py-2 pr-3 font-medium">Level</th>
                  <th className="py-2 pr-3 font-medium">Roles</th>
                  <th className="py-2 pr-3 font-medium">Super Admin</th>
                  <th className="py-2 pr-3 font-medium">Admin</th>
                  <th className="py-2 pr-3 font-medium">Moderator</th>
                </tr>
              </thead>
              <tbody>
                {usersQ.isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={6} className="py-2"><Skeleton className="h-8 w-full" /></td>
                    </tr>
                  ))}
                {!usersQ.isLoading && users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={u.avatar_url ?? undefined} />
                          <AvatarFallback>{u.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.username ?? "—"}</div>
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
                    {(Object.keys(ROLE_META) as ManagedRole[]).map((role) => {
                      const has = u.roles.includes(role);
                      return (
                        <td key={role} className="py-2 pr-3">
                          <Switch
                            checked={has}
                            disabled={!isSuperAdmin || mutation.isPending}
                            onCheckedChange={(v) =>
                              mutation.mutate({ user_id: u.id, role, grant: v })
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
