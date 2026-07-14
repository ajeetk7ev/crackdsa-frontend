import { Typography } from "@/components/ui/typography";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Reports & Insights
        </Typography>
        <Typography variant="muted">
          Track interview readiness index score and error distributions.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Detailed reports and SVG chart representations are loaded in Phase 7.</p>
      </div>
    </div>
  );
}
