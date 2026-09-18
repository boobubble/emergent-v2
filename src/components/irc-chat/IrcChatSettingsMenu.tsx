import { useEffect, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Globe,
  Home,
  LogIn,
  LogOut,
  Moon,
  Pencil,
  Shield,
  Sun,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useIrcChatCore, useIrcChatState } from "@/lib/irc-chat";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
import { useSoundPrefs, setSoundPref } from "@/lib/sound-prefs";
import { getDmPrivacy, setDmPrivacy } from "@/lib/trust-safety.functions";
import { getLanguage, LANGUAGES } from "@/i18n/languages";
import { setLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { nickAvatarHue, nickInitial } from "./irc-chat-ui";
import { useIrcChatTheme } from "./irc-chat-theme";

type WhoCanDm = "everyone" | "friends" | "nobody";

function MenuDivider() {
  return <div className="my-1 h-px bg-border/60" role="separator" />;
}

function MenuNavRow({
  icon: Icon,
  label,
  hint,
  onClick,
  to,
  search,
  destructive,
  onClose,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick?: () => void;
  to?: string;
  search?: Record<string, string>;
  destructive?: boolean;
  onClose: () => void;
}) {
  const inner = (
    <>
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          destructive ? "text-destructive" : "text-muted-foreground",
        )}
      />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{label}</span>
      {hint ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
      {!destructive ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" /> : null}
    </>
  );
  const className = cn(
    "irc-profile-menu-row flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors",
    destructive
      ? "text-destructive hover:bg-destructive/10"
      : "text-foreground hover:bg-muted/50",
  );
  if (to) {
    return (
      <Link to={to} search={search} className={className} onClick={onClose}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

function ToggleSettingRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-start justify-between gap-3 px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function IrcConnectionStatusLine({ authenticated }: { authenticated: boolean }) {
  if (authenticated) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-500">
        <span className="chat-online-dot h-1.5 w-1.5" aria-hidden />
        Online
      </p>
    );
  }
  return (
    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/45" aria-hidden />
      Connecting…
    </p>
  );
}

function ProfileAvatarBlock({
  avatarUrl,
  label,
  hue,
  showOnline,
  ircOnline,
  size = "md",
}: {
  avatarUrl?: string;
  label: string;
  hue: number;
  showOnline?: boolean;
  ircOnline?: boolean;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className="relative shrink-0">
      <Avatar className={cn(dim, "border border-border/50")}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback
          className="text-[11px] font-bold text-white"
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
        >
          {nickInitial(label)}
        </AvatarFallback>
      </Avatar>
      {showOnline && ircOnline ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-popover bg-emerald-500"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function SettingsBody({ onClose, mobile }: { onClose: () => void; mobile?: boolean }) {
  const { user, logout } = useAuth();
  const { openSignIn, openSignUp } = useAuthGate();
  const core = useIrcChatCore();
  const ircState = useIrcChatState();
  const { profiles } = useRemoteProfileDirectory();
  const soundPrefs = useSoundPrefs();
  const { theme, toggleTheme } = useIrcChatTheme();
  const { i18n } = useTranslation();
  const qc = useQueryClient();
  const getPrivacyFn = useServerFn(getDmPrivacy);
  const setPrivacyFn = useServerFn(setDmPrivacy);
  const isRegistered = Boolean(user);
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const privacyQ = useQuery({
    queryKey: ["dm-privacy"],
    queryFn: () => getPrivacyFn(),
    enabled: isRegistered,
    staleTime: 15_000,
  });

  const who = (privacyQ.data?.who_can_dm as WhoCanDm | undefined) ?? "everyone";
  const dmsOn = who !== "nobody";

  useEffect(() => {
    if (!isRegistered || !privacyQ.isSuccess) return;
    const persisted = privacyQ.data?.who_can_dm as WhoCanDm | undefined;
    core.setIncomingPmEnabled(persisted !== "nobody");
  }, [core, isRegistered, privacyQ.isSuccess, privacyQ.data?.who_can_dm]);

  const saveWho = async (next: WhoCanDm) => {
    setPrivacyBusy(true);
    try {
      await setPrivacyFn({ data: { who_can_dm: next } });
      core.setIncomingPmEnabled(next !== "nobody");
      await qc.invalidateQueries({ queryKey: ["dm-privacy"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update DM privacy");
    } finally {
      setPrivacyBusy(false);
    }
  };

  const profile = user ? profiles[user.id] : undefined;
  const displayName = profile?.username ?? user?.username ?? ircState.ircNick ?? "Guest";
  const handle = user?.username;
  const avatarUrl = profile?.avatar_url ?? undefined;
  const hue = nickAvatarHue(displayName);
  const ircOnline = ircState.status === "authenticated";
  const lang = getLanguage(i18n.language || "en");

  const header = handle ? (
    <Link
      to="/u/$username"
      params={{ username: handle }}
      className="irc-profile-menu-header flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40"
      onClick={onClose}
    >
      <ProfileAvatarBlock
        avatarUrl={avatarUrl}
        label={displayName}
        hue={hue}
        showOnline
        ircOnline={ircOnline}
        size="lg"
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-bold text-foreground">{displayName}</p>
        <p className="truncate text-[12px] text-muted-foreground">@{handle}</p>
        <IrcConnectionStatusLine authenticated={ircOnline} />
      </div>
    </Link>
  ) : (
    <div className="irc-profile-menu-header flex gap-3 rounded-xl p-2">
      <ProfileAvatarBlock
        avatarUrl={undefined}
        label={displayName}
        hue={hue}
        showOnline
        ircOnline={ircOnline}
        size="lg"
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-bold text-foreground">{displayName}</p>
        <p className="text-[12px] text-muted-foreground">Guest · IRC</p>
        <IrcConnectionStatusLine authenticated={ircOnline} />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "irc-chat-settings-panel flex flex-col",
        mobile ? "max-h-[min(92dvh,640px)] overflow-y-auto p-3" : "max-h-[min(85dvh,560px)] overflow-y-auto p-2",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Profile & settings
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {header}

      <MenuDivider />

      {isRegistered ? (
        <>
          <MenuNavRow
            icon={Pencil}
            label="Edit profile"
            to="/feed"
            search={{ tab: "account" }}
            onClose={onClose}
          />
          <MenuNavRow icon={Home} label="Go to feed" to="/feed" onClose={onClose} />
        </>
      ) : (
        <>
          <button
            type="button"
            className="irc-profile-menu-row flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left hover:bg-muted/50"
            onClick={() => {
              onClose();
              openSignIn();
            }}
          >
            <LogIn className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-medium">Sign in</span>
          </button>
          <button
            type="button"
            className="irc-profile-menu-row flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left hover:bg-muted/50"
            onClick={() => {
              onClose();
              openSignUp();
            }}
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-medium">Create account</span>
          </button>
        </>
      )}

      {isRegistered ? (
        <>
          <MenuDivider />
          <div className="rounded-xl border border-border/60 bg-card/30">
            <ToggleSettingRow
              label="Private messages"
              description="Allow users to send you private messages"
              checked={dmsOn}
              disabled={privacyBusy || privacyQ.isLoading}
              onCheckedChange={(on) => {
                void saveWho(on ? "everyone" : "nobody");
              }}
            />
          </div>
        </>
      ) : null}

      <MenuDivider />
      <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        Sounds
      </p>
      <div className="rounded-xl border border-border/60 bg-card/30">
        <ToggleSettingRow
          label="Private messages"
          checked={soundPrefs.private_chat}
          onCheckedChange={(v) => {
            void setSoundPref("private_chat", v);
          }}
        />
        <div className="h-px bg-border/50" />
        <ToggleSettingRow
          label="New chat messages"
          checked={soundPrefs.public_chat}
          onCheckedChange={(v) => {
            void setSoundPref("public_chat", v);
          }}
        />
        <div className="h-px bg-border/50" />
        <ToggleSettingRow
          label="Mentions"
          checked={soundPrefs.username_mention}
          onCheckedChange={(v) => {
            void setSoundPref("username_mention", v);
          }}
        />
        <div className="h-px bg-border/50" />
        <ToggleSettingRow
          label="User joins"
          checked={soundPrefs.user_join}
          onCheckedChange={(v) => {
            void setSoundPref("user_join", v);
          }}
        />
      </div>

      <MenuDivider />
      <MenuNavRow
        icon={theme === "dark" ? Moon : Sun}
        label="Theme"
        hint={theme === "dark" ? "Dark" : "Light"}
        onClick={() => toggleTheme()}
        onClose={() => undefined}
      />
      {isRegistered ? (
        <MenuNavRow
          icon={Shield}
          label="Blocked users"
          to="/feed"
          search={{ tab: "account" }}
          onClose={onClose}
        />
      ) : null}

      <div className="relative">
        <MenuNavRow
          icon={Globe}
          label="Language"
          hint={lang.nativeName}
          onClick={() => setLangOpen((o) => !o)}
          onClose={() => undefined}
        />
        {langOpen ? (
          <div className="mb-1 max-h-40 overflow-y-auto rounded-lg border border-border/70 bg-popover p-1 shadow-md">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted/60",
                  lang.code === l.code && "bg-primary/10 text-primary",
                )}
                onClick={() => {
                  void setLanguage(l.code);
                  setLangOpen(false);
                }}
              >
                <span>{l.flag}</span>
                <span>{l.nativeName}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isRegistered ? (
        <>
          <MenuDivider />
          <MenuNavRow
            icon={LogOut}
            label="Log out"
            destructive
            onClick={() => {
              onClose();
              void logout().catch(() => undefined);
            }}
            onClose={onClose}
          />
        </>
      ) : null}
    </div>
  );
}

export function IrcProfileAvatarTrigger({
  className,
  mobileSheet,
}: {
  className?: string;
  mobileSheet?: boolean;
}) {
  const { user } = useAuth();
  const ircState = useIrcChatState();
  const { profiles } = useRemoteProfileDirectory();
  const [open, setOpen] = useState(false);

  const profile = user ? profiles[user.id] : undefined;
  const label = profile?.username ?? user?.username ?? ircState.ircNick ?? "Guest";
  const avatarUrl = profile?.avatar_url ?? undefined;
  const hue = nickAvatarHue(label);
  const ircOnline = ircState.status === "authenticated";

  const avatar = (
    <ProfileAvatarBlock
      avatarUrl={avatarUrl}
      label={label}
      hue={hue}
      showOnline
      ircOnline={ircOnline}
      size="md"
    />
  );

  if (mobileSheet) {
    return (
      <>
        <button
          type="button"
          title="Profile & settings"
          aria-label="Profile and settings"
          className={cn(
            "irc-profile-avatar-trigger shrink-0 rounded-full outline-none ring-offset-background",
            className,
          )}
          onClick={() => setOpen(true)}
        >
          {avatar}
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[min(100vw,380px)] border-l p-0">
            <SettingsBody onClose={() => setOpen(false)} mobile />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Profile & settings"
          aria-label="Profile and settings"
          className={cn(
            "irc-profile-avatar-trigger shrink-0 rounded-full outline-none ring-offset-background transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
        >
          {avatar}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="irc-chat-settings-popover w-[min(100vw-1rem,22.5rem)] border-border/80 bg-popover p-0 shadow-xl"
      >
        <SettingsBody onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export function IrcChatSettingsMenu(props: { mobileSheet?: boolean }) {
  return <IrcProfileAvatarTrigger mobileSheet={props.mobileSheet} className="shrink-0" />;
}
