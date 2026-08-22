import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DuplicatePublishDialog<T>({
  open,
  title,
  payload,
  onDismiss,
  onKeepExisting,
  onPublishAgain,
}: {
  open: boolean;
  title: string;
  payload: T | null;
  onDismiss: () => void;
  onKeepExisting: (payload: T) => void;
  onPublishAgain: (payload: T) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next) onDismiss(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Already posted — publish again?</AlertDialogTitle>
          <AlertDialogDescription>{title}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              if (payload) onKeepExisting(payload);
            }}
          >
            Keep existing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (payload) onPublishAgain(payload);
            }}
          >
            Publish again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
