import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Flame, Zap, Crown, Medal, Star, ArrowLeft } from 'lucide-react';

export default async function LeaderboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Mock leaderboard data (replace with real database query)
  const leaderboard = [
    {
      rank: 1,
      username: 'AI_Master_2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      level: 42,
      xp: 125000,
      chats: 1250,
      streak: 89,
      badge: 'Legendary',
    },
    {
      rank: 2,
      username: 'PromptWizard',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      level: 38,
      xp: 98000,
      chats: 980,
      streak: 67,
      badge: 'Epic',
    },
    {
      rank: 3,
      username: 'ChatGPT_Slayer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      level: 35,
      xp: 87500,
      chats: 875,
      streak: 54,
      badge: 'Epic',
    },
    // Add more mock users
    ...Array.from({ length: 7 }, (_, i) => ({
      rank: i + 4,
      username: `User_${i + 4}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 4}`,
      level: 30 - i,
      xp: 75000 - i * 5000,
      chats: 750 - i * 50,
      streak: 45 - i * 3,
      badge: i < 3 ? 'Rare' : 'Common',
    })),
  ];

  const currentUserRank = {
    rank: 156,
    username: 'You',
    level: 8,
    xp: 1250,
    chats: 12,
    streak: 7,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0517] via-[#1a0f2e] to-[#050210] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-white/60 text-lg">
            Compete with the best AI users worldwide
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Top Player</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">AI_Master_2024</p>
            <p className="text-sm text-white/60 mt-1">Level 42 • 125K XP</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Longest Streak</h3>
            </div>
            <p className="text-3xl font-bold text-orange-400">89 Days</p>
            <p className="text-sm text-white/60 mt-1">AI_Master_2024</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Most Active</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">1,250 Chats</p>
            <p className="text-sm text-white/60 mt-1">This month</p>
          </div>
        </div>

        {/* Your Rank Card */}
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-purple-400">
                #{currentUserRank.rank}
              </div>
              <div>
                <p className="text-xl font-semibold text-white">Your Rank</p>
                <p className="text-sm text-white/60">
                  Level {currentUserRank.level} • {currentUserRank.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{currentUserRank.chats}</p>
                <p className="text-xs text-white/60">Chats</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{currentUserRank.streak}</p>
                <p className="text-xs text-white/60">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    XP
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Chats
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr
                    key={user.rank}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.rank === 1 && <Crown className="w-5 h-5 text-yellow-400" />}
                        {user.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                        {user.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className="text-lg font-bold text-white">
                          #{user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                        />
                        <span className="font-medium text-white">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-purple-400 font-semibold">
                        {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/80">
                        {user.xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/80">{user.chats}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-semibold">
                          {user.streak}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.badge === 'Legendary'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            : user.badge === 'Epic'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                            : user.badge === 'Rare'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        }`}
                      >
                        {user.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/60 mb-4">
            Want to climb the ranks? Start chatting and earn XP!
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Zap className="w-5 h-5" />
            Start Chatting
          </Link>
        </div>
      </div>
    </div>
  );
}
