import { Button } from "@/components/ui/button";

type Props = {
  hydrationSlow: boolean;
  hydrationError: string | null;
  onRetry: () => void;
  compact?: boolean;
};

export function AuthSessionHydrationRecovery({
  hydrationSlow,
  hydrationError,
  onRetry,
  compact,
}: Props) {
  const title = hydrationError
    ? "Could not restore your session"
    : "Still restoring your session";
  const detail = hydrationError
    ? hydrationError
    : "This is taking longer than usual. You can wait or try again.";

  return (
    <div
      className={
        compact
          ? "flex h-dvh w-full items-center justify-center bg-background px-6"
          : "grid min-h-screen place-items-center bg-background px-4 text-center"
      }
    >
      <div className="max-w-md space-y-3">
        <p className={compact ? "text-lg font-semibold" : "text-base font-medium text-foreground"}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{detail}</p>
        <Button type="button" variant="default" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}
