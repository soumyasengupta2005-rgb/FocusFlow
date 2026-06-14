import { useState, useEffect, useRef, useCallback } from "react";

export type Mode = "pomodoro" | "shortBreak" | "longBreak";

export interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
}

export interface Task {
  id: string;
  title: string;
  pomodoros: number;
  completedPomodoros: number;
  done: boolean;
  createdAt: number;
}

export interface TimerState {
  mode: Mode;
  secondsLeft: number;
  isRunning: boolean;
  pomodoroCount: number;
  totalPomodoros: number;
  settings: TimerSettings;
  tasks: Task[];
  activeTaskId: string | null;
  sessionHistory: SessionRecord[];
  lastSessionReset?: number;
}

export interface SessionRecord {
  id: string;
  mode: Mode;
  completedAt: number;
  duration: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: "bell",
  alarmVolume: 0.7,
};

const getModeSeconds = (mode: Mode, settings: TimerSettings) => {
  if (mode === "pomodoro") return settings.pomodoro * 60;
  if (mode === "shortBreak") return settings.shortBreak * 60;
  return settings.longBreak * 60;
};

// Load from localStorage
const loadState = (): Partial<TimerState> => {
  try {
    const saved = localStorage.getItem("focusflow_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch {}
  return {};
};

export function useTimer() {
  const saved = loadState();

  const [settings, setSettings] = useState<TimerSettings>({
    ...DEFAULT_SETTINGS,
    ...(saved.settings || {}),
  });
  const [mode, setMode] = useState<Mode>(saved.mode || "pomodoro");
  const [secondsLeft, setSecondsLeft] = useState<number>(
    saved.secondsLeft !== undefined
      ? saved.secondsLeft
      : getModeSeconds(saved.mode || "pomodoro", {
          ...DEFAULT_SETTINGS,
          ...(saved.settings || {}),
        }),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(saved.pomodoroCount || 0);
  const [totalPomodoros, setTotalPomodoros] = useState(
    saved.totalPomodoros || 0,
  );
  const [tasks, setTasks] = useState<Task[]>(saved.tasks || []);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    saved.activeTaskId || null,
  );
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(
    saved.sessionHistory || [],
  );
  const [lastSessionReset, setLastSessionReset] = useState<number | undefined>(
    saved.lastSessionReset,
  );
  const [alarmRinging, setAlarmRinging] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist state
  useEffect(() => {
    const state: Partial<TimerState> = {
      mode,
      secondsLeft,
      pomodoroCount,
      totalPomodoros,
      settings,
      tasks,
      activeTaskId,
      sessionHistory,
      lastSessionReset,
    };
    localStorage.setItem("focusflow_state", JSON.stringify(state));
  }, [
    mode,
    secondsLeft,
    pomodoroCount,
    totalPomodoros,
    settings,
    tasks,
    activeTaskId,
    sessionHistory,
  ]);

  // Update document title
  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    const modeLabel =
      mode === "pomodoro" ? "🍅" : mode === "shortBreak" ? "☕" : "🌙";
    document.title = isRunning
      ? `${modeLabel} ${mins}:${secs} – FocusFlow`
      : "FocusFlow – Pomodoro Timer";
  }, [secondsLeft, isRunning, mode]);

  // Audio engine
  const playAlarm = useCallback((soundType: string, volume: number) => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const playTone = (
        freq: number,
        startTime: number,
        duration: number,
        type: OscillatorType = "sine",
      ) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.1);
      };

      if (soundType === "bell") {
        playTone(880, ctx.currentTime, 1.2, "sine");
        playTone(1320, ctx.currentTime + 0.1, 1.0, "sine");
        playTone(880, ctx.currentTime + 1.5, 1.2, "sine");
        playTone(1320, ctx.currentTime + 1.6, 1.0, "sine");
        playTone(880, ctx.currentTime + 3.0, 1.2, "sine");
      } else if (soundType === "digital") {
        [0, 0.3, 0.6, 0.9].forEach((t) => {
          playTone(440, ctx.currentTime + t, 0.25, "square");
        });
        [1.5, 1.8, 2.1, 2.4].forEach((t) => {
          playTone(880, ctx.currentTime + t, 0.25, "square");
        });
      } else if (soundType === "chime") {
        [523, 659, 784, 1047].forEach((freq, i) => {
          playTone(freq, ctx.currentTime + i * 0.4, 1.5, "sine");
        });
      } else if (soundType === "gentle") {
        [528, 594, 660].forEach((freq, i) => {
          playTone(freq, ctx.currentTime + i * 0.6, 2.0, "sine");
        });
      }

      setAlarmRinging(true);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = setTimeout(() => {
        setAlarmRinging(false);
        try {
          ctx.close();
        } catch {}
      }, 4000);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, []);

  const stopAlarm = useCallback(() => {
    setAlarmRinging(false);
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    try {
      audioCtxRef.current?.close();
    } catch {}
  }, []);
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    playAlarm(settings.alarmSound, settings.alarmVolume);

    // Browser notification
    if (Notification.permission === "granted") {
      alert("Reached notification code");

      try {
        const msg =
          mode === "pomodoro"
            ? "🍅 Pomodoro complete! Time for a break."
            : "⏰ Break over! Back to work.";

        const notification = new Notification("FocusFlow", {
          body: msg,
        });

        notification.onshow = () => {
          alert("Notification was shown successfully");
        };

        notification.onerror = () => {
          alert("Notification error occurred");
        };
      } catch (error) {
        alert("Notification failed: " + String(error));
        console.error("Notification failed:", error);
      }
    }
    if (mode === "pomodoro") {
      const newCount = pomodoroCount + 1;
      const newTotal = totalPomodoros + 1;
      setPomodoroCount(newCount);
      setTotalPomodoros(newTotal);

      // Update active task pomodoro count
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTaskId
              ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
              : t,
          ),
        );
      }

      setSessionHistory((prev) => {
        const newRecord: SessionRecord = {
          id: Date.now().toString(),
          mode: "pomodoro",
          completedAt: Date.now(),
          duration: settings.pomodoro,
        };

        const updated = [...prev, newRecord];

        return updated;
      });

      const nextMode: Mode =
        newCount % settings.longBreakInterval === 0
          ? "longBreak"
          : "shortBreak";
      setMode(nextMode);
      setSecondsLeft(getModeSeconds(nextMode, settings));

      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500);
      }
    } else {
      setSessionHistory((prev) => {
        const updated = [
          ...prev,
          {
            id: Date.now().toString(),
            mode,
            completedAt: Date.now(),
            duration:
              mode === "shortBreak" ? settings.shortBreak : settings.longBreak,
          },
        ];

        return updated;
      });

      setMode("pomodoro");
      setSecondsLeft(getModeSeconds("pomodoro", settings));

      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  }, [mode, pomodoroCount, totalPomodoros, settings, activeTaskId, playAlarm]);

  // Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [secondsLeft, isRunning, handleTimerComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(getModeSeconds(mode, settings));
  }, [mode, settings]);
  const resetSession = useCallback(() => {
    setPomodoroCount(0);
    setLastSessionReset(Date.now());
  }, []);
  const switchMode = useCallback(
    (newMode: Mode) => {
      setIsRunning(false);
      setMode(newMode);
      setSecondsLeft(getModeSeconds(newMode, settings));
    },
    [settings],
  );

  const updateSettings = useCallback(
    (newSettings: Partial<TimerSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        // Reset timer if duration changed
        if (
          newSettings.pomodoro !== undefined ||
          newSettings.shortBreak !== undefined ||
          newSettings.longBreak !== undefined
        ) {
          setIsRunning(false);
          setSecondsLeft(getModeSeconds(mode, updated));
        }
        return updated;
      });
    },
    [mode],
  );

  const addTask = useCallback((title: string, pomodoros: number = 1) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      pomodoros,
      completedPomodoros: 0,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, task]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, []);

  const totalSeconds = getModeSeconds(mode, settings);
  const progress =
    totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const currentSessionHistory = lastSessionReset
    ? sessionHistory.filter((s) => s.completedAt > lastSessionReset)
    : sessionHistory;

  const todayPomodoros = currentSessionHistory.filter((s) => {
    const today = new Date();
    const sessionDate = new Date(s.completedAt);
    return (
      s.mode === "pomodoro" &&
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );
  }).length;

  return {
    mode,
    secondsLeft,
    isRunning,
    pomodoroCount,
    totalPomodoros,
    todayPomodoros,
    settings,
    tasks,
    activeTaskId,
    sessionHistory,
    lastSessionReset,
    progress,
    alarmRinging,
    start,
    stop,
    reset,
    resetSession,
    switchMode,
    updateSettings,
    addTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,
    setActiveTaskId,
    playAlarm,
    stopAlarm,
  };
}
