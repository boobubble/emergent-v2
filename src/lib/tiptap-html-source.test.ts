import { describe, expect, it } from "vitest";
import { applyHtmlSource, parseHtmlSource } from "./tiptap-html-source";

describe("parseHtmlSource", () => {
  it("accepts the signup-link snippet used in the editor checklist", () => {
    const html = `<p>Ready to get started? <a href="/signup">sign up on Yaarzo</a>.</p>`;
    expect(parseHtmlSource(html)).toEqual({ ok: true, html });
  });

  it("accepts a custom-page CTA block", () => {
    const html = `<div class="custom-page-cta">
<a href="/chatrooms" class="custom-page-cta-button">
<span>Start Chatting Now</span>
<span aria-hidden="true">→</span>
</a>
<p class="custom-page-cta-note">Free to explore • Join when you are ready</p>
</div>`;
    expect(parseHtmlSource(html).ok).toBe(true);
  });
});

describe("applyHtmlSource", () => {
  it("returns an error when the editor is missing", () => {
    expect(applyHtmlSource(null, "<p>Hi</p>")).toEqual({
      ok: false,
      error: "Editor is not ready.",
    });
  });

  it("setContent false is reported instead of switching silently", () => {
    const editor = {
      commands: {
        setContent: () => false,
      },
    };
    expect(applyHtmlSource(editor, "<p>Hi</p>").ok).toBe(false);
  });

  it("applies HTML when setContent succeeds", () => {
    let received = "";
    const editor = {
      commands: {
        setContent: (html: string) => {
          received = html;
          return true;
        },
      },
    };
    expect(applyHtmlSource(editor, "<p>Hello</p>")).toEqual({ ok: true });
    expect(received).toBe("<p>Hello</p>");
  });
});
