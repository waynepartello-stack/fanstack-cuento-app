'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DEMO_TEAM_ID } from '@/lib/utils'
import { Module } from '@/types/database'
import ModuleCard from '@/components/ui/ModuleCard'
import { Store, Search, Zap, Megaphone, Ticket, Handshake, Coffee, Share2, Tv } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MarketplacePage() {
  const [modules, setModules] = useState<Module[]>([])
  const [activeModuleSlugs, setActiveModuleSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [modRes, tmRes] = await Promise.all([
        supabase.from('modules').select('*').order('created_at'),
        supabase.from('team_modules').select('*, modules(slug)').eq('team_id', DEMO_TEAM_ID).eq('is_active', true),
      ])
      setModules(modRes.data || [])
      const slugs = new Set<string>(
        (tmRes.data || []).map((tm: any) => tm.modules?.slug).filter(Boolean)
      )
      setActiveModuleSlugs(slugs)
      setLoading(false)
    }
    load()
  }, [])

  const categories = ['all', ...new Set(modules.map(m => m.category).filter(Boolean))] as string[]

  const filtered = modules.filter(m => {
    const matchCat = catFilter === 'all' || m.category === catFilter
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const activeModules = filtered.filter(m => activeModuleSlugs.has(m.slug))
  const availableModules = filtered.filter(m => !activeModuleSlugs.has(m.slug))

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Store className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Module Marketplace</h1>
            <p className="text-sm text-white/40">Expand your FanStack with additional intelligence modules</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.08] rounded-lg pl-8 pr-4 py-1.5 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 w-48"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn('pill cursor-pointer transition-all capitalize', 
                catFilter === cat
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Modules */}
      {activeModules.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Active Modules</h2>
            <span className="pill bg-emerald-500/15 text-emerald-400">{activeModules.length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeModules.map(mod => (
              <ModuleCard key={mod.id} module={mod} isActive />
            ))}
          </div>
        </div>
      )}

      {/* Available Modules */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Available Modules</h2>
          <span className="pill bg-indigo-500/15 text-indigo-400">{availableModules.filter(m => m.is_available).length} available</span>
          {availableModules.filter(m => !m.is_available).length > 0 && (
            <span className="pill bg-white/5 text-white/30">{availableModules.filter(m => !m.is_available).length} coming soon</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableModules.map(mod => (
            <ModuleCard key={mod.id} module={mod} showActivate />
          ))}
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="card border-dashed border-indigo-500/20 p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
          <Zap className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white/70 mb-1">More modules coming</h3>
        <p className="text-xs text-white/35 max-w-md mx-auto">
          FanStack is expanding. Broadcast Analytics, Concessions Intelligence, and Social Listening are in development. 
          Contact your CUENTO rep to join the early access list.
        </p>
        <button className="btn-secondary mt-4 text-xs">Request Early Access</button>
      </div>
    </div>
  )
}
