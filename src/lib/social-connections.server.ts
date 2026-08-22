import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  decryptSocialSecret,
  encryptSocialSecret,
  newOauthState,
  socialTokenEncryptionConfigured,
} from "./social-token-crypto.server";
import {
  DEFAULT_OAUTH_RETURN_PATH,
  EMPTY_YOUTUBE_CONNECTION,
  facebookGraphApiVersion,
  facebookMessage,
  finalizeOauthStateClaim,
  normalizeBlueskyPds,
  pinterestAuthorizeSearchParams,
  pinterestTokenExchangeParams,
  sanitizeConnection,
  type SocialConnectionPublic,
} from "./social-connections";
import { shortenForBluesky } from "./social-manual-distribution";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return supabaseAdmin;
}

export type TokenBlob = {
  access_token?: string;
  refresh_token?: string;
  page_token?: string;
  user_token?: string;
  expires_at?: number | null;
  app_password?: string;
  did?: string;
  pds?: string;
};

export function publicSiteBase(): string {
  return (
    process.env.SOCIAL_OAUTH_BASE_URL?.trim() ||
    process.env.YAARZO_PUBLIC_URL?.trim() ||
    "https://yaarzo.com"
  ).replace(/\/$/, "");
}

export function oauthCallbackUrl(platform: "facebook" | "pinterest" | "bluesky"): string {
  return `${publicSiteBase()}/api/public/social-oauth/${platform}/callback`;
}

export function facebookAppConfigured(): boolean {
  return Boolean(process.env.FACEBOOK_APP_ID?.trim() && process.env.FACEBOOK_APP_SECRET?.trim());
}

export function pinterestAppConfigured(): boolean {
  return Boolean(
    (process.env.PINTEREST_APP_ID?.trim() || process.env.PINTEREST_CLIENT_ID?.trim()) &&
      (process.env.PINTEREST_APP_SECRET?.trim() || process.env.PINTEREST_CLIENT_SECRET?.trim()),
  );
}

function facebookApp() {
  const id = process.env.FACEBOOK_APP_ID?.trim() || "";
  const secret = process.env.FACEBOOK_APP_SECRET?.trim() || "";
  if (!id || !secret) throw new Error("Facebook app is not configured (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET).");
  return { id, secret };
}

function pinterestApp() {
  const id = process.env.PINTEREST_APP_ID?.trim() || process.env.PINTEREST_CLIENT_ID?.trim() || "";
  const secret = process.env.PINTEREST_APP_SECRET?.trim() || process.env.PINTEREST_CLIENT_SECRET?.trim() || "";
  if (!id || !secret) throw new Error("Pinterest app is not configured (PINTEREST_APP_ID / PINTEREST_APP_SECRET).");
  return { id, secret };
}

export async function readConnection(platform: string) {
  const { data } = await db()
    .from("social_connections")
    .select("*")
    .eq("platform", platform)
    .maybeSingle();
  return data as Record<string, unknown> | null;
}

export function parseTokenBlob(row: Record<string, unknown> | null): TokenBlob {
  const packed = typeof row?.token_ciphertext === "string" ? row.token_ciphertext : "";
  if (!packed) return {};
  try {
    return JSON.parse(decryptSocialSecret(packed)) as TokenBlob;
  } catch {
    return {};
  }
}

export async function upsertConnection(platform: string, patch: Record<string, unknown>) {
  const existing = await readConnection(platform);
  const now = new Date().toISOString();
  if (existing?.id) {
    const { error } = await db()
      .from("social_connections")
      .update({ ...patch, updated_at: now })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await db().from("social_connections").insert({
    platform,
    ...patch,
    updated_at: now,
  });
  if (error) throw new Error(error.message);
}

export async function listPublicConnections(): Promise<SocialConnectionPublic[]> {
  const { data } = await db().from("social_connections").select("*");
  const byPlatform = new Map<string, SocialConnectionPublic>();
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const pub = sanitizeConnection(row);
    if (pub) byPlatform.set(pub.platform, { ...pub, configured: pub.status === "connected" });
  }
  const platforms = ["facebook", "pinterest", "bluesky", "youtube"] as const;
  return platforms.map((p) => {
    if (p === "youtube") {
      return byPlatform.get("youtube") ?? EMPTY_YOUTUBE_CONNECTION;
    }
    return (
      byPlatform.get(p) ??
      sanitizeConnection({ platform: p, status: "disconnected" })!
    );
  });
}

