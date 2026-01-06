'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { LiveTakeOverPanel } from '../components/LiveTakeOverPanel';
import { Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BrowserPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
          <p className="text-gray-400 mb-4">Please sign in to use the AI Browser feature</p>
          <Link 
            href="/sign-in"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-bold text-white">AI Browser Automation</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Logged in as</span>
              <span className="text-sm font-medium text-white">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
            <h2 className="font-semibold text-purple-300 mb-2">How it works</h2>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>Describe a task</strong> - Tell the AI what you want it to do on the web</li>
              <li>• <strong>Watch in real-time</strong> - See the AI navigate and interact with websites</li>
              <li>• <strong>Take control anytime</strong> - Click "Take Control" to handle logins, CAPTCHAs, or sensitive actions</li>
              <li>• <strong>Return control</strong> - Let the AI continue where you left off</li>
            </ul>
          </div>

          {/* Live TakeOver Panel */}
          <LiveTakeOverPanel 
            userId={user.id}
            serverUrl={process.env.NEXT_PUBLIC_BROWSER_SERVICE_URL || 'http://localhost:3001'}
          />

          {/* Tips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <h3 className="font-semibold text-white mb-2">💡 Tip: Be Specific</h3>
              <p className="text-sm text-gray-400">
                The more specific your task description, the better the AI can help.
              </p>
            </div>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <h3 className="font-semibold text-white mb-2">🔐 Tip: Secure Logins</h3>
              <p className="text-sm text-gray-400">
                Take control when logging in - your credentials stay private.
              </p>
            </div>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <h3 className="font-semibold text-white mb-2">⚡ Tip: Quick Actions</h3>
              <p className="text-sm text-gray-400">
                Use keyboard shortcuts in fullscreen mode for faster interaction.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
