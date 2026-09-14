import { useState } from "react";
import { Eye, Loader2, Play, Square, Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseYoutubeId } from "@/lib/media-providers-config";
import { isUuid, parseDmChannel } from "@/lib/dm-utils";
import { useWatchTogether } from "@/lib/use-watch-together";
import { useOptionalYouTubePlayer } from "@/components/chat/youtube-player-context";

interface WatchTogetherControlsProps {
  channelId: string;
  authUserId: string | null;
  peerId: string | null;
  peerName?: string;
}

export function WatchTogetherControls({
  channelId,
  authUserId,
  peerId,
  peerName = "your friend",
}: WatchTogetherControlsProps) {
  const [open, setOpen] = useState(false);
  const [videoInput, setVideoInput] = useState("");
  const player = useOptionalYouTubePlayer();

  const {
    enabled,
    session,
    isHost,
    loading,
    starting,
    ending,
    error,
    startWatchTogether,
    stopWatchTogether,
  } = useWatchTogether({
    channelId,
    authUserId,
  });

  const resolvedPeerId =
    (peerId && isUuid(peerId) ? peerId : null) ||
    parseDmChannel(channelId, authUserId).peerId;

  if (!enabled || !resolvedPeerId || !isUuid(resolvedPeerId)) return null;

  const handleStart = async () => {
    const videoId = parseYoutubeId(videoInput);
    if (!videoId) return;

    const result = await startWatchTogether(resolvedPeerId, videoId);
    if (result) {
      setVideoInput("");
      setOpen(false);
    }
  };

  const handleOpen = () => {
    setVideoInput("");
    setOpen(true);
  };

  const joinSession = () => {
    if (!session || !player) return;
    if (player.activeVideoId === session.provider_video_id && player.isMinimized) {
      player.restorePlayer();
      return;
    }
    player.openPlayer({
      videoId: session.provider_video_id,
      url: `https://youtu.be/${session.provider_video_id}`,
      title: "Watch Together",
    });
  };

  const leavePlayer = () => {
    player?.closePlayer();
  };

  const hostLabel = isHost ? "You started this" : `${peerName} started this`;

  return (
    <>
      {session ? (
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={joinSession}
            title={`${hostLabel}. Open Watch Together.`}
            aria-label={`Watch Together active. ${hostLabel}`}
            className="flex h-8 max-w-[9.5rem] items-center gap-1 rounded-full bg-primary/15 px-2 text-[11px] font-semibold text-primary transition hover:bg-primary/25 sm:max-w-none sm:px-2.5"
          >
            <Tv2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Watch</span>
              <span className="hidden sm:inline">Watch Together</span>
            </span>
          </button>
          <button
            type="button"
            onClick={joinSession}
            className="hidden h-8 items-center rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-white/10 hover:text-foreground sm:flex"
          >
            Join
          </button>
          {isHost ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void stopWatchTogether()}
              disabled={ending}
              className="h-8 px-2 text-xs sm:px-2.5"
              title="End Watch Together"
            >
              {ending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 hidden sm:inline">End</span>
            </Button>
          ) : (
            <button
              type="button"
              onClick={leavePlayer}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              aria-label="Leave Watch Together player"
              title="Leave player"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          disabled={loading}
          aria-label="Watch Together"
          title="Watch Together"
          className="flex h-8 items-center gap-1 rounded-full px-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50 sm:px-2.5"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Tv2 className="h-4 w-4" />
          )}
          <span className="hidden text-xs font-semibold sm:inline">Watch Together</span>
        </button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!starting) setOpen(next);
        }}
      >
        <DialogContent className="mx-4 w-[calc(100%-2rem)] max-w-md sm:mx-auto">
          <DialogHeader>
            <div className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <DialogTitle className="text-center">Watch Together</DialogTitle>
            <DialogDescription className="text-center">
              Start a synced YouTube session with {peerName}. You will be the host.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="watch-together-youtube" className="text-sm font-medium">
              YouTube video
            </label>
            <Input
              id="watch-together-youtube"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleStart();
                }
              }}
              disabled={starting}
              autoFocus
              placeholder="https://youtu.be/… or YouTube video ID"
              className="min-h-11 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube watch link, Shorts link, youtu.be link, or 11-character video ID.
            </p>

            {videoInput.trim() && !parseYoutubeId(videoInput) && (
              <p className="text-sm text-destructive" role="alert">
                Enter a valid YouTube video URL or video ID.
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={starting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={starting || !parseYoutubeId(videoInput)}
              onClick={() => void handleStart()}
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start watching
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
