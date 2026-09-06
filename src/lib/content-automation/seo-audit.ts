import { extractFaqItems, faqItemsFromStored } from "@/lib/pages-cms/faq-jsonld";
import { extractInternalHrefs } from "@/lib/internal-linking-orphans";
import { detectCannibalization, type InventoryKeywordRow } from "@/lib/content-automation/cannibalization";
import { countWordsFromHtml } from "@/lib/content-automation/content-inventory";
import { shouldReplaceExistingImage } from "@/lib/content-automation/pexels-images";
import { inferIntentFromText, splitKeywordBlob } from "@/lib/content-automation/keyword-targets";
import { wordFloorFor, wordTargetFor, type SeoContentType } from "@/lib/content-automation/seo-types";

export type SeoAuditIssue = {
  code: string;
  severity: "info" | "warning";
  message: string;
};

export type SeoAuditResult = {
  contentType: SeoContentType;
  slug: string;
  wordCount: number;
  intent: string;
  primaryKeyword: string;
  issues: SeoAuditIssue[];
  keep: string[];
  improve: string[];
  add: string[];
  remove: string[];
  imageAction: "retain" | "replace_missing";
  meaningful: boolean;
};

function countH1(html: string): number {
  return (html.match(/<h1\b/gi) || []).length;
}

function countH2(html: string): number {
  return (html.match(/<h2\b/gi) || []).length;
}

export function isValidJsonLd(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  return Boolean(rec["@context"] && (rec["@type"] || rec["@graph"]));
}

export function auditContentItem(input: {
  contentType: SeoContentType;
  slug: string;
  title: string;
  h1?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  content: string;
  keywords?: string | null;
  primaryKeyword?: string | null;
  secondary?: string[];
  faq?: unknown;
  schema?: unknown;
  ogImage?: string | null;
  inventory: InventoryKeywordRow[];
}): SeoAuditResult {
  const keys = splitKeywordBlob(input.keywords || input.primaryKeyword || input.title);
  const primary = input.primaryKeyword || keys.primary || input.title;
  const intent = inferIntentFromText(`${input.title} ${primary}`);
  const wordCount = countWordsFromHtml(input.content);
  const issues: SeoAuditIssue[] = [];
  const keep: string[] = [];
  const improve: string[] = [];
  const add: string[] = [];
  const remove: string[] = [];

  if (!input.title.trim()) issues.push({ code: "missing_title", severity: "warning", message: "Missing title" });
  else keep.push("title");
  if (!String(input.metaDescription || "").trim()) {
    issues.push({ code: "missing_meta", severity: "warning", message: "Missing meta description" });
    add.push("meta description");
  } else keep.push("meta description");
  if (!String(input.h1 || input.title).trim()) {
    issues.push({ code: "missing_h1", severity: "warning", message: "Missing H1" });
    add.push("H1");
  } else keep.push("H1");
  if (countH1(input.content) > 0) {
    issues.push({ code: "extra_h1", severity: "warning", message: "Body contains an extra H1" });
    remove.push("in-body H1");
  }
  if (countH2(input.content) < 2) {
    issues.push({ code: "few_h2", severity: "info", message: "Fewer than 2 H2 sections" });
    add.push("H2 coverage");
  }
  const floor = wordFloorFor(input.contentType);
  const target = wordTargetFor(input.contentType);
  if (wordCount < floor) {
    issues.push({ code: "thin_content", severity: "warning", message: `Thin content (${wordCount} words)` });
    add.push("useful sections");
  } else if (wordCount < target.min) {
    issues.push({ code: "below_target", severity: "info", message: `Below target range ${target.min}–${target.max}` });
    improve.push("topic coverage");
  } else keep.push("word count");

  const faqs = [...faqItemsFromStored(input.faq), ...extractFaqItems(input.content)];
  if (faqs.length === 0 && intent === "informational") add.push("FAQ");
  if (input.schema && !isValidJsonLd(input.schema)) {
    issues.push({ code: "invalid_jsonld", severity: "warning", message: "Malformed JSON-LD" });
    improve.push("schema");
  }
  if (extractInternalHrefs(input.content).length < (input.contentType === "blog" ? 2 : 3)) {
    add.push("contextual internal links");
  }
  const imageAction = shouldReplaceExistingImage(input.content, input.ogImage) ? "replace_missing" : "retain";
  if (imageAction === "replace_missing") add.push("featured image");
  else keep.push("featured image");

  const conflicts = detectCannibalization({
    keyword: primary,
    intent,
    contentType: input.contentType,
    excludeSlug: input.slug,
    inventory: input.inventory,
  });
  if (conflicts.some((c) => c.kind === "exact_primary")) {
    issues.push({ code: "cannibalization", severity: "warning", message: "Primary keyword overlaps another page" });
    improve.push("keyword differentiation");
  }

  const meaningful = issues.some((i) => i.severity === "warning") || add.length > 0 || improve.length > 1;
  return {
    contentType: input.contentType,
    slug: input.slug,
    wordCount,
    intent,
    primaryKeyword: primary,
    issues,
    keep,
    improve,
    add,
    remove,
    imageAction,
    meaningful,
  };
}

export function formatRefreshReport(input: {
  status: "Updated" | "No substantial update required" | "Failed" | "Dry run";
  before?: number;
  after?: number;
  added?: number;
  improved?: number;
  linksAdded?: number;
  linksRepaired?: number;
  faqChanges?: number;
  metadataUpdated?: boolean;
  image?: string;
  cannibalization?: string;
  reason: string;
}): string {
  if (input.status === "No substantial update required") {
    return `Status: No substantial update required\nReason:\n${input.reason}`;
  }
  return [
    `Status: ${input.status}`,
    `Word count:`,
    `${input.before ?? "—"} → ${input.after ?? "—"}`,
    `Sections added: ${input.added ?? 0}`,
    `Sections improved: ${input.improved ?? 0}`,
    `Internal links added: ${input.linksAdded ?? 0}`,
    `Broken links repaired: ${input.linksRepaired ?? 0}`,
    `FAQ changes: ${input.faqChanges ?? 0}`,
    `Metadata updated: ${input.metadataUpdated ? "Yes" : "No"}`,
    `Cannibalization: ${input.cannibalization ?? "None"}`,
    `Image: ${input.image ?? "Existing image retained"}`,
    `Reason:`,
    input.reason,
  ].join("\n");
}
