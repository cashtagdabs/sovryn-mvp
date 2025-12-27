'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  shareId: string;
  title: string;
  preview: string;
  author: {
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    messages: number;
  };
  createdAt: string;
}

export default function ExplorePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [sort]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort,
        limit: '20',
      });
      
      if (search) {
        params.set('q', search);
      }

      const res = await fetch(`/api/gallery?${params}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SOVRYN
            </Link>
            <Link
              href="/chat"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              New Chat
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort conversations"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recent</option>
              <option value="trending">Trending</option>
              <option value="popular">Most Liked</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Explore Conversations</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No public conversations yet.</p>
            <Link
              href="/chat"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
            >
              Start the first one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/share/${conv.shareId}`}
                className="block p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition group"
              >
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition">
                  {conv.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {conv.preview}
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                  {conv.author.avatar && (
                    <img
                      src={conv.author.avatar}
                      alt={conv.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-400">{conv.author.name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>👁️ {conv.stats.views}</span>
                  <span>❤️ {conv.stats.likes}</span>
                  <span>💬 {conv.stats.messages}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
