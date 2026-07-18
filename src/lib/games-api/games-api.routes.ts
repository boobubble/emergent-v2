/**
 * Games API — shared HTTP handler pipeline.
 *
 * Every `/api/games/*` route delegates to `handleGamesApiRequest()` below.
 * This centralises:
 *   - CORS preflight + headers (external games call from another origin)
 *   - Bearer / query / body extraction of the signed session token
 *   - Token verification via `verifyGameSession()`
 *   - Rate limiting via the existing `enforceRateLimit()` helper
 *   - Zod payload validation
 *   - Consistent `{ success, message, data, error }` JSON envelope
 *   - Structured request logging for debugging
 *
 * No new business logic lives here — action handlers dispatch to the
 * service layer which in turn calls the existing platform pipelines.
 */
import { z } from "zod";
import { verifyGameSession, GamesApiAuthError, type SessionCtx } from "./games-api.service";
import { enforceRateLimit, RateLimitError, getClientIp } from "@/lib/rate-limit.server";
import type { ApiResponse, GamesApiAction } from "./games-api.types";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, x-game-session",
  "access-control-max-age": "600",
} as const;

const JSON_HEADERS = {
  ...CORS_HEADERS,
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function envelope<T>(body: Omit<ApiResponse<T>, "success"> & { success: boolean }, status: number) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function ok<T>(data: T, message = "ok") {
  return envelope<T>({ success: true, message, data, error: null }, 200);
}

function fail(status: number, error: string, message = error) {
  return envelope({ success: false, message, data: null, error }, status);
}

function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function extractToken(request: Request, body: Record<string, unknown> | null): string {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1]!.trim();
  const xg = request.headers.get("x-game-session");
  if (xg) return xg.trim();
  const url = new URL(request.url);
  const q = url.searchParams.get("session");
  if (q) return q.trim();
  if (body && typeof body.session === "string") return body.session;
  return "";
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  if (request.method === "GET" || request.method === "HEAD") return null;
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return {};
  try {
    const text = await request.text();
    if (!text) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return null; // signal parse error
  }
}

export interface GamesApiHandlerOptions<S extends z.ZodTypeAny, R> {
  action: GamesApiAction;
  /** Rate-limit action key (falls back to "api"). */
  rateKey: string;
  /** Zod schema applied to the merged body+query payload. */
  schema: S;
  /** Called with the verified session and validated payload. */
  run: (ctx: SessionCtx, input: z.infer<S>) => Promise<R>;
}

/**
 * Build a TSS route handler that runs the shared verify + rate-limit +
 * validate + dispatch pipeline. Every `/api/games/*` route uses this.
 */
export function makeGamesApiHandler<S extends z.ZodTypeAny, R>(opts: GamesApiHandlerOptions<S, R>) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    if (request.method === "OPTIONS") return preflight();

    const started = Date.now();
    const ip = getClientIp();
    const url = new URL(request.url);

    // Parse body (POST) or take query params (GET)
    const body = await readBody(request);
    if (body === null) return fail(400, "invalid_json", "Malformed JSON body");

    // Verify signed session token
    const token = extractToken(request, body);
    let claims;
    try {
      claims = verifyGameSession(token);
    } catch (e) {
      const err = e as GamesApiAuthError;
      logRequest(opts.action, null, ip, started, err.status ?? 401, err.code ?? "unauth");
      return fail(err.status ?? 401, err.code ?? "unauthorized", err.message);
    }

    // Merge inputs: body wins over query
    const query: Record<string, unknown> = {};
    for (const [k, v] of url.searchParams.entries()) {
      if (k === "session") continue;
      // best-effort typed coercion for numbers/booleans
      if (v === "true") query[k] = true;
      else if (v === "false") query[k] = false;
      else if (v !== "" && !isNaN(Number(v))) query[k] = Number(v);
      else query[k] = v;
    }
    const raw = { ...query, ...(body ?? {}) };
    // gameId defaults to the token's gameId if omitted
    if (!("gameId" in raw) || raw.gameId == null) raw.gameId = claims.gid;

    // Validate payload
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first ? `${first.path.join(".")}: ${first.message}` : "invalid payload";
      logRequest(opts.action, claims.sub, ip, started, 400, "invalid_payload");
      return fail(400, "invalid_payload", msg);
    }

    // Rate limit
    try {
      await enforceRateLimit({ action: opts.rateKey, userId: claims.sub, ip });
    } catch (e) {
      if (e instanceof RateLimitError) {
        logRequest(opts.action, claims.sub, ip, started, 429, "rate_limited");
        return envelope(
          {
            success: false,
            message: e.message,
            data: null,
            error: "rate_limited",
          },
          429,
        );
      }
    }

    const ctx: SessionCtx = { userId: claims.sub, gameId: claims.gid };
    try {
      const data = await opts.run(ctx, parsed.data as z.infer<S>);
      logRequest(opts.action, claims.sub, ip, started, 200, "ok");
      return ok(data);
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      const status = err.status ?? 500;
      const code = err.code ?? "server_error";
      const msg = err.message ?? "Unknown error";
      logRequest(opts.action, claims.sub, ip, started, status, code);
      return fail(status, code, msg);
    }
  };
}

function logRequest(
  action: string,
  userId: string | null,
  ip: string | null,
  startedAt: number,
  status: number,
  code: string,
) {
  const ms = Date.now() - startedAt;
  // Structured console log — picked up by server-function-logs
  console.log(
    JSON.stringify({
      tag: "games_api",
      action,
      userId,
      ip,
      status,
      code,
      ms,
    }),
  );
}
