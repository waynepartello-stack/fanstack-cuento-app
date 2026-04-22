import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: number // positive = up, negative = down, 0 = flat
  trendLabel?: string
  className?: string
  accent?: boolean
}

export default function KpiCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  className,
  accent,
}: KpiCardProps) {
  const trendPositive = trend != null && trend > 0
  const trendNegative = trend != null && trend < 0

  return (
    <div className={cn('kpi-card', accent && 'border-indigo-500/30 bg-indigo-950/20', className)}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend != null) && (
        <div className="flex items-center gap-2 mt-1">
          {trend != null && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                trendPositive && 'text-emerald-400',
                trendNegative && 'text-red-400',
                !trendPositive && !trendNegative && 'text-white/40'
              )}
            >
              {trendPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendNegative ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {trendLabel || `${Math.abs(trend).toFixed(1)}%`}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-white/30">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  )
}
