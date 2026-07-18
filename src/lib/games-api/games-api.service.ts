/**
 * Games API — service layer.
 *
 * SERVER-ONLY. Verifies the signed game session token minted by
 * `GameLaunchService` (see `src/lib/game-launch.functions.ts`) and calls
 * the existing platform pipelines. This module contains NO new business
 * logic — every operation is a thin bridge to an existing system:
 *
 *   score       → gam_emit('game.score')
 *   xp          → gam_emit()
 *   coins       → gam_award()             (wallet)
 *   achievement → gam_award()             (badge on profile)
 *   save        → game_saves               (existing cloud-save table)
 *   event       → gam_event_log            (analytics)
 *
 * `start`/`finish` emit `game.start` / `game.finish` events into
 * gam_event_log so existing analytics dashboards pick them up — no new
 * table, no new logic.
 */
import { createHmac, timingSafeEqual } from "crypto";
import type { GameSessionClaims } from "./games-api.types";

/* -------------------------------------------------- Token verification */

function b64urlDecode(input: string): Buffer {
  const pad = 4 - (input.length % 4 || 4);
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + (pad < 4 ? "=".repeat(pad) : "");
  return Buffer.from(b64, "base64");
}

export class GamesApiAuthError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status = 401) {
    super(message);
    this.name = "GamesApiAuthError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Verify a game session token. Returns the payload claims on success.
 * Throws GamesApiAuthError on any failure (bad signature / expired /
 * malformed / secret misconfigured).
 */
export function verifyGameSession(token: string, expectedGameId?: string): GameSessionClaims {
  const secret = process.env.GAME_LAUNCH_HMAC_SECRET;
  if (!secret) throw new GamesApiAuthError("no_secret", "Server not configured", 500);
  if (!token || typeof token !== "string") throw new GamesApiAuthError("no_token", "Missing session token");

  const parts = token.split(".");
  if (parts.length !== 3) throw new GamesApiAuthError("bad_token", "Malformed token");
  const [h, p, s] = parts;

  const signingInput = `${h}.${p}`;
  const expectedSig = createHmac("sha256", secret).update(signingInput).digest();
  let sigBuf: Buffer;
  try {
    sigBuf = b64urlDecode(s!);
  } catch {
    throw new GamesApiAuthError("bad_signature", "Invalid signature");
  }
  if (sigBuf.length !== expectedSig.length || !timingSafeEqual(sigBuf, expectedSig)) {
    throw new GamesApiAuthError("bad_signature", "Invalid signature");
  }

  let claims: GameSessionClaims;
  try {
    claims = JSON.parse(b64urlDecode(p!).toString("utf8")) as GameSessionClaims;
  } catch {
    throw new GamesApiAuthError("bad_payload", "Invalid token payload");
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp < now) {
    throw new GamesApiAuthError("expired", "Session token expired");
  }
  if (typeof claims.iat !== "number" || claims.iat > now + 60) {
    throw new GamesApiAuthError("bad_iat", "Invalid issued-at");
  }
  if (!claims.sub || typeof claims.sub !== "string") {
    throw new GamesApiAuthError("no_sub", "Missing subject");
  }
  if (!claims.gid || typeof claims.gid !== "string") {
    throw new GamesApiAuthError("no_gid", "Missing gameId in token");
  }
  if (!claims.nonce || typeof claims.nonce !== "string" || claims.nonce.length < 16) {
    throw new GamesApiAuthError("bad_nonce", "Invalid nonce");
  }
  if (expectedGameId && claims.gid !== expectedGameId) {
    throw new GamesApiAuthError("game_mismatch", "gameId mismatch", 403);
  }

  return claims;
}

/* --------------------------------------------------- Platform bridges */
/*  Each function below uses the existing platform pipelines. Keep this
 *  module free of duplicated business logic — always call the RPCs and
 *  tables the SDK server functions already use.
 */

type Meta = Record<string, unknown>;
type Admin = Awaited<ReturnType<typeof getAdmin>>;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function emit(
  admin: Admin,
  userId: string,
  eventType: string,
  amount: number,
  metadata: Meta,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { error } = await a.rpc("gam_emit", {
    _user_id: userId,
    _event_type: eventType,
    _amount: amount,
    _metadata: metadata,
  });
  if (error) throw new Error(error.message);
}

export interface SessionCtx {
  userId: string;
  gameId: string;
}

export async function apiStart(ctx: SessionCtx, metadata: Meta = {}) {
  const admin = await getAdmin();
  await emit(admin, ctx.userId, "game.start", 1, { ...metadata, gameId: ctx.gameId, sdk: true });
  return { startedAt: new Date().toISOString(), gameId: ctx.gameId };
}

export async function apiFinish(
  ctx: SessionCtx,
  input: { score?: number; duration?: number; metadata?: Meta },
) {
  const admin = await getAdmin();
  await emit(admin, ctx.userId, "game.finish", 1, {
    ...(input.metadata ?? {}),
    gameId: ctx.gameId,
    score: input.score ?? null,
    duration: input.duration ?? null,
    sdk: true,
  });
  return { finishedAt: new Date().toISOString(), gameId: ctx.gameId };
}

export async function apiSubmitScore(
  ctx: SessionCtx,
  input: { score: number; metadata?: Meta },
) {
  const admin = await getAdmin();
  await emit(admin, ctx.userId, "game.score", 1, {
    ...(input.metadata ?? {}),
    gameId: ctx.gameId,
    score: input.score,
    sdk: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: rows } = await a
    .from("gam_event_log")
    .select("metadata")
    .eq("user_id", ctx.userId)
    .eq("event_type", "game.score")
    .contains("metadata", { gameId: ctx.gameId })
    .limit(500);
  const best = ((rows ?? []) as Array<{ metadata: Meta }>).reduce((m, r) => {
    const s = Number((r?.metadata as Meta)?.score ?? 0);
    return s > m ? s : m;
  }, input.score);
  return { best, submitted: input.score };
}

export async function apiAddXP(
  ctx: SessionCtx,
  input: { amount: number; reason?: string; metadata?: Meta },
) {
  const admin = await getAdmin();
  const reason = (input.reason ?? "game.xp").slice(0, 80);
  await emit(admin, ctx.userId, reason, input.amount, {
    ...(input.metadata ?? {}),
    gameId: ctx.gameId,
    sdk: true,
  });
  return { xpAdded: input.amount };
}

export async function apiAddCoins(
  ctx: SessionCtx,
  input: { amount: number; reason?: string },
) {
  const admin = await getAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { error } = await a.rpc("gam_award", {
    _user_id: ctx.userId,
    _coins: input.amount,
    _xp: 0,
    _badge: null,
    _reason: (input.reason ?? "game.coins").slice(0, 80),
    _reference: ctx.gameId || null,
  });
  if (error) throw new Error(error.message);
  const { data: prof } = await a
    .from("profiles")
    .select("coins")
    .eq("id", ctx.userId)
    .maybeSingle();
  return { coins: Number(prof?.coins ?? 0), added: input.amount };
}

export async function apiUnlockAchievement(
  ctx: SessionCtx,
  input: { achievementId: string; coins?: number; xp?: number; reason?: string },
) {
  const admin = await getAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { error } = await a.rpc("gam_award", {
    _user_id: ctx.userId,
    _coins: input.coins ?? 0,
    _xp: input.xp ?? 0,
    _badge: input.achievementId,
    _reason: (input.reason ?? "sdk.achievement").slice(0, 80),
    _reference: input.achievementId,
  });
  if (error) throw new Error(error.message);
  return {
    achievementId: input.achievementId,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  };
}

export async function apiSaveWrite(
  ctx: SessionCtx,
  input: { slot: string; data: unknown; expectedVersion?: number },
) {
  const admin = await getAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: existing } = await a
    .from("game_saves")
    .select("id, version")
    .eq("user_id", ctx.userId)
    .eq("game_id", ctx.gameId)
    .eq("slot", input.slot)
    .maybeSingle();

  if (
    existing &&
    typeof input.expectedVersion === "number" &&
    existing.version !== input.expectedVersion
  ) {
    throw new GamesApiAuthError(
      "version_conflict",
      `VERSION_CONFLICT: server=${existing.version} expected=${input.expectedVersion}`,
      409,
    );
  }

  const nextVersion = (existing?.version ?? 0) + 1;
  const { data: row, error } = await a
    .from("game_saves")
    .upsert(
      {
        user_id: ctx.userId,
        game_id: ctx.gameId,
        slot: input.slot,
        data: input.data,
        version: nextVersion,
      },
      { onConflict: "user_id,game_id,slot" },
    )
    .select("slot, data, version, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return {
    slot: row.slot,
    data: row.data,
    version: row.version,
    updatedAt: row.updated_at,
  };
}

export async function apiSaveRead(
  ctx: SessionCtx,
  input: { slot?: string; list?: boolean },
) {
  const admin = await getAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  if (input.list) {
    const { data: rows, error } = await a
      .from("game_saves")
      .select("slot, data, version, updated_at")
      .eq("user_id", ctx.userId)
      .eq("game_id", ctx.gameId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map(
      (r: { slot: string; data: unknown; version: number; updated_at: string }) => ({
        slot: r.slot,
        data: r.data,
        version: r.version,
        updatedAt: r.updated_at,
      }),
    );
  }
  const slot = input.slot ?? "default";
  const { data: row } = await a
    .from("game_saves")
    .select("slot, data, version, updated_at")
    .eq("user_id", ctx.userId)
    .eq("game_id", ctx.gameId)
    .eq("slot", slot)
    .maybeSingle();
  if (!row) return null;
  return {
    slot: row.slot,
    data: row.data,
    version: row.version,
    updatedAt: row.updated_at,
  };
}

export async function apiTrackEvent(
  ctx: SessionCtx,
  input: { name: string; properties?: Meta },
) {
  const admin = await getAdmin();
  await emit(admin, ctx.userId, "sdk.event", 1, {
    name: input.name,
    gameId: ctx.gameId,
    properties: input.properties ?? {},
    sdk: true,
  });
  return { tracked: input.name };
}
