import { Moon, Sun } from "lucide-react";
import type { AuthPopup } from "@/components/auth/AuthScreen";
import type { HeroConfig } from "@/lib/hero-page-config";

const NAV_LINKS = [
  { href: "/heropage", label: "Home" },
  { href: "/", label: "Chatrooms" },
  { href: "/feed", label: "Feed" },
  { href: "/confessions", label: "Confessions" },
  { href: "/battle-hub", label: "Battle Hub" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const;

function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur-xl hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function LandingHeader({
  cfg,
  dark,
  setDark,
  setPopup,
  scrolled,
  goOrPopup,
}: {
  cfg: HeroConfig;
  dark: boolean;
  setDark: (v: boolean) => void;
  setPopup: (p: AuthPopup) => void;
  scrolled: boolean;
  goOrPopup: (to: string) => (e: React.MouseEvent) => void;
}) {
  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        scrolled ? "border-b border-white/10 bg-black/40 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg shadow-lg">
            ✨
          </div>
          <span className="text-lg font-bold tracking-tight">{cfg.brandName}</span>
        </div>
        <nav className="hidden items-center gap-5 text-sm opacity-80 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={goOrPopup(link.href)} className="hover:opacity-100">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} setDark={setDark} />
          <button
            type="button"
            onClick={() => setPopup("signin")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-xl hover:bg-white/10"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setPopup("signup")}
            className="hidden rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg sm:inline-block"
          >
            Join Now
          </button>
        </div>
      </div>
    </header>
  );
}