export async function createOauthState(opts: {
  platform: "facebook" | "pinterest";
  adminUserId: string;
  returnPath?: string;
}): Promise<{ state: string; authorizeUrl: string }> {
  if (!socialTokenEncryptionConfigured()) {
    throw new Error("Token encryption key is not configured (SOCIAL_TOKEN_ENC_KEY).");
  }
  const state = newOauthState();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { error } = await db().from("social_oauth_states").insert({
    platform: opts.platform,
    state,
    code_verifier_ciphertext: null,
    admin_user_id: opts.adminUserId,
    return_path: opts.returnPath || DEFAULT_OAUTH_RETURN_PATH,
    expires_at: expires,
  });
  if (error) throw new Error(error.message);

  if (opts.platform === "facebook") {
    const { id } = facebookApp();
    const params = new URLSearchParams({
      client_id: id,
      redirect_uri: oauthCallbackUrl("facebook"),
      state,
      response_type: "code",
      scope: "pages_show_list,pages_manage_posts",
    });
    return {
      state,
      authorizeUrl: `https://www.facebook.com/${facebookGraphApiVersion()}/dialog/oauth?${params.toString()}`,
    };
  }

  const { id } = pinterestApp();
  const params = pinterestAuthorizeSearchParams({
    clientId: id,
    redirectUri: oauthCallbackUrl("pinterest"),
    state,
  });
  return {
    state,
    authorizeUrl: `https://www.pinterest.com/oauth/?${params.toString()}`,
  };
}

export async function consumeOauthState(state: string, platform: string) {
  if (!state?.trim() || !platform?.trim()) throw new Error("Invalid OAuth state");
  const { data, error } = await db()
    .from("social_oauth_states")
    .delete()
    .eq("state", state)
    .eq("platform", platform)
    .select("state, platform, expires_at, admin_user_id, return_path, code_verifier_ciphertext")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const claimed = finalizeOauthStateClaim(data, platform);
  let verifier = "";
  if (claimed.verifierCiphertext) {
    try {
      verifier = decryptSocialSecret(claimed.verifierCiphertext);
    } catch {
      verifier = "";
    }
  }
  return {
    adminUserId: claimed.adminUserId,
    returnPath: claimed.returnPath,
    verifier,
  };
}

