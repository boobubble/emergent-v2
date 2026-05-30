// Feature-flag helpers for AI features. Reads merged config from app_settings.
import { useAppSettings } from "@/lib/app-settings";
import {
  AI_DEFAULTS,
  type AIConfig,
  type AIFeatureKey,
  resolveFeatureRouting,
} from "@/lib/ai-providers-config";

export function mergeAIConfig(raw: unknown): AIConfig {
  const persisted = (raw ?? {}) as Partial<AIConfig>;
  return {
    ...AI_DEFAULTS,
    ...persisted,
    providers: { ...AI_DEFAULTS.providers, ...(persisted.providers ?? {}) },
    features:  { ...AI_DEFAULTS.features,  ...(persisted.features  ?? {}) },
    limits:    { ...AI_DEFAULTS.limits,    ...(persisted.limits    ?? {}) },
  };
}

/** Hook: returns whether an AI feature is currently usable. */
export function useAIFeature(feature: AIFeatureKey) {
  const { raw } = useAppSettings();
  const cfg = mergeAIConfig((raw as any).ai);
  const f = cfg.features[feature];
  const routing = resolveFeatureRouting(cfg, feature);
  const provider = cfg.providers[routing.provider];
  const allowed =
    cfg.enabled &&
    f.enabled &&
    !!provider?.enabled &&
    !!provider?.apiKey;

  return {
    allowed,
    provider: routing.provider,
    model: routing.model,
    reason: !cfg.enabled
      ? "AI globally disabled"
      : !f.enabled
      ? "Feature disabled"
      : !provider?.enabled
      ? "Provider disabled"
      : !provider?.apiKey
      ? "Missing API key"
      : "ok",
  };
}

/** Non-hook accessor for service-layer code. */
export function getAIConfig(raw: unknown): AIConfig {
  return mergeAIConfig(raw);
}
