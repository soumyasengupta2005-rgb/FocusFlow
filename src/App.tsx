import { useState, useEffect } from "react";
import { useTimer, Mode } from "./hooks/useTimer";
import { TimerRing } from "./components/TimerRing";
import { TaskPanel } from "./components/TaskPanel";
import { SettingsModal } from "./components/SettingsModal";
import { StatsPanel } from "./components/StatsPanel";

const MODE_LABELS: Record<Mode, string> = {
  pomodoro: "🍅 Pomodoro",
  shortBreak: "☕ Short Break",
  longBreak: "🌙 Long Break",
};

const QUOTES = [
  "Focus is the art of knowing what to ignore.",
  "One task at a time is worth two in the mind.",
  "The secret of getting ahead is getting started.",
  "Small steps every day lead to big results.",
  "Deep work is a superpower in our distracted world.",
  "Consistency beats intensity every time.",
  "Your future self is watching. Make them proud.",
];

export default function App() {
  const timer = useTimer();
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<"timer" | "tasks" | "stats">(
    "timer",
  );
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
  );
  const [ringSize, setRingSize] = useState(280);
  const [bellShake, setBellShake] = useState(false);

  // Responsive ring size
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 360) setRingSize(220);
      else if (w < 480) setRingSize(250);
      else setRingSize(280);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Bell shake when alarm rings
  useEffect(() => {
    if (timer.alarmRinging) {
      setBellShake(true);
      setTimeout(() => setBellShake(false), 800);
    }
  }, [timer.alarmRinging]);

  const handleModeSwitch = (mode: Mode) => {
    timer.switchMode(mode);
  };

  const modeColor = {
    pomodoro: { from: "#f97316", to: "#ea580c" },
    shortBreak: { from: "#06b6d4", to: "#0891b2" },
    longBreak: { from: "#8b5cf6", to: "#7c3aed" },
  }[timer.mode];

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(5, 3, 20, 0.72)" }}
      />

      {/* Animated blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="blob"
          style={{
            width: "500px",
            height: "500px",
            background:
              timer.mode === "pomodoro"
                ? "#f97316"
                : timer.mode === "shortBreak"
                  ? "#06b6d4"
                  : "#8b5cf6",
            top: "-100px",
            left: "-100px",
            transition: "background 1.5s ease",
          }}
        />
        <div
          className="blob"
          style={{
            width: "400px",
            height: "400px",
            background:
              timer.mode === "pomodoro"
                ? "#7c3aed"
                : timer.mode === "shortBreak"
                  ? "#8b5cf6"
                  : "#0891b2",
            bottom: "-80px",
            right: "-80px",
            transition: "background 1.5s ease",
          }}
        />
        <div
          className="blob"
          style={{
            width: "300px",
            height: "300px",
            background: "#1e1b4b",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Main layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold"
              style={{
                background: `linear-gradient(135deg, ${modeColor.from}, ${modeColor.to})`,
                boxShadow: `0 4px 15px ${modeColor.from}55`,
              }}
            >
              🍅
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              FocusFlow
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell / alarm indicator */}
            <button
              onClick={() =>
                timer.alarmRinging
                  ? timer.stopAlarm()
                  : timer.playAlarm(
                      timer.settings.alarmSound,
                      timer.settings.alarmVolume,
                    )
              }
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all glass ${bellShake ? "animate-bell-shake" : ""}`}
              title="Test alarm"
            >
              <span className="text-lg">
                {timer.alarmRinging ? "🔕" : "🔔"}
              </span>
            </button>

            {/* Stats toggle */}
            <button
              onClick={() => setShowStats((v) => !v)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all glass ${showStats ? "bg-white/15" : ""}`}
              title="Statistics"
            >
              <svg
                className="w-4 h-4 text-white/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
              </svg>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all glass"
              title="Settings"
            >
              <svg
                className="w-4 h-4 text-white/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pb-8 gap-6">
          {/* Desktop Layout: 3 columns | Mobile: Tabs */}
          <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 mt-2">
            {/* LEFT PANEL – Stats (Desktop) / Tab (Mobile) */}
            <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-4">
              <div className="glass rounded-3xl p-5">
                <h2 className="font-display font-semibold text-white/60 text-xs uppercase tracking-widest mb-4">
                  Statistics
                </h2>
                <StatsPanel
                  totalPomodoros={timer.totalPomodoros}
                  todayPomodoros={timer.todayPomodoros}
                  pomodoroCount={timer.pomodoroCount}
                  longBreakInterval={timer.settings.longBreakInterval}
                  sessionHistory={timer.sessionHistory}
                  lastSessionReset={timer.lastSessionReset}
                  resetSession={timer.resetSession}
                />
              </div>

              {/* Quote */}
              <div className="glass rounded-2xl p-4">
                <p className="text-white/40 text-xs italic text-center leading-relaxed">
                  "{quote}"
                </p>
              </div>
            </aside>

            {/* CENTER – Timer */}
            <div className="flex-1 flex flex-col items-center gap-5">
              {/* Mode selector */}
              <div className="glass rounded-2xl p-1.5 flex gap-1 w-full max-w-sm">
                {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className="flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-300 relative"
                    style={
                      timer.mode === m
                        ? {
                            background: `linear-gradient(135deg, ${modeColor.from}33, ${modeColor.to}22)`,
                            color: modeColor.from,
                            border: `1px solid ${modeColor.from}44`,
                          }
                        : {
                            color: "rgba(255,255,255,0.45)",
                          }
                    }
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>

              {/* Timer card */}
              <div
                className="glass rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 w-full max-w-sm"
                style={{
                  boxShadow: timer.isRunning
                    ? `0 0 60px ${modeColor.from}30, 0 20px 60px rgba(0,0,0,0.4)`
                    : "0 20px 60px rgba(0,0,0,0.3)",
                  transition: "box-shadow 1s ease",
                }}
              >
                {/* Ring */}
                <div className={timer.isRunning ? "animate-ring-pulse" : ""}>
                  <TimerRing
                    secondsLeft={timer.secondsLeft}
                    progress={timer.progress}
                    isRunning={timer.isRunning}
                    mode={timer.mode}
                    size={ringSize}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-4">
                  {/* Reset */}
                  <button
                    onClick={timer.reset}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 glass hover:bg-white/15"
                    title="Reset"
                  >
                    <svg
                      className="w-5 h-5 text-white/60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 3v5h5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Start / Stop */}
                  <button
                    onClick={timer.isRunning ? timer.stop : timer.start}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-base text-white transition-all duration-200 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${modeColor.from}, ${modeColor.to})`,
                      boxShadow: `0 6px 30px ${modeColor.from}55`,
                      minWidth: "130px",
                    }}
                  >
                    {timer.isRunning ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                        <span>Start</span>
                      </>
                    )}
                  </button>

                  {/* Skip */}
                  <button
                    onClick={() => {
                      const nextMode: Mode =
                        timer.mode === "pomodoro"
                          ? (timer.pomodoroCount + 1) %
                              timer.settings.longBreakInterval ===
                            0
                            ? "longBreak"
                            : "shortBreak"
                          : "pomodoro";
                      timer.switchMode(nextMode);
                    }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 glass hover:bg-white/15"
                    title="Skip"
                  >
                    <svg
                      className="w-5 h-5 text-white/60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon
                        points="5,4 15,12 5,20"
                        fill="currentColor"
                        stroke="none"
                        className="text-white/60"
                      />
                      <line
                        x1="19"
                        y1="4"
                        x2="19"
                        y2="20"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Break shortcut buttons */}
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => handleModeSwitch("shortBreak")}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background:
                        timer.mode === "shortBreak"
                          ? "rgba(34,211,238,0.2)"
                          : "rgba(34,211,238,0.06)",
                      border: `1px solid ${timer.mode === "shortBreak" ? "rgba(34,211,238,0.4)" : "rgba(34,211,238,0.15)"}`,
                      color: "#22d3ee",
                    }}
                  >
                    ☕ Short Break ({timer.settings.shortBreak}m)
                  </button>
                  <button
                    onClick={() => handleModeSwitch("longBreak")}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background:
                        timer.mode === "longBreak"
                          ? "rgba(167,139,250,0.2)"
                          : "rgba(167,139,250,0.06)",
                      border: `1px solid ${timer.mode === "longBreak" ? "rgba(167,139,250,0.4)" : "rgba(167,139,250,0.15)"}`,
                      color: "#a78bfa",
                    }}
                  >
                    🌙 Long Break ({timer.settings.longBreak}m)
                  </button>
                </div>
              </div>

              {/* Pomodoro dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: timer.settings.longBreakInterval }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        background:
                          i <
                          (timer.pomodoroCount %
                            timer.settings.longBreakInterval ||
                            (timer.pomodoroCount > 0 &&
                            timer.pomodoroCount %
                              timer.settings.longBreakInterval ===
                              0
                              ? timer.settings.longBreakInterval
                              : 0))
                            ? modeColor.from
                            : "rgba(255,255,255,0.15)",
                        boxShadow:
                          i <
                          timer.pomodoroCount % timer.settings.longBreakInterval
                            ? `0 0 8px ${modeColor.from}`
                            : "none",
                      }}
                    />
                  ),
                )}
              </div>

              {/* Active task indicator */}
              {timer.activeTaskId && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl max-w-sm w-full animate-fade-in"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.25)",
                  }}
                >
                  <span className="text-orange-400 text-sm">▶</span>
                  <span className="text-white/70 text-sm truncate">
                    {timer.tasks.find((t) => t.id === timer.activeTaskId)
                      ?.title || "Active task"}
                  </span>
                  <button
                    onClick={() => timer.setActiveTaskId(null)}
                    className="ml-auto text-white/30 hover:text-white/60 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT PANEL – Tasks (Desktop) */}
            <aside className="hidden lg:flex flex-col w-72 flex-shrink-0">
              <div className="glass rounded-3xl p-5">
                <TaskPanel
                  tasks={timer.tasks}
                  activeTaskId={timer.activeTaskId}
                  pomodoroCount={timer.pomodoroCount}
                  onAddTask={timer.addTask}
                  onDeleteTask={timer.deleteTask}
                  onToggleTask={timer.toggleTask}
                  onSetActive={timer.setActiveTaskId}
                  onClearCompleted={timer.clearCompletedTasks}
                />
              </div>
            </aside>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden w-full max-w-sm">
            {/* Tab buttons */}
            <div className="glass rounded-2xl p-1 flex gap-1 mb-4">
              {(["tasks", "stats"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200"
                  style={
                    activeTab === tab
                      ? { background: "rgba(255,255,255,0.12)", color: "white" }
                      : { color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {tab === "tasks" ? "📝 Tasks" : "📊 Stats"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="glass rounded-3xl p-5 animate-fade-in">
              {activeTab === "tasks" ? (
                <TaskPanel
                  tasks={timer.tasks}
                  activeTaskId={timer.activeTaskId}
                  pomodoroCount={timer.pomodoroCount}
                  onAddTask={timer.addTask}
                  onDeleteTask={timer.deleteTask}
                  onToggleTask={timer.toggleTask}
                  onSetActive={timer.setActiveTaskId}
                  onClearCompleted={timer.clearCompletedTasks}
                />
              ) : (
                <StatsPanel
                  totalPomodoros={timer.totalPomodoros}
                  todayPomodoros={timer.todayPomodoros}
                  pomodoroCount={timer.pomodoroCount}
                  longBreakInterval={timer.settings.longBreakInterval}
                  sessionHistory={timer.sessionHistory}
                  lastSessionReset={timer.lastSessionReset}
                  resetSession={timer.resetSession}
                />
              )}
            </div>

            {/* Quote - mobile */}
            <div className="glass rounded-2xl p-4 mt-4">
              <p className="text-white/40 text-xs italic text-center leading-relaxed">
                "{quote}"
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-white/20 text-xs">
          FocusFlow • Stay focused, stay productive
        </footer>
      </div>

      {/* Alarm Banner */}
      {timer.alarmRinging && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-fade-in"
          style={{
            background: "rgba(15, 10, 40, 0.95)",
            border: "1px solid rgba(139,92,246,0.5)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 40px rgba(139,92,246,0.4)",
          }}
        >
          <span className="text-2xl animate-bell-shake">🔔</span>
          <div>
            <p className="text-white font-semibold text-sm">
              {timer.mode === "pomodoro"
                ? "Pomodoro Complete!"
                : "Break Complete!"}
            </p>
            <p className="text-white/50 text-xs">
              {timer.mode === "pomodoro"
                ? "Time for a well-deserved break 🎉"
                : "Time to get back to work! 💪"}
            </p>
          </div>
          <button
            onClick={timer.stopAlarm}
            className="ml-2 w-7 h-7 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Modal (mobile overlay) */}
      {showStats && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowStats(false)}
        >
          <div
            className="glass-dark rounded-3xl p-6 w-full max-w-sm animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white text-lg">
                Statistics
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <StatsPanel
              totalPomodoros={timer.totalPomodoros}
              todayPomodoros={timer.todayPomodoros}
              pomodoroCount={timer.pomodoroCount}
              longBreakInterval={timer.settings.longBreakInterval}
              sessionHistory={timer.sessionHistory}
              lastSessionReset={timer.lastSessionReset}
              resetSession={timer.resetSession}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={timer.settings}
          onUpdate={timer.updateSettings}
          onClose={() => setShowSettings(false)}
          onTestAlarm={() =>
            timer.playAlarm(
              timer.settings.alarmSound,
              timer.settings.alarmVolume,
            )
          }
        />
      )}
    </div>
  );
}
