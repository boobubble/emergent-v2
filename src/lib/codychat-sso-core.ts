import { createHmac, timingSafeEqual } from "node:crypto";

export const CODYCHAT_SSO_TOKEN_MAX_SKEW_SEC = 120;
export const CODYCHAT_SSO_TOKEN_TTL_SEC = 60;

export type CodyChatSsoPayload = {
  sub: string;
  username: string;
  avatar: string;
  gender: string;
  exp: number;
  avatar_fp?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlDecode(input: string): Buffer | null {
  const padded =
    input + "=".repeat((4 - (input.length % 4)) % 4);
  try {
    return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  } catch {
    return null;
  }
}

export function avatarFingerprint(url: string): string {
  if (!url) return "";
  return createHmac("sha256", "yaarzo-avatar-fp")
    .update(url)
    .digest("hex")
    .slice(0, 16);
}

export function buildCodyChatSsoToken(
  payload: CodyChatSsoPayload,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
): string {
  const body: CodyChatSsoPayload = { ...payload, exp: nowSec + CODYCHAT_SSO_TOKEN_TTL_SEC };
  const payloadEncoded = base64UrlEncode(JSON.stringify(body));
  const signature = base64UrlEncode(
    createHmac("sha256", secret).update(payloadEncoded).digest(),
  );
  return `${payloadEncoded}.${signature}`;
}

export type VerifySsoResult =
  | { ok: true; payload: CodyChatSsoPayload }
  | { ok: false; reason: string };

export function verifyCodyChatSsoToken(
  token: string,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
): VerifySsoResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid_format" };

  const [payloadEncoded, signatureEncoded] = parts;
  const expected = base64UrlEncode(
    createHmac("sha256", secret).update(payloadEncoded).digest(),
  );

  const a = Buffer.from(signatureEncoded);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid_signature" };
  }

  const jsonBuf = base64UrlDecode(payloadEncoded);
  if (!jsonBuf) return { ok: false, reason: "invalid_payload" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonBuf.toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, reason: "invalid_payload" };
  }

  const p = parsed as CodyChatSsoPayload;
  if (!UUID_RE.test(String(p.sub ?? ""))) return { ok: false, reason: "invalid_user" };
  if (!String(p.username ?? "").trim()) return { ok: false, reason: "invalid_username" };

  const exp = Number(p.exp);
  if (!Number.isFinite(exp) || exp < nowSec || exp > nowSec + CODYCHAT_SSO_TOKEN_MAX_SKEW_SEC) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload: p };
}

export function resolveSsoUsername(
  username: string | null | undefined,
  displayName: string | null | undefined,
  userId: string,
): string {
  const u = username?.trim();
  if (u) return u.slice(0, 50);
  const d = displayName?.trim();
  if (d) return d.slice(0, 50);
  return `user_${userId.slice(0, 8)}`;
}

export const YAARZO_LOGOUT_MESSAGE_TYPE = "YAARZO_LOGOUT" as const;

export function isYaarzoLogoutMessage(
  data: unknown,
  origin: string,
  allowedOrigins: readonly string[],
): boolean {
  if (!allowedOrigins.includes(origin)) return false;
  if (!data || typeof data !== "object") return false;
  const rec = data as Record<string, unknown>;
  return rec.type === YAARZO_LOGOUT_MESSAGE_TYPE && rec.source === "codychat";
}
