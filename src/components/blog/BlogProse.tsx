import { cn } from "@/lib/utils";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import "@/components/blog/blog-ui.css";

export function BlogProse({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeBlogHtml(html ?? "");
  return (
    <div
      className={cn("yz-blog-prose", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
