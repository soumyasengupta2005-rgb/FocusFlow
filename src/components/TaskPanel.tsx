import { useState } from 'react';
import { Task } from '../hooks/useTimer';

interface TaskPanelProps {
  tasks: Task[];
  activeTaskId: string | null;
  pomodoroCount: number;
  onAddTask: (title: string, pomodoros: number) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onSetActive: (id: string | null) => void;
  onClearCompleted: () => void;
}

export const TaskPanel = ({
  tasks,
  activeTaskId,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onSetActive,
  onClearCompleted,
}: TaskPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), pomodoros);
    setTitle('');
    setPomodoros(1);
    setShowForm(false);
  };

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-white text-base uppercase tracking-widest opacity-80">
          Tasks
        </h2>
        <div className="flex gap-2">
          {doneTasks.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Clear done
            </button>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-200"
            style={{
              background: showForm ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.12)',
              color: '#fb923c',
              border: '1px solid rgba(249,115,22,0.25)',
            }}
          >
            <span className="text-lg leading-none">{showForm ? '−' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in glass rounded-2xl p-4 space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What are you working on?"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          <div className="flex items-center gap-3">
            <label className="text-white/50 text-xs whitespace-nowrap">🍅 Pomodoros:</label>
            <input
              type="number"
              value={pomodoros}
              onChange={e => setPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={20}
              className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-orange-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="ml-auto px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(249,115,22,0.4)',
              }}
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {pendingTasks.length === 0 && doneTasks.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            <div className="text-3xl mb-2">📝</div>
            <p>No tasks yet. Add one to get started!</p>
          </div>
        )}

        {pendingTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isActive={activeTaskId === task.id}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onSetActive={() => onSetActive(activeTaskId === task.id ? null : task.id)}
          />
        ))}

        {doneTasks.length > 0 && (
          <>
            <div className="text-white/20 text-xs uppercase tracking-widest pt-2 pb-1 pl-1">
              Completed ({doneTasks.length})
            </div>
            {doneTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={false}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onSetActive={() => {}}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}

const TaskItem = ({ task, isActive, onToggle, onDelete, onSetActive }: TaskItemProps) => {
  return (
    <div
      className={`task-item group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer animate-slide-in ${
        isActive
          ? 'border-orange-500/40 bg-orange-500/10'
          : task.done
          ? 'border-white/5 bg-white/3 opacity-50'
          : 'border-white/8 bg-white/5 hover:bg-white/8 hover:border-white/15'
      }`}
      onClick={onSetActive}
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.done
            ? 'border-green-500 bg-green-500'
            : 'border-white/30 hover:border-orange-400'
        }`}
      >
        {task.done && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Task text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.done ? 'line-through text-white/30' : 'text-white/85'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {Array.from({ length: task.pomodoros }).map((_, i) => (
            <span
              key={i}
              className={`text-xs ${i < task.completedPomodoros ? 'opacity-100' : 'opacity-30'}`}
            >
              🍅
            </span>
          ))}
          <span className="text-white/30 text-xs ml-1">
            {task.completedPomodoros}/{task.pomodoros}
          </span>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && !task.done && (
        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
      )}

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="task-delete flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
