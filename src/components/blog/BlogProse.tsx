import { cn } from "@/lib/utils";
import "@/components/blog/blog-ui.css";

export function BlogProse({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("yz-blog-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
