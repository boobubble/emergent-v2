import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Newspaper,
  Film,
  UserPlus,
  Trophy,
  Award,
  Gamepad2,
  Users,
} from "lucide-react";

interface Shortcut {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const SHORTCUTS: Shortcut[] = [
  { to: "/feed", label: "Feed", icon: Newspaper, gradient: "from-blue-500 to-indigo-500" },
  { to: "/reels", label: "Reels", icon: Film, gradient: "from-pink-500 to-rose-500" },
  { to: "/find-friends", label: "Find Friends", icon: UserPlus, gradient: "from-orange-500 to-amber-500" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, gradient: "from-purple-500 to-fuchsia-500" },
  { to: "/achievements", label: "Achievements", icon: Award, gradient: "from-emerald-500 to-teal-500" },
  { to: "/games", label: "Games", icon: Gamepad2, gradient: "from-cyan-500 to-sky-500" },
  { to: "/groups", label: "Groups", icon: Users, gradient: "from-violet-500 to-purple-500" },
];

export function ChatQuickShortcuts() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {open && (
        <button
          type="button"
          aria-label="Close shortcuts"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        />
      )}

      {open && (
        <div
          className="fixed z-50 left-4 bottom-28 w-60 rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl animate-scale-in"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >

          <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Quick Shortcuts
          </div>
          <div className="flex flex-col gap-1.5">
            {SHORTCUTS.map(({ to, label, icon: Icon, gradient }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/5 active:scale-[0.98]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md ring-1 ring-white/10`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close shortcuts" : "Open quick shortcuts"}
        aria-expanded={open}
        className="fixed left-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl ring-2 ring-primary/30 transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
          boxShadow: "var(--shadow-glow, 0 10px 30px -8px hsl(var(--primary) / 0.6))",
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

    </div>
  );
}
