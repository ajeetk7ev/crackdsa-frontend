import { Typography } from "@/components/ui/typography";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Settings
        </Typography>
        <Typography variant="muted">
          Modify account credentials, Pomodoro preferences, and notifications.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Preferences and configuration settings are loaded in Phase 9.</p>
      </div>
    </div>
  );
}
