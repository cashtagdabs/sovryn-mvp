'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Search, Menu, X, Trash2, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/app/lib/utils';
import { UserButton } from '@clerk/nextjs';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== id));
        if (pathname === `/chat/${id}`) {
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const regularConversations = filteredConversations.filter((c) => !c.isPinned);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-black/40 p-2 backdrop-blur-xl lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10',
              'bg-black/40 backdrop-blur-xl lg:relative lg:z-0'
            )}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-white/10 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">SOVRYN</h2>
                  <UserButton afterSignOutUrl="/" />
                </div>
                <button
                  onClick={handleNewChat}
                  className={cn(
                    'flex w-full items-center justify-center space-x-2 rounded-lg',
                    'bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5',
                    'font-medium text-white transition-all hover:opacity-90'
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-white/10 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className={cn(
                      'w-full rounded-lg border border-white/10 bg-white/5',
                      'py-2 pl-10 pr-4 text-sm text-white placeholder-white/40',
                      'focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50'
                    )}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-4">
                {pinnedConversations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase text-white/40">
                      Pinned
                    </h3>
                    <div className="space-y-2">
                      {pinnedConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={pathname === `/chat/${conversation.id}`}
                          onDelete={handleDeleteConversation}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {regularConversations.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase text-white/40">
                      Recent
                    </h3>
                    <div className="space-y-2">
                      {regularConversations.map((conversation) => (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={pathname === `/chat/${conversation.id}`}
                          onDelete={handleDeleteConversation}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredConversations.length === 0 && (
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-2 h-12 w-12 text-white/20" />
                    <p className="text-sm text-white/40">No conversations yet</p>
                    <p className="mt-1 text-xs text-white/30">
                      Start a new chat to begin
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onDelete: (id: string) => void;
}

function ConversationItem({ conversation, isActive, onDelete }: ConversationItemProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative cursor-pointer rounded-lg px-3 py-2',
        'transition-all duration-200',
        isActive
          ? 'bg-purple-500/20 text-white'
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      )}
      onClick={() => router.push(`/chat/${conversation.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {conversation.isPinned && <Pin className="h-3 w-3 text-purple-400" />}
            <h4 className="line-clamp-1 text-sm font-medium">
              {conversation.title}
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-white/40">
            {format(new Date(conversation.updatedAt), 'MMM d, h:mm a')}
          </p>
        </div>
        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.id);
            }}
            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
