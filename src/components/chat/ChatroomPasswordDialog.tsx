import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatroomPasswordDialogProps {
  open: boolean;
  roomId: string;
  roomName: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function ChatroomPasswordDialog({
  open,
  roomId,
  roomName,
  onVerified,
  onCancel,
}: ChatroomPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("verify_chatroom_password", {
      _room: roomId,
      _password: trimmed,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    if (data === "success") {
      setPassword("");
      setError(null);
      onVerified();
      return;
    }

    if (data === "incorrect password") {
      setError("Incorrect password. Please try again.");
      return;
    }

    if (data === "room is protected") {
      setError("This room requires a password.");
      return;
    }

    setError("Could not verify access. Please try again.");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) onCancel();
      }}
    >
      <DialogContent
        className="mx-4 w-[calc(100%-2rem)] max-w-md gap-5 sm:mx-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-center">{roomName}</DialogTitle>
          <DialogDescription className="text-center">
            This chatroom is password protected. Enter the room password to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="chatroom-password" className="text-sm font-medium">
              Room password
            </label>
            <Input
              id="chatroom-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={submitting}
              placeholder="Enter password"
              className="min-h-11 text-base"
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="submit"
              disabled={submitting || !password.trim()}
              className="min-h-11 w-full text-base"
            >
              {submitting ? "Verifying…" : "Enter room"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              className="min-h-11 w-full text-base"
              onClick={onCancel}
            >
              Back to rooms
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
