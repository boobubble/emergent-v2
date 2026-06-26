import { createFileRoute } from "@tanstack/react-router";
import { Save, Mic } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { VOICE_NOTES_DEFAULTS, type VoiceNotesConfig } from "@/lib/voice-notes-config";

export const Route = createFileRoute("/admin/voice-notes")({
  component: VoiceNotesPage,
});

function VoiceNotesPage() {
  const { values, set, save, saving } =
    useAdminSetting<VoiceNotesConfig>("voice_notes", VOICE_NOTES_DEFAULTS);

  const numField = (key: keyof VoiceNotesConfig, label: string, hint: string) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type="number"
        min={5}
        max={600}
        value={values[key] as number}
        onChange={(e) => set(key, Math.max(5, Math.min(600, Number(e.target.value) || 0)) as any)}
        disabled={!values.enabled}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Voice Notes"
        description="Allow users to send voice notes in chat. Set a separate maximum recording length per channel type."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Enable voice notes</p>
              <p className="text-xs text-muted-foreground">
                When off, the microphone button is hidden in the chat composer everywhere.
              </p>
            </div>
            <AdminToggle checked={values.enabled} onCheckedChange={(v: boolean) => set("enabled", v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          {numField("max_lobby", "Lobby & rooms (sec)", "Max recording length in the public lobby and standard chatrooms.")}
          {numField("max_dm", "Direct messages (sec)", "Max recording length in private 1-to-1 DMs.")}
          {numField("max_trio", "3some rooms (sec)", "Max recording length in invite-only 3some rooms.")}
        </CardContent>
      </Card>
    </div>
  );
}
