import { useRouterState } from "@tanstack/react-router";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function GlobalLanguageToggle() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  if (pathname === "/") return null;
  return (
    <div className="fixed right-4 z-[60] bottom-[calc(9rem+env(safe-area-inset-bottom))] md:bottom-16">
      <LanguageSwitcher variant="compact" />
    </div>
  );
}
