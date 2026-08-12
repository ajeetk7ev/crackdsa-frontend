import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "./components/TimerDisplay";
import { ProblemRow } from "./components/ProblemRow";
import { SubmitConfirmModal } from "./components/SubmitConfirmModal";
import { TimeUpModal } from "./components/TimeUpModal";
import { ArrowLeft, Send } from "lucide-react";

interface ProblemResult {
  problem: string;
  status: string;
  timeTaken: number;
  pointsEarned: number;
}

export function MockTestActivePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);
  const hasStartedRef = useRef(false);

  const [mockTest, setMockTest] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [problemResults, setProblemResults] = useState<ProblemResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [timeUpScore, setTimeUpScore] = useState({ score: 0, totalPoints: 0 });

  const startTest = useCallback(async () => {
    try {
      const res = await api.post(`/mock-tests/${id}/start`);
      const data = res.data.data;
      setMockTest(data.mockTest);
      setAttempt(data.attempt);

      // Initialize problem results from attempt
      const results = data.attempt.problemResults?.map((pr: any) => ({
        problem: pr.problem.toString(),
        status: pr.status || "not_started",
        timeTaken: pr.timeTaken || 0,
        pointsEarned: pr.pointsEarned || 0,
      })) || data.mockTest.problems.map((p: any) => ({
        problem: p.problem._id || p.problem,
        status: "not_started",
        timeTaken: 0,
        pointsEarned: 0,
      }));

      setProblemResults(results);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to start mock test.";
      addToast(msg, "error");
      if (msg.includes("already completed")) {
        navigate(`/mock-tests/${id}/result`);
      } else {
        navigate("/mock-tests");
      }
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTest();
    }

    // Warn before leaving
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [startTest]);

  const updateProblemStatus = (problemId: string, status: string) => {
    setProblemResults((prev) =>
      prev.map((pr) =>
        pr.problem === problemId ? { ...pr, status } : pr
      )
    );
  };

  const updateProblemTime = (problemId: string, timeTaken: number) => {
    setProblemResults((prev) =>
      prev.map((pr) =>
        pr.problem === problemId ? { ...pr, timeTaken } : pr
      )
    );
  };

  const calculateScore = () => {
    if (!mockTest) return { score: 0, totalPoints: 0, solvedCount: 0 };

    let score = 0;
    let solvedCount = 0;
    const pointsMap: Record<string, number> = {};
    mockTest.problems.forEach((p: any) => {
      const pid = (p.problem._id || p.problem).toString();
      pointsMap[pid] = p.points;
    });

    problemResults.forEach((pr) => {
      if (pr.status === "solved") {
        score += pointsMap[pr.problem] || 0;
        solvedCount++;
      }
    });

    return { score, totalPoints: mockTest.totalPoints, solvedCount };
  };

  const handleSubmit = async (timedOut = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/mock-tests/${id}/submit`, {
        problemResults: problemResults.map((pr) => ({
          problem: pr.problem,
          status: pr.status,
          timeTaken: pr.timeTaken,
        })),
        timedOut,
      });

      if (timedOut) {
        const attempt = res.data.data;
        setTimeUpScore({ score: attempt.score, totalPoints: attempt.totalPoints });
        setShowTimeUpModal(true);
      } else {
        addToast("Mock test submitted successfully!", "success");
        navigate(`/mock-tests/${id}/result`);
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to submit.", "error");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit(true);
  };

  if (loading || !mockTest || !attempt) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="p-6 rounded-xl border border-border bg-card h-16" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card h-24" />
          ))}
        </div>
      </div>
    );
  }

  const { score, totalPoints, solvedCount } = calculateScore();
  const totalProblems = mockTest.problems.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm pb-4 space-y-3 border-b border-border -mx-6 px-6 -mt-6 pt-6 md:-mx-10 md:px-10 md:-mt-8 md:pt-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/mock-tests")}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4 text-muted-foreground" />
            </button>
            <div>
              <Typography variant="h3" className="font-bold text-foreground text-base">
                {mockTest.title}
              </Typography>
              <p className="text-[10px] text-muted-foreground">
                {solvedCount}/{totalProblems} solved · {score}/{totalPoints} points
              </p>
            </div>
          </div>

          <TimerDisplay
            totalSeconds={mockTest.durationMinutes * 60}
            startedAt={attempt.startedAt}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {mockTest.problems.map((p: any, index: number) => {
          const problem = p.problem;
          const problemId = (problem._id || problem).toString();
          const result = problemResults.find((pr) => pr.problem === problemId);

          return (
            <ProblemRow
              key={problemId}
              index={index + 1}
              problem={problem}
              points={p.points}
              status={result?.status || "not_started"}
              timeTaken={result?.timeTaken || 0}
              onStatusChange={(status) => updateProblemStatus(problemId, status)}
              onTimeChange={(time) => updateProblemTime(problemId, time)}
              disabled={submitting}
            />
          );
        })}
      </div>

      {/* Submit Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-4 pb-2 border-t border-border -mx-6 px-6 md:-mx-10 md:px-10 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">/{totalPoints} points</span>
        </div>
        <Button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="size-3.5" />
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>

      {/* Modals */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={() => handleSubmit(false)}
        solvedCount={solvedCount}
        totalCount={totalProblems}
        score={score}
        totalPoints={totalPoints}
      />

      <TimeUpModal
        isOpen={showTimeUpModal}
        onClose={() => navigate(`/mock-tests/${id}/result`)}
        onViewResult={() => navigate(`/mock-tests/${id}/result`)}
        score={timeUpScore.score}
        totalPoints={timeUpScore.totalPoints}
      />
    </div>
  );
}
