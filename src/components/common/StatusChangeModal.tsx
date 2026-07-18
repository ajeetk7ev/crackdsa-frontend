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

  const [progressObj, setProgressObj] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("Solved");
  const [timeSpent, setTimeSpent] = useState<string>("0");
  const [confidence, setConfidence] = useState<"Low" | "Medium" | "High">("Medium");
  const [attempts, setAttempts] = useState<number>(1);
  const [takeaway, setTakeaway] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Spaced revision customized date states
  const [rev1Days, setRev1Days] = useState<number>(3);
  const [rev1Date, setRev1Date] = useState<string>("");
  const [rev2Days, setRev2Days] = useState<number>(7);
  const [rev2Date, setRev2Date] = useState<string>("");
  const [rev3Days, setRev3Days] = useState<number>(30);
  const [rev3Date, setRev3Date] = useState<string>("");

  // Helpers
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysDifference = (startDate: Date, endDate: Date) => {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const STATUS_ORDER = ["Not Started", "Attempted", "Solved", "Revised Once", "Revised Twice", "Mastered"];

  const isDowngrade = () => {
    if (!progressObj || !progressObj.status) return false;
    const currentIndex = STATUS_ORDER.indexOf(progressObj.status);
    const selectedIndex = STATUS_ORDER.indexOf(selectedStatus);
    return selectedIndex !== -1 && currentIndex !== -1 && selectedIndex < currentIndex;
  };

  const handleRev1DaysChange = (days: number) => {
    const val = Math.max(0, days);
    setRev1Days(val);
    setRev1Date(formatDateToYYYYMMDD(addDays(new Date(), val)));
  };

  const handleRev1DateChange = (dateStr: string) => {
    setRev1Date(dateStr);
    if (dateStr) {
      setRev1Days(getDaysDifference(new Date(), new Date(dateStr)));
    }
  };

  const handleRev2DaysChange = (days: number) => {
    const val = Math.max(0, days);
    setRev2Days(val);
    setRev2Date(formatDateToYYYYMMDD(addDays(new Date(), val)));
  };

  const handleRev2DateChange = (dateStr: string) => {
    setRev2Date(dateStr);
    if (dateStr) {
      setRev2Days(getDaysDifference(new Date(), new Date(dateStr)));
    }
  };

  const handleRev3DaysChange = (days: number) => {
    const val = Math.max(0, days);
    setRev3Days(val);
    setRev3Date(formatDateToYYYYMMDD(addDays(new Date(), val)));
  };

  const handleRev3DateChange = (dateStr: string) => {
    setRev3Date(dateStr);
    if (dateStr) {
      setRev3Days(getDaysDifference(new Date(), new Date(dateStr)));
    }
  };

  const isStatusLocked = (status: string) => {
    if (["Not Started", "Attempted", "Solved"].includes(status)) {
      return false;
    }
    if (!progressObj || !progressObj.srs) {
      return true;
    }
    
    const now = Date.now();
    if (status === "Revised Once") {
      if (!progressObj.srs.firstRevisionDate) return true;
      return new Date(progressObj.srs.firstRevisionDate).getTime() > now;
    }
    if (status === "Revised Twice") {
      if (!progressObj.srs.secondRevisionDate) return true;
      return new Date(progressObj.srs.secondRevisionDate).getTime() > now;
    }
    if (status === "Mastered") {
      if (!progressObj.srs.thirdRevisionDate) return true;
      return new Date(progressObj.srs.thirdRevisionDate).getTime() > now;
    }
    return false;
  };

  const getLockMessage = (status: string) => {
    if (!progressObj || !progressObj.srs) {
      return "Solve first";
    }
    
    if (status === "Revised Once") {
      if (!progressObj.srs.firstRevisionDate) return "Not scheduled";
      const dateStr = new Date(progressObj.srs.firstRevisionDate).toLocaleDateString();
      return `Locked until ${dateStr}`;
    }
    if (status === "Revised Twice") {
      if (!progressObj.srs.secondRevisionDate) return "Not scheduled";
      const dateStr = new Date(progressObj.srs.secondRevisionDate).toLocaleDateString();
      return `Locked until ${dateStr}`;
    }
    if (status === "Mastered") {
      if (!progressObj.srs.thirdRevisionDate) return "Not scheduled";
      const dateStr = new Date(progressObj.srs.thirdRevisionDate).toLocaleDateString();
      return `Locked until ${dateStr}`;
    }
    return "";
  };

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && problemId) {
      const loadProblemProgress = async () => {
        try {
          const res = await api.get(`/progress/${problemId}`);
          const p = res.data.data;
          
          setProgressObj(p);
          setSelectedStatus(p.status || "Solved");
          setAttempts((p.totalAttempts || 0) + 1); // Suggest next attempt index
          setTakeaway(p.note || "");
          
          if (p.timeTaken) {
            const mins = p.timeTaken.replace(" min", "");
            setTimeSpent(mins);
          } else {
            setTimeSpent("0");
          }

          const baseDate = new Date();
          if (p.srs && p.srs.firstRevisionDate) {
            const d1 = new Date(p.srs.firstRevisionDate);
            setRev1Date(formatDateToYYYYMMDD(d1));
            setRev1Days(getDaysDifference(baseDate, d1));
          } else {
            const d1 = addDays(baseDate, 3);
            setRev1Date(formatDateToYYYYMMDD(d1));
            setRev1Days(3);
          }

          if (p.srs && p.srs.secondRevisionDate) {
            const d2 = new Date(p.srs.secondRevisionDate);
            setRev2Date(formatDateToYYYYMMDD(d2));
            setRev2Days(getDaysDifference(baseDate, d2));
          } else {
            const d2 = addDays(baseDate, 7);
            setRev2Date(formatDateToYYYYMMDD(d2));
            setRev2Days(7);
          }

          if (p.srs && p.srs.thirdRevisionDate) {
            const d3 = new Date(p.srs.thirdRevisionDate);
            setRev3Date(formatDateToYYYYMMDD(d3));
            setRev3Days(getDaysDifference(baseDate, d3));
          } else {
            const d3 = addDays(baseDate, 30);
            setRev3Date(formatDateToYYYYMMDD(d3));
            setRev3Days(30);
          }
        } catch {
          // Defaults if no progress record exists yet in database
          setProgressObj(null);
          setSelectedStatus("Solved");
          setAttempts(1);
          setTakeaway("");
          setTimeSpent("0");

          const baseDate = new Date();
          setRev1Days(3);
          setRev1Date(formatDateToYYYYMMDD(addDays(baseDate, 3)));
          setRev2Days(7);
          setRev2Date(formatDateToYYYYMMDD(addDays(baseDate, 7)));
          setRev3Days(30);
          setRev3Date(formatDateToYYYYMMDD(addDays(baseDate, 30)));
        }
      };

      loadProblemProgress();

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
      }
    }
  }, [isOpen, problemId]);

  const handleSubmit = async () => {
    if (!problemId) return;
    
    if (isDowngrade()) {
      const confirmed = window.confirm(
        `Are you sure you want to downgrade the status from "${progressObj.status}" to "${selectedStatus}"? This will reset/recalculate your revision timeline.`
      );
      if (!confirmed) return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        status: selectedStatus,
        timeTaken: timeSpent ? `${timeSpent} min` : "",
        totalAttempts: attempts,
        note: takeaway,
      };

      if (selectedStatus === "Solved") {
        payload.firstRevisionDate = new Date(rev1Date).toISOString();
        payload.secondRevisionDate = new Date(rev2Date).toISOString();
        payload.thirdRevisionDate = new Date(rev3Date).toISOString();
      }

      // Save stats to unified UserProblemProgress database model
      await api.put(`/progress/${problemId}`, payload);

      // Stop Pomodoro if this problem is complete
      if (
        pomodoroStore.activeProblemId === problemId &&
        (selectedStatus === "Solved" || selectedStatus === "Revised Once" || selectedStatus === "Revised Twice" || selectedStatus === "Mastered")
      ) {
        pomodoroStore.resetTimer();
      }

      addToast("Attempt progress log saved successfully.", "success");
      onStatusUpdated(selectedStatus);
      onClose();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || "Failed to save progress log.";
      addToast(serverMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { status: "Not Started", desc: "⚪ Haven't solved or catalogued this question.", color: "border-muted-foreground/30 hover:border-muted-foreground/60" },
    { status: "Attempted", desc: "🟡 Solved but failed test cases or had efficiency bugs.", color: "border-amber-500/30 hover:border-amber-500/60" },
    { status: "Solved", desc: "🟢 Verified correct on LeetCode. Spacing window scheduled.", color: "border-emerald-500/30 hover:border-emerald-500/60" },
    { status: "Revised Once", desc: "🔵 Verified correct. Completed first review session.", color: "border-blue-500/30 hover:border-blue-500/60" },
    { status: "Revised Twice", desc: "🟠 Verified correct. Completed second review session.", color: "border-orange-500/30 hover:border-orange-500/60" },
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
              const locked = isStatusLocked(item.status);
              const lockMessage = getLockMessage(item.status);
              
              return (
                <button
                  key={item.status}
                  onClick={() => {
                    if (!locked) {
                      setSelectedStatus(item.status);
                    }
                  }}
                  disabled={locked}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-start gap-2",
                    locked
                      ? "bg-muted/40 border-border opacity-50 cursor-not-allowed"
                      : isSelected 
                        ? "border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-500 cursor-pointer" 
                        : cn("bg-card border-border cursor-pointer", item.color)
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      {item.status}
                      {locked && <span className="text-[9px] text-muted-foreground font-normal flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded">🔒 {lockMessage}</span>}</p>
                    <p className="text-[9px] text-muted-foreground leading-snug">{item.desc}</p>
                  </div>
                  {isSelected && !locked && <Check className="size-4 text-indigo-500 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Downgrade Warning Banner */}
        {isDowngrade() && (
          <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 rounded-xl space-y-1 animate-in fade-in duration-300">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              ⚠️ Status Downgrade Warning
            </p>
            <p className="text-[10px] text-rose-700 dark:text-rose-300 leading-relaxed font-semibold">
              You are downgrading the progress status from <span className="font-bold underline">{progressObj.status}</span> to <span className="font-bold underline">{selectedStatus}</span>. This will reset/recalculate your spaced revision timeline.
            </p>
          </div>
        )}

        {/* Custom Revision Schedule Section */}
        {selectedStatus === "Solved" && (
          <div className="space-y-4 border-t border-border/40 pt-4 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                📅 Customize Spaced Revision Plan
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                CrackDSA schedules 3 recall cycles automatically. Adjust below if you want to customize when they unlock.
              </p>

              <div className="space-y-3 pt-1">
                {/* 1st Revision */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/50 p-2.5 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-foreground block">
                      1st Revision (Revised Once)
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Target unlock date
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-input rounded-md bg-background">
                      <button 
                        type="button"
                        onClick={() => handleRev1DaysChange(rev1Days - 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-md font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="0"
                        value={rev1Days}
                        onChange={(e) => handleRev1DaysChange(Number(e.target.value))}
                        className="w-10 border-0 bg-transparent text-center text-xs font-bold focus:ring-0 p-0 text-foreground"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRev1DaysChange(rev1Days + 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-md font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-foreground">days</span>
                    <input 
                      type="date"
                      value={rev1Date}
                      onChange={(e) => handleRev1DateChange(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground font-semibold"
                    />
                  </div>
                </div>

                {/* 2nd Revision */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/50 p-2.5 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-foreground block">
                      2nd Revision (Revised Twice)
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Target unlock date
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-input rounded-md bg-background">
                      <button 
                        type="button"
                        onClick={() => handleRev2DaysChange(rev2Days - 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-md font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="0"
                        value={rev2Days}
                        onChange={(e) => handleRev2DaysChange(Number(e.target.value))}
                        className="w-10 border-0 bg-transparent text-center text-xs font-bold focus:ring-0 p-0 text-foreground"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRev2DaysChange(rev2Days + 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-md font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-foreground">days</span>
                    <input 
                      type="date"
                      value={rev2Date}
                      onChange={(e) => handleRev2DateChange(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground font-semibold"
                    />
                  </div>
                </div>

                {/* 3rd Revision */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background/50 p-2.5 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-foreground block">
                      3rd Revision (Mastered)
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Target unlock date
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-input rounded-md bg-background">
                      <button 
                        type="button"
                        onClick={() => handleRev3DaysChange(rev3Days - 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-md font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="0"
                        value={rev3Days}
                        onChange={(e) => handleRev3DaysChange(Number(e.target.value))}
                        className="w-10 border-0 bg-transparent text-center text-xs font-bold focus:ring-0 p-0 text-foreground"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRev3DaysChange(rev3Days + 1)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-md font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-foreground">days</span>
                    <input 
                      type="date"
                      value={rev3Date}
                      onChange={(e) => handleRev3DateChange(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      type="button"
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
