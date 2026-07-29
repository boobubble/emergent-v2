import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useRouterState, O as Outlet, e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { cg as Route$12, a as useAuth, b as useServerFn, ch as getMyMembership, h as useAuthGate, ci as leaveCommunity, B as Button, D as Dialog, c as DialogContent, d as DialogHeader, e as DialogTitle, f as DialogDescription, aw as DialogFooter, cj as joinCommunity, a0 as Input, ad as Textarea } from "./router-CYWPFaDK.mjs";
import { C as CommunityProvider, u as useCommunity } from "./community-context-Bgy_g-7B.mjs";
import { C as CommunityBadges } from "./CommunityBadges-BE2_BUKN.mjs";
import { B as Badge } from "./badge-CCbPDVfk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { U as Users, p as Settings, s as UserPlus, q as LogOut, cv as DoorOpen, cw as Info, cx as Rss, g as MessageSquare, O as Trophy, W as Lock } from "../_libs/lucide-react.mjs";
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
function CommunityLayout() {
  const {
    community
  } = Route$12.useLoaderData();
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const getMem = useServerFn(getMyMembership);
  const {
    data: membership
  } = useQuery({
    queryKey: ["my-community-membership", community.id, user?.id ?? "anon"],
    queryFn: () => getMem({
      data: {
        communityId: community.id
      }
    }),
    enabled: !!user?.id,
    staleTime: 15e3
  });
  const isOwner = user?.id === community.owner_id;
  const isMember = membership?.status === "active";
  const onDashboard = pathname.startsWith(`/community/${community.slug}/dashboard`);
  reactExports.useEffect(() => {
    const accent = community.accent_color || "#7c3aed";
    document.documentElement.style.setProperty("--community-accent", accent);
    return () => {
      document.documentElement.style.removeProperty("--community-accent");
    };
  }, [community.accent_color]);
  if (onDashboard) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityProvider, { community, isOwner, isMember, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityProvider, { community, isOwner, isMember, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityHeader, { community, isOwner, isMember, isPending: membership?.status === "pending", onLeftCommunity: () => qc.invalidateQueries({
      queryKey: ["my-community-membership", community.id]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityTabs, { slug: community.slug, accent: community.accent_color || "#7c3aed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pb-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveCommunityGuard, {})
  ] }) });
}
function CommunityHeader({
  community,
  isOwner,
  isMember,
  isPending,
  onLeftCommunity
}) {
  const {
    requireAuth
  } = useAuthGate();
  const navigate = useNavigate();
  const [joinOpen, setJoinOpen] = reactExports.useState(false);
  const leaveFn = useServerFn(leaveCommunity);
  const leaveMut = useMutation({
    mutationFn: () => leaveFn({
      data: {
        communityId: community.id
      }
    }),
    onSuccess: () => {
      toast.success("Left community");
      onLeftCommunity();
    },
    onError: (e) => toast.error(e.message)
  });
  const accent = community.accent_color || "#7c3aed";
  const bannerStyle = community.banner_url ? {
    backgroundImage: `url(${community.banner_url})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  } : {
    background: `linear-gradient(135deg, ${accent} 0%, hsl(var(--background)) 100%)`
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-40 w-full sm:h-56", style: bannerStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent to-background/80" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto -mt-12 max-w-5xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-background bg-card text-2xl font-bold shadow-lg", style: {
            backgroundColor: community.logo_url ? void 0 : accent,
            color: "#fff"
          }, children: community.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: community.logo_url, alt: community.name, className: "h-full w-full object-cover" }) : community.name[0]?.toUpperCase() ?? "C" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: community.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityBadges, { c: community, size: "md", showFeatured: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                community.member_count,
                " members"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyBadge, { mode: community.privacy_mode }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "@",
                community.slug
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
            to: "/community/$slug/dashboard",
            params: {
              slug: community.slug
            }
          }), size: "sm", variant: "default", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "mr-1 h-4 w-4" }),
            "Dashboard"
          ] }),
          !isOwner && !isMember && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => requireAuth(() => setJoinOpen(true)), style: {
            backgroundColor: accent
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
            "Join"
          ] }),
          !isOwner && isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: true, children: "Request pending" }),
          !isOwner && isMember && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => leaveMut.mutate(), disabled: leaveMut.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-1 h-4 w-4" }),
            "Leave"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => navigate({
            to: "/"
          }), title: "Exit community", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DoorOpen, { className: "mr-1 h-4 w-4" }),
            "Exit"
          ] })
        ] })
      ] }),
      community.announcement && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-sm", style: {
        borderLeftColor: accent
      }, children: [
        "📣 ",
        community.announcement
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JoinDialog, { open: joinOpen, onOpenChange: setJoinOpen, community, onJoined: () => {
      setJoinOpen(false);
      onLeftCommunity();
    } })
  ] });
}
function CommunityTabs({
  slug,
  accent
}) {
  const items = [{
    to: "/community/$slug",
    label: "About",
    icon: Info,
    exact: true
  }, {
    to: "/community/$slug/feed",
    label: "Feed",
    icon: Rss
  }, {
    to: "/community/$slug/chatrooms",
    label: "Chatrooms",
    icon: MessageSquare
  }, {
    to: "/community/$slug/competitions",
    label: "Competitions",
    icon: Trophy
  }, {
    to: "/community/$slug/members",
    label: "Members",
    icon: Users
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mt-6 flex w-full gap-1 overflow-x-auto border-b border-border", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.to, params: {
    slug
  }, activeOptions: {
    exact: !!it.exact
  }, className: "group flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground data-[status=active]:border-current data-[status=active]:text-foreground", style: {
    ["--community-accent-hover"]: accent
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-4 w-4" }),
    it.label
  ] }, it.label)) });
}
function LeaveCommunityGuard() {
  const {
    pendingExit,
    cancelExit,
    confirmExit,
    community
  } = useCommunity();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!pendingExit, onOpenChange: (o) => !o ? cancelExit() : null, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Leave ",
        community.name,
        "?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "You'll leave this community and go to the global platform. You can come back anytime." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: cancelExit, children: "Stay" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmExit, children: "Leave" })
    ] })
  ] }) });
}
function PrivacyBadge({
  mode
}) {
  const map = {
    public: {
      label: "Public",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" })
    },
    private: {
      label: "Private",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" })
    },
    invite_only: {
      label: "Invite only",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" })
    },
    password: {
      label: "Password",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" })
    },
    invite_password: {
      label: "Invite + Password",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" })
    }
  };
  const m = map[mode];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1 inline-flex", children: m.icon }),
    m.label
  ] });
}
function JoinDialog({
  open,
  onOpenChange,
  community,
  onJoined
}) {
  const [password, setPassword] = reactExports.useState("");
  const [inviteCode, setInviteCode] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const join = useServerFn(joinCommunity);
  const mut = useMutation({
    mutationFn: () => join({
      data: {
        communityId: community.id,
        password: password || void 0,
        inviteCode: inviteCode || void 0,
        message: message || void 0
      }
    }),
    onSuccess: (r) => {
      if (r.state === "pending") toast.success("Join request sent");
      else toast.success("Joined!");
      onJoined();
    },
    onError: (e) => toast.error(e.message)
  });
  const needsInvite = community.privacy_mode === "invite_only" || community.privacy_mode === "invite_password";
  const needsPassword = community.privacy_mode === "password" || community.privacy_mode === "invite_password";
  const needsRequest = community.privacy_mode === "private";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Join ",
      community.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      needsInvite && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Invite code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inviteCode, onChange: (e) => setInviteCode(e.target.value), placeholder: "Enter invite code" })
      ] }),
      needsPassword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Community password" })
      ] }),
      needsRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Message to moderators (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Why do you want to join?" })
      ] }),
      community.privacy_mode === "public" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This community is public. Click join to become a member." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: needsRequest ? "Send request" : "Join" })
    ] })
  ] }) });
}
export {
  CommunityLayout as component
};
