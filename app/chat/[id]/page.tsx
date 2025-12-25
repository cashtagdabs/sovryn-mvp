import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/app/components/chat/ChatInterface';

export default async function ChatPage({ params }: any) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return <ChatInterface conversationId={params.id} />;
}
