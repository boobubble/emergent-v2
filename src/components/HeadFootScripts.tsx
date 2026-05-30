import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ScriptsConfig {
  enabled: boolean;
  header_script: string;
  footer_script: string;
}

const HEADER_MARK = "data-admin-header-script";
const FOOTER_MARK = "data-admin-footer-script";

function clearInjected() {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`[${HEADER_MARK}],[${FOOTER_MARK}]`).forEach((n) => n.remove());
}

/**
 * Parses an HTML blob from the admin Ads & Scripts page and injects it.
 * - <script> tags become real <script> elements (so they execute).
 * - Other nodes are appended as-is (e.g. <noscript>, <meta>, <link>).
 */
function inject(html: string, target: HTMLElement, mark: string, atEnd: boolean) {
  if (!html.trim()) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const nodes = Array.from(tpl.content.childNodes);
  for (const node of nodes) {
    let el: Node = node;
    if (node.nodeType === 1 && (node as Element).tagName === "SCRIPT") {
      const src = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const attr of Array.from(src.attributes)) s.setAttribute(attr.name, attr.value);
      if (src.textContent) s.textContent = src.textContent;
      el = s;
    }
    if (el.nodeType === 1) (el as Element).setAttribute(mark, "1");
    if (atEnd) target.appendChild(el);
    else target.insertBefore(el, target.firstChild);
  }
}

/**
 * Loads `app_settings.scripts` and injects the admin-configured header
 * (into <head>) and footer (end of <body>) HTML/scripts. Re-runs on realtime
 * updates so changes from the admin panel apply without a refresh.
 */
export function HeadFootScripts() {
  useEffect(() => {
    let active = true;
    const apply = (cfg: ScriptsConfig | null) => {
      clearInjected();
      if (!cfg || cfg.enabled === false) return;
      if (cfg.header_script) inject(cfg.header_script, document.head, HEADER_MARK, true);
      if (cfg.footer_script) inject(cfg.footer_script, document.body, FOOTER_MARK, true);
    };

    (async () => {
      const { data } = await supabase
        .from("app_settings").select("value").eq("key", "scripts").maybeSingle();
      if (!active) return;
      apply((data?.value as ScriptsConfig | null) ?? null);
    })();

    const channel = supabase
      .channel("app_settings_scripts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: "key=eq.scripts" },
        (payload: any) => apply((payload.new?.value as ScriptsConfig | null) ?? null),
      )
      .subscribe();

    return () => {
      active = false;
      clearInjected();
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
