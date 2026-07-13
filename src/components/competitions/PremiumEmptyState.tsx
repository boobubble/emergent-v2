import { Calendar, Trophy, Users, Vote } from "lucide-react";

type Kind = "upcoming" | "closed" | "no-nominees" | "no-votes";

const CONFIG: Record<Kind, { icon: any; title: string; subtitle: string; gradient: string }> = {
  upcoming: {
    icon: Calendar,
    title: "The stage is being set",
    subtitle: "Voting opens soon. Follow this competition to be notified.",
    gradient: "from-sky-500/20 via-violet-500/10 to-transparent",
  },
  closed: {
    icon: Trophy,
    title: "Voting has closed",
    subtitle: "Thanks to everyone who cast a vote. Results are final.",
    gradient: "from-amber-500/20 via-rose-500/10 to-transparent",
  },
  "no-nominees": {
    icon: Users,
    title: "No nominees yet",
    subtitle: "Contestants haven't been added. Check back shortly.",
    gradient: "from-fuchsia-500/20 via-violet-500/10 to-transparent",
  },
  "no-votes": {
    icon: Vote,
    title: "Be the first to vote",
    subtitle: "The battle hasn't started scoring yet — cast the opening vote.",
    gradient: "from-rose-500/20 via-fuchsia-500/10 to-transparent",
  },
};

export function PremiumEmptyState({ kind, action }: { kind: Kind; action?: React.ReactNode }) {
  const cfg = CONFIG[kind];
  const Icon = cfg.icon;
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${cfg.gradient} px-6 py-10 text-center backdrop-blur-xl sm:py-14`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.15),transparent_60%)]" />
      <div className="relative">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 sm:h-16 sm:w-16">
          <Icon className="h-6 w-6 text-white/80 sm:h-7 sm:w-7" />
        </div>
        <h3 className="text-base font-black text-white sm:text-lg">{cfg.title}</h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-white/60 sm:text-sm">{cfg.subtitle}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
