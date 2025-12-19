'use client';

export const dynamic = 'force-dynamic';

import { useUser } from './hooks/useClerkUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardContent } from './dashboard/DashboardContent';

export default function Home() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Sovryn...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <DashboardContent />;
}
