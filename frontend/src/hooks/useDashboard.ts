import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services'
import type { DashboardSummary, AnalyticsData } from '@/types'

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  })

  const summary: DashboardSummary | undefined = data?.data

  return { summary, isLoading, error }
}

export function useAnalytics(range: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => dashboardService.getAnalytics({ range }),
  })

  const analytics: AnalyticsData | undefined = data?.data

  return { analytics, isLoading }
}
