import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
function TrustPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-6 py-12 text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight", children: "Trust, Security & Privacy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "We take protecting your account and your conversations seriously. This page explains the controls we have in place. It is maintained by our team and is not an independent certification." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Account security" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc space-y-2 pl-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Passwords are hashed and managed by our authentication provider." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Optional social sign-in (Google) for stronger account protection." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sessions are bound to the device and can be revoked by signing out." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Device fingerprinting and ban enforcement help us block abusive accounts." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Data protection" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc space-y-2 pl-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Database access is restricted by row-level security so each user can only read and modify their own data." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Direct messages are limited to accepted friends. Private rooms require an invitation and optional password." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Sensitive fields such as IP addresses are never exposed to other users." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Secrets and API keys are stored server-side and never shipped to the browser." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Moderation & safety" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc space-y-2 pl-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Word filters block prohibited content before it is posted." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Users can report messages, posts, and profiles from anywhere in the app." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Moderators can mute, ban, or remove harmful content." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "All moderator actions are logged for accountability." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Your choices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc space-y-2 pl-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Block or ignore other users at any time." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Delete your own posts and messages." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Request account deletion by contacting support." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Reporting a vulnerability" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "If you believe you have found a security issue, please report it through the in-app feedback tool so our team can investigate." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pt-6 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-primary underline-offset-4 hover:underline", children: "← Back home" }) })
    ] })
  ] });
}
export {
  TrustPage as component
};
