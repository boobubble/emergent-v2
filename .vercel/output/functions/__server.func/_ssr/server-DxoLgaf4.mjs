import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse, c as clearSession$1, d as deleteCookie$1, p as parseCookies, g as getRequestHost$1, a as getRequestIP$1, b as getRequestProtocol$1, e as getRequestURL, f as getSession$1, h as getValidatedQuery$1, s as sealSession$1, i as setCookie$1, j as sanitizeStatusCode, k as sanitizeStatusMessage, u as unsealSession$1, l as updateSession$1, m as useSession$1 } from "../_libs/h3-v2.mjs";
import { y as defineHandlerCallback, z as resolveManifestAssetLink, u as resolveManifestCssLink, k as rootRouteId, A as getNormalizedURL, C as getOrigin, D as normalizeSsrResponse, E as attachRouterServerSsrUtils, F as createSerializationAdapter, G as createRawStreamRPCPlugin, i as invariant, g as isNotFound, m as isRedirect, H as isResolvedRedirect, I as replaceSsrResponse, J as mergeHeaders, K as executeRewriteInput, L as stripSsrResponseBody, M as defaultSerovalPlugins, N as makeSerovalPlugin, s as getScriptPreloadAttrs, O as getStylesheetHref, P as isSsrResponse, Q as parseRedirect } from "../_libs/tanstack__router-core.mjs";
import { c as cu, O as Ou, l as lu } from "../_libs/seroval.mjs";
import { c as createMemoryHistory } from "../_libs/tanstack__history.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { r as renderRouterToStream, R as RouterProvider } from "../_libs/tanstack__react-router.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getRequestHeaders() {
  return getH3Event().req.headers;
}
function getRequestHeader(name) {
  return getRequestHeaders().get(name) || void 0;
}
function getRequestIP(opts) {
  return getRequestIP$1(getH3Event(), opts);
}
function getRequestHost(opts) {
  return getRequestHost$1(getH3Event(), opts);
}
function getRequestUrl(opts) {
  return getRequestURL(getH3Event(), opts);
}
function getRequestProtocol(opts) {
  return getRequestProtocol$1(getH3Event(), opts);
}
function setResponseHeaders(headers) {
  const event = getH3Event();
  for (const [name, value] of Object.entries(headers)) event.res.headers.set(name, value);
}
function getResponseHeaders() {
  return getH3Event().res.headers;
}
function getResponseHeader(name) {
  return getH3Event().res.headers.get(name) || void 0;
}
function setResponseHeader(name, value) {
  const event = getH3Event();
  if (Array.isArray(value)) {
    event.res.headers.delete(name);
    for (const valueItem of value) event.res.headers.append(name, valueItem);
  } else event.res.headers.set(name, value);
}
function removeResponseHeader(name) {
  getH3Event().res.headers.delete(name);
}
function clearResponseHeaders(headerNames) {
  const event = getH3Event();
  if (headerNames && headerNames.length > 0) for (const name of headerNames) event.res.headers.delete(name);
  else for (const name of event.res.headers.keys()) event.res.headers.delete(name);
}
function getResponseStatus() {
  return getH3Event().res.status || 200;
}
function setResponseStatus(code, text) {
  const event = getH3Event();
  if (code) event.res.status = sanitizeStatusCode(code, event.res.status);
  if (text) event.res.statusText = sanitizeStatusMessage(text);
}
function getCookies() {
  const cookies = parseCookies(getH3Event());
  const definedCookies = /* @__PURE__ */ Object.create(null);
  for (const [name, value] of Object.entries(cookies)) if (value !== void 0) definedCookies[name] = value;
  return definedCookies;
}
function getCookie(name) {
  return getCookies()[name];
}
function setCookie(name, value, options) {
  setCookie$1(getH3Event(), name, value, options);
}
function deleteCookie(name, options) {
  deleteCookie$1(getH3Event(), name, options);
}
function getDefaultSessionConfig(config) {
  return {
    name: "start",
    ...config
  };
}
function useSession(config) {
  return useSession$1(getH3Event(), getDefaultSessionConfig(config));
}
function getSession(config) {
  return getSession$1(getH3Event(), getDefaultSessionConfig(config));
}
function updateSession(config, update) {
  return updateSession$1(getH3Event(), getDefaultSessionConfig(config), update);
}
function sealSession(config) {
  return sealSession$1(getH3Event(), getDefaultSessionConfig(config));
}
function unsealSession(config, sealed) {
  return unsealSession$1(getH3Event(), getDefaultSessionConfig(config), sealed);
}
function clearSession(config) {
  return clearSession$1(getH3Event(), {
    name: "start",
    ...config
  });
}
function getResponse() {
  return getH3Event().res;
}
function getValidatedQuery(schema) {
  return getValidatedQuery$1(getH3Event(), schema);
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("../_tanstack-start-manifest_v-D7KIeci0.mjs");
  const startManifest = tsrStartManifest();
  let routes = startManifest.routes;
  routes[rootRouteId];
  const manifestRoutes = {};
  for (const k in routes) {
    const v = routes[k];
    const result = {};
    if (v.preloads && v.preloads.length > 0) result.preloads = v.preloads;
    if (v.scripts && v.scripts.length > 0) result.scripts = v.scripts;
    if (v.css?.length) result.css = v.css;
    if (result.preloads || result.scripts || result.css) manifestRoutes[k] = result;
  }
  return {
    ...startManifest.scriptFormat ? { scriptFormat: startManifest.scriptFormat } : {},
    ...startManifest.inlineCss ? { inlineCss: startManifest.inlineCss } : {},
    routes: manifestRoutes
  };
}
const manifest = {
  "00aeffd9dcff5c4fcfdcb8940fe361c1b54780fce04014b8ddf8aad9052a708f": {
    functionName: "addTrustViolation_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "00b65b5d311059736d517194b4abedc1ff57d9f4ba3c9b905fe070fa33488561": {
    functionName: "getLinkAnalytics_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "00c6d5fd79c075b80da9b03a9de5dd016390bd03a489a440da08a0b0cfc1de84": {
    functionName: "listRoomMods_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "0102340eb61a8d1ae963d01d49c56af8d197df4b2e9cacae375d9d388bde78ea": {
    functionName: "adminRejectPayment_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "0261bc80b0a2f1c160f5b63ac0c1f66bb1fd5f5598fefadc0149531607a3c8be": {
    functionName: "updateFeedModerationSettings_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "0267ca9731725b636bb774a5ef66d4d793aa70dee456dee97579e15c52d59077": {
    functionName: "getCommunityBySlug_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "02a5e2ffe0108c176ade114d14ad9ce21b7c1a3e7ad7156855e6620f49ba8305": {
    functionName: "triggerWelcomeIfNeeded_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "02e54c13b87079a9f9f580cd64693c5fb5da801d979c5d0b941962400a36d2d7": {
    functionName: "triggerRewardDigestIfNeeded_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "045552475ef6719f2b1d7e41344a92c22f5e038bead8523d0f9fa52a1e8a837e": {
    functionName: "getPoemNeighbors_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "0539b94cb726201d4ae2fa410f04fb9e3bfff2e2c497f915805328b663e2f28c": {
    functionName: "adminDeleteCompetitor_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "05660e96dfa73e79df62127329b098e70d923ba601415cc7b1179c2fc053f705": {
    functionName: "saveRedirect_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "057107a16154625217fb17f4a99066fb28501f65e826827aacff4360cfe96d0d": {
    functionName: "getPublicSeoGlobal_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "05cde11348cae24dcffd32b86e4ac07f9cb1a0a2cf1df639cd309c6288792474": {
    functionName: "removeMember_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "06688e981e347ab9968209b0aae4076a21dceb03f6c24ee56703a5ec7ba910cb": {
    functionName: "getBackupRetention_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "06ade90c2b38d0e75f84b7eb7f6730fbe078a266c1f53b87f644c12240dd7025": {
    functionName: "adminExtendExpiry_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "073367386c1d4a439ae34f938237958435be02fc7fbdbf5d3dd307bb495b0887": {
    functionName: "checkAi_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "0868f3d3694bd41196d19b2ed4b9a94f671e042f14d9f2b1aab7c7cfd1ffd54e": {
    functionName: "archiveCommunity_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "08b0271d303155eee7c45c27e9dcbfe353c92c2307fb5a234e3148ba8e96031d": {
    functionName: "getMyCompetitionFollow_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "08fea8aded1dfa5bb9a8d8bfa200f8af31609388a5b089ce8f6e23ccff90a7b9": {
    functionName: "cancelMySubscription_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "099a6e1d76fdb6ee7128d8ca5d39c57c9d0ed2cc5a193a1a473ec14a429cb018": {
    functionName: "addSafetyKeyword_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "09df6d9e3460e87d32a7c5be54b06e20eb0048ac5e6db0f43a9285c821b08fad": {
    functionName: "adminListVerificationRequests_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "09fb21adb033b1322c1a68aaa9d50d1635d097957446f0de8ec1a0bd2b662731": {
    functionName: "listHallOfFame_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "0a8dd47bdefe52f0d2a14e538afcf1438f38f026249b39309a493bd8d805d3f7": {
    functionName: "getFriendBirthdaysToday_createServerFn_handler",
    importer: () => import("./birthdays.functions-DUED_lsP.mjs")
  },
  "0b408d55c934ffdaada6af19b5f80aa2f3f34c5e3d0ed792d18216f399f3d468": {
    functionName: "listRelatedCompetitions_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "0b8e4e93a0ecb1d26c9756db6bd5a1fc799948ab4d0ced069fbd69d893546487": {
    functionName: "getMehfilProfileSection_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "0bc34845f1b49a364fd2724f24209f6fff281858ba8360bc78373be658e63d24": {
    functionName: "listJoinRequests_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "0c68ae060ba9299292d3dcd4693329d8beb7e984f68fc794e3181efc262845d2": {
    functionName: "getMyMembership_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "0c998845b4720371824d3a1c5d3d1019f5653a6dc6dad1a4ee303b916a890d0b": {
    functionName: "recordPoemRead_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "0dd5493d7ebe1b7214b35ee40b546933b7f0bd15ce2a71dcf3fe1789d4a0901c": {
    functionName: "adminApprovePayment_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "0eadbda825da8694f4e3dfe0fbd64804a4374283a893db86373ee05ec0037f7b": {
    functionName: "aiChatbotReply_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "10674d1c7381785e93e0f198693865d6e3ae451ae06113e790ae69223a7387c1": {
    functionName: "getMehfilRelated_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "106bbe51bcce4bd43f280dd78c5b6e755dc564fec4bbe8e860e308a693ce9da3": {
    functionName: "banPosting_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "10837395931819b4968c5c177b7389eea9e6ef6501fea90c15527f7eeb6b79d5": {
    functionName: "listCategories_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "10be1b4c1eb135c728b7f4f9185f4fe37b16e37363eeb2e52de6b97cf93482fe": {
    functionName: "adminSaveCompetitor_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "10c9d440792118c2a76226f18a20bd067aec0eecdb6a7f8a6d9aee4555d82332": {
    functionName: "earnFeedPost_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "10dbeb1283fb76c8e0ca8d3551fcc62033e9c26ba38d60921827b0deb613ecf6": {
    functionName: "generatePublicRobots_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "12043de90bd0885d7df95c87b43c38e5ed14b9a799132b9fed8cf5e9a521f6f1": {
    functionName: "getSystemCompatibility_createServerFn_handler",
    importer: () => import("./system-compatibility.functions-Wqc4HqCX.mjs")
  },
  "13197cecf7a93908ab279f0a64c9024df2cd1af5fe5a7827673507625fbb883c": {
    functionName: "listReports_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "144e62f99e7f7056d280dd69f6d06a2069ce67b247347e85a2558a151ead5dd6": {
    functionName: "getMyCreatorRank_createServerFn_handler",
    importer: () => import("./creator.functions-_VtwakPG.mjs")
  },
  "16341306f66e3e93d865e8edbb54b5361dda1dcb66fc2e0e8c72565e22634488": {
    functionName: "getAnalytics_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "172b73de3b53195253ac8d9e3870c854a2b4839dace6eb714f3dc40c95a5a20b": {
    functionName: "listFeedPostingBans_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "176ac30c0df6f520c62a6dc9d60ddda7ae05872401a08ca4d514db8f43d087ee": {
    functionName: "listModerationQueue_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "179bd230da879d6587c60996b1d871152629802a9a7932d6f3f4e4da382a1eb4": {
    functionName: "adminGenerateSelfLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "17f507d159b469cf52756054746f66281437c049165210f88e7d181e58593b02": {
    functionName: "deleteLinkTarget_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "194adec9b1239c58814c040ae60f776ec88424888faf3253db2e5c694665a834": {
    functionName: "listMutes_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "1c56176887768d9891b3728da62aa71439be01e6c8ae1036a88a835c12be3175": {
    functionName: "deleteGuestAccount_createServerFn_handler",
    importer: () => import("./auth.functions-BXwD5dVA.mjs")
  },
  "1d89ac9e596e2fc7d46f74c289672ce4eaa4d7b305eecc14807aeaa45dfd4fe9": {
    functionName: "unfollowWriter_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "1dcb9ef304a2ceb611c94eb15fd3ebfd50586f5c95ef7f182e5020e66cc4e36c": {
    functionName: "listChatroomsForFeedbot_createServerFn_handler",
    importer: () => import("./feedbot.functions-CilCnZrQ.mjs")
  },
  "1e28a63b1262f5d86f88253495609604812295137987cd1fd4afdae6cf3378d7": {
    functionName: "clearQueue_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "1e3f3126c8e7604497c697466680165846d4ecfd7babeebd103c7d61b24c3873": {
    functionName: "deleteWordFilter_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "1e9263a94064e968274b67a5b7a58e16d30d15feea34c6fb1c57da7bae57c0da": {
    functionName: "getMehfilQuickPanel_createServerFn_handler",
    importer: () => import("./mehfil-search.functions-BU0Ji6u3.mjs")
  },
  "20a05b482935b0079c981eed1648f4eac430402479a242003d4610800cc8a0f0": {
    functionName: "checkLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "20ce7016302de886fab72937295f2b261c82e5786ab6858aa65211a9e0c37947": {
    functionName: "deleteMyAccount_createServerFn_handler",
    importer: () => import("./account-dm.functions-MGLd4yFT.mjs")
  },
  "22827294a36c69726027ed02b477a829c5d96db9ad38cf2d7bc8d971eb38e12f": {
    functionName: "upsertGamRow_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "22bd62ee6d6711c0bcd47753a1a88905c1e9025b39c468cb88c280fbc33b8bd7": {
    functionName: "updateBroadcasterSettings_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "22cffefac94963a228668e2408c63722795aaf6ff9a0ae2d926921298874f9bb": {
    functionName: "respondToInvite_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "238d26adde7e0634904d22000ae09a203059aefce330cb5576868ba35b742d47": {
    functionName: "getBroadcasterAccess_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "23fe41484f3e726a80aa10cc5204248d4194d760b8d8bb5941fd8195cd457c20": {
    functionName: "listTrustViolations_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "243e30d9acf06b2aa72991b2691dc09522812a38481912429ed0a0fa84da8350": {
    functionName: "triggerEventAnnouncementIfNeeded_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "246a24223a2271e0141064446adc04fcf35af7e4fd1ae62f801b65d88fd1400e": {
    functionName: "warnFeedUser_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "248f849df4c3d04439d35b4ddf1cdd07b9bba1352e2a29885b1215ccc6f95f68": {
    functionName: "getFeedModerationSettings_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "25132afc39272be46847a4ce6a7194375f46653e27f207c3c199a86bf2e5cc0a": {
    functionName: "setDmPrivacy_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "252f293278d9058682e9d9a629844fa7ed16133753f70d711628c5de78246de9": {
    functionName: "upsertLinkTarget_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "25ae481471fab660009f9bfa357669ffb3c4a02fee558a1133b23998161aa625": {
    functionName: "createConfession_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "25d757a6d4ba67d150c6757ae52977156aeaf15537bdfb6985d14a13786e98c0": {
    functionName: "getAssistantFeedRecommendations_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "26c765280b7987e38b0f057b44593f0f39c1333d222bd0c12c07c34821cffd99": {
    functionName: "listCompetitions_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "2874299ef75a8bfb64c9ace9c18227532be73c9b0ce16562a54feefe559b4265": {
    functionName: "getFeedbackStats_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "291a678cfd50827d0397c8fe1376c68e18533b588a3dea6974f352630e2ad99a": {
    functionName: "getBackupHealth_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "295eb0929d821b3073eb4274063ec8e58b419ef8db80b8be3f9f496509c0eac3": {
    functionName: "getSeoTargetsSummary_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "29f2febecadda89584f4ae0806ffae60779268003031ca30ac288533a497e1ee": {
    functionName: "readLicenseCache_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "2b4779863a4b16dfd05bc47fd045e559154bdbbedf8df25564ab296754e409d6": {
    functionName: "unbanUser_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "2c4e5a7276ff44da8901e7453cf2a76b2f5b71700f1ad3e844aedaf3f643439b": {
    functionName: "adminListMehfilPoems_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "2d1c643fd61af126663b075381e1ded533614cc0d907f4f36a31c7aa8be765be": {
    functionName: "listPages_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "2d49c78b3e8be2e8d6f64a5e8ed74f01f505dab7da198c399bc0f1c48b2f7fd3": {
    functionName: "listMehfilCategories_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "2df76ac4651f7ee09e175ef1f8d2135014a5ba67b9fb26911dfc0354c2cf886b": {
    functionName: "getPoetryBattle_createServerFn_handler",
    importer: () => import("./mehfil-battles.functions-CyW5PMMv.mjs")
  },
  "2e28f2ea2e9dc9510a5aec6e555e3c88a8bed13f8e6395a5bbb398cdef09002b": {
    functionName: "getSeoTargetsSummary_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "2e996b1c8a635b2e8b950f6e186323fb86f196cb2e52d9129afffb636f1645d3": {
    functionName: "deleteMyDmConversation_createServerFn_handler",
    importer: () => import("./account-dm.functions-MGLd4yFT.mjs")
  },
  "2effa52156f93330768cd81b6a4bc58580b5e25f896ccf6ac65a82f7e0866ade": {
    functionName: "suggestLinks_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "2f898c16f58158f99eecad007c9d7df19838e90932ee6a65e17b6194ad291cfb": {
    functionName: "removeFromCollection_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "302ebdfb46516d0704d6335b88380892b318816585b355ad37d60404ca776bb9": {
    functionName: "adminListPayments_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "308aa36452393305458ae58c3176bcb255f7ced31e92fefa57fdf268d0340379": {
    functionName: "addQueueItem_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "30a125c9c8b2e85c0187f379ea78ee34c701e030d6a85f9523b5a1f2d0e6a519": {
    functionName: "checkRealtime_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "3176bfe3f52736108a773a525b6bac54251ce47fd6e58e068c43631b9ff74837": {
    functionName: "createSchedule_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "32ade7380e32f91a0e296843fb9ea5f92dd41086e40482217158864f05945420": {
    functionName: "getCompetitionAnalytics_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "32b83b810e6596c16f0aeb6cfefeb67800168e162743eccb190bce58b47abe7b": {
    functionName: "checkDatabase_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "33346c472edebcb0648b8dcb6f549014c4a74bef6334b8a06e893f8b32cae9d9": {
    functionName: "getEnvValidation_createServerFn_handler",
    importer: () => import("./installer-diagnostics.functions-CVMxeR2o.mjs")
  },
  "338368b876ba293dd5aa1ee823bcd9c02288ecce13a786083ef2bc2408ee980b": {
    functionName: "adminDeleteLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "341756b338b55effeeb6939f2bf0aefe75dc21b7efbd3f2ab833ed4adee0305b": {
    functionName: "adminDeleteCompetitorVote_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "34243e19ec785b74a62feecab62c74c0c534df7ac7a2cd0a98ccb6633bdc7aa8": {
    functionName: "getMyVote_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "34354b98b1e2f914cc9eb30dded79488b6ba96472ec69384dc1b6f29a9b5f516": {
    functionName: "adminSubscriptionStats_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "3448df33adf161d13a6994b0d5897bc3a9618c7ea3aa14d6759593a4fec1041c": {
    functionName: "claimChallenge_createServerFn_handler",
    importer: () => import("./daily-challenges.functions-CFXNeOZd.mjs")
  },
  "3463a50820e1daf250c1455e3ccee8e6666c4b8e5c09281e767ced7b5152e29a": {
    functionName: "getAllSettings_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "34d1b688fa8558aa6a1a18978aa62b6072ba2ce338ff299c7aabc6f0e5a7789c": {
    functionName: "findSimilarFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "3553436f37ade1d6b80e8115832c035ff19d8df1cc1e9402195db5b9ecbc2bdf": {
    functionName: "joinCommunity_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "3563fe4e025a0bc28e5aa82ad78908e0c844f4bc665d185a869cd3134706ce16": {
    functionName: "adminSetManualWinners_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "356e223e39964593e002f2a62714caec95be0b80bc1bcb1f166ced0c500f3c8a": {
    functionName: "unbanUser_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "360e6db0795dc401879ae9e90c9891f1ae0b2bb93b5beac7340ae4eaba4d4ae5": {
    functionName: "adminResetCompetitionVotes_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "3743151ef5cd2723264f92bef2bf0527a6a051c8fe75a4444e74ccbec01e2bec": {
    functionName: "mintGameSession_createServerFn_handler",
    importer: () => import("./game-launch.functions-DI89te4w.mjs")
  },
  "37741fb0e302bba0c06f00f3358485eed1fe90609ba07ee894a2194f03384c43": {
    functionName: "getUrlAllowList_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "37d4eab47adbd85d2af21138ddee9f47a19393ef715319b068a15cc5d0d84721": {
    functionName: "deleteGamRow_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "37e9f52955488aecb3b31d15d5353ac51576cb55a5ea4b804be2f16203dea37a": {
    functionName: "deletePage_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "3803b6416a3e6b1d4709a0d1a5f6c25f6f8c367272a3483b975500affd102e8d": {
    functionName: "deleteAnnouncement_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "3902176137028063880e5342df75791c99dfbc86370baf92b68e6f6430078c79": {
    functionName: "listLeaderboard_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "3bb4818559f9b7152a84142cb659c6f64e3ff6c70246bb125305cada0d202d6c": {
    functionName: "listModerationLogs_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "3bf66ddb000aad7ddeb82fcc7caf6308f91756f186d1a5e2bcd84edcc9da8e0b": {
    functionName: "updateAnnouncement_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "3caecbfa6f50c5adf739c43ad9b5081c0fd36848d7de51035aaa20b9275ce695": {
    functionName: "reportFeedContent_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "3cc6e2d5fc8adb8051f390229ff3f728ffe6a77e6c7aca797ee9dd4a7c84e3a0": {
    functionName: "adminLicenseStats_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "3d1c2d5d2f2168644443aab81d77f0f19285c41b7f4a9aa1da4f8529f1cece90": {
    functionName: "downloadMediaFile_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "3d97ece13ca94eeb7c26a592033cdab3e96472e2da455ef40bf4b5e4a867d9ea": {
    functionName: "listRedirects_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "3da852e36fd8679dbf791b761d0223ea984bb4634eb8fe689af166bdb47ed5b0": {
    functionName: "upsertSeoGlobal_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "3e79ec63853e941008ccc2363b06742a92dad5343b069d136f8a97b5b678da69": {
    functionName: "removeRoomMod_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "3fcbf97b22720df7093c833b0affea3e506c435e382d3fcfce4797b3d3fb945b": {
    functionName: "runInstallationHealthCheck_createServerFn_handler",
    importer: () => import("./owner-setup.functions-BIwCUEJ3.mjs")
  },
  "40648a3abfa792287eaeb749da830c7f64cf89cc220c6669c088db80c7696d5e": {
    functionName: "followWriter_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "417f909761be074b0ec58b2556613f6f72b464544eef72f807a11ce3b6ffe628": {
    functionName: "awardXp_createServerFn_handler",
    importer: () => import("./gamification.functions-BU7cEDet.mjs")
  },
  "41cfdb8af178472f9839a1a826968c8eab17b2ba7b80f94704992f662ce29f01": {
    functionName: "getCreatorLeaderboard_createServerFn_handler",
    importer: () => import("./creator.functions-_VtwakPG.mjs")
  },
  "4203299a488f60fcbb2c326c9e3f6ec2ea73278d1dd943478fde676b9a7e49a0": {
    functionName: "adminListMehfilCategories_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "42bc65e16f87b6b1559dfb166e61d447bf7f751bc4b9ceae266493f091c9d61a": {
    functionName: "getMyAssistantPrefs_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "4468701995c07827fac4521df332860cd5bfad46a34a04a1134b6458a97d7c5e": {
    functionName: "addRoomMod_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "44702b1b3aa3d91c37b1dbcc007bb588ccd4a6021709511da2d8fd791823da07": {
    functionName: "scanContentText_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "44a6f45161991cf3b090f43e0dd7af6ed5d307812ad61190f01edfbe434e2bbb": {
    functionName: "getMehfilDiscovery_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "44c32a8b1943537839baa2869ca2c864987fdefc21b2936bc1050497c0a27492": {
    functionName: "postComment_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "457ab9a8e0cbc7de3aabc62adb0709639a137683434949aad2a49dc5755eafb1": {
    functionName: "setMemberState_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "45898f8e6ba49b19d863918f48bd28ce8d8ce599287fffe0a8164cdf7fc18d2e": {
    functionName: "createFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "45c6819b95a3e108e24c18c477b291f66f106c440e7d2939a387f6282b04ee6e": {
    functionName: "updateNowPlaying_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "46298a3a25c95614271c316d9e0a95c3dd68eb524b7dc8a9e37b88528a0a0f79": {
    functionName: "isFeatureUnlocked_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "464a633b09d69a86b22e7ab0f821ac680f6b95fbf77c39db0dd46cf87114e608": {
    functionName: "requestPremiumSlug_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "471e13b85d25e97df1d81149dce7b48708b1f770dcfa276334130900dd15edac": {
    functionName: "claimShareReward_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "47d33cd1c3ffd85c80364fb86d59822bdcedb85e129d8371cf01b510711307e0": {
    functionName: "adminSetSubscriptionMode_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "4975a3d209916640d3645d3c35bd29fadda4a76d15a7a5c5359a99dd359fa833": {
    functionName: "addWordFilter_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "4984e2915977ae47faf1219a02cd99dacf3ad4f86b1c26736453b40fa31ef939": {
    functionName: "scanPostImages_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "49cc98ca68bbc66d95e39195311e383f06e5b326a7f4d663d7c0f14dea45a0bc": {
    functionName: "inviteToGame_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "49df20710ad565cf42f7a116945977c25e13c0e4792cd58c6a836da350b6a5ba": {
    functionName: "deleteWebhook_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "4b3d96eaa4e18acf2fb33ceb07bb738b44c5be19c719b06708d5ceba4835b42d": {
    functionName: "castVote_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "4b5f3ef063af3e60de6d9a2b2aa329ff847671bf5ab7dac6d8bb8080efeb59ee": {
    functionName: "preUpdateChecks_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "4b67fc921f3e13d1aa6e9d3ed1e5964f3bdf8285e048bea9aa7996bc402e0caf": {
    functionName: "getSystemVersion_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "4ba37046414343fe8bab0f28ba64459913d806eb3bcc3cb69be0c762da4d6669": {
    functionName: "writeTestimonial_createServerFn_handler",
    importer: () => import("./testimonials.functions-fUCuhMy5.mjs")
  },
  "4c0f56ec7dcc5b4ee864bd2010313506436bdea331f687ba0df0ff4527abee53": {
    functionName: "getDmPrivacy_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "4c79ca38920952864c7ab8709f250fd153eb0590e384e65be37b29b051448e8e": {
    functionName: "getBoobubbleGeminiKeyStatus_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "4d00427dbed1e2194bf1b9907d21b2093afbfe89d10306de3cebf8e73ecd8aa6": {
    functionName: "listMyGames_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "4d00521a17b79627ac626c7a1e68134eb08a7cb180640fcd962c277cc3582348": {
    functionName: "getBoobubbleSettings_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "4e68ea51bbb50b27654ea3e6f9866e8da98c9ee9d42b97e3c31fcabe0c949230": {
    functionName: "getViralJackpot_createServerFn_handler",
    importer: () => import("./creator.functions-_VtwakPG.mjs")
  },
  "4f7c04fe629f39fddd21a2f3ece558c12aafd300b8fa7bf0f04190f872c2ca68": {
    functionName: "exportBackupExtras_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "4fa3e28bf8c9ba3853703758f42ea6079d297883fce463d9dc4db225752a1655": {
    functionName: "adminResetCompetitorVotes_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "4fcb3aa828c53ba4d8926013168728e821d65c080c1848a107d4a91f3464371f": {
    functionName: "getRealtimeOverview_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "4fdc0c83bccea7836da5e0d9fd9c79c8accdf148503acb9b1ab4df36274d92a0": {
    functionName: "listCompetitionsEnriched_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "504e142cdc51dc62a074486e594ede5de4ba6cae1788134a6b1555b9b766bf20": {
    functionName: "listPoetryBattles_createServerFn_handler",
    importer: () => import("./mehfil-battles.functions-CyW5PMMv.mjs")
  },
  "5053d71a7d698357e73affb5665cb7ccc6ab9d23fcf98ec579e4d2a7f8ab6205": {
    functionName: "listPublishedPages_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "50d5ccdb83346571f0a0c8a428663079523d67f3100808f9b5aab03ef3ed071d": {
    functionName: "runSchemaBootstrap_createServerFn_handler",
    importer: () => import("./installer-bootstrap.functions-DMhlWdzK.mjs")
  },
  "50f5808780c1491d92d505f3743bda28cf0e6530001721bc5d793ca6026413be": {
    functionName: "verifyInstallation_createServerFn_handler",
    importer: () => import("./installer-bootstrap.functions-DMhlWdzK.mjs")
  },
  "510834ed19314b8bfa5b45d32a37e7091c31e0efd9485dfdc6525e0d24ec063f": {
    functionName: "listBans_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "51750de6690a74fa68c7f335ee3da0e50d9c24dfbab650bf78c3bc9640303076": {
    functionName: "updateWidget_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "51967712479bf7a8de2f0168365592072d4b4cb5b434ba635e35644dcaa1d606": {
    functionName: "listMyCommunities_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "51b83da4c18eba0eb6bb2cc8f2d23de7e686cc72f1b7c10d9c40e11f926fd7dd": {
    functionName: "clearChannelMessages_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "51ba2c0a821cb44faf96458e84f29e156b21e2fb3e6a30aa91ff45caf9297400": {
    functionName: "getConfessionStats_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "51fb597f248aae4730c787cf9a67a37a5a2d0fc39a4c5242e709a64f2900aa5d": {
    functionName: "unmuteUser_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "521d5db889021145140f96086287f653a846d8cc3ed852f7a6f64c29d71ceec0": {
    functionName: "addToCollection_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "52dced78dfda3687039a7a67059d8492c96278c20901c695ea7630fdb1e238d1": {
    functionName: "saveBoobubbleSettings_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "535d0fa6de306d50b658ce479b7ab08624dfe04d8325effe54770db6c5ff46d9": {
    functionName: "cancelSchedule_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "5371c292cc1cac140a928f2cfb635f35f1ecfdb2842adf406c4b794a802d2b01": {
    functionName: "goLive_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "5395365cd47eae723ca6c7a5c890ba53011c3b0c44191c682428a56efb4954f0": {
    functionName: "getRoomTopLoyalty_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "54ce46c1489ff4f1f03823e6bc62f13416ab59634809dde6d1b070579652914d": {
    functionName: "getFriendSuggestions_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "54eb0f0c38b9bf251ea04bf1ad053edf0f9fc49daba9d211d9c1a3574d4b32d0": {
    functionName: "reportContent_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "55e0c7e7c42c0887b433710f7cc39cdeda814c126e820429a9504359681f78db": {
    functionName: "listPublicCommunities_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "57154cc66bcfa087fa788685c54618bcd30d08ff18960b011d44011e5b02a0fe": {
    functionName: "provisionCompetitionsBot_createServerFn_handler",
    importer: () => import("./competitions-feedbot.functions-CT7_j57j.mjs")
  },
  "5797618f41bbb806cb39c3fff2767434cdf0517677db031e6c7c6c127616ffd2": {
    functionName: "provisionFeedbot_createServerFn_handler",
    importer: () => import("./feedbot.functions-CilCnZrQ.mjs")
  },
  "582679095d46a977919eb7df9e730af4bdad17e1b8a081492d55da36deaab83d": {
    functionName: "createReply_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "595ad05b7e1652f84e21e0d924581d342619c5a604e71c3ff879f6094f9ad5fb": {
    functionName: "adminReorderCompetitors_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "59be48f262706f05a7b6c8ff850a5fa83c33217a7186668b879a170cf283c6c1": {
    functionName: "ensureStorageBucket_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "5a1cb07c0526b841478f038c97ad40388ca433cec30a61a2d01488b929ffd5ea": {
    functionName: "listTestimonialsForUser_createServerFn_handler",
    importer: () => import("./testimonials.functions-fUCuhMy5.mjs")
  },
  "5ab30af61d478d7be5363574b7836d09f6c039598b2bde1854a60ae102a88f29": {
    functionName: "listCommunityMembersPublic_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "5abc54688d8062b099ae81206add8a847103db3a305faab4b8a24df8f8ae630c": {
    functionName: "banFeedPosting_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "5b14dfeb1053efc9ccdc068fe9c81e5cf6351da739757e32d1422b647be34d0c": {
    functionName: "submitReport_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "5b6c8dbe8128b4b90cd11687140630be2c92765c9a48b45b10af841db0d833f8": {
    functionName: "setMic_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "5cb69cd947cdad0ac250481405d1de36e3870ab3d45172514d7f34758b1ef0f2": {
    functionName: "deleteUpdatePackage_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "5cc41eddc3a1c5f04125f22b2801d8ae1339f4504dfab9ef76954346698f4ece": {
    functionName: "assistPoemAI_createServerFn_handler",
    importer: () => import("./mehfil-ai.functions-GBYRr7tb.mjs")
  },
  "5ce65aa2e8e895f2018e9e5063d7f9dc603d5bad9ed44d1b4085d7ce4bef21fd": {
    functionName: "listLinkTargets_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "5d3b602a34eb6d952cf9cf80461fd4c1c11f9692ecc9b491fe127e76626b2a33": {
    functionName: "loginWithIdentifier_createServerFn_handler",
    importer: () => import("./auth.functions-BXwD5dVA.mjs")
  },
  "5dc3d1d8bc495346ed47f4b44e78d0cd190366922e7aaefcbc4172172eaec712": {
    functionName: "listWidgets_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "5f15d9c6194c3264109b1c81741c60a8654b66a5caffc1ee319315a3a983394e": {
    functionName: "deleteUser_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "5f3ecd1ad5980fa429fe39f30fdbc609a510a3865d9d358e53aae947291db692": {
    functionName: "listMyPoems_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "608c378fde795cb827c9d7b5aa94375e5db803d26df8fd5705881f17452a625f": {
    functionName: "exportBackupMetadataV2_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "610c54897203a5ecad9a13be81d52da6834d0fdfe67705c2fb84ce724b9dc042": {
    functionName: "deleteAIChatbot_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "6197bc1a8ecdab3cca89835b520815810403b5a52b6d931a9d42ed43e7ffb669": {
    functionName: "adminResetActivation_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "61c6ff43dab665c542bc08750f1f6111fd2dd2692a3d08c2570042ab710c287f": {
    functionName: "listRecentCompetitionVoters_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "628c9e3634fbc889e9b3fef4af2beb28ec95d70d3ddaeb7c72d90c7edb847d36": {
    functionName: "listClientErrorLogs_createServerFn_handler",
    importer: () => import("./error-logs.functions-Ce1iI9j7.mjs")
  },
  "63215c8a9ac4290c661e8fed16710cafdb99beb0423a90b0234679acc6078886": {
    functionName: "submitVerificationRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "642a8c7dd9e36df96c5aacd4d5f7ee5edf0944a1925e9e8cbf2546cb7da210aa": {
    functionName: "listAuditLogs_createServerFn_handler",
    importer: () => import("./admin.audit-logs-CGnvHoZL.mjs")
  },
  "653a4c5f0c5db8d5619a2b5af6ec2b7e5c4542ab6a42b065dd280252d458b78a": {
    functionName: "listAIChatbots_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "653f1d4b502df1b2adf9ecc6e722a4afbdb39206420351ad3fd62a51db5b8bff": {
    functionName: "getCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "66bdf9a426915c5d9933b199a4f298c12274caff62dbb4adf80274fb51cc4ba9": {
    functionName: "publishPoem_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "67216e73a18356a1bb41acd21336112d169c9ae445b21f2f7d4e38b325a5e0eb": {
    functionName: "adminSetParticipantStatus_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "67e1bc18c4da8bdd7960c22416a3e9c317044f118e06f121d18229d7955b7f41": {
    functionName: "listLinkablePages_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "6a350e82bd67cfa9dd726282bcbfeddfd043f26d0d6a6ea3d0a2918e864e0afc": {
    functionName: "adminDeleteFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "6abf9e5e63ee6d79b3acffeaa0fd827903c1e6308bb4e410ee0998f8c01576b2": {
    functionName: "adminUpdatePoem_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "6af5861777f1d7932c1ff026703c73ad4d97dc25f60de45493ad271c8c1e4d29": {
    functionName: "claimMission_createServerFn_handler",
    importer: () => import("./missions.functions-DUOB3t_A.mjs")
  },
  "6b071234e36762ea3cc76642413e64188e4dc25dd9b284f721e3ad7855827993": {
    functionName: "listCommunityMembers_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "6b5868a3bc308e0b920ebbcfa3b966ad4ab93f6d91e9d28434a6a00ebc071859": {
    functionName: "removeUrlRule_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "6bddbf6498cedd14911117bd11a61a4652d2fdf1aa664fba111eddfb19dd2b6b": {
    functionName: "incrementCompetitionViews_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "6bff185c07d1822cd0b7588ba055f64c47dfc7406ad15c2e7ee45193880ebd69": {
    functionName: "provisionBoobubbleAssistant_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "6c0101bfbd81d018fcc7af5fddc270cba151add7ee07ee26332d4301b2e45c78": {
    functionName: "savePage_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "6c593f9612024adcc8eac770b33166a331327f3a5f5d1a0504422c12f43cacd9": {
    functionName: "togglePoemBookmark_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "6d70bfa63a3940d25327ddeec4416120f6561357557950f3ae443a8741d968c9": {
    functionName: "adminGrantCoins_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "6dbfae677965187a86caf823ba44ee9726c3702740150cd6b681f703dfa89bb6": {
    functionName: "getCommunityAnalytics_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "6f10113a3f2a17d245d52170d8dd80becf34a9ec5e8ace91f7440af34de787b7": {
    functionName: "listLicenseSources_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "6fc0b9c4cc404aac0bdfc750777a59db02ee5c26533b6d8a7055ddcec86da401": {
    functionName: "createMessageRequest_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "6ff54c7caa85e6f146f3f94553c0c6b3f8f640b95221e45699725cd46c4be892": {
    functionName: "toggleVote_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "70140443c168486d477f4b90140fe743a1e1a220ff5235928d72bcd874e1ef89": {
    functionName: "announceCompetitionEvent_createServerFn_handler",
    importer: () => import("./competitions-feedbot.functions-CT7_j57j.mjs")
  },
  "710e1e17447cff94ba27cfaade62b404fef584bf40546cc989032b0e4376eba7": {
    functionName: "boostPost_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "712b9ee2080ac24476f7b48f0e09a6deaaf01126deb43d8798e9d0fd9acad5dc": {
    functionName: "pingDailyStreak_createServerFn_handler",
    importer: () => import("./gamification.functions-BU7cEDet.mjs")
  },
  "71677cf95649820521dba41c3d1c40a14d6abfae7bd67abbe7faa598960a35b1": {
    functionName: "moveToken_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "71aace1675bb3936411307ee44011ba9fdd60832d0b391a91d23ebabb79f2fc9": {
    functionName: "isFollowingWriter_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "722e804184728be1990daea0856f5346808c09c428fbc6439d952af664553a5e": {
    functionName: "mehfilSearch_createServerFn_handler",
    importer: () => import("./mehfil-search.functions-BU0Ji6u3.mjs")
  },
  "72f28a85d969eff9cf85ecd27bdf0f4eaedb80a95591e8958a59ddc4651ddf7a": {
    functionName: "triggerMissionDigestIfNeeded_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "73ead1c7a9b3f68bde6e4299ad6d148e0612e2ee41feaca22aecae30607d3f44": {
    functionName: "getMehfilLeaderboard_createServerFn_handler",
    importer: () => import("./poetry.leaderboard-WpIbAJnC.mjs")
  },
  "742f70fd777ae551ad3e3d3d2db22cdd962f265a6451e0c71a29e8525bb6c8b6": {
    functionName: "updateSetting_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "74af30525be26f350d5455bd701139d4616bac3490c4f61e98c74f75884fecf9": {
    functionName: "adminFinalizeWinners_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "75067d7dec8a74ecd65158227c2c31234120036d4cc0aaff6d99a58ec9fa96e1": {
    functionName: "listFollowers_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "75be98476f5a15b9c85900ef344d767dbcdc7235d0ed0467740c42117014864c": {
    functionName: "claimDailyChest_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "76635cb41ab2c756ba55db0f0545f3853b07746f9eabbe6e155f8f503615fb3d": {
    functionName: "getUserAchievements_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "769a7707d9304999c1f74ee8b0eca9deaf9a86e2ee6fc763dbdb9f91e748e738": {
    functionName: "getBoobubbleOpenAIKeyStatus_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "76e6fc7a58c80573e13c5bfeba017853d4a6a4d55dd081d5b865f6c101e80106": {
    functionName: "backupDatabase_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "777edff60046b3ac54850d08d4d5c82aa6c636334fa1f3525592ed8203cb5620": {
    functionName: "acknowledgeWarning_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "77da0a6e1279530d98ff0fedd0e5cec7a821da83c9d18e2b2cc9d4bdca187a56": {
    functionName: "getCompetitionFollowerCount_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "7880567123f2732db9caff6503cc3b96b5dd9334adc6e8bd044879eb58fbbc7a": {
    functionName: "createAIChatbot_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "78b9f89619ab5157fb3a33f4a2fb9acf6c988b7bd629328770f57b85ed0d86bd": {
    functionName: "adminListAllCompetitions_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "7940784e868707665f83d64093656b192cd4da361b9c17e33387b0f3a47bc6c0": {
    functionName: "rotateWebhookSecret_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "7a1af6219b5ec0a63c8a581ae37e4dacf4778a2cebabf3473aa5d82128f960d4": {
    functionName: "resetBootstrapTracker_createServerFn_handler",
    importer: () => import("./installer-bootstrap.functions-DMhlWdzK.mjs")
  },
  "7a711031e1e5afefdffd3a137f39b9950378b00615c6d03a5403f2f14a7d3fa9": {
    functionName: "recordDevice_createServerFn_handler",
    importer: () => import("./device.functions-B4Tn2Lrb.mjs")
  },
  "7a84a1341d56e0f7879e523778af4740cfdea2cc24e696a6e9bec6b94166103c": {
    functionName: "listMyFeedWarnings_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "7a87a8e5804e17215b36798f16f6690dfd9fc12b054e69b19a1ec97b54e643b6": {
    functionName: "updateCommunityBranding_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "7ae29f2e597b47a4d071fe194c4ab9546ac2889c8dc4a5c8d4914013bced665f": {
    functionName: "reviewPremiumSlugRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "7b423bd80c0b742fc56925676066fd259862fa97e63a0c83b2f77405680cf18e": {
    functionName: "upsertWordFilter_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "7c225063a2e3c71e67890e64226d11136aaa641244fce385711e8a3fb43046fa": {
    functionName: "setContentModerationStatus_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "7c4638e97c2a777a92c2b411287936b2b236c243c1f93bdaf77bf71c4efc658e": {
    functionName: "adminRevokeLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "7d8e0af3509fc5012bd4d42054e074cefed6059cd37d7597e6218ff542db1637": {
    functionName: "listFollowing_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "7ea6da22137390aa84848285aebdd04758001e4f38880c63ea02a67c0adffb01": {
    functionName: "createDemoAccount_createServerFn_handler",
    importer: () => import("./demo-account.functions-Cq8Rmo1A.mjs")
  },
  "7efe620fd9e76ed5c38c31ec5a99c488a5aefd6d4272fbf32164bc4f1ce20c9c": {
    functionName: "upsertSeo_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "7f292310935e2595456ed6407e363cc29ae982a41c240f7c35055c5608f406e9": {
    functionName: "createAnnouncement_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "7f3036a6e40b56aea8e2133ef2392c1bcb02942d5f4d38bf99250a154463d498": {
    functionName: "warnUser_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "8011088df585c59eb9f4487da85843ef5db6a19c5a197ccc3fdcb3253759184c": {
    functionName: "adminSearchProfiles_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "801f8414b82bd1dc153e77d132ebd3bb77eba32371faaff34dd49552575719d8": {
    functionName: "adminGetLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "805f397af5a11a75bc1231dc187c57cdcc065ff51e4a54b71e2d9ce15e72cae8": {
    functionName: "listSchedules_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "80fb419e171ab7445c9a3c070613b21c5275c8c8ca7ff35db416f2ffc369fe12": {
    functionName: "getAllSeo_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "81f88fb3f8b7494d5f3aac54a5e306586ba8c1ba7336194d4f0161713c9ef295": {
    functionName: "getUserCompetitionShowcase_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "821deb39e172443f74404bf648a4be5487d7ac2283f4790c539cc68cf0b44805": {
    functionName: "universalSearch_createServerFn_handler",
    importer: () => import("./universal-search.functions-Bz6AdiNu.mjs")
  },
  "8256478a7c1be93cc128b4ef7beecda8beddcebfb30fb3efb673ba3b544ceb57": {
    functionName: "deleteRedirect_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "8285ee8226922c117fa21641155bc211d50173240b5ad9e275f06f5dc6a91ef2": {
    functionName: "adminCommunityReport_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "837235bd73d4681b6805fcb18718f242f55991f28b3a1249914900c581704891": {
    functionName: "bulkSeoAction_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "848635f84ea945f35ddd5771617eb8a575fae22dda679ce074c0780bddfa010a": {
    functionName: "equipItem_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "84c1c984ec18ade458ddcf3fc515f06af8a31fda847820478b950d58071edde3": {
    functionName: "listBackupHistory_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "84e76b84bd8ba8ef0f19ecad6dbca071abb1324d00b9e182f106407886014d17": {
    functionName: "restoreCommunity_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "8528e39a65c6060913c020ae6f1291e95dccbe150f8cb2ed23b280149d8efb00": {
    functionName: "adminDecideVerificationRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "862947d4e956959370b8111f80baebb7f5784a6ee5fc2efba2dec540910a7c8a": {
    functionName: "getOrphanReport_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "86359257d147e653e646578ea9455c194201e31bb8107c939f4533f37bedab9e": {
    functionName: "adminSaveCategory_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "87e8d9d8a2925a65286ce3dbbfd5ac5123bf4744ea10552f976ed54f5870fb5c": {
    functionName: "updateUserUsername_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "88342257376f0bad971fe12066a808e5d14c179f6f2f2f69540825670df10aa7": {
    functionName: "getCompetitionsFeedSettings_createServerFn_handler",
    importer: () => import("./competitions-feedbot.functions-CT7_j57j.mjs")
  },
  "88abf8b0cbf398ce2f72bca43ef88be7b00ae226cbf629c91438b77abebc73c6": {
    functionName: "getMyRoomLoyalty_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "89ab9016c6a9ad77aa33dcc46f31a19c9e98ad04617b9fa813f8065c4e4f5960": {
    functionName: "verifyLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "8a03f851241163cd068c39def034f76f846db9de8de07468913d220e67fdc0a1": {
    functionName: "endLive_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "8a827e5716391d30b064ae17c999d22cf29bdbe0c437b36fab90afa6c8e51db2": {
    functionName: "checkDeviceBan_createServerFn_handler",
    importer: () => import("./device.functions-B4Tn2Lrb.mjs")
  },
  "8ac424ccc9d808484383b3255b22d8048f590c3d04360feb619a098f21ca5797": {
    functionName: "purchaseItem_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "8cbdb6d7a736e93cce4ff31a9e919e7f506aad2cfa65c318263e93178744d958": {
    functionName: "deleteApiKey_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "8d31ed5714910de22c3f88243b9f9f17091f46085c8efcebe8fe1c59387f2e81": {
    functionName: "listWordFilters_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "8d76fbf1e94c604dd2262f46fd73410c1fdd4f22431a765bd3bf481ed5d9241c": {
    functionName: "getMyVerificationRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "8d9e04e848d8fab4e0075d8a662247217a6bffda2cb4cb4b87313f1ae1e4df8c": {
    functionName: "listPlans_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "8e508a8bd79feffb9d653f1f64ff51dd3dfd2970db0256aedd4a5e1b753f6f1a": {
    functionName: "askBoobubbleInLobby_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "8e7a345021f10b7be90483b2f727ebbff5ff9a697af55d094e235b0d998587db": {
    functionName: "setBoobubbleGeminiKey_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "904ae947fc68d271fe8c3d70c2743099c238527e72eb57451cbfaf1e6e611c32": {
    functionName: "resolveReport_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "9075a129d512e315185436d3141e3ea9db20a1de7fec11c6db4a01af843271ac": {
    functionName: "listQueue_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "907fcf3bb98bed6bd7102699956590e4e38fe928bd1b832bb3cfeb761e94c8ed": {
    functionName: "listCommunityMembersAuthed_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "91b9ff5f7a1698b4ddda6fa1bca1a0f13419913f7252b076d45f1f0acbabd839": {
    functionName: "adminDeletePoem_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "927c66e22ecbedb001a6422b977d58904933d3a455813d5f44e035315fdb9ae9": {
    functionName: "adminDeleteMehfilCategory_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "928f0aa39bfcd0bd5b585389edab4600e85cd219d4218ce13127b378594e94ea": {
    functionName: "adminListPremiumSlugRequests_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "92bf685e2de1ae64a662debdfcfa03dbdf44d29dcc7f33657310aaaf69b2e410": {
    functionName: "listUpdateHistory_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "92d4d468271dcb967cfb2648ecdcb878924422739ed5b8966d72fbc1f5d29fa8": {
    functionName: "listGamCatalog_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "93633134f8394cd35a65e0685728d5cb9bd1d2ec15bbaaf2b11dd4844e8b5c08": {
    functionName: "getStorageBucketNames_createServerFn_handler",
    importer: () => import("./backup-restore.functions-OW5CMs7K.mjs")
  },
  "938f7aa1c066589f34b105f1e75788fdeb08007a255a0f9c5713a8f5d80ea87d": {
    functionName: "listModLogs_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "93a20d854ff9e7a47db58302bdfd1300ffdf9d88403ebab9995ac470c8a7e476": {
    functionName: "banUser_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "93eadaa5e5b70991cf2956d89bd15639f213c72ac90835836b303b7b69a4708a": {
    functionName: "dumpDatabaseSql_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "9426669075fecaa116539005d65966feb0dd23a91150d7afcc43e32fbbca7cc6": {
    functionName: "getMySubscription_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "944cf63a029419b2deab9193e1761098f7ba53454a1deaa391e2248d7464c0f7": {
    functionName: "checkEmail_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "94a3e957e5e716a9b7be50dbc5d9ec1dd7a72340fe0e2f1d7fa92128b76936f7": {
    functionName: "emitGamificationEvent_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "954097dd4dfa17d1a22fd4acd31bef8fb5ed57dc8db051085088cb9b9923a307": {
    functionName: "getTrustScore_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "95b39620aa6e73ddf63ec8b399967937dea48a6897d5bfb48b161eada1454ea8": {
    functionName: "cancelPremiumSlugRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "95fcf9064e671a5496066f87d841cf8c4a935837d7d0a99f9833d806d269ad8b": {
    functionName: "adminUpsertPlan_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "96273832da7bf56d368e64116c40c802d46e16c4d3a4bf119bfb6defef0f0d13": {
    functionName: "addModNote_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "977c21034f51dd649d64e5b9f73baf8e09371a2fe03c9521d0950d382def1a3c": {
    functionName: "checkEnv_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "9805db0ccea721709ce13adc83ac4b9c135fbb7b86945e1d8b2078ba406c63e2": {
    functionName: "getAIChatSettings_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "98d71ad3953702bd8d0692b9089988403278853af9b953bb54faaf91ee50fab8": {
    functionName: "aiGenerateSeoField_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "99422995c9bcbf88cfea9007c1e0f46ed3e60792d1e3b95f7156040e4fdd3453": {
    functionName: "adminDeleteCategory_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "99aab36e2ba5d7f93a6983476a5c7a80f5e9a9df8f8cbf6775d12e52a1ec0eec": {
    functionName: "deleteDemoAccount_createServerFn_handler",
    importer: () => import("./demo-account.functions-Cq8Rmo1A.mjs")
  },
  "9a7e53946f9cdf4c20b47f0abd0c10c8e6ef2aefe9990cef418b5448f86a1eb6": {
    functionName: "adminSaveMehfilSettings_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "9b16f2967a9e3636ee616b832ebf4b9e405e909762b48024978188d471f5890d": {
    functionName: "listConfessions_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "9b778343bcc20eff8b6b715dcdbe1bd7cb89e6c9307beead47065c79d34373d1": {
    functionName: "toggleSafetyKeyword_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "9ba8ad8c25a0448649f3d7568211d38957708e79b496a4ef080a5c564d212a83": {
    functionName: "listPostingBans_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "9ca93ed940bcc03f573c35a49348237467afcfb637dbc574ebb57effc7eba4c8": {
    functionName: "checkMyPostingBan_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "9d26fd85eb7061d5730f44b58749eb4653a2669809aac11db701b4a4f5748572": {
    functionName: "shareCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "9dc8112fd395c89bdb8492d2ca51f1ba8a907f53c11990e91c207faecf5a2118": {
    functionName: "setBoobubbleOpenAIKey_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "9e21f6b52db7c210591546575a5cdec3139053f97c3e99931bbe7fda7757e396": {
    functionName: "getTodayChallenges_createServerFn_handler",
    importer: () => import("./daily-challenges.functions-CFXNeOZd.mjs")
  },
  "9f18232bbb08b775b60b953dfc2447877f4f8d9d3f173936d3847606b4ce9fbd": {
    functionName: "earnFeedComment_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "9f285e3de8baed76d5f1511d9799b223bb3c4b336bdc143c5e6aeffea5a8ea78": {
    functionName: "syncLinkTargets_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "9f37d25506a7a829144c09bda55b0fa2268d851eb37dd8b32b38e24315be94f4": {
    functionName: "resolveCommunitySlug_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "9f3abf6627e7d9dd682a8e0b57b8b77cf6d314ab2262f83da9f7b86f11ce1aaf": {
    functionName: "purgeExpiredBackups_createServerFn_handler",
    importer: () => import("./backup-restore.functions-OW5CMs7K.mjs")
  },
  "9f4e5bceb917a31a9a9dc7ffe127b053f68e5084346c0d65a83cf759538299c2": {
    functionName: "getModerationSettings_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "9f59f4978b8c612b26829c1f2ceb9f5b120a3dbbbd65f74629f0901b8951d53c": {
    functionName: "getDeploymentInfo_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "9ff2da6f1cb7b62b1f668664cc4268df30838ea70729b37d14d822951dd79994": {
    functionName: "getTodayMissions_createServerFn_handler",
    importer: () => import("./missions.functions-DUOB3t_A.mjs")
  },
  "a099a31c885e8a9c3223f7bf578ce1e58ab5a0c4e1e8dc2d9358ab9d23577733": {
    functionName: "listReplies_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "a0ab0a5b5b79eebeb91f6d0a6175ebcb7407243ced1144cd91bc38956264e9b3": {
    functionName: "listWebhooks_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "a19a8f526a0f09943ce31d3facccc97774dd2ed98f033d3b6c9a566289488c36": {
    functionName: "listFeedModLogs_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "a22fabf6ab541401a325bd637c1164fbbbbf1b4265187b4d14f9def1f7a7fd68": {
    functionName: "listWordFiltersExtended_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "a2f929369bb0708245c185ee1805e9cd2fcbd15c4fc6fd1e7bc03489c2d763a2": {
    functionName: "adminSaveMehfilCategory_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "a322919cc4038a3751abad19208450753a2d39392effb65fdf18a73a67899d30": {
    functionName: "listMyCollections_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "a38c4eed08768910568de3a1fd04061f3cdad98653000cc7fe2d086a8dd8a6ef": {
    functionName: "resolveSafetyEvent_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "a4202a91ef7ccc4c738667f039992f5fa1d59ff5fa89ef64af9d4fb5468159a0": {
    functionName: "adminSetCompetitorFlags_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "a43f87bd484ddaa960a1d7258d79c82c093e20960bf1438be9b15c35bbfae58e": {
    functionName: "getCompetitionBySlug_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "a545729233d4e6859a6ab323109b23797d3af9e8cda10a2985d1f4da02e8bcf9": {
    functionName: "rollbackUpdate_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "a628f26ef7cf86ea5c08a819549f703e6b48f6af100c9d20a581bc1aed70f5e0": {
    functionName: "exportClientErrorLogsCsv_createServerFn_handler",
    importer: () => import("./error-logs.functions-Ce1iI9j7.mjs")
  },
  "a639e45b91383ff82bab3881df24afaa98bc9560ff474732891930ab4107ee1b": {
    functionName: "earnChatMessage_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "a69dbd564799d575578bb2f5698f682d5d2290882438177360a14b8721fdd78c": {
    functionName: "listUpdates_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "a6c138be74badb14b5ed205af433e1608065ae9dbdf0ad3a081d755135ddc241": {
    functionName: "moderateConfession_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "a6c37b4769d6e5fe825ae79bec42e52190b367a628e7e8c9e9dc8feb06d8947a": {
    functionName: "listMyDrafts_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "a7503f40011204dcbc25e5638f167cd6bf992498c6faf25bd9175c9d770c90e1": {
    functionName: "resolveClientErrorLog_createServerFn_handler",
    importer: () => import("./error-logs.functions-Ce1iI9j7.mjs")
  },
  "a80078a637efef6af0a95783abd31cfa165dea2fdd5ef296899349311d6eb8e1": {
    functionName: "saveAIChatSettings_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "a9424254cfab74772210379a43d0fda4b470c0aeb3bc65d30b62ddbe96d9efec": {
    functionName: "toggleWordFilter_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "a9c9b42eac63b94a853b1d8ed974479894665b78b67824dac8984ecf73993b12": {
    functionName: "followCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "aa20e99aac3bbbc0c3801ef649d3e8c9a9b85ac97cf0ce72a034a9edc19bfe62": {
    functionName: "listInvites_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "ab172b00f1dc49082ff726caa6c0b44fe22a12a7ef92a7b8a9be9bba8075a51b": {
    functionName: "adminActivateLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "ab3b07ff9ee4a546390a97072e6c8d16850cae428cc4f04c916a369d8be1fb6e": {
    functionName: "trackLinkClick_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "abe1c0279ef5da0d6f6138d08181e1422ea8727e3292f80a1c803e22a441811a": {
    functionName: "earnFeedReaction_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "abea224403a1795ed57c910fdd98c994f19a9c502a68ef3646e031ae1ef98cf7": {
    functionName: "testDatabaseConnection_createServerFn_handler",
    importer: () => import("./installer-diagnostics.functions-CVMxeR2o.mjs")
  },
  "ac346e3fdc98c2ed525afe5716d25f739ade78bc45d84cd9812d5b48e95752a1": {
    functionName: "listFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "ac484ab6ed274e8b32857bd6d66c71c5469a0e0dd7676572b1fe95f91be4beaf": {
    functionName: "scanContentImages_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "ad75fb9944eec0d95794e659b8ac2de998b6c81b27128a3e5548eb5eb4908dd9": {
    functionName: "previewUpdate_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "ae8d5b32296eacdb3375f6d817cf7d2fb2c8fe376dec13b4c37571fa66072c81": {
    functionName: "canSendDm_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "aef26b7bc6dc9c68010d4d23199dda9f05002497df672a5df92bfe911a89e3e0": {
    functionName: "checkAuth_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "af6ac5a99c58f0d8f2abf76e141f0507315a5bf310a1a5dc8d5855b2df7891f3": {
    functionName: "getMyTransactions_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "b00abe4c792d8e622eece08904eb5d5e9643b4aa7888ec6accb75d77f73c3223": {
    functionName: "listAnnouncements_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "b096ee15c36458b0d7535022b5619f0cd76279ba31067a48381ef9b36acfdefc": {
    functionName: "saveCommunitySetup_createServerFn_handler",
    importer: () => import("./owner-setup.functions-BIwCUEJ3.mjs")
  },
  "b0c0148f8022a9c6676468e9db620f0e1bb1181ec0666b5a027a4b6c007c4829": {
    functionName: "deleteMessageMod_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "b0ce4466e74c0c34f7b2b1633e36d6e27c1eadf93ca1e7da079b481ef7177ee4": {
    functionName: "updateAnnouncementsConfig_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "b18caa2d5b824c8d828677e32ac57d2ed5a92937cfa661e6ae35b0c470847c41": {
    functionName: "restoreDatabaseSql_createServerFn_handler",
    importer: () => import("./backup-restore.functions-OW5CMs7K.mjs")
  },
  "b23105094f3791c20564aafcb55d4513a9a511700ee837f54fae17db7ef7ee14": {
    functionName: "muteUser_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "b2736948b3ed9320e7a99f4b6a35366a43c754613a28e2d9db81b477564db6ef": {
    functionName: "adminSaveCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "b3a44c66360258d8f963e94ce6a405384e8a84aa7db85e44e222350aaf47c458": {
    functionName: "getPublishedPage_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "b47e9f78647e19555411c5d63f3a26ebdc3bc09690bc793f4441ef0f710574d2": {
    functionName: "setFeedContentStatus_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "b48b26c01f41999b9aa90fdc2f40daa68da72f6a3387726cac6a96d04dce00a6": {
    functionName: "highlightMessage_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "b50db06716d948b1841528ebb0d3fe9bbf5de40d873e32a4b0c4bc5b0d601f88": {
    functionName: "adminSuspendLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "b5490f50d948d65c932096de75a53003b24aeac3396f34149e288ed05973c2e5": {
    functionName: "deleteCollection_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "b685c3810cc3f2ab1046d8af50f73318ac21681ad8af3126202c800b1775835e": {
    functionName: "saveMyAssistantPrefs_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "b77ac8f3e89f8a411abb2c4b3ee4b25e114db5d9641308ce7be61d7eace9a3c3": {
    functionName: "listSafetyKeywords_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "b8a833ff452c25935f4170870d7a6eb668654154c7cda81e74bb018f36487917": {
    functionName: "getDiscoveryStats_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "b939b56fd31a3f2f0aaba2c9cb16fdd9cf6330b01526e36342f7182a3c7f36c4": {
    functionName: "searchCommunities_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "b963e5dbd814aaf870c63993e3271be5d7638e1e1da717c13b2e7895551e5eee": {
    functionName: "getTopUsers_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "ba25933fa0ac4b6e8477fdd236ac049c2bdf6bcc1d005ff51b05b06670fd7777": {
    functionName: "listUserCollections_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "ba4e0c7be3f2edbb44873ec181e3b54b86e1ad34a146507ca124e5ff1cb56c7a": {
    functionName: "validatePackage_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "ba883a1693559ad198909b50bd15941a250a0bde2ac8af83891fb0bb74540a6b": {
    functionName: "listCompetitors_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "bafd8e3de8004b940403bbd91f75868192df7e865b06fb4579d7fc231fee743c": {
    functionName: "adminImportLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "bc043367e3258bc0750efadc2962d5983ded7a90f892e25e8da034f07aee469d": {
    functionName: "getMyRoles_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "bc75a214afa83adcc42923f7f934130909277897a11b75349013e5ef58a9fa46": {
    functionName: "ensureRequiredBuckets_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "bceef2701b7def3d01429a3b8547ce1d33d49c4888f1c347b5f8c09707be600d": {
    functionName: "listUrlRules_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "bcf401160e911f0ebcb3a38bfbdee41bc6c3e3202dec985efeaa3eb78d6e3099": {
    functionName: "getOwnerStatus_createServerFn_handler",
    importer: () => import("./owner-setup.functions-BIwCUEJ3.mjs")
  },
  "bd4924d1cd3a76392b82aaabb72738c280150427f254c19b1d8a0dfb6c0b31a3": {
    functionName: "markBackupVerified_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "bdaa4a16f7e0c0233305890b409586023c304b8a9321e99e4ea1d95ed163dfd4": {
    functionName: "updateCommunityVisibility_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "bdf7bd93a27cc988cfb6bb523baf2c9b02b0f384b7d33a4045d410dad142720d": {
    functionName: "setBackupRetention_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "bf04213158e148e39b16cdb434168bfc6967b097cdfb28de018b72cc67d3a5d1": {
    functionName: "getMyCommunity_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "bfd9897b99fa2d9b86022ed5e044d91dd85ce1cfeba6414cd9fde8bf47eb053b": {
    functionName: "getWriterStats_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "c08cff9bc636034a6982cddd28bd65448032e2c599c421ef83e3fd5226576ecc": {
    functionName: "activateLicense_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "c0af6546ecab321a145c58ff9d965ec338948ecd50e71b1cb8b448afe32d6bc6": {
    functionName: "leaveCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "c19e7a56000db35b15f020f4f1ef048a387378464f9a8e7fe123a8ccb6f1441c": {
    functionName: "getBroadcasterAnalytics_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "c283f16416662d40da82dda155729965674669099ec0392ab025b72be2c29163": {
    functionName: "uploadCommunityAsset_createServerFn_handler",
    importer: () => import("./owner-setup.functions-BIwCUEJ3.mjs")
  },
  "c2af82fb7ae15ee4fd71262e76f7268d0e071a56c6171e3e990f537cd2e40fec": {
    functionName: "getGamificationAnalytics_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "c39bcfda5c631e26839affbb0da89c71120e0a0c82e77ecd380845338749f5af": {
    functionName: "saveFeedbotSettings_createServerFn_handler",
    importer: () => import("./feedbot.functions-CilCnZrQ.mjs")
  },
  "c40f74d1a45590fdf525f74684e4f6e44cf523aa76a14f23fd4706087ee9d02d": {
    functionName: "leaveGame_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "c465015787dbaa9c954db141adefed69510981317ee31153ef67e7865a42a5a6": {
    functionName: "canEditAnnouncements_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "c51331d8664ee9a1b99eccabd850522a922888a9a04337e7aa9a1384fc92b1e6": {
    functionName: "revokeApiKey_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "c5de9c0a853d8bf4f45a9fa48ef0231bfaad52960f65f2485027c597cc602bf3": {
    functionName: "listDeliveries_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "c62be101f2c501c1850f4c6e574d06746d9220330c4324d9a4a18a0419bc82f8": {
    functionName: "toggleReaction_createServerFn_handler",
    importer: () => import("./confessions.functions-gWkCC9CG.mjs")
  },
  "c62ca6743b3701289cbb5ba9a86f49f0135d647ba9a9d961a1f456cd9e56f241": {
    functionName: "restoreBackupDryRun_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "c690cda28e2c6fbe81128e275c71c570f1d8a5d3b9deca57af0fe77c9c9a3de4": {
    functionName: "getSubscriptionMode_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "c753d0f79cfc16e9348a58af7ddcd552d76a8cda777332c5150ddd7b8aa1e698": {
    functionName: "getPage_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "c76477e20f6378f36f675d09ca2c44cb76f622caebac8e16eb7e80c0c813f7fe": {
    functionName: "getCompetitionAnalytics_createServerFn_handler",
    importer: () => import("./competition-analytics.functions-ChACVlwe.mjs")
  },
  "c89fdb10b9d1e0fceada7191107516b7eb6da58da6b6688bbf2ee72bfac5ad9f": {
    functionName: "adminChangeDomain_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "c8dc05908bcfafe8309c06d116f0850bc89691661a0a3dbf6293c27266b995c8": {
    functionName: "recordBackupHistory_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "ca2072252a78efb63f5598b294177f9ea35af0c1ffeffd291bbe5ae0a865057d": {
    functionName: "getSafetyOverview_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "cae8cf0592ed74179d08a1c15f4fe008adfedcc57a668612f90f57f2dac24397": {
    functionName: "syncSeoRoutes_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "cb0c6322729c2419cea2991a22a37cc7395b3c8734892d0ec6aee5a5b5dc45ae": {
    functionName: "clearDeployCheckCache_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "cbfbda44a4f28b17490b00aec2039a6416cd71794c7efa7247d59fdc2ef2eef8": {
    functionName: "getPoemBySlug_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "cc3ece2778f4bb9208b42026bb7c23871455866df85978a3afd4260571d6ec8d": {
    functionName: "getMyInventory_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "cc9df207272b849fa07266ae389d8eeba88f9cb39ba8bd5ea6597564eefd524f": {
    functionName: "checkUsernameAvailable_createServerFn_handler",
    importer: () => import("./auth.functions-BXwD5dVA.mjs")
  },
  "cd24889e1cff60a3809a2fe89436a43d2a22dd5403857be445005f5c066600ef": {
    functionName: "adminDeleteCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "cd4166158dfa889a61bbe2d625174c679b8fc908e5b4f3644d160e3909255691": {
    functionName: "createLudoMatch_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "ce4548f7990841c825d719824fc54decd25b0b255e1195c9ee0ba78865de8352": {
    functionName: "getBroadcasterSettings_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "cec00d7120fa5ed28fc0eab31bec45ba65a47b2ecf5a1f9ee98f6b2817ff8495": {
    functionName: "listFeedModerationQueue_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "ced235494f0a6bfda039567817f1a45eca6126dd7406634f8380afa170f6b060": {
    functionName: "schedulePoem_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "cfd2382269f5a0c8188d9f826e3ead33576028dc037baa0b3c8b254adf1c1793": {
    functionName: "listMessageRequests_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "d04d6ffa6de6962798775c2d3d03821969b1fb215d018108edb9db09b893db94": {
    functionName: "markPlayed_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "d18b369204e6391491673b3efdcdeb8b7dfb88d43aa31cf9e206d4d70aa2bc4b": {
    functionName: "listPoemsByCategory_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "d2156818498792cb7788fcd6710842f3b3789792fd693ce5ad801bdd899bb90b": {
    functionName: "leaveCommunity_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "d228d473d746d58980344d2c06733095057ceb8d313c3ac6debf60b3d60b6e08": {
    functionName: "adminUpdateFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "d26328e6ea7fc3a67aa5e8c7fa807565a02abca187435011918b129469deab8a": {
    functionName: "generatePublicSitemap_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "d298245276cf4685cce59f087db7ceb6d3e7f79bf9b571300da7b5f7cc309330": {
    functionName: "getPublicSeoForPath_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "d38cd20832451dfce02f356b71412befb301614846107b83511c64ee08002b41": {
    functionName: "addUrlRule_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "d3fbc3c38eae1a113befecb843e3b35df67c53fcb7eae10955fdd59f44947fdb": {
    functionName: "upsertSeoPage_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "d41df9bb37178408e5eaadda53c3c50a028eeb54f5e2081e2adca12cc585aabf": {
    functionName: "banUser_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "d421e0c69082bec8c49e9d432715728ac0e6de8a3918513ca03496a82bbcebf6": {
    functionName: "adminDeletePlan_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "d4a5497fdbf8b0d2e1be330c9f05158da004d5c46a0fa7d176893580e611c32f": {
    functionName: "adminBulkSetEntryMode_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "d4aa01f3445ece0e9e7bab3f457d3283a9db9d332220a9a21a081cb5f7c0fc87": {
    functionName: "createInvite_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "d4f043ae2bae1e1c5d64d642dae2a1a50f1324fa30664816663b99571d0b9273": {
    functionName: "getSeoManagerState_createServerFn_handler",
    importer: () => import("./seo.functions-B1nEqLPj.mjs")
  },
  "d5a2761f6587ce0e4e655590f92ab3275a0110ef756960039d01dd89c7dd961c": {
    functionName: "listSafetyEvents_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "d664a8874ca419990ea235654adaa476a19c7a88633bcf6f705e5c961c3e54fe": {
    functionName: "getMyGamification_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "d6674633d78fc58660389116c1363ccf2c0db8459a5d2b2130f55f06a4552e6c": {
    functionName: "deleteBackupHistory_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "d6e9d1a8d3fcfbaf515ce5e454bc9b27705b337807c6d2b92979519496550641": {
    functionName: "applyLinksToPage_createServerFn_handler",
    importer: () => import("./internal-linking.functions-D9gmEym9.mjs")
  },
  "d7af495f5a35b4ed53372d02267b6f08f2c177b5caeefddca0eb0d74cafef5f3": {
    functionName: "removeQueueItem_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "d893da156a04cbdd607e7ad3e4eaa543fd0c0accceed7c33c4b2b206399cda9e": {
    functionName: "earnFeedShare_createServerFn_handler",
    importer: () => import("./economy.functions-CcAU1A4K.mjs")
  },
  "d8993bd40f9162497be09e35e3e219129afc683ceeb885dc57ad49e227c2d53b": {
    functionName: "listUsersWithRoles_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "d93d7fe63cd82e512cabd86b7231e6836e56f0c717e97d19bd1f8feb9e38f2fd": {
    functionName: "getMehfilHallOfFame_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "d9794dd4eeda923f6716cb98ae2b68c8a94e4df0190a97a183ee63c92eb71dbe": {
    functionName: "createWidget_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "db33524fd42a975603b13e27b6d69ac2055a96784e66d23609a047fef3f5e764": {
    functionName: "unfollowCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "db980dd7fbef43d3fc13d10ddc5f8ed5aae0f52362aa36d741670b7c62aab77f": {
    functionName: "setUserRole_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "dc3dc44493f17d509094b6c748c6841c68919188cd2f82050cac428ac5611453": {
    functionName: "getMyCompetitorVote_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "dcc8507c92a23e8f3ec6ecae8baf6d72fd47142a008a0a143e5bf035f4785a68": {
    functionName: "getFeedbotSettings_createServerFn_handler",
    importer: () => import("./feedbot.functions-CilCnZrQ.mjs")
  },
  "dcfe95d5642057086e7defe9c72f01c79874bfd7eac671fe271cb638aa9944e7": {
    functionName: "getTrustSafetySettings_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "de6be986d7e30dd814311362a6cdd7c697b6ebcf57d003dd11d8bbb29300ad56": {
    functionName: "uploadMediaFile_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "dea1e7bf394b0e9400c44ad97ae3d16e6cf1c36154ae012f5214936f0fa974b0": {
    functionName: "requestSubscription_createServerFn_handler",
    importer: () => import("./subscription.functions-DYcRW-F1.mjs")
  },
  "dee789de6065d63c67f8ff2db3be3eaa7a2f980f2cea7a84c0f3c82b6f37893d": {
    functionName: "listApiKeys_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "def86cf4221a567a0df4b29ba809cef73663b77fcf06f76656fc2857e33c4d0f": {
    functionName: "rollDice_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "defa6110596eced07887b9c70507327d97ab81a6c1f06e2b23ca96aafcbd300c": {
    functionName: "restoreFeedPosting_createServerFn_handler",
    importer: () => import("./feed-moderation.functions-BeNlcj8J.mjs")
  },
  "df4fdbe6e2c28811c724b6c7bfe6f800d4fa2746431b26a78284cb859ea082f6": {
    functionName: "uploadUpdatePackage_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "df77482e56e300bfcd7faec1942d1333f3dfb5495d55c9c51106692732f9e4e6": {
    functionName: "checkStorage_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "dfda0607f9d90384071147bc1c5a452e3c58aeb07cc455aa9bcbcdb7f29c68a4": {
    functionName: "getFeedback_createServerFn_handler",
    importer: () => import("./feedback.functions-B9BKD5Jb.mjs")
  },
  "e03f296dae9ac6f37078e91caa50f7a68178ff9512da63209e5206e1818e2899": {
    functionName: "getInviteLanding_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "e26d54fd4bb85730b3dd66f1b502cc31e7da8b91f4fd161a5b19ad2562e4d543": {
    functionName: "adminResetUserPassword_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "e3035232fe8249b1549f38104875512e5a8f83800ae39aab13bf71b2c16891da": {
    functionName: "removeWordFilter_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "e666ea7defb2607f8705e98e5caec4718d862aabbfe81fceb990cb84a1028fc0": {
    functionName: "getAllSettingsAdmin_createServerFn_handler",
    importer: () => import("./admin.functions-CvvKK4GV.mjs")
  },
  "e6d5c7b488bc67682bc11cdc41e0e5486a9b60d8c3485e23e3f3b92747fb568b": {
    functionName: "deleteDraft_createServerFn_handler",
    importer: () => import("./mehfil.functions-j4xfnpra.mjs")
  },
  "e7ed242c39ec13f8d3aa7910ec2539ecc7043f67718d34ee659cd614f21741b2": {
    functionName: "getMehfilSettings_createServerFn_handler",
    importer: () => import("./mehfil-admin.functions-CKOSjE4E.mjs")
  },
  "e817a1fbd3e4a83668c53d2132ad9c65dc0438c4e2dc7455db5c6b5a219313a1": {
    functionName: "revokeInvite_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "e8b5e654a43949cb0fc1bcab7be5f55ca0a57fac0c984f0c76a5385514c34c85": {
    functionName: "decideJoinRequest_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "e9e94714a8a9bd0fcd4be9b129b47f32141edd101dc1a9f4d6031b9aebc88b7f": {
    functionName: "restorePosting_createServerFn_handler",
    importer: () => import("./moderation-engine.functions--CY1eBHM.mjs")
  },
  "e9f3dcd15790dab36e2a321430bd5c045f80b2f5dc919be2fa4c0fa74df482c3": {
    functionName: "claimSeasonTier_createServerFn_handler",
    importer: () => import("./gamification-engine.functions-D0SQY4hl.mjs")
  },
  "eaa3c7c28ecf16a343af3795ace756c843f2b7ee6ddd16a002bc92d58a88865b": {
    functionName: "getModerationOverview_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "eace701c619a302cb6a046782813dcc165bf42a7c2b2eb14bc4721174877222b": {
    functionName: "getLeaderboard_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "eb61c5a988519683da5756945958912d2ab48fa4ff74f89b6e3e63b791fb9af0": {
    functionName: "respondMessageRequest_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "ebc0c19a69a4ea65b0f1e5201aa9e1664821939a62b6bf6715875cc218b17741": {
    functionName: "getBoobubblePublic_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "ec4091dc2c2bc0f492380cf5fb79bc0983634c6a120aee38fada23fcb07ef97d": {
    functionName: "backupMediaManifest_createServerFn_handler",
    importer: () => import("./backup.functions-CLmu6Nxk.mjs")
  },
  "ecb7070c1281ba5545a77ec6769683758473aaf767b8abeae0658c2bea8d8718": {
    functionName: "markRestoreTested_createServerFn_handler",
    importer: () => import("./backup-history.functions-Cq38n3nT.mjs")
  },
  "edfe09d4ab84382f150adb3a94567c357c77596132dc9e901e2faf6f5ad667cc": {
    functionName: "importPages_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "ee442200247ecaa0fe19333bddddcf6c3dcc584e9bbaa2372353caa75e8090c0": {
    functionName: "removeSafetyKeyword_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "eed1a7beeda13b4a04f01404389fc5b6b3d5984b0f4481ffd2f0c0701f5f09de": {
    functionName: "joinQuickMatch_createServerFn_handler",
    importer: () => import("./games.functions-Bw8Poj4Z.mjs")
  },
  "eeef740b2b4c6fe83d5df6b846a5af8e45db89fc19aaedc59ae22198a4e65f80": {
    functionName: "listMyFollowedCompetitions_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "eef0a829cb0d8fcfa5b9d21f8a506836714b10743adc1e637795952c76e2d746": {
    functionName: "deleteWidget_createServerFn_handler",
    importer: () => import("./broadcaster.functions-qef0d-Ff.mjs")
  },
  "ef6f958b166801e907900045fbc260dc1f2036fcddbf97ace2ccb13bd8bfac39": {
    functionName: "voteForCompetitor_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "f3689f5104b0f12d05285dbfe30031f089ef0578a6c8212b40b65447c7ca92c6": {
    functionName: "exportPages_createServerFn_handler",
    importer: () => import("./pages.functions-BKNaQzdZ.mjs")
  },
  "f3d228f71174d2627a413c5bde8c1df6a81b573be644681bf92372e066b8057f": {
    functionName: "testWebhook_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "f4653e3bb99cbf159fa69ff5faea7248a3d8f0dd78c20b3186ed6408479ab38d": {
    functionName: "runUpdate_createServerFn_handler",
    importer: () => import("./updates.functions-G_fJAIFn.mjs")
  },
  "f520b38f064f1ae87c82f62d6b468c4e5acc9bc893fcf820bc76bfb7350a941b": {
    functionName: "joinCompetition_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  },
  "f6a09b38bbc16b2695f359881b3c30da2c0982a5fb7f6b55173277d96293b991": {
    functionName: "createOwner_createServerFn_handler",
    importer: () => import("./owner-setup.functions-BIwCUEJ3.mjs")
  },
  "f6f22a24aa17d1a34b9f66960b7af47ce6d1b888f6fcd1274fcb7f884bc9cdcb": {
    functionName: "deleteClientErrorLog_createServerFn_handler",
    importer: () => import("./error-logs.functions-Ce1iI9j7.mjs")
  },
  "f7de6d8e9da976fdc2b72f697da43f50e538ef7e8ca8e73ba2f36e197b33c6ea": {
    functionName: "updateWebhook_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "f8546d24a7bdf4f2f5cba6f8f1269ac5d94dc5c01bb4063045ab63b025633fc4": {
    functionName: "sendTestAnnouncement_createServerFn_handler",
    importer: () => import("./feedbot.functions-CilCnZrQ.mjs")
  },
  "f8a5da6671501701944dfe0a2e7372bbc05a5124bb10eb2a646dd396c6383c1d": {
    functionName: "checkRuntime_createServerFn_handler",
    importer: () => import("./deploy-check.functions-CifC-FIU.mjs")
  },
  "f9444fedbacadb230b1c7b55a7d929a59e752dabcaaa54fc8cd79a85e5ab78f0": {
    functionName: "filterPublicText_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "f98517c9a31ed5258d74508da92aa5be0e841032231ecf213c4806d1a84331a9": {
    functionName: "listPremiumSlugRequests_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "f9eb70435824945d9ec1a72b8875c2a5b47a29d1008f4b084ba2330b7c394d44": {
    functionName: "createApiKey_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "fa58209555e8a113f3cdbc550b20ed6ff277139481359d1ca5ae826fcc3fb46e": {
    functionName: "updateAIChatbot_createServerFn_handler",
    importer: () => import("./ai-chatbots.functions-DqIaUs-_.mjs")
  },
  "fa8bf24e3dee9e07bc3a7a6f8643d30ce3953c5e85c17831df0ee35c8dd620a2": {
    functionName: "createCollection_createServerFn_handler",
    importer: () => import("./poetry-social.functions-CD5_eYos.mjs")
  },
  "fb70aaa06794d903b902289664b0c93252ce39afe7c9a51dcab43ab503f05c71": {
    functionName: "saveCompetitionsFeedSettings_createServerFn_handler",
    importer: () => import("./competitions-feedbot.functions-CT7_j57j.mjs")
  },
  "fbff7a3056b9aedd5379c245b06b1f2f208837a89c7f223b1c99037307c7df60": {
    functionName: "adminListLicenses_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "fc2b1a748d338abb64f21c551a45e8dbcdf590f8f968f3b3f32715ef8ae22e33": {
    functionName: "createWebhook_createServerFn_handler",
    importer: () => import("./api-webhooks.functions-CkDyrwN_.mjs")
  },
  "fc3f3f8de160d7f9894440393568379683b5079888639cdc7fa62c5c935eb5af": {
    functionName: "updateCommunityPrivacy_createServerFn_handler",
    importer: () => import("./community.functions-C0vlzdTg.mjs")
  },
  "fd6520cef91ba39011767bcc40e520dd7b0eadb7ec9d7a5e44e7a614f0323af8": {
    functionName: "getBootstrapStatus_createServerFn_handler",
    importer: () => import("./installer-bootstrap.functions-DMhlWdzK.mjs")
  },
  "fe5406d93004a6a746f7847f23814f7b0a968dab8ac795a53300cb1842610b0c": {
    functionName: "triggerSecurityDigestIfNeeded_createServerFn_handler",
    importer: () => import("./boobubble.functions-DcyU-6nC.mjs")
  },
  "fe90f2cf958f24d37819c992306e3d620ff6997cadc8dd247eba4dd9f5f398a0": {
    functionName: "deleteTestimonial_createServerFn_handler",
    importer: () => import("./testimonials.functions-fUCuhMy5.mjs")
  },
  "ff8c0a61a79b57da390792cc6660261c99b5e4cd5a9f3c3886b728415befe6b0": {
    functionName: "spinDailyWheel_createServerFn_handler",
    importer: () => import("./rewards.functions-B1HxOVHd.mjs")
  },
  "ffa89cc04bcc37686599f76c58fe62a72a45ddeaf6d23801ed70af1573225f47": {
    functionName: "listModNotes_createServerFn_handler",
    importer: () => import("./moderation.functions-D2yvDOHA.mjs")
  },
  "ffd1d9233c0342d8409209770bb0e028c6996c1eb0b5db279e24fd7d6bafe9ff": {
    functionName: "updateTrustSafetySettings_createServerFn_handler",
    importer: () => import("./trust-safety.functions-DEHkkkKt.mjs")
  },
  "fff36db4427bf10a5a18341e81ab3e3ce05b3da6a0860ffa88d1f3b467305146": {
    functionName: "adminExportLicensesCsv_createServerFn_handler",
    importer: () => import("./manager.functions-BoIs2CI_.mjs")
  },
  "fffe27eb81fdad1290a2d5c3c0f5fa3616bb44aa6fcc3653c39be32db1c9e778": {
    functionName: "adminListCompetitorVotes_createServerFn_handler",
    importer: () => import("./competitions.functions-VgEd-Mhd.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const setValidator = (validator) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      validator,
      inputValidator: validator
    });
  };
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    validator: setValidator,
    inputValidator: setValidator,
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      let validator = "validator" in nextMiddleware.options ? nextMiddleware.options.validator : void 0;
      if (!validator && "inputValidator" in nextMiddleware.options) validator = nextMiddleware.options.inputValidator;
      if (validator && env === "server") ctx.data = await execValidator(validator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.validator ?? options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  const setValidator = (validator) => {
    return createMiddleware({}, Object.assign(resolvedOptions, {
      validator,
      inputValidator: validator
    }));
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    validator: setValidator,
    inputValidator: setValidator,
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server2) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server: server2 }));
    }
  };
};
var innerCreateCsrfMiddleware = (opts = {}) => {
  const middleware = createMiddleware().server(async (ctx) => {
    const csrfCtx = ctx;
    if (opts.filter && !await opts.filter(csrfCtx)) return ctx.next();
    if (await isCsrfRequestAllowed(opts, csrfCtx)) return ctx.next();
    return getFailureResponse(opts, csrfCtx);
  });
  return middleware;
};
var createCsrfMiddleware = innerCreateCsrfMiddleware;
async function isCsrfRequestAllowed(opts, ctx) {
  const result = await getCsrfRequestValidationResult(opts, ctx);
  return result === true || result === void 0 && opts.allowRequestsWithoutOriginCheck === true;
}
async function getCsrfRequestValidationResult(opts, ctx) {
  const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
  if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
  const origin = ctx.request.headers.get("Origin");
  if (origin !== null) {
    if (opts.origin) return matchValue(opts.origin, origin, ctx);
    return origin === new URL(ctx.request.url).origin;
  }
  const referer = ctx.request.headers.get("Referer");
  if (referer === null || opts.referer === false) return;
  if (typeof opts.referer === "function") return opts.referer(referer, ctx);
  if (opts.origin) {
    const refererOrigin = getOriginFromUrl(referer);
    return refererOrigin !== void 0 && matchValue(opts.origin, refererOrigin, ctx);
  }
  return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
}
async function matchValue(matcher, value, ctx) {
  if (typeof matcher === "function") return matcher(value, ctx);
  if (Array.isArray(matcher)) return matcher.includes(value);
  return value === matcher;
}
function getOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return;
  }
}
function isRefererSameOrigin(referer, requestOrigin) {
  if (referer === requestOrigin) return true;
  if (!referer.startsWith(requestOrigin)) return false;
  if (referer.length === requestOrigin.length) return true;
  const code = referer.charCodeAt(requestOrigin.length);
  return code === 47 || code === 63 || code === 35;
}
async function getFailureResponse(opts, ctx) {
  if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
  return opts.failureResponse?.clone() ?? new Response("Forbidden", {
    status: 403
  });
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return Ou(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          cu(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = Ou(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(lu(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
var LINK_PARAM_TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var PRELOAD_AS_VALUES = /* @__PURE__ */ new Set([
  "fetch",
  "font",
  "image",
  "script",
  "style",
  "track"
]);
function buildLinkParam(name, value) {
  if (value === void 0) return name;
  if (LINK_PARAM_TOKEN_RE.test(value)) return `${name}=${value}`;
  return `${name}=${JSON.stringify(value)}`;
}
function serializeEarlyHint(hint) {
  const parts = [`<${hint.href}>`, buildLinkParam("rel", hint.rel)];
  if (hint.as) parts.push(buildLinkParam("as", hint.as));
  if (hint.crossOrigin !== void 0) parts.push(buildLinkParam("crossorigin", hint.crossOrigin || void 0));
  if (hint.type) parts.push(buildLinkParam("type", hint.type));
  if (hint.integrity) parts.push(buildLinkParam("integrity", hint.integrity));
  if (hint.referrerPolicy) parts.push(buildLinkParam("referrerpolicy", hint.referrerPolicy));
  if (hint.fetchPriority) parts.push(buildLinkParam("fetchpriority", hint.fetchPriority));
  return parts.join("; ");
}
function getStringAttr(attrs, name, fallbackName) {
  const value = attrs?.[name] ?? (fallbackName ? attrs?.[fallbackName] : void 0);
  return typeof value === "string" ? value : void 0;
}
function getPreloadAs(attrs) {
  const as = getStringAttr(attrs, "as");
  return as && PRELOAD_AS_VALUES.has(as) ? as : void 0;
}
function addEarlyHintFetchAttrs(hint, attrs) {
  const crossOrigin = getStringAttr(attrs, "crossOrigin", "crossorigin");
  const type = getStringAttr(attrs, "type");
  const integrity = getStringAttr(attrs, "integrity");
  const referrerPolicy = getStringAttr(attrs, "referrerPolicy", "referrerpolicy");
  const fetchPriority = getStringAttr(attrs, "fetchPriority", "fetchpriority");
  if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
  if (type) hint.type = type;
  if (integrity) hint.integrity = integrity;
  if (referrerPolicy) hint.referrerPolicy = referrerPolicy;
  if (fetchPriority) hint.fetchPriority = fetchPriority;
}
function linkAttrsToEarlyHint(attrs) {
  const href = getStringAttr(attrs, "href");
  const rel = getStringAttr(attrs, "rel");
  if (!href || !rel) return void 0;
  const relTokens = rel.split(/\s+/);
  let hintRel;
  let hintAs;
  if (relTokens.includes("modulepreload")) {
    hintRel = "modulepreload";
    hintAs = "script";
  } else if (relTokens.includes("stylesheet")) {
    hintRel = "preload";
    hintAs = "style";
  } else if (relTokens.includes("preload")) {
    hintAs = getPreloadAs(attrs);
    if (!hintAs) return void 0;
    hintRel = "preload";
  } else if (relTokens.includes("preconnect")) {
    hintRel = "preconnect";
    hintAs = void 0;
  } else if (relTokens.includes("dns-prefetch")) {
    hintRel = "dns-prefetch";
    hintAs = void 0;
  }
  if (!hintRel) return void 0;
  const hint = {
    href,
    rel: hintRel
  };
  if (hintAs) hint.as = hintAs;
  addEarlyHintFetchAttrs(hint, attrs);
  return hint;
}
function collectStaticHintsFromManifest(manifest2, matchedRoutes) {
  const hints = [];
  for (const route of matchedRoutes) {
    const routeManifest = manifest2.routes[route.id];
    if (!routeManifest) continue;
    for (const link of routeManifest.preloads ?? []) {
      const attrs = getScriptPreloadAttrs(manifest2, link);
      const hint = {
        href: attrs.href,
        rel: attrs.rel,
        as: "script"
      };
      if (attrs.crossOrigin !== void 0) hint.crossOrigin = attrs.crossOrigin;
      hints.push(hint);
    }
    for (const link of routeManifest.css ?? []) {
      const stylesheetHref = getStylesheetHref(link);
      if (manifest2.inlineCss?.styles[stylesheetHref] !== void 0) continue;
      const resolvedLink = resolveManifestCssLink(link);
      const hint = {
        href: stylesheetHref,
        rel: "preload",
        as: "style"
      };
      if (resolvedLink.crossOrigin !== void 0) hint.crossOrigin = resolvedLink.crossOrigin;
      hints.push(hint);
    }
  }
  return hints;
}
function collectDynamicHintsFromMatches(matches) {
  const hints = [];
  for (const match of matches) {
    const links = match.links;
    if (!Array.isArray(links)) continue;
    for (const link of links) {
      const hint = linkAttrsToEarlyHint(link);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function createEarlyHintsEvent(opts) {
  const nextHints = [];
  const nextLinks = [];
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.sentHints.push(hint);
    nextHints.push(hint);
    nextLinks.push(link);
  }
  if (!nextHints.length && opts.phase !== "dynamic") return void 0;
  return {
    phase: opts.phase,
    hints: nextHints,
    links: nextLinks,
    allHints: opts.sentHints.slice(),
    allLinks: Array.from(opts.sentLinks)
  };
}
function createResponseLinkHeaderEntries(opts) {
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.entries.push({
      phase: opts.phase,
      hint,
      link
    });
  }
}
function getResponseLinkHeaderEntries(opts) {
  if (!opts.filter) return opts.entries.map((entry) => entry.link);
  try {
    const links = [];
    for (const entry of opts.entries) if (opts.filter(entry)) links.push(entry.link);
    return links;
  } catch (err) {
    console.error("Error filtering response Link headers:", err);
    return [];
  }
}
function notifyEarlyHints(phase, event, onEarlyHints) {
  try {
    const result = onEarlyHints(event);
    if (result) Promise.resolve(result).catch((err) => {
      console.error(`Error sending ${phase} early hints:`, err);
    });
  } catch (err) {
    console.error(`Error sending ${phase} early hints:`, err);
  }
}
function getResponseLinkHeaderFilter(responseLinkHeader) {
  if (typeof responseLinkHeader !== "object") return;
  return responseLinkHeader.filter;
}
function appendResponseLinkHeaders(opts) {
  for (const link of getResponseLinkHeaderEntries(opts)) opts.responseHeaders.append("Link", link);
}
function collectResponseLinkHeaderEntries(opts) {
  for (let index = 0; index < opts.event.hints.length; index++) opts.entries.push({
    phase: opts.phase,
    hint: opts.event.hints[index],
    link: opts.event.links[index]
  });
}
function collectEarlyHintsPhase(opts) {
  const event = opts.onEarlyHints ? createEarlyHintsEvent({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    sentHints: opts.sentHints
  }) : void 0;
  if (event) notifyEarlyHints(opts.phase, event, opts.onEarlyHints);
  if (!opts.responseLinkHeaderEntries) return;
  if (event) {
    collectResponseLinkHeaderEntries({
      phase: opts.phase,
      event,
      entries: opts.responseLinkHeaderEntries
    });
    return;
  }
  createResponseLinkHeaderEntries({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    entries: opts.responseLinkHeaderEntries
  });
}
function createEarlyHintsCollector(opts) {
  if (!opts?.onEarlyHints && !opts?.responseLinkHeader) return;
  const sentLinks = /* @__PURE__ */ new Set();
  const sentHints = opts.onEarlyHints ? new Array() : void 0;
  const responseLinkHeaderEntries = opts.responseLinkHeader ? new Array() : void 0;
  const responseLinkHeaderFilter = getResponseLinkHeaderFilter(opts.responseLinkHeader);
  return {
    collectStatic: ({ manifest: manifest2, matchedRoutes }) => {
      if (!matchedRoutes?.length) return;
      collectEarlyHintsPhase({
        phase: "static",
        hints: collectStaticHintsFromManifest(manifest2, matchedRoutes),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    collectDynamic: (matches) => {
      collectEarlyHintsPhase({
        phase: "dynamic",
        hints: collectDynamicHintsFromMatches(matches),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    appendResponseHeaders: (headers) => {
      if (!responseLinkHeaderEntries?.length) return;
      appendResponseLinkHeaders({
        responseHeaders: headers,
        entries: responseLinkHeaderEntries,
        filter: responseLinkHeaderFilter
      });
    }
  };
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function escapeCssString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ").replace(/\r/g, "\\d ").replace(/\f/g, "\\c ");
}
async function transformInlineCssTemplate(options) {
  const { strings, urls } = options.template;
  if (strings.length !== urls.length + 1) throw new Error(`TanStack Start inlineCss template for ${options.stylesheetHref} is invalid`);
  let css = strings[0];
  for (let index = 0; index < urls.length; index++) {
    const transformed = normalizeTransformAssetResult(await options.transformFn({
      kind: "css-url",
      url: urls[index],
      stylesheetHref: options.stylesheetHref
    }));
    css += escapeCssString(transformed.href) + strings[index + 1];
  }
  return css;
}
async function transformInlineCssStyles(inlineCss, transformFn) {
  const transformedStyles = {};
  const transformedEntries = await Promise.all(Object.entries(inlineCss.styles).map(async ([stylesheetHref, css]) => {
    const template = inlineCss.templates?.[stylesheetHref];
    return [stylesheetHref, template ? await transformInlineCssTemplate({
      stylesheetHref,
      template,
      transformFn
    }) : css];
  }));
  for (const [stylesheetHref, css] of transformedEntries) transformedStyles[stylesheetHref] = css;
  return {
    styles: transformedStyles,
    ...inlineCss.templates ? { templates: inlineCss.templates } : {}
  };
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "css-url") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function assignManifestLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  const nextLink = {
    ...link,
    href: next.href
  };
  if (next.crossOrigin) nextLink.crossOrigin = next.crossOrigin;
  else delete nextLink.crossOrigin;
  return nextLink;
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source);
  const inlineCssEnabled = _opts?.inlineCss !== false;
  const scriptTransforms = /* @__PURE__ */ new Map();
  const transformScript = (url) => {
    const cached = scriptTransforms.get(url);
    if (cached) return cached;
    const transformed = Promise.resolve(transformFn({
      url,
      kind: "script"
    })).then(normalizeTransformAssetResult);
    scriptTransforms.set(url, transformed);
    return transformed;
  };
  if (!inlineCssEnabled) delete manifest2.inlineCss;
  else if (manifest2.inlineCss) manifest2.inlineCss = await transformInlineCssStyles(manifest2.inlineCss, transformFn);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads?.length) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = await transformScript(resolveManifestAssetLink(link).href);
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.css?.length && !manifest2.inlineCss) route.css = await Promise.all(route.css.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestCssLink(link).href,
        kind: "stylesheet"
      }));
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.scripts?.length) for (const script of route.scripts) {
      const src = script.attrs?.src;
      if (typeof src !== "string") continue;
      const result = await transformScript(src);
      script.attrs = {
        ...script.attrs,
        src: result.href
      };
      if (result.crossOrigin) script.attrs.crossOrigin = result.crossOrigin;
      else delete script.attrs.crossOrigin;
    }
  }
  return manifest2;
}
function buildManifest(source, opts) {
  return {
    ...source.scriptFormat ? { scriptFormat: source.scriptFormat } : {},
    ...opts?.inlineCss !== false && source.inlineCss ? { inlineCss: structuredClone(source.inlineCss) } : {},
    routes: { ...source.routes }
  };
}
function getStaticHandlerInlineCssDefault(handlerInlineCss) {
  if (typeof handlerInlineCss === "function") return;
  return handlerInlineCss ?? true;
}
async function resolveInlineCssForRequest(opts) {
  if (opts.requestInlineCss !== void 0) return opts.requestInlineCss;
  if (typeof opts.handlerInlineCss === "function") return await opts.handlerInlineCss({ request: opts.request });
  return opts.handlerInlineCss ?? true;
}
function createCachedBaseManifestLoader(loadBaseManifest) {
  let baseManifestPromise;
  return () => {
    if (!baseManifestPromise) baseManifestPromise = loadBaseManifest().catch((error) => {
      baseManifestPromise = void 0;
      throw error;
    });
    return baseManifestPromise;
  };
}
function createFinalManifestTransformResolver(transformAssets, opts) {
  const transformConfig = transformAssets !== void 0 ? resolveTransformAssetsConfig(transformAssets) : void 0;
  const cache = transformConfig ? transformConfig.cache : true;
  const warmup = !!transformAssets && typeof transformAssets === "object" && "warmup" in transformAssets && transformAssets.warmup === true;
  let cachedCreateTransformPromise;
  const clearCachedCreateTransform = () => {
    cachedCreateTransformPromise = void 0;
  };
  return {
    cache,
    warmup,
    clearCachedCreateTransform,
    getTransformFn: async (ctx) => {
      if (!transformConfig) return void 0;
      if (transformConfig.type !== "createTransform") return transformConfig.transformFn;
      if (!cache || false) return transformConfig.createTransform(ctx);
      if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(transformConfig.createTransform(ctx)).catch((error) => {
        clearCachedCreateTransform();
        throw error;
      });
      return cachedCreateTransformPromise;
    }
  };
}
function createFinalManifestResolver(opts) {
  const finalManifestCache = /* @__PURE__ */ new Map();
  const transformResolver = createFinalManifestTransformResolver(opts.transformAssets);
  const handlerDefaultInlineCss = getStaticHandlerInlineCssDefault(opts.inlineCss);
  const getRequestManifestOptions = async (requestOpts) => {
    const transformFn = await transformResolver.getTransformFn({
      warmup: false,
      request: requestOpts.request
    });
    const inlineCss = await resolveInlineCssForRequest({
      request: requestOpts.request,
      handlerInlineCss: opts.inlineCss,
      requestInlineCss: requestOpts.requestInlineCss
    });
    return {
      getBaseManifest: requestOpts.getBaseManifest,
      transformFn,
      cache: transformResolver.cache,
      inlineCss
    };
  };
  const resolveRequest = async (requestOpts, cache) => {
    return resolveFinalManifest({
      ...await getRequestManifestOptions(requestOpts),
      finalManifestCache: cache
    });
  };
  return {
    warmup: ({ getBaseManifest: getBaseManifest2 }) => warmupFinalManifest({
      enabled: transformResolver.warmup,
      handlerDefaultInlineCss,
      cache: transformResolver.cache,
      finalManifestCache,
      getBaseManifest: getBaseManifest2,
      getTransformFn: () => transformResolver.getTransformFn({ warmup: true }),
      onError: transformResolver.clearCachedCreateTransform
    }),
    resolveCached: (requestOpts) => resolveRequest(requestOpts, finalManifestCache),
    resolveUncached: (requestOpts) => resolveRequest(requestOpts, void 0)
  };
}
function getFinalManifestCacheKey(inlineCss) {
  return inlineCss ? "inline-css" : "linked-css";
}
function cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, promise) {
  const cachedFinalManifestPromise = promise.catch((error) => {
    if (cachedFinalManifestPromises.get(cacheKey) === cachedFinalManifestPromise) cachedFinalManifestPromises.delete(cacheKey);
    throw error;
  });
  cachedFinalManifestPromises.set(cacheKey, cachedFinalManifestPromise);
  return cachedFinalManifestPromise;
}
function getOrCreateCachedFinalManifestPromise(cachedFinalManifestPromises, cacheKey, computeFinalManifest) {
  const cachedFinalManifestPromise = cachedFinalManifestPromises.get(cacheKey);
  if (cachedFinalManifestPromise) return cachedFinalManifestPromise;
  return cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, Promise.resolve().then(computeFinalManifest));
}
async function buildFinalManifest(opts) {
  return opts.transformFn ? await transformManifestAssets(opts.base, opts.transformFn, { inlineCss: opts.inlineCss }) : buildManifest(opts.base, { inlineCss: opts.inlineCss });
}
async function resolveFinalManifest(opts) {
  const computeFinalManifest = async () => {
    return buildFinalManifest({
      base: await opts.getBaseManifest(),
      transformFn: opts.transformFn,
      inlineCss: opts.inlineCss
    });
  };
  if (opts.finalManifestCache && (!opts.transformFn || opts.cache)) return getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(opts.inlineCss), computeFinalManifest);
  return computeFinalManifest();
}
function warmupFinalManifest(opts) {
  if (!opts.enabled || opts.handlerDefaultInlineCss === void 0 || !opts.cache) return;
  const inlineCss = opts.handlerDefaultInlineCss;
  const warmupPromise = getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(inlineCss), async () => {
    const [base, transformFn] = await Promise.all([opts.getBaseManifest(), opts.getTransformFn()]);
    return buildFinalManifest({
      base,
      transformFn,
      inlineCss
    });
  });
  if (opts.onError) warmupPromise.catch(opts.onError);
  return warmupPromise;
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var defaultCsrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });
var getCachedBaseManifest = createCachedBaseManifestLoader(() => getStartManifest());
var getProdBaseManifest = () => getCachedBaseManifest();
var getBaseManifest = getProdBaseManifest;
var createEarlyHintsForRequest = createEarlyHintsCollector;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-CYWPFaDK.mjs").then((n) => n.dH),
    import("./start-B_03HagF.mjs"),
    import("./empty-plugin-adapters-BFgPZ6_d.mjs")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSsrResponse(result) || isSpecialResponse(result)) return { response: result };
  return result;
}
async function executeMiddleware(middlewares, ctx) {
  let index = -1;
  let streamResponse;
  const setResponse = (response) => {
    if (isSsrResponse(response)) {
      if (response.serverSsrCleanup === "stream") streamResponse = response;
      ctx.response = response.response;
      return;
    }
    ctx.response = response;
  };
  const disposeStreamResponse = async (reason) => {
    const response = streamResponse;
    if (!response) return;
    streamResponse = void 0;
    const currentResponse = ctx.response;
    if (currentResponse === response.response || currentResponse instanceof Response && response.response.body !== null && currentResponse.body === response.response.body) ctx.response = void 0;
    await response.dispose(reason);
  };
  const getFinalResponse = async () => {
    const response = ctx.response;
    if (!response) throwRouteHandlerError();
    if (!streamResponse) return response;
    if (response === streamResponse.response) return streamResponse;
    if (streamResponse.response.body !== null && response.body === streamResponse.response.body) return {
      ...streamResponse,
      response
    };
    await disposeStreamResponse("middleware response replaced");
    return response;
  };
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key === "response") setResponse(nextCtx.response);
      else if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        setResponse(err);
        return ctx;
      }
      await disposeStreamResponse("middleware error");
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) setResponse(normalized.response);
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  await next();
  return {
    ctx,
    response: await getFinalResponse()
  };
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const handlerOptions = typeof cbOrOptions === "function" ? {} : cbOrOptions;
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const finalManifestResolver = createFinalManifestResolver({
    ...handlerOptions
  });
  const resolveManifestForRequest = finalManifestResolver.resolveCached;
  finalManifestResolver.warmup({ getBaseManifest: () => getBaseManifest() });
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let responseOwnsCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const hasStartInstance = !!entries.startEntry.startInstance;
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        requestMiddleware: hasStartInstance ? startOptions.requestMiddleware : [defaultCsrfMiddleware],
        serializationAdapters
      };
      const flattenedRequestMiddlewares = requestStartOptions.requestMiddleware ? flattenMiddlewares(requestStartOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        if (false) ;
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        const { response: middlewareResponse2 } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          handlerType: "serverFn",
          context: createNullProtoObject(requestOpts?.context)
        });
        const result = await handleRedirectResponse(middlewareResponse2, request, getRouter);
        responseOwnsCleanup = result.serverSsrCleanup === "stream";
        return result.response;
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return normalizeSsrResponse(Response.json({ error: "Only HTML requests are supported here" }, { status: 500 }));
        const manifest2 = await resolveManifestForRequest({
          request,
          requestInlineCss: requestOpts?.inlineCss,
          getBaseManifest: () => getBaseManifest(matchedRoutes)
        });
        const earlyHints = createEarlyHintsForRequest({
          onEarlyHints: requestOpts?.onEarlyHints,
          responseLinkHeader: requestOpts?.responseLinkHeader
        });
        earlyHints?.collectStatic({
          manifest: manifest2,
          matchedRoutes
        });
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets
        });
        routerInstance.options.additionalContext = { serverContext };
        await routerInstance.load();
        if (routerInstance.state.redirect) return normalizeSsrResponse(routerInstance.state.redirect);
        earlyHints?.collectDynamic(routerInstance.stores.matches.get());
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        earlyHints?.appendResponseHeaders(responseHeaders);
        return normalizeSsrResponse(await cb({
          request,
          router: routerInstance,
          responseHeaders
        }));
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      const { response: middlewareResponse } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        handlerType: "router",
        context: createNullProtoObject(requestOpts?.context)
      });
      const response = await handleRedirectResponse(middlewareResponse, request, getRouter);
      responseOwnsCleanup = response.serverSsrCleanup === "stream";
      return response.response;
    } finally {
      if (router?.serverSsr && !responseOwnsCleanup) router.serverSsr.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  const ssrResponse = normalizeSsrResponse(response);
  if (!isRedirect(ssrResponse.response)) return ssrResponse;
  if (isResolvedRedirect(ssrResponse.response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
      ...ssrResponse.response.options,
      isSerializedRedirect: true
    }, { headers: ssrResponse.response.headers }), "redirect response replaced");
    return ssrResponse;
  }
  const opts = ssrResponse.response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect = (await getRouter()).resolveRedirect(ssrResponse.response);
  if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
    ...ssrResponse.response.options,
    isSerializedRedirect: true
  }, { headers: ssrResponse.response.headers }), "redirect response replaced");
  return replaceSsrResponse(ssrResponse, redirect, "redirect response replaced");
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  let isHeadFallback = false;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = requestMethod === "HEAD" ? handlers["HEAD"] ?? handlers["GET"] ?? handlers["ANY"] : handlers[requestMethod] ?? handlers["ANY"];
    isHeadFallback = requestMethod === "HEAD" && handler !== void 0 && !handlers["HEAD"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push(((ctx2) => executeRouter(ctx2.context, matchedRoutes)));
  const { ctx, response } = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname,
    handlerType: "router"
  });
  if (isHeadFallback) {
    if (!ctx.response) throwRouteHandlerError();
    return stripSsrResponseBody(await handleRedirectResponse(response, request, getRouter), "HEAD body stripped");
  }
  return normalizeSsrResponse(response);
}
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch });
const server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
export {
  setCookie as A,
  setResponseHeader as B,
  setResponseHeaders as C,
  setResponseStatus as D,
  unsealSession as E,
  updateSession as F,
  useSession as G,
  HEADERS as H,
  server as I,
  StartServer as S,
  TSS_SERVER_FUNCTION as T,
  createMiddleware as a,
  getServerFnById as b,
  createServerFn as c,
  getRequest as d,
  getRequestUrl as e,
  clearResponseHeaders as f,
  getRequestIP as g,
  clearSession as h,
  createStartHandler as i,
  defaultStreamHandler as j,
  deleteCookie as k,
  getCookie as l,
  getCookies as m,
  getRequestHeader as n,
  getRequestHeaders as o,
  getRequestHost as p,
  getRequestProtocol as q,
  getResponse as r,
  getResponseHeader as s,
  getResponseHeaders as t,
  getResponseStatus as u,
  getSession as v,
  getValidatedQuery as w,
  removeResponseHeader as x,
  requestHandler as y,
  sealSession as z
};
