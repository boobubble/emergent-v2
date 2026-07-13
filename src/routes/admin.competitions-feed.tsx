import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy, BadgeCheck, Radio } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCompetitionsFeedSettings,
  saveCompetitionsFeedSettings,
  provisionCompetitionsBot,
  announceCompetitionEvent,
  type CompetitionsFeedSettings,
} from "@/lib/competitions-feedbot.functions";
import { listChatroomsForFeedbot } from "@/lib/feedbot.functions";
import { adminListAllCompetitions } from "@/lib/competitions.functions";
import { CATEGORY_LABELS, COMPETITION_CATEGORY_KEYS } from "@/lib/feedbot-format";

export const Route = createFileRoute("/admin/competitions-feed")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const get = useServerFn(getCompetitionsFeedSettings);
  const save = useServerFn(saveCompetitionsFeedSettings);
  const provision = useServerFn(provisionCompetitionsBot);
  const listRooms = useServerFn(listChatroomsForFeedbot);
  const listComps = useServerFn(adminListAllCompetitions);
  const announce = useServerFn(announceCompetitionEvent);

  const settingsQ = useQuery({ queryKey: ["competitions-feed-settings"], queryFn: () => get() });
  const roomsQ = useQuery({ queryKey: ["feedbot-rooms"], queryFn: () => listRooms() });
  const compsQ = useQuery({ queryKey: ["competitions", "admin"], queryFn: () => listComps({}) });

  const [state, setState] = useState<CompetitionsFeedSettings | null>(null);
  useEffect(() => {
    if (settingsQ.data) setState(settingsQ.data);
  }, [settingsQ.data]);

  const saveM = useMutation({
    mutationFn: (patch: Partial<CompetitionsFeedSettings>) =>
      save({
        data: {
          event_flags: patch.event_flags,
          target_chatrooms: patch.target_chatrooms,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["competitions-feed-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const provisionM = useMutation({
    mutationFn: () => provision({}),
    onSuccess: (r) => {
      toast.success(r.existed ? "CompetitionsBot linked" : "CompetitionsBot created");
      qc.invalidateQueries({ queryKey: ["competitions-feed-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const announceM = useMutation({
    mutationFn: (v: { competitionId: string; kind: "competition_trending" | "competition_ending" }) =>
      announce({ data: v }),
    onSuccess: () => toast.success("Queued — will post within a minute"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!state) return <div className="p-6">Loading…</div>;

  const toggleFlag = (key: string, val: boolean) => {
    const next = { ...state, event_flags: { ...state.event_flags, [key]: val } };
    setState(next);
    saveM.mutate({ event_flags: next.event_flags });
  };
  const toggleRoom = (id: string, on: boolean) => {
    const set = new Set(state.target_chatrooms);
    if (on) set.add(id);
    else set.delete(id);
    const next = { ...state, target_chatrooms: Array.from(set) };
    setState(next);
    saveM.mutate({ target_chatrooms: next.target_chatrooms });
  };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Competitions Feed"
        description="Auto-post competition lifecycle events to chatrooms via a dedicated CompetitionsBot."
        actions={
          <Button onClick={() => provisionM.mutate()} disabled={provisionM.isPending}>
            <BadgeCheck className="h-4 w-4" />
            {state.competitions_bot_user_id ? "Re-sync CompetitionsBot" : "Provision CompetitionsBot"}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4" /> Bot identity
          </div>
          <p className="text-xs text-muted-foreground">
            CompetitionsBot ID:{" "}
            <span className="font-mono">
              {state.competitions_bot_user_id ?? "not provisioned"}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Master FeedBot pipeline (rate-limit, dispatcher, cooldowns) is reused — this bot just
            owns competition-related posts.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 text-sm font-semibold">Event toggles</div>
          <div className="grid gap-2 md:grid-cols-2">
            {COMPETITION_CATEGORY_KEYS.map((k) => (
              <AdminToggle
                key={k}
                label={CATEGORY_LABELS[k] ?? k}
                checked={!!state.event_flags[k]}
                onChange={(v) => toggleFlag(k, v)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 text-sm font-semibold">Target chatrooms</div>
          <p className="mb-2 text-xs text-muted-foreground">
            Shared with FeedBot targets — competition posts land in the same rooms you already
            selected on the FeedBot page.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {(roomsQ.data ?? []).map((r) => (
              <AdminToggle
                key={r.id}
                label={r.name}
                checked={state.target_chatrooms.includes(r.id)}
                onChange={(v) => toggleRoom(r.id, v)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Radio className="h-4 w-4" /> Manual announcements
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Broadcast "Trending" or "Ending soon" for a specific competition. Rate-limited to once
            per hour per competition per category via dedupe keys.
          </p>
          <div className="space-y-2">
            {(compsQ.data ?? [])
              .filter((c) => c.status !== "completed")
              .slice(0, 25)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded border border-border/60 p-2"
                >
                  <span className="flex-1 text-sm">{c.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      announceM.mutate({ competitionId: c.id, kind: "competition_trending" })
                    }
                  >
                    🔥 Trending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      announceM.mutate({ competitionId: c.id, kind: "competition_ending" })
                    }
                  >
                    ⏳ Ending soon
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
