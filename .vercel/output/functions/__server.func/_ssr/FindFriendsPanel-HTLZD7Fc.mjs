import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { a as useAuth, w as useRemoteProfiles } from "./router-CYWPFaDK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a as Sparkles, w as Inbox, aj as Send, U as Users, N as Search, s as UserPlus, av as Ban, z as Check, X, as as UserMinus, bC as ShieldOff } from "../_libs/lucide-react.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
function FindFriendsPanel() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const [tab, setTab] = reactExports.useState("suggestions");
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [q, setQ] = reactExports.useState("");
  const meId = user?.id ?? "";
  reactExports.useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("friendships").select("*");
      if (cancelled) return;
      setRows(data ?? []);
      setLoading(false);
    }
    load();
    const ch = supabase.channel(`find-friends-panel-${meId}`).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load()).subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId]);
  const { friendsOf, mineByOther, blockedByMe, blockedMe } = reactExports.useMemo(() => {
    const friendsOf2 = /* @__PURE__ */ new Map();
    const mineByOther2 = /* @__PURE__ */ new Map();
    const blockedByMe2 = /* @__PURE__ */ new Set();
    const blockedMe2 = /* @__PURE__ */ new Set();
    for (const r of rows) {
      if (r.status === "accepted") {
        if (!friendsOf2.has(r.sender_id)) friendsOf2.set(r.sender_id, /* @__PURE__ */ new Set());
        if (!friendsOf2.has(r.receiver_id)) friendsOf2.set(r.receiver_id, /* @__PURE__ */ new Set());
        friendsOf2.get(r.sender_id).add(r.receiver_id);
        friendsOf2.get(r.receiver_id).add(r.sender_id);
      }
      if (r.sender_id === meId || r.receiver_id === meId) {
        const other = r.sender_id === meId ? r.receiver_id : r.sender_id;
        const existing = mineByOther2.get(other);
        if (!existing || +new Date(r.created_at) > +new Date(existing.created_at)) {
          mineByOther2.set(other, r);
        }
        if (r.status === "blocked") {
          if (r.sender_id === meId) blockedByMe2.add(other);
          else blockedMe2.add(other);
        }
      }
    }
    return { friendsOf: friendsOf2, mineByOther: mineByOther2, blockedByMe: blockedByMe2, blockedMe: blockedMe2 };
  }, [rows, meId]);
  const myFriends = friendsOf.get(meId) ?? /* @__PURE__ */ new Set();
  const allProfiles = reactExports.useMemo(
    () => Object.values(profiles).filter((p) => p.id !== meId && !p.isGuest),
    [profiles, meId]
  );
  const incoming = reactExports.useMemo(
    () => rows.filter((r) => r.status === "pending" && r.receiver_id === meId),
    [rows, meId]
  );
  const outgoing = reactExports.useMemo(
    () => rows.filter((r) => r.status === "pending" && r.sender_id === meId),
    [rows, meId]
  );
  const friendsList = reactExports.useMemo(
    () => allProfiles.filter((p) => myFriends.has(p.id)).sort(byOnlineThenName),
    [allProfiles, myFriends]
  );
  const suggestions = reactExports.useMemo(() => {
    return allProfiles.filter(
      (p) => !myFriends.has(p.id) && !mineByOther.has(p.id) && !blockedByMe.has(p.id) && !blockedMe.has(p.id)
    ).map((p) => {
      const theirFriends = friendsOf.get(p.id) ?? /* @__PURE__ */ new Set();
      let mutual = 0;
      myFriends.forEach((id) => {
        if (theirFriends.has(id)) mutual++;
      });
      return { p, mutual };
    }).sort((a, b) => {
      if (b.mutual !== a.mutual) return b.mutual - a.mutual;
      const ao = a.p.status === "online" ? 1 : 0;
      const bo = b.p.status === "online" ? 1 : 0;
      if (ao !== bo) return bo - ao;
      return (b.p.lastSeen ?? 0) - (a.p.lastSeen ?? 0);
    }).slice(0, 60);
  }, [allProfiles, myFriends, mineByOther, friendsOf, blockedByMe, blockedMe]);
  const searchResults = reactExports.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return allProfiles.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 30);
  }, [q, allProfiles]);
  async function sendRequest(otherId) {
    const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: otherId, status: "pending" });
    if (error) toast.error(error.message);
    else toast.success("Request sent");
  }
  async function accept(rowId) {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", rowId);
    if (error) toast.error(error.message);
    else toast.success("You're now friends");
  }
  async function removeRow(rowId) {
    const { error } = await supabase.from("friendships").delete().eq("id", rowId);
    if (error) toast.error(error.message);
  }
  async function unfriend(otherId) {
    const row = rows.find(
      (r) => r.status === "accepted" && (r.sender_id === meId && r.receiver_id === otherId || r.receiver_id === meId && r.sender_id === otherId)
    );
    if (!row) return;
    const { error } = await supabase.from("friendships").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else toast.success("Unfriended");
  }
  async function block(otherId) {
    const existing = mineByOther.get(otherId);
    if (existing) await supabase.from("friendships").delete().eq("id", existing.id);
    const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: otherId, status: "blocked" });
    if (error) toast.error(error.message);
    else toast.success("User blocked");
  }
  async function unblock(otherId) {
    const row = rows.find(
      (r) => r.status === "blocked" && r.sender_id === meId && r.receiver_id === otherId
    );
    if (!row) return;
    const { error } = await supabase.from("friendships").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else toast.success("Unblocked");
  }
  function mutualWith(otherId) {
    const theirs = friendsOf.get(otherId) ?? /* @__PURE__ */ new Set();
    let n = 0;
    myFriends.forEach((id) => {
      if (theirs.has(id)) n++;
    });
    return n;
  }
  if (!user) return null;
  const TABS = [
    { id: "suggestions", label: "Suggestions", icon: Sparkles },
    { id: "requests", label: "Requests", icon: Inbox, badge: incoming.length },
    { id: "sent", label: "Sent", icon: Send },
    { id: "friends", label: "Friends", icon: Users },
    { id: "search", label: "Search", icon: Search }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-xl font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary" }),
        " Find Friends"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        friendsList.length,
        " friend",
        friendsList.length === 1 ? "" : "s"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto rounded-full bg-background/50 p-1 border border-border", children: TABS.map((t) => {
      const Icon = t.icon;
      const active = tab === t.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab(t.id),
          className: `relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
            " ",
            t.label,
            t.badge ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `ml-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"}`,
                children: t.badge > 99 ? "99+" : t.badge
              }
            ) : null
          ]
        },
        t.id
      );
    }) }),
    tab === "search" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          autoFocus: true,
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder: "Search by username…",
          className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonGrid, {}) : tab === "suggestions" ? suggestions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Sparkles, text: "No suggestions right now. Check back later." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CardGrid, { children: suggestions.map(({ p, mutual }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      PersonCard,
      {
        p,
        subtitle: mutual > 0 ? `${mutual} mutual friend${mutual === 1 ? "" : "s"}` : p.status === "online" ? "Online now" : "New here",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => sendRequest(p.id), className: "btn-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
            " Add"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => block(p.id), className: "btn-ghost", title: "Block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }) })
        ]
      },
      p.id
    )) }) : tab === "requests" ? incoming.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Inbox, text: "No incoming requests." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CardGrid, { children: incoming.map((r) => {
      const p = profiles[r.sender_id];
      if (!p) return null;
      const m = mutualWith(p.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        PersonCard,
        {
          p,
          subtitle: m > 0 ? `${m} mutual` : "Wants to be friends",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => accept(r.id), className: "btn-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
              " Accept"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => removeRow(r.id), className: "btn-ghost", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
              " Decline"
            ] })
          ]
        },
        r.id
      );
    }) }) : tab === "sent" ? outgoing.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Send, text: "No pending requests sent." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CardGrid, { children: outgoing.map((r) => {
      const p = profiles[r.receiver_id];
      if (!p) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonCard, { p, subtitle: "Request pending…", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => removeRow(r.id), className: "btn-ghost", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
        " Cancel"
      ] }) }, r.id);
    }) }) : tab === "friends" ? friendsList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Users, text: "No friends yet. Send some requests!" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(CardGrid, { children: [
      friendsList.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        PersonCard,
        {
          p,
          subtitle: p.status === "online" ? "Online" : p.lastSeen ? `Active ${timeAgo(p.lastSeen)}` : "Offline",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unfriend(p.id), className: "btn-ghost", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-3.5 w-3.5" }),
            " Unfriend"
          ] })
        },
        p.id
      )),
      [...blockedByMe].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Blocked" }),
      [...blockedByMe].map((id) => {
        const p = profiles[id];
        if (!p) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonCard, { p, subtitle: "Blocked by you", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unblock(id), className: "btn-ghost", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "h-3.5 w-3.5" }),
          " Unblock"
        ] }) }, id);
      })
    ] }) : tab === "search" ? q.trim() === "" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Search, text: "Type a name to search." }) : searchResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: Search, text: `No users match "${q}"` }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CardGrid, { children: searchResults.map((p) => {
      const row = mineByOther.get(p.id);
      const isFriend = myFriends.has(p.id);
      const isBlockedByMe = blockedByMe.has(p.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        PersonCard,
        {
          p,
          subtitle: mutualWith(p.id) > 0 ? `${mutualWith(p.id)} mutual` : p.status === "online" ? "Online" : "Offline",
          children: isBlockedByMe ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unblock(p.id), className: "btn-ghost", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "h-3.5 w-3.5" }),
            " Unblock"
          ] }) : isFriend ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unfriend(p.id), className: "btn-ghost", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserMinus, { className: "h-3.5 w-3.5" }),
            " Unfriend"
          ] }) : row?.status === "pending" && row.sender_id === meId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => removeRow(row.id), className: "btn-ghost", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
            " Cancel"
          ] }) : row?.status === "pending" && row.receiver_id === meId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => accept(row.id), className: "btn-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
            " Accept"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => sendRequest(p.id), className: "btn-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
            " Add"
          ] })
        },
        p.id
      );
    }) }) : null })
  ] });
}
function byOnlineThenName(a, b) {
  const ao = a.status === "online" ? 1 : 0;
  const bo = b.status === "online" ? 1 : 0;
  if (ao !== bo) return bo - ao;
  return a.name.localeCompare(b.name);
}
function timeAgo(ms) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1e3));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function CardGrid({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2", children });
}
function PersonCard({
  p,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$username", params: { username: p.name }, className: "relative shrink-0", title: p.name, children: [
      p.avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: p.avatarUrl,
          alt: p.name,
          loading: "lazy",
          decoding: "async",
          className: "h-12 w-12 rounded-full object-cover"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white",
          style: { background: p.avatarColor },
          children: p.name.slice(0, 1).toUpperCase()
        }
      ),
      p.status === "online" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-muted-foreground", children: subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 flex flex-wrap items-center gap-1.5", children })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .btn-primary { display:inline-flex; align-items:center; gap:4px; border-radius:9999px; background:hsl(var(--primary)); color:hsl(var(--primary-foreground)); padding:4px 10px; font-size:11px; font-weight:600; }
        .btn-primary:hover { opacity:.9; }
        .btn-ghost { display:inline-flex; align-items:center; gap:4px; border-radius:9999px; background:hsl(var(--muted)); color:hsl(var(--foreground)); padding:4px 10px; font-size:11px; font-weight:600; }
        .btn-ghost:hover { background:hsl(var(--accent)); }
      ` })
  ] });
}
function Empty({ icon: Icon, text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-background/50 p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mx-auto h-7 w-7 text-muted-foreground/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: text })
  ] });
}
function SkeletonGrid() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5 sm:grid-cols-2", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-1/2 animate-pulse rounded bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-1/3 animate-pulse rounded bg-muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-20 animate-pulse rounded-full bg-muted" })
        ] })
      ]
    },
    i
  )) });
}
export {
  FindFriendsPanel
};
