import { describe, it, expect } from "vitest";
import {
  processPastedPageContent,
  plainTextToHtml,
  normalizePageContentForSave,
  normalizeContentHeadings,
  countHtmlHeadings,
  sanitizePageContentHtml,
} from "./page-content-paste";
import { sanitizeHtml } from "./pages-io";

describe("page-content-paste", () => {
  describe("Word HTML paste", () => {
    it("preserves Heading 1/2 and paragraphs from Word-style markup", () => {
      const wordHtml = `
        <p class="MsoHeading1">Main Section</p>
        <p class="MsoNormal">Intro paragraph text.</p>
        <p class="MsoHeading2">Sub Section</p>
        <p class="MsoNormal">More body copy here.</p>
      `;
      const { html } = processPastedPageContent({ html: wordHtml, pageTitleOwnsH1: true });
      expect(html).toMatch(/<h2[^>]*>Main Section<\/h2>/i);
      expect(html).toMatch(/<h2[^>]*>Sub Section<\/h2>/i);
      expect(html).toMatch(/<p[^>]*>Intro paragraph text\./i);
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBe(2);
    });
  });

  describe("Google Docs / raw HTML paste", () => {
    it("preserves h1/h2/h3 and converts content h1 for page title ownership", () => {
      const raw = `<h1>Doc Title</h1><h2>Section</h2><h3>Sub</h3><p>Body</p>`;
      const { html, contentH1ConvertedForPageTitle } = processPastedPageContent({
        html: raw,
        pageTitleOwnsH1: true,
      });
      expect(contentH1ConvertedForPageTitle).toBe(1);
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBe(2);
      expect(countHtmlHeadings(html, 3)).toBe(1);
      expect(html).toContain("Body");
    });
  });

  describe("plain text paste", () => {
    it("keeps paragraphs when detection is OFF", () => {
      const text = "# Not a heading\n\nJust a normal paragraph.";
      const html = plainTextToHtml(text, false);
      expect(html).not.toMatch(/<h[123]>/i);
      expect(html).toMatch(/<p>/);
      expect(html).toContain("# Not a heading");
    });

    it("detects Markdown headings when detection is ON", () => {
      const text = "# Top\n\n## Section\n\n### Sub\n\nParagraph text.";
      const { html } = processPastedPageContent({
        plainText: text,
        detectPlainTextHeadings: true,
        pageTitleOwnsH1: true,
      });
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBeGreaterThanOrEqual(2);
      expect(countHtmlHeadings(html, 3)).toBe(1);
      expect(html).toMatch(/Paragraph text/);
    });

    it("does not turn short ordinary sentences into headings", () => {
      const text = "Hello there.\n\nThis is a longer paragraph that follows a normal sentence.";
      const html = plainTextToHtml(text, true);
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBe(0);
      expect(html).toMatch(/Hello there/);
    });
  });

  describe("multiple H1 handling", () => {
    it("converts all content H1 to H2 when page title owns H1", () => {
      const raw = `<h1>One</h1><h1>Two</h1><h1>Three</h1>`;
      const { html, contentH1ConvertedForPageTitle, warnings } = processPastedPageContent({
        html: raw,
        pageTitleOwnsH1: true,
      });
      expect(contentH1ConvertedForPageTitle).toBe(3);
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBe(3);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it("keeps first H1 and converts extras when page title does not own H1", () => {
      const raw = `<h1>One</h1><h1>Two</h1>`;
      const { html, extraH1Converted } = normalizeContentHeadings(raw, { pageTitleOwnsH1: false });
      expect(extraH1Converted).toBe(1);
      expect(countHtmlHeadings(html, 1)).toBe(1);
      expect(countHtmlHeadings(html, 2)).toBe(1);
    });
  });

  describe("unsafe HTML sanitization", () => {
    it("removes script tags and onclick handlers", () => {
      const raw = `<h2>Safe</h2><script>alert(1)</script><p onclick="evil()">Text</p><iframe src="x"></iframe>`;
      const { html } = processPastedPageContent({ html: raw });
      expect(html).not.toMatch(/script/i);
      expect(html).not.toMatch(/iframe/i);
      expect(html).not.toMatch(/onclick/i);
      expect(html).toMatch(/Safe/);
      expect(html).toMatch(/Text/);
    });
  });

  describe("save normalization vs existing content", () => {
    it("normalizePageContentForSave converts h1 to h2 in edited content", () => {
      const existing = `<h1>Legacy heading</h1><p>Old body</p>`;
      const { html } = normalizePageContentForSave(existing);
      expect(countHtmlHeadings(html, 1)).toBe(0);
      expect(countHtmlHeadings(html, 2)).toBe(1);
    });

    it("sanitizeHtml preserves h2/h3 for public render", () => {
      const content = `<h2>Section</h2><h3>Sub</h3><p>Text</p>`;
      const safe = sanitizeHtml(content);
      expect(countHtmlHeadings(safe, 2)).toBe(1);
      expect(countHtmlHeadings(safe, 3)).toBe(1);
      expect(safe).toContain("Text");
    });
  });

  describe("public page single H1 model", () => {
    it("simulates page title H1 plus sanitized content with no content H1", () => {
      const content = normalizePageContentForSave(
        `<h1>Should become h2</h1><h2>Section</h2><p>Body</p>`,
      ).html;
      const safeContent = sanitizeHtml(content);
      const totalH1InDom = 1 + countHtmlHeadings(safeContent, 1);
      expect(totalH1InDom).toBe(1);
      expect(countHtmlHeadings(safeContent, 2)).toBe(2);
    });
  });

  describe("sanitizePageContentHtml", () => {
    it("keeps semantic inline tags", () => {
      const html = sanitizePageContentHtml(
        `<p><strong>Bold</strong> and <em>italic</em> and <a href="/x">link</a></p>`,
      );
      expect(html).toContain("<strong>");
      expect(html).toContain("<em>");
      expect(html).toContain('<a href="/x"');
    });
  });
});
