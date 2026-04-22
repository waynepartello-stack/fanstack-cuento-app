import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white/20" />
      </div>
      <h3 className="text-sm font-medium text-white/40 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-white/25 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
