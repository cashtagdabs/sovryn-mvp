/**
 * Sovryn AI Dashboard - Premium, Modular, World-Class
 * 
 * Features:
 * - Advanced theme system (light/dark/gradient/glass/custom)
 * - Modular widget architecture
 * - Glassmorphism effects & premium branding
 * - Gamification & engagement tracking
 * - Real-time analytics & user insights
 * - Responsive, accessible, and beautiful
 * 
 * Research-backed design informed by Apple, Google, Meta, OpenAI, Notion, Superhuman, Linear
 */

'use client';

import Link from 'next/link';
import {
  Sparkles,
  MessageCircle,
  CreditCard,
  BarChart2,
  Zap,
  Shield,
  Users,
  Settings,
  Search,
  Bell,
  Flame,
  Trophy,
} from 'lucide-react';
import { SovrynLogo } from '@/app/components/SovrynLogo';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Card,
  StatWidget,
  FeatureCard,
  ActionCard,
  Button,
  Badge,
} from '@/app/components/widgets';
import {
  AchievementWidget,
  StreakWidget,
  EngagementSummary,
  LevelingWidget,
} from '@/app/components/widgets/Analytics';
import { SearchModal } from '@/app/components/SearchModal';
import { NotificationsDropdown } from '@/app/components/NotificationsDropdown';

