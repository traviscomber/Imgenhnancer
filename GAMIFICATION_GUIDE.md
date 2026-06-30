# clar1ty Gamification System - Complete Guide

## Overview

The clar1ty gamification system implements **intermittent reinforcement** (Variable-Ratio Schedule) to create a highly engaging, habit-forming user experience. This psychology-based approach uses unpredictable rewards to maintain sustained user engagement and encourage repeated interactions.

---

## Core Principles

### 1. **Intermittent Reinforcement (Variable-Ratio Schedule)**

**What it is:** Rewards are given at unpredictable intervals based on actions, not time.

**Psychology:** This is the same principle behind slot machines and loot boxes - the uncertainty creates dopamine anticipation and habit formation.

**Implementation in clar1ty:**
- Users don't know exactly when they'll get a bonus point multiplier
- Each image enhancement has a 15% chance of triggering a 2x point bonus
- Daily challenges have a 25% chance of doubling reward points when completed
- Lucky Spins use weighted probability (rarity system) for completely unpredictable rewards

**Result:** Users keep engaging even when rewards aren't guaranteed, creating strong habit loops.

---

## Game Mechanics

### Points System

#### Point Awards by Action
- **Image Enhancement (2x):** 10 base + 10 (scale factor bonus)
- **Image Enhancement (3x):** 10 base + 15 (scale factor bonus)
- **Image Enhancement (4x):** 10 base + 20 (scale factor bonus)
- **Daily Challenge Complete:** 50 base points (25% chance of 2x)
- **Streak Bonus:** 1.2x - 3.0x multiplier (up to 10+ day streaks)
- **Level Up Bonus:** 100 points
- **Random Boost (15% chance):** 2x points on any action
- **Lucky Spin Wins:** 10-200 bonus points (weighted by rarity)

**Multiplier Stacking:** If a user gets a 5-day streak (1.8x) AND random boost triggers (2x), they earn 3.6x points on an image enhancement.

### Levels & Progression

```
Level Calculation: (Total Points / 500) + 1

Level 1: 0-500 points
Level 2: 500-1,000 points
Level 3: 1,000-1,500 points
...
Level 10: 4,500-5,000 points
```

**Rewards per Level Up:**
- 100 bonus points
- Unlock new badge potential
- Increased leaderboard visibility
- Social prestige

### Streak System

**Objective:** Encourage daily habits

**Mechanics:**
- Current streak tracked (consecutive days with activity)
- Longest streak tracked (personal best)
- Multiplier increases with streak length:
  - 1 day: 1.2x
  - 3 days: 1.6x
  - 5 days: 1.8x
  - 7 days: 2.0x
  - 10+ days: 3.0x (max)

**Streak Reset:** Breaking streak resets to 1, but personal best is remembered

**Psychology:** Users don't want to "break the chain" - creates powerful daily return habit

### Daily Challenges

**How they work:**
1. 3-5 random challenges assigned daily
2. Challenges reset at midnight UTC
3. Examples:
   - Enhance 5 images
   - Use variety of upscale factors (2x, 3x, 4x)
   - Complete enhancement within time window
   - Enhance with specific settings

**Completion Rewards:**
- 50 base points
- 25% chance of bonus multiplier (100 points instead)
- Contributes to weekly achievements
- Builds toward badges

**Psychology:** Challenges provide clear goals (behavioral psychology), unpredictable bonuses maintain engagement (intermittent reinforcement)

### Lucky Spin - THE KEY MECHANIC

**What it is:** The core intermittent reinforcement system

**How to earn spins:**
- 1 spin for every 10 image enhancements
- 1 spin for daily challenge completion
- Bonus spins for milestone achievements
- Max 10 spins storable (prevents hoarding)

**What you can win (weighted probability):**

