/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { applyHtmlSource } from "@/lib/tiptap-html-source";
import { ClassedLink, HtmlDiv } from "./tiptap-html-blocks";

const CTA = `<div class="custom-page-cta"><a href="/chatrooms" class="custom-page-cta-button"><span>Start Chatting Now</span><span aria-hidden="true">→</span></a><p class="custom-page-cta-note">Free to explore • Join when you are ready</p></div>`;

describe("CMS HTML block round-trip", () => {
  it("keeps CTA class names after setContent / getHTML", () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ link: false }),
        ClassedLink.configure({ openOnClick: false }),
        HtmlDiv,
      ],
      content: "<p></p>",
    });
    const applied = applyHtmlSource(editor, CTA);
    expect(applied.ok).toBe(true);
    const html = editor.getHTML();
    expect(html).toContain("custom-page-cta");
    expect(html).toContain("custom-page-cta-button");
    expect(html).toContain("/chatrooms");
    expect(html).toContain("Start Chatting Now");
    editor.destroy();
  });
});
