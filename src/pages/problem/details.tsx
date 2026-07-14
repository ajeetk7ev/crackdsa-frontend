import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/loader";
import { Select } from "@/components/ui/select";

import {
  ArrowLeft,
  ExternalLink,
  Save,
  Clock,
  Bookmark,
  CheckCircle2,
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
  const [notesText, setNotesText] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Stats states
  const [timeTaken, setTimeTaken] = useState("38 min");
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [customReviewDate, setCustomReviewDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load problem details
  const loadProblemDetails = async () => {
    try {
      const probRes = await api.get(`/problems/${id}`);
      setProblem(probRes.data);

      // Fetch active revisions list
      const revRes = await api.get("/revisions");
      const activeRev = revRes.data.find((r: Revision) => r.problemId === id);
      setRevision(activeRev || null);

      if (activeRev) {
        // Sync custom review date input format (YYYY-MM-DD)
        const d = new Date(activeRev.nextReviewDate);
        setCustomReviewDate(d.toISOString().split("T")[0]);
      }

      // Fetch note
      const noteRes = await api.get(`/notes/${id}`);
      setNotesText(noteRes.data.note || "");

      // Load bookmarks from local storage
      const bookmarks = JSON.parse(localStorage.getItem("crackdsa_bookmarks") || "[]");
      setIsBookmarked(bookmarks.includes(id || ""));

      // Load submissions
      const rawSubs = localStorage.getItem("mock_submissions") || "[]";
      const userSubs = JSON.parse(rawSubs).filter((s: any) => s.problemId === id);
      setSubmissions(userSubs.reverse()); // latest first

      // Load time taken override if saved
      const savedTime = localStorage.getItem(`time_taken_${id}`);
      if (savedTime) setTimeTaken(savedTime);
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
      
      const rawNotes = JSON.parse(localStorage.getItem("mock_notes") || "{}");
      rawNotes[`usr-2_${id}`] = notesText;
      localStorage.setItem("mock_notes", JSON.stringify(rawNotes));

      addToast("Related notes updated successfully.", "success");
    } catch {
      addToast("Failed to save note details.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Bookmark
  const handleBookmarkToggle = () => {
    const bookmarks = JSON.parse(localStorage.getItem("crackdsa_bookmarks") || "[]");
    let updated: string[] = [];

    if (isBookmarked) {
      updated = bookmarks.filter((bId: string) => bId !== id);
      addToast("Problem removed from bookmarks.", "info");
    } else {
      updated = [...bookmarks, id || ""];
      addToast("Problem bookmarked.", "success");
    }

    localStorage.setItem("crackdsa_bookmarks", JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  // Save Solve Time taken
  const handleSaveTimeTaken = () => {
    localStorage.setItem(`time_taken_${id}`, timeTaken);
    setIsEditingTime(false);
    addToast("Solved duration stats updated.", "success");
  };

  // Reschedule revision by days offset
  const handleRescheduleDays = async (days: number) => {
    setSyncing(true);
    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + days);
      const nextDateIso = nextDate.toISOString();

      let revs = JSON.parse(localStorage.getItem("mock_revisions") || "[]");
      const activeIdx = revs.findIndex((r: any) => r.problemId === id);

      if (activeIdx !== -1) {
        revs[activeIdx].nextReviewDate = nextDateIso;
        revs[activeIdx].interval = days;
        revs[activeIdx].status = "todo";
        revs[activeIdx].repetitions = (revs[activeIdx].repetitions || 0) + 1;
      } else {
        revs.push({
          id: `rev-${Math.random().toString(36).substring(2, 9)}`,
          userId: "usr-2",
          problemId: id,
          nextReviewDate: nextDateIso,
          interval: days,
          easeFactor: 2.5,
          repetitions: 1,
          status: "todo",
        });
      }

      localStorage.setItem("mock_revisions", JSON.stringify(revs));
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
      const nextDate = new Date(dateStr);
      const nextDateIso = nextDate.toISOString();

      let revs = JSON.parse(localStorage.getItem("mock_revisions") || "[]");
      const activeIdx = revs.findIndex((r: any) => r.problemId === id);

      if (activeIdx !== -1) {
        revs[activeIdx].nextReviewDate = nextDateIso;
        revs[activeIdx].status = "todo";
      } else {
        revs.push({
          id: `rev-${Math.random().toString(36).substring(2, 9)}`,
          userId: "usr-2",
          problemId: id,
          nextReviewDate: nextDateIso,
          interval: 3,
          easeFactor: 2.5,
          repetitions: 1,
          status: "todo",
        });
      }

      localStorage.setItem("mock_revisions", JSON.stringify(revs));
      addToast(`Revision scheduled for ${new Date(dateStr).toLocaleDateString()}`, "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to schedule custom revision date.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Change Status Handler
  const handleStatusUpdate = async (newStatus: string) => {
    setSyncing(true);
    try {
      let revs = JSON.parse(localStorage.getItem("mock_revisions") || "[]");
      let subs = JSON.parse(localStorage.getItem("mock_submissions") || "[]");
      const todayStr = new Date().toISOString();

      if (newStatus === "Not Started") {
        revs = revs.filter((r: any) => r.problemId !== id);
        subs = subs.filter((s: any) => s.problemId !== id);
      } 
      else if (newStatus === "Attempted") {
        revs = revs.filter((r: any) => r.problemId !== id);
        subs = subs.filter((s: any) => s.problemId !== id);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          status: "Wrong Answer",
          date: todayStr,
        });
      } 
      else if (newStatus === "Solved") {
        subs = subs.filter((s: any) => s.problemId !== id);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          status: "Correct",
          date: todayStr,
        });
        if (!revs.some((r: any) => r.problemId === id)) {
          revs.push({
            id: `rev-${Math.random()}`,
            userId: "usr-2",
            problemId: id,
            nextReviewDate: todayStr,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 1,
            status: "todo",
          });
        }
      } 
      else if (newStatus === "Revised Once") {
        subs = subs.filter((s: any) => s.problemId !== id);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          status: "Correct",
          date: todayStr,
        });
        revs = revs.filter((r: any) => r.problemId !== id);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          nextReviewDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          interval: 3,
          easeFactor: 2.5,
          repetitions: 2,
          status: "todo",
        });
      } 
      else if (newStatus === "Mastered") {
        subs = subs.filter((s: any) => s.problemId !== id);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          status: "Correct",
          date: todayStr,
        });
        revs = revs.filter((r: any) => r.problemId !== id);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId: id,
          nextReviewDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
          interval: 15,
          easeFactor: 2.7,
          repetitions: 4,
          status: "todo",
        });
      }

      localStorage.setItem("mock_revisions", JSON.stringify(revs));
      localStorage.setItem("mock_submissions", JSON.stringify(subs));

      if (["Solved", "Revised Once", "Mastered"].includes(newStatus)) {
        const streaks = JSON.parse(localStorage.getItem("mock_streaks") || "[]");
        const dStr = todayStr.split("T")[0];
        if (!streaks.includes(dStr)) {
          streaks.push(dStr);
          localStorage.setItem("mock_streaks", JSON.stringify(streaks));
        }
      }

      addToast(`Problem status updated to "${newStatus}"`, "success");
      loadProblemDetails();
    } catch {
      addToast("Failed to update status.", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Status Resolver Helper
  const getProblemStatusLabel = () => {
    const hasFailed = submissions.some((s) => s.status !== "Correct");
    const correctSub = submissions.filter((s) => s.status === "Correct");

    if (revision) {
      if (revision.interval >= 15) return "Mastered";
      if (revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        return isDue ? "Needs Revision" : "Revised Once";
      }
      return "Revised Once";
    }

    if (correctSub.length > 0) return "Solved";
    if (hasFailed) return "Attempted";
    return "Not Started";
  };

  const statusLabel = getProblemStatusLabel();

  // Solved On date calculations
  const getSolvedOnDateStr = () => {
    const correctOnes = submissions.filter((s) => s.status === "Correct");
    if (correctOnes.length === 0) return "-";
    const oldest = new Date(correctOnes[correctOnes.length - 1].date);
    return oldest.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  };

  const solvedOnDate = getSolvedOnDateStr();

  // Last Revised date relative label
  const getLastRevisedLabel = () => {
    const correctOnes = submissions.filter((s) => s.status === "Correct");
    if (correctOnes.length <= 1) return "-";
    const latest = new Date(correctOnes[0].date); // latest solve
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

  // Redirect Out to Leetcode
  const handleRedirectToLeetcode = () => {
    if (!problem) return;
    const slug = problem.title.toLowerCase().replace(/ /g, "-");
    const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;
    window.open(leetcodeUrl, "_blank");
    addToast(`Navigating to LeetCode for "${problem.title}"...`, "info");
  };

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
          onClick={handleRedirectToLeetcode}
          variant="default"
          className="h-10 px-5 cursor-pointer shadow-sm flex items-center gap-2"
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

              {/* Quick Changer selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Update Tracker State:
                </label>
                <Select
                  options={[
                    { value: "Not Started", label: "⚪ Not Started" },
                    { value: "Attempted", label: "🟡 Attempted" },
                    { value: "Solved", label: "🟢 Solved" },
                    { value: "Revised Once", label: "🔵 Revised Once" },
                    { value: "Mastered", label: "🟣 Mastered" },
                  ]}
                  value={statusLabel === "Needs Revision" ? "Revised Once" : statusLabel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusUpdate(e.target.value)}
                  disabled={syncing}
                />
              </div>
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
                const isLeft = idx % 2 === 0; // alternate placement

                return (
                  <div key={sub.id || idx} className="relative flex flex-col md:flex-row md:items-center">
                    
                    {/* Center point node indicator */}
                    <div className="absolute left-4 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 size-4.5 rounded-full border bg-background border-indigo-500 z-10 flex items-center justify-center shadow-sm">
                      <div className="size-2 rounded-full bg-indigo-500" />
                    </div>

                    {/* Timeline card items */}
                    <div className={cn(
                      "w-full pl-10 md:w-1/2 md:pl-0",
                      isLeft ? "md:pr-10 md:text-right" : "md:pl-10 md:left-1/2"
                    )}>
                      <div className={cn(
                        "p-4 rounded-xl border border-border bg-background/50 inline-block text-left shadow-sm max-w-sm",
                        isLeft ? "md:text-left" : ""
                      )}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-foreground">Correct Solve Registered</span>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                            #{submissions.length - idx}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {subDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </p>

                        <div className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border pl-2 bg-muted/20 py-1.5 px-2 rounded-r">
                          Spaced Repetition interval verified locally. Memory decay counters updated.
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

    </div>
  );
}
