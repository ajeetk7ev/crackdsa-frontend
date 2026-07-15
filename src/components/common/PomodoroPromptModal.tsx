import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePomodoroStore } from "@/stores/pomodoro.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Play, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PomodoroPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string | null;
  problemTitle: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  leetcodeUrl: string;
}

export function PomodoroPromptModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  difficulty,
  leetcodeUrl,
}: PomodoroPromptModalProps) {
  const startTimer = usePomodoroStore((state) => state.startTimer);
  const addToast = useNotificationStore((state) => state.addToast);
  
  // Decide default duration based on difficulty
  const getDefaultDuration = (diff: string) => {
    switch (diff) {
      case "Easy": return 15;
      case "Medium": return 25;
      case "Hard": return 45;
      default: return 25;
    }
  };

  const [mins, setMins] = useState(25);

  useEffect(() => {
    if (isOpen && difficulty) {
      setMins(getDefaultDuration(difficulty));
    }
  }, [isOpen, difficulty]);

  const handleStartWithTimer = () => {
    if (mins <= 0 || mins > 180) {
      addToast("Please input a study window between 1 and 180 minutes.", "warning");
      return;
    }

    // Start background timer
    startTimer(problemId, problemTitle, mins);
    
    // Redirect to LeetCode slug
    window.open(leetcodeUrl, "_blank");
    
    addToast(`Focus session started for ${mins} mins! Redirecting to LeetCode...`, "success");
    onClose();
  };

  const handleJustPractice = () => {
    window.open(leetcodeUrl, "_blank");
    addToast("Redirecting to LeetCode...", "info");
    onClose();
  };

  const diffColors: Record<string, string> = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    Hard: "text-rose-500 bg-rose-500/10 border-rose-500/25",
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="🚀 Start Practice Session"
      description="Launch your LeetCode task and optionally configure a structured Pomodoro Focus Timer."
    >
      <div className="space-y-5 text-left pt-2">
        {/* Challenge details widget */}
        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Target Challenge</span>
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full border",
              diffColors[difficulty] || "text-indigo-500 bg-indigo-500/10 border-indigo-500/25"
            )}>
              {difficulty}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {problemTitle}
          </p>
        </div>

        {/* Timer duration config */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5 text-indigo-500" /> Focus Time duration (minutes):
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={mins}
              onChange={(e) => setMins(Number(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
            />
            <input
              type="number"
              min="1"
              max="180"
              value={mins}
              onChange={(e) => setMins(Number(e.target.value))}
              className="w-16 h-8 text-center text-xs font-semibold rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="text-[10px] text-muted-foreground leading-relaxed block">
            Suggested focus durations: Easy (15 min), Medium (25 min), Hard (45 min).
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <Button
            variant="outline"
            onClick={handleJustPractice}
            className="text-xs h-9 font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-muted"
          >
            <ExternalLink className="size-3.5" /> Just Practice
          </Button>

          <Button
            onClick={handleStartWithTimer}
            className="text-xs h-9 font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Play className="size-3.5" /> Focus & Start
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
