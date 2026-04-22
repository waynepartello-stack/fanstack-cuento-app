-- FanStack by CUENTO
-- Complete Database Schema + Seed Data

-- =============================================
-- SCHEMA
-- =============================================

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  sport text,
  league text,
  created_at timestamptz default now()
);

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text not null,
  city text,
  state text,
  capacity int,
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  venue_id uuid references venues(id),
  name text not null,
  abbreviation text,
  sport text,
  league text,
  division text,
  primary_color text,
  secondary_color text,
  created_at timestamptz default now()
);

create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  label text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamptz default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  category text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists team_modules (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  module_id uuid references modules(id),
  is_active boolean default true,
  activated_at timestamptz default now(),
  unique(team_id, module_id)
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  module_slug text,
  type text check (type in ('warning','info','success','critical')),
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  module_slug text,
  priority int default 1,
  title text not null,
  body text,
  action_label text,
  action_url text,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  season_id uuid references seasons(id),
  name text,
  opponent text,
  game_date timestamptz,
  is_home boolean default true,
  projected_attendance int,
  actual_attendance int,
  final_score_home int,
  final_score_away int,
  result text check (result in ('W','L','T',null)),
  created_at timestamptz default now()
);

-- PROMOTIONS
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  event_id uuid references events(id),
  name text not null,
  type text, -- giveaway, theme_night, ticket_promo, community, sponsor
  sponsor text,
  description text,
  cost numeric,
  status text default 'completed', -- planned, active, completed
  created_at timestamptz default now()
);

create table if not exists promotion_metrics (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid references promotions(id),
  projected_attendance int,
  actual_attendance int,
  baseline_attendance int,
  attendance_lift int,
  attendance_lift_pct numeric,
  show_rate numeric,
  revenue_total numeric,
  revenue_lift numeric,
  roi numeric,
  first_time_attendees int,
  return_rate numeric,
  media_value numeric,
  social_impressions int,
  email_opens int,
  email_clicks int,
  created_at timestamptz default now()
);

create table if not exists promotion_benchmarks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  promotion_type text,
  sport text,
  league text,
  avg_attendance_lift_pct numeric,
  avg_roi numeric,
  avg_show_rate numeric,
  avg_first_time_pct numeric,
  sample_size int,
  created_at timestamptz default now()
);

create table if not exists fan_acquisition_cohorts (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid references promotions(id),
  cohort_label text,
  first_time_fans int,
  returned_30d int,
  returned_60d int,
  returned_90d int,
  return_rate_30d numeric,
  return_rate_60d numeric,
  return_rate_90d numeric,
  avg_spend numeric,
  created_at timestamptz default now()
);

-- EXPERIENCE
create table if not exists game_moments (
  id uuid primary key default gen_random_uuid(),
  label text unique not null,
  category text, -- timeout, post_score, pregame, halftime, stoppage
  sort_order int
);

create table if not exists show_elements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  name text not null,
  type text, -- video, led_ribbon, music, prompt, pa_read, hype_video, sponsor_read, timeout_feature, crowd_contest, defensive_prompt, celebration
  description text,
  duration_seconds int,
  file_url text,
  thumbnail_url text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists show_element_instances (
  id uuid primary key default gen_random_uuid(),
  show_element_id uuid references show_elements(id),
  event_id uuid references events(id),
  game_moment_id uuid references game_moments(id),
  trigger_timestamp_seconds int,
  quarter int,
  game_clock text,
  score_home int,
  score_away int,
  created_at timestamptz default now()
);

create table if not exists crowd_reactions (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid references show_element_instances(id),
  crowd_reaction_score numeric, -- 0-100
  reaction_speed_seconds numeric,
  participation_score numeric, -- 0-100
  peak_decibel numeric,
  baseline_decibel numeric,
  duration_of_reaction_seconds numeric,
  created_at timestamptz default now()
);

