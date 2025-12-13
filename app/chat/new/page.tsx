import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PerfectChatInterface } from '@/app/components/chat/PerfectChatInterface';

export default async function NewChatPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <PerfectChatInterface />;
}
