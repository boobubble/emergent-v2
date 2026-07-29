import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useChat, r as useIgnore, a as useAuth, u as useAppSettings, b as useServerFn, W as AuthDialogs, V as rtLog, m as cn } from "./router-CYWPFaDK.mjs";
import { F as FrameAvatar, C as CosmeticName, a as NameAdornments, R as RankChip, e as earnChatMessage, E as EmojiPicker, h as highlightMessage, b as EMOJI_EFFECTS } from "./EmojiPicker-DcAQqNHO.mjs";
import { f as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useMyRoles } from "./use-my-role-Cv7Uou7c.mjs";
import { u as useStaffPermissions } from "./use-staff-permissions-DnZyPMSN.mjs";
import { c as clearChannelMessages, b as banUser, m as muteUser, d as deleteMessageMod } from "./moderation.functions-BtSBLwCC.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, L as Label2, S as Separator2, I as Item2, a as SubTrigger2, b as SubContent2, c as CheckboxItem2, d as ItemIndicator2, e as RadioItem2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { S as SPEND } from "./economy-config-CPZpIbo-.mjs";
import { m as mergeMediaConfig, p as parseYoutubeId, a as parseGiphyUrl } from "./media-providers-config-Do_nLlCF.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as getUrlAllowList } from "./trust-safety.functions-CIMNTEvE.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { S as SHOP_BY_ID, a as SHOP_BY_CATEGORY, s as stickerGifUrl } from "./shop-catalog-QoXq-K4P.mjs";
import { i as isCurrentUserAdmin, c as clearCaches, f as formatClearReport } from "./cache-manager-cID9K-3q.mjs";
import { m as maxDurationForChannel, V as VOICE_NOTES_DEFAULTS } from "./voice-notes-config-ARlQw0o0.mjs";
import { aD as Reply, ao as CheckCheck, X, ah as Paperclip, a as Sparkles, aE as Sticker, aF as ImagePlay, aG as Youtube, ak as Mic, ai as Smile, aj as Send, aH as CornerDownRight, aI as Download, a0 as LoaderCircle, aw as Gavel, q as LogOut, ad as VolumeX, av as Ban, d as Trash2, aJ as ShoppingBag, $ as CircleAlert, N as Search, aK as Link, aL as Square, ag as Pause, af as Play, a6 as ChevronRight, z as Check, aM as Circle } from "../_libs/lucide-react.mjs";
const ProfilePopupContext = reactExports.createContext(null);
function logProfileEvent(event, detail) {
  return;
}
function ProfilePopupProvider({ children }) {
  const [selectedUserId, setSelectedUserId] = reactExports.useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = reactExports.useState(false);
  const selectedUserIdRef = reactExports.useRef(null);
  selectedUserIdRef.current = selectedUserId;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathRef = reactExports.useRef(pathname);
  const closeProfile = reactExports.useCallback((reason) => {
    setProfileDialogOpen((wasOpen) => {
      if (wasOpen) {
        logProfileEvent("closed", { userId: selectedUserIdRef.current });
      }
      return false;
    });
    if (reason !== "open-other-profile") {
      setSelectedUserId(null);
    }
  }, []);
  const openProfile = reactExports.useCallback((userId) => {
    setProfileDialogOpen((wasOpen) => {
      if (wasOpen && selectedUserIdRef.current && selectedUserIdRef.current !== userId) {
        logProfileEvent("closed", { userId: selectedUserIdRef.current });
      }
      return true;
    });
    setSelectedUserId(userId);
  }, []);
  reactExports.useEffect(() => {
    if (profileDialogOpen && prevPathRef.current !== pathname) {
      closeProfile("navigation");
    }
    prevPathRef.current = pathname;
  }, [pathname, profileDialogOpen, closeProfile]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ProfilePopupContext.Provider,
    {
      value: { selectedUserId, profileDialogOpen, openProfile, closeProfile },
      children
    }
  );
}
function useProfilePopup() {
  const ctx = reactExports.useContext(ProfilePopupContext);
  if (!ctx) {
    throw new Error("useProfilePopup must be used within ProfilePopupProvider");
  }
  return ctx;
}
function UserMenu({
  userId,
  children
}) {
  const { openProfile } = useProfilePopup();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        openProfile(userId);
      },
      className: "cursor-pointer bg-transparent p-0 text-left hover:text-primary focus:outline-none",
      children
    }
  );
}
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
function StaffActionsMenu({
  targetUserId,
  targetName,
  isBot,
  messageId,
  size = "sm",
  alwaysVisible = false
}) {
  const { state, staffKick, staffLocalMute } = useChat();
  const { user: authUser } = useAuth();
  const { isAdmin, isModerator } = useMyRoles();
  const perms = useStaffPermissions();
  const banFn = useServerFn(banUser);
  const muteFn = useServerFn(muteUser);
  const delFn = useServerFn(deleteMessageMod);
  const [busy, setBusy] = reactExports.useState(false);
  const isMe = !authUser || targetUserId === authUser.id || targetUserId === "me";
  if (!isModerator || isMe || isBot) return null;
  const canKick = isAdmin || perms.mod_can_kick;
  const canMute = isAdmin || perms.mod_can_mute;
  const canBan = isAdmin || perms.mod_can_ban;
  const canDelete = isAdmin || perms.mod_can_ban;
  if (!canKick && !canMute && !canBan && !canDelete) return null;
  const channelId = state.activeChannel;
  const realId = targetUserId === "me" ? authUser?.id ?? "" : targetUserId;
  async function doMute(minutes) {
    if (busy) return;
    setBusy(true);
    try {
      await muteFn({ data: { user_id: realId, scope: "room", channel_id: channelId, expires_in_minutes: minutes, reason: "Staff mute" } });
      staffLocalMute(targetUserId, channelId, minutes, targetName);
      toast.success(`Muted ${targetName} for ${minutes}m`);
    } catch (e) {
      toast.error(`Mute failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  async function doBan(hours) {
    if (busy) return;
    setBusy(true);
    try {
      await banFn({ data: { user_id: realId, ban_type: hours ? "temp_ban" : "ban", reason: "Staff ban", expires_in_hours: hours } });
      toast.success(hours ? `Banned ${targetName} for ${hours}h` : `Banned ${targetName} permanently`);
    } catch (e) {
      toast.error(`Ban failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  async function doDelete() {
    if (busy || !messageId) return;
    setBusy(true);
    try {
      await delFn({ data: { message_id: messageId } });
      toast.success("Message deleted");
    } catch (e) {
      toast.error(`Delete failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  const triggerCls = size === "xs" ? "grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-warning/15 hover:text-warning" : "grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-warning/15 hover:text-warning";
  const visibility = alwaysVisible ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: (e) => e.stopPropagation(),
        title: "Staff actions",
        "aria-label": "Staff actions",
        className: `${triggerCls} ${visibility} shrink-0 transition-opacity`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5" })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-52", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: [
        "Staff actions — @",
        targetName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      canKick && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => {
        staffKick(targetUserId, channelId, targetName);
        toast.success(`Kicked ${targetName} from this room (5 min)`);
      }, className: "gap-2 text-warning", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
        " Kick from room (5 min)"
      ] }),
      canMute && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doMute(15), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }),
          " Mute 15 minutes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doMute(60), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }),
          " Mute 1 hour"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doMute(60 * 24), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }),
          " Mute 1 day"
        ] })
      ] }),
      canBan && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doBan(24), className: "gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }),
          " Ban 24 hours"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doBan(24 * 7), className: "gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }),
          " Ban 7 days"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => doBan(void 0), className: "gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }),
          " Ban permanently"
        ] })
      ] }),
      canDelete && messageId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: doDelete, className: "gap-2 text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
          " Delete this message"
        ] })
      ] })
    ] })
  ] });
}
let nextId = 1;
function EmojiEffectLayer({ channelId }) {
  const { channelMessages } = useChat();
  const msgs = channelMessages(channelId);
  const last = msgs[msgs.length - 1];
  const lastIdRef = reactExports.useRef(null);
  const [bursts, setBursts] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!last) return;
    if (lastIdRef.current === null) {
      lastIdRef.current = last.id;
      return;
    }
    if (last.id === lastIdRef.current) return;
    lastIdRef.current = last.id;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const text = (last.text || "").trim();
    if (!text) return;
    const eff = pickEffect(text);
    if (!eff) return;
    const particles = makeParticles(eff);
    setBursts((b) => [...b, ...particles]);
    const maxLife = Math.max(...particles.map((p) => p.delay + p.dur)) + 200;
    const t = setTimeout(() => {
      setBursts((b) => b.filter((x) => !particles.some((p) => p.id === x.id)));
    }, maxLife);
    return () => clearTimeout(t);
  }, [last]);
  const tint = reactExports.useMemo(() => bursts.find((b) => b.effect.bg)?.effect.bg ?? "", [bursts]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "aria-hidden": true,
      className: `pointer-events-none absolute inset-0 z-30 overflow-hidden ${tint} transition-colors duration-300`,
      children: [
        bursts.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: animClass(b.effect.kind),
            style: {
              position: "absolute",
              left: `${b.left}%`,
              top: b.effect.kind === "rain" ? "-10%" : "50%",
              fontSize: `${b.size}rem`,
              transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
              animationDelay: `${b.delay}ms`,
              animationDuration: `${b.dur}ms`,
              willChange: "transform, opacity"
            },
            children: b.emoji
          },
          b.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: KEYFRAMES })
      ]
    }
  );
}
function pickEffect(text) {
  if (EMOJI_EFFECTS[text]) return EMOJI_EFFECTS[text];
  for (const key of Object.keys(EMOJI_EFFECTS)) {
    if (text === key.repeat(2) || text === key.repeat(3)) return EMOJI_EFFECTS[key];
  }
  return null;
}
function makeParticles(eff) {
  const count = eff.kind === "rain" ? 28 : eff.kind === "burst" ? 22 : 10;
  const out = [];
  for (let i = 0; i < count; i++) {
    const emoji = eff.burst[i % eff.burst.length];
    out.push({
      id: nextId++,
      emoji,
      left: Math.random() * 100,
      delay: Math.random() * (eff.kind === "rain" ? 900 : 250),
      dur: eff.kind === "rain" ? 1800 + Math.random() * 1200 : eff.kind === "burst" ? 1200 + Math.random() * 600 : 900,
      rot: (Math.random() - 0.5) * 60,
      size: 1.4 + Math.random() * 1.6,
      effect: eff
    });
  }
  return out;
}
function animClass(kind) {
  switch (kind) {
    case "rain":
      return "emoji-fx-rain";
    case "burst":
      return "emoji-fx-burst";
    case "shake":
      return "emoji-fx-shake";
    case "pulse":
      return "emoji-fx-pulse";
  }
}
const KEYFRAMES = `
@keyframes emoji-fx-rain-kf {
  0%   { transform: translate(-50%, -50%) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translate(-50%, 700%) rotate(360deg); opacity: 0; }
}
.emoji-fx-rain { animation-name: emoji-fx-rain-kf; animation-timing-function: cubic-bezier(.3,.1,.5,1); animation-fill-mode: forwards; }

@keyframes emoji-fx-burst-kf {
  0%   { transform: translate(-50%, -50%) scale(.2) rotate(0deg); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,-200px))) scale(1.4) rotate(var(--r,360deg)); opacity: 0; }
}
.emoji-fx-burst {
  --dx: calc((var(--rand-x, 0) - .5) * 800px);
  --dy: calc((var(--rand-y, 0) - .8) * 700px);
  --r: calc((var(--rand-r, 0) - .5) * 720deg);
  animation-name: emoji-fx-burst-kf; animation-timing-function: cubic-bezier(.2,.7,.3,1); animation-fill-mode: forwards;
}

@keyframes emoji-fx-shake-kf {
  0%,100% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
  20%     { transform: translate(calc(-50% - 20px), -50%) rotate(-15deg); }
  40%     { transform: translate(calc(-50% + 20px), -50%) rotate(15deg); }
  60%     { transform: translate(calc(-50% - 14px), -50%) rotate(-10deg); }
  80%     { transform: translate(calc(-50% + 14px), -50%) rotate(10deg); }
  100%    { opacity: 0; }
}
.emoji-fx-shake { animation-name: emoji-fx-shake-kf; animation-fill-mode: forwards; }

@keyframes emoji-fx-pulse-kf {
  0%   { transform: translate(-50%, -50%) scale(.3); opacity: 0; }
  40%  { transform: translate(-50%, -50%) scale(2.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
}
.emoji-fx-pulse { animation-name: emoji-fx-pulse-kf; animation-fill-mode: forwards; }
`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function HighlightButton({ messageId, channelId }) {
  const buy = useServerFn(highlightMessage);
  const [busy, setBusy] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(false);
  if (!UUID_RE.test(messageId)) return null;
  async function onClick() {
    if (busy || done) return;
    if (!confirm(`Highlight this message for 1 hour? Costs ${SPEND.highlight_message.coins} coins.`)) return;
    setBusy(true);
    try {
      await buy({ data: { messageId, channelId } });
      setDone(true);
    } catch (e) {
      alert(e.message ?? "Couldn't highlight");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      disabled: busy || done,
      className: `opacity-0 transition-opacity group-hover/msg:opacity-100 ${done ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`,
      title: done ? "Highlighted" : `Highlight (${SPEND.highlight_message.coins} coins)`,
      "aria-label": "Highlight message",
      children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" })
    }
  );
}
const URL_RE$1 = /\b((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/gi;
function safeHref(raw) {
  let candidate = raw.trim();
  if (!candidate) return null;
  candidate = candidate.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F]/g, "");
  if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
  if (!/^https?:\/\//i.test(candidate)) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}
function linkify(text, keyPrefix = "l") {
  if (!text) return [];
  const out = [];
  let lastIdx = 0;
  let i = 0;
  for (const m of text.matchAll(URL_RE$1)) {
    const start = m.index ?? 0;
    const raw = m[0];
    const href = safeHref(raw);
    if (start > lastIdx) out.push(text.slice(lastIdx, start));
    if (href) {
      out.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer nofollow ugc external",
            className: "underline underline-offset-2 decoration-current/60 hover:decoration-current font-medium break-all [color:inherit]",
            children: raw
          },
          `${keyPrefix}-${i++}`
        )
      );
    } else {
      out.push(raw);
    }
    lastIdx = start + raw.length;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out;
}
function firstUrl(text) {
  const m = (text || "").match(/https?:\/\/\S+/);
  return m ? m[0] : null;
}
function MediaEmbed({ text }) {
  const { raw } = useAppSettings();
  const media = mergeMediaConfig(raw.media);
  const url = firstUrl(text);
  if (!url) return null;
  const ytId = parseYoutubeId(url);
  if (ytId && media.youtube.enabled) {
    const host = media.youtube.defaultPrivacy === "unlisted" ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 max-w-[320px] overflow-hidden rounded-xl border border-border bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full", style: { paddingTop: "56.25%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "iframe",
      {
        src: `${host}/embed/${ytId}`,
        title: "YouTube video",
        loading: "lazy",
        allow: "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        className: "absolute inset-0 h-full w-full"
      }
    ) }) });
  }
  const giphy = parseGiphyUrl(url);
  if (giphy && media.giphy.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: url,
        target: "_blank",
        rel: "noreferrer",
        className: "mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: giphy.gifUrl, alt: "GIF", className: "block max-h-72 w-full object-contain bg-black/30" })
      }
    );
  }
  if (/\.gif($|\?)/i.test(url) && /giphy\.com/i.test(url) && media.giphy.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: url,
        target: "_blank",
        rel: "noreferrer",
        className: "mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: "GIF", className: "block max-h-72 w-full object-contain bg-black/30" })
      }
    );
  }
  return null;
}
function fmt(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}
function bars(seed, n = 28) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  const out = [];
  for (let i = 0; i < n; i++) {
    h = h * 1103515245 + 12345 >>> 0;
    out.push(0.25 + (h >>> 8) % 100 / 130);
  }
  return out;
}
function VoiceNoteBubble({ a }) {
  const audioRef = reactExports.useRef(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [buffering, setBuffering] = reactExports.useState(false);
  const [cur, setCur] = reactExports.useState(0);
  const [dur, setDur] = reactExports.useState(a.duration ?? 0);
  const heights = bars(a.name);
  reactExports.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCur(el.currentTime);
    const onMeta = () => {
      if (isFinite(el.duration) && el.duration > 0) setDur(el.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      setCur(0);
    };
    const onWait = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onPlaying = () => setBuffering(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    el.addEventListener("waiting", onWait);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("playing", onPlaying);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("waiting", onWait);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("playing", onPlaying);
    };
  }, []);
  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      setBuffering(true);
      void el.play().catch(() => setBuffering(false));
    } else el.pause();
  }
  function seekTo(ratio) {
    const el = audioRef.current;
    if (!el || !dur) return;
    el.currentTime = Math.max(0, Math.min(dur, ratio * dur));
    setCur(el.currentTime);
  }
  function onBarClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }
  const progress = dur > 0 ? Math.min(1, cur / dur) : 0;
  const litCount = Math.round(progress * heights.length);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex w-[260px] max-w-full items-center gap-2 rounded-2xl border border-border bg-white/5 px-2.5 py-2 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { ref: audioRef, src: a.dataUrl, preload: "metadata", className: "hidden" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: toggle,
        className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95",
        "aria-label": playing ? "Pause voice note" : "Play voice note",
        children: buffering ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 translate-x-[1px]" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          role: "slider",
          "aria-valuemin": 0,
          "aria-valuemax": Math.max(1, Math.floor(dur)),
          "aria-valuenow": Math.floor(cur),
          "aria-label": "Voice note progress",
          onClick: onBarClick,
          className: "group flex h-7 cursor-pointer items-end gap-[2px]",
          children: heights.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `block w-[3px] rounded-full transition-colors ${i < litCount ? "bg-primary" : "bg-foreground/25"}`,
              style: { height: `${Math.round(h * 100)}%` }
            },
            i
          ))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-center justify-between text-[10px] tabular-nums text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-2.5 w-2.5" }),
          " ",
          fmt(cur),
          " / ",
          fmt(dur)
        ] }),
        buffering && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/80", children: "buffering…" })
      ] })
    ] })
  ] });
}
const URL_RE = /https?:\/\/[^\s<>]+/gi;
function hostAllowed(host, allowed, blocked) {
  const h = host.toLowerCase();
  for (const d of blocked) if (h === d || h.endsWith("." + d)) return false;
  if (allowed.size === 0) return true;
  for (const d of allowed) if (h === d || h.endsWith("." + d)) return true;
  return false;
}
function useDmUrlMask() {
  const fetchList = useServerFn(getUrlAllowList);
  const q = useQuery({
    queryKey: ["url-allow-list"],
    queryFn: () => fetchList(),
    staleTime: 5 * 6e4,
    gcTime: 30 * 6e4
  });
  const mask = reactExports.useMemo(() => {
    const allowed = new Set(q.data?.allowed ?? []);
    const blocked = new Set(q.data?.blocked ?? []);
    return (text) => {
      if (!text) return text;
      return text.replace(URL_RE, (url) => {
        try {
          const host = new URL(url).hostname;
          return hostAllowed(host, allowed, blocked) ? url : "**************";
        } catch {
          return url;
        }
      });
    };
  }, [q.data]);
  return mask;
}
function AttachmentView({ a }) {
  if (a.mime?.startsWith("audio/")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceNoteBubble, { a });
  }
  if (a.kind === "image") {
    const isSticker = a.mime === "image/gif" || /\.gif$/i.test(a.name || "");
    if (isSticker) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: a.dataUrl,
          alt: a.name,
          className: "mt-1 block h-16 w-16 object-contain"
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.dataUrl, download: a.name, className: "mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.dataUrl, alt: a.name, className: "block max-h-72 w-full object-contain bg-black/30" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: a.dataUrl, download: a.name, className: "mt-1 flex max-w-[280px] items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-xs hover:bg-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: a.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
        (a.size / 1024).toFixed(1),
        " KB"
      ] })
    ] })
  ] });
}
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function renderText(text) {
  const parts = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    tokens.forEach((t, i) => {
      if (/^\*\*.+\*\*$/.test(t))
        parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold text-foreground", children: linkify(t.slice(2, -2), `${li}-${i}`) }, `${li}-${i}`));
      else if (/^`.+`$/.test(t))
        parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary", children: t.slice(1, -1) }, `${li}-${i}`));
      else if (/^_.+_$/.test(t))
        parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-muted-foreground", children: linkify(t.slice(1, -1), `${li}-${i}`) }, `${li}-${i}`));
      else parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: linkify(t, `${li}-${i}`) }, `${li}-${i}`));
    });
    if (li < lines.length - 1) parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("br", {}, `br-${li}`));
  });
  return parts;
}
function Time({ ts }) {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/70", suppressHydrationWarning: true, children: mounted ? formatTime(ts) : "" });
}
function ReplyPreview({ message, align = "left" }) {
  const { state } = useChat();
  const author = state.users[message.authorId];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mb-1 flex max-w-[80%] items-center gap-1.5 rounded-lg border-l-2 border-primary/60 bg-white/5 px-2 py-1 text-[11px] ${align === "right" ? "self-end" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CornerDownRight, { className: "h-3 w-3 shrink-0 text-primary/70" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary/90", children: author?.name || "Unknown" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-muted-foreground", children: message.text || (message.attachment ? `📎 ${message.attachment.name}` : "(message)") })
  ] });
}
function MessageList({ channelId }) {
  const { channelMessages, state, setReplyingTo, findMessage, isDM, dmPeerReadAt } = useChat();
  const { isIgnored } = useIgnore();
  const maskDmUrls = useDmUrlMask();
  const isDmChan = isDM(channelId);
  const applyMask = (authorId, text) => isDmChan && authorId !== "me" ? maskDmUrls(text) : text;
  const allMsgs = channelMessages(channelId);
  const msgs = reactExports.useMemo(
    () => allMsgs.filter((m) => {
      const u = state.users[m.authorId];
      if (!u || m.authorId === "me") return true;
      return !isIgnored(m.authorId, u.isBot);
    }),
    [allMsgs, state.users, isIgnored]
  );
  const peerReadAt = isDM(channelId) ? dmPeerReadAt(channelId) : 0;
  const lastSeenMeId = reactExports.useMemo(() => {
    let lastMeIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].authorId === "me") {
        lastMeIdx = i;
        break;
      }
    }
    if (lastMeIdx === -1) return null;
    if (isDM(channelId)) {
      return peerReadAt && msgs[lastMeIdx].ts <= peerReadAt ? msgs[lastMeIdx].id : null;
    }
    const hasLaterHuman = msgs.slice(lastMeIdx + 1).some((m) => {
      if (m.authorId === "me") return false;
      const u = state.users[m.authorId];
      return u && !u.isBot;
    });
    return hasLaterHuman ? msgs[lastMeIdx].id : null;
  }, [msgs, state.users, isDM, channelId, peerReadAt]);
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [msgs.length, channelId]);
  const groups = [];
  msgs.forEach((m) => {
    const last = groups[groups.length - 1];
    if (last && last[0].authorId === m.authorId && !m.replyToId && !last[last.length - 1].replyToId && m.ts - last[last.length - 1].ts < 5 * 6e4)
      last.push(m);
    else groups.push([m]);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(EmojiEffectLayer, { channelId }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto px-3 py-2 text-xs md:text-[15px]", children: [
      groups.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full place-items-center text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-5xl", children: "💬" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "No messages yet. Say hi or type",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary", children: "!help" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: groups.map((g, gi) => {
        const author = state.users[g[0].authorId];
        if (!author) return null;
        const isMe = author.id === "me";
        if (isMe) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-row-reverse gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: author, size: 28 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Time, { ts: g[0].ts }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserMenu, { userId: author.id, username: author.name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold text-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: author.id, name: author.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(NameAdornments, { user: author })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(RankChip, { level: author.level, compact: true })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex max-w-[80%] flex-col items-end gap-1", children: g.map((m) => {
                const replied = m.replyToId ? findMessage(m.replyToId) : null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col items-end", children: [
                  replied && /* @__PURE__ */ jsxRuntimeExports.jsx(ReplyPreview, { message: replied, align: "right" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/msg flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => setReplyingTo(m),
                        className: "opacity-0 transition-opacity hover:text-primary group-hover/msg:opacity-100",
                        title: "Reply",
                        "aria-label": "Reply",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-3.5 w-3.5 text-muted-foreground" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: m.kind === "me" ? "rounded-2xl bg-white/5 px-3 py-1.5 text-xs italic text-primary chat-bubble-in" : "rounded-2xl rounded-tr-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20 chat-bubble-in",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words", children: renderText(applyMask(m.authorId, m.text)) }),
                          m.text && /* @__PURE__ */ jsxRuntimeExports.jsx(MediaEmbed, { text: m.text }),
                          m.attachment && /* @__PURE__ */ jsxRuntimeExports.jsx(AttachmentView, { a: m.attachment })
                        ]
                      }
                    )
                  ] })
                ] }, m.id);
              }) }),
              g.some((m) => m.id === lastSeenMeId) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 pr-1 text-[10px] font-medium text-primary/80", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Seen" })
              ] })
            ] })
          ] }, gi);
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FrameAvatar, { user: author, size: 28 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserMenu, { userId: author.id, username: author.name, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CosmeticName, { userId: author.id, name: author.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NameAdornments, { user: author })
              ] }) }),
              author.isBot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-primary", children: "Bot" }),
              !author.isBot && author.level > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(RankChip, { level: author.level, compact: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Time, { ts: g[0].ts })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: g.map((m) => {
              const replied = m.replyToId ? findMessage(m.replyToId) : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                replied && /* @__PURE__ */ jsxRuntimeExports.jsx(ReplyPreview, { message: replied }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/msg flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: m.kind === "me" ? "rounded-2xl bg-white/5 px-3 py-1.5 text-xs italic text-primary chat-bubble-in" : "max-w-[80%] rounded-2xl rounded-tl-md border border-border bg-card/70 backdrop-blur-sm px-3 py-1.5 text-xs leading-snug text-foreground/90 shadow-sm chat-bubble-in",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words", children: renderText(applyMask(m.authorId, m.text)) }),
                        m.text && /* @__PURE__ */ jsxRuntimeExports.jsx(MediaEmbed, { text: m.text }),
                        m.attachment && /* @__PURE__ */ jsxRuntimeExports.jsx(AttachmentView, { a: m.attachment })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setReplyingTo(m),
                      className: "opacity-0 transition-opacity hover:text-primary group-hover/msg:opacity-100",
                      title: "Reply",
                      "aria-label": "Reply",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-3.5 w-3.5 text-muted-foreground" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HighlightButton, { messageId: m.id, channelId: state.activeChannel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StaffActionsMenu, { targetUserId: author.id, targetName: author.name, isBot: author.isBot, messageId: m.id, size: "xs" })
                ] })
              ] }, m.id);
            }) })
          ] })
        ] }, gi);
      }) })
    ] })
  ] });
}
const IDLE_MS = 2500;
const HEARTBEAT_MS = 1500;
const STALE_MS = 3e3;
function useTyping(channelId, me, enabled) {
  const [typers, setTypers] = reactExports.useState([]);
  const channelRef = reactExports.useRef(null);
  const lastSentRef = reactExports.useRef(0);
  const idleTimerRef = reactExports.useRef(null);
  const isTypingRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!channelId || !me) return;
    const ch = supabase.channel(`typing:${channelId}`, {
      config: { broadcast: { self: false } }
    });
    ch.on("broadcast", { event: "typing" }, (msg) => {
      const p = msg.payload;
      const pid = p?.id;
      const pname = p?.name;
      if (!pid || !pname || pid === me.id) return;
      rtLog("typing", "in", `${pname} @ ${channelId}`);
      setTypers((prev) => {
        const others = prev.filter((t) => t.id !== pid);
        return [...others, { id: pid, name: pname, ts: Date.now() }];
      });
    });
    ch.on("broadcast", { event: "stop" }, (msg) => {
      const p = msg.payload;
      const pid = p?.id;
      if (!pid || pid === me.id) return;
      setTypers((prev) => prev.filter((t) => t.id !== pid));
    });
    ch.subscribe((status) => rtLog("ws", status, `typing:${channelId}`));
    channelRef.current = ch;
    return () => {
      if (isTypingRef.current) {
        void ch.send({ type: "broadcast", event: "stop", payload: { id: me.id } });
      }
      supabase.removeChannel(ch);
      channelRef.current = null;
      isTypingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setTypers([]);
    };
  }, [channelId, me?.id, me?.name]);
  reactExports.useEffect(() => {
    const i = setInterval(() => {
      setTypers((prev) => {
        const fresh = prev.filter((t) => Date.now() - t.ts < STALE_MS);
        return fresh.length === prev.length ? prev : fresh;
      });
    }, 500);
    return () => clearInterval(i);
  }, []);
  function emitStop() {
    if (!channelRef.current || !me) return;
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    void channelRef.current.send({
      type: "broadcast",
      event: "stop",
      payload: { id: me.id }
    });
  }
  function sendTyping() {
    if (!enabled || !me || !channelRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current >= HEARTBEAT_MS) {
      lastSentRef.current = now;
      isTypingRef.current = true;
      void channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { id: me.id, name: me.name }
      });
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      emitStop();
      lastSentRef.current = 0;
    }, IDLE_MS);
  }
  function stopTyping() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    lastSentRef.current = 0;
    emitStop();
  }
  const visible = typers.filter((t) => Date.now() - t.ts < STALE_MS);
  return { typers: visible, sendTyping, stopTyping };
}
function stickerUrl(s) {
  return s.url ?? stickerGifUrl(s.cp);
}
function useCustomPacks() {
  const [packs, setPacks] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("custom_stickers").select("id, name, pack, kind, url, sort_order").eq("is_active", true).order("pack", { ascending: true }).order("sort_order", { ascending: true });
      if (cancelled) return;
      const byPack = /* @__PURE__ */ new Map();
      for (const r of data ?? []) {
        const key = `${r.kind === "emoji" ? "Emojis" : "Stickers"} · ${r.pack || "Custom"}`;
        const list = byPack.get(key) ?? [];
        list.push({ cp: r.id, name: r.name, label: r.name, url: r.url });
        byPack.set(key, list);
      }
      const out = [];
      for (const [name, stickers] of byPack) {
        out.push({ id: `custom:${name}`, name, stickers, isCustom: true });
      }
      setPacks(out);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return packs;
}
function AnimatedEmojiPicker({ onPick, onOpenShop }) {
  const { user } = useAuth();
  const [ownedPacks, setOwnedPacks] = reactExports.useState(null);
  const [activeId, setActiveId] = reactExports.useState(null);
  const customPacks = useCustomPacks();
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) {
        setOwnedPacks([]);
        return;
      }
      const { data } = await supabase.from("user_inventory").select("item_id, category").eq("user_id", user.id).eq("category", "emoji_pack");
      if (cancelled) return;
      const items = (data ?? []).map((r) => SHOP_BY_ID[r.item_id]).filter((it) => !!it && !!it.stickers?.length);
      setOwnedPacks(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const totalForSale = SHOP_BY_CATEGORY.emoji_pack.length;
  const allPacks = [
    ...customPacks ?? [],
    ...(ownedPacks ?? []).map((p) => ({ id: p.id, name: p.name.replace(/ Pack$/, ""), stickers: p.stickers ?? [] }))
  ];
  reactExports.useEffect(() => {
    if (activeId) return;
    if (allPacks.length > 0) setActiveId(allPacks[0].id);
  }, [allPacks.length, activeId]);
  if (customPacks === null || ownedPacks === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[320px] rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground shadow-lg", children: "Loading stickers…" });
  }
  if (allPacks.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[320px] rounded-xl border border-border bg-card p-4 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 py-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "No animated stickers yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Buy sticker packs from the Shop, or ask an admin to upload custom ones." }),
      onOpenShop && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onOpenShop,
          className: "mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3.5 w-3.5" }),
            " Open Shop (",
            totalForSale,
            " packs)"
          ]
        }
      )
    ] }) });
  }
  const active = allPacks.find((p) => p.id === activeId) ?? allPacks[0];
  const isEmojiPack = active.isCustom && /^Emojis/.test(active.name);
  const cellSize = isEmojiPack ? "h-10 w-10" : "h-16 w-16";
  const imgSize = isEmojiPack ? "h-9 w-9" : "h-14 w-14";
  const cols = isEmojiPack ? "grid-cols-6" : "grid-cols-4";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto", children: [
      allPacks.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveId(p.id),
          title: p.name,
          className: `shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active.id === p.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`,
          children: p.name
        },
        p.id
      )),
      onOpenShop && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onOpenShop,
          title: "Get more packs in Shop",
          className: "ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3.5 w-3.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[240px] overflow-y-auto p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid ${cols} gap-1.5`, children: (active.stickers ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onPick(s),
        title: s.label,
        className: `grid ${cellSize} place-items-center rounded-lg transition-transform hover:scale-110 hover:bg-white/5 active:scale-95`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: stickerUrl(s),
            alt: s.label,
            loading: "lazy",
            className: `${imgSize} object-contain`
          }
        )
      },
      s.name + s.cp
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground", children: "Tap to send" })
  ] });
}
function GiphyPicker({ onPick }) {
  const { raw } = useAppSettings();
  const cfg = mergeMediaConfig(raw.media).giphy;
  const [q, setQ] = reactExports.useState("");
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const debounce = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!cfg.enabled || !cfg.apiKey) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      void load();
    }, q.trim() ? 350 : 0);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [q, cfg.apiKey, cfg.enabled, cfg.rating, cfg.pageSize]);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const base = q.trim() ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q.trim())}` : `https://api.giphy.com/v1/gifs/trending?`;
      const url = `${base}&api_key=${encodeURIComponent(cfg.apiKey)}&limit=${cfg.pageSize}&rating=${cfg.rating}&bundle=messaging_non_clips`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Giphy ${res.status}`);
      const json = await res.json();
      const list = (json.data ?? []).map((g) => ({
        id: g.id,
        title: g.title,
        previewUrl: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url || g.images?.preview_gif?.url,
        fullUrl: g.images?.original?.url || g.images?.downsized?.url,
        pageUrl: g.url || `https://giphy.com/gifs/${g.id}`
      })).filter((g) => g.previewUrl && g.fullUrl);
      setItems(list);
    } catch (e) {
      setError(e?.message || "Failed to load GIFs");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }
  if (!cfg.enabled || !cfg.apiKey) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mx-auto mb-1 h-5 w-5" }),
      "Giphy is not configured. Ask an admin to add a key in Media APIs."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          autoFocus: true,
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder: "Search GIFs…",
          className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "via GIPHY" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-72 overflow-y-auto p-2", children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-6 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) }),
      error && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-4 text-center text-xs text-destructive", children: error }),
      !loading && !error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1.5", children: [
        items.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onPick(g),
            className: "overflow-hidden rounded-md border border-transparent bg-black/30 transition hover:border-primary/60",
            title: g.title,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: g.previewUrl, alt: g.title, className: "block h-20 w-full object-cover", loading: "lazy" })
          },
          g.id
        )),
        items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 py-6 text-center text-xs text-muted-foreground", children: "No results" })
      ] })
    ] })
  ] });
}
function YoutubePicker({ onPick }) {
  const { raw } = useAppSettings();
  const cfg = mergeMediaConfig(raw.media).youtube;
  const [url, setUrl] = reactExports.useState("");
  if (!cfg.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 text-center text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mx-auto mb-1 h-5 w-5" }),
      "YouTube sharing is disabled. Ask an admin to enable it in Media APIs."
    ] });
  }
  const id = parseYoutubeId(url);
  const previewUrl = id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
  function submit() {
    if (!id) return;
    onPick(`https://youtu.be/${id}`);
    setUrl("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3 shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-4 w-4 text-red-500" }),
      "Paste a YouTube link"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            autoFocus: true,
            value: url,
            onChange: (e) => setUrl(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") submit();
            },
            placeholder: "https://youtu.be/…",
            className: "flex-1 bg-transparent py-1.5 text-xs outline-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: submit,
          disabled: !id,
          className: "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40",
          children: "Share"
        }
      )
    ] }),
    previewUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 overflow-hidden rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "YouTube preview", className: "block h-32 w-full object-cover" }) }),
    !id && url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[11px] text-destructive", children: "Not a valid YouTube URL." })
  ] });
}
const MAX_VOICE_BYTES = 4 * 1024 * 1024;
function VoiceRecorder({ maxSeconds, onSend, onClose }) {
  const [phase, setPhase] = reactExports.useState("idle");
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [preview, setPreview] = reactExports.useState(null);
  const mediaRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  const startTsRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    void start();
    return () => {
      void cleanup();
    };
  }, []);
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : void 0);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => finalize();
      mediaRef.current = rec;
      rec.start();
      startTsRef.current = Date.now();
      setPhase("recording");
      timerRef.current = window.setInterval(() => {
        const s = Math.floor((Date.now() - startTsRef.current) / 1e3);
        setElapsed(s);
        if (s >= maxSeconds) stop();
      }, 200);
    } catch (e) {
      toast.error("Microphone unavailable", { description: e instanceof Error ? e.message : "Permission denied" });
      onClose();
    }
  }
  function stop() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  async function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      mediaRef.current?.state !== "inactive" && mediaRef.current?.stop();
    } catch {
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }
  async function finalize() {
    const dur = Math.max(1, Math.floor((Date.now() - startTsRef.current) / 1e3));
    const blob = new Blob(chunksRef.current, { type: mediaRef.current?.mimeType || "audio/webm" });
    if (blob.size > MAX_VOICE_BYTES) {
      toast.error("Voice note too large", { description: "Try a shorter recording." });
      onClose();
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    setPreview({ dataUrl, size: blob.size, duration: dur });
    setPhase("preview");
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }
  function send() {
    if (!preview) return;
    onSend({
      kind: "file",
      name: `voice-note-${preview.duration}s.webm`,
      mime: "audio/webm",
      size: preview.size,
      dataUrl: preview.dataUrl,
      duration: preview.duration
    });
    onClose();
  }
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const remaining = Math.max(0, maxSeconds - elapsed);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-md", children: [
    phase === "recording" && (() => {
      const pct = Math.min(100, elapsed / Math.max(1, maxSeconds) * 100);
      const ring = `conic-gradient(hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}% 100%)`;
      const warn = remaining <= 5;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid h-12 w-12 place-items-center rounded-full", style: { background: ring }, "aria-label": `Recording, ${remaining} seconds left`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full bg-red-500 ${warn ? "animate-ping" : "animate-pulse"}` }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold tabular-nums", children: [
            "Recording… ",
            mm,
            ":",
            ss
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs tabular-nums ${warn ? "font-semibold text-destructive" : "text-muted-foreground"}`, children: [
            remaining,
            "s left (max ",
            maxSeconds,
            "s)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-[width] duration-200", style: { width: `${pct}%` } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-full p-2 text-muted-foreground hover:text-destructive", title: "Cancel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: stop, className: "grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform", title: "Stop", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }) })
      ] });
    })(),
    phase === "preview" && preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { src: preview.dataUrl, controls: true, className: "h-10 flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-full p-2 text-muted-foreground hover:text-destructive", title: "Discard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: send, className: "grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform", title: "Send", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
    ] }),
    phase === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Requesting microphone…" })
  ] });
}
const COMMANDS = [
  "!help",
  "!roll",
  "!flip",
  "!slots",
  "!fish",
  "!dig",
  "!trivia",
  "!a",
  "!hangman",
  "!g",
  "!me",
  "!stats"
];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
function MessageInput() {
  const { send, state, replyingTo, setReplyingTo, pushSystem, wipeChannel } = useChat();
  const { user } = useAuth();
  const [authPopup, setAuthPopup] = reactExports.useState(null);
  const me = user && !user.isGuest ? { id: user.id, name: user.username } : null;
  const { typers, sendTyping } = useTyping(state.activeChannel, me, !!me);
  const [text, setText] = reactExports.useState("");
  const [showEmoji, setShowEmoji] = reactExports.useState(false);
  const [showStickers, setShowStickers] = reactExports.useState(false);
  const [showGiphy, setShowGiphy] = reactExports.useState(false);
  const [showYoutube, setShowYoutube] = reactExports.useState(false);
  const [showVoice, setShowVoice] = reactExports.useState(false);
  const { raw: appRaw } = useAppSettings();
  const media = mergeMediaConfig(appRaw.media);
  const voiceCfg = { ...VOICE_NOTES_DEFAULTS, ...appRaw.voice_notes || {} };
  const voiceMax = maxDurationForChannel(state.activeChannel, voiceCfg);
  const [attachment, setAttachment] = reactExports.useState(null);
  const [attachError, setAttachError] = reactExports.useState("");
  const [caret, setCaret] = reactExports.useState(0);
  const [mentionIdx, setMentionIdx] = reactExports.useState(0);
  const inputRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  const suggestions = text.startsWith("!") ? COMMANDS.filter((c) => c.startsWith(text.split(" ")[0])).slice(0, 5) : [];
  const mentionMatch = (() => {
    const before = text.slice(0, caret);
    const m = before.match(/(?:^|\s)@([\w-]*)$/);
    if (!m) return null;
    return { query: m[1].toLowerCase(), start: caret - m[1].length - 1 };
  })();
  const mentionSuggestions = mentionMatch ? Object.values(state.users).filter((u) => u.id !== "me" && u.name.toLowerCase().includes(mentionMatch.query)).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(mentionMatch.query) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(mentionMatch.query) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    const aOn = a.status === "online" ? 0 : 1;
    const bOn = b.status === "online" ? 0 : 1;
    if (aOn !== bOn) return aOn - bOn;
    return a.name.localeCompare(b.name);
  }).slice(0, 6) : [];
  reactExports.useEffect(() => {
    setMentionIdx(0);
  }, [mentionMatch?.query]);
  function applyMention(name) {
    if (!mentionMatch) return;
    const before = text.slice(0, mentionMatch.start);
    const after = text.slice(caret);
    const inserted = `@${name} `;
    const next = before + inserted + after;
    setText(next);
    const pos = (before + inserted).length;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  }
  reactExports.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
    }
  }, [text]);
  reactExports.useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);
  reactExports.useEffect(() => {
    function onMention(e) {
      const ce = e;
      const name = ce.detail?.name;
      if (!name) return;
      setText((t) => {
        const needsSpace = t.length > 0 && !t.endsWith(" ");
        return t + (needsSpace ? " " : "") + `@${name} `;
      });
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const pos = el.value.length;
        el.setSelectionRange(pos, pos);
        setCaret(pos);
      });
    }
    window.addEventListener("palrgo:mention", onMention);
    return () => window.removeEventListener("palrgo:mention", onMention);
  }, []);
  const earnChat = useServerFn(earnChatMessage);
  const clearChannelFn = useServerFn(clearChannelMessages);
  const queryClient = useQueryClient();
  async function handleClearCache() {
    const ok = await isCurrentUserAdmin();
    if (!ok) {
      toast.error("Admins only", { description: "/clearcache is restricted to admins." });
      return;
    }
    toast.loading("Clearing caches…", { id: "clearcache" });
    const report = await clearCaches({ queryClient });
    toast.success("Caches cleared", { id: "clearcache", description: formatClearReport(report) });
  }
  async function handleClearChannel() {
    const channelId = state.activeChannel;
    if (!me) {
      toast.error("Admins only", { description: "/clear (or /delete) is restricted to admins and room moderators." });
      return;
    }
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", me.id);
    const roles = (roleRows ?? []).map((r) => r.role);
    const isAdmin = roles.includes("super_admin") || roles.includes("admin");
    let canClear = isAdmin;
    if (!canClear) {
      const { data: rm } = await supabase.from("room_moderators").select("can_delete").eq("channel_id", channelId).eq("user_id", me.id).maybeSingle();
      canClear = !!rm?.can_delete;
    }
    if (!canClear && roles.includes("moderator")) {
      canClear = true;
    }
    if (!canClear) {
      toast.error("Admins only", { description: "/clear (or /delete) is restricted to admins and room moderators." });
      return;
    }
    toast.loading("Clearing chat…", { id: "clearchat" });
    try {
      const res = await clearChannelFn({ data: { channel_id: channelId } });
      const count = res?.deleted ?? 0;
      wipeChannel(channelId);
      toast.success("Chat cleared", { id: "clearchat", description: `${count} messages removed.` });
      const who = user?.username ? `@${user.username}` : "An admin";
      pushSystem(channelId, `🧹 Chat history cleared by ${who} — ${count} message${count === 1 ? "" : "s"} removed.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to clear chat";
      toast.error("Cannot clear chat", { id: "clearchat", description: msg });
      pushSystem(state.activeChannel, `⚠️ Couldn't clear chat — ${msg}`);
    }
  }
  function autoMentionUsernames(input) {
    if (!input) return input;
    const names = Object.values(state.users).filter((u) => u.id !== "me" && u.id !== me?.id && u.name && u.name.length >= 2).map((u) => u.name).sort((a, b) => b.length - a.length);
    if (names.length === 0) return input;
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let out = input;
    for (const name of names) {
      const re = new RegExp(`(^|[^\\w@])(${escape(name)})(?=$|[^\\w])`, "gi");
      out = out.replace(re, (_m, pre) => `${pre}@${name}`);
    }
    return out;
  }
  function submit() {
    if (!text.trim() && !attachment) return;
    if (!user || user.isGuest) {
      setAuthPopup("signin");
      return;
    }
    const trimmed = text.trim();
    if (/^\/clearcache\b/i.test(trimmed)) {
      setText("");
      setAttachment(null);
      setAttachError("");
      void handleClearCache();
      return;
    }
    if (/^\/(clear|delete)\b/i.test(trimmed)) {
      setText("");
      setAttachment(null);
      setAttachError("");
      void handleClearChannel();
      return;
    }
    const outgoing = autoMentionUsernames(text);
    send(outgoing, { attachment: attachment || void 0, replyToId: replyingTo?.id });
    if (me) {
      earnChat({ data: { channelId: state.activeChannel, isReply: !!replyingTo } }).catch(() => {
      });
    }
    setText("");
    setAttachment(null);
    setAttachError("");
  }
  function onKey(e) {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIdx((i) => (i + 1) % mentionSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIdx((i) => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      }
      if (e.key === "Tab" || e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        applyMention(mentionSuggestions[mentionIdx].name);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setCaret(-1);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && replyingTo) {
      e.preventDefault();
      setReplyingTo(null);
    }
  }
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachError("");
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError(`Max ${(MAX_ATTACHMENT_BYTES / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      setAttachment({
        kind: file.type.startsWith("image/") ? "image" : "file",
        name: file.name.slice(0, 120),
        mime: file.type || "application/octet-stream",
        size: file.size,
        dataUrl
      });
    } catch {
      setAttachError("Couldn't read file");
    }
  }
  const replyAuthor = replyingTo ? state.users[replyingTo.authorId] : null;
  const lobbyMuteUntil = state.moderation?.["lobby"]?.me?.mutedUntil;
  const isLobbyMuted = !!(lobbyMuteUntil && lobbyMuteUntil > Date.now() && state.activeChannel === "lobby");
  const muteSecsLeft = isLobbyMuted ? Math.ceil((lobbyMuteUntil - Date.now()) / 1e3) : 0;
  const muteLabel = muteSecsLeft >= 60 ? `${Math.ceil(muteSecsLeft / 60)}m` : `${muteSecsLeft}s`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-0 sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthDialogs, { popup: authPopup, setPopup: setAuthPopup }),
    replyingTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-3.5 w-3.5 shrink-0 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-primary", children: [
          "Replying to ",
          replyAuthor?.name || "user"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground", children: replyingTo.text || (replyingTo.attachment ? `📎 ${replyingTo.attachment.name}` : "(message)") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReplyingTo(null), className: "shrink-0 text-muted-foreground hover:text-destructive", "aria-label": "Cancel reply", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 flex flex-wrap gap-1.5", children: suggestions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setText(c + " "), className: "rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-primary transition-colors hover:bg-white/10", children: c }, c)) }),
    mentionSuggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg", children: mentionSuggestions.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onMouseDown: (e) => {
          e.preventDefault();
          applyMention(u.name);
        },
        onMouseEnter: () => setMentionIdx(i),
        className: `flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${i === mentionIdx ? "bg-primary/15 text-primary" : "hover:bg-white/5"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white",
              style: { background: u.avatarColor },
              children: u.name.slice(0, 1).toUpperCase()
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate font-medium", children: [
            "@",
            u.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${u.status === "online" ? "bg-green-400" : u.status === "away" ? "bg-yellow-400" : "bg-muted-foreground/40"}` })
        ]
      },
      u.id
    )) }),
    showEmoji && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmojiPicker,
      {
        onPick: (e) => {
          setText((t) => t + e);
          setShowEmoji(false);
          inputRef.current?.focus();
        }
      }
    ) }),
    showStickers && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnimatedEmojiPicker,
      {
        onPick: (s) => {
          send("", {
            attachment: {
              kind: "image",
              name: `${s.name}.gif`,
              mime: "image/gif",
              size: 0,
              dataUrl: stickerUrl(s)
            },
            replyToId: replyingTo?.id
          });
          setShowStickers(false);
        }
      }
    ) }),
    showGiphy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      GiphyPicker,
      {
        onPick: (g) => {
          send(g.pageUrl, { replyToId: replyingTo?.id });
          setShowGiphy(false);
        }
      }
    ) }),
    showYoutube && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      YoutubePicker,
      {
        onPick: (url) => {
          send(url, { replyToId: replyingTo?.id });
          setShowYoutube(false);
        }
      }
    ) }),
    showVoice && /* @__PURE__ */ jsxRuntimeExports.jsx(
      VoiceRecorder,
      {
        maxSeconds: voiceMax,
        onClose: () => setShowVoice(false),
        onSend: (a) => {
          send("", { attachment: a, replyToId: replyingTo?.id });
          setShowVoice(false);
        }
      }
    ),
    attachment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-2xl border border-border bg-white/5 px-3 py-2", children: [
      attachment.kind === "image" ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachment.dataUrl, alt: attachment.name, className: "h-12 w-12 rounded-lg object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-lg bg-white/5 text-xl", children: "📎" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: attachment.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          (attachment.size / 1024).toFixed(1),
          " KB"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAttachment(null), className: "text-muted-foreground hover:text-destructive", "aria-label": "Remove attachment", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    attachError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 px-3 text-xs text-destructive", children: attachError }),
    typers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1.5 px-3 text-[11px] italic text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 animate-bounce rounded-full bg-primary" })
      ] }),
      typers.length === 1 ? `${typers[0].name} is typing…` : typers.length === 2 ? `${typers[0].name} and ${typers[1].name} are typing…` : `${typers.length} people are typing…`
    ] }),
    isLobbyMuted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: "🔇" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
        "You're muted in the lobby (",
        muteLabel,
        " left). You can still DM friends from your friends list."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chat-composer-glow group relative flex items-end gap-1 rounded-3xl border border-border bg-card/60 pt-2 pb-0 pl-4 pr-2 shadow-sm backdrop-blur-md transition-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", onChange: onFile, className: "hidden", accept: "image/*,application/pdf,text/plain,.zip,.doc,.docx" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileRef.current?.click(), className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary", title: "Attach file", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setText((t) => t + (t.endsWith(" ") || !t ? "!" : " !")), className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary", title: "Command", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { ref: inputRef, value: text, onChange: (e) => {
        setText(e.target.value);
        setCaret(e.target.selectionStart ?? e.target.value.length);
        sendTyping();
      }, onKeyUp: (e) => setCaret(e.currentTarget.selectionStart ?? 0), onClick: (e) => setCaret(e.currentTarget.selectionStart ?? 0), onKeyDown: onKey, rows: 1, placeholder: replyingTo ? "Write your reply…" : "Message — try !help or @mention", className: "max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setShowStickers((s) => !s);
        setShowEmoji(false);
        setShowGiphy(false);
        setShowYoutube(false);
      }, className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary", title: "Animated stickers", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sticker, { className: "h-5 w-5" }) }),
      media.giphy.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowGiphy((s) => !s);
            setShowEmoji(false);
            setShowStickers(false);
            setShowYoutube(false);
          },
          className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-fuchsia-400",
          title: "Share a GIF",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlay, { className: "h-5 w-5" })
        }
      ),
      media.youtube.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowYoutube((s) => !s);
            setShowEmoji(false);
            setShowStickers(false);
            setShowGiphy(false);
          },
          className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-red-500",
          title: "Share a YouTube video",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-5 w-5" })
        }
      ),
      voiceCfg.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowVoice((s) => !s);
            setShowEmoji(false);
            setShowStickers(false);
            setShowGiphy(false);
            setShowYoutube(false);
          },
          className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-red-400",
          title: `Voice note (max ${voiceMax}s)`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setShowEmoji((s) => !s);
        setShowStickers(false);
        setShowGiphy(false);
        setShowYoutube(false);
      }, className: "mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground", title: "Emoji", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submit, disabled: !text.trim() && !attachment, className: "grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground shadow-lg transition-all hover:scale-110 active:scale-90 disabled:opacity-40 disabled:hover:scale-100", style: { background: "var(--gradient-primary)", boxShadow: "0 8px 24px -8px var(--primary-glow)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
    ] })
  ] });
}
export {
  DropdownMenu as D,
  GiphyPicker as G,
  MessageList as M,
  ProfilePopupProvider as P,
  StaffActionsMenu as S,
  UserMenu as U,
  MessageInput as a,
  DropdownMenuTrigger as b,
  DropdownMenuContent as c,
  DropdownMenuLabel as d,
  DropdownMenuSeparator as e,
  DropdownMenuItem as f,
  useTyping as g,
  linkify as l,
  useProfilePopup as u
};
