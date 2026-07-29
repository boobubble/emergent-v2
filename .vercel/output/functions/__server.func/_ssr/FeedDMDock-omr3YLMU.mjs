import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { cK as ChatErrorBoundary, g as useChat, b as useServerFn, dE as parseDmChannel, cL as resolveDmTargetId, dF as isUuid, q as isRemoteDmChannel } from "./router-CYWPFaDK.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { F as FrameAvatar, C as CosmeticName } from "./EmojiPicker-DcAQqNHO.mjs";
import { M as MessageList, a as MessageInput } from "./MessageInput-lDIqYtps.mjs";
import { d as deleteMyDmConversation } from "./account-dm.functions-PHcEyLmf.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { h as MessageCircle, bu as ChevronLeft, d as Trash2, X, N as Search } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
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
import "./Avatar-CAZashHQ.mjs";
import "./shop-catalog-QoXq-K4P.mjs";
import "./country-flag-Bsg6nfgK.mjs";
import "./use-my-role-Cv7Uou7c.mjs";
import "./use-staff-permissions-DnZyPMSN.mjs";
import "./moderation.functions-BtSBLwCC.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "./economy-config-CPZpIbo-.mjs";
import "./media-providers-config-Do_nLlCF.mjs";
import "./trust-safety.functions-CIMNTEvE.mjs";
import "./cache-manager-cID9K-3q.mjs";
import "./voice-notes-config-ARlQw0o0.mjs";
function FeedDMDock(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatErrorBoundary, { label: "feed-dm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedDMDockInner, { ...props }) });
}
function FeedDMDockInner({ meId, profiles, initialOpen = false, onClose }) {
  const { state, startDM, isDM, isDmUnread, dmUnreadCount } = useChat();
  const [open, setOpen] = reactExports.useState(initialOpen);
  const [friendIds, setFriendIds] = reactExports.useState([]);
  const [view, setView] = reactExports.useState("list");
  const [q, setQ] = reactExports.useState("");
  const [deletingDm, setDeletingDm] = reactExports.useState(false);
  const deleteDm = useServerFn(deleteMyDmConversation);
  reactExports.useEffect(() => {
    if (initialOpen) setOpen(true);
  }, [initialOpen]);
  reactExports.useEffect(() => {
    if (!meId) return;
    async function load() {
      const { data } = await supabase.from("friendships").select("*").eq("status", "accepted");
      const ids = (data ?? []).map(
        (f) => f.sender_id === meId ? f.receiver_id : f.sender_id
      );
      setFriendIds(ids);
    }
    load();
    const ch = supabase.channel(`dock-fr-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [meId]);
  reactExports.useEffect(() => {
    if (open && isDM(state.activeChannel)) setView("chat");
  }, [open, state.activeChannel, isDM]);
  const friends = reactExports.useMemo(() => {
    const ids = new Set(friendIds);
    for (const id of state.dmOrder ?? []) ids.add(id);
    const list = Array.from(ids).map((id) => profiles[id] ?? state.users[id]).filter(Boolean);
    if (!q.trim()) return list;
    const t = q.toLowerCase();
    return list.filter((u) => u.name.toLowerCase().includes(t));
  }, [friendIds, profiles, q, state.dmOrder, state.users]);
  const activePeerId = reactExports.useMemo(() => {
    const ch = state.activeChannel;
    if (!ch.startsWith("dm:")) return null;
    const { peerId } = parseDmChannel(ch, meId);
    return peerId;
  }, [state.activeChannel, meId]);
  const activePeer = activePeerId ? profiles[activePeerId] ?? state.users[activePeerId] : null;
  function handleClose() {
    setOpen(false);
    onClose?.();
  }
  if (!open) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpen(true),
        className: "fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 hover:scale-105 transition lg:bottom-6",
        "aria-label": "Open messages",
        title: "Messages",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
          dmUnreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground", children: dmUnreadCount > 9 ? "9+" : dmUnreadCount })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-20 right-4 z-40 flex h-[70vh] max-h-[560px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:bottom-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border bg-card px-3 py-2", children: [
      view === "chat" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("list"), className: "grid h-8 w-8 place-items-center rounded-full hover:bg-accent", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
        activePeer && /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: activePeer, size: 28 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 truncate text-sm font-semibold", children: activePeer ? /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: activePeer.id, name: activePeer.name }) : "Direct message" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-sm font-bold", children: "Messages" })
      ] }),
      view === "chat" && activePeer && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          disabled: deletingDm,
          onClick: async () => {
            if (!window.confirm(`Delete the entire chat with ${activePeer.name}? This removes messages for both of you and cannot be undone.`)) return;
            setDeletingDm(true);
            try {
              await deleteDm({ data: { peerId: activePeer.id } });
              setView("list");
            } catch (e) {
              alert(e.message || "Failed to delete chat");
            } finally {
              setDeletingDm(false);
            }
          },
          className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/15 hover:text-destructive disabled:opacity-50",
          "aria-label": "Delete chat",
          title: "Delete chat",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleClose, className: "grid h-8 w-8 place-items-center rounded-full hover:bg-accent", "aria-label": "Close", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    view === "list" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: "Search friends",
            className: "flex-1 bg-transparent outline-none"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex-1 overflow-y-auto px-1.5 pb-2", children: friends.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-6 text-center text-xs text-muted-foreground", children: friendIds.length === 0 && (state.dmOrder ?? []).length === 0 ? "Add friends or message a user to start chatting." : "No matches." }) : friends.map((u) => {
        const targetId = resolveDmTargetId(u.id, profiles) ?? (isUuid(u.id) ? u.id : null);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              if (!targetId) return;
              startDM(targetId);
              setView("chat");
            },
            disabled: !targetId,
            className: "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-accent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: u, size: 32 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: u.id, name: u.name }) }),
                  isDmUnread(u.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 shrink-0 rounded-full bg-primary", title: "Unread" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: u.status === "online" ? "Online" : "Offline" })
              ] })
            ]
          },
          u.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 flex-col", children: isDM(state.activeChannel) && (isRemoteDmChannel(state.activeChannel, meId) || state.activeChannel.startsWith("dm:bot-")) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageList, { channelId: state.activeChannel }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageInput, {})
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid flex-1 place-items-center px-6 text-center text-xs text-muted-foreground", children: "Select a friend to start a direct message." }) })
  ] });
}
export {
  FeedDMDock
};
