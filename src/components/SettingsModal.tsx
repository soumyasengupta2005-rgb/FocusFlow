import { useState } from 'react';
import { TimerSettings } from '../hooks/useTimer';

interface SettingsModalProps {
  settings: TimerSettings;
  onUpdate: (s: Partial<TimerSettings>) => void;
  onClose: () => void;
  onTestAlarm: () => void;
}

const SOUND_OPTIONS = [
  { value: 'bell', label: '🔔 Bell' },
  { value: 'digital', label: '📟 Digital' },
  { value: 'chime', label: '🎵 Chime' },
  { value: 'gentle', label: '🌊 Gentle' },
];

export const SettingsModal = ({
  settings,
  onUpdate,
  onClose,
  onTestAlarm,
}: SettingsModalProps) => {
  const [local, setLocal] = useState({ ...settings });

  const handleSave = () => {
    onUpdate(local);
    onClose();
  };

  const update = (key: keyof TimerSettings, value: any) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-dark rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <h2 className="font-display font-bold text-white text-xl">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Timer Duration Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Timer Duration</h3>

            <SettingSlider
              label="🍅 Pomodoro"
              value={local.pomodoro}
              min={5}
              max={60}
              step={1}
              unit="min"
              color="#f97316"
              onChange={v => update('pomodoro', v)}
            />

            <SettingSlider
              label="☕ Short Break"
              value={local.shortBreak}
              min={1}
              max={30}
              step={1}
              unit="min"
              color="#22d3ee"
              onChange={v => update('shortBreak', v)}
            />

            <SettingSlider
              label="🌙 Long Break"
              value={local.longBreak}
              min={5}
              max={60}
              step={1}
              unit="min"
              color="#a78bfa"
              onChange={v => update('longBreak', v)}
            />

            <SettingSlider
              label="🔄 Long Break After"
              value={local.longBreakInterval}
              min={2}
              max={8}
              step={1}
              unit="pomodoros"
              color="#f472b6"
              onChange={v => update('longBreakInterval', v)}
            />
          </section>

          {/* Automation Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Automation</h3>

            <ToggleSetting
              label="Auto-start Breaks"
              description="Automatically start break timer after each Pomodoro"
              checked={local.autoStartBreaks}
              onChange={v => update('autoStartBreaks', v)}
            />

            <ToggleSetting
              label="Auto-start Pomodoros"
              description="Automatically start next Pomodoro after each break"
              checked={local.autoStartPomodoros}
              onChange={v => update('autoStartPomodoros', v)}
            />
          </section>

          {/* Alarm Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Alarm</h3>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Sound</label>
              <div className="grid grid-cols-2 gap-2">
                {SOUND_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update('alarmSound', opt.value)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                    style={{
                      background: local.alarmSound === opt.value ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${local.alarmSound === opt.value ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: local.alarmSound === opt.value ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <SettingSlider
              label="🔊 Volume"
              value={Math.round(local.alarmVolume * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              color="#a78bfa"
              onChange={v => update('alarmVolume', v / 100)}
            />

            <button
              onClick={() => {
                onUpdate(local);
                onTestAlarm();
              }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-white/80 hover:text-white"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              🔔 Test Alarm
            </button>
          </section>

          {/* Notification permission */}
          <section>
            <NotificationPermission />
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Slider component
const SettingSlider = ({ label, value, min, max, step, unit, color, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm text-white/70">{label}</label>
      <span className="text-sm font-bold" style={{ color }}>
        {value} {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full"
      style={{ accentColor: color }}
    />
    <div className="flex justify-between text-xs text-white/20">
      <span>{min} {unit}</span>
      <span>{max} {unit}</span>
    </div>
  </div>
);

// Toggle component
const ToggleSetting = ({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div
    className="flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    onClick={() => onChange(!checked)}
  >
    <div>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="text-xs text-white/35 mt-0.5">{description}</p>
    </div>
    <div
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 ml-4"
      style={{ background: checked ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </div>
  </div>
);

// Notification permission component
const NotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const request = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (permission === 'granted') {
    return (
      <div
        className="flex items-center gap-2 p-3 rounded-xl text-sm text-green-400"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <span>✅</span>
        <span>Browser notifications enabled</span>
      </div>
    );
  }

  return (
    <button
      onClick={request}
      className="w-full flex items-center gap-2 p-3 rounded-xl text-sm transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span>🔔</span>
      <span className="text-white/60">Enable browser notifications</span>
      <span className="ml-auto text-xs text-violet-400">Enable →</span>
    </button>
  );
};