export async function completeFacebookOauth(code: string, adminUserId: string) {
  const { id, secret } = facebookApp();
  const redirect = oauthCallbackUrl("facebook");
  const tokenUrl = new URL(`https://graph.facebook.com/${facebookGraphApiVersion()}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", id);
  tokenUrl.searchParams.set("client_secret", secret);
  tokenUrl.searchParams.set("redirect_uri", redirect);
  tokenUrl.searchParams.set("code", code);
  const shortRes = await fetch(tokenUrl.toString());
  const shortJson = (await shortRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!shortRes.ok || !shortJson.access_token) {
    throw new Error(shortJson.error?.message || "Facebook token exchange failed");
  }

  const llUrl = new URL(`https://graph.facebook.com/${facebookGraphApiVersion()}/oauth/access_token`);
  llUrl.searchParams.set("grant_type", "fb_exchange_token");
  llUrl.searchParams.set("client_id", id);
  llUrl.searchParams.set("client_secret", secret);
  llUrl.searchParams.set("fb_exchange_token", shortJson.access_token);
  const llRes = await fetch(llUrl.toString());
  const llJson = (await llRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  const userToken = llJson.access_token || shortJson.access_token;
  const expiresAt = llJson.expires_in ? Date.now() + llJson.expires_in * 1000 : null;

  const meRes = await fetch(
    `https://graph.facebook.com/${facebookGraphApiVersion()}/me?fields=id,name&access_token=${encodeURIComponent(userToken)}`,
  );
  const me = (await meRes.json()) as { id?: string; name?: string };

  const pages = await fetchFacebookPages(userToken);
  const blob: TokenBlob = {
    user_token: userToken,
    access_token: userToken,
    expires_at: expiresAt,
  };

  if (pages.length === 1) {
    blob.page_token = pages[0].access_token;
    await upsertConnection("facebook", {
      status: "connected",
      account_id: me.id ?? null,
      account_name: me.name ?? null,
      page_id: pages[0].id,
      page_name: pages[0].name,
      token_ciphertext: encryptSocialSecret(JSON.stringify(blob)),
      scopes: ["pages_show_list", "pages_manage_posts"],
      health: "healthy",
      last_error: null,
      last_checked_at: new Date().toISOString(),
      connected_at: new Date().toISOString(),
      connected_by: adminUserId,
    });
    return { needsPageSelection: false as const, pageCount: 1 };
  }

  await upsertConnection("facebook", {
    status: "pending",
    account_id: me.id ?? null,
    account_name: me.name ?? null,
    page_id: null,
    page_name: null,
    token_ciphertext: encryptSocialSecret(JSON.stringify(blob)),
    scopes: ["pages_show_list", "pages_manage_posts"],
    health: "unknown",
    last_error: pages.length === 0 ? "No Facebook Pages available on this account" : null,
    last_checked_at: new Date().toISOString(),
    connected_at: new Date().toISOString(),
    connected_by: adminUserId,
  });
  return { needsPageSelection: pages.length > 1, pageCount: pages.length };
}

export async function fetchFacebookPages(userToken: string): Promise<
  Array<{ id: string; name: string; access_token: string }>
> {
  const res = await fetch(
    `https://graph.facebook.com/${facebookGraphApiVersion()}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(userToken)}`,
  );
  const json = (await res.json()) as {
    data?: Array<{ id: string; name: string; access_token: string }>;
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(json.error?.message || "Failed to list Facebook Pages");
  return json.data ?? [];
}

export async function listFacebookPagesPublic(): Promise<Array<{ id: string; name: string }>> {
  const row = await readConnection("facebook");
  const blob = parseTokenBlob(row);
  const userToken = blob.user_token || blob.access_token;
  if (!userToken) throw new Error("Facebook is not connected");
  const pages = await fetchFacebookPages(userToken);
  return pages.map((p) => ({ id: p.id, name: p.name }));
}

export async function selectFacebookPage(pageId: string, adminUserId: string) {
  const row = await readConnection("facebook");
  const blob = parseTokenBlob(row);
  const userToken = blob.user_token || blob.access_token;
  if (!userToken) throw new Error("Facebook is not connected");
  const pages = await fetchFacebookPages(userToken);
  const page = pages.find((p) => p.id === pageId);
  if (!page) throw new Error("That Facebook Page is not available");
  blob.page_token = page.access_token;
  await upsertConnection("facebook", {
    status: "connected",
    page_id: page.id,
    page_name: page.name,
    token_ciphertext: encryptSocialSecret(JSON.stringify(blob)),
    health: "healthy",
    last_error: null,
    last_checked_at: new Date().toISOString(),
    connected_by: adminUserId,
  });
}

export async function completePinterestOauth(code: string, adminUserId: string) {
  const { id, secret } = pinterestApp();
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const body = pinterestTokenExchangeParams({
    code,
    redirectUri: oauthCallbackUrl("pinterest"),
  });
  const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    message?: string;
    error?: string;
  };
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.message || tokenJson.error || "Pinterest token exchange failed");
  }
  const blob: TokenBlob = {
    access_token: tokenJson.access_token,
    refresh_token: tokenJson.refresh_token,
    expires_at: tokenJson.expires_in ? Date.now() + tokenJson.expires_in * 1000 : null,
  };
  const acctRes = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: { Authorization: `Bearer ${blob.access_token}` },
  });
  const acct = (await acctRes.json()) as { username?: string; id?: string };
  const boards = await fetchPinterestBoards(blob.access_token);
  const defaultBoard = boards[0] ?? null;
  await upsertConnection("pinterest", {
    status: "connected",
    account_id: acct.id ?? acct.username ?? null,
    account_name: acct.username ?? null,
    default_board_id: defaultBoard?.id ?? null,
    default_board_name: defaultBoard?.name ?? null,
    token_ciphertext: encryptSocialSecret(JSON.stringify(blob)),
    scopes: ["boards:read", "pins:write", "user_accounts:read"],
    health: "healthy",
    last_error: defaultBoard ? null : "No boards found — create a board then Reconnect",
    last_checked_at: new Date().toISOString(),
    connected_at: new Date().toISOString(),
    connected_by: adminUserId,
  });
}

