import { useState } from "react";
import { Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/lib/chat-types";
import {
  acceptWatchTogetherInvite,
  getWatchInviteResolution,
  rejectWatchTogetherInvite,
} from "@/lib/watch-together-actions";
import { ensureWatchTogetherDmOpen } from "@/lib/watch-together-dm";

export type WatchTogetherInviteMeta = {
  sessionId: string;
  sourceType: "youtube" | "upload";
  providerVideoId?: string;
  uploadFilename?: string;
  sourceTitle?: string;
  hostId: string;
};

export function parseWatchTogetherInvite(message: Message): WatchTogetherInviteMeta | null {
  const raw = message.attachment as { __watchTogetherInvite?: WatchTogetherInviteMeta } | undefined;
  if (!raw?.__watchTogetherInvite?.sessionId) return null;
  return raw.__watchTogetherInvite;
}

type WatchTogetherInviteCardProps = {
  message: Message;
  hostName: string;
  isSelf: boolean;
};

export function WatchTogetherInviteCard({
  message,
  hostName,
  isSelf,
}: WatchTogetherInviteCardProps) {
  const invite = parseWatchTogetherInvite(message);
  const [joining, setJoining] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!invite) return null;

  const resolution = getWatchInviteResolution(invite.sessionId);
  const title = invite.sourceTitle || invite.uploadFilename || invite.providerVideoId || "Watch Together";
  const subtitle =
    invite.sourceType === "upload"
      ? `${hostName} sent a video to watch together`
      : `${hostName} invited you to watch a YouTube video together`;

  const handleJoin = async () => {
    setActionError(null);
    setJoining(true);
    try {
      ensureWatchTogetherDmOpen(invite.hostId);
      await acceptWatchTogetherInvite({
        sessionId: invite.sessionId,
        channelId: message.channelId,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to join Watch Together.");
    } finally {
      setJoining(false);
    }
  };

  const handleReject = async () => {
    setActionError(null);
    setRejecting(true);
    try {
      ensureWatchTogetherDmOpen(invite.hostId);
      await rejectWatchTogetherInvite({
        sessionId: invite.sessionId,
        channelId: message.channelId,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to decline Watch Together.");
    } finally {
      setRejecting(false);
    }
  };

  if (resolution === "declined") {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Watch Together invite declined
      </div>
    );
  }

  if (resolution === "expired") {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        This Watch Together session is no longer available.
      </div>
    );
  }

  if (resolution === "accepted") {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center text-sm text-primary">
        You joined Watch Together
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-card p-4 text-center shadow-sm">
      <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
        <Tv2 className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">Watch Together</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      <p className="mt-2 truncate text-sm font-medium text-foreground">{title}</p>
      {!isSelf && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={joining || rejecting}
            onClick={() => void handleJoin()}
          >
            {joining ? "Joining…" : "Join Watch Together"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={joining || rejecting}
            onClick={() => void handleReject()}
          >
            {rejecting ? "Declining…" : "Reject"}
          </Button>
        </div>
      )}
      {actionError && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {actionError}
        </p>
      )}
    </div>
  );
}
