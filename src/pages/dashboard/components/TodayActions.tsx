import { Link } from "react-router-dom";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { BookOpen, RefreshCw, Target, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
}

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

interface TodayRevisionProps {
  revisions: RevisionItem[];
  problems: ProblemItem[];
  onReviewSelect: (problemId: string) => void;
}

// 1. Today's Revision Card
export function TodayRevisionCard({ revisions, problems, onReviewSelect }: TodayRevisionProps) {
  // Resolve due revision names
  const getProblemTitle = (probId: string) => {
    const found = problems.find((p) => p.id === probId);
    return found ? found.title : "Algorithm Problem";
  };

  const getProblemDifficulty = (probId: string) => {
    const found = problems.find((p) => p.id === probId);
    return found ? found.difficulty : "Easy";
  };

  const difficultyColors = {
    Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <RefreshCw className="size-4 text-amber-500" />
          1. Today's Revision
        </Typography>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
          {revisions.length} Due
        </span>
      </div>

      <div className="flex-1">
        {revisions.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="size-6 text-emerald-500 mx-auto" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All caught up! No scheduled revisions for today. Solve new patterns to populate lists.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {revisions.slice(0, 3).map((rev) => {
              const diff = getProblemDifficulty(rev.problemId) as "Easy" | "Medium" | "Hard";
              return (
                <div
                  key={rev.id}
                  onClick={() => onReviewSelect(rev.problemId)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border hover:border-border-hover hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary-hover transition-colors">
                      {getProblemTitle(rev.problemId)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-semibold border rounded-full px-2 py-0.5 ml-2",
                      difficultyColors[diff]
                    )}
                  >
                    {diff}
                  </span>
                </div>
              );
            })}
            {revisions.length > 3 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1 font-medium">
                + {revisions.length - 3} other items pending...
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link to="/revision" className="block">
          <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
            Manage Revision Queue
            <ArrowUpRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// 2. Continue Learning Card
export function ContinueLearningCard({ problems }: { problems: ProblemItem[] }) {
  // Simple heuristic: suggest the first problem not solved, or LRU Cache
  const getSuggestedProblem = () => {
    // In mock API, let's suggest Add Two Numbers or Trapping Rain Water
    const suggestion = problems[2] || problems[0];
    return suggestion ? { title: suggestion.title, id: suggestion.id } : { title: "Two Sum", id: "001" };
  };

  const suggestion = getSuggestedProblem();

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <BookOpen className="size-4 text-emerald-500" />
          2. Continue Learning
        </Typography>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
          Active Sheet
        </span>
      </div>

      <div className="flex-1 space-y-3 py-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Resume your pattern study plan. We recommend targeting:
        </p>
        <div className="p-3 rounded-lg bg-background border border-border">
          <p className="text-xs font-semibold text-foreground">
            {suggestion.title}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-none">
            Topic: Array Curation sheet
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link to={`/problems/${suggestion.id}`} className="block">
          <Button variant="default" size="sm" className="w-full text-xs cursor-pointer shadow-sm">
            Continue Solving
          </Button>
        </Link>
      </div>
    </div>
  );
}

// 3. Today's Goal Card
export function TodayGoalCard({ solvedToday, target }: { solvedToday: number; target: number }) {
  const percent = Math.min(100, Math.ceil((solvedToday / target) * 100));

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <Target className="size-4 text-rose-500" />
          3. Today's Goal
        </Typography>
        <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
          Daily Solves
        </span>
      </div>

      <div className="flex-1 space-y-4 py-2">
        <div className="flex justify-between items-baseline">
          <p className="text-3xl font-light text-foreground">
            {solvedToday} <span className="text-xs font-medium text-muted-foreground">/ {target} solved</span>
          </p>
          <span className="text-xs font-semibold text-muted-foreground">
            {percent}%
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {percent >= 100
            ? "✓ Goal achieved! You are maintaining consistency."
            : "Solve more LeetCode problems to fulfill your consistency target."}
        </p>
      </div>

      <div className="pt-2 text-center">
        <span className="text-[10px] font-medium text-muted-foreground">
          Daily targets resets at midnight
        </span>
      </div>
    </div>
  );
}
