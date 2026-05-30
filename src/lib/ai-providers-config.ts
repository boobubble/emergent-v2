// AI Provider Management — registry, types, defaults.
// Architecture-only. No live calls yet. Future services read from this config
// to route AI requests to the selected provider/model per feature.

export type AIProviderKey =
  | "openai"
  | "gemini"
  | "anthropic"
  | "openrouter"
  | "deepseek"
  | "custom";

export interface AIProviderMeta {
  key: AIProviderKey;
  label: string;
  description: string;
  /** Default base URL for OpenAI-compatible REST. `custom` lets admins override. */
  defaultBaseUrl: string;
  /** Common model identifiers used to seed the model dropdown. */
  suggestedModels: string[];
  /** Whether this provider uses an OpenAI-compatible chat/completions schema. */
  openAICompatible: boolean;
  docsUrl?: string;
}

export const AI_PROVIDERS: AIProviderMeta[] = [
  {
    key: "openai",
    label: "OpenAI",
    description: "GPT-5, GPT-4o and embeddings via api.openai.com.",
    defaultBaseUrl: "https://api.openai.com/v1",
    suggestedModels: ["gpt-5", "gpt-5-mini", "gpt-4o", "gpt-4o-mini"],
    openAICompatible: true,
    docsUrl: "https://platform.openai.com/docs",
  },
  {
    key: "gemini",
    label: "Google Gemini",
    description: "Gemini 2.5 / 3.x family via Google AI Studio.",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    suggestedModels: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-3-flash-preview"],
    openAICompatible: false,
    docsUrl: "https://ai.google.dev/",
  },
  {
    key: "anthropic",
    label: "Anthropic",
    description: "Claude 3.5 / 4 family via api.anthropic.com.",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    suggestedModels: ["claude-sonnet-4", "claude-3-5-sonnet", "claude-3-5-haiku"],
    openAICompatible: false,
    docsUrl: "https://docs.anthropic.com/",
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    description: "Unified gateway for 200+ models. OpenAI-compatible API.",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    suggestedModels: [
      "openai/gpt-5",
      "anthropic/claude-sonnet-4",
      "google/gemini-2.5-pro",
      "meta-llama/llama-3.3-70b-instruct",
    ],
    openAICompatible: true,
    docsUrl: "https://openrouter.ai/docs",
  },
  {
    key: "deepseek",
    label: "DeepSeek",
    description: "DeepSeek Chat & Reasoner. OpenAI-compatible API.",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    suggestedModels: ["deepseek-chat", "deepseek-reasoner"],
    openAICompatible: true,
    docsUrl: "https://api-docs.deepseek.com/",
  },
  {
    key: "custom",
    label: "Custom (OpenAI-compatible)",
    description: "Any self-hosted or third-party endpoint that mirrors the OpenAI schema.",
    defaultBaseUrl: "",
    suggestedModels: [],
    openAICompatible: true,
  },
];

export interface AIProviderConfig {
  enabled: boolean;
  /** Stored at rest in app_settings. Future migration will move to Vault. */
  apiKey: string;
  baseUrl: string;
  /** Optional org/project header for OpenAI-style providers. */
  organization?: string;
  /** Default model used when no model is set per-feature. */
  defaultModel: string;
}

export type AIFeatureKey =
  | "chatbot"
  | "moderation"
  | "contentSuggestions"
  | "feedAssistant"
  | "seoTools";

export interface AIFeatureConfig {
  enabled: boolean;
  /** Override the global default provider for this feature. */
  provider?: AIProviderKey;
  /** Override the provider's default model for this feature. */
  model?: string;
  /** Optional system prompt template id (resolved at runtime). */
  promptTemplate?: string;
}

export interface AILimitsConfig {
  /** Per-user, per-day request cap across all AI features. 0 = unlimited. */
  perUserDailyRequests: number;
  /** Per-user, per-minute cap (anti-abuse). 0 = unlimited. */
  perUserPerMinuteRequests: number;
  /** Global daily spend ceiling in USD (informational; enforced by service layer). */
  globalDailySpendUsd: number;
  /** Max tokens per single response. */
  maxOutputTokens: number;
  /** Block AI for users below this level. */
  minLevelToUseAI: number;
}

export interface AIConfig {
  /** Master switch. When false, every AI feature is off. */
  enabled: boolean;
  /** The provider used by default when a feature does not override it. */
  defaultProvider: AIProviderKey;
  /** The model used by default when a feature does not override it. */
  defaultModel: string;
  providers: Record<AIProviderKey, AIProviderConfig>;
  features: Record<AIFeatureKey, AIFeatureConfig>;
  limits: AILimitsConfig;
}

const emptyProvider = (baseUrl: string, defaultModel = ""): AIProviderConfig => ({
  enabled: false,
  apiKey: "",
  baseUrl,
  defaultModel,
});

export const AI_DEFAULTS: AIConfig = {
  enabled: false,
  defaultProvider: "openai",
  defaultModel: "gpt-5-mini",
  providers: {
    openai:     emptyProvider("https://api.openai.com/v1", "gpt-5-mini"),
    gemini:     emptyProvider("https://generativelanguage.googleapis.com/v1beta", "gemini-2.5-flash"),
    anthropic:  emptyProvider("https://api.anthropic.com/v1", "claude-3-5-haiku"),
    openrouter: emptyProvider("https://openrouter.ai/api/v1", "openai/gpt-5-mini"),
    deepseek:   emptyProvider("https://api.deepseek.com/v1", "deepseek-chat"),
    custom:     emptyProvider("", ""),
  },
  features: {
    chatbot:            { enabled: false },
    moderation:         { enabled: false },
    contentSuggestions: { enabled: false },
    feedAssistant:      { enabled: false },
    seoTools:           { enabled: false },
  },
  limits: {
    perUserDailyRequests: 50,
    perUserPerMinuteRequests: 5,
    globalDailySpendUsd: 10,
    maxOutputTokens: 1024,
    minLevelToUseAI: 1,
  },
};

export const AI_FEATURES: { key: AIFeatureKey; label: string; description: string }[] = [
  { key: "chatbot",            label: "AI Chatbots",          description: "In-room and DM AI assistants users can talk to." },
  { key: "moderation",         label: "AI Moderation",        description: "Auto-classify messages and posts for abuse, NSFW, spam." },
  { key: "contentSuggestions", label: "Content Suggestions",  description: "Suggest post drafts, replies, room names, profile bios." },
  { key: "feedAssistant",      label: "Feed Assistant",       description: "Summarize threads, recommend posts, surface highlights." },
  { key: "seoTools",           label: "SEO Tools",            description: "Auto-generate meta titles, descriptions, hashtags." },
];

/** Resolve effective provider+model for a feature, falling back to global defaults. */
export function resolveFeatureRouting(cfg: AIConfig, feature: AIFeatureKey): {
  provider: AIProviderKey;
  model: string;
} {
  const f = cfg.features[feature];
  const provider = f.provider ?? cfg.defaultProvider;
  const model = f.model ?? cfg.providers[provider]?.defaultModel ?? cfg.defaultModel;
  return { provider, model };
}
