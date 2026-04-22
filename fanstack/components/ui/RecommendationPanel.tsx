import Link from 'next/link'
import { Recommendation } from '@/types/database'
import { Megaphone, Zap, ArrowRight, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const moduleIcon: Record<string, React.ElementType> = {
  promotions: Megaphone,
  experience: Zap,
}

const priorityLabel: Record<number, string> = {
  1: 'High Priority',
  2: 'Medium Priority',
  3: 'Opportunity',
}

const priorityStyle: Record<number, string> = {
  1: 'bg-red-500/10 border-red-500/20',
  2: 'bg-yellow-500/10 border-yellow-500/20',
  3: 'bg-blue-500/10 border-blue-500/20',
}

interface RecommendationCardProps {
  rec: Recommendation
  compact?: boolean
}

export function RecommendationCard({ rec, compact }: RecommendationCardProps) {
  const Icon = moduleIcon[rec.module_slug || ''] || Lightbulb

  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all',
      priorityStyle[rec.priority] || 'bg-white/5 border-white/10'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          rec.module_slug === 'promotions' ? 'bg-violet-500/20' : 'bg-cyan-500/20'
        )}>
          <Icon className={cn('w-3.5 h-3.5', rec.module_slug === 'promotions' ? 'text-violet-400' : 'text-cyan-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              {priorityLabel[rec.priority] || 'Recommendation'}
            </span>
          </div>
          <p className={cn('font-medium text-white/90', compact ? 'text-xs' : 'text-sm')}>
            {rec.title}
          </p>
          {!compact && rec.body && (
            <p className="text-xs text-white/50 mt-1 leading-relaxed">{rec.body}</p>
          )}
          {rec.action_label && rec.action_url && (
            <Link
              href={rec.action_url}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 font-medium transition-colors"
            >
              {rec.action_label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

interface RecommendationPanelProps {
  recommendations: Recommendation[]
  limit?: number
}

export default function RecommendationPanel({ recommendations, limit }: RecommendationPanelProps) {
  const visible = limit ? recommendations.slice(0, limit) : recommendations

  if (visible.length === 0) {
    return (
      <div className="text-center py-8 text-white/25 text-sm">No recommendations</div>
    )
  }

  return (
    <div className="space-y-3">
      {visible.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </div>
  )
}
