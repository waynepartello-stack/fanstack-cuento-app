// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Alert, Recommendation, Module } from '@/types/database'
import { DEMO_TEAM_ID } from '@/lib/utils'
import KpiCard from '@/components/ui/KpiCard'
import AlertFeed from '@/components/ui/AlertFeed'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import ModuleCard from '@/components/ui/ModuleCard'
import { ArrowRight, Calendar, TrendingUp, Users, DollarSign, Star, ChevronRight, Megaphone, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [activeModuleSlugs, setActiveModuleSlugs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [alertsRes, recsRes, modulesRes, teamModulesRes] = await Promise.all([
        supabase.from('alerts').select('*').eq('team_id', DEMO_TEAM_ID).order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('team_id', DEMO_TEAM_ID).eq('is_dismissed', false).order('priority'),
        supabase.from('modules').select('*').order('created_at'),
        supabase.from('team_modules').select('*, modules(slug)').eq('team_id', DEMO_TEAM_ID).eq('is_active', true),
      ])

      setAlerts(alertsRes.data || [])
      setRecs(recsRes.data || [])
      setModules(modulesRes.data || [])

      const slugs = new Set<string>(
        (teamModulesRes.data || []).map((tm: any) => tm.modules?.slug).filter(Boolean)
      )
      setActiveModuleSlugs(slugs)
      setLoading(false)
    }
    load()
  }, [])

  const activeModules = modules.filter((m) => activeModuleSlugs.has(m.slug))
  const availableModules = modules.filter((m) => !activeModuleSlugs.has(m.slug))
  const unreadAlerts = alerts.filter((a) => !a.is_read)

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Good morning, Jordan 👋</h1>
            <p className="text-sm text-white/40 mt-0.5">Lakeland Storm · 2023–24 Season · Home dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">Next game:</span>
            <span className="pill bg-indigo-500/15 text-indigo-300 text-xs">
              <Calendar className="w-3 h-3" />
              Apr 14 vs Sioux Falls
            </span>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <KpiCard
          label="Season Avg Attendance"
          value="7,832"
          trend={12.4}
          trendLabel="+12.4% vs last season"
          subtitle="of 8,500 capacity"
        />
        <KpiCard
          label="Promotion ROI (Season)"
          value="2.6x"
          trend={18.2}
          trendLabel="+18.2% vs last season"
          subtitle="avg across 12 promos"
        />
        <KpiCard
          label="Experience Score"
          value="78.4"
          trend={5.8}
          trendLabel="+5.8pts vs league avg"
          subtitle="crowd reaction avg"
          accent
        />
        <KpiCard
          label="First-Time Fans (Season)"
          value="4,420"
          trend={22.1}
          trendLabel="+22.1% vs last season"
          subtitle="62% return rate"
        />
      </div>

      {/* Active Modules + Alerts row */}
      <div className="grid grid-cols-12 gap-5 mb-7">
        {/* Active Modules */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Active Modules</h2>
            <Link href="/marketplace" className="btn-ghost text-xs">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card h-36 animate-pulse bg-white/5" />
              ))
            ) : (
              activeModules.map((mod) => (
                <ModuleCard key={mod.id} module={mod} isActive />
              ))
            )}
          </div>

          {/* Upcoming Events watchlist */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Upcoming Events</h2>
            </div>
            <div className="card divide-y divide-white/[0.04]">
              {[
                { date: 'Apr 14', name: 'Military Appreciation Night', opponent: 'vs Sioux Falls Skyforce', projected: '7,800', promo: 'Community Night', promoStyle: 'pill-info' },
                { date: 'Apr 20', name: 'Season Finale / Fan Fest', opponent: 'vs Raptors 905', projected: '8,400', promo: 'Giveaway', promoStyle: 'pill-purple' },
              ].map((event) => (
                <div key={event.date} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-center w-10">
                      <div className="text-[10px] text-white/25 uppercase">Apr</div>
                      <div className="text-lg font-semibold text-white/80 leading-tight">{event.date.split(' ')[1]}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/85">{event.name}</div>
                      <div className="text-xs text-white/35">{event.opponent}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`pill text-xs ${event.promoStyle}`}>{event.promo}</span>
                    <div className="text-right">
                      <div className="text-xs text-white/60 font-medium">{event.projected}</div>
                      <div className="text-[10px] text-white/25">projected</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Alerts</h2>
              {unreadAlerts.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </div>
          </div>
          <AlertFeed alerts={alerts} compact limit={5} />
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">AI Recommendations</h2>
          <span className="text-xs text-white/30">{recs.length} active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-white/5" />
            ))
          ) : (
            <RecommendationPanel recommendations={recs} limit={6} />
          )}
        </div>
      </div>

      {/* Marketplace teaser */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Add Modules</h2>
          <Link href="/marketplace" className="btn-ghost text-xs">
            Browse Marketplace <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {availableModules.slice(0, 5).map((mod) => (
            <ModuleCard key={mod.id} module={mod} showActivate />
          ))}
        </div>
      </div>
    </div>
  )
}
