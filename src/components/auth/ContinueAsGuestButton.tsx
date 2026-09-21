import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGuestChat } from "@/lib/guest-chat-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type GuestGender = "male" | "female" | "other";

const GUEST_DETAILS_KEY = "yaarzo:codychat:guest-details";

/**
 * Yaarzo-native guest entry.
 * Collects guest details before opening CodyChat. No Supabase guest account.
 */
export function LoginAsGuestButton({
  className,
  onBeforeOpen,
  label = "Login as Guest",
}: {
  className?: string;
  onBeforeOpen?: () => void;
  label?: string;
}) {
  const guestChat = useGuestChat();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<GuestGender | "">("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");

  if (!guestChat.enabled) return null;

  const openGuestForm = () => {
    onBeforeOpen?.();
    setError("");
    setOpen(true);
  };

  const submitGuest = (event: FormEvent) => {
    event.preventDefault();

    const nickname = name.trim();

    if (nickname.length < 2) {
      setError("Enter a nickname with at least 2 characters.");
      return;
    }

    if (!gender) {
      setError("Select your gender.");
      return;
    }

    if (!ageConfirmed) {
      setError("You must be 14 or older to enter the chatroom.");
      return;
    }

    sessionStorage.setItem(
      GUEST_DETAILS_KEY,
      JSON.stringify({
        name: nickname,
        gender,
      }),
    );

    setOpen(false);
    void navigate({ to: "/chatroom", search: { guest: 1 } });
  };

  return (
    <>
      <button
        type="button"
        onClick={openGuestForm}
        className={
          className
          ?? "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground hover:bg-accent"
        }
      >
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Join as Guest</DialogTitle>
            <DialogDescription>
              Choose a nickname and gender to enter the chatroom.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitGuest} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="guest-nickname" className="text-sm font-semibold">
                Nickname
              </label>
              <Input
                id="guest-nickname"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                maxLength={30}
                autoComplete="off"
                placeholder="Enter your nickname"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Gender</div>
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setGender(value);
                      setError("");
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition ${
                      gender === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => {
                  setAgeConfirmed(event.target.checked);
                  setError("");
                }}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">
                I confirm that I am 14 years of age or older.
              </span>
            </label>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full rounded-full font-bold">
              Enter Chatroom
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** @deprecated Use LoginAsGuestButton - kept as alias for older imports. */
export const ContinueAsGuestButton = LoginAsGuestButton;
