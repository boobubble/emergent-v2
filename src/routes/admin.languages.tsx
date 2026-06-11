import { createFileRoute } from "@tanstack/react-router";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { LANGUAGES } from "@/i18n/languages";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface I18nSettings {
  enabled: boolean;
  auto_detect: boolean;
  default_language: string;
  supported_languages: string[];
  ai_translation_enabled: boolean;
}

const DEFAULTS: I18nSettings = {
  enabled: true,
  auto_detect: true,
  default_language: "en",
  supported_languages: LANGUAGES.map(l => l.code),
  ai_translation_enabled: false,
};

function AdminLanguagesPage() {
  const { values, set, patch, save, saving } = useAdminSetting<I18nSettings>("i18n", DEFAULTS);

  const toggleLang = (code: string) => {
    const has = values.supported_languages.includes(code);
    patch({
      supported_languages: has
        ? values.supported_languages.filter(c => c !== code)
        : [...values.supported_languages, code],
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Languages & i18n"
        description="Configure multilingual support for the entire application."
      />

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Toggle label="Enable multilingual support" checked={values.enabled} onChange={(b) => set("enabled", b)} />
        <Toggle label="Auto-detect browser language on first visit" checked={values.auto_detect} onChange={(b) => set("auto_detect", b)} />
        <Toggle label="Enable AI translation for user content (coming soon)" checked={values.ai_translation_enabled} onChange={(b) => set("ai_translation_enabled", b)} />

        <label className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm">
          <span>Default language</span>
          <select
            value={values.default_language}
            onChange={(e) => set("default_language", e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.nativeName} ({l.name})</option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Supported languages</h3>
        <p className="text-xs text-muted-foreground">Users can pick from any language enabled here. Disabled languages are hidden from the switcher.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map(l => {
            const on = values.supported_languages.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => toggleLang(l.code)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${on ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.nativeName}</span>
                  <span className="text-xs text-muted-foreground">({l.code})</span>
                </span>
                <span className={`h-2 w-2 rounded-full ${on ? "bg-primary" : "bg-muted"}`} />
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export const Route = createFileRoute("/admin/languages")({
  component: AdminLanguagesPage,
});
