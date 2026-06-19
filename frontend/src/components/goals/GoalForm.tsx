import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import Modal from '@/components/common/Modal'
import type { SavingsGoal } from '@/types'

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  targetAmount: z.number({ invalid_type_error: 'Target amount is required' }).positive(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type GoalFormData = z.infer<typeof goalSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GoalFormData) => void
  editGoal?: SavingsGoal | null
  isSubmitting?: boolean
}

export default function GoalForm({
  isOpen,
  onClose,
  onSubmit,
  editGoal,
  isSubmitting = false,
}: Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { currentAmount: 0 },
  })

  // Populate form when editing
  useEffect(() => {
    if (editGoal) {
      setValue('title', editGoal.title)
      setValue('targetAmount', editGoal.targetAmount)
      setValue('currentAmount', editGoal.currentAmount)
      setValue('targetDate', editGoal.targetDate ?? '')
      setValue('imageUrl', editGoal.imageUrl ?? '')
    }
  }, [editGoal, setValue])

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editGoal ? 'Edit Goal' : 'New Savings Goal'}
    >
      <form onSubmit={handleSubmit(onSubmit)} id="goal-form" className="space-y-4">
        <div>
          <label htmlFor="goal-title" className="label">Goal Title</label>
          <input
            id="goal-title"
            type="text"
            {...register('title')}
            placeholder="e.g., New Laptop 💻"
            className={`input ${errors.title ? 'input-error' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="goal-target" className="label">Target Amount (₹)</label>
          <input
            id="goal-target"
            type="number"
            step="1"
            {...register('targetAmount', { valueAsNumber: true })}
            placeholder="45000"
            className={`input ${errors.targetAmount ? 'input-error' : ''}`}
          />
          {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>}
        </div>

        <div>
          <label htmlFor="goal-current" className="label">Current Savings (₹)</label>
          <input
            id="goal-current"
            type="number"
            step="1"
            {...register('currentAmount', { valueAsNumber: true })}
            placeholder="0"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="goal-date" className="label">Target Date (optional)</label>
          <input id="goal-date" type="date" {...register('targetDate')} className="input" />
        </div>

        <div>
          <label htmlFor="goal-image" className="label">Goal Image URL (optional)</label>
          <input
            id="goal-image"
            type="url"
            {...register('imageUrl')}
            placeholder="https://..."
            className={`input ${errors.imageUrl ? 'input-error' : ''}`}
          />
          {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" id="save-goal-btn" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
