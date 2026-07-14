import { Typography } from "@/components/ui/typography";

export function RevisionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Revision Queue
        </Typography>
        <Typography variant="muted">
          Your scheduled Spaced Repetition reviews for long term retention.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Revision queue details and SM2 interval controls are loaded in Phase 5.</p>
      </div>
    </div>
  );
}
