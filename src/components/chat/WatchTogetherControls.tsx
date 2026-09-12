import { useState } from "react";
import { Eye, Loader2, Play, Square, Users } from "lucide-react";
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
import { useWatchTogether } from "@/lib/use-watch-together";

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

  if (!enabled || !peerId) return null;

  const handleStart = async () => {
    const videoId = parseYoutubeId(videoInput);
    if (!videoId) return;

    const result = await startWatchTogether(peerId, videoId);
    if (result) {
      setVideoInput("");
      setOpen(false);
    }
  };

  const handleOpen = () => {
    setVideoInput("");
    setOpen(true);
  };

  return (
    <>
      {session ? (
        <div className="flex items-center gap-1">
          <span
            className="hidden items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary sm:flex"
            title={
              isHost ? "You are hosting Watch Together" : `${peerName} is hosting Watch Together`
            }
          >
            <Users className="h-3.5 w-3.5" />
            <span>{isHost ? "Watching together" : "Watch Together"}</span>
          </span>

          {isHost && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void stopWatchTogether()}
              disabled={ending}
              className="h-8 px-2.5 text-xs"
              title="Stop Watch Together"
            >
              {ending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Stop</span>
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          disabled={loading}
          aria-label="Start Watch Together"
          title="Watch Together"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
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
              Start a synced YouTube session with {peerName}.
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
              placeholder="https://youtu.be/� or YouTube video ID"
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
                  Starting�
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Watching
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
