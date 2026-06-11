import React, { useMemo } from 'react';
import { GREEN_HABITS } from '../constants/carbonFactors.js';
import { getStreakLevel } from '../utils/aiEngine.js';

const CATEGORY_COLORS = {
  transport: '#3b82f6',
  energy:    '#f59e0b',
  food:      '#10b981',
  water:     '#06b6d4',
  general:   '#8b5cf6',
};

const DIFFICULTY_LABELS = {
  easy:   { label: 'Easy',   color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard:   { label: 'Hard',   color: '#ef4444' },
};

/**
 * Habit Tracker — users tick off completed green habits to earn XP.
 * Accessible: checkbox semantics, progress bar, keyboard-navigable list.
 *
 * @param {{ habits: Array, onToggle: Function, xpPoints: number }} props
 */
export function HabitTracker({ habits, onToggle, xpPoints }) {
  const completedCount = habits.filter(h => h.completed).length;
  const totalPoints = habits.filter(h => h.completed).reduce((s, h) => s + h.points, 0);
  const streak = useMemo(() => getStreakLevel(completedCount), [completedCount]);
  const pct = Math.round((completedCount / habits.length) * 100);

  return (
    <section aria-labelledby="habits-heading" className="card">
      <div className="card__header">
        <h2 id="habits-heading" className="card__title">
          <span aria-hidden="true">✅</span> Green Habits
        </h2>
        <div className="streak-badge" style={{ background: streak.color + '22', color: streak.color }} aria-label={`Streak level: ${streak.level}`}>
          <span aria-hidden="true">{streak.emoji}</span> {streak.level}
        </div>
      </div>

      {/* Progress */}
      <div className="habit-progress" aria-label={`${completedCount} of ${habits.length} habits completed`}>
        <div className="habit-progress__text">
          <span>{completedCount}/{habits.length} completed</span>
          <span className="xp-earned" aria-label={`${totalPoints} XP earned`}>+{totalPoints} XP earned</span>
        </div>
        <div
          className="habit-progress__bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% habits completed`}
        >
          <div className="habit-progress__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Habit List */}
      <ul className="habit-list" aria-label="Green habits checklist">
        {habits.map(habit => (
          <li key={habit.id} className="habit-item">
            <label
              htmlFor={`habit-${habit.id}`}
              className={`habit-label ${habit.completed ? 'habit-label--done' : ''}`}
              style={habit.completed ? { borderLeft: `3px solid ${CATEGORY_COLORS[habit.category]}` } : {}}
            >
              <input
                id={`habit-${habit.id}`}
                type="checkbox"
                checked={habit.completed}
                onChange={() => onToggle(habit.id)}
                className="habit-checkbox"
                aria-label={`${habit.text} — ${habit.points} XP`}
              />
              <span className="habit-icon" aria-hidden="true">{habit.icon}</span>
              <span className="habit-text">{habit.text}</span>
              <div className="habit-meta">
                <span
                  className="habit-difficulty"
                  style={{ color: DIFFICULTY_LABELS[habit.difficulty]?.color }}
                  aria-label={`Difficulty: ${habit.difficulty}`}
                >
                  {DIFFICULTY_LABELS[habit.difficulty]?.label}
                </span>
                <span className="habit-points" aria-label={`${habit.points} experience points`}>
                  +{habit.points} XP
                </span>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
