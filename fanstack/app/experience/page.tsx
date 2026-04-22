// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DEMO_TEAM_ID, formatNumber, scoreBg, ELEMENT_TYPE_LABELS, cn } from '@/lib/utils'
import KpiCard from '@/components/ui/KpiCard'
import AlertFeed from '@/components/ui/AlertFeed'
import RecommendationPanel from '@/components/ui/RecommendationPanel'
import ScoreBar from '@/components/ui/ScoreBar'
import { Alert, Recommendation } from '@/types/database'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, Legend
} from 'recharts'
import { Zap, Filter, ArrowRight, TrendingUp, Star, Activity, Clock } from 'lucide-react'

type Tab = 'dashboard' | 'library' | 'benchmarks' | 'timeline'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1d2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2">{label || payload[0]?.payload?.name}</p>
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

export default function ExperiencePage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [elements, setElements] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [benchmarks, setBenchmarks] = useState<any[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [instances, setInstances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [elemRes, scoreRes, benchRes, alertRes, recRes, instRes] = await Promise.all([
        supabase.from('show_elements').select('*').eq('team_id', DEMO_TEAM_ID),
        supabase.from('experience_scores').select('*, show_elements(name, type, tags)').eq('venue_id', '22222222-0000-0000-0000-000000000001').order('avg_reaction_score', { ascending: false }),
        supabase.from('experience_benchmarks').select('*').eq('sport', 'Basketball'),
        supabase.from('alerts').select('*').eq('team_id', DEMO_TEAM_ID).eq('module_slug', 'experience').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('team_id', DEMO_TEAM_ID).eq('module_slug', 'experience').eq('is_dismissed', false).order('priority'),
        supabase.from('show_element_instances').select(`*, show_elements(name, type), game_moments(label, category), crowd_reactions(*), events(name, game_date)`).order('created_at', { ascending: false }).limit(40),
      ])
      setElements(elemRes.data || [])
      setScores(scoreRes.data || [])
      setBenchmarks(benchRes.data || [])
      setAlerts(alertRes.data || [])
      setRecs(recRes.data || [])
      setInstances(instRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Merged elements+scores
  const enriched = scores.map(s => ({
    ...s.show_elements,
    ...s,
    id: s.show_element_id,
  }))

  const avgReaction = scores.length ? scores.reduce((a, s) => a + (s.avg_reaction_score || 0), 0) / scores.length : 0
  const avgParticipation = scores.length ? scores.reduce((a, s) => a + (s.avg_participation_score || 0), 0) / scores.length : 0
  const topElement = scores[0]
  const bottomElement = [...scores].sort((a, b) => (a.avg_reaction_score || 0) - (b.avg_reaction_score || 0))[0]

  // Chart data
  const reactionByType = Object.entries(
    scores.reduce((acc, s) => {
      const type = s.show_elements?.type || 'other'
      if (!acc[type]) acc[type] = { sum: 0, count: 0 }
      acc[type].sum += s.avg_reaction_score || 0
      acc[type].count++
      return acc
    }, {} as Record<string, { sum: number; count: number }>)
  ).map(([type, { sum, count }]) => ({
    type: ELEMENT_TYPE_LABELS[type] || type,
    'Yours': +(sum / count).toFixed(1),
    'League Avg': +(benchmarks.find(b => b.element_type === type)?.avg_reaction_score || 68).toFixed(1),
  }))

  const filteredScores = typeFilter === 'all' ? scores : scores.filter(s => s.show_elements?.type === typeFilter)

  const uniqueTypes = [...new Set(scores.map(s => s.show_elements?.type).filter(Boolean))]

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'library', label: 'Element Library' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'timeline', label: 'Reaction Timeline' },
  ] as const

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Experience</h1>
            <p className="text-sm text-white/40">Live Show Intelligence · Lakeland Storm · Storm Arena</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="pill bg-cyan-500/10 text-cyan-400 text-xs">
            <Activity className="w-3 h-3" />
            Seeded Mode
          </div>
          <button className="btn-primary">
            + Add Element
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
              tab === t.id ? 'border-cyan-500 text-cyan-300' : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Avg Crowd Reaction" value={avgReaction.toFixed(1)} trend={5.8} trendLabel="+5.8pts vs league avg" />
            <KpiCard label="Avg Participation" value={avgParticipation.toFixed(1)} trend={3.2} trendLabel="+3.2pts vs league" />
            <KpiCard label="Top Element" value={topElement?.show_elements?.name?.split(' ').slice(0,2).join(' ') || '—'} subtitle={`Score: ${topElement?.avg_reaction_score?.toFixed(1)}`} accent />
            <KpiCard label="Elements in Library" value={elements.length} subtitle={`${scores.length} scored this season`} />
          </div>

          <div className="grid grid-cols-12 gap-5">
            {/* Reaction by type chart */}
            <div className="col-span-12 lg:col-span-8 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Avg Reaction Score by Element Type</h3>
              <p className="text-xs text-white/35 mb-4">Your venue vs NBA G League benchmark</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={reactionByType} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis type="category" dataKey="type" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} width={76} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                  <Bar dataKey="League Avg" fill="rgba(255,255,255,0.12)" radius={[0,3,3,0]} />
                  <Bar dataKey="Yours" fill="#06b6d4" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Top/bottom performers */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Top & Bottom Performers</h3>
                <div className="space-y-2">
                  {scores.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs text-white/70 flex-1 truncate">{s.show_elements?.name}</span>
                      <span className="text-xs font-semibold text-emerald-400 tabular-nums">{s.avg_reaction_score?.toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/[0.06] my-2" />
                  {[...scores].sort((a,b) => (a.avg_reaction_score||0)-(b.avg_reaction_score||0)).slice(0,2).map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-white/70 flex-1 truncate">{s.show_elements?.name}</span>
                      <span className="text-xs font-semibold text-red-400 tabular-nums">{s.avg_reaction_score?.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Experience Alerts</h3>
                <AlertFeed alerts={alerts} compact limit={3} />
              </div>
            </div>
          </div>

          {/* Reaction trend */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Season Reaction Trend (by Game)</h3>
            <p className="text-xs text-white/35 mb-4">Average crowd reaction score per game this season</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={[
                { game: 'G1', score: 74, participation: 70 },
                { game: 'G2', score: 76, participation: 72 },
                { game: 'G3', score: 72, participation: 68 },
                { game: 'G4', score: 79, participation: 76 },
                { game: 'G5', score: 75, participation: 71 },
                { game: 'G6', score: 81, participation: 78 },
                { game: 'G7', score: 78, participation: 74 },
                { game: 'G8', score: 83, participation: 80 },
                { game: 'G9', score: 80, participation: 77 },
                { game: 'G10', score: 85, participation: 82 },
                { game: 'G11', score: 82, participation: 79 },
                { game: 'G12', score: 87, participation: 84 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="game" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
                <Line type="monotone" dataKey="score" name="Reaction Score" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="participation" name="Participation" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recommendations</h2>
            </div>
            <RecommendationPanel recommendations={recs} />
          </div>
        </div>
      )}

      {/* ELEMENT LIBRARY */}
      {tab === 'library' && (
        <div className="space-y-4">
          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', ...uniqueTypes].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'pill cursor-pointer transition-all',
                  typeFilter === type
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                )}
              >
                {type === 'all' ? 'All Types' : ELEMENT_TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th>Element</th>
                  <th>Type</th>
                  <th>Reaction Score</th>
                  <th>Participation</th>
                  <th>Reaction Speed</th>
                  <th>Play Count</th>
                  <th>Repeatability</th>
                  <th>Venue Rank</th>
                  <th>Sport Rank</th>
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
                ) : filteredScores.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="font-medium text-white/90">{s.show_elements?.name}</div>
                      {s.show_elements?.tags?.slice(0,2).map((t: string) => (
                        <span key={t} className="inline-block text-[9px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded mr-1 mt-0.5">{t}</span>
                      ))}
                    </td>
                    <td>
                      <span className="pill text-xs bg-cyan-500/10 text-cyan-400">
                        {ELEMENT_TYPE_LABELS[s.show_elements?.type] || s.show_elements?.type}
                      </span>
                    </td>
                    <td className="w-36">
                      <ScoreBar score={s.avg_reaction_score} />
                    </td>
                    <td className="w-32">
                      <ScoreBar score={s.avg_participation_score} />
                    </td>
                    <td>
                      <span className={cn('tabular-nums text-xs font-medium',
                        (s.avg_reaction_speed || 99) <= 2 ? 'text-emerald-400' :
                        (s.avg_reaction_speed || 99) <= 3 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {s.avg_reaction_speed?.toFixed(1)}s
                      </span>
                    </td>
                    <td className="tabular-nums text-white/60">{s.play_count}</td>
                    <td className="w-28">
                      <ScoreBar score={s.repeatability_score} />
                    </td>
                    <td>
                      <span className={cn('tabular-nums font-semibold text-xs',
                        (s.venue_rank || 99) <= 3 ? 'text-emerald-400' :
                        (s.venue_rank || 99) <= 8 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        #{s.venue_rank}
                      </span>
                    </td>
                    <td>
                      <span className={cn('tabular-nums font-semibold text-xs',
                        (s.sport_rank || 99) <= 5 ? 'text-emerald-400' :
                        (s.sport_rank || 99) <= 15 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        #{s.sport_rank}
                      </span>
                    </td>
                    <td>
                      <Link href={`/experience/${s.show_element_id}`} className="text-cyan-400 hover:text-cyan-300">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BENCHMARKS */}
      {tab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Your Avg Reaction" value={avgReaction.toFixed(1)} trend={5.8} trendLabel="vs league avg 72.6" />
            <KpiCard label="Venue Rank" value="#4" subtitle="of 28 G League venues" />
            <KpiCard label="Best Category" value="Hype Video" subtitle="91.2 avg reaction score" />
            <KpiCard label="Weakest Category" value="Timeout Feature" subtitle="47.8 vs 64.2 league avg" />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-1">Your Venue vs NBA G League Benchmarks</h3>
            <p className="text-xs text-white/35 mb-5">2023–24 Season · Storm Arena</p>
            <table className="data-table">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th>Element Type</th>
                  <th>Your Avg Reaction</th>
                  <th>League Avg</th>
                  <th>Δ vs League</th>
                  <th>Your Participation</th>
                  <th>League Participation</th>
                  <th>Your React Speed</th>
                  <th>League React Speed</th>
                  <th>Sample</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map(b => {
                  const yourScores = scores.filter(s => s.show_elements?.type === b.element_type)
                  const yourAvg = yourScores.length
                    ? yourScores.reduce((a,s) => a + (s.avg_reaction_score||0), 0) / yourScores.length
                    : null
                  const yourPart = yourScores.length
                    ? yourScores.reduce((a,s) => a + (s.avg_participation_score||0), 0) / yourScores.length
                    : null
                  const yourSpeed = yourScores.length
                    ? yourScores.reduce((a,s) => a + (s.avg_reaction_speed||0), 0) / yourScores.length
                    : null
                  const delta = yourAvg != null ? yourAvg - (b.avg_reaction_score || 0) : null
                  return (
                    <tr key={b.id}>
                      <td className="font-medium text-white/80">{ELEMENT_TYPE_LABELS[b.element_type] || b.element_type}</td>
                      <td>
                        {yourAvg != null ? (
                          <span className={cn('font-semibold tabular-nums',
                            yourAvg >= (b.avg_reaction_score||0) ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {yourAvg.toFixed(1)}
                          </span>
                        ) : <span className="text-white/30">—</span>}
                      </td>
                      <td className="text-white/50 tabular-nums">{b.avg_reaction_score?.toFixed(1)}</td>
                      <td>
                        {delta != null ? (
                          <span className={cn('text-xs font-semibold tabular-nums pill',
                            delta >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          )}>
                            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="tabular-nums text-white/70">{yourPart?.toFixed(1) || '—'}</td>
                      <td className="tabular-nums text-white/50">{b.avg_participation_score?.toFixed(1)}</td>
                      <td className="tabular-nums text-white/70">{yourSpeed?.toFixed(1)}s</td>
                      <td className="tabular-nums text-white/50">{b.avg_reaction_speed?.toFixed(1)}s</td>
                      <td className="text-white/30">{b.sample_size}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REACTION TIMELINE */}
      {tab === 'timeline' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-white/50">Showing last {instances.length} show element instances with crowd reactions</span>
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th>Element</th>
                  <th>Type</th>
                  <th>Game</th>
                  <th>Moment</th>
                  <th>Q</th>
                  <th>Clock</th>
                  <th>Reaction Score</th>
                  <th>Participation</th>
                  <th>Speed</th>
                  <th>Peak dB</th>
                </tr>
              </thead>
              <tbody>
                {instances.map(inst => {
                  const r = inst.crowd_reactions?.[0]
                  return (
                    <tr key={inst.id}>
                      <td>
                        <div className="font-medium text-white/85">{inst.show_elements?.name}</div>
                      </td>
                      <td>
                        <span className="pill text-xs bg-cyan-500/10 text-cyan-400">
                          {ELEMENT_TYPE_LABELS[inst.show_elements?.type] || inst.show_elements?.type}
                        </span>
                      </td>
                      <td className="text-white/50 text-xs">{inst.events?.name}</td>
                      <td>
                        <span className={cn('pill text-xs', {
                          'bg-indigo-500/15 text-indigo-300': inst.game_moments?.category === 'pregame',
                          'bg-yellow-500/15 text-yellow-300': inst.game_moments?.category === 'timeout',
                          'bg-cyan-500/15 text-cyan-300': inst.game_moments?.category === 'halftime',
                          'bg-emerald-500/15 text-emerald-300': inst.game_moments?.category === 'post_score',
                          'bg-orange-500/15 text-orange-300': inst.game_moments?.category === 'stoppage',
                        })}>
                          {inst.game_moments?.label}
                        </span>
                      </td>
                      <td className="text-white/50 text-center">{inst.quarter > 0 ? `Q${inst.quarter}` : '—'}</td>
                      <td className="text-white/50 tabular-nums text-xs">{inst.game_clock || '—'}</td>
                      <td className="w-32">
                        {r ? <ScoreBar score={r.crowd_reaction_score} /> : <span className="text-white/25">—</span>}
                      </td>
                      <td className="w-28">
                        {r ? <ScoreBar score={r.participation_score} /> : <span className="text-white/25">—</span>}
                      </td>
                      <td>
                        {r ? (
                          <span className={cn('tabular-nums text-xs font-medium',
                            (r.reaction_speed_seconds||99) <= 2 ? 'text-emerald-400' :
                            (r.reaction_speed_seconds||99) <= 3 ? 'text-yellow-400' : 'text-red-400'
                          )}>
                            {r.reaction_speed_seconds?.toFixed(1)}s
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-white/50 tabular-nums">{r?.peak_decibel?.toFixed(0) || '—'} dB</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
