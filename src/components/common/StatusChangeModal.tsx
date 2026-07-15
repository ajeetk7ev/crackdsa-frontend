import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePomodoroStore } from "@/stores/pomodoro.store";
import { useNotificationStore } from "@/stores/notification.store";
import { api } from "@/lib/axios";
import { Clock, Check, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string | null;
  problemTitle: string | null;
  onStatusUpdated: (newStatus: string) => void;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  onStatusUpdated,
}: StatusChangeModalProps) {
  const addToast = useNotificationStore((state) => state.addToast);
  const pomodoroStore = usePomodoroStore();

  const [selectedStatus, setSelectedStatus] = useState<string>("Solved");
  const [timeSpent, setTimeSpent] = useState<string>("0");
  const [confidence, setConfidence] = useState<"Low" | "Medium" | "High">("Medium");
  const [attempts, setAttempts] = useState<number>(1);
  const [takeaway, setTakeaway] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && problemId) {
      const subs = JSON.parse(localStorage.getItem("mock_submissions") || "[]");
      const notes = JSON.parse(localStorage.getItem("mock_notes") || "{}");
      
      const probSubs = subs.filter((s: any) => s.problemId === problemId);
      setAttempts(probSubs.length + 1);

      const noteKey = `usr-2_${problemId}`;
      setTakeaway(notes[noteKey] || "");

      // Check if there was an active Pomodoro timer for this specific problem
      if (pomodoroStore.activeProblemId === problemId) {
        const elapsedSecs = pomodoroStore.totalDuration - pomodoroStore.timeLeft;
        const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));
        setTimeSpent(String(elapsedMins));
        
        // Auto-pause timer when logging stats
        if (pomodoroStore.isActive) {
          pomodoroStore.pauseTimer();
          addToast("Active Pomodoro timer paused during status logging.", "info");
        }
      } else {
        setTimeSpent("0");
      }
    }
  }, [isOpen, problemId]);

  const handleSubmit = async () => {
    if (!problemId) return;
    setSubmitting(true);

    try {
      let revs = JSON.parse(localStorage.getItem("mock_revisions") || "[]");
      let subs = JSON.parse(localStorage.getItem("mock_submissions") || "[]");
      const todayStr = new Date().toISOString();

      // Track attempt duration, confidence, and mistakes inside submission record
      const submissionStatus = (selectedStatus === "Attempted") ? "Wrong Answer" : "Correct";

      if (selectedStatus === "Not Started") {
        revs = revs.filter((r: any) => r.problemId !== problemId);
        subs = subs.filter((s: any) => s.problemId !== problemId);
      } 
      else if (selectedStatus === "Attempted") {
        revs = revs.filter((r: any) => r.problemId !== problemId);
        subs = subs.filter((s: any) => s.problemId !== problemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId,
          status: submissionStatus,
          date: todayStr,
          timeSpentMinutes: Number(timeSpent),
          confidence,
          takeaway,
        });
      } 
      else if (selectedStatus === "Solved") {
        subs = subs.filter((s: any) => s.problemId !== problemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId,
          status: submissionStatus,
          date: todayStr,
          timeSpentMinutes: Number(timeSpent),
          confidence,
          takeaway,
        });
        if (!revs.some((r: any) => r.problemId === problemId)) {
          revs.push({
            id: `rev-${Math.random()}`,
            userId: "usr-2",
            problemId,
            nextReviewDate: todayStr,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 1,
            status: "todo",
          });
        }
      } 
      else if (selectedStatus === "Revised Once") {
        subs = subs.filter((s: any) => s.problemId !== problemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId,
          status: submissionStatus,
          date: todayStr,
          timeSpentMinutes: Number(timeSpent),
          confidence,
          takeaway,
        });
        revs = revs.filter((r: any) => r.problemId !== problemId);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId,
          nextReviewDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          interval: 3,
          easeFactor: 2.5,
          repetitions: 2,
          status: "todo",
        });
      } 
      else if (selectedStatus === "Mastered") {
        subs = subs.filter((s: any) => s.problemId !== problemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId,
          status: submissionStatus,
          date: todayStr,
          timeSpentMinutes: Number(timeSpent),
          confidence,
          takeaway,
        });
        revs = revs.filter((r: any) => r.problemId !== problemId);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId,
          nextReviewDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
          interval: 15,
          easeFactor: 2.7,
          repetitions: 4,
          status: "todo",
        });
      }

      // Save to localStorage
      localStorage.setItem("mock_revisions", JSON.stringify(revs));
      localStorage.setItem("mock_submissions", JSON.stringify(subs));

      // Save takeaway notes to general notes database
      if (takeaway.trim()) {
        const rawNotes = JSON.parse(localStorage.getItem("mock_notes") || "{}");
        rawNotes[`usr-2_${problemId}`] = takeaway;
        localStorage.setItem("mock_notes", JSON.stringify(rawNotes));
        
        // Call backend API if possible
        try {
          await api.post(`/notes/${problemId}`, { note: takeaway });
        } catch {
          // ignore offline backend saves
        }
      }

      // Stop Pomodoro if this problem is complete
      if (pomodoroStore.activeProblemId === problemId && (selectedStatus === "Solved" || selectedStatus === "Revised Once" || selectedStatus === "Mastered")) {
        pomodoroStore.resetTimer();
      }

      addToast("Attempt progress log saved successfully.", "success");
      onStatusUpdated(selectedStatus);
      onClose();
    } catch {
      addToast("Failed to save progress log.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { status: "Not Started", desc: "⚪ Haven't solved or catalogued this question.", color: "border-muted-foreground/30 hover:border-muted-foreground/60" },
    { status: "Attempted", desc: "🟡 Solved but failed test cases or had efficiency bugs.", color: "border-amber-500/30 hover:border-amber-500/60" },
    { status: "Solved", desc: "🟢 Verified correct on LeetCode. Spacing window scheduled.", color: "border-emerald-500/30 hover:border-emerald-500/60" },
    { status: "Revised Once", desc: "🔵 Verified correct. Completed first review session.", color: "border-blue-500/30 hover:border-blue-500/60" },
    { status: "Mastered", desc: "🟣 Interval timeline exceeds 15 days of recall safety.", color: "border-purple-500/30 hover:border-purple-500/60" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="📊 Log Attempt Metrics"
      description="Update spaced repetition patterns and save metrics (time taken, attempts, takeaways)."
      className="sm:max-w-xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4 text-left pt-2">
        
        {/* Selected target name */}
        <p className="text-xs font-semibold text-muted-foreground">
          Challenge: <span className="text-foreground font-bold">{problemTitle}</span>
        </p>

        {/* 1. Status Selection Grid */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Select Revision Status:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {statusOptions.map((item) => {
              const isSelected = selectedStatus === item.status;
              return (
                <button
                  key={item.status}
                  onClick={() => setSelectedStatus(item.status)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer text-xs flex justify-between items-start gap-2",
                    isSelected 
                      ? "border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-500" 
                      : cn("bg-card border-border", item.color)
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{item.status}</p>
                    <p className="text-[9px] text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                  {isSelected && <Check className="size-4 text-indigo-500 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Metrics input row */}
        {selectedStatus !== "Not Started" && (
          <div className="space-y-4 border-t border-border/40 pt-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Time taken */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3.5 text-indigo-500" /> Time taken (mins):
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground font-semibold"
                />
              </div>

              {/* Attempt index count */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <BarChart2 className="size-3.5 text-indigo-500" /> Attempt Number:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={attempts}
                  onChange={(e) => setAttempts(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground font-semibold"
                />
              </div>
            </div>

            {/* Confidence scale rating */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Confidence Rating:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {([
                  { level: "Low", icon: "🔴" },
                  { level: "Medium", icon: "🟡" },
                  { level: "High", icon: "🟢" },
                ] as const).map((c) => {
                  const isChecked = confidence === c.level;
                  return (
                    <button
                      key={c.level}
                      onClick={() => setConfidence(c.level)}
                      className={cn(
                        "py-1.5 px-3 rounded-lg border border-border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5",
                        isChecked 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" 
                          : "bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span>{c.icon}</span>
                      <span>{c.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Takeaways Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Key Takeaways / Review Notes:
              </label>
              <textarea
                placeholder="Briefly state key algorithms details or edge cases (e.g. 'Handle duplicates in input array using HashMap index tracking')"
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 3. Modal footer actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            size="sm"
            disabled={submitting}
            className="text-xs cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            {submitting ? "Saving..." : "Save Log & Status"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
