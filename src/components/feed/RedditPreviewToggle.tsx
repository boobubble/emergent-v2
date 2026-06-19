import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMyRoles } from "@/lib/use-my-role";
import { getFeedThemePreview, setFeedThemePreview } from "@/lib/feed-themes";
import { toast } from "sonner";

/**
 * Admin-only floating toggle that flips an in-browser Reddit theme preview.
 * The preview override lives in localStorage and is read by useActiveFeedTheme
 * so toggling instantly re-skins the feed without persisting any choice to
 * the backend. Toggle OFF reverts to the saved theme.
 */
export function RedditPreviewToggle() {
  const { isAdmin, loaded } = useMyRoles();
  const [on, setOn] = useState<boolean>(() => getFeedThemePreview() === "reddit");

  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<string | null>).detail ?? null;
      setOn(next === "reddit");
    };
    window.addEventListener("palrgo:feed-theme-preview-changed", onChange as EventListener);
    return () => window.removeEventListener("palrgo:feed-theme-preview-changed", onChange as EventListener);
  }, []);

  if (!loaded || !isAdmin) return null;

  const toggle = () => {
    if (on) {
      setFeedThemePreview(null);
      toast.success("Reverted to saved theme");
    } else {
      setFeedThemePreview("reddit");
      toast.success("Reddit preview active — not saved");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={on ? "Reddit Preview Mode is ON — click to revert" : "Preview the Reddit theme without saving"}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition " +
        (on
          ? "border-[#ff4500] bg-[#ff4500] text-white shadow-[0_2px_8px_-2px_rgba(255,69,0,0.5)] hover:bg-[#e03e00]"
          : "border-border bg-card text-foreground hover:bg-accent/40")
      }
      aria-pressed={on}
    >
      {on ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">Reddit Preview</span>
      <span
        className={
          "ml-1 inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wide " +
          (on ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")
        }
      >
        {on ? "On" : "Off"}
      </span>
    </button>
  );
}
