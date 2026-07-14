import { Typography } from "@/components/ui/typography";

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Admin Analytics
        </Typography>
        <Typography variant="muted">
          Platform server traffic graphs and submission volumes analysis.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Admin traffic metrics and load charts are loaded in Phase 10.</p>
      </div>
    </div>
  );
}
