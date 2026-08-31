import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseBulkContentIdeas } from "./parse-bulk-ideas";
import { appendBulkText, excelRowsToBulkText, pickExcelIdeasSheetName } from "./excel-ideas";

describe("excelRowsToBulkText", () => {
  it("converts mixed Blog/Page rows into parser-ready blocks and skips blank Kind rows", () => {
    const { text, imported } = excelRowsToBulkText([
      { Kind: "", Title: "ignored" },
      {
        Kind: "Blog",
        Title: "How to Make Friends After College",
        About: "Practical tips for building a social circle after graduating.",
        Category: "",
        Keywords: "make friends after college, social circle tips, adult friendships",
      },
      {
        Kind: "Blog",
        Title: "Best Chatrooms for Night Owls",
        About: "Late-night chatroom communities worth joining.",
      },
      {
        Kind: "Page",
        Title: "Rawalpindi",
        Country: "Pakistan",
        Keywords: "rawalpindi chat room, pakistan chat online, rwp chat",
      },
      { Kind: "Page", Title: "Ludhiana", Country: "India" },
      { Kind: "Page", Title: "Quetta Girls", Country: "Pakistan", Type: "girls" },
    ]);

    expect(imported).toBe(5);
    const parsed = parseBulkContentIdeas(text);
    expect(parsed.errors).toEqual([]);
    expect(parsed.blogItems).toHaveLength(2);
    expect(parsed.pageItems.map((p) => p.slug)).toEqual([
      "rawalpindi-chat-room",
      "ludhiana-chat-room",
      "quetta-girls-chat-room",
    ]);
  });

  it("appends imported text after existing textarea content", () => {
    expect(appendBulkText("", "Blog: A\nAbout: B")).toBe("Blog: A\nAbout: B");
    expect(appendBulkText("Blog: A\nAbout: B", "Page: Rawalpindi\nCountry: Pakistan")).toBe(
      "Blog: A\nAbout: B\n\nPage: Rawalpindi\nCountry: Pakistan",
    );
  });
});

describe("content-automation upload wiring", () => {
  it("uses the block parser and does not validate each line as blog|page", () => {
    const src = readFileSync(resolve(process.cwd(), "src/routes/admin.content-automation.tsx"), "utf8");
    expect(src).toContain("parseBulkContentIdeas");
    expect(src).toContain("handleBulkUpload");
    expect(src).toMatch(/onClick=\{handleBulkUpload\}/);
    expect(src).not.toContain("No valid ideas to upload");
    expect(src).not.toContain('line.split("|")');
    expect(src).not.toContain('each line must start with "blog" or "page"');
    expect(src).not.toMatch(/each line must start/i);
    expect(src).not.toMatch(/parts\[0\].*blog/);
  });

  it("imports the project Excel template into 5 parser-valid blocks", () => {
    const template = resolve(process.cwd(), "public/templates/yaarzo-content-ideas-import-template.xlsx");
    expect(existsSync(template)).toBe(true);
    const workbook = XLSX.read(readFileSync(template));
    const sheetName = pickExcelIdeasSheetName(workbook.SheetNames);
    expect(sheetName).toBeTruthy();
    const sheet = workbook.Sheets[sheetName!];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const { text, imported } = excelRowsToBulkText(rows);
    expect(imported).toBe(5);
    const parsed = parseBulkContentIdeas(text);
    expect(parsed.errors).toEqual([]);
    expect(parsed.blogItems).toHaveLength(2);
    expect(parsed.pageItems.map((p) => p.slug)).toEqual([
      "rawalpindi-chat-room",
      "ludhiana-chat-room",
      "quetta-girls-chat-room",
    ]);
  });
});
