function cell(row: Record<string, unknown>, name: string): string {
  const target = name.trim().toLowerCase();
  for (const [key, value] of Object.entries(row)) {
    if (key.trim().toLowerCase() === target) return String(value ?? "").trim();
  }
  return "";
}

function optionalLine(label: string, value: string): string | null {
  return value ? `${label}: ${value}` : null;
}

/** Prefer the "Content Ideas" tab; otherwise the first sheet. */
export function pickExcelIdeasSheetName(sheetNames: string[]): string | null {
  const named = sheetNames.find((name) => name.trim().toLowerCase() === "content ideas");
  return named ?? sheetNames[0] ?? null;
}

/** Convert Excel JSON rows (first-sheet sheet_to_json) into label-block bulk text. */
export function excelRowsToBulkText(rows: Record<string, unknown>[]): {
  text: string;
  imported: number;
} {
  const blocks: string[] = [];

  for (const row of rows) {
    const kind = cell(row, "kind").toLowerCase();
    if (kind === "blog") {
      const title = cell(row, "title");
      const about = cell(row, "about");
      if (!title || !about) continue;
      const lines = [
        `Blog: ${title}`,
        `About: ${about}`,
        optionalLine("Category", cell(row, "category")),
        optionalLine("Keywords", cell(row, "keywords")),
      ].filter((line): line is string => Boolean(line));
      blocks.push(lines.join("\n"));
      continue;
    }
    if (kind === "page") {
      const title = cell(row, "title");
      if (!title) continue;
      const lines = [
        `Page: ${title}`,
        optionalLine("Country", cell(row, "country")),
        optionalLine("Type", cell(row, "type")),
        optionalLine("Keywords", cell(row, "keywords")),
      ].filter((line): line is string => Boolean(line));
      blocks.push(lines.join("\n"));
    }
  }

  return { text: blocks.join("\n\n"), imported: blocks.length };
}

export function appendBulkText(existing: string, incoming: string): string {
  const current = existing.trim();
  const next = incoming.trim();
  if (!next) return existing;
  if (!current) return next;
  return `${current}\n\n${next}`;
}
