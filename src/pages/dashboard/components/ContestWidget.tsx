import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import {
  Trophy,
  Clock,
  ChevronRight,
  Swords,
  ExternalLink,
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
        setTimeLeft("Now!");
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts: string[] = [];
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

function NextContestMini({ contest }: { contest: Contest }) {
  const countdown = useCountdown(contest.startTime);
  const isLeetcode = contest.platform === "leetcode";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/40 transition-colors">
      <div
        className={`p-2 rounded-lg shrink-0 ${
          isLeetcode ? "bg-amber-500/10" : "bg-blue-500/10"
        }`}
      >
        {isLeetcode ? (
          <Trophy className={`size-4 text-amber-500`} />
        ) : (
          <Swords className={`size-4 text-blue-500`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">{contest.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold uppercase ${isLeetcode ? "text-amber-500" : "text-blue-500"}`}>
            {contest.platform}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="size-2.5" />
            {contest.duration}m
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-bold font-mono ${isLeetcode ? "text-amber-500" : "text-blue-500"}`}>
          {countdown}
        </p>
      </div>
    </div>
  );
}

export function ContestWidget() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get("/contests/upcoming");
        setContests(res.data.data || []);
      } catch {
        // Silently fail — widget is optional
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-border bg-card animate-pulse space-y-3">
        <div className="h-5 w-1/3 rounded bg-muted/60" />
        <div className="h-16 rounded bg-muted/40" />
        <div className="h-16 rounded bg-muted/40" />
      </div>
    );
  }

  // Show at most 3 upcoming contests
  const displayContests = contests.slice(0, 3);

  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-3">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Trophy className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Upcoming Contests</h3>
        </div>
        <button
          onClick={() => navigate("/contests")}
          className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          View All
          <ChevronRight className="size-3" />
        </button>
      </div>

      {/* Contest List */}
      {displayContests.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="size-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No upcoming contests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayContests.map((contest) => (
            <NextContestMini key={contest.id} contest={contest} />
          ))}
        </div>
      )}
    </div>
  );
}
