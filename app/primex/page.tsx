import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import PrimexCloneSelector from '../components/primex/PrimexCloneSelector';
import ModeSwitcher from '../components/ModeSwitcher';

export default async function PrimexPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has sovereign access
  const sovereignUserId = process.env.SOVEREIGN_USER_ID;
  const hasSovereignAccess = userId === sovereignUserId;

  if (!hasSovereignAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            PRIMEX Sovereign Mode is restricted to authorized personnel only.
          </p>
          <a
            href="/chat"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold transition-all"
          >
            Return to Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <ModeSwitcher currentMode="sovereign" hasSovereignAccess={true} />
      </div>
      <div className="flex-1 overflow-hidden">
        <PrimexCloneSelector />
      </div>
    </div>
  );
}
