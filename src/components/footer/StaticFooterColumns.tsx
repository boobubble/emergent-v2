import { Link } from "@tanstack/react-router";
import { FOOTER_CHATROOM_COLUMNS } from "./footer-chatroom-links";

export function StaticFooterColumns() {
  return (
    <>
      {FOOTER_CHATROOM_COLUMNS.map((col) => (
        <div key={col.title}>
          <h3 className="text-sm font-bold text-white">{col.title}</h3>
          <ul className="mt-3 space-y-2">
            {col.links.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-sm text-white/55 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
