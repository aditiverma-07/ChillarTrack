import { motion } from 'framer-motion'
import { Trophy, Calendar, Edit3, Trash2 } from 'lucide-react'
import type { SavingsGoal } from '@/types'
import { format, parseISO } from 'date-fns'

interface Props {
  goal: SavingsGoal
  currency?: string
  onEdit: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
}

export default function GoalCard({ goal, currency = '₹', onEdit, onDelete }: Props) {
  const fmt = (n: number) => `${currency}${n?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <motion.div
      className={`card hover-lift relative overflow-hidden ${goal.completed ? 'border-emerald-200 dark:border-emerald-800' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {goal.completed && (
        <div className="absolute top-3 right-3">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
      )}

      {goal.imageUrl && (
        <div className="h-32 -m-6 mb-4 overflow-hidden rounded-t-2xl">
          <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-900 dark:text-dark-text text-base pr-6">{goal.title}</h3>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-dark-muted">{fmt(goal.currentAmount)} saved</span>
          <span className="font-semibold text-slate-900 dark:text-dark-text">{goal.progressPercentage?.toFixed(0)}%</span>
        </div>
        <div className="progress-bar h-3">
          <motion.div
            className={`progress-fill ${goal.completed ? 'bg-emerald-500' : 'blue-gradient'}`}
            style={{ height: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-dark-muted mt-1">
          <span>₹0</span>
          <span>{fmt(goal.targetAmount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          {goal.remainingAmount > 0 && !goal.completed && (
            <p className="text-slate-600 dark:text-dark-muted">
              <span className="font-semibold text-primary-600">{fmt(goal.remainingAmount)}</span> remaining
            </p>
          )}
          {goal.targetDate && (
            <p className="text-slate-500 dark:text-dark-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {goal.estimatedCompletionInfo ?? format(parseISO(goal.targetDate), 'MMM d, yyyy')}
            </p>
          )}
          {goal.completed && (
            <span className="badge-green text-xs">🎉 Goal Crushed!</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            id={`edit-goal-${goal.id}`}
            onClick={() => onEdit(goal)}
            className="btn-ghost !p-2 text-primary-600"
            aria-label="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            id={`delete-goal-${goal.id}`}
            onClick={() => { if (confirm('Delete this goal?')) onDelete(goal.id) }}
            className="btn-ghost !p-2 text-red-500"
            aria-label="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
