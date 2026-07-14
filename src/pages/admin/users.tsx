import { Typography } from "@/components/ui/typography";

export function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Admin Users Manager
        </Typography>
        <Typography variant="muted">
          Manage user profiles, toggle admin credentials, or block accounts.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Admin user directories are loaded in Phase 10.</p>
      </div>
    </div>
  );
}
