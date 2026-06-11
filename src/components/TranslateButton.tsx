import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  text: string;
  enabled?: boolean;
  onTranslated?: (translated: string) => void;
  className?: string;
}

/**
 * Inline button shown next to user-generated content (messages/posts/comments).
 * Disabled until admin enables AI translation; wiring stub only.
 */
export function TranslateButton({ enabled = false, className = "" }: Props) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled={!enabled}
      title={enabled ? t("common.translate", "Translate") : t("common.translateSoon", "AI translation coming soon")}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Languages className="h-3 w-3" />
      {t("common.translate", "Translate")}
    </button>
  );
}
