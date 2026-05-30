import { notImplemented } from "./_shared";

export type AiJobKind = "moderate" | "summarize" | "image" | "chat";
export interface AiJobInput { kind: AiJobKind; payload: Record<string, unknown> }
export interface AiFeaturesService {
  run(input: AiJobInput): Promise<{ jobId: string }>;
  result(jobId: string): Promise<unknown>;
}

export const aiFeaturesService: AiFeaturesService = {
  run: () => notImplemented("ai_features", "run"),
  result: () => notImplemented("ai_features", "result"),
};
