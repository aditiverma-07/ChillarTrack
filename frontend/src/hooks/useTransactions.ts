import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services'
import type { Transaction, TransactionCategory } from '@/types'
import type { TransactionFormData } from '@/components/transactions/TransactionForm'

export function useTransactions() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, search, categoryFilter],
    queryFn: () => transactionService.getAll({
      page, size: 20, sortBy: 'transactionDate', direction: 'desc',
      search: search || undefined,
      category: categoryFilter || undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const transactions: Transaction[] = data?.data?.content ?? []
  const totalPages: number = data?.data?.totalPages ?? 0
  const totalElements: number = data?.data?.totalElements ?? 0

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormData) => transactionService.create({
      ...data,
      transactionDate: new Date(data.transactionDate).toISOString(),
    }),
    onSuccess: invalidateAll,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionFormData }) =>
      transactionService.update(id, {
        ...data,
        transactionDate: new Date(data.transactionDate).toISOString(),
      }),
    onSuccess: invalidateAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: invalidateAll,
  })

  return {
    transactions,
    totalPages,
    totalElements,
    isLoading,
    page,
    setPage,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