| Reward | Type | Value | Rarity | Weight | Chance |
|--------|------|-------|--------|--------|--------|
| 10 Bonus Points | Common | 10 | 40% | 0.400 | 40% |
| 25 Bonus Points | Common | 25 | 25% | 0.250 | 25% |
| 100 Bonus Points | Rare | 100 | 10% | 0.100 | 10% |
| 50 Bonus Credits | Rare | 50 | 5% | 0.050 | 5% |
| 2x Multiplier (24h) | Epic | 2x | 3% | 0.030 | 3% |
| Epic Badge | Epic | — | 2% | 0.020 | 2% |
| 200 Bonus Points | Legendary | 200 | 1% | 0.010 | 1% |
| 100 Bonus Credits | Ultra-Rare | 100 | 10% | 0.100 | 10% |

**The Mechanics of Uncertainty:**
- Users don't know what they'll get
- Probability-weighted selection creates realistic odds
- Some rewards are rarer than others (creating collection goals)
- Can win bonus credits (monetary value reinforcement)
- Multiplier rewards create meta-gaming (stack with other bonuses)

**Why it works:** The variable-ratio schedule used by slot machines - users become *addicted* to the uncertainty

### Badges & Achievements

**Badge Categories:**
1. **Milestone Badges**
   - First Enhancement
   - 100 Enhancements
   - 1,000 Enhancements
   - Level 5, 10, 20, 50

2. **Skill Badges**
   - Speed Demon (5 enhancements in 1 hour)
   - Master of 4x (100 4x upscales)
   - Streak Master (30-day streak)
   - Perfect Challenger (Complete all 3 daily challenges 7 days straight)

3. **Rarity Badges**
   - Common (easy to get)
   - Rare (requires 50 actions)
   - Epic (requires 500 actions or special condition)
   - Legendary (< 1% of users will earn)

**Badge Benefits:**
- Visual status indicator
- Bonus points (10-50 per badge)
- Unlock special rewards
- Social prestige on leaderboards

### Leaderboards

**Three leaderboard types:**
1. **Weekly Leaderboard** - Resets every Sunday
2. **Monthly Leaderboard** - Resets first of month
3. **All-Time Leaderboard** - Never resets

**Ranking based on:**
- Points earned in period
- User level
- Streak status (tiebreaker)
- Badge count (tiebreaker)

**Social Psychology:** Competition drives engagement, especially for top positions

---

## Database Schema

### Core Tables

```sql
-- User gamification stats
users.total_points
users.level
users.streak_days
users.last_activity_date
users.badges_earned
users.free_upscales_available
users.last_monthly_free_upscale

-- Point tracking
user_points
- points (amount awarded)
- reason (what earned it)
- multiplier (streak/bonus multiplier)
- is_streak_bonus
- created_at

-- Badges system
badges (badge definitions)
user_badges (user achievements)

-- Daily challenges
daily_challenges (challenge definitions)
user_daily_progress (user progress tracking)

-- Streaks
user_streaks
- current_streak
- longest_streak
- last_activity_date
- streak_started_date

-- Lucky Spins
lucky_spin_rewards (reward definitions with weights)
user_lucky_spins (availability tracking)
lucky_spin_history (results history)

-- Social
leaderboards (ranked users)
```

---

## User Journey Map

### Day 1: New User
1. Sign up → Awarded 5 free upscales + 100 starting points
2. First enhancement → +10 points, badge "First Step"
3. **Random trigger (15% chance):** Get 2x multiplier, earn +20 points
4. User excitement → Creates positive first impression
5. Daily challenge presented
6. Earn first spin after 10 actions
7. Lucky spin creates dopamine hit (intermittent reinforcement peak)

### Week 1-2: Habit Formation
- Daily engagement creates 7-day streak
- 1.8x multiplier on all points
- Multiple daily challenge completions
- Accumulated spins = multiple lucky wins
- First badge unlocked (e.g., "Speed Demon")
- **Psychological effect:** User builds habit, doesn't want to break streak

### Month 1: Engagement Peak
- Level 3-5 achieved
- 10+ day streak active
- 3.0x multiplier active
- Multiple badges displayed
- Top ranking on leaderboard
- **Psychological effect:** Status, achievement, social proof drive continued engagement

