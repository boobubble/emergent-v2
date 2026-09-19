import { useMemo, useState } from "react";
import { useCustomEmojiCatalog, ircMessageCustomEmojiClassName } from "@/lib/custom-emoji-catalog";
import { parseMessageSegments } from "@/lib/irc-chat/irc-custom-emoji";
import {
  isAttachmentOnlyMessageText,
  resolveAttachmentIdForMessage,
} from "@/lib/irc-chat/irc-attachment";
import { resolveStickerIdForMessage } from "@/lib/irc-chat/irc-sticker";
import type { IrcMessageAttachment } from "@/lib/irc-chat/irc-attachment";
import {
  IrcMessageFileAttachment,
  IrcMessageImageAttachment,
} from "./IrcMessageAttachmentMedia";
import { useIrcStickerCatalog, ircMessageStickerClassName } from "@/lib/irc-sticker-catalog";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaFromSettings, messageDisplayText } from "@/lib/media-embed-text";
import { cn } from "@/lib/utils";
import { IrcMessageGiphyEmbed } from "./IrcMessageGiphyEmbed";
import { IrcMessageMentionText } from "./IrcMessageMentionText";

export function IrcMessageBody({
  text,
  contentType,
  stickerId,
  attachment,
  knownMentionKeys,
  selfMentionKeys,
  className,
}: {
  text: string;
  contentType?: "text" | "sticker" | "image" | "file";
  stickerId?: string;
  attachment?: IrcMessageAttachment;
  knownMentionKeys?: ReadonlySet<string>;
  selfMentionKeys?: ReadonlySet<string>;
  className?: string;
}) {
  const { byId: emojiById } = useCustomEmojiCatalog();
  const { byId: stickerById } = useIrcStickerCatalog();
  const { raw } = useAppSettings();
  const media = useMemo(() => mergeMediaFromSettings(raw), [raw]);
  const [stickerFailed, setStickerFailed] = useState(false);

  const resolvedStickerId = resolveStickerIdForMessage(text, stickerId, contentType);
  const resolvedAttachmentId = resolveAttachmentIdForMessage(
    text,
    attachment?.id,
    contentType,
  );
  const displayText = useMemo(() => {
    if (resolvedStickerId) return "";
    if (resolvedAttachmentId && isAttachmentOnlyMessageText(text)) return "";
    return messageDisplayText(text, media);
  }, [text, media, resolvedStickerId, resolvedAttachmentId]);
  const segments = useMemo(() => parseMessageSegments(displayText), [displayText]);

  if (resolvedAttachmentId && attachment) {
    const caption = isAttachmentOnlyMessageText(text) ? "" : displayText;
    return (
      <div className={cn("irc-message-body min-w-0 space-y-2", className)}>
        {caption ? (
          <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            <IrcMessageMentionText
              text={caption}
              knownMentionKeys={knownMentionKeys ?? new Set()}
              selfMentionKeys={selfMentionKeys ?? new Set()}
            />
          </span>
        ) : null}
        {contentType === "file"
          ? <IrcMessageFileAttachment attachment={attachment} />
          : <IrcMessageImageAttachment attachment={attachment} />}
      </div>
    );
  }

  if (resolvedStickerId) {
    const sticker = stickerById.get(resolvedStickerId);
    if (!sticker || stickerFailed) {
      return (
        <p className={cn("irc-message-body text-sm text-muted-foreground", className)}>
          Sticker unavailable
        </p>
      );
    }
    return (
      <div className={cn("irc-message-body", className)}>
        <img
          src={sticker.url}
          alt={sticker.name}
          loading="lazy"
          className={ircMessageStickerClassName(sticker.displaySize)}
          onError={() => setStickerFailed(true)}
        />
      </div>
    );
  }

  const hasText = segments.some((s) => s.type === "text" && s.value.trim()) ||
    segments.some((s) => s.type === "emoji");

  return (
    <div className={cn("irc-message-body min-w-0", className)}>
      {hasText ? (
        <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {segments.map((seg, index) => {
            if (seg.type === "text") {
              return (
                <IrcMessageMentionText
                  key={`t-${index}`}
                  text={seg.value}
                  knownMentionKeys={knownMentionKeys ?? new Set()}
                  selfMentionKeys={selfMentionKeys ?? new Set()}
                />
              );
            }
            const emoji = emojiById.get(seg.id);
            if (!emoji) {
              return (
                <span
                  key={`e-${index}`}
                  className="text-muted-foreground/80"
                  title="Custom emoji unavailable"
                >
                  {seg.raw}
                </span>
              );
            }
            return (
              <img
                key={`e-${index}`}
                src={emoji.url}
                alt={emoji.name}
                loading="lazy"
                className={ircMessageCustomEmojiClassName(emoji.displaySize)}
              />
            );
          })}
        </span>
      ) : null}
      <IrcMessageGiphyEmbed text={text} />
    </div>
  );
}
