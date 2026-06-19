import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2, Edit3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { useToast } from '@/components/common/Toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import TransactionForm from '@/components/transactions/TransactionForm'
import type { TransactionFormData } from '@/components/transactions/TransactionForm'
import type { Transaction, TransactionCategory } from '@/types'
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

const CATEGORY_COLORS: Record<string, string> = {
  FOOD_AND_TAPRI: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700',
  TRANSPORT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700',
  ENTERTAINMENT: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700',
  SHOPPING: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700',
  EDUCATION: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700',
  PRINTOUTS_AND_STATIONERY: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700',
  MISCELLANEOUS: 'bg-slate-100 dark:bg-slate-700 text-slate-700',
}

export default function TransactionsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'
  const fmt = (n: number) => `${currency}${n?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  const {
    transactions, totalPages, totalElements, isLoading,
    page, setPage, search, setSearch, categoryFilter, setCategoryFilter,
    createMutation, updateMutation, deleteMutation,
  } = useTransactions()

  const handleSubmit = (data: TransactionFormData) => {
    if (editTx) {
      updateMutation.mutate({ id: editTx.id, data }, {
        onSuccess: () => { setShowModal(false); setEditTx(null); toast.success('Transaction updated!') },
        onError: () => toast.error('Failed to update transaction'),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setShowModal(false); toast.success('Expense added!') },
        onError: () => toast.error('Failed to add expense'),
      })
    }
  }

  const openEdit = (tx: Transaction) => {
    setEditTx(tx)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTx(null)
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
                  onClick={() => {
                    if (confirm('Delete this transaction?')) {
                      deleteMutation.mutate(tx.id, {
                        onSuccess: () => toast.success('Transaction deleted'),
                        onError: () => toast.error('Failed to delete'),
                      })
                    }
                  }}
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

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editTransaction={editTx}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