### Month 2+: Sustained Engagement
- Competition for top leaderboard positions
- Badge collection becomes goal (completionist psychology)
- Streaks become source of pride
- Points become currency/status symbol
- Lucky Spins remain unpredictable and engaging

---

## Implementation Checklist

### Database Setup
- [ ] Run `scripts/006-gamification-system.sql`
- [ ] Create RLS policies for gamification tables
- [ ] Set up indexes for performance

### API Integration
- [ ] Integrate `lib/gamification.ts` into `/app/api/enhance-replicate/route.ts`
- [ ] Call `awardEnhancementPoints()` after successful enhancement
- [ ] Call `checkStreakBonus()` to calculate multipliers
- [ ] Call `updateDailyChallengeProgress()` for challenges
- [ ] Call `checkLevelUp()` after point awards

### Frontend Components
- [ ] Add `RewardsDashboard` to user dashboard
- [ ] Integrate lucky spin button
- [ ] Show points/badges in navbar
- [ ] Display streak information prominently
- [ ] Add leaderboard page

### Cron Jobs (Optional but Recommended)
- [ ] Daily challenge reset at midnight UTC
- [ ] Daily leaderboard updates
- [ ] Weekly leaderboard snapshot
- [ ] Monthly reset leaderboards

### Monitoring
- [ ] Track engagement metrics (points awarded, streaks, spins)
- [ ] Monitor for abuse (farming, automation)
- [ ] Analyze retention impact

---

## Psychology Behind Each Mechanic

| Mechanic | Psychology Principle | Effect |
|----------|----------------------|--------|
| **Intermittent Rewards** | Variable-Ratio Schedule | Creates addiction-like engagement |
| **Streak System** | Sunk Cost Fallacy | Users don't want to break chain |
| **Daily Challenges** | Goal-Setting Theory | Clear objectives drive action |
| **Levels & XP** | Progress Psychology | Sense of advancement |
| **Lucky Spins** | Loot Box Mechanics | Dopamine anticipation |
| **Leaderboards** | Competition/Status | Social proof & prestige |
| **Badges** | Collection Psychology | Completionist drive |
| **Random Multipliers** | Surprise & Delight | Unexpected rewards = stronger memory |

---

## Success Metrics

**Measure effectiveness via:**
1. **Retention Rate:** % of users returning after 7/30/90 days
2. **Daily Active Users (DAU):** Trend over time
3. **Average Points per User:** Engagement intensity
4. **Streak Data:** % of users maintaining streaks
5. **Leaderboard Engagement:** % viewing/competing
6. **Badge Unlock Rate:** Progression velocity
7. **Lucky Spin Usage:** Frequency of spins taken

**Target Goals (after 3 months):**
- 60% Day 7 retention (vs industry average 25%)
- 35% Day 30 retention (vs industry average 10%)
- Average 5-day streak length
- 15+ badges earned per active user

---

## Ethical Considerations

**This system uses intermittent reinforcement intentionally. Remember:**
- ✓ Creates genuine value (free upscales, bonus features)
- ✓ No loot boxes with real money required
- ✓ All rewards are cosmetic or functional (not pay-to-win)
- ✓ Transparent odds displayed for all rewards
- ✓ No time-limited fear-of-missing-out (FOMO) mechanics
- ⚠ Users should be able to opt-out of gamification
- ⚠ Clearly disclose engagement mechanics

---

## Future Enhancements

1. **Seasonal Events** - Limited-time challenges/rewards
2. **Guilds/Teams** - Collaborative challenges
3. **Prestige System** - Reset and repeat for new goals
4. **Cosmetic Rewards** - Avatar themes, badges display options
5. **Social Sharing** - Share achievements for bonus points
6. **Referral Bonuses** - Point rewards for invites
7. **Tiered Membership** - Premium gamification features

---

**Last Updated:** February 2026
**System Version:** 1.0
**Psychology Consultant:** Behavioral Science Principles
