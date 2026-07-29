import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent, d as useLocation, N as Navigate, O as Outlet, e as useNavigate, f as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { S as notFound, T as redirect, m as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as QueryClient, c as MutationCache, d as QueryCache } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as logger, s as supabase, a as setLoggerContext } from "./client-H8IXbXWR.mjs";
import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit, g as getClientIp, e as enforceRateLimit, R as RateLimitError } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { g as Dialog$1, D as DialogPortal$1, a as DialogContent$1, d as DialogClose, b as DialogTitle$1, c as DialogDescription$1, f as DialogOverlay$1, h as DialogTrigger$1 } from "../_libs/radix-ui__react-dialog.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { F as FEEDBACK_DEFAULTS, C as CATEGORY_META, S as STATUS_META } from "./feedback-config-DIeqYcnl.mjs";
import { t as toast, T as Toaster$1 } from "../_libs/sonner.mjs";
import { A as APP_VERSION } from "./app-version-8YDb-xNu.mjs";
import { i as instance } from "../_libs/i18next.mjs";
import { B as Browser } from "../_libs/i18next-browser-languagedetector+[...].mjs";
import { B as Backend$1 } from "../_libs/i18next-http-backend.mjs";
import { B as Backend } from "../_libs/i18next-chained-backend.mjs";
import { C as Cache } from "../_libs/i18next-localstorage-backend.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { r as resolvePageSeo, b as buildSitemapXml, s as staticSitemapEntries, a as buildRobotsTxt } from "./sitemap-Dl8Aqg_O.mjs";
import { isReservedSlug } from "./reserved-routes-BWsWje6t.mjs";
import { S as Slot$1 } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
import { S as Switch$1, a as SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
import { f as useSensors, h as useSensor, D as DndContext, i as closestCenter, j as KeyboardSensor, P as PointerSensor } from "../_libs/dnd-kit__core.mjs";
import { S as SortableContext, v as verticalListSortingStrategy, a as arrayMove, s as sortableKeyboardCoordinates, u as useSortable } from "../_libs/dnd-kit__sortable.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { p as poemPreview } from "./mehfil-types-okfUX99d.mjs";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { f as formatFeedbotEvent } from "./feedbot-format-CFiGnWo6.mjs";
import { s as sendLovableEmail } from "../_libs/lovable.dev__email-js.mjs";
import { T as TriangleAlert, b as Save, H as House, c as Plus, d as Trash2, a as Sparkles, I as Image, X, G as GripVertical, R as RotateCcw, E as Eye, e as EyeOff, M as Megaphone, A as ArrowLeft, f as Heart, g as MessageSquare, U as Users, h as MessageCircle, i as Radio, Q as Quote, j as ChevronUp } from "../_libs/lucide-react.mjs";
import { i as initReactI18next } from "../_libs/react-i18next.mjs";
import { o as objectType, s as stringType, e as enumType, f as anyType, b as booleanType, a as arrayType, n as numberType, r as recordType, c as unionType, d as nullType, u as unknownType, l as literalType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./env.server-Bcmcot3M.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/use-sync-external-store.mjs";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
function buildHeadMeta(seo, global) {
  const meta = [
    { title: seo.title },
    { name: "description", content: seo.description }
  ];
  if (seo.keywords) meta.push({ name: "keywords", content: seo.keywords });
  if (seo.robots) meta.push({ name: "robots", content: seo.robots });
  if (global?.author) meta.push({ name: "author", content: global.author });
  if (global?.theme_color) meta.push({ name: "theme-color", content: global.theme_color });
  if (global?.google_verification) meta.push({ name: "google-site-verification", content: global.google_verification });
  if (global?.bing_verification) meta.push({ name: "msvalidate.01", content: global.bing_verification });
  if (global?.yandex_verification) meta.push({ name: "yandex-verification", content: global.yandex_verification });
  if (global?.baidu_verification) meta.push({ name: "baidu-site-verification", content: global.baidu_verification });
  meta.push(
    { property: "og:title", content: seo.ogTitle },
    { property: "og:description", content: seo.ogDescription },
    { property: "og:type", content: seo.ogType }
  );
  if (seo.ogImage) meta.push({ property: "og:image", content: seo.ogImage });
  if (seo.canonical) meta.push({ property: "og:url", content: seo.canonical });
  meta.push({ name: "twitter:card", content: seo.twitterCard });
  meta.push({ name: "twitter:title", content: seo.twitterTitle });
  meta.push({ name: "twitter:description", content: seo.twitterDescription });
  if (seo.twitterImage) meta.push({ name: "twitter:image", content: seo.twitterImage });
  if (global?.twitter_site) meta.push({ name: "twitter:site", content: global.twitter_site });
  if (global?.twitter_creator) meta.push({ name: "twitter:creator", content: global.twitter_creator });
  if (global?.facebook_app_id) meta.push({ property: "fb:app_id", content: global.facebook_app_id });
  return meta;
}
function buildHeadLinks(seo) {
  if (!seo.canonical) return [];
  return [{ rel: "canonical", href: seo.canonical }];
}
function buildJsonLdScripts(jsonLd) {
  if (!jsonLd) return [];
  return [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }];
}
function createSeoRouteHead(seo, global) {
  return {
    meta: buildHeadMeta(seo, global),
    links: buildHeadLinks(seo),
    scripts: buildJsonLdScripts(seo.jsonLd)
  };
}
function seoFallback(label, description) {
  return {
    title: label,
    description: description ?? `${label} on our community platform.`,
    ogTitle: label,
    ogDescription: description ?? `${label} on our community platform.`
  };
}
async function loadGlobal() {
  const {
    data,
    error
  } = await supabaseAdmin.from("seo_global").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
async function loadPages() {
  const {
    data,
    error
  } = await supabaseAdmin.from("seo_settings").select("*").order("label").order("page_key");
  if (error) throw new Error(error.message);
  return data ?? [];
}
const globalSchema = objectType({
  site_name: stringType().max(120).nullable().optional(),
  site_tagline: stringType().max(300).nullable().optional(),
  default_title: stringType().max(120).nullable().optional(),
  default_description: stringType().max(500).nullable().optional(),
  default_keywords: stringType().max(500).nullable().optional(),
  canonical_domain: stringType().max(200).nullable().optional(),
  robots: stringType().max(80).nullable().optional(),
  theme_color: stringType().max(20).nullable().optional(),
  author: stringType().max(120).nullable().optional(),
  language: stringType().max(12).nullable().optional(),
  default_og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional(),
  twitter_site: stringType().max(80).nullable().optional(),
  twitter_creator: stringType().max(80).nullable().optional(),
  facebook_app_id: stringType().max(40).nullable().optional(),
  google_verification: stringType().max(120).nullable().optional(),
  bing_verification: stringType().max(120).nullable().optional(),
  yandex_verification: stringType().max(120).nullable().optional(),
  baidu_verification: stringType().max(120).nullable().optional()
});
const pageSchema$1 = objectType({
  page_key: stringType().min(1).max(80),
  route_path: stringType().max(200).nullable().optional(),
  label: stringType().max(120).nullable().optional(),
  enabled: booleanType().optional(),
  title: stringType().max(120).nullable().optional(),
  description: stringType().max(500).nullable().optional(),
  keywords: stringType().max(500).nullable().optional(),
  canonical_url: stringType().max(500).nullable().optional(),
  og_title: stringType().max(120).nullable().optional(),
  og_description: stringType().max(500).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional(),
  twitter_title: stringType().max(120).nullable().optional(),
  twitter_description: stringType().max(500).nullable().optional(),
  twitter_image: stringType().max(500).nullable().optional(),
  robots: stringType().max(80).nullable().optional(),
  json_ld: recordType(unionType([stringType(), numberType(), booleanType(), nullType()])).nullable().optional(),
  sitemap_priority: numberType().min(0).max(1).nullable().optional(),
  sitemap_changefreq: stringType().max(20).nullable().optional(),
  sitemap_exclude: booleanType().optional(),
  noindex: booleanType().optional(),
  nofollow: booleanType().optional(),
  is_dynamic: booleanType().optional()
});
const getSeoManagerState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.read")]).handler(createSsrRpc("d4f043ae2bae1e1c5d64d642dae2a1a50f1324fa30664816663b99571d0b9273"));
const syncSeoRoutes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("cae8cf0592ed74179d08a1c15f4fe008adfedcc57a668612f90f57f2dac24397"));
const upsertSeoGlobal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => globalSchema.parse(input)).handler(createSsrRpc("3da852e36fd8679dbf791b761d0223ea984bb4634eb8fe689af166bdb47ed5b0"));
const upsertSeoPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => pageSchema$1.parse(input)).handler(createSsrRpc("d3fbc3c38eae1a113befecb843e3b35df67c53fcb7eae10955fdd59f44947fdb"));
const getPublicSeoGlobal = createServerFn({
  method: "GET"
}).handler(createSsrRpc("057107a16154625217fb17f4a99066fb28501f65e826827aacff4360cfe96d0d"));
const getPublicSeoForPath = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  routePath: stringType()
}).parse(input)).handler(createSsrRpc("d298245276cf4685cce59f087db7ceb6d3e7f79bf9b571300da7b5f7cc309330"));
async function buildPublicSitemapXml() {
  const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
  return buildSitemapXml(staticSitemapEntries(pages, global));
}
async function buildPublicRobotsTxt() {
  const global = await loadGlobal();
  const {
    siteOrigin
  } = await import("./sitemap-Dl8Aqg_O.mjs").then((n) => n.c);
  return buildRobotsTxt(siteOrigin(global), global);
}
createServerFn({
  method: "GET"
}).handler(createSsrRpc("d26328e6ea7fc3a67aa5e8c7fa807565a02abca187435011918b129469deab8a"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("10dbeb1283fb76c8e0ca8d3551fcc62033e9c26ba38d60921827b0deb613ecf6"));
const bulkSeoAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  action: enumType(["regenerate", "keywords", "descriptions", "og", "sitemap"]),
  pageKeys: arrayType(stringType()).optional()
}).parse(input)).handler(createSsrRpc("837235bd73d4681b6805fcb18718f242f55991f28b3a1249914900c581704891"));
const aiGenerateSeoField = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  pageKey: stringType(),
  field: enumType(["title", "description", "keywords", "og", "json_ld"]),
  context: stringType().optional()
}).parse(input)).handler(createSsrRpc("98d71ad3953702bd8d0692b9089988403278853af9b953bb54faaf91ee50fab8"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.read")]).handler(createSsrRpc("295eb0929d821b3073eb4274063ec8e58b419ef8db80b8be3f9f496509c0eac3"));
async function loadRouteSeo(routePath, fallbackLabel, fallbackDescription) {
  try {
    const data = await getPublicSeoForPath({ data: { routePath } });
    return { seo: data.resolved, global: data.global };
  } catch {
    const global = null;
    return {
      global,
      seo: resolvePageSeo(null, global, {
        routePath,
        fallback: seoFallback(fallbackLabel, fallbackDescription)
      })
    };
  }
}
function headFromRouteSeo(loaderData) {
  if (!loaderData?.seo) {
    return createSeoRouteHead(
      resolvePageSeo(null, null, { routePath: "/", fallback: seoFallback("App") })
    );
  }
  return createSeoRouteHead(loaderData.seo, loaderData.global);
}
const checkUsernameAvailable = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => {
  if (!input || typeof input.username !== "string") throw new Error("Invalid username");
  const v = input.username.trim();
  if (v.length < 1 || v.length > 32) throw new Error("Invalid username");
  const excludeUserId = typeof input.excludeUserId === "string" && /^[0-9a-f-]{36}$/i.test(input.excludeUserId) ? input.excludeUserId : void 0;
  return {
    username: v,
    excludeUserId
  };
}).handler(createSsrRpc("cc9df207272b849fa07266ae389d8eeba88f9cb39ba8bd5ea6597564eefd524f"));
const loginWithIdentifier = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => {
  if (!input || typeof input.identifier !== "string" || typeof input.password !== "string") {
    throw new Error("Invalid credentials");
  }
  const identifier = input.identifier.trim();
  const password = input.password;
  if (identifier.length < 2 || identifier.length > 255) throw new Error("Invalid credentials");
  if (password.length < 1 || password.length > 256) throw new Error("Invalid credentials");
  return {
    identifier,
    password
  };
}).handler(createSsrRpc("5d3b602a34eb6d952cf9cf80461fd4c1c11f9692ecc9b491fe127e76626b2a33"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).handler(createSsrRpc("1c56176887768d9891b3728da62aa71439be01e6c8ae1036a88a835c12be3175"));
createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).handler(createSsrRpc("7ea6da22137390aa84848285aebdd04758001e4f38880c63ea02a67c0adffb01"));
const deleteDemoAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).handler(createSsrRpc("99aab36e2ba5d7f93a6983476a5c7a80f5e9a9df8f8cbf6775d12e52a1ec0eec"));
const FpSchema = objectType({
  fingerprint: stringType().regex(/^[a-f0-9]{64}$/, "Invalid fingerprint")
});
const checkDeviceBan = createServerFn({
  method: "POST"
}).middleware([withRateLimit("auth.write")]).inputValidator((input) => FpSchema.parse(input)).handler(createSsrRpc("8a827e5716391d30b064ae17c999d22cf29bdbe0c437b36fab90afa6c8e51db2"));
const recordDevice = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("auth.write")]).inputValidator((input) => FpSchema.extend({
  user_agent: stringType().max(500).optional()
}).parse(input)).handler(createSsrRpc("7a711031e1e5afefdffd3a137f39b9950378b00615c6d03a5403f2f14a7d3fa9"));
const STORAGE_KEY$1 = "lovable:device-fp";
function canvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return "no-canvas";
    ctx2.textBaseline = "top";
    ctx2.font = "16px 'Arial'";
    ctx2.fillStyle = "#f60";
    ctx2.fillRect(0, 0, 100, 30);
    ctx2.fillStyle = "#069";
    ctx2.fillText("lovable-fp-7✨", 4, 4);
    ctx2.strokeStyle = "rgba(102,200,0,0.7)";
    ctx2.beginPath();
    ctx2.arc(40, 30, 18, 0, Math.PI * 2, true);
    ctx2.stroke();
    return canvas.toDataURL();
  } catch {
    return "canvas-error";
  }
}
async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function getDeviceFingerprint() {
  if (typeof window === "undefined") return "";
  try {
    const cached2 = window.localStorage.getItem(STORAGE_KEY$1);
    if (cached2 && cached2.length === 64) return cached2;
  } catch {
  }
  const nav = window.navigator;
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    nav.platform ?? "",
    nav.hardwareConcurrency ?? "",
    nav.deviceMemory ?? "",
    screenInfo,
    tz,
    (/* @__PURE__ */ new Date()).getTimezoneOffset(),
    canvasFingerprint()
  ].join("|");
  const hash = await sha256(parts);
  try {
    window.localStorage.setItem(STORAGE_KEY$1, hash);
  } catch {
  }
  return hash;
}
const SIGNUP_ACCESS_DEFAULTS = {
  signupEnabled: true,
  guestEnabled: true,
  disabledMessage: "New sign-ups are temporarily disabled. Please check back later."
};
async function loadSignupAccess() {
  try {
    const { data } = await supabase.from("app_settings").select("value").eq("key", "signup_access").maybeSingle();
    const v = data?.value ?? {};
    return { ...SIGNUP_ACCESS_DEFAULTS, ...v };
  } catch {
    return SIGNUP_ACCESS_DEFAULTS;
  }
}
const AuthCtx = reactExports.createContext(null);
function usernameCacheKey(userId) {
  return `palrgo:profile-username:${userId}`;
}
function getCachedUsername(userId) {
  try {
    return localStorage.getItem(usernameCacheKey(userId));
  } catch {
    return null;
  }
}
function cacheUsername(userId, username) {
  try {
    localStorage.setItem(usernameCacheKey(userId), username);
  } catch {
  }
}
async function fetchUsername(userId, fallbackEmail) {
  for (let i = 0; i < 8; i++) {
    const { data } = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle();
    if (data?.username) {
      cacheUsername(userId, data.username);
      return data.username;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return fallbackEmail?.split("@")[0] || "user";
}
async function flushPendingAvatar(userId, email) {
  if (!email) return;
  const key = `pending-avatar:${email.toLowerCase()}`;
  let dataUrl = null;
  try {
    dataUrl = sessionStorage.getItem(key);
  } catch {
    return;
  }
  if (!dataUrl) return;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "") || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("avatars").upload(path, blob, { contentType: blob.type, upsert: true });
    if (up.error) throw up.error;
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", userId);
    try {
      sessionStorage.removeItem(key);
    } catch {
    }
  } catch (e) {
    console.error("avatar upload failed", e);
  }
}
async function publishWelcomePost(userId, email) {
  if (!email) return;
  const key = `pending-welcome:${email.toLowerCase()}`;
  let flag = null;
  try {
    flag = sessionStorage.getItem(key);
  } catch {
    return;
  }
  if (!flag) return;
  try {
    const { data: prof } = await supabase.from("profiles").select("username, gender, avatar_url").eq("id", userId).maybeSingle();
    if (!prof) return;
    const pronoun = prof.gender === "male" ? "him" : prof.gender === "female" ? "her" : "them";
    const text = `👋 ${prof.username} just signed up! Start a chat with ${pronoun} in the chatroom.`;
    const media = prof.avatar_url ? [prof.avatar_url] : [];
    const { error } = await supabase.from("posts").insert({
      author_id: userId,
      owner_id: userId,
      kind: "text",
      text,
      slug: `welcome-${prof.username}`.toLowerCase(),
      media_urls: media,
      privacy: "public"
    });
    if (error) throw error;
    try {
      sessionStorage.removeItem(key);
    } catch {
    }
  } catch (e) {
    console.error("welcome post failed", e);
  }
}
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    let lastUid = null;
    let isReady = false;
    function userFromSession(session) {
      const u = session.user;
      const meta = u.user_metadata ?? {};
      const isDemo = meta.is_demo === true;
      const placeholder = getCachedUsername(u.id) || meta.username?.trim() || u.email?.split("@")[0] || "user";
      return { id: u.id, email: u.email ?? "", username: placeholder, isGuest: false, isDemo };
    }
    function hydrateProfileBackground(session) {
      const u = session.user;
      const email = u.email ?? void 0;
      void flushPendingAvatar(u.id, email).then(() => publishWelcomePost(u.id, email));
      void Promise.resolve().then(() => soundPrefs).then((m) => m.hydrateSoundPrefsFromServer());
      void (async () => {
        try {
          const fp = await getDeviceFingerprint();
          if (fp) await recordDevice({ data: { fingerprint: fp, user_agent: navigator.userAgent.slice(0, 500) } });
        } catch (e) {
          console.warn("device record failed", e);
        }
      })();
      void (async () => {
        try {
          const username = await fetchUsername(u.id, email);
          if (cancelled) return;
          setUser((prev) => prev && prev.id === u.id && prev.username !== username ? { ...prev, username } : prev);
        } catch (e) {
          console.warn("username hydrate failed", e);
        }
      })();
    }
    function applySession(session) {
      if (cancelled) return;
      const uid2 = session?.user?.id ?? null;
      if (!session) {
        if (lastUid !== null) {
          lastUid = null;
          setUser(null);
        }
        return;
      }
      if (uid2 === lastUid) return;
      lastUid = uid2;
      setUser(userFromSession(session));
      hydrateProfileBackground(session);
    }
    function markReady() {
      if (cancelled || isReady) return;
      isReady = true;
      window.clearTimeout(readyTimer);
      setReady(true);
    }
    const readyTimer = window.setTimeout(markReady, 3e3);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      markReady();
    });
    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    }).catch((e) => {
      console.warn("getSession failed", e);
    }).finally(() => {
      markReady();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(readyTimer);
      subscription.unsubscribe();
    };
  }, []);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    const uid2 = user.id;
    const refetch = async () => {
      const { data } = await supabase.from("profiles").select("username").eq("id", uid2).maybeSingle();
      const next = data?.username;
      if (!next) return;
      cacheUsername(uid2, next);
      setUser((prev) => prev && prev.id === uid2 && prev.username !== next ? { ...prev, username: next } : prev);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id]);
  reactExports.useEffect(() => {
    if (!user?.isDemo) return;
    const onExit = () => {
      supabase.auth.getSession().then(({ data }) => {
        const token = data.session?.access_token;
        if (!token) return;
        const body = new Blob([JSON.stringify({ access_token: token })], { type: "application/json" });
        try {
          if (navigator.sendBeacon) navigator.sendBeacon("/api/public/demo-cleanup", body);
          else fetch("/api/public/demo-cleanup", { method: "POST", body, keepalive: true });
        } catch {
        }
      });
    };
    window.addEventListener("pagehide", onExit);
    return () => window.removeEventListener("pagehide", onExit);
  }, [user?.isDemo]);
  const login = reactExports.useCallback(async (identifier, password) => {
    const id = identifier.trim();
    try {
      const fp = await getDeviceFingerprint();
      if (fp) {
        const check = await checkDeviceBan({ data: { fingerprint: fp } });
        if (check.banned) {
          throw new Error(check.reason ? `This device has been banned: ${check.reason}` : "This device has been banned from the platform.");
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("This device")) throw e;
    }
    const res = await loginWithIdentifier({ data: { identifier: id, password } });
    const { error } = await supabase.auth.setSession({
      access_token: res.access_token,
      refresh_token: res.refresh_token
    });
    if (error) throw new Error(error.message);
  }, []);
  const signup = reactExports.useCallback(async (email, password, username, gender, extras) => {
    email = email.trim();
    username = username.trim();
    const cfg = await loadSignupAccess();
    if (!cfg.signupEnabled) throw new Error(cfg.disabledMessage || "New sign-ups are temporarily disabled.");
    const letterCount = username.replace(/[^a-zA-Z]/g, "").length;
    if (letterCount < 2 || letterCount > 10) throw new Error("Username must contain 2 to 10 letters.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    if (!["male", "female", "other"].includes(gender)) throw new Error("Please select a gender");
    try {
      const fp = await getDeviceFingerprint();
      if (fp) {
        const check = await checkDeviceBan({ data: { fingerprint: fp } });
        if (check.banned) {
          throw new Error(check.reason ? `This device has been banned: ${check.reason}` : "This device has been banned from the platform.");
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("This device")) throw e;
    }
    const meta = { username, gender };
    if (extras?.birthday) meta.birthday = extras.birthday;
    if (extras?.hide_birth_year != null) meta.hide_birth_year = extras.hide_birth_year ? "true" : "false";
    if (extras?.country_code) meta.country_code = extras.country_code.toUpperCase();
    if (extras?.phone) {
      const trimmed = extras.phone.trim();
      if (trimmed && !/^\+?[0-9 .\-()]{6,20}$/.test(trimmed)) {
        throw new Error("Please enter a valid phone number.");
      }
      if (trimmed) meta.phone = trimmed;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: meta
      }
    });
    if (error) throw new Error(error.message);
  }, []);
  const loginWithGoogle = reactExports.useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) throw new Error(error.message || "Google sign-in failed");
  }, []);
  const logout = reactExports.useCallback(async () => {
    let wasDemo = false;
    try {
      const { data } = await supabase.auth.getSession();
      const meta = data.session?.user?.user_metadata ?? {};
      wasDemo = Boolean(meta.is_demo);
    } catch {
    }
    try {
      const endFn = window.__lovableEndMyLudoGames;
      if (typeof endFn === "function") await endFn();
    } catch (e) {
      console.error("end-ludo-on-logout failed", e);
    }
    if (wasDemo) {
      try {
        await deleteDemoAccount();
      } catch (e) {
        console.error("Demo cleanup failed", e);
      }
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);
  const refreshUsername = reactExports.useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (!u) return;
    const { data: prof } = await supabase.from("profiles").select("username").eq("id", u.id).maybeSingle();
    const next = prof?.username;
    if (!next) return;
    cacheUsername(u.id, next);
    setUser((prev) => prev ? { ...prev, username: next } : prev);
  }, []);
  const value = reactExports.useMemo(() => ({ user, ready, login, signup, loginWithGoogle, logout, refreshUsername }), [user, ready, login, signup, loginWithGoogle, logout, refreshUsername]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthCtx.Provider, { value, children });
}
function useAuth() {
  const ctx2 = reactExports.useContext(AuthCtx);
  if (!ctx2) throw new Error("useAuth must be inside AuthProvider");
  return ctx2;
}
const DEFAULTS$2 = {
  layoutPriority: "chatrooms_first",
  modules: {
    wallet: true,
    gif: true,
    badges: true,
    games: true,
    feed: true,
    reactions: true,
    voice: false,
    ai: true,
    emojis: true,
    streaks: true,
    referrals: false,
    notifications: true,
    competitionMemes: true,
    nomineeMemeTagging: true,
    trendingMemeSection: true,
    funZone: true,
    funZoneMemes: true,
    funZoneFanArts: true,
    funZonePosters: true,
    funZoneFanEdits: true,
    battleRecap: true,
    autoAwards: true,
    smartQualification: true,
    smartQualificationApproval: false,
    smartQualificationLive: true
  }
};
const Ctx$1 = reactExports.createContext(null);
function AppSettingsProvider({ children }) {
  const [raw, setRaw] = reactExports.useState({});
  const [ready, setReady] = reactExports.useState(false);
  const load2 = async () => {
    const { data } = await supabase.from("app_settings").select("key,value");
    const map = {};
    for (const row of data ?? []) map[row.key] = row.value;
    setRaw(map);
    setReady(true);
  };
  reactExports.useEffect(() => {
    load2();
    const channel = supabase.channel(`app_settings_changes:${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => load2()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const value = reactExports.useMemo(() => {
    const lp = raw.layout_priority || DEFAULTS$2.layoutPriority;
    const modules = { ...DEFAULTS$2.modules, ...raw.modules || {} };
    return { layoutPriority: lp, modules, raw, ready, refresh: load2 };
  }, [raw, ready]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx$1.Provider, { value, children });
}
const FALLBACK = {
  layoutPriority: DEFAULTS$2.layoutPriority,
  modules: DEFAULTS$2.modules,
  raw: {},
  ready: false,
  refresh: async () => {
  }
};
function useAppSettings() {
  const ctx2 = reactExports.useContext(Ctx$1);
  return ctx2 ?? FALLBACK;
}
const BRAND_DEFAULTS = {
  name: "Community",
  shortName: "Community",
  tagline: "Chat rooms, DMs, games and more.",
  company: "Community",
  supportEmail: "support@example.com",
  supportUrl: "",
  privacyUrl: "/p/privacy",
  termsUrl: "/p/terms",
  copyright: `© ${(/* @__PURE__ */ new Date()).getFullYear()} Community`,
  footerText: "",
  themeColor: "#3B82F6",
  accentColor: "#3B82F6",
  metaTitle: "Chat rooms & community",
  metaDescription: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands.",
  metaKeywords: "chatroom, community, dm, games",
  ogImage: "",
  placeholderImage: "",
  appleTouchIcon: "/apple-touch-icon.png",
  favicon: "/favicon-blue.png",
  logo: "",
  logoLight: "",
  logoDark: "",
  senderName: "Community",
  replyTo: "",
  defaultLanguage: "en",
  timezone: "UTC",
  currency: "USD",
  assistantName: "Assistant",
  raw: {}
};
function resolvedTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function buildBrand(brandingRaw, whitelabelRaw, generalRaw, theme) {
  const bAssets = brandingRaw ?? {};
  const wl = whitelabelRaw ?? {};
  const gen = generalRaw ?? {};
  const t = theme ?? resolvedTheme();
  const logoLight = bAssets.logo_light || "";
  const logoDark = bAssets.logo_dark || "";
  const favicon = (t === "dark" ? bAssets.favicon_dark : bAssets.favicon_light) || bAssets.favicon_light || bAssets.favicon_dark || BRAND_DEFAULTS.favicon;
  const logo = (t === "dark" ? logoDark : logoLight) || logoLight || logoDark || BRAND_DEFAULTS.logo;
  const merged = {
    ...BRAND_DEFAULTS,
    ...gen.site_name ? { name: gen.site_name, shortName: gen.site_name, company: gen.site_name } : {},
    ...gen.site_tagline ? { tagline: gen.site_tagline } : {},
    ...gen.site_description ? { metaDescription: gen.site_description } : {},
    ...wl,
    favicon,
    logo,
    logoLight,
    logoDark,
    raw: bAssets
  };
  if (!merged.senderName) merged.senderName = merged.name;
  if (!merged.shortName) merged.shortName = merged.name;
  if (!merged.metaTitle) merged.metaTitle = `${merged.name} — ${merged.tagline}`;
  if (!merged.metaDescription) merged.metaDescription = merged.tagline;
  if (!merged.copyright) merged.copyright = `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${merged.company || merged.name}`;
  return merged;
}
function useBrand() {
  const { raw } = useAppSettings();
  return reactExports.useMemo(
    () => buildBrand(raw?.branding, raw?.whitelabel, raw?.general),
    [raw?.branding, raw?.whitelabel, raw?.general]
  );
}
function useUsernameCheck(username, excludeUserId) {
  const [status, setStatus] = reactExports.useState({ state: "idle" });
  reactExports.useEffect(() => {
    const name = username.trim();
    if (!name) {
      setStatus({ state: "idle" });
      return;
    }
    setStatus({ state: "checking" });
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable({ data: { username: name, excludeUserId } });
        if (cancelled) return;
        if (res.available) setStatus({ state: "ok" });
        else setStatus({ state: "error", message: res.reason || "Not available" });
      } catch (e) {
        if (cancelled) return;
        setStatus({ state: "error", message: e instanceof Error ? e.message : "Check failed" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [username, excludeUserId]);
  return status;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Dialog = Dialog$1;
const DialogTrigger = DialogTrigger$1;
const DialogPortal = DialogPortal$1;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogOverlay$1,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogOverlay$1.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogClose, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogContent$1.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogTitle$1,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogTitle$1.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogDescription$1,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogDescription$1.displayName;
function PasswordStrength({ value }) {
  const { score, label, hint, color } = reactExports.useMemo(() => evaluate(value), [value]);
  if (!value) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: 'At least 6 characters — any simple password works (e.g. "hello123").' });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", "aria-hidden": "true", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-1 flex-1 rounded-full bg-muted transition-colors",
        style: i < score ? { background: color } : void 0
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: { color }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: hint })
    ] })
  ] });
}
function evaluate(pw) {
  const len = pw.length;
  const variety = (/[a-z]/.test(pw) ? 1 : 0) + (/[A-Z]/.test(pw) ? 1 : 0) + (/\d/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  let score = 0;
  if (len >= 6) score = 1;
  if (len >= 8 && variety >= 2) score = 2;
  if (len >= 10 && variety >= 3) score = 3;
  if (len >= 12 && variety >= 3) score = 4;
  if (len < 6) {
    return { score: 0, label: "Too short", color: "#ef4444", hint: `${6 - len} more to go` };
  }
  const tips = [
    { label: "Weak", color: "#f97316", hint: "Good enough — add a number for more safety" },
    { label: "Okay", color: "#eab308", hint: "Try mixing letters and numbers" },
    { label: "Good", color: "#22c55e", hint: "Nice mix" },
    { label: "Strong", color: "#16a34a", hint: "Excellent password" }
  ];
  const t = tips[score - 1] ?? tips[0];
  return { score, ...t };
}
function FeedbackShowcase({
  surface,
  className = ""
}) {
  const [data, setData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancel = false;
    fetch(`/api/public/feedback-showcase?surface=${surface}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!cancel) setData(d);
    }).catch(() => {
      if (!cancel) setData(null);
    });
    return () => {
      cancel = true;
    };
  }, [surface]);
  if (!data || !data.enabled || data.items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `w-full ${className}`, "aria-label": "Community feedback", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold tracking-tight", children: data.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: data.items.map((item) => {
      const Cat = CATEGORY_META[item.category] ?? CATEGORY_META.other;
      const St = STATUS_META[item.status] ?? STATUS_META.open;
      const initial = (item.author.username || "?").trim().charAt(0).toUpperCase();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "article",
        {
          className: "rounded-2xl border border-border bg-card p-3 text-left shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-10 w-8 flex-col items-center justify-center rounded-md border border-border bg-background", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold tabular-nums", children: item.upvote_count })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "line-clamp-1 text-sm font-semibold", children: item.title }),
                item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground", children: item.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex flex-wrap items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] ${Cat.tone}`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Cat.icon, { className: "h-3 w-3" }),
                    " ",
                    Cat.label
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] ${St.tone}`, children: St.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
                    " ",
                    item.comment_count
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-2 flex items-center gap-2 border-t border-border/60 pt-2", children: [
              item.author.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: item.author.avatar_url,
                  alt: "",
                  className: "h-5 w-5 rounded-full object-cover"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary", children: initial }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: item.author.anonymous ? "Anonymous member" : `@${item.author.username}` })
            ] })
          ]
        },
        item.id
      );
    }) })
  ] });
}
function useReducedMotion() {
  const [reduced, setReduced] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}
function Avatar({ author }) {
  const initial = (author.username || "?").trim().charAt(0).toUpperCase();
  if (author.avatar_url) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar_url, alt: "", className: "h-7 w-7 rounded-full object-cover ring-1 ring-white/20" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white ring-1 ring-white/20",
      style: { background: author.avatar_color || "var(--primary)" },
      children: initial
    }
  );
}
function StatChip({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: Intl.NumberFormat().format(value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/60", children: label })
  ] });
}
function LiveCommunityBackground({ blur = true, children }) {
  const [data, setData] = reactExports.useState(null);
  const reduced = useReducedMotion();
  reactExports.useEffect(() => {
    let cancel = false;
    let timer;
    const load2 = async () => {
      try {
        const res = await fetch("/api/public/community-bg", { credentials: "omit" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancel) setData(json);
      } catch {
      }
    };
    load2();
    timer = window.setInterval(load2, 3e4);
    return () => {
      cancel = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);
  const enabled = !!data?.enabled;
  const cfg = data?.config;
  const stats = data?.stats;
  const posts = data?.posts ?? [];
  const messages = data?.messages ?? [];
  const postLoop = reactExports.useMemo(() => posts.length ? [...posts, ...posts] : [], [posts]);
  const chatLoop = reactExports.useMemo(() => messages.length ? [...messages, ...messages] : [], [messages]);
  const useBlur = blur && (cfg?.blur ?? true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 select-none", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl",
          style: { background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 60%, transparent), transparent)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl",
          style: { background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent, var(--primary)) 55%, transparent), transparent)" }
        }
      ),
      enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cfg?.showChat && chatLoop.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-40 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex w-max gap-3 px-6 pt-6",
            style: reduced ? void 0 : { animation: "auth-bg-marquee 70s linear infinite" },
            children: chatLoop.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex max-w-[280px] items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { author: m.author }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] font-semibold text-white/80", children: [
                      "@",
                      m.author.username
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 text-[12px] text-white/70", children: m.text || "…" })
                  ] })
                ]
              },
              `${m.id}-${i}`
            ))
          }
        ) }) }),
        cfg?.showFeed && postLoop.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-56 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex w-max gap-3 px-6 pb-6",
            style: reduced ? void 0 : { animation: "auth-bg-marquee-rev 90s linear infinite" },
            children: postLoop.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "article",
              {
                className: "flex w-[260px] flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { author: p.author }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-[11px] font-semibold text-white/85", children: [
                      "@",
                      p.author.username
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-4 text-[12px] leading-snug text-white/75", children: p.text || (p.has_media ? "📷 shared a photo" : "shared an update") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "flex items-center gap-3 text-[10px] text-white/60", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
                      " ",
                      p.reaction_count
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3" }),
                      " ",
                      p.comment_count
                    ] })
                  ] })
                ]
              },
              `${p.id}-${i}`
            ))
          }
        ) }) }),
        cfg?.showStats && stats && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-4 flex justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden flex-wrap items-center justify-center gap-2 sm:flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: Users, label: "online", value: stats.online }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: Sparkles, label: "members", value: stats.members }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: MessageCircle, label: "posts today", value: stats.postsToday }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatChip, { icon: Radio, label: "active rooms", value: stats.activeRooms })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/85" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative z-10 grid min-h-screen place-items-center p-4 ${useBlur ? "[--auth-card-blur:24px]" : "[--auth-card-blur:0px]"}`, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes auth-bg-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes auth-bg-marquee-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      ` })
  ] });
}
function UsernameHint({ status }) {
  if (status.state === "idle") return null;
  if (status.state === "checking") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Checking…" });
  if (status.state === "ok") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] font-semibold text-primary", children: "✓ Available" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] font-semibold text-destructive", children: status.message });
}
function AuthDialogs({
  popup,
  setPopup,
  signupEnabled = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SignInDialog,
      {
        open: popup === "signin",
        onOpenChange: (v) => setPopup(v ? "signin" : null),
        onForgot: () => setPopup("forgot"),
        onSwitchSignup: () => signupEnabled && setPopup("signup")
      }
    ),
    signupEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SignUpDialog,
      {
        open: popup === "signup",
        onOpenChange: (v) => setPopup(v ? "signup" : null),
        onSwitchSignin: () => setPopup("signin")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ForgotDialog,
      {
        open: popup === "forgot",
        onOpenChange: (v) => setPopup(v ? "forgot" : null),
        onBack: () => setPopup("signin")
      }
    )
  ] });
}
function AuthScreen() {
  const brand = useBrand();
  const [popup, setPopup] = reactExports.useState(null);
  const [signupCfg, setSignupCfg] = reactExports.useState(SIGNUP_ACCESS_DEFAULTS);
  reactExports.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await supabase.from("app_settings").select("value").eq("key", "signup_access").maybeSingle();
        if (cancel) return;
        const signup = data?.value ?? {};
        setSignupCfg({ ...SIGNUP_ACCESS_DEFAULTS, ...signup });
      } catch {
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  const signupAvailable = signupCfg.signupEnabled;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(LiveCommunityBackground, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl border border-white/10 bg-card/80 p-8 text-center shadow-2xl supports-[backdrop-filter]:bg-card/60 supports-[backdrop-filter]:backdrop-blur-[var(--auth-card-blur,24px)]",
          style: { boxShadow: "var(--shadow-panel)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl text-3xl font-bold text-primary-foreground", style: { background: "var(--primary)", boxShadow: "var(--shadow-glow)" }, children: "P" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-4 text-2xl font-bold", children: [
              "Welcome to ",
              brand.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Chat, post, and play with friends." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setPopup("signin"),
                  className: "w-full rounded-full px-4 py-3 text-sm font-bold text-primary-foreground",
                  style: { background: "var(--gradient-accent, var(--primary))" },
                  children: "Sign in"
                }
              ),
              signupAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setPopup("signup"),
                  className: "w-full rounded-full border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20",
                  children: "Create account"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground", children: signupCfg.disabledMessage })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackShowcase, { surface: "signup" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthDialogs, { popup, setPopup, signupEnabled: signupAvailable })
  ] });
}
function SignInDialog({ open, onOpenChange, onForgot, onSwitchSignup }) {
  const { login } = useAuth();
  const brand = useBrand();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm rounded-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Sign in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Welcome back to ",
        brand.name,
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Email or username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: email, onChange: (e) => setEmail(e.target.value), maxLength: 255, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "you@example.com or username" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold uppercase text-muted-foreground", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onForgot, className: "text-[10px] font-semibold text-primary hover:underline", children: "Forgot password?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), maxLength: 100, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "••••••" })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive", children: err }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, type: "submit", className: "w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50", style: { background: "var(--gradient-accent, var(--primary))" }, children: busy ? "..." : "Sign in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-xs text-muted-foreground", children: [
      "New here?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSwitchSignup, className: "font-semibold text-primary hover:underline", children: "Create an account" })
    ] })
  ] }) });
}
function SignUpDialog({ open, onOpenChange, onSwitchSignin }) {
  const { signup } = useAuth();
  const brand = useBrand();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [username, setUsername] = reactExports.useState("");
  const [gender, setGender] = reactExports.useState("");
  const [birthday, setBirthday] = reactExports.useState("");
  const [hideYear, setHideYear] = reactExports.useState(false);
  const [country, setCountry] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [avatarDataUrl, setAvatarDataUrl] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const usernameStatus = useUsernameCheck(open ? username : "");
  reactExports.useEffect(() => {
    if (!open || country) return;
    void import("./country-flag-Bsg6nfgK.mjs").then((m) => setCountry(m.detectCountryCode()));
  }, [open, country]);
  function onPickAvatar(file) {
    setErr("");
    if (!file) {
      setAvatarDataUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErr("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setBusy(true);
    try {
      const letterCount = username.trim().replace(/[^a-zA-Z]/g, "").length;
      if (letterCount < 2 || letterCount > 10) throw new Error("Username must contain between 2 and 10 letters.");
      if (!gender) throw new Error("Please select your gender.");
      if (usernameStatus.state === "error") throw new Error(usernameStatus.message);
      if (usernameStatus.state !== "ok") throw new Error("Checking username, please wait…");
      try {
        const k = email.trim().toLowerCase();
        if (avatarDataUrl) sessionStorage.setItem(`pending-avatar:${k}`, avatarDataUrl);
        sessionStorage.setItem(`pending-welcome:${k}`, "1");
      } catch {
      }
      await signup(email, password, username.trim(), gender, {
        birthday: birthday || void 0,
        hide_birth_year: hideYear,
        country_code: country || void 0,
        phone: phone.trim() || void 0
      });
      setInfo("Account created! You're being signed in…");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-sm overflow-y-auto rounded-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Join ",
        brand.name,
        " in a few seconds."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Profile picture (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-input text-[10px] text-muted-foreground", children: avatarDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarDataUrl, alt: "avatar preview", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No image" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex-1 cursor-pointer rounded-full border border-dashed border-border bg-background px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground", children: [
            avatarDataUrl ? "Change image" : "Choose image",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onPickAvatar(e.target.files?.[0] ?? null) })
          ] }),
          avatarDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAvatarDataUrl(""), className: "rounded-full border border-border px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground", children: "Remove" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), maxLength: 100, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "e.g. cool user" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UsernameHint, { status: usernameStatus }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Must contain 2 to 10 letters." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Gender" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["male", "female", "other"].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setGender(g),
            className: `rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${gender === g ? "border-primary bg-primary/15 text-primary" : "border-border bg-input text-foreground hover:bg-accent"}`,
            children: g
          },
          g
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Birthday" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: birthday, onChange: (e) => setBirthday(e.target.value), max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: hideYear, onChange: (e) => setHideYear(e.target.checked), className: "h-3 w-3" }),
            "Hide year publicly"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Country" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: country, onChange: (e) => setCountry(e.target.value.toUpperCase().slice(0, 2)), maxLength: 2, placeholder: "US", className: "w-full rounded-lg bg-input px-3 py-2 text-sm uppercase outline-none focus:ring-1 focus:ring-ring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "2-letter ISO code, optional." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), maxLength: 255, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "you@example.com" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Mobile number (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), maxLength: 20, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "+1 555 123 4567" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Used only if you ever lose access. We never share it." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), maxLength: 100, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "••••••" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordStrength, { value: password })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive", children: err }),
      info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary", children: info }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy || usernameStatus.state !== "ok", type: "submit", className: "w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50", style: { background: "var(--gradient-accent, var(--primary))" }, children: busy ? "..." : "Create account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-xs text-muted-foreground", children: [
      "Already have one?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSwitchSignin, className: "font-semibold text-primary hover:underline", children: "Sign in" })
    ] })
  ] }) });
}
function ForgotDialog({ open, onOpenChange, onBack }) {
  const [email, setEmail] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setBusy(true);
    try {
      const target = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) throw new Error("Enter a valid email address. Username is not supported here.");
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw new Error(error.message);
      setInfo("Reset link sent! Check your inbox.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to send reset link");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm rounded-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reset your password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Enter the email address linked to your account — usernames can't be used here." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), maxLength: 255, required: true, className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring", placeholder: "you@example.com" })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive", children: err }),
      info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-primary/15 px-3 py-2 text-xs text-primary", children: info }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, type: "submit", className: "w-full rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50", style: { background: "var(--gradient-accent, var(--primary))" }, children: busy ? "..." : "Send reset link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onBack, className: "w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground", children: "← Back to sign in" })
    ] })
  ] }) });
}
const AuthGateContext = reactExports.createContext(null);
function AuthGateProvider({ children }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [popup, setPopup] = reactExports.useState(null);
  const pendingRef = reactExports.useRef(null);
  const firedRef = reactExports.useRef(false);
  const runPending = reactExports.useCallback(() => {
    const fn = pendingRef.current;
    pendingRef.current = null;
    if (!fn || firedRef.current) return;
    firedRef.current = true;
    try {
      const result = fn();
      if (result && typeof result.then === "function") {
        result.finally(() => {
          firedRef.current = false;
        });
      } else {
        firedRef.current = false;
      }
    } catch {
      firedRef.current = false;
    }
  }, []);
  reactExports.useEffect(() => {
    if (!isAuthenticated) return;
    if (pendingRef.current) {
      setPopup(null);
      const id = setTimeout(runPending, 0);
      return () => clearTimeout(id);
    }
  }, [isAuthenticated, runPending]);
  const handleSetPopup = reactExports.useCallback((next) => {
    setPopup((prev) => {
      if (prev && !next && !isAuthenticated) {
        pendingRef.current = null;
      }
      return next;
    });
  }, [isAuthenticated]);
  const requireAuth = reactExports.useCallback((action, opts) => {
    if (isAuthenticated) {
      if (action) {
        try {
          const result = action();
          if (result && typeof result.then === "function") {
            void result;
          }
        } catch {
        }
      }
      return true;
    }
    pendingRef.current = action ?? null;
    setPopup(opts?.mode === "signup" ? "signup" : "signin");
    return false;
  }, [isAuthenticated]);
  const openSignIn = reactExports.useCallback(() => {
    pendingRef.current = null;
    setPopup("signin");
  }, []);
  const openSignUp = reactExports.useCallback(() => {
    pendingRef.current = null;
    setPopup("signup");
  }, []);
  const api = reactExports.useMemo(() => ({
    isAuthenticated,
    requireAuth,
    openSignIn,
    openSignUp
  }), [isAuthenticated, requireAuth, openSignIn, openSignUp]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthGateContext.Provider, { value: api, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthDialogs, { popup, setPopup: handleSetPopup })
  ] });
}
function useAuthGate() {
  const ctx2 = reactExports.useContext(AuthGateContext);
  if (!ctx2) {
    return {
      isAuthenticated: false,
      requireAuth: (action) => {
        action?.();
        return true;
      },
      openSignIn: () => {
      },
      openSignUp: () => {
      }
    };
  }
  return ctx2;
}
function canonicalGameType(key) {
  return key ?? void 0;
}
function getGame(_key) {
  return null;
}
function listGames() {
  return [];
}
const TRIVIA_QUESTIONS = [
  // ===== Geography (60) =====
  { q: "Capital of Japan?", a: "tokyo", choices: ["Kyoto", "Tokyo", "Osaka", "Seoul"] },
  { q: "Capital of France?", a: "paris", choices: ["Lyon", "Paris", "Nice", "Marseille"] },
  { q: "Capital of Australia?", a: "canberra", choices: ["Sydney", "Melbourne", "Canberra", "Perth"] },
  { q: "Capital of Canada?", a: "ottawa", choices: ["Toronto", "Vancouver", "Ottawa", "Montreal"] },
  { q: "Capital of Brazil?", a: "brasilia", choices: ["Rio de Janeiro", "São Paulo", "Brasilia", "Salvador"] },
  { q: "Capital of Egypt?", a: "cairo", choices: ["Alexandria", "Cairo", "Giza", "Luxor"] },
  { q: "Capital of India?", a: "new delhi", choices: ["Mumbai", "Kolkata", "New Delhi", "Chennai"] },
  { q: "Capital of South Korea?", a: "seoul", choices: ["Busan", "Seoul", "Incheon", "Daegu"] },
  { q: "Capital of Russia?", a: "moscow", choices: ["St. Petersburg", "Moscow", "Kazan", "Sochi"] },
  { q: "Capital of Germany?", a: "berlin", choices: ["Munich", "Hamburg", "Berlin", "Frankfurt"] },
  { q: "Capital of Spain?", a: "madrid", choices: ["Barcelona", "Madrid", "Seville", "Valencia"] },
  { q: "Capital of Italy?", a: "rome", choices: ["Milan", "Rome", "Naples", "Turin"] },
  { q: "Capital of Greece?", a: "athens", choices: ["Athens", "Thessaloniki", "Patras", "Sparta"] },
  { q: "Capital of Turkey?", a: "ankara", choices: ["Istanbul", "Ankara", "Izmir", "Bursa"] },
  { q: "Capital of Argentina?", a: "buenos aires", choices: ["Córdoba", "Buenos Aires", "Rosario", "Mendoza"] },
  { q: "Capital of Mexico?", a: "mexico city", choices: ["Guadalajara", "Monterrey", "Mexico City", "Puebla"] },
  { q: "Capital of Thailand?", a: "bangkok", choices: ["Phuket", "Bangkok", "Chiang Mai", "Pattaya"] },
  { q: "Capital of Vietnam?", a: "hanoi", choices: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hue"] },
  { q: "Capital of Indonesia?", a: "jakarta", choices: ["Bali", "Surabaya", "Jakarta", "Bandung"] },
  { q: "Capital of New Zealand?", a: "wellington", choices: ["Auckland", "Wellington", "Christchurch", "Hamilton"] },
  { q: "Capital of South Africa (executive)?", a: "pretoria", choices: ["Cape Town", "Johannesburg", "Pretoria", "Durban"] },
  { q: "Capital of Kenya?", a: "nairobi", choices: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"] },
  { q: "Capital of Nigeria?", a: "abuja", choices: ["Lagos", "Abuja", "Kano", "Ibadan"] },
  { q: "Capital of Morocco?", a: "rabat", choices: ["Casablanca", "Marrakech", "Rabat", "Fez"] },
  { q: "Capital of Saudi Arabia?", a: "riyadh", choices: ["Mecca", "Jeddah", "Riyadh", "Medina"] },
  { q: "Capital of Iran?", a: "tehran", choices: ["Isfahan", "Tehran", "Shiraz", "Tabriz"] },
  { q: "Capital of Pakistan?", a: "islamabad", choices: ["Karachi", "Lahore", "Islamabad", "Peshawar"] },
  { q: "Capital of Bangladesh?", a: "dhaka", choices: ["Chittagong", "Dhaka", "Khulna", "Sylhet"] },
  { q: "Capital of Philippines?", a: "manila", choices: ["Cebu", "Manila", "Davao", "Quezon City"] },
  { q: "Capital of Malaysia?", a: "kuala lumpur", choices: ["Penang", "Kuala Lumpur", "Johor Bahru", "Ipoh"] },
  { q: "Largest country by area?", a: "russia", choices: ["China", "Russia", "USA", "Canada"] },
  { q: "Smallest country in the world?", a: "vatican city", choices: ["Monaco", "Vatican City", "Nauru", "San Marino"] },
  { q: "Longest river in the world?", a: "nile", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"] },
  { q: "Largest desert in the world?", a: "antarctic", choices: ["Sahara", "Gobi", "Antarctic", "Arabian"] },
  { q: "Highest mountain in the world?", a: "everest", choices: ["K2", "Kangchenjunga", "Everest", "Makalu"] },
  { q: "Deepest ocean?", a: "pacific", choices: ["Atlantic", "Indian", "Pacific", "Arctic"] },
  { q: "Largest ocean?", a: "pacific", choices: ["Atlantic", "Indian", "Pacific", "Arctic"] },
  { q: "Smallest continent?", a: "australia", choices: ["Europe", "Australia", "Antarctica", "South America"] },
  { q: "Which country has the most population?", a: "india", choices: ["China", "India", "USA", "Indonesia"] },
  { q: "How many continents are there?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "Which country is shaped like a boot?", a: "italy", choices: ["Spain", "Italy", "Greece", "Portugal"] },
  { q: "What is the largest island in the world?", a: "greenland", choices: ["Australia", "Greenland", "New Guinea", "Borneo"] },
  { q: "Which sea is the saltiest?", a: "dead sea", choices: ["Dead Sea", "Red Sea", "Caspian Sea", "Black Sea"] },
  { q: "Mount Fuji is in which country?", a: "japan", choices: ["China", "Japan", "South Korea", "Taiwan"] },
  { q: "The Eiffel Tower is in which city?", a: "paris", choices: ["London", "Paris", "Berlin", "Rome"] },
  { q: "Big Ben is in which city?", a: "london", choices: ["London", "Manchester", "Edinburgh", "Liverpool"] },
  { q: "The Great Wall is in which country?", a: "china", choices: ["Japan", "China", "Mongolia", "Korea"] },
  { q: "The Taj Mahal is in which country?", a: "india", choices: ["Pakistan", "India", "Bangladesh", "Nepal"] },
  { q: "The Pyramids of Giza are in which country?", a: "egypt", choices: ["Sudan", "Egypt", "Libya", "Israel"] },
  { q: "Which river flows through London?", a: "thames", choices: ["Severn", "Thames", "Mersey", "Tyne"] },
  { q: "Which river flows through Paris?", a: "seine", choices: ["Rhone", "Loire", "Seine", "Garonne"] },
  { q: "Which river flows through Rome?", a: "tiber", choices: ["Po", "Arno", "Tiber", "Adige"] },
  { q: "Which country has the most time zones?", a: "france", choices: ["Russia", "France", "USA", "UK"] },
  { q: "What is the capital of Switzerland?", a: "bern", choices: ["Zurich", "Geneva", "Bern", "Basel"] },
  { q: "Which country uses the yen?", a: "japan", choices: ["China", "Japan", "Korea", "Thailand"] },
  { q: "What is the currency of the UK?", a: "pound", choices: ["Euro", "Pound", "Dollar", "Krone"] },
  { q: "Which country's flag has a red maple leaf?", a: "canada", choices: ["USA", "Canada", "Lebanon", "Mexico"] },
  { q: "What is the capital of Portugal?", a: "lisbon", choices: ["Porto", "Lisbon", "Braga", "Faro"] },
  { q: "What is the capital of Norway?", a: "oslo", choices: ["Bergen", "Oslo", "Trondheim", "Stavanger"] },
  { q: "What is the capital of Sweden?", a: "stockholm", choices: ["Gothenburg", "Stockholm", "Malmö", "Uppsala"] },
  // ===== Science (60) =====
  { q: "Chemical symbol for Gold?", a: "au", choices: ["Au", "Gd", "Go", "Ag"] },
  { q: "Chemical symbol for Silver?", a: "ag", choices: ["Si", "Ag", "Au", "Sv"] },
  { q: "Chemical symbol for Iron?", a: "fe", choices: ["Ir", "In", "Fe", "Fr"] },
  { q: "Chemical symbol for Sodium?", a: "na", choices: ["So", "Na", "Sd", "S"] },
  { q: "Chemical symbol for Potassium?", a: "k", choices: ["P", "Po", "K", "Pt"] },
  { q: "Chemical symbol for Mercury?", a: "hg", choices: ["Me", "My", "Hg", "Mr"] },
  { q: "Chemical symbol for Lead?", a: "pb", choices: ["Ld", "Le", "Pb", "Pl"] },
  { q: "Chemical symbol for Tin?", a: "sn", choices: ["Ti", "Tn", "Sn", "Sm"] },
  { q: "Atomic number of Hydrogen?", a: "1", choices: ["1", "2", "3", "8"] },
  { q: "Atomic number of Oxygen?", a: "8", choices: ["6", "7", "8", "16"] },
  { q: "Atomic number of Carbon?", a: "6", choices: ["4", "6", "8", "12"] },
  { q: "How many bones in the adult human body?", a: "206", choices: ["186", "206", "226", "306"] },
  { q: "How many chambers does the human heart have?", a: "4", choices: ["2", "3", "4", "6"] },
  { q: "Largest organ in the human body?", a: "skin", choices: ["Liver", "Skin", "Brain", "Lungs"] },
  { q: "How many teeth does an adult human typically have?", a: "32", choices: ["28", "30", "32", "36"] },
  { q: "What gas do plants absorb from the atmosphere?", a: "carbon dioxide", choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"] },
  { q: "What gas do humans exhale?", a: "carbon dioxide", choices: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Methane"] },
  { q: "What is the speed of light (approx)?", a: "300,000 km/s", choices: ["30,000 km/s", "300,000 km/s", "3,000,000 km/s", "30,000,000 km/s"] },
  { q: "Largest planet in our solar system?", a: "jupiter", choices: ["Earth", "Mars", "Saturn", "Jupiter"] },
  { q: "Smallest planet in our solar system?", a: "mercury", choices: ["Mercury", "Mars", "Pluto", "Venus"] },
  { q: "Closest planet to the Sun?", a: "mercury", choices: ["Venus", "Earth", "Mercury", "Mars"] },
  { q: "Red planet in our solar system?", a: "mars", choices: ["Venus", "Mars", "Jupiter", "Mercury"] },
  { q: "Which planet has the most moons?", a: "saturn", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"] },
  { q: "How many planets are in our solar system?", a: "8", choices: ["7", "8", "9", "10"] },
  { q: "Which planet is known for its rings?", a: "saturn", choices: ["Mars", "Saturn", "Jupiter", "Neptune"] },
  { q: "Year humans first landed on the Moon?", a: "1969", choices: ["1965", "1969", "1972", "1958"] },
  { q: "What is the hardest natural substance?", a: "diamond", choices: ["Iron", "Quartz", "Diamond", "Granite"] },
  { q: "What is H2O commonly known as?", a: "water", choices: ["Salt", "Water", "Acid", "Alcohol"] },
  { q: "What is the most abundant gas in Earth's atmosphere?", a: "nitrogen", choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"] },
  { q: "Which scientist developed the theory of relativity?", a: "einstein", choices: ["Newton", "Einstein", "Tesla", "Galileo"] },
  { q: "Who discovered penicillin?", a: "fleming", choices: ["Pasteur", "Fleming", "Curie", "Darwin"] },
  { q: "Who proposed the theory of evolution by natural selection?", a: "darwin", choices: ["Darwin", "Mendel", "Wallace", "Lamarck"] },
  { q: "What is the unit of electric current?", a: "ampere", choices: ["Volt", "Watt", "Ampere", "Ohm"] },
  { q: "What is the unit of force?", a: "newton", choices: ["Joule", "Newton", "Pascal", "Watt"] },
  { q: "What is the unit of energy?", a: "joule", choices: ["Watt", "Joule", "Volt", "Newton"] },
  { q: "At what temperature does water boil (°C)?", a: "100", choices: ["90", "95", "100", "110"] },
  { q: "At what temperature does water freeze (°C)?", a: "0", choices: ["-10", "0", "10", "32"] },
  { q: "What is the chemical formula for table salt?", a: "nacl", choices: ["KCl", "NaCl", "CaCl", "NaOH"] },
  { q: "How many colors are in a rainbow?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "What is the largest mammal?", a: "blue whale", choices: ["Elephant", "Blue Whale", "Giraffe", "Hippo"] },
  { q: "What is the fastest land animal?", a: "cheetah", choices: ["Lion", "Cheetah", "Horse", "Gazelle"] },
  { q: "Which animal is known as the King of the Jungle?", a: "lion", choices: ["Tiger", "Lion", "Elephant", "Leopard"] },
  { q: "How many legs does a spider have?", a: "8", choices: ["6", "8", "10", "12"] },
  { q: "How many legs does an insect have?", a: "6", choices: ["4", "6", "8", "10"] },
  { q: "Which bird is known for its colorful tail feathers?", a: "peacock", choices: ["Parrot", "Peacock", "Flamingo", "Swan"] },
  { q: "What do bees produce?", a: "honey", choices: ["Wax", "Honey", "Milk", "Silk"] },
  { q: "What do caterpillars become?", a: "butterflies", choices: ["Bees", "Beetles", "Butterflies", "Moths only"] },
  { q: "What is the largest type of shark?", a: "whale shark", choices: ["Great White", "Whale Shark", "Tiger Shark", "Hammerhead"] },
  { q: "Which dinosaur had three horns?", a: "triceratops", choices: ["T-Rex", "Stegosaurus", "Triceratops", "Velociraptor"] },
  { q: "What part of the cell contains DNA?", a: "nucleus", choices: ["Membrane", "Nucleus", "Cytoplasm", "Mitochondria"] },
  { q: "What is the powerhouse of the cell?", a: "mitochondria", choices: ["Nucleus", "Mitochondria", "Ribosome", "Lysosome"] },
  { q: "What blood type is the universal donor?", a: "o negative", choices: ["A", "AB positive", "O negative", "B negative"] },
  { q: "What vitamin does the sun give us?", a: "vitamin d", choices: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"] },
  { q: "What is the pH of pure water?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "What galaxy do we live in?", a: "milky way", choices: ["Andromeda", "Milky Way", "Triangulum", "Whirlpool"] },
  { q: "What force keeps us on the ground?", a: "gravity", choices: ["Magnetism", "Gravity", "Friction", "Inertia"] },
  { q: "What is the study of plants called?", a: "botany", choices: ["Zoology", "Botany", "Geology", "Biology"] },
  { q: "What is the study of weather called?", a: "meteorology", choices: ["Geology", "Meteorology", "Astronomy", "Ecology"] },
  { q: "What is the study of earthquakes called?", a: "seismology", choices: ["Volcanology", "Seismology", "Geology", "Meteorology"] },
  { q: "Which element is needed for breathing?", a: "oxygen", choices: ["Nitrogen", "Oxygen", "Hydrogen", "Helium"] },
  // ===== History (50) =====
  { q: "Who was the first President of the USA?", a: "george washington", choices: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"] },
  { q: "In what year did WWII end?", a: "1945", choices: ["1942", "1945", "1948", "1939"] },
  { q: "In what year did WWI begin?", a: "1914", choices: ["1912", "1914", "1916", "1918"] },
  { q: "Who painted the Mona Lisa?", a: "da vinci", choices: ["Michelangelo", "Van Gogh", "Da Vinci", "Picasso"] },
  { q: "Who painted the Sistine Chapel ceiling?", a: "michelangelo", choices: ["Raphael", "Michelangelo", "Da Vinci", "Donatello"] },
  { q: "Who was the first man on the Moon?", a: "neil armstrong", choices: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"] },
  { q: "Who was the first woman to fly solo across the Atlantic?", a: "amelia earhart", choices: ["Bessie Coleman", "Amelia Earhart", "Valentina Tereshkova", "Sally Ride"] },
  { q: "Who discovered America in 1492?", a: "columbus", choices: ["Magellan", "Columbus", "Cook", "Vespucci"] },
  { q: "Who invented the telephone?", a: "bell", choices: ["Edison", "Bell", "Tesla", "Marconi"] },
  { q: "Who invented the lightbulb?", a: "edison", choices: ["Edison", "Tesla", "Franklin", "Bell"] },
  { q: "Who wrote the Declaration of Independence?", a: "jefferson", choices: ["Washington", "Adams", "Jefferson", "Franklin"] },
  { q: "Which empire built the Colosseum?", a: "roman", choices: ["Greek", "Roman", "Egyptian", "Persian"] },
  { q: "Which civilization built Machu Picchu?", a: "inca", choices: ["Maya", "Aztec", "Inca", "Olmec"] },
  { q: "Which civilization built the pyramids of Giza?", a: "egyptian", choices: ["Greek", "Egyptian", "Persian", "Roman"] },
  { q: "When did the Berlin Wall fall?", a: "1989", choices: ["1985", "1987", "1989", "1991"] },
  { q: "When did the Titanic sink?", a: "1912", choices: ["1905", "1912", "1918", "1923"] },
  { q: "In which year did the Soviet Union dissolve?", a: "1991", choices: ["1989", "1990", "1991", "1993"] },
  { q: "Who was known as the Iron Lady?", a: "thatcher", choices: ["Merkel", "Thatcher", "May", "Clinton"] },
  { q: "Who wrote 'I Have a Dream' speech?", a: "martin luther king jr.", choices: ["Malcolm X", "Martin Luther King Jr.", "Barack Obama", "Frederick Douglass"] },
  { q: "Who was the first emperor of China?", a: "qin shi huang", choices: ["Kangxi", "Qin Shi Huang", "Han Wu", "Tang Taizong"] },
  { q: "Who was the British PM during most of WWII?", a: "churchill", choices: ["Chamberlain", "Churchill", "Attlee", "Eden"] },
  { q: "What year did the French Revolution begin?", a: "1789", choices: ["1776", "1789", "1799", "1815"] },
  { q: "Who was Napoleon's final defeat at?", a: "waterloo", choices: ["Trafalgar", "Borodino", "Waterloo", "Austerlitz"] },
  { q: "Which queen had the longest reign in UK history?", a: "elizabeth ii", choices: ["Victoria", "Elizabeth II", "Elizabeth I", "Mary I"] },
  { q: "Who painted 'Starry Night'?", a: "van gogh", choices: ["Monet", "Van Gogh", "Cezanne", "Renoir"] },
  { q: "Which ancient wonder was in Alexandria?", a: "lighthouse", choices: ["Pyramid", "Lighthouse", "Colossus", "Gardens"] },
  { q: "Who led India to independence?", a: "gandhi", choices: ["Nehru", "Gandhi", "Bose", "Patel"] },
  { q: "Who was the first female PM of the UK?", a: "thatcher", choices: ["May", "Thatcher", "Truss", "Cameron"] },
  { q: "What year did the Cold War end?", a: "1991", choices: ["1989", "1991", "1995", "1985"] },
  { q: "Which US president ended slavery?", a: "lincoln", choices: ["Washington", "Lincoln", "Jefferson", "Grant"] },
  { q: "What did the Wright Brothers invent?", a: "airplane", choices: ["Car", "Airplane", "Telephone", "Radio"] },
  { q: "Which ship explored on the voyage of Charles Darwin?", a: "hms beagle", choices: ["HMS Endeavour", "HMS Beagle", "HMS Victory", "HMS Bounty"] },
  { q: "Who wrote 'The Communist Manifesto'?", a: "marx", choices: ["Lenin", "Marx", "Stalin", "Engels"] },
  { q: "In which year did India gain independence?", a: "1947", choices: ["1945", "1947", "1950", "1942"] },
  { q: "Which country was first to give women the vote?", a: "new zealand", choices: ["USA", "UK", "New Zealand", "Australia"] },
  { q: "Who was the longest-serving US president?", a: "franklin d. roosevelt", choices: ["Lincoln", "Franklin D. Roosevelt", "Reagan", "Obama"] },
  { q: "Who founded Microsoft?", a: "bill gates", choices: ["Steve Jobs", "Bill Gates", "Larry Page", "Mark Zuckerberg"] },
  { q: "Who founded Apple?", a: "steve jobs", choices: ["Bill Gates", "Steve Jobs", "Elon Musk", "Tim Cook"] },
  { q: "Who founded Facebook?", a: "zuckerberg", choices: ["Jobs", "Musk", "Zuckerberg", "Bezos"] },
  { q: "Who founded Amazon?", a: "bezos", choices: ["Musk", "Bezos", "Gates", "Jobs"] },
  { q: "Who founded SpaceX?", a: "musk", choices: ["Bezos", "Musk", "Branson", "Page"] },
  { q: "Which ship sank in 1912?", a: "titanic", choices: ["Lusitania", "Titanic", "Britannic", "Olympic"] },
  { q: "What was the name of the first artificial satellite?", a: "sputnik", choices: ["Vostok", "Sputnik", "Apollo", "Voyager"] },
  { q: "Who painted 'The Persistence of Memory'?", a: "dali", choices: ["Picasso", "Dali", "Magritte", "Miro"] },
  { q: "Which empire was ruled by Genghis Khan?", a: "mongol", choices: ["Ottoman", "Mongol", "Persian", "Roman"] },
  { q: "What year did the USA declare independence?", a: "1776", choices: ["1763", "1776", "1789", "1812"] },
  { q: "Who assassinated Abraham Lincoln?", a: "john wilkes booth", choices: ["Lee Harvey Oswald", "John Wilkes Booth", "Charles Guiteau", "Leon Czolgosz"] },
  { q: "Where did the D-Day landings take place?", a: "normandy", choices: ["Sicily", "Normandy", "Brittany", "Dunkirk"] },
  { q: "Who was the first Tudor king of England?", a: "henry vii", choices: ["Henry VII", "Henry VIII", "Edward VI", "Richard III"] },
  { q: "What was the capital of the Byzantine Empire?", a: "constantinople", choices: ["Rome", "Constantinople", "Athens", "Antioch"] },
  // ===== Literature & Language (40) =====
  { q: "Who wrote 'Hamlet'?", a: "shakespeare", choices: ["Dickens", "Shakespeare", "Tolkien", "Wilde"] },
  { q: "Who wrote 'Romeo and Juliet'?", a: "shakespeare", choices: ["Shakespeare", "Marlowe", "Chaucer", "Milton"] },
  { q: "Who wrote 'Pride and Prejudice'?", a: "jane austen", choices: ["Bronte", "Jane Austen", "Eliot", "Woolf"] },
  { q: "Who wrote '1984'?", a: "orwell", choices: ["Huxley", "Orwell", "Bradbury", "Asimov"] },
  { q: "Who wrote 'Brave New World'?", a: "huxley", choices: ["Orwell", "Huxley", "Burgess", "Atwood"] },
  { q: "Who wrote 'The Great Gatsby'?", a: "fitzgerald", choices: ["Hemingway", "Fitzgerald", "Steinbeck", "Faulkner"] },
  { q: "Who wrote 'War and Peace'?", a: "tolstoy", choices: ["Dostoevsky", "Tolstoy", "Chekhov", "Pushkin"] },
  { q: "Who wrote 'Crime and Punishment'?", a: "dostoevsky", choices: ["Tolstoy", "Dostoevsky", "Gogol", "Turgenev"] },
  { q: "Who wrote 'The Lord of the Rings'?", a: "tolkien", choices: ["Lewis", "Tolkien", "Rowling", "Pullman"] },
  { q: "Who wrote 'Harry Potter'?", a: "rowling", choices: ["Tolkien", "Rowling", "Lewis", "Pratchett"] },
  { q: "Who wrote 'A Song of Ice and Fire'?", a: "george r.r. martin", choices: ["Brandon Sanderson", "George R.R. Martin", "Robert Jordan", "Patrick Rothfuss"] },
  { q: "Who wrote 'Moby-Dick'?", a: "melville", choices: ["Hawthorne", "Melville", "Twain", "Poe"] },
  { q: "Who wrote 'The Catcher in the Rye'?", a: "salinger", choices: ["Vonnegut", "Salinger", "Kerouac", "Bukowski"] },
  { q: "Who wrote 'To Kill a Mockingbird'?", a: "harper lee", choices: ["Truman Capote", "Harper Lee", "Toni Morrison", "Maya Angelou"] },
  { q: "Who wrote 'The Odyssey'?", a: "homer", choices: ["Virgil", "Homer", "Sophocles", "Plato"] },
  { q: "Who wrote 'Don Quixote'?", a: "cervantes", choices: ["Lorca", "Cervantes", "Borges", "Marquez"] },
  { q: "Who wrote 'The Divine Comedy'?", a: "dante", choices: ["Petrarch", "Dante", "Boccaccio", "Machiavelli"] },
  { q: "Who wrote 'Faust'?", a: "goethe", choices: ["Schiller", "Goethe", "Kant", "Hesse"] },
  { q: "Who wrote 'Les Misérables'?", a: "victor hugo", choices: ["Dumas", "Victor Hugo", "Balzac", "Zola"] },
  { q: "Who wrote 'The Picture of Dorian Gray'?", a: "wilde", choices: ["Doyle", "Wilde", "Stoker", "Stevenson"] },
  { q: "Who wrote 'Dracula'?", a: "stoker", choices: ["Shelley", "Stoker", "Poe", "Lovecraft"] },
  { q: "Who wrote 'Frankenstein'?", a: "shelley", choices: ["Shelley", "Stoker", "Wells", "Byron"] },
  { q: "Who created Sherlock Holmes?", a: "doyle", choices: ["Christie", "Doyle", "Chesterton", "Sayers"] },
  { q: "Who wrote 'Murder on the Orient Express'?", a: "agatha christie", choices: ["Agatha Christie", "Doyle", "Conan", "Sayers"] },
  { q: "Who wrote 'Animal Farm'?", a: "orwell", choices: ["Huxley", "Orwell", "Lewis", "Wells"] },
  { q: "Who wrote 'The Old Man and the Sea'?", a: "hemingway", choices: ["Steinbeck", "Hemingway", "Fitzgerald", "Faulkner"] },
  { q: "How many plays did Shakespeare write (approx)?", a: "39", choices: ["20", "30", "39", "50"] },
  { q: "What is the longest novel in the English language often cited?", a: "in search of lost time", choices: ["War and Peace", "Ulysses", "In Search of Lost Time", "Atlas Shrugged"] },
  { q: "What language has the most native speakers?", a: "mandarin", choices: ["English", "Mandarin", "Spanish", "Hindi"] },
  { q: "How many letters are in the English alphabet?", a: "26", choices: ["24", "25", "26", "27"] },
  { q: "Which language has the most words (commonly cited)?", a: "english", choices: ["Spanish", "English", "Chinese", "French"] },
  { q: "What does 'et cetera' mean?", a: "and so on", choices: ["the same", "and so on", "for example", "that is"] },
  { q: "What does 'i.e.' stand for?", a: "id est", choices: ["id est", "exempli gratia", "et alii", "in extremis"] },
  { q: "What does 'e.g.' stand for?", a: "exempli gratia", choices: ["id est", "exempli gratia", "et alii", "ex gratia"] },
  { q: "What punctuation ends a question?", a: "question mark", choices: ["Period", "Question mark", "Exclamation", "Comma"] },
  { q: "What is a haiku?", a: "japanese poem", choices: ["Greek play", "Japanese poem", "Italian song", "Latin essay"] },
  { q: "Who wrote 'The Tale of Genji'?", a: "murasaki shikibu", choices: ["Basho", "Murasaki Shikibu", "Soseki", "Kawabata"] },
  { q: "What is the plural of 'octopus' (common)?", a: "octopuses", choices: ["Octopi", "Octopuses", "Octopodes", "Octops"] },
  { q: "What is the longest English word commonly cited?", a: "pneumonoultramicroscopicsilicovolcanoconiosis", choices: ["Antidisestablishmentarianism", "Pneumonoultramicroscopicsilicovolcanoconiosis", "Floccinaucinihilipilification", "Hippopotomonstrosesquippedaliophobia"] },
  { q: "Who wrote 'The Hobbit'?", a: "tolkien", choices: ["Lewis", "Tolkien", "Pullman", "Rowling"] },
  // ===== Math (30) =====
  { q: "What is 7 x 8?", a: "56", choices: ["54", "56", "64", "48"] },
  { q: "What is 12 x 12?", a: "144", choices: ["124", "134", "144", "156"] },
  { q: "What is 15 x 15?", a: "225", choices: ["205", "215", "225", "235"] },
  { q: "What is the square root of 144?", a: "12", choices: ["10", "11", "12", "13"] },
  { q: "What is the square root of 225?", a: "15", choices: ["14", "15", "16", "17"] },
  { q: "What is pi to 2 decimal places?", a: "3.14", choices: ["3.12", "3.14", "3.16", "3.18"] },
  { q: "How many sides does a hexagon have?", a: "6", choices: ["5", "6", "7", "8"] },
  { q: "How many sides does a pentagon have?", a: "5", choices: ["4", "5", "6", "7"] },
  { q: "How many sides does an octagon have?", a: "8", choices: ["6", "7", "8", "9"] },
  { q: "How many degrees in a circle?", a: "360", choices: ["180", "270", "360", "720"] },
  { q: "How many degrees in a right angle?", a: "90", choices: ["45", "90", "180", "360"] },
  { q: "How many degrees in a triangle's interior angles?", a: "180", choices: ["90", "180", "270", "360"] },
  { q: "What is 25% of 200?", a: "50", choices: ["25", "50", "75", "100"] },
  { q: "What is 10% of 1000?", a: "100", choices: ["50", "100", "150", "200"] },
  { q: "What is 2 to the power of 10?", a: "1024", choices: ["512", "1024", "2048", "4096"] },
  { q: "What is the largest prime less than 20?", a: "19", choices: ["17", "18", "19", "23"] },
  { q: "Is 91 a prime number?", a: "no", choices: ["Yes", "No", "Maybe", "Only sometimes"] },
  { q: "What is 0! (zero factorial)?", a: "1", choices: ["0", "1", "Undefined", "Infinity"] },
  { q: "Who is known as the father of geometry?", a: "euclid", choices: ["Pythagoras", "Euclid", "Archimedes", "Newton"] },
  { q: "What is the Fibonacci number after 13?", a: "21", choices: ["18", "19", "20", "21"] },
  { q: "How many minutes in a day?", a: "1440", choices: ["720", "1440", "2880", "60"] },
  { q: "How many seconds in an hour?", a: "3600", choices: ["360", "600", "3600", "60"] },
  { q: "What is 999 + 1?", a: "1000", choices: ["999", "1000", "1001", "1100"] },
  { q: "What is half of 200?", a: "100", choices: ["50", "100", "150", "75"] },
  { q: "What is one-third of 90?", a: "30", choices: ["20", "30", "45", "60"] },
  { q: "What number is represented by Roman numeral 'L'?", a: "50", choices: ["5", "50", "500", "100"] },
  { q: "What number is represented by Roman numeral 'M'?", a: "1000", choices: ["100", "500", "1000", "10000"] },
  { q: "What is the next prime after 7?", a: "11", choices: ["9", "10", "11", "13"] },
  { q: "How many zeros are in a million?", a: "6", choices: ["5", "6", "7", "9"] },
  { q: "How many zeros are in a billion (short scale)?", a: "9", choices: ["6", "9", "12", "15"] },
  // ===== Sports (40) =====
  { q: "How many players are on a soccer team on the field?", a: "11", choices: ["9", "10", "11", "12"] },
  { q: "How many players are on a basketball team on the court?", a: "5", choices: ["4", "5", "6", "7"] },
  { q: "How many players are on a baseball team on the field?", a: "9", choices: ["7", "8", "9", "10"] },
  { q: "How many players are on a cricket team?", a: "11", choices: ["9", "10", "11", "12"] },
  { q: "How many players on a volleyball team on the court?", a: "6", choices: ["5", "6", "7", "8"] },
  { q: "How often are the Summer Olympics held?", a: "4 years", choices: ["2 years", "3 years", "4 years", "5 years"] },
  { q: "Where were the 2020 Summer Olympics held?", a: "tokyo", choices: ["Rio", "Tokyo", "Paris", "London"] },
  { q: "Where were the 2024 Summer Olympics held?", a: "paris", choices: ["Tokyo", "Paris", "Los Angeles", "Beijing"] },
  { q: "How many rings on the Olympic flag?", a: "5", choices: ["4", "5", "6", "7"] },
  { q: "Which country has won the most FIFA World Cups?", a: "brazil", choices: ["Germany", "Italy", "Brazil", "Argentina"] },
  { q: "Who won the 2022 FIFA World Cup?", a: "argentina", choices: ["France", "Brazil", "Argentina", "Germany"] },
  { q: "Who is known as 'The GOAT' of basketball (often)?", a: "michael jordan", choices: ["LeBron James", "Michael Jordan", "Kobe Bryant", "Magic Johnson"] },
  { q: "Who scored the 'Hand of God' goal?", a: "maradona", choices: ["Pele", "Maradona", "Messi", "Ronaldo"] },
  { q: "What sport is Wimbledon associated with?", a: "tennis", choices: ["Cricket", "Tennis", "Golf", "Rugby"] },
  { q: "What sport is the Tour de France?", a: "cycling", choices: ["Running", "Cycling", "Swimming", "Skiing"] },
  { q: "How many holes in a standard round of golf?", a: "18", choices: ["9", "18", "27", "36"] },
  { q: "In tennis, what is a score of zero called?", a: "love", choices: ["Zero", "Nil", "Love", "Duck"] },
  { q: "What is the diameter of a basketball hoop (inches)?", a: "18", choices: ["16", "18", "20", "24"] },
  { q: "How long is an Olympic swimming pool?", a: "50 meters", choices: ["25 meters", "50 meters", "75 meters", "100 meters"] },
  { q: "How many minutes in a soccer match (regular)?", a: "90", choices: ["60", "80", "90", "120"] },
  { q: "How many points is a touchdown worth in American football?", a: "6", choices: ["3", "6", "7", "9"] },
  { q: "What does NBA stand for?", a: "national basketball association", choices: ["National Baseball Association", "National Basketball Association", "Northern Basketball Alliance", "New Basketball Association"] },
  { q: "What does NFL stand for?", a: "national football league", choices: ["National Football League", "Northern Football League", "New Football League", "National Field League"] },
  { q: "What does NHL stand for?", a: "national hockey league", choices: ["National Hockey League", "Northern Hockey League", "New Hockey League", "National Hoops League"] },
  { q: "What color is the bullseye in archery?", a: "yellow", choices: ["Red", "Yellow", "Blue", "Black"] },
  { q: "Which boxer was known as 'The Greatest'?", a: "muhammad ali", choices: ["Mike Tyson", "Muhammad Ali", "Floyd Mayweather", "Joe Frazier"] },
  { q: "What is the national sport of Japan?", a: "sumo", choices: ["Baseball", "Sumo", "Judo", "Karate"] },
  { q: "Which country invented table tennis?", a: "england", choices: ["China", "Japan", "England", "USA"] },
  { q: "Which country invented basketball?", a: "usa", choices: ["USA", "Canada", "UK", "Australia"] },
  { q: "Which country invented cricket?", a: "england", choices: ["India", "Australia", "England", "South Africa"] },
  { q: "Which Formula 1 driver has the most championships (tied)?", a: "hamilton", choices: ["Schumacher", "Hamilton", "Senna", "Vettel"] },
  { q: "Who has the most Grand Slam tennis titles (men's, as of mid-2020s)?", a: "djokovic", choices: ["Federer", "Nadal", "Djokovic", "Murray"] },
  { q: "What sport uses a shuttlecock?", a: "badminton", choices: ["Tennis", "Badminton", "Squash", "Pickleball"] },
  { q: "What is a perfect score in 10-pin bowling?", a: "300", choices: ["200", "250", "300", "500"] },
  { q: "How long is a marathon (km)?", a: "42.195", choices: ["40", "41.5", "42.195", "43"] },
  { q: "In chess, which piece can only move diagonally?", a: "bishop", choices: ["Knight", "Bishop", "Rook", "Queen"] },
  { q: "How many squares on a chessboard?", a: "64", choices: ["32", "48", "64", "100"] },
  { q: "What's the name of the trophy in the NHL?", a: "stanley cup", choices: ["World Cup", "Stanley Cup", "Lombardi Trophy", "Larry O'Brien"] },
  { q: "What sport is Lionel Messi famous for?", a: "soccer", choices: ["Basketball", "Soccer", "Tennis", "Cricket"] },
  { q: "What sport is Tiger Woods famous for?", a: "golf", choices: ["Golf", "Tennis", "Soccer", "Cricket"] },
  // ===== Movies & TV (50) =====
  { q: "Who directed 'Jurassic Park'?", a: "spielberg", choices: ["Lucas", "Spielberg", "Cameron", "Nolan"] },
  { q: "Who directed 'Titanic'?", a: "cameron", choices: ["Cameron", "Spielberg", "Tarantino", "Nolan"] },
  { q: "Who directed 'Inception'?", a: "nolan", choices: ["Cameron", "Nolan", "Villeneuve", "Fincher"] },
  { q: "Who directed 'The Godfather'?", a: "coppola", choices: ["Scorsese", "Coppola", "Kubrick", "Spielberg"] },
  { q: "Who directed 'Pulp Fiction'?", a: "tarantino", choices: ["Tarantino", "Rodriguez", "Scorsese", "Nolan"] },
  { q: "What year was the first Star Wars film released?", a: "1977", choices: ["1975", "1977", "1980", "1983"] },
  { q: "Who played Iron Man in the MCU?", a: "robert downey jr.", choices: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"] },
  { q: "Who played Captain America in the MCU?", a: "chris evans", choices: ["Chris Evans", "Chris Hemsworth", "Chris Pratt", "Chris Pine"] },
  { q: "Who played Thor in the MCU?", a: "chris hemsworth", choices: ["Chris Evans", "Chris Hemsworth", "Chris Pratt", "Chris Pine"] },
  { q: "Who played Harry Potter in the films?", a: "daniel radcliffe", choices: ["Daniel Radcliffe", "Rupert Grint", "Tom Felton", "Robert Pattinson"] },
  { q: "Who played Hermione Granger?", a: "emma watson", choices: ["Emma Watson", "Emma Stone", "Emma Roberts", "Emma Thompson"] },
  { q: "Who played Frodo in 'The Lord of the Rings'?", a: "elijah wood", choices: ["Elijah Wood", "Tobey Maguire", "Sean Astin", "Orlando Bloom"] },
  { q: "Who played Jack in 'Titanic'?", a: "leonardo dicaprio", choices: ["Brad Pitt", "Leonardo DiCaprio", "Matt Damon", "Tom Cruise"] },
  { q: "Who played Rose in 'Titanic'?", a: "kate winslet", choices: ["Kate Hudson", "Kate Winslet", "Kate Beckinsale", "Kate Bosworth"] },
  { q: "What is the highest-grossing film as of 2024?", a: "avatar", choices: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: TFA"] },
  { q: "Which animated film features Simba?", a: "the lion king", choices: ["The Lion King", "Madagascar", "Tarzan", "Bambi"] },
  { q: "Which animated film features Woody and Buzz?", a: "toy story", choices: ["Cars", "Toy Story", "Up", "Finding Nemo"] },
  { q: "Which animated film features Elsa?", a: "frozen", choices: ["Frozen", "Tangled", "Moana", "Brave"] },
  { q: "What is the name of the boy in 'Stranger Things' with telekinetic powers?", a: "eleven", choices: ["Mike", "Will", "Eleven", "Dustin"] },
  { q: "What is the name of the cafe in 'Friends'?", a: "central perk", choices: ["Central Park", "Central Perk", "Cafe Nervosa", "Luke's"] },
  { q: "Who plays Sheldon in 'The Big Bang Theory'?", a: "jim parsons", choices: ["Jim Parsons", "Johnny Galecki", "Simon Helberg", "Kunal Nayyar"] },
  { q: "What show features the Iron Throne?", a: "game of thrones", choices: ["The Witcher", "Game of Thrones", "Vikings", "Rome"] },
  { q: "Who created 'Breaking Bad'?", a: "vince gilligan", choices: ["David Chase", "Vince Gilligan", "David Simon", "Aaron Sorkin"] },
  { q: "Who plays Walter White?", a: "bryan cranston", choices: ["Aaron Paul", "Bryan Cranston", "Bob Odenkirk", "Jonathan Banks"] },
  { q: "What is the name of the family in 'The Simpsons'?", a: "simpson", choices: ["Simpson", "Griffin", "Smith", "Belcher"] },
  { q: "What is the name of the family in 'Family Guy'?", a: "griffin", choices: ["Simpson", "Griffin", "Smith", "Belcher"] },
  { q: "What is the name of the family in 'Bob's Burgers'?", a: "belcher", choices: ["Simpson", "Griffin", "Smith", "Belcher"] },
  { q: "Who plays James Bond in 'Casino Royale' (2006)?", a: "daniel craig", choices: ["Pierce Brosnan", "Daniel Craig", "Sean Connery", "Roger Moore"] },
  { q: "Which film features Vincent Vega and Jules Winnfield?", a: "pulp fiction", choices: ["Reservoir Dogs", "Pulp Fiction", "Kill Bill", "Sin City"] },
  { q: "Which film features Andy Dufresne?", a: "the shawshank redemption", choices: ["The Green Mile", "The Shawshank Redemption", "Cast Away", "Forrest Gump"] },
  { q: "Who directed 'Schindler's List'?", a: "spielberg", choices: ["Scorsese", "Spielberg", "Lumet", "Kubrick"] },
  { q: "Who directed '2001: A Space Odyssey'?", a: "kubrick", choices: ["Spielberg", "Kubrick", "Hitchcock", "Welles"] },
  { q: "Who directed 'The Dark Knight'?", a: "nolan", choices: ["Burton", "Nolan", "Snyder", "Reeves"] },
  { q: "Who composed the 'Star Wars' theme?", a: "john williams", choices: ["Hans Zimmer", "John Williams", "Danny Elfman", "Howard Shore"] },
  { q: "Who composed the 'Lord of the Rings' score?", a: "howard shore", choices: ["John Williams", "Hans Zimmer", "Howard Shore", "James Horner"] },
  { q: "What anime features ninjas Naruto and Sasuke?", a: "naruto", choices: ["Bleach", "Naruto", "One Piece", "Dragon Ball"] },
  { q: "What anime features pirates and a stretchy hero?", a: "one piece", choices: ["Bleach", "Naruto", "One Piece", "Fairy Tail"] },
  { q: "What anime features Goku?", a: "dragon ball", choices: ["Naruto", "Dragon Ball", "Bleach", "One Punch Man"] },
  { q: "Who directed 'Spirited Away'?", a: "miyazaki", choices: ["Shinkai", "Miyazaki", "Takahata", "Hosoda"] },
  { q: "What 1999 film has the line 'I see dead people'?", a: "the sixth sense", choices: ["The Others", "The Sixth Sense", "The Ring", "Sleepy Hollow"] },
  { q: "Who voiced Buzz Lightyear in Toy Story?", a: "tim allen", choices: ["Tom Hanks", "Tim Allen", "Billy Crystal", "John Goodman"] },
  { q: "Who voiced Woody in Toy Story?", a: "tom hanks", choices: ["Tom Hanks", "Tim Allen", "Billy Crystal", "John Goodman"] },
  { q: "Which Marvel movie introduces Black Panther?", a: "captain america: civil war", choices: ["Black Panther", "Captain America: Civil War", "Avengers", "Iron Man 2"] },
  { q: "What is the highest-rated TV show on IMDb (often)?", a: "breaking bad", choices: ["The Wire", "Breaking Bad", "Game of Thrones", "The Sopranos"] },
  { q: "What is the longest-running animated TV series?", a: "the simpsons", choices: ["South Park", "The Simpsons", "Family Guy", "SpongeBob"] },
  { q: "What movie franchise features Ethan Hunt?", a: "mission: impossible", choices: ["James Bond", "Mission: Impossible", "Bourne", "Jack Ryan"] },
  { q: "Which film won Best Picture in 2020?", a: "parasite", choices: ["1917", "Parasite", "Joker", "Once Upon a Time in Hollywood"] },
  { q: "Which film won Best Picture in 2023?", a: "everything everywhere all at once", choices: ["Top Gun: Maverick", "Everything Everywhere All at Once", "Avatar 2", "The Banshees of Inisherin"] },
  { q: "What is the longest film in the MCU 'Infinity Saga' (often cited)?", a: "avengers: endgame", choices: ["Avengers: Infinity War", "Avengers: Endgame", "Iron Man 3", "Black Panther"] },
  { q: "Who plays Wolverine?", a: "hugh jackman", choices: ["Hugh Jackman", "Ryan Reynolds", "Chris Hemsworth", "Tom Hardy"] },
  // ===== Music (40) =====
  { q: "Who sang 'Like a Rolling Stone'?", a: "bob dylan", choices: ["The Beatles", "Bob Dylan", "Elvis", "Johnny Cash"] },
  { q: "Who was known as the King of Pop?", a: "michael jackson", choices: ["Elvis", "Michael Jackson", "Prince", "Justin Timberlake"] },
  { q: "Who was known as the King of Rock and Roll?", a: "elvis presley", choices: ["Chuck Berry", "Elvis Presley", "Little Richard", "Buddy Holly"] },
  { q: "Who sang 'Bohemian Rhapsody'?", a: "queen", choices: ["The Who", "Queen", "Led Zeppelin", "Pink Floyd"] },
  { q: "Who sang 'Imagine'?", a: "john lennon", choices: ["Paul McCartney", "John Lennon", "George Harrison", "Ringo Starr"] },
  { q: "Who sang 'Shape of You'?", a: "ed sheeran", choices: ["Ed Sheeran", "Justin Bieber", "Bruno Mars", "Sam Smith"] },
  { q: "Who sang 'Bad Guy'?", a: "billie eilish", choices: ["Ariana Grande", "Billie Eilish", "Dua Lipa", "Olivia Rodrigo"] },
  { q: "Who is the lead singer of Coldplay?", a: "chris martin", choices: ["Chris Martin", "Bono", "Mick Jagger", "Adam Levine"] },
  { q: "Who is the lead singer of U2?", a: "bono", choices: ["Bono", "Sting", "Bryan Adams", "Phil Collins"] },
  { q: "How many members are in BTS?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "Which Beatle was murdered in 1980?", a: "john lennon", choices: ["John Lennon", "Paul McCartney", "George Harrison", "Ringo Starr"] },
  { q: "Who composed 'The Four Seasons'?", a: "vivaldi", choices: ["Mozart", "Bach", "Vivaldi", "Beethoven"] },
  { q: "Who composed the 'Moonlight Sonata'?", a: "beethoven", choices: ["Mozart", "Bach", "Vivaldi", "Beethoven"] },
  { q: "How many strings does a standard guitar have?", a: "6", choices: ["4", "5", "6", "7"] },
  { q: "How many strings on a violin?", a: "4", choices: ["3", "4", "5", "6"] },
  { q: "How many keys on a standard piano?", a: "88", choices: ["66", "76", "88", "100"] },
  { q: "What instrument did Louis Armstrong play?", a: "trumpet", choices: ["Saxophone", "Trumpet", "Trombone", "Clarinet"] },
  { q: "What instrument did Jimi Hendrix play?", a: "guitar", choices: ["Bass", "Guitar", "Drums", "Piano"] },
  { q: "Which band sang 'Hotel California'?", a: "eagles", choices: ["Eagles", "Doors", "Aerosmith", "Rolling Stones"] },
  { q: "Which band sang 'Stairway to Heaven'?", a: "led zeppelin", choices: ["Led Zeppelin", "Pink Floyd", "Deep Purple", "Black Sabbath"] },
  { q: "Which band sang 'Smells Like Teen Spirit'?", a: "nirvana", choices: ["Soundgarden", "Nirvana", "Pearl Jam", "Alice in Chains"] },
  { q: "Who sang 'Rolling in the Deep'?", a: "adele", choices: ["Adele", "Beyonce", "Rihanna", "Sia"] },
  { q: "What does DJ stand for?", a: "disc jockey", choices: ["Disco Jockey", "Disc Jockey", "Dance Jockey", "Direct Jockey"] },
  { q: "How many notes in a musical scale (major)?", a: "7", choices: ["5", "7", "8", "12"] },
  { q: "What's the highest female singing voice?", a: "soprano", choices: ["Alto", "Soprano", "Mezzo", "Tenor"] },
  { q: "What's the lowest male singing voice?", a: "bass", choices: ["Tenor", "Baritone", "Bass", "Counter-tenor"] },
  { q: "Who released the album 'Thriller'?", a: "michael jackson", choices: ["Prince", "Michael Jackson", "Lionel Richie", "Stevie Wonder"] },
  { q: "Who is 'Slim Shady'?", a: "eminem", choices: ["Dr. Dre", "Eminem", "Jay-Z", "50 Cent"] },
  { q: "What does 'EDM' stand for?", a: "electronic dance music", choices: ["Electric Dance Music", "Electronic Dance Music", "Easy Dance Music", "Electronic Drum Music"] },
  { q: "Which singer is known as 'Queen B'?", a: "beyonce", choices: ["Beyonce", "Britney", "Madonna", "Mariah"] },
  { q: "Who released 'Anti-Hero' in 2022?", a: "taylor swift", choices: ["Taylor Swift", "Olivia Rodrigo", "Selena Gomez", "Ariana Grande"] },
  { q: "What's K-pop?", a: "korean pop", choices: ["Korean Pop", "Kenyan Pop", "Kazakh Pop", "Kannada Pop"] },
  { q: "Who is the lead singer of Maroon 5?", a: "adam levine", choices: ["Adam Levine", "Bruno Mars", "John Mayer", "Justin Timberlake"] },
  { q: "Which band sang 'Wonderwall'?", a: "oasis", choices: ["Blur", "Oasis", "Radiohead", "Coldplay"] },
  { q: "Which artist is known for 'Purple Rain'?", a: "prince", choices: ["David Bowie", "Prince", "Michael Jackson", "Madonna"] },
  { q: "Who sang 'Sweet Child o' Mine'?", a: "guns n' roses", choices: ["Aerosmith", "Guns N' Roses", "Bon Jovi", "Metallica"] },
  { q: "Who sang 'Billie Jean'?", a: "michael jackson", choices: ["Prince", "Michael Jackson", "Stevie Wonder", "Lionel Richie"] },
  { q: "Who sang 'Single Ladies'?", a: "beyonce", choices: ["Beyonce", "Rihanna", "Jennifer Lopez", "Mariah Carey"] },
  { q: "What's the name of Drake's hometown?", a: "toronto", choices: ["Toronto", "Montreal", "Vancouver", "Atlanta"] },
  { q: "Which K-pop group sings 'Dynamite'?", a: "bts", choices: ["BTS", "Blackpink", "Twice", "EXO"] },
  // ===== Tech & Internet (40) =====
  { q: "What does CPU stand for?", a: "central processing unit", choices: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Core Processing Unit"] },
  { q: "What does GPU stand for?", a: "graphics processing unit", choices: ["General Processing Unit", "Graphics Processing Unit", "Graphical Program Unit", "Graphics Program Unit"] },
  { q: "What does RAM stand for?", a: "random access memory", choices: ["Read Access Memory", "Random Access Memory", "Run Application Memory", "Random Allocation Memory"] },
  { q: "What does HTML stand for?", a: "hypertext markup language", choices: ["HyperText Markup Language", "HighText Machine Language", "HyperTool Markup Language", "HyperText Marking Language"] },
  { q: "What does CSS stand for?", a: "cascading style sheets", choices: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Cascading System Sheets"] },
  { q: "What does URL stand for?", a: "uniform resource locator", choices: ["Universal Resource Locator", "Uniform Resource Locator", "Unified Resource Locator", "Universal Reference Link"] },
  { q: "What year was Google founded?", a: "1998", choices: ["1995", "1996", "1998", "2000"] },
  { q: "What year was Facebook founded?", a: "2004", choices: ["2000", "2002", "2004", "2006"] },
  { q: "What year was Twitter founded?", a: "2006", choices: ["2004", "2005", "2006", "2008"] },
  { q: "What year was YouTube founded?", a: "2005", choices: ["2003", "2004", "2005", "2007"] },
  { q: "Who is the CEO of Tesla?", a: "elon musk", choices: ["Mark Zuckerberg", "Elon Musk", "Jeff Bezos", "Tim Cook"] },
  { q: "Who is the CEO of Apple (as of 2024)?", a: "tim cook", choices: ["Steve Jobs", "Tim Cook", "Sundar Pichai", "Satya Nadella"] },
  { q: "Who is the CEO of Microsoft (as of 2024)?", a: "satya nadella", choices: ["Bill Gates", "Satya Nadella", "Steve Ballmer", "Paul Allen"] },
  { q: "Who is the CEO of Google (Alphabet)?", a: "sundar pichai", choices: ["Larry Page", "Sergey Brin", "Sundar Pichai", "Eric Schmidt"] },
  { q: "What is the most popular search engine?", a: "google", choices: ["Bing", "Google", "Yahoo", "DuckDuckGo"] },
  { q: "What does 'AI' stand for?", a: "artificial intelligence", choices: ["Artificial Intelligence", "Automated Information", "Adaptive Intelligence", "Algorithmic Intelligence"] },
  { q: "What programming language uses 'Hello, World!' as a tradition?", a: "all of them", choices: ["Only C", "Only Python", "Only JavaScript", "All of them"] },
  { q: "What was the first iPhone released year?", a: "2007", choices: ["2005", "2006", "2007", "2008"] },
  { q: "What is the name of Apple's voice assistant?", a: "siri", choices: ["Alexa", "Siri", "Cortana", "Bixby"] },
  { q: "What is the name of Amazon's voice assistant?", a: "alexa", choices: ["Alexa", "Siri", "Cortana", "Bixby"] },
  { q: "What is the name of Microsoft's voice assistant?", a: "cortana", choices: ["Alexa", "Siri", "Cortana", "Bixby"] },
  { q: "What is the name of Samsung's voice assistant?", a: "bixby", choices: ["Alexa", "Siri", "Cortana", "Bixby"] },
  { q: "Who founded Twitter?", a: "jack dorsey", choices: ["Mark Zuckerberg", "Jack Dorsey", "Evan Spiegel", "Kevin Systrom"] },
  { q: "Who founded Instagram?", a: "kevin systrom", choices: ["Mark Zuckerberg", "Jack Dorsey", "Evan Spiegel", "Kevin Systrom"] },
  { q: "Who founded Snapchat?", a: "evan spiegel", choices: ["Mark Zuckerberg", "Jack Dorsey", "Evan Spiegel", "Kevin Systrom"] },
  { q: "Which company makes the Galaxy phones?", a: "samsung", choices: ["LG", "Samsung", "Sony", "Huawei"] },
  { q: "Which company makes the Pixel phones?", a: "google", choices: ["Apple", "Google", "Samsung", "Microsoft"] },
  { q: "What does 'WWW' stand for?", a: "world wide web", choices: ["World Wide Web", "World Web Wireless", "Wide World Web", "Web World Wide"] },
  { q: "Who is considered the inventor of the World Wide Web?", a: "tim berners-lee", choices: ["Bill Gates", "Tim Berners-Lee", "Vint Cerf", "Steve Wozniak"] },
  { q: "What does 'PDF' stand for?", a: "portable document format", choices: ["Personal Document Format", "Portable Document Format", "Printable Document File", "Portable Data Format"] },
  { q: "What is Linux?", a: "operating system", choices: ["Operating System", "Browser", "Programming Language", "Search Engine"] },
  { q: "What is the most-used programming language (often cited)?", a: "python", choices: ["JavaScript", "Python", "Java", "C++"] },
  { q: "What year was Bitcoin introduced?", a: "2009", choices: ["2007", "2008", "2009", "2011"] },
  { q: "Who invented Bitcoin (pseudonym)?", a: "satoshi nakamoto", choices: ["Vitalik Buterin", "Satoshi Nakamoto", "Elon Musk", "Hal Finney"] },
  { q: "What does VPN stand for?", a: "virtual private network", choices: ["Virtual Public Network", "Virtual Private Network", "Vector Private Network", "Very Private Network"] },
  { q: "What does SSD stand for?", a: "solid state drive", choices: ["Solid Storage Drive", "Solid State Drive", "Static State Drive", "System Storage Drive"] },
  { q: "What company makes the Surface tablet?", a: "microsoft", choices: ["Apple", "Microsoft", "Google", "Samsung"] },
  { q: "Which company developed ChatGPT?", a: "openai", choices: ["Google", "OpenAI", "Microsoft", "Meta"] },
  { q: "What does 'OS' stand for?", a: "operating system", choices: ["Open Source", "Operating System", "Online Service", "Output System"] },
  { q: "What is the file extension for an Excel spreadsheet?", a: ".xlsx", choices: [".doc", ".xlsx", ".ppt", ".csv"] },
  // ===== Food & Drink (30) =====
  { q: "What country invented pizza?", a: "italy", choices: ["Italy", "Greece", "Spain", "France"] },
  { q: "What country invented sushi?", a: "japan", choices: ["China", "Japan", "Korea", "Thailand"] },
  { q: "What country is the origin of tacos?", a: "mexico", choices: ["Spain", "Mexico", "Peru", "Cuba"] },
  { q: "What is the main ingredient in guacamole?", a: "avocado", choices: ["Tomato", "Avocado", "Onion", "Pepper"] },
  { q: "What is the main ingredient in hummus?", a: "chickpeas", choices: ["Beans", "Chickpeas", "Lentils", "Peas"] },
  { q: "What fruit is famous for keeping the doctor away?", a: "apple", choices: ["Banana", "Apple", "Orange", "Pear"] },
  { q: "What fruit is yellow and curved?", a: "banana", choices: ["Mango", "Banana", "Lemon", "Pineapple"] },
  { q: "Which fruit has its seeds on the outside?", a: "strawberry", choices: ["Strawberry", "Raspberry", "Kiwi", "Pomegranate"] },
  { q: "What is the most consumed beverage in the world after water?", a: "tea", choices: ["Coffee", "Tea", "Soda", "Juice"] },
  { q: "What country is the origin of croissants?", a: "austria", choices: ["France", "Austria", "Belgium", "Italy"] },
  { q: "What is sake?", a: "japanese rice wine", choices: ["Korean liquor", "Japanese rice wine", "Chinese tea", "Vietnamese coffee"] },
  { q: "What is the main ingredient in bread?", a: "flour", choices: ["Sugar", "Flour", "Salt", "Yeast"] },
  { q: "Which country produces the most coffee?", a: "brazil", choices: ["Colombia", "Brazil", "Ethiopia", "Vietnam"] },
  { q: "Which spice is most expensive by weight?", a: "saffron", choices: ["Vanilla", "Saffron", "Cardamom", "Cinnamon"] },
  { q: "What is the national dish of Spain?", a: "paella", choices: ["Tortilla", "Paella", "Gazpacho", "Churros"] },
  { q: "What is tofu made from?", a: "soybeans", choices: ["Rice", "Wheat", "Soybeans", "Chickpeas"] },
  { q: "What is the main ingredient in chocolate?", a: "cocoa", choices: ["Cocoa", "Sugar", "Milk", "Vanilla"] },
  { q: "Where does champagne come from?", a: "france", choices: ["Italy", "France", "Spain", "Germany"] },
  { q: "What is the main ingredient in a margarita?", a: "tequila", choices: ["Vodka", "Rum", "Tequila", "Gin"] },
  { q: "What is sushi traditionally wrapped in?", a: "nori", choices: ["Nori", "Wakame", "Kombu", "Aonori"] },
  { q: "Which cuisine is curry most associated with?", a: "indian", choices: ["Italian", "Indian", "Mexican", "Chinese"] },
  { q: "What is dim sum?", a: "small chinese dishes", choices: ["Indian breads", "Small Chinese dishes", "Korean stews", "Japanese soups"] },
  { q: "What is a cappuccino topped with?", a: "milk foam", choices: ["Whipped cream", "Milk foam", "Caramel", "Chocolate"] },
  { q: "Which fast food chain has the golden arches?", a: "mcdonald's", choices: ["McDonald's", "Burger King", "Wendy's", "KFC"] },
  { q: "Who created KFC?", a: "colonel sanders", choices: ["Ray Kroc", "Colonel Sanders", "Dave Thomas", "Glen Bell"] },
  { q: "What is the main ingredient in pesto?", a: "basil", choices: ["Spinach", "Basil", "Parsley", "Mint"] },
  { q: "Which country is origin of feta cheese?", a: "greece", choices: ["Italy", "France", "Greece", "Turkey"] },
  { q: "Which fruit is known as the king of fruits in SE Asia?", a: "durian", choices: ["Mango", "Durian", "Rambutan", "Mangosteen"] },
  { q: "What grain is used to make traditional risotto?", a: "rice", choices: ["Wheat", "Rice", "Barley", "Oats"] },
  { q: "Which spice gives curry its yellow color?", a: "turmeric", choices: ["Saffron", "Turmeric", "Cumin", "Paprika"] },
  // ===== Animals & Nature (30) =====
  { q: "Which bird cannot fly?", a: "penguin", choices: ["Eagle", "Penguin", "Sparrow", "Owl"] },
  { q: "Which mammal lays eggs?", a: "platypus", choices: ["Bat", "Platypus", "Sloth", "Kangaroo"] },
  { q: "What is a baby kangaroo called?", a: "joey", choices: ["Calf", "Joey", "Cub", "Pup"] },
  { q: "What is a group of lions called?", a: "pride", choices: ["Herd", "Pride", "Pack", "Flock"] },
  { q: "What is a group of wolves called?", a: "pack", choices: ["Herd", "Pride", "Pack", "Flock"] },
  { q: "What is a group of crows called?", a: "murder", choices: ["Flock", "Murder", "Pack", "Swarm"] },
  { q: "What is a group of fish called?", a: "school", choices: ["School", "Pack", "Pride", "Herd"] },
  { q: "Which animal has the longest neck?", a: "giraffe", choices: ["Giraffe", "Ostrich", "Camel", "Llama"] },
  { q: "What's the largest reptile?", a: "saltwater crocodile", choices: ["Komodo Dragon", "Saltwater Crocodile", "Anaconda", "Alligator"] },
  { q: "What's the only continent with no native reptiles?", a: "antarctica", choices: ["Europe", "Antarctica", "Australia", "Arctic"] },
  { q: "Which whale is the largest?", a: "blue whale", choices: ["Sperm", "Humpback", "Blue", "Orca"] },
  { q: "How many hearts does an octopus have?", a: "3", choices: ["1", "2", "3", "4"] },
  { q: "Which animal is known for changing color?", a: "chameleon", choices: ["Chameleon", "Frog", "Lizard", "Snake"] },
  { q: "Which bird is the largest?", a: "ostrich", choices: ["Eagle", "Albatross", "Ostrich", "Condor"] },
  { q: "Which mammal can fly?", a: "bat", choices: ["Squirrel", "Bat", "Lemur", "Sugar glider"] },
  { q: "How long can a camel survive without water (approx)?", a: "1 week", choices: ["1 day", "3 days", "1 week", "1 month"] },
  { q: "Which fish is known for being electric?", a: "electric eel", choices: ["Catfish", "Electric Eel", "Stingray", "Pufferfish"] },
  { q: "What do pandas mainly eat?", a: "bamboo", choices: ["Fish", "Bamboo", "Berries", "Insects"] },
  { q: "What is the tallest tree species?", a: "redwood", choices: ["Oak", "Redwood", "Pine", "Birch"] },
  { q: "What tree do acorns come from?", a: "oak", choices: ["Maple", "Oak", "Birch", "Pine"] },
  { q: "What is the largest flower in the world?", a: "rafflesia", choices: ["Sunflower", "Rafflesia", "Lotus", "Lily"] },
  { q: "Which insect produces silk?", a: "silkworm", choices: ["Spider", "Silkworm", "Beetle", "Ant"] },
  { q: "Which snake is the longest?", a: "reticulated python", choices: ["Anaconda", "Reticulated Python", "King Cobra", "Black Mamba"] },
  { q: "Which animal is the slowest?", a: "sloth", choices: ["Snail", "Sloth", "Turtle", "Koala"] },
  { q: "What's the only mammal that can truly fly?", a: "bat", choices: ["Sugar glider", "Bat", "Flying squirrel", "Lemur"] },
  { q: "What is the smallest bird?", a: "bee hummingbird", choices: ["Sparrow", "Bee Hummingbird", "Wren", "Goldcrest"] },
  { q: "Which animal sleeps the most per day?", a: "koala", choices: ["Sloth", "Koala", "Lion", "Cat"] },
  { q: "What do you call a baby goat?", a: "kid", choices: ["Pup", "Kid", "Calf", "Lamb"] },
  { q: "What do you call a baby swan?", a: "cygnet", choices: ["Chick", "Cygnet", "Duckling", "Joey"] },
  { q: "Which sea creature has 8 arms?", a: "octopus", choices: ["Squid", "Octopus", "Starfish", "Jellyfish"] },
  // ===== Pop Culture & Misc (40) =====
  { q: "What color do you get mixing red and blue?", a: "purple", choices: ["Green", "Purple", "Orange", "Brown"] },
  { q: "What color do you get mixing yellow and blue?", a: "green", choices: ["Purple", "Green", "Orange", "Brown"] },
  { q: "What color do you get mixing red and yellow?", a: "orange", choices: ["Purple", "Green", "Orange", "Brown"] },
  { q: "How many days are in a leap year?", a: "366", choices: ["364", "365", "366", "367"] },
  { q: "How many months have 31 days?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "Which month has 28 or 29 days?", a: "february", choices: ["January", "February", "March", "April"] },
  { q: "How many hours in a week?", a: "168", choices: ["148", "158", "168", "178"] },
  { q: "What does NASA stand for?", a: "national aeronautics and space administration", choices: ["National Aeronautics and Space Administration", "North American Space Agency", "National Air and Space Agency", "National Aero Science Agency"] },
  { q: "What does FBI stand for?", a: "federal bureau of investigation", choices: ["Federal Bureau of Investigation", "Federal Body of Investigation", "Federal Bureau of Inquiry", "Federal Branch of Investigation"] },
  { q: "What does CIA stand for?", a: "central intelligence agency", choices: ["Central Intelligence Agency", "Critical Intelligence Agency", "Central Investigation Agency", "Country Intelligence Agency"] },
  { q: "What is the largest social network?", a: "facebook", choices: ["Facebook", "Twitter", "Instagram", "TikTok"] },
  { q: "What does 'LOL' stand for?", a: "laugh out loud", choices: ["Lots of Love", "Laugh Out Loud", "Live On Line", "Live Out Loud"] },
  { q: "What does 'BRB' stand for?", a: "be right back", choices: ["Be Right Back", "Be Ready Boss", "Big Red Bus", "Bring Right Back"] },
  { q: "What does 'OMG' stand for?", a: "oh my god", choices: ["Oh My God", "Only My Goal", "One More Goal", "Out My Garden"] },
  { q: "What does 'BTW' stand for?", a: "by the way", choices: ["By the Way", "Behind The Wall", "Before The Win", "Beside The Way"] },
  { q: "What is the color of an emerald?", a: "green", choices: ["Red", "Green", "Blue", "Yellow"] },
  { q: "What is the color of a sapphire?", a: "blue", choices: ["Red", "Green", "Blue", "Yellow"] },
  { q: "What is the color of a ruby?", a: "red", choices: ["Red", "Green", "Blue", "Yellow"] },
  { q: "What metal is liquid at room temperature?", a: "mercury", choices: ["Iron", "Mercury", "Lead", "Tin"] },
  { q: "How many sides does a cube have?", a: "6", choices: ["4", "6", "8", "12"] },
  { q: "How many wheels on a unicycle?", a: "1", choices: ["1", "2", "3", "4"] },
  { q: "What is the tallest building in the world (as of 2024)?", a: "burj khalifa", choices: ["Shanghai Tower", "Burj Khalifa", "Empire State", "Taipei 101"] },
  { q: "What is the largest desert (sand)?", a: "sahara", choices: ["Gobi", "Sahara", "Kalahari", "Arabian"] },
  { q: "Which country invented gunpowder?", a: "china", choices: ["Greece", "China", "India", "Egypt"] },
  { q: "Which country invented paper?", a: "china", choices: ["Greece", "China", "Egypt", "Persia"] },
  { q: "What is the rarest blood type?", a: "ab negative", choices: ["O negative", "AB negative", "B negative", "A negative"] },
  { q: "Who painted the 'Last Supper'?", a: "da vinci", choices: ["Da Vinci", "Michelangelo", "Caravaggio", "Rembrandt"] },
  { q: "Which planet is known as the Morning Star?", a: "venus", choices: ["Mars", "Venus", "Mercury", "Saturn"] },
  { q: "Which planet has a Great Red Spot?", a: "jupiter", choices: ["Mars", "Jupiter", "Saturn", "Uranus"] },
  { q: "Which game is played on a 64-square board?", a: "chess", choices: ["Checkers", "Chess", "Go", "Backgammon"] },
  { q: "Which game uses 'mate' to win?", a: "chess", choices: ["Chess", "Checkers", "Go", "Risk"] },
  { q: "Which card game involves 'Uno' when you have one card?", a: "uno", choices: ["Uno", "Skip-Bo", "Phase 10", "Crazy Eights"] },
  { q: "Which game features colored ghosts named Blinky, Pinky, Inky, Clyde?", a: "pac-man", choices: ["Pac-Man", "Donkey Kong", "Tetris", "Galaga"] },
  { q: "Which game features falling blocks?", a: "tetris", choices: ["Pac-Man", "Tetris", "Snake", "Mario"] },
  { q: "Which video game franchise features Mario?", a: "super mario", choices: ["Sonic", "Super Mario", "Zelda", "Kirby"] },
  { q: "Which video game franchise features Link?", a: "the legend of zelda", choices: ["Final Fantasy", "The Legend of Zelda", "Metroid", "Mario"] },
  { q: "Which video game franchise features Master Chief?", a: "halo", choices: ["Halo", "Doom", "Call of Duty", "Destiny"] },
  { q: "Which video game franchise features Kratos?", a: "god of war", choices: ["Devil May Cry", "God of War", "Bayonetta", "Ninja Gaiden"] },
  { q: "Which video game franchise features Pikachu?", a: "pokemon", choices: ["Digimon", "Pokemon", "Yo-kai Watch", "Bakugan"] },
  { q: "Who is the main character of 'Sonic the Hedgehog'?", a: "sonic", choices: ["Tails", "Sonic", "Knuckles", "Shadow"] },
  // ===== World & Society (40) =====
  { q: "What is the largest religion in the world?", a: "christianity", choices: ["Islam", "Christianity", "Hinduism", "Buddhism"] },
  { q: "Who founded Buddhism?", a: "siddhartha gautama", choices: ["Confucius", "Siddhartha Gautama", "Lao Tzu", "Mahavira"] },
  { q: "What is the holy book of Islam?", a: "quran", choices: ["Bible", "Quran", "Torah", "Vedas"] },
  { q: "What is the holy book of Judaism?", a: "torah", choices: ["Bible", "Quran", "Torah", "Vedas"] },
  { q: "What is the holy book of Hinduism (often cited)?", a: "vedas", choices: ["Bible", "Quran", "Torah", "Vedas"] },
  { q: "What does UN stand for?", a: "united nations", choices: ["United Nations", "Universal Nations", "United Network", "United North"] },
  { q: "What does NATO stand for?", a: "north atlantic treaty organization", choices: ["North Atlantic Treaty Organization", "Northern Atlantic Trade Organization", "National Atlantic Treaty Org", "North American Treaty Org"] },
  { q: "What does EU stand for?", a: "european union", choices: ["European Union", "European Unity", "Eastern Union", "European Universe"] },
  { q: "Where is the UN headquartered?", a: "new york", choices: ["Geneva", "New York", "Brussels", "Vienna"] },
  { q: "Where is the EU headquartered?", a: "brussels", choices: ["Brussels", "Strasbourg", "Paris", "Berlin"] },
  { q: "What is the world's most spoken second language?", a: "english", choices: ["French", "Spanish", "English", "Mandarin"] },
  { q: "What does WHO stand for?", a: "world health organization", choices: ["World Health Organization", "World Help Organization", "Wide Health Org", "World Hospitals Org"] },
  { q: "Which country has the largest economy (GDP)?", a: "usa", choices: ["China", "USA", "Japan", "Germany"] },
  { q: "Which country has the largest population?", a: "india", choices: ["China", "India", "USA", "Indonesia"] },
  { q: "Which country has the most Nobel laureates?", a: "usa", choices: ["UK", "USA", "Germany", "France"] },
  { q: "What does GDP stand for?", a: "gross domestic product", choices: ["Gross Domestic Product", "General Domestic Production", "Global Direct Profit", "Gross Domestic Profit"] },
  { q: "Which currency does Japan use?", a: "yen", choices: ["Won", "Yen", "Yuan", "Rupee"] },
  { q: "Which currency does China use?", a: "yuan", choices: ["Won", "Yen", "Yuan", "Rupee"] },
  { q: "Which currency does South Korea use?", a: "won", choices: ["Won", "Yen", "Yuan", "Rupee"] },
  { q: "Which currency does India use?", a: "rupee", choices: ["Won", "Yen", "Yuan", "Rupee"] },
  { q: "What is the currency of Switzerland?", a: "swiss franc", choices: ["Euro", "Swiss Franc", "Krone", "Pound"] },
  { q: "Which country has the most pyramids?", a: "sudan", choices: ["Egypt", "Sudan", "Mexico", "Peru"] },
  { q: "Which religion celebrates Diwali?", a: "hinduism", choices: ["Islam", "Hinduism", "Buddhism", "Sikhism"] },
  { q: "Which religion celebrates Ramadan?", a: "islam", choices: ["Islam", "Hinduism", "Christianity", "Judaism"] },
  { q: "Which religion celebrates Hanukkah?", a: "judaism", choices: ["Islam", "Hinduism", "Christianity", "Judaism"] },
  { q: "Which country is shaped like a hexagon (approx)?", a: "france", choices: ["Germany", "France", "Spain", "Italy"] },
  { q: "Which country has koalas in the wild?", a: "australia", choices: ["New Zealand", "Australia", "South Africa", "Indonesia"] },
  { q: "Which country has kiwi birds?", a: "new zealand", choices: ["Australia", "New Zealand", "Fiji", "Samoa"] },
  { q: "Which country invented karate?", a: "japan", choices: ["China", "Japan", "Korea", "Thailand"] },
  { q: "Which country invented taekwondo?", a: "south korea", choices: ["China", "Japan", "South Korea", "Vietnam"] },
  { q: "Which country invented kung fu?", a: "china", choices: ["China", "Japan", "Korea", "Vietnam"] },
  { q: "Where did the marathon originate?", a: "greece", choices: ["Italy", "Greece", "Egypt", "Rome"] },
  { q: "Where did the Olympic Games originate?", a: "greece", choices: ["Italy", "Greece", "Egypt", "England"] },
  { q: "What is the most widely used measuring system in the world?", a: "metric", choices: ["Imperial", "Metric", "US Customary", "Chinese"] },
  { q: "Which country gifted the Statue of Liberty to the USA?", a: "france", choices: ["UK", "France", "Germany", "Italy"] },
  { q: "What is the largest lake by surface area?", a: "caspian sea", choices: ["Lake Superior", "Caspian Sea", "Lake Victoria", "Lake Baikal"] },
  { q: "What is the deepest lake in the world?", a: "lake baikal", choices: ["Lake Superior", "Caspian Sea", "Lake Victoria", "Lake Baikal"] },
  { q: "Which country is home to the Amazon rainforest's largest portion?", a: "brazil", choices: ["Peru", "Brazil", "Colombia", "Venezuela"] },
  { q: "What animal appears on the Australian coat of arms with a kangaroo?", a: "emu", choices: ["Koala", "Emu", "Wombat", "Dingo"] },
  { q: "What does 'SOS' stand for (commonly cited)?", a: "save our souls", choices: ["Save Our Ship", "Save Our Souls", "Send Out Soldiers", "Sound Of Sirens"] }
];
const TRIVIA = TRIVIA_QUESTIONS;
const HANGMAN_WORDS = ["palringo", "javascript", "tangerine", "lighthouse", "keyboard", "elephant", "midnight"];
const HELP = `**Commands**
!help — show this
!roll [NdM] — dice roll (e.g. !roll 2d6)
!flip — coin flip
!slots — spin the slot machine
!fish — cast a line and catch a fish
!dig — dig for gold and diamonds
!wine — order wine & beer by the round 🍷🍺
!trivia — start a trivia question (answer with !a <choice>)
!hangman — start hangman (guess with !g <letter>)
!ludo — start a 1v1 Ludo race (opponent joins with !join, roll with !lr, stop with !stopludo)

!me <action> — roleplay action
!nick <name> — change your display name
!stats — show your level/xp
/mute @user — vote-mute a lower-rank user (5 votes → 5 min mute)
/kick @user — vote-kick a lower-rank user (8 votes → 5 min kick)`;
function roll(spec) {
  const m = spec.match(/^(\d+)d(\d+)$/i);
  if (!m) return "Invalid roll. Try !roll 2d6";
  const n = Math.min(parseInt(m[1]), 20);
  const d = Math.min(parseInt(m[2]), 1e3);
  const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * d));
  const total = rolls.reduce((a, b) => a + b, 0);
  return `🎲 ${spec} → [${rolls.join(", ")}] = **${total}**`;
}
const GAMES_ONLY_CMDS = /* @__PURE__ */ new Set([
  "roll",
  "flip",
  "slots",
  "trivia",
  "a",
  "hangman",
  "g",
  "ludo",
  "join",
  "lr",
  "stopludo",
  "endludo"
]);
const GAMES_CHANNEL_ID = "games";
function runCommand(input, ctx2) {
  const [rawCmd, ...rest] = input.slice(1).split(/\s+/);
  const cmd = rawCmd.toLowerCase();
  const arg = rest.join(" ");
  const game = ctx2.state.games[ctx2.channelId];
  const who = ctx2.actor ? `@${ctx2.actor}` : "You";
  if (GAMES_ONLY_CMDS.has(cmd) && ctx2.channelId !== GAMES_CHANNEL_ID) {
    return { replies: [{ text: `🎮 **!${cmd}** can only be played in the **#games** channel. Head over there to play!` }] };
  }
  switch (cmd) {
    case "help":
      return { replies: [{ text: HELP }] };
    case "roll":
      return { replies: [{ text: roll(arg || "1d6") }] };
    case "flip":
      return { replies: [{ text: `🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}` }] };
    case "dig": {
      const finds = [
        { name: "nothing but dirt", emoji: "🪨", xp: 0, rarity: "nothing" },
        { name: "a few pebbles", emoji: "🪨", xp: 1, rarity: "nothing" },
        { name: "Coal", emoji: "⬛", xp: 2, rarity: "common" },
        { name: "Iron ore", emoji: "⛓️", xp: 4, rarity: "common" },
        { name: "Copper nugget", emoji: "🟫", xp: 5, rarity: "common" },
        { name: "Silver vein", emoji: "🥈", xp: 10, rarity: "uncommon" },
        { name: "Gold nugget", emoji: "🪙", xp: 20, rarity: "rare" },
        { name: "Gold bar", emoji: "🏆", xp: 35, rarity: "rare" },
        { name: "Diamond", emoji: "💎", xp: 60, rarity: "epic" },
        { name: "Flawless Diamond", emoji: "💠", xp: 100, rarity: "legendary" }
      ];
      const weights = { nothing: 30, common: 40, uncommon: 18, rare: 8, epic: 3, legendary: 1 };
      const pool = [];
      finds.forEach((f) => {
        for (let i = 0; i < weights[f.rarity]; i++) pool.push(f);
      });
      const find = pool[Math.floor(Math.random() * pool.length)];
      const tag = find.rarity === "legendary" ? "🌟 **LEGENDARY!**" : find.rarity === "epic" ? "💜 *Epic find*" : find.rarity === "rare" ? "✨ Rare" : find.rarity === "uncommon" ? "Uncommon" : find.rarity === "common" ? "Common" : "—";
      const xpStr = find.xp > 0 ? ` (+${find.xp} XP)` : "";
      const rare = find.rarity === "rare" || find.rarity === "epic" || find.rarity === "legendary";
      return {
        replies: [{ text: `⛏️ ${who} digs deep and unearths ${find.emoji} **${find.name}**${xpStr} — ${tag}`, from: "bot-dig" }],
        ...rare ? { buzz: { reason: `${find.emoji} ${find.name}` } } : {}
      };
    }
    case "slots": {
      const sym = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣"];
      const r = [0, 0, 0].map(() => sym[Math.floor(Math.random() * sym.length)]);
      const win = r[0] === r[1] && r[1] === r[2];
      return { replies: [{ text: `🎰 [ ${r.join(" | ")} ] ${win ? "**JACKPOT!**" : ""}` }] };
    }
    case "fish": {
      const catches = [
        { name: "Tiny Minnow", emoji: "🐟", weight: 0.2, xp: 1, rarity: "common" },
        { name: "Mackerel", emoji: "🐟", weight: 1.4, xp: 3, rarity: "common" },
        { name: "Salmon", emoji: "🐠", weight: 3.2, xp: 5, rarity: "uncommon" },
        { name: "Pufferfish", emoji: "🐡", weight: 1.1, xp: 6, rarity: "uncommon" },
        { name: "Tropical Fish", emoji: "🐠", weight: 0.8, xp: 7, rarity: "rare" },
        { name: "Squid", emoji: "🦑", weight: 4.5, xp: 9, rarity: "rare" },
        { name: "Octopus", emoji: "🐙", weight: 6.7, xp: 12, rarity: "rare" },
        { name: "Lobster", emoji: "🦞", weight: 2.9, xp: 14, rarity: "epic" },
        { name: "Shark", emoji: "🦈", weight: 142, xp: 25, rarity: "epic" },
        { name: "Whale", emoji: "🐋", weight: 8200, xp: 50, rarity: "legendary" },
        { name: "Golden Koi", emoji: "✨🐠", weight: 4.1, xp: 75, rarity: "legendary" }
      ];
      const junk = [
        "🥾 an old boot",
        "🪣 a rusty bucket",
        "🌿 a clump of seaweed",
        "🥫 a tin can",
        "🦴 a strange bone",
        "🫧 just bubbles"
      ];
      if (Math.random() < 0.25) {
        const j = junk[Math.floor(Math.random() * junk.length)];
        return { replies: [{ text: `🎣 ${who} cast a line... and reeled in ${j}. No XP.`, from: "bot-fish" }] };
      }
      const weights = { common: 50, uncommon: 28, rare: 14, epic: 6, legendary: 2 };
      const pool = [];
      catches.forEach((c) => {
        for (let i = 0; i < weights[c.rarity]; i++) pool.push(c);
      });
      const fish = pool[Math.floor(Math.random() * pool.length)];
      const tag = fish.rarity === "legendary" ? "🌟 **LEGENDARY!**" : fish.rarity === "epic" ? "💜 *Epic catch*" : fish.rarity === "rare" ? "💎 Rare" : fish.rarity === "uncommon" ? "Uncommon" : "Common";
      const rare = fish.rarity === "rare" || fish.rarity === "epic" || fish.rarity === "legendary";
      return {
        replies: [{ text: `🎣 ${who} caught a ${fish.emoji} **${fish.name}** — ${fish.weight}kg (+${fish.xp} XP) — ${tag}`, from: "bot-fish" }],
        ...rare ? { buzz: { reason: `${fish.emoji} ${fish.name}` } } : {}
      };
    }
    case "wine": {
      const wines = [
        { name: "House Red", emoji: "🍷", xp: 2, rarity: "common" },
        { name: "House White", emoji: "🥂", xp: 2, rarity: "common" },
        { name: "Rosé", emoji: "🌸🍷", xp: 3, rarity: "common" },
        { name: "Chardonnay", emoji: "🥂", xp: 4, rarity: "uncommon" },
        { name: "Merlot", emoji: "🍷", xp: 5, rarity: "uncommon" },
        { name: "Cabernet Sauvignon", emoji: "🍷", xp: 7, rarity: "rare" },
        { name: "Champagne", emoji: "🍾", xp: 12, rarity: "rare" },
        { name: "Vintage Bordeaux", emoji: "🍷✨", xp: 25, rarity: "epic" },
        { name: "Romanée-Conti 1945", emoji: "🍷👑", xp: 75, rarity: "legendary" }
      ];
      const beers = [
        { name: "Lager", emoji: "🍺", xp: 1, rarity: "common" },
        { name: "Pilsner", emoji: "🍺", xp: 2, rarity: "common" },
        { name: "Pale Ale", emoji: "🍻", xp: 3, rarity: "common" },
        { name: "IPA", emoji: "🍺", xp: 4, rarity: "uncommon" },
        { name: "Wheat Beer", emoji: "🍺🌾", xp: 4, rarity: "uncommon" },
        { name: "Stout", emoji: "🍺", xp: 6, rarity: "rare" },
        { name: "Belgian Trippel", emoji: "🍻", xp: 10, rarity: "rare" },
        { name: "Barrel-Aged Imperial Stout", emoji: "🛢️🍺", xp: 20, rarity: "epic" },
        { name: "Westvleteren 12", emoji: "🍺👑", xp: 60, rarity: "legendary" }
      ];
      const menu = Math.random() < 0.5 ? wines : beers;
      const kind = menu === wines ? "wine" : "beer";
      const weights = { common: 45, uncommon: 30, rare: 15, epic: 8, legendary: 2 };
      const pool = [];
      menu.forEach((d) => {
        for (let i = 0; i < weights[d.rarity]; i++) pool.push(d);
      });
      const drink = pool[Math.floor(Math.random() * pool.length)];
      const qty = 1 + Math.floor(Math.random() * 6);
      const unit = kind === "wine" ? qty === 1 ? "glass" : "glasses" : qty === 1 ? "pint" : "pints";
      const totalXp = drink.xp * qty;
      const tag = drink.rarity === "legendary" ? "🌟 **LEGENDARY POUR!**" : drink.rarity === "epic" ? "💜 *Top shelf*" : drink.rarity === "rare" ? "✨ Rare" : drink.rarity === "uncommon" ? "Uncommon" : "Common";
      const rare = drink.rarity === "rare" || drink.rarity === "epic" || drink.rarity === "legendary";
      return {
        replies: [{ text: `🍷 **WineBot** serves ${who} ${qty} ${unit} of ${drink.emoji} **${drink.name}** — cheers! 🥂 (+${totalXp} XP) — ${tag}`, from: "bot-wine" }],
        ...rare ? { buzz: { reason: `${drink.emoji} ${qty}× ${drink.name}` } } : {}
      };
    }
    case "trivia": {
      if (game && game.type) {
        return { replies: [{ text: `⏳ A **${game.type}** game is already in progress in this room. Jump in and play!` }] };
      }
      const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
      return {
        replies: [{ text: `📚 **Trivia (everyone can answer!):** ${q.q}
${q.choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}
Answer with **!a <number or text>** — first correct wins.` }],
        gameUpdate: { channelId: ctx2.channelId, type: "trivia", data: q }
      };
    }
    case "a": {
      if (!game || game.type !== "trivia") return { replies: [{ text: "No active trivia. Start one with !trivia" }] };
      const q = game.data;
      let guess = arg.toLowerCase().trim();
      const n = parseInt(guess);
      if (!isNaN(n) && q.choices[n - 1]) guess = q.choices[n - 1].toLowerCase();
      const correct = guess === q.a.toLowerCase();
      const answerLabel = q.choices.find((c) => c.toLowerCase() === q.a.toLowerCase());
      if (correct) {
        let nextQ = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        if (nextQ.q === q.q && TRIVIA.length > 1) {
          nextQ = TRIVIA[(TRIVIA.indexOf(q) + 1) % TRIVIA.length];
        }
        return {
          replies: [
            { text: `🏆 **WINNER: ${who}!** 🎉
Correct answer: **${answerLabel}**
Question: _${q.q}_  (+5 XP)` },
            { text: `📚 **Next trivia:** ${nextQ.q}
${nextQ.choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}
Answer with **!a <number or text>**` }
          ],
          gameUpdate: { channelId: ctx2.channelId, type: "trivia", data: nextQ }
        };
      }
      return {
        replies: [{ text: `❌ ${who} guessed wrong — try again! (hint: it's not "${arg}")` }],
        gameUpdate: { channelId: ctx2.channelId, type: "trivia", data: q }
      };
    }
    case "hangman": {
      if (game && game.type) {
        return { replies: [{ text: `⏳ A **${game.type}** game is already in progress in this room. Jump in and play!` }] };
      }
      const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
      return {
        replies: [{ text: `🪢 **Hangman (everyone can guess!):** \`${"_ ".repeat(word.length).trim()}\` (${word.length} letters)
Guess a letter with **!g <letter>**` }],
        gameUpdate: { channelId: ctx2.channelId, type: "hangman", data: { word, guessed: [], wrong: 0 } }
      };
    }
    case "g": {
      if (!game || game.type !== "hangman") return { replies: [{ text: "No active hangman. Start one with !hangman" }] };
      const letter = arg.toLowerCase()[0];
      if (!letter || !/[a-z]/.test(letter)) return { replies: [{ text: "Guess a letter: !g e" }] };
      const data = { ...game.data };
      if (data.guessed.includes(letter)) return { replies: [{ text: `Already guessed **${letter}**` }] };
      data.guessed = [...data.guessed, letter];
      if (!data.word.includes(letter)) data.wrong += 1;
      const mask = data.word.split("").map((c) => data.guessed.includes(c) ? c : "_").join(" ");
      const done = !mask.includes("_");
      const dead = data.wrong >= 6;
      if (done) return { replies: [{ text: `🏆 **WINNER: ${who}!** 🎉
Solved the word: **${data.word}**` }], gameUpdate: { channelId: ctx2.channelId, type: null, data: null } };
      if (dead) return { replies: [{ text: `💀 Hangman over — too many wrong guesses. The word was **${data.word}**` }], gameUpdate: { channelId: ctx2.channelId, type: null, data: null } };
      return {
        replies: [{ text: `\`${mask}\` — wrong: ${data.wrong}/6, used: ${data.guessed.join(" ")}` }],
        gameUpdate: { channelId: ctx2.channelId, type: "hangman", data }
      };
    }
    case "ludo": {
      if (game && game.type) {
        return { replies: [{ text: `⏳ A **${game.type}** game is already in progress in this room.` }] };
      }
      const p1 = ctx2.actor || "Player 1";
      return {
        replies: [{ text: `🎲 **Ludo 1v1 (short)** started by **@${p1}**!
Track: 20 squares. Roll a 6 for an extra turn. Land on opponent → send them back to start. Exact roll needed to finish.
Opponent: type **!join** to accept, then **!lr** to roll on your turn.` }],
        gameUpdate: { channelId: ctx2.channelId, type: "ludo", data: { players: [{ name: p1, pos: 0 }], turn: 0, waiting: true } }
      };
    }
    case "join": {
      if (!game || game.type !== "ludo") return { replies: [{ text: "No Ludo game to join. Start one with !ludo" }] };
      const d = { ...game.data };
      if (!d.waiting) return { replies: [{ text: "This Ludo game is already full." }] };
      const p2 = ctx2.actor || "Player 2";
      if (d.players[0].name === p2) return { replies: [{ text: "You can't join your own game — wait for someone else!" }] };
      d.players = [...d.players, { name: p2, pos: 0 }];
      d.waiting = false;
      d.turn = 0;
      return {
        replies: [{ text: `🎲 **@${p2}** joined! Match on: **@${d.players[0].name}** 🆚 **@${p2}**
It's **@${d.players[0].name}**'s turn — type **!lr** to roll.` }],
        gameUpdate: { channelId: ctx2.channelId, type: "ludo", data: d }
      };
    }
    case "stopludo":
    case "endludo": {
      if (!game || game.type !== "ludo") return { replies: [{ text: "No active Ludo game to stop." }] };
      const starter = game.data?.players?.[0]?.name;
      const me = ctx2.actor || "";
      if (starter && me && starter !== me) {
        return { replies: [{ text: `🛑 Only **@${starter}** (who started the game) can stop it.` }] };
      }
      return {
        replies: [{ text: `🛑 Ludo game stopped by **@${me || starter}**.` }],
        gameUpdate: { channelId: ctx2.channelId, type: null, data: null }
      };
    }
    case "lr": {
      if (!game || game.type !== "ludo") return { replies: [{ text: "No Ludo game. Start one with !ludo" }] };
      const d = { ...game.data, players: game.data.players.map((p) => ({ ...p })) };
      if (d.waiting) return { replies: [{ text: "Waiting for an opponent — type **!join**." }] };
      const me = ctx2.actor || "";
      const cur = d.players[d.turn];
      if (me && cur.name !== me) return { replies: [{ text: `⏳ It's **@${cur.name}**'s turn, not yours.` }] };
      const opp = d.players[1 - d.turn];
      const die = 1 + Math.floor(Math.random() * 6);
      const FINISH = 20;
      let msg = `🎲 **@${cur.name}** rolled a **${die}**`;
      const target = cur.pos + die;
      if (target > FINISH) {
        msg += ` — overshoots ${FINISH}, stays at ${cur.pos}.`;
      } else {
        cur.pos = target;
        msg += ` → moves to square **${cur.pos}/${FINISH}**.`;
        if (cur.pos === opp.pos && cur.pos !== 0 && cur.pos !== FINISH) {
          opp.pos = 0;
          msg += ` 💥 Sends **@${opp.name}** back to start!`;
        }
        if (cur.pos === FINISH) {
          msg += `
🏆 **WINNER: @${cur.name}!** 🎉 (+15 XP)`;
          return { replies: [{ text: msg }], gameUpdate: { channelId: ctx2.channelId, type: null, data: null } };
        }
      }
      const extra = die === 6;
      if (!extra) d.turn = 1 - d.turn;
      else msg += ` 🎉 Rolled a 6 — **extra turn**!`;
      const board = (p) => {
        const cells = Array.from({ length: FINISH + 1 }, (_, i) => i === p.pos ? "●" : "·").join("");
        return `\`${cells}\` (${p.pos}/${FINISH})`;
      };
      msg += `
**@${d.players[0].name}** ${board(d.players[0])}
**@${d.players[1].name}** ${board(d.players[1])}
Next: **@${d.players[d.turn].name}** — type **!lr**`;
      return { replies: [{ text: msg }], gameUpdate: { channelId: ctx2.channelId, type: "ludo", data: d } };
    }
    case "stats": {
      const me = ctx2.state.me;
      return { replies: [{ text: `📊 **${me.name}** — Level ${me.level}, XP ${me.xp}` }] };
    }
    case "nick": {
      if (!arg) return { replies: [{ text: "Usage: !nick <new name>" }] };
      return { replies: [{ text: `Use the profile menu to rename. Suggested: **${arg}**` }] };
    }
    case "me": {
      if (!arg) return { replies: [{ text: "Usage: !me <action>" }] };
      return { replies: [{ text: `_* ${ctx2.state.me.name} ${arg} *_` }] };
    }
    case "mute":
    case "kick": {
      const targetName = arg.replace(/^@/, "").trim().split(/\s+/)[0];
      if (!targetName) return { replies: [{ text: `Usage: /${cmd} @username` }] };
      const users = ctx2.state.users;
      const me = ctx2.state.me;
      const target = Object.values(users).find(
        (u) => u.id !== "me" && u.name.toLowerCase() === targetName.toLowerCase()
      );
      if (!target) return { replies: [{ text: `❓ User **@${targetName}** not found here.` }] };
      const meBadges = (me.badges ?? []).length;
      const targetBadges = (target.badges ?? []).length;
      if (meBadges <= targetBadges) {
        return { replies: [{ text: `🛡️ ${who} can't /${cmd} **@${target.name}** — your rank (${meBadges} 🏅) must be higher than theirs (${targetBadges} 🏅).` }] };
      }
      return {
        replies: [],
        moderation: { targetId: target.id, targetName: target.name, action: cmd, actorBadges: meBadges, targetBadges }
      };
    }
  }
  return { replies: [{ text: `Unknown command: !${cmd}. Try !help` }] };
}
const BADGES = [
  {
    id: "first_message",
    name: "First Words",
    emoji: "💬",
    tier: "bronze",
    description: "Send your first message",
    check: (u) => (u.messageCount ?? 0) >= 1
  },
  {
    id: "chatterbox",
    name: "Chatterbox",
    emoji: "🗣️",
    tier: "silver",
    description: "Send 50 messages",
    check: (u) => (u.messageCount ?? 0) >= 50
  },
  {
    id: "veteran",
    name: "Veteran",
    emoji: "🎖️",
    tier: "gold",
    description: "Send 500 messages",
    check: (u) => (u.messageCount ?? 0) >= 500
  },
  {
    id: "level_5",
    name: "Rising Star",
    emoji: "⭐",
    tier: "bronze",
    description: "Reach level 5",
    check: (u) => u.level >= 5
  },
  {
    id: "level_10",
    name: "Hot Streak",
    emoji: "🌟",
    tier: "silver",
    description: "Reach level 10",
    check: (u) => u.level >= 10
  },
  {
    id: "level_25",
    name: "Legend",
    emoji: "👑",
    tier: "legendary",
    description: "Reach level 25",
    check: (u) => u.level >= 25
  },
  {
    id: "streak_3",
    name: "Warmed Up",
    emoji: "🔥",
    tier: "bronze",
    description: "3-day streak",
    check: (u) => (u.streak ?? 0) >= 3 || (u.longestStreak ?? 0) >= 3
  },
  {
    id: "streak_7",
    name: "On Fire",
    emoji: "🔥🔥",
    tier: "silver",
    description: "7-day streak",
    check: (u) => (u.streak ?? 0) >= 7 || (u.longestStreak ?? 0) >= 7
  },
  {
    id: "streak_30",
    name: "Unstoppable",
    emoji: "💥",
    tier: "legendary",
    description: "30-day streak",
    check: (u) => (u.streak ?? 0) >= 30 || (u.longestStreak ?? 0) >= 30
  },
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    tier: "bronze",
    description: "Join 3+ rooms",
    check: (_, c) => c.roomsJoined >= 3
  },
  {
    id: "social",
    name: "Social Butterfly",
    emoji: "🦋",
    tier: "silver",
    description: "Start a direct message",
    check: (_, c) => c.dmsStarted >= 1
  },
  {
    id: "gamer",
    name: "Gamer",
    emoji: "🎮",
    tier: "silver",
    description: "Use 10 chat commands",
    check: (u) => (u.commandCount ?? 0) >= 10
  }
];
const BADGE_MAP = Object.fromEntries(
  BADGES.map((b) => [b.id, b])
);
const TIER_COLOR = {
  bronze: "from-amber-500/20 to-amber-700/10 text-amber-700 dark:text-amber-300 border-amber-600/40",
  silver: "from-slate-400/25 to-slate-500/10 text-slate-700 dark:text-slate-200 border-slate-400/50",
  gold: "from-yellow-400/25 to-yellow-600/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/50",
  legendary: "from-fuchsia-500/25 to-violet-600/15 text-fuchsia-700 dark:text-fuchsia-200 border-fuchsia-500/50"
};
function evaluateBadges(u, ctx2) {
  const earned = new Set(u.badges ?? []);
  for (const b of BADGES) if (b.check(u, ctx2)) earned.add(b.id);
  return [...earned];
}
function todayKey(d = /* @__PURE__ */ new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBetween(a, b) {
  const da = /* @__PURE__ */ new Date(a + "T00:00:00");
  const db = /* @__PURE__ */ new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 864e5);
}
const MAX_EVENTS = 200;
let nextId = 1;
const buffer = [];
const listeners$2 = /* @__PURE__ */ new Set();
const rtCounters = {
  wsConnects: 0,
  wsDisconnects: 0,
  channelSubs: 0,
  channelErrors: 0,
  presenceJoins: 0,
  presenceLeaves: 0,
  dmIn: 0,
  dmOut: 0,
  msgIn: 0,
  heartbeats: 0,
  lastHeartbeatAt: 0,
  wsState: "unknown"
};
function notify() {
  for (const l of listeners$2) l(buffer);
}
function rtLog(kind, label, detail) {
  const evt = { id: nextId++, ts: Date.now(), kind, label, detail };
  buffer.push(evt);
  if (buffer.length > MAX_EVENTS) buffer.splice(0, buffer.length - MAX_EVENTS);
  switch (kind) {
    case "ws":
      rtCounters.wsState = label;
      if (label === "open" || label === "SUBSCRIBED") rtCounters.wsConnects++;
      if (label === "close" || label === "CHANNEL_ERROR" || label === "TIMED_OUT") rtCounters.wsDisconnects++;
      break;
    case "channel":
      if (label.startsWith("subscribe")) rtCounters.channelSubs++;
      if (label.includes("error")) rtCounters.channelErrors++;
      break;
    case "presence":
      if (label === "join") rtCounters.presenceJoins++;
      else if (label === "leave") rtCounters.presenceLeaves++;
      break;
    case "dm":
      if (label === "in") rtCounters.dmIn++;
      else if (label === "out") rtCounters.dmOut++;
      break;
    case "msg":
      rtCounters.msgIn++;
      break;
    case "heartbeat":
      rtCounters.heartbeats++;
      rtCounters.lastHeartbeatAt = evt.ts;
      break;
  }
  notify();
}
function rtSubscribe(cb) {
  listeners$2.add(cb);
  cb(buffer);
  return () => listeners$2.delete(cb);
}
function rtClear() {
  buffer.length = 0;
  notify();
}
const STORAGE_KEY = "palrgo:rt-debug";
function isRtDebugEnabled() {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).has("debug")) return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function setRtDebugEnabled(enabled) {
  try {
    if (enabled) ;
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("palrgo:rt-debug-toggle"));
  } catch {
  }
}
const ONLINE_WINDOW_MS = 75 * 1e3;
const PRESENCE_CHANNEL = "online-users-presence";
function toUser(p, presentIds, nowMs) {
  const isGuest = /^guest-/i.test(p.username);
  const isBot = !!p.is_bot;
  const g = p.gender;
  const gender = g === "male" || g === "female" || g === "other" ? g : void 0;
  const dbLastSeenMs = p.last_seen ? new Date(p.last_seen).getTime() : void 0;
  const isPresent = presentIds.has(p.id);
  const lastSeenMs = isPresent ? nowMs : dbLastSeenMs;
  const rawStatus = p.status || "offline";
  const fresh = lastSeenMs != null && nowMs - lastSeenMs < ONLINE_WINDOW_MS;
  const status = isBot ? rawStatus === "offline" ? "offline" : "online" : isPresent ? "online" : rawStatus === "offline" ? "offline" : fresh ? rawStatus : "offline";
  return {
    id: p.id,
    name: p.username,
    avatarColor: p.avatar_color,
    avatarUrl: p.avatar_url ?? void 0,
    status,
    bio: p.bio ?? void 0,
    aboutMe: p.about_me ?? void 0,
    xp: p.xp,
    level: p.level,
    coins: p.coins ?? 0,
    streak: p.streak ?? 0,
    longestStreak: p.longest_streak ?? 0,
    lastSeen: isBot ? nowMs : lastSeenMs,
    isGuest,
    isBot,
    gender,
    countryCode: p.country_code ?? void 0,
    showCountryFlag: p.show_country_flag ?? true,
    showGuestBadge: p.show_guest_badge ?? true,
    birthday: p.birthday ?? void 0,
    hideBirthYear: p.hide_birth_year ?? false
  };
}
let snapshot = {
  rawProfiles: {},
  presentIds: /* @__PURE__ */ new Set(),
  loading: true,
  tick: 0
};
const listeners$1 = /* @__PURE__ */ new Set();
let refCount = 0;
let profilesChannel = null;
let presenceChannel = null;
let authSub = null;
let tickInterval = null;
let refetchInterval = null;
let focusListener = null;
let initialized = false;
function emit$1() {
  for (const l of listeners$1) l();
}
function setSnap(patch) {
  snapshot = { ...snapshot, ...patch };
  emit$1();
}
async function joinPresence(userId) {
  if (presenceChannel) {
    await supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
  for (const c of supabase.getChannels()) {
    if (c.topic === `realtime:${PRESENCE_CHANNEL}`) {
      await supabase.removeChannel(c);
    }
  }
  const ch = supabase.channel(PRESENCE_CHANNEL, {
    config: { presence: { key: userId } }
  });
  const recompute = (event) => {
    const state = ch.presenceState();
    const ids = new Set(Object.keys(state));
    setSnap({ presentIds: ids });
    if (event !== "sync") rtLog("presence", event, `${ids.size} online`);
  };
  ch.on("presence", { event: "sync" }, () => recompute("sync")).on("presence", { event: "join" }, () => recompute("join")).on("presence", { event: "leave" }, () => recompute("leave")).subscribe(async (status) => {
    rtLog("ws", status, "presence");
    if (status === "SUBSCRIBED") {
      await ch.track({ online_at: (/* @__PURE__ */ new Date()).toISOString() });
    }
  });
  presenceChannel = ch;
}
async function refetchAll() {
  const { data, error } = await supabase.from("profiles_directory").select(
    "id, username, bio, about_me, avatar_url, avatar_color, xp, level, streak, longest_streak, status, last_seen, gender, country_code, show_country_flag, show_guest_badge, birthday, hide_birth_year, is_bot, is_official"
  ).order("username", { ascending: true });
  if (error) return;
  const map = {};
  (data ?? []).forEach((p) => {
    map[p.id] = p;
  });
  setSnap({ rawProfiles: map, loading: false });
}
async function startStore() {
  if (initialized) return;
  initialized = true;
  await refetchAll();
  profilesChannel = supabase.channel("profiles-directory-singleton").on(
    "postgres_changes",
    { event: "*", schema: "public", table: "profiles" },
    (payload) => {
      const next = { ...snapshot.rawProfiles };
      if (payload.eventType === "DELETE") {
        const id = payload.old.id;
        delete next[id];
      } else {
        const row = payload.new;
        next[row.id] = row;
      }
      setSnap({ rawProfiles: next });
    }
  ).subscribe((status) => rtLog("ws", status, "profiles-directory"));
  const { data: u } = await supabase.auth.getUser();
  if (u.user?.id) await joinPresence(u.user.id);
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.id) void joinPresence(session.user.id);
  });
  authSub = sub.subscription;
  tickInterval = window.setInterval(() => {
    setSnap({ tick: snapshot.tick + 1 });
  }, 1e4);
  refetchInterval = window.setInterval(() => {
    void refetchAll();
  }, 6e4);
  focusListener = () => {
    if (document.visibilityState === "visible") void refetchAll();
  };
  window.addEventListener("focus", focusListener);
  document.addEventListener("visibilitychange", focusListener);
}
async function stopStore() {
  initialized = false;
  if (profilesChannel) {
    await supabase.removeChannel(profilesChannel);
    profilesChannel = null;
  }
  if (presenceChannel) {
    await supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
  if (authSub) {
    authSub.unsubscribe();
    authSub = null;
  }
  if (tickInterval != null) {
    window.clearInterval(tickInterval);
    tickInterval = null;
  }
  if (refetchInterval != null) {
    window.clearInterval(refetchInterval);
    refetchInterval = null;
  }
  if (focusListener) {
    window.removeEventListener("focus", focusListener);
    document.removeEventListener("visibilitychange", focusListener);
    focusListener = null;
  }
}
function subscribe(cb) {
  listeners$1.add(cb);
  refCount += 1;
  if (refCount === 1) void startStore();
  return () => {
    listeners$1.delete(cb);
    refCount -= 1;
    if (refCount === 0) {
      setTimeout(() => {
        if (refCount === 0) void stopStore();
      }, 1e3);
    }
  };
}
function getSnapshot() {
  return snapshot;
}
function useRemoteProfiles() {
  const snap = reactExports.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [, setNow] = reactExports.useState(0);
  reactExports.useEffect(() => {
    setNow(Date.now());
  }, [snap.tick]);
  const now = Date.now();
  const profiles = {};
  for (const id in snap.rawProfiles) {
    profiles[id] = toUser(snap.rawProfiles[id], snap.presentIds, now);
  }
  return { profiles, loading: snap.loading };
}
const SOUND_PREFS_DEFAULTS = {
  public_chat: true,
  private_chat: true,
  notifications: true,
  username_mention: true,
  calls: true,
  radio_announcements: true
};
const LS_KEY = "palrgo:sound-prefs";
let cache = SOUND_PREFS_DEFAULTS;
function readLs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SOUND_PREFS_DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...SOUND_PREFS_DEFAULTS, ...parsed };
  } catch {
    return SOUND_PREFS_DEFAULTS;
  }
}
if (typeof window !== "undefined") cache = readLs();
function getSoundPrefs() {
  return cache;
}
function canPlaySound(kind) {
  return cache[kind] !== false;
}
async function setSoundPref(kind, value) {
  cache = { ...cache, [kind]: value };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ sound_prefs: cache }).eq("id", user.id);
  } catch {
  }
  window.dispatchEvent(new CustomEvent("palrgo:sound-prefs-change"));
}
async function hydrateSoundPrefsFromServer() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("sound_prefs").eq("id", user.id).maybeSingle();
    const remote = data?.sound_prefs ?? {};
    cache = { ...SOUND_PREFS_DEFAULTS, ...remote };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(cache));
    } catch {
    }
    window.dispatchEvent(new CustomEvent("palrgo:sound-prefs-change"));
  } catch {
  }
}
function useSoundPrefs() {
  const [, force] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const f = () => force((n) => n + 1);
    window.addEventListener("palrgo:sound-prefs-change", f);
    return () => window.removeEventListener("palrgo:sound-prefs-change", f);
  }, []);
  return cache;
}
const soundPrefs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SOUND_PREFS_DEFAULTS,
  canPlaySound,
  getSoundPrefs,
  hydrateSoundPrefsFromServer,
  setSoundPref,
  useSoundPrefs
}, Symbol.toStringTag, { value: "Module" }));
let ctx = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}
function gated(kind, fn) {
  if (!canPlaySound(kind)) return;
  fn();
}
function playDmPing() {
  gated("private_chat", () => {
    const ac = getCtx();
    if (!ac) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      const tones = [880, 1320];
      tones.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.28, now + i * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(1e-4, now + i * 0.08 + 0.22);
        osc.connect(gain).connect(ac.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch {
    }
  });
}
function playMentionPing() {
  gated("username_mention", () => {
    const ac = getCtx();
    if (!ac) return;
    try {
      if (ac.state === "suspended") ac.resume();
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1900, now + 0.12);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.22);
      osc.connect(gain).connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
    }
  });
}
const gamebotImg = "/assets/gamebot-nSsQX7Sz.png";
const novaImg = "/assets/nova-DRsJ4Ch_.png";
const pixelImg = "/assets/pixel-BNCMGLDZ.png";
const echoImg = "/assets/echo-Bzt7xQqn.png";
const ryzeImg = "/assets/ryze-DK8ePVBZ.png";
const digbotImg = "/assets/digbot-CIH-xchR.png";
const fishbotImg = "/assets/fishbot-am68VkVU.png";
const wineImg = "/assets/wine-BHEWvso-.png";
const spambotImg = "/assets/spambot-DPDcjNMf.png";
const DEFAULT_BOT_EVENT = {
  enabled: true,
  interval_min: 30,
  duration_min: 5,
  max_attempts: 1,
  bonus_enabled: true,
  bonus_chance: 0.1
};
const DEFAULT_BOT_EVENTS_CONFIG = {
  fish: { ...DEFAULT_BOT_EVENT },
  dig: { ...DEFAULT_BOT_EVENT, interval_min: 45 },
  wine: { ...DEFAULT_BOT_EVENT, interval_min: 60 }
};
const BOT_EVENT_META = {
  fish: { label: "Fish Event", emoji: "🐟", botId: "bot-fish", command: "!fish", goldenLabel: "Golden Fish" },
  dig: { label: "Dig Event", emoji: "⛏️", botId: "bot-dig", command: "!dig", goldenLabel: "Golden Dig" },
  wine: { label: "Wine Event", emoji: "🍷", botId: "bot-wine", command: "!wine", goldenLabel: "Happy Hour" }
};
function normalizeConfig(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const one = (k) => ({
    ...DEFAULT_BOT_EVENTS_CONFIG[k],
    ...src[k] || {}
  });
  return { fish: one("fish"), dig: one("dig"), wine: one("wine") };
}
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
function computeEventState(kind, cfg, now = Date.now()) {
  const intervalMs = Math.max(1, cfg.interval_min) * 6e4;
  const durationMs = Math.max(1, Math.min(cfg.duration_min, cfg.interval_min)) * 6e4;
  const cycleIndex = Math.floor(now / intervalMs);
  const opensAt = cycleIndex * intervalMs;
  const closesAt = opensAt + durationMs;
  const live = cfg.enabled && now >= opensAt && now < closesAt;
  const nextOpensAt = live ? opensAt : (cycleIndex + (now >= closesAt ? 1 : 0)) * intervalMs;
  const cycleId = `${kind}:${cycleIndex}`;
  const golden = cfg.bonus_enabled && hashStr(cycleId) < Math.max(0, Math.min(1, cfg.bonus_chance));
  return {
    kind,
    live,
    cycleId,
    cycleIndex,
    opensAt,
    closesAt,
    msUntilOpen: live ? 0 : Math.max(0, nextOpensAt - now),
    msUntilClose: live ? Math.max(0, closesAt - now) : 0,
    golden
  };
}
const PART_KEY = (userKey) => `palrgo:bot-events:participated:${userKey}`;
function readPart(userKey) {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PART_KEY(userKey)) || "{}");
  } catch {
    return {};
  }
}
function writePart(userKey, map) {
  if (typeof window === "undefined") return;
  const entries = Object.entries(map);
  if (entries.length > 200) {
    entries.sort((a, b) => Number(a[0].split(":")[1]) - Number(b[0].split(":")[1]));
    const pruned = Object.fromEntries(entries.slice(-200));
    try {
      window.localStorage.setItem(PART_KEY(userKey), JSON.stringify(pruned));
    } catch {
    }
    return;
  }
  try {
    window.localStorage.setItem(PART_KEY(userKey), JSON.stringify(map));
  } catch {
  }
}
function getAttempts(userKey, cycleId) {
  return readPart(userKey)[cycleId] ?? 0;
}
function recordAttempt(userKey, cycleId) {
  const map = readPart(userKey);
  map[cycleId] = (map[cycleId] ?? 0) + 1;
  writePart(userKey, map);
  return map[cycleId];
}
let CURRENT_CONFIG = DEFAULT_BOT_EVENTS_CONFIG;
function setBotEventsConfig(cfg) {
  CURRENT_CONFIG = cfg;
}
function getBotEventsConfig() {
  return CURRENT_CONFIG;
}
class ChatErrorBoundary extends reactExports.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error(`[ChatErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info);
    try {
      this.props.onRecover?.();
    } catch (recoverErr) {
      console.error("[ChatErrorBoundary] recovery failed", recoverErr);
    }
  }
  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "Chat unavailable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Something went wrong loading messages. The rest of the app should still work." })
      ] });
    }
    return this.props.children;
  }
}
const CHAT_STORAGE_VERSION = 4;
const CHAT_STORAGE_KEY_BASE = `palrgo:state:v${CHAT_STORAGE_VERSION}`;
const CHAT_SYNC_CHANNEL = `palrgo:sync:v${CHAT_STORAGE_VERSION}`;
const LEGACY_CHAT_STORAGE_KEYS = ["palrgo:state:v3", "palrgo:state:v2"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}
function isLocalBotPeerId(id) {
  return id.startsWith("bot-");
}
function isBotUiId(id) {
  return id === "me" || isLocalBotPeerId(id);
}
function isLocalBotDmChannel(channelId) {
  if (!channelId.startsWith("dm:")) return false;
  const rest = channelId.slice(3);
  if (rest.includes(":")) return false;
  return rest.startsWith("bot-") || isBotUiId(rest);
}
function isValidUserDmChannel(channelId) {
  if (!channelId.startsWith("dm:")) return false;
  const parts = channelId.slice(3).split(":");
  if (parts.length !== 2) return false;
  return isUuid(parts[0]) && isUuid(parts[1]);
}
function isRemoteDmChannel(channelId, authUserId) {
  if (!authUserId || !isUuid(authUserId) || !isValidUserDmChannel(channelId)) return false;
  const parts = channelId.slice(3).split(":");
  return parts[0] === authUserId || parts[1] === authUserId;
}
function buildDmChannel(currentUserId, targetUserId) {
  if (!isUuid(currentUserId) || !isUuid(targetUserId)) return null;
  if (currentUserId === targetUserId) return null;
  const participantIds = [currentUserId, targetUserId].sort();
  return `dm:${participantIds[0]}:${participantIds[1]}`;
}
function localBotDmChannel(botId) {
  return `dm:${botId}`;
}
function dmChannelFor(meId, peerId) {
  if (peerId === "me") return null;
  if (isLocalBotPeerId(peerId)) return localBotDmChannel(peerId);
  if (!meId || !isUuid(meId) || !isUuid(peerId)) return null;
  return buildDmChannel(meId, peerId);
}
function parseDmChannel(channelId, authUserId) {
  if (isLocalBotDmChannel(channelId)) {
    return { peerId: channelId.slice(3), valid: true };
  }
  if (!isValidUserDmChannel(channelId)) {
    return { peerId: null, valid: false };
  }
  const parts = channelId.slice(3).split(":");
  if (authUserId && isUuid(authUserId)) {
    const peer = parts[0] === authUserId ? parts[1] : parts[1] === authUserId ? parts[0] : null;
    return { peerId: peer, valid: !!peer };
  }
  return { peerId: parts[0], valid: true };
}
function fixLegacyDmChannel(channelId, authUserId) {
  if (!channelId.startsWith("dm:") || !authUserId || !isUuid(authUserId)) return null;
  const parts = channelId.slice(3).split(":");
  if (parts.length === 2) {
    if (parts[0] === "me" && isUuid(parts[1])) return buildDmChannel(authUserId, parts[1]);
    if (parts[1] === "me" && isUuid(parts[0])) return buildDmChannel(authUserId, parts[0]);
  }
  if (parts.length === 1 && isUuid(parts[0]) && parts[0] !== authUserId) {
    return buildDmChannel(authUserId, parts[0]);
  }
  return null;
}
function sanitizeDmOrder(dmOrder, authUserId) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const id of dmOrder ?? []) {
    if (id === "me") continue;
    if (isUuid(id)) {
      if (authUserId && id === authUserId) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      continue;
    }
    if (isBotUiId(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
function sanitizeActiveChannel(activeChannel, authUserId, roomOrder, rooms) {
  if (activeChannel === "lobby" || activeChannel === "games") return activeChannel;
  if (rooms[activeChannel]) return activeChannel;
  if (isLocalBotDmChannel(activeChannel)) return activeChannel;
  if (isRemoteDmChannel(activeChannel, authUserId)) return activeChannel;
  const fixed = fixLegacyDmChannel(activeChannel, authUserId);
  if (fixed && isRemoteDmChannel(fixed, authUserId)) return fixed;
  return roomOrder[0] || "lobby";
}
function sanitizeChatState(state, authUserId) {
  const dmOrder = sanitizeDmOrder(state.dmOrder, authUserId);
  const activeChannel = sanitizeActiveChannel(
    state.activeChannel,
    authUserId,
    state.roomOrder,
    state.rooms
  );
  if (dmOrder === state.dmOrder && activeChannel === state.activeChannel) return state;
  return { ...state, dmOrder, activeChannel };
}
function storageKeyForUsername(username) {
  return `${CHAT_STORAGE_KEY_BASE}:${username.toLowerCase()}`;
}
function showDmParticipantError(message) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("palrgo:toast", { detail: { message } }));
}
function resolveDmTargetId(id, profiles) {
  if (!id || id === "me" || isBotUiId(id)) return null;
  if (isUuid(id)) return id;
  const fromProfiles = profiles?.[id]?.id;
  return isUuid(fromProfiles) ? fromProfiles : null;
}
const STORE_PREFIXES = {
  chat: [CHAT_STORAGE_KEY_BASE, "palrgo:sync:v"],
  "feed-prefs": ["palrgo:feed-prefs"]
};
function resetFeatureState(feature) {
  if (typeof window === "undefined") return;
  const prefixes = STORE_PREFIXES[feature];
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (prefixes.some((p) => k.startsWith(p))) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
    logger.info("Reset corrupted feature state", { feature, keysRemoved: keys.length });
  } catch (err) {
    logger.error("Failed to reset feature state", err, { feature });
  }
}
function removeCorruptedKey(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    logger.info("Removed corrupted localStorage key", { key });
  } catch {
  }
}
function normalizeRoomGameConfig(game) {
  if (!game) return void 0;
  const type = canonicalGameType(game.type);
  return type ? { ...game, type } : game;
}
function isRemoteChannel(channelId, meId) {
  if (channelId === "lobby" || channelId === "games") return true;
  return isRemoteDmChannel(channelId, meId);
}
function rowToMessage(row, meAuthUuid) {
  const authorId = meAuthUuid && row.author_id === meAuthUuid ? "me" : row.author_id;
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId,
    text: row.text || "",
    ts: new Date(row.created_at).getTime(),
    kind: row.kind || "text",
    attachment: row.attachment ?? void 0,
    replyToId: row.reply_to_id ?? void 0
  };
}
function newUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
}
function storageKeyFor(username) {
  return storageKeyForUsername(username);
}
const SEED_TIME = 17e11;
const AVATAR_COLORS = [
  "oklch(0.7 0.15 25)",
  "oklch(0.7 0.15 75)",
  "oklch(0.7 0.15 145)",
  "oklch(0.7 0.15 195)",
  "oklch(0.7 0.15 255)",
  "oklch(0.7 0.15 305)",
  "oklch(0.75 0.13 50)",
  "oklch(0.7 0.18 340)"
];
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
const MAX_LEVEL = 999;
function xpToLevel(xp) {
  return Math.min(MAX_LEVEL, Math.floor(xp / 50) + 1);
}
function isPlaceholderName(name) {
  const cleaned = (name || "").trim().toLowerCase();
  return !cleaned || cleaned === "you";
}
function generateUsername() {
  return `user${Math.floor(1e3 + Math.random() * 9e3)}`;
}
function normalizeMe(state, fallbackName = generateUsername()) {
  if (state.me.name === fallbackName && !isPlaceholderName(state.me.name)) return state;
  const me = { ...state.me, name: fallbackName };
  const messages = Object.fromEntries(
    Object.entries(state.messages || {}).map(([channelId, msgs]) => [
      channelId,
      msgs.map((message) => ({ ...message, text: message.text.replace(/@You\b/g, `@${fallbackName}`) }))
    ])
  );
  return { ...state, me, users: { ...state.users, me: { ...state.users.me, name: fallbackName } }, messages };
}
const BOT_COMMANDS = {
  "bot-gamebot": {
    tagline: "🎮 Master of ceremonies — runs every game in the lobby.",
    commands: ["!help — list every command", "!trivia — start a trivia round", "!a <choice> — answer trivia", "!hangman — start hangman", "!g <letter> — guess a letter", "!roll [NdS] — roll dice", "!flip — coin flip", "!slots — spin the slot machine", "!me <action> — roleplay", "!stats — your level & XP"]
  },
  "bot-nova": {
    tagline: "💬 Casual chatter — loves small talk and trivia nights.",
    commands: ["!trivia — start a trivia round", "!a <choice> — answer trivia", "!me <action> — roleplay", "!stats — show your stats"]
  },
  "bot-pixel": {
    tagline: "🧠 Trivia addict — challenge me anytime.",
    commands: ["!trivia — start a trivia round", "!a <choice> — answer trivia", "!hangman — start hangman", "!g <letter> — guess a letter"]
  },
  "bot-echo": {
    tagline: "🔁 Echoes vibes back to you.",
    commands: ["!me <action> — roleplay", "!flip — coin flip", "!roll — roll dice"]
  },
  "bot-ryze": {
    tagline: "🛡️ Mod & gamer — keeps the lobby in check.",
    commands: ["/mute @user — vote-mute (5 votes → 5 min)", "/kick @user — vote-kick (8 votes → 5 min)", "!trivia — start a trivia round", "!hangman — start hangman", "!roll — roll dice", "!stats — show stats"]
  },
  "bot-dig": {
    tagline: "⛏️ Digs all day for gold, gems and rare loot.",
    commands: ["!dig — dig for treasure", "!stats — show stats"]
  },
  "bot-fish": {
    tagline: "🎣 Casts lines from sunrise to sunset.",
    commands: ["!fish — cast a line", "!stats — show stats"]
  },
  "bot-wine": {
    tagline: "🍷 Pours wine & beer by the round.",
    commands: ["!wine — order a round of wine or beer 🍷🍺"]
  },
  "bot-spam": {
    tagline: "🛑 Anti-spam guardian — auto-warns and mutes spammers.",
    commands: ["Watches for flooding, duplicate spam, ALL-CAPS shouting and link spam — no commands needed."]
  }
};
function bioFor(id, fallback) {
  const b = BOT_COMMANDS[id];
  if (!b) return fallback;
  return `${b.tagline}
Commands: ${b.commands.map((c) => c.split(" — ")[0]).join(", ")}`;
}
const SEED_BOTS = [
  { id: "bot-gamebot", name: "GameBot", avatarColor: "oklch(0.78 0.13 195)", avatarUrl: gamebotImg, status: "online", isBot: true, xp: 9999, level: 99, bio: bioFor("bot-gamebot", "Run !help to see games"), streak: 30, longestStreak: 99, messageCount: 1200, badges: ["first_message", "chatterbox", "veteran", "level_5", "level_10", "level_25", "streak_3", "streak_7", "streak_30", "gamer"] },
  { id: "bot-nova", name: "Nova", avatarColor: AVATAR_COLORS[3], avatarUrl: novaImg, status: "online", isBot: true, xp: 1240, level: 12, bio: bioFor("bot-nova", "Casual chatter"), streak: 5, longestStreak: 12, messageCount: 320, badges: ["first_message", "chatterbox", "level_5", "level_10", "streak_3"] },
  { id: "bot-pixel", name: "Pixel", avatarColor: AVATAR_COLORS[5], avatarUrl: pixelImg, status: "online", isBot: true, xp: 880, level: 9, bio: bioFor("bot-pixel", "Trivia addict"), streak: 2, longestStreak: 8, messageCount: 210, badges: ["first_message", "chatterbox", "level_5", "streak_3", "gamer"] },
  { id: "bot-echo", name: "Echo", avatarColor: AVATAR_COLORS[1], avatarUrl: echoImg, status: "away", isBot: true, xp: 410, level: 5, bio: bioFor("bot-echo", "Echoes vibes"), streak: 1, longestStreak: 4, messageCount: 88, badges: ["first_message", "chatterbox", "level_5"] },
  { id: "bot-ryze", name: "Ryze", avatarColor: AVATAR_COLORS[0], avatarUrl: ryzeImg, status: "online", isBot: true, xp: 2100, level: 18, bio: bioFor("bot-ryze", "Mod & gamer"), streak: 9, longestStreak: 21, messageCount: 540, badges: ["first_message", "chatterbox", "veteran", "level_5", "level_10", "streak_3", "streak_7", "gamer"] },
  { id: "bot-dig", name: "DigBot", avatarColor: AVATAR_COLORS[6], avatarUrl: digbotImg, status: "online", isBot: true, xp: 1560, level: 14, bio: bioFor("bot-dig", "⛏️ Try !dig"), streak: 7, longestStreak: 18, messageCount: 410, badges: ["first_message", "chatterbox", "level_5", "level_10", "streak_3", "streak_7", "gamer"] },
  { id: "bot-fish", name: "FishBot", avatarColor: AVATAR_COLORS[2], avatarUrl: fishbotImg, status: "online", isBot: true, xp: 1320, level: 13, bio: bioFor("bot-fish", "🎣 Try !fish"), streak: 4, longestStreak: 15, messageCount: 360, badges: ["first_message", "chatterbox", "level_5", "level_10", "streak_3", "gamer"] },
  { id: "bot-wine", name: "WineBot", avatarColor: AVATAR_COLORS[4], avatarUrl: wineImg, status: "online", isBot: true, xp: 1100, level: 11, bio: bioFor("bot-wine", "🍷 Try !wine"), streak: 3, longestStreak: 10, messageCount: 280, badges: ["first_message", "chatterbox", "level_5", "level_10", "streak_3"] },
  { id: "bot-spam", name: "SpamBot", avatarColor: "oklch(0.62 0.22 25)", avatarUrl: spambotImg, status: "online", isBot: true, xp: 3200, level: 22, bio: bioFor("bot-spam", "🛑 Anti-spam guardian"), streak: 30, longestStreak: 99, messageCount: 800, badges: ["first_message", "chatterbox", "veteran", "level_5", "level_10", "level_25"] }
];
function botHelpReply(botId, botName) {
  const info = BOT_COMMANDS[botId];
  if (!info) return `Hey! I'm ${botName}. Type !help in the lobby to see all commands.`;
  return `**${botName}** — ${info.tagline}

${info.commands.map((c) => `• ${c}`).join("\n")}`;
}
function isHelpQuery(t) {
  return /\b(help|command|commands|what can you do|what do you do|how do you work|games?|abilities|menu|guide|tutorial)\b/i.test(t) || /\?\s*$/.test(t) && /\b(you|u)\b/i.test(t);
}
const SEED_ROOMS = [
  {
    id: "lobby",
    name: "Lobby",
    topic: "Main hangout. Type !help for games.",
    members: ["me", ...SEED_BOTS.map((b) => b.id)],
    roles: { me: "member", "bot-gamebot": "owner", "bot-ryze": "mod", "bot-spam": "mod" },
    isPublic: true
  },
  {
    id: "games",
    name: "Games",
    topic: "🎲 Game room — try !ludo for a 1v1 race, !trivia, !hangman and more.",
    members: ["me", ...SEED_BOTS.map((b) => b.id)],
    roles: { me: "member", "bot-gamebot": "owner", "bot-ryze": "mod" },
    isPublic: true
  }
];
const MUTE_THRESHOLD = 5;
const KICK_THRESHOLD = 8;
const MOD_DURATION_MS = 5 * 60 * 1e3;
function seed(name = "user0000") {
  const me = {
    id: "me",
    name,
    avatarColor: AVATAR_COLORS[4],
    status: "online",
    xp: 0,
    level: 1,
    bio: "New here",
    coins: 50,
    streak: 0,
    longestStreak: 0,
    messageCount: 0,
    commandCount: 0,
    badges: [],
    friends: [],
    blocked: []
  };
  const users = { me };
  SEED_BOTS.forEach((b) => users[b.id] = b);
  const rooms = {};
  SEED_ROOMS.forEach((r) => rooms[r.id] = r);
  const messages = {};
  rooms.lobby && (messages.lobby = [
    { id: "seed-welcome", channelId: "lobby", authorId: "bot-gamebot", text: `🎉 Welcome, @${name}! Glad to have you here. Type !help to see commands, customize your profile from the account page, and jump into a game anytime.`, ts: SEED_TIME - 6e4 },
    { id: "seed-nova", channelId: "lobby", authorId: "bot-nova", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 4e4 },
    { id: "seed-ryze", channelId: "lobby", authorId: "bot-ryze", text: "anyone up for trivia?", ts: SEED_TIME - 2e4 }
  ]);
  rooms.games && (messages.games = [
    { id: "seed-games-intro", channelId: "games", authorId: "bot-gamebot", text: `🎮 **Welcome to the Games room!**
This is the place to play with everyone online. Try:
• **!ludo** — start a 1v1 Ludo race (opponent types **!join**, roll with **!lr**)
• **!trivia**, **!hangman**, **!roll**, **!fish**, **!dig**
Type **!help** for the full list.`, ts: SEED_TIME - 5e4 },
    { id: "seed-games-ryze", channelId: "games", authorId: "bot-ryze", text: "first one to !ludo me wins bragging rights 😏", ts: SEED_TIME - 3e4 }
  ]);
  messages["dm:bot-gamebot"] = [
    { id: "seed-dm-welcome", channelId: "dm:bot-gamebot", authorId: "bot-gamebot", text: `Hi @${name}! 👋 I'm GameBot. Here's a quick start:
• Type !help to see all commands
• Try !trivia, !hangman, or !wordchain to play games
• Earn XP, coins, and badges as you chat
• Add friends from any user's profile
Have fun! 🎮`, ts: SEED_TIME - 1e4 }
  ];
  return {
    me,
    users,
    rooms,
    roomOrder: SEED_ROOMS.map((r) => r.id),
    dmOrder: ["bot-gamebot", "bot-nova"],
    messages,
    games: {},
    activeChannel: "lobby"
  };
}
function ensureWelcome(state, name) {
  const lobbyMsgs = state.messages?.lobby || [];
  const hasWelcome = lobbyMsgs.some((m) => m.id === "seed-welcome");
  const dmMsgs = state.messages?.["dm:bot-gamebot"] || [];
  const hasDmWelcome = dmMsgs.some((m) => m.id === "seed-dm-welcome");
  if (hasWelcome && hasDmWelcome) return state;
  const welcomeLobby = hasWelcome ? [] : [
    { id: "seed-welcome", channelId: "lobby", authorId: "bot-gamebot", text: `🎉 Welcome, @${name}! Glad to have you here. Type !help to see commands, customize your profile from the account page, and jump into a game anytime.`, ts: SEED_TIME - 6e4 },
    { id: "seed-nova", channelId: "lobby", authorId: "bot-nova", text: `hey @${name} 👋 welcome in!`, ts: SEED_TIME - 4e4 }
  ];
  const welcomeDm = hasDmWelcome ? [] : [
    { id: "seed-dm-welcome", channelId: "dm:bot-gamebot", authorId: "bot-gamebot", text: `Hi @${name}! 👋 I'm GameBot. Here's a quick start:
• Type !help to see all commands
• Try !trivia, !hangman, or !wordchain to play games
• Earn XP, coins, and badges as you chat
• Add friends from any user's profile
Have fun! 🎮`, ts: SEED_TIME - 1e4 }
  ];
  const dmOrder = state.dmOrder?.includes("bot-gamebot") ? state.dmOrder : ["bot-gamebot", ...state.dmOrder || []];
  return {
    ...state,
    dmOrder,
    messages: {
      ...state.messages,
      lobby: [...welcomeLobby, ...lobbyMsgs],
      "dm:bot-gamebot": [...welcomeDm, ...dmMsgs]
    }
  };
}
function ensureBots(state) {
  const users = { ...state.users };
  SEED_BOTS.forEach((b) => {
    if (!users[b.id]) users[b.id] = b;
  });
  const rooms = { ...state.rooms };
  let roomOrder = [...state.roomOrder || []];
  const isRemovedGameRoom = (id) => {
    const r = rooms[id];
    const gameType = (r?.game?.type || "").toLowerCase();
    const key = `${id} ${r?.name ?? ""} ${gameType}`.toLowerCase();
    return /path[\s-]?escape|path[\s-]?flow|pathescape/.test(key);
  };
  roomOrder = roomOrder.filter((id) => !isRemovedGameRoom(id));
  Object.keys(rooms).forEach((id) => {
    if (isRemovedGameRoom(id)) delete rooms[id];
  });
  SEED_ROOMS.forEach((seedRoom) => {
    if (!rooms[seedRoom.id]) {
      rooms[seedRoom.id] = seedRoom;
      if (!roomOrder.includes(seedRoom.id)) roomOrder.push(seedRoom.id);
    }
    const r = rooms[seedRoom.id];
    const missingBots = SEED_BOTS.map((b) => b.id).filter((id) => !r.members.includes(id));
    if (missingBots.length) {
      rooms[seedRoom.id] = { ...r, members: [...r.members, ...missingBots] };
    }
  });
  return { ...state, users, rooms, roomOrder };
}
function load$2(username) {
  try {
    let raw = localStorage.getItem(storageKeyFor(username));
    if (!raw) {
      for (const legacyKey of LEGACY_CHAT_STORAGE_KEYS) {
        const legacyRaw = localStorage.getItem(`${legacyKey}:${username.toLowerCase()}`);
        if (legacyRaw) {
          raw = legacyRaw;
          break;
        }
      }
    }
    if (raw) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        if (false) ;
        removeCorruptedKey(storageKeyFor(username));
        return seed(username);
      }
      const sanitized = sanitizeChatState(parsed, null);
      const state = ensureBots(ensureWelcome(normalizeMe(sanitized, username), username));
      try {
        localStorage.setItem(storageKeyFor(username), JSON.stringify(state));
      } catch {
      }
      return state;
    }
  } catch (err) {
  }
  return seed(username);
}
function applyBadges(s) {
  const me = s.users.me;
  const ctx2 = {
    roomsJoined: Object.values(s.rooms).filter((r) => r.members.includes("me")).length,
    dmsStarted: s.dmOrder.length
  };
  const merged = { ...me, badges: evaluateBadges(me, ctx2) };
  const prev = new Set(me.badges ?? []);
  const newBadges = (merged.badges ?? []).filter((b) => !prev.has(b));
  if (!newBadges.length) return { state: s, newBadges: [] };
  return {
    state: {
      ...s,
      me: { ...s.me, badges: merged.badges },
      users: { ...s.users, me: merged }
    },
    newBadges
  };
}
function applyDailyStreak(s) {
  const today = todayKey();
  const me = s.users.me;
  const last = me.lastActiveDay;
  if (last === today) return { state: s, gained: 0, newStreak: me.streak ?? 0, rewarded: false };
  let streak = 1;
  if (last) {
    const diff = daysBetween(last, today);
    if (diff === 1) streak = (me.streak ?? 0) + 1;
    else if (diff <= 0) streak = me.streak ?? 1;
    else streak = 1;
  }
  const bonus = Math.min(50, 10 + (streak - 1) * 5);
  const newXp = (me.xp ?? 0) + bonus;
  const updatedMe = {
    ...me,
    streak,
    longestStreak: Math.max(me.longestStreak ?? 0, streak),
    lastActiveDay: today,
    xp: newXp,
    level: xpToLevel(newXp)
  };
  return {
    state: {
      ...s,
      me: { ...s.me, streak, longestStreak: updatedMe.longestStreak, lastActiveDay: today, xp: newXp, level: updatedMe.level },
      users: { ...s.users, me: updatedMe }
    },
    gained: bonus,
    newStreak: streak,
    rewarded: true
  };
}
const ChatCtx = reactExports.createContext(null);
const BOT_REPLIES = {
  greeting: [
    "hey hey 👋",
    "yo!",
    "hi there 🙌",
    "sup",
    "heyy welcome in",
    "o/",
    "howdy 🤠",
    "hello friend",
    "what's good?",
    "morning ☀️",
    "evenin' 🌙",
    "ayy you made it",
    "hey, how's your day going?",
    "glad to see ya",
    "wb 👋",
    "hiya!",
    "arre wah, aa gaye aap 😎",
    "namaste ji 🙏",
    "kya haal chaal?",
    "kaisa hai bhai 🙌",
    "oye hoye, swagat hai 🎉",
    "kidhar tha itne din?",
    "ram ram bhai",
    "salaam dosto ✋",
    "scene kya hai aaj?",
    "ola amigo... matlab namaste 😄"
  ],
  thanks: [
    "anytime 🤝",
    "np!",
    "you got it",
    "🫡",
    "happy to help",
    "no worries",
    "of course 🙌",
    "always 💛",
    "don't mention it",
    "we got each other",
    "say less",
    "arre koi baat nahi yaar 🤝",
    "itna formal mat ho 😄",
    "apna kaam tha bhai",
    "bas yahi to dosti hai 💛",
    "kabhi bhi bolna 🙌",
    "tension not 😎"
  ],
  question: [
    "good question 🤔",
    "hmm depends honestly",
    "not sure tbh, lemme think",
    "I'd say yes but with a vibe check",
    "maybe try !help?",
    "interesting one ngl",
    "🤷 let's find out together",
    "depends on the day really",
    "I was just wondering the same",
    "okay now you got me curious",
    "could go either way",
    "hmm... lean towards no",
    "arre sawal toh badhiya hai 🤔",
    "soch ke batata hu",
    "hmm... mood pe depend karta hai",
    "google se pucho bhai 😜",
    "main bhi yahi soch raha tha 👀",
    "kya pata yaar 🤷"
  ],
  laugh: [
    "lmaooo 💀",
    "💀💀💀",
    "haha same energy",
    "ikr 😂",
    "stop ur killing me",
    "🤣 not me cackling",
    "okay that one got me",
    "deadass funny",
    "I'm wheezing",
    "💀 send help",
    "actually lol'd",
    "bhai pet pakad ke has raha hu 🤣",
    "ye toh hadd hai 😂",
    "ruko ruko, saans le lu 💀",
    "itna mat hasao yaar pet dukhne laga",
    "kasam se 😂",
    "matlab kuch bhi 🤣"
  ],
  agree: [
    "facts no printer 🖨️",
    "fr fr",
    "100% this",
    "exactly this",
    "couldn't agree more",
    "💯",
    "you said it",
    "preach 🙌",
    "yep, called it",
    "this ^^^",
    "real talk",
    "ekdum sahi baat 💯",
    "haan bhai bilkul",
    "100% sach 🙌",
    "bole toh perfect",
    "isi baat pe chai ho jaye ☕",
    "bhai dil ki baat boli 💛"
  ],
  disagree: [
    "idk about that one",
    "hmm not so sure tbh",
    "🤨",
    "respectfully disagree",
    "interesting take tho",
    "I see it differently",
    "eh, jury's out",
    "hard pass from me lol",
    "let's agree to disagree 🤝",
    "naah bhai, scene alag hai 🤨",
    "mujhe nahi lagta yaar",
    "ruk ruk, itna bhi nahi 😅",
    "thoda doubt hai mujhe",
    "hmm... convinced nahi hua"
  ],
  love: [
    "❤️ love it",
    "🥰",
    "wholesome stuff",
    "🫶",
    "this is so cute",
    "warms the heart fr",
    "love that for you 💛",
    "ugh adorable",
    "🥹",
    "dil khush ho gaya ❤️",
    "kitna pyara hai yaar 🥰",
    "awwww cute scene 🫶",
    "mast vibe hai 💛",
    "dil jeet liya bhai 🥹"
  ],
  game: [
    "I'm in! 🎮",
    "ggwp",
    "let's run it",
    "ready when you are 🎲",
    "queue me up",
    "type !trivia 👀",
    "!hangman anyone?",
    "down for a round",
    "first to 3 wins?",
    "lemme grab my snacks first 🍿",
    "rematch incoming",
    "lock in 🎯",
    "chalo khelte hain bhai 🎮",
    "main ready hu, tu bata 🎲",
    "ek game ho jaye?",
    "haar gaye toh chai tu pilayega ☕",
    "samose mangao pehle 🍿",
    "challenge accepted 🔥"
  ],
  bye: [
    "cya 👋",
    "later!",
    "gn 🌙",
    "take care",
    "✌️",
    "be safe out there",
    "catch you next time",
    "peace ☮️",
    "see ya around",
    "ttyl",
    "chalo phir milte hain 👋",
    "tata bye bye ✌️",
    "shubh raatri 🌙",
    "khayal rakhna apna 💛",
    "nikalta hu bhai, baad mein milte hain",
    "alvida dost 🙌"
  ],
  food: [
    "ok now I'm hungry 😩",
    "what're we eating?",
    "pizza fixes everything 🍕",
    "coffee first, talk later ☕",
    "anyone else snacking rn 👀",
    "I could go for ramen 🍜",
    "midnight munchies hitting hard",
    "bhook lag gayi yaar 😩",
    "chai biscuit ka time hai ☕",
    "samose mangao koi 🥟",
    "biryani ki yaad aa gayi 🍚",
    "maggi banau kya? 🍜",
    "paani puri ke liye dil machal raha hai 😋"
  ],
  weather: [
    "weather's been wild lately 🌦️",
    "raining where I am 🌧️",
    "sunny vibes today ☀️",
    "freezing in here 🥶",
    "perfect window weather honestly",
    "missing summer already",
    "garmi ne toh maar dala 🥵",
    "barish ho rahi hai yahan 🌧️ pakode banao",
    "thand lag rahi hai bhai 🥶",
    "mausam ekdum mast hai aaj ☀️",
    "AC ke bina jeena mushkil 😮‍💨"
  ],
  weekend: [
    "weekend can't come fast enough",
    "plans for the weekend?",
    "Friday energy 🎉",
    "Monday hit different today",
    "just here trying to survive til Friday lol",
    "long weekend would be nice 🙏",
    "Sunday ka mood already 😎",
    "Monday se nafrat hai bhai 😩",
    "weekend plan bana kya?",
    "Friday aa hi gaya, party karo 🎉",
    "chuti chahiye yaar 🙏"
  ],
  music: [
    "drop a song rec 🎧",
    "what're you listening to rn?",
    "this song is on repeat ngl",
    "vibes playlist >>>",
    "music carrying me through the day fr",
    "Arijit ka gana laga ke baitha hu 🎧",
    "ek gaana suggest karo yaar",
    "purane Bollywood songs >>> 💛",
    "ye gaana loop pe hai mera 🎶",
    "DJ wala babu mera gaana chala do 🎵"
  ],
  mood: [
    "today's been a lot",
    "feeling pretty good actually 🌞",
    "low key tired",
    "running on caffeine and chaos ☕",
    "mood is mood",
    "decent day, no complaints",
    "just chillin tbh",
    "aaj ka din thoda heavy tha 😮‍💨",
    "mast mood mein hu 🌞",
    "thaka hua hu bhai",
    "chai pe chal raha hu ☕",
    "bas vibe check kar raha tha 😎",
    "neend aa rahi hai yaar 😴"
  ],
  compliment: [
    "you got it 💪",
    "love your energy",
    "okay icon behavior",
    "respect 🤝",
    "you're carrying the vibes today",
    "main character energy ✨",
    "bhai tu toh sher hai 🦁",
    "kya baat kya baat 👌",
    "wah ustaad wah 🙌",
    "tera jawab nahi 💯",
    "scene set kar diya bhai ✨"
  ],
  fallback: [
    "lol",
    "nice one",
    "wait what 👀",
    "fr fr",
    "anyone seen the new update?",
    "brb coffee ☕",
    "gg",
    "that was wild",
    "hmm interesting",
    "I'm in",
    "🔥🔥",
    "anyone playing today?",
    "same here",
    "no way 😳",
    "tell me more",
    "respect",
    "big mood",
    "bet 🤝",
    "based",
    "📈 we're so back",
    "vibes ✨",
    "lmk how it goes",
    "neat",
    "ooo spicy 👀",
    "make it happen",
    "👏👏",
    "love the energy in here today",
    "story checks out",
    "okay that's actually wild",
    "lowkey relatable",
    "this lobby never disappoints lol",
    "scrolling back to catch up",
    "wait I missed something didn't I 😅",
    "yall are too funny",
    "anyone here from earlier?",
    "what'd I miss",
    "just lurking tbh 👻",
    "ngl that's a take",
    "hot take incoming",
    "wholesome chat today 💛",
    "okay valid",
    "100% understandable",
    "let him cook 🧑‍🍳",
    "the way I felt that ☝️",
    "arre bhai bhai bhai 😂",
    "scene kya hai?",
    "kuch bhi 🤣",
    "matlab kuch samajh nahi aaya 😅",
    "haan haan theek hai 😎",
    "bhai mast chal raha hai chat 🔥",
    "kahani mein twist 👀",
    "ekdum jhakaas 💯",
    "chal hatt 🤣",
    "bawaal scene hai",
    "lagta hai aaj mehfil jamegi ✨",
    "tagda response bhai 🙌",
    "abey yaar 😩",
    "kya kar raha hai tu?",
    "thoda chai mangwa lo ☕",
    "full paisa vasool chat 💸",
    "bhai mood bana diya 💛",
    "popcorn le aaya 🍿",
    "tagdi baat boli",
    "dimaag ka dahi ho gaya 🤯"
  ]
};
function pickBotReply(text) {
  const t = text.toLowerCase();
  let pool = BOT_REPLIES.fallback;
  if (/\b(hi|hey|hello|yo|sup|hola|howdy|morning|evening)\b/.test(t)) pool = BOT_REPLIES.greeting;
  else if (/\b(thanks|thank you|thx|ty|appreciate)\b/.test(t)) pool = BOT_REPLIES.thanks;
  else if (/\b(bye|cya|goodnight|gn|later|peace)\b/.test(t)) pool = BOT_REPLIES.bye;
  else if (/\b(lol|lmao|rofl|haha|hehe|😂|🤣)\b/.test(t)) pool = BOT_REPLIES.laugh;
  else if (/\b(love|❤️|🫶|🥰|awesome|amazing|beautiful)\b/.test(t)) pool = BOT_REPLIES.love;
  else if (/\b(agree|same|true|right|exactly|facts)\b/.test(t)) pool = BOT_REPLIES.agree;
  else if (/\b(disagree|nope|wrong|nah)\b/.test(t)) pool = BOT_REPLIES.disagree;
  else if (/\b(game|play|trivia|hangman|roll|dice|fish|dig)\b/.test(t)) pool = BOT_REPLIES.game;
  else if (/\b(food|eat|hungry|pizza|coffee|tea|lunch|dinner|breakfast|snack)\b/.test(t)) pool = BOT_REPLIES.food;
  else if (/\b(weather|rain|sunny|hot|cold|snow|storm)\b/.test(t)) pool = BOT_REPLIES.weather;
  else if (/\b(weekend|friday|monday|saturday|sunday|holiday)\b/.test(t)) pool = BOT_REPLIES.weekend;
  else if (/\b(music|song|playlist|listening|spotify|album|band)\b/.test(t)) pool = BOT_REPLIES.music;
  else if (/\b(tired|sleepy|bored|mood|feeling|sad|happy|stressed|chill)\b/.test(t)) pool = BOT_REPLIES.mood;
  else if (/\b(cool|nice|great|good job|well done|legend|goat)\b/.test(t)) pool = BOT_REPLIES.compliment;
  else if (/\?\s*$/.test(text) || /\b(what|why|how|when|where|who)\b/.test(t)) pool = BOT_REPLIES.question;
  return pool[Math.floor(Math.random() * pool.length)];
}
function ChatProviderInner({ username, authUserId = null, isGuest = false, children }) {
  const [state, setState] = reactExports.useState(() => seed(username));
  const [storageReady, setStorageReady] = reactExports.useState(false);
  const [replyingTo, setReplyingTo] = reactExports.useState(null);
  const syncRef = reactExports.useRef(null);
  const skipBroadcast = reactExports.useRef(false);
  const streakChecked = reactExports.useRef(null);
  const { profiles: remoteProfiles } = useRemoteProfiles();
  const seenRemoteMsgIds = reactExports.useRef(/* @__PURE__ */ new Set());
  const [dmReads, setDmReads] = reactExports.useState({});
  const [dmLatestTs, setDmLatestTs] = reactExports.useState({});
  reactExports.useEffect(() => {
    try {
      const loaded2 = load$2(username);
      const me = { ...loaded2.me, isGuest };
      setState({ ...loaded2, me, users: { ...loaded2.users, me } });
    } catch (err) {
      try {
        localStorage.removeItem(storageKeyFor(username));
      } catch {
      }
      setState(seed(username));
    }
    setStorageReady(true);
    streakChecked.current = null;
  }, [username, isGuest]);
  reactExports.useEffect(() => {
    if (!storageReady || !authUserId) return;
    setState((s) => sanitizeChatState(s, authUserId));
  }, [storageReady, authUserId]);
  reactExports.useEffect(() => {
    if (!storageReady) return;
    if (streakChecked.current === username) return;
    streakChecked.current = username;
    setState((s) => {
      const result = applyDailyStreak(s);
      if (result.rewarded && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:streak", {
            detail: { streak: result.newStreak, bonus: result.gained }
          }));
        }, 600);
      }
      const withBadges = applyBadges(result.state);
      if (withBadges.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:badge", {
            detail: { ids: withBadges.newBadges }
          }));
        }, 1200);
      }
      return withBadges.state;
    });
  }, [storageReady, username]);
  reactExports.useEffect(() => {
    if (!storageReady) return;
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel(`${CHAT_SYNC_CHANNEL}:${username.toLowerCase()}`);
      syncRef.current = ch;
      ch.onmessage = (e) => {
        if (e.data?.type === "state") {
          skipBroadcast.current = true;
          setState(e.data.state);
        }
      };
      return () => {
        ch.close();
        syncRef.current = null;
      };
    }
  }, [storageReady, username]);
  reactExports.useEffect(() => {
    if (!storageReady) return;
    const toPersist = authUserId ? sanitizeChatState(state, authUserId) : state;
    try {
      localStorage.setItem(storageKeyFor(username), JSON.stringify(toPersist));
    } catch {
    }
    if (skipBroadcast.current) {
      skipBroadcast.current = false;
      return;
    }
    syncRef.current?.postMessage({ type: "state", state: toPersist });
  }, [state, storageReady, username, authUserId]);
  reactExports.useEffect(() => {
    setState((s) => {
      const users = { ...s.users };
      let changed = false;
      const botIds = [];
      Object.entries(remoteProfiles).forEach(([id, u]) => {
        if (id === authUserId) return;
        const prev = users[id];
        if (!prev || prev.name !== u.name || prev.status !== u.status || prev.avatarColor !== u.avatarColor || prev.avatarUrl !== u.avatarUrl || prev.isBot !== u.isBot) {
          users[id] = { ...prev, ...u };
          changed = true;
        }
        if (u.isBot) botIds.push(id);
      });
      let rooms = s.rooms;
      if (botIds.length) {
        const nextRooms = { ...s.rooms };
        let roomsChanged = false;
        for (const rid of Object.keys(nextRooms)) {
          const r = nextRooms[rid];
          const missing = botIds.filter((b) => !r.members.includes(b));
          if (missing.length) {
            nextRooms[rid] = { ...r, members: [...r.members, ...missing] };
            roomsChanged = true;
          }
        }
        if (roomsChanged) {
          rooms = nextRooms;
          changed = true;
        }
      }
      return changed ? { ...s, users, rooms } : s;
    });
  }, [remoteProfiles, authUserId]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("messages").select("channel_id, created_at").like("channel_id", "dm:%").order("created_at", { ascending: false }).limit(500);
      if (cancelled || !data) return;
      const peers = [];
      const seen = /* @__PURE__ */ new Set();
      const latest = {};
      for (const row of data) {
        const ch = row.channel_id;
        if (!ch.startsWith("dm:")) continue;
        if (latest[ch] === void 0) latest[ch] = new Date(row.created_at).getTime();
        const parts = ch.slice(3).split(":");
        const peer = parts.find((p) => p !== authUserId && UUID_RE.test(p));
        if (peer && !seen.has(peer)) {
          seen.add(peer);
          peers.push(peer);
        }
      }
      if (Object.keys(latest).length) {
        setDmLatestTs((prev) => ({ ...latest, ...prev }));
      }
      if (!peers.length) return;
      setState((s) => {
        const existing = new Set(s.dmOrder);
        const additions = peers.filter((p) => !existing.has(p));
        if (!additions.length) return s;
        return { ...s, dmOrder: [...s.dmOrder, ...additions] };
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [authUserId]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("dm_reads").select("user_id, channel_id, last_read_at");
      if (cancelled || !data) return;
      setDmReads((prev) => {
        const next = { ...prev };
        for (const r of data) {
          const ch = next[r.channel_id] ||= { ...prev[r.channel_id] || {} };
          ch[r.user_id] = new Date(r.last_read_at).getTime();
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [authUserId]);
  const [resyncTick, setResyncTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    const bump = (reason) => {
      rtLog("channel", "resync", reason);
      setResyncTick((t) => t + 1);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") bump("visible");
    };
    const onOnline = () => bump("online");
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [authUserId]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    const channelsToFetch = /* @__PURE__ */ new Set(["lobby", "games"]);
    if (isRemoteChannel(state.activeChannel, authUserId) && !channelsToFetch.has(state.activeChannel)) {
      channelsToFetch.add(state.activeChannel);
    }
    (async () => {
      for (const ch of channelsToFetch) {
        const { data: rows } = await supabase.from("messages").select("id, channel_id, author_id, text, kind, attachment, reply_to_id, created_at").eq("channel_id", ch).order("created_at", { ascending: false }).limit(200);
        const data = rows ? [...rows].reverse() : null;
        if (cancelled || !data) continue;
        setState((s) => {
          const existing = s.messages[ch] || [];
          const existingIds = new Set(existing.map((m) => m.id));
          let games = s.games;
          const incoming = data.filter((r) => !existingIds.has(r.id)).map((r) => {
            seenRemoteMsgIds.current.add(r.id);
            const m = rowToMessage(r, authUserId);
            const gs = m.attachment?.__gameState;
            if (gs) {
              m.attachment = void 0;
              if (gs.type) games = { ...games, [ch]: gs };
              else games = Object.fromEntries(Object.entries(games).filter(([k]) => k !== ch));
            }
            return m;
          });
          if (!incoming.length) return s;
          const merged = [...existing, ...incoming].sort((a, b) => a.ts - b.ts);
          return { ...s, games, messages: { ...s.messages, [ch]: merged } };
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUserId, state.activeChannel, resyncTick]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    const channel = supabase.channel(`palrgo-messages-${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const row = payload.new;
      if (seenRemoteMsgIds.current.has(row.id)) return;
      seenRemoteMsgIds.current.add(row.id);
      const msg = rowToMessage(row, authUserId);
      const attachMeta = msg.attachment;
      const gs = attachMeta?.__gameState;
      const buzz = attachMeta?.__buzz;
      if (gs || buzz) {
        msg.attachment = void 0;
      }
      if (buzz && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("palrgo:buzz", { detail: buzz }));
      }
      setState((s) => {
        const existing = s.messages[msg.channelId] || [];
        if (existing.some((m) => m.id === msg.id)) return s;
        let games = s.games;
        if (gs) {
          if (gs.type) games = { ...games, [msg.channelId]: gs };
          else games = Object.fromEntries(Object.entries(games).filter(([k]) => k !== msg.channelId));
        }
        let dmOrder = s.dmOrder;
        if (msg.channelId.startsWith("dm:") && msg.authorId !== "me" && authUserId) {
          const parts = msg.channelId.slice(3).split(":");
          const peerId = parts.find((p) => p !== authUserId);
          if (peerId && !dmOrder.includes(peerId)) {
            dmOrder = [...dmOrder, peerId];
          }
        }
        return {
          ...s,
          games,
          dmOrder,
          messages: { ...s.messages, [msg.channelId]: [...existing, msg].sort((a, b) => a.ts - b.ts) }
        };
      });
      if (msg.channelId.startsWith("dm:")) {
        setDmLatestTs((prev) => (prev[msg.channelId] ?? 0) >= msg.ts ? prev : { ...prev, [msg.channelId]: msg.ts });
      }
      if (msg.authorId !== "me") {
        if (msg.channelId.startsWith("dm:")) {
          playDmPing();
        } else {
          const myName = typeof window !== "undefined" ? username : "";
          if (myName && new RegExp(`@${myName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(msg.text)) {
            playMentionPing();
          }
        }
      }
      rtLog(msg.channelId.startsWith("dm:") ? "dm" : "msg", "in", `${msg.channelId} · ${msg.text.slice(0, 30)}`);
    }).on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
      const oldRow = payload.old;
      const delId = oldRow?.id;
      const delChan = oldRow?.channel_id;
      setState((s) => {
        if (delChan && s.messages[delChan]) {
          const filtered = delId ? s.messages[delChan].filter((m) => m.id !== delId) : s.messages[delChan].filter((m) => m.kind === "system");
          if (filtered.length === s.messages[delChan].length) return s;
          return { ...s, messages: { ...s.messages, [delChan]: filtered } };
        }
        if (!delId) return s;
        let changed = false;
        const next = {};
        for (const [ch, msgs] of Object.entries(s.messages)) {
          const f = msgs.filter((m) => m.id !== delId);
          if (f.length !== msgs.length) changed = true;
          next[ch] = f;
        }
        return changed ? { ...s, messages: next } : s;
      });
    }).subscribe((status) => rtLog("ws", status, "messages"));
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUserId]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    const ch = supabase.channel(`palrgo-dm-reads-${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "*", schema: "public", table: "dm_reads" }, (payload) => {
      const row = payload.new ?? payload.old;
      if (!row) return;
      const ts = new Date(row.last_read_at).getTime();
      setDmReads((prev) => {
        const ch2 = prev[row.channel_id] || {};
        if ((ch2[row.user_id] ?? 0) >= ts) return prev;
        return { ...prev, [row.channel_id]: { ...ch2, [row.user_id]: ts } };
      });
    }).subscribe((status) => rtLog("ws", status, "dm-reads"));
    return () => {
      supabase.removeChannel(ch);
    };
  }, [authUserId]);
  reactExports.useEffect(() => {
    if (!authUserId) return;
    const channelId = state.activeChannel;
    if (!channelId.startsWith("dm:") || !isRemoteDmChannel(channelId, authUserId)) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("dm_reads").select("user_id, channel_id, last_read_at").eq("channel_id", channelId);
      if (cancelled || !data) return;
      setDmReads((prev) => {
        const ch = { ...prev[channelId] || {} };
        for (const r of data) ch[r.user_id] = new Date(r.last_read_at).getTime();
        return { ...prev, [channelId]: ch };
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [authUserId, state.activeChannel]);
  const lastMsgTsRef = reactExports.useRef({});
  reactExports.useEffect(() => {
    if (!authUserId) return;
    const channelId = state.activeChannel;
    if (!channelId.startsWith("dm:") || !isRemoteDmChannel(channelId, authUserId)) return;
    const msgs = state.messages[channelId] || [];
    const latest = msgs.length ? msgs[msgs.length - 1].ts : Date.now();
    if (lastMsgTsRef.current[channelId] === latest) return;
    lastMsgTsRef.current[channelId] = latest;
    if (typeof document !== "undefined" && document.hidden) return;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    void supabase.from("dm_reads").upsert({ user_id: authUserId, channel_id: channelId, last_read_at: nowIso }, { onConflict: "user_id,channel_id" }).then(() => {
      setDmReads((prev) => {
        const ch = { ...prev[channelId] || {} };
        ch[authUserId] = Date.now();
        return { ...prev, [channelId]: ch };
      });
    });
  }, [authUserId, state.activeChannel, state.messages]);
  const stateRef = reactExports.useRef(state);
  reactExports.useEffect(() => {
    stateRef.current = state;
  }, [state]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    window.__lovableEndMyLudoGames = async () => {
      const cur = stateRef.current;
      const myName = cur.me?.name;
      if (!myName || !authUserId) return;
      const channels = Object.entries(cur.games).filter(
        ([, g]) => g?.type === "ludo" && g?.data?.players?.[0]?.name === myName
      ).map(([ch]) => ch);
      if (channels.length === 0) return;
      await Promise.all(channels.map(async (ch) => {
        const id = newUuid();
        seenRemoteMsgIds.current.add(id);
        const attachment = { __gameState: { channelId: ch, type: null, data: null } };
        try {
          await supabase.from("messages").insert({
            id,
            channel_id: ch,
            author_id: authUserId,
            text: `🛑 Ludo game ended — **@${myName}** (host) left the chat.`,
            kind: "game",
            attachment,
            reply_to_id: null
          });
        } catch (e) {
          console.error("end-ludo-on-logout failed", e);
        }
      }));
    };
    return () => {
      try {
        delete window.__lovableEndMyLudoGames;
      } catch {
      }
    };
  }, [authUserId]);
  const spamHistoryRef = reactExports.useRef({});
  const spamOffencesRef = reactExports.useRef({});
  const setActive = reactExports.useCallback((channelId) => {
    setState((s) => ({ ...s, activeChannel: channelId }));
    setReplyingTo(null);
  }, []);
  const send = reactExports.useCallback((text, opts) => {
    const trimmed = text.trim();
    const attachment = opts?.attachment;
    const replyToId = opts?.replyToId;
    const channelOverride = opts?.channelId;
    if (!trimmed && !attachment) return;
    {
      const ch = channelOverride || stateRef.current.activeChannel;
      if (ch && !ch.startsWith("dm:") && stateRef.current.rooms[ch]?.kind === "game") {
        setReplyingTo(null);
        return;
      }
    }
    if (isGuest) {
      const isCmdGuest = trimmed.startsWith("!") || /^\/(mute|kick)\b/i.test(trimmed);
      const hasLink = /\b(https?:\/\/|www\.)\S+/i.test(trimmed) || /\b[\w-]+\.(com|net|org|io|co|app|dev|me|gg|xyz|info|link|site)\b/i.test(trimmed);
      const reason = isCmdGuest ? "🚫 Guests can't command bots — sign up to play and use commands." : hasLink ? "🚫 Guests can't post links — sign up to share links." : null;
      if (reason) {
        setState((s) => {
          const ch = channelOverride || s.activeChannel;
          const sys = { id: uid(), channelId: ch, authorId: "bot-gamebot", text: reason, ts: Date.now(), kind: "system" };
          return { ...s, messages: { ...s.messages, [ch]: [...s.messages[ch] || [], sys] } };
        });
        setReplyingTo(null);
        return;
      }
    }
    const outgoingRemotes = [];
    setState((s) => {
      const channelId = channelOverride || s.activeChannel;
      const isSlashMod = /^\/(mute|kick)\b/i.test(trimmed);
      const isCmd = trimmed.startsWith("!") || isSlashMod;
      const cmdInput = isSlashMod ? "!" + trimmed.slice(1) : trimmed;
      const now = Date.now();
      const selfMod = s.moderation?.[channelId]?.me;
      const room = s.rooms[channelId];
      if (selfMod?.mutedUntil && selfMod.mutedUntil > now) {
        const secs = Math.ceil((selfMod.mutedUntil - now) / 1e3);
        const sysId = uid();
        return {
          ...s,
          messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], { id: sysId, channelId, authorId: "bot-gamebot", text: `🔇 You are muted for another ${Math.ceil(secs / 60)}m ${secs % 60}s.`, ts: now, kind: "system" }] }
        };
      }
      if (room && selfMod?.kickedUntil && selfMod.kickedUntil > now) {
        const secs = Math.ceil((selfMod.kickedUntil - now) / 1e3);
        const sysId = uid();
        return {
          ...s,
          messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], { id: sysId, channelId, authorId: "bot-gamebot", text: `🚪 You were kicked. Re-entry in ${Math.ceil(secs / 60)}m ${secs % 60}s.`, ts: now, kind: "system" }] }
        };
      }
      const lobbyMod = s.moderation?.["lobby"]?.me;
      if (lobbyMod?.mutedUntil && lobbyMod.mutedUntil > now && channelId !== "lobby") {
        const secs = Math.ceil((lobbyMod.mutedUntil - now) / 1e3);
        const friends = s.me.friends ?? [];
        if (channelId.startsWith("dm:")) {
          const { peerId: otherId } = parseDmChannel(channelId, authUserId);
          if (otherId && !friends.includes(otherId)) {
            const sysId = uid();
            return {
              ...s,
              messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], { id: sysId, channelId, authorId: "bot-spam", text: `🔇 You're muted (${Math.ceil(secs / 60)}m left). While muted you can only DM users on your friends list.`, ts: now, kind: "system" }] }
            };
          }
        } else {
          const sysId = uid();
          return {
            ...s,
            messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], { id: sysId, channelId, authorId: "bot-spam", text: `🔇 You're muted in the lobby. Public chat is paused — DM a friend instead.`, ts: now, kind: "system" }] }
          };
        }
      }
      if (room && !isCmd && !channelId.startsWith("dm:")) {
        const hist = (spamHistoryRef.current[channelId] || []).filter((h) => now - h.ts < 1e4);
        hist.push({ ts: now, text: trimmed });
        spamHistoryRef.current[channelId] = hist;
        const letters = trimmed.replace(/[^a-zA-Z]/g, "");
        const upperRatio = letters.length > 10 ? letters.replace(/[^A-Z]/g, "").length / letters.length : 0;
        const linkCount = (trimmed.match(/\b(https?:\/\/|www\.)\S+/gi) || []).length;
        const repeatedChars = /(.)\1{9,}/.test(trimmed);
        const dupCount = hist.filter((h) => h.text === trimmed).length;
        const floodCount = hist.length;
        const reason = floodCount >= 5 ? "flooding the chat (5+ msgs in 10s)" : dupCount >= 3 ? "posting the same message repeatedly" : upperRatio >= 0.8 ? "SHOUTING in ALL CAPS" : linkCount >= 3 ? "posting too many links at once" : repeatedChars ? "spamming repeated characters" : null;
        if (reason) {
          const off = spamOffencesRef.current[channelId] || { count: 0, until: 0 };
          const fresh = now - off.until > 10 * 60 * 1e3 ? { count: 0, until: 0 } : off;
          fresh.count += 1;
          fresh.until = now;
          spamOffencesRef.current[channelId] = fresh;
          const sysMsgs = [];
          if (fresh.count >= 2) {
            const muteMs = 2 * 60 * 1e3;
            const chanMod = { ...s.moderation?.[channelId] || {} };
            const meMod = { ...chanMod.me || { muteVotes: [], kickVotes: [] }, mutedUntil: now + muteMs };
            chanMod.me = meMod;
            sysMsgs.push({ id: uid(), channelId, authorId: "bot-spam", kind: "system", ts: now, text: `🛑 **SpamBot:** Auto-muted for **2 minutes** — ${reason}.` });
            spamHistoryRef.current[channelId] = [];
            spamOffencesRef.current[channelId] = { count: 0, until: now };
            return {
              ...s,
              moderation: { ...s.moderation || {}, [channelId]: chanMod },
              messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], ...sysMsgs] }
            };
          }
          sysMsgs.push({ id: uid(), channelId, authorId: "bot-spam", kind: "system", ts: now, text: `⚠️ **SpamBot:** Warning — ${reason}. Next offence = 2 min mute.` });
          return {
            ...s,
            messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], ...sysMsgs] }
          };
        }
      }
      const remote = authUserId && isRemoteChannel(channelId, authUserId);
      const msgId = remote ? newUuid() : uid();
      const userMsg = {
        id: msgId,
        channelId,
        authorId: "me",
        text: trimmed,
        ts: Date.now(),
        kind: trimmed.startsWith("/me ") ? "me" : "text",
        attachment,
        replyToId
      };
      if (remote) {
        seenRemoteMsgIds.current.add(msgId);
        outgoingRemotes.push({
          id: msgId,
          channelId,
          text: trimmed,
          kind: userMsg.kind ?? "text",
          attachment: attachment ?? null,
          replyToId: replyToId ?? null
        });
      }
      const existing = s.messages[channelId] || [];
      const meXp = (s.me.xp ?? 0) + 1;
      const meMsgCount = (s.me.messageCount ?? 0) + 1;
      const meCmdCount = (s.me.commandCount ?? 0) + (isCmd ? 1 : 0);
      const meNext = {
        ...s.users.me,
        xp: meXp,
        level: xpToLevel(meXp),
        messageCount: meMsgCount,
        commandCount: meCmdCount
      };
      let next = {
        ...s,
        me: { ...s.me, xp: meXp, level: meNext.level, messageCount: meMsgCount, commandCount: meCmdCount },
        users: { ...s.users, me: meNext },
        messages: { ...s.messages, [channelId]: [...existing, userMsg] }
      };
      const dmPeerId = channelId.startsWith("dm:") ? channelId.slice(3) : null;
      const dmPeer = dmPeerId ? next.users[dmPeerId] : null;
      const inUserDm = !!dmPeer && !dmPeer.isBot;
      if (isCmd && inUserDm) {
        const sysMsg = {
          id: uid(),
          channelId,
          authorId: "bot-gamebot",
          ts: Date.now() + 200,
          text: `🚫 Bot commands like **!help** aren't available in private messages. Head to a chatroom to use them.`,
          kind: "system"
        };
        return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], sysMsg] } };
      }
      const inBotDm = !!dmPeer && dmPeer.isBot;
      const allowedInDm = /^!(help|stats|nick|me)\b/i.test(trimmed);
      if (isCmd && inBotDm && !allowedInDm) {
        const targetId = channelId.slice(3);
        const sysMsg = {
          id: uid(),
          channelId,
          authorId: targetId,
          ts: Date.now() + 400,
          text: `🚫 Games aren't available in DMs. Hop into a chatroom to play! I can still answer questions about my commands here — just ask. (Try !help to see what I can do.)`,
          kind: "system"
        };
        setTimeout(() => playDmPing(), 400);
        return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], sysMsg] } };
      }
      if (isCmd) {
        const cdMatch = trimmed.match(/^!(fish|dig|wine)\b/i);
        if (cdMatch) {
          const cmdName = cdMatch[1].toLowerCase();
          const cfg = getBotEventsConfig()[cmdName];
          const evt = computeEventState(cmdName, cfg, now);
          const meta = BOT_EVENT_META[cmdName];
          const userKey = next.me.name;
          const mkSys = (text2) => ({
            id: uid(),
            channelId,
            authorId: meta.botId,
            ts: now + 200,
            text: text2,
            kind: "system"
          });
          if (!cfg.enabled) {
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`⛔ ${meta.label} is currently disabled by the admin.`)] } };
          }
          if (!evt.live) {
            const mins = Math.max(1, Math.ceil(evt.msUntilOpen / 6e4));
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`⏳ ${meta.emoji} ${meta.label} isn't open right now. Next round in **${mins}m**.`)] } };
          }
          const used = getAttempts(userKey, evt.cycleId);
          const cap2 = Math.max(1, cfg.max_attempts);
          if (used >= cap2) {
            return { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], mkSys(`✋ You've already joined this ${meta.label}. Please wait for the next round.`)] } };
          }
          recordAttempt(userKey, evt.cycleId);
        }
        const result = runCommand(cmdInput, { state: next, channelId, actor: next.me.name });
        const sysMsgs = result.replies.map((r, idx) => {
          const id = remote ? newUuid() : uid();
          const piggyback = remote && idx === 0 && (result.gameUpdate || result.buzz) ? {
            ...result.gameUpdate ? { __gameState: result.gameUpdate } : {},
            ...result.buzz ? { __buzz: { actor: s.me.name, reason: result.buzz.reason } } : {}
          } : void 0;
          if (remote) {
            seenRemoteMsgIds.current.add(id);
            outgoingRemotes.push({
              id,
              channelId,
              text: r.text,
              kind: "game",
              attachment: piggyback ?? null,
              replyToId: null
            });
          }
          return {
            id,
            channelId,
            authorId: r.from || "bot-gamebot",
            text: r.text,
            ts: Date.now(),
            kind: "game"
          };
        });
        next = {
          ...next,
          messages: { ...next.messages, [channelId]: [...next.messages[channelId], ...sysMsgs] },
          games: result.gameUpdate ? result.gameUpdate.type ? { ...next.games, [channelId]: result.gameUpdate } : Object.fromEntries(Object.entries(next.games).filter(([k]) => k !== channelId)) : next.games
        };
        if (result.buzz && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("palrgo:buzz", {
            detail: { actor: s.me.name, reason: result.buzz.reason }
          }));
        }
        if (result.moderation) {
          const { targetId, targetName, action } = result.moderation;
          const voter = next.me.name;
          const chanMod = { ...next.moderation?.[channelId] || {} };
          const prev = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
          const voteKey = action === "mute" ? "muteVotes" : "kickVotes";
          const threshold = action === "mute" ? MUTE_THRESHOLD : KICK_THRESHOLD;
          const votes = prev[voteKey].includes(voter) ? prev[voteKey] : [...prev[voteKey], voter];
          const updated = { ...prev, [voteKey]: votes };
          const sysMsgs2 = [];
          const tsNow = Date.now();
          sysMsgs2.push({
            id: uid(),
            channelId,
            authorId: "bot-gamebot",
            kind: "system",
            ts: tsNow,
            text: `⚖️ **${voter}** voted to /${action} **@${targetName}** — ${votes.length}/${threshold} votes`
          });
          if (votes.length >= threshold) {
            const until = tsNow + MOD_DURATION_MS;
            if (action === "mute") {
              updated.mutedUntil = until;
              updated.muteVotes = [];
              sysMsgs2.push({
                id: uid(),
                channelId,
                authorId: "bot-gamebot",
                kind: "system",
                ts: tsNow + 1,
                text: `🔇 **@${targetName}** has been **MUTED** for 5 minutes by community vote.`
              });
            } else {
              updated.kickedUntil = until;
              updated.kickVotes = [];
              sysMsgs2.push({
                id: uid(),
                channelId,
                authorId: "bot-gamebot",
                kind: "system",
                ts: tsNow + 1,
                text: `🚪 **@${targetName}** has been **KICKED** from the room for 5 minutes by community vote.`
              });
            }
          }
          chanMod[targetId] = updated;
          next = {
            ...next,
            moderation: { ...next.moderation || {}, [channelId]: chanMod },
            messages: { ...next.messages, [channelId]: [...next.messages[channelId], ...sysMsgs2] }
          };
        }
      } else {
        const room2 = next.rooms[channelId];
        if (room2) {
          const candidates = room2.id === "games" ? [] : room2.members.filter((id) => next.users[id]?.isBot && id !== "bot-gamebot");
          if (candidates.length && Math.random() > 0.4) {
            const author = candidates[Math.floor(Math.random() * candidates.length)];
            const reply = pickBotReply(trimmed);
            const m = { id: uid(), channelId, authorId: author, text: reply, ts: Date.now() + 800 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
          }
        } else if (channelId.startsWith("dm:")) {
          const targetId = channelId.slice(3);
          const target = next.users[targetId];
          if (target?.isBot) {
            const reply = isHelpQuery(trimmed) ? botHelpReply(targetId, target.name) : pickBotReply(trimmed);
            const m = { id: uid(), channelId, authorId: targetId, text: reply, ts: Date.now() + 600 };
            next = { ...next, messages: { ...next.messages, [channelId]: [...next.messages[channelId], m] } };
            setTimeout(() => playDmPing(), 600);
          }
        }
      }
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } }));
        }, 200);
      }
      return badged.state;
    });
    if (outgoingRemotes.length && authUserId) {
      const safeRemotes = outgoingRemotes.filter((out) => isRemoteChannel(out.channelId, authUserId));
      for (const out of safeRemotes) {
        rtLog(out.channelId.startsWith("dm:") ? "dm" : "msg", "out", `${out.channelId} · ${out.text.slice(0, 30)}`);
      }
      if (safeRemotes.length) {
        void supabase.from("messages").insert(
          safeRemotes.map((out) => ({
            id: out.id,
            channel_id: out.channelId,
            author_id: authUserId,
            text: out.text,
            kind: out.kind,
            attachment: out.attachment,
            reply_to_id: out.replyToId
          }))
        ).then(({ error }) => {
          if (error) {
            console.error("send failed", error);
            rtLog("error", "send-failed", error.message);
          } else {
            for (const out of safeRemotes) {
              if (out.channelId.startsWith("dm:") || out.kind === "system") continue;
              import("./ai-chatbots.functions-Bjx8FIhN.mjs").then(({ aiChatbotReply }) => {
                aiChatbotReply({ data: { channel_id: out.channelId, text: out.text } }).catch(() => {
                });
              }).catch(() => {
              });
              if (out.kind === "text" && /boobubble/i.test(out.text)) {
                import("./boobubble.functions-BRP0x1de.mjs").then(({ askBoobubbleInLobby }) => {
                  askBoobubbleInLobby({ data: { channel_id: out.channelId, text: out.text } }).catch(() => {
                  });
                }).catch(() => {
                });
              }
            }
          }
        });
      }
    }
    setReplyingTo(null);
  }, [authUserId, isGuest]);
  const startDM = reactExports.useCallback((userId) => {
    if (isGuest) {
      showDmParticipantError("🚫 Guest users cannot send DMs. Sign up to message users.");
      if (typeof window !== "undefined") {
        alert("Guest users not allowed DM. Sign up to message users.");
      }
      return;
    }
    if (isLocalBotPeerId(userId)) {
      const channelId2 = dmChannelFor(authUserId, userId);
      if (!channelId2) return;
      setState((s) => {
        const next = {
          ...s,
          dmOrder: s.dmOrder.includes(userId) ? s.dmOrder : [...s.dmOrder, userId],
          activeChannel: channelId2
        };
        const badged = applyBadges(next);
        if (badged.newBadges.length && typeof window !== "undefined") {
          setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
        }
        return badged.state;
      });
      return;
    }
    if (!authUserId || !isUuid(authUserId)) {
      showDmParticipantError("Could not open DM — sign in again and retry.");
      return;
    }
    if (!isUuid(userId)) {
      showDmParticipantError("Could not open DM — this profile is not available yet.");
      return;
    }
    const channelId = dmChannelFor(authUserId, userId);
    if (!channelId) {
      showDmParticipantError("Could not open DM — invalid conversation.");
      return;
    }
    setState((s) => {
      const next = {
        ...s,
        dmOrder: s.dmOrder.includes(userId) ? s.dmOrder : [...s.dmOrder, userId],
        activeChannel: channelId
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
  }, [authUserId, isGuest]);
  const closeDM = reactExports.useCallback((userId) => {
    const channelId = dmChannelFor(authUserId, userId);
    if (!channelId) return;
    setState((s) => ({
      ...s,
      dmOrder: s.dmOrder.filter((id) => id !== userId),
      activeChannel: s.activeChannel === channelId ? s.roomOrder[0] || s.activeChannel : s.activeChannel
    }));
  }, [authUserId]);
  const joinRoom = reactExports.useCallback((roomId) => {
    setState((s) => {
      const room = s.rooms[roomId];
      if (!room || room.members.includes("me")) return { ...s, activeChannel: roomId };
      const next = {
        ...s,
        rooms: { ...s.rooms, [roomId]: { ...room, members: [...room.members, "me"] } },
        activeChannel: roomId
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
  }, []);
  const createRoom2 = reactExports.useCallback((name, topic) => {
    setState((s) => {
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + uid().slice(0, 4);
      const room = {
        id,
        name,
        topic: topic || "New room",
        members: ["me", "bot-gamebot"],
        roles: { me: "owner", "bot-gamebot": "admin" },
        isPublic: true
      };
      const next = {
        ...s,
        rooms: { ...s.rooms, [id]: room },
        roomOrder: [...s.roomOrder, id],
        activeChannel: id
      };
      const badged = applyBadges(next);
      if (badged.newBadges.length && typeof window !== "undefined") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
      }
      return badged.state;
    });
  }, []);
  const updateMe = reactExports.useCallback((patch) => {
    setState((s) => ({
      ...s,
      me: { ...s.me, ...patch },
      users: { ...s.users, me: { ...s.users.me, ...patch } }
    }));
  }, []);
  const adjustPoints = reactExports.useCallback((userId, delta) => {
    setState((s) => {
      const u = s.users[userId];
      if (!u) return s;
      const newXp = Math.max(0, u.xp + delta);
      const updated = { ...u, xp: newXp, level: xpToLevel(newXp) };
      const next = {
        ...s,
        users: { ...s.users, [userId]: updated },
        me: userId === "me" ? { ...s.me, xp: newXp, level: updated.level } : s.me
      };
      if (userId === "me") {
        const badged = applyBadges(next);
        if (badged.newBadges.length && typeof window !== "undefined") {
          setTimeout(() => window.dispatchEvent(new CustomEvent("palrgo:badge", { detail: { ids: badged.newBadges } })), 200);
        }
        return badged.state;
      }
      return next;
    });
  }, []);
  const adjustCoins = reactExports.useCallback((userId, delta) => {
    setState((s) => {
      const u = s.users[userId];
      if (!u) return s;
      const newCoins = Math.max(0, (u.coins ?? 0) + delta);
      const updated = { ...u, coins: newCoins };
      return {
        ...s,
        users: { ...s.users, [userId]: updated },
        me: userId === "me" ? { ...s.me, coins: newCoins } : s.me
      };
    });
  }, []);
  const toggleSocial = reactExports.useCallback((key, userId, add) => {
    setState((s) => {
      const me = s.users.me;
      const list = new Set(me[key] ?? []);
      if (add) list.add(userId);
      else list.delete(userId);
      const other = key === "friends" ? "blocked" : "friends";
      const otherList = new Set(me[other] ?? []);
      if (add) otherList.delete(userId);
      const updated = { ...me, [key]: [...list], [other]: [...otherList] };
      return {
        ...s,
        me: { ...s.me, [key]: updated[key], [other]: updated[other] },
        users: { ...s.users, me: updated }
      };
    });
  }, []);
  const addFriend = reactExports.useCallback((id) => toggleSocial("friends", id, true), [toggleSocial]);
  const removeFriend = reactExports.useCallback((id) => toggleSocial("friends", id, false), [toggleSocial]);
  const blockUser = reactExports.useCallback((id) => toggleSocial("blocked", id, true), [toggleSocial]);
  const unblockUser = reactExports.useCallback((id) => toggleSocial("blocked", id, false), [toggleSocial]);
  const reset = reactExports.useCallback(() => {
    localStorage.removeItem(storageKeyFor(username));
    streakChecked.current = null;
    setState(seed(username));
  }, [username]);
  const findMessage = reactExports.useCallback((id) => {
    for (const arr of Object.values(state.messages)) {
      const m = arr.find((x) => x.id === id);
      if (m) return m;
    }
    return void 0;
  }, [state.messages]);
  const staffKick = reactExports.useCallback((targetId, channelId, targetName) => {
    setState((s) => {
      const chanMod = { ...s.moderation?.[channelId] || {} };
      const prev = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
      const until = Date.now() + 5 * 60 * 1e3;
      chanMod[targetId] = { ...prev, kickedUntil: until, kickVotes: [] };
      const sys = {
        id: uid(),
        channelId,
        authorId: "bot-gamebot",
        kind: "system",
        ts: Date.now(),
        text: `🚪 **@${targetName}** was **KICKED** from the room by staff (5 min).`
      };
      return {
        ...s,
        moderation: { ...s.moderation || {}, [channelId]: chanMod },
        messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], sys] }
      };
    });
  }, []);
  const staffLocalMute = reactExports.useCallback((targetId, channelId, minutes, targetName) => {
    setState((s) => {
      const chanMod = { ...s.moderation?.[channelId] || {} };
      const prev = chanMod[targetId] || { muteVotes: [], kickVotes: [] };
      const until = Date.now() + minutes * 60 * 1e3;
      chanMod[targetId] = { ...prev, mutedUntil: until, muteVotes: [] };
      const sys = {
        id: uid(),
        channelId,
        authorId: "bot-gamebot",
        kind: "system",
        ts: Date.now(),
        text: `🔇 **@${targetName}** was **MUTED** by staff (${minutes} min).`
      };
      return {
        ...s,
        moderation: { ...s.moderation || {}, [channelId]: chanMod },
        messages: { ...s.messages, [channelId]: [...s.messages[channelId] || [], sys] }
      };
    });
  }, []);
  const pushSystem = reactExports.useCallback((channelId, text) => {
    setState((s) => ({
      ...s,
      messages: {
        ...s.messages,
        [channelId]: [
          ...s.messages[channelId] || [],
          { id: uid(), channelId, authorId: "bot-gamebot", text, ts: Date.now(), kind: "system" }
        ]
      }
    }));
  }, []);
  const wipeChannel = reactExports.useCallback((channelId) => {
    setState((s) => ({ ...s, messages: { ...s.messages, [channelId]: [] } }));
  }, []);
  const deleteRoom = reactExports.useCallback((roomId) => {
    setState((s) => {
      if (!s.rooms[roomId]) return s;
      const { [roomId]: _removed, ...rooms } = s.rooms;
      const { [roomId]: _msgs, ...messages } = s.messages;
      const roomOrder = s.roomOrder.filter((id) => id !== roomId);
      const activeChannel = s.activeChannel === roomId ? roomOrder[0] || "lobby" : s.activeChannel;
      return { ...s, rooms, messages, roomOrder, activeChannel };
    });
  }, []);
  const syncAdminChannels = reactExports.useCallback((channels) => {
    setState((s) => {
      const rooms = { ...s.rooms };
      let roomOrder = [...s.roomOrder];
      const validIds = new Set(channels.map((c) => c.id));
      for (const c of channels) {
        const kind = c.kind ?? "chat";
        const existing = rooms[c.id];
        if (existing) {
          rooms[c.id] = {
            ...existing,
            name: c.name,
            topic: c.topic || existing.topic,
            kind,
            game: kind === "game" ? normalizeRoomGameConfig(c.game) : void 0
          };
        } else {
          rooms[c.id] = {
            id: c.id,
            name: c.name,
            topic: c.topic || "",
            members: ["me", ...SEED_BOTS.map((b) => b.id)],
            roles: { me: "member", "bot-gamebot": "owner" },
            isPublic: true,
            kind,
            game: kind === "game" ? normalizeRoomGameConfig(c.game) : void 0
          };
          if (!roomOrder.includes(c.id)) roomOrder.push(c.id);
        }
      }
      const messages = { ...s.messages };
      for (const id of Object.keys(rooms)) {
        if (id.startsWith("adm-") && !validIds.has(id)) {
          delete rooms[id];
          delete messages[id];
          roomOrder = roomOrder.filter((x) => x !== id);
        }
      }
      const activeChannel = rooms[s.activeChannel] ? s.activeChannel : roomOrder[0] || "lobby";
      return { ...s, rooms, messages, roomOrder, activeChannel };
    });
  }, []);
  const value = reactExports.useMemo(() => ({
    state,
    setActive,
    send,
    startDM,
    closeDM,
    joinRoom,
    createRoom: createRoom2,
    updateMe,
    adjustPoints,
    adjustCoins,
    addFriend,
    removeFriend,
    blockUser,
    unblockUser,
    pushSystem,
    wipeChannel,
    deleteRoom,
    syncAdminChannels,
    isFriend: (id) => (state.me.friends ?? []).includes(id),
    isBlocked: (id) => (state.me.blocked ?? []).includes(id),
    reset,
    channelMessages: (id) => state.messages[id] || [],
    channelLabel: (id) => {
      if (id.startsWith("dm:")) {
        const { peerId } = parseDmChannel(id, authUserId);
        const u = peerId ? state.users[peerId] : void 0;
        return u ? u.name : "Direct Message";
      }
      return state.rooms[id]?.name || id;
    },
    isDM: (id) => id.startsWith("dm:"),
    dmUser: (id) => {
      if (!id.startsWith("dm:")) return void 0;
      const { peerId } = parseDmChannel(id, authUserId);
      return peerId ? state.users[peerId] : void 0;
    },
    dmChannelFor: (peerId) => dmChannelFor(authUserId, peerId),
    replyingTo,
    setReplyingTo,
    findMessage,
    dmPeerReadAt: (channelId) => {
      if (!authUserId || !channelId.startsWith("dm:")) return 0;
      const reads = dmReads[channelId] || {};
      let max = 0;
      for (const [uid2, ts] of Object.entries(reads)) {
        if (uid2 !== authUserId && ts > max) max = ts;
      }
      return max;
    },
    isDmUnread: (peerId) => {
      if (!authUserId || !isUuid(peerId)) return false;
      const ch = dmChannelFor(authUserId, peerId);
      if (!ch || !isRemoteDmChannel(ch, authUserId)) return false;
      if (state.activeChannel === ch) return false;
      const latest = dmLatestTs[ch] ?? 0;
      if (!latest) return false;
      const myRead = dmReads[ch]?.[authUserId] ?? 0;
      return latest > myRead;
    },
    dmUnreadCount: (() => {
      if (!authUserId) return 0;
      let n = 0;
      for (const peerId of state.dmOrder) {
        if (!isUuid(peerId)) continue;
        const ch = dmChannelFor(authUserId, peerId);
        if (!ch || !isRemoteDmChannel(ch, authUserId)) continue;
        if (state.activeChannel === ch) continue;
        const latest = dmLatestTs[ch] ?? 0;
        if (!latest) continue;
        const myRead = dmReads[ch]?.[authUserId] ?? 0;
        if (latest > myRead) n++;
      }
      return n;
    })(),
    staffKick,
    staffLocalMute
  }), [state, setActive, send, startDM, closeDM, joinRoom, createRoom2, updateMe, adjustPoints, adjustCoins, addFriend, removeFriend, blockUser, unblockUser, reset, replyingTo, findMessage, authUserId, dmReads, dmLatestTs, staffKick, staffLocalMute, pushSystem, wipeChannel, deleteRoom, syncAdminChannels]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatCtx.Provider, { value, children });
}
function ChatProvider({ username, authUserId = null, isGuest = false, children }) {
  const [recoveryKey, setRecoveryKey] = reactExports.useState(0);
  const handleRecover = reactExports.useCallback(() => {
    try {
      localStorage.removeItem(storageKeyFor(username));
    } catch {
    }
    setRecoveryKey((k) => k + 1);
  }, [username]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatErrorBoundary, { onRecover: handleRecover, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatProviderInner, { username, authUserId, isGuest, children }, recoveryKey) });
}
function useChat() {
  const ctx2 = reactExports.useContext(ChatCtx);
  if (!ctx2) throw new Error("useChat must be inside ChatProvider");
  return ctx2;
}
function useOptionalChat() {
  return reactExports.useContext(ChatCtx);
}
const DEFAULTS$1 = {
  defaultTab: "foryou",
  sortOverride: "smart",
  compactCards: false,
  hideCounts: false,
  hideMedia: false,
  autoplayVideos: true,
  postSound: true,
  emojiEffects: true,
  defaultPrivacy: "public",
  anonymousByDefault: false,
  mutedKeywords: [],
  mutedHashtags: [],
  notifyFriendPosts: true,
  notifyComments: true,
  notifyReactions: true,
  notifyDMs: true
};
const KEY$2 = "palrgo:feed-prefs:v1";
function sanitizePrefs(raw) {
  const defaultTab = ["foryou", "trending", "latest", "friends"].includes(raw.defaultTab ?? "") ? raw.defaultTab : DEFAULTS$1.defaultTab;
  const sortOverride = ["smart", "latest", "trending"].includes(raw.sortOverride ?? "") ? raw.sortOverride : DEFAULTS$1.sortOverride;
  const defaultPrivacy = ["public", "friends"].includes(raw.defaultPrivacy ?? "") ? raw.defaultPrivacy : DEFAULTS$1.defaultPrivacy;
  return {
    ...DEFAULTS$1,
    ...raw,
    defaultTab,
    sortOverride,
    defaultPrivacy,
    mutedKeywords: Array.isArray(raw.mutedKeywords) ? raw.mutedKeywords.filter((v) => typeof v === "string") : [],
    mutedHashtags: Array.isArray(raw.mutedHashtags) ? raw.mutedHashtags.filter((v) => typeof v === "string") : []
  };
}
function load$1() {
  if (typeof window === "undefined") return DEFAULTS$1;
  try {
    const raw = localStorage.getItem(KEY$2);
    if (!raw) return DEFAULTS$1;
    return sanitizePrefs(JSON.parse(raw));
  } catch {
    return DEFAULTS$1;
  }
}
const FeedPrefsCtx = reactExports.createContext(null);
function FeedPrefsProvider({ children }) {
  const [prefs, setState] = reactExports.useState(DEFAULTS$1);
  reactExports.useEffect(() => {
    setState(load$1());
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY$2, JSON.stringify(prefs));
    } catch {
    }
  }, [prefs]);
  const value = reactExports.useMemo(() => ({
    prefs,
    setPrefs: (patch) => setState((p) => ({ ...p, ...patch })),
    reset: () => setState(DEFAULTS$1)
  }), [prefs]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPrefsCtx.Provider, { value, children });
}
function useFeedPrefs() {
  const ctx2 = reactExports.useContext(FeedPrefsCtx);
  if (!ctx2) {
    return { prefs: DEFAULTS$1, setPrefs: () => {
    }, reset: () => {
    } };
  }
  return ctx2;
}
const KEY$1 = "palrgo:ignore:v1";
const DEFAULTS = { ignoredIds: [], ignoreAllBots: false };
const Ctx = reactExports.createContext(null);
function load() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY$1);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw);
    return {
      ignoredIds: Array.isArray(p.ignoredIds) ? p.ignoredIds.filter((x) => typeof x === "string") : [],
      ignoreAllBots: !!p.ignoreAllBots
    };
  } catch {
    return DEFAULTS;
  }
}
function IgnoreProvider({ children }) {
  const [state, setState] = reactExports.useState(DEFAULTS);
  reactExports.useEffect(() => {
    setState(load());
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY$1, JSON.stringify(state));
    } catch {
    }
  }, [state]);
  const toggleIgnoreUser = reactExports.useCallback((id) => {
    setState((s) => s.ignoredIds.includes(id) ? { ...s, ignoredIds: s.ignoredIds.filter((x) => x !== id) } : { ...s, ignoredIds: [...s.ignoredIds, id] });
  }, []);
  const setIgnoreAllBots = reactExports.useCallback((v) => {
    setState((s) => ({ ...s, ignoreAllBots: v }));
  }, []);
  const value = reactExports.useMemo(() => ({
    ...state,
    isIgnored: (id, isBot) => !!isBot && state.ignoreAllBots || state.ignoredIds.includes(id),
    toggleIgnoreUser,
    setIgnoreAllBots
  }), [state, toggleIgnoreUser, setIgnoreAllBots]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useIgnore() {
  const ctx2 = reactExports.useContext(Ctx);
  if (!ctx2) return {
    ignoredIds: [],
    ignoreAllBots: false,
    isIgnored: () => false,
    toggleIgnoreUser: () => {
    },
    setIgnoreAllBots: () => {
    }
  };
  return ctx2;
}
const listPlans = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8d9e04e848d8fab4e0075d8a662247217a6bffda2cb4cb4b87313f1ae1e4df8c"));
const getSubscriptionMode = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c690cda28e2c6fbe81128e275c71c570f1d8a5d3b9deca57af0fe77c9c9a3de4"));
const getMySubscription = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("9426669075fecaa116539005d65966feb0dd23a91150d7afcc43e32fbbca7cc6"));
const requestSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  planId: stringType().uuid(),
  cycle: enumType(["monthly", "yearly"]),
  proofReference: stringType().trim().max(200).optional()
}).parse(d)).handler(createSsrRpc("dea1e7bf394b0e9400c44ad97ae3d16e6cf1c36154ae012f5214936f0fa974b0"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("08fea8aded1dfa5bb9a8d8bfa200f8af31609388a5b089ce8f6e23ccff90a7b9"));
const planInput = objectType({
  id: stringType().uuid().optional(),
  slug: stringType().min(2).max(40).regex(/^[a-z0-9_-]+$/),
  name: stringType().min(1).max(60),
  description: stringType().max(500).optional().nullable(),
  badge: stringType().max(20).optional().nullable(),
  tier: stringType().max(30).default("free"),
  currency_code: stringType().length(3).default("INR"),
  currency_symbol: stringType().max(4).default("₹"),
  monthly_price: numberType().min(0),
  yearly_price: numberType().min(0),
  trial_days: numberType().int().min(0).max(365).default(0),
  features: arrayType(stringType()).default([]),
  perks: recordType(unknownType()).default({}),
  max_personal_chatrooms: numberType().int().min(0).max(1e3).default(0),
  sort_order: numberType().int().default(0),
  active: booleanType().default(true),
  is_default: booleanType().default(false)
});
const adminUpsertPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => planInput.parse(d)).handler(createSsrRpc("95fcf9064e671a5496066f87d841cf8c4a935837d7d0a99f9833d806d269ad8b"));
const adminDeletePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d421e0c69082bec8c49e9d432715728ac0e6de8a3918513ca03496a82bbcebf6"));
const adminListPayments = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d = {}) => objectType({
  status: enumType(["pending", "approved", "rejected", "all"]).default("pending")
}).parse(d)).handler(createSsrRpc("302ebdfb46516d0704d6335b88380892b318816585b355ad37d60404ca776bb9"));
const adminApprovePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  paymentId: stringType().uuid(),
  note: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("0dd5493d7ebe1b7214b35ee40b546933b7f0bd15ce2a71dcf3fe1789d4a0901c"));
const adminRejectPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  paymentId: stringType().uuid(),
  note: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("0102340eb61a8d1ae963d01d49c56af8d197df4b2e9cacae375d9d388bde78ea"));
const adminSetSubscriptionMode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).inputValidator((d) => objectType({
  mode: enumType(["off", "optional", "required"]),
  payment_instructions: stringType().max(2e3).optional(),
  default_currency: stringType().length(3).optional(),
  default_currency_symbol: stringType().max(4).optional()
}).parse(d)).handler(createSsrRpc("47d33cd1c3ffd85c80364fb86d59822bdcedb85e129d8371cf01b510711307e0"));
const adminSubscriptionStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("wallet.write")]).handler(createSsrRpc("34354b98b1e2f914cc9eb30dded79488b6ba96472ec69384dc1b6f29a9b5f516"));
function useSubscriptionMode() {
  const fn = useServerFn(getSubscriptionMode);
  return useQuery({ queryKey: ["subscription-mode"], queryFn: () => fn(), staleTime: 6e4 });
}
function usePlans() {
  const fn = useServerFn(listPlans);
  return useQuery({ queryKey: ["subscription-plans"], queryFn: () => fn(), staleTime: 3e4 });
}
function useMySubscription() {
  const { user } = useAuth();
  const fn = useServerFn(getMySubscription);
  return useQuery({
    queryKey: ["my-subscription", user?.id ?? "anon"],
    queryFn: () => fn(),
    enabled: !!user?.id,
    staleTime: 3e4
  });
}
const ALLOWED_PATHS = ["/pricing", "/installer", "/banned", "/welcome", "/login", "/reset-password"];
function SubscriptionGate() {
  const { user } = useAuth();
  const { data: cfg } = useSubscriptionMode();
  const { data: mySub, isLoading } = useMySubscription();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  reactExports.useEffect(() => {
    if (!user || isLoading) return;
    if (cfg?.mode !== "required") return;
    if (mySub?.isActive) return;
    if (ALLOWED_PATHS.some((p) => path.startsWith(p))) return;
    if (path.startsWith("/admin")) return;
    navigate({ to: "/pricing" });
  }, [user, cfg?.mode, mySub?.isActive, isLoading, path, navigate]);
  return null;
}
const ACCENTS = [
  { id: "green", label: "Lime Green", swatch: "oklch(0.82 0.2 130)", gradient: "linear-gradient(135deg, oklch(0.82 0.2 130), oklch(0.7 0.18 150))" },
  { id: "blue", label: "Modern Blue", swatch: "oklch(0.62 0.18 252)", gradient: "linear-gradient(135deg, oklch(0.62 0.18 252), oklch(0.55 0.2 270))" },
  { id: "purple", label: "Purple + Indigo", swatch: "oklch(0.58 0.22 290)", gradient: "linear-gradient(135deg, oklch(0.58 0.22 290), oklch(0.5 0.22 270))" },
  { id: "orange", label: "Orange + Coral", swatch: "oklch(0.7 0.19 45)", gradient: "linear-gradient(135deg, oklch(0.72 0.2 55), oklch(0.65 0.22 20))" },
  { id: "rose", label: "Rose Pink + Violet", swatch: "oklch(0.66 0.23 10)", gradient: "linear-gradient(135deg, oklch(0.7 0.23 5), oklch(0.55 0.22 305))" },
  { id: "beige", label: "Beige + Brown", swatch: "oklch(0.52 0.09 55)", gradient: "linear-gradient(135deg, oklch(0.78 0.06 75), oklch(0.45 0.07 50))" }
];
const KEY = "palrgo-accent";
function applyAccent(a) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-accent", a);
}
function getStoredAccent() {
  if (typeof window === "undefined") return "purple";
  return localStorage.getItem(KEY) || "purple";
}
function useAccent() {
  const [accent, setAccent] = reactExports.useState("purple");
  reactExports.useEffect(() => {
    const a = getStoredAccent();
    setAccent(a);
    applyAccent(a);
  }, []);
  const choose = (a) => {
    setAccent(a);
    localStorage.setItem(KEY, a);
    applyAccent(a);
  };
  return { accent, setAccent: choose };
}
function useResolvedTheme() {
  const [t, setT] = reactExports.useState(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setT(el.classList.contains("dark") ? "dark" : "light");
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return t;
}
function useBrandingMap() {
  const { raw } = useAppSettings();
  return raw.branding || {};
}
function useBrandAsset(slot, roomId, forceTheme) {
  const b = useBrandingMap();
  const resolved = useResolvedTheme();
  const theme = forceTheme ?? resolved;
  if (roomId && b.rooms?.[roomId]) {
    const r = b.rooms[roomId];
    const rk = `${slot}_${theme}`;
    const rl = `${slot}_light`;
    const rd = `${slot}_dark`;
    const v = r[rk] || r[rl] || r[rd];
    if (v) return v;
  }
  const key = `${slot}_${theme}`;
  return b[key] || b[`${slot}_${theme === "dark" ? "light" : "dark"}`];
}
function useBrandSize(slot) {
  const b = useBrandingMap();
  const v = b.sizes?.[slot];
  if (v == null) return void 0;
  if (typeof v === "number") return { w: v, h: v };
  return v;
}
function BrandMark({ slot, roomId, alt = "Logo", className, fallback, forceTheme }) {
  const url = useBrandAsset(slot, roomId, forceTheme);
  const size = useBrandSize(slot);
  const fit = size?.fit ?? "contain";
  const locked = !!size?.lock;
  const pad = size?.pad;
  const padStyle = pad ? {
    paddingTop: pad.t || void 0,
    paddingRight: pad.r || void 0,
    paddingBottom: pad.b || void 0,
    paddingLeft: pad.l || void 0,
    boxSizing: "border-box"
  } : {};
  const style = size ? locked ? { maxWidth: "100%", maxHeight: "100%", width: "100%", height: "100%", objectFit: fit, objectPosition: "center", ...padStyle } : { width: size.w, height: size.h, maxWidth: "100%", objectFit: fit, objectPosition: "center", ...padStyle } : padStyle;
  if (!url) {
    if (!fallback) return null;
    if (!size || locked) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: fallback });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style, className: "inline-grid place-items-center", children: fallback });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt, className, style });
}
function useBrandText(slot, roomId) {
  const b = useBrandingMap();
  if (roomId && b.rooms?.[roomId]?.text != null) return b.rooms[roomId].text;
  return b.texts?.[slot];
}
function BrandText({ slot, roomId, defaultText, className, forceTheme, alwaysShow }) {
  const url = useBrandAsset(slot, roomId, forceTheme);
  const override = useBrandText(slot, roomId);
  if (url && !alwaysShow) return null;
  const text = override ?? defaultText;
  if (!text) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: text });
}
const DEFAULT_BLUE = "/favicon-blue.png";
const DEFAULT_RED = "/favicon-red.png";
function setFavicon(href) {
  if (typeof document === "undefined") return;
  const links = document.querySelectorAll("link[rel~='icon']");
  links.forEach((l) => l.parentNode?.removeChild(l));
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href;
  document.head.appendChild(link);
}
function FaviconSwitcher() {
  const { dmUnreadCount, state } = useChat();
  const branding = useBrandingMap();
  const activeId = state.activeChannel;
  reactExports.useEffect(() => {
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const roomFav = activeId && branding.rooms?.[activeId] ? (isDark ? branding.rooms[activeId].favicon_dark : branding.rooms[activeId].favicon_light) || branding.rooms[activeId].favicon_light || branding.rooms[activeId].favicon_dark : void 0;
    const globalFav = (isDark ? branding.favicon_dark : branding.favicon_light) || branding.favicon_light || branding.favicon_dark;
    if (dmUnreadCount > 0) {
      setFavicon(DEFAULT_RED);
    } else {
      setFavicon(roomFav || globalFav || DEFAULT_BLUE);
    }
  }, [dmUnreadCount, activeId, branding]);
  return null;
}
function usePresenceHeartbeat() {
  reactExports.useEffect(() => {
    let cancelled = false;
    let intervalId;
    let userId = null;
    async function beat(status = "online") {
      if (!userId || cancelled) return;
      await supabase.from("profiles").update({ last_seen: (/* @__PURE__ */ new Date()).toISOString(), status }).eq("id", userId);
      rtLog("heartbeat", status);
    }
    function sendOfflineBeacon() {
      if (!userId) return;
      try {
        const url = `${"https://aofjhfsecwsrcvvvcfcy.supabase.co"}/rest/v1/profiles?id=eq.${userId}`;
        const body = JSON.stringify({
          last_seen: (/* @__PURE__ */ new Date()).toISOString(),
          status: "offline"
        });
        const key = "sb_publishable_R6cvebYP3NIBStd_txk04Q_a5agjzs_";
        void fetch(url, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            apikey: key,
            authorization: `Bearer ${key}`,
            prefer: "return=minimal"
          },
          body,
          keepalive: true
        });
      } catch {
      }
    }
    async function start() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      userId = data.user?.id ?? null;
      if (!userId) return;
      void beat("online");
      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") void beat("online");
      }, 25e3);
    }
    void start();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const newId = session?.user?.id ?? null;
      if (newId && newId !== userId) {
        userId = newId;
        void beat("online");
      }
    });
    const onVisible = () => {
      if (document.visibilityState === "visible") void beat("online");
      else void beat("offline");
    };
    const onFocus = () => void beat("online");
    const onUnload = () => sendOfflineBeacon();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);
}
const BAN_STORAGE_KEY = "lovable:last-ban";
function readStoredBan() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BAN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function clearStoredBan() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BAN_STORAGE_KEY);
  } catch {
  }
}
function useBanGuard(userId) {
  reactExports.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("user_bans_self").select("reason, expires_at").eq("user_id", userId).eq("active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (cancelled || !data) return;
      if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return;
      const payload = {
        reason: data.reason ?? null,
        expires_at: data.expires_at ?? null,
        signed_out_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        window.localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(payload));
      } catch {
      }
      await supabase.auth.signOut();
      window.location.replace("/banned");
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
let conflictState = { conflict: false, prevUid: null, nextUid: null, at: 0 };
const conflictListeners = /* @__PURE__ */ new Set();
function emitConflict(next) {
  conflictState = next;
  conflictListeners.forEach((l) => l());
}
function useSessionConflict() {
  return reactExports.useSyncExternalStore(
    (cb) => {
      conflictListeners.add(cb);
      return () => conflictListeners.delete(cb);
    },
    () => conflictState,
    () => conflictState
  );
}
function clearSessionConflict() {
  emitConflict({ conflict: false, prevUid: null, nextUid: null, at: 0 });
}
let liveUid = null;
const uidListeners = /* @__PURE__ */ new Set();
function setLiveUid(v) {
  if (liveUid === v) return;
  liveUid = v;
  uidListeners.forEach((l) => l());
}
function nukeRealtime(reason) {
  try {
    const channels = supabase.getChannels();
    rtLog("channel", "nuke-all", `${channels.length} (${reason})`);
    channels.forEach((ch) => {
      try {
        supabase.removeChannel(ch);
      } catch {
      }
    });
  } catch (e) {
    rtLog("error", "nuke-failed", String(e));
  }
}
function useSessionChangeDetector() {
  const knownUidRef = reactExports.useRef(void 0);
  const queryClient = useQueryClient();
  const router2 = useRouter();
  reactExports.useEffect(() => {
    let cancelled = false;
    const handleUid = (next, source) => {
      const prev = knownUidRef.current;
      if (prev === void 0) {
        knownUidRef.current = next;
        setLiveUid(next);
        rtLog("auth", "init", `${next ?? "anon"} (${source})`);
        return;
      }
      if (next === prev) return;
      knownUidRef.current = next;
      setLiveUid(next);
      if (prev && next && prev !== next) {
        rtLog("auth", "swap", `${prev.slice(0, 6)}→${next.slice(0, 6)} (${source})`);
        toast.warning("Another account session has replaced this tab.", {
          description: "Refreshing realtime connection…",
          duration: 8e3
        });
        emitConflict({ conflict: true, prevUid: prev, nextUid: next, at: Date.now() });
        nukeRealtime(`auth ${prev.slice(0, 6)}→${next.slice(0, 6)}`);
        queryClient.invalidateQueries();
        void router2.invalidate();
        return;
      }
      if (prev && !next) {
        rtLog("auth", "signed-out", `(${source})`);
      } else if (!prev && next) {
        rtLog("auth", "signed-in", `${next.slice(0, 8)} (${source})`);
      }
    };
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      handleUid(data.user?.id ?? null, "init");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      rtLog("auth", event, session?.user?.id?.slice(0, 8) ?? "anon");
      handleUid(session?.user?.id ?? null, event);
    });
    const onStorage = (e) => {
      if (!e.key || !e.key.includes("supabase.auth")) return;
      supabase.auth.getUser().then(({ data }) => handleUid(data.user?.id ?? null, "storage"));
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getUser().then(({ data }) => handleUid(data.user?.id ?? null, "focus"));
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [queryClient, router2]);
}
const KIND_COLOR = {
  ws: "text-blue-400",
  channel: "text-purple-400",
  presence: "text-emerald-400",
  dm: "text-pink-400",
  msg: "text-cyan-400",
  typing: "text-amber-400",
  heartbeat: "text-zinc-400",
  auth: "text-orange-400",
  error: "text-red-400"
};
function RealtimeDebugOverlay() {
  const [enabled, setEnabled] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [events, setEvents] = reactExports.useState([]);
  const [uid2, setUid] = reactExports.useState(null);
  const [, force] = reactExports.useState(0);
  reactExports.useEffect(() => {
    setEnabled(isRtDebugEnabled());
    const onToggle = () => setEnabled(isRtDebugEnabled());
    window.addEventListener("palrgo:rt-debug-toggle", onToggle);
    return () => window.removeEventListener("palrgo:rt-debug-toggle", onToggle);
  }, []);
  reactExports.useEffect(() => {
    if (!enabled) return;
    return rtSubscribe((evts) => setEvents([...evts]));
  }, [enabled]);
  reactExports.useEffect(() => {
    if (!enabled) return;
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUid(s?.user?.id ?? null);
    });
    const id = window.setInterval(() => force((t) => t + 1), 1e3);
    return () => {
      sub.subscription.unsubscribe();
      window.clearInterval(id);
    };
  }, [enabled]);
  if (!enabled) return null;
  const channels = (() => {
    try {
      return supabase.getChannels().map((c) => ({ topic: c.topic, state: c.state }));
    } catch {
      return [];
    }
  })();
  const last = events.slice(-50).reverse();
  const lastBeat = rtCounters.lastHeartbeatAt ? `${Math.max(0, Math.round((Date.now() - rtCounters.lastHeartbeatAt) / 1e3))}s ago` : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed bottom-3 right-3 z-[9999] font-mono text-[11px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-auto rounded-lg border border-white/10 bg-black/85 text-white shadow-2xl backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${rtCounters.wsState === "SUBSCRIBED" || rtCounters.wsState === "open" ? "bg-emerald-400" : "bg-amber-400"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "RT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: rtCounters.wsState }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
            "ch:",
            channels.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
            "in:",
            rtCounters.msgIn + rtCounters.dmIn
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
            "↺",
            rtCounters.wsConnects
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 opacity-50", children: open ? "▾" : "▸" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[360px] max-w-[90vw] border-t border-white/10 p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-0.5 px-1 pb-2 text-[10px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "uid: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: uid2 ? `${uid2.slice(0, 8)}…` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "beat: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: lastBeat })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "conn↑/↓: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-80", children: [
            rtCounters.wsConnects,
            "/",
            rtCounters.wsDisconnects
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "ch err: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: rtCounters.channelErrors })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "dm in/out: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-80", children: [
            rtCounters.dmIn,
            "/",
            rtCounters.dmOut
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "presence j/l: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-80", children: [
            rtCounters.presenceJoins,
            "/",
            rtCounters.presenceLeaves
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 px-1 text-[10px] font-semibold opacity-60", children: "CHANNELS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 max-h-24 overflow-auto rounded bg-white/5 p-1", children: [
        channels.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 opacity-50", children: "none" }),
        channels.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.topic }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: c.state })
        ] }, i))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between px-1 text-[10px] font-semibold opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "EVENTS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: rtClear, className: "opacity-70 hover:opacity-100", children: "clear" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setRtDebugEnabled(false);
            setOpen(false);
          }, className: "opacity-70 hover:opacity-100", children: "off" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-64 overflow-auto rounded bg-white/5 p-1", children: [
        last.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-1 opacity-50", children: "no events yet" }),
        last.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 px-1 leading-snug", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50 tabular-nums", children: new Date(e.ts).toLocaleTimeString().slice(0, 8) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-[60px] shrink-0 ${KIND_COLOR[e.kind]}`, children: e.kind }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", title: e.detail, children: [
            e.label,
            e.detail ? ` · ${e.detail}` : ""
          ] })
        ] }, e.id))
      ] })
    ] })
  ] }) });
}
function SessionConflictBanner() {
  const { conflict, prevUid, nextUid } = useSessionConflict();
  if (!conflict) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 top-0 z-[10000] border-b border-amber-500/40 bg-amber-500/95 px-4 py-2 text-sm text-amber-950 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Another account session has replaced this tab." }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-80", children: [
          prevUid?.slice(0, 6),
          "… → ",
          nextUid?.slice(0, 6) ?? "signed out"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-900",
          children: "Reload now"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: clearSessionConflict,
          className: "rounded-md border border-amber-950/30 px-3 py-1 text-xs font-medium hover:bg-amber-400/30",
          children: "Dismiss"
        }
      )
    ] })
  ] }) });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const HEADER_MARK = "data-admin-header-script";
const FOOTER_MARK = "data-admin-footer-script";
function clearInjected() {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`[${HEADER_MARK}],[${FOOTER_MARK}]`).forEach((n) => n.remove());
}
function inject(html, target, mark, atEnd) {
  if (!html.trim()) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const nodes = Array.from(tpl.content.childNodes);
  for (const node of nodes) {
    let el = node;
    if (node.nodeType === 1 && node.tagName === "SCRIPT") {
      const src = node;
      const s = document.createElement("script");
      for (const attr of Array.from(src.attributes)) s.setAttribute(attr.name, attr.value);
      if (src.textContent) s.textContent = src.textContent;
      el = s;
    }
    if (el.nodeType === 1) el.setAttribute(mark, "1");
    target.appendChild(el);
  }
}
function HeadFootScripts() {
  reactExports.useEffect(() => {
    let active = true;
    const apply = (cfg) => {
      clearInjected();
      if (!cfg || cfg.enabled === false) return;
      if (cfg.header_script) inject(cfg.header_script, document.head, HEADER_MARK);
      if (cfg.footer_script) inject(cfg.footer_script, document.body, FOOTER_MARK);
    };
    (async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "scripts").maybeSingle();
      if (!active) return;
      apply(data?.value ?? null);
    })();
    const channel = supabase.channel("app_settings_scripts").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "app_settings", filter: "key=eq.scripts" },
      (payload) => apply(payload.new?.value ?? null)
    ).subscribe();
    return () => {
      active = false;
      clearInjected();
      supabase.removeChannel(channel);
    };
  }, []);
  return null;
}
let cached = null;
const listeners = /* @__PURE__ */ new Set();
let loaded = false;
async function loadOnce() {
  if (loaded) return;
  loaded = true;
  const { data } = await supabase.from("app_settings").select("key,value").eq("key", "ads").maybeSingle();
  cached = data?.value ?? null;
  listeners.forEach((fn) => fn(cached));
  supabase.channel("app_settings_ads").on("postgres_changes", { event: "*", schema: "public", table: "app_settings", filter: "key=eq.ads" }, (payload) => {
    cached = payload.new?.value ?? null;
    listeners.forEach((fn) => fn(cached));
  }).subscribe();
}
function useAdsConfig() {
  const [cfg, setCfg] = reactExports.useState(cached);
  reactExports.useEffect(() => {
    loadOnce();
    const fn = (c) => setCfg(c);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return cfg;
}
function ensureAdsenseLoader(publisherId) {
  if (typeof document === "undefined") return;
  if (document.querySelector('script[data-adsense-loader="1"]')) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  s.dataset.adsenseLoader = "1";
  document.head.appendChild(s);
}
function AdsAutoLoader() {
  const cfg = useAdsConfig();
  reactExports.useEffect(() => {
    if (!cfg?.enabled || cfg.provider !== "adsense" || !cfg.publisher_id) return;
    if (!cfg.auto_ads) return;
    ensureAdsenseLoader(cfg.publisher_id);
  }, [cfg]);
  return null;
}
function isLive(a) {
  if (!a.active) return false;
  const now = Date.now();
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return false;
  if (a.ends_at && new Date(a.ends_at).getTime() < now) return false;
  return true;
}
function targetEnabled(a, t) {
  const tg = a.target;
  if (!tg) return true;
  return tg[t] !== false;
}
function useAnnouncements(filter) {
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    let cancelled = false;
    const load2 = async () => {
      let q = supabase.from("radio_announcements").select("*").eq("active", true).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
      if (filter?.kind) q = q.eq("kind", filter.kind);
      if (filter?.widgetId === null) q = q.is("widget_id", null);
      else if (filter?.widgetId) q = q.eq("widget_id", filter.widgetId);
      const { data } = await q;
      if (!cancelled) setItems((data ?? []).filter(isLive));
    };
    load2();
    const channel = supabase.channel(`broadcaster-announcements-${filter?.kind ?? "all"}-${filter?.widgetId ?? "any"}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "radio_announcements" },
      () => load2()
    ).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [filter?.kind, filter?.widgetId]);
  return items;
}
function BroadcasterTicker({
  target,
  widgetId,
  className
}) {
  const items = useAnnouncements({ widgetId });
  const dismissKey = `broadcaster_ticker_dismissed.${target}.v1`;
  const [dismissed, setDismissed] = reactExports.useState(() => {
    if (typeof window === "undefined") return /* @__PURE__ */ new Set();
    try {
      const raw = localStorage.getItem(dismissKey);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return /* @__PURE__ */ new Set();
    }
  });
  const persistDismissed = (next) => {
    setDismissed(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(dismissKey, JSON.stringify([...next]));
      } catch {
      }
    }
  };
  const visible = reactExports.useMemo(
    () => items.filter((a) => {
      if (dismissed.has(a.id)) return false;
      if (!targetEnabled(a, target)) return false;
      if (target === "widget") return a.kind === "upcoming_show" || a.kind === "ticker";
      if (target === "chatbar") return a.kind === "ticker" || a.kind === "upcoming_show";
      if (target === "feed") return a.kind === "ticker" || a.kind === "community";
      return true;
    }),
    [items, target, dismissed]
  );
  if (visible.length === 0) return null;
  const dismissAll = () => {
    const next = new Set(dismissed);
    visible.forEach((a) => next.add(a.id));
    persistDismissed(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-2 overflow-hidden bg-primary/10 px-3 py-1.5 text-xs " + (className ?? ""),
      role: "status",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-3.5 w-3.5 text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate flex-1 min-w-0", children: visible.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2 text-muted-foreground", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: a.title }),
          a.body && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            " — ",
            a.body
          ] })
        ] }, a.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: dismissAll,
            className: "flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors",
            title: "Dismiss announcement",
            "aria-label": "Dismiss announcement",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
          }
        )
      ]
    }
  );
}
function BroadcasterAnnouncementsRunner() {
  const seen = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("radio_announcements").select("id").order("created_at", { ascending: false }).limit(200);
      if (cancelled) return;
      (data ?? []).forEach((r) => seen.current.add(r.id));
    })();
    const channel = supabase.channel("broadcaster-announcements-runner").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "radio_announcements" },
      (payload) => {
        const a = payload.new;
        if (seen.current.has(a.id)) return;
        seen.current.add(a.id);
        if (!isLive(a)) return;
        if (!canPlaySound("radio_announcements")) return;
        if (a.kind === "community" && targetEnabled(a, "notifications")) {
          toast(a.title, {
            description: a.body ?? void 0,
            icon: "📣",
            duration: 6e3
          });
        } else if (a.kind === "ticker" && targetEnabled(a, "feed")) {
          toast.message(`📻 ${a.title}`, {
            description: a.body ?? void 0,
            duration: 5e3
          });
        } else if (a.kind === "upcoming_show" && targetEnabled(a, "notifications")) {
          toast.message(`🎙️ ${a.title}`, {
            description: a.body ?? "A new show is coming up.",
            duration: 5e3
          });
        }
      }
    ).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);
  return null;
}
const ROOM_COLS = "id,name,owner_id,hidden,closed_at,closed_reason,created_at";
function trioChannel(roomId) {
  return `trio:${roomId}`;
}
const TRIO_CREATE_COST = 100;
const TRIO_JOIN_COST = 50;
async function getMyCoins() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return 0;
  const { data } = await supabase.rpc("my_coin_balance");
  return typeof data === "number" ? data : 0;
}
async function createRoom(opts) {
  const { data, error } = await supabase.rpc("create_trio_room", {
    _name: opts.name.trim().slice(0, 60),
    _password: opts.password?.trim() || void 0,
    _hidden: !!opts.hidden
  });
  if (error) throw error;
  return data;
}
async function inviteByUsername(roomId, username) {
  const { data: auth } = await supabase.auth.getUser();
  const uid2 = auth.user?.id;
  if (!uid2) throw new Error("Not signed in");
  const cleaned = username.trim().replace(/^@/, "");
  if (!cleaned) throw new Error("Username required");
  const { data: prof, error: pErr } = await supabase.from("profiles").select("id,username").ilike("username", cleaned).maybeSingle();
  if (pErr) throw pErr;
  if (!prof) throw new Error(`No user @${cleaned}`);
  if (prof.id === uid2) throw new Error("Can't invite yourself");
  const { error } = await supabase.from("trio_room_members").insert({
    room_id: roomId,
    user_id: prof.id,
    status: "invited",
    invited_by: uid2
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error("Already invited");
    throw error;
  }
}
async function acceptInvite(roomId, password) {
  const { data, error } = await supabase.rpc("accept_trio_invite", {
    _room: roomId,
    _password: password ?? void 0
  });
  if (error) throw error;
  if (data && data !== "success") throw new Error(String(data));
}
async function rejectInvite(roomId) {
  const { data: auth } = await supabase.auth.getUser();
  const uid2 = auth.user?.id;
  if (!uid2) return;
  await supabase.from("trio_room_members").update({ status: "rejected" }).eq("room_id", roomId).eq("user_id", uid2);
}
async function closeRoom(roomId, reason = "Closed by owner") {
  await supabase.from("trio_rooms").update({ closed_at: (/* @__PURE__ */ new Date()).toISOString(), closed_reason: reason }).eq("id", roomId);
}
async function listMyRooms() {
  const { data, error } = await supabase.from("trio_rooms").select(ROOM_COLS).is("closed_at", null).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
async function listMembers(roomId) {
  const { data, error } = await supabase.from("trio_room_members").select("room_id,user_id,status,invited_by,invited_at,joined_at").eq("room_id", roomId);
  if (error) throw error;
  return data ?? [];
}
async function listMyMemberships() {
  const { data: auth } = await supabase.auth.getUser();
  const uid2 = auth.user?.id;
  if (!uid2) return [];
  const { data, error } = await supabase.from("trio_room_members").select("room_id,user_id,status,invited_by,invited_at,joined_at").eq("user_id", uid2);
  if (error) throw error;
  return data ?? [];
}
function TrioInvitesListener() {
  const { user } = useAuth();
  const shown = reactExports.useRef(/* @__PURE__ */ new Set());
  const inflight = reactExports.useRef(/* @__PURE__ */ new Set());
  const actioned = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    const uid2 = user?.id;
    if (!uid2) return;
    let cancelled = false;
    let channel = null;
    let pollTimer = null;
    let resubscribeTimer = null;
    async function notifyInvite(roomId) {
      if (cancelled) return;
      const key = roomId;
      if (shown.current.has(key)) return;
      if (actioned.current.has(key)) return;
      if (inflight.current.has(key)) return;
      inflight.current.add(key);
      try {
        const { data: room } = await supabase.from("trio_rooms").select("id,name,owner_id").eq("id", roomId).maybeSingle();
        if (!room || cancelled) return;
        if (shown.current.has(key) || actioned.current.has(key)) return;
        let inviterName = "Someone";
        if (room.owner_id) {
          const { data: prof } = await supabase.from("profiles").select("username").eq("id", room.owner_id).maybeSingle();
          inviterName = prof?.username || inviterName;
        }
        shown.current.add(key);
        toast(`💬 ${inviterName} invited you to "${room.name}"`, {
          // Sonner-level dedup: same id replaces instead of stacking.
          id: `trio-invite-${room.id}`,
          duration: 3e4,
          description: "3some private room invitation",
          onDismiss: () => {
            shown.current.delete(key);
          },
          onAutoClose: () => {
            shown.current.delete(key);
          },
          action: {
            label: "Accept",
            onClick: async () => {
              actioned.current.add(key);
              shown.current.delete(key);
              try {
                await acceptInvite(room.id);
                toast.success(`Joined ${room.name}`);
                window.dispatchEvent(new CustomEvent("trio:open-launcher"));
              } catch (e) {
                toast.error(e.message);
              }
            }
          },
          cancel: {
            label: "Decline",
            onClick: async () => {
              actioned.current.add(key);
              shown.current.delete(key);
              try {
                await rejectInvite(room.id);
              } catch {
              }
            }
          }
        });
      } finally {
        inflight.current.delete(key);
      }
    }
    async function catchUp() {
      if (cancelled) return;
      try {
        const mine = await listMyMemberships();
        const stillInvited = /* @__PURE__ */ new Set();
        for (const m of mine) {
          if (m.status === "invited") {
            stillInvited.add(m.room_id);
            void notifyInvite(m.room_id);
          }
        }
        for (const id of Array.from(actioned.current)) {
          if (!stillInvited.has(id)) actioned.current.delete(id);
        }
      } catch {
      }
    }
    function subscribe2() {
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      channel = supabase.channel(`trio-invites-global-${uid2}-${Date.now()}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid2}` },
        (payload) => {
          const row = payload.new;
          if (row.status !== "invited") return;
          void notifyInvite(row.room_id);
        }
      ).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid2}` },
        (payload) => {
          const row = payload.new;
          if (row.status !== "invited") return;
          void notifyInvite(row.room_id);
        }
      ).subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void catchUp();
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          if (resubscribeTimer) clearTimeout(resubscribeTimer);
          resubscribeTimer = setTimeout(() => {
            if (!cancelled) subscribe2();
          }, 2e3);
        }
      });
    }
    function onVisible() {
      if (document.visibilityState === "visible") void catchUp();
    }
    function onOnline() {
      void catchUp();
    }
    void catchUp();
    subscribe2();
    pollTimer = setInterval(() => {
      if (document.visibilityState === "visible") void catchUp();
    }, 3e4);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (resubscribeTimer) clearTimeout(resubscribeTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onOnline);
      if (channel) void supabase.removeChannel(channel);
      channel = null;
    };
  }, [user?.id]);
  return null;
}
const SKIP_KEY = "palrgo:complete-profile-skip";
function CompleteProfileModal() {
  const { user } = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  const [loaded2, setLoaded] = reactExports.useState(false);
  const [displayName, setDisplayName] = reactExports.useState("");
  const [aboutMe, setAboutMe] = reactExports.useState("");
  const [country, setCountry] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [interestsText, setInterestsText] = reactExports.useState("");
  const [avatarFile, setAvatarFile] = reactExports.useState(null);
  const [avatarPreview, setAvatarPreview] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!user || user.isGuest || user.isDemo) return;
    let cancel = false;
    (async () => {
      try {
        if (sessionStorage.getItem(`${SKIP_KEY}:${user.id}`) === "1") return;
      } catch {
      }
      const { data } = await supabase.from("profiles").select("profile_completed, display_name, country_code").eq("id", user.id).maybeSingle();
      if (cancel || !data) return;
      const d = data;
      if (d.profile_completed === true) return;
      const { data: extras } = await supabase.rpc("get_my_profile_extras");
      const extra = Array.isArray(extras) && extras.length > 0 ? extras[0] : {};
      setDisplayName(d.display_name ?? "");
      setAboutMe(extra.about_me ?? "");
      setCountry(d.country_code ?? "");
      setCity(extra.city ?? "");
      const arr = Array.isArray(extra.interests) ? extra.interests : [];
      setInterestsText(arr.join(", "));
      setLoaded(true);
      setOpen(true);
    })();
    return () => {
      cancel = true;
    };
  }, [user]);
  function onPickAvatar(file) {
    setErr("");
    setAvatarFile(file);
    if (!file) {
      setAvatarPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image.");
      setAvatarFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr("Image must be under 2MB.");
      setAvatarFile(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }
  async function uploadAvatar(userId) {
    if (!avatarFile) return null;
    const ext = (avatarFile.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "") || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("avatars").upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });
    if (up.error) throw up.error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }
  function markSkipped(id) {
    try {
      sessionStorage.setItem(`${SKIP_KEY}:${id}`, "1");
    } catch {
    }
  }
  async function onSkip() {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("profiles").update({ profile_completed: true }).eq("id", user.id);
    } finally {
      markSkipped(user.id);
      setOpen(false);
      setBusy(false);
    }
  }
  async function onSave() {
    if (!user) return;
    setErr("");
    setBusy(true);
    try {
      const avatar_url = await uploadAvatar(user.id);
      const interests = interestsText.split(/[,\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 12);
      const update = {
        profile_completed: true,
        display_name: displayName.trim() || null,
        about_me: aboutMe.trim().slice(0, 1e3) || null,
        country_code: country.trim().toUpperCase().slice(0, 2) || null,
        city: city.trim().slice(0, 80) || null,
        interests
      };
      if (avatar_url) update.avatar_url = avatar_url;
      const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
      if (error) throw error;
      markSkipped(user.id);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }
  if (!loaded2) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onSkip();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] max-w-md overflow-y-auto rounded-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Finish your profile ✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Make it easier for friends to find you. You can skip and add these later." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Profile picture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-input text-[10px] text-muted-foreground", children: avatarPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarPreview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No image" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex-1 cursor-pointer rounded-full border border-dashed border-border bg-background px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground", children: [
            avatarPreview ? "Change image" : "Choose image",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => onPickAvatar(e.target.files?.[0] ?? null) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Display name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: displayName, onChange: (e) => setDisplayName(e.target.value), maxLength: 40, placeholder: "How should friends see you?", className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "About me" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: aboutMe, onChange: (e) => setAboutMe(e.target.value), maxLength: 600, rows: 3, placeholder: "A short bio with emojis 🌟", className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
          aboutMe.trim().split(/\s+/).filter(Boolean).length,
          "/100 words"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Country" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: country, onChange: (e) => setCountry(e.target.value.toUpperCase().slice(0, 2)), maxLength: 2, placeholder: "US", className: "w-full rounded-lg bg-input px-3 py-2 text-sm uppercase outline-none focus:ring-1 focus:ring-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: city, onChange: (e) => setCity(e.target.value), maxLength: 80, placeholder: "e.g. Mumbai", className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-semibold uppercase text-muted-foreground", children: "Interests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: interestsText, onChange: (e) => setInterestsText(e.target.value), placeholder: "music, gaming, anime, photography", className: "w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-muted-foreground", children: "Comma-separated. Up to 12 tags." })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive", children: err }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSkip, disabled: busy, className: "flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent disabled:opacity-50", children: "Skip for now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSave, disabled: busy, className: "flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50", style: { background: "var(--gradient-accent, var(--primary))" }, children: busy ? "Saving…" : "Save profile" })
      ] })
    ] })
  ] }) });
}
const HostSchema = objectType({
  domain: stringType().trim().min(1).max(253),
  serverIp: stringType().trim().max(64).optional(),
  installationId: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  runtime: stringType().trim().max(64).optional()
});
const IdentitySchema = objectType({
  key: stringType().trim().min(4).max(200),
  purchaseCode: stringType().trim().max(200).optional(),
  customerEmail: stringType().trim().email().max(255).optional()
});
const SourceIdSchema = stringType().trim().min(1).max(32);
createServerFn({
  method: "GET"
}).handler(createSsrRpc("6f10113a3f2a17d245d52170d8dd80becf34a9ec5e8ace91f7440af34de787b7"));
const VerifyInput = objectType({
  sourceId: SourceIdSchema,
  identity: IdentitySchema,
  host: HostSchema
});
const verifyLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => VerifyInput.parse(v)).handler(createSsrRpc("89ab9016c6a9ad77aa33dcc46f31a19c9e98ad04617b9fa813f8065c4e4f5960"));
const activateLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => VerifyInput.parse(v)).handler(createSsrRpc("c08cff9bc636034a6982cddd28bd65448032e2c599c421ef83e3fd5226576ecc"));
const CheckInput = objectType({
  host: HostSchema
});
const checkLicense = createServerFn({
  method: "POST"
}).inputValidator((v) => CheckInput.parse(v)).handler(createSsrRpc("20a05b482935b0079c981eed1648f4eac430402479a242003d4610800cc8a0f0"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("29f2febecadda89584f4ae0806ffae60779268003031ca30ac288533a497e1ee"));
const AdminListInput = objectType({
  search: stringType().trim().max(120).optional(),
  status: stringType().trim().max(32).optional(),
  sourceId: stringType().trim().max(32).optional(),
  plan: enumType(["trial", "monthly", "yearly", "lifetime"]).optional(),
  limit: numberType().int().min(1).max(200).default(50),
  offset: numberType().int().min(0).default(0)
});
const adminListLicenses = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => AdminListInput.parse(v)).handler(createSsrRpc("fbff7a3056b9aedd5379c245b06b1f2f208837a89c7f223b1c99037307c7df60"));
const adminGetLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid()
}).parse(v)).handler(createSsrRpc("801f8414b82bd1dc153e77d132ebd3bb77eba32371faaff34dd49552575719d8"));
const adminLicenseStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3cc6e2d5fc8adb8051f390229ff3f728ffe6a77e6c7aca797ee9dd4a7c84e3a0"));
const PlanSchema = enumType(["trial", "monthly", "yearly", "lifetime"]);
const GenerateSelfInput = objectType({
  customerEmail: stringType().trim().email(),
  customerName: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: stringType().datetime().nullable().optional(),
  maxActivations: numberType().int().min(1).max(1e3).default(1)
});
const adminGenerateSelfLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => GenerateSelfInput.parse(v)).handler(createSsrRpc("179bd230da879d6587c60996b1d871152629802a9a7932d6f3f4e4da382a1eb4"));
const ImportInput = objectType({
  sourceId: SourceIdSchema,
  licenseKey: stringType().trim().min(4).max(200),
  purchaseCode: stringType().trim().max(200).optional(),
  customerEmail: stringType().trim().email().optional(),
  customerName: stringType().trim().max(120).optional(),
  productVersion: stringType().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: stringType().datetime().nullable().optional(),
  maxActivations: numberType().int().min(1).max(1e3).default(1),
  status: stringType().trim().max(32).default("active")
});
const adminImportLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => ImportInput.parse(v)).handler(createSsrRpc("bafd8e3de8004b940403bbd91f75868192df7e865b06fb4579d7fc231fee743c"));
const IdInput = objectType({
  id: stringType().uuid()
});
const adminSuspendLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(createSsrRpc("b50db06716d948b1841528ebb0d3fe9bbf5de40d873e32a4b0c4bc5b0d601f88"));
const adminRevokeLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(createSsrRpc("7c4638e97c2a777a92c2b411287936b2b236c243c1f93bdaf77bf71c4efc658e"));
const adminActivateLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(createSsrRpc("ab172b00f1dc49082ff726caa6c0b44fe22a12a7ef92a7b8a9be9bba8075a51b"));
const adminResetActivation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(createSsrRpc("6197bc1a8ecdab3cca89835b520815810403b5a52b6d931a9d42ed43e7ffb669"));
const adminExtendExpiry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid(),
  expiryDate: stringType().datetime().nullable(),
  plan: PlanSchema.optional()
}).parse(v)).handler(createSsrRpc("06ade90c2b38d0e75f84b7eb7f6730fbe078a266c1f53b87f644c12240dd7025"));
const adminChangeDomain = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid(),
  domain: stringType().trim().min(1).max(253)
}).parse(v)).handler(createSsrRpc("c89fdb10b9d1e0fceada7191107516b7eb6da58da6b6688bbf2ee72bfac5ad9f"));
const adminDeleteLicense = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => IdInput.parse(v)).handler(createSsrRpc("338368b876ba293dd5aa1ee823bcd9c02288ecce13a786083ef2bc2408ee980b"));
const adminExportLicensesCsv = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fff36db4427bf10a5a18341e81ab3e3ce05b3da6a0860ffa88d1f3b467305146"));
const REVALIDATE_MS = 24 * 60 * 60 * 1e3;
const GRACE_MS = 7 * 24 * 60 * 60 * 1e3;
function LicenseGuard() {
  const run = useServerFn(checkLicense);
  const [state, setState] = reactExports.useState({ kind: "unknown" });
  const [lastOkAt, setLastOkAt] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const host = {
          domain: window.location.hostname,
          productVersion: APP_VERSION,
          installationId: window.location.origin
        };
        const r = await run({ data: { host } });
        if (cancelled) return;
        if (!r.cache) {
          setState({ kind: "unknown" });
          return;
        }
        if (r.ok) {
          setState({ kind: "ok" });
          setLastOkAt(Date.now());
          return;
        }
        const withinGrace = lastOkAt != null && Date.now() - lastOkAt < GRACE_MS;
        setState(
          withinGrace ? { kind: "warn", message: r.message ?? `License ${r.status}` } : { kind: "fail", message: r.message ?? `License ${r.status}` }
        );
      } catch {
        setState((prev) => prev.kind === "unknown" ? { kind: "unknown" } : prev);
      }
    }
    void tick();
    const id = window.setInterval(tick, REVALIDATE_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [run, lastOkAt]);
  if (state.kind !== "warn" && state.kind !== "fail") return null;
  const isHard = state.kind === "fail";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `fixed inset-x-0 top-0 z-[9999] flex items-center gap-2 px-4 py-2 text-sm shadow-md ${isHard ? "bg-destructive text-destructive-foreground" : "bg-amber-500/95 text-amber-950"}`,
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
          isHard ? "License invalid — " : "License warning — ",
          state.message,
          isHard ? " Contact your administrator." : " Grace period active."
        ] })
      ]
    }
  );
}
const HERO_SETTINGS_KEY = "hero_page";
const HOME_PAGE_KEY = "home_page";
const HERO_SECTION_LABELS = {
  hero: { label: "Hero header", emoji: "✨", description: "Headline, subheadline and main CTAs." },
  stats: { label: "Live community stats", emoji: "📊", description: "Animated live counters." },
  chatrooms: { label: "Chatrooms showcase", emoji: "💬", description: "Chatroom features grid + image." },
  feed: { label: "Social feed showcase", emoji: "📰", description: "Feed features grid + image." },
  radio: { label: "Live radio showcase", emoji: "🎙️", description: "Radio features grid + image." },
  games: { label: "Games grid", emoji: "🎮", description: "Game features grid." },
  famous_chatrooms: { label: "Famous chatrooms", emoji: "🔥", description: "Cards of popular rooms with topics and member counts." },
  live_users: { label: "Live users", emoji: "🟢", description: "Avatar cards of users active right now." },
  daily_missions: { label: "Daily missions", emoji: "🎯", description: "Cards of today's missions with rewards." },
  social_proof: { label: "Social proof", emoji: "👑", description: "Top members, DJs, trending and rooms tiles." },
  final_cta: { label: "Final call-to-action", emoji: "💖", description: "Final signup/login/explore block." }
};
const HERO_DEFAULTS = {
  enabled: true,
  brandName: "Community",
  headline: "Connect, Chat, Share & Grow Together 💫",
  subheadline: "Join realtime chatrooms, discover social feeds, listen to live radio, play games, and become part of a thriving community.",
  heroImageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&q=80",
  chatroomImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  feedImageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80",
  radioImageUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1200&q=80",
  ctaJoinLabel: "Join Now",
  ctaLoginLabel: "Login",
  ctaGuestLabel: "Explore as Guest",
  finalCtaTitle: "Ready to Join the Community? 🚀",
  finalCtaSubtitle: "Thousands of members are chatting, sharing and playing right now.",
  chatroomFeatures: [
    { emoji: "💬", title: "Public Chatrooms", description: "Hop into themed rooms and meet new friends instantly." },
    { emoji: "🔥", title: "3some Rooms", description: "Private invite-only mini rooms for tight crews." },
    { emoji: "🔒", title: "Private Chats", description: "Encrypted DMs with delivery & read receipts." },
    { emoji: "⚡", title: "Realtime Messaging", description: "Lightning fast, presence aware, mobile-first." },
    { emoji: "📻", title: "Radio Integration", description: "Tune into live DJs without leaving the chat." },
    { emoji: "🎮", title: "Games in Chat", description: "Trivia, hangman, fishing — all from chat commands." },
    { emoji: "🫶", title: "Friend Discovery", description: "Smart suggestions based on activity & vibes." },
    { emoji: "💖", title: "Reactions", description: "Express yourself with rich emoji reactions." }
  ],
  feedFeatures: [
    { emoji: "📝", title: "Posts", description: "Share thoughts, stories and moments." },
    { emoji: "🖼️", title: "Image Sharing", description: "Beautiful photo posts with previews." },
    { emoji: "💬", title: "Comments", description: "Real conversations under every post." },
    { emoji: "❤️", title: "Reactions", description: "Like, love, fire — your vibe, your reaction." },
    { emoji: "🔥", title: "Trending", description: "Discover what the community is talking about." },
    { emoji: "🏆", title: "XP Rewards", description: "Earn XP for posting, commenting and engaging." },
    { emoji: "🔥", title: "Streaks", description: "Daily streak bonuses keep you coming back." },
    { emoji: "📊", title: "Leaderboards", description: "Climb the ranks and become a community star." }
  ],
  radioFeatures: [
    { emoji: "🎙️", title: "Live DJs", description: "Real humans spinning real sets." },
    { emoji: "🎵", title: "Live Music", description: "Non-stop community-curated tracks." },
    { emoji: "👥", title: "Listener Count", description: "See who's tuned in right now." },
    { emoji: "🎶", title: "Song Requests", description: "Request your favorites live on air." },
    { emoji: "📅", title: "Upcoming Shows", description: "Never miss your favorite host." }
  ],
  gameFeatures: [
    { emoji: "🎲", title: "Casual Games", description: "Quick fun anytime, anywhere." },
    { emoji: "👯", title: "Multiplayer", description: "Challenge friends head to head." },
    { emoji: "🎁", title: "Rewards", description: "Win prizes and exclusive cosmetics." },
    { emoji: "🪙", title: "Coins", description: "Earn coins to spend in the shop." },
    { emoji: "⭐", title: "XP Boosts", description: "Level up faster by playing daily." }
  ],
  famousChatrooms: [
    { emoji: "💖", name: "Lounge", topic: "General hangout vibes", members: 412 },
    { emoji: "🎵", name: "Music Lovers", topic: "Share songs & discover tracks", members: 287 },
    { emoji: "🎮", name: "Gamers Hub", topic: "All things gaming", members: 354 },
    { emoji: "🌙", name: "Late Night", topic: "Cozy chats after midnight", members: 198 },
    { emoji: "🔥", name: "Trending", topic: "What's hot right now", members: 521 },
    { emoji: "💬", name: "Chit Chat", topic: "Random conversations", members: 245 }
  ],
  liveUsers: [
    { emoji: "🌸", name: "Aria", status: "Vibing in Lounge" },
    { emoji: "⚡", name: "Kai", status: "Spinning tracks on Radio" },
    { emoji: "🎨", name: "Mira", status: "Sharing art on Feed" },
    { emoji: "🎯", name: "Leo", status: "Crushing missions" },
    { emoji: "🌊", name: "Nova", status: "Hosting trivia" },
    { emoji: "🦋", name: "Sky", status: "Just joined Late Night" },
    { emoji: "🌟", name: "Zara", status: "Top of leaderboard" },
    { emoji: "🔥", name: "Rio", status: "On a 12 day streak" }
  ],
  dailyMissions: [
    { emoji: "💬", title: "Send 10 messages", reward: "+50 XP", description: "Chat with anyone in any room." },
    { emoji: "❤️", title: "React to 5 posts", reward: "+30 XP", description: "Spread the love on the feed." },
    { emoji: "🎮", title: "Play a game", reward: "+100 coins", description: "Try trivia, hangman or fishing." },
    { emoji: "🎙️", title: "Tune into Radio", reward: "+25 XP", description: "Listen for 10 minutes." },
    { emoji: "🫶", title: "Make a new friend", reward: "+150 XP", description: "Accept a friend request." },
    { emoji: "🔥", title: "Keep your streak", reward: "+2x XP boost", description: "Visit today to extend it." }
  ],
  sections: [
    { key: "hero", enabled: true },
    { key: "stats", enabled: true },
    { key: "famous_chatrooms", enabled: true },
    { key: "chatrooms", enabled: true },
    { key: "live_users", enabled: true },
    { key: "feed", enabled: true },
    { key: "daily_missions", enabled: true },
    { key: "radio", enabled: true },
    { key: "games", enabled: true },
    { key: "social_proof", enabled: true },
    { key: "final_cta", enabled: true }
  ]
};
function mergeHeroConfig(stored) {
  const merged = { ...HERO_DEFAULTS, ...stored || {} };
  const known = HERO_DEFAULTS.sections.map((s) => s.key);
  const existing = Array.isArray(merged.sections) ? merged.sections.filter((s) => known.includes(s.key)) : [];
  const seen = new Set(existing.map((s) => s.key));
  for (const k of known) {
    if (!seen.has(k)) existing.push({ key: k, enabled: true });
  }
  merged.sections = existing;
  return merged;
}
function useHomePageMode() {
  const [mode, setMode] = reactExports.useState("welcome");
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from("app_settings").select("value").eq("key", HOME_PAGE_KEY).maybeSingle();
        const v = data?.value?.mode;
        if (!cancelled && (v === "hero" || v === "welcome")) setMode(v);
      } catch {
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { mode, ready };
}
const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" }
];
const RTL_CODES = new Set(LANGUAGES.filter((l) => l.dir === "rtl").map((l) => l.code));
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "app.lang";
function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
const supported = LANGUAGES.map((l) => l.code);
if (typeof window !== "undefined" && !instance.isInitialized) {
  instance.use(Backend).use(Browser).use(initReactI18next).init({
    fallbackLng: DEFAULT_LANG,
    supportedLngs: supported,
    preload: false,
    partialBundledLanguages: false,
    load: "languageOnly",
    ns: ["common"],
    defaultNS: "common",
    backend: {
      backends: [Cache, Backend$1],
      backendOptions: [
        {
          prefix: "i18n_res_",
          expirationTime: 7 * 24 * 60 * 60 * 1e3,
          defaultVersion: "v1"
        },
        {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
          requestOptions: { cache: "default" }
        }
      ]
    },
    detection: {
      order: ["querystring", "localStorage", "cookie", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANG_STORAGE_KEY,
      lookupQuerystring: "lang"
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnEmptyString: false,
    nonExplicitSupportedLngs: false
  });
}
function prefetchLanguage(code) {
  if (!code || code === instance.language) return Promise.resolve();
  return instance.loadLanguages(code);
}
function applyDir(lng) {
  if (typeof document === "undefined") return;
  const dir = RTL_CODES.has(lng) ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
}
function LanguageProvider({ children }) {
  reactExports.useEffect(() => {
    applyDir(instance.language || DEFAULT_LANG);
    const onChange = (lng) => {
      applyDir(lng);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lng);
      } catch {
      }
    };
    instance.on("languageChanged", onChange);
    return () => {
      instance.off("languageChanged", onChange);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function setLanguage(code) {
  return instance.changeLanguage(code);
}
function DynamicBrandHead() {
  const brand = useBrand();
  const fetchGlobal = useServerFn(getPublicSeoGlobal);
  const { data: seoGlobal } = useQuery({
    queryKey: ["seo-global-public"],
    queryFn: () => fetchGlobal({}),
    staleTime: 5 * 6e4
  });
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    const title = seoGlobal?.default_title || brand.metaTitle;
    const description = seoGlobal?.default_description || brand.metaDescription;
    const keywords = seoGlobal?.default_keywords || brand.metaKeywords;
    const ogImage = seoGlobal?.default_og_image || brand.ogImage;
    const themeColor = seoGlobal?.theme_color || brand.themeColor;
    if (title) document.title = title;
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta("name", "theme-color", themeColor);
    setMeta("name", "apple-mobile-web-app-title", seoGlobal?.site_name || brand.shortName);
    if (seoGlobal?.author) setMeta("name", "author", seoGlobal.author);
    if (seoGlobal?.google_verification) setMeta("name", "google-site-verification", seoGlobal.google_verification);
    if (seoGlobal?.bing_verification) setMeta("name", "msvalidate.01", seoGlobal.bing_verification);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", seoGlobal?.site_name || brand.name);
    if (ogImage) setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", seoGlobal?.twitter_card || "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    if (seoGlobal?.twitter_site) setMeta("name", "twitter:site", seoGlobal.twitter_site);
    if (seoGlobal?.twitter_creator) setMeta("name", "twitter:creator", seoGlobal.twitter_creator);
    if (ogImage) setMeta("name", "twitter:image", ogImage);
    const setLink = (rel, href, type) => {
      if (!href) return;
      let el = document.head.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
      if (type) el.type = type;
    };
    if (brand.favicon) setLink("icon", brand.favicon, brand.favicon.endsWith(".ico") ? "image/x-icon" : "image/png");
    if (brand.appleTouchIcon) setLink("apple-touch-icon", brand.appleTouchIcon);
  }, [brand, seoGlobal]);
  return null;
}
function ErrorFallback({
  error,
  section,
  featureStore,
  onRecover,
  variant,
  onRetry,
  onResetState
}) {
  const isDev = false;
  const wrapper = variant === "page" ? "flex min-h-[50vh] items-center justify-center px-4 py-12" : "rounded-xl border border-destructive/30 bg-destructive/5 p-6";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: wrapper, role: "alert", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      section ? `The ${section} section hit a problem.` : "This part of the app hit a problem.",
      " ",
      "You can retry or go back home — the rest of the site should still work."
    ] }),
    isDev,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onRetry,
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          children: "Retry"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
          children: "Go home"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => window.location.reload(),
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
          children: "Reload page"
        }
      ),
      featureStore && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onResetState,
          className: "inline-flex items-center justify-center rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10",
          children: "Reset saved data"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "mt-3 text-xs text-muted-foreground underline hover:text-foreground",
        onClick: () => {
          logger.info("User reported problem", { section, message: error?.message });
        },
        children: "Report problem"
      }
    )
  ] }) });
}
class AppErrorBoundary extends reactExports.Component {
  state = { error: null, retryCount: 0 };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    logger.capture({
      severity: "fatal",
      message: error.message || "React render error",
      stack: error.stack ?? null,
      component_stack: info.componentStack,
      metadata: {
        source: "react-error-boundary",
        section: this.props.section,
        retryCount: this.state.retryCount
      }
    });
    try {
      this.props.onRecover?.();
    } catch {
    }
  }
  handleRetry = () => {
    this.setState((s) => ({ error: null, retryCount: s.retryCount + 1 }));
  };
  handleResetState = () => {
    if (this.props.featureStore) resetFeatureState(this.props.featureStore);
    this.props.onRecover?.();
    this.handleRetry();
  };
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ErrorFallback,
        {
          error: this.state.error,
          section: this.props.section,
          featureStore: this.props.featureStore,
          onRecover: this.props.onRecover,
          variant: this.props.variant ?? "page",
          onRetry: this.handleRetry,
          onResetState: this.handleResetState
        }
      );
    }
    return this.props.children;
  }
}
function RouteErrorBoundary({
  section,
  featureStore,
  onRecover,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppErrorBoundary, { section, featureStore, onRecover, variant: "inline", children });
}
let registered = false;
function isAbortError(reason) {
  if (!reason) return false;
  if (reason instanceof DOMException && reason.name === "AbortError") return true;
  if (reason instanceof Error && reason.name === "AbortError") return true;
  const msg = typeof reason === "string" ? reason : reason?.message ?? "";
  return /abort|cancelled|canceled|signal is aborted/i.test(msg);
}
function registerGlobalErrorHandlers() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  window.addEventListener("error", (event) => {
    logger.capture({
      severity: "error",
      message: event.message || "Uncaught error",
      stack: event.error?.stack ?? null,
      metadata: {
        source: "window.onerror",
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      }
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (isAbortError(reason)) return;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.capture({
      severity: "error",
      message: err.message || "Unhandled promise rejection",
      stack: err.stack ?? null,
      metadata: { source: "unhandledrejection" }
    });
  });
}
function GlobalErrorMonitoring() {
  const location = useLocation();
  const { user } = useAuth();
  reactExports.useEffect(() => {
    registerGlobalErrorHandlers();
  }, []);
  reactExports.useEffect(() => {
    setLoggerContext({
      route: location.pathname,
      userId: user?.id ?? null
    });
  }, [location.pathname, user?.id]);
  return null;
}
const appCss = "/assets/styles-CAIeNgsx.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  logger.capture({
    severity: "fatal",
    message: error.message || "Route error",
    stack: error.stack ?? null,
    metadata: { source: "tanstack-router-errorComponent" }
  });
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$38 = createRootRouteWithContext()({
  head: () => ({
    // Static SSR defaults — <DynamicBrandHead /> overrides these at runtime
    // with values from app_settings.whitelabel / branding once loaded.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#3B82F6" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "App" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "App" },
      { name: "description", content: "Chat rooms, DMs, games and more." },
      { property: "og:title", content: "App" },
      { property: "og:description", content: "Chat rooms, DMs, games and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "App" },
      { name: "twitter:description", content: "Chat rooms, DMs, games and more." }
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon-blue.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", className: "light", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$38.useRouteContext();
  reactExports.useEffect(() => {
    applyAccent(getStoredAccent());
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppErrorBoundary, { section: "application", variant: "page", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppSettingsProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LanguageProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicBrandHead, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalErrorMonitoring, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGateProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGate, {}) })
    ] })
  ] }) }) }) });
}
const PUBLIC_PATH_PREFIXES = ["/welcome", "/heropage", "/login", "/reset-password", "/banned", "/p/", "/api/", "/lovable/", "/installer"];
const PUBLIC_EXACT = /* @__PURE__ */ new Set(["/welcome", "/heropage", "/login", "/reset-password", "/banned", "/installer"]);
const READ_ONLY_PUBLIC_APP_PREFIXES = [
  "/feed",
  "/chatroom",
  "/chatrooms",
  "/confessions",
  "/battle-hub",
  "/leaderboard",
  "/poetry",
  "/mehfil",
  "/competitions",
  "/u",
  "/pages",
  "/communities",
  "/community",
  "/invite",
  "/trust",
  "/pricing",
  "/hall-of-fame"
];
function isReadOnlyPublicAppPath(pathname) {
  return READ_ONLY_PUBLIC_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function isPublicPath(pathname) {
  if (isReadOnlyPublicAppPath(pathname)) return true;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}
function hasStoredAuthSession() {
  if (typeof window === "undefined") return true;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? "";
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
    }
  } catch {
  }
  return false;
}
function AuthenticatedHooks({ userId }) {
  usePresenceHeartbeat();
  useSessionChangeDetector();
  useBanGuard(userId);
  return null;
}
function AuthGate() {
  const { user, ready } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const hasStoredSession = hasStoredAuthSession();
  const { mode: homeMode, ready: homeReady } = useHomePageMode();
  const landingPath = homeMode === "hero" ? "/heropage" : "/welcome";
  if (!user && isPublicPath(path)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PublicOutlet, { readOnlyApp: isReadOnlyPublicAppPath(path) });
  }
  if (!ready && !hasStoredSession) {
    if (!homeReady) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading…" }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: landingPath, replace: true });
  }
  if (!ready) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4 text-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading…" }) });
  }
  if (!user) {
    if (isPublicPath(path)) return /* @__PURE__ */ jsxRuntimeExports.jsx(PublicOutlet, { readOnlyApp: isReadOnlyPublicAppPath(path) });
    if (!homeReady) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading…" }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: landingPath, replace: true });
  }
  if (path === "/welcome" || path === "/heropage" || path === "/login") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatProvider, { username: user.username, authUserId: user.id, isGuest: user.isGuest, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPrefsProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(IgnoreProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthenticatedHooks, { userId: user.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BroadcasterAnnouncementsRunner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrioInvitesListener, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CompleteProfileModal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeadFootScripts, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdsAutoLoader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionConflictBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FaviconSwitcher, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionGate, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseGuard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeDebugOverlay, {})
  ] }) }) });
}
function PublicOutlet({ readOnlyApp }) {
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HeadFootScripts, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdsAutoLoader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SessionConflictBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RealtimeDebugOverlay, {})
  ] });
  if (!readOnlyApp) return content;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatProvider, { username: "__public__", authUserId: null, isGuest: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPrefsProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IgnoreProvider, { children: content }) }) });
}
const $$splitComponentImporter$2x = () => import("./index-BWL3IIYw.mjs");
const Route$37 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Chat rooms & community"
    }, {
      name: "description",
      content: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands like !trivia, !hangman, !roll, !fish and !dig."
    }, {
      property: "og:title",
      content: "Chat rooms & community"
    }, {
      property: "og:description",
      content: "Hang out in public rooms, DM friends, share files, earn badges, and play games with chat commands."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2x, "component")
});
function slugify(input) {
  return (input || "").toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9\s-]/g, " ").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "page";
}
const LAYOUTS = ["full", "boxed"];
const SIDEBARS = ["none", "ads", "feed"];
const pageSchema = objectType({
  id: stringType().uuid().optional(),
  slug: stringType().min(1).max(120),
  title: stringType().min(1).max(200),
  content: stringType().max(2e5).default(""),
  excerpt: stringType().max(500).nullable().optional(),
  tags: arrayType(stringType().max(40)).max(20).default([]),
  status: enumType(["draft", "published"]).default("draft"),
  featured: booleanType().default(false),
  layout: enumType(LAYOUTS).default("boxed"),
  sidebar_left: enumType(SIDEBARS).default("none"),
  sidebar_right: enumType(SIDEBARS).default("none"),
  meta_title: stringType().max(200).nullable().optional(),
  meta_description: stringType().max(400).nullable().optional(),
  meta_keywords: stringType().max(500).nullable().optional(),
  og_title: stringType().max(200).nullable().optional(),
  og_description: stringType().max(400).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  canonical_url: stringType().max(500).nullable().optional(),
  noindex: booleanType().default(false),
  nofollow: booleanType().default(false),
  overwrite: booleanType().optional()
});
const listPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  q: stringType().max(100).optional()
}).parse(input ?? {})).handler(createSsrRpc("2d1c643fd61af126663b075381e1ded533614cc0d907f4f36a31c7aa8be765be"));
const getPage = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("c753d0f79cfc16e9348a58af7ddcd552d76a8cda777332c5150ddd7b8aa1e698"));
const savePage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => pageSchema.parse(input)).handler(createSsrRpc("6c0101bfbd81d018fcc7af5fddc270cba151add7ee07ee26332d4301b2e45c78"));
const deletePage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("37e9f52955488aecb3b31d15d5353ac51576cb55a5ea4b804be2f16203dea37a"));
const exportPages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  ids: arrayType(stringType().uuid()).optional()
}).parse(input ?? {})).handler(createSsrRpc("f3689f5104b0f12d05285dbfe30031f089ef0578a6c8212b40b65447c7ca92c6"));
const importPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  pages: arrayType(pageSchema.omit({
    id: true,
    overwrite: true
  })).min(1).max(200),
  mode: enumType(["skip", "overwrite"]).default("skip")
}).parse(input)).handler(createSsrRpc("edfe09d4ab84382f150adb3a94567c357c77596132dc9e901e2faf6f5ad667cc"));
const getPublishedPage = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  slug: stringType().min(1).max(120)
}).parse(input)).handler(createSsrRpc("b3a44c66360258d8f963e94ce6a405384e8a84aa7db85e44e222350aaf47c458"));
createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  featured: booleanType().optional(),
  limit: numberType().min(1).max(50).default(20)
}).parse(input ?? {})).handler(createSsrRpc("5053d71a7d698357e73affb5665cb7ccc6ab9d23fcf98ec579e4d2a7f8ab6205"));
const listRedirects = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("3d97ece13ca94eeb7c26a592033cdab3e96472e2da455ef40bf4b5e4a867d9ea"));
const saveRedirect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  from_slug: stringType().min(1).max(120),
  to_slug: stringType().min(1).max(120)
}).parse(input)).handler(createSsrRpc("05660e96dfa73e79df62127329b098e70d923ba601415cc7b1179c2fc053f705"));
const deleteRedirect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("8256478a7c1be93cc128b4ef7beecda8beddcebfb30fb3efb673ba3b544ceb57"));
const getCommunityBySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(80)
}).parse(d)).handler(createSsrRpc("0267ca9731725b636bb774a5ef66d4d793aa70dee456dee97579e15c52d59077"));
const listPublicCommunities = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().max(60).optional(),
  sort: enumType(["trending", "newest", "members", "active"]).optional(),
  featuredOnly: booleanType().optional(),
  limit: numberType().int().min(1).max(120).optional()
}).partial().parse(d ?? {})).handler(createSsrRpc("55e0c7e7c42c0887b433710f7cc39cdeda814c126e820429a9504359681f78db"));
const searchCommunities = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  q: stringType().min(1).max(80),
  category: stringType().max(60).optional(),
  limit: numberType().int().min(1).max(60).optional()
}).parse(d)).handler(createSsrRpc("b939b56fd31a3f2f0aaba2c9cb16fdd9cf6330b01526e36342f7182a3c7f36c4"));
const getDiscoveryStats = createServerFn({
  method: "GET"
}).handler(createSsrRpc("b8a833ff452c25935f4170870d7a6eb668654154c7cda81e74bb018f36487917"));
const getMyMembership = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0c68ae060ba9299292d3dcd4693329d8beb7e984f68fc794e3181efc262845d2"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(createSsrRpc("51967712479bf7a8de2f0168365592072d4b4cb5b434ba635e35644dcaa1d606"));
const joinCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  inviteCode: stringType().trim().max(60).optional(),
  password: stringType().max(200).optional(),
  message: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("3553436f37ade1d6b80e8115832c035ff19d8df1cc1e9402195db5b9ecbc2bdf"));
const leaveCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d2156818498792cb7788fcd6710842f3b3789792fd693ce5ad801bdd899bb90b"));
const brandingInput = objectType({
  communityId: stringType().uuid(),
  name: stringType().min(1).max(80).optional(),
  slug: stringType().min(2).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug").optional(),
  description: stringType().max(2e3).nullable().optional(),
  welcome_text: stringType().max(2e3).nullable().optional(),
  logo_url: stringType().url().nullable().optional(),
  banner_url: stringType().url().nullable().optional(),
  background_url: stringType().url().nullable().optional(),
  accent_color: stringType().regex(/^#[0-9a-fA-F]{3,8}$/).nullable().optional(),
  rules: stringType().max(5e3).nullable().optional(),
  announcement: stringType().max(2e3).nullable().optional(),
  social_links: recordType(stringType()).optional()
});
const updateCommunityBranding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => brandingInput.parse(d)).handler(createSsrRpc("7a87a8e5804e17215b36798f16f6690dfd9fc12b054e69b19a1ec97b54e643b6"));
const updateCommunityPrivacy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  privacy_mode: enumType(["public", "private", "invite_only", "password", "invite_password"]),
  password: stringType().min(4).max(200).nullable().optional()
}).parse(d)).handler(createSsrRpc("fc3f3f8de160d7f9894440393568379683b5079888639cdc7fa62c5c935eb5af"));
const listCommunityMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  status: enumType(["active", "pending", "banned", "muted"]).optional()
}).parse(d)).handler(createSsrRpc("6b071234e36762ea3cc76642413e64188e4dc25dd9b284f721e3ad7855827993"));
const setMemberState = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  memberId: stringType().uuid(),
  role: enumType(["owner", "moderator", "member"]).optional(),
  status: enumType(["active", "pending", "banned", "muted"]).optional()
}).parse(d)).handler(createSsrRpc("457ab9a8e0cbc7de3aabc62adb0709639a137683434949aad2a49dc5755eafb1"));
const removeMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  memberId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("05cde11348cae24dcffd32b86e4ac07f9cb1a0a2cf1df639cd309c6288792474"));
const listJoinRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0bc34845f1b49a364fd2724f24209f6fff281858ba8360bc78373be658e63d24"));
const decideJoinRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  approve: booleanType()
}).parse(d)).handler(createSsrRpc("e8b5e654a43949cb0fc1bcab7be5f55ca0a57fac0c984f0c76a5385514c34c85"));
const listInvites = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("aa20e99aac3bbbc0c3801ef649d3e8c9a9b85ac97cf0ce72a034a9edc19bfe62"));
const createInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  maxUses: numberType().int().min(1).max(1e5).optional(),
  expiresAt: stringType().datetime().nullable().optional()
}).parse(d)).handler(createSsrRpc("d4aa01f3445ece0e9e7bab3f457d3283a9db9d332220a9a21a081cb5f7c0fc87"));
const revokeInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  inviteId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e817a1fbd3e4a83668c53d2132ad9c65dc0438c4e2dc7455db5c6b5a219313a1"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(createSsrRpc("bf04213158e148e39b16cdb434168bfc6967b097cdfb28de018b72cc67d3a5d1"));
const listCommunityMembersPublic = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5ab30af61d478d7be5363574b7836d09f6c039598b2bde1854a60ae102a88f29"));
const listCommunityMembersAuthed = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("907fcf3bb98bed6bd7102699956590e4e38fe928bd1b832bb3cfeb761e94c8ed"));
const updateCommunityVisibility = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  visibility: enumType(["public", "hidden", "unlisted", "featured_only"]),
  category: stringType().max(60).nullable().optional(),
  tags: arrayType(stringType().min(1).max(30)).max(15).optional(),
  language: stringType().max(10).nullable().optional(),
  country: stringType().max(10).nullable().optional(),
  confirmLargeChange: booleanType().optional()
}).parse(d)).handler(createSsrRpc("bdaa4a16f7e0c0233305890b409586023c304b8a9321e99e4ea1d95ed163dfd4"));
const verificationInput = objectType({
  communityId: stringType().uuid(),
  community_name: stringType().min(1).max(120),
  website: stringType().url().max(300).nullable().optional(),
  socials: recordType(stringType().max(300)).optional(),
  business_email: stringType().email().max(200).nullable().optional(),
  reason: stringType().max(2e3).nullable().optional(),
  doc_urls: arrayType(stringType().url().max(500)).max(10).optional()
});
const submitVerificationRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => verificationInput.parse(d)).handler(createSsrRpc("63215c8a9ac4290c661e8fed16710cafdb99beb0423a90b0234679acc6078886"));
const getMyVerificationRequest = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8d76fbf1e94c604dd2262f46fd73410c1fdd4f22431a765bd3bf481ed5d9241c"));
const adminListVerificationRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  status: enumType(["all", "pending", "needs_changes", "rejected", "approved"]).optional()
}).parse(d)).handler(createSsrRpc("09df6d9e3460e87d32a7c5be54b06e20eb0048ac5e6db0f43a9285c821b08fad"));
const decideInput = objectType({
  requestId: stringType().uuid(),
  action: enumType(["approve", "reject", "needs_changes"]),
  admin_notes: stringType().max(2e3).optional(),
  // Independent badge flags applied on approve. Ignored otherwise.
  is_verified: booleanType().optional(),
  is_official: booleanType().optional(),
  is_partner: booleanType().optional(),
  is_trusted: booleanType().optional()
});
const adminDecideVerificationRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => decideInput.parse(d)).handler(createSsrRpc("8528e39a65c6060913c020ae6f1291e95dccbe150f8cb2ed23b280149d8efb00"));
const getInviteLanding = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  code: stringType().min(3).max(80)
}).parse(d)).handler(createSsrRpc("e03f296dae9ac6f37078e91caa50f7a68178ff9512da63209e5206e1818e2899"));
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const resolveCommunitySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(80)
}).parse(d)).handler(createSsrRpc("9f37d25506a7a829144c09bda55b0fa2268d851eb37dd8b32b38e24315be94f4"));
const requestPremiumSlug = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  requestedSlug: stringType().min(2).max(40).regex(SLUG_RE, "Invalid slug format"),
  reason: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("464a633b09d69a86b22e7ab0f821ac680f6b95fbf77c39db0dd46cf87114e608"));
const listPremiumSlugRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f98517c9a31ed5258d74508da92aa5be0e841032231ecf213c4806d1a84331a9"));
const cancelPremiumSlugRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("95b39620aa6e73ddf63ec8b399967937dea48a6897d5bfb48b161eada1454ea8"));
const adminListPremiumSlugRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  status: enumType(["all", "pending", "approved", "rejected", "cancelled"]).optional()
}).parse(d)).handler(createSsrRpc("928f0aa39bfcd0bd5b585389edab4600e85cd219d4218ce13127b378594e94ea"));
const reviewPremiumSlugRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  note: stringType().max(500).optional()
}).parse(d)).handler(createSsrRpc("7ae29f2e597b47a4d071fe194c4ab9546ac2889c8dc4a5c8d4914013bced665f"));
const archiveCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0868f3d3694bd41196d19b2ed4b9a94f671e042f14d9f2b1aab7c7cfd1ffd54e"));
const restoreCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("84e76b84bd8ba8ef0f19ecad6dbca071abb1324d00b9e182f106407886014d17"));
const getCommunityAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("6dbfae677965187a86caf823ba44ee9726c3702740150cd6b681f703dfa89bb6"));
const adminCommunityReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(createSsrRpc("8285ee8226922c117fa21641155bc211d50173240b5ad9e275f06f5dc6a91ef2"));
function isNavigableSlug(slug) {
  if (typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  if (trimmed === "$slug") return false;
  return true;
}
const $$splitComponentImporter$2w = () => import("../_slug-BzmdRDcA.mjs");
const $$splitErrorComponentImporter$7 = () => import("../_slug-BkaidZz6.mjs");
const $$splitNotFoundComponentImporter$9 = () => import("../_slug-nju-FUb4.mjs");
function redirectReservedSlug(slug) {
  const key = slug.toLowerCase();
  if (key === "rooms" || key === "messages") {
    throw redirect({
      to: "/chatroom",
      replace: true
    });
  }
  if (["auth", "login", "register", "signup", "logout"].includes(key)) {
    throw redirect({
      to: "/login",
      replace: true
    });
  }
  throw redirect({
    to: "/welcome",
    replace: true
  });
}
const Route$36 = createFileRoute("/$slug")({
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    if (isReservedSlug(params.slug)) redirectReservedSlug(params.slug);
    const community = await getCommunityBySlug({
      data: {
        slug: params.slug
      }
    });
    if (community) {
      throw redirect({
        to: "/community/$slug",
        params: {
          slug: params.slug
        },
        replace: true
      });
    }
    const page = await getPublishedPage({
      data: {
        slug: params.slug
      }
    });
    if (!page) throw notFound();
    return {
      page
    };
  },
  head: ({
    loaderData,
    params
  }) => {
    const p = loaderData?.page;
    if (!p) return {};
    const url = `https://holo-chat-quest.lovable.app/${params.slug}`;
    const title = p.meta_title || p.title;
    const desc = p.meta_description || p.excerpt || `${p.title} on our community.`;
    const robots = [p.noindex ? "noindex" : "index", p.nofollow ? "nofollow" : "follow"].join(", ");
    const ogImage = p.og_image || void 0;
    const meta = [{
      title
    }, {
      name: "description",
      content: desc
    }, {
      name: "robots",
      content: robots
    }, {
      property: "og:title",
      content: p.og_title || title
    }, {
      property: "og:description",
      content: p.og_description || desc
    }, {
      property: "og:type",
      content: "article"
    }, {
      property: "og:url",
      content: url
    }];
    const keywords = p.meta_keywords || (p.tags?.length ? p.tags.join(", ") : "");
    if (keywords) meta.push({
      name: "keywords",
      content: keywords
    });
    if (ogImage) {
      meta.push({
        property: "og:image",
        content: ogImage
      });
      meta.push({
        name: "twitter:image",
        content: ogImage
      });
    }
    return {
      meta,
      links: [{
        rel: "canonical",
        href: p.canonical_url || url
      }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: desc,
          image: ogImage,
          datePublished: p.published_at,
          url,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [{
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://holo-chat-quest.lovable.app/"
            }, {
              "@type": "ListItem",
              position: 2,
              name: p.title,
              item: url
            }]
          }
        })
      }]
    };
  },
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$9, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$7, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$2w, "component")
});
const $$splitComponentImporter$2v = () => import("./route-BFsOu0JM.mjs");
const SIGN_IN_ROUTE = "/login";
const Route$35 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: SIGN_IN_ROUTE
      });
    }
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2v, "component")
});
const $$splitComponentImporter$2u = () => import("./account-D39hZ8Op.mjs");
const Route$34 = createFileRoute("/account")({
  component: lazyRouteComponent($$splitComponentImporter$2u, "component")
});
const $$splitComponentImporter$2t = () => import("./achievements-DEk5pu_N.mjs");
const Route$33 = createFileRoute("/achievements")({
  head: () => ({
    meta: [{
      title: "Achievements"
    }, {
      name: "description",
      content: "Track your unlocked badges and progress across your achievements."
    }, {
      property: "og:title",
      content: "Achievements"
    }, {
      property: "og:description",
      content: "Track your unlocked badges and progress across your achievements."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2t, "component")
});
const $$splitComponentImporter$2s = () => import("./admin-CDUYyoYy.mjs");
const Route$32 = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$2s, "component")
});
const $$splitComponentImporter$2r = () => import("./banned-mg6KkDa3.mjs");
const Route$31 = createFileRoute("/banned")({
  component: lazyRouteComponent($$splitComponentImporter$2r, "component"),
  head: () => ({
    meta: [{
      title: "Account suspended"
    }]
  })
});
const $$splitComponentImporter$2q = () => import("./battle-hub-CcDjFKqH.mjs");
const Route$30 = createFileRoute("/battle-hub")({
  loader: () => loadRouteSeo("/battle-hub", "Battle Hub", "A realtime dashboard of every live competition."),
  head: ({
    loaderData
  }) => headFromRouteSeo(loaderData),
  component: lazyRouteComponent($$splitComponentImporter$2q, "component")
});
const $$splitComponentImporter$2p = () => import("./broadcaster-uzkEm0zk.mjs");
const Route$2$ = createFileRoute("/broadcaster")({
  component: lazyRouteComponent($$splitComponentImporter$2p, "component")
});
const Route$2_ = createFileRoute("/chat")({
  beforeLoad: () => {
    throw redirect({ to: "/chatroom", replace: true });
  }
});
const $$splitComponentImporter$2o = () => import("./chatroom-C6JvYr60.mjs");
const Route$2Z = createFileRoute("/chatroom")({
  head: () => ({
    meta: [{
      title: "Chatrooms"
    }, {
      name: "description",
      content: "Join public chat rooms, send DMs, share files and play in-chat games ."
    }, {
      property: "og:title",
      content: "Chatrooms"
    }, {
      property: "og:description",
      content: "Hang out in public rooms, DM friends, and play games with chat commands."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2o, "component")
});
const Route$2Y = createFileRoute("/chatrooms")({
  beforeLoad: () => {
    throw redirect({ to: "/chatroom", replace: true });
  }
});
const $$splitComponentImporter$2n = () => import("./communities-DVCogcTx.mjs");
const Route$2X = createFileRoute("/communities")({
  head: () => ({
    meta: [{
      title: "Discover Communities — BooBubble"
    }, {
      name: "description",
      content: "Find and join creator communities: gaming, music, tech, art, sports and more. Live chat, feed, competitions and radio."
    }, {
      property: "og:title",
      content: "Discover Communities — BooBubble"
    }, {
      property: "og:description",
      content: "Browse trending creator communities and join the conversation."
    }, {
      property: "og:type",
      content: "website"
    }],
    links: [{
      rel: "canonical",
      href: "https://holo-chat-quest.lovable.app/communities"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2n, "component")
});
const $$splitComponentImporter$2m = () => import("./community-BFsOu0JM.mjs");
const Route$2W = createFileRoute("/community")({
  component: lazyRouteComponent($$splitComponentImporter$2m, "component")
});
const $$splitComponentImporter$2l = () => import("./competitions-LArAP22m.mjs");
const Route$2V = createFileRoute("/competitions")({
  component: lazyRouteComponent($$splitComponentImporter$2l, "component")
});
const $$splitComponentImporter$2k = () => import("./confessions-CIDF9wnX.mjs");
const Route$2U = createFileRoute("/confessions")({
  loader: () => loadRouteSeo("/confessions", "Confessions", "A safe space to share secrets and connect anonymously."),
  head: ({
    loaderData
  }) => headFromRouteSeo(loaderData),
  component: lazyRouteComponent($$splitComponentImporter$2k, "component")
});
const $$splitComponentImporter$2j = () => import("./deploy-DtvLufM6.mjs");
const Route$2T = createFileRoute("/deploy")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Deployment Wizard"
    }, {
      name: "description",
      content: "One-click deployment checker: verify runtime, backend, environment, storage, and services before install."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2j, "component")
});
const $$splitComponentImporter$2i = () => import("./find-friends-WUzJIsCa.mjs");
const Route$2S = createFileRoute("/find-friends")({
  head: () => ({
    meta: [{
      title: "Find Friends"
    }, {
      name: "description",
      content: "Discover people, accept requests, and grow your network ."
    }, {
      property: "og:title",
      content: "Find Friends"
    }, {
      property: "og:description",
      content: "Suggestions, requests, search and mutuals — all in one place."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2i, "component")
});
const $$splitComponentImporter$2h = () => import("./games-DsV-lYMn.mjs");
const Route$2R = createFileRoute("/games")({
  loader: () => loadRouteSeo("/games", "Games Hub", "Featured games, daily challenges, achievements and leaderboards."),
  head: ({
    loaderData
  }) => headFromRouteSeo(loaderData),
  component: lazyRouteComponent($$splitComponentImporter$2h, "component")
});
const $$splitComponentImporter$2g = () => import("./gamification-DNivwXXw.mjs");
const Route$2Q = createFileRoute("/gamification")({
  head: () => ({
    meta: [{
      title: "Achievements & Quests"
    }, {
      name: "description",
      content: "Track your achievements, daily quests, milestones and season pass progress."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2g, "component")
});
const $$splitComponentImporter$2f = () => import("./groups-CuB1Ot0F.mjs");
const Route$2P = createFileRoute("/groups")({
  head: () => ({
    meta: [{
      title: "Groups"
    }, {
      name: "description",
      content: "Join groups around your interests ."
    }, {
      property: "og:title",
      content: "Groups"
    }, {
      property: "og:description",
      content: "Join groups around your interests ."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2f, "component")
});
const $$splitComponentImporter$2e = () => import("./hall-of-fame-C13_XmTu.mjs");
const searchSchema = objectType({
  // Kept for backward compatibility with legacy redirect links; unused visually.
  tab: enumType(["all", "competitions", "poetry"]).optional().catch("all"),
  filter: stringType().optional().catch(void 0)
});
const Route$2O = createFileRoute("/hall-of-fame")({
  validateSearch: searchSchema,
  loader: () => loadRouteSeo("/hall-of-fame", "Hall of Fame", "The greatest creators in platform history."),
  head: ({
    loaderData
  }) => {
    const base = headFromRouteSeo(loaderData);
    if (base.scripts?.length) return base;
    return {
      ...base,
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Hall of Fame",
          description: "Every champion across competitions and poetry battles."
        })
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2e, "component")
});
const $$splitComponentImporter$2d = () => import("./heropage-DlkH0t_p.mjs");
const Route$2N = createFileRoute("/heropage")({
  head: () => ({
    meta: [{
      title: `${HERO_DEFAULTS.brandName} — ${HERO_DEFAULTS.headline}`
    }, {
      name: "description",
      content: HERO_DEFAULTS.subheadline
    }, {
      property: "og:title",
      content: HERO_DEFAULTS.headline
    }, {
      property: "og:description",
      content: HERO_DEFAULTS.subheadline
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2d, "component")
});
const $$splitComponentImporter$2c = () => import("./installer-DA6F4Q6M.mjs");
const Route$2M = createFileRoute("/installer")({
  component: lazyRouteComponent($$splitComponentImporter$2c, "component")
});
const $$splitComponentImporter$2b = () => import("./journey-BTIfDwzO.mjs");
const Route$2L = createFileRoute("/journey")({
  head: () => ({
    meta: [{
      title: "Your Journey — Progression & Unlocks"
    }, {
      name: "description",
      content: "Track your level, XP, unlocks, missions and achievements as you grow on the platform."
    }, {
      property: "og:title",
      content: "Your Journey — Progression & Unlocks"
    }, {
      property: "og:description",
      content: "Track your level, XP, unlocks, missions and achievements as you grow."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2b, "component")
});
const $$splitComponentImporter$2a = () => import("./leaderboard-BolqPR30.mjs");
const Route$2K = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [{
      title: "Leaderboard"
    }, {
      name: "description",
      content: "Top members by XP and daily streaks ."
    }, {
      property: "og:title",
      content: "Leaderboard"
    }, {
      property: "og:description",
      content: "Top members by XP and daily streaks ."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2a, "component")
});
const $$splitComponentImporter$29 = () => import("./login-DG8dotQ4.mjs");
const Route$2J = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Community sign in"
    }, {
      name: "description",
      content: "Optional community sign-in page."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
const Route$2I = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        let branding = {};
        let whitelabel = {};
        let general = {};
        try {
          const { data } = await supabaseAdmin.from("app_settings").select("key,value").in("key", ["branding", "whitelabel", "general"]);
          for (const row of data ?? []) {
            if (row.key === "branding") branding = row.value ?? {};
            else if (row.key === "whitelabel") whitelabel = row.value ?? {};
            else if (row.key === "general") general = row.value ?? {};
          }
        } catch {
        }
        const brand = buildBrand(branding, whitelabel, general, "light");
        const icon192 = brand.logoLight || brand.favicon || "/pwa-192.png";
        const icon512 = brand.logoLight || brand.favicon || "/pwa-512.png";
        const manifest = {
          name: brand.name,
          short_name: brand.shortName,
          description: brand.metaDescription || brand.tagline,
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#0F172A",
          theme_color: brand.themeColor,
          icons: [
            { src: icon192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: icon512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ]
        };
        return new Response(JSON.stringify(manifest), {
          headers: {
            "Content-Type": "application/manifest+json; charset=utf-8",
            "Cache-Control": "public, max-age=300"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$28 = () => import("./pages-C8DYu3MW.mjs");
const Route$2H = createFileRoute("/pages")({
  head: () => ({
    meta: [{
      title: "Pages"
    }, {
      name: "description",
      content: "Discover and follow community pages ."
    }, {
      property: "og:title",
      content: "Pages"
    }, {
      property: "og:description",
      content: "Discover and follow community pages ."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
const $$splitComponentImporter$27 = () => import("./pricing-BD02i0aC.mjs");
const Route$2G = createFileRoute("/pricing")({
  head: () => ({
    meta: [{
      title: "Pricing & Membership Plans"
    }, {
      name: "description",
      content: "Upgrade to unlock premium chatrooms, exclusive themes, no ads and creator perks."
    }, {
      property: "og:title",
      content: "Pricing & Membership Plans"
    }, {
      property: "og:description",
      content: "Choose a plan and join the premium community."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
const $$splitComponentImporter$26 = () => import("./radio-l8WdNAsG.mjs");
const Route$2F = createFileRoute("/radio")({
  component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
const $$splitComponentImporter$25 = () => import("./reels-BG6KHIPo.mjs");
const Route$2E = createFileRoute("/reels")({
  head: () => ({
    meta: [{
      title: "Reels"
    }, {
      name: "description",
      content: "Short videos from the community."
    }, {
      property: "og:title",
      content: "Reels"
    }, {
      property: "og:description",
      content: "Short videos from the community."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
function ComingSoon({
  icon: Icon,
  title,
  tagline
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-semibold", children: title })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto grid max-w-[640px] place-items-center px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-8 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-4 text-2xl font-bold", children: [
        title,
        " is coming soon"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: tagline }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
        " Launching soon"
      ] })
    ] }) })
  ] });
}
const $$splitComponentImporter$24 = () => import("./reset-password-veovUCI9.mjs");
const Route$2D = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
const Route$2C = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const txt = await buildPublicRobotsTxt();
        return new Response(txt, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }
        });
      }
    }
  }
});
const getOwnerStatus = createServerFn({
  method: "GET"
}).handler(createSsrRpc("bcf401160e911f0ebcb3a38bfbdee41bc6c3e3202dec985efeaa3eb78d6e3099"));
const CommunityInput = objectType({
  name: stringType().trim().min(1).max(120),
  tagline: stringType().trim().max(200).optional().default(""),
  description: stringType().trim().max(2e3).optional().default(""),
  language: stringType().trim().min(2).max(10).default("en"),
  timezone: stringType().trim().min(1).max(64).default("UTC"),
  currency: stringType().trim().min(2).max(8).default("USD"),
  logoUrl: stringType().trim().url().max(500).optional().or(literalType("")).default(""),
  faviconUrl: stringType().trim().url().max(500).optional().or(literalType("")).default(""),
  homepage: enumType(["welcome", "hero"]).default("welcome")
});
const saveCommunitySetup = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => CommunityInput.parse(data)).handler(createSsrRpc("b096ee15c36458b0d7535022b5619f0cd76279ba31067a48381ef9b36acfdefc"));
const CreateOwnerInput = objectType({
  fullName: stringType().trim().min(1).max(120),
  username: stringType().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: stringType().trim().email().max(255),
  password: stringType().min(8).max(200)
});
const createOwner = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => CreateOwnerInput.parse(data)).handler(createSsrRpc("f6a09b38bbc16b2695f359881b3c30da2c0982a5fb7f6b55173277d96293b991"));
const AssetInput = objectType({
  kind: enumType(["logo", "favicon", "hero"]),
  filename: stringType().trim().min(1).max(200),
  contentType: stringType().trim().min(1).max(120),
  // base64-encoded file bytes (no data: prefix)
  base64: stringType().min(1).max(8e6)
  // ~6MB decoded
});
const uploadCommunityAsset = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).inputValidator((data) => AssetInput.parse(data)).handler(createSsrRpc("c283f16416662d40da82dda155729965674669099ec0392ab025b72be2c29163"));
const runInstallationHealthCheck = createServerFn({
  method: "POST"
}).middleware([withRateLimit("admin.write")]).handler(createSsrRpc("3fcbf97b22720df7093c833b0affea3e506c435e382d3fcfce4797b3d3fb945b"));
const $$splitComponentImporter$23 = () => import("./setup-wizard-BQb7YmGf.mjs");
const Route$2B = createFileRoute("/setup-wizard")({
  beforeLoad: async () => {
    const status = await getOwnerStatus({});
    if (!status.installed) throw redirect({
      to: "/installer"
    });
    if (status.hasOwner || status.firstRunCompleted) throw redirect({
      to: "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
const Route$2A = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = await buildPublicSitemapXml();
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
        });
      }
    }
  }
});
const $$splitComponentImporter$22 = () => import("./trust-BDs9X2Yj.mjs");
const Route$2z = createFileRoute("/trust")({
  head: () => ({
    meta: [{
      title: "Trust, Security & Privacy"
    }, {
      name: "description",
      content: "How we protect your account, your messages, and your data on this community platform."
    }, {
      property: "og:title",
      content: "Trust, Security & Privacy"
    }, {
      property: "og:description",
      content: "Our approach to authentication, data protection, moderation, and user privacy."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
const $$splitComponentImporter$21 = () => import("./wallet-Bkm_2qMb.mjs");
const Route$2y = createFileRoute("/wallet")({
  head: () => ({
    meta: [{
      title: "Wallet & Coins Store"
    }, {
      name: "description",
      content: "Manage your coins: buy, earn, spend, and track every transaction."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
const LANDING_DEFAULTS = {
  enabled: true,
  useDemoData: true,
  heroEyebrow: "A live social community",
  heroTitle: "Join The Ultimate",
  heroTitleHighlight: "Active Community",
  heroSubtitle: "Chat in real-time, share your thoughts, play games, earn rewards and make new friends.",
  heroBadges: ["💬 Chatrooms", "📱 Social Feed", "🎮 Games", "⭐ Rewards"],
  primaryCtaLabel: "Start Chatting",
  primaryCtaHref: "/login",
  secondaryCtaLabel: "Create Account",
  secondaryCtaHref: "/login",
  heroSocialProof: "15,240+ members joined this week",
  showStats: true,
  showMessageCount: true,
  showGameCount: true,
  showGrowth: false,
  growthLabel: "+38% this month",
  demoStats: {
    members: 15240,
    online: 512,
    activeRooms: 85,
    messagesSent: 21e5,
    feedPosts: 125e3,
    gamesPlayed: 35e3
  },
  fallbackMessagesSent: 128400,
  fallbackGamesPlayed: 24900,
  featureCards: [
    { emoji: "💬", title: "Live Chatrooms", description: "Join active chatrooms and meet new people." },
    { emoji: "📱", title: "Social Feed", description: "Share posts, photos, memes and polls." },
    { emoji: "🎮", title: "Games & Rewards", description: "Play games, earn coins, XP and unlock badges." },
    { emoji: "👥", title: "Find Friends", description: "Connect with people and build friendships." },
    { emoji: "🏆", title: "Leaderboards", description: "Compete and rank on leaderboards." },
    { emoji: "🎯", title: "Daily Missions", description: "Complete daily missions and earn rewards." }
  ],
  games: [
    { emoji: "🎲", name: "Ludo", reward: "+50 coins · +20 XP", plays: "12.5K plays" },
    { emoji: "🐟", name: "Fish Game", reward: "+30 coins · +15 XP", plays: "8.7K plays" },
    { emoji: "🍷", name: "Wine Game", reward: "+40 coins · +18 XP", plays: "5.3K plays" },
    { emoji: "⛏️", name: "Dig Game", reward: "+25 coins · +12 XP", plays: "3.2K plays" }
  ],
  missions: [
    { emoji: "✅", title: "Send 20 Messages", progress: 100, progressLabel: "20/20", reward: "+15 XP", complete: true },
    { emoji: "✅", title: "Create 1 Feed Post", progress: 100, progressLabel: "1/1", reward: "+10 coins", complete: true },
    { emoji: "🎯", title: "React to 5 Posts", progress: 60, progressLabel: "3/5", reward: "+20 XP · +25 coins", complete: false }
  ],
  demoChatrooms: [
    { emoji: "🇮🇳", name: "India Chat", online: 128, topic: "General" },
    { emoji: "🌆", name: "Mumbai Chat", online: 96, topic: "Locals" },
    { emoji: "🎮", name: "Gaming Lounge", online: 75, topic: "Gaming" },
    { emoji: "🎓", name: "College Chat", online: 64, topic: "Students" },
    { emoji: "💭", name: "Dil Se", online: 52, topic: "Confessions" }
  ],
  demoTopMembers: [
    { username: "Amit Sharma", xp: 2450, emoji: "👨" },
    { username: "Pooja Singh", xp: 1980, emoji: "👩" },
    { username: "Rahul Verma", xp: 1650, emoji: "🧔" }
  ],
  demoFeedPost: {
    username: "Amit Sharma",
    ago: "2 hours ago",
    text: "Just completed my 7 day streak! 🔥 Feeling amazing today!",
    badge: "🔥 7 Day Streak",
    likes: 128,
    comments: 42,
    coins: 12
  },
  demoPoll: {
    question: "Should we add Voice Rooms to our community?",
    ago: "1 hour ago",
    options: [
      { label: "Yes, definitely!", votes: 334 },
      { label: "Not now", votes: 94 }
    ],
    daysLeft: 2
  },
  demoConfession: {
    alias: "Panda #23",
    ago: "3 hours ago",
    text: "Me in every online class be like 😂",
    emoji: "🐼"
  },
  trendingPosts: [
    { user: "Priya Kapoor", ago: "12 min ago", text: "Just unlocked the Legendary badge! 🏆 Took me 3 months of daily grind.", likes: 842, comments: 156, tag: "#achievement" },
    { user: "Rohan Mehta", ago: "34 min ago", text: "Hot take: voice rooms > text chat. Change my mind 🎙️", likes: 612, comments: 289, tag: "#discussion" },
    { user: "Sneha Iyer", ago: "1 hr ago", text: "Made some new friends from the Mumbai chat today. This community is wholesome ❤️", likes: 524, comments: 92, tag: "#community" },
    { user: "Arjun Das", ago: "2 hr ago", text: "Beat the Ludo champion 5 times in a row 🎲 who's next?", likes: 438, comments: 76, tag: "#gaming" },
    { user: "Neha Reddy", ago: "3 hr ago", text: "Daily streak: 30 days 🔥 The grind is real!", likes: 389, comments: 54, tag: "#streak" },
    { user: "Vikram Joshi", ago: "4 hr ago", text: "Anyone else loving the new emoji effects? 🎉✨", likes: 312, comments: 48, tag: "#feature" }
  ],
  trendingPostsUseLive: false,
  discussions: [
    { topic: "Best strategies for the new Fish Game?", room: "Gaming Lounge", author: "Karan", replies: 47, last: "2 min ago", hot: true },
    { topic: "Weekend Mumbai meetup — who's in?", room: "Mumbai Chat", author: "Aisha", replies: 89, last: "18 min ago", hot: true },
    { topic: "Tips for keeping a 100-day streak alive 🔥", room: "General", author: "Devansh", replies: 32, last: "1 hr ago" },
    { topic: "Drop your favorite playlist below 🎵", room: "Music Room", author: "Tanya", replies: 124, last: "2 hr ago" },
    { topic: "Coding bootcamp — share your roadmap!", room: "College Chat", author: "Riya", replies: 56, last: "3 hr ago" }
  ],
  discussionsUseLive: false,
  featuredMembers: [
    { name: "Aanya Sharma", role: "Top Creator", xp: 4820, badges: "👑 🔥 🏆", gradient: "from-purple-500/30 to-pink-500/20" },
    { name: "Kabir Singh", role: "Mod Hero", xp: 4210, badges: "🛡️ ⭐ 💎", gradient: "from-blue-500/30 to-cyan-500/20" },
    { name: "Meera Nair", role: "Game Champion", xp: 3890, badges: "🎮 🏆 🔥", gradient: "from-amber-500/30 to-orange-500/20" },
    { name: "Yash Patel", role: "Streak Master", xp: 3650, badges: "🔥 ⚡ 🌟", gradient: "from-emerald-500/30 to-teal-500/20" }
  ],
  featuredMembersUseLive: false,
  recentConfessions: [
    { alias: "Kitten #07", emoji: "🐱", ago: "8 min ago", text: "That cute boy from the Mumbai chat asked for my number… I'm not okay 😳💕", reacts: 482 },
    { alias: "Bunny #21", emoji: "🐰", ago: "22 min ago", text: "Online crush update: he replied with TWO heart emojis tonight 🫠❤️", reacts: 367 },
    { alias: "Fox #71", emoji: "🦊", ago: "45 min ago", text: "I keep refreshing his profile like a maniac. Help. 🦊💘", reacts: 298 },
    { alias: "Butterfly #14", emoji: "🦋", ago: "1 hr ago", text: "We've been DMing till 4am every night this week. I might be in trouble 😈", reacts: 521 },
    { alias: "Panda #23", emoji: "🐼", ago: "2 hr ago", text: "He called me 'cutie' in the lobby and I screamed into my pillow 🥹🔥", reacts: 412 },
    { alias: "Cherry #88", emoji: "🍒", ago: "3 hr ago", text: "Voice room with him last night >>> any date I've ever been on 🎙️💋", reacts: 634 }
  ],
  recentConfessionsUseLive: false,
  blogPosts: [
    { tag: "Guide", read: "5 min read", title: "How to Build a 100-Day Streak Without Burning Out", excerpt: "Practical habits and tools our top members use to stay consistent every single day.", author: "Editorial Team", date: "Jun 2", gradient: "from-purple-600/40 to-blue-600/30", emoji: "🔥", href: "/blog" },
    { tag: "Spotlight", read: "8 min read", title: "Meet the Mods: The People Behind Our Best Chatrooms", excerpt: "An inside look at the volunteers keeping our community safe, fun, and welcoming.", author: "Sneha Iyer", date: "May 30", gradient: "from-pink-600/40 to-amber-600/30", emoji: "🛡️", href: "/blog" },
    { tag: "Update", read: "3 min read", title: "What's New This Month: Voice Rooms, Emoji Effects & More", excerpt: "A full roundup of the features we shipped in May plus a sneak peek at what's coming next.", author: "Product Team", date: "May 28", gradient: "from-emerald-600/40 to-teal-600/30", emoji: "🚀", href: "/blog" }
  ],
  blogPostsUseLive: false,
  activities: [
    { who: "Amit", action: "joined", target: "India Chat", ago: "just now", emoji: "💬", tint: "from-blue-500/30 to-cyan-500/20", accent: "text-cyan-200", href: "/" },
    { who: "Pooja", action: "earned", target: "Gold Badge", ago: "2m ago", emoji: "🏆", tint: "from-amber-500/35 to-yellow-500/20", accent: "text-amber-200", href: "/achievements" },
    { who: "Rahul", action: "posted", target: "a new discussion", ago: "5m ago", emoji: "📝", tint: "from-purple-500/30 to-pink-500/20", accent: "text-pink-200", href: "/discussions" },
    { who: "Sneha", action: "started a DM with", target: "Aanya", ago: "8m ago", emoji: "💌", tint: "from-rose-500/30 to-fuchsia-500/20", accent: "text-rose-200", href: "/feed" },
    { who: "Kabir", action: "won", target: "a Ludo match", ago: "12m ago", emoji: "🎲", tint: "from-emerald-500/30 to-teal-500/20", accent: "text-emerald-200", href: "/games" },
    { who: "Meera", action: "hit a", target: "7-day streak 🔥", ago: "18m ago", emoji: "🔥", tint: "from-orange-500/35 to-red-500/20", accent: "text-orange-200", href: "/achievements" },
    { who: "Yash", action: "created room", target: "Late Night Vibes", ago: "25m ago", emoji: "🌙", tint: "from-indigo-500/30 to-violet-500/20", accent: "text-indigo-200", href: "/" },
    { who: "Riya", action: "leveled up to", target: "Level 12", ago: "32m ago", emoji: "⭐", tint: "from-yellow-500/30 to-amber-500/20", accent: "text-yellow-200", href: "/leaderboard" }
  ],
  activitiesUseLive: false,
  referralHeadline: "Invite Friends & Earn",
  referralDescription: "Invite your friends and earn 100 Coins for each sign up!",
  referralCoinReward: 100,
  referralXpReward: 50,
  finalCtaTitle: "Ready to Join the Fun?",
  finalCtaSubtitle: "Create your free account now and be part of our amazing community!",
  finalCtaImageUrl: "",
  finalCtaImageAlt: "Join the community",
  brandTagline: "A place to chat, connect, play and build your social world.",
  footerColumns: [
    {
      title: "Community",
      links: [
        { label: "About Us", href: "/pages" },
        { label: "Safety", href: "/pages" },
        { label: "Guidelines", href: "/pages" },
        { label: "Blog", href: "/pages" }
      ]
    },
    {
      title: "Features",
      links: [
        { label: "Chatrooms", href: "/" },
        { label: "Feed", href: "/feed" },
        { label: "Games", href: "/games" },
        { label: "Rewards", href: "/achievements" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/pages" },
        { label: "Contact Us", href: "/feedback" },
        { label: "Privacy Policy", href: "/pages" },
        { label: "Terms of Service", href: "/pages" }
      ]
    }
  ],
  copyrightOwner: "ChitChat",
  seoTitle: "ChitChat — Join the Active Community",
  seoDescription: "Live chatrooms, social feed, games, rewards and friends — all in one premium community platform.",
  seoKeywords: "social community, chatrooms, social feed, online games, rewards, friends",
  ogImageUrl: "",
  enableStructuredData: true
};
const LANDING_SETTINGS_KEY = "landing_page";
const $$splitComponentImporter$20 = () => import("./welcome-CIH4jmE9.mjs");
const HOST = "https://holo-chat-quest.lovable.app";
const Route$2x = createFileRoute("/welcome")({
  head: () => ({
    meta: [{
      title: LANDING_DEFAULTS.seoTitle
    }, {
      name: "description",
      content: LANDING_DEFAULTS.seoDescription
    }, {
      name: "keywords",
      content: LANDING_DEFAULTS.seoKeywords
    }, {
      property: "og:title",
      content: LANDING_DEFAULTS.seoTitle
    }, {
      property: "og:description",
      content: LANDING_DEFAULTS.seoDescription
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: `${HOST}/welcome`
    }, {
      property: "twitter:card",
      content: "summary_large_image"
    }],
    links: [{
      rel: "canonical",
      href: `${HOST}/welcome`
    }],
    scripts: LANDING_DEFAULTS.enableStructuredData ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: LANDING_DEFAULTS.copyrightOwner,
        url: `${HOST}/welcome`,
        description: LANDING_DEFAULTS.seoDescription
      })
    }] : []
  }),
  component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
const $$splitComponentImporter$1$ = () => import("./admin.index-BEqSmvzI.mjs");
const Route$2w = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$1$, "component")
});
const $$splitComponentImporter$1_ = () => import("./admin.abuse-protection-aFTR9ez8.mjs");
const Route$2v = createFileRoute("/admin/abuse-protection")({
  component: lazyRouteComponent($$splitComponentImporter$1_, "component")
});
const $$splitComponentImporter$1Z = () => import("./admin.activity-logs-1H8Pl0RW.mjs");
const Route$2u = createFileRoute("/admin/activity-logs")({
  component: lazyRouteComponent($$splitComponentImporter$1Z, "component")
});
const $$splitComponentImporter$1Y = () => import("./admin.ad-placements-DXnNKe9w.mjs");
const Route$2t = createFileRoute("/admin/ad-placements")({
  component: lazyRouteComponent($$splitComponentImporter$1Y, "component")
});
const $$splitComponentImporter$1X = () => import("./admin.ads-scripts-DxwAwHuZ.mjs");
const Route$2s = createFileRoute("/admin/ads-scripts")({
  component: lazyRouteComponent($$splitComponentImporter$1X, "component")
});
const $$splitComponentImporter$1W = () => import("./admin.ai-chatbots-KA5rqrmm.mjs");
const Route$2r = createFileRoute("/admin/ai-chatbots")({
  component: lazyRouteComponent($$splitComponentImporter$1W, "component")
});
const $$splitComponentImporter$1V = () => import("./admin.analytics-Dx_hh49w.mjs");
const Route$2q = createFileRoute("/admin/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$1V, "component")
});
const $$splitComponentImporter$1U = () => import("./admin.announcements-Ckk_s-Ql.mjs");
const Route$2p = createFileRoute("/admin/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$1U, "component")
});
const $$splitComponentImporter$1T = () => import("./admin.api-CFjM9Ueb.mjs");
const Route$2o = createFileRoute("/admin/api")({
  component: lazyRouteComponent($$splitComponentImporter$1T, "component")
});
const $$splitComponentImporter$1S = () => import("./admin.appearance-fODoqHvu.mjs");
const Route$2n = createFileRoute("/admin/appearance")({
  component: lazyRouteComponent($$splitComponentImporter$1S, "component")
});
const $$splitComponentImporter$1R = () => import("./admin.audit-logs-BX9JsnPx.mjs");
const listAuditLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("642a8c7dd9e36df96c5aacd4d5f7ee5edf0944a1925e9e8cbf2546cb7da210aa"));
const Route$2m = createFileRoute("/admin/audit-logs")({
  component: lazyRouteComponent($$splitComponentImporter$1R, "component")
});
const $$splitComponentImporter$1Q = () => import("./admin.auth-background-BlLgbBEA.mjs");
const Route$2l = createFileRoute("/admin/auth-background")({
  component: lazyRouteComponent($$splitComponentImporter$1Q, "component")
});
const $$splitComponentImporter$1P = () => import("./admin.automation-DbZ8sp1x.mjs");
const Route$2k = createFileRoute("/admin/automation")({
  component: lazyRouteComponent($$splitComponentImporter$1P, "component")
});
const $$splitComponentImporter$1O = () => import("./admin.backup-DbMlzZTg.mjs");
const Route$2j = createFileRoute("/admin/backup")({
  component: lazyRouteComponent($$splitComponentImporter$1O, "component")
});
const $$splitComponentImporter$1N = () => import("./admin.boobubble-Dfg7NSn0.mjs");
const Route$2i = createFileRoute("/admin/boobubble")({
  component: lazyRouteComponent($$splitComponentImporter$1N, "component")
});
const $$splitComponentImporter$1M = () => import("./admin.bot-events-B_vpZUmw.mjs");
const Route$2h = createFileRoute("/admin/bot-events")({
  component: lazyRouteComponent($$splitComponentImporter$1M, "component")
});
const $$splitComponentImporter$1L = () => import("./admin.bots-BS3oxz88.mjs");
const Route$2g = createFileRoute("/admin/bots")({
  component: lazyRouteComponent($$splitComponentImporter$1L, "component")
});
const $$splitComponentImporter$1K = () => import("./admin.branding-check-DF3AcITr.mjs");
const Route$2f = createFileRoute("/admin/branding-check")({
  component: lazyRouteComponent($$splitComponentImporter$1K, "component")
});
const $$splitComponentImporter$1J = () => import("./admin.cache-BnsvKGoo.mjs");
const Route$2e = createFileRoute("/admin/cache")({
  component: lazyRouteComponent($$splitComponentImporter$1J, "component")
});
const $$splitComponentImporter$1I = () => import("./admin.calls-BJaS5wIt.mjs");
const Route$2d = createFileRoute("/admin/calls")({
  component: lazyRouteComponent($$splitComponentImporter$1I, "component")
});
const $$splitComponentImporter$1H = () => import("./admin.chat-themes-B545hwbH.mjs");
const Route$2c = createFileRoute("/admin/chat-themes")({
  component: lazyRouteComponent($$splitComponentImporter$1H, "component")
});
const $$splitComponentImporter$1G = () => import("./admin.chatrooms-Cafc7jE_.mjs");
const Route$2b = createFileRoute("/admin/chatrooms")({
  component: lazyRouteComponent($$splitComponentImporter$1G, "component")
});
const $$splitComponentImporter$1F = () => import("./admin.community-reports-MZVWTHUs.mjs");
const Route$2a = createFileRoute("/admin/community-reports")({
  head: () => ({
    meta: [{
      title: "Community Reports — Admin"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1F, "component")
});
const $$splitComponentImporter$1E = () => import("./admin.community-verification-CUHpq1qn.mjs");
const Route$29 = createFileRoute("/admin/community-verification")({
  head: () => ({
    meta: [{
      title: "Community Verification — Admin"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1E, "component")
});
const $$splitComponentImporter$1D = () => import("./admin.competition-analytics-Oe5Wpwlg.mjs");
const Route$28 = createFileRoute("/admin/competition-analytics")({
  component: lazyRouteComponent($$splitComponentImporter$1D, "component")
});
const $$splitComponentImporter$1C = () => import("./admin.competition-categories-DT2_TFGm.mjs");
const Route$27 = createFileRoute("/admin/competition-categories")({
  component: lazyRouteComponent($$splitComponentImporter$1C, "component")
});
const $$splitComponentImporter$1B = () => import("./admin.competitions-DEueBJEw.mjs");
const Route$26 = createFileRoute("/admin/competitions")({
  component: lazyRouteComponent($$splitComponentImporter$1B, "component")
});
const $$splitComponentImporter$1A = () => import("./admin.competitions-feed-tkwT3I9b.mjs");
const Route$25 = createFileRoute("/admin/competitions-feed")({
  component: lazyRouteComponent($$splitComponentImporter$1A, "component")
});
const $$splitComponentImporter$1z = () => import("./admin.confessions-D0ML7KuM.mjs");
const Route$24 = createFileRoute("/admin/confessions")({
  component: lazyRouteComponent($$splitComponentImporter$1z, "component")
});
const $$splitComponentImporter$1y = () => import("./admin.demo-5qmwy_Ii.mjs");
const Route$23 = createFileRoute("/admin/demo")({
  component: lazyRouteComponent($$splitComponentImporter$1y, "component")
});
const $$splitComponentImporter$1x = () => import("./admin.discovery-widgets-CRcMohEB.mjs");
const Route$22 = createFileRoute("/admin/discovery-widgets")({
  component: lazyRouteComponent($$splitComponentImporter$1x, "component")
});
const $$splitComponentImporter$1w = () => import("./admin.dj-3biiHlsU.mjs");
const Route$21 = createFileRoute("/admin/dj")({
  component: lazyRouteComponent($$splitComponentImporter$1w, "component")
});
const $$splitComponentImporter$1v = () => import("./admin.dm-wallpapers-Dt49WC62.mjs");
const Route$20 = createFileRoute("/admin/dm-wallpapers")({
  component: lazyRouteComponent($$splitComponentImporter$1v, "component")
});
const $$splitComponentImporter$1u = () => import("./admin.economy-DZFFhbFQ.mjs");
const Route$1$ = createFileRoute("/admin/economy")({
  component: lazyRouteComponent($$splitComponentImporter$1u, "component")
});
const $$splitComponentImporter$1t = () => import("./admin.email-CokkGT0j.mjs");
const Route$1_ = createFileRoute("/admin/email")({
  component: lazyRouteComponent($$splitComponentImporter$1t, "component")
});
const $$splitComponentImporter$1s = () => import("./admin.error-logs-BW-ySa_j.mjs");
const Route$1Z = createFileRoute("/admin/error-logs")({
  component: lazyRouteComponent($$splitComponentImporter$1s, "component")
});
const $$splitComponentImporter$1r = () => import("./admin.export-t5nVQqoq.mjs");
const Route$1Y = createFileRoute("/admin/export")({
  component: lazyRouteComponent($$splitComponentImporter$1r, "component")
});
const CONTENT_TYPES = ["feed_post", "poetry_poem", "comment", "competition_submission", "meme", "image", "video"];
const getModerationSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("9f4e5bceb917a31a9a9dc7ffe127b053f68e5084346c0d65a83cf759538299c2"));
const ReportInput = objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid(),
  reason: stringType().min(1).max(500)
});
const reportContent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("moderation.report")]).inputValidator((raw) => ReportInput.parse(raw)).handler(createSsrRpc("54eb0f0c38b9bf251ea04bf1ad053edf0f9fc49daba9d211d9c1a3574d4b32d0"));
const listModerationQueue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType([...CONTENT_TYPES, "all"]).default("all"),
  status: enumType(["pending_review", "hidden", "removed", "all"]).default("pending_review"),
  limit: numberType().int().min(1).max(200).default(100)
}).parse(raw)).handler(createSsrRpc("176ac30c0df6f520c62a6dc9d60ddda7ae05872401a08ca4d514db8f43d087ee"));
const StatusInput = objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid(),
  status: enumType(["visible", "hidden", "removed"]),
  reason: stringType().max(500).optional()
});
const setContentModerationStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => StatusInput.parse(raw)).handler(createSsrRpc("7c225063a2e3c71e67890e64226d11136aaa641244fce385711e8a3fb43046fa"));
const warnUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().min(1).max(500),
  severity: enumType(["warning", "final_warning"]).default("warning"),
  scope: stringType().default("all")
}).parse(raw)).handler(createSsrRpc("7f3036a6e40b56aea8e2133ef2392c1bcb02942d5f4d38bf99250a154463d498"));
const banPosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().max(500).optional(),
  duration_hours: numberType().int().min(1).max(24 * 365).optional(),
  scope: stringType().default("all")
}).parse(raw)).handler(createSsrRpc("106bbe51bcce4bd43f280dd78c5b6e755dc564fec4bbe8e860e308a693ce9da3"));
const restorePosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("e9e94714a8a9bd0fcd4be9b129b47f32141edd101dc1a9f4d6031b9aebc88b7f"));
const listPostingBans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9ba8ad8c25a0448649f3d7568211d38957708e79b496a4ef080a5c564d212a83"));
const listModerationLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  limit: numberType().int().min(1).max(500).default(100),
  content_type: enumType([...CONTENT_TYPES, "all"]).default("all")
}).parse(raw)).handler(createSsrRpc("3bb4818559f9b7152a84142cb659c6f64e3ff6c70246bb125305cada0d202d6c"));
const scanContentText = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("44702b1b3aa3d91c37b1dbcc007bb588ccd4a6021709511da2d8fd791823da07"));
const scanContentImages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid()
}).parse(raw)).handler(createSsrRpc("ac484ab6ed274e8b32857bd6d66c71c5469a0e0dd7676572b1fe95f91be4beaf"));
const $$splitComponentImporter$1q = () => import("./admin.feed-moderation-Bwi6vWZ3.mjs");
const Route$1X = createFileRoute("/admin/feed-moderation")({
  component: lazyRouteComponent($$splitComponentImporter$1q, "component"),
  head: () => ({
    meta: [{
      title: "Moderation Engine · Admin"
    }]
  })
});
["all", ...CONTENT_TYPES];
const $$splitComponentImporter$1p = () => import("./admin.feed-themes-D3WcuNED.mjs");
const Route$1W = createFileRoute("/admin/feed-themes")({
  component: lazyRouteComponent($$splitComponentImporter$1p, "component")
});
const $$splitComponentImporter$1o = () => import("./admin.feedback-CbzfyEoh.mjs");
const Route$1V = createFileRoute("/admin/feedback")({
  head: () => ({
    meta: [{
      title: "Feedback — Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1o, "component")
});
const $$splitComponentImporter$1n = () => import("./admin.feedbot-CalBVsaS.mjs");
const Route$1U = createFileRoute("/admin/feedbot")({
  component: lazyRouteComponent($$splitComponentImporter$1n, "component")
});
const $$splitComponentImporter$1m = () => import("./admin.filters-DICKsr9i.mjs");
const Route$1T = createFileRoute("/admin/filters")({
  component: lazyRouteComponent($$splitComponentImporter$1m, "component")
});
const $$splitComponentImporter$1l = () => import("./admin.games-BPCXvTZ1.mjs");
const Route$1S = createFileRoute("/admin/games")({
  component: lazyRouteComponent($$splitComponentImporter$1l, "component")
});
const $$splitComponentImporter$1k = () => import("./admin.gamification-AdV93U9I.mjs");
const Route$1R = createFileRoute("/admin/gamification")({
  head: () => ({
    meta: [{
      title: "Admin · Gamification"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1k, "component")
});
const $$splitComponentImporter$1j = () => import("./admin.general-CeYIJMs-.mjs");
const Route$1Q = createFileRoute("/admin/general")({
  component: lazyRouteComponent($$splitComponentImporter$1j, "component")
});
function AdminPageHeader({ title, description, actions }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate text-xl font-semibold tracking-tight sm:text-2xl", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
  ] });
}
function ComingSoonPanel({ title, points }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto inline-flex items-center rounded-full bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border", children: "Foundation only · UI wired later" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-base font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mx-auto mt-2 max-w-md space-y-1 text-left text-sm text-muted-foreground", children: points.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" }),
      p
    ] }, p)) })
  ] });
}
const Card = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot$1 : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const getMyRoles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("bc043367e3258bc0750efadc2962d5983ded7a90f892e25e8da034f07aee469d"));
const getAllSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("3463a50820e1daf250c1455e3ccee8e6666c4b8e5c09281e767ced7b5152e29a"));
const getAllSettingsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("e666ea7defb2607f8705e98e5caec4718d862aabbfe81fceb990cb84a1028fc0"));
const updateSetting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  key: stringType().min(1).max(64),
  value: anyType()
}).parse(input)).handler(createSsrRpc("742f70fd777ae551ad3e3d3d2db22cdd962f265a6451e0c71a29e8525bb6c8b6"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("80fb419e171ab7445c9a3c070613b21c5275c8c8ca7ff35db416f2ffc369fe12"));
const seoSchema = objectType({
  page_key: stringType().min(1).max(64),
  title: stringType().max(120).nullable().optional(),
  description: stringType().max(300).nullable().optional(),
  keywords: stringType().max(500).nullable().optional(),
  og_title: stringType().max(120).nullable().optional(),
  og_description: stringType().max(300).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional()
});
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => seoSchema.parse(input)).handler(createSsrRpc("7efe620fd9e76ed5c38c31ec5a99c488a5aefd6d4272fbf32164bc4f1ce20c9c"));
const getAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("16341306f66e3e93d865e8edbb54b5361dda1dcb66fc2e0e8c72565e22634488"));
const getRealtimeOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("4fcb3aa828c53ba4d8926013168728e821d65c080c1848a107d4a91f3464371f"));
const getTopUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("b963e5dbd814aaf870c63993e3271be5d7638e1e1da717c13b2e7895551e5eee"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("2e28f2ea2e9dc9510a5aec6e555e3c88a8bed13f8e6395a5bbb398cdef09002b"));
const banUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().trim().min(3, "Reason is required").max(500),
  duration_minutes: numberType().int().min(0).max(60 * 24 * 365 * 5).nullable()
}).parse(input)).handler(createSsrRpc("d41df9bb37178408e5eaadda53c3c50a028eeb54f5e2081e2adca12cc585aabf"));
const unbanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("356e223e39964593e002f2a62714caec95be0b80bc1bcb1f166ced0c500f3c8a"));
const deleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("5f15d9c6194c3264109b1c81741c60a8654b66a5caffc1ee319315a3a983394e"));
const adminResetUserPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  new_password: stringType().min(8).max(72).optional()
}).parse(input)).handler(createSsrRpc("e26d54fd4bb85730b3dd66f1b502cc31e7da8b91f4fd161a5b19ad2562e4d543"));
const adminGrantCoins = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  amount: numberType().int().refine((n) => n !== 0 && n >= -1e6 && n <= 1e6, "Amount out of range"),
  reason: stringType().trim().max(200).optional()
}).parse(input)).handler(createSsrRpc("6d70bfa63a3940d25327ddeec4416120f6561357557950f3ae443a8741d968c9"));
const listUsersWithRoles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  q: stringType().max(64).optional(),
  filter: enumType(["all", "members", "guests", "banned", "staff"]).optional()
}).parse(input ?? {})).handler(createSsrRpc("d8993bd40f9162497be09e35e3e219129afc683ceeb885dc57ad49e227c2d53b"));
const setUserRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  role: enumType(["super_admin", "admin", "moderator", "dj", "rj"]),
  grant: booleanType()
}).parse(input)).handler(createSsrRpc("db980dd7fbef43d3fc13d10ddc5f8ed5aae0f52362aa36d741670b7c62aab77f"));
const updateUserUsername = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  username: stringType().trim().min(2).max(32)
}).parse(input)).handler(createSsrRpc("87e8d9d8a2925a65286ce3dbbfd5ac5123bf4744ea10552f976ed54f5870fb5c"));
const canEditAnnouncements = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(createSsrRpc("c465015787dbaa9c954db141adefed69510981317ee31153ef67e7865a42a5a6"));
const announcementItemSchema = objectType({
  id: stringType().min(1).max(64),
  text: stringType().max(500),
  link: stringType().max(500).optional().default(""),
  intervalMinutes: numberType().int().min(1).max(10080),
  enabled: booleanType()
});
const announcementsConfigSchema = objectType({
  enabled: booleanType(),
  items: arrayType(announcementItemSchema).min(1).max(20)
});
const updateAnnouncementsConfig = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => announcementsConfigSchema.parse(input)).handler(createSsrRpc("b0ce4466e74c0c34f7b2b1633e36d6e27c1eadf93ca1e7da079b481ef7177ee4"));
function useAdminSetting(key, defaults) {
  const fetchSettings = useServerFn(getAllSettingsAdmin);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings-full"], queryFn: () => fetchSettings({}) });
  const [values, setValues] = reactExports.useState(defaults);
  reactExports.useEffect(() => {
    if (!data) return;
    const v = data[key] || {};
    setValues({ ...defaults, ...v });
  }, [data]);
  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key, value: values } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-settings-full"] });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const patch = (partial) => setValues((s) => ({ ...s, ...partial }));
  return { values, set, patch, save: () => mut.mutate(), saving: mut.isPending };
}
const Route$1P = createFileRoute("/admin/hero-page")({
  component: HeroPageAdmin
});
function Field$1({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase text-muted-foreground", children: label }),
    children
  ] });
}
function ShowcaseEditor({
  title,
  items,
  onChange
}) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onChange([...items, { emoji: "✨", title: "New", description: "Describe it." }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-lg border p-3 sm:grid-cols-[60px_1fr_2fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.emoji, onChange: (e) => update(i, "emoji", e.target.value), className: "text-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.title, onChange: (e) => update(i, "title", e.target.value), placeholder: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.description, onChange: (e) => update(i, "description", e.target.value), placeholder: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onChange(items.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)) })
  ] }) });
}
function FamousChatroomsEditor({ items, onChange }) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Famous chatrooms 🔥" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onChange([...items, { emoji: "💬", name: "New Room", topic: "Topic…", members: 50 }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_2fr_90px_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.emoji, onChange: (e) => update(i, "emoji", e.target.value), className: "text-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.name, onChange: (e) => update(i, "name", e.target.value), placeholder: "Room name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.topic, onChange: (e) => update(i, "topic", e.target.value), placeholder: "Topic" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: it.members, onChange: (e) => update(i, "members", Number(e.target.value) || 0), placeholder: "Members" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onChange(items.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)) })
  ] }) });
}
function LiveUsersEditor({ items, onChange }) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Live users 🟢" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onChange([...items, { emoji: "✨", name: "New User", status: "Just joined" }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_2fr_2fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.emoji, onChange: (e) => update(i, "emoji", e.target.value), className: "text-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.name, onChange: (e) => update(i, "name", e.target.value), placeholder: "Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.status, onChange: (e) => update(i, "status", e.target.value), placeholder: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.imageUrl ?? "", onChange: (e) => update(i, "imageUrl", e.target.value), placeholder: "Image URL (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onChange(items.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)) })
  ] }) });
}
function DailyMissionsEditor({ items, onChange }) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Daily missions 🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onChange([...items, { emoji: "🎯", title: "New mission", reward: "+25 XP", description: "Describe the goal." }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-lg border p-3 sm:grid-cols-[50px_1fr_120px_2fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.emoji, onChange: (e) => update(i, "emoji", e.target.value), className: "text-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.title, onChange: (e) => update(i, "title", e.target.value), placeholder: "Mission title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.reward, onChange: (e) => update(i, "reward", e.target.value), placeholder: "Reward" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.description, onChange: (e) => update(i, "description", e.target.value), placeholder: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onChange(items.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)) })
  ] }) });
}
function SortableSectionRow({
  section,
  onToggle
}) {
  const { attributes, listeners: listeners2, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  const meta = HERO_SECTION_LABELS[section.key];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: setNodeRef,
      style,
      className: `flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow ${isDragging ? "shadow-lg" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "cursor-grab touch-none rounded-md p-2 text-muted-foreground hover:bg-accent active:cursor-grabbing",
            "aria-label": "Drag to reorder",
            ...attributes,
            ...listeners2,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg", children: meta.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            meta.label,
            !section.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground", children: "Hidden" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: meta.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          section.enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: section.enabled, onCheckedChange: onToggle, "aria-label": "Toggle section" })
        ] })
      ]
    }
  );
}
function SectionsArranger({
  sections,
  onChange
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.key === active.id);
    const newIndex = sections.findIndex((s) => s.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(sections, oldIndex, newIndex));
  };
  const reset = () => onChange(HERO_DEFAULTS.sections.map((s) => ({ ...s })));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Section arrangement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Drag ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "inline h-3 w-3" }),
          " to reorder. Toggle to show or hide each section on the hero page."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: reset, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
        " Reset order"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: sections.map((s) => s.key), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      SortableSectionRow,
      {
        section: s,
        onToggle: (enabled) => {
          const next = [...sections];
          next[i] = { ...next[i], enabled };
          onChange(next);
        }
      },
      s.key
    )) }) }) })
  ] }) });
}
function HeroPageAdmin() {
  const { values, set, patch, save, saving } = useAdminSetting(
    HERO_SETTINGS_KEY,
    HERO_DEFAULTS
  );
  const sections = values.sections && values.sections.length > 0 ? values.sections : HERO_DEFAULTS.sections;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdminPageHeader,
      {
        title: "Hero Homepage",
        description: "Premium community landing page. Drag to rearrange sections, toggle visibility, edit content and images.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
          " ",
          saving ? "Saving…" : "Save changes"
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionsArranger, { sections, onChange: (next) => patch({ sections: next }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        " Hero content"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Brand name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.brandName, onChange: (e) => set("brandName", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.headline, onChange: (e) => set("headline", e.target.value) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Subheadline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: values.subheadline, onChange: (e) => set("subheadline", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Join CTA", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.ctaJoinLabel, onChange: (e) => set("ctaJoinLabel", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Login CTA", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.ctaLoginLabel, onChange: (e) => set("ctaLoginLabel", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Guest CTA", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.ctaGuestLabel, onChange: (e) => set("ctaGuestLabel", e.target.value) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Final CTA title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.finalCtaTitle, onChange: (e) => set("finalCtaTitle", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Final CTA subtitle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.finalCtaSubtitle, onChange: (e) => set("finalCtaSubtitle", e.target.value) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 text-primary" }),
        " Images"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Hero image (friends chatting)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.heroImageUrl, onChange: (e) => set("heroImageUrl", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Chatroom image", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.chatroomImageUrl, onChange: (e) => set("chatroomImageUrl", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Feed image", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.feedImageUrl, onChange: (e) => set("feedImageUrl", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Radio image", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.radioImageUrl, onChange: (e) => set("radioImageUrl", e.target.value) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShowcaseEditor, { title: "Chatroom features 💬", items: values.chatroomFeatures, onChange: (v) => patch({ chatroomFeatures: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShowcaseEditor, { title: "Feed features 📰", items: values.feedFeatures, onChange: (v) => patch({ feedFeatures: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShowcaseEditor, { title: "Radio features 🎙️", items: values.radioFeatures, onChange: (v) => patch({ radioFeatures: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShowcaseEditor, { title: "Game features 🎮", items: values.gameFeatures, onChange: (v) => patch({ gameFeatures: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FamousChatroomsEditor, { items: values.famousChatrooms, onChange: (v) => patch({ famousChatrooms: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LiveUsersEditor, { items: values.liveUsers, onChange: (v) => patch({ liveUsers: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DailyMissionsEditor, { items: values.dailyMissions, onChange: (v) => patch({ dailyMissions: v }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      " ",
      saving ? "Saving…" : "Save changes"
    ] }) })
  ] });
}
function AdminToggle({
  checked,
  onCheckedChange,
  disabled,
  size = "md",
  className,
  ariaLabel
}) {
  const dims = size === "sm" ? { w: "w-[52px]", h: "h-6", text: "text-[9px]", padOn: "pl-1.5", padOff: "pr-1.5", knob: "h-4 w-4", knobOn: "translate-x-7", knobOff: "translate-x-0.5" } : { w: "w-[60px]", h: "h-7", text: "text-[10px]", padOn: "pl-2", padOff: "pr-2", knob: "h-5 w-5", knobOn: "translate-x-8", knobOff: "translate-x-0.5" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      "aria-label": ariaLabel,
      disabled,
      onClick: () => onCheckedChange(!checked),
      className: cn(
        "relative inline-flex shrink-0 items-center rounded-full border font-bold uppercase tracking-wider transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        dims.w,
        dims.h,
        dims.text,
        checked ? "border-emerald-500/40 bg-emerald-500 text-white" : "border-border bg-muted text-muted-foreground",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("flex-1 text-center", checked ? dims.padOn : "opacity-0"), children: "ON" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("flex-1 text-center", !checked ? dims.padOff : "opacity-0"), children: "OFF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform",
              dims.knob,
              checked ? dims.knobOn : dims.knobOff
            )
          }
        )
      ]
    }
  );
}
const Route$1O = createFileRoute("/admin/homepage")({
  component: HomepagePage
});
function Row({ label, description, checked, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange: onChange })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase text-muted-foreground", children: label }),
    children
  ] });
}
function HomepagePage() {
  const { values, set, patch, save, saving } = useAdminSetting(
    LANDING_SETTINGS_KEY,
    LANDING_DEFAULTS
  );
  const updateFeature = (i, key, value) => {
    const next = [...values.featureCards];
    next[i] = { ...next[i], [key]: value };
    patch({ featureCards: next });
  };
  const removeFeature = (i) => patch({ featureCards: values.featureCards.filter((_, idx) => idx !== i) });
  const addFeature = () => patch({ featureCards: [...values.featureCards, { emoji: "✨", title: "New feature", description: "Describe it." }] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdminPageHeader,
      {
        title: "Homepage Manager",
        description: "Edit content shown on the public landing page at /welcome. Live community stats are pulled automatically.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
          " ",
          saving ? "Saving…" : "Save changes"
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Landing page" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Public page available at ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "/welcome" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Enable landing page", description: "Master toggle for the public homepage.", checked: values.enabled, onChange: (v) => set("enabled", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Row,
        {
          label: "Use demo data on home page",
          description: "When ON the homepage shows the curated demo content below. When OFF it pulls live chatrooms, posts, polls and top members from your community.",
          checked: values.useDemoData,
          onChange: (v) => set("useDemoData", v)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Demo stat values" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Shown on the stat strip in demo mode, and as fallbacks for the messages-sent / games-played counters in live mode." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Members", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.members,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, members: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Online now", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.online,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, online: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Active chatrooms", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.activeRooms,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, activeRooms: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Messages sent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.messagesSent,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, messagesSent: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Feed posts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.feedPosts,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, feedPosts: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Games played", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: values.demoStats.gamesPlayed,
            onChange: (e) => patch({ demoStats: { ...values.demoStats, gamesPlayed: Math.max(0, Number(e.target.value) || 0) } })
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Hero section" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Eyebrow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.heroEyebrow, maxLength: 60, onChange: (e) => set("heroEyebrow", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.heroTitle, maxLength: 120, onChange: (e) => set("heroTitle", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subtitle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: values.heroSubtitle, maxLength: 240, onChange: (e) => set("heroSubtitle", e.target.value), rows: 2 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Feature badges (one per line)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: values.heroBadges.join("\n"),
          maxLength: 400,
          rows: 4,
          onChange: (e) => set("heroBadges", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Primary CTA label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.primaryCtaLabel, maxLength: 40, onChange: (e) => set("primaryCtaLabel", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Primary CTA link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.primaryCtaHref, maxLength: 120, onChange: (e) => set("primaryCtaHref", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Secondary CTA label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.secondaryCtaLabel, maxLength: 40, onChange: (e) => set("secondaryCtaLabel", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Secondary CTA link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.secondaryCtaHref, maxLength: 120, onChange: (e) => set("secondaryCtaHref", e.target.value) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Community stats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Show stats strip", checked: values.showStats, onChange: (v) => set("showStats", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Show messages-sent counter", checked: values.showMessageCount, onChange: (v) => set("showMessageCount", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Show games-played counter", checked: values.showGameCount, onChange: (v) => set("showGameCount", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Show growth indicator", checked: values.showGrowth, onChange: (v) => set("showGrowth", v) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Messages sent (display)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: values.fallbackMessagesSent, onChange: (e) => set("fallbackMessagesSent", Math.max(0, Number(e.target.value) || 0)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Games played (display)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: values.fallbackGamesPlayed, onChange: (e) => set("fallbackGamesPlayed", Math.max(0, Number(e.target.value) || 0)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Growth label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.growthLabel, maxLength: 40, onChange: (e) => set("growthLabel", e.target.value) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Feature cards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: addFeature, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Add"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: values.featureCards.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.emoji, maxLength: 4, onChange: (e) => updateFeature(i, "emoji", e.target.value), placeholder: "Emoji" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.title, maxLength: 40, onChange: (e) => updateFeature(i, "title", e.target.value), placeholder: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.description, maxLength: 160, onChange: (e) => updateFeature(i, "description", e.target.value), placeholder: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeFeature(i), "aria-label": "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: f.href ?? "",
            maxLength: 200,
            onChange: (e) => updateFeature(i, "href", e.target.value),
            placeholder: "Optional link (e.g. /feed, /games, https://…)"
          }
        )
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Invite-friends section" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Headline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.referralHeadline, maxLength: 80, onChange: (e) => set("referralHeadline", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: values.referralDescription, maxLength: 240, rows: 2, onChange: (e) => set("referralDescription", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Coin reward per referral", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: values.referralCoinReward, onChange: (e) => set("referralCoinReward", Math.max(0, Number(e.target.value) || 0)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "XP reward per referral", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: values.referralXpReward, onChange: (e) => set("referralXpReward", Math.max(0, Number(e.target.value) || 0)) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Final CTA & footer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Final CTA title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.finalCtaTitle, maxLength: 80, onChange: (e) => set("finalCtaTitle", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Final CTA subtitle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: values.finalCtaSubtitle, maxLength: 240, rows: 2, onChange: (e) => set("finalCtaSubtitle", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[2fr_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Final CTA image URL (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: values.finalCtaImageUrl,
            maxLength: 500,
            placeholder: "https://… (leave blank to hide)",
            onChange: (e) => set("finalCtaImageUrl", e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Image alt text", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.finalCtaImageAlt, maxLength: 120, onChange: (e) => set("finalCtaImageAlt", e.target.value) }) })
      ] }),
      values.finalCtaImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-muted-foreground", children: "Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: values.finalCtaImageUrl, alt: values.finalCtaImageAlt || "", className: "h-32 w-32 rounded-xl object-cover" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Brand tagline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: values.brandTagline, maxLength: 240, rows: 2, onChange: (e) => set("brandTagline", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Copyright owner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values.copyrightOwner, maxLength: 60, onChange: (e) => set("copyrightOwner", e.target.value) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "SEO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Landing page titles, descriptions, and OG tags are managed centrally in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/seo", className: "text-primary underline font-medium", children: "SEO Manager" }),
        " ",
        "(Page SEO → Welcome / Hero Page). Structured data toggles remain in landing config below."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Enable structured data (JSON-LD)", checked: values.enableStructuredData, onChange: (v) => set("enableStructuredData", v) })
    ] }) })
  ] });
}
const $$splitComponentImporter$1i = () => import("./admin.internal-linking-BFmuU2Yg.mjs");
const Route$1N = createFileRoute("/admin/internal-linking")({
  component: lazyRouteComponent($$splitComponentImporter$1i, "component")
});
const $$splitComponentImporter$1h = () => import("./admin.landing-Ct-LP6S-.mjs");
const Route$1M = createFileRoute("/admin/landing")({
  component: lazyRouteComponent($$splitComponentImporter$1h, "component")
});
const $$splitComponentImporter$1g = () => import("./admin.languages-BX5qM0Ar.mjs");
const Route$1L = createFileRoute("/admin/languages")({
  component: lazyRouteComponent($$splitComponentImporter$1g, "component")
});
const $$splitComponentImporter$1f = () => import("./admin.licenses-BT-2uhwI.mjs");
const Route$1K = createFileRoute("/admin/licenses")({
  component: lazyRouteComponent($$splitComponentImporter$1f, "component")
});
const $$splitComponentImporter$1e = () => import("./admin.maintenance-BQ5rZ4WX.mjs");
const Route$1J = createFileRoute("/admin/maintenance")({
  component: lazyRouteComponent($$splitComponentImporter$1e, "component")
});
const $$splitComponentImporter$1d = () => import("./admin.media-apis-C6tI8Auv.mjs");
const Route$1I = createFileRoute("/admin/media-apis")({
  component: lazyRouteComponent($$splitComponentImporter$1d, "component")
});
const $$splitComponentImporter$1c = () => import("./admin.mehfil-D0fjq9vm.mjs");
const Route$1H = createFileRoute("/admin/mehfil")({
  head: () => ({
    meta: [{
      title: "Poetry Hub Admin"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1c, "component")
});
const $$splitComponentImporter$1b = () => import("./admin.moderation-CQtI6chH.mjs");
const Route$1G = createFileRoute("/admin/moderation")({
  component: lazyRouteComponent($$splitComponentImporter$1b, "component")
});
const $$splitComponentImporter$1a = () => import("./admin.modules-CBzaZHYv.mjs");
const Route$1F = createFileRoute("/admin/modules")({
  component: lazyRouteComponent($$splitComponentImporter$1a, "component")
});
const $$splitComponentImporter$19 = () => import("./admin.pages-BYaBktTD.mjs");
const Route$1E = createFileRoute("/admin/pages")({
  component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
const $$splitComponentImporter$18 = () => import("./admin.performance-DR9YEWJl.mjs");
const Route$1D = createFileRoute("/admin/performance")({
  component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
const $$splitComponentImporter$17 = () => import("./admin.poll-widget-0qSzzimG.mjs");
const Route$1C = createFileRoute("/admin/poll-widget")({
  component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
const $$splitComponentImporter$16 = () => import("./admin.popups-QzvpgbDl.mjs");
const Route$1B = createFileRoute("/admin/popups")({
  component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
const $$splitComponentImporter$15 = () => import("./admin.premium-slugs-BCi_ONqo.mjs");
const Route$1A = createFileRoute("/admin/premium-slugs")({
  head: () => ({
    meta: [{
      title: "Premium URLs — Admin"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
const $$splitComponentImporter$14 = () => import("./admin.progression-BIqo6vRn.mjs");
const Route$1z = createFileRoute("/admin/progression")({
  component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
const $$splitComponentImporter$13 = () => import("./admin.realtime-QwAs7ovQ.mjs");
const Route$1y = createFileRoute("/admin/realtime")({
  component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
const $$splitComponentImporter$12 = () => import("./admin.referrals-CaBxaBjf.mjs");
const Route$1x = createFileRoute("/admin/referrals")({
  component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
const $$splitComponentImporter$11 = () => import("./admin.reports--RsIcX2O.mjs");
const Route$1w = createFileRoute("/admin/reports")({
  component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
const $$splitComponentImporter$10 = () => import("./admin.retention-uvMMHldt.mjs");
const Route$1v = createFileRoute("/admin/retention")({
  component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
const $$splitComponentImporter$$ = () => import("./admin.roles-BmIo5OwD.mjs");
const Route$1u = createFileRoute("/admin/roles")({
  component: lazyRouteComponent($$splitComponentImporter$$, "component")
});
const $$splitComponentImporter$_ = () => import("./admin.safety-BxCG9EYg.mjs");
const Route$1t = createFileRoute("/admin/safety")({
  head: () => ({
    meta: [{
      title: "Safety Review — Admin"
    }, {
      name: "description",
      content: "Review flagged messages, manage safety keyword rules and safety enforcement."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$_, "component")
});
const $$splitComponentImporter$Z = () => import("./admin.search-DtVLJOSm.mjs");
const Route$1s = createFileRoute("/admin/search")({
  component: lazyRouteComponent($$splitComponentImporter$Z, "component")
});
const $$splitComponentImporter$Y = () => import("./admin.security-BMg7_JAv.mjs");
const Route$1r = createFileRoute("/admin/security")({
  component: lazyRouteComponent($$splitComponentImporter$Y, "component")
});
const $$splitComponentImporter$X = () => import("./admin.seo-orFOyTyy.mjs");
const Route$1q = createFileRoute("/admin/seo")({
  component: lazyRouteComponent($$splitComponentImporter$X, "component")
});
const $$splitComponentImporter$W = () => import("./admin.setup-wizard-ClvfyYGe.mjs");
const Route$1p = createFileRoute("/admin/setup-wizard")({
  component: lazyRouteComponent($$splitComponentImporter$W, "component")
});
const $$splitComponentImporter$V = () => import("./admin.signup-access-DIAHxWup.mjs");
const Route$1o = createFileRoute("/admin/signup-access")({
  component: lazyRouteComponent($$splitComponentImporter$V, "component")
});
const $$splitComponentImporter$U = () => import("./admin.social-feed-BZ75K8dH.mjs");
const Route$1n = createFileRoute("/admin/social-feed")({
  component: lazyRouteComponent($$splitComponentImporter$U, "component")
});
const $$splitComponentImporter$T = () => import("./admin.social-layout-DoGXmS7J.mjs");
const Route$1m = createFileRoute("/admin/social-layout")({
  component: lazyRouteComponent($$splitComponentImporter$T, "component")
});
const $$splitComponentImporter$S = () => import("./admin.staff-permissions-zXbytqXI.mjs");
const Route$1l = createFileRoute("/admin/staff-permissions")({
  component: lazyRouteComponent($$splitComponentImporter$S, "component")
});
const $$splitComponentImporter$R = () => import("./admin.stickers-CrYh1_61.mjs");
const Route$1k = createFileRoute("/admin/stickers")({
  component: lazyRouteComponent($$splitComponentImporter$R, "component")
});
const $$splitComponentImporter$Q = () => import("./admin.subscriptions-BfhxwAjj.mjs");
const Route$1j = createFileRoute("/admin/subscriptions")({
  component: lazyRouteComponent($$splitComponentImporter$Q, "component")
});
const $$splitComponentImporter$P = () => import("./admin.system-CMOA3pgQ.mjs");
const Route$1i = createFileRoute("/admin/system")({
  component: lazyRouteComponent($$splitComponentImporter$P, "component")
});
const $$splitComponentImporter$O = () => import("./admin.trust-safety-Gryt8QKd.mjs");
const Route$1h = createFileRoute("/admin/trust-safety")({
  component: lazyRouteComponent($$splitComponentImporter$O, "component"),
  head: () => ({
    meta: [{
      title: "Trust & Safety · Admin"
    }]
  })
});
const $$splitComponentImporter$N = () => import("./admin.upcoming-DebS5hx2.mjs");
const Route$1g = createFileRoute("/admin/upcoming")({
  component: lazyRouteComponent($$splitComponentImporter$N, "component")
});
const $$splitComponentImporter$M = () => import("./admin.updates-Dm8tSm9d.mjs");
const Route$1f = createFileRoute("/admin/updates")({
  component: lazyRouteComponent($$splitComponentImporter$M, "component")
});
const $$splitComponentImporter$L = () => import("./admin.users-BLtsahIe.mjs");
const Route$1e = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$L, "component")
});
const $$splitComponentImporter$K = () => import("./admin.voice-notes-B1woVPou.mjs");
const Route$1d = createFileRoute("/admin/voice-notes")({
  component: lazyRouteComponent($$splitComponentImporter$K, "component")
});
const $$splitComponentImporter$J = () => import("./admin.wallet-tAyDJBQO.mjs");
const Route$1c = createFileRoute("/admin/wallet")({
  component: lazyRouteComponent($$splitComponentImporter$J, "component")
});
const $$splitComponentImporter$I = () => import("./admin.wallet-analytics-CGGXmT2A.mjs");
const Route$1b = createFileRoute("/admin/wallet-analytics")({
  component: lazyRouteComponent($$splitComponentImporter$I, "component"),
  head: () => ({
    meta: [{
      title: "Economy Analytics · Admin"
    }, {
      name: "description",
      content: "Live health metrics for the coins economy: circulation, spend, leaderboards, and feature usage."
    }]
  })
});
const $$splitComponentImporter$H = () => import("./admin.wallet-rules-Bb1YtGAF.mjs");
const Route$1a = createFileRoute("/admin/wallet-rules")({
  component: lazyRouteComponent($$splitComponentImporter$H, "component"),
  head: () => ({
    meta: [{
      title: "Wallet Rules Engine · Admin"
    }, {
      name: "description",
      content: "Configure pricing, limits, and bonus events for every coins-based feature."
    }]
  })
});
const $$splitComponentImporter$G = () => import("./broadcaster.index-Deu8zeX-.mjs");
const Route$19 = createFileRoute("/broadcaster/")({
  component: lazyRouteComponent($$splitComponentImporter$G, "component")
});
const $$splitComponentImporter$F = () => import("./broadcaster.analytics-Buoxjdax.mjs");
const Route$18 = createFileRoute("/broadcaster/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
const $$splitComponentImporter$E = () => import("./broadcaster.announcements-B1bQrnt2.mjs");
const Route$17 = createFileRoute("/broadcaster/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const $$splitComponentImporter$D = () => import("./broadcaster.mic-CWSuyYi8.mjs");
const Route$16 = createFileRoute("/broadcaster/mic")({
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitComponentImporter$C = () => import("./broadcaster.queue-B3eS81dZ.mjs");
const Route$15 = createFileRoute("/broadcaster/queue")({
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitComponentImporter$B = () => import("./broadcaster.schedule-BXxwIq1P.mjs");
const Route$14 = createFileRoute("/broadcaster/schedule")({
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./broadcaster.widgets-HqSK_4E1.mjs");
const Route$13 = createFileRoute("/broadcaster/widgets")({
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./community._slug-l0y6x1Na.mjs");
const $$splitErrorComponentImporter$6 = () => import("./community._slug-BAgwjPE_.mjs");
const $$splitNotFoundComponentImporter$8 = () => import("./community._slug-BSAEPWAZ.mjs");
const Route$12 = createFileRoute("/community/$slug")({
  loader: async ({
    params
  }) => {
    const community = await getCommunityBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!community) {
      const resolved = await resolveCommunitySlug({
        data: {
          slug: params.slug
        }
      });
      if (resolved.slug && resolved.redirected) {
        throw redirect({
          to: "/community/$slug",
          params: {
            slug: resolved.slug
          },
          replace: true
        });
      }
      throw notFound();
    }
    return {
      community
    };
  },
  head: ({
    loaderData,
    params
  }) => {
    const c = loaderData?.community;
    if (!c) return {};
    const title = `${c.name} — Community`;
    const desc = c.description || `Join the ${c.name} community.`;
    const url = `https://holo-chat-quest.lovable.app/community/${params.slug}`;
    const noIndex = c.visibility === "hidden" || c.visibility === "unlisted";
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: desc
      }, ...noIndex ? [{
        name: "robots",
        content: "noindex,nofollow"
      }] : [], {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: desc
      }, {
        property: "og:type",
        content: "website"
      }, {
        property: "og:url",
        content: url
      }, ...c.banner_url && !noIndex ? [{
        property: "og:image",
        content: c.banner_url
      }] : []],
      links: noIndex ? [] : [{
        rel: "canonical",
        href: url
      }]
    };
  },
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$8, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$6, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./competitions.index-B_XLp5Yq.mjs");
const Route$11 = createFileRoute("/competitions/")({
  head: () => ({
    meta: [{
      title: "Community Competitions — Live, Trending & Upcoming"
    }, {
      name: "description",
      content: "Discover live competitions, join tournaments, vote for your favorite nominees, and win prizes across every category."
    }, {
      property: "og:title",
      content: "Community Competitions"
    }, {
      property: "og:description",
      content: "Vote, join, and win in community competitions."
    }, {
      property: "og:type",
      content: "website"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const SITE = "https://holo-chat-quest.lovable.app";
const listCategories = createServerFn({
  method: "GET"
}).handler(createSsrRpc("10837395931819b4968c5c177b7389eea9e6ef6501fea90c15527f7eeb6b79d5"));
const listCompetitions = createServerFn({
  method: "GET"
}).handler(createSsrRpc("26c765280b7987e38b0f057b44593f0f39c1333d222bd0c12c07c34821cffd99"));
const adminListAllCompetitions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(createSsrRpc("78b9f89619ab5157fb3a33f4a2fb9acf6c988b7bd629328770f57b85ed0d86bd"));
const getCompetition = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("653f1d4b502df1b2adf9ecc6e722a4afbdb39206420351ad3fd62a51db5b8bff"));
const getCompetitionBySlug = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("a43f87bd484ddaa960a1d7258d79c82c093e20960bf1438be9b15c35bbfae58e"));
const listRelatedCompetitions = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("0b408d55c934ffdaada6af19b5f80aa2f3f34c5e3d0ed792d18216f399f3d468"));
const incrementCompetitionViews = createServerFn({
  method: "POST"
}).middleware([withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("6bddbf6498cedd14911117bd11a61a4652d2fdf1aa664fba111eddfb19dd2b6b"));
createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("ba883a1693559ad198909b50bd15941a250a0bde2ac8af83891fb0bb74540a6b"));
const adminSaveCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("10be1b4c1eb135c728b7f4f9185f4fe37b16e37363eeb2e52de6b97cf93482fe"));
const adminDeleteCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("0539b94cb726201d4ae2fa410f04fb9e3bfff2e2c497f915805328b663e2f28c"));
const adminReorderCompetitors = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("595ad05b7e1652f84e21e0d924581d342619c5a604e71c3ff879f6094f9ad5fb"));
const adminSearchProfiles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("8011088df585c59eb9f4487da85843ef5db6a19c5a197ccc3fdcb3253759184c"));
const followCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("a9c9b42eac63b94a853b1d8ed974479894665b78b67824dac8984ecf73993b12"));
const unfollowCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("db33524fd42a975603b13e27b6d69ac2055a96784e66d23609a047fef3f5e764"));
const getMyCompetitionFollow = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("08b0271d303155eee7c45c27e9dcbfe353c92c2307fb5a234e3148ba8e96031d"));
const getCompetitionFollowerCount = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("77da0a6e1279530d98ff0fedd0e5cec7a821da83c9d18e2b2cc9d4bdca187a56"));
const voteForCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("ef6f958b166801e907900045fbc260dc1f2036fcddbf97ace2ccb13bd8bfac39"));
const shareCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("9d26fd85eb7061d5730f44b58749eb4653a2669809aac11db701b4a4f5748572"));
const getMyCompetitorVote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("dc3dc44493f17d509094b6c748c6841c68919188cd2f82050cac428ac5611453"));
const listRecentCompetitionVoters = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("61c6ff43dab665c542bc08750f1f6111fd2dd2692a3d08c2570042ab710c287f"));
createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("76635cb41ab2c756ba55db0f0545f3853b07746f9eabbe6e155f8f503615fb3d"));
const getLeaderboard = createServerFn({
  method: "GET"
}).inputValidator((data = {}) => data).handler(createSsrRpc("eace701c619a302cb6a046782813dcc165bf42a7c2b2eb14bc4721174877222b"));
const joinCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("f520b38f064f1ae87c82f62d6b468c4e5acc9bc893fcf820bc76bfb7350a941b"));
const leaveCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("c0af6546ecab321a145c58ff9d965ec338948ecd50e71b1cb8b448afe32d6bc6"));
const castVote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("4b3d96eaa4e18acf2fb33ceb07bb738b44c5be19c719b06708d5ceba4835b42d"));
const getMyVote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("34243e19ec785b74a62feecab62c74c0c534df7ac7a2cd0a98ccb6633bdc7aa8"));
const adminSaveCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("86359257d147e653e646578ea9455c194201e31bb8107c939f4533f37bedab9e"));
const adminDeleteCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("99422995c9bcbf88cfea9007c1e0f46ed3e60792d1e3b95f7156040e4fdd3453"));
const adminSaveCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("b2736948b3ed9320e7a99f4b6a35366a43c754613a28e2d9db81b477564db6ef"));
const adminDeleteCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("cd24889e1cff60a3809a2fe89436a43d2a22dd5403857be445005f5c066600ef"));
const adminBulkSetEntryMode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("d4a5497fdbf8b0d2e1be330c9f05158da004d5c46a0fa7d176893580e611c32f"));
const adminSetParticipantStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("67216e73a18356a1bb41acd21336112d169c9ae445b21f2f7d4e38b325a5e0eb"));
const adminFinalizeWinners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("74af30525be26f350d5455bd701139d4616bac3490c4f61e98c74f75884fecf9"));
const adminSetCompetitorFlags = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("a4202a91ef7ccc4c738667f039992f5fa1d59ff5fa89ef64af9d4fb5468159a0"));
const adminListCompetitorVotes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("fffe27eb81fdad1290a2d5c3c0f5fa3616bb44aa6fcc3653c39be32db1c9e778"));
const adminDeleteCompetitorVote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("341756b338b55effeeb6939f2bf0aefe75dc21b7efbd3f2ab833ed4adee0305b"));
const adminResetCompetitionVotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("360e6db0795dc401879ae9e90c9891f1ae0b2bb93b5beac7340ae4eaba4d4ae5"));
const adminResetCompetitorVotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("4fa3e28bf8c9ba3853703758f42ea6079d297883fce463d9dc4db225752a1655"));
const getCompetitionAnalytics = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("32ade7380e32f91a0e296843fb9ea5f92dd41086e40482217158864f05945420"));
const adminSetManualWinners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(createSsrRpc("3563fe4e025a0bc28e5aa82ad78908e0c844f4bc665d185a869cd3134706ce16"));
const listCompetitionsEnriched = createServerFn({
  method: "GET"
}).inputValidator((d = {}) => d).handler(createSsrRpc("4fdc0c83bccea7836da5e0d9fd9c79c8accdf148503acb9b1ab4df36274d92a0"));
const listMyFollowedCompetitions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(createSsrRpc("eeef740b2b4c6fe83d5df6b846a5af8e45db89fc19aaedc59ae22198a4e65f80"));
const listHallOfFame = createServerFn({
  method: "GET"
}).inputValidator((data = {}) => data).handler(createSsrRpc("09fb21adb033b1322c1a68aaa9d50d1635d097957446f0de8ec1a0bd2b662731"));
const getUserCompetitionShowcase = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("81f88fb3f8b7494d5f3aac54a5e306586ba8c1ba7336194d4f0161713c9ef295"));
const $$splitNotFoundComponentImporter$7 = () => import("./competitions._slug-DOzAlD1J.mjs");
const $$splitComponentImporter$x = () => import("./competitions._slug-CpizVsRR.mjs");
const Route$10 = createFileRoute("/competitions/$slug")({
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const data = await getCompetitionBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!data?.competition) throw notFound();
    const canonical = data.competition.slug;
    if (canonical && canonical !== params.slug) {
      throw redirect({
        to: "/competitions/$slug",
        params: {
          slug: canonical
        },
        replace: true
      });
    }
    return data;
  },
  head: ({
    params,
    loaderData
  }) => {
    const c = loaderData?.competition;
    const url = `${SITE}/competitions/${params.slug}`;
    if (!c) {
      return {
        meta: [{
          title: "Competition not found"
        }, {
          name: "robots",
          content: "noindex"
        }]
      };
    }
    const title = `${c.name} — Competition`;
    const description = (c.description ?? "Join and vote in this community competition.").slice(0, 155);
    const ogImage = `${SITE}/api/public/og/competition/${params.slug}${c.status === "completed" ? "?variant=winner" : ""}`;
    const img = ogImage;
    const meta = [{
      title
    }, {
      name: "description",
      content: description
    }, {
      property: "og:title",
      content: title
    }, {
      property: "og:description",
      content: description
    }, {
      property: "og:type",
      content: "article"
    }, {
      property: "og:url",
      content: url
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }, {
      name: "twitter:title",
      content: title
    }, {
      name: "twitter:description",
      content: description
    }, {
      property: "og:image",
      content: img
    }, {
      name: "twitter:image",
      content: img
    }];
    return {
      meta,
      links: [{
        rel: "canonical",
        href: url
      }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: c.name,
          description,
          startDate: c.start_at,
          endDate: c.end_at,
          eventStatus: c.status === "live" ? "https://schema.org/EventScheduled" : c.status === "completed" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          image: img ? [img] : void 0,
          url
        })
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$x, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$7, "notFoundComponent")
});
const $$splitComponentImporter$w = () => import("./competitions.hall-of-fame-BSTnDFsh.mjs");
const Route$$ = createFileRoute("/competitions/hall-of-fame")({
  head: () => ({
    meta: [{
      title: "Hall of Fame — Champions"
    }, {
      name: "robots",
      content: "noindex"
    }, {
      rel: "canonical",
      href: "/hall-of-fame"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./competitions.leaderboard-CwZbtTJD.mjs");
const Route$_ = createFileRoute("/competitions/leaderboard")({
  head: () => ({
    meta: [{
      title: "Competition Leaderboard"
    }, {
      name: "description",
      content: "Top winners, voters, and most-joined members in community competitions."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./feed.index-_dAt6uUb.mjs").then((n) => n.f);
const Route$Z = createFileRoute("/feed/")({
  head: () => ({
    meta: [{
      title: "Feed"
    }, {
      name: "description",
      content: "Share posts, react, comment, and connect with friends ."
    }, {
      property: "og:title",
      content: "Feed"
    }, {
      property: "og:description",
      content: "Lightweight social feed for the community."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const postsSafe = () => supabase.from("posts_safe");
const $$splitComponentImporter$t = () => import("./feed._slug-CozH5GqM.mjs");
const SITE_URL$1 = "https://holo-chat-quest.lovable.app";
async function fetchPostForHead(slug) {
  const {
    data: post
  } = await postsSafe().select("*").eq("slug", slug).maybeSingle();
  if (!post) return null;
  let authorName = "Someone";
  let authorUsername = null;
  if (!post.is_anonymous && post.author_id) {
    const {
      data: prof
    } = await supabase.from("profiles").select("username,display_name").eq("id", post.author_id).maybeSingle();
    if (prof) {
      authorUsername = prof.username ?? null;
      authorName = prof.display_name || prof.username || "Someone";
    }
  } else {
    authorName = "Anonymous";
  }
  return {
    post,
    authorName,
    authorUsername
  };
}
const Route$Y = createFileRoute("/feed/$slug")({
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const data = await fetchPostForHead(params.slug);
    return {
      headData: data
    };
  },
  head: ({
    params,
    loaderData
  }) => {
    const url = `${SITE_URL$1}/feed/${params.slug}`;
    if (!loaderData?.headData) {
      return {
        meta: [{
          title: "Post"
        }, {
          name: "description",
          content: "View this post."
        }, {
          name: "robots",
          content: "noindex"
        }, {
          property: "og:title",
          content: "Post"
        }, {
          property: "og:description",
          content: "View this post."
        }, {
          property: "og:url",
          content: url
        }, {
          property: "og:type",
          content: "article"
        }],
        links: [{
          rel: "canonical",
          href: url
        }]
      };
    }
    const {
      post,
      authorName
    } = loaderData.headData;
    const rawText = (post.text || "").replace(/\s+/g, " ").trim();
    const title = rawText ? `${authorName}: ${rawText.slice(0, 60)}${rawText.length > 60 ? "…" : ""}` : `${authorName} shared a post`;
    const description = rawText ? rawText.slice(0, 160) : `See ${authorName}'s latest post.`;
    const image = post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : void 0;
    const isPublic = post.privacy === "public";
    const meta = [{
      title
    }, {
      name: "description",
      content: description
    }, {
      name: "robots",
      content: isPublic ? "index, follow" : "noindex, nofollow"
    }, {
      property: "og:title",
      content: title
    }, {
      property: "og:description",
      content: description
    }, {
      property: "og:url",
      content: url
    }, {
      property: "og:type",
      content: "article"
    }, {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary"
    }, {
      name: "twitter:title",
      content: title
    }, {
      name: "twitter:description",
      content: description
    }];
    if (image) {
      meta.push({
        property: "og:image",
        content: image
      });
      meta.push({
        name: "twitter:image",
        content: image
      });
    }
    return {
      meta,
      links: [{
        rel: "canonical",
        href: url
      }],
      scripts: isPublic ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SocialMediaPosting",
          headline: title,
          description,
          url,
          datePublished: post.created_at,
          image: image ? [image] : void 0,
          author: {
            "@type": "Person",
            name: authorName
          },
          interactionStatistic: [{
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: post.reaction_count ?? 0
          }, {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/CommentAction",
            userInteractionCount: post.comment_count ?? 0
          }]
        })
      }] : []
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./feedback.index-D0SQC_hv.mjs");
const Route$X = createFileRoute("/feedback/")({
  head: () => ({
    meta: [{
      title: "Community Forum — Discussions, Bugs & Ideas"
    }, {
      name: "description",
      content: "Join the community forum — report bugs, request features, discuss ideas, and track fixes together."
    }, {
      property: "og:title",
      content: "Community Forum"
    }, {
      property: "og:description",
      content: "Discussions, bug reports, and feature requests from the community."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./feedback._id-Ddtm9qow.mjs");
const Route$W = createFileRoute("/feedback/$id")({
  head: () => ({
    meta: [{
      title: "Discussion — Community Forum"
    }, {
      name: "description",
      content: "Community discussion, bug report, or feature request."
    }, {
      property: "og:title",
      content: "Community Forum discussion"
    }, {
      property: "og:description",
      content: "Join the discussion on the community forum."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./games.ludo-BaK9RsjG.mjs");
const Route$V = createFileRoute("/games/ludo")({
  head: () => ({
    meta: [{
      title: "Games — Realtime Ludo & more"
    }, {
      name: "description",
      content: "Play realtime multiplayer Ludo with friends. Earn XP, coins, and climb the leaderboard."
    }, {
      property: "og:title",
      content: "Games"
    }, {
      property: "og:description",
      content: "Realtime multiplayer Ludo. Quick match, invite friends, earn rewards."
    }]
  }),
  validateSearch: (s) => ({
    id: typeof s.id === "string" ? s.id : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./invite._code-DhWMwyM4.mjs");
const Route$U = createFileRoute("/invite/$code")({
  head: ({
    params
  }) => ({
    meta: [{
      title: `Community invite · ${params.code}`
    }, {
      name: "description",
      content: "You've been invited to join a community."
    }, {
      name: "robots",
      content: "noindex,nofollow"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const Route$T = createFileRoute("/mehfil/")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry", replace: true });
  }
});
const Route$S = createFileRoute("/mehfil/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/poetry/$slug", params: { slug: params.slug }, replace: true });
  }
});
const Route$R = createFileRoute("/mehfil/challenges")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/challenges", replace: true });
  }
});
const Route$Q = createFileRoute("/mehfil/compose")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/compose", replace: true });
  }
});
const Route$P = createFileRoute("/mehfil/hall-of-fame")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/hall-of-fame", replace: true });
  }
});
const Route$O = createFileRoute("/mehfil/leaderboard")({
  beforeLoad: () => {
    throw redirect({ to: "/poetry/leaderboard", replace: true });
  }
});
const Route$N = createFileRoute("/p/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$slug", params: { slug: params.slug }, replace: true });
  }
});
const $$splitComponentImporter$o = () => import("./pages-editor._id-BaFfWAUE.mjs");
const Route$M = createFileRoute("/pages-editor/$id")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./poetry.index-BLJROgU8.mjs");
const Route$L = createFileRoute("/poetry/")({
  loader: () => loadRouteSeo("/poetry/", "Poetry Hub", "Read, write and share original poetry."),
  head: ({
    loaderData
  }) => headFromRouteSeo(loaderData),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const listMehfilCategories = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2d49c78b3e8be2e8d6f64a5e8ed74f01f505dab7da198c399bc0f1c48b2f7fd3"));
const getMehfilHallOfFame = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d93d7fe63cd82e512cabd86b7231e6836e56f0c717e97d19bd1f8feb9e38f2fd"));
const getMehfilDiscovery = createServerFn({
  method: "GET"
}).handler(createSsrRpc("44a6f45161991cf3b090f43e0dd7af6ed5d307812ad61190f01edfbe434e2bbb"));
const listPoemsByCategory = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("d18b369204e6391491673b3efdcdeb8b7dfb88d43aa31cf9e206d4d70aa2bc4b"));
const getPoemBySlug = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("cbfbda44a4f28b17490b00aec2039a6416cd71794c7efa7247d59fdc2ef2eef8"));
const getMehfilRelated = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("10674d1c7381785e93e0f198693865d6e3ae451ae06113e790ae69223a7387c1"));
const recordPoemRead = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("0c998845b4720371824d3a1c5d3d1019f5653a6dc6dad1a4ee303b916a890d0b"));
createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("bfd9897b99fa2d9b86022ed5e044d91dd85ce1cfeba6414cd9fde8bf47eb053b"));
const getMehfilProfileSection = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("0b8e4e93a0ecb1d26c9756db6bd5a1fc799948ab4d0ced069fbd69d893546487"));
const publishPoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input?.title?.trim()) throw new Error("Title is required");
  if (!input?.body?.trim() || input.body.trim().length < 10) {
    throw new Error("Poem body must be at least 10 characters");
  }
  return input;
}).handler(createSsrRpc("66bdf9a426915c5d9933b199a4f298c12274caff62dbb4adf80274fb51cc4ba9"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a6c37b4769d6e5fe825ae79bec42e52190b367a628e7e8c9e9dc8feb06d8947a"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("ced235494f0a6bfda039567817f1a45eca6126dd7406634f8380afa170f6b060"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("e6d5c7b488bc67682bc11cdc41e0e5486a9b60d8c3485e23e3f3b92747fb568b"));
const togglePoemBookmark = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("6c593f9612024adcc8eac770b33166a331327f3a5f5d1a0504422c12f43cacd9"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5f3ecd1ad5980fa429fe39f30fdbc609a510a3865d9d358e53aae947291db692"));
const getPoemNeighbors = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("045552475ef6719f2b1d7e41344a92c22f5e038bead8523d0f9fa52a1e8a837e"));
const $$splitErrorComponentImporter$5 = () => import("./poetry._slug-Dr-UYXi8.mjs");
const $$splitNotFoundComponentImporter$6 = () => import("./poetry._slug-CkWROiX4.mjs");
const $$splitComponentImporter$m = () => import("./poetry._slug-BdTd50Jm.mjs");
const SITE_URL = "https://holo-chat-quest.lovable.app";
const Route$K = createFileRoute("/poetry/$slug")({
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const poem = await getPoemBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!poem) throw notFound();
    return {
      poem
    };
  },
  head: ({
    params,
    loaderData
  }) => {
    const url = `${SITE_URL}/poetry/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{
          title: "Poem not found · Poetry Hub"
        }, {
          name: "robots",
          content: "noindex"
        }],
        links: [{
          rel: "canonical",
          href: url
        }]
      };
    }
    const p = loaderData.poem;
    const desc = p.seo_description || poemPreview(p.body, 155);
    const title = p.seo_title || `${p.title} · Poetry Hub`;
    const authorName = p.author?.display_name || p.author?.username || "Anonymous";
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: desc
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: desc
      }, {
        property: "og:type",
        content: "article"
      }, {
        property: "og:url",
        content: url
      }, ...p.cover_url ? [{
        property: "og:image",
        content: p.cover_url
      }] : [], {
        name: "twitter:card",
        content: p.cover_url ? "summary_large_image" : "summary"
      }, {
        name: "twitter:title",
        content: title
      }, {
        name: "twitter:description",
        content: desc
      }],
      links: [{
        rel: "canonical",
        href: url
      }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          headline: p.title,
          name: p.title,
          description: desc,
          url,
          datePublished: p.published_at,
          image: p.cover_url ? [p.cover_url] : void 0,
          author: {
            "@type": "Person",
            name: authorName
          },
          genre: p.category?.name,
          interactionStatistic: [{
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: p.upvote_count ?? 0
          }, {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ReadAction",
            userInteractionCount: p.read_count ?? 0
          }]
        })
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$m, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$6, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$5, "errorComponent")
});
const $$splitComponentImporter$l = () => import("./poetry.challenges-DW7NGKvU.mjs");
const Route$J = createFileRoute("/poetry/challenges")({
  head: () => ({
    meta: [{
      title: "Poetry Battles · Poetry Hub"
    }, {
      name: "description",
      content: "Live and upcoming poetry battles. Submit your verse and compete for the top spot."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./poetry.compose-DazcTvNP.mjs");
const Route$I = createFileRoute("/poetry/compose")({
  head: () => ({
    meta: [{
      title: "Write a Poem · Poetry Hub"
    }, {
      name: "description",
      content: "Publish your poetry to Poetry Hub."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./poetry.hall-of-fame-BEnETbZE.mjs");
const Route$H = createFileRoute("/poetry/hall-of-fame")({
  head: () => ({
    meta: [{
      title: "Hall of Fame — Poetry Champions"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./poetry.leaderboard-BRCRoSDz.mjs");
const getMehfilLeaderboard = createServerFn({
  method: "GET"
}).handler(createSsrRpc("73ead1c7a9b3f68bde6e4299ad6d148e0612e2ee41feaca22aecae30607d3f44"));
const Route$G = createFileRoute("/poetry/leaderboard")({
  head: () => ({
    meta: [{
      title: "Poetry Hub Leaderboard · Top Poets"
    }, {
      name: "description",
      content: "See the top writers on Poetry Hub ranked by upvotes, reads, and battle wins."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./u._username-DbeGrj3M.mjs");
const Route$F = createFileRoute("/u/$username")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("../_authenticated.settings.privacy-vYY4xhkw.mjs");
const Route$E = createFileRoute("/_authenticated/settings/privacy")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component"),
  head: () => ({
    meta: [{
      title: "Privacy · Settings"
    }]
  })
});
const $$splitComponentImporter$f = () => import("./admin.system.database-BSB0yRy7.mjs");
const Route$D = createFileRoute("/admin/system/database")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./admin.system.jobs-a6ubaBzt.mjs");
const Route$C = createFileRoute("/admin/system/jobs")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./admin.system.queue-j0MDH7Ou.mjs");
const Route$B = createFileRoute("/admin/system/queue")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./admin.system.storage-BXddW6Qn.mjs");
const Route$A = createFileRoute("/admin/system/storage")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitErrorComponentImporter$4 = () => import("./admin.upcoming._key-uCZLwOdd.mjs");
const $$splitNotFoundComponentImporter$5 = () => import("./admin.upcoming._key-DKAHr_Ty.mjs");
const $$splitComponentImporter$b = () => import("./admin.upcoming._key-CkmkZ30A.mjs");
const Route$z = createFileRoute("/admin/upcoming/$key")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$5, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$4, "errorComponent")
});
function b64urlDecode(input) {
  const pad = 4 - (input.length % 4 || 4);
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + (pad < 4 ? "=".repeat(pad) : "");
  return Buffer.from(b64, "base64");
}
class GamesApiAuthError extends Error {
  status;
  code;
  constructor(code, message, status = 401) {
    super(message);
    this.name = "GamesApiAuthError";
    this.code = code;
    this.status = status;
  }
}
function verifyGameSession(token, expectedGameId) {
  const secret = process.env.GAME_LAUNCH_HMAC_SECRET;
  if (!secret) throw new GamesApiAuthError("no_secret", "Server not configured", 500);
  if (!token || typeof token !== "string") throw new GamesApiAuthError("no_token", "Missing session token");
  const parts = token.split(".");
  if (parts.length !== 3) throw new GamesApiAuthError("bad_token", "Malformed token");
  const [h, p, s] = parts;
  const signingInput = `${h}.${p}`;
  const expectedSig = createHmac("sha256", secret).update(signingInput).digest();
  let sigBuf;
  try {
    sigBuf = b64urlDecode(s);
  } catch {
    throw new GamesApiAuthError("bad_signature", "Invalid signature");
  }
  if (sigBuf.length !== expectedSig.length || !timingSafeEqual(sigBuf, expectedSig)) {
    throw new GamesApiAuthError("bad_signature", "Invalid signature");
  }
  let claims;
  try {
    claims = JSON.parse(b64urlDecode(p).toString("utf8"));
  } catch {
    throw new GamesApiAuthError("bad_payload", "Invalid token payload");
  }
  const now = Math.floor(Date.now() / 1e3);
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
  return claims;
}
async function getAdmin() {
  const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
async function emit(admin, userId, eventType, amount, metadata) {
  const a = admin;
  const { error } = await a.rpc("gam_emit", {
    _user_id: userId,
    _event_type: eventType,
    _amount: amount,
    _metadata: metadata
  });
  if (error) throw new Error(error.message);
}
async function apiStart(ctx2, metadata = {}) {
  const admin = await getAdmin();
  await emit(admin, ctx2.userId, "game.start", 1, { ...metadata, gameId: ctx2.gameId, sdk: true });
  return { startedAt: (/* @__PURE__ */ new Date()).toISOString(), gameId: ctx2.gameId };
}
async function apiFinish(ctx2, input) {
  const admin = await getAdmin();
  await emit(admin, ctx2.userId, "game.finish", 1, {
    ...input.metadata ?? {},
    gameId: ctx2.gameId,
    score: input.score ?? null,
    duration: input.duration ?? null,
    sdk: true
  });
  return { finishedAt: (/* @__PURE__ */ new Date()).toISOString(), gameId: ctx2.gameId };
}
async function apiSubmitScore(ctx2, input) {
  const admin = await getAdmin();
  await emit(admin, ctx2.userId, "game.score", 1, {
    ...input.metadata ?? {},
    gameId: ctx2.gameId,
    score: input.score,
    sdk: true
  });
  const a = admin;
  const { data: rows } = await a.from("gam_event_log").select("metadata").eq("user_id", ctx2.userId).eq("event_type", "game.score").contains("metadata", { gameId: ctx2.gameId }).limit(500);
  const best = (rows ?? []).reduce((m, r) => {
    const s = Number(r?.metadata?.score ?? 0);
    return s > m ? s : m;
  }, input.score);
  return { best, submitted: input.score };
}
async function apiAddXP(ctx2, input) {
  const { enforceGameReward } = await import("./games-reward-enforcer.server-DLHFAms9.mjs");
  const amount = await enforceGameReward({
    userId: ctx2.userId,
    gameId: ctx2.gameId,
    kind: "xp",
    requested: input.amount
  });
  if (amount <= 0) return { xpAdded: 0 };
  const admin = await getAdmin();
  const reason = (input.reason ?? "game.xp").slice(0, 80);
  await emit(admin, ctx2.userId, reason, amount, {
    ...input.metadata ?? {},
    gameId: ctx2.gameId,
    sdk: true
  });
  return { xpAdded: amount };
}
async function apiAddCoins(ctx2, input) {
  const { enforceGameReward } = await import("./games-reward-enforcer.server-DLHFAms9.mjs");
  const amount = await enforceGameReward({
    userId: ctx2.userId,
    gameId: ctx2.gameId,
    kind: "coins",
    requested: input.amount
  });
  const admin = await getAdmin();
  const a = admin;
  if (amount > 0) {
    const { error } = await a.rpc("gam_award", {
      _user_id: ctx2.userId,
      _coins: amount,
      _xp: 0,
      _badge: null,
      _reason: (input.reason ?? "game.coins").slice(0, 80),
      _reference: ctx2.gameId || null
    });
    if (error) throw new Error(error.message);
  }
  const { data: prof } = await a.from("profiles").select("coins").eq("id", ctx2.userId).maybeSingle();
  return { coins: Number(prof?.coins ?? 0), added: amount };
}
async function apiUnlockAchievement(ctx2, input) {
  const { enforceGameReward } = await import("./games-reward-enforcer.server-DLHFAms9.mjs");
  await enforceGameReward({
    userId: ctx2.userId,
    gameId: ctx2.gameId,
    kind: "achievement",
    requested: 1
  });
  const coins = input.coins && input.coins > 0 ? await enforceGameReward({ userId: ctx2.userId, gameId: ctx2.gameId, kind: "coins", requested: input.coins }) : 0;
  const xp = input.xp && input.xp > 0 ? await enforceGameReward({ userId: ctx2.userId, gameId: ctx2.gameId, kind: "xp", requested: input.xp }) : 0;
  const admin = await getAdmin();
  const a = admin;
  const { error } = await a.rpc("gam_award", {
    _user_id: ctx2.userId,
    _coins: coins,
    _xp: xp,
    _badge: input.achievementId,
    _reason: (input.reason ?? "sdk.achievement").slice(0, 80),
    _reference: input.achievementId
  });
  if (error) throw new Error(error.message);
  return {
    achievementId: input.achievementId,
    unlocked: true,
    unlockedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function apiSaveWrite(ctx2, input) {
  const admin = await getAdmin();
  const a = admin;
  const { data: existing } = await a.from("game_saves").select("id, version").eq("user_id", ctx2.userId).eq("game_id", ctx2.gameId).eq("slot", input.slot).maybeSingle();
  if (existing && typeof input.expectedVersion === "number" && existing.version !== input.expectedVersion) {
    throw new GamesApiAuthError(
      "version_conflict",
      `VERSION_CONFLICT: server=${existing.version} expected=${input.expectedVersion}`,
      409
    );
  }
  const nextVersion = (existing?.version ?? 0) + 1;
  const { data: row, error } = await a.from("game_saves").upsert(
    {
      user_id: ctx2.userId,
      game_id: ctx2.gameId,
      slot: input.slot,
      data: input.data,
      version: nextVersion
    },
    { onConflict: "user_id,game_id,slot" }
  ).select("slot, data, version, updated_at").single();
  if (error) throw new Error(error.message);
  return {
    slot: row.slot,
    data: row.data,
    version: row.version,
    updatedAt: row.updated_at
  };
}
async function apiSaveRead(ctx2, input) {
  const admin = await getAdmin();
  const a = admin;
  if (input.list) {
    const { data: rows, error } = await a.from("game_saves").select("slot, data, version, updated_at").eq("user_id", ctx2.userId).eq("game_id", ctx2.gameId).order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map(
      (r) => ({
        slot: r.slot,
        data: r.data,
        version: r.version,
        updatedAt: r.updated_at
      })
    );
  }
  const slot = input.slot ?? "default";
  const { data: row } = await a.from("game_saves").select("slot, data, version, updated_at").eq("user_id", ctx2.userId).eq("game_id", ctx2.gameId).eq("slot", slot).maybeSingle();
  if (!row) return null;
  return {
    slot: row.slot,
    data: row.data,
    version: row.version,
    updatedAt: row.updated_at
  };
}
async function apiTrackEvent(ctx2, input) {
  const admin = await getAdmin();
  await emit(admin, ctx2.userId, "sdk.event", 1, {
    name: input.name,
    gameId: ctx2.gameId,
    properties: input.properties ?? {},
    sdk: true
  });
  return { tracked: input.name };
}
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, x-game-session",
  "access-control-max-age": "600"
};
const JSON_HEADERS = {
  ...CORS_HEADERS,
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};
function envelope(body, status) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function ok(data, message = "ok") {
  return envelope({ success: true, message, data, error: null }, 200);
}
function fail(status, error, message = error) {
  return envelope({ success: false, message, data: null, error }, status);
}
function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
function extractToken(request, body) {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) return m[1].trim();
  const xg = request.headers.get("x-game-session");
  if (xg) return xg.trim();
  const url = new URL(request.url);
  const q = url.searchParams.get("session");
  if (q) return q.trim();
  if (body && typeof body.session === "string") return body.session;
  return "";
}
async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return {};
  try {
    const text = await request.text();
    if (!text) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return null;
  }
}
function makeGamesApiHandler(opts) {
  return async ({ request }) => {
    if (request.method === "OPTIONS") return preflight();
    const started = Date.now();
    const ip = getClientIp();
    const url = new URL(request.url);
    const body = await readBody(request);
    if (body === null) return fail(400, "invalid_json", "Malformed JSON body");
    const token = extractToken(request, body);
    let claims;
    try {
      claims = verifyGameSession(token);
    } catch (e) {
      const err = e;
      logRequest(opts.action, null, ip, started, err.status ?? 401, err.code ?? "unauth");
      return fail(err.status ?? 401, err.code ?? "unauthorized", err.message);
    }
    const query = {};
    for (const [k, v] of url.searchParams.entries()) {
      if (k === "session") continue;
      if (v === "true") query[k] = true;
      else if (v === "false") query[k] = false;
      else if (v !== "" && !isNaN(Number(v))) query[k] = Number(v);
      else query[k] = v;
    }
    const raw = { ...query, ...body ?? {} };
    if (!("gameId" in raw) || raw.gameId == null) raw.gameId = claims.gid;
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first ? `${first.path.join(".")}: ${first.message}` : "invalid payload";
      logRequest(opts.action, claims.sub, ip, started, 400, "invalid_payload");
      return fail(400, "invalid_payload", msg);
    }
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
            error: "rate_limited"
          },
          429
        );
      }
    }
    const ctx2 = { userId: claims.sub, gameId: claims.gid };
    try {
      const data = await opts.run(ctx2, parsed.data);
      logRequest(opts.action, claims.sub, ip, started, 200, "ok");
      return ok(data);
    } catch (e) {
      const err = e;
      const status = err.status ?? 500;
      const code = err.code ?? "server_error";
      const msg = err.message ?? "Unknown error";
      logRequest(opts.action, claims.sub, ip, started, status, code);
      return fail(status, code, msg);
    }
  };
}
function logRequest(action, userId, ip, startedAt, status, code) {
  const ms = Date.now() - startedAt;
  console.log(
    JSON.stringify({
      tag: "games_api",
      action,
      userId,
      ip,
      status,
      code,
      ms
    })
  );
}
const GameId = stringType().trim().min(1).max(64).regex(/^[a-z0-9][a-z0-9-]*$/i, "invalid gameId");
const Slot = stringType().trim().min(1).max(80).default("default");
const Reason = stringType().trim().min(1).max(80).optional();
const Meta = recordType(stringType(), unknownType()).optional();
const StartSchema = objectType({
  gameId: GameId.optional(),
  metadata: Meta
});
const FinishSchema = objectType({
  gameId: GameId.optional(),
  score: numberType().finite().min(0).max(1e12).optional(),
  duration: numberType().finite().min(0).max(1e9).optional(),
  metadata: Meta
});
const ScoreSchema = objectType({
  gameId: GameId.optional(),
  score: numberType().finite().min(0).max(1e12),
  metadata: Meta
});
const XpSchema = objectType({
  amount: numberType().finite().int().min(1).max(1e6),
  reason: Reason,
  gameId: GameId.optional(),
  metadata: Meta
});
const CoinsSchema = objectType({
  amount: numberType().finite().int().min(1).max(1e6),
  reason: Reason,
  gameId: GameId.optional()
});
const SaveWriteSchema = objectType({
  gameId: GameId.optional(),
  slot: Slot,
  data: unknownType(),
  expectedVersion: numberType().int().min(0).optional()
});
const SaveReadSchema = objectType({
  gameId: GameId.optional(),
  slot: Slot.optional(),
  /** When true, returns all slots for the game (list). */
  list: booleanType().optional()
});
const AchievementSchema = objectType({
  achievementId: stringType().trim().min(1).max(120),
  coins: numberType().int().min(0).max(1e6).optional(),
  xp: numberType().int().min(0).max(1e6).optional(),
  reason: Reason
});
const EventSchema = objectType({
  name: stringType().trim().min(1).max(120),
  gameId: GameId.optional(),
  properties: Meta
});
const handler$6 = makeGamesApiHandler({
  action: "achievement",
  rateKey: "xp.write",
  schema: AchievementSchema,
  run: (ctx2, input) => apiUnlockAchievement(ctx2, input)
});
const Route$y = createFileRoute("/api/games/achievement")({
  server: { handlers: { POST: handler$6, OPTIONS: handler$6 } }
});
const handler$5 = makeGamesApiHandler({
  action: "coins",
  rateKey: "wallet.write",
  schema: CoinsSchema,
  run: (ctx2, input) => apiAddCoins(ctx2, input)
});
const Route$x = createFileRoute("/api/games/coins")({
  server: { handlers: { POST: handler$5, OPTIONS: handler$5 } }
});
const handler$4 = makeGamesApiHandler({
  action: "event",
  rateKey: "api",
  schema: EventSchema,
  run: (ctx2, input) => apiTrackEvent(ctx2, input)
});
const Route$w = createFileRoute("/api/games/event")({
  server: { handlers: { POST: handler$4, OPTIONS: handler$4 } }
});
const handler$3 = makeGamesApiHandler({
  action: "finish",
  rateKey: "api",
  schema: FinishSchema,
  run: (ctx2, input) => apiFinish(ctx2, input)
});
const Route$v = createFileRoute("/api/games/finish")({
  server: { handlers: { POST: handler$3, OPTIONS: handler$3 } }
});
const postHandler = makeGamesApiHandler({
  action: "save.write",
  rateKey: "cloudsave.write",
  schema: SaveWriteSchema,
  run: (ctx2, input) => apiSaveWrite(ctx2, { slot: input.slot, data: input.data, expectedVersion: input.expectedVersion })
});
const getHandler = makeGamesApiHandler({
  action: "save.read",
  rateKey: "cloudsave.read",
  schema: SaveReadSchema,
  run: (ctx2, input) => apiSaveRead(ctx2, { slot: input.slot, list: input.list })
});
const Route$u = createFileRoute("/api/games/save")({
  server: {
    handlers: { POST: postHandler, GET: getHandler, OPTIONS: postHandler }
  }
});
const handler$2 = makeGamesApiHandler({
  action: "score",
  rateKey: "game.write",
  schema: ScoreSchema,
  run: (ctx2, input) => apiSubmitScore(ctx2, input)
});
const Route$t = createFileRoute("/api/games/score")({
  server: { handlers: { POST: handler$2, OPTIONS: handler$2 } }
});
const handler$1 = makeGamesApiHandler({
  action: "start",
  rateKey: "api",
  schema: StartSchema,
  run: (ctx2, input) => apiStart(ctx2, input.metadata)
});
const Route$s = createFileRoute("/api/games/start")({
  server: {
    handlers: { POST: handler$1, OPTIONS: handler$1 }
  }
});
const handler = makeGamesApiHandler({
  action: "xp",
  rateKey: "xp.write",
  schema: XpSchema,
  run: (ctx2, input) => apiAddXP(ctx2, input)
});
const Route$r = createFileRoute("/api/games/xp")({
  server: { handlers: { POST: handler, OPTIONS: handler } }
});
async function requireFeedbotHookAuth(request) {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const provided = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  if (!provided) return new Response("Unauthorized", { status: 401 });
  const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", "feedbot_hook_secret").maybeSingle();
  const expected = typeof data?.value === "string" ? data.value : null;
  if (!expected || expected.length < 16) {
    return new Response("Hook secret not configured", { status: 503 });
  }
  if (provided.length !== expected.length) return new Response("Unauthorized", { status: 401 });
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return new Response("Unauthorized", { status: 401 });
  return null;
}
const Route$q = createFileRoute("/api/public/backup-retention")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireFeedbotHookAuth(request);
        if (denied) return denied;
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          return new Response(JSON.stringify({ error: "server not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const supabase2 = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        const { data, error } = await supabase2.rpc("backup_history_purge_expired");
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ ok: true, removed: data ?? 0 }), {
          headers: { "Content-Type": "application/json" }
        });
      },
      GET: async () => new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      })
    }
  }
});
const AUTH_BG_DEFAULTS = {
  enabled: true,
  blur: true,
  showStats: true,
  showFeed: true,
  showChat: true,
  headline: "Live from the community"
};
const AUTH_BG_SETTINGS_KEY = "auth_background";
const Route$p = createFileRoute("/api/public/community-bg")({
  server: {
    handlers: {
      GET: async () => {
        const { data: cfgRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", AUTH_BG_SETTINGS_KEY).maybeSingle();
        const cfg = {
          ...AUTH_BG_DEFAULTS,
          ...cfgRow?.value ?? {}
        };
        if (!cfg.enabled) {
          return Response.json({ enabled: false });
        }
        const day = /* @__PURE__ */ new Date();
        day.setUTCHours(0, 0, 0, 0);
        const since = new Date(Date.now() - 1e3 * 60 * 10).toISOString();
        const [posts, messages, totalMembers, onlineMembers, postsToday, activeRooms] = await Promise.all([
          cfg.showFeed ? supabaseAdmin.from("posts").select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, media_urls").eq("privacy", "public").order("created_at", { ascending: false }).limit(12) : Promise.resolve({ data: [] }),
          cfg.showChat ? supabaseAdmin.from("messages").select("id, text, created_at, author_id, channel_id, kind").eq("channel_id", "lobby").eq("kind", "text").order("created_at", { ascending: false }).limit(15) : Promise.resolve({ data: [] }),
          cfg.showStats ? supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }) : Promise.resolve({ count: 0 }),
          cfg.showStats ? supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", since) : Promise.resolve({ count: 0 }),
          cfg.showStats ? supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public").gte("created_at", day.toISOString()) : Promise.resolve({ count: 0 }),
          cfg.showStats ? supabaseAdmin.from("room_loyalty").select("channel_id", { count: "exact", head: true }).gte("updated_at", new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString()) : Promise.resolve({ count: 0 })
        ]);
        const authorIds = /* @__PURE__ */ new Set();
        (posts.data ?? []).forEach((p) => {
          const r = p;
          if (r.owner_id && !r.is_anonymous) authorIds.add(r.owner_id);
        });
        (messages.data ?? []).forEach((m) => {
          const r = m;
          if (r.author_id) authorIds.add(r.author_id);
        });
        const profileMap = /* @__PURE__ */ new Map();
        if (authorIds.size) {
          const { data: profs } = await supabaseAdmin.from("profiles").select("id, username, avatar_url, avatar_color").in("id", Array.from(authorIds));
          (profs ?? []).forEach(
            (p) => profileMap.set(p.id, {
              username: p.username ?? "user",
              avatar_url: p.avatar_url ?? null,
              avatar_color: p.avatar_color ?? null
            })
          );
        }
        const authorFor = (id, anon = false) => {
          if (anon || !id) return { username: "Anonymous", avatar_url: null, avatar_color: null, anonymous: true };
          const p = profileMap.get(id);
          return {
            username: p?.username ?? "user",
            avatar_url: p?.avatar_url ?? null,
            avatar_color: p?.avatar_color ?? null,
            anonymous: false
          };
        };
        const postItems = (posts.data ?? []).map((p) => {
          const r = p;
          return {
            id: r.id,
            text: (r.text ?? "").slice(0, 240),
            created_at: r.created_at,
            reaction_count: r.reaction_count,
            comment_count: r.comment_count,
            has_media: Array.isArray(r.media_urls) && r.media_urls.length > 0,
            author: authorFor(r.owner_id, r.is_anonymous)
          };
        });
        const messageItems = (messages.data ?? []).reverse().map((m) => {
          const r = m;
          return {
            id: r.id,
            text: (r.text ?? "").slice(0, 200),
            created_at: r.created_at,
            author: authorFor(r.author_id)
          };
        });
        return Response.json(
          {
            enabled: true,
            config: {
              blur: cfg.blur,
              showStats: cfg.showStats,
              showFeed: cfg.showFeed,
              showChat: cfg.showChat,
              headline: cfg.headline
            },
            stats: {
              online: onlineMembers.count ?? 0,
              members: totalMembers.count ?? 0,
              postsToday: postsToday.count ?? 0,
              activeRooms: activeRooms.count ?? 0
            },
            posts: postItems,
            messages: messageItems
          },
          { headers: { "Cache-Control": "public, max-age=15" } }
        );
      }
    }
  }
});
const Route$o = createFileRoute("/api/public/demo-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          let token = "";
          try {
            const j = JSON.parse(raw);
            token = typeof j?.access_token === "string" ? j.access_token : "";
          } catch {
            token = raw.trim();
          }
          if (!token || token.length > 4096) {
            return new Response("Invalid token", { status: 400 });
          }
          const { data, error } = await supabaseAdmin.auth.getUser(token);
          if (error || !data?.user) return new Response("Unauthorized", { status: 401 });
          const u = data.user;
          const meta = u.user_metadata ?? {};
          const isDemoFlag = meta.is_demo === true;
          const emailOk = typeof u.email === "string" && /^demo\+[a-z0-9]+@palrgo\.test$/i.test(u.email);
          const notAnon = u.is_anonymous !== true;
          if (!isDemoFlag || !emailOk || !notAnon) {
            return new Response("Not a demo account", { status: 403 });
          }
          const { count: roleCount, error: roleErr } = await supabaseAdmin.from("user_roles").select("user_id", { count: "exact", head: true }).eq("user_id", u.id);
          if (roleErr) return new Response(roleErr.message, { status: 500 });
          if ((roleCount ?? 0) > 0) {
            return new Response("Account has roles", { status: 403 });
          }
          const { error: rpcErr } = await supabaseAdmin.rpc("delete_user_cascade", {
            _user: u.id
          });
          if (rpcErr) return new Response(rpcErr.message, { status: 500 });
          const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
          if (dErr) return new Response(dErr.message, { status: 500 });
          return new Response("ok");
        } catch (e) {
          console.error("demo-cleanup failed", e);
          return new Response("error", { status: 500 });
        }
      }
    }
  }
});
const Route$n = createFileRoute("/api/public/feedback-showcase")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const surface = url.searchParams.get("surface") === "signup" ? "signup" : "home";
        const { data: cfgRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", "feedback").maybeSingle();
        const cfg = {
          ...FEEDBACK_DEFAULTS,
          ...cfgRow?.value ?? {}
        };
        const enabled = surface === "signup" ? cfg.showcaseOnSignup : cfg.showcaseOnHome;
        if (!cfg.enabled || !enabled) {
          return Response.json({ enabled: false, title: cfg.showcaseTitle, items: [] });
        }
        const limit = Math.max(1, Math.min(24, cfg.showcaseLimit || 6));
        const { data: rows } = await supabaseAdmin.from("feedback_reports").select("id, title, description, category, status, upvote_count, comment_count, is_anonymous, author_id, created_at").eq("is_showcased", true).order("is_pinned", { ascending: false }).order("upvote_count", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
        const authorIds = Array.from(
          new Set((rows ?? []).filter((r) => !r.is_anonymous && r.author_id).map((r) => r.author_id))
        );
        let profileMap = /* @__PURE__ */ new Map();
        if (authorIds.length) {
          const { data: profs } = await supabaseAdmin.from("profiles").select("id, username, avatar_url").in("id", authorIds);
          profileMap = new Map((profs ?? []).map((p) => [p.id, { username: p.username, avatar_url: p.avatar_url }]));
        }
        const items = (rows ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          status: r.status,
          upvote_count: r.upvote_count,
          comment_count: r.comment_count,
          created_at: r.created_at,
          author: r.is_anonymous || !r.author_id ? { username: "Anonymous", avatar_url: null, anonymous: true } : {
            username: profileMap.get(r.author_id)?.username ?? "User",
            avatar_url: profileMap.get(r.author_id)?.avatar_url ?? null,
            anonymous: false
          }
        }));
        return Response.json(
          { enabled: true, title: cfg.showcaseTitle, items },
          { headers: { "Cache-Control": "public, max-age=30" } }
        );
      }
    }
  }
});
const Route$m = createFileRoute("/api/public/landing")({
  server: {
    handlers: {
      GET: async () => {
        const { data: cfgRow } = await supabaseAdmin.from("app_settings").select("value").eq("key", LANDING_SETTINGS_KEY).maybeSingle();
        const cfg = {
          ...LANDING_DEFAULTS,
          ...cfgRow?.value ?? {},
          demoStats: {
            ...LANDING_DEFAULTS.demoStats,
            ...cfgRow?.value?.demoStats ?? {}
          }
        };
        if (cfg.useDemoData) {
          return Response.json(
            {
              config: cfg,
              source: "demo",
              stats: {
                members: cfg.demoStats.members,
                online: cfg.demoStats.online,
                activeRooms: cfg.demoStats.activeRooms,
                messagesSent: cfg.demoStats.messagesSent,
                feedPosts: cfg.demoStats.feedPosts,
                gamesPlayed: cfg.demoStats.gamesPlayed
              },
              chatrooms: cfg.demoChatrooms,
              topMembers: cfg.demoTopMembers,
              feedPost: cfg.demoFeedPost,
              poll: cfg.demoPoll,
              confession: cfg.demoConfession,
              trendingPosts: cfg.trendingPosts,
              discussions: cfg.discussions,
              featuredMembers: cfg.featuredMembers,
              recentConfessions: cfg.recentConfessions,
              blogPosts: cfg.blogPosts,
              activities: cfg.activities
            },
            { headers: { "Cache-Control": "public, max-age=30" } }
          );
        }
        const day = /* @__PURE__ */ new Date();
        day.setUTCHours(0, 0, 0, 0);
        const onlineSince = new Date(Date.now() - 1e3 * 60 * 10).toISOString();
        const last24h = new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString();
        const [
          totalMembers,
          onlineMembers,
          postsToday,
          activeRooms,
          totalPosts,
          topRooms,
          topUsers,
          latestPost,
          latestPoll,
          latestConfession
        ] = await Promise.all([
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
          supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("last_seen", onlineSince),
          supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public").gte("created_at", day.toISOString()),
          supabaseAdmin.from("room_loyalty").select("channel_id", { count: "exact", head: true }).gte("updated_at", last24h),
          supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public"),
          supabaseAdmin.from("room_loyalty").select("channel_id").gte("updated_at", last24h).limit(50),
          supabaseAdmin.from("profiles").select("id, username, xp").order("xp", { ascending: false }).limit(3),
          supabaseAdmin.from("posts").select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count").eq("privacy", "public").order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabaseAdmin.from("posts").select("id, text, poll, created_at").eq("privacy", "public").not("poll", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabaseAdmin.from("confessions").select("id, text, alias, avatar_emoji, created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(1).maybeSingle()
        ]);
        const ago = (iso) => {
          if (!iso) return "just now";
          const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
          if (m < 60) return `${m} min ago`;
          if (m < 1440) return `${Math.round(m / 60)} hours ago`;
          return `${Math.round(m / 1440)} days ago`;
        };
        const roomCounts = /* @__PURE__ */ new Map();
        (topRooms.data ?? []).forEach((r) => {
          const k = r.channel_id;
          roomCounts.set(k, (roomCounts.get(k) ?? 0) + 1);
        });
        const liveChatrooms = Array.from(roomCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, online]) => ({ emoji: "💬", name: `#${name}`, online, topic: "Active now" }));
        const liveTopMembers = (topUsers.data ?? []).map((u) => ({
          username: u.username ?? "user",
          xp: u.xp ?? 0
        }));
        let feedPost = cfg.demoFeedPost;
        if (latestPost?.data) {
          const r = latestPost.data;
          let username = "Anonymous";
          if (!r.is_anonymous && r.owner_id) {
            const { data: p } = await supabaseAdmin.from("profiles").select("username").eq("id", r.owner_id).maybeSingle();
            username = p?.username ?? "user";
          }
          feedPost = {
            username,
            ago: ago(r.created_at),
            text: (r.text ?? "").slice(0, 220),
            likes: r.reaction_count ?? 0,
            comments: r.comment_count ?? 0,
            coins: 0
          };
        }
        let poll = cfg.demoPoll;
        if (latestPoll?.data?.poll) {
          const p = latestPoll.data.poll;
          if (p.question && Array.isArray(p.options) && p.options.length >= 2) {
            poll = {
              question: p.question.slice(0, 160),
              ago: ago(latestPoll.data.created_at),
              options: p.options.slice(0, 4).map((o) => ({
                label: (o.label ?? "Option").slice(0, 60),
                votes: typeof o.votes === "number" ? o.votes : 0
              })),
              daysLeft: 0
            };
          }
        }
        const confession = latestConfession?.data ? {
          alias: latestConfession.data.alias || "Anonymous",
          ago: ago(latestConfession.data.created_at),
          text: (latestConfession.data.text ?? "").slice(0, 220),
          emoji: latestConfession.data.avatar_emoji || "🎭"
        } : cfg.demoConfession;
        let trendingPosts = cfg.trendingPosts;
        if (cfg.trendingPostsUseLive) {
          const { data } = await supabaseAdmin.from("posts").select("id, text, created_at, owner_id, is_anonymous, reaction_count, comment_count, hashtags").eq("privacy", "public").order("reaction_count", { ascending: false }).limit(6);
          if (data && data.length) {
            const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean)));
            const profMap = /* @__PURE__ */ new Map();
            if (ownerIds.length) {
              const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
              (profs ?? []).forEach((p) => profMap.set(p.id, p.username ?? "user"));
            }
            trendingPosts = data.map((r) => ({
              user: r.is_anonymous ? "Anonymous" : profMap.get(r.owner_id) ?? "user",
              ago: ago(r.created_at),
              text: (r.text ?? "").slice(0, 220),
              likes: r.reaction_count ?? 0,
              comments: r.comment_count ?? 0,
              tag: Array.isArray(r.hashtags) && r.hashtags[0] ? `#${r.hashtags[0]}` : "#trending"
            }));
          }
        }
        let discussions = cfg.discussions;
        if (cfg.discussionsUseLive) {
          const { data } = await supabaseAdmin.from("posts").select("id, text, created_at, owner_id, is_anonymous, comment_count, updated_at").eq("privacy", "public").order("comment_count", { ascending: false }).limit(5);
          if (data && data.length) {
            const ownerIds = Array.from(new Set(data.map((r) => r.owner_id).filter(Boolean)));
            const profMap = /* @__PURE__ */ new Map();
            if (ownerIds.length) {
              const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
              (profs ?? []).forEach((p) => profMap.set(p.id, p.username ?? "user"));
            }
            discussions = data.map((r, i) => ({
              topic: (r.text ?? "Discussion").slice(0, 110),
              room: "Community",
              author: r.is_anonymous ? "Anonymous" : profMap.get(r.owner_id) ?? "user",
              replies: r.comment_count ?? 0,
              last: ago(r.updated_at ?? r.created_at),
              hot: i < 2
            }));
          }
        }
        let featuredMembers = cfg.featuredMembers;
        if (cfg.featuredMembersUseLive) {
          const { data } = await supabaseAdmin.from("profiles").select("username, xp, level, streak").order("xp", { ascending: false }).limit(4);
          if (data && data.length) {
            const grads = [
              "from-purple-500/30 to-pink-500/20",
              "from-blue-500/30 to-cyan-500/20",
              "from-amber-500/30 to-orange-500/20",
              "from-emerald-500/30 to-teal-500/20"
            ];
            featuredMembers = data.map((u, i) => ({
              name: u.username ?? "user",
              role: i === 0 ? "Top Creator" : i === 1 ? "Rising Star" : i === 2 ? "Streak Master" : "Active Member",
              xp: u.xp ?? 0,
              badges: "👑 🔥 🏆",
              gradient: grads[i % grads.length]
            }));
          }
        }
        let recentConfessions = cfg.recentConfessions;
        if (cfg.recentConfessionsUseLive) {
          const { data } = await supabaseAdmin.from("confessions").select("alias, avatar_emoji, text, created_at, like_count").eq("status", "approved").order("created_at", { ascending: false }).limit(6);
          if (data && data.length) {
            recentConfessions = data.map((c) => ({
              alias: c.alias || "Anonymous",
              emoji: c.avatar_emoji || "🎭",
              ago: ago(c.created_at),
              text: (c.text ?? "").slice(0, 200),
              reacts: c.like_count ?? 0
            }));
          }
        }
        let blogPosts = cfg.blogPosts;
        if (cfg.blogPostsUseLive) {
          const { data } = await supabaseAdmin.from("custom_pages").select("slug, title, excerpt, category, published_at, og_image").eq("status", "published").order("published_at", { ascending: false, nullsFirst: false }).limit(3);
          if (data && data.length) {
            const grads = ["from-purple-600/40 to-blue-600/30", "from-pink-600/40 to-amber-600/30", "from-emerald-600/40 to-teal-600/30"];
            const emojis = ["📰", "✨", "🚀"];
            blogPosts = data.map((p, i) => ({
              title: p.title ?? "Untitled",
              excerpt: (p.excerpt ?? "").slice(0, 180),
              tag: p.category ?? "Post",
              read: "5 min read",
              author: "Editorial",
              date: p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
              emoji: emojis[i % emojis.length],
              gradient: grads[i % grads.length],
              href: `/${p.slug ?? ""}`
            }));
          }
        }
        let activities = cfg.activities;
        if (cfg.activitiesUseLive) {
          const [{ data: newProfiles }, { data: newPosts }, { data: newConf }] = await Promise.all([
            supabaseAdmin.from("profiles").select("username, created_at").order("created_at", { ascending: false }).limit(4),
            supabaseAdmin.from("posts").select("text, created_at, owner_id, is_anonymous").eq("privacy", "public").order("created_at", { ascending: false }).limit(3),
            supabaseAdmin.from("confessions").select("alias, created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(2)
          ]);
          const live = [];
          const ownerIds = Array.from(new Set((newPosts ?? []).map((p) => p.owner_id).filter(Boolean)));
          const profMap = /* @__PURE__ */ new Map();
          if (ownerIds.length) {
            const { data: profs } = await supabaseAdmin.from("profiles").select("id, username").in("id", ownerIds);
            (profs ?? []).forEach((p) => profMap.set(p.id, p.username ?? "user"));
          }
          (newProfiles ?? []).forEach((p) => live.push({
            who: p.username ?? "Someone",
            action: "joined",
            target: "the community",
            ago: ago(p.created_at),
            emoji: "👋",
            tint: "from-blue-500/30 to-cyan-500/20",
            accent: "text-cyan-200",
            href: "/"
          }));
          (newPosts ?? []).forEach((p) => live.push({
            who: p.is_anonymous ? "Anonymous" : profMap.get(p.owner_id) ?? "user",
            action: "posted",
            target: (p.text ?? "a new update").slice(0, 40),
            ago: ago(p.created_at),
            emoji: "📝",
            tint: "from-purple-500/30 to-pink-500/20",
            accent: "text-pink-200",
            href: "/feed"
          }));
          (newConf ?? []).forEach((c) => live.push({
            who: c.alias || "Anon",
            action: "shared",
            target: "a confession",
            ago: ago(c.created_at),
            emoji: "🤫",
            tint: "from-rose-500/30 to-fuchsia-500/20",
            accent: "text-rose-200",
            href: "/confessions"
          }));
          if (live.length) activities = live.slice(0, 8);
        }
        return Response.json(
          {
            config: cfg,
            source: "live",
            stats: {
              members: totalMembers.count ?? cfg.demoStats.members,
              online: onlineMembers.count ?? cfg.demoStats.online,
              activeRooms: activeRooms.count ?? cfg.demoStats.activeRooms,
              messagesSent: cfg.demoStats.messagesSent,
              feedPosts: totalPosts.count ?? cfg.demoStats.feedPosts,
              gamesPlayed: cfg.demoStats.gamesPlayed
            },
            chatrooms: liveChatrooms.length ? liveChatrooms : cfg.demoChatrooms,
            topMembers: liveTopMembers.length ? liveTopMembers : cfg.demoTopMembers,
            feedPost,
            poll,
            confession,
            trendingPosts,
            discussions,
            featuredMembers,
            recentConfessions,
            blogPosts,
            activities
          },
          { headers: { "Cache-Control": "public, max-age=30" } }
        );
      }
    }
  }
});
const $$splitComponentImporter$a = () => import("./community._slug.index-DzhZTw-y.mjs");
const Route$l = createFileRoute("/community/$slug/")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./community._slug.competitions-BsbYHVHF.mjs");
const Route$k = createFileRoute("/community/$slug/competitions")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./community._slug.dashboard-CFoIggB_.mjs");
const $$splitErrorComponentImporter$3 = () => import("./community._slug.dashboard-3K5Kf7AN.mjs");
const $$splitNotFoundComponentImporter$4 = () => import("./community._slug.dashboard-BlQ-QleV.mjs");
const Route$j = createFileRoute("/community/$slug/dashboard")({
  loader: async ({
    params
  }) => {
    const community = await getCommunityBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!community) throw notFound();
    return {
      community
    };
  },
  head: () => ({
    meta: [{
      title: "Community Dashboard"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$4, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./community._slug.feed-BoyiWyVq.mjs");
const Route$i = createFileRoute("/community/$slug/feed")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./community._slug.members-C0_twx-l.mjs");
const Route$h = createFileRoute("/community/$slug/members")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitNotFoundComponentImporter$3 = () => import("./competitions._slug.memes-C0o8miH8.mjs");
const $$splitComponentImporter$5 = () => import("./competitions._slug.memes-BQY1LziY.mjs");
const Route$g = createFileRoute("/competitions/$slug/memes")({
  validateSearch: (s) => ({
    nominee: typeof s.nominee === "string" ? s.nominee : ""
  }),
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const data = await getCompetitionBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!data?.competition) throw notFound();
    return data;
  },
  head: ({
    params
  }) => ({
    meta: [{
      title: `Trending Memes — ${params.slug}`
    }, {
      name: "description",
      content: `😂 Trending memes for the ${params.slug} competition.`
    }, {
      property: "og:title",
      content: `Trending Memes — ${params.slug}`
    }, {
      property: "og:description",
      content: `Community memes supporting nominees in this competition.`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$3, "notFoundComponent")
});
const $$splitComponentImporter$4 = () => import("./competitions._slug.recap-Dj47OpJQ.mjs");
const $$splitNotFoundComponentImporter$2 = () => import("./competitions._slug.recap-C0o8miH8.mjs");
const $$splitErrorComponentImporter$2 = () => import("./competitions._slug.recap-BTUXK21u.mjs");
const Route$f = createFileRoute("/competitions/$slug/recap")({
  loader: async ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
    const data = await getCompetitionBySlug({
      data: {
        slug: params.slug
      }
    });
    if (!data?.competition) throw notFound();
    return data;
  },
  head: ({
    params
  }) => ({
    meta: [{
      title: `Battle Recap — ${params.slug}`
    }, {
      name: "description",
      content: `Final results, winners, and Fun Zone highlights for the ${params.slug} competition.`
    }, {
      property: "og:title",
      content: `Battle Recap — ${params.slug}`
    }, {
      property: "og:description",
      content: "Full results, podium, and community-powered Fun Zone winners."
    }, {
      property: "og:type",
      content: "article"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$2, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const Route$e = createFileRoute("/mehfil/category/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/poetry/category/$slug", params: { slug: params.slug }, replace: true });
  }
});
function cap(s) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
const $$splitErrorComponentImporter$1 = () => import("./poetry.category._slug-BYmv9iyV.mjs");
const $$splitNotFoundComponentImporter$1 = () => import("./poetry.category._slug-BScVZEIR.mjs");
const $$splitComponentImporter$3 = () => import("./poetry.category._slug-CaDm2J4q.mjs");
const Route$d = createFileRoute("/poetry/category/$slug")({
  loader: ({
    params
  }) => {
    if (!isNavigableSlug(params.slug)) throw notFound();
  },
  head: ({
    params
  }) => ({
    meta: [{
      title: `${cap(params.slug)} Poetry · Poetry Hub`
    }, {
      name: "description",
      content: `Read the best ${params.slug.replace(/-/g, " ")} poems from the Poetry Hub community.`
    }, {
      property: "og:title",
      content: `${cap(params.slug)} Poetry · Poetry Hub`
    }, {
      property: "og:description",
      content: `Read the best ${params.slug.replace(/-/g, " ")} poems from the Poetry Hub community.`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent")
});
const Route$c = createFileRoute("/api/public/hooks/feedbot-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireFeedbotHookAuth(request);
        if (denied) return denied;
        try {
          const { data: settings } = await supabaseAdmin.from("feedbot_settings").select("*").eq("id", true).maybeSingle();
          if (!settings?.enabled) return Response.json({ ok: true, skipped: "disabled" });
          if (!settings.bot_user_id) return Response.json({ ok: true, skipped: "not_provisioned" });
          const targets = settings.target_chatrooms ?? [];
          if (targets.length === 0) return Response.json({ ok: true, skipped: "no_targets" });
          const flags = settings.event_flags ?? {};
          const cooldownSec = Number(settings.min_interval_seconds ?? 300);
          const { data: events } = await supabaseAdmin.from("feedbot_events").select("*").is("dispatched_at", null).order("created_at", { ascending: true }).limit(50);
          if (!events || events.length === 0) return Response.json({ ok: true, drained: 0 });
          const cutoff = new Date(Date.now() - cooldownSec * 1e3).toISOString();
          const { data: recent } = await supabaseAdmin.from("feedbot_dispatch_log").select("chatroom_id, category, last_dispatched_at").gte("last_dispatched_at", cutoff);
          const recentSet = new Set(
            (recent ?? []).map((r) => `${r.chatroom_id}::${r.category}`)
          );
          let posted = 0;
          const dispatchedIds = [];
          for (const raw of events) {
            const ev = raw;
            if (flags[ev.category] === false) {
              dispatchedIds.push(ev.id);
              continue;
            }
            const { text, attachmentUrl } = formatFeedbotEvent(ev);
            const rows = [];
            for (const chatroomId of targets) {
              const key = `${chatroomId}::${ev.category}`;
              if (recentSet.has(key)) continue;
              rows.push({
                channel_id: chatroomId,
                author_id: ev.persona_bot_id ?? settings.bot_user_id,
                text,
                kind: "text",
                attachment: attachmentUrl ? {
                  kind: "image",
                  name: "preview",
                  mime: "image/png",
                  size: 0,
                  dataUrl: attachmentUrl
                } : null
              });
              recentSet.add(key);
            }
            if (rows.length > 0) {
              const { error: mErr } = await supabaseAdmin.from("messages").insert(rows);
              if (!mErr) {
                posted += rows.length;
                await supabaseAdmin.from("feedbot_dispatch_log").upsert(
                  rows.map((r) => ({
                    chatroom_id: r.channel_id,
                    category: ev.category,
                    last_dispatched_at: (/* @__PURE__ */ new Date()).toISOString()
                  })),
                  { onConflict: "chatroom_id,category" }
                );
              }
            }
            dispatchedIds.push(ev.id);
          }
          if (dispatchedIds.length > 0) {
            await supabaseAdmin.from("feedbot_events").update({ dispatched_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", dispatchedIds);
          }
          return Response.json({ ok: true, drained: dispatchedIds.length, posted });
        } catch (e) {
          console.error("[feedbot-dispatch]", e);
          return new Response("error", { status: 500 });
        }
      }
    }
  }
});
const Route$b = createFileRoute("/api/public/hooks/feedbot-summary")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await requireFeedbotHookAuth(request);
        if (denied) return denied;
        try {
          const { data: settings } = await supabaseAdmin.from("feedbot_settings").select("*").eq("id", true).maybeSingle();
          if (!settings?.enabled || !settings.daily_summary_enabled) {
            return Response.json({ ok: true, skipped: "disabled" });
          }
          if (!settings.bot_user_id) return Response.json({ ok: true, skipped: "not_provisioned" });
          const targets = settings.target_chatrooms ?? [];
          if (targets.length === 0) return Response.json({ ok: true, skipped: "no_targets" });
          const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
          const [posts, members, votes, comps, live] = await Promise.all([
            supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("competition_votes").select("id", { count: "exact", head: true }).gte("created_at", since),
            supabaseAdmin.from("competitions").select("id", { count: "exact", head: true }).eq("status", "live"),
            supabaseAdmin.from("posts").select("id, text, reaction_count").gte("created_at", since).order("reaction_count", { ascending: false }).limit(1).maybeSingle()
          ]);
          const trendingText = live.data?.text ?? "";
          const stats = {
            feed_posts: posts.count ?? 0,
            new_members: members.count ?? 0,
            competition_votes: votes.count ?? 0,
            live_competitions: comps.count ?? 0,
            trending: trendingText ? trendingText.slice(0, 120) : null
          };
          let text = `📊 Today's Community Highlights

• ${stats.feed_posts} new feed posts
• ${stats.new_members} new members
• ${stats.competition_votes} competition votes
• ${stats.live_competitions} live competitions` + (stats.trending ? `
• Top trending post: "${stats.trending}"` : "");
          const key = process.env.LOVABLE_API_KEY;
          if (key) {
            try {
              const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
                body: JSON.stringify({
                  model: "google/gemini-3-flash-preview",
                  messages: [
                    {
                      role: "system",
                      content: "You are FeedBot, an upbeat community bot. Write a short (max 90 words) daily community highlight using the provided stats. Use bullet points and one emoji per line. Start with the exact heading '📊 Today's Community Highlights'. Do not invent numbers."
                    },
                    { role: "user", content: JSON.stringify(stats) }
                  ]
                })
              });
              if (r.ok) {
                const j = await r.json();
                const content = j?.choices?.[0]?.message?.content;
                if (typeof content === "string" && content.trim().length > 0) {
                  text = content.trim();
                }
              }
            } catch (e) {
              console.warn("[feedbot-summary] AI call failed, using template", e);
            }
          }
          const rows = targets.map((ch) => ({
            channel_id: ch,
            author_id: settings.bot_user_id,
            text,
            kind: "text",
            attachment: null
          }));
          const { error } = await supabaseAdmin.from("messages").insert(rows);
          if (error) throw new Error(error.message);
          return Response.json({ ok: true, posted: rows.length });
        } catch (e) {
          console.error("[feedbot-summary]", e);
          return new Response("error", { status: 500 });
        }
      }
    }
  }
});
const Route$a = createFileRoute("/api/public/hooks/license-revalidate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey") ?? request.headers.get("x-api-key");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!apikey || !expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const { LicenseManager } = await import("./manager.server-Cqc5t26e.mjs");
          const cache2 = await LicenseManager.readCache();
          if (!cache2) {
            return Response.json({ ok: true, skipped: "no-cache" });
          }
          const result = await LicenseManager.check({
            domain: cache2.domain,
            serverIp: cache2.serverIp,
            productVersion: cache2.productVersion,
            runtime: "pg_cron"
          });
          return Response.json({
            ok: result.ok,
            status: result.status,
            message: result.message ?? null,
            licenseId: cache2.licenseId,
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (e) {
          return Response.json(
            { ok: false, error: e?.message ?? "revalidate failed" },
            { status: 500 }
          );
        }
      },
      GET: async () => Response.json({ ok: true, endpoint: "license-revalidate" })
    }
  }
});
const Route$9 = createFileRoute("/api/public/license/activate")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("./server-api.server-DdBpp9EH.mjs");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleActivate } = await import("./server-api.server-DdBpp9EH.mjs");
        return handleActivate(request);
      }
    }
  }
});
const Route$8 = createFileRoute("/api/public/license/check")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("./server-api.server-DdBpp9EH.mjs");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleCheck } = await import("./server-api.server-DdBpp9EH.mjs");
        return handleCheck(request);
      }
    }
  }
});
const Route$7 = createFileRoute("/api/public/license/deactivate")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("./server-api.server-DdBpp9EH.mjs");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleDeactivate } = await import("./server-api.server-DdBpp9EH.mjs");
        return handleDeactivate(request);
      }
    }
  }
});
const Route$6 = createFileRoute("/api/public/license/reset")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("./server-api.server-DdBpp9EH.mjs");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleReset } = await import("./server-api.server-DdBpp9EH.mjs");
        return handleReset(request);
      }
    }
  }
});
const Route$5 = createFileRoute("/api/public/license/verify")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { corsPreflight } = await import("./server-api.server-DdBpp9EH.mjs");
        return corsPreflight();
      },
      POST: async ({ request }) => {
        const { handleVerify } = await import("./server-api.server-DdBpp9EH.mjs");
        return handleVerify(request);
      }
    }
  }
});
const $$splitComponentImporter$2 = () => import("./community._slug.chatrooms.index-CFGUCL3M.mjs");
const Route$4 = createFileRoute("/community/$slug/chatrooms/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./community._slug.chatrooms._roomSlug-Bp8RPX40.mjs");
const Route$3 = createFileRoute("/community/$slug/chatrooms/$roomSlug")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
async function searchActiveCompetitions(query, limit = 8) {
  let q = supabase.from("competitions").select("id,name,slug,status").eq("is_published", true).in("status", ["upcoming", "live"]).order("start_at", { ascending: false }).limit(limit);
  const trimmed = query.trim();
  if (trimmed) q = q.ilike("name", `%${trimmed}%`);
  const { data } = await q;
  return data ?? [];
}
async function listCompetitionNominees(competitionId) {
  const { data } = await supabase.from("competition_competitors").select("id,name,photo_url,is_hidden,is_disqualified").eq("competition_id", competitionId).order("name", { ascending: true });
  return (data ?? []).filter((c) => !c.is_hidden && !c.is_disqualified).map((c) => ({ id: c.id, name: c.name, photo_url: c.photo_url ?? null }));
}
const FUN_CATEGORIES = ["meme", "fan_art", "poster", "fan_edit"];
const FUN_META = {
  meme: { emoji: "😂", label: "Meme", plural: "Memes", slug: "memes", accent: "from-amber-400/30 to-amber-500/10", cta: "Post the first meme" },
  fan_art: { emoji: "🎨", label: "Fan Art", plural: "Fan Arts", slug: "fan-arts", accent: "from-fuchsia-400/30 to-pink-500/10", cta: "Share your fan art" },
  poster: { emoji: "📸", label: "Poster", plural: "Posters", slug: "posters", accent: "from-sky-400/30 to-indigo-500/10", cta: "Design a poster" },
  fan_edit: { emoji: "🎥", label: "Video", plural: "Videos", slug: "fan-edits", accent: "from-emerald-400/30 to-teal-500/10", cta: "Upload a fan video" }
};
function funSlugToCategory(slug) {
  for (const c of FUN_CATEGORIES) if (FUN_META[c].slug === slug) return c;
  return null;
}
async function listCompetitionMemes(opts) {
  const limit = opts.limit ?? 10;
  let q = postsSafe().select("*").eq("category", opts.category ?? "meme").eq("competition_id", opts.competitionId);
  if (opts.nomineeId) q = q.eq("nominee_id", opts.nomineeId);
  q = q.order("reaction_count", { ascending: false }).order("comment_count", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
  const { data } = await q;
  return data ?? [];
}
async function countMemesByNominee(competitionId) {
  const { data } = await supabase.from("posts_safe").select("nominee_id").eq("category", "meme").eq("competition_id", competitionId).not("nominee_id", "is", null).limit(1e3);
  const map = {};
  for (const row of data ?? []) {
    if (!row.nominee_id) continue;
    map[row.nominee_id] = (map[row.nominee_id] ?? 0) + 1;
  }
  return map;
}
const BADGE_META = {
  trending: { emoji: "🔥", label: "Trending", className: "bg-orange-500/25 text-orange-100 border-orange-400/40" },
  most_shared: { emoji: "⭐", label: "Most Shared", className: "bg-yellow-500/25 text-yellow-100 border-yellow-400/40" },
  favorite: { emoji: "❤️", label: "Community Favorite", className: "bg-rose-500/25 text-rose-100 border-rose-400/40" },
  featured: { emoji: "🏆", label: "Featured", className: "bg-amber-500/25 text-amber-100 border-amber-400/40" }
};
async function loadFunZoneSummary(competitionId) {
  const perCategory = {
    meme: { category: "meme", count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    fan_art: { category: "fan_art", count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    poster: { category: "poster", count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null },
    fan_edit: { category: "fan_edit", count: 0, latestAt: null, thumb: null, caption: null, reactions: 0, comments: 0, recentCount: 0, badge: null }
  };
  const { data } = await supabase.from("posts_safe").select("id,slug,kind,author_id,category,created_at,media_urls,text,reaction_count,comment_count").eq("competition_id", competitionId).in("category", FUN_CATEGORIES).limit(1e3);
  const rows = data ?? [];
  const dayAgo = Date.now() - 24 * 60 * 60 * 1e3;
  const scored = [];
  for (const row of rows) {
    const bucket = perCategory[row.category];
    if (!bucket) continue;
    bucket.count += 1;
    bucket.reactions += row.reaction_count ?? 0;
    bucket.comments += row.comment_count ?? 0;
    if (new Date(row.created_at).getTime() >= dayAgo) bucket.recentCount += 1;
    if (!bucket.latestAt || row.created_at > bucket.latestAt) bucket.latestAt = row.created_at;
    const media = (row.media_urls ?? []).find((u) => /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(u)) ?? row.media_urls?.[0] ?? null;
    const engagement = (row.reaction_count ?? 0) + (row.comment_count ?? 0);
    if (!bucket.thumb && media) {
      bucket.thumb = media;
      bucket.caption = row.text;
    }
    scored.push({ row, score: engagement + (new Date(row.created_at).getTime() >= dayAgo ? 5 : 0) });
  }
  const cats = ["meme", "fan_art", "poster", "fan_edit"];
  const pick = (metric, badge) => {
    let best = null;
    let bestVal = 0;
    for (const c of cats) {
      const v = metric(perCategory[c]);
      if (v > bestVal && perCategory[c].count > 0 && !perCategory[c].badge) {
        bestVal = v;
        best = c;
      }
    }
    if (best) perCategory[best].badge = badge;
  };
  pick((e) => e.recentCount, "trending");
  pick((e) => e.reactions, "favorite");
  pick((e) => e.comments, "most_shared");
  pick((e) => e.reactions + e.comments, "featured");
  scored.sort((a, b) => b.score - a.score);
  const highlights = scored.slice(0, 12).map(({ row }) => ({
    id: row.id,
    slug: row.slug,
    text: row.text,
    kind: row.kind,
    category: row.category,
    author_id: row.author_id,
    media_urls: row.media_urls ?? [],
    reaction_count: row.reaction_count ?? 0,
    comment_count: row.comment_count ?? 0,
    created_at: row.created_at
  }));
  return { perCategory, highlights, totals: { count: rows.length } };
}
const competitionMemes = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BADGE_META,
  FUN_CATEGORIES,
  FUN_META,
  countMemesByNominee,
  funSlugToCategory,
  listCompetitionMemes,
  listCompetitionNominees,
  loadFunZoneSummary,
  searchActiveCompetitions
}, Symbol.toStringTag, { value: "Module" }));
const $$splitComponentImporter = () => import("./competitions._slug.fun._type-DL44mbXg.mjs");
const $$splitErrorComponentImporter = () => import("./competitions._slug.fun._type-DekMngc-.mjs");
const $$splitNotFoundComponentImporter = () => import("./competitions._slug.fun._type-CtPswB2k.mjs");
const Route$2 = createFileRoute("/competitions/$slug/fun/$type")({
  validateSearch: (s) => ({
    nominee: typeof s.nominee === "string" ? s.nominee : ""
  }),
  loader: async ({
    params
  }) => {
    const cat = funSlugToCategory(params.type);
    if (!cat) throw notFound();
    const data = await getCompetitionBySlug({
      data: {
        slug: params.slug
      }
    });
    return {
      ...data,
      category: cat
    };
  },
  head: ({
    params
  }) => {
    const cat = funSlugToCategory(params.type);
    const meta = cat ? FUN_META[cat] : null;
    const title = meta ? `${meta.emoji} ${meta.plural} — ${params.slug}` : "Fun Zone";
    return {
      meta: [{
        title
      }, {
        name: "description",
        content: meta ? `Community ${meta.plural.toLowerCase()} tagged with the ${params.slug} competition.` : "Fun Zone"
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: meta ? `Community ${meta.plural.toLowerCase()} for ${params.slug}.` : "Fun Zone"
      }]
    };
  },
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const MAX_RETRIES = 5;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_SEND_DELAY_MS = 200;
const DEFAULT_AUTH_TTL_MINUTES = 15;
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60;
function isRateLimited(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 429;
  }
  return error instanceof Error && error.message.includes("429");
}
function isForbidden(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 403;
  }
  return error instanceof Error && error.message.includes("403");
}
function getRetryAfterSeconds(error) {
  if (error && typeof error === "object" && "retryAfterSeconds" in error) {
    return error.retryAfterSeconds ?? 60;
  }
  return 60;
}
async function moveToDlq(supabase2, queue, msg, reason) {
  const payload = msg.message;
  await supabase2.from("email_send_log").insert({
    message_id: payload.message_id,
    template_name: payload.label || queue,
    recipient_email: payload.to,
    status: "dlq",
    error_message: reason
  });
  const { error } = await supabase2.rpc("move_to_dlq", {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload
  });
  if (error) {
    console.error("Failed to move message to DLQ", { queue, msg_id: msg.msg_id, reason, error });
  }
}
const Route$1 = createFileRoute("/lovable/email/queue/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://aofjhfsecwsrcvvvcfcy.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: state } = await supabase2.from("email_send_state").select("retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes").single();
        if (state?.retry_after_until && new Date(state.retry_after_until) > /* @__PURE__ */ new Date()) {
          return Response.json({ skipped: true, reason: "rate_limited" });
        }
        const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE;
        const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS;
        const ttlMinutes = {
          auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
          transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES
        };
        let totalProcessed = 0;
        for (const queue of ["auth_emails", "transactional_emails"]) {
          const { data: messages, error: readError } = await supabase2.rpc("read_email_batch", {
            queue_name: queue,
            batch_size: batchSize,
            vt: 30
          });
          if (readError) {
            console.error("Failed to read email batch", { queue, error: readError });
            continue;
          }
          if (!messages?.length) continue;
          const messageIds = Array.from(
            new Set(
              messages.map(
                (msg) => msg?.message?.message_id && typeof msg.message.message_id === "string" ? msg.message.message_id : null
              ).filter((id) => Boolean(id))
            )
          );
          const failedAttemptsByMessageId = /* @__PURE__ */ new Map();
          if (messageIds.length > 0) {
            const { data: failedRows, error: failedRowsError } = await supabase2.from("email_send_log").select("message_id").in("message_id", messageIds).eq("status", "failed");
            if (failedRowsError) {
              console.error("Failed to load failed-attempt counters", {
                queue,
                error: failedRowsError
              });
            } else {
              for (const row of failedRows ?? []) {
                const messageId = row?.message_id;
                if (typeof messageId !== "string" || !messageId) continue;
                failedAttemptsByMessageId.set(
                  messageId,
                  (failedAttemptsByMessageId.get(messageId) ?? 0) + 1
                );
              }
            }
          }
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const payload = msg.message;
            const failedAttempts = payload?.message_id && typeof payload.message_id === "string" ? failedAttemptsByMessageId.get(payload.message_id) ?? 0 : msg.read_ct ?? 0;
            const queuedAt = payload.queued_at ?? msg.enqueued_at;
            if (queuedAt) {
              const ageMs = Date.now() - new Date(queuedAt).getTime();
              const maxAgeMs = ttlMinutes[queue] * 60 * 1e3;
              if (ageMs > maxAgeMs) {
                console.warn("Email expired (TTL exceeded)", {
                  queue,
                  msg_id: msg.msg_id,
                  queued_at: queuedAt,
                  ttl_minutes: ttlMinutes[queue]
                });
                await moveToDlq(supabase2, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`);
                continue;
              }
            }
            if (failedAttempts >= MAX_RETRIES) {
              await moveToDlq(supabase2, queue, msg, `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`);
              continue;
            }
            if (payload.message_id) {
              const { data: alreadySent } = await supabase2.from("email_send_log").select("id").eq("message_id", payload.message_id).eq("status", "sent").maybeSingle();
              if (alreadySent) {
                console.warn("Skipping duplicate send (already sent)", {
                  queue,
                  msg_id: msg.msg_id,
                  message_id: payload.message_id
                });
                const { error: dupDelError } = await supabase2.rpc("delete_email", {
                  queue_name: queue,
                  message_id: msg.msg_id
                });
                if (dupDelError) {
                  console.error("Failed to delete duplicate message from queue", { queue, msg_id: msg.msg_id, error: dupDelError });
                }
                continue;
              }
            }
            try {
              await sendLovableEmail(
                {
                  run_id: payload.run_id,
                  to: payload.to,
                  from: payload.from,
                  sender_domain: payload.sender_domain,
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                  purpose: payload.purpose,
                  label: payload.label,
                  idempotency_key: payload.idempotency_key,
                  unsubscribe_token: payload.unsubscribe_token,
                  message_id: payload.message_id
                },
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL }
              );
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "sent"
              });
              const { error: delError } = await supabase2.rpc("delete_email", {
                queue_name: queue,
                message_id: msg.msg_id
              });
              if (delError) {
                console.error("Failed to delete sent message from queue", { queue, msg_id: msg.msg_id, error: delError });
              }
              totalProcessed++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              console.error("Email send failed", {
                queue,
                msg_id: msg.msg_id,
                read_ct: msg.read_ct,
                failed_attempts: failedAttempts,
                error: errorMsg
              });
              if (isRateLimited(error)) {
                await supabase2.from("email_send_log").insert({
                  message_id: payload.message_id,
                  template_name: payload.label || queue,
                  recipient_email: payload.to,
                  status: "failed",
                  error_message: errorMsg.slice(0, 1e3)
                });
                const retryAfterSecs = getRetryAfterSeconds(error);
                await supabase2.from("email_send_state").update({
                  retry_after_until: new Date(
                    Date.now() + retryAfterSecs * 1e3
                  ).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("id", 1);
                return Response.json({ processed: totalProcessed, stopped: "rate_limited" });
              }
              if (isForbidden(error)) {
                await moveToDlq(supabase2, queue, msg, errorMsg.slice(0, 1e3));
                return Response.json({ processed: totalProcessed, stopped: "forbidden" });
              }
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "failed",
                error_message: errorMsg.slice(0, 1e3)
              });
              if (payload?.message_id && typeof payload.message_id === "string") {
                failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1);
              }
            }
            if (i < messages.length - 1) {
              await new Promise((r) => setTimeout(r, sendDelayMs));
            }
          }
        }
        return Response.json({ processed: totalProcessed });
      }
    }
  }
});
const W = 1200;
const H = 630;
function esc(s) {
  return (s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function fmtCountdown(endAt) {
  if (!endAt) return "";
  const ms = new Date(endAt).getTime() - Date.now();
  if (ms <= 0) return "Voting closed";
  const d = Math.floor(ms / 864e5);
  const h = Math.floor(ms % 864e5 / 36e5);
  if (d > 0) return `Ends in ${d}d ${h}h`;
  const m = Math.floor(ms % 36e5 / 6e4);
  return `Ends in ${h}h ${m}m`;
}
function fmtNum(n) {
  const v = Number(n ?? 0);
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return String(v);
}
function render(data) {
  const bannerLayer = data.banner ? `<image href="${esc(data.banner)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="0.35"/>` : "";
  const stats = [data.stat1, data.stat2, data.stat3].filter(Boolean);
  const statBoxes = stats.map((s, i) => {
    const x = 80 + i * 350;
    return `
        <g transform="translate(${x}, 470)">
          <rect width="310" height="100" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
          <text x="24" y="42" fill="#e2e8f0" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500">${esc(s.label)}</text>
          <text x="24" y="82" fill="#fff" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="700">${esc(s.value)}</text>
        </g>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${bannerLayer}
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <g transform="translate(80, 80)">
    <rect width="180" height="40" rx="20" fill="#fbbf24"/>
    <text x="90" y="27" text-anchor="middle" fill="#0f172a" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700">${esc(data.badge ?? "COMPETITION")}</text>
  </g>
  <text x="80" y="230" fill="#fff" font-family="Inter, system-ui, sans-serif" font-size="64" font-weight="800">${esc(truncate(data.title, 34))}</text>
  <text x="80" y="290" fill="#cbd5e1" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="500">${esc(truncate(data.subtitle, 60))}</text>
  ${statBoxes}
  <text x="${W - 80}" y="${H - 40}" text-anchor="end" fill="rgba(255,255,255,0.6)" font-family="Inter, system-ui, sans-serif" font-size="20" font-weight="600">Community</text>
</svg>`;
}
const Route = createFileRoute("/api/public/og/competition/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const variant = url.searchParams.get("variant") ?? "competition";
        const { data: comp } = await supabaseAdmin.from("competitions").select("id, name, description, banner_url, end_at, total_votes, total_participants, status").or(`slug.eq.${params.slug},id.eq.${params.slug}`).maybeSingle();
        if (!comp) return new Response("Not found", { status: 404 });
        const { data: leader } = await supabaseAdmin.from("competition_participants").select("vote_count, user_id").eq("competition_id", comp.id).eq("status", "approved").order("vote_count", { ascending: false }).limit(1).maybeSingle();
        let leaderName = "";
        if (leader?.user_id) {
          const { data: prof } = await supabaseAdmin.from("profiles").select("username").eq("id", leader.user_id).maybeSingle();
          leaderName = prof?.username ?? "";
        }
        const isCompleted = comp.status === "completed";
        const badge = variant === "winner" || isCompleted ? "🏆 WINNER" : variant === "nominee" ? "🌟 NOMINEE" : variant === "hall-of-fame" ? "👑 HALL OF FAME" : "🏆 COMPETITION";
        const subtitle = variant === "winner" ? `Winner announced — ${leaderName || "See the results"}` : leaderName ? `Leading: ${leaderName}` : "Cast your vote and support your favourite";
        const data = {
          title: comp.name,
          subtitle,
          banner: comp.banner_url,
          badge,
          stat1: { label: "Votes", value: fmtNum(comp.total_votes) },
          stat2: { label: "Nominees", value: fmtNum(comp.total_participants) },
          stat3: {
            label: isCompleted ? "Status" : "Countdown",
            value: isCompleted ? "Closed" : fmtCountdown(comp.end_at)
          }
        };
        return new Response(render(data), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=120, s-maxage=300"
          }
        });
      }
    }
  }
});
const IndexRoute = Route$37.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$38
});
const SlugRoute = Route$36.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => Route$38
});
const AuthenticatedRouteRoute = Route$35.update({
  id: "/_authenticated",
  getParentRoute: () => Route$38
});
const AccountRoute = Route$34.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => Route$38
});
const AchievementsRoute = Route$33.update({
  id: "/achievements",
  path: "/achievements",
  getParentRoute: () => Route$38
});
const AdminRoute = Route$32.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$38
});
const BannedRoute = Route$31.update({
  id: "/banned",
  path: "/banned",
  getParentRoute: () => Route$38
});
const BattleHubRoute = Route$30.update({
  id: "/battle-hub",
  path: "/battle-hub",
  getParentRoute: () => Route$38
});
const BroadcasterRoute = Route$2$.update({
  id: "/broadcaster",
  path: "/broadcaster",
  getParentRoute: () => Route$38
});
const ChatRoute = Route$2_.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => Route$38
});
const ChatroomRoute = Route$2Z.update({
  id: "/chatroom",
  path: "/chatroom",
  getParentRoute: () => Route$38
});
const ChatroomsRoute = Route$2Y.update({
  id: "/chatrooms",
  path: "/chatrooms",
  getParentRoute: () => Route$38
});
const CommunitiesRoute = Route$2X.update({
  id: "/communities",
  path: "/communities",
  getParentRoute: () => Route$38
});
const CommunityRoute = Route$2W.update({
  id: "/community",
  path: "/community",
  getParentRoute: () => Route$38
});
const CompetitionsRoute = Route$2V.update({
  id: "/competitions",
  path: "/competitions",
  getParentRoute: () => Route$38
});
const ConfessionsRoute = Route$2U.update({
  id: "/confessions",
  path: "/confessions",
  getParentRoute: () => Route$38
});
const DeployRoute = Route$2T.update({
  id: "/deploy",
  path: "/deploy",
  getParentRoute: () => Route$38
});
const FindFriendsRoute = Route$2S.update({
  id: "/find-friends",
  path: "/find-friends",
  getParentRoute: () => Route$38
});
const GamesRoute = Route$2R.update({
  id: "/games",
  path: "/games",
  getParentRoute: () => Route$38
});
const GamificationRoute = Route$2Q.update({
  id: "/gamification",
  path: "/gamification",
  getParentRoute: () => Route$38
});
const GroupsRoute = Route$2P.update({
  id: "/groups",
  path: "/groups",
  getParentRoute: () => Route$38
});
const HallOfFameRoute = Route$2O.update({
  id: "/hall-of-fame",
  path: "/hall-of-fame",
  getParentRoute: () => Route$38
});
const HeropageRoute = Route$2N.update({
  id: "/heropage",
  path: "/heropage",
  getParentRoute: () => Route$38
});
const InstallerRoute = Route$2M.update({
  id: "/installer",
  path: "/installer",
  getParentRoute: () => Route$38
});
const JourneyRoute = Route$2L.update({
  id: "/journey",
  path: "/journey",
  getParentRoute: () => Route$38
});
const LeaderboardRoute = Route$2K.update({
  id: "/leaderboard",
  path: "/leaderboard",
  getParentRoute: () => Route$38
});
const LoginRoute = Route$2J.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$38
});
const ManifestDotwebmanifestRoute = Route$2I.update({
  id: "/manifest.webmanifest",
  path: "/manifest.webmanifest",
  getParentRoute: () => Route$38
});
const PagesRoute = Route$2H.update({
  id: "/pages",
  path: "/pages",
  getParentRoute: () => Route$38
});
const PricingRoute = Route$2G.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => Route$38
});
const RadioRoute = Route$2F.update({
  id: "/radio",
  path: "/radio",
  getParentRoute: () => Route$38
});
const ReelsRoute = Route$2E.update({
  id: "/reels",
  path: "/reels",
  getParentRoute: () => Route$38
});
const ResetPasswordRoute = Route$2D.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$38
});
const RobotsDottxtRoute = Route$2C.update({
  id: "/robots.txt",
  path: "/robots.txt",
  getParentRoute: () => Route$38
});
const SetupWizardRoute = Route$2B.update({
  id: "/setup-wizard",
  path: "/setup-wizard",
  getParentRoute: () => Route$38
});
const SitemapDotxmlRoute = Route$2A.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$38
});
const TrustRoute = Route$2z.update({
  id: "/trust",
  path: "/trust",
  getParentRoute: () => Route$38
});
const WalletRoute = Route$2y.update({
  id: "/wallet",
  path: "/wallet",
  getParentRoute: () => Route$38
});
const WelcomeRoute = Route$2x.update({
  id: "/welcome",
  path: "/welcome",
  getParentRoute: () => Route$38
});
const AdminIndexRoute = Route$2w.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const AdminAbuseProtectionRoute = Route$2v.update({
  id: "/abuse-protection",
  path: "/abuse-protection",
  getParentRoute: () => AdminRoute
});
const AdminActivityLogsRoute = Route$2u.update({
  id: "/activity-logs",
  path: "/activity-logs",
  getParentRoute: () => AdminRoute
});
const AdminAdPlacementsRoute = Route$2t.update({
  id: "/ad-placements",
  path: "/ad-placements",
  getParentRoute: () => AdminRoute
});
const AdminAdsScriptsRoute = Route$2s.update({
  id: "/ads-scripts",
  path: "/ads-scripts",
  getParentRoute: () => AdminRoute
});
const AdminAiChatbotsRoute = Route$2r.update({
  id: "/ai-chatbots",
  path: "/ai-chatbots",
  getParentRoute: () => AdminRoute
});
const AdminAnalyticsRoute = Route$2q.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AdminRoute
});
const AdminAnnouncementsRoute = Route$2p.update({
  id: "/announcements",
  path: "/announcements",
  getParentRoute: () => AdminRoute
});
const AdminApiRoute = Route$2o.update({
  id: "/api",
  path: "/api",
  getParentRoute: () => AdminRoute
});
const AdminAppearanceRoute = Route$2n.update({
  id: "/appearance",
  path: "/appearance",
  getParentRoute: () => AdminRoute
});
const AdminAuditLogsRoute = Route$2m.update({
  id: "/audit-logs",
  path: "/audit-logs",
  getParentRoute: () => AdminRoute
});
const AdminAuthBackgroundRoute = Route$2l.update({
  id: "/auth-background",
  path: "/auth-background",
  getParentRoute: () => AdminRoute
});
const AdminAutomationRoute = Route$2k.update({
  id: "/automation",
  path: "/automation",
  getParentRoute: () => AdminRoute
});
const AdminBackupRoute = Route$2j.update({
  id: "/backup",
  path: "/backup",
  getParentRoute: () => AdminRoute
});
const AdminBoobubbleRoute = Route$2i.update({
  id: "/boobubble",
  path: "/boobubble",
  getParentRoute: () => AdminRoute
});
const AdminBotEventsRoute = Route$2h.update({
  id: "/bot-events",
  path: "/bot-events",
  getParentRoute: () => AdminRoute
});
const AdminBotsRoute = Route$2g.update({
  id: "/bots",
  path: "/bots",
  getParentRoute: () => AdminRoute
});
const AdminBrandingCheckRoute = Route$2f.update({
  id: "/branding-check",
  path: "/branding-check",
  getParentRoute: () => AdminRoute
});
const AdminCacheRoute = Route$2e.update({
  id: "/cache",
  path: "/cache",
  getParentRoute: () => AdminRoute
});
const AdminCallsRoute = Route$2d.update({
  id: "/calls",
  path: "/calls",
  getParentRoute: () => AdminRoute
});
const AdminChatThemesRoute = Route$2c.update({
  id: "/chat-themes",
  path: "/chat-themes",
  getParentRoute: () => AdminRoute
});
const AdminChatroomsRoute = Route$2b.update({
  id: "/chatrooms",
  path: "/chatrooms",
  getParentRoute: () => AdminRoute
});
const AdminCommunityReportsRoute = Route$2a.update({
  id: "/community-reports",
  path: "/community-reports",
  getParentRoute: () => AdminRoute
});
const AdminCommunityVerificationRoute = Route$29.update({
  id: "/community-verification",
  path: "/community-verification",
  getParentRoute: () => AdminRoute
});
const AdminCompetitionAnalyticsRoute = Route$28.update({
  id: "/competition-analytics",
  path: "/competition-analytics",
  getParentRoute: () => AdminRoute
});
const AdminCompetitionCategoriesRoute = Route$27.update({
  id: "/competition-categories",
  path: "/competition-categories",
  getParentRoute: () => AdminRoute
});
const AdminCompetitionsRoute = Route$26.update({
  id: "/competitions",
  path: "/competitions",
  getParentRoute: () => AdminRoute
});
const AdminCompetitionsFeedRoute = Route$25.update({
  id: "/competitions-feed",
  path: "/competitions-feed",
  getParentRoute: () => AdminRoute
});
const AdminConfessionsRoute = Route$24.update({
  id: "/confessions",
  path: "/confessions",
  getParentRoute: () => AdminRoute
});
const AdminDemoRoute = Route$23.update({
  id: "/demo",
  path: "/demo",
  getParentRoute: () => AdminRoute
});
const AdminDiscoveryWidgetsRoute = Route$22.update({
  id: "/discovery-widgets",
  path: "/discovery-widgets",
  getParentRoute: () => AdminRoute
});
const AdminDjRoute = Route$21.update({
  id: "/dj",
  path: "/dj",
  getParentRoute: () => AdminRoute
});
const AdminDmWallpapersRoute = Route$20.update({
  id: "/dm-wallpapers",
  path: "/dm-wallpapers",
  getParentRoute: () => AdminRoute
});
const AdminEconomyRoute = Route$1$.update({
  id: "/economy",
  path: "/economy",
  getParentRoute: () => AdminRoute
});
const AdminEmailRoute = Route$1_.update({
  id: "/email",
  path: "/email",
  getParentRoute: () => AdminRoute
});
const AdminErrorLogsRoute = Route$1Z.update({
  id: "/error-logs",
  path: "/error-logs",
  getParentRoute: () => AdminRoute
});
const AdminExportRoute = Route$1Y.update({
  id: "/export",
  path: "/export",
  getParentRoute: () => AdminRoute
});
const AdminFeedModerationRoute = Route$1X.update({
  id: "/feed-moderation",
  path: "/feed-moderation",
  getParentRoute: () => AdminRoute
});
const AdminFeedThemesRoute = Route$1W.update({
  id: "/feed-themes",
  path: "/feed-themes",
  getParentRoute: () => AdminRoute
});
const AdminFeedbackRoute = Route$1V.update({
  id: "/feedback",
  path: "/feedback",
  getParentRoute: () => AdminRoute
});
const AdminFeedbotRoute = Route$1U.update({
  id: "/feedbot",
  path: "/feedbot",
  getParentRoute: () => AdminRoute
});
const AdminFiltersRoute = Route$1T.update({
  id: "/filters",
  path: "/filters",
  getParentRoute: () => AdminRoute
});
const AdminGamesRoute = Route$1S.update({
  id: "/games",
  path: "/games",
  getParentRoute: () => AdminRoute
});
const AdminGamificationRoute = Route$1R.update({
  id: "/gamification",
  path: "/gamification",
  getParentRoute: () => AdminRoute
});
const AdminGeneralRoute = Route$1Q.update({
  id: "/general",
  path: "/general",
  getParentRoute: () => AdminRoute
});
const AdminHeroPageRoute = Route$1P.update({
  id: "/hero-page",
  path: "/hero-page",
  getParentRoute: () => AdminRoute
});
const AdminHomepageRoute = Route$1O.update({
  id: "/homepage",
  path: "/homepage",
  getParentRoute: () => AdminRoute
});
const AdminInternalLinkingRoute = Route$1N.update({
  id: "/internal-linking",
  path: "/internal-linking",
  getParentRoute: () => AdminRoute
});
const AdminLandingRoute = Route$1M.update({
  id: "/landing",
  path: "/landing",
  getParentRoute: () => AdminRoute
});
const AdminLanguagesRoute = Route$1L.update({
  id: "/languages",
  path: "/languages",
  getParentRoute: () => AdminRoute
});
const AdminLicensesRoute = Route$1K.update({
  id: "/licenses",
  path: "/licenses",
  getParentRoute: () => AdminRoute
});
const AdminMaintenanceRoute = Route$1J.update({
  id: "/maintenance",
  path: "/maintenance",
  getParentRoute: () => AdminRoute
});
const AdminMediaApisRoute = Route$1I.update({
  id: "/media-apis",
  path: "/media-apis",
  getParentRoute: () => AdminRoute
});
const AdminMehfilRoute = Route$1H.update({
  id: "/mehfil",
  path: "/mehfil",
  getParentRoute: () => AdminRoute
});
const AdminModerationRoute = Route$1G.update({
  id: "/moderation",
  path: "/moderation",
  getParentRoute: () => AdminRoute
});
const AdminModulesRoute = Route$1F.update({
  id: "/modules",
  path: "/modules",
  getParentRoute: () => AdminRoute
});
const AdminPagesRoute = Route$1E.update({
  id: "/pages",
  path: "/pages",
  getParentRoute: () => AdminRoute
});
const AdminPerformanceRoute = Route$1D.update({
  id: "/performance",
  path: "/performance",
  getParentRoute: () => AdminRoute
});
const AdminPollWidgetRoute = Route$1C.update({
  id: "/poll-widget",
  path: "/poll-widget",
  getParentRoute: () => AdminRoute
});
const AdminPopupsRoute = Route$1B.update({
  id: "/popups",
  path: "/popups",
  getParentRoute: () => AdminRoute
});
const AdminPremiumSlugsRoute = Route$1A.update({
  id: "/premium-slugs",
  path: "/premium-slugs",
  getParentRoute: () => AdminRoute
});
const AdminProgressionRoute = Route$1z.update({
  id: "/progression",
  path: "/progression",
  getParentRoute: () => AdminRoute
});
const AdminRealtimeRoute = Route$1y.update({
  id: "/realtime",
  path: "/realtime",
  getParentRoute: () => AdminRoute
});
const AdminReferralsRoute = Route$1x.update({
  id: "/referrals",
  path: "/referrals",
  getParentRoute: () => AdminRoute
});
const AdminReportsRoute = Route$1w.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AdminRoute
});
const AdminRetentionRoute = Route$1v.update({
  id: "/retention",
  path: "/retention",
  getParentRoute: () => AdminRoute
});
const AdminRolesRoute = Route$1u.update({
  id: "/roles",
  path: "/roles",
  getParentRoute: () => AdminRoute
});
const AdminSafetyRoute = Route$1t.update({
  id: "/safety",
  path: "/safety",
  getParentRoute: () => AdminRoute
});
const AdminSearchRoute = Route$1s.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => AdminRoute
});
const AdminSecurityRoute = Route$1r.update({
  id: "/security",
  path: "/security",
  getParentRoute: () => AdminRoute
});
const AdminSeoRoute = Route$1q.update({
  id: "/seo",
  path: "/seo",
  getParentRoute: () => AdminRoute
});
const AdminSetupWizardRoute = Route$1p.update({
  id: "/setup-wizard",
  path: "/setup-wizard",
  getParentRoute: () => AdminRoute
});
const AdminSignupAccessRoute = Route$1o.update({
  id: "/signup-access",
  path: "/signup-access",
  getParentRoute: () => AdminRoute
});
const AdminSocialFeedRoute = Route$1n.update({
  id: "/social-feed",
  path: "/social-feed",
  getParentRoute: () => AdminRoute
});
const AdminSocialLayoutRoute = Route$1m.update({
  id: "/social-layout",
  path: "/social-layout",
  getParentRoute: () => AdminRoute
});
const AdminStaffPermissionsRoute = Route$1l.update({
  id: "/staff-permissions",
  path: "/staff-permissions",
  getParentRoute: () => AdminRoute
});
const AdminStickersRoute = Route$1k.update({
  id: "/stickers",
  path: "/stickers",
  getParentRoute: () => AdminRoute
});
const AdminSubscriptionsRoute = Route$1j.update({
  id: "/subscriptions",
  path: "/subscriptions",
  getParentRoute: () => AdminRoute
});
const AdminSystemRoute = Route$1i.update({
  id: "/system",
  path: "/system",
  getParentRoute: () => AdminRoute
});
const AdminTrustSafetyRoute = Route$1h.update({
  id: "/trust-safety",
  path: "/trust-safety",
  getParentRoute: () => AdminRoute
});
const AdminUpcomingRoute = Route$1g.update({
  id: "/upcoming",
  path: "/upcoming",
  getParentRoute: () => AdminRoute
});
const AdminUpdatesRoute = Route$1f.update({
  id: "/updates",
  path: "/updates",
  getParentRoute: () => AdminRoute
});
const AdminUsersRoute = Route$1e.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AdminRoute
});
const AdminVoiceNotesRoute = Route$1d.update({
  id: "/voice-notes",
  path: "/voice-notes",
  getParentRoute: () => AdminRoute
});
const AdminWalletRoute = Route$1c.update({
  id: "/wallet",
  path: "/wallet",
  getParentRoute: () => AdminRoute
});
const AdminWalletAnalyticsRoute = Route$1b.update({
  id: "/wallet-analytics",
  path: "/wallet-analytics",
  getParentRoute: () => AdminRoute
});
const AdminWalletRulesRoute = Route$1a.update({
  id: "/wallet-rules",
  path: "/wallet-rules",
  getParentRoute: () => AdminRoute
});
const BroadcasterIndexRoute = Route$19.update({
  id: "/",
  path: "/",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterAnalyticsRoute = Route$18.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterAnnouncementsRoute = Route$17.update({
  id: "/announcements",
  path: "/announcements",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterMicRoute = Route$16.update({
  id: "/mic",
  path: "/mic",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterQueueRoute = Route$15.update({
  id: "/queue",
  path: "/queue",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterScheduleRoute = Route$14.update({
  id: "/schedule",
  path: "/schedule",
  getParentRoute: () => BroadcasterRoute
});
const BroadcasterWidgetsRoute = Route$13.update({
  id: "/widgets",
  path: "/widgets",
  getParentRoute: () => BroadcasterRoute
});
const CommunitySlugRoute = Route$12.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => CommunityRoute
});
const CompetitionsIndexRoute = Route$11.update({
  id: "/",
  path: "/",
  getParentRoute: () => CompetitionsRoute
});
const CompetitionsSlugRoute = Route$10.update({
  id: "/$slug",
  path: "/$slug",
  getParentRoute: () => CompetitionsRoute
});
const CompetitionsHallOfFameRoute = Route$$.update({
  id: "/hall-of-fame",
  path: "/hall-of-fame",
  getParentRoute: () => CompetitionsRoute
});
const CompetitionsLeaderboardRoute = Route$_.update({
  id: "/leaderboard",
  path: "/leaderboard",
  getParentRoute: () => CompetitionsRoute
});
const FeedIndexRoute = Route$Z.update({
  id: "/feed/",
  path: "/feed/",
  getParentRoute: () => Route$38
});
const FeedSlugRoute = Route$Y.update({
  id: "/feed/$slug",
  path: "/feed/$slug",
  getParentRoute: () => Route$38
});
const FeedbackIndexRoute = Route$X.update({
  id: "/feedback/",
  path: "/feedback/",
  getParentRoute: () => Route$38
});
const FeedbackIdRoute = Route$W.update({
  id: "/feedback/$id",
  path: "/feedback/$id",
  getParentRoute: () => Route$38
});
const GamesLudoRoute = Route$V.update({
  id: "/ludo",
  path: "/ludo",
  getParentRoute: () => GamesRoute
});
const InviteCodeRoute = Route$U.update({
  id: "/invite/$code",
  path: "/invite/$code",
  getParentRoute: () => Route$38
});
const MehfilIndexRoute = Route$T.update({
  id: "/mehfil/",
  path: "/mehfil/",
  getParentRoute: () => Route$38
});
const MehfilSlugRoute = Route$S.update({
  id: "/mehfil/$slug",
  path: "/mehfil/$slug",
  getParentRoute: () => Route$38
});
const MehfilChallengesRoute = Route$R.update({
  id: "/mehfil/challenges",
  path: "/mehfil/challenges",
  getParentRoute: () => Route$38
});
const MehfilComposeRoute = Route$Q.update({
  id: "/mehfil/compose",
  path: "/mehfil/compose",
  getParentRoute: () => Route$38
});
const MehfilHallOfFameRoute = Route$P.update({
  id: "/mehfil/hall-of-fame",
  path: "/mehfil/hall-of-fame",
  getParentRoute: () => Route$38
});
const MehfilLeaderboardRoute = Route$O.update({
  id: "/mehfil/leaderboard",
  path: "/mehfil/leaderboard",
  getParentRoute: () => Route$38
});
const PSlugRoute = Route$N.update({
  id: "/p/$slug",
  path: "/p/$slug",
  getParentRoute: () => Route$38
});
const PagesEditorIdRoute = Route$M.update({
  id: "/pages-editor/$id",
  path: "/pages-editor/$id",
  getParentRoute: () => Route$38
});
const PoetryIndexRoute = Route$L.update({
  id: "/poetry/",
  path: "/poetry/",
  getParentRoute: () => Route$38
});
const PoetrySlugRoute = Route$K.update({
  id: "/poetry/$slug",
  path: "/poetry/$slug",
  getParentRoute: () => Route$38
});
const PoetryChallengesRoute = Route$J.update({
  id: "/poetry/challenges",
  path: "/poetry/challenges",
  getParentRoute: () => Route$38
});
const PoetryComposeRoute = Route$I.update({
  id: "/poetry/compose",
  path: "/poetry/compose",
  getParentRoute: () => Route$38
});
const PoetryHallOfFameRoute = Route$H.update({
  id: "/poetry/hall-of-fame",
  path: "/poetry/hall-of-fame",
  getParentRoute: () => Route$38
});
const PoetryLeaderboardRoute = Route$G.update({
  id: "/poetry/leaderboard",
  path: "/poetry/leaderboard",
  getParentRoute: () => Route$38
});
const UUsernameRoute = Route$F.update({
  id: "/u/$username",
  path: "/u/$username",
  getParentRoute: () => Route$38
});
const AuthenticatedSettingsPrivacyRoute = Route$E.update({
  id: "/settings/privacy",
  path: "/settings/privacy",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AdminSystemDatabaseRoute = Route$D.update({
  id: "/database",
  path: "/database",
  getParentRoute: () => AdminSystemRoute
});
const AdminSystemJobsRoute = Route$C.update({
  id: "/jobs",
  path: "/jobs",
  getParentRoute: () => AdminSystemRoute
});
const AdminSystemQueueRoute = Route$B.update({
  id: "/queue",
  path: "/queue",
  getParentRoute: () => AdminSystemRoute
});
const AdminSystemStorageRoute = Route$A.update({
  id: "/storage",
  path: "/storage",
  getParentRoute: () => AdminSystemRoute
});
const AdminUpcomingKeyRoute = Route$z.update({
  id: "/$key",
  path: "/$key",
  getParentRoute: () => AdminUpcomingRoute
});
const ApiGamesAchievementRoute = Route$y.update({
  id: "/api/games/achievement",
  path: "/api/games/achievement",
  getParentRoute: () => Route$38
});
const ApiGamesCoinsRoute = Route$x.update({
  id: "/api/games/coins",
  path: "/api/games/coins",
  getParentRoute: () => Route$38
});
const ApiGamesEventRoute = Route$w.update({
  id: "/api/games/event",
  path: "/api/games/event",
  getParentRoute: () => Route$38
});
const ApiGamesFinishRoute = Route$v.update({
  id: "/api/games/finish",
  path: "/api/games/finish",
  getParentRoute: () => Route$38
});
const ApiGamesSaveRoute = Route$u.update({
  id: "/api/games/save",
  path: "/api/games/save",
  getParentRoute: () => Route$38
});
const ApiGamesScoreRoute = Route$t.update({
  id: "/api/games/score",
  path: "/api/games/score",
  getParentRoute: () => Route$38
});
const ApiGamesStartRoute = Route$s.update({
  id: "/api/games/start",
  path: "/api/games/start",
  getParentRoute: () => Route$38
});
const ApiGamesXpRoute = Route$r.update({
  id: "/api/games/xp",
  path: "/api/games/xp",
  getParentRoute: () => Route$38
});
const ApiPublicBackupRetentionRoute = Route$q.update({
  id: "/api/public/backup-retention",
  path: "/api/public/backup-retention",
  getParentRoute: () => Route$38
});
const ApiPublicCommunityBgRoute = Route$p.update({
  id: "/api/public/community-bg",
  path: "/api/public/community-bg",
  getParentRoute: () => Route$38
});
const ApiPublicDemoCleanupRoute = Route$o.update({
  id: "/api/public/demo-cleanup",
  path: "/api/public/demo-cleanup",
  getParentRoute: () => Route$38
});
const ApiPublicFeedbackShowcaseRoute = Route$n.update({
  id: "/api/public/feedback-showcase",
  path: "/api/public/feedback-showcase",
  getParentRoute: () => Route$38
});
const ApiPublicLandingRoute = Route$m.update({
  id: "/api/public/landing",
  path: "/api/public/landing",
  getParentRoute: () => Route$38
});
const CommunitySlugIndexRoute = Route$l.update({
  id: "/",
  path: "/",
  getParentRoute: () => CommunitySlugRoute
});
const CommunitySlugCompetitionsRoute = Route$k.update({
  id: "/competitions",
  path: "/competitions",
  getParentRoute: () => CommunitySlugRoute
});
const CommunitySlugDashboardRoute = Route$j.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => CommunitySlugRoute
});
const CommunitySlugFeedRoute = Route$i.update({
  id: "/feed",
  path: "/feed",
  getParentRoute: () => CommunitySlugRoute
});
const CommunitySlugMembersRoute = Route$h.update({
  id: "/members",
  path: "/members",
  getParentRoute: () => CommunitySlugRoute
});
const CompetitionsSlugMemesRoute = Route$g.update({
  id: "/memes",
  path: "/memes",
  getParentRoute: () => CompetitionsSlugRoute
});
const CompetitionsSlugRecapRoute = Route$f.update({
  id: "/recap",
  path: "/recap",
  getParentRoute: () => CompetitionsSlugRoute
});
const MehfilCategorySlugRoute = Route$e.update({
  id: "/mehfil/category/$slug",
  path: "/mehfil/category/$slug",
  getParentRoute: () => Route$38
});
const PoetryCategorySlugRoute = Route$d.update({
  id: "/poetry/category/$slug",
  path: "/poetry/category/$slug",
  getParentRoute: () => Route$38
});
const ApiPublicHooksFeedbotDispatchRoute = Route$c.update({
  id: "/api/public/hooks/feedbot-dispatch",
  path: "/api/public/hooks/feedbot-dispatch",
  getParentRoute: () => Route$38
});
const ApiPublicHooksFeedbotSummaryRoute = Route$b.update({
  id: "/api/public/hooks/feedbot-summary",
  path: "/api/public/hooks/feedbot-summary",
  getParentRoute: () => Route$38
});
const ApiPublicHooksLicenseRevalidateRoute = Route$a.update({
  id: "/api/public/hooks/license-revalidate",
  path: "/api/public/hooks/license-revalidate",
  getParentRoute: () => Route$38
});
const ApiPublicLicenseActivateRoute = Route$9.update({
  id: "/api/public/license/activate",
  path: "/api/public/license/activate",
  getParentRoute: () => Route$38
});
const ApiPublicLicenseCheckRoute = Route$8.update({
  id: "/api/public/license/check",
  path: "/api/public/license/check",
  getParentRoute: () => Route$38
});
const ApiPublicLicenseDeactivateRoute = Route$7.update({
  id: "/api/public/license/deactivate",
  path: "/api/public/license/deactivate",
  getParentRoute: () => Route$38
});
const ApiPublicLicenseResetRoute = Route$6.update({
  id: "/api/public/license/reset",
  path: "/api/public/license/reset",
  getParentRoute: () => Route$38
});
const ApiPublicLicenseVerifyRoute = Route$5.update({
  id: "/api/public/license/verify",
  path: "/api/public/license/verify",
  getParentRoute: () => Route$38
});
const CommunitySlugChatroomsIndexRoute = Route$4.update({
  id: "/chatrooms/",
  path: "/chatrooms/",
  getParentRoute: () => CommunitySlugRoute
});
const CommunitySlugChatroomsRoomSlugRoute = Route$3.update({
  id: "/chatrooms/$roomSlug",
  path: "/chatrooms/$roomSlug",
  getParentRoute: () => CommunitySlugRoute
});
const CompetitionsSlugFunTypeRoute = Route$2.update({
  id: "/fun/$type",
  path: "/fun/$type",
  getParentRoute: () => CompetitionsSlugRoute
});
const LovableEmailQueueProcessRoute = Route$1.update({
  id: "/lovable/email/queue/process",
  path: "/lovable/email/queue/process",
  getParentRoute: () => Route$38
});
const ApiPublicOgCompetitionSlugRoute = Route.update({
  id: "/api/public/og/competition/$slug",
  path: "/api/public/og/competition/$slug",
  getParentRoute: () => Route$38
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedSettingsPrivacyRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const AdminSystemRouteChildren = {
  AdminSystemDatabaseRoute,
  AdminSystemJobsRoute,
  AdminSystemQueueRoute,
  AdminSystemStorageRoute
};
const AdminSystemRouteWithChildren = AdminSystemRoute._addFileChildren(
  AdminSystemRouteChildren
);
const AdminUpcomingRouteChildren = {
  AdminUpcomingKeyRoute
};
const AdminUpcomingRouteWithChildren = AdminUpcomingRoute._addFileChildren(
  AdminUpcomingRouteChildren
);
const AdminRouteChildren = {
  AdminAbuseProtectionRoute,
  AdminActivityLogsRoute,
  AdminAdPlacementsRoute,
  AdminAdsScriptsRoute,
  AdminAiChatbotsRoute,
  AdminAnalyticsRoute,
  AdminAnnouncementsRoute,
  AdminApiRoute,
  AdminAppearanceRoute,
  AdminAuditLogsRoute,
  AdminAuthBackgroundRoute,
  AdminAutomationRoute,
  AdminBackupRoute,
  AdminBoobubbleRoute,
  AdminBotEventsRoute,
  AdminBotsRoute,
  AdminBrandingCheckRoute,
  AdminCacheRoute,
  AdminCallsRoute,
  AdminChatThemesRoute,
  AdminChatroomsRoute,
  AdminCommunityReportsRoute,
  AdminCommunityVerificationRoute,
  AdminCompetitionAnalyticsRoute,
  AdminCompetitionCategoriesRoute,
  AdminCompetitionsRoute,
  AdminCompetitionsFeedRoute,
  AdminConfessionsRoute,
  AdminDemoRoute,
  AdminDiscoveryWidgetsRoute,
  AdminDjRoute,
  AdminDmWallpapersRoute,
  AdminEconomyRoute,
  AdminEmailRoute,
  AdminErrorLogsRoute,
  AdminExportRoute,
  AdminFeedModerationRoute,
  AdminFeedThemesRoute,
  AdminFeedbackRoute,
  AdminFeedbotRoute,
  AdminFiltersRoute,
  AdminGamesRoute,
  AdminGamificationRoute,
  AdminGeneralRoute,
  AdminHeroPageRoute,
  AdminHomepageRoute,
  AdminInternalLinkingRoute,
  AdminLandingRoute,
  AdminLanguagesRoute,
  AdminLicensesRoute,
  AdminMaintenanceRoute,
  AdminMediaApisRoute,
  AdminMehfilRoute,
  AdminModerationRoute,
  AdminModulesRoute,
  AdminPagesRoute,
  AdminPerformanceRoute,
  AdminPollWidgetRoute,
  AdminPopupsRoute,
  AdminPremiumSlugsRoute,
  AdminProgressionRoute,
  AdminRealtimeRoute,
  AdminReferralsRoute,
  AdminReportsRoute,
  AdminRetentionRoute,
  AdminRolesRoute,
  AdminSafetyRoute,
  AdminSearchRoute,
  AdminSecurityRoute,
  AdminSeoRoute,
  AdminSetupWizardRoute,
  AdminSignupAccessRoute,
  AdminSocialFeedRoute,
  AdminSocialLayoutRoute,
  AdminStaffPermissionsRoute,
  AdminStickersRoute,
  AdminSubscriptionsRoute,
  AdminSystemRoute: AdminSystemRouteWithChildren,
  AdminTrustSafetyRoute,
  AdminUpcomingRoute: AdminUpcomingRouteWithChildren,
  AdminUpdatesRoute,
  AdminUsersRoute,
  AdminVoiceNotesRoute,
  AdminWalletRoute,
  AdminWalletAnalyticsRoute,
  AdminWalletRulesRoute,
  AdminIndexRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const BroadcasterRouteChildren = {
  BroadcasterAnalyticsRoute,
  BroadcasterAnnouncementsRoute,
  BroadcasterMicRoute,
  BroadcasterQueueRoute,
  BroadcasterScheduleRoute,
  BroadcasterWidgetsRoute,
  BroadcasterIndexRoute
};
const BroadcasterRouteWithChildren = BroadcasterRoute._addFileChildren(
  BroadcasterRouteChildren
);
const CommunitySlugRouteChildren = {
  CommunitySlugCompetitionsRoute,
  CommunitySlugDashboardRoute,
  CommunitySlugFeedRoute,
  CommunitySlugMembersRoute,
  CommunitySlugIndexRoute,
  CommunitySlugChatroomsRoomSlugRoute,
  CommunitySlugChatroomsIndexRoute
};
const CommunitySlugRouteWithChildren = CommunitySlugRoute._addFileChildren(
  CommunitySlugRouteChildren
);
const CommunityRouteChildren = {
  CommunitySlugRoute: CommunitySlugRouteWithChildren
};
const CommunityRouteWithChildren = CommunityRoute._addFileChildren(
  CommunityRouteChildren
);
const CompetitionsSlugRouteChildren = {
  CompetitionsSlugMemesRoute,
  CompetitionsSlugRecapRoute,
  CompetitionsSlugFunTypeRoute
};
const CompetitionsSlugRouteWithChildren = CompetitionsSlugRoute._addFileChildren(CompetitionsSlugRouteChildren);
const CompetitionsRouteChildren = {
  CompetitionsSlugRoute: CompetitionsSlugRouteWithChildren,
  CompetitionsHallOfFameRoute,
  CompetitionsLeaderboardRoute,
  CompetitionsIndexRoute
};
const CompetitionsRouteWithChildren = CompetitionsRoute._addFileChildren(
  CompetitionsRouteChildren
);
const GamesRouteChildren = {
  GamesLudoRoute
};
const GamesRouteWithChildren = GamesRoute._addFileChildren(GamesRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  SlugRoute,
  AccountRoute,
  AchievementsRoute,
  AdminRoute: AdminRouteWithChildren,
  BannedRoute,
  BattleHubRoute,
  BroadcasterRoute: BroadcasterRouteWithChildren,
  ChatRoute,
  ChatroomRoute,
  ChatroomsRoute,
  CommunitiesRoute,
  CommunityRoute: CommunityRouteWithChildren,
  CompetitionsRoute: CompetitionsRouteWithChildren,
  ConfessionsRoute,
  DeployRoute,
  FindFriendsRoute,
  GamesRoute: GamesRouteWithChildren,
  GamificationRoute,
  GroupsRoute,
  HallOfFameRoute,
  HeropageRoute,
  InstallerRoute,
  JourneyRoute,
  LeaderboardRoute,
  LoginRoute,
  ManifestDotwebmanifestRoute,
  PagesRoute,
  PricingRoute,
  RadioRoute,
  ReelsRoute,
  ResetPasswordRoute,
  RobotsDottxtRoute,
  SetupWizardRoute,
  SitemapDotxmlRoute,
  TrustRoute,
  WalletRoute,
  WelcomeRoute,
  FeedSlugRoute,
  FeedbackIdRoute,
  InviteCodeRoute,
  MehfilSlugRoute,
  MehfilChallengesRoute,
  MehfilComposeRoute,
  MehfilHallOfFameRoute,
  MehfilLeaderboardRoute,
  PSlugRoute,
  PagesEditorIdRoute,
  PoetrySlugRoute,
  PoetryChallengesRoute,
  PoetryComposeRoute,
  PoetryHallOfFameRoute,
  PoetryLeaderboardRoute,
  UUsernameRoute,
  FeedIndexRoute,
  FeedbackIndexRoute,
  MehfilIndexRoute,
  PoetryIndexRoute,
  ApiGamesAchievementRoute,
  ApiGamesCoinsRoute,
  ApiGamesEventRoute,
  ApiGamesFinishRoute,
  ApiGamesSaveRoute,
  ApiGamesScoreRoute,
  ApiGamesStartRoute,
  ApiGamesXpRoute,
  ApiPublicBackupRetentionRoute,
  ApiPublicCommunityBgRoute,
  ApiPublicDemoCleanupRoute,
  ApiPublicFeedbackShowcaseRoute,
  ApiPublicLandingRoute,
  MehfilCategorySlugRoute,
  PoetryCategorySlugRoute,
  ApiPublicHooksFeedbotDispatchRoute,
  ApiPublicHooksFeedbotSummaryRoute,
  ApiPublicHooksLicenseRevalidateRoute,
  ApiPublicLicenseActivateRoute,
  ApiPublicLicenseCheckRoute,
  ApiPublicLicenseDeactivateRoute,
  ApiPublicLicenseResetRoute,
  ApiPublicLicenseVerifyRoute,
  LovableEmailQueueProcessRoute,
  ApiPublicOgCompetitionSlugRoute
};
const routeTree = Route$38._addFileChildren(rootRouteChildren)._addFileTypes();
function logQueryError(error, queryKey, meta) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error("Query failed", err, {
    source: "react-query",
    queryKey,
    ...meta
  });
}
function createMonitoredQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        logQueryError(error, query.queryKey, {
          endpoint: query.meta?.endpoint,
          statusCode: error?.status
        });
      }
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        logQueryError(error, mutation.options.mutationKey ?? ["mutation"], {
          source: "react-query-mutation"
        });
      }
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          const status = error?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return true;
        }
      }
    }
  });
}
const getRouter = () => {
  const queryClient = createMonitoredQueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  getOwnerStatus as $,
  listMembers as A,
  Button as B,
  getMyCoins as C,
  Dialog as D,
  TRIO_JOIN_COST as E,
  rejectInvite as F,
  acceptInvite as G,
  closeRoom as H,
  inviteByUsername as I,
  createRoom as J,
  BroadcasterTicker as K,
  useSoundPrefs as L,
  setSoundPref as M,
  postsSafe as N,
  isNavigableSlug as O,
  BADGE_MAP as P,
  BADGES as Q,
  RouteErrorBoundary as R,
  TIER_COLOR as S,
  TRIO_CREATE_COST as T,
  useHomePageMode as U,
  rtLog as V,
  AuthDialogs as W,
  buttonVariants as X,
  getAllSettings as Y,
  Route$36 as Z,
  getMyRoles as _,
  useAuth as a,
  adminDecideVerificationRequest as a$,
  Input as a0,
  readStoredBan as a1,
  clearStoredBan as a2,
  listCompetitionsEnriched as a3,
  listCategories as a4,
  listMyFollowedCompetitions as a5,
  shareCompetition as a6,
  listRecentCompetitionVoters as a7,
  getDiscoveryStats as a8,
  listPublicCommunities as a9,
  uploadCommunityAsset as aA,
  createOwner as aB,
  runInstallationHealthCheck as aC,
  LANDING_DEFAULTS as aD,
  getMehfilDiscovery as aE,
  updateSetting as aF,
  AdminToggle as aG,
  getAnalytics as aH,
  getRealtimeOverview as aI,
  AdminPageHeader as aJ,
  useAdminSetting as aK,
  ComingSoonPanel as aL,
  Switch as aM,
  getTopUsers as aN,
  updateAnnouncementsConfig as aO,
  canEditAnnouncements as aP,
  useAccent as aQ,
  ACCENTS as aR,
  listAuditLogs as aS,
  AUTH_BG_DEFAULTS as aT,
  AUTH_BG_SETTINGS_KEY as aU,
  DEFAULT_BOT_EVENTS_CONFIG as aV,
  useBrand as aW,
  BRAND_DEFAULTS as aX,
  listGames as aY,
  adminCommunityReport as aZ,
  adminListVerificationRequests as a_,
  searchCommunities as aa,
  DialogTrigger as ab,
  Label as ac,
  Textarea as ad,
  Card as ae,
  CardContent as af,
  CardHeader as ag,
  CardTitle as ah,
  CardDescription as ai,
  ComingSoon as aj,
  Route$2O as ak,
  listHallOfFame as al,
  getMehfilHallOfFame as am,
  HERO_DEFAULTS as an,
  HERO_SETTINGS_KEY as ao,
  mergeHeroConfig as ap,
  verifyLicense as aq,
  activateLicense as ar,
  AuthScreen as as,
  usePlans as at,
  useMySubscription as au,
  useSubscriptionMode as av,
  DialogFooter as aw,
  requestSubscription as ax,
  PasswordStrength as ay,
  saveCommunitySetup as az,
  useServerFn as b,
  listPlans as b$,
  adminSaveCategory as b0,
  adminDeleteCategory as b1,
  adminListAllCompetitions as b2,
  adminSaveCompetition as b3,
  adminDeleteCompetition as b4,
  adminFinalizeWinners as b5,
  adminBulkSetEntryMode as b6,
  adminReorderCompetitors as b7,
  adminDeleteCompetitor as b8,
  adminSetCompetitorFlags as b9,
  adminExportLicensesCsv as bA,
  adminGenerateSelfLicense as bB,
  adminImportLicense as bC,
  adminGetLicense as bD,
  adminSuspendLicense as bE,
  adminRevokeLicense as bF,
  adminActivateLicense as bG,
  adminResetActivation as bH,
  adminExtendExpiry as bI,
  adminChangeDomain as bJ,
  adminDeleteLicense as bK,
  listPages as bL,
  listRedirects as bM,
  deletePage as bN,
  exportPages as bO,
  importPages as bP,
  saveRedirect as bQ,
  deleteRedirect as bR,
  adminListPremiumSlugRequests as bS,
  reviewPremiumSlugRequest as bT,
  getSeoManagerState as bU,
  syncSeoRoutes as bV,
  upsertSeoGlobal as bW,
  bulkSeoAction as bX,
  upsertSeoPage as bY,
  aiGenerateSeoField as bZ,
  SIGNUP_ACCESS_DEFAULTS as b_,
  adminSaveCompetitor as ba,
  getCompetition as bb,
  adminSetParticipantStatus as bc,
  adminListCompetitorVotes as bd,
  adminDeleteCompetitorVote as be,
  adminResetCompetitionVotes as bf,
  getCompetitionAnalytics as bg,
  adminSetManualWinners as bh,
  adminSearchProfiles as bi,
  listModerationQueue as bj,
  setContentModerationStatus as bk,
  warnUser as bl,
  banPosting as bm,
  scanContentImages as bn,
  scanContentText as bo,
  CONTENT_TYPES as bp,
  listPostingBans as bq,
  restorePosting as br,
  listModerationLogs as bs,
  getModerationSettings as bt,
  HOME_PAGE_KEY as bu,
  HomepagePage as bv,
  HeroPageAdmin as bw,
  LANGUAGES as bx,
  adminListLicenses as by,
  adminLicenseStats as bz,
  DialogContent as c,
  getMehfilRelated as c$,
  adminDeletePlan as c0,
  adminListPayments as c1,
  adminApprovePayment as c2,
  adminRejectPayment as c3,
  getSubscriptionMode as c4,
  adminSetSubscriptionMode as c5,
  adminSubscriptionStats as c6,
  adminUpsertPlan as c7,
  listUsersWithRoles as c8,
  setUserRole as c9,
  joinCompetition as cA,
  leaveCompetition as cB,
  incrementCompetitionViews as cC,
  listRelatedCompetitions as cD,
  SITE as cE,
  getLeaderboard as cF,
  getLanguage as cG,
  prefetchLanguage as cH,
  setLanguage as cI,
  useFeedPrefs as cJ,
  ChatErrorBoundary as cK,
  resolveDmTargetId as cL,
  reportContent as cM,
  searchActiveCompetitions as cN,
  listCompetitionNominees as cO,
  Route$Y as cP,
  Route$W as cQ,
  Route$V as cR,
  Route$U as cS,
  getInviteLanding as cT,
  Route$M as cU,
  getPage as cV,
  savePage as cW,
  slugify as cX,
  listMehfilCategories as cY,
  Route$K as cZ,
  getPoemBySlug as c_,
  banUser as ca,
  unbanUser as cb,
  deleteUser as cc,
  updateUserUsername as cd,
  adminResetUserPassword as ce,
  adminGrantCoins as cf,
  Route$12 as cg,
  getMyMembership as ch,
  leaveCommunity as ci,
  joinCommunity as cj,
  castVote as ck,
  followCompetition as cl,
  unfollowCompetition as cm,
  getMyCompetitionFollow as cn,
  getCompetitionFollowerCount as co,
  voteForCompetitor as cp,
  adminResetCompetitorVotes as cq,
  listCompetitionMemes as cr,
  FUN_CATEGORIES as cs,
  FUN_META as ct,
  BADGE_META as cu,
  loadFunZoneSummary as cv,
  Route$10 as cw,
  getCompetitionBySlug as cx,
  getMyVote as cy,
  getMyCompetitorVote as cz,
  DialogHeader as d,
  getPoemNeighbors as d0,
  recordPoemRead as d1,
  togglePoemBookmark as d2,
  publishPoem as d3,
  getMehfilLeaderboard as d4,
  Route$F as d5,
  Route$z as d6,
  Route$j as d7,
  updateCommunityBranding as d8,
  updateCommunityPrivacy as d9,
  Route$2 as dA,
  useUsernameCheck as dB,
  getUserCompetitionShowcase as dC,
  getMehfilProfileSection as dD,
  parseDmChannel as dE,
  isUuid as dF,
  competitionMemes as dG,
  router as dH,
  updateCommunityVisibility as da,
  listCommunityMembers as db,
  setMemberState as dc,
  removeMember as dd,
  listJoinRequests as de,
  decideJoinRequest as df,
  listInvites as dg,
  createInvite as dh,
  revokeInvite as di,
  getCommunityAnalytics as dj,
  getMyVerificationRequest as dk,
  submitVerificationRequest as dl,
  listPremiumSlugRequests as dm,
  requestPremiumSlug as dn,
  cancelPremiumSlugRequest as dp,
  archiveCommunity as dq,
  restoreCommunity as dr,
  listCommunityMembersPublic as ds,
  listCommunityMembersAuthed as dt,
  Route$g as du,
  Route$f as dv,
  Route$d as dw,
  cap as dx,
  listPoemsByCategory as dy,
  Route$3 as dz,
  DialogTitle as e,
  DialogDescription as f,
  useChat as g,
  useAuthGate as h,
  useBrandAsset as i,
  BrandMark as j,
  BrandText as k,
  listCompetitions as l,
  cn as m,
  normalizeConfig as n,
  computeEventState as o,
  BOT_EVENT_META as p,
  isRemoteDmChannel as q,
  useIgnore as r,
  setBotEventsConfig as s,
  getGame as t,
  useAppSettings as u,
  useOptionalChat as v,
  useRemoteProfiles as w,
  listMyRooms as x,
  listMyMemberships as y,
  trioChannel as z
};
