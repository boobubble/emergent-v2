/**
 * Server-only HMAC helpers for the licensing subsystem.
 *
 * The `.server.ts` filename is blocked from the client bundle by the
 * Vite server-only import guard; every export here reads secrets from
 * `process.env` and must never be imported by browser code.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

function requireSecret(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Deterministic JSON stringify so signatures match across serializations. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`)
    .join(",")}}`;
}

export function signHmac(payload: unknown, secretEnv = "LICENSE_HMAC_SECRET"): string {
  const secret = requireSecret(secretEnv);
  return createHmac("sha256", secret).update(canonicalize(payload)).digest("hex");
}

export function verifyHmac(
  payload: unknown,
  signature: string,
  secretEnv = "LICENSE_HMAC_SECRET",
): boolean {
  const expected = signHmac(payload, secretEnv);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature ?? "", "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Verify an HMAC signature over a raw request body string, used by
 * external callers of the REST licensing endpoints. Header value is the
 * hex signature of `LICENSE_SERVER_HMAC_SECRET` over the raw body.
 */
export function verifyRequestSignature(rawBody: string, header: string | null): boolean {
  if (!header) return false;
  const secret = requireSecret("LICENSE_SERVER_HMAC_SECRET");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(header, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
