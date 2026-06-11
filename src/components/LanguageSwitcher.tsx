import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, getLanguage } from "@/i18n/languages";
import { setLanguage } from "@/i18n/LanguageProvider";

interface Props {
  variant?: "icon" | "compact" | "full";
  className?: string;
}

export function LanguageSwitcher({ variant = "icon", className = "" }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = getLanguage(i18n.language || "en");

  const change = async (code: string) => {
    await setLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Change language"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm hover:bg-accent"
      >
        {variant === "icon" ? (
          <Globe className="h-4 w-4" />
        ) : (
          <>
            <span className="text-base leading-none">{current.flag}</span>
            {variant === "full" && <span className="text-sm font-medium">{current.nativeName}</span>}
          </>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-xl">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => change(l.code)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{l.flag}</span>
                  <span>{l.nativeName}</span>
                  <span className="text-xs text-muted-foreground">({l.name})</span>
                </span>
                {current.code === l.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
