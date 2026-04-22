'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ELEMENT_TYPE_LABELS, cn, formatNumber } from '@/lib/utils'
import KpiCard from '@/components/ui/KpiCard'
import ScoreBar from '@/components/ui/ScoreBar'
import Link from 'next/link'
import { ArrowLeft, Zap, Clock, Activity, Star, TrendingUp } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1d2e] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white/60 mb-2">{label || payload[0]?.payload?.name}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/80">{p.name}:</span>
          <span className="font-semibold text-white">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ExperienceDetailPage() {
  const { id } = useParams()
  const [element, setElement] = useState<any>(null)
  const [score, setScore] = useState<any>(null)
  const [instances, setInstances] = useState<any[]>([])
  const [benchmark, setBenchmark] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [elemRes, scoreRes, instRes] = await Promise.all([
        supabase.from('show_elements').select('*').eq('id', id).single(),
        supabase.from('experience_scores').select('*').eq('show_element_id', id).single(),
        supabase.from('show_element_instances')
          .select('*, game_moments(label, category), crowd_reactions(*), events(name, game_date)')
          .eq('show_element_id', id)
          .order('created_at'),
      ])
      setElement(elemRes.data)
      setScore(scoreRes.data)
      setInstances(instRes.data || [])

      if (elemRes.data?.type) {
        const benchRes = await supabase
          .from('experience_benchmarks')
          .select('*')
          .eq('element_type', elemRes.data.type)
          .eq('sport', 'Basketball')
          .single()
        setBenchmark(benchRes.data)
      }
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
        </div>
      </div>
    )
  }

  if (!element) return <div className="p-6 text-white/50">Element not found.</div>

  const reactions = instances.map(i => i.crowd_reactions?.[0]).filter(Boolean)
  const reactionTrend = instances.map((inst, idx) => ({
    play: `Play ${idx + 1}`,
    reaction: inst.crowd_reactions?.[0]?.crowd_reaction_score,
    participation: inst.crowd_reactions?.[0]?.participation_score,
  }))

  const radarData = score && benchmark ? [
    { metric: 'Reaction', You: score.avg_reaction_score, League: benchmark.avg_reaction_score },
    { metric: 'Participation', You: score.avg_participation_score, League: benchmark.avg_participation_score },
    { metric: 'Speed', You: Math.max(0, 100 - (score.avg_reaction_speed || 5) * 15), League: Math.max(0, 100 - (benchmark.avg_reaction_speed || 5) * 15) },
    { metric: 'Repeatability', You: score.repeatability_score, League: 65 },
    { metric: 'Play Count', You: Math.min((score.play_count || 0) / 20 * 100, 100), League: 55 },
  ] : []

  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <Link href="/experience" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Experience
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-semibold text-white">{element.name}</h1>
            <span className="pill bg-cyan-500/15 text-cyan-400 text-xs">
              {ELEMENT_TYPE_LABELS[element.type] || element.type}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {element.tags?.map((tag: string) => (
              <span key={tag} className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          {element.description && (
            <p className="text-sm text-white/45 mt-2 max-w-xl">{element.description}</p>
          )}
          {element.duration_seconds && (
            <span className="inline-flex items-center gap-1 text-xs text-white/30 mt-1">
              <Clock className="w-3 h-3" /> {element.duration_seconds}s duration
            </span>
          )}
        </div>
      </div>

      {score && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <KpiCard label="Reaction Score" value={score.avg_reaction_score?.toFixed(1)} trend={(score.avg_reaction_score || 0) - (benchmark?.avg_reaction_score || 0)} trendLabel={`vs league ${benchmark?.avg_reaction_score?.toFixed(1)}`} />
            <KpiCard label="Participation" value={score.avg_participation_score?.toFixed(1)} />
            <KpiCard label="Reaction Speed" value={`${score.avg_reaction_speed?.toFixed(1)}s`} trend={(score.avg_reaction_speed || 5) <= 2 ? 1 : -1} trendLabel={(score.avg_reaction_speed || 5) <= 2 ? 'Fast' : 'Slow'} />
            <KpiCard label="Play Count" value={score.play_count} subtitle="times this season" />
            <KpiCard label="Repeatability" value={score.repeatability_score?.toFixed(0)} subtitle="out of 100" accent />
          </div>

          <div className="grid grid-cols-12 gap-5 mb-5">
            {/* Radar */}
            <div className="col-span-12 lg:col-span-4 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-2">vs League Benchmark</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Radar name="You" dataKey="You" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
                  <Radar name="League" dataKey="League" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.05)" />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                <span className="text-[11px] text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />You</span>
                <span className="text-[11px] text-white/30 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20" />League</span>
              </div>
            </div>

            {/* Trend */}
            <div className="col-span-12 lg:col-span-8 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Reaction Trend (per play)</h3>
              <p className="text-xs text-white/35 mb-4">Crowd reaction and participation scores each time this element was played</p>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={reactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="play" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="reaction" name="Reaction" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                  <Line type="monotone" dataKey="participation" name="Participation" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#6366f1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Venue / Sport rank */}
          <div className="grid grid-cols-12 gap-5 mb-5">
            <div className="col-span-12 lg:col-span-6 card p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Rankings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">#{score.venue_rank}</div>
                  <div className="text-xs text-white/40 mt-1">Venue Rank</div>
                  <div className="text-[11px] text-white/25">of all elements at Storm Arena</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">#{score.sport_rank}</div>
                  <div className="text-xs text-white/40 mt-1">Sport Rank</div>
                  <div className="text-[11px] text-white/25">among {ELEMENT_TYPE_LABELS[element.type]}s in G League</div>
                </div>
              </div>
            </div>

            {/* AI-style rec */}
            <div className="col-span-12 lg:col-span-6 card p-5 border-cyan-500/20 bg-cyan-950/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">FanStack Insight</span>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                {score.avg_reaction_score >= 80
                  ? `"${element.name}" is a top performer. With a ${score.avg_reaction_score.toFixed(0)}/100 reaction score and ${score.play_count} plays this season, consider using it in your highest-stakes game moments like playoff introductions or late-game timeouts.`
                  : score.avg_reaction_score >= 60
                  ? `"${element.name}" is performing near league average. Experiment with triggering it at different game moments — particularly after big plays — where crowd energy peaks naturally.`
                  : `"${element.name}" is underperforming at ${score.avg_reaction_score.toFixed(0)}/100 — ${(benchmark?.avg_reaction_score || 68) - score.avg_reaction_score} points below league average. Consider retiring or reworking this element before the next homestand.`
                }
              </p>
            </div>
          </div>
        </>
      )}

      {/* Instance list */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Play History</h3>
        <table className="data-table">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th>Game</th>
              <th>Moment</th>
              <th>Quarter</th>
              <th>Clock</th>
              <th>Score</th>
              <th>Reaction</th>
              <th>Participation</th>
              <th>Speed</th>
            </tr>
          </thead>
          <tbody>
            {instances.map(inst => {
              const r = inst.crowd_reactions?.[0]
              return (
                <tr key={inst.id}>
                  <td className="text-white/70">{inst.events?.name}</td>
                  <td>
                    <span className={cn('pill text-xs', {
                      'bg-indigo-500/15 text-indigo-300': inst.game_moments?.category === 'pregame',
                      'bg-yellow-500/15 text-yellow-300': inst.game_moments?.category === 'timeout',
                      'bg-cyan-500/15 text-cyan-300': inst.game_moments?.category === 'halftime',
                      'bg-emerald-500/15 text-emerald-300': inst.game_moments?.category === 'post_score',
                    })}>
                      {inst.game_moments?.label}
                    </span>
                  </td>
                  <td className="text-white/50">{inst.quarter > 0 ? `Q${inst.quarter}` : 'Pre'}</td>
                  <td className="tabular-nums text-white/50">{inst.game_clock || '—'}</td>
                  <td className="tabular-nums text-white/50">{inst.score_home ?? '—'}–{inst.score_away ?? '—'}</td>
                  <td className="w-32">{r ? <ScoreBar score={r.crowd_reaction_score} /> : '—'}</td>
                  <td className="w-28">{r ? <ScoreBar score={r.participation_score} /> : '—'}</td>
                  <td className="tabular-nums text-xs">{r?.reaction_speed_seconds?.toFixed(1)}s</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
