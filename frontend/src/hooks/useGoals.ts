import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalService } from '@/services'
import type { SavingsGoal } from '@/types'

export function useGoals() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getAll,
  })

  const goals: SavingsGoal[] = data?.data ?? []
  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
  }

  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => goalService.update(id, data),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: invalidateAll,
  })

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
