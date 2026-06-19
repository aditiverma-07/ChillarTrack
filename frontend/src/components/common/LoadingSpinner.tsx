import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'rounded-full border-primary-200 border-t-primary-600 animate-spin',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
