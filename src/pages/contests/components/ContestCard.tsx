import { useState, useEffect, useRef } from "react";
import {
  Clock,
  ExternalLink,
  Trophy,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Contest {
  id: string;
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  cardImg?: string;
}

interface ContestCardProps {
  contest: Contest;
  onLogParticipation: () => void;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Started");
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      setTimeLeft(parts.join(" "));
    };

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate]);

  return timeLeft;
}

const platformConfig: Record<string, { color: string; bg: string; borderColor: string; accentGradient: string }> = {
  codeforces: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    accentGradient: "from-blue-500/20 to-blue-600/5",
  },
  leetcode: {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    accentGradient: "from-amber-500/20 to-amber-600/5",
  },
};

export function ContestCard({ contest, onLogParticipation }: ContestCardProps) {
  const countdown = useCountdown(contest.startTime);
  const config = platformConfig[contest.platform] || platformConfig.codeforces;
  const isOngoing = contest.status === "ongoing";
  const isEnded = contest.status === "ended";
  const startDate = new Date(contest.startTime);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className={`group relative rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${config.borderColor}`}>
      {/* Top accent gradient */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.accentGradient}`} />

      <div className="p-5 space-y-4">
        {/* Header: Platform Badge + Status */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.borderColor} ${config.color}`}
          >
            {contest.platform === "codeforces" ? (
              <Swords className="size-3" />
            ) : (
              <Trophy className="size-3" />
            )}
            {contest.platform}
          </span>

          {isOngoing ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-pulse">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          ) : isEnded ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted/40 border border-border text-muted-foreground">
              Ended
            </span>
          ) : null}
        </div>

        {/* Contest Name */}
        <div>
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {contest.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <Clock className="size-3" />
            {startDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {" · "}
            {startDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Duration + Countdown Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{formatDuration(contest.duration)}</span>
          </div>
          {!isEnded && (
            <div className={`text-xs font-bold font-mono ${isOngoing ? "text-emerald-500" : config.color}`}>
              {countdown}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={contest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full text-xs flex items-center gap-1.5 cursor-pointer">
              <ExternalLink className="size-3" />
              Open Contest
            </Button>
          </a>
          <Button
            size="sm"
            onClick={onLogParticipation}
            className="flex-1 text-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Log Results
          </Button>
        </div>
      </div>
    </div>
  );
}
