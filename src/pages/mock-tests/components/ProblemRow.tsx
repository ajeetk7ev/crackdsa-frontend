import { ExternalLink } from "lucide-react";

interface ProblemRowProps {
  index: number;
  problem: {
    _id: string;
    title: string;
    difficulty: string;
    topic: string;
    leetcodeUrl: string;
  };
  points: number;
  status: string;
  timeTaken: number;
  onStatusChange: (status: string) => void;
  onTimeChange: (time: number) => void;
  disabled?: boolean;
}

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusOptions = [
  { value: "not_started", label: "Not Started", emoji: "⬜" },
  { value: "solved", label: "Solved", emoji: "✅" },
  { value: "attempted", label: "Attempted", emoji: "🔄" },
  { value: "skipped", label: "Skipped", emoji: "⏭️" },
];

export function ProblemRow({
  index,
  problem,
  points,
  status,
  timeTaken,
  onStatusChange,
  onTimeChange,
  disabled,
}: ProblemRowProps) {
  const isSolved = status === "solved";
  const pointsEarned = isSolved ? points : 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSolved
          ? "border-emerald-500/30 bg-emerald-500/5"
          : status === "attempted"
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Problem info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-6 rounded-lg bg-muted/50 text-[10px] font-bold text-muted-foreground shrink-0">
              {index}
            </span>
            <h4 className="text-sm font-semibold text-foreground truncate">
              {problem.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${difficultyBadge[problem.difficulty] || difficultyBadge.Medium}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-8">
            <span className="text-[10px] text-muted-foreground">{problem.topic}</span>
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline transition-colors"
            >
              Open on LeetCode <ExternalLink className="size-2.5" />
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status selector */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={disabled}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>

          {/* Time input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={999}
              value={timeTaken > 0 ? Math.round(timeTaken / 60) : ""}
              onChange={(e) => onTimeChange(parseInt(e.target.value || "0") * 60)}
              disabled={disabled}
              placeholder="—"
              className="w-14 h-8 px-2 rounded-lg border border-border bg-background text-xs text-center font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <span className="text-[10px] text-muted-foreground">min</span>
          </div>

          {/* Points */}
          <div className="text-right min-w-[60px]">
            <span className={`text-sm font-bold ${isSolved ? "text-emerald-500" : "text-muted-foreground"}`}>
              {pointsEarned}
            </span>
            <span className="text-xs text-muted-foreground">/{points}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
