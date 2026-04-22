import Link from 'next/link'
import { Megaphone, Zap, Ticket, Handshake, Coffee, Share2, Tv, ArrowRight, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Module } from '@/types/database'

const iconMap: Record<string, React.ElementType> = {
  Megaphone,
  Zap,
  Ticket,
  Handshake,
  Coffee,
  Share2,
  Tv,
}

const moduleHref: Record<string, string> = {
  promotions: '/promotions',
  experience: '/experience',
}

interface ModuleCardProps {
  module: Module
  isActive?: boolean
  showActivate?: boolean
}

export default function ModuleCard({ module, isActive, showActivate }: ModuleCardProps) {
  const Icon = iconMap[module.icon || ''] || Zap
  const href = moduleHref[module.slug] || '/dashboard'

  const categoryColor: Record<string, string> = {
    Marketing: 'text-violet-400 bg-violet-500/10',
    Operations: 'text-cyan-400 bg-cyan-500/10',
    Revenue: 'text-emerald-400 bg-emerald-500/10',
    Partnerships: 'text-orange-400 bg-orange-500/10',
    Media: 'text-blue-400 bg-blue-500/10',
  }

  return (
    <div className={cn(
      'card-hover p-5 relative group',
      isActive && 'border-indigo-500/30',
      !module.is_available && 'opacity-60'
    )}>
      {isActive && (
        <span className="absolute top-3 right-3 pill bg-emerald-500/15 text-emerald-400 text-[10px]">
          <Check className="w-2.5 h-2.5" /> Active
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center',
          categoryColor[module.category || ''] || 'bg-white/10 text-white/60'
        )}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">{module.name}</h3>
          <span className={cn(
            'text-[10px] font-medium uppercase tracking-wider',
            (categoryColor[module.category || ''] || 'text-white/30').split(' ')[0]
          )}>
            {module.category}
          </span>
        </div>
      </div>
      <p className="text-xs text-white/45 leading-relaxed mb-4">{module.description}</p>
      <div className="flex items-center justify-between">
        {isActive ? (
          <Link
            href={href}
            className="btn-ghost text-xs px-2 py-1 text-indigo-400 hover:text-indigo-300"
          >
            Open <ArrowRight className="w-3 h-3" />
          </Link>
        ) : showActivate ? (
          <button className="btn-secondary text-xs py-1 px-3">
            <Plus className="w-3 h-3" />
            {module.is_available ? 'Add Module' : 'Coming Soon'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
