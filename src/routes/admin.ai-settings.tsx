import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Sparkles, Eye, EyeOff, ExternalLink, KeyRound } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import {
  AI_PROVIDERS,
  AI_FEATURES,
  AI_DEFAULTS,
  type AIConfig,
  type AIProviderKey,
  type AIFeatureKey,
} from "@/lib/ai-providers-config";
import { mergeAIConfig } from "@/lib/ai-providers-flags";

export const Route = createFileRoute("/admin/ai-settings")({ component: AISettingsPage });

function AISettingsPage() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);

  const [draft, setDraft] = useState<AIConfig>(() => mergeAIConfig((raw as any).ai));
  const [revealed, setRevealed] = useState<Record<AIProviderKey, boolean>>({
    openai: false, gemini: false, anthropic: false, openrouter: false, deepseek: false, custom: false,
  });

  useEffect(() => {
    setDraft(mergeAIConfig((raw as any).ai));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((raw as any).ai ?? {})]);

  const mut = useMutation({
    mutationFn: (next: AIConfig) => saveSetting({ data: { key: "ai", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const update = (patch: (d: AIConfig) => void) => {
    const next = structuredClone(draft);
    patch(next);
    setDraft(next);
  };

  const defaultProviderCfg = draft.providers[draft.defaultProvider];
  const modelChoices = AI_PROVIDERS.find((p) => p.key === draft.defaultProvider)?.suggestedModels ?? [];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="AI Providers & Features"
        description="Configure AI providers, default routing, per-feature toggles and usage limits."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Saved to <code className="rounded bg-background px-1 py-0.5">app_settings.ai</code>.
        Keys are stored at rest in backend settings — future migration will move them to encrypted vault.
        No keys are ever exposed to the client bundle.
      </div>

      {/* Global */}
      <Section title="Global">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="text-sm font-medium">Enable AI features</Label>
            <div className="text-xs text-muted-foreground">Master switch. Disables every feature and provider call.</div>
          </div>
          <AdminToggle checked={draft.enabled} onCheckedChange={(v) => update((d) => { d.enabled = v; })} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Default provider</Label>
            <Select
              value={draft.defaultProvider}
              onValueChange={(v) => update((d) => { d.defaultProvider = v as AIProviderKey; })}
            >
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((p) => (
                  <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Default model</Label>
            {modelChoices.length > 0 ? (
              <Select
                value={draft.defaultModel}
                onValueChange={(v) => update((d) => { d.defaultModel = v; })}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  {modelChoices.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))}
                  {draft.defaultModel && !modelChoices.includes(draft.defaultModel) && (
                    <SelectItem value={draft.defaultModel} className="text-xs">{draft.defaultModel}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                className="h-9 text-xs"
                value={draft.defaultModel}
                onChange={(e) => update((d) => { d.defaultModel = e.target.value; })}
                placeholder="model-id"
              />
            )}
          </div>
        </div>

        {!defaultProviderCfg?.enabled || !defaultProviderCfg?.apiKey ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
            Default provider <b>{draft.defaultProvider}</b> is {!defaultProviderCfg?.enabled ? "disabled" : "missing an API key"}.
            Enable it and add a key below before turning on features.
          </div>
        ) : null}
      </Section>

      {/* Providers */}
      <div className="space-y-2">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Providers</div>
        <div className="space-y-2">
          {AI_PROVIDERS.map((p) => {
            const cfg = draft.providers[p.key];
            return (
              <Card key={p.key}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-md ${cfg.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{p.label}</span>
                        {p.openAICompatible && <Badge variant="outline" className="text-[10px]">OpenAI-compatible</Badge>}
                        {p.docsUrl && (
                          <a href={p.docsUrl} target="_blank" rel="noreferrer"
                             className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                            Docs <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </div>
                    <AdminToggle
                      checked={cfg.enabled}
                      onCheckedChange={(v) => update((d) => { d.providers[p.key].enabled = v; })}
                    />
                  </div>

                  <div className={cfg.enabled ? "" : "opacity-60 pointer-events-none"}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs flex items-center gap-1"><KeyRound className="h-3 w-3" /> API key</Label>
                        <div className="flex gap-1">
                          <Input
                            type={revealed[p.key] ? "text" : "password"}
                            className="h-9 text-xs font-mono"
                            value={cfg.apiKey}
                            onChange={(e) => update((d) => { d.providers[p.key].apiKey = e.target.value; })}
                            placeholder={`Paste ${p.label} API key`}
                            autoComplete="off"
                          />
                          <Button
                            type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                            onClick={() => setRevealed((r) => ({ ...r, [p.key]: !r[p.key] }))}
                          >
                            {revealed[p.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Base URL</Label>
                        <Input
                          className="h-9 text-xs font-mono"
                          value={cfg.baseUrl}
                          onChange={(e) => update((d) => { d.providers[p.key].baseUrl = e.target.value; })}
                          placeholder={p.defaultBaseUrl || "https://..."}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Default model</Label>
                        <Input
                          className="h-9 text-xs font-mono"
                          value={cfg.defaultModel}
                          onChange={(e) => update((d) => { d.providers[p.key].defaultModel = e.target.value; })}
                          placeholder={p.suggestedModels[0] || "model-id"}
                          list={`models-${p.key}`}
                        />
                        <datalist id={`models-${p.key}`}>
                          {p.suggestedModels.map((m) => <option key={m} value={m} />)}
                        </datalist>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI Features</div>
        <Card>
          <CardContent className="divide-y p-0">
            {AI_FEATURES.map((f) => {
              const fc = draft.features[f.key];
              return (
                <div key={f.key} className="space-y-2 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{f.description}</div>
                    </div>
                    <AdminToggle
                      checked={fc.enabled}
                      onCheckedChange={(v) => update((d) => { d.features[f.key].enabled = v; })}
                    />
                  </div>
                  {fc.enabled && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Provider override</Label>
                        <Select
                          value={fc.provider ?? "__default__"}
                          onValueChange={(v) => update((d) => {
                            d.features[f.key as AIFeatureKey].provider = v === "__default__" ? undefined : (v as AIProviderKey);
                          })}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__default__" className="text-xs">Use default ({draft.defaultProvider})</SelectItem>
                            {AI_PROVIDERS.map((p) => (
                              <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Model override</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={fc.model ?? ""}
                          onChange={(e) => update((d) => {
                            const v = e.target.value.trim();
                            d.features[f.key as AIFeatureKey].model = v ? v : undefined;
                          })}
                          placeholder="leave blank for provider default"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Limits */}
      <Section title="Limits & quotas">
        <NumberRow
          label="Per-user daily requests"
          hint="0 = unlimited. Applies across all AI features."
          value={draft.limits.perUserDailyRequests}
          onChange={(v) => update((d) => { d.limits.perUserDailyRequests = v; })}
        />
        <NumberRow
          label="Per-user per-minute requests"
          hint="Anti-abuse burst cap. 0 = unlimited."
          value={draft.limits.perUserPerMinuteRequests}
          onChange={(v) => update((d) => { d.limits.perUserPerMinuteRequests = v; })}
        />
        <NumberRow
          label="Global daily spend ceiling (USD)"
          hint="Informational — enforced by service layer once implemented."
          value={draft.limits.globalDailySpendUsd}
          onChange={(v) => update((d) => { d.limits.globalDailySpendUsd = v; })}
        />
        <NumberRow
          label="Max output tokens"
          value={draft.limits.maxOutputTokens}
          onChange={(v) => update((d) => { d.limits.maxOutputTokens = v; })}
        />
        <NumberRow
          label="Minimum user level to use AI"
          value={draft.limits.minLevelToUseAI}
          onChange={(v) => update((d) => { d.limits.minLevelToUseAI = v; })}
        />
      </Section>

      <div className="sticky bottom-3 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setDraft(AI_DEFAULTS)} disabled={mut.isPending}>
          Reset to defaults
        </Button>
        <Button onClick={() => mut.mutate(draft)} disabled={mut.isPending} className="gap-2">
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, disabled, children }: { title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <Card>
        <CardContent className="space-y-3 p-4">{children}</CardContent>
      </Card>
    </div>
  );
}

function NumberRow({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid items-start gap-2 sm:grid-cols-[1fr_8rem]">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 text-xs"
      />
    </div>
  );
}
