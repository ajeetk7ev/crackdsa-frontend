import { Link } from "react-router-dom";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 rounded-full bg-muted border border-border animate-bounce">
        <Compass className="size-10 text-muted-foreground" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <Typography variant="h1" className="font-semibold tracking-tight">
          Page Not Found
        </Typography>
        <Typography variant="muted">
          This URL does not point to any active feature in the CrackDSA blueprint.
        </Typography>
      </div>

      <Link to="/dashboard">
        <Button variant="default" size="sm" className="h-9 cursor-pointer">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
