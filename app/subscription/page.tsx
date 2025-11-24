import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SubscriptionContent } from './SubscriptionContent';

export default async function SubscriptionPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <SubscriptionContent />;
}
