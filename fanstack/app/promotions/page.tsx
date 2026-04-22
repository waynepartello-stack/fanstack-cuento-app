'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DEMO_TEAM_ID, formatNumber, formatCurrency, formatPct, formatPctAbs, formatMultiple, formatDate, roiColor, PROMO_TYPE_LABELS, cn } from '@/lib/utils'
import { PromotionWithMetrics, Alert, Recommendation, PromotionMetrics } from '@/types/database'
import KpiCard from '@/components/ui/KpiCard'
import AlertFeed from '@/components/ui/AlertFeed'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import ScoreBar from '@/components/ui/ScoreBar'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, Cell
} from 'recharts'
import { Megaphone, TrendingUp, Users, DollarSign, ArrowRight, Filter, Star, ChevronRight, Calendar, Target } from 'lucide-react'

type Tab = 'dashboard' | 'promotions' | 'benchmarks' | 'acquisition'

const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: 'rgba(255,255,255,0.08)',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1d2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/80">{p.name}:</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function PromotionsPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [promotions, setPromotions] = useState<PromotionWithMetrics[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [benchmarks, setBenchmarks] = useState<any[]>([])
  const [cohorts, setCohorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [promoRes, alertRes, recRes, benchRes, cohortRes] = await Promise.all([
        supabase.from('promotions').select(`*, promotion_metrics(*), events(*)`).eq('team_id', DEMO_TEAM_ID).order('created_at'),
        supabase.from('alerts').select('*').eq('team_id', DEMO_TEAM_ID).eq('module_slug', 'promotions').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('team_id', DEMO_TEAM_ID).eq('module_slug', 'promotions').eq('is_dismissed', false).order('priority'),
        supabase.from('promotion_benchmarks').select('*').eq('team_id', DEMO_TEAM_ID),
        supabase.from('fan_acquisition_cohorts').select(`*, promotions(name, type)`).order('first_time_fans', { ascending: false }),
      ])
      setPromotions(promoRes.data as any || [])
      setAlerts(alertRes.data || [])
      setRecs(recRes.data || [])
      setBenchmarks(benchRes.data || [])
      setCohorts(cohortRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const completed = promotions.filter(p => p.status === 'completed')
  const metrics = completed.map(p => p.promotion_metrics?.[0]).filter(Boolean) as PromotionMetrics[]

  const totalRevLift = metrics.reduce((s, m) => s + (m.revenue_lift || 0), 0)
  const avgRoi = metrics.length ? metrics.reduce((s, m) => s + (m.roi || 0), 0) / metrics.length : 0
  const avgLift = metrics.length ? metrics.reduce((s, m) => s + (m.attendance_lift_pct || 0), 0) / metrics.length : 0
  const totalFirstTime = metrics.reduce((s, m) => s + (m.first_time_attendees || 0), 0)

  // Chart data
  const attendanceChartData = completed.map(p => {
    const m = p.promotion_metrics?.[0]
    return {
      name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
      Actual: m?.actual_attendance || 0,
      Projected: m?.projected_attendance || 0,
      Baseline: m?.baseline_attendance || 0,
    }
  })

  const roiChartData = completed.map(p => {
    const m = p.promotion_metrics?.[0]
    return {
      name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      ROI: +(m?.roi || 0).toFixed(2),
      type: p.type,
    }
  })

  const filteredPromos = typeFilter === 'all' ? promotions : promotions.filter(p => p.type === typeFilter)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'promotions', label: 'Promotions List' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'acquisition', label: 'Fan Acquisition' },
  ] as const

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Promotions</h1>
            <p className="text-sm text-white/40">2023–24 Season · Lakeland Storm</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Calendar className="w-4 h-4" />
            Season
          </button>
          <button className="btn-primary">
            + New Promotion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px',
              tab === t.id
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Avg Attendance Lift" value={formatPct(avgLift)} trend={avgLift} trendLabel="vs baseline" />
            <KpiCard label="Avg Promotion ROI" value={formatMultiple(avgRoi)} trend={8.2} trendLabel="+0.4x vs last season" />
            <KpiCard label="Total Revenue Lift" value={formatCurrency(totalRevLift)} trend={14.6} trendLabel="vs last season" />
            <KpiCard label="First-Time Fans" value={formatNumber(totalFirstTime)} trend={22.1} trendLabel="vs last season" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8 card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/80">Attendance: Actual vs Projected vs Baseline</h3>
                  <p className="text-xs text-white/35 mt-0.5">All completed promotions this season</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attendanceChartData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={v => (v/1000)+'k'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 8 }} />
                  <Bar dataKey="Baseline" fill="rgba(255,255,255,0.08)" radius={[2,2,0,0]} />
                  <Bar dataKey="Projected" fill={CHART_COLORS.secondary} opacity={0.5} radius={[2,2,0,0]} />
                  <Bar dataKey="Actual" fill={CHART_COLORS.primary} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* ROI by type */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Avg ROI by Type</h3>
                <div className="space-y-3">
                  {benchmarks.map(b => (
                    <div key={b.id} className="flex items-center gap-2">
                      <span className="text-xs text-white/50 w-24 truncate">{PROMO_TYPE_LABELS[b.promotion_type]}</span>
                      <div className="flex-1">
                        <ScoreBar score={(b.avg_roi / 5) * 100} max={100} showValue={false} />
                      </div>
                      <span className={cn('text-xs font-semibold w-8 text-right tabular-nums', roiColor(b.avg_roi))}>
                        {b.avg_roi.toFixed(1)}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Alerts */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Promotions Alerts</h3>
                <AlertFeed alerts={alerts} compact limit={3} />
              </div>
            </div>
          </div>

          {/* ROI bar chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">ROI by Promotion</h3>
            <p className="text-xs text-white/35 mb-4">Minimum target: 1.5x</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roiChartData} margin={{ top: 0, right: 0, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1.5} stroke={CHART_COLORS.warning} strokeDasharray="4 4" label={{ value: 'Target 1.5x', fill: 'rgba(245,158,11,0.7)', fontSize: 10 }} />
                <Bar dataKey="ROI" radius={[3,3,0,0]}>
                  {roiChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.ROI >= 1.5 ? CHART_COLORS.primary : CHART_COLORS.danger} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recommendations</h2>
            </div>
            <RecommendationPanel recommendations={recs} />
          </div>
        </div>
      )}

      {/* PROMOTIONS LIST TAB */}
      {tab === 'promotions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'giveaway', 'theme_night', 'ticket_promo', 'community'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'pill cursor-pointer transition-all',
                  typeFilter === type
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                )}
              >
                {type === 'all' ? 'All Types' : PROMO_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th>Promotion</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actual Att.</th>
                  <th>Lift</th>
                  <th>Show Rate</th>
                  <th>ROI</th>
                  <th>1st-Timers</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={10}><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filteredPromos.map(p => {
                  const m = p.promotion_metrics?.[0]
                  return (
                    <tr key={p.id} className="cursor-pointer">
                      <td>
                        <div className="font-medium text-white/90">{p.name}</div>
                        {p.sponsor && <div className="text-[10px] text-white/30">Sponsored by {p.sponsor}</div>}
                      </td>
                      <td>
                        <span className={cn('pill text-xs', {
                          'bg-violet-500/15 text-violet-400': p.type === 'giveaway',
                          'bg-cyan-500/15 text-cyan-400': p.type === 'theme_night',
                          'bg-emerald-500/15 text-emerald-400': p.type === 'ticket_promo',
                          'bg-orange-500/15 text-orange-400': p.type === 'community',
                        })}>
                          {PROMO_TYPE_LABELS[p.type || ''] || p.type}
                        </span>
                      </td>
                      <td className="text-white/50">{formatDate(p.events?.game_date)}</td>
                      <td className="font-medium tabular-nums">{m ? formatNumber(m.actual_attendance) : '—'}</td>
                      <td>
                        {m ? (
                          <span className={cn('font-medium tabular-nums text-xs', m.attendance_lift_pct! >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {formatPct(m.attendance_lift_pct)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="tabular-nums">{m ? formatPctAbs(m.show_rate) : '—'}</td>
                      <td>
                        {m ? (
                          <span className={cn('font-semibold tabular-nums', roiColor(m.roi))}>
                            {formatMultiple(m.roi)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="tabular-nums">{m ? formatNumber(m.first_time_attendees) : '—'}</td>
                      <td>
                        <span className={cn('pill text-xs', {
                          'bg-emerald-500/15 text-emerald-400': p.status === 'completed',
                          'bg-blue-500/15 text-blue-400': p.status === 'planned',
                          'bg-yellow-500/15 text-yellow-400': p.status === 'active',
                        })}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/promotions/${p.id}`} className="text-indigo-400 hover:text-indigo-300">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BENCHMARKS TAB */}
      {tab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Your Avg Lift (Giveaway)" value="+24.1%" trend={4.7} trendLabel="vs league avg +19.4%" />
            <KpiCard label="Your Avg ROI (Giveaway)" value="2.2x" trend={22.2} trendLabel="vs league avg 1.8x" />
            <KpiCard label="Your Show Rate" value="84.6%" trend={0.4} trendLabel="vs league avg 84.2%" />
            <KpiCard label="Benchmark Sample" value="160+" subtitle="G League promotions this season" />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Your Performance vs League Benchmarks</h3>
            <p className="text-xs text-white/35 mb-5">NBA G League · 2023–24 Season · Based on {benchmarks.reduce((s,b) => s + (b.sample_size || 0), 0)}+ data points</p>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th>Promotion Type</th>
                    <th>Your Avg Lift</th>
                    <th>League Avg Lift</th>
                    <th>Your ROI</th>
                    <th>League ROI</th>
                    <th>Your Show Rate</th>
                    <th>League Show Rate</th>
                    <th>Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map(b => {
                    const yourPromos = completed.filter(p => p.type === b.promotion_type)
                    const yourMetrics = yourPromos.map(p => p.promotion_metrics?.[0]).filter(Boolean) as PromotionMetrics[]
                    const yourLift = yourMetrics.length ? yourMetrics.reduce((s, m) => s + (m.attendance_lift_pct || 0), 0) / yourMetrics.length : null
                    const yourRoi = yourMetrics.length ? yourMetrics.reduce((s, m) => s + (m.roi || 0), 0) / yourMetrics.length : null
                    const yourShow = yourMetrics.length ? yourMetrics.reduce((s, m) => s + (m.show_rate || 0), 0) / yourMetrics.length : null
                    return (
                      <tr key={b.id}>
                        <td className="font-medium text-white/80">{PROMO_TYPE_LABELS[b.promotion_type]}</td>
                        <td>
                          <span className={cn('font-semibold', (yourLift || 0) >= b.avg_attendance_lift_pct ? 'text-emerald-400' : 'text-red-400')}>
                            {yourLift != null ? formatPct(yourLift) : '—'}
                          </span>
                        </td>
                        <td className="text-white/50">{formatPct(b.avg_attendance_lift_pct)}</td>
                        <td>
                          <span className={cn('font-semibold', roiColor(yourRoi))}>
                            {yourRoi != null ? formatMultiple(yourRoi) : '—'}
                          </span>
                        </td>
                        <td className="text-white/50">{formatMultiple(b.avg_roi)}</td>
                        <td>
                          <span className={cn('font-semibold', (yourShow || 0) >= b.avg_show_rate ? 'text-emerald-400' : 'text-white/70')}>
                            {yourShow != null ? formatPctAbs(yourShow) : '—'}
                          </span>
                        </td>
                        <td className="text-white/50">{formatPctAbs(b.avg_show_rate)}</td>
                        <td className="text-white/30">{b.sample_size}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAN ACQUISITION TAB */}
      {tab === 'acquisition' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total First-Timers" value={formatNumber(totalFirstTime)} trend={22.1} trendLabel="vs last season" />
            <KpiCard label="Avg 30-Day Return" value="39.4%" trend={5.2} trendLabel="vs last season" />
            <KpiCard label="Avg 90-Day Return" value="52.8%" trend={8.1} trendLabel="vs last season" />
            <KpiCard label="Avg Spend (First-Timers)" value="$35.40" trend={4.3} trendLabel="vs all-fan avg" />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Fan Acquisition Cohorts</h3>
            <p className="text-xs text-white/35 mb-5">Tracking return rates for first-time fans acquired through each promotion</p>
            <table className="data-table">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th>Promotion</th>
                  <th>First-Timers</th>
                  <th>30-Day Return</th>
                  <th>60-Day Return</th>
                  <th>90-Day Return</th>
                  <th>Avg Spend</th>
                  <th>Retention Score</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-medium text-white/85">{c.promotions?.name || c.cohort_label}</div>
                      {c.promotions?.type && (
                        <div className="text-[10px] text-white/30">{PROMO_TYPE_LABELS[c.promotions.type]}</div>
                      )}
                    </td>
                    <td className="font-semibold tabular-nums">{formatNumber(c.first_time_fans)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={cn('tabular-nums text-xs font-medium',
                          (c.return_rate_30d || 0) >= 40 ? 'text-emerald-400' :
                          (c.return_rate_30d || 0) >= 25 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {formatPctAbs(c.return_rate_30d)}
                        </span>
                        <span className="text-white/30 text-xs">({formatNumber(c.returned_30d)})</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn('tabular-nums text-xs font-medium',
                        (c.return_rate_60d || 0) >= 50 ? 'text-emerald-400' :
                        (c.return_rate_60d || 0) >= 35 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {formatPctAbs(c.return_rate_60d)}
                      </span>
                    </td>
                    <td>
                      <span className={cn('tabular-nums text-xs font-medium',
                        (c.return_rate_90d || 0) >= 55 ? 'text-emerald-400' :
                        (c.return_rate_90d || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {formatPctAbs(c.return_rate_90d)}
                      </span>
                    </td>
                    <td className="tabular-nums">{formatCurrency(c.avg_spend)}</td>
                    <td className="w-32">
                      <ScoreBar score={c.return_rate_90d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Retention chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Retention Curve by Promo Type</h3>
            <p className="text-xs text-white/35 mb-4">Average 30/60/90 day return rates by promotion type</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { period: '30 Days', Giveaway: 39, 'Theme Night': 24, Community: 68, 'Ticket Promo': 51 },
                { period: '60 Days', Giveaway: 48, 'Theme Night': 31, Community: 78, 'Ticket Promo': 62 },
                { period: '90 Days', Giveaway: 54, 'Theme Night': 36, Community: 84, 'Ticket Promo': 70 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={v => v + '%'} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                <Line type="monotone" dataKey="Giveaway" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary }} />
                <Line type="monotone" dataKey="Theme Night" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary }} />
                <Line type="monotone" dataKey="Community" stroke={CHART_COLORS.success} strokeWidth={2} dot={{ fill: CHART_COLORS.success }} />
                <Line type="monotone" dataKey="Ticket Promo" stroke={CHART_COLORS.warning} strokeWidth={2} dot={{ fill: CHART_COLORS.warning }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