create table if not exists experience_scores (
  id uuid primary key default gen_random_uuid(),
  show_element_id uuid references show_elements(id),
  venue_id uuid references venues(id),
  avg_reaction_score numeric,
  avg_participation_score numeric,
  avg_reaction_speed numeric,
  play_count int,
  repeatability_score numeric,
  venue_rank int,
  sport_rank int,
  last_played_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists experience_benchmarks (
  id uuid primary key default gen_random_uuid(),
  element_type text,
  sport text,
  league text,
  avg_reaction_score numeric,
  avg_participation_score numeric,
  avg_reaction_speed numeric,
  sample_size int,
  created_at timestamptz default now()
);

-- =============================================
-- SEED DATA
-- =============================================

-- Organizations
insert into organizations (id, name, slug, sport, league) values
  ('11111111-0000-0000-0000-000000000001', 'Lakeland Storm', 'lakeland-storm', 'Basketball', 'NBA G League'),
  ('11111111-0000-0000-0000-000000000002', 'Riverside Surge', 'riverside-surge', 'Hockey', 'ECHL');

-- Venues
insert into venues (id, org_id, name, city, state, capacity) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Storm Arena', 'Lakeland', 'FL', 8500),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Riverside Ice Center', 'Riverside', 'CA', 6200);

-- Teams
insert into teams (id, org_id, venue_id, name, abbreviation, sport, league, division, primary_color, secondary_color) values
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Lakeland Storm', 'LKS', 'Basketball', 'NBA G League', 'Southeast', '#1a56db', '#ffffff'),
  ('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Riverside Surge', 'RVS', 'Hockey', 'ECHL', 'Mountain', '#c0392b', '#ffffff');

-- Seasons
insert into seasons (id, team_id, label, start_date, end_date, is_current) values
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '2023-24', '2023-10-01', '2024-04-15', true),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', '2023-24', '2023-10-15', '2024-04-20', true);

-- Modules
insert into modules (id, slug, name, description, icon, category, is_available) values
  ('55555555-0000-0000-0000-000000000001', 'promotions', 'Promotions', 'Measure and optimize game night promotions, giveaways, and sponsor activations.', 'Megaphone', 'Marketing', true),
  ('55555555-0000-0000-0000-000000000002', 'experience', 'Experience', 'Live show intelligence for in-venue content, crowd reactions, and entertainment scoring.', 'Zap', 'Operations', true),
  ('55555555-0000-0000-0000-000000000003', 'ticketing', 'Ticketing Intelligence', 'Dynamic pricing, demand forecasting, and ticket sales analytics.', 'Ticket', 'Revenue', true),
  ('55555555-0000-0000-0000-000000000004', 'sponsorship', 'Sponsorship ROI', 'Track sponsor activations, media value, and contract performance.', 'Handshake', 'Partnerships', true),
  ('55555555-0000-0000-0000-000000000005', 'concessions', 'Concessions', 'Per-cap revenue, item performance, and venue operation analytics.', 'Coffee', 'Operations', true),
  ('55555555-0000-0000-0000-000000000006', 'social', 'Social Intelligence', 'Fan sentiment, social media reach, and digital engagement metrics.', 'Share2', 'Marketing', false),
  ('55555555-0000-0000-0000-000000000007', 'broadcast', 'Broadcast Analytics', 'Ratings, viewership trends, and streaming performance.', 'Tv', 'Media', false);

-- Team Modules (active)
insert into team_modules (team_id, module_id, is_active) values
  ('33333333-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000001', true),
  ('33333333-0000-0000-0000-000000000001', '55555555-0000-0000-0000-000000000002', true),
  ('33333333-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000001', true),
  ('33333333-0000-0000-0000-000000000002', '55555555-0000-0000-0000-000000000002', true);

-- Alerts
insert into alerts (team_id, module_slug, type, title, body, is_read, created_at) values
  ('33333333-0000-0000-0000-000000000001', 'promotions', 'success', 'Bobblehead Night exceeded projections', 'Attendance reached 8,240 — 18% above projected baseline. ROI at 3.4x.', false, now() - interval '2 hours'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 'warning', 'Timeout feature underperforming', 'Trivia Shootout scored 42/100 crowd reaction — 31pts below your season average. Consider rotating.', false, now() - interval '5 hours'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 'info', 'Fan acquisition data ready', 'Post-promo cohort analysis for Star Wars Night is available. 312 first-time fans tracked.', true, now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 'success', 'Hype Reel #7 hit new high score', '"Ignite" hype reel scored 94/100 — your highest crowd reaction of the season.', false, now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 'critical', 'Theme Night ROI below threshold', 'Retro Night generated 0.8x ROI — below your 1.5x minimum target. Review cost structure.', false, now() - interval '2 days'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 'info', 'New benchmark data available', 'G League experience benchmarks updated for Q1 2024. Your venue ranks 4th in crowd reaction.', true, now() - interval '3 days'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 'success', 'Kids Eat Free show rate up', 'Show rate hit 84% — 9pts above your promotional average. Promo resonating with family segment.', true, now() - interval '4 days'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 'info', 'Upcoming: Military Appreciation Night', 'Game in 6 days. 2,140 specialty tickets sold. Projected attendance: 7,800.', false, now() - interval '1 hour');

