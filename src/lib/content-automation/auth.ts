/**
 * Dual-secret auth for content-automation API routes.
 * Publish/cron endpoints accept CRON_SECRET or ADMIN_API_SECRET.
 * Admin-only endpoints accept ADMIN_API_SECRET only.
 */

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header) return null;
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function matchesAny(provided: string, candidates: Array<string | undefined>): boolean {
  return candidates.some((expected) => !!expected && timingSafeEqual(provided, expected));
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function notConfigured() {
  return new Response(JSON.stringify({ error: "API secret not configured" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

/** Cron + admin "run now". Accepts CRON_SECRET or ADMIN_API_SECRET. */
export function requireCronOrAdminAuth(request: Request): Response | null {
  const cron = process.env.CRON_SECRET?.trim();
  const admin = process.env.ADMIN_API_SECRET?.trim();
  if (!cron && !admin) return notConfigured();
  const provided = bearerToken(request);
  if (!provided) return unauthorized();
  if (!matchesAny(provided, [cron, admin])) return unauthorized();
  return null;
}

/** Admin UI only. Does NOT accept CRON_SECRET. */
export function requireAdminApiAuth(request: Request): Response | null {
  const admin = process.env.ADMIN_API_SECRET?.trim();
  if (!admin) return notConfigured();
  const provided = bearerToken(request);
  if (!provided) return unauthorized();
  if (!matchesAny(provided, [admin])) return unauthorized();
  return null;
}
