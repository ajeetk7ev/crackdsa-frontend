import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notification.store";
import { 
  RefreshCw, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  ExternalLink,
  Search,
  Check,
  Award
} from "lucide-react";
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
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left">
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

// 2. LeetCode Profile Card
export function LeetcodeProfileCard() {
  const username = localStorage.getItem("profile_leetcode_username") || "alex_leetcode";

  const handleOpenLeetCodeProfile = () => {
    window.open(`https://leetcode.com/u/${username}/`, "_blank");
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <Award className="size-4 text-amber-500" />
          2. LeetCode Profile
        </Typography>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
          Connected
        </span>
      </div>

      <div className="flex-1 space-y-3 py-1">
        <div className="flex justify-between items-center bg-background/50 border border-border/60 p-2.5 rounded-lg">
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">@{username}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Rank: 124,532</p>
          </div>
          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 font-bold px-2 py-0.5 rounded shrink-0">Active</span>
        </div>

        {/* Mock metrics distribution */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">Easy Solves</span>
              <span className="text-foreground">145 / 820</span>
            </div>
            <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[17%]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-amber-600 dark:text-amber-400">Medium Solves</span>
              <span className="text-foreground">162 / 1640</span>
            </div>
            <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[10%]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-rose-600 dark:text-rose-400">Hard Solves</span>
              <span className="text-foreground">35 / 780</span>
            </div>
            <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[4.5%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenLeetCodeProfile}
          className="w-full text-xs cursor-pointer flex items-center justify-center gap-1"
        >
          View Profile Page
          <ExternalLink className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// 3. Redesigned Today's Goal Card
export function TodayGoalCard({ problems, submissions }: { problems: ProblemItem[]; submissions: any[] }) {
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Load goals from local storage
  useEffect(() => {
    const saved = localStorage.getItem("today_goal_problems");
    if (saved) {
      setGoalIds(JSON.parse(saved));
    }
  }, []);

  const saveGoals = (ids: string[]) => {
    localStorage.setItem("today_goal_problems", JSON.stringify(ids));
    setGoalIds(ids);
  };

  const clearGoals = () => {
    localStorage.removeItem("today_goal_problems");
    setGoalIds([]);
    addToast("Today's goals cleared.", "info");
  };

  // Determine if a problem ID is solved
  const isProblemSolved = (probId: string) => {
    return submissions.some((s) => s.problemId === probId && s.status === "Correct");
  };

  // Resolve problem metadata
  const getProblemDetails = (probId: string) => {
    return problems.find((p) => p.id === probId);
  };

  // Filter problems for target selection
  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleProblemSelection = (probId: string) => {
    if (goalIds.includes(probId)) {
      saveGoals(goalIds.filter((id) => id !== probId));
    } else {
      if (goalIds.length >= 8) {
        addToast("We recommend focusing on up to 8 goals per day to prevent burn out.", "warning");
        return;
      }
      saveGoals([...goalIds, probId]);
    }
  };

  const handleRedirectToLeetcode = (probTitle: string) => {
    const slug = probTitle.toLowerCase().replace(/ /g, "-");
    window.open(`https://leetcode.com/problems/${slug}/`, "_blank");
    addToast(`Redirecting to LeetCode for "${probTitle}"...`, "info");
  };

  const solvedCount = goalIds.filter(isProblemSolved).length;
  const totalCount = goalIds.length;

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left relative">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <Target className="size-4 text-rose-500" />
          3. Today's Goal
        </Typography>
        <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
          {goalIds.length > 0 ? `${solvedCount} / ${totalCount} Solved` : "Daily Targets"}
        </span>
      </div>

      {/* Card Body content */}
      <div className="flex-1 flex flex-col justify-center">
        {goalIds.length === 0 ? (
          /* State A: No Goal Set */
          <div className="py-6 text-center space-y-3">
            <Typography variant="muted" className="text-xs block leading-relaxed px-2">
              No target problems set for today. Choose up to 4 high-yield goals.
            </Typography>
            <Button
              onClick={() => setIsSetOpen(true)}
              variant="default"
              size="sm"
              className="mx-auto cursor-pointer shadow-sm text-xs font-semibold"
            >
              Set Today's Goal
            </Button>
          </div>
        ) : (
          /* State B: Goals Checklist */
          <div className="space-y-2 mt-1">
            {/* Checklist of first 4 items styled same as Today's Revision */}
            {goalIds.slice(0, 4).map((id) => {
              const prob = getProblemDetails(id);
              if (!prob) return null;
              const solved = isProblemSolved(id);
              const diff = (prob.difficulty || "Easy") as "Easy" | "Medium" | "Hard";
              
              const difficultyColors = {
                Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
                Hard: "text-rose-600 bg-rose-500/10 border-rose-500/20",
              };

              return (
                <div 
                  key={id}
                  onClick={() => handleRedirectToLeetcode(prob.title)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border hover:border-border-hover hover:bg-muted/30 transition-all cursor-pointer group"
                  title="Solve on LeetCode"
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "text-xs font-semibold text-foreground truncate group-hover:text-primary-hover transition-colors",
                      solved ? "line-through text-muted-foreground font-normal" : ""
                    )}>
                      {prob.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className={cn(
                      "text-[9px] font-semibold border rounded-full px-2 py-0.5",
                      difficultyColors[diff]
                    )}>
                      {diff}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase tracking-wide",
                      solved 
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                        : "text-muted-foreground bg-muted border-border"
                    )}>
                      {solved ? "Done" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}

            {goalIds.length > 4 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1 font-medium">
                + {goalIds.length - 4} more goal problems
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer controls */}
      {goalIds.length > 0 && (
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => setIsViewAllOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs cursor-pointer"
          >
            View All
          </Button>
          <Button
            onClick={clearGoals}
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border border-dashed cursor-pointer"
          >
            Reset Goals
          </Button>
        </div>
      )}

      {/* MODAL 1: SET PROBLEMS GOALS LIST */}
      <Dialog
        isOpen={isSetOpen}
        onClose={() => setIsSetOpen(false)}
        title="Set Today's Goals"
        description="Select high-yield problems from your curated DSA sheet to tackle today."
      >
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search problem title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-lg"
            />
          </div>

          {/* List of problems */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border rounded-lg p-2 bg-background-secondary/20">
            {filteredProblems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No matching problems found.</p>
            ) : (
              filteredProblems.map((p) => {
                const isSelected = goalIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProblemSelection(p.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all",
                      isSelected 
                        ? "border-rose-500 bg-rose-500/5 text-foreground" 
                        : "border-border/60 hover:border-border hover:bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{p.topic} • {p.difficulty}</p>
                    </div>

                    <div className={cn(
                      "size-4 rounded border flex items-center justify-center",
                      isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-border"
                    )}>
                      {isSelected && <Check className="size-3" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3">
            <span>{goalIds.length} goals selected</span>
            <Button
              onClick={() => setIsSetOpen(false)}
              size="sm"
              className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL 2: VIEW ALL GOALS LIST */}
      <Dialog
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        title="Today's Target List"
        description="Inspect details of all chosen goal problems and launch coding sandboxes."
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {goalIds.map((id) => {
              const prob = getProblemDetails(id);
              if (!prob) return null;
              const solved = isProblemSolved(id);

              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background"
                >
                  <div className="text-left min-w-0 flex-1 mr-3">
                    <button
                      onClick={() => handleRedirectToLeetcode(prob.title)}
                      className={cn(
                        "font-semibold text-xs cursor-pointer text-foreground hover:underline text-left block truncate",
                        solved ? "line-through text-muted-foreground font-normal" : ""
                      )}
                    >
                      {prob.title} <ExternalLink className="size-2.5 inline text-muted-foreground ml-1" />
                    </button>
                    <span className="text-[9px] text-muted-foreground font-mono">{prob.topic} • {prob.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProblemSelection(id)}
                      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors px-1 cursor-pointer"
                      title="Remove from goals"
                    >
                      Remove
                    </button>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded",
                      solved ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground bg-muted"
                    )}>
                      {solved ? "Mastered" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3">
            <Button
              onClick={() => {
                setIsViewAllOpen(false);
                setIsSetOpen(true);
              }}
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
            >
              Add/Edit Goals
            </Button>
            <Button
              onClick={() => setIsViewAllOpen(false)}
              size="sm"
              className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

