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
  AlertCircle,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ProblemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // States
  const [problem, setProblem] = useState<Problem | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [notesText, setNotesText] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Stats states
  const [timeTaken, setTimeTaken] = useState("38 min");
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customReviewDate, setCustomReviewDate] = useState("");

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

      // Fetch unified progress details from backend
      const progRes = await api.get(`/progress/${id}`);
      const prog = progRes.data.data;
      setProgress(prog);
      
      setIsBookmarked(prog.isBookmarked || false);
      setNotesText(prog.note || "");
      setTimeTaken(prog.timeTaken || "38 min");

      if (prog.srs && prog.srs.nextReviewDate) {
        setRevision(prog.srs);
        const d = new Date(prog.srs.nextReviewDate);
        setCustomReviewDate(d.toISOString().split("T")[0]);
      } else {
        setRevision(null);
        setCustomReviewDate("");
      }
      
      // Setup submissions/progress details to display in history timeline
      setSubmissions(prog.totalAttempts > 0 ? [{
        id: prog.id,
        status: prog.status === "Attempted" ? "Wrong Answer" : "Correct",
        date: prog.updatedAt,
        timeSpentMinutes: prog.timeTaken ? parseInt(prog.timeTaken.replace(" min", "")) : 38,
        confidence: prog.status === "Mastered" ? "High" : "Medium",
        takeaway: prog.note
      }] : []);

    } catch {
      addToast("Failed to fetch problem workspace records.", "error");
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
      addToast("Related notes updated successfully.", "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to save note details.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Bookmark
  const handleBookmarkToggle = async () => {
    try {
      await api.put(`/progress/${id}`, { isBookmarked: !isBookmarked });
      addToast(isBookmarked ? "Problem removed from bookmarks." : "Problem bookmarked.", isBookmarked ? "info" : "success");
      setIsBookmarked(!isBookmarked);
    } catch {
      addToast("Failed to toggle bookmark.", "error");
    }
  };

  // Save Solve Time taken
  const handleSaveTimeTaken = async () => {
    try {
      await api.put(`/progress/${id}`, { timeTaken: timeTaken });
      setIsEditingTime(false);
      addToast("Solved duration stats updated.", "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to update solve duration.", "error");
    }
  };

  // Reschedule revision by days offset
  const handleRescheduleDays = async (days: number) => {
    setSyncing(true);
    try {
      await api.post(`/revisions/${id}/reschedule`, { days });
      addToast(`Revision rescheduled: due in ${days} days.`, "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to reschedule revision.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Set Custom Review Date
  const handleCustomDateChange = async (dateStr: string) => {
    setCustomReviewDate(dateStr);
    if (!dateStr) return;

    setSyncing(true);
    try {
      await api.post(`/revisions/${id}/custom-date`, { date: dateStr });
      addToast(`Revision scheduled for ${new Date(dateStr).toLocaleDateString()}`, "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to schedule custom revision date.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Status Resolver Helper
  const getProblemStatusLabel = () => {
    if (progress) {
      if (revision && revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        if (isDue) return "Needs Revision";
      }
      return progress.status;
    }
    if (submissions.length === 0) return "Not Started";
    const sub = submissions[0];
    if (sub.status === "Wrong Answer") return "Attempted";
    
    if (revision) {
      if (revision.interval >= 15) return "Mastered";
      if (revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        return isDue ? "Needs Revision" : "Revised Once";
      }
      return "Revised Once";
    }
    return "Solved";
  };

  const statusLabel = getProblemStatusLabel();

  // Solved On date calculations
  const getSolvedOnDateStr = () => {
    if (submissions.length === 0 || submissions[0].status === "Wrong Answer") return "-";
    return new Date(submissions[0].date).toLocaleDateString("en-US", { day: "numeric", month: "long" });
  };

  const solvedOnDate = getSolvedOnDateStr();

  // Last Revised date relative label
  const getLastRevisedLabel = () => {
    if (submissions.length === 0 || !revision || revision.repetitions <= 1) return "-";
    const latest = new Date(submissions[0].date);
    const diffTime = Math.abs(Date.now() - latest.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "Yesterday";
    if (diffDays === 0) return "Just now";
    return `${diffDays} days ago`;
  };

  const lastRevisedDate = getLastRevisedLabel();

  // Revision count log
  const getRevisionCount = () => {
    return revision ? revision.repetitions : submissions.filter((s) => s.status === "Correct").length;
  };

  const revisionCount = getRevisionCount();



  // Dynamic layout colors
  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20 border-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20 border-rose-500/20",
  };

  if (loading || !problem) {
    return <PageLoader message="Loading problem workspace..." />;
  }

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
          
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Topic: {problem.topic}</span>
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

      {/* 3. Redesigned Tracking Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column (2/3 width) - Notes & Revision Scheduling */}
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
              placeholder="Document logic patterns, edge cases, and helper details..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="text-xs h-40 leading-relaxed font-sans mt-2"
              disabled={syncing}
            />
          </div>

          {/* Revision Card Scheduler */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Typography variant="title" className="text-foreground flex items-center gap-1.5">
                <Clock className="size-4 text-amber-500" />
                Spaced Revision Scheduler
              </Typography>
              {revision && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                  Due: {new Date(revision.nextReviewDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reschedule your next revision target from the solve date. Preset intervals:
              </p>

              {/* Spaced Interval Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleRescheduleDays(3)}
                  disabled={syncing}
                  className="py-2 px-3 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  3 Days
                </button>
                <button
                  onClick={() => handleRescheduleDays(7)}
                  disabled={syncing}
                  className="py-2 px-3 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleRescheduleDays(30)}
                  disabled={syncing}
                  className="py-2 px-3 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/40 transition-all cursor-pointer"
                >
                  30 Days
                </button>
              </div>

              {/* Custom Date Input */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                  Or select custom revision date:
                </label>
                <input
                  type="date"
                  value={customReviewDate}
                  onChange={(e) => handleCustomDateChange(e.target.value)}
                  disabled={syncing}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Status Updater & Stats Summary */}
        <div className="space-y-6">
          
          {/* Status changer card */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <Typography variant="title" className="text-foreground block">
                Problem Status
              </Typography>
            </div>
            
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-center">
                <span className="text-xs font-semibold text-foreground uppercase block">Current Tracker State</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {statusLabel}
                </span>
              </div>

              {/* Log Attempt & Adjust button */}
              <Button
                onClick={() => setIsStatusOpen(true)}
                className="w-full text-xs font-semibold h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Log Attempt & Adjust Status
              </Button>
            </div>
          </div>

          {/* Statistics Card Summary */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <Typography variant="title" className="text-foreground">
                Solving Metrics
              </Typography>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              
              {/* Stat 1 */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Solved On</span>
                <span className="text-sm font-semibold text-foreground">{solvedOnDate}</span>
              </div>

              {/* Stat 2: Time Taken (editable) */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Time Taken</span>
                {isEditingTime ? (
                  <div className="flex gap-1 items-center mt-0.5">
                    <input
                      type="text"
                      value={timeTaken}
                      onChange={(e) => setTimeTaken(e.target.value)}
                      className="w-16 h-6 border rounded px-1.5 text-xs text-foreground bg-background"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTimeTaken();
                      }}
                    />
                    <button
                      onClick={handleSaveTimeTaken}
                      className="text-[10px] font-semibold text-indigo-500 cursor-pointer"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => setIsEditingTime(true)}
                    className="text-sm font-semibold text-foreground hover:underline cursor-pointer border-b border-dotted border-border"
                    title="Click to edit solved time duration"
                  >
                    {timeTaken}
                  </span>
                )}
              </div>

              {/* Stat 3 */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Revision Count</span>
                <span className="text-sm font-semibold text-foreground">{revisionCount}</span>
              </div>

              {/* Stat 4 */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Last Revised</span>
                <span className="text-sm font-semibold text-foreground">{lastRevisedDate}</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 4. Bottom Panel: High-Impact Revision History Timeline with Center Dotted Border */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
        <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
          Practice & Revision Logs
        </Typography>

        {submissions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No revision milestones logged yet. Select a status of 'Solved' or schedule revisions to record history nodes.
          </p>
        ) : (
          <div className="relative py-8">
            
            {/* Center Dotted Vertical Border Line (Attraction detail) */}
            <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-1/2 w-[1.5px] border-l-2 border-dashed border-border/80" />

            <div className="space-y-8 relative">
              {submissions.map((sub, idx) => {
                const subDate = new Date(sub.date);
                const isLeft = idx % 2 === 0;
                const isCorrect = sub.status === "Correct";

                return (
                  <div key={sub.id || idx} className="relative flex flex-col md:flex-row md:items-center">
                    
                    {/* Center point node indicator */}
                    <div className={cn(
                      "absolute left-4 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 size-4.5 rounded-full border bg-background z-10 flex items-center justify-center shadow-sm",
                      isCorrect ? "border-emerald-500" : "border-amber-500"
                    )}>
                      <div className={cn("size-2 rounded-full", isCorrect ? "bg-emerald-500" : "bg-amber-500")} />
                    </div>

                    {/* Timeline card items */}
                    <div className={cn(
                      "w-full pl-10 md:w-1/2 md:pl-0",
                      isLeft ? "md:pr-10 md:text-right" : "md:pl-10 md:left-1/2"
                    )}>
                      <div className={cn(
                        "p-4 rounded-xl border border-border bg-background/50 inline-block text-left shadow-sm max-w-sm w-full",
                        isLeft ? "md:text-left" : ""
                      )}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {isCorrect ? (
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="size-4 text-amber-500 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-foreground">
                            {isCorrect ? "Attempt Succeeded" : "Practice Attempt Logged"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded ml-auto">
                            #{submissions.length - idx}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {subDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </p>

                        {/* Custom recorded session metrics */}
                        {sub.takeaway ? (
                          <div className="text-[11px] text-foreground leading-relaxed font-sans bg-muted/20 border-l-2 border-indigo-500 pl-2 py-1 px-1.5 rounded mt-2">
                            {sub.takeaway}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border pl-2 bg-muted/20 py-1.5 px-2 rounded-r">
                            Spaced Repetition interval verified locally. Memory decay counters updated.
                          </div>
                        )}

                        <div className="flex gap-2.5 mt-2.5 text-[9px] text-muted-foreground font-semibold">
                          {sub.timeSpentMinutes !== undefined && sub.timeSpentMinutes !== 0 && (
                            <span className="bg-muted/80 px-2 py-0.5 rounded">⏱️ {sub.timeSpentMinutes} mins</span>
                          )}
                          {sub.confidence && (
                            <span className="bg-muted/80 px-2 py-0.5 rounded">🎯 Confidence: {sub.confidence}</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Centralized Status Log Modal */}
      <StatusChangeModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        problemId={problem?.id || null}
        problemTitle={problem?.title || null}
        onStatusUpdated={() => {
          loadProblemDetails(); // reload detail data
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
