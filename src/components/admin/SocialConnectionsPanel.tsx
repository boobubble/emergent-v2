import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Link2, RefreshCw, Unplug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  chooseFacebookPage,
  choosePinterestBoard,
  connectBlueskyAccount,
  disconnectSocialConnection,
  getSocialConnectionsState,
  listFacebookPages,
  listPinterestBoards,
  pingSocialConnection,
  startSocialOauth,
} from "@/lib/social-connections.functions";
import {
  isReadyToPublish,
  youtubeStudioUrl,
  type SocialConnectionPublic,
} from "@/lib/social-connections";

const PLATFORM_COPY: Record<
  SocialConnectionPublic["platform"],
  { title: string; blurb: string }
> = {
  facebook: {
    title: "Facebook Page",
    blurb: "Connect the Yaarzo Facebook Page. One-click publishing uses the existing welcome post.",
  },
  pinterest: {
    title: "Pinterest Business",
    blurb: "Connect Pinterest, then choose the default Yaarzo board for pins.",
  },
  bluesky: {
    title: "Bluesky",
    blurb: "Sign in with the Yaarzo handle and an app password. Tokens stay on the server.",
  },
  youtube: {
    title: "YouTube",
    blurb: "Community posts stay manual. Open YouTube Studio — Yaarzo does not automate the browser.",
  },
};

