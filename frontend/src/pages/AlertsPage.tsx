import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, BellOff, AlertTriangle, TrendingUp, Trophy, Info } from 'lucide-react'
import { notificationService } from '@/services'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Notification, NotificationType } from '@/types'
import { format, parseISO } from 'date-fns'

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  BUDGET_ALERT: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  SPENDING_SPIKE: { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ENTERTAINMENT_LIMIT: { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  GOAL_REMINDER: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  WEEKLY_SUMMARY: { icon: Info, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  ACHIEVEMENT_EARNED: { icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  SYSTEM: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-700' },
}

export default function AlertsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
  })

  const notifications: Notification[] = data?.data ?? []
  const unread = notifications.filter(n => !n.read)

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllRead = () => {
    unread.forEach(n => markReadMutation.mutate(n.id))
  }

  if (isLoading) return <LoadingSpinner className="py-24" />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Alerts & Notifications</h1>
          <p className="section-subtitle">
            {unread.length > 0 ? `${unread.length} unread alerts` : 'All caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button id="mark-all-read-btn" onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <BellOff className="w-14 h-14 text-slate-300 dark:text-dark-border mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 dark:text-dark-muted text-lg mb-2">No notifications yet</h3>
          <p className="text-slate-400 dark:text-dark-muted">Alerts will appear here when you have budget updates or achievement unlocks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, i) => {
            const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM
            const Icon = config.icon
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card !p-4 flex items-start gap-4 transition-all cursor-default ${
                  !notification.read
                    ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                    : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!notification.read ? 'font-semibold text-slate-900 dark:text-dark-text' : 'text-slate-700 dark:text-dark-muted'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-dark-muted mt-1">
                    {format(parseISO(notification.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <button
                      id={`mark-read-${notification.id}`}
                      onClick={() => markReadMutation.mutate(notification.id)}
                      className="btn-ghost !p-1.5 text-xs text-slate-500"
                      aria-label="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
