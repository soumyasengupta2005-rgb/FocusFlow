import { SessionRecord } from "../hooks/useTimer";

interface StatsPanelProps {
  totalPomodoros: number;
  todayPomodoros: number;
  pomodoroCount: number;
  longBreakInterval: number;
  sessionHistory: SessionRecord[];
  lastSessionReset?: number;
  resetSession: () => void;
}

export const StatsPanel = ({
  totalPomodoros,
  todayPomodoros,
  pomodoroCount,
  longBreakInterval,
  sessionHistory,
  lastSessionReset,
  resetSession,
}: StatsPanelProps) => {
  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayPomodoros = sessionHistory.filter((s) => {
      const d = new Date(s.completedAt);
      return (
        s.mode === "pomodoro" &&
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    }).length;
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }),
      count: dayPomodoros,
    };
  });
  const currentSessionHistory = lastSessionReset
    ? sessionHistory.filter((s) => s.completedAt > lastSessionReset)
    : sessionHistory;

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  const totalFocusMinutes = currentSessionHistory
    .filter((s) => s.mode === "pomodoro")
    .reduce((acc, s) => acc + s.duration, 0);

  const totalBreaks = currentSessionHistory.filter(
    (s) => s.mode !== "pomodoro",
  ).length;

  // Progress to next long break
  const progressToLongBreak = pomodoroCount % longBreakInterval;

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon="🍅"
          value={todayPomodoros.toString()}
          label="Today"
          color="#f97316"
        />
        <StatCard
          icon="⏱️"
          value={`${totalFocusMinutes}m`}
          label="Focus Time"
          color="#22d3ee"
        />
        <StatCard
          icon="☕"
          value={totalBreaks.toString()}
          label="Breaks"
          color="#a78bfa"
        />
      </div>

      {/* Progress to long break */}
      <div
        className="p-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">Until Long Break</span>
          <span className="text-xs font-bold text-violet-400">
            {progressToLongBreak}/{longBreakInterval}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(progressToLongBreak / longBreakInterval) * 100}%`,
              background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
            }}
          />
        </div>
      </div>

      {/* 7-day chart */}
      <div
        className="p-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
          Last 7 Days
        </p>
        <div className="flex items-end gap-1.5 h-16">
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex items-end justify-center"
                style={{ height: "48px" }}
              >
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height:
                      day.count > 0
                        ? `${(day.count / maxCount) * 48}px`
                        : "2px",
                    background:
                      i === 6
                        ? "linear-gradient(180deg, #f97316, #ea580c)"
                        : "rgba(249,115,22,0.3)",
                    minHeight: day.count > 0 ? "4px" : "2px",
                  }}
                />
              </div>
              <span className="text-white/30 text-[9px]">{day.label}</span>
              {day.count > 0 && (
                <span className="text-orange-400 text-[9px] font-bold">
                  {day.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* All-time total + Reset */}
      <div
        className="p-3 rounded-xl space-y-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">All-time Pomodoros</span>
          <span className="text-sm font-bold text-orange-400">
            {totalPomodoros}
          </span>
        </div>

        <button
          onClick={resetSession}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          ↻ Reset Current Session
        </button>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) => (
  <div
    className="p-3 rounded-xl text-center"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="text-lg mb-1">{icon}</div>
    <div className="font-display font-bold text-sm" style={{ color }}>
      {value}
    </div>
    <div className="text-xs text-white/35 mt-0.5">{label}</div>
  </div>
);
