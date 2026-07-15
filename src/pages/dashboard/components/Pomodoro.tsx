import { useState, useEffect } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import { usePomodoroStore, type TimerMode } from "@/stores/pomodoro.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Pomodoro() {
  const {
    isActive,
    timeLeft,
    totalDuration,
    mode,
    activeProblemTitle,
    isFullScreen,
    modeTimes,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    setFullScreen,
    setCustomDuration,
  } = usePomodoroStore();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customMins, setCustomMins] = useState("25");

  const addToast = useNotificationStore((state: any) => state.addToast);

  // Sync custom mins with mode duration
  useEffect(() => {
    setCustomMins(String(Math.round(modeTimes[mode] / 60)));
  }, [mode, modeTimes]);

  const toggleTimer = () => {
    if (isActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMins, 10);
    if (isNaN(mins) || mins <= 0 || mins > 180) {
      addToast("Please enter a valid duration between 1 and 180 minutes.", "warning");
      return;
    }
    
    setCustomDuration(mode, mins);
    setIsCustomizing(false);
    addToast(`Focus session set to ${mins} minutes.`, "success");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Progress calculations
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <>
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <Clock className="size-4 text-indigo-500" />
            Pomodoro Focus
          </Typography>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFullScreen(true)}
              className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-all"
              title="Fullscreen timer"
            >
              <Maximize2 className="size-3.5" />
            </button>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
              {mode === "work" ? "Focus" : "Rest"}
            </span>
          </div>
        </div>

        {/* Custom duration setup */}
        {isCustomizing ? (
          <form onSubmit={handleApplyCustomTime} className="space-y-3 py-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Mins:</span>
              <input
                type="number"
                value={customMins}
                onChange={(e) => setCustomMins(e.target.value)}
                min="1"
                max="180"
                className="w-16 h-7 rounded border border-border bg-background px-2 text-xs font-semibold text-center text-foreground outline-none focus:border-indigo-500"
              />
              <Button type="submit" size="xs" className="h-7 px-3">Set</Button>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Mode Switches */
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
        )}

        {/* Timer Clock */}
        <div className="text-center py-2 relative">
          <p className="text-4xl font-mono font-light tracking-wider text-foreground">
            {formatTime(timeLeft)}
          </p>

          {activeProblemTitle && (
            <p className="text-[10px] text-indigo-500 font-semibold mt-1 truncate max-w-full" title={activeProblemTitle}>
              Target: {activeProblemTitle}
            </p>
          )}
          
          {/* Progress tracker */}
          <div className="w-full h-1 bg-muted rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions row */}
        <div className="flex gap-2 justify-between items-center pt-1">
          <div className="flex gap-1.5 flex-1 justify-start">
            <Button
              onClick={toggleTimer}
              variant={isActive ? "outline" : "default"}
              size="xs"
              className="px-4 h-7 cursor-pointer text-xs"
            >
              {isActive ? (
                <>
                  <Pause className="size-3 mr-1 shrink-0" /> Pause
                </>
              ) : (
                <>
                  <Play className="size-3 mr-1 shrink-0" /> Start
                </>
              )}
            </Button>
            <Button
              onClick={resetTimer}
              variant="ghost"
              size="xs"
              className="border border-border h-7 cursor-pointer hover:bg-muted/50 text-foreground"
            >
              <RotateCcw className="size-3" />
            </Button>
          </div>

          {!isCustomizing && (
            <button
              onClick={() => setIsCustomizing(true)}
              className="p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-sm shrink-0"
              title="Customize timer duration"
            >
              <Sliders className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FULLSCREEN TIMER OVERLAY */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-200">
          {/* Minimize / Close trigger */}
          <button
            onClick={() => setFullScreen(false)}
            className="absolute top-6 right-6 size-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer shadow-sm hover:scale-105 transition-all"
            title="Minimize fullscreen timer"
          >
            <Minimize2 className="size-5" />
          </button>

          {/* Mode description */}
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
              {mode === "work" ? "Focus Block active" : "Break time resting"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-muted-foreground mt-2">
              {mode === "work" 
                ? (activeProblemTitle ? `Focusing on: ${activeProblemTitle}` : "Tackle your algorithm objectives")
                : "Let your structural memory consolidate"}
            </h1>
          </div>

          {/* Big timer display */}
          <div className="text-center space-y-6 max-w-2xl w-full">
            <h2 className="text-8xl sm:text-[10rem] md:text-[12rem] font-mono tracking-wider font-extralight text-foreground select-none leading-none">
              {formatTime(timeLeft)}
            </h2>
            
            {/* Fullscreen linear progress bar */}
            <div className="w-full bg-muted/60 dark:bg-muted/20 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Fullscreen Controls panel */}
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            {/* Mode selection inside fullscreen */}
            <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1.5 rounded-xl w-full">
              {(["work", "short", "long"] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer capitalize",
                    mode === m
                      ? "bg-background text-foreground shadow border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "work" ? "Focus" : m === "short" ? "Short" : "Long"}
                </button>
              ))}
            </div>

            {/* Sub-actions */}
            <div className="flex gap-4 items-center justify-center w-full">
              <Button
                onClick={toggleTimer}
                size="lg"
                className="px-8 h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 cursor-pointer shadow"
              >
                {isActive ? (
                  <>
                    <Pause className="size-4 shrink-0" /> Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="size-4 shrink-0" /> Start Timer
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                size="lg"
                className="border border-border size-12 p-0 flex items-center justify-center rounded-xl cursor-pointer hover:bg-muted"
                title="Reset timer"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
