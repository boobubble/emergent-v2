import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Send,
  Smile,
  Sparkles,
  Youtube,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { GiphyPicker } from "@/components/chat/GiphyPicker";
import { YoutubePicker } from "@/components/chat/YoutubePicker";
import { IrcComposerPickerPortal } from "./IrcComposerPickerPortal";
import { IrcEmojiPicker } from "./IrcEmojiPicker";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig } from "@/lib/media-providers-config";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import { dmComposerPlaceholder, roomComposerPlaceholder } from "./irc-chat-ui";
import "@/components/chat/message-input.css";
import "./irc-message-input.css";

type IrcMessageComposerProps = {
  onSend: (text: string) => void;
  view: IrcActiveView;
  shell?: "embedded" | "footer";
  className?: string;
};

function ComposerIconBtn({
  label,
  onClick,
  active,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "irc-composer-action-btn grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
        active && "bg-primary/15 text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IrcMessageComposer({
  onSend,
  view,
  shell = "embedded",
  className,
}: IrcMessageComposerProps) {
  const state = useIrcChatState();
  const { raw: appRaw } = useAppSettings();
  const media = mergeMediaConfig((appRaw as { media?: unknown }).media);
  const giphyOn = media.giphy.enabled && Boolean(media.giphy.apiKey);
  const youtubeOn = media.youtube.enabled;

  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);

  const connected = state.status === "authenticated";
  const compact = view.kind === "dm";

  const roomName =
    view.kind === "room"
      ? (state.rooms[view.roomId]?.name ?? view.roomId)
      : null;

  const composerKind = view.kind === "dm" ? "dm" : "room";

  const placeholder = connected
    ? view.kind === "room" && roomName
      ? roomComposerPlaceholder(roomName)
      : view.kind === "dm"
        ? dmComposerPlaceholder(view.peerNick)
        : "Write a message…"
    : "Disconnected — reconnecting…";

  const closePickers = () => {
    setShowEmoji(false);
    setShowGiphy(false);
    setShowYoutube(false);
  };

  function submit(textOverride?: string) {
    const text = (textOverride ?? draft).trim();
    if (!text || !connected) return;
    onSend(text);
    setDraft("");
    closePickers();
    setMoreOpen(false);
  }

  function insertText(chunk: string) {
    setDraft((d) => (d ? `${d}${chunk}` : chunk));
  }

  const desktopExtras = useMemo(
    () =>
      [
        giphyOn && {
          id: "gif" as const,
          label: "GIF",
          icon: Sparkles,
          onClick: () => {
            setShowGiphy((s) => !s);
            setShowEmoji(false);
            setShowYoutube(false);
          },
          active: showGiphy,
        },
        youtubeOn && {
          id: "yt" as const,
          label: "YouTube",
          icon: Youtube,
          onClick: () => {
            setShowYoutube((s) => !s);
            setShowEmoji(false);
            setShowGiphy(false);
          },
          active: showYoutube,
        },
      ].filter(Boolean) as Array<{
        id: string;
        label: string;
        icon: typeof Sparkles;
        onClick: () => void;
        active: boolean;
      }>,
    [giphyOn, youtubeOn, showGiphy, showYoutube],
  );

  const mobileMoreActions = useMemo(
    () =>
      [
        giphyOn && {
          id: "gif",
          label: "GIF",
          icon: Sparkles,
          onClick: () => {
            setMoreOpen(false);
            setShowGiphy(true);
          },
        },
        youtubeOn && {
          id: "yt",
          label: "YouTube",
          icon: Youtube,
          onClick: () => {
            setMoreOpen(false);
            setShowYoutube(true);
          },
        },
      ].filter(Boolean) as Array<{
        id: string;
        label: string;
        icon: typeof Sparkles;
        onClick: () => void;
      }>,
    [giphyOn, youtubeOn],
  );

  const pickerOpen = showEmoji || showGiphy || showYoutube;

  const bar = (
    <div ref={pickerAnchorRef} className="relative min-w-0 flex-1">
      <div
        className={cn(
          "chat-composer-glow chat-composer-bar irc-composer-bar-surface group relative flex min-w-0 items-end gap-0.5 rounded-[1.35rem] border border-border/70 pb-0 pt-1 pr-0.5 shadow-[0_4px_20px_-10px_hsl(var(--foreground)/0.12)] backdrop-blur-md transition-[border-color,box-shadow] duration-150",
          compact
            ? "pl-1 sm:gap-0.5 sm:pl-2 sm:pr-1"
            : "pl-1.5 sm:gap-1 sm:pl-2 sm:pr-2",
        )}
      >
        {!compact ? (
          <>
            <ComposerIconBtn
              label="Emoji"
              active={showEmoji}
              className="mb-0.5 hidden md:grid"
              onClick={() => {
                setShowEmoji((s) => !s);
                setShowGiphy(false);
                setShowYoutube(false);
              }}
            >
              <Smile className="h-4 w-4" />
            </ComposerIconBtn>
            {desktopExtras.map((a) => (
              <ComposerIconBtn
                key={a.id}
                label={a.label}
                active={a.active}
                className="mb-0.5 hidden md:grid"
                onClick={a.onClick}
              >
                <a.icon className="h-4 w-4" />
              </ComposerIconBtn>
            ))}
          </>
        ) : null}

        {!compact && mobileMoreActions.length > 0 ? (
          <ComposerIconBtn
            label="More actions"
            className="mb-0.5 md:hidden"
            onClick={() => setMoreOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </ComposerIconBtn>
        ) : null}

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={!connected}
          maxLength={2000}
          rows={1}
          className={cn(
            "chat-composer-input max-h-[120px] min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-base leading-5 text-foreground shadow-none outline-none placeholder:truncate placeholder:whitespace-nowrap placeholder:text-muted-foreground/70 sm:min-h-9 sm:py-1.5 sm:text-sm",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            !connected && "opacity-60",
          )}
        />

        <ComposerIconBtn
          label="Emoji"
          active={showEmoji}
          className={cn("mb-0.5", !compact && "md:hidden")}
          onClick={() => {
            setShowEmoji((s) => !s);
            setShowGiphy(false);
            setShowYoutube(false);
          }}
        >
          <Smile className="h-4 w-4" />
        </ComposerIconBtn>

        <button
          type="submit"
          disabled={!connected || !draft.trim()}
          className="chat-composer-send mb-0.5 grid h-10 w-10 shrink-0 touch-manipulation place-items-center rounded-full text-primary-foreground shadow-lg transition-[transform,opacity] duration-75 ease-out hover:scale-105 active:scale-[0.94] active:opacity-90 disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100 sm:h-9 sm:w-9"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "0 8px 24px -8px var(--primary-glow)",
          }}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <IrcComposerPickerPortal
        open={pickerOpen}
        onClose={closePickers}
        anchorRef={pickerAnchorRef}
      >
        {showEmoji ? (
          <IrcEmojiPicker
            onPick={(token) => insertText(token)}
            onClose={() => setShowEmoji(false)}
          />
        ) : null}
        {showGiphy ? (
          <GiphyPicker
            onPick={(g) => {
              submit(g.fullUrl);
            }}
          />
        ) : null}
        {showYoutube ? (
          <YoutubePicker
            onPick={(url) => {
              submit(url);
            }}
          />
        ) : null}
      </IrcComposerPickerPortal>
    </div>
  );

  const form = (
    <form
      data-irc-chat-composer=""
      data-irc-chat-composer-kind={composerKind}
      data-chat-composer={compact ? "dm" : "room"}
      className={cn(
        "chat-composer-root irc-composer-shell min-w-0",
        compact
          ? "overflow-x-hidden px-1.5 py-1.5"
          : "overflow-x-hidden px-2 py-1.5 sm:px-4 sm:py-2 md:px-5",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="irc-composer-inner mx-auto w-full max-w-[min(100%,72rem)]">{bar}</div>
    </form>
  );

  const moreSheet = (
    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl border-t px-4 pb-6 pt-3">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Share something
        </p>
        <div className="grid grid-cols-2 gap-2">
          {mobileMoreActions.map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-border/70 bg-card/50 text-[12px] font-medium hover:bg-muted/40"
              onClick={a.onClick}
            >
              <a.icon className="h-5 w-5 text-primary" />
              {a.label}
            </button>
          ))}
        </div>
        {mobileMoreActions.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            No extra media actions are configured for this chatroom.
          </p>
        ) : null}
      </SheetContent>
    </Sheet>
  );

  if (shell === "footer") {
    return (
      <>
        {form}
        {moreSheet}
      </>
    );
  }

  return (
    <div className="chat-composer-footer shrink-0 border-t border-border/60 bg-background/95 px-0 py-0 backdrop-blur-md">
      {form}
      {moreSheet}
    </div>
  );
}
