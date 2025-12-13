import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function SharePage({
  params,
}: {
  params: { shareId: string };
}) {
  // Fetch conversation by shareId
  const conversation = await prisma.conversation.findUnique({
    where: { shareId: params.shareId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      user: {
        select: {
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!conversation || !conversation.isPublic) {
    notFound();
  }

  // Increment view count
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            SOVRYN
          </Link>
          <Link
            href="/chat"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Try PRIMEX
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Conversation Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{conversation.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              {conversation.user.avatarUrl && (
                <img
                  src={conversation.user.avatarUrl}
                  alt={conversation.user.name || 'User'}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>{conversation.user.name || conversation.user.username || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{conversation.viewCount} views</span>
            <span>•</span>
            <span>{conversation.likeCount} likes</span>
            <span>•</span>
            <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`p-6 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-900/20 border border-blue-800/30'
                  : 'bg-gray-800/50 border border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold">
                  {message.role === 'user' ? '👤 You' : '🤖 PRIMEX'}
                </span>
                {message.model && (
                  <span className="text-xs text-gray-500">({message.model})</span>
                )}
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Want to chat with PRIMEX?</h2>
          <p className="text-gray-300 mb-6">
            Experience the most advanced AI platform with privacy-first architecture
          </p>
          <Link
            href="/chat"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
          >
            Start Chatting →
          </Link>
        </div>
      </main>
    </div>
  );
}
