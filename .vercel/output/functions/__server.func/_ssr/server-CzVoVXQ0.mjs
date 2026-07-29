import { e as getRequestUrl, S as StartServer } from "./server-DxoLgaf4.mjs";
import { H, f, h, i, j, k, l, m, d, n, o, p, g, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G } from "./server-DxoLgaf4.mjs";
import { y as defineHandlerCallback } from "../_libs/tanstack__router-core.mjs";
import { E as E2, U, x as x2, v as v2 } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as renderRouterToString } from "../_libs/tanstack__react-router.mjs";
import "../_libs/seroval.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
var defaultRenderHandler = defineHandlerCallback(({ router, responseHeaders }) => renderRouterToString({
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
var VIRTUAL_MODULES = {
  startManifest: "tanstack-start-manifest:v",
  serverFnResolver: "#tanstack-start-server-fn-resolver",
  pluginAdapters: "#tanstack-start-plugin-adapters"
};
export {
  H as HEADERS,
  StartServer,
  VIRTUAL_MODULES,
  E2 as attachRouterServerSsrUtils,
  f as clearResponseHeaders,
  h as clearSession,
  U as createRequestHandler,
  i as createStartHandler,
  defaultRenderHandler,
  j as defaultStreamHandler,
  defineHandlerCallback,
  k as deleteCookie,
  l as getCookie,
  m as getCookies,
  d as getRequest,
  n as getRequestHeader,
  o as getRequestHeaders,
  p as getRequestHost,
  g as getRequestIP,
  q as getRequestProtocol,
  getRequestUrl,
  r as getResponse,
  s as getResponseHeader,
  t as getResponseHeaders,
  u as getResponseStatus,
  v as getSession,
  w as getValidatedQuery,
  x as removeResponseHeader,
  y as requestHandler,
  z as sealSession,
  A as setCookie,
  B as setResponseHeader,
  C as setResponseHeaders,
  D as setResponseStatus,
  x2 as transformPipeableStreamWithRouter,
  v2 as transformReadableStreamWithRouter,
  E as unsealSession,
  F as updateSession,
  G as useSession
};