-- Recommendations
insert into recommendations (team_id, module_slug, priority, title, body, action_label, action_url) values
  ('33333333-0000-0000-0000-000000000001', 'promotions', 1, 'Double down on bobblehead giveaways', 'Your 3 bobblehead nights averaged 3.2x ROI and 16% attendance lift — highest of any promo type this season. Consider adding 2 more in Q4.', 'View Analysis', '/promotions'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 1, 'Retire "Trivia Shootout" timeout feature', 'Crowd reaction scores have declined 3 games in a row (62 → 54 → 42). Replace with a higher-energy timeout contest.', 'View Element', '/experience'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 2, 'Increase first-timer outreach for Star Wars Night', '312 first-time fans attended — only 18% returned within 60 days. Add a targeted re-engagement campaign.', 'View Cohort', '/promotions'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 2, 'Schedule "Ignite" hype reel for every 4th quarter', 'Your top-performing hype reel (94/100) is only used in Q2. Moving it to Q4 introductions could increase crowd energy when it matters most.', 'View Reel', '/experience'),
  ('33333333-0000-0000-0000-000000000001', 'promotions', 3, 'Launch a Kids Club promo bundle', '"Kids Eat Free" had your highest show rate (84%). Bundle with a kids jersey giveaway to drive season ticket upsells.', 'Explore', '/promotions'),
  ('33333333-0000-0000-0000-000000000001', 'experience', 3, 'Add a crowd contest to your halftime show', 'Venues with 2+ crowd contests per game average 12pts higher fan satisfaction. You currently run 0 in halftime.', 'Browse Library', '/experience');

