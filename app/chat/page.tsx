import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/app/components/chat/ChatInterface';
import ModeSwitcher from '@/app/components/ModeSwitcher';

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has sovereign access
  const sovereignUserId = process.env.SOVEREIGN_USER_ID;
  const hasSovereignAccess = userId === sovereignUserId;

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800">
        <ModeSwitcher currentMode="public" hasSovereignAccess={hasSovereignAccess} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
