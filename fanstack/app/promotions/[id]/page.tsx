'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatNumber, formatCurrency, formatPct, formatPctAbs, formatMultiple, formatDate, roiColor, PROMO_TYPE_LABELS, cn } from '@/lib/utils'
import { PromotionWithMetrics } from '@/types/database'
import KpiCard from '@/components/ui/KpiCard'
import ScoreBar from '@/components/ui/ScoreBar'
import { ArrowLeft, Megaphone, Calendar, Users, DollarSign, TrendingUp, Mail, Share2 } from 'lucide-react'
import Link from 'next/link'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'

export default function PromotionDetailPage() {
  const { id } = useParams()
  const [promo, setPromo] = useState<PromotionWithMetrics | null>(null)
  const [cohort, setCohort] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [promoRes, cohortRes] = await Promise.all([
        supabase.from('promotions').select(`*, promotion_metrics(*), events(*)`).eq('id', id).single(),
        supabase.from('fan_acquisition_cohorts').select('*').eq('promotion_id', id).single(),
      ])
      setPromo(promoRes.data as any)
      setCohort(cohortRes.data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-48" />
          <div className="h-32 bg-white/5 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({length:4}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!promo) return <div className="p-6 text-white/50">Promotion not found.</div>

  const m = promo.promotion_metrics?.[0]
  const event = promo.events

  const radarData = m ? [
    { metric: 'Attendance Lift', Your: Math.min((m.attendance_lift_pct || 0) / 30 * 100, 100), League: 65 },
    { metric: 'Show Rate', Your: m.show_rate || 0, League: 84 },
    { metric: 'ROI', Your: Math.min((m.roi || 0) / 5 * 100, 100), League: 36 },
    { metric: 'First-Timers', Your: Math.min((m.first_time_attendees || 0) / 800 * 100, 100), League: 50 },
    { metric: 'Return Rate', Your: m.return_rate || 0, League: 48 },
    { metric: 'Media Value', Your: Math.min((m.media_value || 0) / 60000 * 100, 100), League: 55 },
  ] : []

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      {/* Back */}
      <Link href="/promotions" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Promotions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-semibold text-white">{promo.name}</h1>
            <span className={cn('pill text-xs', {
              'bg-violet-500/15 text-violet-400': promo.type === 'giveaway',
              'bg-cyan-500/15 text-cyan-400': promo.type === 'theme_night',
              'bg-emerald-500/15 text-emerald-400': promo.type === 'ticket_promo',
              'bg-orange-500/15 text-orange-400': promo.type === 'community',
            })}>
              {PROMO_TYPE_LABELS[promo.type || ''] || promo.type}
            </span>
            <span className={cn('pill text-xs', {
              'bg-emerald-500/15 text-emerald-400': promo.status === 'completed',
              'bg-blue-500/15 text-blue-400': promo.status === 'planned',
            })}>
              {promo.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(event?.game_date)}</span>
            {promo.sponsor && <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" />Sponsored by {promo.sponsor}</span>}
            {promo.cost && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />Cost: {formatCurrency(promo.cost)}</span>}
          </div>
          {promo.description && (
            <p className="text-sm text-white/50 mt-2 max-w-xl">{promo.description}</p>
          )}
        </div>
      </div>

      {m ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Actual Attendance" value={formatNumber(m.actual_attendance)} trend={m.attendance_lift_pct || 0} trendLabel={`${formatPct(m.attendance_lift_pct)} vs baseline`} />
            <KpiCard label="Show Rate" value={formatPctAbs(m.show_rate)} subtitle={`Projected: ${formatNumber(m.projected_attendance)}`} />
            <KpiCard label="Promotion ROI" value={formatMultiple(m.roi)} trend={(m.roi || 0) >= 1.5 ? 1 : -1} trendLabel={(m.roi || 0) >= 1.5 ? 'Above target' : 'Below 1.5x target'} />
            <KpiCard label="Revenue Lift" value={formatCurrency(m.revenue_lift)} trend={(m.revenue_lift || 0) > 0 ? 1 : -1} trendLabel="vs baseline game" />
          </div>

          <div className="grid grid-cols-12 gap-5 mb-6">
            {/* Attendance breakdown */}
            <div className="col-span-12 lg:col-span-5 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Attendance Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Actual Attendance', value: m.actual_attendance, max: 8500, color: 'bg-indigo-500' },
                  { label: 'Projected Attendance', value: m.projected_attendance, max: 8500, color: 'bg-cyan-500' },
                  { label: 'Baseline (Non-Promo Avg)', value: m.baseline_attendance, max: 8500, color: 'bg-white/20' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">{item.label}</span>
                      <span className="font-semibold text-white tabular-nums">{formatNumber(item.value)}</span>
                    </div>
                    <div className="score-bar h-2">
                      <div
                        className={`h-full rounded-sm transition-all ${item.color}`}
                        style={{ width: `${((item.value || 0) / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Attendance Lift</span>
                    <span className={cn('font-semibold tabular-nums', (m.attendance_lift || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      +{formatNumber(m.attendance_lift)} ({formatPct(m.attendance_lift_pct)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar */}
            <div className="col-span-12 lg:col-span-4 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-2">Performance vs League Avg</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} />
                  <Radar name="You" dataKey="Your" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Radar name="League Avg" dataKey="League" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.05)" />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Key metrics */}
            <div className="col-span-12 lg:col-span-3 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Marketing Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Social Impressions', value: formatNumber(m.social_impressions) },
                  { label: 'Media Value', value: formatCurrency(m.media_value) },
                  { label: 'Email Open Rate', value: formatPctAbs((m.email_opens || 0) * 100) },
                  { label: 'Email Click Rate', value: formatPctAbs((m.email_clicks || 0) * 100) },
                  { label: 'First-Time Attendees', value: formatNumber(m.first_time_attendees) },
                  { label: '90-Day Return Rate', value: formatPctAbs(m.return_rate) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-white/45">{item.label}</span>
                    <span className="font-medium text-white/85 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fan Acquisition Cohort */}
          {cohort && (
            <div className="card p-5 mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Fan Acquisition Cohort</h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="stat-label mb-1">First-Time Fans</div>
                  <div className="text-xl font-semibold text-white tabular-nums">{formatNumber(cohort.first_time_fans)}</div>
                </div>
                {[
                  { label: '30-Day Return', val: cohort.return_rate_30d, count: cohort.returned_30d },
                  { label: '60-Day Return', val: cohort.return_rate_60d, count: cohort.returned_60d },
                  { label: '90-Day Return', val: cohort.return_rate_90d, count: cohort.returned_90d },
                  { label: 'Avg Spend', val: null, custom: formatCurrency(cohort.avg_spend) },
                ].map(item => (
                  <div key={item.label}>
                    <div className="stat-label mb-1">{item.label}</div>
                    <div className={cn('text-xl font-semibold tabular-nums',
                      item.val != null && item.val >= 50 ? 'text-emerald-400' :
                      item.val != null && item.val >= 30 ? 'text-yellow-400' :
                      item.val != null ? 'text-red-400' : 'text-white'
                    )}>
                      {item.custom || formatPctAbs(item.val)}
                    </div>
                    {item.count != null && (
                      <div className="text-xs text-white/30">{formatNumber(item.count)} fans</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-white/40 text-sm">No metrics available for this promotion yet.</p>
        </div>
      )}
    </div>
  )
}
