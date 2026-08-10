import { ArrowUpRight } from "lucide-react";
import {
  RELATED_CHAT_ROOMS_HEADING,
  type RelatedChatRoomLink,
} from "@/lib/pages-cms/related-chat-rooms";

/**
 * Crawlable Related Chat Rooms — plain <a href> buttons for SSR.
 * Do not inject into custom_pages.content; presentation-only.
 */
export function RelatedChatRooms({
  links,
  heading = RELATED_CHAT_ROOMS_HEADING,
}: {
  links?: RelatedChatRoomLink[] | null;
  heading?: string;
}) {
  if (!links?.length) return null;

  return (
    <nav className="related-chat-rooms mt-10 border-t border-border/60 pt-8" aria-label={heading}>
      <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {heading}
      </h2>
      <ul className="mt-5 flex list-none flex-wrap gap-3 p-0">
        {links.map((link) => (
          <li key={link.slug} className="m-0 p-0">
            <a
              href={link.href}
              className={[
                "group inline-flex items-center gap-1.5 rounded-full",
                "border border-primary/15 bg-primary/[0.06]",
                "px-4 py-2 text-sm font-medium text-foreground/90",
                "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
                "no-underline outline-none",
                "transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.11]",
                "hover:text-foreground hover:shadow-[0_6px_16px_-8px_rgba(15,23,42,0.28)]",
                "active:translate-y-0 active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              ].join(" ")}
            >
              <span>{link.label}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-primary/55 transition-colors duration-200 group-hover:text-primary"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
