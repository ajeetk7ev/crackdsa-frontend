import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/loader";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";

import {
  ArrowLeft,
  ExternalLink,
  Save,
  Clock,
  Bookmark,
  CheckCircle2,
  Circle,
  FileText,
  TrendingUp,
  Calendar,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

export function ProblemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // States
  const [problem, setProblem] = useState<Problem | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [notesText, setNotesText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Stats states
  const [timeTaken, setTimeTaken] = useState("");
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [_, setCustomReviewDate] = useState("");

  // Modals state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load problem details
  const loadProblemDetails = async () => {
    try {
      const probRes = await api.get(`/problems/${id}`);
      setProblem(probRes.data.data);

      const progRes = await api.get(`/progress/${id}`);
      const prog = progRes.data.data;
      setProgress(prog);

      setIsBookmarked(prog.isBookmarked || false);
      setNotesText(prog.note || "");
      setTimeTaken(prog.timeTaken || "");

      if (prog.srs && prog.srs.nextReviewDate) {
        const d = new Date(prog.srs.nextReviewDate);
        setCustomReviewDate(d.toISOString().split("T")[0]);
      } else {
        setCustomReviewDate("");
      }
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to fetch problem workspace records.", "error");
      navigate("/problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProblemDetails();
  }, [id]);

  // Save Notes
  const handleSaveNotes = async () => {
    setSyncing(true);
    try {
      await api.post(`/notes/${id}`, { note: notesText });
      addToast("Notes updated successfully.", "success");
      loadProblemDetails();
    } catch(err:any) {
      addToast(err?.response?.data?.message || "Failed to save note details.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Bookmark
  const handleBookmarkToggle = async () => {
    try {
      await api.put(`/progress/${id}`, { isBookmarked: !isBookmarked });
      addToast(isBookmarked ? "Bookmark removed." : "Problem bookmarked.", isBookmarked ? "info" : "success");
      setIsBookmarked(!isBookmarked);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to toggle bookmark.", "error");
    }
  };

  // Save Solve Time
  const handleSaveTimeTaken = async () => {
    try {
      await api.put(`/progress/${id}`, { timeTaken });
      setIsEditingTime(false);
      addToast("Solve time updated.", "success");
      loadProblemDetails();
    } catch(err:any) {
      addToast(err?.response?.data?.message || "Failed to update solve time.", "error");
    }
  };



  // Dynamic colors
  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20 border-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20 border-rose-500/20",
  };

  // Status label
  const statusLabel = progress?.status || "Not Started";

  // Format date helper
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateShort = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build the revision timeline milestones
  const buildTimeline = () => {
    const srs = progress?.srs;
    const status = progress?.status;

    // Milestone definitions
    const milestones = [
      {
        label: "Solved",
        key: "solved",
        date: progress?.lastSolved && ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(status) ? progress.lastSolved : null,
        isCompleted: ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(status),
        isActive: status === "Solved",
      },
      {
        label: "Revision 1",
        key: "r1",
        date: srs?.firstRevisionDate || null,
        isCompleted: ["Revised Once", "Revised Twice", "Mastered"].includes(status),
        isActive: status === "Solved" && srs?.firstRevisionDate,
        isLocked: !srs?.firstRevisionDate,
      },
      {
        label: "Revision 2",
        key: "r2",
        date: srs?.secondRevisionDate || null,
        isCompleted: ["Revised Twice", "Mastered"].includes(status),
        isActive: status === "Revised Once" && srs?.secondRevisionDate,
        isLocked: !srs?.secondRevisionDate,
      },
      {
        label: "Mastered",
        key: "r3",
        date: srs?.thirdRevisionDate || null,
        isCompleted: status === "Mastered",
        isActive: status === "Revised Twice" && srs?.thirdRevisionDate,
        isLocked: !srs?.thirdRevisionDate,
      },
    ];

    return milestones;
  };

  const timeline = buildTimeline();

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started": return "text-zinc-500";
      case "Attempted": return "text-amber-500";
      case "Solved": return "text-blue-500";
      case "Revised Once": return "text-indigo-500";
      case "Revised Twice": return "text-violet-500";
      case "Mastered": return "text-emerald-500";
      case "Needs Revision": return "text-orange-500";
      default: return "text-muted-foreground";
    }
  };

  if (loading || !problem) {
    return <PageLoader message="Loading problem workspace..." />;
  }

  const hasSRS = progress?.srs && ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(statusLabel);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">

      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/problems"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Problem Explorer
        </Link>

        <button
          onClick={handleBookmarkToggle}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer shadow-sm"
          title={isBookmarked ? "Remove bookmark" : "Bookmark problem"}
        >
          <Bookmark className={cn("size-4", isBookmarked ? "text-amber-500 fill-amber-500" : "")} />
        </button>
      </div>

      {/* 2. Headline Title Box */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-xl border border-border bg-card shadow-sm gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Typography variant="h1" className="font-semibold text-foreground">
              {problem.title}
            </Typography>
            <span className={cn("text-xs font-semibold rounded-full border px-2.5 py-0.5", difficultyColors[problem.difficulty])}>
              {problem.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-muted-foreground font-medium">Topic: {problem.topic}</span>
            <span className="text-muted-foreground">•</span>
            <span className={cn("font-semibold", getStatusColor(statusLabel))}>{statusLabel}</span>
          </div>
        </div>

        <Button
          onClick={() => setIsPomodoroOpen(true)}
          variant="default"
          className="h-10 px-5 cursor-pointer shadow-sm flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Practice on LeetCode
          <ExternalLink className="size-4" />
        </Button>
      </div>

      {/* 3. Revision Journey Timeline (horizontal circles + dotted line) */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="text-foreground flex items-center gap-1.5">
            <Calendar className="size-4 text-indigo-500" />
            Revision Journey
          </Typography>
          {progress?.srs?.nextReviewDate && statusLabel !== "Mastered" && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase">
              Next Due: {formatDateShort(progress.srs.nextReviewDate)}
            </span>
          )}
          {statusLabel === "Mastered" && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
              ✓ Mastered
            </span>
          )}
        </div>

        {!hasSRS ? (
          <div className="text-center py-8 space-y-2">
            <Circle className="size-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground">
              Mark this problem as <span className="font-semibold text-foreground">Solved</span> to activate the revision schedule.
            </p>
          </div>
        ) : (
          <div className="py-6 px-2">
            {/* Horizontal timeline */}
            <div className="flex items-center justify-between relative">
              {timeline.map((milestone, idx) => {
                const isLast = idx === timeline.length - 1;

                return (
                  <div key={milestone.key} className="flex items-center flex-1 last:flex-none">
                    {/* Circle node */}
                    <div className="flex flex-col items-center relative z-10">
                      {/* The circle */}
                      <div
                        className={cn(
                          "size-11 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                          milestone.isCompleted
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : milestone.isActive
                              ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 animate-pulse"
                              : "bg-muted/40 border-border text-muted-foreground"
                        )}
                      >
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="size-5" />
                        ) : milestone.isLocked ? (
                          <Lock className="size-4" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </div>

                      {/* Label below circle */}
                      <span
                        className={cn(
                          "text-[10px] font-bold mt-2 text-center whitespace-nowrap",
                          milestone.isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : milestone.isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-muted-foreground"
                        )}
                      >
                        {milestone.label}
                      </span>

                      {/* Date below label */}
                      <span className="text-[9px] text-muted-foreground mt-0.5 text-center">
                        {milestone.date ? formatDateShort(milestone.date) : "Not scheduled"}
                      </span>
                    </div>

                    {/* Dotted connecting line */}
                    {!isLast && (
                      <div className="flex-1 mx-2 relative h-[2px]">
                        <div
                          className={cn(
                            "absolute top-0 left-0 right-0 h-[2px] border-t-2 border-dashed",
                            // All milestones up to this point completed? Green line
                            milestone.isCompleted
                              ? "border-emerald-500/40"
                              : "border-border"
                          )}
                          style={{ marginTop: "-22px" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick reschedule controls (only show if SRS is active) */}
        {/* {hasSRS && statusLabel !== "Mastered" && (
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Reschedule Next Revision
            </p>
            <div className="flex flex-wrap gap-2">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleRescheduleDays(days)}
                  disabled={syncing}
                  className="py-1.5 px-3.5 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  +{days}d
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="date"
                  value={customReviewDate}
                  onChange={(e) => handleCustomDateChange(e.target.value)}
                  disabled={syncing}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                />
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Left Column (2/3) - Notes */}
        <div className="md:col-span-2 space-y-6">

          {/* Related Notes Card */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Typography variant="title" className="text-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-indigo-500" />
                Related Notes
              </Typography>
              <Button
                onClick={handleSaveNotes}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="h-7 text-xs border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 cursor-pointer"
              >
                <Save className="size-3.5 mr-1" /> Save Notes
              </Button>
            </div>

            <Textarea
              placeholder="Document logic patterns, edge cases, and key observations..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="text-xs h-40 leading-relaxed font-sans mt-2"
              disabled={syncing}
            />
          </div>
        </div>

        {/* Right Column (1/3) - Status & Metrics */}
        <div className="space-y-6">

          {/* Status changer card */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <Typography variant="title" className="text-foreground block">
                Problem Status
              </Typography>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Current State</span>
                <span className={cn("text-sm font-bold mt-1 block", getStatusColor(statusLabel))}>
                  {statusLabel}
                </span>
              </div>

              <Button
                onClick={() => setIsStatusOpen(true)}
                className="w-full text-xs font-semibold h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Log Attempt & Adjust Status
              </Button>
            </div>
          </div>

          {/* Solving Metrics Card */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <Typography variant="title" className="text-foreground">
                Solving Metrics
              </Typography>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 py-1">
              {/* Solved On */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Solved On</span>
                <span className="text-sm font-semibold text-foreground">
                  {progress?.lastSolved && ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(statusLabel)
                    ? formatDateShort(progress.lastSolved)
                    : "—"}
                </span>
              </div>

              {/* Time Taken */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Time Taken</span>
                {isEditingTime ? (
                  <div className="flex gap-1 items-center mt-0.5">
                    <input
                      type="text"
                      value={timeTaken}
                      onChange={(e) => setTimeTaken(e.target.value)}
                      placeholder="e.g. 25 min"
                      className="w-16 h-6 border rounded px-1.5 text-xs text-foreground bg-background"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTimeTaken();
                      }}
                    />
                    <button onClick={handleSaveTimeTaken} className="text-[10px] font-semibold text-indigo-500 cursor-pointer">✓</button>
                  </div>
                ) : (
                  <span
                    onClick={() => setIsEditingTime(true)}
                    className="text-sm font-semibold text-foreground hover:underline cursor-pointer border-b border-dotted border-border"
                    title="Click to edit"
                  >
                    {timeTaken || "—"}
                  </span>
                )}
              </div>

              {/* Revisions Done */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Revisions</span>
                <span className="text-sm font-semibold text-foreground">
                  {progress?.srs?.repetitions ? Math.max(0, progress.srs.repetitions - 1) : 0}
                </span>
              </div>

              {/* Total Attempts */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Attempts</span>
                <span className="text-sm font-semibold text-foreground">
                  {progress?.totalAttempts || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Revision Schedule Details Card (visible only when SRS is active) */}
      {hasSRS && (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <Typography variant="title" className="text-foreground border-b border-border pb-3 flex items-center gap-1.5">
            <Clock className="size-4 text-amber-500" />
            Revision Schedule Details
          </Typography>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* R1 */}
            <div className={cn(
              "p-4 rounded-xl border space-y-2 transition-all",
              ["Revised Once", "Revised Twice", "Mastered"].includes(statusLabel)
                ? "border-emerald-500/30 bg-emerald-500/5"
                : statusLabel === "Solved" && progress?.srs?.firstRevisionDate
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-border bg-muted/20"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">R1 — First Revision</span>
                {["Revised Once", "Revised Twice", "Mastered"].includes(statusLabel) ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatDate(progress?.srs?.firstRevisionDate) || "Not scheduled"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {["Revised Once", "Revised Twice", "Mastered"].includes(statusLabel)
                  ? "✓ Completed"
                  : progress?.srs?.firstRevisionDate
                    ? new Date(progress.srs.firstRevisionDate) <= new Date() ? "⏰ Due now" : "⏳ Upcoming"
                    : "—"}
              </p>
            </div>

            {/* R2 */}
            <div className={cn(
              "p-4 rounded-xl border space-y-2 transition-all",
              ["Revised Twice", "Mastered"].includes(statusLabel)
                ? "border-emerald-500/30 bg-emerald-500/5"
                : statusLabel === "Revised Once" && progress?.srs?.secondRevisionDate
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-border bg-muted/20"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">R2 — Second Revision</span>
                {["Revised Twice", "Mastered"].includes(statusLabel) ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatDate(progress?.srs?.secondRevisionDate) || "Not scheduled"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {["Revised Twice", "Mastered"].includes(statusLabel)
                  ? "✓ Completed"
                  : progress?.srs?.secondRevisionDate
                    ? new Date(progress.srs.secondRevisionDate) <= new Date() ? "⏰ Due now" : "⏳ Upcoming"
                    : "—"}
              </p>
            </div>

            {/* R3 */}
            <div className={cn(
              "p-4 rounded-xl border space-y-2 transition-all",
              statusLabel === "Mastered"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : statusLabel === "Revised Twice" && progress?.srs?.thirdRevisionDate
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-border bg-muted/20"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">R3 — Mastery Check</span>
                {statusLabel === "Mastered" ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatDate(progress?.srs?.thirdRevisionDate) || "Not scheduled"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {statusLabel === "Mastered"
                  ? "✓ Completed — Problem mastered! 👑"
                  : progress?.srs?.thirdRevisionDate
                    ? new Date(progress.srs.thirdRevisionDate) <= new Date() ? "⏰ Due now" : "⏳ Upcoming"
                    : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Centralized Status Log Modal */}
      <StatusChangeModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        problemId={problem?.id || null}
        problemTitle={problem?.title || null}
        onStatusUpdated={() => {
          loadProblemDetails();
        }}
      />

      {/* Pomodoro Prompt Modal */}
      <PomodoroPromptModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        problemId={problem?.id || null}
        problemTitle={problem?.title || null}
        difficulty={problem?.difficulty || ""}
        leetcodeUrl={problem ? `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/ /g, "-")}/` : ""}
      />

    </div>
  );
}
