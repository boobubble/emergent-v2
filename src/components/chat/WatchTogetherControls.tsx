import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Eye, Loader2, Play, Square, Tv2, Upload, Youtube } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
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
import {
  ALLOWED_WATCH_VIDEO_MIMES,
  MAX_WATCH_UPLOAD_BYTES,
  uploadWatchTogetherVideo,
} from "@/lib/watch-together-upload.functions";
import { useWatchTogether, type StartWatchTogetherInput } from "@/lib/use-watch-together";
import { useOptionalYouTubePlayer } from "@/components/chat/youtube-player-context";

type WatchTogetherComposerContextValue = ReturnType<typeof useWatchTogether> & {
  enabled: boolean;
  peerName: string;
  openStartDialog: () => void;
  startDialogError: string | null;
};

const WatchTogetherComposerContext = createContext<WatchTogetherComposerContextValue | null>(null);

function useWatchTogetherComposer() {
  const ctx = useContext(WatchTogetherComposerContext);
  if (!ctx) throw new Error("WatchTogetherComposerContext missing");
  return ctx;
}

export function useOptionalWatchTogetherComposer() {
  return useContext(WatchTogetherComposerContext);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function WatchTogetherComposerProvider({
  channelId,
  authUserId,
  peerId,
  peerName = "your friend",
  children,
}: {
  channelId: string;
  authUserId: string | null;
  peerId: string | null;
  peerName?: string;
  children: ReactNode;
}) {
  const hook = useWatchTogether({ channelId, authUserId, peerName });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"youtube" | "upload">("youtube");
  const [videoInput, setVideoInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [startDialogError, setStartDialogError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadWatchTogetherVideo);

  const resolvedPeerId =
    (peerId && isUuid(peerId) ? peerId : null) ||
    (authUserId ? parseDmChannel(channelId, authUserId).peerId : null);

  const enabled = hook.enabled && Boolean(resolvedPeerId && isUuid(resolvedPeerId));

  const resetForm = () => {
    setVideoInput("");
    setUploadFile(null);
    setUploadPreview(null);
    setMode("youtube");
    setStartDialogError(null);
  };

  const handleStart = async () => {
    if (!resolvedPeerId) return;
    setStartDialogError(null);

    try {
      let input: StartWatchTogetherInput;

      if (mode === "youtube") {
        const videoId = parseYoutubeId(videoInput);
        if (!videoId) {
          setStartDialogError("Enter a valid YouTube URL or video ID.");
          return;
        }
        input = { sourceType: "youtube", providerVideoId: videoId };
      } else {
        if (!uploadFile) {
          setStartDialogError("Choose a video file first.");
          return;
        }
        if (uploadFile.size > MAX_WATCH_UPLOAD_BYTES) {
          setStartDialogError("Video too large (max 100 MB).");
          return;
        }
        const mime = uploadFile.type || "video/mp4";
        if (!ALLOWED_WATCH_VIDEO_MIMES.includes(mime as (typeof ALLOWED_WATCH_VIDEO_MIMES)[number])) {
          setStartDialogError("Unsupported format. Use MP4, WebM, or MOV.");
          return;
        }
        const dataBase64 = await fileToBase64(uploadFile);
        const uploaded = await uploadFn({
          data: {
            channelId,
            name: uploadFile.name,
            mime,
            size: uploadFile.size,
            dataBase64,
          },
        });
        input = {
          sourceType: "upload",
          uploadStoragePath: uploaded.storagePath,
          uploadFilename: uploaded.filename,
          uploadMime: uploaded.mime,
          sourceTitle: uploaded.filename,
        };
      }

      await hook.startWatchTogether(resolvedPeerId, input);
      resetForm();
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start Watch Together.";
      setStartDialogError(message);
      console.error("[watch-together] start dialog failed", err);
    }
  };

  if (!enabled) return <>{children}</>;

  const value: WatchTogetherComposerContextValue = {
    ...hook,
    enabled,
    peerName,
    startDialogError,
    openStartDialog: () => {
      resetForm();
      setDialogOpen(true);
    },
  };

  return (
    <WatchTogetherComposerContext.Provider value={value}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={(next) => !hook.starting && setDialogOpen(next)}>
        <DialogContent className="mx-4 w-[calc(100%-2rem)] max-w-md sm:mx-auto">
          <DialogHeader>
            <div className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <DialogTitle className="text-center">Watch Together</DialogTitle>
            <DialogDescription className="text-center">
              Start a synced session with {peerName}. Playback begins after they join.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("youtube")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium ${mode === "youtube" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium ${mode === "upload" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              <Upload className="h-4 w-4" />
              Upload Video
            </button>
          </div>

          {mode === "youtube" ? (
            <Input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              disabled={hook.starting}
              autoFocus
              placeholder="Paste YouTube link or video ID"
              className="min-h-11"
            />
          ) : (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setUploadFile(file);
                  setUploadPreview(file ? `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB` : null);
                }}
              />
              <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                Choose video from device
              </Button>
              {uploadPreview && <p className="text-xs text-muted-foreground">{uploadPreview}</p>}
              <p className="text-xs text-muted-foreground">MP4, WebM, or MOV up to 100 MB.</p>
            </div>
          )}

          {(startDialogError || hook.error) && (
            <p className="text-sm text-destructive" role="alert">
              {startDialogError || hook.error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={hook.starting} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={hook.starting || (mode === "youtube" ? !parseYoutubeId(videoInput) : !uploadFile)}
              onClick={() => void handleStart()}
            >
              {hook.starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Watch Together
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WatchTogetherComposerContext.Provider>
  );
}

export function WatchTogetherSessionBar() {
  const {
    session,
    isHost,
    ending,
    phase,
    statusMessage,
    stopWatchTogether,
    joinWatchTogether,
    peerName,
  } = useWatchTogetherComposer();
  const player = useOptionalYouTubePlayer();
  if (!session) return null;

  const sessionTitle =
    session.source_title || session.upload_filename || session.provider_video_id || "Watch Together";
  const detail =
    statusMessage ||
    (isHost
      ? phase === "waiting"
        ? `Waiting for ${peerName} to join…`
        : `${peerName} joined • Watching together`
      : phase === "watching"
        ? "Watching together"
        : `${peerName} invited you`);

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
      <Tv2 className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 text-xs">
        <div className="font-semibold text-primary">Watch Together</div>
        <div className="truncate text-muted-foreground">{sessionTitle}</div>
        <div className="truncate text-[11px] text-muted-foreground">{detail}</div>
      </div>
      {!isHost && phase !== "watching" && (
        <Button type="button" size="sm" variant="secondary" className="h-8" onClick={() => void joinWatchTogether()}>
          Join
        </Button>
      )}
      {!isHost && phase === "watching" && (
        <Button type="button" size="sm" variant="secondary" className="h-8" onClick={() => player?.restorePlayer()}>
          {player?.isOpen ? "Restore" : "Open"}
        </Button>
      )}
      {isHost ? (
        <Button type="button" size="sm" variant="outline" className="h-8" disabled={ending} onClick={() => void stopWatchTogether()}>
          {ending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "End"}
        </Button>
      ) : phase === "watching" ? (
        <button
          type="button"
          onClick={() => player?.closePlayer()}
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-white/10"
          aria-label="Leave player"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function WatchTogetherComposerButton() {
  const { loading, session, isHost, phase, openStartDialog } = useWatchTogetherComposer();

  return (
    <button
      type="button"
      onClick={openStartDialog}
      disabled={loading || Boolean(session && isHost && phase !== "ended")}
      aria-label="Watch Together"
      title="Watch Together"
      className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Tv2 className="h-5 w-5" />}
    </button>
  );
}

/** Legacy export */
export const WatchTogetherControls = WatchTogetherComposerButton;

export function WatchTogetherComposerShell({
  channelId,
  authUserId,
  peerId,
  peerName,
  children,
}: {
  channelId: string;
  authUserId: string | null;
  peerId: string | null;
  peerName?: string;
  children: ReactNode;
}) {
  return (
    <WatchTogetherComposerProvider
      channelId={channelId}
      authUserId={authUserId}
      peerId={peerId}
      peerName={peerName}
    >
      {children}
    </WatchTogetherComposerProvider>
  );
}