export async function fetchPinterestBoards(accessToken: string): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await res.json()) as {
    items?: Array<{ id: string; name: string }>;
    message?: string;
  };
  if (!res.ok) throw new Error(json.message || "Failed to list Pinterest boards");
  return json.items ?? [];
}

export async function refreshPinterestTokenIfNeeded(row: Record<string, unknown>): Promise<TokenBlob> {
  const blob = parseTokenBlob(row);
  if (!blob.refresh_token) return blob;
  if (blob.expires_at && blob.expires_at - 60_000 > Date.now()) return blob;
  const { id, secret } = pinterestApp();
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: blob.refresh_token,
    }),
  });
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!res.ok || !json.access_token) return blob;
  const next: TokenBlob = {
    ...blob,
    access_token: json.access_token,
    refresh_token: json.refresh_token || blob.refresh_token,
    expires_at: json.expires_in ? Date.now() + json.expires_in * 1000 : blob.expires_at,
  };
  await upsertConnection("pinterest", {
    token_ciphertext: encryptSocialSecret(JSON.stringify(next)),
  });
  return next;
}

export async function listPinterestBoardsPublic(): Promise<Array<{ id: string; name: string }>> {
  const row = await readConnection("pinterest");
  if (!row) throw new Error("Pinterest is not connected");
  const blob = await refreshPinterestTokenIfNeeded(row);
  if (!blob.access_token) throw new Error("Pinterest is not connected");
  return fetchPinterestBoards(blob.access_token);
}

export async function setPinterestBoard(boardId: string, adminUserId: string) {
  const boards = await listPinterestBoardsPublic();
  const board = boards.find((b) => b.id === boardId);
  if (!board) throw new Error("Board not found");
  await upsertConnection("pinterest", {
    default_board_id: board.id,
    default_board_name: board.name,
    connected_by: adminUserId,
    last_error: null,
  });
}

export async function connectBlueskySession(opts: {
  identifier: string;
  appPassword: string;
  pds?: string;
  adminUserId: string;
}) {
  const pds = normalizeBlueskyPds(opts.pds);
  const res = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: opts.identifier.trim(),
      password: opts.appPassword,
    }),
  });
  const json = (await res.json()) as {
    did?: string;
    handle?: string;
    accessJwt?: string;
    refreshJwt?: string;
    message?: string;
    error?: string;
  };
  if (!res.ok || !json.accessJwt || !json.did) {
    throw new Error(json.message || json.error || "Bluesky sign-in failed");
  }
  const blob: TokenBlob = {
    access_token: json.accessJwt,
    refresh_token: json.refreshJwt,
    did: json.did,
    pds,
  };
  await upsertConnection("bluesky", {
    status: "connected",
    account_id: json.did,
    account_name: json.handle ?? opts.identifier,
    handle: json.handle ?? opts.identifier,
    token_ciphertext: encryptSocialSecret(JSON.stringify(blob)),
    scopes: ["com.atproto.server.createSession"],
    health: "healthy",
    last_error: null,
    last_checked_at: new Date().toISOString(),
    connected_at: new Date().toISOString(),
    connected_by: opts.adminUserId,
  });
}

async function refreshBluesky(row: Record<string, unknown>): Promise<TokenBlob> {
  const blob = parseTokenBlob(row);
  if (blob.pds) blob.pds = normalizeBlueskyPds(blob.pds);
  if (!blob.refresh_token || !blob.pds) return blob;
  const res = await fetch(`${blob.pds}/xrpc/com.atproto.server.refreshSession`, {
    method: "POST",
    headers: { Authorization: `Bearer ${blob.refresh_token}` },
  });
  if (!res.ok) return blob;
  const json = (await res.json()) as {
    accessJwt?: string;
    refreshJwt?: string;
    did?: string;
    handle?: string;
  };
  if (!json.accessJwt) return blob;
  const next: TokenBlob = {
    ...blob,
    access_token: json.accessJwt,
    refresh_token: json.refreshJwt || blob.refresh_token,
    did: json.did || blob.did,
  };
  await upsertConnection("bluesky", {
    token_ciphertext: encryptSocialSecret(JSON.stringify(next)),
    handle: json.handle || (row.handle as string),
  });
  return next;
}

