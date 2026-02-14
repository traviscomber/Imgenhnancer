-- Gamification System for clar1ty
-- Implements intermittent reinforcement for sustained engagement

-- Users gamification stats
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  badges_earned TEXT[] DEFAULT '{}'; -- Array of badge IDs earned

-- Points system - tracks all point-earning activities
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'image_enhanced', 'streak_bonus', 'weekly_challenge', 'random_reward', etc.
  multiplier DECIMAL(3,2) DEFAULT 1.0, -- For streak bonuses (1.5x, 2x, etc)
  is_streak_bonus BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges - achievements and milestones
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id TEXT UNIQUE NOT NULL, -- 'first_enhance', 'speed_demon', 'artist', etc
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  rarity TEXT NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badge tracking
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Daily challenges (reset every day) - Intermittent Reinforcement
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'enhance_count', 'variety', 'time_based', 'random'
  base_points INTEGER NOT NULL,
  multiplier_chance DECIMAL(3,2) DEFAULT 0.25, -- 25% chance of 2x points
  active_from TIMESTAMP WITH TIME ZONE,
  active_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User daily challenge progress - tracks completion
CREATE TABLE IF NOT EXISTS user_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  bonus_multiplier_applied BOOLEAN DEFAULT false,
  date_started DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, date_started)
);

-- Streak tracking for habit formation
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_started_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Lucky spin rewards - Variable Ratio Schedule (the core gamification mechanic)
CREATE TABLE IF NOT EXISTS lucky_spin_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'bonus_points', 'bonus_credits', 'badge', 'multiplier'
  value INTEGER,
  rarity_weight DECIMAL(4,3), -- 0.001 to 0.999 for probability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User lucky spin tracking - tracks when they can spin
CREATE TABLE IF NOT EXISTS user_lucky_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spins_available INTEGER DEFAULT 0,
  last_spin_date TIMESTAMP WITH TIME ZONE,
  total_spins_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Lucky spin results - history of what they won
CREATE TABLE IF NOT EXISTS lucky_spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES lucky_spin_rewards(id),
  points_won INTEGER,
  credits_won INTEGER,
  badge_won UUID REFERENCES badges(id),
  multiplier_won DECIMAL(3,2),
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboards - Social gamification
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER,
  points_this_week INTEGER DEFAULT 0,
  points_this_month INTEGER DEFAULT 0,
  points_all_time INTEGER DEFAULT 0,
  level INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_id ON user_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_lucky_spin_history_user_id ON lucky_spin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_points_all_time ON leaderboards(points_all_time);

-- Initial lucky spin rewards with probability weights (Intermittent Schedule)
INSERT INTO lucky_spin_rewards (reward_id, name, description, reward_type, value, rarity_weight) VALUES
  ('common_10', '10 Bonus Points', 'Lucky you!', 'bonus_points', 10, 0.400),
  ('common_25', '25 Bonus Points', 'Nice!', 'bonus_points', 25, 0.250),
  ('rare_100', '100 Bonus Points', 'Very Lucky!', 'bonus_points', 100, 0.100),
  ('epic_50_credits', '50 Bonus Credits', 'Epic!', 'bonus_credits', 50, 0.050),
  ('legendary_2x', '2x Point Multiplier (24h)', 'LEGENDARY!', 'multiplier', 2, 0.030),
  ('epic_badge', 'Epic Badge', 'Rare Achievement', 'badge', 0, 0.020),
  ('jackpot_200', '200 Bonus Points', 'JACKPOT!!!', 'bonus_points', 200, 0.010),
  ('ultra_rare_100_credits', '100 Bonus Credits', 'Ultra Rare!', 'bonus_credits', 100, 0.100)
ON CONFLICT (reward_id) DO NOTHING;
