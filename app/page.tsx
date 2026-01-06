'use client';

export const dynamic = 'force-dynamic';

import { useUser } from './hooks/useClerkUser';
import { DashboardContent } from './dashboard/DashboardContent';
import { LandingPage } from './components/LandingPage';

export default function Home() {
  const { isLoaded, user } = useUser();

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Sovryn...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users
  return <DashboardContent />;
}
