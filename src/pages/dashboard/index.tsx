import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";

import { WelcomeHeader } from "./components/WelcomeHeader";
import { Pomodoro } from "./components/Pomodoro";
import { TodayRevisionCard, LeetcodeProfileCard, TodayGoalCard } from "./components/TodayActions";
import { LearningProgress } from "./components/LearningProgress";
import { ContestWidget } from "./components/ContestWidget";

import { ExternalLink } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

interface Revision {
  id: string;
  userId: string;
  problemId: string;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: "todo" | "completed";
}

export function DashboardPage() {


  const [problems, setProblems] = useState<Problem[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      const [probRes, revRes, progRes] = await Promise.all([
        api.get("/problems?limit=1000"),
        api.get("/revisions"),
        api.get("/progress")
      ]);
      
      setProblems(probRes.data.data.problems);
      setRevisions(revRes.data.data);
      setProgressList(progRes.data.data);
    } catch (err) {
      addToast("Failed to fetch dashboard updates from database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Open spacing dialog overlay
  const handleReviewSelect = async (probId: string) => {
    setSelectedProblemId(probId);
    setReviewNote("");
    
    // Load existing note if present
    try {
      const res = await api.get(`/notes/${probId}`);
      setReviewNote(res.data.data.note || "");
    } catch {
      setReviewNote("");
    }
  };

  // Close review dialog
  const handleCloseReview = () => {
    setSelectedProblemId(null);
    setReviewNote("");
  };

  // Submit confidence review log (Anki sm2 schedule recalculator)
  const handleConfidenceSubmit = async (level: "again" | "hard" | "good" | "easy") => {
    if (!selectedProblemId) return;
    
    // Find the associated revision card ID
    const associatedRev = revisions.find((r) => r.problemId === selectedProblemId && r.status === "todo");
    if (!associatedRev) {
      addToast("Spaced revision card records not found.", "warning");
      return;
    }

    setIsReviewing(true);
    try {
      // 1. Log confidence ratings
      await api.post(`/revisions/${associatedRev.id}/review`, { confidence: level });
      
      // 2. Save notes
      await api.post(`/notes/${selectedProblemId}`, { note: reviewNote });

      addToast("SM2 Interval database logs updated successfully!", "success");
      handleCloseReview();
      loadDashboardData();
    } catch (err) {
      addToast("Failed to process revision updates.", "error");
    } finally {
      setIsReviewing(false);
    }
  };

  // Quick helper: redirect to target LeetCode
  const handleRedirectToLeetcode = () => {
    if (!selectedProblemId) return;
    const prob = problems.find((p) => p.id === selectedProblemId);
    if (!prob) return;

    // Convert Two Sum -> two-sum for Leetcode URL matching
    const slug = prob.title.toLowerCase().replace(/ /g, "-");
    const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;
    window.open(leetcodeUrl, "_blank");
    addToast(`Launching LeetCode for "${prob.title}"...`, "info");
  };



  // Selected problem representation
  const activeProblem = problems.find((p) => p.id === selectedProblemId);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        {/* Welcome Header Skeleton */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="h-7 w-1/3 rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>

        {/* Today's Action Plan Cards Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-40 rounded bg-muted/60" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-1/2 rounded bg-muted/60" />
                  <div className="h-3 w-3/4 rounded bg-muted/40" />
                </div>
                <div className="h-8 w-full rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </div>

        {/* Consistency Analytics Skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-48 rounded bg-muted/60" />
          <div className="p-6 rounded-xl border border-border bg-card h-64 space-y-4 flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="h-12 w-24 rounded bg-muted/60" />
              <div className="h-12 w-24 rounded bg-muted/60" />
            </div>
            <div className="h-28 w-full rounded bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  const dueRevisions = revisions.filter(
    (r) => new Date(r.nextReviewDate).getTime() <= Date.now()
  );

  const solvedProblemIds = progressList
    .filter((p) => ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status))
    .map((p) => p.problemId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* SECTION 1: WELCOME HEADER */}
      <WelcomeHeader
        dueCount={dueRevisions.length}
        onStartRevisions={() => {
          if (dueRevisions.length > 0) {
            handleReviewSelect(dueRevisions[0].problemId);
          } else {
            addToast("Your revision queue is clean! Try solving a new problem from Problems directory.", "info");
          }
        }}
      />

      {/* SECTION 2: TODAY'S ACTIONS */}
      <div className="space-y-3">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left">
          Today's Action Plan
        </Typography>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TodayRevisionCard
            revisions={dueRevisions}
            problems={problems}
            progressList={progressList}
            onReviewSelect={handleReviewSelect}
            onRevisionStatusChange={loadDashboardData}
          />
          <LeetcodeProfileCard />
           <TodayGoalCard 
             problems={problems} 
             solvedProblemIds={solvedProblemIds} 
             onGoalStatusChange={loadDashboardData} 
           />
          <Pomodoro />
        </div>
      </div>

      {/* SECTION 3: CONTESTS */}
      <div className="space-y-3">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left">
          Contests
        </Typography>
        <ContestWidget />
      </div>

      {/* SECTION 4: LEARNING PROGRESS */}
      <div className="space-y-3">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left">
          Consistency Analytics
        </Typography>
        <LearningProgress />
      </div>



      {/* Spaced Repetition Practice dialog overlay */}
      <Dialog
        isOpen={selectedProblemId !== null}
        onClose={handleCloseReview}
        title="Spaced Repetition Practice"
        description="Solve the problem on LeetCode, write your logic patterns summary, and select confidence."
      >
        {activeProblem && (
          <div className="space-y-5">
            <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                  Category: {activeProblem.topic}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {activeProblem.title}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedirectToLeetcode}
                className="text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                LeetCode <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* Markdown notes box */}
            <div className="space-y-1.5 text-left">
              <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Recall Notes & Logic Patterns
              </Typography>
              <Textarea
                placeholder="Write key logic details here (e.g. 'Use two pointer swap bounds, check guard nodes for empty linked lists...')"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="text-xs h-24"
                disabled={isReviewing}
              />
            </div>

            {/* Confidence controls */}
            <div className="space-y-3 border-t border-border pt-4 text-left">
              <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Log Solving Confidence
              </Typography>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  onClick={() => handleConfidenceSubmit("again")}
                  variant="outline"
                  disabled={isReviewing}
                  className="text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                >
                  Again (1d)
                </Button>
                <Button
                  onClick={() => handleConfidenceSubmit("hard")}
                  variant="outline"
                  disabled={isReviewing}
                  className="text-xs text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
                >
                  Hard (3d)
                </Button>
                <Button
                  onClick={() => handleConfidenceSubmit("good")}
                  variant="outline"
                  disabled={isReviewing}
                  className="text-xs text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer"
                >
                  Good (8d)
                </Button>
                <Button
                  onClick={() => handleConfidenceSubmit("easy")}
                  disabled={isReviewing}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                >
                  Easy (18d)
                </Button>
              </div>
            </div>

            {isReviewing && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Spinner className="size-3" /> Syncing spaced interval database records...
              </div>
            )}
          </div>
        )}
      </Dialog>

    </div>
  );
}
