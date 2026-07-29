import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
async function assertAdmin(ctx) {
  const {
    data,
    error
  } = await ctx.supabase.rpc("is_admin", {
    _user_id: ctx.userId
  });
  if (error || !data) throw new Error("Forbidden");
}
const listApiKeys_createServerFn_handler = createServerRpc({
  id: "dee789de6065d63c67f8ff2db3be3eaa7a2f980f2cea7a84c0f3c82b6f37893d",
  name: "listApiKeys",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => listApiKeys.__executeServer(opts));
const listApiKeys = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(listApiKeys_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("api_keys").select("id, name, key_prefix, scopes, created_at, last_used_at, revoked_at").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const createApiKey_createServerFn_handler = createServerRpc({
  id: "f9eb70435824945d9ec1a72b8875c2a5b47a29d1008f4b084ba2330b7c394d44",
  name: "createApiKey",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => createApiKey.__executeServer(opts));
const createApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createApiKey_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const name = data.name.trim().slice(0, 80);
  if (!name) throw new Error("Name required");
  const {
    newApiKey
  } = await import("./api-webhooks.server-BXsaZzEk.mjs");
  const {
    raw,
    prefix,
    hash
  } = newApiKey();
  const {
    error
  } = await context.supabase.from("api_keys").insert({
    name,
    key_prefix: prefix,
    key_hash: hash,
    scopes: data.scopes?.length ? data.scopes : ["read"],
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    key: raw,
    prefix
  };
});
const revokeApiKey_createServerFn_handler = createServerRpc({
  id: "c51331d8664ee9a1b99eccabd850522a922888a9a04337e7aa9a1384fc92b1e6",
  name: "revokeApiKey",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => revokeApiKey.__executeServer(opts));
const revokeApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(revokeApiKey_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("api_keys").update({
    revoked_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteApiKey_createServerFn_handler = createServerRpc({
  id: "8cbdb6d7a736e93cce4ff31a9e919e7f506aad2cfa65c318263e93178744d958",
  name: "deleteApiKey",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => deleteApiKey.__executeServer(opts));
const deleteApiKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(deleteApiKey_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("api_keys").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listWebhooks_createServerFn_handler = createServerRpc({
  id: "a0ab0a5b5b79eebeb91f6d0a6175ebcb7407243ced1144cd91bc38956264e9b3",
  name: "listWebhooks",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => listWebhooks.__executeServer(opts));
const listWebhooks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(listWebhooks_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    data,
    error
  } = await context.supabase.from("webhook_endpoints").select("id, name, url, events, active, created_at, last_delivery_at, last_status, failure_count").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const createWebhook_createServerFn_handler = createServerRpc({
  id: "fc2b1a748d338abb64f21c551a45e8dbcdf590f8f968f3b3f32715ef8ae22e33",
  name: "createWebhook",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => createWebhook.__executeServer(opts));
const createWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(createWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const name = data.name.trim().slice(0, 80);
  let url;
  try {
    url = new URL(data.url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error("URL must be http(s)");
  const {
    newWebhookSecret,
    encryptSecret
  } = await import("./api-webhooks.server-BXsaZzEk.mjs");
  const secret = newWebhookSecret();
  const secret_ciphertext = encryptSecret(secret);
  const {
    data: row,
    error
  } = await context.supabase.from("webhook_endpoints").insert({
    name,
    url: url.toString(),
    secret_ciphertext,
    events: data.events ?? [],
    created_by: context.userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  return {
    id: row.id,
    secret
  };
});
const updateWebhook_createServerFn_handler = createServerRpc({
  id: "f7de6d8e9da976fdc2b72f697da43f50e538ef7e8ca8e73ba2f36e197b33c6ea",
  name: "updateWebhook",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => updateWebhook.__executeServer(opts));
const updateWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(updateWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const patch = {};
  if (data.name !== void 0) patch.name = data.name.trim().slice(0, 80);
  if (data.url !== void 0) {
    try {
      new URL(data.url);
    } catch {
      throw new Error("Invalid URL");
    }
    patch.url = data.url;
  }
  if (data.events !== void 0) patch.events = data.events;
  if (data.active !== void 0) patch.active = data.active;
  const {
    error
  } = await context.supabase.from("webhook_endpoints").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteWebhook_createServerFn_handler = createServerRpc({
  id: "49df20710ad565cf42f7a116945977c25e13c0e4792cd58c6a836da350b6a5ba",
  name: "deleteWebhook",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => deleteWebhook.__executeServer(opts));
const deleteWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(deleteWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    error
  } = await context.supabase.from("webhook_endpoints").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const rotateWebhookSecret_createServerFn_handler = createServerRpc({
  id: "7940784e868707665f83d64093656b192cd4da361b9c17e33387b0f3a47bc6c0",
  name: "rotateWebhookSecret",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => rotateWebhookSecret.__executeServer(opts));
const rotateWebhookSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(rotateWebhookSecret_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    newWebhookSecret,
    encryptSecret
  } = await import("./api-webhooks.server-BXsaZzEk.mjs");
  const secret = newWebhookSecret();
  const secret_ciphertext = encryptSecret(secret);
  const {
    error
  } = await context.supabase.from("webhook_endpoints").update({
    secret_ciphertext
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    secret
  };
});
const testWebhook_createServerFn_handler = createServerRpc({
  id: "f3d228f71174d2627a413c5bde8c1df6a81b573be644681bf92372e066b8057f",
  name: "testWebhook",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => testWebhook.__executeServer(opts));
const testWebhook = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(testWebhook_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    data: row,
    error
  } = await context.supabase.from("webhook_endpoints").select("url, secret_ciphertext").eq("id", data.id).single();
  if (error || !row) throw new Error(error?.message ?? "Webhook not found");
  const r = row;
  if (!r.secret_ciphertext) throw new Error("This webhook has no signing secret yet — rotate to generate one.");
  const {
    signWebhookDelivery,
    decryptSecret
  } = await import("./api-webhooks.server-BXsaZzEk.mjs");
  const secret = decryptSecret(r.secret_ciphertext);
  const payload = {
    event: "test.ping",
    at: (/* @__PURE__ */ new Date()).toISOString(),
    data: {
      hello: "world"
    }
  };
  const body = JSON.stringify(payload);
  const {
    ts,
    id,
    signature
  } = signWebhookDelivery(secret, body);
  let status = null;
  let ok = false;
  let errMsg = null;
  try {
    const res = await fetch(r.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-event": "test.ping",
        "x-webhook-id": id,
        "x-webhook-timestamp": ts,
        "x-webhook-signature": signature
      },
      body,
      signal: AbortSignal.timeout(1e4)
    });
    status = res.status;
    ok = res.ok;
  } catch (e) {
    errMsg = String(e?.message ?? e);
  }
  await context.supabase.from("webhook_deliveries").insert({
    endpoint_id: data.id,
    event: "test.ping",
    status_code: status,
    ok,
    error: errMsg,
    payload
  });
  await context.supabase.from("webhook_endpoints").update({
    last_delivery_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_status: status,
    failure_count: ok ? 0 : void 0
  }).eq("id", data.id);
  return {
    ok,
    status,
    error: errMsg
  };
});
const listDeliveries_createServerFn_handler = createServerRpc({
  id: "c5de9c0a853d8bf4f45a9fa48ef0231bfaad52960f65f2485027c597cc602bf3",
  name: "listDeliveries",
  filename: "src/lib/api-webhooks.functions.ts"
}, (opts) => listDeliveries.__executeServer(opts));
const listDeliveries = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((d) => d).handler(listDeliveries_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    data: rows,
    error
  } = await context.supabase.from("webhook_deliveries").select("id, event, status_code, ok, error, created_at").eq("endpoint_id", data.endpoint_id).order("created_at", {
    ascending: false
  }).limit(50);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
export {
  createApiKey_createServerFn_handler,
  createWebhook_createServerFn_handler,
  deleteApiKey_createServerFn_handler,
  deleteWebhook_createServerFn_handler,
  listApiKeys_createServerFn_handler,
  listDeliveries_createServerFn_handler,
  listWebhooks_createServerFn_handler,
  revokeApiKey_createServerFn_handler,
  rotateWebhookSecret_createServerFn_handler,
  testWebhook_createServerFn_handler,
  updateWebhook_createServerFn_handler
};
