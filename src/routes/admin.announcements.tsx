import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAllSettings, updateAnnouncementsConfig, canEditAnnouncements } from "@/lib/admin.functions";
import {
  ANNOUNCEMENTS_KEY,
  DEFAULT_ANNOUNCEMENTS,
  type AnnouncementsConfig,
  type AnnouncementItem,
} from "@/components/chat/ScheduledAnnouncements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/announcements")({ component: Page });

const MAX_ITEMS = 8;
const MIN_ITEMS = 4;

function uid() { return Math.random().toString(36).slice(2, 9); }

function Page() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveAnnouncements = useServerFn(updateAnnouncementsConfig);
  const checkPerm = useServerFn(canEditAnnouncements);
  const qc = useQueryClient();

  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });
  const { data: perm } = useQuery({ queryKey: ["can-edit-announcements"], queryFn: () => checkPerm({}), staleTime: 30_000 });

  const [values, setValues] = useState<AnnouncementsConfig>(DEFAULT_ANNOUNCEMENTS);

  useEffect(() => {
    if (!settings) return;
    const v = (settings[ANNOUNCEMENTS_KEY] as Partial<AnnouncementsConfig> | undefined) ?? {};
    setValues({ ...DEFAULT_ANNOUNCEMENTS, ...v, items: v.items ?? DEFAULT_ANNOUNCEMENTS.items });
  }, [settings]);

  const mut = useMutation({
    mutationFn: () => saveAnnouncements({ data: values }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const canEdit = !!perm?.allowed;
  const items = values.items ?? [];

  const updateItem = (id: string, p: Partial<AnnouncementItem>) => {
    if (!canEdit) return;
    setValues(s => ({ ...s, items: s.items.map(i => (i.id === id ? { ...i, ...p } : i)) }));
  };
  const removeItem = (id: string) => {
    if (!canEdit || items.length <= MIN_ITEMS) return;
    setValues(s => ({ ...s, items: s.items.filter(i => i.id !== id) }));
  };
  const addItem = () => {
    if (!canEdit || items.length >= MAX_ITEMS) return;
    setValues(s => ({ ...s, items: [...s.items, { id: uid(), text: "", link: "", intervalMinutes: 30, enabled: true }] }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Scheduled Announcements"
        description="Auto-post special messages or links into chatrooms at fixed time intervals."
      />

      {perm && !canEdit && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <div className="font-semibold">View-only access</div>
            <div className="text-muted-foreground">
              Only admins and approved moderators can create or edit announcements. A super admin can grant moderators
              access from <span className="font-medium">Moderation → Staff Permissions → "Moderators can edit Announcements"</span>.
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Enable scheduled announcements</div>
            <div className="text-sm text-muted-foreground">When off, no announcements are posted.</div>
          </div>
          <Switch
            checked={!!values.enabled}
            disabled={!canEdit}
            onCheckedChange={(v) => canEdit && setValues(s => ({ ...s, enabled: v }))}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="font-semibold">Messages & links ({items.length}/{MAX_ITEMS})</div>
          <Button size="sm" variant="outline" onClick={addItem} disabled={!canEdit || items.length >= MAX_ITEMS}>
            <Plus className="mr-1 h-4 w-4" /> Add row
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">On</th>
                <th className="px-3 py-2 text-left">Message</th>
                <th className="px-3 py-2 text-left">Link (optional)</th>
                <th className="px-3 py-2 text-left">Interval (min)</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-3 py-2 align-top">
                    <Switch checked={!!it.enabled} disabled={!canEdit} onCheckedChange={(v) => updateItem(it.id, { enabled: v })} />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={it.text}
                      readOnly={!canEdit}
                      onChange={(e) => updateItem(it.id, { text: e.target.value })}
                      placeholder="e.g. 🎉 New event live now!"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={it.link ?? ""}
                      readOnly={!canEdit}
                      onChange={(e) => updateItem(it.id, { link: e.target.value })}
                      placeholder="https://…"
                    />
                  </td>
                  <td className="w-32 px-3 py-2">
                    <Input
                      type="number"
                      min={1}
                      readOnly={!canEdit}
                      value={it.intervalMinutes}
                      onChange={(e) => updateItem(it.id, { intervalMinutes: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(it.id)}
                      disabled={!canEdit || items.length <= MIN_ITEMS}
                      title={!canEdit ? "Read-only" : items.length <= MIN_ITEMS ? `Minimum ${MIN_ITEMS} rows` : "Remove"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Each enabled row posts independently using its own interval. Announcements appear in the currently open public chatroom (DMs are skipped).
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => mut.mutate()} disabled={!canEdit || mut.isPending}>
          <Save className="mr-2 h-4 w-4" /> {mut.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
