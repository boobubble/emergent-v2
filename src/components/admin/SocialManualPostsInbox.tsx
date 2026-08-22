import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle, ExternalLink, Loader2, SkipForward, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSocialManualPosts, updateSocialManualStatus, type ManualInboxCard } from "@/lib/social-manual.functions";
import {
  AUTO_PLATFORM_LABEL,
  AUTO_PLATFORMS,
  MANUAL_PLATFORM_LABEL,
  MANUAL_PLATFORMS,
  type ManualInboxFilter,
  type ManualSocialPlatform,
} from "@/lib/social-manual-distribution";
import {
  SocialManualShareModal,
  type SocialManualShareTarget,
} from "@/components/admin/SocialManualShareModal";
import { DuplicatePublishDialog } from "@/components/admin/DuplicatePublishDialog";
import { getSocialConnectionsState } from "@/lib/social-connections.functions";
import {
  API_PUBLISH_PLATFORMS,
  isReadyToPublish,
  youtubeStudioUrl,
  type ApiPublishPlatform,
  type SocialConnectionPublic,
} from "@/lib/social-connections";
import {
  publishSocialManualAllConnected,
  publishSocialManualPost,
} from "@/lib/social-publish.functions";

const FILTERS: { id: ManualInboxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_manual", label: "Needs Manual Sharing" },
  { id: "partial", label: "Partially Shared" },
  { id: "completed", label: "Completed" },
];

