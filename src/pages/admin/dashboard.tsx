import { Typography } from "@/components/ui/typography";

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Admin Dashboard
        </Typography>
        <Typography variant="muted">
          Global platform stats summary and transactional logs.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Admin panels and server consoles are loaded in Phase 10.</p>
      </div>
    </div>
  );
}
