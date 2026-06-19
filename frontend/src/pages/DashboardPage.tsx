import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Wallet, TrendingDown, TrendingUp, PiggyBank,
  Target, Bell, ArrowRight, Calendar
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { DashboardSummary, Transaction, SavingsGoal, Notification } from '@/types'
import { format, parseISO } from 'date-fns'

const CATEGORY_COLORS: Record<string, string> = {
  FOOD_AND_TAPRI: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  TRANSPORT: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  ENTERTAINMENT: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  SHOPPING: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
  EDUCATION: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  PRINTOUTS_AND_STATIONERY: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  MISCELLANEOUS: 'text-slate-600 bg-slate-100 dark:bg-slate-700/50',
}

function StatCard({ label, value, icon: Icon, color, subtext }: {
  label: string; value: string; icon: React.ElementType; color: string; subtext?: string
}) {
  return (
    <motion.div className="card hover-lift" whileHover={{ y: -2 }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-dark-text">{value}</p>
      {subtext && <p className="text-xs text-slate-400 dark:text-dark-muted mt-1">{subtext}</p>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  })

  const summary: DashboardSummary = data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-dark-muted">Failed to load dashboard. Is the backend running?</p>
      </div>
    )
  }

  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'
  const fmt = (n: number) => `${currency}${n?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? 0}`
  const budgetPct = Math.min(100, (summary.totalSpentThisMonth / summary.monthlyBudget) * 100)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="section-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="section-subtitle">Here's your financial snapshot for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Budget"
          value={fmt(summary.monthlyBudget)}
          icon={Wallet}
          color="bg-primary-100 dark:bg-primary-900/30 text-primary-600"
        />
        <StatCard
          label="Spent This Month"
          value={fmt(summary.totalSpentThisMonth)}
          icon={TrendingDown}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
          subtext={`${budgetPct.toFixed(0)}% of budget`}
        />
        <StatCard
          label="Remaining"
          value={fmt(summary.remainingBalance)}
          icon={TrendingUp}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
        />
        <StatCard
          label="Total Savings"
          value={fmt(summary.totalSavings)}
          icon={PiggyBank}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
        />
      </div>

      {/* Budget Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-dark-text">Monthly Budget Usage</h3>
            <p className="text-sm text-slate-500 dark:text-dark-muted">
              {fmt(summary.totalSpentThisMonth)} of {fmt(summary.monthlyBudget)} used
            </p>
          </div>
          <span className={`badge ${budgetPct > 80 ? 'badge-red' : budgetPct > 60 ? 'badge-orange' : 'badge-green'}`}>
            {budgetPct.toFixed(0)}%
          </span>
        </div>
        <div className="progress-bar h-4">
          <motion.div
            className={`progress-fill ${budgetPct > 80 ? 'bg-red-500' : budgetPct > 60 ? 'bg-orange-500' : 'blue-gradient'}`}
            style={{ height: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: `${budgetPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-dark-muted mt-2">
          <span>₹0</span>
          <span>{fmt(summary.monthlyBudget)}</span>
        </div>
      </div>

      {/* Bottom section: Recent Tx + Active Goals + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-dark-text">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {summary.recentTransactions?.length === 0 ? (
            <p className="text-slate-400 dark:text-dark-muted text-sm text-center py-8">No transactions yet. Add your first expense!</p>
          ) : (
            <div className="space-y-3">
              {summary.recentTransactions?.map((tx: Transaction) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${CATEGORY_COLORS[tx.category] || 'bg-slate-100 text-slate-600'}`}>
                    {tx.categoryDisplay?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-dark-text text-sm truncate">
                      {tx.description || tx.categoryDisplay}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-dark-muted">
                      {format(parseISO(tx.transactionDate), 'MMM d, h:mm a')} · {tx.paymentMethodDisplay}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-dark-text flex-shrink-0">
                    -{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Active Goals */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-600" /> Goals
              </h3>
              <Link to="/goals" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {summary.activeGoals?.slice(0, 2).map((goal: SavingsGoal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900 dark:text-dark-text truncate">{goal.title}</span>
                    <span className="text-slate-500 dark:text-dark-muted flex-shrink-0 ml-2">{goal.progressPercentage?.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div
                      className="progress-fill blue-gradient"
                      style={{ height: '100%' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progressPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-dark-muted mt-1">
                    {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}
                  </p>
                </div>
              ))}
              {!summary.activeGoals?.length && (
                <p className="text-sm text-slate-400 dark:text-dark-muted text-center py-2">No active goals</p>
              )}
            </div>
          </div>

          {/* Latest Alerts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-600" /> Alerts
                {summary.unreadNotificationsCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {summary.unreadNotificationsCount}
                  </span>
                )}
              </h3>
              <Link to="/alerts" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {summary.latestAlerts?.slice(0, 3).map((alert: Notification) => (
                <div key={alert.id} className={`p-3 rounded-xl text-sm ${!alert.read ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-slate-50 dark:bg-dark-bg'}`}>
                  <p className="text-slate-700 dark:text-dark-text text-xs leading-relaxed">{alert.message}</p>
                  <p className="text-xs text-slate-400 dark:text-dark-muted mt-1">
                    {format(parseISO(alert.createdAt), 'MMM d')}
                  </p>
                </div>
              ))}
              {!summary.latestAlerts?.length && (
                <p className="text-sm text-slate-400 dark:text-dark-muted text-center py-2">No alerts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
