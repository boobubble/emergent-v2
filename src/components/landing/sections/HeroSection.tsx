import { ArrowRight, Hash, LogIn, Mic, Send, Sparkles, UserPlus } from "lucide-react";
import type { AuthPopup } from "@/components/auth/AuthScreen";
import type { HeroConfig } from "@/lib/hero-page-config";
import { SectionShell } from "../ui/SectionShell";

function ChatroomPreview() {
  const messages = [
    { name: "Alex", color: "from-violet-500 to-fuchsia-500", text: "Great vibe in here tonight", time: "3:01 PM" },
    { name: "Emma", color: "from-indigo-500 to-cyan-500", text: "Who's up for trivia later?", time: "3:02 PM" },
    { name: "Sam", color: "from-emerald-400 to-teal-500", text: "Just joined — hello everyone", time: "3:03 PM" },
  ];

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-violet-500/25 bg-[#0b0b1a]/95 shadow-[0_24px_64px_-16px_rgba(124,58,237,0.4)] ring-1 ring-violet-400/15 backdrop-blur-xl sm:rounded-3xl">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 text-[10px] text-white/55 sm:px-4 sm:py-3 sm:text-xs">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <Sparkles className="h-3 w-3 shrink-0 text-violet-300 sm:h-3.5 sm:w-3.5" />
          Preview · Chatrooms
        </span>
        <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-medium text-violet-200 sm:text-[10px]">
          Demo UI
        </span>
      </div>
      <div className="text-white">
        <div className="border-b border-white/5 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Hash className="h-3.5 w-3.5 shrink-0 opacity-60" />
            Chill Lounge
          </div>
          <div className="text-[10px] text-cyan-300/90">Sample conversation</div>
        </div>
        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          {messages.map((m, i) => (
            <div key={i} className="flex min-w-0 items-start gap-2">
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${m.color} text-[10px] font-bold`}
              >
                {m.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] sm:text-[11px]">
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-white/40">{m.time}</span>
                </div>
                <div className="mt-0.5 inline-block max-w-full break-words rounded-2xl rounded-tl-sm bg-white/[0.06] px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs">
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 p-2.5 sm:p-3">
          <div className="flex min-h-[44px] items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-[11px] text-white/50 sm:text-xs">
            <span className="min-w-0 flex-1 truncate">Type a message…</span>
            <Mic className="h-4 w-4 shrink-0" aria-hidden />
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
              <Send className="h-3.5 w-3.5 text-white" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({
  cfg,
  setPopup,
}: {
  cfg: HeroConfig;
  setPopup: (p: AuthPopup) => void;
}) {
  return (
    <SectionShell id="top" className="!px-4 !py-10 sm:!px-5 sm:!py-14 md:!py-16">
      <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1 text-[11px] font-medium backdrop-blur-xl [data-hero-theme=light]:border-violet-300/40 [data-hero-theme=light]:bg-violet-500/10 sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" />
            <span className="truncate">Welcome to {cfg.brandName}</span>
          </div>

          <h1 className="mt-4 text-[clamp(1.75rem,6.5vw,4.25rem)] font-black leading-[1.08] tracking-tight [data-hero-theme=light]:text-slate-900 sm:mt-5">
            {cfg.headline}
          </h1>

          <p className="mt-4 max-w-xl text-[clamp(0.9375rem,2.8vw,1.125rem)] leading-relaxed opacity-80 [data-hero-theme=light]:text-slate-700 sm:mt-5">
            {cfg.subheadline}{" "}
            <span className="opacity-70">Your community adda — chat, share, and show up.</span>
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setPopup("signup")}
              className="group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.55)] transition-transform hover:scale-[1.02] sm:w-auto sm:px-7"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              {cfg.ctaJoinLabel}
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => setPopup("signin")}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.05] px-6 py-3 text-sm font-semibold backdrop-blur-xl transition hover:bg-violet-500/10 [data-hero-theme=light]:border-violet-300/50 [data-hero-theme=light]:bg-white/70 [data-hero-theme=light]:text-slate-800 sm:w-auto sm:px-7"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              {cfg.ctaLoginLabel}
            </button>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-violet-500/20 via-indigo-500/10 to-cyan-500/15 blur-2xl sm:-inset-8 sm:rounded-[40px] sm:blur-3xl" />
          <div className="relative min-w-0" style={{ animation: "hero-float 8s ease-in-out infinite" }}>
            <ChatroomPreview />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
