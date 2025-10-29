import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/app/components/chat/ChatInterface';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return <ChatInterface conversationId={params.id} />;
}
