'use client';

import Link from 'next/link';

export function DashboardContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900/20 to-black text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
        <header>
          <h1 className="text-3xl font-bold">SOVRYN AI Dashboard</h1>
          <p className="mt-2 text-sm text-white/60">
            Start chatting with multi-model AI or manage your subscription.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/chat"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-500/60"
          >
            <h2 className="text-xl font-semibold">Chat</h2>
            <p className="mt-2 text-sm text-white/60">
              Open the AI chat, pick a model, and start a conversation.
            </p>
          </Link>

          <Link
            href="/subscription"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-500/60"
          >
            <h2 className="text-xl font-semibold">Subscriptions</h2>
            <p className="mt-2 text-sm text-white/60">
              View your current plan, usage, and upgrade to unlock more power.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

