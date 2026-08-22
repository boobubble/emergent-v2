import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2, XCircle, RefreshCw, Send, Link2, AlertTriangle, Share2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  bufferSocialAction,
  getSocialAutomationState,
  setSocialChannelEnabled,
  updateSocialAutomationSettings,
  updateSocialCaptionTemplate,
  clearSuccessfulSocialLogs,
  deleteFailedSocialLog,
} from "@/lib/social-automation.functions";
import { SocialAutomationTabs, type SocialAutomationTab } from "@/components/admin/SocialAutomationTabs";
import { SocialManualPostsInbox } from "@/components/admin/SocialManualPostsInbox";

export const Route = createFileRoute("/admin/social-automation")({
  validateSearch: (s: Record<string, unknown>): { tab: SocialAutomationTab } => ({
    tab:
      s.tab === "auto" || s.tab === "manual" || s.tab === "settings" || s.tab === "overview"
        ? s.tab
        : "overview",
  }),
  component: SocialAutomationPage,
});

const TEST_CAPTION = `🎉 A new member just joined Yaarzo!
Meet new people, join conversations and discover the Yaarzo community.
https://yaarzo.com
#Yaarzo #Community #Chat`;

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  x: "X",
  twitter: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
};

function SocialAutomationPage() {
  const { tab } = Route.useSearch();
  const qc = useQueryClient();
  const getState = useServerFn(getSocialAutomationState);
  const bufferAction = useServerFn(bufferSocialAction);
  const saveSettings = useServerFn(updateSocialAutomationSettings);
  const setChannel = useServerFn(setSocialChannelEnabled);
  const saveTemplate = useServerFn(updateSocialCaptionTemplate);
  const clearSuccessfulFn = useServerFn(clearSuccessfulSocialLogs);
  const deleteFailedFn = useServerFn(deleteFailedSocialLog);

  const stateQ = useQuery({
    queryKey: ["social-automation"],
    queryFn: () => getState(),
  });

  const [connectionMsg, setConnectionMsg] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [testText, setTestText] = useState(TEST_CAPTION);
  const [templates, setTemplates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!stateQ.data?.templates) return;
    const map: Record<string, string> = {};
    for (const t of stateQ.data.templates as Array<{ platform: string; template: string }>) {
      map[t.platform] = t.template;
    }
    setTemplates(map);
  }, [stateQ.data?.templates]);

  const channels = (stateQ.data?.channels ?? []) as Array<{
    id: string;
    platform: string;
    buffer_channel_id: string;
    channel_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    enabled: boolean;
    metadata: Record<string, unknown> | null;
  }>;

  const settings = stateQ.data?.settings as {
    social_signup_enabled?: boolean;
    daily_signup_post_limit?: number;
    minimum_post_interval_minutes?: number;
    publishing_mode?: "queue" | "immediate";
    default_media_url?: string | null;
    site_base_url?: string | null;
    buffer_organization_id?: string | null;
    buffer_organization_name?: string | null;
  } | null;

  const platformChannels = useMemo(() => {
    const order = ["facebook", "instagram", "x", "tiktok"];
    const byPlatform = new Map<string, typeof channels>();
    for (const ch of channels) {
      const p = ch.platform === "twitter" ? "x" : ch.platform;
      const list = byPlatform.get(p) ?? [];
      list.push(ch);
      byPlatform.set(p, list);
    }
    return order.map((p) => ({ platform: p, channels: byPlatform.get(p) ?? [] }));
  }, [channels]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["social-automation"] });

  const testConnMut = useMutation({
    mutationFn: () => bufferAction({ data: { action: "test_connection" } }),
    onSuccess: (r: any) => {
      if (r?.ok || r?.connected) {
        setConnected(true);
        const org = r.organization ?? r.organizations?.[0];
        setConnectionMsg(
          org
            ? `Buffer Connected — org: ${org.name}`
            : "Buffer Connected",
        );
        toast.success("Buffer Connected");
      } else {
        setConnected(false);
        setConnectionMsg(r?.error ?? "Connection failed");
        toast.error(r?.error ?? "Connection failed");
      }
    },
    onError: (e: Error) => {
      setConnected(false);
      setConnectionMsg(e.message);
      toast.error(e.message);
    },
  });

  const refreshMut = useMutation({
    mutationFn: () =>
      bufferAction({
        data: {
          action: "get_channels",
          organizationId: settings?.buffer_organization_id ?? undefined,
        },
      }),
    onSuccess: (r: any) => {
      if (r?.ok) {
        toast.success(`Loaded ${r.channels?.length ?? 0} channels`);
        invalidate();
      } else {
        toast.error(r?.error ?? "Failed to refresh channels");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testPostMut = useMutation({
    mutationFn: () =>
      bufferAction({
        data: {
          action: "create_test_post",
          channelIds: selectedChannels,
          text: testText,
        },
      }),
    onSuccess: (r: any) => {
      if (r?.error && !r?.results?.length) {
        toast.error(r.error);
        return;
      }
      const results = (r?.results ?? []) as Array<{ platform: string; ok: boolean; error?: string }>;
      if (!results.length) {
        toast.error(r?.error ?? "No results");
        return;
      }
      for (const row of results) {
        if (row.ok) toast.success(`${PLATFORM_LABEL[row.platform] ?? row.platform}: Queued`);
        else toast.error(`${PLATFORM_LABEL[row.platform] ?? row.platform}: ${row.error ?? "Failed"}`);
      }
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runTestPost = () => {
    const selectedMeta = channels.filter((c) =>
      selectedChannels.includes(c.buffer_channel_id),
    );
    const wantsMediaPlatform = selectedMeta.some(
      (c) => c.platform === "tiktok" || c.platform === "instagram",
    );
    if (wantsMediaPlatform && !settings?.default_media_url) {
      toast.error("Set a Default Yaarzo Social Image before testing Instagram or TikTok.");
      return;
    }
    testPostMut.mutate();
  };

  const saveSettingsMut = useMutation({
    mutationFn: (patch: Record<string, unknown>) => saveSettings({ data: patch as any }),
    onSuccess: () => {
      toast.success("Settings saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enableSignup = (next: boolean) => {
    if (next) {
      const ok = window.confirm(
        "New Yaarzo members who allow social featuring may be posted to enabled external social channels. Continue?",
      );
      if (!ok) return;
    }
    saveSettingsMut.mutate({ social_signup_enabled: next });
  };

  const toggleChannelMut = useMutation({
    mutationFn: (p: { id: string; enabled: boolean }) => setChannel({ data: p }),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const retryMut = useMutation({
    mutationFn: (logId: string) =>
      bufferAction({ data: { action: "retry_log", logId } }),
    onSuccess: (r: any) => {
      if (r?.ok) toast.success("Retry queued");
      else toast.error(r?.error ?? "Retry failed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clearSuccessfulMut = useMutation({
    mutationFn: () => clearSuccessfulFn({}),
    onSuccess: (r: any) => {
      toast.success(`Cleared ${r?.deleted ?? 0} successful log${(r?.deleted ?? 0) === 1 ? "" : "s"}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFailedMut = useMutation({
    mutationFn: (logId: string) => deleteFailedFn({ data: { logId } }),
    onSuccess: () => {
      toast.success("Failed log deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFailedWithConfirm = (logId: string) => {
    const ok = window.confirm(
      "Delete this failed social post log? This cannot be undone.",
    );
    if (!ok) return;
    deleteFailedMut.mutate(logId);
  };

  const saveTemplateMut = useMutation({
    mutationFn: (p: { platform: string; template: string }) => saveTemplate({ data: p }),
    onSuccess: () => toast.success("Template saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSelect = (channelId: string, on: boolean) => {
    setSelectedChannels((prev) =>
      on ? Array.from(new Set([...prev, channelId])) : prev.filter((id) => id !== channelId),
    );
  };

  const recentLogs = (stateQ.data?.recentLogs ?? []) as Array<any>;
  const failedLogs = (stateQ.data?.failedLogs ?? []) as Array<any>;
  const counters = (stateQ.data?.counters ?? {
    todaySuccessful: 0,
    failed: 0,
    pendingQueue: 0,
  }) as { todaySuccessful: number; failed: number; pendingQueue: number };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <AdminPageHeader
        title="Social Automation"
        description="One Yaarzo welcome feed post is the source of truth. Instagram, X, and TikTok publish automatically via Buffer. Facebook, Pinterest, Bluesky, and YouTube are prepared from the same post."
      />
      <SocialAutomationTabs active={tab} />

      {tab === "manual" && <SocialManualPostsInbox />}

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How distribution works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              When a member joins, Yaarzo creates a single Welcome feed post. That post is reused everywhere — there is no separate social composer.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><span className="font-medium text-foreground">Auto:</span> Instagram, X, TikTok continue through the existing Buffer queue.</li>
              <li><span className="font-medium text-foreground">Manual:</span> Facebook, Pinterest, Bluesky, YouTube appear in Manual Posts for staff to prepare and mark posted.</li>
              <li>Members without social featuring consent stay on the Yaarzo feed only.</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Buffer Connection */}
      {(tab === "overview" || tab === "auto") && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" /> Buffer Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Buffer</span>
            <StatusPill
              ok={connected}
              label={
                connected === true
                  ? "Connected"
                  : connected === false
                    ? "Disconnected"
                    : "Unknown"
              }
            />
            {settings?.buffer_organization_name && (
              <span className="text-xs text-muted-foreground">
                Org: {settings.buffer_organization_name}
              </span>
            )}
          </div>
          {connectionMsg && (
            <p className={`text-sm ${connected ? "text-emerald-600" : "text-destructive"}`}>
              {connected ? "✅ " : ""}
              {connectionMsg}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            API key is stored only as the server secret <code>BUFFER_API_KEY</code> (Edge Function).
            It is never shown here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => testConnMut.mutate()}
              disabled={testConnMut.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${testConnMut.isPending ? "animate-spin" : ""}`} />
              Test Connection
            </Button>
            <Button
              variant="outline"
              onClick={() => refreshMut.mutate()}
              disabled={refreshMut.isPending}
            >
              Refresh Channels
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Connected Channels */}
      {tab === "auto" && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No channels synced yet. Test connection, then Refresh Channels.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {platformChannels.flatMap(({ platform, channels: list }) => {
                // Show Not Connected only when Buffer has not returned this platform yet.
                if (list.length === 0 && (platform === "instagram" || platform === "facebook" || platform === "x" || platform === "tiktok")) {
                  // Prefer showing Instagram placeholder when missing; still show others if none synced at all handled above.
                  if (platform !== "instagram") return [];
                  return [
                    <div
                      key="instagram-not-connected"
                      className="rounded-xl border border-dashed border-border p-4 opacity-70"
                    >
                      <div className="text-sm font-semibold">Instagram</div>
                      <div className="mt-1 text-xs text-muted-foreground">Not Connected</div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Auto Posting</span>
                        <AdminToggle checked={false} disabled onCheckedChange={() => {}} />
                      </div>
                    </div>,
                  ];
                }
                return list.map((ch) => {
                  const meta = ch.metadata ?? {};
                  const paused = !!meta.queuePaused;
                  const disconnected = !!meta.disconnected;
                  return (
                    <div key={ch.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start gap-3">
                        {ch.avatar_url ? (
                          <img
                            src={ch.avatar_url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {(PLATFORM_LABEL[platform] ?? platform).slice(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold">
                            {PLATFORM_LABEL[platform] ?? platform}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {ch.display_name || ch.channel_name || ch.buffer_channel_id}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                            {!disconnected ? (
                              <span className="text-emerald-600">Connected ✅</span>
                            ) : (
                              <span className="text-destructive">Disconnected</span>
                            )}
                            {paused && (
                              <span className="text-amber-600">Queue paused</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Auto Posting</span>
                        <AdminToggle
                          checked={ch.enabled}
                          onCheckedChange={(v) =>
                            toggleChannelMut.mutate({ id: ch.id, enabled: v })
                          }
                        />
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* New Member Auto Posting */}
      {(tab === "auto" || tab === "settings") && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" /> New Member Auto Posting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <div className="text-sm font-medium">Enable automatic new-member social posts</div>
              <p className="text-xs text-muted-foreground">
                Default OFF. Signup always succeeds even if Buffer fails. Keep OFF until test posts succeed.
              </p>
            </div>
            <AdminToggle
              checked={!!settings?.social_signup_enabled}
              onCheckedChange={enableSignup}
            />
          </div>

          <div className="space-y-2">
            <Label>Test Social Post — select channels</Label>
            <div className="flex flex-wrap gap-4">
              {channels
                .filter((c) =>
                  ["facebook", "instagram", "x", "twitter", "tiktok"].includes(c.platform),
                )
                .sort((a, b) => {
                  const order = ["facebook", "instagram", "x", "twitter", "tiktok"];
                  const pa = a.platform === "twitter" ? "x" : a.platform;
                  const pb = b.platform === "twitter" ? "x" : b.platform;
                  return order.indexOf(pa) - order.indexOf(pb);
                })
                .map((ch) => {
                  const p = ch.platform === "twitter" ? "x" : ch.platform;
                  return (
                    <label key={ch.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedChannels.includes(ch.buffer_channel_id)}
                        onCheckedChange={(v) =>
                          toggleSelect(ch.buffer_channel_id, v === true)
                        }
                      />
                      {PLATFORM_LABEL[p] ?? p}
                    </label>
                  );
                })}
            </div>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={5}
              className="font-mono text-xs"
            />
            <Button
              onClick={() => runTestPost()}
              disabled={testPostMut.isPending || selectedChannels.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Test Social Post
            </Button>
            <p className="text-xs text-muted-foreground">
              Sends one Buffer createPost per selected channel with mode <code>addToQueue</code>.
              Uses the Default Yaarzo Social Image automatically (required for Instagram and TikTok).
              Facebook can stay unselected while you test Instagram + X + TikTok.
            </p>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Caption Templates */}
      {tab === "settings" && (
      <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caption Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Variables: {"{{display_name}}"}, {"{{username}}"}, {"{{profile_url}}"}
          </p>
          {["facebook", "instagram", "x", "tiktok"].map((platform) => (
            <div key={platform} className="space-y-2">
              <Label>{PLATFORM_LABEL[platform] ?? platform}</Label>
              <Textarea
                value={templates[platform] ?? ""}
                onChange={(e) =>
                  setTemplates((prev) => ({ ...prev, [platform]: e.target.value }))
                }
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  saveTemplateMut.mutate({
                    platform,
                    template: templates[platform] ?? "",
                  })
                }
              >
                Save {PLATFORM_LABEL[platform] ?? platform}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate Limits</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Max new-member posts / day</Label>
            <Input
              type="number"
              min={1}
              max={100}
              defaultValue={settings?.daily_signup_post_limit ?? 10}
              onBlur={(e) =>
                saveSettingsMut.mutate({
                  daily_signup_post_limit: Number(e.target.value) || 10,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Minimum interval (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={1440}
              defaultValue={settings?.minimum_post_interval_minutes ?? 30}
              onBlur={(e) =>
                saveSettingsMut.mutate({
                  minimum_post_interval_minutes: Number(e.target.value) || 30,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Publishing mode</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={settings?.publishing_mode ?? "queue"}
              onChange={(e) =>
                saveSettingsMut.mutate({
                  publishing_mode: e.target.value as "queue" | "immediate",
                })
              }
            >
              <option value="queue">queue (addToQueue)</option>
              <option value="immediate">immediate (shareNow)</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Default Yaarzo Social Image</Label>
            <Input
              placeholder="https://…/social-media/yaarzo-welcome.png"
              defaultValue={settings?.default_media_url ?? ""}
              onBlur={(e) =>
                saveSettingsMut.mutate({
                  default_media_url: e.target.value.trim() || null,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Used when a member has no public profile image. Required for TikTok fallback.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Site base URL</Label>
            <Input
              defaultValue={settings?.site_base_url ?? "https://yaarzo.com"}
              onBlur={(e) =>
                saveSettingsMut.mutate({
                  site_base_url: e.target.value.trim() || "https://yaarzo.com",
                })
              }
            />
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {/* Summary counters */}
      {tab === "overview" && (
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Today Successful
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600">
            {counters.todaySuccessful}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Failed
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-destructive">
            {counters.failed}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pending Queue
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {counters.pendingQueue}
          </div>
        </div>
      </div>
      )}

      {/* Recent Posts */}
      {tab === "auto" && (
      <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Recent Posts</CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={clearSuccessfulMut.isPending}
            onClick={() => clearSuccessfulMut.mutate()}
          >
            Clear Successful
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Showing up to 20 latest rows. Successful (queued/published) entries hide after 24 hours.
          </p>
          <LogsTable rows={recentLogs} />
        </CardContent>
      </Card>

      {/* Failed Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Failed Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Failed rows stay until Retry succeeds or you Delete the log. Delete does not affect users, profiles, Buffer, or the internal feed.
          </p>
          <LogsTable
            rows={failedLogs}
            onRetry={(id) => retryMut.mutate(id)}
            onDelete={deleteFailedWithConfirm}
            showActions
          />
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean | null; label: string }) {
  const color =
    ok === true
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
      : ok === false
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {ok === true ? <CheckCircle2 className="h-3 w-3" /> : ok === false ? <XCircle className="h-3 w-3" /> : null}
      Status: {label}
    </span>
  );
}

function LogsTable({
  rows,
  onRetry,
  onDelete,
  showActions,
}: {
  rows: Array<any>;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="py-2 pr-3 font-medium">User</th>
            <th className="py-2 pr-3 font-medium">Event</th>
            <th className="py-2 pr-3 font-medium">Platform</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Created</th>
            <th className="py-2 pr-3 font-medium">Error</th>
            {showActions && <th className="py-2 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const user =
              row.profiles?.display_name ||
              row.profiles?.username ||
              (row.user_id ? String(row.user_id).slice(0, 8) : "—");
            const event =
              row.event_type === "new_signup"
                ? "New Signup"
                : row.event_type === "test_post"
                  ? "Test Post"
                  : row.event_type;
            const desc =
              row.status === "published"
                ? { icon: "✅", label: "Published" }
                : row.status === "queued"
                  ? { icon: "⏳", label: "Queued in Buffer" }
                  : row.status === "failed"
                    ? { icon: "❌", label: "Failed" }
                    : row.status === "skipped"
                      ? { icon: "⏭", label: "Skipped" }
                      : { icon: "", label: String(row.status ?? "") };
            return (
              <tr key={row.id} className="border-b border-border/60">
                <td className="py-2 pr-3">{user}</td>
                <td className="py-2 pr-3">{event}</td>
                <td className="py-2 pr-3">
                  {PLATFORM_LABEL[row.platform] ?? row.platform}
                </td>
                <td className="py-2 pr-3">
                  {desc.label} {desc.icon}
                </td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                </td>
                <td className="max-w-[220px] truncate py-2 pr-3 text-xs text-destructive">
                  {row.error_message ?? ""}
                </td>
                {showActions && (
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.status === "failed" && row.buffer_channel_id && onRetry && (
                        <Button size="sm" variant="outline" onClick={() => onRetry(row.id)}>
                          Retry
                        </Button>
                      )}
                      {row.status === "failed" && onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(row.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
