import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload } from "lucide-react";
import { exportPages, importPages } from "@/lib/pages.functions";
import {
  exportAs,
  parseImport,
  detectFormatFromName,
  downloadFile,
  type ExportFormat,
  type PageRecord,
} from "@/lib/pages-io";
import { CMS_EXPORT_FIELDS } from "@/components/admin/pages/pages-ui";

export const Route = createFileRoute("/admin/pages/import-export")({ component: ImportExportPage });

function ImportExportPage() {
  const exportFn = useServerFn(exportPages);
  const importFn = useServerFn(importPages);
  const fileRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [mode, setMode] = useState<"skip" | "overwrite">("skip");

  async function handleExport() {
    try {
      const rows = await exportFn({ data: {} });
      const out = exportAs(format, rows as PageRecord[]);
      downloadFile(out.name, out.mime, out.body);
      toast.success(`Exported ${rows.length} pages`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Export failed");
    }
  }

  async function handleFile(file: File) {
    const raw = await file.text();
    const fmt = detectFormatFromName(file.name);
    try {
      const parsed = parseImport(fmt, raw);
      if (!parsed.length) {
        toast.error("No pages found in file");
        return;
      }
      const res = await importFn({ data: { pages: parsed, mode } });
      toast.success(`Imported ${res.imported}, overwritten ${res.overwritten}, skipped ${res.skipped}`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Import failed");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">JSON export fields</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {CMS_EXPORT_FIELDS.map((f) => (
            <Badge key={f} variant="outline" className="font-mono text-xs">{f}</Badge>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        CSV and XLSX import/export are planned for a future release — not implemented server-side yet.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Backup all pages as a single file. JSON is recommended for full CMS field coverage.
            </p>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (recommended)</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="md">Markdown</SelectItem>
                <SelectItem value="txt">Plain text</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-1 h-4 w-4" />Export all pages
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Supports .json, .xml, .html, .md, .txt. Max 200 pages per import batch.
            </p>
            <Select value={mode} onValueChange={(v) => setMode(v as "skip" | "overwrite")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip pages whose slug exists</SelectItem>
                <SelectItem value="overwrite">Overwrite existing slugs</SelectItem>
              </SelectContent>
            </Select>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.xml,.html,.htm,.md,.markdown,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" />Choose file…
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
