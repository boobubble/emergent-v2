import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFooterLinks } from "@/lib/pages.functions";

interface FooterLink {
  slug: string;
  title: string;
  href: string;
  footer_order: number;
  footer_group: string | null;
}

export function CmsFooterLinks({ className }: { className?: string }) {
  const fetchLinks = useServerFn(getFooterLinks);
  const { data: links } = useQuery({
    queryKey: ["cms-footer-links"],
    queryFn: () => fetchLinks({}),
    staleTime: 5 * 60_000,
  });

  const items = (links as FooterLink[] | undefined) ?? [];
  if (!items.length) return null;

  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-white">Quick Links</h3>
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
}
