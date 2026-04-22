import { cn, timeAgo } from '@/lib/utils'
import { AlertTriangle, Info, CheckCircle, AlertCircle, Megaphone, Zap } from 'lucide-react'
import { Alert } from '@/types/database'

const alertConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
}

const moduleIcon: Record<string, React.ElementType> = {
  promotions: Megaphone,
  experience: Zap,
}

interface AlertItemProps {
  alert: Alert
  compact?: boolean
}

export function AlertItem({ alert, compact }: AlertItemProps) {
  const config = alertConfig[alert.type] || alertConfig.info
  const Icon = config.icon
  const ModIcon = moduleIcon[alert.module_slug || ''] || Info

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg border transition-all',
        config.bg,
        !alert.is_read && 'ring-1 ring-inset ring-white/5'
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium text-white/90', compact && 'text-xs')}>
            {alert.title}
          </p>
          {!alert.is_read && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
          )}
        </div>
        {!compact && alert.body && (
          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{alert.body}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('pill text-[10px]', 
            alert.module_slug === 'promotions' ? 'bg-violet-500/15 text-violet-400' : 'bg-cyan-500/15 text-cyan-400'
          )}>
            <ModIcon className="w-2.5 h-2.5" />
            {alert.module_slug}
          </span>
          <span className="text-[10px] text-white/25">{timeAgo(alert.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

interface AlertFeedProps {
  alerts: Alert[]
  compact?: boolean
  limit?: number
}

export default function AlertFeed({ alerts, compact, limit }: AlertFeedProps) {
  const visible = limit ? alerts.slice(0, limit) : alerts

  if (visible.length === 0) {
    return (
      <div className="text-center py-8 text-white/25 text-sm">No alerts</div>
    )
  }

  return (
    <div className="space-y-2">
      {visible.map((alert) => (
        <AlertItem key={alert.id} alert={alert} compact={compact} />
      ))}
    </div>
  )
}
