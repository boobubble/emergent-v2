import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, BadgeCheck, Send } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  getFeedbotSettings,
  saveFeedbotSettings,
  provisionFeedbot,
  sendTestAnnouncement,
  listChatroomsForFeedbot,
  type FeedbotSettings,
} from "@/lib/feedbot.functions";
import { CATEGORY_LABELS } from "@/lib/feedbot-format";

const DEFAULTS: FeedbotSettings = {
  enabled: true,
  bot_user_id: null,
  event_flags: {
    feed_post: true,
    profile_avatar: true,
    profile_cover: true,
    profile_bio: true,
    new_member: true,
    competition_started: true,
    competition_vote: false,
    competition_winner: true,
    radio_live: true,
    chatroom_created: true,
    level_up: true,
  },
  target_chatrooms: [],
  min_interval_seconds: 300,
  digest_mode: false,
  daily_summary_enabled: true,
  daily_summary_time: "21:00",
};

function AdminFeedbotPage() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getFeedbotSettings);
  const saveSettings = useServerFn(saveFeedbotSettings);
  const provision = useServerFn(provisionFeedbot);
  const testFn = useServerFn(sendTestAnnouncement);
  const listRooms = useServerFn(listChatroomsForFeedbot);

  const settingsQ = useQuery({ queryKey: ["feedbot-settings"], queryFn: () => getSettings() });
  const roomsQ = useQuery({ queryKey: ["feedbot-rooms"], queryFn: () => listRooms() });

  const [state, setState] = useState<FeedbotSettings>(DEFAULTS);

  useEffect(() => {
    if (settingsQ.data) {
      setState({ ...DEFAULTS, ...settingsQ.data, event_flags: { ...DEFAULTS.event_flags, ...(settingsQ.data.event_flags ?? {}) } });
    }
  }, [settingsQ.data]);

  const saveMut = useMutation({
    mutationFn: (patch: Partial<FeedbotSettings>) => saveSettings({ data: patch }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["feedbot-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const provisionMut = useMutation({
    mutationFn: () => provision(),
    onSuccess: (r) => {
      toast.success(r.existed ? "FeedBot already provisioned" : "FeedBot created");
      qc.invalidateQueries({ queryKey: ["feedbot-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testMut = useMutation({
    mutationFn: () => testFn(),
    onSuccess: (r) => toast.success(`Sent to ${r.sent} chatroom${r.sent === 1 ? "" : "s"}`),
    onError: (e: Error) => toast.error(e.message),
  });

  function toggleFlag(k: string, v: boolean) {
    const next = { ...state.event_flags, [k]: v };
    setState({ ...state, event_flags: next });
    saveMut.mutate({ event_flags: next });
  }

  function toggleRoom(id: string) {
    const set = new Set(state.target_chatrooms);
    if (set.has(id)) set.delete(id); else set.add(id);
    const next = Array.from(set);
    setState({ ...state, target_chatrooms: next });
    saveMut.mutate({ target_chatrooms: next });
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <AdminPageHeader
        title="FeedBot"
        description="The official system bot that bridges the Feed with Chatrooms."
        actions={
          <button
            onClick={() => testMut.mutate()}
            disabled={testMut.isPending || !state.bot_user_id || state.target_chatrooms.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Test announcement
          </button>
        }
      />

      <section className="mb-6 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <BadgeCheck className="h-4 w-4 text-primary" /> Bot account
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {state.bot_user_id
                ? "FeedBot is provisioned and ready."
                : "Provision the single official FeedBot account before enabling announcements."}
            </p>
          </div>
          <button
            onClick={() => provisionMut.mutate()}
            disabled={provisionMut.isPending}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            {state.bot_user_id ? "Refresh profile" : "Provision FeedBot"}
          </button>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Master switch</h2>
            <p className="text-xs text-muted-foreground">Turn FeedBot on or off.</p>
          </div>
          <AdminToggle
            checked={state.enabled}
            onCheckedChange={(v) => {
              setState({ ...state, enabled: v });
              saveMut.mutate({ enabled: v });
            }}
          />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card/50 p-4">
        <h2 className="mb-3 text-sm font-semibold">
          <Megaphone className="mr-1 inline h-4 w-4" /> Announcement categories
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            if (key === "daily_summary") return null;
            const on = state.event_flags[key] !== false;
            return (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs"
              >
                <span>{label}</span>
                <AdminToggle size="sm" checked={on} onCheckedChange={(v) => toggleFlag(key, v)} />
              </label>
            );
          })}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card/50 p-4">
        <h2 className="mb-3 text-sm font-semibold">Target chatrooms</h2>
        {roomsQ.isLoading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : !roomsQ.data || roomsQ.data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No chatrooms available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roomsQ.data.map((r) => {
              const active = state.target_chatrooms.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRoom(r.id)}
                  className={
                    "rounded-full border px-3 py-1 text-xs transition " +
                    (active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground")
                  }
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-6 rounded-xl border border-border bg-card/50 p-4">
        <h2 className="mb-3 text-sm font-semibold">Spam protection</h2>
        <label className="mb-3 flex flex-col gap-1 text-xs">
          <span>Minimum time between the same category in the same chatroom (seconds)</span>
          <input
            type="number"
            min={30}
            max={3600}
            step={30}
            value={state.min_interval_seconds}
            onChange={(e) => setState({ ...state, min_interval_seconds: Number(e.target.value) })}
            onBlur={() => saveMut.mutate({ min_interval_seconds: state.min_interval_seconds })}
            className="w-40 rounded-lg border border-border bg-background px-2 py-1"
          />
        </label>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs">
          <span>Combine multiple activities into a single digest post</span>
          <AdminToggle
            size="sm"
            checked={state.digest_mode}
            onCheckedChange={(v) => {
              setState({ ...state, digest_mode: v });
              saveMut.mutate({ digest_mode: v });
            }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/50 p-4">
        <h2 className="mb-3 text-sm font-semibold">Daily AI summary</h2>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs">
          <span>Post daily community highlights at 21:00 IST</span>
          <AdminToggle
            size="sm"
            checked={state.daily_summary_enabled}
            onCheckedChange={(v) => {
              setState({ ...state, daily_summary_enabled: v });
              saveMut.mutate({ daily_summary_enabled: v });
            }}
          />
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/admin/feedbot")({
  component: AdminFeedbotPage,
});
