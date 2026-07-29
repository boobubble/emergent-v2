import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { P as Provider, R as Root3, T as Trigger, a as Portal, C as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { m as cn } from "./router-CYWPFaDK.mjs";
import { S as Shield, bj as BadgeCheck, bs as Handshake, a as Sparkles, l as Star, bt as Archive } from "../_libs/lucide-react.mjs";
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2.displayName;
function CommunityBadges({ c, size = "sm", showFeatured, className }) {
  const isArchived = c.status === "archived";
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const badgeCls = size === "md" ? "gap-1 text-[11px]" : "gap-1 text-[10px] py-0.5";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex flex-wrap items-center gap-1 ${className ?? ""}`, children: [
    c.is_official && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeTip, { label: "Official Community", description: "Confirmed by the platform as an official presence.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${badgeCls} bg-blue-600/95 text-white shadow`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: iconSize }),
      " Official"
    ] }) }),
    c.is_verified && !c.is_official && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeTip, { label: "Verified Community", description: "Identity verified by the platform.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${badgeCls} bg-sky-500/95 text-white shadow`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: iconSize }),
      " Verified"
    ] }) }),
    c.is_partner && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeTip, { label: "Partner Community", description: "Official brand or organization partner.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${badgeCls} bg-violet-600/95 text-white shadow`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Handshake, { className: iconSize }),
      " Partner"
    ] }) }),
    c.is_trusted && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeTip, { label: "Trusted Community", description: "Recognised by the platform for consistent quality.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${badgeCls} bg-emerald-600/95 text-white shadow`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: iconSize }),
      " Trusted"
    ] }) }),
    showFeatured && c.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${badgeCls} bg-amber-500/95 text-white shadow`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `${iconSize} fill-current` }),
      " Featured"
    ] }),
    isArchived && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: badgeCls, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: iconSize }),
      " Archived"
    ] })
  ] }) });
}
function BadgeTip({ label, description, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex", children }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "bottom", className: "max-w-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: description })
    ] })
  ] });
}
export {
  CommunityBadges as C
};
