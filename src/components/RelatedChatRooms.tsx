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
    <nav className="related-chat-rooms mt-10 border-t border-border/70 pt-8" aria-label={heading}>
      <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {heading}
      </h2>
      <ul className="mt-4 flex list-none flex-wrap gap-2.5 p-0">
        {links.map((link) => (
          <li key={link.slug} className="m-0 p-0">
            <a
              href={link.href}
              className="inline-flex items-center rounded-md border border-border/80 bg-muted/35 px-3.5 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
