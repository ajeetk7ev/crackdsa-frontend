import { useState, useEffect, useRef } from "react";

interface TimerDisplayProps {
  /** Total duration in seconds */
  totalSeconds: number;
  /** When the test was started (ISO string) */
  startedAt: string;
  /** Called when timer reaches zero */
  onTimeUp: () => void;
}

export function TimerDisplay({ totalSeconds, startedAt, onTimeUp }: TimerDisplayProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    const calcRemaining = () => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      return Math.max(0, totalSeconds - elapsed);
    };

    setRemaining(calcRemaining());

    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        onTimeUpRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, startedAt]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const percent = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const isWarning = remaining <= 300 && remaining > 60;
  const isCritical = remaining <= 60;

  const colorClass = isCritical
    ? "text-red-500"
    : isWarning
    ? "text-amber-500"
    : "text-emerald-500";

  const bgClass = isCritical
    ? "bg-red-500/10 border-red-500/30"
    : isWarning
    ? "bg-amber-500/10 border-amber-500/30"
    : "bg-emerald-500/10 border-emerald-500/30";

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${bgClass} transition-colors`}>
      <div className="flex flex-col items-center min-w-[100px]">
        <span className={`text-xl font-bold font-mono ${colorClass} tabular-nums`}>
          {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          remaining
        </span>
      </div>
      {/* Progress bar */}
      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden hidden sm:block">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isCritical && (
        <span className="text-[10px] font-bold text-red-500 animate-pulse uppercase">
          Hurry!
        </span>
      )}
    </div>
  );
}
