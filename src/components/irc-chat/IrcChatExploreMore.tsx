import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  PenLine,
  Trophy,
  Swords,
  MessageSquareHeart,
  Users,
  Crown,
  Award,
} from "lucide-react";
import { useMehfilLabel } from "@/lib/use-mehfil-label";
import { useAppSettings } from "@/lib/app-settings";
import { cn } from "@/lib/utils";

type ExploreTile = {
  to: string;
  title: string;
  subtitle: string;
  icon: typeof PenLine;
  enabled: boolean;
  badge?: string;
};

export function IrcChatExploreMore({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mehfilLabel = useMehfilLabel();
  const { raw } = useAppSettings();
  const modules = (raw as { modules?: { communities?: boolean } }).modules;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tiles: ExploreTile[] = [
    {
      to: "/poetry",
      title: mehfilLabel,
      subtitle: "Poetry & Shayari",
      icon: PenLine,
      enabled: true,
    },
    {
      to: "/competitions",
      title: "Competitions",
      subtitle: "Live battles",
      icon: Trophy,
      enabled: true,
    },
    {
      to: "/battle-hub",
      title: "Battle Hub",
      subtitle: "Arena dashboard",
      icon: Swords,
      enabled: true,
    },
    {
      to: "/confessions",
      title: "Confessions",
      subtitle: "Anonymous",
      icon: MessageSquareHeart,
      enabled: true,
    },
    {
      to: "/communities",
      title: "Communities",
      subtitle: "Discover",
      icon: Users,
      enabled: Boolean(modules?.communities),
    },
    {
      to: "/leaderboard",
      title: "Leaderboard",
      subtitle: "Rankings",
      icon: Crown,
      enabled: true,
    },
    {
      to: "/hall-of-fame",
      title: "Hall of Fame",
      subtitle: "Legends",
      icon: Award,
      enabled: true,
    },
  ].filter((t) => t.enabled);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="irc-explore-more-btn flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/12 via-primary/8 to-transparent px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:from-primary/18"
      >
        <Compass className="h-4 w-4 text-primary" aria-hidden />
        Explore More
      </button>

      {open ? (
        <div
          className="irc-explore-more-panel absolute bottom-full left-0 z-50 mb-2 w-[min(100%,17.5rem)] rounded-xl border border-border/80 bg-card/98 p-2 shadow-xl backdrop-blur-md"
          role="dialog"
          aria-label="Explore Yaarzo"
        >
          <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Explore Yaarzo
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {tiles.map(({ to, title, subtitle, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex min-h-[3.25rem] flex-col justify-center rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{title}</span>
                </span>
                <span className="truncate pl-5 text-[9px] text-muted-foreground">{subtitle}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
