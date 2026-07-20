import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  Newspaper,
  Film,
  UserPlus,
  Trophy,
  Award,
  Swords,
  Users,
  PenLine,
  ChevronRight,
} from "lucide-react";
import { useMehfilLabel } from "@/lib/use-mehfil-label";

function useShortcuts() {
  const mehfilLabel = useMehfilLabel();
  return [
    { to: "/feed", label: "Feed", icon: Newspaper, gradient: "from-blue-500 to-indigo-500" },
    { to: "/poetry", label: mehfilLabel, icon: PenLine, gradient: "from-fuchsia-500 to-purple-500" },
    { to: "/reels", label: "Reels", icon: Film, gradient: "from-pink-500 to-rose-500" },
    { to: "/find-friends", label: "Find Friends", icon: UserPlus, gradient: "from-orange-500 to-amber-500" },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy, gradient: "from-purple-500 to-fuchsia-500" },
    { to: "/achievements", label: "Achievements", icon: Award, gradient: "from-emerald-500 to-teal-500" },
    { to: "/battle-hub", label: "Battle Hub", icon: Swords, gradient: "from-cyan-500 to-sky-500" },
    { to: "/groups", label: "Groups", icon: Users, gradient: "from-violet-500 to-purple-500" },
  ] as const;
}

export function ChatExploreMenu() {
  const [open, setOpen] = useState(false);
  const SHORTCUTS = useShortcuts();
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/5"
        title="Explore more"
      >
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
          <Compass className="h-3.5 w-3.5" />
        </span>
        Explore
        <ChevronRight className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-52 rounded-xl border border-border bg-card/95 p-1 shadow-2xl backdrop-blur-xl animate-scale-in">
          <div className="px-1.5 pb-0.5 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Explore More
          </div>
          <div className="flex flex-col gap-0">
            {SHORTCUTS.map(({ to, label, icon: Icon, gradient }) => (
              <a
                key={to}
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/5"
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br ${gradient} text-white shadow-sm ring-1 ring-white/10`}>
                  <Icon className="h-3 w-3" />
                </span>
                <span className="truncate text-[11px] font-semibold text-foreground">{label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
