import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ConversationSidebar } from '@/app/components/chat/ConversationSidebar';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <ConversationSidebar />
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
