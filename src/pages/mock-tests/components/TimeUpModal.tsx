import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimeUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewResult: () => void;
  score: number;
  totalPoints: number;
}

export function TimeUpModal({ isOpen, onClose, onViewResult, score, totalPoints }: TimeUpModalProps) {
  const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="⏰ Time's Up!">
      <div className="space-y-5 text-center">
        <div className="flex items-center justify-center">
          <div className="p-4 rounded-full bg-red-500/10">
            <Clock className="size-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Your time has expired. Your answers have been auto-submitted.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-3xl font-bold text-foreground">{pct}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {score}/{totalPoints} points
          </p>
        </div>

        <Button onClick={onViewResult} className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
          View Detailed Results
        </Button>
      </div>
    </Dialog>
  );
}
