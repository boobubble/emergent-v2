import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Editor } from "@tiptap/react";
import { insertEditorImage } from "@/components/content-images/editor-images";
import {
  insertCmsEditorImage,
  rememberCmsImageInsertPos,
  resolveCmsImageInsertPos,
} from "./cms-image";

const FIRST_BLOCK = 42;
const DOC_SIZE = 200;
const MID = 88;
const END = DOC_SIZE - 1;

function mockEditor(opts: { from: number; focused: boolean; size?: number; first?: number }) {
  return {
    isFocused: opts.focused,
    state: {
      selection: { from: opts.from },
      doc: {
        content: { size: opts.size ?? DOC_SIZE },
        firstChild: { nodeSize: opts.first ?? FIRST_BLOCK },
      },
    },
  };
}

const DRAFT = {
  src: "https://example.com/kuwait.webp",
  alt: "Kuwait chat room on Yaarzo for online conversations and making friends",
  title: "",
  align: "center" as const,
  decorative: false,
  width: 1402,
  height: 1122,
  optimized: "true" as const,
  bytes: 186910,
};

function insertSpy() {
  const calls: Array<{ method: string; pos?: number; attrs?: Record<string, unknown> }> = [];
  const editor = {
    isFocused: false,
    state: {
      selection: { from: END },
      doc: {
        content: { size: DOC_SIZE },
        firstChild: { nodeSize: FIRST_BLOCK },
      },
    },
    chain() {
      const api = {
        insertContentAt(pos: number, content: { attrs?: Record<string, unknown> }) {
          calls.push({ method: "insertContentAt", pos, attrs: content.attrs });
          return api;
        },
        insertContent(content: { attrs?: Record<string, unknown> }) {
          calls.push({ method: "insertContent", attrs: content.attrs });
          return api;
        },
        focus() {
          return api;
        },
        run() {
          return true;
        },
      };
      return api;
    },
  };
  return { editor, calls };
}

describe("caret remembered before dialog opens", () => {
  it("stores the focused caret before Image SEO opens", () => {
    expect(rememberCmsImageInsertPos(mockEditor({ from: MID, focused: true }), null)).toBe(MID);
  });
});

describe("selection survives dialog blur", () => {
  it("keeps the saved caret after dialog blur jumps selection to the end", () => {
    const saved = rememberCmsImageInsertPos(mockEditor({ from: MID, focused: true }), null);
    const afterBlur = rememberCmsImageInsertPos(mockEditor({ from: END, focused: false }), saved);
    expect(afterBlur).toBe(MID);
  });

  it("does not replace a saved caret during file selection while unfocused", () => {
    const saved = rememberCmsImageInsertPos(mockEditor({ from: MID, focused: true }), null);
    const duringUpload = rememberCmsImageInsertPos(mockEditor({ from: END, focused: false }), saved);
    expect(duringUpload).toBe(MID);
  });
});

describe("resolveCmsImageInsertPos", () => {
  it("does not append to the document end when a valid caret exists", () => {
    const blurred = mockEditor({ from: END, focused: false });
    expect(resolveCmsImageInsertPos(blurred, MID)).toBe(MID);
    expect(resolveCmsImageInsertPos(blurred, MID)).not.toBe(END);
    expect(resolveCmsImageInsertPos(blurred, MID)).not.toBe(DOC_SIZE);
  });

  it("falls back after the first block when no selection was saved", () => {
    expect(resolveCmsImageInsertPos(mockEditor({ from: END, focused: false }), null)).toBe(FIRST_BLOCK);
  });

  it("treats an unfocused end-of-doc selection with no prior caret as missing", () => {
    expect(rememberCmsImageInsertPos(mockEditor({ from: END, focused: false }), null)).toBeNull();
    expect(resolveCmsImageInsertPos(mockEditor({ from: END, focused: false }), null)).toBe(FIRST_BLOCK);
  });
});

describe("insertCmsEditorImage", () => {
  it("inserts once at the saved position and keeps image SEO attrs", () => {
    const saved = rememberCmsImageInsertPos(mockEditor({ from: MID, focused: true }), null);
    const { editor, calls } = insertSpy();
    const pos = insertCmsEditorImage(editor, DRAFT, saved);
    expect(pos).toBe(MID);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe("insertContentAt");
    expect(calls[0]?.pos).toBe(MID);
    expect(calls[0]?.attrs).toMatchObject({
      alt: DRAFT.alt,
      optimized: "true",
      bytes: 186910,
      align: "center",
    });
  });

  it("does not duplicate the image", () => {
    const { editor, calls } = insertSpy();
    insertCmsEditorImage(editor, DRAFT, MID);
    expect(calls.filter((c) => c.method === "insertContentAt")).toHaveLength(1);
    expect(calls.some((c) => c.method === "insertContent")).toBe(false);
  });

  it("uses first-block insertContentAt when no saved position exists", () => {
    const { editor, calls } = insertSpy();
    const pos = insertCmsEditorImage(editor, DRAFT, null);
    expect(pos).toBe(FIRST_BLOCK);
    expect(calls).toEqual([expect.objectContaining({ method: "insertContentAt", pos: FIRST_BLOCK })]);
  });
});

describe("Blog does not use the Custom Pages caret helper", () => {
  it("Blog insert still uses insertContent without a CMS pos", () => {
    const calls: Array<{ method: string }> = [];
    const editor = {
      chain() {
        const api = {
          insertContentAt() {
            calls.push({ method: "insertContentAt" });
            return api;
          },
          insertContent() {
            calls.push({ method: "insertContent" });
            return api;
          },
          focus() {
            return api;
          },
          run() {
            return true;
          },
        };
        return api;
      },
    } as unknown as Editor;
    insertEditorImage(editor, DRAFT);
    expect(calls).toEqual([{ method: "insertContent" }]);
  });

  it("Blog editor source does not import CMS caret helpers", () => {
    const blog = readFileSync(resolve(process.cwd(), "src/components/blog/BlogEditorView.tsx"), "utf8");
    expect(blog).toMatch(/insertEditorImage\(editor, draft\)\s*;/);
    expect(blog).not.toContain("rememberCmsImageInsertPos");
    expect(blog).not.toContain("resolveCmsImageInsertPos");
    expect(blog).not.toContain("insertCmsEditorImage");
  });
});

describe("CMS editor wiring", () => {
  it("Custom Pages editor remembers caret then inserts via insertCmsEditorImage", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/admin/RichTextEditor.tsx"), "utf8");
    expect(src).toContain("rememberCmsImageInsertPos");
    expect(src).toContain("insertCmsEditorImage");
    expect(src).toContain("openInsert()");
    expect(src).not.toMatch(/insertEditorImage\s*\(/);
    expect(src).not.toMatch(/resolveCmsImageInsertPos\(\s*editor,\s*null\s*\)/);
  });
});
