import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number | null | undefined, decimals = 0): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatPct(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

export function formatPctAbs(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—'
  return `${n.toFixed(decimals)}%`
}

export function formatMultiple(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}x`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function scoreColor(score: number | null): string {
  if (score == null) return 'text-gray-400'
  if (score >= 80) return 'text-emerald-400'
  if (score >= 65) return 'text-yellow-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}

export function scoreBg(score: number | null): string {
  if (score == null) return 'bg-gray-800'
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400'
  if (score >= 65) return 'bg-yellow-500/20 text-yellow-400'
  if (score >= 50) return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}

export function roiColor(roi: number | null): string {
  if (roi == null) return 'text-gray-400'
  if (roi >= 3) return 'text-emerald-400'
  if (roi >= 1.5) return 'text-yellow-400'
  return 'text-red-400'
}

export const PROMO_TYPE_LABELS: Record<string, string> = {
  giveaway: 'Giveaway',
  theme_night: 'Theme Night',
  ticket_promo: 'Ticket Promo',
  community: 'Community Night',
  sponsor: 'Sponsor Activation',
}

export const ELEMENT_TYPE_LABELS: Record<string, string> = {
  hype_video: 'Hype Video',
  video: 'Video',
  led_ribbon: 'LED Ribbon',
  music: 'Music',
  prompt: 'Prompt',
  pa_read: 'PA Read',
  sponsor_read: 'Sponsor Read',
  timeout_feature: 'Timeout Feature',
  crowd_contest: 'Crowd Contest',
  defensive_prompt: 'Defensive Prompt',
  celebration: 'Celebration',
}

// Demo team ID for prototype
export const DEMO_TEAM_ID = '33333333-0000-0000-0000-000000000001'