export function DashboardContent() {
  const { user } = useUser();

  // ========================================================================
  // Theme & Customization State
  // ========================================================================
  const [theme, setTheme] = useState<'dark' | 'light' | 'gradient' | 'glass' | 'custom'>('gradient');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sovryn-theme') as typeof theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    localStorage.setItem('sovryn-theme', newTheme);
  };

  // ========================================================================
  // User Data & Metrics
  // ========================================================================
  const greeting = user
    ? `Welcome back, ${user.firstName || user.username || 'Sovryn User'}!`
    : 'Welcome to Sovryn AI!';

  const avatarUrl =
    user?.imageUrl ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username || 'sovryn'}`;

  // Live usage & profile data (fetched from server)
  type UsageData = {
    usage?: {
      currentStreak?: number;
      longestStreak?: number;
      daysActive?: number;
      currentLevel?: number;
      currentXP?: number;
      xpToNextLevel?: number;
      totalXP?: number;
      // additional engagement fields
      chatCount?: number;
      modelsUsed?: number;
      tokensProcessed?: number;
      averageResponseTime?: number;
      satisfaction?: number;
    };
  };

  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState<boolean>(true);
  const [usageError, setUsageError] = useState<string | null>(null);

  // Fallback mock achievements while server data loads
  const achievements = [
    { id: '1', name: 'First Chat', description: 'Send your first message', icon: '🎉', unlockedAt: new Date(), rarity: 'common' as const },
    { id: '2', name: 'Speed Demon', description: 'Get response in <100ms', icon: '⚡', unlockedAt: new Date(), rarity: 'rare' as const },
    { id: '3', name: 'Model Master', description: 'Use 5 different models', icon: '🎓', unlockedAt: new Date(), rarity: 'epic' as const },
    { id: '4', name: 'Streak Starter', description: 'Get 7-day streak', icon: '🔥', unlockedAt: new Date(), rarity: 'epic' as const },
    { id: '5', name: 'Token Titan', description: 'Process 1M tokens', icon: '💎', unlockedAt: undefined, rarity: 'legendary' as const },
    { id: '6', name: 'Social Butterfly', description: 'Share 3 chats', icon: '🦋', unlockedAt: undefined, rarity: 'rare' as const },
    { id: '7', name: 'Premium Pro', description: 'Upgrade to premium', icon: '👑', unlockedAt: undefined, rarity: 'epic' as const },
    { id: '8', name: 'World Changer', description: 'Reach level 20', icon: '🌍', unlockedAt: undefined, rarity: 'legendary' as const },
  ];

  // Fetch user usage on mount
  useState(() => {
    let cancelled = false;
    async function loadUsage() {
      try {
        setUsageLoading(true);
        const res = await fetch('/api/user/usage', { cache: 'no-store' });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || 'Failed to fetch usage');
        }
        const data = await res.json();
        if (!cancelled) setUsageData(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (!cancelled) setUsageError(message);
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    }
    loadUsage();
    return () => {
      cancelled = true;
    };
  });

  // ========================================================================
  // Theme Styling
  // ========================================================================
  const themeBg = {
    dark: 'bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#0a0a0a]',
    light: 'bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-900',
    gradient: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
    glass: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
    custom: 'bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210]',
  };

  return (
    <div className={`min-h-screen ${themeBg[theme]} transition-all duration-500 text-white`}>
      {/* ====================================================================
          FIXED HEADER - Theme Switcher, Search, Notifications, Settings
          ==================================================================== */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-1">
            <SovrynLogo className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Sovryn AI
              </h1>
              <p className="text-xs text-white/50">Sovereign Multi-Model AI</p>
            </div>
          </div>

          {/* Search & Command Palette */}
          <div className="flex-1 max-w-md mx-4">
            <div
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
            >
              <Search className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">Search... (⌘K)</span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-white/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <NotificationsDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            </div>

            {/* Theme Switcher */}
            <div className="flex gap-1 border-l border-white/10 pl-4">
              {(['dark', 'light', 'gradient', 'glass'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    theme === t
                      ? 'bg-purple-600/80 text-white shadow-lg'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Settings */}
            <Link href="/settings">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors border-l border-white/10 pl-4">
                <Settings className="w-5 h-5 text-white/70" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================================
          ANIMATED BACKGROUND EFFECTS
          ==================================================================== */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-40 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        {theme === 'glass' && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
      </div>

      {/* ====================================================================
          MAIN CONTENT - Scrollable Dashboard
          ==================================================================== */}
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 space-y-8">
          {/* ================================================================
              USER PROFILE CARD - Personalized greeting with quick actions
              ================================================================ */}
          <Card variant="glass" className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className="w-20 h-20 rounded-full border-2 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg"
              style={{
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: 'cover',
              }}
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">{greeting}</h2>
                {usageLoading ? (
                  <div className="mt-2 text-sm text-muted-foreground">Loading your usage…</div>
                ) : usageError ? (
                  <div className="mt-2 text-sm text-red-500">Error loading usage: {usageError}</div>
                ) : null}
              <p className="text-white/60 mb-4">Ready to create, analyze, and innovate?</p>
              <div className="flex flex-wrap gap-2">
                <Badge label="Level 8" icon={<Trophy className="w-3 h-3" />} variant="default" />
                <Badge label="7-Day Streak" icon={<Flame className="w-3 h-3" />} variant="success" />
                <Badge label="Premium Member" icon={<Users className="w-3 h-3" />} variant="info" />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/chat">
                <Button variant="primary">Quick Start</Button>
              </Link>
              <Link href="/settings">
                <Button variant="secondary">Profile</Button>
              </Link>
            </div>
          </Card>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatWidget label="Chats" value={usageData?.usage?.chatCount ?? 0} icon={<MessageCircle className="w-5 h-5" />} color="purple" />
              <StatWidget label="Models" value={usageData?.usage?.modelsUsed ?? 0} icon={<Sparkles className="w-5 h-5" />} color="pink" />
              <StatWidget label="Tokens" value={`${Math.round((usageData?.usage?.tokensProcessed ?? 0) / 1000)}K`} icon={<BarChart2 className="w-5 h-5" />} color="cyan" />
              <StatWidget label="Response (ms)" value={usageData?.usage?.averageResponseTime ?? 0} icon={<Zap className="w-5 h-5" />} color="amber" />
              <StatWidget label="Satisfaction" value={`${usageData?.usage?.satisfaction ?? 0}/5`} icon={<Trophy className="w-5 h-5" />} color="purple" />
            </div>

          {/* ================================================================
              QUICK ACTIONS - Main feature cards (Chat, Subscriptions, Usage)
              ================================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Chat"
              description="Select from GPT-4, Claude 3.5, Groq, Ollama, and more. Stream responses in real-time."
              href="/chat"
              color="purple"
            />
            <ActionCard
              icon={<CreditCard className="w-6 h-6" />}
              title="Subscriptions"
              description="Flexible plans, transparent billing, and instant upgrades to unlock premium models."
              href="/subscription"
              color="pink"
            />
            <ActionCard
              icon={<BarChart2 className="w-6 h-6" />}
              title="Usage Analytics"
              description="Real-time stats, usage insights, and plan limit tracking at a glance."
              href="/usage"
              color="cyan"
            />
          </div>

          {/* ================================================================
              ENGAGEMENT ANALYTICS - Detailed user metrics & insights
              ================================================================ */}
          <EngagementSummary
            chatCount={usageData?.usage?.chatCount ?? 0}
            modelsUsed={usageData?.usage?.modelsUsed ?? 0}
            tokensProcessed={usageData?.usage?.tokensProcessed ?? 0}
            averageResponseTime={usageData?.usage?.averageResponseTime ?? 0}
            satisfaction={usageData?.usage?.satisfaction ?? 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StreakWidget
              currentStreak={usageData?.usage?.currentStreak ?? 0}
              longestStreak={usageData?.usage?.longestStreak ?? 0}
              daysActive={usageData?.usage?.daysActive ?? 0}
              lastActivityDate={new Date()}
            />
            <LevelingWidget
              currentLevel={usageData?.usage?.currentLevel ?? 1}
              currentXP={usageData?.usage?.currentXP ?? 0}
              xpToNextLevel={usageData?.usage?.xpToNextLevel ?? 1000}
              totalXP={usageData?.usage?.totalXP ?? 0}
            />
            <AchievementWidget
              achievements={achievements}
              totalUnlocked={achievements.filter((a) => a.unlockedAt).length}
              maxAchievements={achievements.length}
            />
          </div>

          {/* ================================================================
              STATS SECTION - Key metrics and platform capabilities
              ================================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatWidget
              label="AI Models Available"
              value="7+"
              icon={<Sparkles className="w-5 h-5" />}
              color="purple"
              trend={{ value: 40, isPositive: true }}
            />
            <StatWidget
              label="Unlimited Conversations"
              value="∞"
              icon={<Zap className="w-5 h-5" />}
              color="pink"
              trend={{ value: 100, isPositive: true }}
            />
            <StatWidget
              label="99.9% Uptime"
              value="24/7"
              icon={<Shield className="w-5 h-5" />}
              color="cyan"
              trend={{ value: 99, isPositive: true }}
            />
          </div>

          {/* ================================================================
              FEATURE HIGHLIGHTS - Core capabilities & differentiators
              ================================================================ */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Why Choose Sovryn?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Sparkles className="w-6 h-6 text-fuchsia-300" />}
                title="Next-Gen AI"
                description="Access the latest models. Claude 3.5, GPT-4 Turbo, and more, all at your fingertips."
                color="purple"
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-yellow-300" />}
                title="Lightning Fast"
                description="Real-time streaming, optimized queries, and instant response switching between models."
                color="pink"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-blue-300" />}
                title="Secure & Private"
                description="Enterprise-grade encryption, zero data retention, and privacy-first architecture."
                color="cyan"
              />
            </div>
          </div>

          {/* ================================================================
              COLLABORATION & SOCIAL - Share, invite, leaderboards
              ================================================================ */}
          <Card variant="default" className="space-y-6">
            <h2 className="text-xl font-bold text-white">Collaborate & Share</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Invite Your Team</p>
                <p className="text-sm text-white/70">
                  Collaborate in real-time with instant presence indicators and unified comments.
                </p>
                <Button variant="secondary" size="sm">
                  Invite Members
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Share Achievements</p>
                <p className="text-sm text-white/70">
                  Show off your accomplishments and unlock referral rewards.
                </p>
                <Button variant="secondary" size="sm">
                  View Leaderboards
                </Button>
              </div>
            </div>
          </Card>

          {/* ================================================================
              CALL-TO-ACTION - Primary engagement driver
              ================================================================ */}
          <Card variant="glass" className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Ready to Experience the Future?</h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Jump into the chat, explore different models, unlock achievements, and join thousands of users
              transforming their productivity with Sovryn.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/chat">
                <Button variant="primary" size="lg">
                  Start Chatting Now
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </Card>

          {/* ================================================================
              FOOTER
              ================================================================ */}
          <footer className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Users className="w-4 h-4" />
              <span>Built for power users, enterprises, and creators</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/80 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                Pricing
              </a>
              <span>© 2025 Sovryn AI. All rights reserved.</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}

