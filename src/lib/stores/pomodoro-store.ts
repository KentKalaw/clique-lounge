import { create } from 'zustand';

interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeRemaining: number;
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  completedSessions: number;
  currentTask: string;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  userId: string | null;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setTask: (task: string) => void;
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setLongBreakDuration: (minutes: number) => void;
  setSessionsUntilLongBreak: (sessions: number) => void;
  skipToBreak: () => void;
  skipToWork: () => void;
  toggleAutoStartBreaks: () => void;
  toggleAutoStartWork: () => void;
  setUserId: (userId: string | null) => void;
  loadUserData: () => void;
}

// Helper to get user-specific storage key
const getStorageKey = (userId: string | null) => 
  userId ? `pomodoro-storage-${userId}` : 'pomodoro-storage-guest';

// Helper to load user data from localStorage
const loadUserPomodoroData = (userId: string | null) => {
  if (typeof window === 'undefined') return null;
  const key = getStorageKey(userId);
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.state || null;
  } catch {
    return null;
  }
};

// Helper to save user data to localStorage
const saveUserPomodoroData = (userId: string | null, data: Partial<PomodoroState>) => {
  if (typeof window === 'undefined') return;
  const key = getStorageKey(userId);
  const stored = localStorage.getItem(key);
  let existing = {};
  try {
    const parsed = stored ? JSON.parse(stored) : {};
    existing = parsed.state || {};
  } catch {
    existing = {};
  }
  localStorage.setItem(key, JSON.stringify({ state: { ...existing, ...data } }));
};

export const usePomodoroStore = create<PomodoroState>()(
    (set, get) => ({
      isRunning: false,
      mode: 'work',
      timeRemaining: 25 * 60, // 25 minutes in seconds
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      completedSessions: 0,
      currentTask: '',
      autoStartBreaks: false,
      autoStartWork: false,
      userId: null,

      setUserId: (userId) => {
        set({ userId });
        // Load user-specific data when userId changes
        get().loadUserData();
      },

      loadUserData: () => {
        const { userId } = get();
        const userData = loadUserPomodoroData(userId);
        if (userData) {
          set({
            workDuration: userData.workDuration ?? 25,
            breakDuration: userData.breakDuration ?? 5,
            longBreakDuration: userData.longBreakDuration ?? 15,
            sessionsUntilLongBreak: userData.sessionsUntilLongBreak ?? 4,
            completedSessions: userData.completedSessions ?? 0,
            autoStartBreaks: userData.autoStartBreaks ?? false,
            autoStartWork: userData.autoStartWork ?? false,
            timeRemaining: userData.workDuration ? userData.workDuration * 60 : 25 * 60,
            mode: 'work',
            isRunning: false,
          });
        }
      },

      start: () => set({ isRunning: true }),

      pause: () => set({ isRunning: false }),

      reset: () => {
        const { mode, workDuration, breakDuration, longBreakDuration, completedSessions, sessionsUntilLongBreak } = get();
        const isLongBreak = completedSessions > 0 && completedSessions % sessionsUntilLongBreak === 0;
        const duration = mode === 'work' 
          ? workDuration 
          : isLongBreak 
            ? longBreakDuration 
            : breakDuration;
        set({ timeRemaining: duration * 60, isRunning: false });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning) return;

        if (state.timeRemaining <= 1) {
          // Timer completed
          const newMode = state.mode === 'work' ? 'break' : 'work';
          const newCompletedSessions = state.mode === 'work' 
            ? state.completedSessions + 1 
            : state.completedSessions;
          
          const isLongBreak = newCompletedSessions % state.sessionsUntilLongBreak === 0;
          const newDuration = newMode === 'work'
            ? state.workDuration
            : isLongBreak
              ? state.longBreakDuration
              : state.breakDuration;

          const shouldAutoStart = newMode === 'work' 
            ? state.autoStartWork 
            : state.autoStartBreaks;

          set({
            mode: newMode,
            timeRemaining: newDuration * 60,
            completedSessions: newCompletedSessions,
            isRunning: shouldAutoStart,
          });

          // Save completed sessions
          saveUserPomodoroData(state.userId, { completedSessions: newCompletedSessions });

          // Play notification sound and show notification
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(
                newMode === 'work' ? '🎯 Break over!' : '🎉 Great work!',
                {
                  body: newMode === 'work'
                    ? 'Time to focus again!'
                    : `Session ${newCompletedSessions} complete. Take a ${isLongBreak ? 'long ' : ''}break!`,
                }
              );
            }
          }
        } else {
          set({ timeRemaining: state.timeRemaining - 1 });
        }
      },

      setTask: (task) => set({ currentTask: task }),

      setWorkDuration: (minutes) => {
        set({ workDuration: minutes });
        saveUserPomodoroData(get().userId, { workDuration: minutes });
        if (get().mode === 'work' && !get().isRunning) {
          set({ timeRemaining: minutes * 60 });
        }
      },

      setBreakDuration: (minutes) => {
        set({ breakDuration: minutes });
        saveUserPomodoroData(get().userId, { breakDuration: minutes });
        if (get().mode === 'break' && !get().isRunning) {
          set({ timeRemaining: minutes * 60 });
        }
      },

      setLongBreakDuration: (minutes) => {
        set({ longBreakDuration: minutes });
        saveUserPomodoroData(get().userId, { longBreakDuration: minutes });
      },

      setSessionsUntilLongBreak: (sessions) => {
        set({ sessionsUntilLongBreak: sessions });
        saveUserPomodoroData(get().userId, { sessionsUntilLongBreak: sessions });
      },

      skipToBreak: () => {
        const { breakDuration, longBreakDuration, completedSessions, sessionsUntilLongBreak, autoStartBreaks, userId } = get();
        const newCompleted = completedSessions + 1;
        const isLongBreak = newCompleted % sessionsUntilLongBreak === 0;
        set({
          mode: 'break',
          timeRemaining: (isLongBreak ? longBreakDuration : breakDuration) * 60,
          completedSessions: newCompleted,
          isRunning: autoStartBreaks,
        });
        saveUserPomodoroData(userId, { completedSessions: newCompleted });
      },

      skipToWork: () => {
        const { workDuration, autoStartWork } = get();
        set({
          mode: 'work',
          timeRemaining: workDuration * 60,
          isRunning: autoStartWork,
        });
      },

      toggleAutoStartBreaks: () => {
        const newValue = !get().autoStartBreaks;
        set({ autoStartBreaks: newValue });
        saveUserPomodoroData(get().userId, { autoStartBreaks: newValue });
      },

      toggleAutoStartWork: () => {
        const newValue = !get().autoStartWork;
        set({ autoStartWork: newValue });
        saveUserPomodoroData(get().userId, { autoStartWork: newValue });
      },
    })
);
