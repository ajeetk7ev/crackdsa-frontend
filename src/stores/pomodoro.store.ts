import { create } from "zustand";

export type TimerMode = "work" | "short" | "long";

interface PomodoroState {
  isActive: boolean;
  timeLeft: number;
  totalDuration: number;
  mode: TimerMode;
  activeProblemId: string | null;
  activeProblemTitle: string | null;
  isFullScreen: boolean;
  modeTimes: Record<TimerMode, number>;
  
  // Actions
  startTimer: (problemId?: string | null, problemTitle?: string | null, durationMins?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  setFullScreen: (isFullScreen: boolean) => void;
  setCustomDuration: (mode: TimerMode, mins: number) => void;
}

let timerInterval: any = null;

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  isActive: false,
  timeLeft: 25 * 60,
  totalDuration: 25 * 60,
  mode: "work",
  activeProblemId: null,
  activeProblemTitle: null,
  isFullScreen: false,
  modeTimes: {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  },

  startTimer: (problemId, problemTitle, durationMins) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const mode = get().mode;
    
    // Determine whether to reset the time or resume paused ticking
    let nextTimeLeft = get().timeLeft;
    let nextTotalDuration = get().totalDuration;
    
    // If a new problem context is passed, or if the timer is at its default initial state, reset it
    const isNewContext = problemId !== undefined && problemId !== null && problemId !== get().activeProblemId;
    const isDefaultInitial = get().timeLeft === get().modeTimes[mode];
    
    if (isNewContext || isDefaultInitial || durationMins) {
      let durationSecs = get().modeTimes[mode];
      if (durationMins) {
        durationSecs = durationMins * 60;
      }
      nextTimeLeft = durationSecs;
      nextTotalDuration = durationSecs;
    }

    set({
      isActive: true,
      timeLeft: nextTimeLeft,
      totalDuration: nextTotalDuration,
      // Only set if explicitly provided, otherwise keep existing values
      activeProblemId: problemId !== undefined && problemId !== null ? problemId : get().activeProblemId,
      activeProblemTitle: problemTitle !== undefined && problemTitle !== null ? problemTitle : get().activeProblemTitle,
    });

    timerInterval = setInterval(() => {
      get().tick();
    }, 1000);
  },

  pauseTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({ isActive: false });
  },

  resetTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const mode = get().mode;
    set({
      isActive: false,
      timeLeft: get().modeTimes[mode],
      activeProblemId: null,
      activeProblemTitle: null,
    });
  },

  tick: () => {
    const currentLeft = get().timeLeft;
    if (currentLeft <= 1) {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      const mode = get().mode;
      const defaultSecs = get().modeTimes[mode];
      
      set({
        isActive: false,
        timeLeft: defaultSecs,
      });

      // Fire completion notification
      import("@/stores/notification.store").then((store) => {
        const alerts = {
          work: "Focus block completed! Ready to log your attempt status?",
          short: "Short rest completed! Ready to focus on the next problem?",
          long: "Long break completed! Ready to resume solving?",
        };
        store.useNotificationStore.getState().info(alerts[mode]);
      });
    } else {
      set({ timeLeft: currentLeft - 1 });
    }
  },

  setMode: (mode) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const secs = get().modeTimes[mode];
    set({
      mode,
      isActive: false,
      timeLeft: secs,
      totalDuration: secs,
    });
  },

  setFullScreen: (isFullScreen) => {
    set({ isFullScreen });
  },

  setCustomDuration: (mode, mins) => {
    const secs = mins * 60;
    set((state) => {
      const updatedTimes = { ...state.modeTimes, [mode]: secs };
      return {
        modeTimes: updatedTimes,
        timeLeft: state.mode === mode ? secs : state.timeLeft,
        totalDuration: state.mode === mode ? secs : state.totalDuration,
      };
    });
  },
}));
