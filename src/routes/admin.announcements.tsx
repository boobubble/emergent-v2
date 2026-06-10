import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminSetting } from "@/lib/use-admin-setting";
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
  const { values, patch, save, saving } = useAdminSetting<AnnouncementsConfig>(
    ANNOUNCEMENTS_KEY,
    DEFAULT_ANNOUNCEMENTS,
  );

  const items = values.items ?? [];

  const updateItem = (id: string, p: Partial<AnnouncementItem>) => {
    patch({ items: items.map(i => (i.id === id ? { ...i, ...p } : i)) });
  };
  const removeItem = (id: string) => {
    if (items.length <= MIN_ITEMS) return;
    patch({ items: items.filter(i => i.id !== id) });
  };
  const addItem = () => {
    if (items.length >= MAX_ITEMS) return;
    patch({ items: [...items, { id: uid(), text: "", link: "", intervalMinutes: 30, enabled: true }] });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Scheduled Announcements"
        description="Auto-post special messages or links into chatrooms at fixed time intervals."
      />

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Enable scheduled announcements</div>
            <div className="text-sm text-muted-foreground">When off, no announcements are posted.</div>
          </div>
          <Switch checked={!!values.enabled} onCheckedChange={(v) => patch({ enabled: v })} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="font-semibold">Messages & links ({items.length}/{MAX_ITEMS})</div>
          <Button size="sm" variant="outline" onClick={addItem} disabled={items.length >= MAX_ITEMS}>
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
                    <Switch checked={!!it.enabled} onCheckedChange={(v) => updateItem(it.id, { enabled: v })} />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={it.text}
                      onChange={(e) => updateItem(it.id, { text: e.target.value })}
                      placeholder="e.g. 🎉 New event live now!"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={it.link ?? ""}
                      onChange={(e) => updateItem(it.id, { link: e.target.value })}
                      placeholder="https://…"
                    />
                  </td>
                  <td className="px-3 py-2 w-32">
                    <Input
                      type="number"
                      min={1}
                      value={it.intervalMinutes}
                      onChange={(e) => updateItem(it.id, { intervalMinutes: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length <= MIN_ITEMS}
                      title={items.length <= MIN_ITEMS ? `Minimum ${MIN_ITEMS} rows` : "Remove"}
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
        <Button onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
