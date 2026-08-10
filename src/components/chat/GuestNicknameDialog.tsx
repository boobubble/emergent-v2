import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuestChat } from "@/lib/guest-chat-context";
import { validateGuestNickname } from "@/lib/guest-nickname";
import { formatGuestDisplayName } from "@/lib/guest-chat-config";

export function GuestNicknameDialog() {
  const {
    nicknameDialogOpen,
    closeNicknameDialog,
    startWithNickname,
    starting,
    error,
    config,
  } = useGuestChat();
  const [nick, setNick] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const preview = nick.trim()
    ? formatGuestDisplayName(config.namePrefix, nick.trim())
    : `${config.namePrefix}…`;

  async function submit() {
    setLocalError(null);
    const v = validateGuestNickname(nick, {
      minLength: config.nicknameMinLength,
      maxLength: config.nicknameMaxLength,
    });
    if (!v.ok) {
      setLocalError(v.reason);
      return;
    }
    try {
      await startWithNickname(v.nickname);
      setNick("");
    } catch {
      /* error surfaced via context */
    }
  }

  return (
    <Dialog open={nicknameDialogOpen} onOpenChange={(o) => { if (!o) closeNicknameDialog(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Chat as Guest</DialogTitle>
          <DialogDescription>
            Pick a temporary Lobby nickname. No account is created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="guest-nick">Nickname</Label>
            <Input
              id="guest-nick"
              value={nick}
              maxLength={config.nicknameMaxLength}
              placeholder="e.g. Arman"
              onChange={(e) => setNick(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              You will appear as <span className="font-semibold text-foreground">{preview}</span>
            </p>
          </div>
          {(localError || error) && (
            <p className="text-xs text-destructive">{localError || error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={closeNicknameDialog} disabled={starting}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={() => void submit()} disabled={starting || !nick.trim()}>
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter Lobby"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}