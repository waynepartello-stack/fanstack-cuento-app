import { cn } from '@/lib/utils'

interface ScoreBarProps {
  score: number | null
  max?: number
  showValue?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export default function ScoreBar({ score, max = 100, showValue = true, size = 'sm', className }: ScoreBarProps) {
  if (score == null) return <span className="text-white/30">—</span>

  const pct = Math.min((score / max) * 100, 100)
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 65 ? 'bg-yellow-500' :
    score >= 50 ? 'bg-orange-500' :
    'bg-red-500'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('score-bar flex-1', size === 'md' ? 'h-2' : 'h-1.5')}>
        <div
          className={cn('score-bar-fill', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className={cn(
          'tabular-nums font-medium text-right w-7',
          size === 'md' ? 'text-sm' : 'text-xs',
          score >= 80 ? 'text-emerald-400' :
          score >= 65 ? 'text-yellow-400' :
          score >= 50 ? 'text-orange-400' :
          'text-red-400'
        )}>
          {score.toFixed(0)}
        </span>
      )}
    </div>
  )
}
