export type LogSeverity = "info" | "warn" | "error" | "fatal";

export interface ErrorLogPayload {
  message: string;
  stack?: string | null;
  component_stack?: string | null;
  route?: string | null;
  url?: string | null;
  user_id?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  screen?: string | null;
  app_version?: string | null;
  build_version?: string | null;
  severity: LogSeverity;
  metadata?: Record<string, unknown>;
}

export interface LoggerContext {
  userId?: string | null;
  route?: string | null;
}
