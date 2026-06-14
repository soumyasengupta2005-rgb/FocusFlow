import { Mode } from '../hooks/useTimer';

interface TimerRingProps {
  secondsLeft: number;
  progress: number;
  isRunning: boolean;
  mode: Mode;
  size?: number;
}

const MODE_COLORS: Record<Mode, { stroke: string; glow: string; text: string }> = {
  pomodoro: { stroke: '#f97316', glow: 'rgba(249,115,22,0.5)', text: 'text-orange-400' },
  shortBreak: { stroke: '#22d3ee', glow: 'rgba(34,211,238,0.5)', text: 'text-cyan-400' },
  longBreak: { stroke: '#a78bfa', glow: 'rgba(167,139,250,0.5)', text: 'text-violet-400' },
};

export const TimerRing = ({
  secondsLeft,
  progress,
  mode,
  size = 280,
}: TimerRingProps) => {
  const center = size / 2;
  const strokeWidth = size < 200 ? 8 : 12;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const colors = MODE_COLORS[mode];
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div
      className="progress-ring-container"
      style={{ width: size, height: size }}
    >
      {/* Outer decorative ring */}
      <svg
        width={size}
        height={size}
        className="absolute"
        style={{ opacity: 0.15 }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius + strokeWidth + 6}
          fill="none"
          stroke="white"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
      </svg>

      {/* Background track */}
      <svg width={size} height={size} className="absolute">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress arc */}
      <svg width={size} height={size} className="absolute">
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          className="progress-ring__circle"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          filter="url(#glow-filter)"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center" style={{ zIndex: 1 }}>

        {/* Time display */}
        <div
          className="font-display font-bold text-white tracking-tight select-none"
          style={{
            fontSize: size < 200 ? '3rem' : size < 280 ? '3.5rem' : '4.5rem',
            lineHeight: 1,
            textShadow: `0 0 30px ${colors.glow}`,
          }}
        >
          {mins}:{secs}
        </div>

        {/* Mode label */}
        <div
          className="mt-2 text-sm font-medium uppercase tracking-widest"
          style={{ color: colors.stroke, textShadow: `0 0 10px ${colors.glow}` }}
        >
          {mode === 'pomodoro' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </div>
      </div>
    </div>
  );
};
