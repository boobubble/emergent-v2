import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/lib/use-theme-mode";

export function GlobalThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const isDark = mode === "dark";
  const toggle = () => setMode(isDark ? "light" : "dark");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-20 right-4 z-[60] grid h-11 w-11 place-items-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-accent md:bottom-4"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
