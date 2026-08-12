import { ClipboardCheck, Clock, Zap, Target, BarChart3 } from "lucide-react";

interface MockTestCardProps {
  test: {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    difficulty: string;
    durationMinutes: number;
    problemCount: number;
    totalPoints: number;
    attemptCount: number;
    avgScorePercent: number;
    userAttempt: {
      status: string;
      score: number;
      totalPoints: number;
      scorePercent: number;
    } | null;
  };
  onStart: () => void;
  onViewResult: () => void;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
  Mixed: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export function MockTestCard({ test, onStart, onViewResult }: MockTestCardProps) {
  const isCompleted = test.userAttempt && ["completed", "timed_out"].includes(test.userAttempt.status);
  const isInProgress = test.userAttempt?.status === "in_progress";

  return (
    <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4">
      {/* Header with badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${difficultyColors[test.difficulty] || difficultyColors.Mixed}`}>
            {test.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground bg-muted/40 border border-border">
            <Clock className="size-2.5" />
            {test.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground bg-muted/40 border border-border">
            <ClipboardCheck className="size-2.5" />
            {test.problemCount} problems
          </span>
        </div>

        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {test.title}
        </h3>

        {test.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {test.description}
          </p>
        )}

        {/* Tags */}
        {test.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {test.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary/70 border border-primary/10">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Target className="size-3" />
          {test.totalPoints} pts
        </span>
        <span className="flex items-center gap-1">
          <Zap className="size-3" />
          {test.attemptCount} attempts
        </span>
        {test.avgScorePercent > 0 && (
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3" />
            Avg: {test.avgScorePercent}%
          </span>
        )}
      </div>

      {/* Action button */}
      <div>
        {isCompleted ? (
          <button
            onClick={onViewResult}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            ✅ Completed — Score: {test.userAttempt?.scorePercent}%
          </button>
        ) : isInProgress ? (
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer animate-pulse"
          >
            🔄 Resume Test
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Start Test →
          </button>
        )}
      </div>
    </div>
  );
}
