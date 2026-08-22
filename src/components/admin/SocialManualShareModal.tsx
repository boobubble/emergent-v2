import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  Copy, ExternalLink, Image as ImageIcon, CheckCircle2, SkipForward,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSocialManualStatus, type ManualSharePayload } from "@/lib/social-manual.functions";
import {
  MANUAL_PLATFORM_LABEL,
  MANUAL_PLATFORM_OPEN_URL,
  blueskyComposeUrl,
  pinterestComposeUrl,
  type ManualPlatformStatus,
  type ManualSocialPlatform,
} from "@/lib/social-manual-distribution";

export type SocialManualShareTarget = {
  payload: ManualSharePayload;
  platform: ManualSocialPlatform;
  status: ManualPlatformStatus;
  publishedUrl: string | null;
};

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Couldn't copy ${label.toLowerCase()}`);
  }
}

export function SocialManualShareModal({
  target,
  onClose,
  onStatusChange,
}: {
  target: SocialManualShareTarget;
  onClose: () => void;
  onStatusChange?: () => void;
}) {
  const updateStatus = useServerFn(updateSocialManualStatus);
  const { payload, platform } = target;
  const [publishedUrl, setPublishedUrl] = useState(target.publishedUrl ?? "");
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    setPublishedUrl(target.publishedUrl ?? "");
    setBoardName("");
  }, [payload.feed_post_id, platform, target.publishedUrl]);

  const mut = useMutation({
    mutationFn: (status: ManualPlatformStatus) =>
      updateStatus({
        data: {
          feedPostId: payload.feed_post_id,
          platform,
          status,
          publishedUrl: publishedUrl.trim() ? publishedUrl.trim() : undefined,
        },
      }),
    onSuccess: (_res, status) => {
      toast.success(statusToast(platform, status));
      onStatusChange?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openUrl = platformOpenUrl(platform, payload, boardName);
  const caption = payload.caption;
  const blueskyText = payload.bluesky_text;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prepare {MANUAL_PLATFORM_LABEL[platform]} post</DialogTitle>
          <DialogDescription>
            Uses the existing Yaarzo welcome feed post. Opening {MANUAL_PLATFORM_LABEL[platform]} does not mark it posted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
          {payload.media_url ? (
            <img src={payload.media_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
              No image
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold">{payload.display_name}</div>
            <div className="text-xs text-muted-foreground">@{payload.username}</div>
            <a
              href={payload.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block truncate text-xs text-primary hover:underline"
            >
              {payload.profile_url}
            </a>
          </div>
        </div>

        {platform === "facebook" && (
          <FieldBlock>
            <CopyRow label="Caption" value={caption} />
            <CopyRow label="Profile URL" value={payload.profile_url} />
          </FieldBlock>
        )}

        {platform === "pinterest" && (
          <FieldBlock>
            <CopyRow label="Title" value={payload.pinterest_title} />
            <CopyRow label="Description" value={caption} />
            <CopyRow label="URL" value={payload.profile_url} />
            <div className="space-y-1.5">
              <Label>Board name (optional)</Label>
              <Input
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g. Yaarzo Community"
              />
              <p className="text-[11px] text-muted-foreground">
                Pinterest has no API in this phase. Copy the board name when creating the pin.
              </p>
            </div>
          </FieldBlock>
        )}

        {platform === "bluesky" && (
          <FieldBlock>
            <div className="space-y-1.5">
              <Label>Post</Label>
              <Textarea value={blueskyText} readOnly rows={6} className="font-mono text-xs" />
              <p className="text-[11px] text-muted-foreground">
                Shortened for Bluesky’s 300-character limit if needed. The original Yaarzo welcome post is unchanged.
              </p>
              <Button size="sm" variant="outline" onClick={() => copyText("Post", blueskyText)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Post
              </Button>
            </div>
            <CopyRow label="Profile URL" value={payload.profile_url} />
          </FieldBlock>
        )}

        {platform === "youtube" && (
          <FieldBlock>
            <CopyRow label="Text" value={caption} />
            <CopyRow label="URL" value={payload.profile_url} />
            <p className="text-[11px] text-muted-foreground">
              YouTube is manual only in this phase. If Community Posts are unavailable on the channel, skip this post.
            </p>
          </FieldBlock>
        )}

        <div className="flex flex-wrap gap-2">
          {payload.media_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(payload.media_url!, "_blank", "noopener,noreferrer")}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Open Image
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open {platform === "youtube" ? "YouTube Studio" : MANUAL_PLATFORM_LABEL[platform]}
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label>Published URL (optional)</Label>
          <Input
            value={publishedUrl}
            onChange={(e) => setPublishedUrl(e.target.value)}
            placeholder="Paste the live post URL after publishing"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={mut.isPending}
            onClick={() => mut.mutate("posted")}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark as Posted
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={mut.isPending}
            onClick={() => mut.mutate("skipped")}
          >
            <SkipForward className="mr-1.5 h-3.5 w-3.5" /> Skip
          </Button>
          {target.status !== "not_posted" && (
            <Button
              size="sm"
              variant="ghost"
              disabled={mut.isPending}
              onClick={() => mut.mutate("not_posted")}
            >
              Reset status
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function statusToast(platform: ManualSocialPlatform, status: ManualPlatformStatus) {
  const name = MANUAL_PLATFORM_LABEL[platform];
  if (status === "posted") return `${name} marked as posted`;
  if (status === "skipped") return `${name} skipped`;
  return `${name} status reset`;
}

function platformOpenUrl(
  platform: ManualSocialPlatform,
  payload: ManualSharePayload,
  boardName: string,
) {
  if (platform === "pinterest") {
    return pinterestComposeUrl({
      destinationUrl: payload.profile_url,
      mediaUrl: payload.media_url,
      description: boardName.trim()
        ? `${payload.pinterest_title}\n${payload.caption}`
        : payload.caption,
    });
  }
  if (platform === "bluesky") return blueskyComposeUrl(payload.bluesky_text);
  return MANUAL_PLATFORM_OPEN_URL[platform];
}

function FieldBlock({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Textarea value={value} readOnly rows={label === "Caption" || label === "Description" || label === "Text" || label === "Post" ? 5 : 2} className="font-mono text-xs" />
        <Button size="sm" variant="outline" className="shrink-0 self-start" onClick={() => copyText(label, value)}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy {label}
        </Button>
      </div>
    </div>
  );
}
