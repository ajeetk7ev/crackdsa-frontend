import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner, TableSkeleton } from "@/components/ui/loader";

import { WelcomeHeader } from "./components/WelcomeHeader";
import { Pomodoro } from "./components/Pomodoro";
import { TodayRevisionCard, ContinueLearningCard, TodayGoalCard } from "./components/TodayActions";
import { LearningProgress } from "./components/LearningProgress";
import { Insights } from "./components/Insights";

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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      const probRes = await api.get("/problems");
      const revRes = await api.get("/revisions");
      
      // Load database variables from localStorage for dashboard components
      const rawSub = localStorage.getItem("mock_submissions") || "[]";
      const rawStreaks = localStorage.getItem("mock_streaks") || "[]";
      const rawNotes = localStorage.getItem("mock_notes") || "{}";

      setProblems(probRes.data);
      setRevisions(revRes.data);
      setSubmissions(JSON.parse(rawSub));
      setStreaks(JSON.parse(rawStreaks));
      setNotes(JSON.parse(rawNotes));
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
      setReviewNote(res.data.note || "");
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

      // 3. Log a correct solve attempt in submissions
      const subs = JSON.parse(localStorage.getItem("mock_submissions") || "[]");
      const newSub = {
        id: Math.random().toString(36).substring(2, 9),
        userId: associatedRev.userId,
        problemId: selectedProblemId,
        status: "Correct",
        date: new Date().toISOString(),
      };
      localStorage.setItem("mock_submissions", JSON.stringify([...subs, newSub]));

      // 4. Update streaks dates
      const streakLogs = JSON.parse(localStorage.getItem("mock_streaks") || "[]");
      const dateStr = new Date().toISOString().split("T")[0];
      if (!streakLogs.includes(dateStr)) {
        streakLogs.push(dateStr);
        localStorage.setItem("mock_streaks", JSON.stringify(streakLogs));
      }

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

  // Solve count today calculation
  const getSolvedCountToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    return submissions.filter(
      (s) => s.status === "Correct" && s.date.startsWith(todayStr)
    ).length;
  };

  const solvedToday = getSolvedCountToday();

  // Selected problem representation
  const activeProblem = problems.find((p) => p.id === selectedProblemId);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded bg-muted/60" />
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* SECTION 1: WELCOME HEADER */}
      <WelcomeHeader
        dueCount={revisions.length}
        onStartRevisions={() => {
          if (revisions.length > 0) {
            handleReviewSelect(revisions[0].problemId);
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
            revisions={revisions}
            problems={problems}
            onReviewSelect={handleReviewSelect}
          />
          <ContinueLearningCard problems={problems} />
          <TodayGoalCard solvedToday={solvedToday} target={2} />
          <Pomodoro />
        </div>
      </div>

      {/* SECTION 3: LEARNING PROGRESS */}
      <div className="space-y-3">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left">
          Consistency Analytics
        </Typography>
        <LearningProgress
          solvedCount={submissions.filter((s) => s.status === "Correct").length}
          totalCount={problems.length}
          streaks={streaks}
        />
      </div>

      {/* SECTION 4: INSIGHTS (Below Fold) */}
      <div className="space-y-3">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left">
          Study Log Insights
        </Typography>
        <Insights
          submissions={submissions}
          revisions={revisions}
          problems={problems}
          notes={notes}
        />
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
