import { buildBasePayload } from "./context";
import { persistErrorLog } from "./persist";
import { shouldLog, throttleKey } from "./throttle";
import type { ErrorLogPayload, LogSeverity } from "./types";

export { setLoggerContext, getLoggerContext, getCurrentRoute } from "./context";
export type { ErrorLogPayload, LogSeverity, LoggerContext } from "./types";

function normalizeError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  if (typeof err === "string") return { message: err };
  try {
    return { message: JSON.stringify(err) };
  } catch {
    return { message: String(err) };
  }
}

function emit(severity: LogSeverity, message: string, err?: unknown, metadata?: Record<string, unknown>) {
  const norm = err ? normalizeError(err) : { message };
  const key = throttleKey(norm.message, severity);
  if (!shouldLog(key)) return;

  const payload: ErrorLogPayload = {
    ...buildBasePayload(severity),
    message: norm.message || message,
    stack: norm.stack ?? null,
    metadata,
  };

  const line = `[${severity.toUpperCase()}] ${payload.message}`;
  if (severity === "info") console.info(line, metadata ?? "");
  else if (severity === "warn") console.warn(line, err ?? metadata ?? "");
  else console.error(line, err ?? metadata ?? "");

  if (severity === "error" || severity === "fatal") {
    persistErrorLog(payload);
  }
}

export const logger = {
  info(message: string, metadata?: Record<string, unknown>) {
    emit("info", message, undefined, metadata);
  },
  warn(message: string, err?: unknown, metadata?: Record<string, unknown>) {
    emit("warn", message, err, metadata);
  },
  error(message: string, err?: unknown, metadata?: Record<string, unknown>) {
    emit("error", message, err, metadata);
  },
  fatal(message: string, err?: unknown, metadata?: Record<string, unknown>) {
    emit("fatal", message, err, metadata);
  },
  capture(payload: Partial<ErrorLogPayload> & { message: string }) {
    const key = throttleKey(payload.message, payload.severity ?? "error");
    if (!shouldLog(key)) return;
    const full: ErrorLogPayload = {
      ...buildBasePayload(payload.severity ?? "error"),
      ...payload,
    };
    console.error(`[${(full.severity ?? "error").toUpperCase()}] ${full.message}`, full.metadata ?? "");
    if (full.severity === "error" || full.severity === "fatal") {
      persistErrorLog(full);
    }
  },
};
