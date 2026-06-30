-- Gamification System Schema

-- Add gamification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS leaderboard_rank INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_action_date DATE,
  frozen_until DATE,
  freeze_used_this_week BOOLEAN DEFAULT FALSE,
  freeze_used_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  points_awarded INT DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- Random Rewards Table
CREATE TABLE IF NOT EXISTS random_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(100) NOT NULL, -- 'bonus_credits', 'double_points', 'mystery', 'unlock_feature'
  points_awarded INT DEFAULT 0,
  credits_awarded INT DEFAULT 0,
  unlocked_feature VARCHAR(255),
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_random_rewards_user_id ON random_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_random_rewards_claimed ON random_rewards(claimed);

-- Leaderboards Table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INT NOT NULL,
  week_number INT,
  month INT,
  year INT,
  rank INT,
  country VARCHAR(100),
  period VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'all_time'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_country ON leaderboards(country);

-- User Actions (for tracking points earned)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- 'upscale_2x', 'upscale_3x', 'upscale_4x', 'purchase_credits', 'referral'
  points_earned INT NOT NULL,
  action_count INT, -- For VR tracking
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created ON user_actions(created_at);

-- User Sessions (for tracking daily engagement)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  actions_count INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_date ON user_sessions(session_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_user_date ON user_sessions(user_id, session_date);

-- RLS Policies for Gamification Tables

-- User Streaks RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
ON user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can update streaks"
ON user_streaks FOR UPDATE
USING (true);

-- Achievements RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
ON achievements FOR SELECT
USING (auth.uid() = user_id);

-- Random Rewards RLS
ALTER TABLE random_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
ON random_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim own rewards"
ON random_rewards FOR UPDATE
USING (auth.uid() = user_id);

-- Leaderboards RLS
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboards are public"
ON leaderboards FOR SELECT
USING (true);

-- User Actions RLS
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions"
ON user_actions FOR SELECT
USING (auth.uid() = user_id);

-- User Sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Predefined Achievements
INSERT INTO achievements (user_id, achievement_type, achievement_name, points_awarded) VALUES
  ('00000000-0000-0000-0000-000000000000', 'tier_1', 'First Upscale', 10),
  ('00000000-0000-0000-0000-000000000000', 'tier_1', '5 in a Day', 25),
  ('00000000-0000-0000-0000-000000000000', 'tier_1', 'Week Warrior', 50),
  ('00000000-0000-0000-0000-000000000000', 'tier_2', 'Upscale Master', 100),
  ('00000000-0000-0000-0000-000000000000', 'tier_2', 'Credit Collector', 150),
  ('00000000-0000-0000-0000-000000000000', 'tier_2', 'Perfect Month', 200),
  ('00000000-0000-0000-0000-000000000000', 'tier_3', 'Legend Status', 500),
  ('00000000-0000-0000-0000-000000000000', 'tier_3', 'Platinum Member', 750),
  ('00000000-0000-0000-0000-000000000000', 'tier_3', 'Community Hero', 1000)
ON CONFLICT DO NOTHING;