export async function disconnectPlatform(platform: "facebook" | "pinterest" | "bluesky") {
  await upsertConnection(platform, {
    status: "disconnected",
    token_ciphertext: null,
    health: "unknown",
    last_error: null,
    page_id: platform === "facebook" ? null : undefined,
    page_name: platform === "facebook" ? null : undefined,
    default_board_id: platform === "pinterest" ? null : undefined,
    default_board_name: platform === "pinterest" ? null : undefined,
  });
}

export async function checkConnectionHealth(platform: "facebook" | "pinterest" | "bluesky") {
  const row = await readConnection(platform);
  if (!row || row.status === "disconnected") {
    await upsertConnection(platform, {
      health: "unknown",
      last_checked_at: new Date().toISOString(),
    });
    return { health: "unknown" as const };
  }
  try {
    if (platform === "facebook") {
      const blob = parseTokenBlob(row);
      const token = blob.page_token || blob.access_token;
      const pageId = row.page_id as string | null;
      if (!token || !pageId) throw new Error("Facebook Page is not selected");
      const res = await fetch(
        `https://graph.facebook.com/${facebookGraphApiVersion()}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(token)}`,
      );
      const json = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) throw new Error(json.error?.message || "Facebook health check failed");
    } else if (platform === "pinterest") {
      const blob = await refreshPinterestTokenIfNeeded(row);
      if (!blob.access_token) throw new Error("Pinterest is not connected");
      const res = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${blob.access_token}` },
      });
      if (!res.ok) throw new Error("Pinterest health check failed");
    } else {
      const blob = await refreshBluesky(row);
      if (!blob.access_token || !blob.pds) throw new Error("Bluesky is not connected");
      const res = await fetch(`${blob.pds}/xrpc/com.atproto.server.getSession`, {
        headers: { Authorization: `Bearer ${blob.access_token}` },
      });
      if (!res.ok) throw new Error("Bluesky session expired — reconnect");
    }
    await upsertConnection(platform, {
      health: "healthy",
      last_error: null,
      last_checked_at: new Date().toISOString(),
      status: "connected",
    });
    return { health: "healthy" as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Health check failed";
    await upsertConnection(platform, {
      health: "error",
      last_error: msg,
      last_checked_at: new Date().toISOString(),
      status: row.status === "pending" ? "pending" : "error",
    });
    return { health: "error" as const, error: msg };
  }
}

export type PublishInput = {
  caption: string;
  profileUrl: string;
  mediaUrl: string | null;
  displayName: string;
  pinterestTitle: string;
};

export type PublishOk = {
  ok: true;
  externalPostId: string | null;
  publishedUrl: string | null;
};

export async function publishFacebook(input: PublishInput): Promise<PublishOk> {
  const row = await readConnection("facebook");
  if (!row || row.status !== "connected") throw new Error("Facebook Page is not connected");
  const blob = parseTokenBlob(row);
  const token = blob.page_token;
  const pageId = row.page_id as string | null;
  if (!token || !pageId) throw new Error("Select a Facebook Page first");
  const message = facebookMessage(input.caption, input.profileUrl);

  if (input.mediaUrl) {
    const body = new URLSearchParams({
      url: input.mediaUrl,
      caption: message,
      published: "true",
      access_token: token,
    });
    const res = await fetch(`https://graph.facebook.com/${facebookGraphApiVersion()}/${encodeURIComponent(pageId)}/photos`, {
      method: "POST",
      body,
    });
    const json = (await res.json()) as { id?: string; post_id?: string; error?: { message?: string } };
    if (res.ok && (json.id || json.post_id)) {
      const postId = json.post_id || json.id || null;
      return {
        ok: true,
        externalPostId: postId,
        publishedUrl: postId ? `https://www.facebook.com/${postId}` : `https://www.facebook.com/${pageId}`,
      };
    }
  }

  const feed = new URLSearchParams({
    message,
    link: input.profileUrl,
    access_token: token,
  });
  const res = await fetch(`https://graph.facebook.com/${facebookGraphApiVersion()}/${encodeURIComponent(pageId)}/feed`, {
    method: "POST",
    body: feed,
  });
  const json = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !json.id) throw new Error(json.error?.message || "Facebook publish failed");
  return {
    ok: true,
    externalPostId: json.id,
    publishedUrl: `https://www.facebook.com/${json.id}`,
  };
}

