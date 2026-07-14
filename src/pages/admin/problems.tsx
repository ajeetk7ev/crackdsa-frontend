import { Typography } from "@/components/ui/typography";

export function AdminProblemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Admin Problems CRUD
        </Typography>
        <Typography variant="muted">
          Add, edit, or delete problems in the database.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Admin database CRUD tables are loaded in Phase 10.</p>
      </div>
    </div>
  );
}
