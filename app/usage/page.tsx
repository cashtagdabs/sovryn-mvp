import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UsagePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Usage Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Messages This Month */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Messages This Month</div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-gray-400 text-sm">of 100 available</div>
            <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

          {/* API Calls */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">API Calls</div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-gray-400 text-sm">Unlimited on Pro</div>
            <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Storage Used</div>
            <div className="text-4xl font-bold text-white mb-2">0 MB</div>
            <div className="text-gray-400 text-sm">of 5 GB available</div>
            <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Usage Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Chat Messages</div>
                <div className="text-gray-400 text-sm">Conversations & responses</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">0</div>
                <div className="text-gray-400 text-sm">this month</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Search Queries</div>
                <div className="text-gray-400 text-sm">Web search & retrieval</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">0</div>
                <div className="text-gray-400 text-sm">this month</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Conversations</div>
                <div className="text-gray-400 text-sm">Total active conversations</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">0</div>
                <div className="text-gray-400 text-sm">total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Current Plan</h2>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-300 mb-2">You're on the <span className="text-purple-400 font-bold">Free Plan</span></div>
              <div className="text-gray-400 text-sm">100 messages per month • GPT-3.5 Turbo • Basic support</div>
            </div>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
