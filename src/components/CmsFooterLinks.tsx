import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFooterLinks, FOOTER_GROUP_LABELS, type FooterGroup } from "@/lib/pages.functions";

interface FooterLink {
  slug: string;
  title: string;
  href: string;
}

type GroupedLinks = Record<FooterGroup, FooterLink[]>;

const GROUP_ORDER: FooterGroup[] = ["quick_links", "famous_chat_rooms", "popular_chat_rooms"];

export function CmsFooterLinks({ className }: { className?: string }) {
  const fetchLinks = useServerFn(getFooterLinks);
  const { data } = useQuery({
    queryKey: ["cms-footer-links"],
    queryFn: () => fetchLinks({}),
    staleTime: 5 * 60_000,
  });

  const groups = (data ?? {}) as GroupedLinks;
  const hasAny = GROUP_ORDER.some((g) => groups[g]?.length > 0);
  if (!hasAny) return null;

  return (
    <>
      {GROUP_ORDER.map((group) => {
        const items = groups[group];
        if (!items?.length) return null;
        return (
          <div key={group} className={className}>
            <h3 className="text-sm font-bold text-white">{FOOTER_GROUP_LABELS[group]}</h3>
            <ul className="mt-3 space-y-2">
              {items.map((link) => (
                <li key={link.slug}>
                  <Link to={link.href} className="text-sm text-white/55 hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}
