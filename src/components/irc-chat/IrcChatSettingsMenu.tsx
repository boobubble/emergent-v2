import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings2, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-store";
import { useIrcChatCore } from "@/lib/irc-chat";
import { useSoundPrefs, setSoundPref } from "@/lib/sound-prefs";
import { getDmPrivacy, setDmPrivacy } from "@/lib/trust-safety.functions";
import { cn } from "@/lib/utils";

type WhoCanDm = "everyone" | "friends" | "nobody";

function SettingsBody({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const core = useIrcChatCore();
  const soundPrefs = useSoundPrefs();
  const qc = useQueryClient();
  const getPrivacyFn = useServerFn(getDmPrivacy);
  const setPrivacyFn = useServerFn(setDmPrivacy);
  const isRegistered = Boolean(user);
  const [privacyBusy, setPrivacyBusy] = useState(false);

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

  return (
    <div className="irc-chat-settings-panel flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">Chat settings</h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {isRegistered ? (
        <section>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Privacy
          </p>
          <div className="rounded-xl border border-border/70 bg-card/50">
            <div className="flex items-start justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">Private messages</p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Allow users to send you private messages (Yaarzo account preference)
                </p>
              </div>
              <Switch
                checked={dmsOn}
                disabled={privacyBusy || privacyQ.isLoading}
                onCheckedChange={(on) => {
                  void saveWho(on ? "everyone" : "nobody");
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Sounds
        </p>
        <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card/50">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="text-[13px] text-foreground">Chat sounds</span>
            <Switch
              checked={soundPrefs.public_chat}
              onCheckedChange={(v) => {
                void setSoundPref("public_chat", v);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="text-[13px] text-foreground">Mention sounds</span>
            <Switch
              checked={soundPrefs.username_mention}
              onCheckedChange={(v) => {
                void setSoundPref("username_mention", v);
              }}
            />
          </div>
        </div>
      </section>

      <section>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <div className="flex flex-col gap-1.5">
          <Link
            to="/feed"
            search={{ tab: "account" }}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 px-3 text-[12px] font-semibold text-foreground hover:bg-muted/40"
            onClick={onClose}
          >
            Edit profile
          </Link>
          <Link
            to="/feed"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 px-3 text-[12px] font-semibold text-foreground hover:bg-muted/40"
            onClick={onClose}
          >
            Go to feed
          </Link>
        </div>
      </section>
    </div>
  );
}

export function IrcChatSettingsMenu({ mobileSheet }: { mobileSheet?: boolean }) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      title="Chat settings"
      aria-label="Chat settings"
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Settings2 className="h-5 w-5" />
    </button>
  );

  if (mobileSheet) {
    return (
      <>
        <button
          type="button"
          title="Chat settings"
          aria-label="Chat settings"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[min(100vw,320px)] p-0">
            <SettingsBody onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-[min(100vw-1.5rem,18rem)] border-border/80 bg-popover p-0 shadow-lg irc-chat-settings-popover"
      >
        <SettingsBody onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
