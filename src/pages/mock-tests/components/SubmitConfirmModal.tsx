import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  solvedCount: number;
  totalCount: number;
  score: number;
  totalPoints: number;
}

export function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  solvedCount,
  totalCount,
  score,
  totalPoints,
}: SubmitConfirmModalProps) {
  const unsolved = totalCount - solvedCount;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Submit Mock Test?">
      <div className="space-y-4">
        {unsolved > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-600">
              You have {unsolved} unsolved {unsolved === 1 ? "problem" : "problems"}. Once submitted, you cannot retake this test.
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Problems Solved</span>
            <span className="font-semibold text-foreground">{solvedCount}/{totalCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Score</span>
            <span className="font-semibold text-foreground">{score}/{totalPoints}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">
            Keep Working
          </Button>
          <Button onClick={onConfirm} className="flex-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
            Submit Test
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
