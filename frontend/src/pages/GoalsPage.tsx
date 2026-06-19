import { useState } from 'react'
import { Plus, Target, Trophy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useGoals } from '@/hooks/useGoals'
import { useToast } from '@/components/common/Toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import GoalCard from '@/components/goals/GoalCard'
import GoalForm from '@/components/goals/GoalForm'
import type { GoalFormData } from '@/components/goals/GoalForm'
import type { SavingsGoal } from '@/types'

export default function GoalsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'

  const {
    activeGoals, completedGoals, isLoading,
    createMutation, updateMutation, deleteMutation,
  } = useGoals()

  const handleSubmit = (data: GoalFormData) => {
    const payload = { ...data, targetDate: data.targetDate || undefined, imageUrl: data.imageUrl || undefined }
    if (editGoal) {
      updateMutation.mutate({ id: editGoal.id, data: payload }, {
        onSuccess: () => { setShowModal(false); setEditGoal(null); toast.success('Goal updated!') },
        onError: () => toast.error('Failed to update goal'),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { setShowModal(false); toast.success('Goal created!') },
        onError: () => toast.error('Failed to create goal'),
      })
    }
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditGoal(goal)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Goal deleted'),
      onError: () => toast.error('Failed to delete goal'),
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditGoal(null)
  }

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

      {/* Goals grid */}
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
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currency={currency}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Completed Goals
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currency={currency}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editGoal={editGoal}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
