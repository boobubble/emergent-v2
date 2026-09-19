import { useEffect, useMemo, useRef, useState } from "react";
import {
  Paperclip,
  Plus,
  Send,
  Smile,
  Sparkles,
  Sticker,
  X,
  Youtube,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { GiphyPicker } from "@/components/chat/GiphyPicker";
import { YoutubePicker } from "@/components/chat/YoutubePicker";
import { IrcComposerPickerPortal } from "./IrcComposerPickerPortal";
import { IrcEmojiPicker } from "./IrcEmojiPicker";
import { IrcStickerPicker } from "./IrcStickerPicker";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig } from "@/lib/media-providers-config";
import { cn } from "@/lib/utils";
import { useIrcChatCore, useIrcChatState } from "@/lib/irc-chat";
import {
  applyMentionInsertion,
  buildIrcMentionCandidates,
  filterMentionCandidates,
  findActiveMentionToken,
} from "@/lib/irc-chat/mentions";
import { createIrcTypingEmitter } from "@/lib/irc-chat/irc-typing-client";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
import { IrcMentionSuggestions } from "./IrcMentionSuggestions";
import type { IrcActiveView, IrcComposerReplyTarget } from "./irc-chat-types";
import { dmComposerPlaceholder, roomComposerPlaceholder } from "./irc-chat-ui";
import { uploadIrcChatAttachment } from "@/lib/irc-chat-attachment.functions";
import type { IrcMessageAttachment } from "@/lib/irc-chat/irc-attachment";
import {
  readFileAsDataUrl,
  sanitizeClientFileName,
  validateClientAttachmentFile,
  type IrcAttachmentContentType,
} from "@/lib/irc-chat/irc-attachment";
import "@/components/chat/message-input.css";
import "./irc-message-input.css";

type PendingComposerAttachment = {
  contentType: IrcAttachmentContentType;
  fileName: string;
  mimeType: string;
  size: number;
  previewUrl: string;
  assetId?: string;
  attachment?: IrcMessageAttachment;
  uploadState: "idle" | "uploading" | "ready" | "error";
  uploadError?: string;
};

