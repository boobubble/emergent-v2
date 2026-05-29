import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitReport } from "@/lib/moderation.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const REASONS = ["Spam", "Harassment", "Hate speech", "NSFW", "Phishing / scam", "Other"];

export function ReportButton({
  targetType, targetId, size = "sm", variant = "ghost", className,
}: {
  targetType: "message" | "post" | "user" | "room";
  targetId: string;
  size?: "sm" | "icon";
  variant?: "ghost" | "outline";
  className?: string;
}) {
  const submit = useServerFn(submitReport);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      await submit({ data: { target_type: targetType, target_id: targetId, reason, details: details || undefined } });
      toast.success("Report submitted. Thanks!");
      setOpen(false); setDetails("");
    } catch (e: any) { toast.error(e?.message ?? "Failed to send report"); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className} aria-label="Report">
          <Flag className="h-3.5 w-3.5" />
          {size !== "icon" && <span className="ml-1.5">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report {targetType}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Details (optional)</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} rows={3} placeholder="Add any context that helps moderators…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} disabled={busy}>{busy ? "Sending…" : "Submit"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
