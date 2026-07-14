import { Typography } from "@/components/ui/typography";

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          My Profile
        </Typography>
        <Typography variant="muted">
          Review streaks history, achievements badges, and activity calendar.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">User profiles, calendar maps, and badges are loaded in Phase 8.</p>
      </div>
    </div>
  );
}
