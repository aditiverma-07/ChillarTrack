import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Trash2, Edit3, X, Filter, ChevronDown } from 'lucide-react'
import { transactionService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Transaction, TransactionCategory, PaymentMethod } from '@/types'
import { format, parseISO } from 'date-fns'

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'FOOD_AND_TAPRI', label: '🍕 Food & Tapri' },
  { value: 'TRANSPORT', label: '🚌 Transport' },
  { value: 'PRINTOUTS_AND_STATIONERY', label: '📄 Printouts & Stationery' },
  { value: 'ENTERTAINMENT', label: '🎮 Entertainment' },
  { value: 'SHOPPING', label: '🛍️ Shopping' },
  { value: 'EDUCATION', label: '📚 Education' },
  { value: 'MISCELLANEOUS', label: '🗂️ Miscellaneous' },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: '💵 Cash' },
  { value: 'UPI', label: '📱 UPI' },
  { value: 'DEBIT_CARD', label: '💳 Debit Card' },
  { value: 'CREDIT_CARD', label: '💳 Credit Card' },
]

const CATEGORY_COLORS: Record<string, string> = {
  FOOD_AND_TAPRI: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700',
  TRANSPORT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700',
  ENTERTAINMENT: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700',
  SHOPPING: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700',
  EDUCATION: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700',
  PRINTOUTS_AND_STATIONERY: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700',
  MISCELLANEOUS: 'bg-slate-100 dark:bg-slate-700 text-slate-700',
}

const schema = z.object({
  amount: z.number({ invalid_type_error: 'Amount is required' }).positive('Amount must be positive'),
  category: z.enum(['FOOD_AND_TAPRI', 'TRANSPORT', 'PRINTOUTS_AND_STATIONERY', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'MISCELLANEOUS']),
  description: z.string().optional(),
  transactionDate: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD']),
})

type FormData = z.infer<typeof schema>

export default function TransactionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | ''>('')
  const [page, setPage] = useState(0)

  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'
  const fmt = (n: number) => `${currency}${n?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

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

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transactionDate: new Date().toISOString().slice(0, 16),
      paymentMethod: 'UPI',
      category: 'FOOD_AND_TAPRI',
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => transactionService.create({
      ...data,
      transactionDate: new Date(data.transactionDate).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setShowModal(false)
      reset()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      transactionService.update(id, { ...data, transactionDate: new Date(data.transactionDate).toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setShowModal(false)
      setEditTx(null)
      reset()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const openEdit = (tx: Transaction) => {
    setEditTx(tx)
    setValue('amount', tx.amount)
    setValue('category', tx.category)
    setValue('description', tx.description || '')
    setValue('transactionDate', tx.transactionDate.slice(0, 16))
    setValue('paymentMethod', tx.paymentMethod)
    setShowModal(true)
  }

  const onSubmit = (data: FormData) => {
    if (editTx) updateMutation.mutate({ id: editTx.id, data })
    else createMutation.mutate(data)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTx(null)
    reset()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Transactions</h1>
          <p className="section-subtitle">{totalElements} transactions found</p>
        </div>
        <button id="add-transaction-btn" onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-transactions"
            type="text"
            placeholder="Search by description..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="input pl-10"
          />
        </div>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value as TransactionCategory | ''); setPage(0) }}
          className="input sm:w-52"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : transactions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 dark:text-dark-muted text-lg">No transactions found.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Add your first expense
          </button>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-dark-border last:border-0 hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${CATEGORY_COLORS[tx.category]}`}>
                {tx.categoryDisplay?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-dark-text text-sm truncate">
                  {tx.description || tx.categoryDisplay}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge text-xs ${CATEGORY_COLORS[tx.category]}`}>{tx.categoryDisplay}</span>
                  <span className="text-xs text-slate-400 dark:text-dark-muted">{tx.paymentMethodDisplay}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900 dark:text-dark-text">-{fmt(tx.amount)}</p>
                <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">
                  {format(parseISO(tx.transactionDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  id={`edit-tx-${tx.id}`}
                  onClick={() => openEdit(tx)}
                  className="btn-ghost !p-2 text-primary-600"
                  aria-label="Edit transaction"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  id={`delete-tx-${tx.id}`}
                  onClick={() => { if (confirm('Delete this transaction?')) deleteMutation.mutate(tx.id) }}
                  className="btn-ghost !p-2 text-red-500"
                  aria-label="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-50 dark:border-dark-border">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-dark-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="card !rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                    {editTx ? 'Edit Transaction' : 'Add Expense'}
                  </h2>
                  <button onClick={closeModal} className="btn-ghost !p-2" aria-label="Close modal">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} id="transaction-form" className="space-y-4">
                  <div>
                    <label htmlFor="tx-amount" className="label">Amount (₹)</label>
                    <input
                      id="tx-amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { valueAsNumber: true })}
                      placeholder="Enter amount"
                      className={`input ${errors.amount ? 'input-error' : ''}`}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="tx-category" className="label">Category</label>
                    <select id="tx-category" {...register('category')} className="input">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tx-description" className="label">Description (optional)</label>
                    <input
                      id="tx-description"
                      type="text"
                      {...register('description')}
                      placeholder="What did you spend on?"
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="tx-date" className="label">Date & Time</label>
                    <input id="tx-date" type="datetime-local" {...register('transactionDate')} className="input" />
                    {errors.transactionDate && <p className="text-red-500 text-xs mt-1">{errors.transactionDate.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="tx-payment" className="label">Payment Method</label>
                    <select id="tx-payment" {...register('paymentMethod')} className="input">
                      {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" id="save-transaction-btn" disabled={isSubmitting} className="btn-primary flex-1">
                      {isSubmitting ? 'Saving...' : editTx ? 'Update' : 'Add Expense'}
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
