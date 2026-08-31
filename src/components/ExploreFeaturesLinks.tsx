import { EXPLORE_FEATURES_HEADING, type ExploreFeatureLink } from "@/lib/explore-features-links";

/**
 * Crawlable platform-feature chips — plain <a href> for SSR.
 * Do not inject into stored custom_pages.content; presentation-only
 * (orphan Hub counts these via the shared picker in getOrphanReport).
 */
export function ExploreFeaturesLinks({
  links,
  heading = EXPLORE_FEATURES_HEADING,
}: {
  links?: ExploreFeatureLink[] | null;
  heading?: string;
}) {
  if (!links?.length) return null;

  return (
    <nav className="explore-features-links mt-8 border-t border-border/60 pt-6" aria-label={heading}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{heading}:</p>
      <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
        {links.map((link) => (
          <li key={link.href} className="m-0 p-0">
            <a
              href={link.href}
              className={[
                "inline-flex items-center rounded-full",
                "border border-border bg-muted/60",
                "px-3 py-1 text-xs font-medium text-foreground/85",
                "no-underline outline-none",
                "transition-[border-color,background-color,color] duration-150",
                "hover:border-primary/30 hover:bg-primary/10 hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              ].join(" ")}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
