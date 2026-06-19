import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react'
import { dashboardService } from '@/services'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { AnalyticsData } from '@/types'
import { useAuth } from '@/context/AuthContext'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#64748b']

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

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => dashboardService.getAnalytics({ range }),
  })

  const analytics: AnalyticsData = data?.data

  if (isLoading) return <LoadingSpinner className="py-24" />

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  }

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
        {/* Daily Spending Line Chart */}
        <ChartCard title="Daily Spending" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics?.dailySpending ?? []}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${currency}${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${currency}${v}`, 'Spent']} />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fill="url(#spendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Pie Chart */}
        <ChartCard title="Spending by Category" icon={PieIcon}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.categoryBreakdown ?? []}
                dataKey="amount"
                nameKey="categoryDisplay"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
              >
                {analytics?.categoryBreakdown?.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${currency}${v}`, 'Amount']} />
              <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly Spending Bar Chart */}
        <ChartCard title="Weekly Spending" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.weeklySpending ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${currency}${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${currency}${v}`, 'Spent']} />
              <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Trend Area Chart */}
        <ChartCard title="6-Month Trend" icon={Calendar}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.monthlyTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${currency}${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${currency}${v}`, 'Spent']} />
              <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
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
