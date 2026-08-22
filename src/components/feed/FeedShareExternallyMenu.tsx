import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MoreHorizontal, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyRoles } from "@/lib/use-my-role";
import { isWelcomeFeedPost, MANUAL_PLATFORMS, MANUAL_PLATFORM_LABEL, type ManualSocialPlatform } from "@/lib/social-manual-distribution";
import { getSocialManualSharePayload } from "@/lib/social-manual.functions";
import {
  SocialManualShareModal,
  type SocialManualShareTarget,
} from "@/components/admin/SocialManualShareModal";

export function FeedShareExternallyMenu({
  post,
}: {
  post: { id: string; slug?: string | null; category?: string | null; text?: string | null };
}) {
  const { isModerator, loaded } = useMyRoles();
  const getPayload = useServerFn(getSocialManualSharePayload);
  const [share, setShare] = useState<SocialManualShareTarget | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loaded || !isModerator || !isWelcomeFeedPost(post)) return null;

  async function openPlatform(platform: ManualSocialPlatform) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await getPayload({ data: { feedPostId: post.id } });
      if (!res.ok) {
        toast.error("This member has not allowed external social featuring.");
        return;
      }
      setShare({
        payload: res.payload,
        platform,
        status: res.manual[platform].status,
        publishedUrl: res.manual[platform].published_url,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open share tools");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="grid min-h-11 min-w-11 place-items-center rounded-full text-muted-foreground/80 hover:bg-accent/40 hover:text-foreground transition-colors sm:min-h-8 sm:min-w-8"
            aria-label="Share externally"
            title="Share externally"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" /> Share Externally
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {MANUAL_PLATFORMS.map((platform) => (
            <DropdownMenuItem
              key={platform}
              disabled={busy}
              onSelect={() => void openPlatform(platform)}
            >
              {MANUAL_PLATFORM_LABEL[platform]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {share && (
        <SocialManualShareModal
          target={share}
          onClose={() => setShare(null)}
        />
      )}
    </>
  );
}
