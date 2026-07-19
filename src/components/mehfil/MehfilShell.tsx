import { Link } from "@tanstack/react-router";
import { PenLine, Trophy, Swords, Home, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useMehfilLabel } from "@/lib/use-mehfil-label";

export function MehfilShell({ children, showBack = false }: { children: ReactNode; showBack?: boolean }) {
  const label = useMehfilLabel();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Link to="/mehfil" className="rounded-md p-1.5 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
            ) : (
              <Link to="/feed" className="rounded-md p-1.5 hover:bg-muted" aria-label="Home"><Home className="h-4 w-4" /></Link>
            )}
            <Link to="/mehfil" className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <span className="font-serif text-xl font-bold tracking-tight">
                Mehfil
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-widest text-muted-foreground sm:inline">
                Poetry Community
              </span>
            </Link>
          </div>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link to="/mehfil" activeOptions={{ exact: true }} activeProps={{ className: "bg-primary/10 text-primary" }} className="rounded-md px-3 py-1.5 hover:bg-muted">Discover</Link>
            <Link to="/mehfil/challenges" activeProps={{ className: "bg-primary/10 text-primary" }} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-muted">
              <Swords className="h-3.5 w-3.5" /> Battles
            </Link>
            <Link to="/mehfil/leaderboard" activeProps={{ className: "bg-primary/10 text-primary" }} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-muted">
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </Link>
            <Link to="/mehfil/hall-of-fame" activeProps={{ className: "bg-primary/10 text-primary" }} className="rounded-md px-3 py-1.5 hover:bg-muted">Hall of Fame</Link>
          </nav>
          <Link
            to="/mehfil/compose"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" /> Write
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
