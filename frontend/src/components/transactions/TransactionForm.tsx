import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/common/Modal'
import type { Transaction, TransactionCategory, PaymentMethod } from '@/types'
import { useEffect } from 'react'

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

export const transactionSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount is required' }).positive('Amount must be positive'),
  category: z.enum(['FOOD_AND_TAPRI', 'TRANSPORT', 'PRINTOUTS_AND_STATIONERY', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'MISCELLANEOUS']),
  description: z.string().optional(),
  transactionDate: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD']),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => void
  editTransaction?: Transaction | null
  isSubmitting?: boolean
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  editTransaction,
  isSubmitting = false,
}: Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionDate: new Date().toISOString().slice(0, 16),
      paymentMethod: 'UPI',
      category: 'FOOD_AND_TAPRI',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editTransaction) {
      setValue('amount', editTransaction.amount)
      setValue('category', editTransaction.category)
      setValue('description', editTransaction.description || '')
      setValue('transactionDate', editTransaction.transactionDate.slice(0, 16))
      setValue('paymentMethod', editTransaction.paymentMethod)
    }
  }, [editTransaction, setValue])

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editTransaction ? 'Edit Transaction' : 'Add Expense'}
    >
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
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" id="save-transaction-btn" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving...' : editTransaction ? 'Update' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
