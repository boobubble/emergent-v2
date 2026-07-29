import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useCommunity } from "./community-context-Bgy_g-7B.mjs";
import { S as Shield } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
function CommunityAbout() {
  const {
    community
  } = useCommunity();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    community.welcome_text && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "Welcome" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: community.welcome_text })
    ] }),
    community.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "About" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: community.description })
    ] }),
    community.rules && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
        "Community rules"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: community.rules })
    ] }),
    community.social_links && Object.keys(community.social_links).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "Links" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(community.social_links).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: String(v), target: "_blank", rel: "noopener noreferrer", className: "rounded-full border px-3 py-1 text-xs hover:bg-muted", children: k }, k)) })
    ] }),
    !community.welcome_text && !community.description && !community.rules && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground", children: "This community hasn't added an about section yet." })
  ] });
}
export {
  CommunityAbout as component
};
