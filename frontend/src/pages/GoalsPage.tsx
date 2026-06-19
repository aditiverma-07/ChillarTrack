import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Target, Trash2, Edit3, X, Trophy, Calendar } from 'lucide-react'
import { goalService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { SavingsGoal } from '@/types'
import { format, parseISO } from 'date-fns'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  targetAmount: z.number({ invalid_type_error: 'Target amount is required' }).positive(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function GoalsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'
  const fmt = (n: number) => `${currency}${n?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getAll,
  })

  const goals: SavingsGoal[] = data?.data ?? []
  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentAmount: 0 }
  })

  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); closeModal() }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => goalService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); closeModal() }
  })

  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  })

  const openEdit = (goal: SavingsGoal) => {
    setEditGoal(goal)
    setValue('title', goal.title)
    setValue('targetAmount', goal.targetAmount)
    setValue('currentAmount', goal.currentAmount)
    setValue('targetDate', goal.targetDate ?? '')
    setValue('imageUrl', goal.imageUrl ?? '')
    setShowModal(true)
  }

  const onSubmit = (data: FormData) => {
    const payload = { ...data, targetDate: data.targetDate || undefined, imageUrl: data.imageUrl || undefined }
    if (editGoal) updateMutation.mutate({ id: editGoal.id, data: payload })
    else createMutation.mutate(payload)
  }

  const closeModal = () => { setShowModal(false); setEditGoal(null); reset() }

  const GoalCard = ({ goal }: { goal: SavingsGoal }) => (
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
            onClick={() => openEdit(goal)}
            className="btn-ghost !p-2 text-primary-600"
            aria-label="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            id={`delete-goal-${goal.id}`}
            onClick={() => { if (confirm('Delete this goal?')) deleteMutation.mutate(goal.id) }}
            className="btn-ghost !p-2 text-red-500"
            aria-label="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) return <LoadingSpinner className="py-24" />

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Savings Goals</h1>
          <p className="section-subtitle">{activeGoals.length} active · {completedGoals.length} completed</p>
        </div>
        <button id="add-goal-btn" onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Active Goals */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="card text-center py-16">
          <Target className="w-14 h-14 text-slate-300 dark:text-dark-border mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 dark:text-dark-muted text-lg mb-2">No goals yet</h3>
          <p className="text-slate-400 dark:text-dark-muted mb-6">Set your first savings goal – laptop, trip, or whatever you're dreaming of!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Your First Goal
          </button>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" /> Active Goals
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Completed Goals
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} />
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="card !rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                    {editGoal ? 'Edit Goal' : 'New Savings Goal'}
                  </h2>
                  <button onClick={closeModal} className="btn-ghost !p-2" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} id="goal-form" className="space-y-4">
                  <div>
                    <label htmlFor="goal-title" className="label">Goal Title</label>
                    <input id="goal-title" type="text" {...register('title')} placeholder="e.g., New Laptop 💻" className={`input ${errors.title ? 'input-error' : ''}`} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="goal-target" className="label">Target Amount (₹)</label>
                    <input id="goal-target" type="number" step="1" {...register('targetAmount', { valueAsNumber: true })} placeholder="45000" className={`input ${errors.targetAmount ? 'input-error' : ''}`} />
                    {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="goal-current" className="label">Current Savings (₹)</label>
                    <input id="goal-current" type="number" step="1" {...register('currentAmount', { valueAsNumber: true })} placeholder="0" className="input" />
                  </div>
                  <div>
                    <label htmlFor="goal-date" className="label">Target Date (optional)</label>
                    <input id="goal-date" type="date" {...register('targetDate')} className="input" />
                  </div>
                  <div>
                    <label htmlFor="goal-image" className="label">Goal Image URL (optional)</label>
                    <input id="goal-image" type="url" {...register('imageUrl')} placeholder="https://..." className={`input ${errors.imageUrl ? 'input-error' : ''}`} />
                    {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" id="save-goal-btn" disabled={isSubmitting} className="btn-primary flex-1">
                      {isSubmitting ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
