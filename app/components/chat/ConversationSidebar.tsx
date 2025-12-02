'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentId =
    pathname && pathname.startsWith('/chat/')
      ? pathname.split('/chat/')[1]
      : null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/conversations');
        if (!res.ok) return;
        const data = await res.json();
        setConversations(data);
      } catch (e) {
        console.error('Failed to load conversations', e);
      }
    };

    load();
  }, []);

  const handleNewChat = () => {
    if (loading) return;
    router.push('/chat');
  };

  return (
    <aside className="flex w-72 flex-col border-r border-white/10 bg-black/80">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        <span className="text-sm font-semibold text-white/80">
          Conversations
        </span>
        <button
          onClick={handleNewChat}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg bg-purple-600 px-2 py-1 text-xs font-semibold disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 && (
          <p className="px-3 text-xs text-white/40">No conversations yet.</p>
        )}

        {conversations.map((c) => {
          const active = c.id === currentId;
          return (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${
                active
                  ? 'bg-purple-600/20 text-white'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="truncate">{c.title}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