-- Events
insert into events (id, team_id, season_id, name, opponent, game_date, is_home, projected_attendance, actual_attendance, final_score_home, final_score_away, result) values
  ('66666666-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Opening Night', 'Sioux Falls Skyforce', '2024-01-05 19:00:00', true, 7200, 7850, 112, 104, 'W'),
  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Bobblehead Night', 'Memphis Hustle', '2024-01-12 19:00:00', true, 6800, 8240, 98, 105, 'L'),
  ('66666666-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Star Wars Night', 'College Park Skyhawks', '2024-01-19 19:00:00', true, 7500, 8120, 121, 99, 'W'),
  ('66666666-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Kids Eat Free', 'Westchester Knicks', '2024-01-26 19:00:00', true, 6500, 7340, 108, 112, 'L'),
  ('66666666-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Retro Night', 'Raptors 905', '2024-02-02 19:00:00', true, 6200, 5980, 94, 101, 'L'),
  ('66666666-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Valentine''s Day Game', 'Wisconsin Herd', '2024-02-14 19:00:00', true, 6800, 7210, 118, 107, 'W'),
  ('66666666-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Military Appreciation Night', 'Greensboro Swarm', '2024-02-23 19:00:00', true, 7800, 8050, 103, 98, 'W'),
  ('66666666-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Jersey Giveaway Night', 'Maine Celtics', '2024-03-01 19:00:00', true, 7400, 8380, 115, 102, 'W'),
  ('66666666-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'St. Patrick''s Day', 'Motor City Cruise', '2024-03-15 19:00:00', true, 6900, 7640, 107, 109, 'L'),
  ('66666666-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'College Night', 'Fort Wayne Mad Ants', '2024-03-22 19:00:00', true, 6400, 7180, 122, 118, 'W'),
  ('66666666-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Playoffs Game 1', 'Memphis Hustle', '2024-04-05 19:00:00', true, 8200, 8480, 109, 97, 'W'),
  ('66666666-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Playoffs Game 2', 'Memphis Hustle', '2024-04-07 19:00:00', true, 8200, 8500, 88, 94, 'L'),
  -- Upcoming
  ('66666666-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Military Appreciation Night', 'Sioux Falls Skyforce', '2024-04-14 19:00:00', true, 7800, null, null, null, null),
  ('66666666-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 'Season Finale / Fan Fest', 'Raptors 905', '2024-04-20 19:00:00', true, 8400, null, null, null, null);

-- Promotions
insert into promotions (id, team_id, event_id, name, type, sponsor, description, cost, status) values
  ('77777777-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', 'Opening Night Fireworks', 'theme_night', null, 'Post-game fireworks show to kick off the season', 12000, 'completed'),
  ('77777777-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002', 'Marcus Williams Bobblehead', 'giveaway', 'Valley Health', 'First 2,500 fans receive a Marcus Williams bobblehead sponsored by Valley Health', 18500, 'completed'),
  ('77777777-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000003', 'Star Wars Night', 'theme_night', 'Disney+', 'Full Star Wars themed experience with costume contest and character appearances', 24000, 'completed'),
  ('77777777-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000004', 'Kids Eat Free', 'ticket_promo', null, 'Kids 12 and under eat free with paid adult ticket', 4200, 'completed'),
  ('77777777-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000005', 'Retro Night — 1990s Throwback', 'theme_night', 'Classic Sports Bar', 'Retro uniforms, throwback music, 90s photo activations', 16000, 'completed'),
  ('77777777-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000006', 'Valentine''s Date Night Package', 'ticket_promo', 'Lakeland Roses', 'Couples ticket bundle with roses and dessert', 8500, 'completed'),
  ('77777777-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000007', 'Military Appreciation Ticket Discount', 'community', 'American Legion Post 4', 'Active military and veterans receive 50% off tickets', 3000, 'completed'),
  ('77777777-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000008', 'Player Jersey Giveaway', 'giveaway', 'Nike', 'First 3,000 fans receive a replica player jersey', 31000, 'completed'),
  ('77777777-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000009', 'St. Patrick''s Day Green Out', 'theme_night', 'O''Brien''s Irish Pub', 'Everyone in green, green beer specials, themed activations', 9500, 'completed'),
  ('77777777-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000010', 'College Student Night', 'ticket_promo', 'Florida Poly University', '$5 student tickets, campus-wide promo push', 5500, 'completed'),
  ('77777777-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000011', 'Playoffs Pack — Giveaway Hat', 'giveaway', 'Storm Gear Co.', 'Storm-branded playoff cap for first 4,000 fans', 22000, 'completed'),
  ('77777777-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000012', 'Playoffs Pack — Towel Wave', 'giveaway', null, 'White rally towels for all fans for Game 2', 6000, 'completed'),
  ('77777777-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000013', 'Military Appreciation Night 2', 'community', 'USAA', 'Military night with honor ceremony and ticket discount', 5000, 'planned'),
  ('77777777-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000014', 'Fan Fest Finale Giveaway', 'giveaway', 'Storm Gear Co.', 'End-of-season autographed poster giveaway at Fan Fest', 14000, 'planned');

-- Promotion Metrics
insert into promotion_metrics (promotion_id, projected_attendance, actual_attendance, baseline_attendance, attendance_lift, attendance_lift_pct, show_rate, revenue_total, revenue_lift, roi, first_time_attendees, return_rate, media_value, social_impressions, email_opens, email_clicks) values
  ('77777777-0000-0000-0000-000000000001', 7200, 7850, 6600, 1250, 18.9, 82.4, 198400, 31600, 2.6, 412, 48.3, 24000, 88000, 0.42, 0.12),
  ('77777777-0000-0000-0000-000000000002', 6800, 8240, 6600, 1640, 24.8, 87.2, 224800, 41300, 2.2, 624, 43.8, 38000, 142000, 0.51, 0.19),
  ('77777777-0000-0000-0000-000000000003', 7500, 8120, 6600, 1520, 23.0, 85.1, 218200, 37800, 1.6, 312, 18.2, 52000, 218000, 0.48, 0.22),
  ('77777777-0000-0000-0000-000000000004', 6500, 7340, 6600, 740, 11.2, 84.0, 192600, 18600, 4.4, 286, 52.1, 12000, 64000, 0.38, 0.09),
  ('77777777-0000-0000-0000-000000000005', 6200, 5980, 6600, -620, -9.4, 74.3, 152800, -14200, 0.8, 188, 31.4, 18000, 76000, 0.31, 0.08),
  ('77777777-0000-0000-0000-000000000006', 6800, 7210, 6600, 610, 9.2, 81.3, 186400, 15400, 1.8, 198, 44.9, 16000, 58000, 0.44, 0.14),
  ('77777777-0000-0000-0000-000000000007', 7800, 8050, 6600, 1450, 22.0, 83.8, 214200, 35600, 11.9, 542, 62.4, 28000, 96000, 0.47, 0.18),
  ('77777777-0000-0000-0000-000000000008', 7400, 8380, 6600, 1780, 27.0, 86.4, 228600, 44200, 1.4, 716, 38.7, 44000, 186000, 0.54, 0.24),
  ('77777777-0000-0000-0000-000000000009', 6900, 7640, 6600, 1040, 15.8, 80.2, 204000, 24000, 2.5, 348, 41.6, 22000, 112000, 0.41, 0.13),
  ('77777777-0000-0000-0000-000000000010', 6400, 7180, 6600, 580, 8.8, 78.9, 148200, 12200, 2.2, 892, 28.4, 8000, 168000, 0.36, 0.18),
  ('77777777-0000-0000-0000-000000000011', 8200, 8480, 7000, 1480, 21.1, 88.6, 242400, 41200, 1.9, 188, 72.3, 48000, 224000, 0.58, 0.26),
  ('77777777-0000-0000-0000-000000000012', 8200, 8500, 7000, 1500, 21.4, 89.1, 244000, 43000, 7.2, 96, 81.4, 14000, 188000, 0.52, 0.21);

-- Promotion Benchmarks
insert into promotion_benchmarks (team_id, promotion_type, sport, league, avg_attendance_lift_pct, avg_roi, avg_show_rate, avg_first_time_pct, sample_size) values
  ('33333333-0000-0000-0000-000000000001', 'giveaway', 'Basketball', 'NBA G League', 19.4, 1.8, 84.2, 8.6, 48),
  ('33333333-0000-0000-0000-000000000001', 'theme_night', 'Basketball', 'NBA G League', 14.8, 1.6, 80.4, 6.2, 36),
  ('33333333-0000-0000-0000-000000000001', 'ticket_promo', 'Basketball', 'NBA G League', 10.2, 2.4, 78.8, 9.4, 52),
  ('33333333-0000-0000-0000-000000000001', 'community', 'Basketball', 'NBA G League', 18.6, 4.8, 82.6, 7.8, 24);

-- Fan Acquisition Cohorts
insert into fan_acquisition_cohorts (promotion_id, cohort_label, first_time_fans, returned_30d, returned_60d, returned_90d, return_rate_30d, return_rate_60d, return_rate_90d, avg_spend) values
  ('77777777-0000-0000-0000-000000000001', 'Opening Night First-Timers', 412, 186, 228, 241, 45.1, 55.3, 58.5, 42.80),
  ('77777777-0000-0000-0000-000000000002', 'Bobblehead Night First-Timers', 624, 218, 274, 298, 34.9, 43.9, 47.8, 38.40),
  ('77777777-0000-0000-0000-000000000003', 'Star Wars Night First-Timers', 312, 56, 68, 74, 17.9, 21.8, 23.7, 44.20),
  ('77777777-0000-0000-0000-000000000004', 'Kids Eat Free First-Timers', 286, 148, 188, 208, 51.7, 65.7, 72.7, 28.60),
  ('77777777-0000-0000-0000-000000000007', 'Military Appreciation First-Timers', 542, 338, 394, 418, 62.4, 72.7, 77.1, 36.90),
  ('77777777-0000-0000-0000-000000000010', 'College Night First-Timers', 892, 254, 312, 348, 28.5, 35.0, 39.0, 22.40);

-- Game Moments
insert into game_moments (id, label, category, sort_order) values
  ('88888888-0000-0000-0000-000000000001', 'Pregame Warmup', 'pregame', 1),
  ('88888888-0000-0000-0000-000000000002', 'Starting Lineup Intro', 'pregame', 2),
  ('88888888-0000-0000-0000-000000000003', 'Tip-Off / Puck Drop', 'pregame', 3),
  ('88888888-0000-0000-0000-000000000004', 'First Timeout Q1', 'timeout', 4),
  ('88888888-0000-0000-0000-000000000005', 'Second Timeout Q1', 'timeout', 5),
  ('88888888-0000-0000-0000-000000000006', 'End of Q1', 'stoppage', 6),
  ('88888888-0000-0000-0000-000000000007', 'First Timeout Q2', 'timeout', 7),
  ('88888888-0000-0000-0000-000000000008', 'Halftime', 'halftime', 8),
  ('88888888-0000-0000-0000-000000000009', 'Third Quarter Open', 'pregame', 9),
  ('88888888-0000-0000-0000-000000000010', 'First Timeout Q3', 'timeout', 10),
  ('88888888-0000-0000-0000-000000000011', 'End of Q3', 'stoppage', 11),
  ('88888888-0000-0000-0000-000000000012', 'First Timeout Q4', 'timeout', 12),
  ('88888888-0000-0000-0000-000000000013', 'Post-Score Celebration', 'post_score', 13),
  ('88888888-0000-0000-0000-000000000014', 'Defensive Stand', 'stoppage', 14),
  ('88888888-0000-0000-0000-000000000015', 'Final Buzzer', 'stoppage', 15);

-- Show Elements
insert into show_elements (id, team_id, name, type, description, duration_seconds, tags) values
  ('99999999-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'Ignite — Season Hype Reel', 'hype_video', 'High-energy season highlight reel with dramatic music build', 90, ARRAY['hype','season','high-energy']),
  ('99999999-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'Storm Rising Intro', 'hype_video', 'Starting lineup dramatic intro with lightning effects and player walkouts', 120, ARRAY['intro','lineup','dramatic']),
  ('99999999-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', 'Trivia Shootout', 'timeout_feature', 'Fan trivia game shown on center scoreboard with crowd voting', 60, ARRAY['trivia','interactive','fan-participation']),
  ('99999999-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', 'T-Shirt Cannon Cam', 'crowd_contest', 'Camera-focused crowd contest with t-shirt launcher', 45, ARRAY['giveaway','camera','crowd']),
  ('99999999-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000001', 'Dance Cam', 'crowd_contest', 'Crowd dance competition shown on scoreboard', 45, ARRAY['dance','camera','crowd','fun']),
  ('99999999-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000001', 'Defense Drum Line', 'defensive_prompt', 'LED ribbon + PA call to pump up crowd on defense', 15, ARRAY['defense','drum','loud']),
  ('99999999-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000001', 'DEFENSE Chant Prompt', 'defensive_prompt', 'Scoreboard prompt directing crowd to chant DEFENSE', 10, ARRAY['defense','chant','crowd']),
  ('99999999-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000001', 'Valley Health Timeout Spot', 'sponsor_read', 'Valley Health 30-second sponsor read during timeout', 30, ARRAY['sponsor','valley-health','timeout']),
  ('99999999-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000001', 'Post-Score Celebration Burst', 'celebration', 'Quick crowd celebration trigger post-basket with confetti animation', 8, ARRAY['celebration','score','confetti']),
  ('99999999-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000001', 'Halftime Performance Intro', 'pa_read', 'PA introduction for halftime entertainment act', 20, ARRAY['halftime','pa','intro']),
  ('99999999-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000001', 'Kiss Cam', 'crowd_contest', 'Classic kiss cam crowd feature', 45, ARRAY['romance','camera','crowd','fun']),
  ('99999999-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000001', 'Storm LED Tunnel', 'led_ribbon', 'LED ribbon wrap creates lightning tunnel effect for player intros', 30, ARRAY['led','intro','visual']),
  ('99999999-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000001', '"Back in Black" Walkout Track', 'music', 'AC/DC Back in Black for starting lineup walk-out', 60, ARRAY['music','walkout','rock','hype']),
  ('99999999-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000001', 'Q4 Intensity Build', 'music', 'Electronic music build sequence for 4th quarter crowd energy', 120, ARRAY['music','q4','electronic','hype']),
  ('99999999-0000-0000-0000-000000000015', '33333333-0000-0000-0000-000000000001', 'Fan of the Game', 'prompt', 'Scoreboard spotlight on a fan of the game with sponsor integration', 30, ARRAY['fan','sponsor','spotlight']);

-- Show Element Instances (sample — events 1-3)
insert into show_element_instances (id, show_element_id, event_id, game_moment_id, trigger_timestamp_seconds, quarter, game_clock, score_home, score_away) values
  -- Opening Night
  ('aaaaaaaa-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000002', 900, 0, '0:00', 0, 0),
  ('aaaaaaaa-0000-0000-0000-000000000002', '99999999-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000002', 960, 0, '0:00', 0, 0),
  ('aaaaaaaa-0000-0000-0000-000000000003', '99999999-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000004', 1800, 1, '3:42', 18, 14),
  ('aaaaaaaa-0000-0000-0000-000000000004', '99999999-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000008', 2400, 2, '0:00', 44, 38),
  ('aaaaaaaa-0000-0000-0000-000000000005', '99999999-0000-0000-0000-000000000005', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000010', 3600, 3, '5:12', 72, 68),
  ('aaaaaaaa-0000-0000-0000-000000000006', '99999999-0000-0000-0000-000000000006', '66666666-0000-0000-0000-000000000001', '88888888-0000-0000-0000-000000000014', 2800, 2, '8:22', 52, 48),
  -- Bobblehead Night
  ('aaaaaaaa-0000-0000-0000-000000000007', '99999999-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000002', 880, 0, '0:00', 0, 0),
  ('aaaaaaaa-0000-0000-0000-000000000008', '99999999-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000004', 1780, 1, '4:10', 16, 12),
  ('aaaaaaaa-0000-0000-0000-000000000009', '99999999-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000005', 2200, 1, '1:28', 28, 26),
  ('aaaaaaaa-0000-0000-0000-000000000010', '99999999-0000-0000-0000-000000000011', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000008', 2400, 2, '0:00', 46, 52),
  ('aaaaaaaa-0000-0000-0000-000000000011', '99999999-0000-0000-0000-000000000007', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000014', 3100, 3, '6:40', 68, 72),
  ('aaaaaaaa-0000-0000-0000-000000000012', '99999999-0000-0000-0000-000000000009', '66666666-0000-0000-0000-000000000002', '88888888-0000-0000-0000-000000000013', 1940, 1, '8:00', 22, 18),
  -- Star Wars Night
  ('aaaaaaaa-0000-0000-0000-000000000013', '99999999-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000002', 920, 0, '0:00', 0, 0),
  ('aaaaaaaa-0000-0000-0000-000000000014', '99999999-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000007', 2000, 2, '5:30', 30, 20),
  ('aaaaaaaa-0000-0000-0000-000000000015', '99999999-0000-0000-0000-000000000005', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000010', 3400, 3, '4:18', 68, 52),
  ('aaaaaaaa-0000-0000-0000-000000000016', '99999999-0000-0000-0000-000000000008', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000004', 1820, 1, '3:20', 20, 14),
  ('aaaaaaaa-0000-0000-0000-000000000017', '99999999-0000-0000-0000-000000000006', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000014', 2900, 2, '7:44', 56, 44),
  ('aaaaaaaa-0000-0000-0000-000000000018', '99999999-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000003', '88888888-0000-0000-0000-000000000012', 3800, 4, '6:00', 88, 72),
  -- Additional events
  ('aaaaaaaa-0000-0000-0000-000000000019', '99999999-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000004', '88888888-0000-0000-0000-000000000002', 870, 0, '0:00', 0, 0),
  ('aaaaaaaa-0000-0000-0000-000000000020', '99999999-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000004', '88888888-0000-0000-0000-000000000004', 1750, 1, '4:44', 14, 16);

-- Crowd Reactions
insert into crowd_reactions (instance_id, crowd_reaction_score, reaction_speed_seconds, participation_score, peak_decibel, baseline_decibel, duration_of_reaction_seconds) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 94, 1.2, 88, 108, 72, 18),
  ('aaaaaaaa-0000-0000-0000-000000000002', 91, 1.4, 86, 106, 72, 22),
  ('aaaaaaaa-0000-0000-0000-000000000003', 42, 4.8, 38, 84, 68, 8),
  ('aaaaaaaa-0000-0000-0000-000000000004', 78, 2.1, 82, 96, 70, 24),
  ('aaaaaaaa-0000-0000-0000-000000000005', 72, 2.4, 76, 92, 70, 20),
  ('aaaaaaaa-0000-0000-0000-000000000006', 68, 2.8, 62, 88, 68, 12),
  ('aaaaaaaa-0000-0000-0000-000000000007', 89, 1.6, 84, 104, 72, 20),
  ('aaaaaaaa-0000-0000-0000-000000000008', 54, 3.8, 46, 82, 68, 10),
  ('aaaaaaaa-0000-0000-0000-000000000009', 81, 2.0, 78, 98, 70, 26),
  ('aaaaaaaa-0000-0000-0000-000000000010', 86, 1.8, 88, 102, 70, 28),
  ('aaaaaaaa-0000-0000-0000-000000000011', 74, 2.6, 66, 90, 68, 14),
  ('aaaaaaaa-0000-0000-0000-000000000012', 88, 1.5, 84, 104, 72, 16),
  ('aaaaaaaa-0000-0000-0000-000000000013', 92, 1.3, 90, 108, 72, 24),
  ('aaaaaaaa-0000-0000-0000-000000000014', 48, 4.2, 42, 80, 68, 9),
  ('aaaaaaaa-0000-0000-0000-000000000015', 76, 2.2, 80, 94, 70, 22),
  ('aaaaaaaa-0000-0000-0000-000000000016', 62, 3.2, 58, 86, 68, 11),
  ('aaaaaaaa-0000-0000-0000-000000000017', 71, 2.6, 64, 90, 68, 13),
  ('aaaaaaaa-0000-0000-0000-000000000018', 83, 1.9, 82, 100, 70, 25),
  ('aaaaaaaa-0000-0000-0000-000000000019', 87, 1.7, 86, 104, 72, 19),
  ('aaaaaaaa-0000-0000-0000-000000000020', 44, 4.6, 40, 82, 68, 8);

-- Experience Scores (aggregate per element)
insert into experience_scores (show_element_id, venue_id, avg_reaction_score, avg_participation_score, avg_reaction_speed, play_count, repeatability_score, venue_rank, sport_rank, last_played_at) values
  ('99999999-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 91.2, 87.0, 1.4, 8, 88, 1, 3, '2024-04-05'),
  ('99999999-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 88.6, 83.0, 1.6, 10, 82, 2, 6, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001', 47.8, 43.0, 4.4, 11, 52, 14, 28, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000001', 79.2, 81.0, 2.1, 9, 76, 4, 9, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', 74.4, 78.0, 2.3, 8, 72, 6, 12, '2024-04-05'),
  ('99999999-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001', 69.8, 63.0, 2.7, 12, 78, 8, 14, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000001', 72.4, 64.0, 2.6, 10, 80, 7, 15, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000001', 61.2, 56.0, 3.2, 11, 68, 9, 18, '2024-04-05'),
  ('99999999-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000001', 86.8, 83.0, 1.6, 20, 90, 3, 5, '2024-04-07'),
  ('99999999-0000-0000-0000-000000000011', '22222222-0000-0000-0000-000000000001', 84.2, 87.0, 1.8, 9, 74, 5, 8, '2024-04-05'),
  ('99999999-0000-0000-0000-000000000012', '22222222-0000-0000-0000-000000000001', 78.8, 72.0, 2.2, 10, 82, 5, 10, '2024-04-05'),
  ('99999999-0000-0000-0000-000000000015', '22222222-0000-0000-0000-000000000001', 66.4, 60.0, 3.0, 7, 70, 11, 22, '2024-03-22');

-- Experience Benchmarks
insert into experience_benchmarks (element_type, sport, league, avg_reaction_score, avg_participation_score, avg_reaction_speed, sample_size) values
  ('hype_video', 'Basketball', 'NBA G League', 78.4, 72.0, 2.2, 84),
  ('timeout_feature', 'Basketball', 'NBA G League', 64.2, 61.0, 3.1, 92),
  ('crowd_contest', 'Basketball', 'NBA G League', 72.8, 78.0, 2.4, 76),
  ('defensive_prompt', 'Basketball', 'NBA G League', 66.4, 60.0, 2.8, 68),
  ('celebration', 'Basketball', 'NBA G League', 82.6, 80.0, 1.8, 112),
  ('sponsor_read', 'Basketball', 'NBA G League', 58.2, 52.0, 3.6, 88),
  ('music', 'Basketball', 'NBA G League', 70.4, 68.0, 2.6, 64),
  ('led_ribbon', 'Basketball', 'NBA G League', 74.6, 68.0, 2.4, 56);
