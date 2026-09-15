import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/chat/Avatar";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useGuestChat } from "@/lib/guest-chat-context";
import { useSoundPrefs, setSoundPref } from "@/lib/sound-prefs";
import { useIgnore } from "@/lib/ignore-store";
import { getDmPrivacy, setDmPrivacy } from "@/lib/trust-safety.functions";
import { cn } from "@/lib/utils";

export const OPEN_CHAT_SETTINGS_EVENT = "palrgo:open-chat-settings";

export function openChatSettings() {
  window.dispatchEvent(new Event(OPEN_CHAT_SETTINGS_EVENT));
}

export function ChatSettingsTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => openChatSettings()}
      title="Chat Settings"
      aria-label="Chat Settings"
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
        className,
      )}
    >
      <UserCog className="h-5 w-5" />
    </button>
  );
}

type WhoCanDm = "everyone" | "friends" | "nobody";

export function ChatSettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state } = useChat();
  const { user, logout } = useAuth();
  const guestChat = useGuestChat();
  const soundPrefs = useSoundPrefs();
  const { ignoreAllBots, setIgnoreAllBots } = useIgnore();
  const qc = useQueryClient();
  const getPrivacyFn = useServerFn(getDmPrivacy);
  const setPrivacyFn = useServerFn(setDmPrivacy);
  const isGuest = guestChat.isGuestChatting;
  const isRegistered = Boolean(user);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  const privacyQ = useQuery({
    queryKey: ["dm-privacy"],
    queryFn: () => getPrivacyFn(),
    enabled: open && isRegistered,
    staleTime: 15_000,
  });

  const who = (privacyQ.data?.who_can_dm as WhoCanDm | undefined) ?? "everyone";
  const dmsOn = who !== "nobody";

  const openTheme = () => {
    onOpenChange(false);
    window.dispatchEvent(new Event("palrgo:open-chat-theme-store"));
  };

  const saveWho = async (next: WhoCanDm) => {
    setPrivacyBusy(true);
    try {
      await setPrivacyFn({ data: { who_can_dm: next } });
      await qc.invalidateQueries({ queryKey: ["dm-privacy"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update DM privacy");
    } finally {
      setPrivacyBusy(false);
    }
  };

  const displayName = isGuest
    ? (guestChat.session?.displayName || guestChat.session?.nickname || "Guest")
    : state.me.name;
  const handle = isRegistered ? user?.username : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-l border-border/80 bg-background p-0 sm:max-w-[400px] [&>button.absolute]:hidden"
      >
        <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border/70 px-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center gap-0.5 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            aria-label="Close Chat Settings"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h2 className="flex-1 pr-12 text-center text-sm font-semibold">Chat Settings</h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <section className="flex items-center gap-3 pb-4">
            {isRegistered || !isGuest ? (
              <Avatar user={state.me} size={48} />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-sm font-bold text-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">
                {isGuest ? `Guest: ${displayName}` : displayName}
              </div>
              {handle && !isGuest && (
                <div className="truncate text-xs text-muted-foreground">@{handle}</div>
              )}
              {isRegistered && handle && (
                <Link
                  to="/u/$username"
                  params={{ username: handle }}
                  className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  View Profile
                </Link>
              )}
            </div>
          </section>

          {isRegistered && (
            <>
              <SectionLabel>Chat privacy</SectionLabel>
              <div className="mb-4 divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
                <ToggleRow
                  label="Direct Messages"
                  checked={dmsOn}
                  disabled={privacyBusy || privacyQ.isLoading}
                  onCheckedChange={(on) => { void saveWho(on ? "everyone" : "nobody"); }}
                />
                {dmsOn && (
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <span className="text-[13px]">Who can DM me</span>
                    <select
                      className="max-w-[148px] rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
                      value={who === "friends" ? "friends" : "everyone"}
                      disabled={privacyBusy}
                      onChange={(e) => {
                        const v = e.target.value === "friends" ? "friends" : "everyone";
                        void saveWho(v);
                      }}
                    >
                      <option value="everyone">Everyone</option>
                      <option value="friends">Friends only</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          <SectionLabel>Sounds</SectionLabel>
          <div className="mb-4 divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
            <ToggleRow
              label="DM message sound"
              checked={soundPrefs.private_chat}
              onCheckedChange={(v) => { void setSoundPref("private_chat", v); }}
            />
            <ToggleRow
              label="Username/Mention sound"
              checked={soundPrefs.username_mention}
              onCheckedChange={(v) => { void setSoundPref("username_mention", v); }}
            />
            <ToggleRow
              label="Lobby/Room message sound"
              checked={soundPrefs.public_chat}
              onCheckedChange={(v) => { void setSoundPref("public_chat", v); }}
            />
          </div>

          <SectionLabel>Appearance</SectionLabel>
          <div className="mb-4 divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
            <button
              type="button"
              onClick={openTheme}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] hover:bg-muted/40"
            >
              Chatroom Theme
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <SectionLabel>Other chat settings</SectionLabel>
          <div className="mb-4 divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
            <ToggleRow
              label="Ignore Bots"
              checked={ignoreAllBots}
              onCheckedChange={setIgnoreAllBots}
            />
          </div>

          {isRegistered && (
            <>
              <SectionLabel>Account</SectionLabel>
              <div className="mb-2 divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
                {handle && (
                  <Link
                    to="/u/$username"
                    params={{ username: handle }}
                    className="flex items-center justify-between px-3 py-2.5 text-[13px] hover:bg-muted/40"
                    onClick={() => onOpenChange(false)}
                  >
                    View Profile
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2.5 text-left text-[13px] text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onOpenChange(false);
                    void logout().catch(() => undefined);
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          )}

          {isGuest && (
            <>
              <SectionLabel>Session</SectionLabel>
              <div className="mb-2 rounded-xl border border-border/70 bg-card/40">
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2.5 text-left text-[13px] text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onOpenChange(false);
                    guestChat.endGuestChat();
                  }}
                >
                  Leave Guest Chat
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-[13px]">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export function useChatSettingsDrawer() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const openDrawer = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_SETTINGS_EVENT, openDrawer);
    return () => window.removeEventListener(OPEN_CHAT_SETTINGS_EVENT, openDrawer);
  }, []);
  return { open, setOpen };
}
