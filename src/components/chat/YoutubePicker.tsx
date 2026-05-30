import { useState } from "react";
import { Youtube, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig, parseYoutubeId } from "@/lib/media-providers-config";

export function YoutubePicker({ onPick }: { onPick: (videoUrl: string) => void }) {
  const { raw } = useAppSettings();
  const cfg = mergeMediaConfig((raw as any).media).youtube;
  const [url, setUrl] = useState("");

  if (!cfg.enabled) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
        <AlertCircle className="mx-auto mb-1 h-5 w-5" />
        YouTube sharing is disabled. Ask an admin to enable it in Media APIs.
      </div>
    );
  }

  const id = parseYoutubeId(url);
  const previewUrl = id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;

  function submit() {
    if (!id) return;
    onPick(`https://youtu.be/${id}`);
    setUrl("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Youtube className="h-4 w-4 text-red-500" />
        Paste a YouTube link
      </div>
      <div className="flex gap-1">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-2">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="https://youtu.be/…"
            className="flex-1 bg-transparent py-1.5 text-xs outline-none"
          />
        </div>
        <button
          onClick={submit}
          disabled={!id}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          Share
        </button>
      </div>
      {previewUrl && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <img src={previewUrl} alt="YouTube preview" className="block h-32 w-full object-cover" />
        </div>
      )}
      {!id && url && (
        <div className="mt-1.5 text-[11px] text-destructive">Not a valid YouTube URL.</div>
      )}
    </div>
  );
}
