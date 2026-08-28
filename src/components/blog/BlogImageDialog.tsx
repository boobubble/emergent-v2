import { ContentImageDialog, type ContentImageDraft } from "@/components/content-images/ContentImageDialog";

export type BlogImageDraft = ContentImageDraft;

export function BlogImageDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  mode?: "insert" | "replace";
  initial?: Partial<ContentImageDraft> | null;
  onUpload: (file: File) => Promise<string | null>;
  onInsert: (draft: ContentImageDraft) => void;
}) {
  return <ContentImageDialog showAlign {...props} />;
}
