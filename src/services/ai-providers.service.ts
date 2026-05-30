// AI Provider service architecture — interface + stubs.
// Future implementation routes through the resolved provider/model from
// `ai-providers-config`. Today: throws NotImplementedError. Feature flags
// (useAIFeature) gate UI; this layer is the integration seam.

import { notImplemented } from "@/services/_shared";
import type { AIFeatureKey } from "@/lib/ai-providers-config";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompleteOptions {
  feature: AIFeatureKey;
  messages: AIMessage[];
  /** Override model resolved from feature routing. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Identifier used for per-user rate limiting. */
  userId?: string;
}

export interface AICompleteResult {
  text: string;
  provider: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface AIModerationResult {
  flagged: boolean;
  categories: Record<string, number>;
  reason?: string;
}

export interface AIProviderService {
  /** Streamless chat completion. */
  complete(opts: AICompleteOptions): Promise<AICompleteResult>;
  /** Streaming chat completion. */
  stream(opts: AICompleteOptions, onDelta: (chunk: string) => void): Promise<AICompleteResult>;
  /** Moderation classification. */
  moderate(text: string, userId?: string): Promise<AIModerationResult>;
  /** Generate embeddings for semantic search / suggestions. */
  embed(text: string, model?: string): Promise<number[]>;
  /** Estimate token count for budgeting. */
  estimateTokens(text: string): number;
}

const M = "ai-providers";

export const aiProviders: AIProviderService = {
  complete:        () => notImplemented(M, "complete"),
  stream:          () => notImplemented(M, "stream"),
  moderate:        () => notImplemented(M, "moderate"),
  embed:           () => notImplemented(M, "embed"),
  estimateTokens:  (text: string) => Math.ceil(text.length / 4),
};