type IrcMessageComposerProps = {
  onSend: (text: string) => void;
  onSendSticker?: (stickerId: string) => void;
  onSendAttachment?: (payload: {
    attachment: IrcMessageAttachment;
    contentType: IrcAttachmentContentType;
    caption?: string;
  }) => void;
  onAttachmentAuthRequired?: () => void;
  roomId?: string;
  isRegisteredUser?: boolean;
  view: IrcActiveView;
  shell?: "embedded" | "footer";
  className?: string;
  replyingTo?: IrcComposerReplyTarget | null;
  onCancelReply?: () => void;
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
  onSendSticker,
  onSendAttachment,
  onAttachmentAuthRequired,
  roomId,
  isRegisteredUser = false,
  view,
  shell = "embedded",
  className,
  replyingTo,
  onCancelReply,
}: IrcMessageComposerProps) {
  const state = useIrcChatState();
  const { raw: appRaw } = useAppSettings();
  const media = mergeMediaConfig((appRaw as { media?: unknown }).media);
  const giphyOn = media.giphy.enabled && Boolean(media.giphy.apiKey);
  const youtubeOn = media.youtube.enabled;

  const [draft, setDraft] = useState("");
  const [caret, setCaret] = useState(0);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const core = useIrcChatCore();
  const { profiles: directoryProfiles } = useRemoteProfileDirectory();
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pendingAttach, setPendingAttach] = useState<PendingComposerAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);
  const uploadAttachment = useServerFn(uploadIrcChatAttachment);

  const connected = state.status === "authenticated";
  const compact = view.kind === "dm";
  const activeRoomId = view.kind === "room" ? view.roomId : roomId;
  const roomMembers =
    view.kind === "room" && activeRoomId ? state.members[activeRoomId] ?? [] : [];

  const mentionToken = useMemo(
    () => findActiveMentionToken(draft, caret),
    [draft, caret],
  );
  const mentionCandidates = useMemo(() => {
    if (!mentionToken || view.kind !== "room") return [];
    const base = buildIrcMentionCandidates(roomMembers, directoryProfiles, {
      excludeUserId: state.userId,
      excludeNick: state.ircNick,
    });
    return filterMentionCandidates(base, mentionToken.query);
  }, [
    mentionToken,
    roomMembers,
    directoryProfiles,
    state.userId,
    state.ircNick,
    view.kind,
  ]);

  useEffect(() => {
    setMentionIdx(0);
    setMentionMenuOpen(true);
  }, [mentionToken?.query, mentionToken?.start]);

  const typingEmitterRef = useRef<ReturnType<typeof createIrcTypingEmitter> | null>(null);
  useEffect(() => {
    typingEmitterRef.current?.dispose();
    typingEmitterRef.current = null;
    if (!activeRoomId || view.kind !== "room" || !connected) return;
    typingEmitterRef.current = createIrcTypingEmitter({
      start: () => core.sendTypingStart(activeRoomId),
      stop: () => core.sendTypingStop(activeRoomId),
    });
    return () => {
      typingEmitterRef.current?.dispose();
      typingEmitterRef.current = null;
    };
  }, [activeRoomId, view.kind, connected, core]);

  useEffect(() => {
    if (!draft.trim()) {
      typingEmitterRef.current?.stopTyping();
    }
  }, [draft]);

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
    setShowSticker(false);
    setShowGiphy(false);
    setShowYoutube(false);
  };

  function clearPendingAttachment() {
    if (pendingAttach?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pendingAttach.previewUrl);
    }
    setPendingAttach(null);
  }

  async function startUpload(file: File, contentType: IrcAttachmentContentType) {
    const room = roomId?.trim();
    if (!room) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingAttach({
      contentType,
      fileName: sanitizeClientFileName(file.name),
      mimeType: file.type,
      size: file.size,
      previewUrl,
      uploadState: "uploading",
    });
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadAttachment({
        data: {
          roomId: room,
          name: sanitizeClientFileName(file.name),
          mime: file.type,
          size: file.size,
          dataBase64: dataUrl,
        },
      });
      setPendingAttach((prev) =>
        prev
          ? {
              ...prev,
              uploadState: "ready",
              assetId: result.assetId,
              attachment: result.attachment,
            }
          : null,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setPendingAttach((prev) =>
        prev ? { ...prev, uploadState: "error", uploadError: msg } : null,
      );
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isRegisteredUser) {
      onAttachmentAuthRequired?.();
      return;
    }
    const validated = validateClientAttachmentFile(file);
    if (!validated.ok) {
      setPendingAttach({
        contentType: "file",
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        previewUrl: "",
        uploadState: "error",
        uploadError: validated.message,
      });
      return;
    }
    void startUpload(file, validated.contentType);
  }

  function applyMention(candidate: { mentionKey: string }) {
    if (!mentionToken) return;
    const { nextText, nextCaret } = applyMentionInsertion(
      draft,
      caret,
      mentionToken,
      candidate.mentionKey,
    );
    setDraft(nextText);
    setCaret(nextCaret);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function submit(textOverride?: string) {
    const text = (textOverride ?? draft).trim();
    if (!connected) return;
    typingEmitterRef.current?.stopTyping();
    if (
      pendingAttach?.uploadState === "ready" &&
      pendingAttach.attachment &&
      onSendAttachment
    ) {
      onSendAttachment({
        attachment: pendingAttach.attachment,
        contentType: pendingAttach.contentType,
        caption: text || undefined,
      });
      setDraft("");
      clearPendingAttachment();
      closePickers();
      setMoreOpen(false);
      return;
    }
    if (pendingAttach?.uploadState === "uploading") return;
    if (!text) return;
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

  const pickerOpen = showEmoji || showSticker || showGiphy || showYoutube;

  useEffect(() => {
    closePickers();
    setMoreOpen(false);
    clearPendingAttachment();
    typingEmitterRef.current?.stopTyping();
  }, [view.kind, view.kind === "room" ? view.roomId : view.peerNick]);

  const showReplyBanner =
    view.kind === "room" &&
    replyingTo &&
    replyingTo.roomId === view.roomId;

  const bar = (
    <div ref={pickerAnchorRef} className="relative min-w-0 flex-1">
      {pendingAttach ? (
        <div className="irc-composer-attach-preview mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-2 py-2">
          {pendingAttach.contentType === "image" && pendingAttach.previewUrl ? (
            <img
              src={pendingAttach.previewUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-muted/40 text-xs text-muted-foreground">
              📄
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{pendingAttach.fileName}</p>
            <p className="text-[11px] text-muted-foreground">
              {pendingAttach.uploadState === "uploading"
                ? "Uploading…"
                : pendingAttach.uploadState === "error"
                  ? pendingAttach.uploadError || "Upload failed"
                  : `${Math.max(1, Math.round(pendingAttach.size / 1024))} KB`}
            </p>
          </div>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted/50"
            aria-label="Remove attachment"
            onClick={clearPendingAttachment}
            disabled={pendingAttach.uploadState === "uploading"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {mentionCandidates.length > 0 && mentionToken && mentionMenuOpen ? (
        <IrcMentionSuggestions
          items={mentionCandidates}
          activeIndex={mentionIdx}
          onPick={applyMention}
        />
      ) : null}
      {showReplyBanner ? (
        <div className="irc-composer-reply-banner mb-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">
                Replying to {replyingTo.authorNick}
              </p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">
                {replyingTo.textPreview}
              </p>
            </div>
            <button
              type="button"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              onClick={onCancelReply}
              aria-label="Cancel reply"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
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
                setShowSticker(false);
                setShowGiphy(false);
                setShowYoutube(false);
              }}
            >
              <Smile className="h-4 w-4" />
            </ComposerIconBtn>
            {onSendAttachment ? (
              <ComposerIconBtn
                label="Attach file"
                className="mb-0.5 hidden md:grid"
                onClick={() => {
                  if (!isRegisteredUser) {
                    onAttachmentAuthRequired?.();
                    return;
                  }
                  fileInputRef.current?.click();
                }}
              >
                <Paperclip className="h-4 w-4" />
              </ComposerIconBtn>
            ) : null}
            {onSendSticker ? (
              <ComposerIconBtn
                label="Sticker"
                active={showSticker}
                className="mb-0.5 hidden md:grid"
                onClick={() => {
                  setShowSticker((s) => !s);
                  setShowEmoji(false);
                  setShowGiphy(false);
                  setShowYoutube(false);
                }}
              >
                <Sticker className="h-4 w-4" />
              </ComposerIconBtn>
            ) : null}
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
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            setCaret(e.target.selectionStart ?? next.length);
            if (
              view.kind === "room" &&
              activeRoomId &&
              connected &&
              next.trim() &&
              !showEmoji &&
              !showSticker &&
              !showGiphy &&
              !showYoutube
            ) {
              typingEmitterRef.current?.sendTyping();
            }
          }}
          onSelect={(e) => {
            const el = e.currentTarget;
            setCaret(el.selectionStart ?? draft.length);
          }}
          onKeyDown={(e) => {
            if (mentionCandidates.length > 0 && mentionMenuOpen) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setMentionIdx((i) => (i + 1) % mentionCandidates.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setMentionIdx(
                  (i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length,
                );
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setMentionMenuOpen(false);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                applyMention(mentionCandidates[mentionIdx]);
                return;
              }
            }
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
            setShowSticker(false);
            setShowGiphy(false);
            setShowYoutube(false);
          }}
        >
          <Smile className="h-4 w-4" />
        </ComposerIconBtn>

        <button
          type="submit"
          disabled={
            !connected ||
            pendingAttach?.uploadState === "uploading" ||
            (!draft.trim() &&
              !(pendingAttach?.uploadState === "ready" && pendingAttach.attachment))
          }
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
        {showSticker && onSendSticker ? (
          <IrcStickerPicker
            onPick={(id) => {
              onSendSticker(id);
              closePickers();
              setMoreOpen(false);
            }}
            onClose={() => setShowSticker(false)}
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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain"
        onChange={handleFileInput}
      />
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