export function SocialConnectionsPanel({
  oauthOk,
  oauthError,
  facebookPagesFlag,
}: {
  oauthOk?: string;
  oauthError?: string;
  facebookPagesFlag?: string;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const getState = useServerFn(getSocialConnectionsState);
  const startOauth = useServerFn(startSocialOauth);
  const disconnectFn = useServerFn(disconnectSocialConnection);
  const pingFn = useServerFn(pingSocialConnection);
  const listPagesFn = useServerFn(listFacebookPages);
  const choosePageFn = useServerFn(chooseFacebookPage);
  const listBoardsFn = useServerFn(listPinterestBoards);
  const chooseBoardFn = useServerFn(choosePinterestBoard);
  const connectBskyFn = useServerFn(connectBlueskyAccount);

  const [bskyId, setBskyId] = useState("");
  const [bskyPass, setBskyPass] = useState("");
  const [showBskyForm, setShowBskyForm] = useState(false);
  const [fbPageId, setFbPageId] = useState("");
  const [pinBoardId, setPinBoardId] = useState("");

  const q = useQuery({
    queryKey: ["social-connections"],
    queryFn: () => getState(),
  });

  const pagesQ = useQuery({
    queryKey: ["social-facebook-pages"],
    queryFn: () => listPagesFn(),
    enabled: false,
  });
  const boardsQ = useQuery({
    queryKey: ["social-pinterest-boards"],
    queryFn: () => listBoardsFn(),
    enabled: false,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["social-connections"] });

  useEffect(() => {
    if (!oauthOk && !oauthError) return;
    if (oauthOk === "facebook") {
      toast.success(
        facebookPagesFlag === "1"
          ? "Facebook signed in — select the Yaarzo Page"
          : "Facebook Page connected",
      );
    } else if (oauthOk === "pinterest") {
      toast.success("Pinterest connected — confirm the default board");
    }
    if (oauthError) toast.error(oauthError);
    void navigate({
      to: "/admin/social-automation",
      search: { tab: "connections" },
      replace: true,
    });
    invalidate();
    if (oauthOk === "facebook" || facebookPagesFlag === "1") {
      void pagesQ.refetch();
    }
    if (oauthOk === "pinterest") {
      void boardsQ.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthOk, oauthError, facebookPagesFlag]);

  const oauthMut = useMutation({
    mutationFn: (platform: "facebook" | "pinterest") => startOauth({ data: { platform } }),
    onSuccess: (r) => {
      if (r.authorizeUrl) window.location.assign(r.authorizeUrl);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const discMut = useMutation({
    mutationFn: (platform: "facebook" | "pinterest" | "bluesky") =>
      disconnectFn({ data: { platform } }),
    onSuccess: () => {
      toast.success("Disconnected");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pingMut = useMutation({
    mutationFn: (platform: "facebook" | "pinterest" | "bluesky") =>
      pingFn({ data: { platform } }),
    onSuccess: (r) => {
      if (r.health === "healthy") toast.success("Connection healthy");
      else toast.error(r.error ?? "Connection check failed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pageMut = useMutation({
    mutationFn: (pageId: string) => choosePageFn({ data: { pageId } }),
    onSuccess: () => {
      toast.success("Facebook Page saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const boardMut = useMutation({
    mutationFn: (boardId: string) => chooseBoardFn({ data: { boardId } }),
    onSuccess: () => {
      toast.success("Default Pinterest board saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bskyMut = useMutation({
    mutationFn: () =>
      connectBskyFn({
        data: { identifier: bskyId.trim(), appPassword: bskyPass },
      }),
    onSuccess: () => {
                    toast.success("Bluesky connected");
      setBskyPass("");
      setShowBskyForm(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const connections = (q.data?.connections ?? []) as SocialConnectionPublic[];
  const env = q.data?.env;
  const canManage = q.data?.canManageConnections === true;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connect Yaarzo-owned accounts for one-click publishing of existing welcome feed posts.
        Access tokens never leave the server. Connecting never auto-publishes.
      </p>

      {env && !env.encryptionConfigured && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Set SOCIAL_TOKEN_ENC_KEY (or WEBHOOK_ENC_KEY) on the server before connecting accounts.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {connections.map((c) => {
          const copy = PLATFORM_COPY[c.platform];
          return (
            <Card key={c.platform}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    {copy.title}
                  </span>
                  <StatusBadge connection={c} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{copy.blurb}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="truncate font-medium">
                    {c.account_name || c.handle || c.page_name || (c.platform === "youtube" ? "YouTube Studio" : "—")}
                  </dd>
                  {c.platform === "facebook" && (
                    <>
                      <dt className="text-muted-foreground">Page</dt>
                      <dd>{c.page_name || "Not selected"}</dd>
                      {env?.facebookGraphApiVersion && (
                        <>
                          <dt className="text-muted-foreground">Graph API</dt>
                          <dd>{env.facebookGraphApiVersion}</dd>
                        </>
                      )}
                    </>
                  )}
                  {c.platform === "pinterest" && (
                    <>
                      <dt className="text-muted-foreground">Board</dt>
                      <dd>{c.default_board_name || "Not selected"}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Health</dt>
                  <dd className="capitalize">{c.platform === "youtube" ? "Manual only" : c.health}</dd>
                  <dt className="text-muted-foreground">Last checked</dt>
                  <dd>
                    {c.platform === "youtube"
                      ? "—"
                      : c.last_checked_at
                        ? new Date(c.last_checked_at).toLocaleString()
                        : "Never"}
                  </dd>
                </dl>
                {c.last_error && c.platform !== "youtube" && (
                  <p className="text-xs text-destructive">{c.last_error}</p>
                )}
                {c.platform === "pinterest" && env?.pinterestApiMode === "sandbox" && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5">
                    <div className="text-[11px] font-semibold text-amber-800">Pinterest Sandbox Mode</div>
                    <p className="text-[11px] text-amber-800/90">
                      Test Pins are created using Pinterest API Sandbox and are not production publishing.
                    </p>
                  </div>
                )}
                {c.platform === "youtube" ? (
                  <Button size="sm" asChild>
                    <a href={youtubeStudioUrl()} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open YouTube Studio
                    </a>
                  </Button>
                ) : canManage ? (
                  <div className="flex flex-wrap gap-2">
                    {c.platform === "facebook" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => oauthMut.mutate("facebook")}
                          disabled={oauthMut.isPending || !env?.facebookConfigured}
                        >
                          {c.status === "connected" || c.status === "pending" ? "Reconnect" : "Connect Facebook"}
                        </Button>
                        {(c.status === "connected" || c.status === "pending") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pagesQ.refetch()}
                            disabled={pagesQ.isFetching}
                          >
                            Load Pages
                          </Button>
                        )}
                      </>
                    )}
                    {c.platform === "pinterest" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => oauthMut.mutate("pinterest")}
                          disabled={oauthMut.isPending || !env?.pinterestConfigured}
                        >
                          {c.status === "connected" ? "Reconnect" : "Connect Pinterest"}
                        </Button>
                        {c.status === "connected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => boardsQ.refetch()}
                            disabled={boardsQ.isFetching}
                          >
                            Load Boards
                          </Button>
                        )}
                      </>
                    )}
                    {c.platform !== "bluesky" && c.status !== "disconnected" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pingMut.mutate(c.platform as "facebook" | "pinterest")}
                          disabled={pingMut.isPending}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Check health
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => discMut.mutate(c.platform as "facebook" | "pinterest")}
                          disabled={discMut.isPending}
                        >
                          <Unplug className="mr-1.5 h-3.5 w-3.5" /> Disconnect
                        </Button>
                      </>
                    )}
                    {c.platform === "bluesky" && c.status === "connected" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBskyForm(true)}
                        >
                          Reconnect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pingMut.mutate("bluesky")}
                          disabled={pingMut.isPending}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Check health
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => discMut.mutate("bluesky")}
                          disabled={discMut.isPending}
                        >
                          <Unplug className="mr-1.5 h-3.5 w-3.5" /> Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Only admins can connect or disconnect accounts.</p>
                )}

                {c.platform === "facebook" && canManage && (pagesQ.data?.pages?.length ?? 0) > 0 && (
                  <div className="space-y-1.5">
                    <Label>Select Yaarzo Facebook Page</Label>
                    <div className="flex gap-2">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={fbPageId || c.page_id || ""}
                        onChange={(e) => setFbPageId(e.target.value)}
                      >
                        <option value="">Choose a page…</option>
                        {pagesQ.data!.pages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        disabled={!fbPageId || pageMut.isPending}
                        onClick={() => pageMut.mutate(fbPageId)}
                      >
                        Save Page
                      </Button>
                    </div>
                  </div>
                )}

                {c.platform === "pinterest" && canManage && (boardsQ.data?.boards?.length ?? 0) > 0 && (
                  <div className="space-y-1.5">
                    <Label>Default Yaarzo Board</Label>
                    <div className="flex gap-2">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={pinBoardId || c.default_board_id || ""}
                        onChange={(e) => setPinBoardId(e.target.value)}
                      >
                        <option value="">Choose a board…</option>
                        {boardsQ.data!.boards.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        disabled={!pinBoardId || boardMut.isPending}
                        onClick={() => boardMut.mutate(pinBoardId)}
                      >
                        Save Board
                      </Button>
                    </div>
                  </div>
                )}

                {c.platform === "bluesky" && canManage && (c.status !== "connected" || showBskyForm) && (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      bskyMut.mutate();
                    }}
                  >
                    <div className="space-y-1">
                      <Label htmlFor="bsky-id">Handle or email</Label>
                      <Input
                        id="bsky-id"
                        value={bskyId}
                        onChange={(e) => setBskyId(e.target.value)}
                        autoComplete="username"
                        placeholder="yaarzo.bsky.social"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bsky-pass">App password</Label>
                      <Input
                        id="bsky-pass"
                        type="password"
                        value={bskyPass}
                        onChange={(e) => setBskyPass(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <Button size="sm" type="submit" disabled={bskyMut.isPending || !bskyId || !bskyPass}>
                      Connect Bluesky
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      Create an app password in Bluesky Settings. The password is stored encrypted on the server and is never shown again.
                    </p>
                  </form>
                )}

                {c.platform === "facebook" && !env?.facebookConfigured && canManage && (
                  <p className="text-[11px] text-muted-foreground">
                    Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET, then add redirect URI{" "}
                    <code className="text-[10px]">{env.facebookRedirectUri}</code>
                  </p>
                )}
                {c.platform === "pinterest" && !env?.pinterestConfigured && canManage && (
                  <p className="text-[11px] text-muted-foreground">
                    Set PINTEREST_APP_ID and PINTEREST_APP_SECRET, then add redirect URI{" "}
                    <code className="text-[10px]">{env.pinterestRedirectUri}</code>
                  </p>
                )}
                {isReadyToPublish(c) && (
                  <p className="text-[11px] text-emerald-600">Ready for one-click Post Now from Manual Posts.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Instagram, X, and TikTok stay on Buffer under{" "}
        <Link to="/admin/social-automation" search={{ tab: "auto" }} className="text-primary hover:underline">
          Auto Posts
        </Link>
        . Connecting an account here never auto-publishes.
      </p>
    </div>
  );
}

function StatusBadge({ connection }: { connection: SocialConnectionPublic }) {
  if (connection.platform === "youtube") {
    return (
      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        Manual Only
      </span>
    );
  }
  if (connection.status === "connected" && isReadyToPublish(connection)) {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
        Connected
      </span>
    );
  }
  if (connection.status === "pending") {
    return (
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Select a Page
      </span>
    );
  }
  if (connection.status === "connected") {
    return (
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        Connected — setup needed
      </span>
    );
  }
  if (connection.status === "error" || connection.status === "expired") {
    return (
      <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
        {connection.status === "expired" ? "Expired" : "Error"}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Not Connected
    </span>
  );
}
