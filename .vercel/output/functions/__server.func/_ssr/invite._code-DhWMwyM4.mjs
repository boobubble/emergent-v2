import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { cS as Route$U, b as useServerFn, cT as getInviteLanding, B as Button, a as useAuth, h as useAuthGate, cj as joinCommunity, a0 as Input } from "./router-CYWPFaDK.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { U as Users, cv as DoorOpen, bh as Share2, by as Copy, W as Lock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function InviteLandingPage() {
  const {
    code
  } = Route$U.useParams();
  const fn = useServerFn(getInviteLanding);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["invite-landing", code],
    queryFn: () => fn({
      data: {
        code
      }
    }),
    staleTime: 3e4
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading invite…" }) });
  }
  if (!data?.community) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(InviteError, { title: "Invite unavailable", description: "This invite link no longer works or the community was removed." });
  }
  const community = data.community;
  const invite = data.invite;
  const owner = data.owner ?? null;
  if (!data.valid) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(InviteError, { title: data.reason === "expired" ? "Invite expired" : "Invite fully used", description: data.reason === "expired" ? "This invite link has passed its expiry date. Ask the owner for a fresh link." : "This invite has reached its usage limit.", community });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(InviteLanding, { community, invite, owner, onRefetch: refetch });
}
function InviteLanding({
  community,
  invite,
  owner,
  onRefetch
}) {
  const {
    user
  } = useAuth();
  const {
    requireAuth
  } = useAuthGate();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [password, setPassword] = reactExports.useState("");
  const joinFn = useServerFn(joinCommunity);
  const mut = useMutation({
    mutationFn: () => joinFn({
      data: {
        communityId: community.id,
        inviteCode: invite.code,
        password: password || void 0
      }
    }),
    onSuccess: (r) => {
      qc.invalidateQueries();
      if (r?.state === "pending") toast.success("Join request sent");
      else toast.success("You're in!");
      onRefetch();
      navigate({
        to: "/community/$slug",
        params: {
          slug: community.slug
        }
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const needsPassword = community.privacy_mode === "password" || community.privacy_mode === "invite_password";
  const accent = community.accent_color || "#7c3aed";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Invite link copied");
  };
  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${community.name} on the community platform`,
          url: shareUrl
        });
      } catch {
      }
    } else copyLink();
  };
  const bannerStyle = community.banner_url ? {
    backgroundImage: `url(${community.banner_url})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  } : {
    background: `linear-gradient(135deg, ${accent} 0%, hsl(var(--background)) 100%)`
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-40 w-full sm:h-56", style: bannerStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent to-background/85" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto -mt-16 max-w-2xl px-4 pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-muted text-2xl font-bold shadow", style: community.logo_url ? {
          backgroundImage: `url(${community.logo_url})`,
          backgroundSize: "cover"
        } : {
          background: accent,
          color: "#fff"
        }, children: !community.logo_url && (community.name?.[0]?.toUpperCase() ?? "C") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: community.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c: community, size: "md", showFeatured: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
              community.member_count,
              " members"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              "🟢 ",
              community.online_count,
              " online"
            ] }),
            community.category && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: community.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyBadge, { mode: community.privacy_mode })
          ] }),
          owner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Owned by ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: owner.display_name || owner.username })
          ] })
        ] })
      ] }),
      community.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-4 rounded-lg border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: community.description })
      ] }),
      community.rules && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-3 rounded-lg border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Community rules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: community.rules })
      ] }),
      needsPassword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-medium", children: "Community password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter password" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", style: {
          backgroundColor: accent
        }, className: "min-w-32 text-white", onClick: () => requireAuth(() => mut.mutate()), disabled: mut.isPending, children: user ? "Join community" : "Sign in to join" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community/$slug", params: {
          slug: community.slug
        }, className: "inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DoorOpen, { className: "mr-1 h-4 w-4" }),
          "Preview"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: share, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "mr-1 h-4 w-4" }),
            "Share"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: copyLink, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-1 h-4 w-4" }),
            "Copy link"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[11px] text-muted-foreground", children: [
        "Invite code ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1", children: invite.code }),
        invite.max_uses ? ` · ${invite.uses}/${invite.max_uses} uses` : "",
        invite.expires_at ? ` · expires ${new Date(invite.expires_at).toLocaleDateString()}` : ""
      ] })
    ] }) })
  ] });
}
function PrivacyBadge({
  mode
}) {
  if (mode === "public") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 text-[10px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
    "Public"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1 text-[10px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
    mode.replace("_", " ")
  ] });
}
function InviteError({
  title,
  description,
  community
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background px-4 text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: description }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-center gap-2", children: [
      community?.slug && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community/$slug", params: {
        slug: community.slug
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Visit community" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/communities", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { children: "Browse communities" }) })
    ] })
  ] }) });
}
export {
  InviteLandingPage as component
};
