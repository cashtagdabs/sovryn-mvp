'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../hooks/useClerkUser';
import Link from 'next/link';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function PerfectChatInterface() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data.conversations || data);
    } catch (err: any) {
      console.error('Load conversations error:', err);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error('Load messages error:', err);
      setMessages([]);
    }
  };

  const createNewConversation = async (firstMessage?: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: firstMessage ? firstMessage.substring(0, 50) + '...' : 'New Conversation',
          firstMessage,
        }),
      });

      if (!res.ok) throw new Error('Failed to create conversation');
      
      const data = await res.json();
      const newConv = data.conversation;
      
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv.id);
      
      return newConv.id;
    } catch (err: any) {
      console.error('Create conversation error:', err);
      setError('Failed to create conversation');
      return null;
    }
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content, model: 'PRIMEX' }),
      });

      if (!res.ok) throw new Error('Failed to save message');
      
      const data = await res.json();
      return data.message;
    } catch (err: any) {
      console.error('Save message error:', err);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessageContent = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Create conversation if needed
      let convId = currentConversation;
      if (!convId) {
        convId = await createNewConversation(userMessageContent);
        if (!convId) throw new Error('Failed to create conversation');
      }

      // Add user message to UI
      const userMessage: Message = { role: 'user', content: userMessageContent };
      setMessages(prev => [...prev, userMessage]);

      // Save user message
      await saveMessage(convId, 'user', userMessageContent);

      // Call PRIMEX API
      const res = await fetch('/api/primex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await res.json();
      const aiResponse = data.response;

      // Add AI message to UI
      const aiMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message
      await saveMessage(convId, 'assistant', aiResponse);

      // Reload conversations to update timestamps
      loadConversations();
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message');
      
      // Add error message to UI
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${err.message}. Please try again.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 overflow-hidden`}>
        <div className="p-4">
          <button
            onClick={() => {
              setCurrentConversation(null);
              setMessages([]);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-semibold mb-4"
          >
            + New Chat
          </button>

          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  currentConversation === conv.id
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              ☰
            </button>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SOVRYN
            </Link>
            <Link href="/explore" className="text-gray-400 hover:text-white text-sm">
              Explore
            </Link>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{user.firstName || user.username}</span>
              <img src={user.imageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="inline-block p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-800/30 mb-8">
                <h2 className="text-4xl font-bold mb-3">Welcome to PRIMEX</h2>
                <p className="text-gray-300 text-lg">Start a conversation with the most advanced AI</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: '💡', label: 'Learn', prompt: 'Explain quantum computing in simple terms' },
                  { icon: '💻', label: 'Code', prompt: 'Write a Python function to sort a list' },
                  { icon: '📈', label: 'Business', prompt: 'Create a marketing strategy for a startup' },
                  { icon: '✨', label: 'Create', prompt: 'Write a creative short story' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(item.prompt)}
                    className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition text-left"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold mb-1">{item.label}</div>
                    <div className="text-sm text-gray-400">{item.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 border border-gray-700'
                  }`}>
                    <div className="text-sm font-semibold mb-2">
                      {msg.role === 'user' ? '👤 You' : '🤖 PRIMEX'}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {loading && (
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
                  <div className="text-sm font-semibold mb-2">🤖 PRIMEX</div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message PRIMEX..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 resize-none"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition font-semibold"
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Powered by PRIMEX • 100% Private • No Data Collection
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
