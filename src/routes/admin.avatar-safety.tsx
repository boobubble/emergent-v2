import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  adminDisableSocialFeaturing,
  adminRejectAvatar,
  adminRemoveProfilePicture,
  listAvatarModerationQueue,
} from "@/lib/avatar-moderation.functions";

export const Route = createFileRoute("/admin/avatar-safety")({
  head: () => ({
    meta: [
      { title: "Avatar Safety — Admin" },
      { name: "description", content: "Review and remove user profile pictures when needed." },
    ],
  }),
  component: AvatarSafetyPage,
});

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  needs_review: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  rejected: "bg-red-500/15 text-red-700 border-red-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  none: "bg-muted text-muted-foreground",
};

function AvatarSafetyPage() {
  const qc = useQueryClient();
  const [removeTarget, setRemoveTarget] = useState<{ id: string; username: string | null } | null>(null);

  const listFn = useServerFn(listAvatarModerationQueue);
  const rejectFn = useServerFn(adminRejectAvatar);
  const removeFn = useServerFn(adminRemoveProfilePicture);
  const disableSocialFn = useServerFn(adminDisableSocialFeaturing);

  const queue = useQuery({
    queryKey: ["avatar-moderation-queue", "all"],
    queryFn: () => listFn({ data: { status: "all", limit: 50 } }),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["avatar-moderation-queue"] });
    void qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const rejectMut = useMutation({
    mutationFn: (userId: string) => rejectFn({ data: { userId, reason: "admin_rejected" } }),
    onSuccess: () => { toast.success("Avatar rejected"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const removeMut = useMutation({
    mutationFn: (userId: string) => removeFn({ data: { userId } }),
    onSuccess: () => { toast.success("Profile picture removed"); setRemoveTarget(null); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const disableMut = useMutation({
    mutationFn: (userId: string) => disableSocialFn({ data: { userId, allow: false } }),
    onSuccess: () => { toast.success("Social featuring disabled"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const rows = queue.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Avatar Safety"
        description="Profile pictures go live immediately on upload. Use this page to remove inappropriate images or disable social featuring after the fact."
      />

      <div className="grid gap-3">
        {queue.isLoading && (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
        )}
        {!queue.isLoading && rows.length === 0 && (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No profile pictures found.</CardContent></Card>
        )}
        {rows.map((u) => {
          const preview = u.avatar_url || u.avatar_quarantine_url;
          const status = u.avatar_moderation_status ?? "none";
          return (
            <Card key={u.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                <Avatar className="h-16 w-16 rounded-xl">
                  <AvatarImage src={preview ?? undefined} className="object-cover" />
                  <AvatarFallback>{u.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{u.username ?? "—"}</span>
                    <Badge variant="outline" className={STATUS_BADGE[status] ?? ""}>{status}</Badge>
                    {u.allow_social_feature === false && (
                      <Badge variant="outline" className="text-muted-foreground">social off</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.avatar_moderation_reason || "—"}
                    {u.avatar_moderated_at
                      ? ` · ${new Date(u.avatar_moderated_at).toLocaleString()}`
                      : u.updated_at
                        ? ` · updated ${new Date(u.updated_at).toLocaleString()}`
                        : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={rejectMut.isPending}
                    onClick={() => rejectMut.mutate(u.id)}>
                    Reject Image
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => setRemoveTarget({ id: u.id, username: u.username })}>
                    Remove Profile Picture
                  </Button>
                  <Button size="sm" variant="ghost" disabled={disableMut.isPending}
                    onClick={() => disableMut.mutate(u.id)}>
                    Disable Social Featuring
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this user&apos;s profile picture? The user&apos;s account, posts,
              messages and other profile data will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removeMut.isPending}
              onClick={() => removeTarget && removeMut.mutate(removeTarget.id)}
            >
              Remove Profile Picture
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
