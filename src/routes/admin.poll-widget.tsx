import { createFileRoute } from "@tanstack/react-router";
import { Save, Vote } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { POLL_WIDGET_DEFAULTS, type PollWidgetConfig } from "@/lib/poll-widget-config";

export const Route = createFileRoute("/admin/poll-widget")({
  component: PollWidgetAdminPage,
});

function PollWidgetAdminPage() {
  const { values, set, save, saving } = useAdminSetting<PollWidgetConfig>(
    "poll_widget",
    POLL_WIDGET_DEFAULTS,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chatroom Poll Widget"
        description="Surface poll previews inside chatrooms to drive traffic to the Social Feed. Voting, comments and engagement remain on the feed — chatrooms only discover polls."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Vote className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Master switch</h3>
              <p className="text-sm text-muted-foreground">
                Turn the chatroom poll discovery widget on or off across all rooms.
              </p>
            </div>
            <AdminToggle checked={values.enabled} onChange={(v) => set("enabled", v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 p-5">
          <h3 className="mb-3 font-semibold">Poll categories</h3>

          <ToggleRow
            label="Show Trending Polls"
            hint="Highest trending score across the feed."
            checked={values.showTrending}
            onChange={(v) => set("showTrending", v)}
          />
          <ToggleRow
            label="Show Poll of the Day"
            hint="Best-performing poll posted in the last 24 hours."
            checked={values.showPollOfDay}
            onChange={(v) => set("showPollOfDay", v)}
          />
          <ToggleRow
            label="Show Creator Polls"
            hint="Top non-anonymous poll from a feed creator."
            checked={values.showCreatorPolls}
            onChange={(v) => set("showCreatorPolls", v)}
          />
          <ToggleRow
            label="Show Weekly Community Vote"
            hint="Most-voted poll in the past 7 days."
            checked={values.showWeeklyVote}
            onChange={(v) => set("showWeeklyVote", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 p-5">
          <h3 className="mb-3 font-semibold">Preview behaviour</h3>

          <ToggleRow
            label="Show vote counts"
            hint="Display aggregate vote totals on each preview card."
            checked={values.showVoteCounts}
            onChange={(v) => set("showVoteCounts", v)}
          />
          <ToggleRow
            label="Redirect to Feed for voting"
            hint="Show the “Vote Now” button that links to the poll's page on the feed."
            checked={values.redirectToFeed}
            onChange={(v) => set("redirectToFeed", v)}
          />

          <div className="grid gap-2 pt-3 sm:max-w-xs">
            <Label htmlFor="lifetime">Poll lifetime (days)</Label>
            <Input
              id="lifetime"
              type="number"
              min={1}
              max={60}
              value={values.pollLifetimeDays}
              onChange={(e) =>
                set("pollLifetimeDays", Math.max(1, Math.min(60, Number(e.target.value) || 1)))
              }
            />
            <p className="text-xs text-muted-foreground">
              Used only to compute the “time remaining” / “Open vs Closed” label shown on the preview card.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How this works</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Polls are created and voted on inside the <strong>Social Feed</strong>.</li>
            <li>This widget only previews polls inside chatrooms — no votes are recorded from chat.</li>
            <li>The CTA opens the poll's feed page, where the normal voting UI is shown.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 py-2 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <AdminToggle checked={checked} onChange={onChange} />
    </div>
  );
}