export async function publishPinterest(input: PublishInput): Promise<PublishOk> {
  if (!input.mediaUrl) throw new Error("Pinterest requires the Yaarzo social image");
  const row = await readConnection("pinterest");
  if (!row || row.status !== "connected") throw new Error("Pinterest is not connected");
  const blob = await refreshPinterestTokenIfNeeded(row);
  if (!blob.access_token) throw new Error("Pinterest is not connected");
  const boardId = row.default_board_id as string | null;
  if (!boardId) throw new Error("Select a default Pinterest board first");
  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${blob.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: boardId,
      title: input.pinterestTitle,
      description: input.caption,
      link: input.profileUrl,
      media_source: {
        source_type: "image_url",
        url: input.mediaUrl,
      },
    }),
  });
  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !json.id) throw new Error(json.message || "Pinterest pin create failed");
  return {
    ok: true,
    externalPostId: json.id,
    publishedUrl: `https://www.pinterest.com/pin/${json.id}/`,
  };
}

export async function publishBluesky(input: PublishInput): Promise<PublishOk> {
  const row = await readConnection("bluesky");
  if (!row || row.status !== "connected") throw new Error("Bluesky is not connected");
  const blob = await refreshBluesky(row);
  if (!blob.access_token || !blob.did || !blob.pds) throw new Error("Bluesky is not connected");
  blob.pds = normalizeBlueskyPds(blob.pds);
  const text = shortenForBluesky(input.caption, input.profileUrl);

  let embed: Record<string, unknown> | undefined;
  if (input.mediaUrl) {
    try {
      const imgRes = await fetch(input.mediaUrl);
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        const mime = imgRes.headers.get("content-type") || "image/jpeg";
        const up = await fetch(`${blob.pds}/xrpc/com.atproto.repo.uploadBlob`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${blob.access_token}`,
            "Content-Type": mime.split(";")[0],
          },
          body: buf,
        });
        const upJson = (await up.json()) as { blob?: unknown };
        if (up.ok && upJson.blob) {
          embed = {
            $type: "app.bsky.embed.images",
            images: [{ alt: `Welcome ${input.displayName} to Yaarzo`, image: upJson.blob }],
          };
        }
      }
    } catch {
      embed = undefined;
    }
  }

  const record: Record<string, unknown> = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: new Date().toISOString(),
  };
  if (embed) record.embed = embed;

  const res = await fetch(`${blob.pds}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${blob.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo: blob.did,
      collection: "app.bsky.feed.post",
      record,
    }),
  });
  const json = (await res.json()) as { uri?: string; cid?: string; message?: string };
  if (!res.ok || !json.uri) throw new Error(json.message || "Bluesky publish failed");
  const rkey = json.uri.split("/").pop() || "";
  const handle = (row.handle as string) || blob.did;
  return {
    ok: true,
    externalPostId: json.cid ? `${json.uri}|${json.cid}` : json.uri,
    publishedUrl: rkey ? `https://bsky.app/profile/${encodeURIComponent(handle)}/post/${rkey}` : null,
  };
}

export function envFlags() {
  return {
    encryptionConfigured: socialTokenEncryptionConfigured(),
    facebookConfigured: facebookAppConfigured(),
    pinterestConfigured: pinterestAppConfigured(),
    blueskyConfigured: true,
    oauthBaseUrl: publicSiteBase(),
    facebookRedirectUri: oauthCallbackUrl("facebook"),
    pinterestRedirectUri: oauthCallbackUrl("pinterest"),
    facebookGraphApiVersion: facebookGraphApiVersion(),
  };
}
