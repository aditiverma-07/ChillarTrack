import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAnalytics } from '@/hooks/useDashboard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import SpendingLineChart from '@/components/charts/SpendingLineChart'
import WeeklyBarChart from '@/components/charts/WeeklyBarChart'
import CategoryPieChart, { PIE_COLORS } from '@/components/charts/CategoryPieChart'
import MonthlyAreaChart from '@/components/charts/MonthlyAreaChart'

const TIME_FILTERS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
]

function ChartCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="card">
      <h3 className="font-bold text-slate-900 dark:text-dark-text flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-primary-600" /> {title}
      </h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [range, setRange] = useState('monthly')
  const currency = user?.currency === 'INR' ? '₹' : user?.currency ?? '₹'
  const { analytics, isLoading } = useAnalytics(range)

  if (isLoading) return <LoadingSpinner className="py-24" />

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Analytics</h1>
          <p className="section-subtitle">Understand your spending patterns</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TIME_FILTERS.map(f => (
            <button
              key={f.value}
              id={`filter-${f.value}`}
              onClick={() => setRange(f.value)}
              className={range === f.value ? 'btn-primary !py-2 !px-4 text-sm' : 'btn-secondary !py-2 !px-4 text-sm'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Spending" icon={TrendingUp}>
          <SpendingLineChart data={analytics?.dailySpending ?? []} currency={currency} />
        </ChartCard>

        <ChartCard title="Spending by Category" icon={PieIcon}>
          <CategoryPieChart data={analytics?.categoryBreakdown ?? []} currency={currency} />
        </ChartCard>

        <ChartCard title="Weekly Spending" icon={BarChart3}>
          <WeeklyBarChart data={analytics?.weeklySpending ?? []} currency={currency} />
        </ChartCard>

        <ChartCard title="6-Month Trend" icon={Calendar}>
          <MonthlyAreaChart data={analytics?.monthlyTrend ?? []} currency={currency} />
        </ChartCard>
      </div>

      {/* Category breakdown table */}
      {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-dark-text mb-5">Category Breakdown</h3>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-dark-text">{cat.categoryDisplay}</span>
                  <div className="text-sm text-right">
                    <span className="font-bold text-slate-900 dark:text-dark-text">{currency}{cat.amount.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 dark:text-dark-muted ml-2">{cat.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-bar h-2.5">
                  <motion.div
                    className="progress-fill"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length], height: '100%' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
