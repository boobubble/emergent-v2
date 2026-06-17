// Live DJ / RJ footer player — pinned under the lobby chat composer.
//
// • All listeners see the same player state, synced through
//   app_settings.dj_player + realtime (see src/lib/dj-store.tsx).
// • Admins get inline controls (paste URL, play / pause / skip).
// • Non-admins only see the "Now playing" chip and a local mute toggle.
// • Hidden behind the master switch in /admin/dj — renders nothing
//   when disabled, so existing chat UX is untouched by default.

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Disc3, Play, Pause, SkipForward, Volume2, VolumeX, Link as LinkIcon, Radio,
} from "lucide-react";

import { useDjPlayer } from "@/lib/dj-store";
import {
  buildTrackFromUrl, currentPositionSec, DJ_DEFAULTS, type DjPlayerState,
} from "@/lib/dj-config";
import { updateSetting } from "@/lib/admin.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BroadcasterTicker } from "@/components/broadcaster/BroadcasterAnnouncements";

const LISTENER_MUTE_KEY = "dj_player.listener_muted";

export function DjFooter() {
  const { state, ready } = useDjPlayer();
  const { user } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const { data: rolesData } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: () => fetchRoles({}),
    enabled: !!user,
    staleTime: 60_000,
  });
  const isAdmin = !!rolesData?.isAdmin;

  // Listener-side mute is stored locally, never broadcast.
  const [listenerMuted, setListenerMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LISTENER_MUTE_KEY) === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LISTENER_MUTE_KEY, listenerMuted ? "1" : "0");
  }, [listenerMuted]);

  const save = useMutation({
    mutationFn: (next: DjPlayerState) =>
      saveSetting({ data: { key: "dj_player", value: next } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
    onError: (e: any) => toast.error(e?.message ?? "Failed to update player"),
  });

  if (!ready || !state.enabled) return null;

  return (
    <DjFooterView
      state={state}
      isAdmin={isAdmin}
      listenerMuted={listenerMuted}
      onToggleListenerMute={() => setListenerMuted((m) => !m)}
      onSave={(next) => save.mutate(next)}
      saving={save.isPending}
    />
  );
}

function DjFooterView({
  state, isAdmin, listenerMuted, onToggleListenerMute, onSave, saving,
}: {
  state: DjPlayerState;
  isAdmin: boolean;
  listenerMuted: boolean;
  onToggleListenerMute: () => void;
  onSave: (next: DjPlayerState) => void;
  saving: boolean;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");

  const muted = state.allowListenerMute && listenerMuted;
  const effectiveVolume = muted ? 0 : Math.max(0, Math.min(100, state.defaultVolume));

  // ── Admin actions ───────────────────────────────────────────────
  const loadTrack = () => {
    const track = buildTrackFromUrl(urlDraft, titleDraft);
    if (!track) { toast.error("Paste a YouTube URL or a direct audio link"); return; }
    onSave({
      ...state,
      track,
      playing: true,
      positionSec: 0,
      startedAtMs: Date.now(),
    });
    setUrlDraft("");
    setTitleDraft("");
  };

  const togglePlay = () => {
    if (!state.track) return;
    if (state.playing) {
      onSave({
        ...state,
        playing: false,
        positionSec: currentPositionSec(state),
        startedAtMs: 0,
      });
    } else {
      onSave({ ...state, playing: true, startedAtMs: Date.now() });
    }
  };

  const stopTrack = () => {
    onSave({ ...state, track: null, playing: false, positionSec: 0, startedAtMs: 0 });
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="border-t border-border/60 bg-muted/40 backdrop-blur-sm">
      <BroadcasterTicker target="chatbar" />
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {/* On Air chip */}
        <div className="flex items-center gap-2 rounded-full bg-background/70 px-2.5 py-1 shadow-sm">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              state.playing && state.track ? "bg-red-500 animate-pulse" : "bg-muted-foreground/40"
            }`}
            aria-hidden
          />
          <Radio className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {state.playing && state.track ? "On Air" : "Off Air"}
          </span>
          {state.djName && (
            <span className="text-[11px] text-muted-foreground/80">· {state.djName}</span>
          )}
        </div>

        {/* Now playing title */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
          <Disc3
            className={`h-4 w-4 shrink-0 text-primary ${state.playing && state.track ? "animate-spin" : "opacity-50"}`}
            style={{ animationDuration: "3.5s" }}
          />
          <span className="truncate text-foreground/90">
            {state.track
              ? (state.track.title || (state.track.kind === "youtube" ? "YouTube stream" : "Audio stream"))
              : <span className="text-muted-foreground italic">Nothing on air</span>}
          </span>
        </div>

        {/* Listener mute (everyone) */}
        {state.allowListenerMute && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleListenerMute}
            title={muted ? "Unmute" : "Mute"}
            aria-label={muted ? "Unmute DJ player" : "Mute DJ player"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={togglePlay}
              disabled={!state.track || saving}
              title={state.playing ? "Pause" : "Play"}
            >
              {state.playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={stopTrack}
              disabled={!state.track || saving}
              title="Skip / stop"
              aria-label="Skip current track"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Admin URL paste bar removed — manage tracks from the Broadcaster Studio (/broadcaster). */}


      {/* Hidden media element — drives the actual playback. */}
      <DjMediaSink state={state} volume={effectiveVolume} muted={muted} />
    </div>
  );
}

/**
 * Renders the actual audio source — either a hidden YouTube iframe
 * (audio only, no controls) or an <audio> element for direct streams.
 * Re-mounts when the track/play state changes so the start position
 * stays in sync across listeners.
 */
function DjMediaSink({
  state, volume, muted,
}: { state: DjPlayerState; volume: number; muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Apply volume / mute to the <audio> element whenever it changes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, volume / 100));
    el.muted = muted;
  }, [volume, muted]);

  const youtubeSrc = useMemo(() => {
    if (!state.track || state.track.kind !== "youtube" || !state.track.videoId) return null;
    if (!state.playing) return null;
    const start = Math.floor(currentPositionSec(state));
    const params = new URLSearchParams({
      autoplay: "1",
      start: String(start),
      controls: "0",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      mute: muted ? "1" : "0",
    });
    return `https://www.youtube-nocookie.com/embed/${state.track.videoId}?${params.toString()}`;
  }, [state.track?.videoId, state.playing, state.startedAtMs, muted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.track?.kind === "audio") {
    return (
      <audio
        ref={audioRef}
        src={state.playing ? state.track.url : undefined}
        autoPlay={state.playing}
        loop={false}
        className="hidden"
      />
    );
  }

  if (youtubeSrc) {
    return (
      <iframe
        key={youtubeSrc}
        src={youtubeSrc}
        title="DJ player"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="absolute h-0 w-0 border-0 opacity-0 pointer-events-none"
        aria-hidden
      />
    );
  }
  return null;
}

// Re-export defaults for admin pages that prefer the named import.
export { DJ_DEFAULTS };
