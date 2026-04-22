import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, subtitle, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {badge && (
            <span className="pill pill-purple">{badge}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
