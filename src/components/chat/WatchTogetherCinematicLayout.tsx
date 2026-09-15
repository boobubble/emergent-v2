import { useEffect, useState, type ReactNode } from "react";
import { useOptionalYouTubePlayer } from "@/components/chat/youtube-player-context";
import { cn } from "@/lib/utils";

type WatchTogetherCinematicLayoutProps = {
  statusBar?: ReactNode;
  messages: ReactNode;
  composer: ReactNode;
};

/** Responsive cinematic Watch Together shell: stacked portrait/desktop, split landscape. */
export function WatchTogetherCinematicLayout({
  statusBar,
  messages,
  composer,
}: WatchTogetherCinematicLayoutProps) {
  const player = useOptionalYouTubePlayer();
  const registerMount = player?.registerCinematicMount;
  const [landscapeSplit, setLandscapeSplit] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const splitMq = window.matchMedia(
      "(orientation: landscape) and (min-width: 520px) and (max-width: 1024px)",
    );
    const update = () => setLandscapeSplit(splitMq.matches);
    update();
    splitMq.addEventListener("change", update);
    return () => splitMq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      registerMount?.(null);
    };
  }, [registerMount]);

  if (landscapeSplit) {
    return (
      <div
        data-watch-together-cinematic=""
        className="flex min-h-0 flex-1 flex-row overflow-hidden"
      >
        <section
          className="relative flex min-h-0 min-w-0 flex-[7] flex-col bg-neutral-950"
          aria-label="Watch Together video"
        >
          <div
            ref={registerMount}
            className="flex h-full min-h-0 w-full items-center justify-center"
          />
        </section>
        <section
          className="flex min-h-0 min-w-0 flex-[3] flex-col border-l border-border/60 bg-background/95"
          aria-label="Watch Together chat"
        >
          {statusBar && (
            <div className="shrink-0 border-b border-border/50 px-3 py-2">{statusBar}</div>
          )}
          <div className="min-h-0 flex-1 overflow-hidden">{messages}</div>
          <div
            className="shrink-0 border-t border-border/50 pb-[env(safe-area-inset-bottom,0px)]"
          >
            {composer}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      data-watch-together-cinematic=""
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <section
        className="shrink-0 bg-neutral-950 px-2 pt-2 sm:px-4 sm:pt-3"
        aria-label="Watch Together video"
      >
        <div className="mx-auto w-full max-w-5xl">
          {statusBar && <div className="mb-2">{statusBar}</div>}
          <div
            ref={registerMount}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl border border-border/50 shadow-2xl",
              "aspect-video max-h-[min(56vh,520px)] bg-black",
            )}
          />
        </div>
      </section>
      <div className="min-h-0 flex-1 overflow-hidden">{messages}</div>
      <div className="shrink-0 border-t border-border/40 pb-[env(safe-area-inset-bottom,0px)]">
        {composer}
      </div>
    </div>
  );
}

export function useWatchTogetherCinematicActive(): boolean {
  const player = useOptionalYouTubePlayer();
  return Boolean(
    player?.isOpen && player.presentationMode === "cinematic",
  );
}
