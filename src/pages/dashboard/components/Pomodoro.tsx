import { useState, useEffect, useRef } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "work" | "short" | "long";

const MODE_TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export function Pomodoro() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work);
  const [isActive, setIsActive] = useState(false);
  const addToast = useNotificationStore((state: any) => state.addToast);
  const timerRef = useRef<any>(null);

  // Sync time when mode changes
  useEffect(() => {
    setTimeLeft(MODE_TIMES[mode]);
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode]);

  // Handle countdown intervals
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Alarm feedback trigger
            const alerts = {
              work: "Pomodoro Focus block completed! Time for a short rest.",
              short: "Break completed! Ready to focus on the next algorithm?",
              long: "Long break completed! Let's resume solving.",
            };
            addToast(alerts[mode], "info");
            
            return MODE_TIMES[mode];
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, addToast]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Progress bar calculation
  const totalDuration = MODE_TIMES[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <Clock className="size-4 text-indigo-500" />
          Pomodoro Focus
        </Typography>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
          {mode === "work" ? "Focus" : "Rest"}
        </span>
      </div>

      {/* Mode Switches */}
      <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg">
        {(["work", "short", "long"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "text-[10px] font-semibold py-1 rounded-md transition-all cursor-pointer capitalize",
              mode === m
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "work" ? "Focus" : m === "short" ? "Short" : "Long"}
          </button>
        ))}
      </div>

      {/* Timer Clock */}
      <div className="text-center py-3 relative">
        <p className="text-4xl font-mono font-light tracking-wider text-foreground">
          {formatTime(timeLeft)}
        </p>
        
        {/* Progress tracker */}
        <div className="w-full h-1 bg-muted rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={toggleTimer}
          variant={isActive ? "outline" : "default"}
          size="sm"
          className="w-24 cursor-pointer text-xs"
        >
          {isActive ? (
            <>
              <Pause className="size-3.5 mr-1" /> Pause
            </>
          ) : (
            <>
              <Play className="size-3.5 mr-1" /> Start
            </>
          )}
        </Button>
        <Button
          onClick={resetTimer}
          variant="ghost"
          size="sm"
          className="border border-border text-xs cursor-pointer hover:bg-muted/50"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
