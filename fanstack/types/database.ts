export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          sport: string | null
          league: string | null
          created_at: string
        }
      }
      venues: {
        Row: {
          id: string
          org_id: string | null
          name: string
          city: string | null
          state: string | null
          capacity: number | null
          created_at: string
        }
      }
      teams: {
        Row: {
          id: string
          org_id: string | null
          venue_id: string | null
          name: string
          abbreviation: string | null
          sport: string | null
          league: string | null
          division: string | null
          primary_color: string | null
          secondary_color: string | null
          created_at: string
        }
      }
      seasons: {
        Row: {
          id: string
          team_id: string | null
          label: string
          start_date: string | null
          end_date: string | null
          is_current: boolean
          created_at: string
        }
      }
      modules: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          category: string | null
          is_available: boolean
          created_at: string
        }
      }
      team_modules: {
        Row: {
          id: string
          team_id: string | null
          module_id: string | null
          is_active: boolean
          activated_at: string
        }
      }
      alerts: {
        Row: {
          id: string
          team_id: string | null
          module_slug: string | null
          type: 'warning' | 'info' | 'success' | 'critical'
          title: string
          body: string | null
          is_read: boolean
          created_at: string
        }
      }
      recommendations: {
        Row: {
          id: string
          team_id: string | null
          module_slug: string | null
          priority: number
          title: string
          body: string | null
          action_label: string | null
          action_url: string | null
          is_dismissed: boolean
          created_at: string
        }
      }
      events: {
        Row: {
          id: string
          team_id: string | null
          season_id: string | null
          name: string | null
          opponent: string | null
          game_date: string | null
          is_home: boolean
          projected_attendance: number | null
          actual_attendance: number | null
          final_score_home: number | null
          final_score_away: number | null
          result: 'W' | 'L' | 'T' | null
          created_at: string
        }
      }
      promotions: {
        Row: {
          id: string
          team_id: string | null
          event_id: string | null
          name: string
          type: string | null
          sponsor: string | null
          description: string | null
          cost: number | null
          status: string
          created_at: string
        }
      }
      promotion_metrics: {
        Row: {
          id: string
          promotion_id: string | null
          projected_attendance: number | null
          actual_attendance: number | null
          baseline_attendance: number | null
          attendance_lift: number | null
          attendance_lift_pct: number | null
          show_rate: number | null
          revenue_total: number | null
          revenue_lift: number | null
          roi: number | null
          first_time_attendees: number | null
          return_rate: number | null
          media_value: number | null
          social_impressions: number | null
          email_opens: number | null
          email_clicks: number | null
          created_at: string
        }
      }
      promotion_benchmarks: {
        Row: {
          id: string
          team_id: string | null
          promotion_type: string | null
          sport: string | null
          league: string | null
          avg_attendance_lift_pct: number | null
          avg_roi: number | null
          avg_show_rate: number | null
          avg_first_time_pct: number | null
          sample_size: number | null
          created_at: string
        }
      }
      fan_acquisition_cohorts: {
        Row: {
          id: string
          promotion_id: string | null
          cohort_label: string | null
          first_time_fans: number | null
          returned_30d: number | null
          returned_60d: number | null
          returned_90d: number | null
          return_rate_30d: number | null
          return_rate_60d: number | null
          return_rate_90d: number | null
          avg_spend: number | null
          created_at: string
        }
      }
      game_moments: {
        Row: {
          id: string
          label: string
          category: string | null
          sort_order: number | null
        }
      }
      show_elements: {
        Row: {
          id: string
          team_id: string | null
          name: string
          type: string | null
          description: string | null
          duration_seconds: number | null
          file_url: string | null
          thumbnail_url: string | null
          tags: string[] | null
          created_at: string
        }
      }
      show_element_instances: {
        Row: {
          id: string
          show_element_id: string | null
          event_id: string | null
          game_moment_id: string | null
          trigger_timestamp_seconds: number | null
          quarter: number | null
          game_clock: string | null
          score_home: number | null
          score_away: number | null
          created_at: string
        }
      }
      crowd_reactions: {
        Row: {
          id: string
          instance_id: string | null
          crowd_reaction_score: number | null
          reaction_speed_seconds: number | null
          participation_score: number | null
          peak_decibel: number | null
          baseline_decibel: number | null
          duration_of_reaction_seconds: number | null
          created_at: string
        }
      }
      experience_scores: {
        Row: {
          id: string
          show_element_id: string | null
          venue_id: string | null
          avg_reaction_score: number | null
          avg_participation_score: number | null
          avg_reaction_speed: number | null
          play_count: number | null
          repeatability_score: number | null
          venue_rank: number | null
          sport_rank: number | null
          last_played_at: string | null
          created_at: string
        }
      }
      experience_benchmarks: {
        Row: {
          id: string
          element_type: string | null
          sport: string | null
          league: string | null
          avg_reaction_score: number | null
          avg_participation_score: number | null
          avg_reaction_speed: number | null
          sample_size: number | null
          created_at: string
        }
      }
    }
  }
}

// App-level types
export type Alert = Database['public']['Tables']['alerts']['Row']
export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type Promotion = Database['public']['Tables']['promotions']['Row']
export type PromotionMetrics = Database['public']['Tables']['promotion_metrics']['Row']
export type ShowElement = Database['public']['Tables']['show_elements']['Row']
export type ExperienceScore = Database['public']['Tables']['experience_scores']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Module = Database['public']['Tables']['modules']['Row']

export type PromotionWithMetrics = Promotion & {
  promotion_metrics: PromotionMetrics[]
  events: Event | null
}

export type ShowElementWithScore = ShowElement & {
  experience_scores: ExperienceScore[]
}
