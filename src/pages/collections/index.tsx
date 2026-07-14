import { Typography } from "@/components/ui/typography";

export function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Collections
        </Typography>
        <Typography variant="muted">
          Organize problems into curated folders or follow sheets.
        </Typography>
      </div>

      <div className="p-12 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Custom and public folder collections are loaded in Phase 6.</p>
      </div>
    </div>
  );
}
