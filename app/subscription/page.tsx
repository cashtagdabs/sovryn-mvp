import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { SubscriptionContent } from './SubscriptionContent';

export default async function SubscriptionPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <SubscriptionContent />;
}
