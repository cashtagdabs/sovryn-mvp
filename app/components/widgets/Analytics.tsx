/**
 * Analytics & Gamification Widgets
 * Real-time stats, achievements, and engagement tracking
 * Designed to drive retention and viral growth (research-backed)
 */

'use client';

import React from 'react';
import { Card, StatWidget, Badge } from '@/app/components/widgets';
import { Flame, Trophy, Star, Zap, Target, TrendingUp } from 'lucide-react';

// ============================================================================
// ACHIEVEMENT WIDGET - Display user achievements and badges
// ============================================================================
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementWidgetProps {
  achievements: Achievement[];
  totalUnlocked: number;
  maxAchievements: number;
}

export function AchievementWidget({
  achievements,
  totalUnlocked,
  maxAchievements,
}: AchievementWidgetProps) {
  const rarityColors = {
    common: 'border-gray-500/50 bg-gray-500/10 text-gray-300',
    rare: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
    epic: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
    legendary: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  };

  return (
    <Card variant="glass" className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Achievements
        </h3>
        <span className="text-sm text-white/60">
          {totalUnlocked} / {maxAchievements}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${Math.round((totalUnlocked / maxAchievements) * 100)}%` }}
        />
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-4 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`
              flex items-center justify-center p-3 rounded-lg border
              cursor-pointer transition-all duration-200 hover:scale-110
              ${achievement.unlockedAt ? rarityColors[achievement.rarity] : 'border-white/10 bg-white/5 opacity-40'}
            `}
            title={achievement.name}
          >
            <span className="text-2xl">{achievement.icon}</span>
          </div>
        ))}
      </div>

      {/* Recent unlocks */}
      {achievements.filter((a) => a.unlockedAt).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/60 mb-2">Recently Unlocked</p>
          <div className="space-y-2">
            {achievements
              .filter((a) => a.unlockedAt)
              .slice(-3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-white/50">{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// STREAK WIDGET - Display usage streaks and consistency
// ============================================================================
interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  lastActivityDate: Date;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
  daysActive,
  lastActivityDate,
}: StreakWidgetProps) {
  const isActive = new Date().getTime() - lastActivityDate.getTime() < 86400000; // 24 hours

  return (
    <Card
      variant="gradient"
      className="relative overflow-hidden space-y-4"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/10 -z-10" />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isActive ? 'text-orange-400 animate-pulse' : 'text-gray-400'}`} />
          Activity Streak
        </h3>
        {isActive && <Badge label="Active Today" variant="success" icon={<Zap className="w-3 h-3" />} />}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-300">{currentStreak}</div>
          <p className="text-xs text-white/60 mt-1">Current</p>
        </div>
        <div className="text-center border-l border-r border-white/10">
          <div className="text-3xl font-bold text-purple-300">{longestStreak}</div>
          <p className="text-xs text-white/60 mt-1">Longest</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-pink-300">{daysActive}</div>
          <p className="text-xs text-white/60 mt-1">Total Days</p>
        </div>
      </div>

      <p className="text-xs text-white/50 text-center">
        Keep it up! Use Sovryn daily to maintain your streak.
      </p>
    </Card>
  );
}

// ============================================================================
// ENGAGEMENT SUMMARY WIDGET - Overview of user engagement metrics
// ============================================================================
interface EngagementSummaryProps {
  chatCount: number;
  modelsUsed: number;
  tokensProcessed: number;
  averageResponseTime: number; // in ms
  satisfaction: number; // 1-5
}

export function EngagementSummary({
  chatCount,
  modelsUsed,
  tokensProcessed,
  averageResponseTime,
  satisfaction,
}: EngagementSummaryProps) {
  return (
    <Card variant="default" className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        Your Engagement
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <StatWidget
          label="Chats This Month"
          value={chatCount}
          icon={<Zap className="w-5 h-5" />}
          color="purple"
          trend={{ value: 12, isPositive: true }}
        />
        <StatWidget
          label="Models Explored"
          value={modelsUsed}
          icon={<Star className="w-5 h-5" />}
          color="pink"
          trend={{ value: 3, isPositive: true }}
        />
        <StatWidget
          label="Tokens Processed"
          value={`${Math.round(tokensProcessed / 1000)}K`}
          icon={<Target className="w-5 h-5" />}
          color="cyan"
          trend={{ value: 25, isPositive: true }}
        />
        <div className="rounded-xl bg-gradient-to-br from-green-800/20 to-black/40 p-6 border border-green-700/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-green-300">
              {averageResponseTime}ms
            </span>
            <span className="text-sm text-white/60">Avg Response</span>
          </div>
        </div>
      </div>

      {/* Satisfaction rating */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/70 mb-2">Satisfaction Rating</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < satisfaction ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// LEVELING SYSTEM WIDGET - XP and level progression
// ============================================================================
interface LevelingWidgetProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export function LevelingWidget({
  currentLevel,
  currentXP,
  xpToNextLevel,
  totalXP,
}: LevelingWidgetProps) {
  const xpPercentage = (currentXP / xpToNextLevel) * 100;

  return (
    <Card variant="glass" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Level {currentLevel}</h3>
        <Badge label={`${totalXP} Total XP`} variant="info" />
      </div>

      {/* Level progress */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60">
          <span>{currentXP} XP</span>
          <span>{xpToNextLevel} to next level</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/60 mb-3">Upcoming Milestones</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-white/70">Level {currentLevel + 1}</span>
            <span className="text-xs text-white/50">+{xpToNextLevel - currentXP} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-sm text-white/70">Reach Level {Math.floor(currentLevel / 10) * 10 + 10}</span>
            <span className="text-xs text-white/50">Unlock Premium</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