export function SocialManualPostsInbox() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSocialManualPosts);
  const updateFn = useServerFn(updateSocialManualStatus);
  const getConn = useServerFn(getSocialConnectionsState);
  const publishFn = useServerFn(publishSocialManualPost);
  const publishAllFn = useServerFn(publishSocialManualAllConnected);
  const [filter, setFilter] = useState<ManualInboxFilter>("all");
  const [share, setShare] = useState<SocialManualShareTarget | null>(null);
  const [dup, setDup] = useState<
    | { kind: "one"; feedPostId: string; platform: ApiPublishPlatform; label: string }
    | { kind: "all"; feedPostId: string; label: string }
    | null
  >(null);

  const q = useQuery({
    queryKey: ["social-manual-posts", filter],
    queryFn: () => listFn({ data: { filter } }),
  });
  const connQ = useQuery({
    queryKey: ["social-connections"],
    queryFn: () => getConn(),
  });

  const connections = useMemo(() => {
    const map = new Map<string, SocialConnectionPublic>();
    for (const c of (connQ.data?.connections ?? []) as SocialConnectionPublic[]) {
      map.set(c.platform, c);
    }
    return map;
  }, [connQ.data?.connections]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["social-manual-posts"] });
    qc.invalidateQueries({ queryKey: ["social-automation"] });
  };

  const skipMut = useMutation({
    mutationFn: (p: { feedPostId: string; platform: ManualSocialPlatform }) =>
      updateFn({ data: { feedPostId: p.feedPostId, platform: p.platform, status: "skipped" } }),
    onSuccess: () => {
      toast.success("Skipped");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishMut = useMutation({
    mutationFn: (p: { feedPostId: string; platform: ApiPublishPlatform; force?: boolean }) =>
      publishFn({ data: p }),
    onSuccess: (r, vars) => {
      if (r.ok) {
        toast.success(`${MANUAL_PLATFORM_LABEL[vars.platform]} published`);
        invalidate();
        return;
      }
      if (r.reason === "already_posted") {
        setDup({
          kind: "one",
          feedPostId: vars.feedPostId,
          platform: vars.platform,
          label: MANUAL_PLATFORM_LABEL[vars.platform],
        });
        return;
      }
      toast.error(r.error ?? "Publish failed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishAllMut = useMutation({
    mutationFn: (p: { feedPostId: string; force?: boolean }) => publishAllFn({ data: p }),
    onSuccess: (r) => {
      let posted = 0;
      let already = 0;
      for (const row of r.results as Array<{ platform: string; ok?: boolean; reason?: string; skipped?: string; error?: string }>) {
        const name = MANUAL_PLATFORM_LABEL[row.platform as ManualSocialPlatform] ?? row.platform;
        if (row.ok) {
          posted += 1;
          toast.success(`${name} published`);
        } else if (row.reason === "already_posted") {
          already += 1;
        } else if (row.skipped === "not_connected") {
          /* skip silently */
        } else {
          toast.error(`${name}: ${row.error ?? "Failed"}`);
        }
      }
      if (already && posted === 0) {
        toast.message("Already posted on connected platforms — use Retry if you want to publish again.");
      }
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const requestPublish = (feedPostId: string, platform: ApiPublishPlatform, status: string) => {
    if (status === "posted") {
      setDup({ kind: "one", feedPostId, platform, label: MANUAL_PLATFORM_LABEL[platform] });
      return;
    }
    publishMut.mutate({ feedPostId, platform });
  };

  const requestPublishAll = (post: ManualInboxCard) => {
    const already = API_PUBLISH_PLATFORMS.filter((p) => {
      const conn = connections.get(p);
      return isReadyToPublish(conn) && post.manual[p].status === "posted";
    });
    if (already.length) {
      setDup({
        kind: "all",
        feedPostId: post.feed_post_id,
        label: already.map((p) => MANUAL_PLATFORM_LABEL[p]).join(", "),
      });
      return;
    }
    publishAllMut.mutate({ feedPostId: post.feed_post_id });
  };

  const posts = (q.data?.posts ?? []) as ManualInboxCard[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Distribution inbox for existing Yaarzo welcome feed posts. Instagram, X, and TikTok stay automatic via Buffer.
        Facebook, Pinterest, and Bluesky use Post Now when connected. YouTube stays manual in Studio.
      </p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {q.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading welcome posts…
        </div>
      )}
      {q.isError && (
        <p className="text-sm text-destructive">
          {(q.error as Error)?.message ?? "Failed to load manual posts"}
        </p>
      )}
      {!q.isLoading && posts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No eligible welcome feed posts. Members must opt in to social featuring, and the original Yaarzo welcome post must exist.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <WelcomeDistributionCard
            key={post.feed_post_id}
            post={post}
            connections={connections}
            publishing={publishMut.isPending || publishAllMut.isPending}
            onShare={(platform) =>
              setShare({
                payload: post,
                platform,
                status: post.manual[platform].status,
                publishedUrl: post.manual[platform].published_url,
              })
            }
            onSkip={(platform) =>
              skipMut.mutate({ feedPostId: post.feed_post_id, platform })
            }
            onPublish={(platform) =>
              requestPublish(post.feed_post_id, platform, post.manual[platform].status)
            }
            onPublishAll={() => requestPublishAll(post)}
          />
        ))}
      </div>

      {share && (
        <SocialManualShareModal
          target={share}
          connections={connections}
          onClose={() => setShare(null)}
          onStatusChange={() => {
            invalidate();
            setShare(null);
          }}
        />
      )}

      <DuplicatePublishDialog
        open={!!dup}
        payload={dup}
        title={
          dup?.kind === "all"
            ? `Already posted to ${dup.label}. Keep those live posts, or publish again?`
            : `Already posted to ${dup?.label ?? ""}. Keep the existing post, or publish again?`
        }
        onDismiss={() => setDup(null)}
        onKeepExisting={(current) => {
          setDup(null);
          if (current.kind === "all") {
            publishAllMut.mutate({ feedPostId: current.feedPostId, force: false });
          }
        }}
        onPublishAgain={(current) => {
          setDup(null);
          if (current.kind === "one") {
            publishMut.mutate({ feedPostId: current.feedPostId, platform: current.platform, force: true });
          } else {
            publishAllMut.mutate({ feedPostId: current.feedPostId, force: true });
          }
        }}
      />
    </div>
  );
}

function WelcomeDistributionCard({
  post,
  connections,
  publishing,
  onShare,
  onSkip,
  onPublish,
  onPublishAll,
}: {
  post: ManualInboxCard;
  connections: Map<string, SocialConnectionPublic>;
  publishing: boolean;
  onShare: (platform: ManualSocialPlatform) => void;
  onSkip: (platform: ManualSocialPlatform) => void;
  onPublish: (platform: ApiPublishPlatform) => void;
  onPublishAll: () => void;
}) {
  const created = useMemo(
    () => (post.created_at ? new Date(post.created_at).toLocaleString() : ""),
    [post.created_at],
  );
  const anyConnected = API_PUBLISH_PLATFORMS.some((p) => isReadyToPublish(connections.get(p)));

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start gap-3">
        {post.media_url ? (
          <img src={post.media_url} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-sm font-semibold">
            {post.display_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-tight">{post.display_name}</div>
          <div className="text-xs text-muted-foreground">@{post.username}</div>
          <div className="text-[11px] text-muted-foreground/80">{created}</div>
        </div>
        {anyConnected && (
          <Button size="sm" disabled={publishing} onClick={onPublishAll}>
            Publish to All Connected
          </Button>
        )}
      </header>

      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">
        {post.caption || "🎉 Welcome to Yaarzo"}
      </p>
      <a
        href={post.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block truncate text-sm text-primary hover:underline"
      >
        {post.profile_url}
      </a>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Auto</div>
          <div className="mt-2 space-y-1.5">
            {AUTO_PLATFORMS.map((p) => (
              <div key={p} className="flex items-center justify-between text-sm">
                <span>{AUTO_PLATFORM_LABEL[p]}</span>
                <AutoBadge status={post.auto[p].status} label={post.auto[p].label} published={post.auto[p].published} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Manual</div>
          <div className="mt-2 space-y-2">
            {MANUAL_PLATFORMS.map((p) => {
              const row = post.manual[p];
              const conn = connections.get(p);
              return (
                <div key={p} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{MANUAL_PLATFORM_LABEL[p]}</span>
                      <ManualBadge status={row.status} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <PlatformAction
                        platform={p}
                        connection={conn}
                        ready={isReadyToPublish(conn)}
                        publishing={publishing}
                        onPublish={() => onPublish(p as ApiPublishPlatform)}
                        onShare={() => onShare(p)}
                      />
                      {row.status === "not_posted" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => onSkip(p)}
                        >
                          Skip
                        </Button>
                      )}
                    </div>
                  </div>
                  {row.last_error && row.status !== "posted" && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-destructive">{row.last_error}</p>
                      {p !== "youtube" && isReadyToPublish(conn) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px]"
                          disabled={publishing}
                          onClick={() => onPublish(p as ApiPublishPlatform)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function PlatformAction({
  platform,
  connection,
  ready,
  publishing,
  onPublish,
  onShare,
}: {
  platform: ManualSocialPlatform;
  connection?: SocialConnectionPublic;
  ready: boolean;
  publishing: boolean;
  onPublish: () => void;
  onShare: () => void;
}) {
  if (platform === "youtube") {
    return (
      <>
        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" asChild>
          <a href={youtubeStudioUrl()} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-3 w-3" /> Open Studio
          </a>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onShare}>
          Copy
        </Button>
      </>
    );
  }
  if (ready) {
    return (
      <>
        <Button size="sm" className="h-7 px-2 text-[11px]" disabled={publishing} onClick={onPublish}>
          Post Now
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={onShare}>
          Preview
        </Button>
      </>
    );
  }
  const label =
    platform === "facebook" && (connection?.status === "pending" || connection?.status === "connected")
      ? "Select Page"
      : platform === "pinterest" && connection?.status === "connected"
        ? "Select Board"
        : platform === "facebook"
          ? "Connect Facebook"
          : platform === "pinterest"
            ? "Connect Pinterest"
            : "Connect Bluesky";
  return (
    <>
      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" asChild>
        <Link to="/admin/social-automation" search={{ tab: "connections" }}>
          {label}
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onShare}>
        Preview
      </Button>
    </>
  );
}

function AutoBadge({
  status,
  label,
  published,
}: {
  status: string;
  label: string;
  published: boolean;
}) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <Circle className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <XCircle className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Circle className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

function ManualBadge({ status }: { status: string }) {
  if (status === "posted") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> Posted
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <SkipForward className="h-3 w-3" /> Skipped
      </span>
    );
  }
  return <span className="text-[11px] text-muted-foreground">Not posted</span>;
}
